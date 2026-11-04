package com.devopsrag.platform.controller;

import com.devopsrag.platform.model.SearchOutcome;
import com.devopsrag.platform.service.RetrievalService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SearchController {

    private final RetrievalService retrievalService;

    @Value("${app.grounding.threshold:0.5}")
    private double defaultThreshold;

    public SearchController(RetrievalService retrievalService) {
        this.retrievalService = retrievalService;
    }

    @GetMapping("/search")
    public SearchOutcome search(
            @RequestParam(name = "q") String query,
            @RequestParam(name = "topK", defaultValue = "5") int topK,
            @RequestParam(name = "threshold", required = false) Double threshold) {
        double effectiveThreshold = threshold != null ? threshold : defaultThreshold;
        return retrievalService.searchWithGrounding(query, topK, effectiveThreshold);
    }
}
