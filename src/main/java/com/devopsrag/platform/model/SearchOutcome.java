package com.devopsrag.platform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchOutcome {
    private boolean grounded;
    private List<SimilaritySearchResult> results;
    private String message;
    private SynthesisResult synthesis;
}
