package com.devopsrag.platform.controller;

import com.devopsrag.platform.model.SearchOutcome;
import com.devopsrag.platform.service.RetrievalService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SearchController {

    private final RetrievalService retrievalService;

    public SearchController(RetrievalService retrievalService) {
        this.retrievalService = retrievalService;
    }

    @GetMapping("/search")
    public SearchOutcome search(
            @RequestParam(name = "q") String query,
            @RequestParam(name = "topK", defaultValue = "5") int topK,
            @RequestParam(name = "threshold", defaultValue = "0.5") double threshold) {
        return retrievalService.searchWithGrounding(query, topK, threshold);
    }
}
