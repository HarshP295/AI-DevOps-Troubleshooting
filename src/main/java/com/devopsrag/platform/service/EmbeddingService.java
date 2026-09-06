package com.devopsrag.platform.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.List;
import java.util.HashMap;

@Service
public class EmbeddingService {

    private final RestTemplate restTemplate;
    
    private static final String OLLAMA_URL = "http://localhost:11434/api/embeddings";

    public EmbeddingService() {
        this.restTemplate = new RestTemplate();
    }

    public float[] embed(String text) {
        Map<String, String> request = new HashMap<>();
        request.put("model", "nomic-embed-text");
        request.put("prompt", text);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OLLAMA_URL, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("embedding")) {
                List<Double> embeddingList = (List<Double>) body.get("embedding");
                float[] result = new float[embeddingList.size()];
                for (int i = 0; i < embeddingList.size(); i++) {
                    result[i] = embeddingList.get(i).floatValue();
                }
                return result;
            }
            throw new RuntimeException("Unexpected response from Ollama: " + body);
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to connect to Ollama. Please ensure Ollama is running locally at " + OLLAMA_URL, e);
        }
    }
}
