package com.devopsrag.platform.repository;

import com.devopsrag.platform.model.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, UUID> {

    @Query(value = "SELECT c.content as content, " +
                   "c.source_file as sourceFile, " +
                   "c.doc_type as docType, " +
                   "c.chunk_index as chunkIndex, " +
                   "(c.embedding <=> cast(:embedding as vector)) as distance " +
                   "FROM document_chunks c " +
                   "ORDER BY distance ASC " +
                   "LIMIT :topK", nativeQuery = true)
    List<DocumentChunkDistance> findSimilarChunks(@Param("embedding") String embedding, @Param("topK") int topK);
}
