package com.devopsrag.platform.repository;

public interface DocumentChunkDistance {
    String getContent();
    String getSourceFile();
    String getDocType();
    Integer getChunkIndex();
    Double getDistance();
}
