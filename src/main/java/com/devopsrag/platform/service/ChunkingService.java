package com.devopsrag.platform.service;

import com.devopsrag.platform.model.DocumentChunkDto;
import com.devopsrag.platform.model.RawDocument;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChunkingService {

    private static final int MAX_CHUNK_SIZE = 800;

    public List<DocumentChunkDto> chunkDocument(RawDocument doc) {
        List<DocumentChunkDto> chunks = new ArrayList<>();
        if (doc.getContent() == null || doc.getContent().trim().isEmpty()) {
            return chunks;
        }

        // Split on double newlines (handles both \n and \r\n), or on single newlines 
        // that are followed by markdown lists, bold text, or headings.
        String[] paragraphs = doc.getContent().split("(?:\\r?\\n){2,}|(?:\\r?\\n)(?=[#\\-*]\\s|\\*\\*|#+)");
        int chunkIndex = 0;

        List<String> rawChunks = new ArrayList<>();
        for (String paragraph : paragraphs) {
            String p = paragraph.trim();
            if (p.isEmpty()) continue;

            if (p.length() <= MAX_CHUNK_SIZE) {
                rawChunks.add(p);
            } else {
                List<String> subChunks = splitLongParagraph(p);
                rawChunks.addAll(subChunks);
            }
        }

        List<String> mergedChunks = mergeShortChunks(rawChunks);
        for (String c : mergedChunks) {
            chunks.add(new DocumentChunkDto(c, doc.getSourceFile(), doc.getDocType(), chunkIndex++));
        }

        return chunks;
    }

    private List<String> mergeShortChunks(List<String> rawChunks) {
        if (rawChunks.isEmpty()) return rawChunks;
        
        List<String> merged = new ArrayList<>();
        StringBuilder buffer = new StringBuilder();
        
        for (int i = 0; i < rawChunks.size(); i++) {
            String current = rawChunks.get(i);
            
            if (buffer.length() > 0) {
                buffer.append("\n").append(current);
            } else {
                buffer.append(current);
            }
            
            if (buffer.length() >= 40) {
                merged.add(buffer.toString());
                buffer.setLength(0);
            } else {
                if (i == rawChunks.size() - 1) {
                    if (!merged.isEmpty()) {
                        String lastMerged = merged.remove(merged.size() - 1);
                        merged.add(lastMerged + "\n" + buffer.toString());
                    } else {
                        merged.add(buffer.toString());
                    }
                    buffer.setLength(0);
                }
            }
        }
        return merged;
    }

    private List<String> splitLongParagraph(String text) {
        List<String> chunks = new ArrayList<>();
        // Split by sentence ending with a period followed by whitespace
        String[] sentences = text.split("(?<=\\.)\\s+");
        StringBuilder currentChunk = new StringBuilder();
        
        for (String sentence : sentences) {
            String s = sentence.trim();
            if (s.isEmpty()) continue;
            
            if (currentChunk.length() > 0 && currentChunk.length() + s.length() + 1 > MAX_CHUNK_SIZE) {
                chunks.add(currentChunk.toString().trim());
                currentChunk.setLength(0);
                currentChunk.append(s);
            } else {
                if (currentChunk.length() > 0) {
                    currentChunk.append(" ");
                }
                currentChunk.append(s);
            }
        }
        
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }
        
        return chunks;
    }

    public List<DocumentChunkDto> chunkAllDocuments(List<RawDocument> docs) {
        List<DocumentChunkDto> allChunks = new ArrayList<>();
        for (RawDocument doc : docs) {
            allChunks.addAll(chunkDocument(doc));
        }
        return allChunks;
    }
}
