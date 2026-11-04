package com.devopsrag.platform.provider;

import com.devopsrag.platform.model.SimilaritySearchResult;
import com.devopsrag.platform.model.SynthesisResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * LLM synthesis provider using Google Gemini (gemini-1.5-flash).
 * Active when app.ai.provider=gemini.
 *
 * Uses responseMimeType=application/json for structured JSON output.
 * Retries on HTTP 429 / 503 with exponential backoff (max 4 attempts).
 * The API key is NEVER logged.
 */
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "gemini")
public class GeminiLlmProvider implements LlmProvider {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final int MAX_ATTEMPTS = 4;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String modelName;
    private final String generateUrl;

    public GeminiLlmProvider(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.llm-model:gemini-3.5-flash-lite}") String llmModel,
            ObjectMapper objectMapper) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY environment variable is required when AI_PROVIDER=gemini");
        }
        this.apiKey = apiKey;
        this.modelName = llmModel.startsWith("models/") ? llmModel.substring(7) : llmModel;
        this.generateUrl = BASE_URL + this.modelName + ":generateContent?key=" + apiKey;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public String getModelName() {
        return modelName;
    }

    @Override
    public SynthesisResult synthesize(String question, List<SimilaritySearchResult> retrievedChunks) {
        String prompt = buildPrompt(question, retrievedChunks);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = generateUrl;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                return parseResponse(response.getBody());
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS && attempt < MAX_ATTEMPTS) {
                    sleepForBackoff(attempt);
                } else {
                    throw new RuntimeException(
                            "Gemini generate API returned HTTP " + e.getStatusCode().value() +
                            " (attempt " + attempt + "): " + e.getResponseBodyAsString(), e);
                }
            } catch (HttpServerErrorException e) {
                if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE && attempt < MAX_ATTEMPTS) {
                    sleepForBackoff(attempt);
                } else {
                    throw new RuntimeException(
                            "Gemini generate API returned HTTP " + e.getStatusCode().value() +
                            " (attempt " + attempt + "): " + e.getResponseBodyAsString(), e);
                }
            }
        }
        throw new RuntimeException("Gemini generate API failed after " + MAX_ATTEMPTS + " attempts.");
    }

    @SuppressWarnings("unchecked")
    private SynthesisResult parseResponse(Map<String, Object> body) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                throw new RuntimeException("No candidates in Gemini response: " + body);
            }
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String jsonText = (String) parts.get(0).get("text");

            JsonNode root = objectMapper.readTree(jsonText);
            SynthesisResult result = new SynthesisResult();

            if (root.has("likelyCauses") && root.get("likelyCauses").isArray()) {
                List<String> causes = new ArrayList<>();
                root.get("likelyCauses").forEach(n -> causes.add(n.asText()));
                result.setLikelyCauses(causes);
            }

            if (root.has("relatedIncident") && !root.get("relatedIncident").isNull()) {
                result.setRelatedIncident(root.get("relatedIncident").asText());
            }

            if (root.has("suggestedInvestigation")) {
                JsonNode invNode = root.get("suggestedInvestigation");
                if (invNode.isArray()) {
                    List<String> steps = new ArrayList<>();
                    invNode.forEach(n -> steps.add(n.asText()));
                    result.setSuggestedInvestigation(String.join(". ", steps));
                } else if (!invNode.isNull()) {
                    result.setSuggestedInvestigation(invNode.asText());
                }
            }

            if (root.has("sources") && root.get("sources").isArray()) {
                List<String> sources = new ArrayList<>();
                root.get("sources").forEach(n -> sources.add(n.asText()));
                result.setSources(sources);
            }

            return OllamaLlmProvider.parseAndValidate(result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini synthesis response: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(String question, List<SimilaritySearchResult> retrievedChunks) {
        StringBuilder context = new StringBuilder();
        int rank = 1;
        for (SimilaritySearchResult chunk : retrievedChunks) {
            String relevance = (rank == 1) ? "(most relevant)"
                    : (rank == retrievedChunks.size() && retrievedChunks.size() > 1) ? "(least relevant)" : "";
            context.append("Chunk ").append(rank).append(" ").append(relevance).append(":\n");
            context.append("Source File: ").append(chunk.getSourceFile()).append("\n");
            context.append("Content:\n").append(chunk.getContent()).append("\n\n");
            rank++;
        }

        return "You are a DevOps troubleshooting assistant. Based ONLY on the following context, answer the user's question.\n" +
                "For relatedIncident, output ONLY a real incident ID string found in the provided context (e.g. \"INC-4821\"), or the literal JSON value null if none is clearly relevant. Never output placeholder text or explanations.\n" +
                "Respond ONLY in raw JSON matching this structure exactly.\n\n" +
                "Example 1 (With Incident):\n" +
                "{ \"likelyCauses\": [\"Database connection pool exhaustion\"], \"relatedIncident\": \"INC-4821\", \"suggestedInvestigation\": \"Check pool size settings\", \"sources\": [\"payment-runbook.md\", \"INC-4821.md\"] }\n\n" +
                "Example 2 (No Incident):\n" +
                "{ \"likelyCauses\": [\"High CPU usage\"], \"relatedIncident\": null, \"suggestedInvestigation\": \"Check CPU metrics\", \"sources\": [\"node-logs.md\"] }\n\n" +
                "Do not include any markdown formatting, backticks, or preamble.\n\n" +
                "Context:\n" + context.toString() + "\n" +
                "Question: " + question;
    }

    private void sleepForBackoff(int attempt) {
        long delay = (long) Math.pow(2, attempt) * 1000L;
        System.out.println("[GeminiLlmProvider] Rate-limited (429/503). Waiting " + delay + "ms before retry " + (attempt + 1) + "...");
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

