package com.devopsrag.platform.service;

import com.devopsrag.platform.model.DocumentChunk;
import com.devopsrag.platform.model.DocumentChunkDto;
import com.devopsrag.platform.model.RawDocument;
import com.devopsrag.platform.repository.DocumentChunkRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class IngestionService {

    private final DocumentLoaderService documentLoaderService;
    private final ChunkingService chunkingService;
    private final EmbeddingService embeddingService;
    private final DocumentChunkRepository repository;

    public IngestionService(DocumentLoaderService loader, ChunkingService chunker, EmbeddingService embedder, DocumentChunkRepository repo) {
        this.documentLoaderService = loader;
        this.chunkingService = chunker;
        this.embeddingService = embedder;
        this.repository = repo;
    }

    public Map<String, Object> runFullIngestion() {
        long startTime = System.currentTimeMillis();
        
        List<RawDocument> rawDocs = documentLoaderService.loadAllDocuments();
        List<DocumentChunkDto> chunkDtos = chunkingService.chunkAllDocuments(rawDocs);
        
        // Truncate before adding
        repository.deleteAll();
        
        int savedCount = 0;
        for (DocumentChunkDto dto : chunkDtos) {
            try {
                float[] embedding = embeddingService.embed(dto.getContent());
                
                DocumentChunk entity = new DocumentChunk();
                entity.setContent(dto.getContent());
                entity.setSourceFile(dto.getSourceFile());
                entity.setDocType(dto.getDocType());
                entity.setChunkIndex(dto.getChunkIndex());
                entity.setEmbedding(embedding);
                
                repository.save(entity);
                savedCount++;
            } catch (Exception e) {
                System.err.println("Failed to embed chunk in " + dto.getSourceFile() + " at index " + dto.getChunkIndex() + ": " + e.getMessage());
                e.printStackTrace();
                try {
                    java.io.FileWriter fw = new java.io.FileWriter("ingest_error.log", true);
                    java.io.PrintWriter pw = new java.io.PrintWriter(fw);
                    e.printStackTrace(pw);
                    pw.close();
                } catch (Exception ex) {}
            }
        }
        
        long endTime = System.currentTimeMillis();
        
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("documentsProcessed", rawDocs.size());
        result.put("chunksCreated", chunkDtos.size());
        result.put("chunksSaved", savedCount);
        result.put("timeTakenSeconds", (endTime - startTime) / 1000.0);
        
        return result;
    }
}
