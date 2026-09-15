package com.devopsrag.platform.controller;

import com.devopsrag.platform.model.QueryRequest;
import com.devopsrag.platform.model.SearchOutcome;
import com.devopsrag.platform.model.SynthesisResult;
import com.devopsrag.platform.service.RetrievalService;
import com.devopsrag.platform.service.LlmSynthesisService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api")
public class QueryController {

    private final RetrievalService retrievalService;
    private final LlmSynthesisService llmSynthesisService;

    public QueryController(RetrievalService retrievalService, LlmSynthesisService llmSynthesisService) {
        this.retrievalService = retrievalService;
        this.llmSynthesisService = llmSynthesisService;
    }

    @PostMapping("/query")
    public SearchOutcome query(@RequestBody QueryRequest request, 
                               @RequestParam(name = "topK", defaultValue = "5") int topK,
                               @RequestParam(name = "threshold", defaultValue = "0.5") double threshold) {
        
        SearchOutcome outcome = retrievalService.searchWithGrounding(request.getQuestion(), topK, threshold);
        
        if (outcome.isGrounded()) {
            SynthesisResult synthesis = llmSynthesisService.synthesize(request.getQuestion(), outcome.getResults());
            outcome.setSynthesis(synthesis);
        }
        
        return outcome;
    }
}
