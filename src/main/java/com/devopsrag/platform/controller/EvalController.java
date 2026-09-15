package com.devopsrag.platform.controller;

import com.devopsrag.platform.model.EvalReport;
import com.devopsrag.platform.service.EvaluationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EvalController {

    private final EvaluationService evaluationService;

    public EvalController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping("/eval")
    public EvalReport evaluate() {
        return evaluationService.runEvaluation();
    }
}
