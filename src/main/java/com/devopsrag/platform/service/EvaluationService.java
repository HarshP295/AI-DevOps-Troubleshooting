package com.devopsrag.platform.service;

import com.devopsrag.platform.model.EvalCase;
import com.devopsrag.platform.model.EvalDetail;
import com.devopsrag.platform.model.EvalReport;
import com.devopsrag.platform.model.SimilaritySearchResult;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class EvaluationService {

    private final RetrievalService retrievalService;
    private final ObjectMapper objectMapper;
    private static final String EVAL_SET_PATH = "eval-set.json";

    public EvaluationService(RetrievalService retrievalService, ObjectMapper objectMapper) {
        this.retrievalService = retrievalService;
        this.objectMapper = objectMapper;
    }

    public EvalReport runEvaluation() {
        List<EvalCase> cases;
        try {
            File file = new File(EVAL_SET_PATH);
            cases = objectMapper.readValue(file, new TypeReference<List<EvalCase>>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to read eval-set.json from project root: " + e.getMessage(), e);
        }

        int totalQueries = cases.size();
        int passedCount = 0;
        List<EvalDetail> details = new ArrayList<>();

        for (EvalCase evalCase : cases) {
            List<SimilaritySearchResult> results = retrievalService.search(evalCase.getQuery(), 3);
            
            List<String> actualSources = new ArrayList<>();
            boolean passed = false;
            
            for (SimilaritySearchResult result : results) {
                actualSources.add(result.getSourceFile());
                if (result.getSourceFile().equals(evalCase.getExpectedSource())) {
                    passed = true;
                }
            }
            
            if (passed) {
                passedCount++;
            }
            
            details.add(new EvalDetail(
                    evalCase.getQuery(),
                    evalCase.getExpectedSource(),
                    passed,
                    actualSources
            ));
        }

        double accuracy = totalQueries == 0 ? 0 : ((double) passedCount / totalQueries) * 100.0;
        
        return new EvalReport(totalQueries, passedCount, accuracy, details);
    }
}
