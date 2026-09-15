package com.devopsrag.platform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimilaritySearchResult {
    private String content;
    private String sourceFile;
    private String docType;
    private Integer chunkIndex;
    private double similarityScore;
}
