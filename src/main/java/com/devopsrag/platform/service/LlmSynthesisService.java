package com.devopsrag.platform.service;

import com.devopsrag.platform.model.SimilaritySearchResult;
import com.devopsrag.platform.model.SynthesisResult;
import com.devopsrag.platform.provider.LlmProvider;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Public API for LLM synthesis.
 * Delegates to whichever LlmProvider bean is active
 * (OllamaLlmProvider or GeminiLlmProvider).
 * All callers (QueryController) are unchanged.
 */
@Service
public class LlmSynthesisService {

    private final LlmProvider provider;

    public LlmSynthesisService(LlmProvider provider) {
        this.provider = provider;
    }

    public SynthesisResult synthesize(String question, List<SimilaritySearchResult> retrievedChunks) {
        return provider.synthesize(question, retrievedChunks);
    }
}
