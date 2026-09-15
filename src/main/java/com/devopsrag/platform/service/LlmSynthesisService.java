package com.devopsrag.platform.service;

import com.devopsrag.platform.model.SimilaritySearchResult;
import com.devopsrag.platform.model.SynthesisResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class LlmSynthesisService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";

    public LlmSynthesisService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public SynthesisResult synthesize(String question, List<SimilaritySearchResult> retrievedChunks) {
        StringBuilder context = new StringBuilder();
        int rank = 1;
        for (SimilaritySearchResult chunk : retrievedChunks) {
            String relevance = (rank == 1) ? "(most relevant)" : (rank == retrievedChunks.size() && retrievedChunks.size() > 1) ? "(least relevant)" : "";
            context.append("Chunk ").append(rank).append(" ").append(relevance).append(":\n");
            context.append("Source File: ").append(chunk.getSourceFile()).append("\n");
            context.append("Content:\n").append(chunk.getContent()).append("\n\n");
            rank++;
        }

        String prompt = "You are a DevOps troubleshooting assistant. Based ONLY on the following context, answer the user's question.\n" +
                "For relatedIncident, output ONLY a real incident ID string found in the provided context (e.g. \"INC-4821\"), or the literal JSON value null if none is clearly relevant. Never output placeholder text or explanations.\n" +
                "Respond ONLY in raw JSON matching this structure exactly.\n\n" +
                "Example 1 (With Incident):\n" +
                "{ \"likelyCauses\": [\"Database connection pool exhaustion\"], \"relatedIncident\": \"INC-4821\", \"suggestedInvestigation\": \"Check pool size settings\", \"sources\": [\"payment-runbook.md\", \"INC-4821.md\"] }\n\n" +
                "Example 2 (No Incident):\n" +
                "{ \"likelyCauses\": [\"High CPU usage\"], \"relatedIncident\": null, \"suggestedInvestigation\": \"Check CPU metrics\", \"sources\": [\"node-logs.md\"] }\n\n" +
                "Do not include any markdown formatting, backticks, or preamble.\n\n" +
                "Context:\n" + context.toString() + "\n" +
                "Question: " + question;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama3.2");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);
        requestBody.put("format", "json");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(OLLAMA_URL, request, String.class);
            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
            String responseText = (String) responseMap.get("response");
            SynthesisResult result = objectMapper.readValue(responseText, SynthesisResult.class);
            
            if (result.getRelatedIncident() != null) {
                String incident = result.getRelatedIncident().trim();
                if (incident.equalsIgnoreCase("null") || incident.equalsIgnoreCase("none")) {
                    result.setRelatedIncident(null);
                } else if (!incident.matches("^INC-\\d+$")) {
                    System.out.println("Warning: LLM returned malformed relatedIncident: '" + incident + "'. Falling back to null.");
                    result.setRelatedIncident(null);
                }
            }
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to synthesize response from Ollama: " + e.getMessage(), e);
        }
    }
}
