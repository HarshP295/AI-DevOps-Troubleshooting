package com.devopsrag.platform.provider;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Embedding provider that uses a local Ollama instance with nomic-embed-text.
 * Active when app.ai.provider=ollama (the default).
 */
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "ollama", matchIfMissing = true)
public class OllamaEmbeddingProvider implements EmbeddingProvider {

    private final String ollamaEmbedUrl;
    private final RestTemplate restTemplate;

    public OllamaEmbeddingProvider(
            @Value("${app.ollama.base-url:http://localhost:11434}") String baseUrl) {
        this.ollamaEmbedUrl = baseUrl + "/api/embeddings";
        this.restTemplate = new RestTemplate();
    }

    @Override
    public float[] embed(String text) {
        Map<String, String> request = new HashMap<>();
        request.put("model", "nomic-embed-text");
        request.put("prompt", text);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(ollamaEmbedUrl, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("embedding")) {
                List<Double> embeddingList = (List<Double>) body.get("embedding");
                float[] result = new float[embeddingList.size()];
                for (int i = 0; i < embeddingList.size(); i++) {
                    result[i] = embeddingList.get(i).floatValue();
                }
                return result;
            }
            throw new RuntimeException("Unexpected response from Ollama embedding API: " + body);
        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Failed to connect to Ollama at " + ollamaEmbedUrl +
                    ". Please ensure Ollama is running locally.", e);
        }
    }
}

