CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT,
    source_file VARCHAR(255),
    doc_type VARCHAR(255),
    chunk_index INTEGER,
    embedding vector(768)
);
