package com.devopsrag.platform.provider;

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

import java.util.List;
import java.util.Map;

/**
 * Embedding provider using Google Gemini text-embedding-004.
 * Produces 768-dimensional embeddings (outputDimensionality=768).
 * Active when app.ai.provider=gemini.
 *
 * Rate-limit safety: applies a 200ms inter-call delay.
 * Retries up to 4 attempts with exponential backoff on HTTP 429 / 503.
 * The API key is NEVER logged.
 */
@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "gemini")
public class GeminiEmbeddingProvider implements EmbeddingProvider {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final int EXPECTED_DIMENSIONS = 768;
    private static final int MAX_ATTEMPTS = 4;
    private static final long INTER_CALL_DELAY_MS = 200;

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String modelName;
    private final String modelResource;
    private final String embedUrl;

    public GeminiEmbeddingProvider(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.embedding-model:gemini-embedding-001}") String embeddingModel) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY environment variable is required when AI_PROVIDER=gemini");
        }
        this.apiKey = apiKey;
        this.modelName = embeddingModel.startsWith("models/") ? embeddingModel.substring(7) : embeddingModel;
        this.modelResource = "models/" + this.modelName;
        this.embedUrl = BASE_URL + this.modelName + ":embedContent?key=" + apiKey;
        this.restTemplate = new RestTemplate();
    }

    public String getModelName() {
        return modelName;
    }

    @Override
    public float[] embed(String text) {
        // 200ms delay to respect free-tier rate limits during batch ingestion
        try {
            Thread.sleep(INTER_CALL_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        Map<String, Object> requestBody = Map.of(
                "model", modelResource,
                "content", Map.of("parts", List.of(Map.of("text", text))),
                "taskType", "RETRIEVAL_DOCUMENT",
                "outputDimensionality", EXPECTED_DIMENSIONS
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Key passed as query param — never in a logged header
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = embedUrl;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                return extractEmbedding(response.getBody());
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS && attempt < MAX_ATTEMPTS) {
                    sleepForBackoff(attempt);
                } else {
                    throw new RuntimeException(
                            "Gemini embedding API returned HTTP " + e.getStatusCode().value() +
                            " (attempt " + attempt + "): " + e.getResponseBodyAsString(), e);
                }
            } catch (HttpServerErrorException e) {
                if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE && attempt < MAX_ATTEMPTS) {
                    sleepForBackoff(attempt);
                } else {
                    throw new RuntimeException(
                            "Gemini embedding API returned HTTP " + e.getStatusCode().value() +
                            " (attempt " + attempt + "): " + e.getResponseBodyAsString(), e);
                }
            }
        }
        throw new RuntimeException("Gemini embedding API failed after " + MAX_ATTEMPTS + " attempts.");
    }

    @SuppressWarnings("unchecked")
    private float[] extractEmbedding(Map<String, Object> body) {
        if (body == null || !body.containsKey("embedding")) {
            throw new RuntimeException("Unexpected Gemini embedding response (no 'embedding' key): " + body);
        }
        Map<String, Object> embeddingObj = (Map<String, Object>) body.get("embedding");
        List<Double> values = (List<Double>) embeddingObj.get("values");
        if (values == null) {
            throw new RuntimeException("Gemini embedding response missing 'values': " + body);
        }
        if (values.size() != EXPECTED_DIMENSIONS) {
            throw new RuntimeException(
                    "Gemini returned " + values.size() + " dimensions but vector(768) column requires exactly " +
                    EXPECTED_DIMENSIONS + ". Check outputDimensionality in the request.");
        }
        float[] result = new float[values.size()];
        for (int i = 0; i < values.size(); i++) {
            result[i] = values.get(i).floatValue();
        }
        return result;
    }

    private void sleepForBackoff(int attempt) {
        long delay = (long) Math.pow(2, attempt) * 1000L; // 2s, 4s, 8s
        System.out.println("[GeminiEmbeddingProvider] Rate-limited (429/503). Waiting " + delay + "ms before retry " + (attempt + 1) + "...");
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

