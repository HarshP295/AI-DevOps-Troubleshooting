package com.devopsrag.platform.service;

import com.devopsrag.platform.model.RawDocument;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentLoaderService {

    public List<RawDocument> loadAllDocuments() {
        List<RawDocument> documents = new ArrayList<>();
        // Use a path relative to the project root
        Path dataDir = Paths.get("data");

        if (!Files.exists(dataDir) || !Files.isDirectory(dataDir)) {
            System.err.println("Data directory not found: " + dataDir.toAbsolutePath());
            return documents; // Return empty list gracefully
        }

        String[] folders = {"logs", "incidents", "runbooks", "deployments"};

        for (String folder : folders) {
            Path folderPath = dataDir.resolve(folder);
            if (Files.exists(folderPath) && Files.isDirectory(folderPath)) {
                // Derive singular docType ("log", "incident", "runbook", "deployment")
                String docType = folder.endsWith("s") ? folder.substring(0, folder.length() - 1) : folder;

                try {
                    Files.walkFileTree(folderPath, new SimpleFileVisitor<Path>() {
                        @Override
                        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                            if (file.toString().endsWith(".md")) {
                                String content = Files.readString(file);
                                String sourceFile = file.getFileName().toString();
                                documents.add(new RawDocument(content, sourceFile, docType));
                            }
                            return FileVisitResult.CONTINUE;
                        }
                    });
                } catch (IOException e) {
                    System.err.println("Error reading folder: " + folderPath);
                    e.printStackTrace();
                }
            }
        }
        return documents;
    }
}
