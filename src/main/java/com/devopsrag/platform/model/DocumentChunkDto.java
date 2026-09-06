package com.devopsrag.platform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentChunkDto {
    private String content;
    private String sourceFile;
    private String docType;
    private int chunkIndex;
}
