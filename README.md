# AI DevOps Troubleshooting Platform
An intelligent, local-first RAG (Retrieval-Augmented Generation) platform for automated DevOps incident analysis and triage.

## Problem Statement
When production incidents occur, engineers are often forced to manually search across multiple siloed systems—sifting through hundreds of logs, disparate incident post-mortems, scattered deployment notes, and outdated runbooks—just to find a relevant root cause. This platform solves the "needle in a haystack" triage problem by providing a single, semantically-aware interface that instantly correlates symptoms with historical data to generate structured, cited root-cause analyses.

## Architecture

```text
┌─────────────────┐
│   Data Sources  │
│ (Logs, Runbooks,│
│  Incidents,     │
│  Deployments)   │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐       ┌─────────────────┐
│    Ingestion    │       │     Future      │
│ (Loader ─►      │◄──────┤   Extensions    │
│  Chunker ─►     │       │ (Kafka/Redis/   │
│  Embedder)      │       │  Live K8s Logs) │
└───────┬─────────┘       └─────────────────┘
        │
        ▼
┌─────────────────┐       ┌─────────────────┐
│ Vector Database │       │                 │
│ (PostgreSQL +   │◄──────┤   Retrieval &   │
│  pgvector)      │       │   Grounding     │
└─────────────────┘       │                 │
                          └───────┬─────────┘
                                  │
                                  ▼
                          ┌─────────────────┐
                          │  LLM Synthesis  │
                          │  (Llama 3.2 via │
                          │   Ollama)       │
                          └───────┬─────────┘
                                  │
                                  ▼
                          ┌─────────────────┐
                          │   Structured    │
                          │   Response      │
                          └─────────────────┘
```

## Tech Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Framework** | Spring Boot (Java 17) | Core application, REST API, orchestration |
| **Database** | PostgreSQL + pgvector | Persistent storage and cosine similarity vector search |
| **Embeddings** | Ollama (`nomic-embed-text`) | 768-dimensional local embeddings for document chunks |
| **Synthesis** | Ollama (`llama3.2`) | Local LLM for generating structured root-cause analysis |
| **Infrastructure** | Docker Compose | Containerized PostgreSQL/pgvector database |

## Setup Instructions

**Prerequisites:**
- Java 17+ and Maven installed.
- Docker installed and running.
- Ollama installed locally.
- Ollama models pulled: `ollama pull nomic-embed-text` and `ollama pull llama3.2`.

1. **Start the database:**
   ```bash
   docker compose up -d
   ```
2. **Start the application:**
   ```bash
   mvn spring-boot:run
   ```
3. **Run Ingestion:**
   Populate the vector store with the local dataset.
   ```bash
   curl -X POST http://localhost:8080/api/ingest
   ```
4. **Verify Ingestion:**
   Confirm chunks were created successfully.
   ```bash
   curl http://localhost:8080/api/debug/documents
   ```

## API Reference

### 1. Ingestion (`POST /api/ingest`)
Populates the database with chunked and embedded documents.
**Response:**
```json
{
  "chunksCreated": 76,
  "chunksSaved": 76
}
```

### 2. Search (`GET /api/search?q={query}&topK={limit}&threshold={float}`)
Performs a semantic similarity search against the vector database, complete with grounding threshold protection.
**Example Request:**
`GET /api/search?q=Why%20is%20PaymentService%20returning%20503?&topK=2&threshold=0.5`
**Example Response:**
```json
{
    "grounded": true,
    "results": [
        {
            "content": "**Service**: PaymentService\n**Symptom**: PaymentService returning 503 Service Unavailable errors. High latency on checkout.",
            "sourceFile": "INC-4821.md",
            "docType": "incident",
            "chunkIndex": 1,
            "similarityScore": 0.759
        }
    ],
    "message": "Found relevant results"
}
```

### 3. Query Synthesis (`POST /api/query`)
Performs search, grounding, and full LLM structured synthesis.
**Example Request:**
```json
{
  "question": "Why is PaymentService returning 503?"
}
```
**Example Response:**
```json
{
    "grounded": true,
    "synthesis": {
        "likelyCauses": ["Database connection pool exhaustion"],
        "relatedIncident": "INC-4821",
        "suggestedInvestigation": "Check pool size settings",
        "sources": ["payment-runbook.md", "INC-4821.md"]
    }
}
```

### 4. Evaluation (`GET /api/eval`)
Runs the internal evaluation suite against a pre-defined set of queries.
**Example Response:**
```json
{
    "totalQueries": 23,
    "passed": 22,
    "accuracy": 95.65
}
```

## Frontend

**Brief description:** A minimalist React interface for querying the platform — single search bar, structured answer display (likely causes, related incident, suggested investigation, sources), collapsible raw-retrieval view, and a calm "no confident match" state for ungrounded queries.

**Tech stack:** React (Vite), Tailwind CSS.

**Setup instructions:**
```bash
cd frontend
npm install
npm run dev
```
*(Note: It runs on a local Vite dev server, typically `http://localhost:5173`, and requires the Spring Boot backend to be running separately on `http://localhost:8080`. CORS is configured globally in `WebConfig.java` to allow the frontend's origin.)*

**Screenshots:**
![Grounded query result](./docs/screenshot-grounded.png)
![Ungrounded query result](./docs/screenshot-ungrounded.png)

**Design notes:**
- **Minimalist palette:** off-white background, near-black text, and a single muted accent color.
- **Clean typography:** `Inter` for body text and `JetBrains Mono` for technical identifiers (filenames, incident IDs).
- **No shadows or heavy borders:** layout separation is achieved entirely via whitespace and subtle dividers.

## Evaluation Results
The system achieved a **95.65% Top-3 Retrieval Accuracy** against a hand-labeled evaluation set of 23 complex queries. The evaluation tested genuine semantic understanding through paraphrased instructions, ambiguous symptomatology, and conversational phasing.

**Known Limitations & The One Failure Case:**
The only failure in the evaluation suite was the query: `"We are seeing optimistic locking failure for SKU-992 in the logs."` The model successfully retrieved a document, but prioritized the literal raw log file (`log-20260806-0915.md`) over the hand-labeled expected incident report (`INC-4810.md`). 
*Why it happened:* The raw log file had a near-perfect literal text overlap with the query. 
*Production Mitigation:* This could be mitigated in the future by applying document-type weights (e.g., boosting incident reports or runbooks over raw logs) or by using a multi-step Agentic workflow to ask the LLM to find the incident report corresponding to the retrieved log's timestamp.

## Design Decisions

| Decision | Rationale |
| --- | --- |
| **pgvector over Dedicated Vector DBs** | Drastically reduces operational complexity. No need to manage a separate vector database (like Pinecone or Milvus) when PostgreSQL can natively handle 768-dim vectors via `<=>` (cosine distance). |
| **Local Ollama over Paid APIs** | Zero data egress, critical for highly sensitive DevOps incident data, logs, and infrastructure secrets. Completely free to operate. |
| **Strict Grounding Threshold** | Prevents LLM hallucination. Off-topic queries (e.g. "cookie recipes") are caught at the vector tier and rejected *before* wasting expensive LLM compute tokens. |
| **Synthetic Dataset** | Provided a clean, controlled, edge-case rich environment to reliably test race conditions, token expiries, and database pooling issues without exposing real proprietary company data. |

## Future Extensions
- **Kafka Integration:** Asynchronous ingestion of streaming data instead of static folder polling.
- **Live K8s Log Ingestion:** Direct integration with Kubernetes for real-time symptom discovery.
- **Redis Caching:** Caching common query synthesis results to reduce LLM latency.
- **Multi-turn Conversation:** Stateful chat for follow-up questions during active incident war-rooms.
