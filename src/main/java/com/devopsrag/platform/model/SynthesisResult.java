package com.devopsrag.platform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SynthesisResult {
    private List<String> likelyCauses;
    private String relatedIncident;
    private String suggestedInvestigation;
    private List<String> sources;
}
