package com.devopsrag.platform.service;

import com.devopsrag.platform.model.SimilaritySearchResult;
import com.devopsrag.platform.repository.DocumentChunkDistance;
import com.devopsrag.platform.repository.DocumentChunkRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class RetrievalService {

    private final EmbeddingService embeddingService;
    private final DocumentChunkRepository repository;

    public RetrievalService(EmbeddingService embeddingService, DocumentChunkRepository repository) {
        this.embeddingService = embeddingService;
        this.repository = repository;
    }

    public List<SimilaritySearchResult> search(String queryText, int topK) {
        float[] queryEmbedding = embeddingService.embed(queryText);
        
        // Convert float[] to vector string format: "[val1, val2, ...]"
        String embeddingString = Arrays.toString(queryEmbedding);
        
        List<DocumentChunkDistance> rawResults = repository.findSimilarChunks(embeddingString, topK);
        
        List<SimilaritySearchResult> results = new ArrayList<>();
        for (DocumentChunkDistance raw : rawResults) {
            // Cosine distance to similarity score
            // Distance is roughly 0 (identical) to 2 (opposite)
            // Score = 1 - distance
            double score = 1.0 - (raw.getDistance() != null ? raw.getDistance() : 0.0);
            
            results.add(new SimilaritySearchResult(
                    raw.getContent(),
                    raw.getSourceFile(),
                    raw.getDocType(),
                    raw.getChunkIndex(),
                    score
            ));
        }
        
        return results;
    }

    public com.devopsrag.platform.model.SearchOutcome searchWithGrounding(String queryText, int topK, double minSimilarityThreshold) {
        List<SimilaritySearchResult> results = search(queryText, topK);
        
        if (results.isEmpty() || results.get(0).getSimilarityScore() < minSimilarityThreshold) {
            return new com.devopsrag.platform.model.SearchOutcome(false, null, "No relevant incident found in the knowledge base", null);
        }
        
        return new com.devopsrag.platform.model.SearchOutcome(true, results, "Found relevant results", null);
    }
}
