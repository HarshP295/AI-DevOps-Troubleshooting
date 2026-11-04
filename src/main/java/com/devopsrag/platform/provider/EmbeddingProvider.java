package com.devopsrag.platform.provider;

/**
 * Strategy interface for embedding text into a float vector.
 */
public interface EmbeddingProvider {
    float[] embed(String text);
}

