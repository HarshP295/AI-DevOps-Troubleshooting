package com.devopsrag.platform.provider;

import com.devopsrag.platform.model.SimilaritySearchResult;
import com.devopsrag.platform.model.SynthesisResult;

import java.util.List;

/**
 * Strategy interface for LLM-based synthesis.
 */
public interface LlmProvider {
    SynthesisResult synthesize(String question, List<SimilaritySearchResult> retrievedChunks);
}

