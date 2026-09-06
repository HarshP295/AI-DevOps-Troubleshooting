package com.devopsrag.platform.controller;

import com.devopsrag.platform.service.DocumentLoaderService;
import com.devopsrag.platform.service.ChunkingService;
import com.devopsrag.platform.service.EmbeddingService;
import com.devopsrag.platform.model.RawDocument;
import com.devopsrag.platform.model.DocumentChunkDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final DocumentLoaderService documentLoaderService;
    private final ChunkingService chunkingService;
    private final EmbeddingService embeddingService;

    @Autowired
    public DebugController(DocumentLoaderService documentLoaderService, ChunkingService chunkingService, EmbeddingService embeddingService) {
        this.documentLoaderService = documentLoaderService;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
    }

    @GetMapping("/documents")
    public Map<String, Object> getDocumentSummary() {
        List<RawDocument> documents = documentLoaderService.loadAllDocuments();
        
        Map<String, Long> countsByDocType = documents.stream()
                .collect(Collectors.groupingBy(RawDocument::getDocType, Collectors.counting()));
                
        // Use LinkedHashMap to keep order nice in JSON
        Map<String, Object> summary = new LinkedHashMap<>();
        
        String[] docTypes = {"log", "incident", "runbook", "deployment"};
        for (String type : docTypes) {
            summary.put(type + "s", countsByDocType.getOrDefault(type, 0L));
        }
        
        summary.put("total", documents.size());

        return summary;
    }

    @GetMapping("/chunks")
    public Map<String, Object> getChunkSummary() {
        List<RawDocument> documents = documentLoaderService.loadAllDocuments();
        List<DocumentChunkDto> chunks = chunkingService.chunkAllDocuments(documents);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalChunks", chunks.size());
        
        if (documents.isEmpty()) {
            summary.put("averageChunksPerDocument", 0);
        } else {
            summary.put("averageChunksPerDocument", (double) chunks.size() / documents.size());
        }

        int minSize = chunks.stream().mapToInt(c -> c.getContent().length()).min().orElse(0);
        int maxSize = chunks.stream().mapToInt(c -> c.getContent().length()).max().orElse(0);

        summary.put("minChunkSizeChars", minSize);
        summary.put("maxChunkSizeChars", maxSize);

        // Debug specific file
        List<String> paymentRunbookChunks = chunks.stream()
            .filter(c -> "payment-runbook.md".equals(c.getSourceFile()))
            .map(c -> {
                String content = c.getContent().replace("\n", " ").replace("\r", "");
                return content.length() > 50 ? content.substring(0, 50) + "..." : content;
            })
            .collect(Collectors.toList());

        if (!paymentRunbookChunks.isEmpty()) {
            Map<String, Object> debugInfo = new LinkedHashMap<>();
            debugInfo.put("chunkCount", paymentRunbookChunks.size());
            debugInfo.put("chunkPreviews", paymentRunbookChunks);
            summary.put("debug_payment-runbook.md", debugInfo);
        }

        return summary;
    }

    @GetMapping("/embed-test")
    public Map<String, Object> testEmbedding() {
        String testText = "PaymentService returning 503 database connection pool exhausted";
        float[] embedding = embeddingService.embed(testText);
        
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("text", testText);
        result.put("embeddingLength", embedding.length);
        
        float[] first5 = new float[Math.min(5, embedding.length)];
        System.arraycopy(embedding, 0, first5, 0, first5.length);
        result.put("first5Values", first5);
        
        return result;
    }
}
