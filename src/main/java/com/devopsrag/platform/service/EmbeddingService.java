package com.devopsrag.platform.service;

import com.devopsrag.platform.provider.EmbeddingProvider;
import org.springframework.stereotype.Service;

/**
 * Public API for embedding text.
 * Delegates to whichever EmbeddingProvider bean is active
 * (OllamaEmbeddingProvider or GeminiEmbeddingProvider).
 * All callers (IngestionService, RetrievalService, DebugController) are unchanged.
 */
@Service
public class EmbeddingService {

    private final EmbeddingProvider provider;

    public EmbeddingService(EmbeddingProvider provider) {
        this.provider = provider;
    }

    public float[] embed(String text) {
        return provider.embed(text);
    }
}
