# Multi-Document Intelligence Workbench

A full-stack, enterprise-ready application where users can upload multiple documents across different formats, supply user-defined analysis instructions, and receive structured comparisons, consolidated insights, discrepancy detections, and key-value extractions derived from those documents with source provenance tracing.

---

## Architecture Overview

```
                                      +------------------------------------+
                                      |         React 18 Frontend          |
                                      |    (TypeScript, Vite, Modern UI)   |
                                      +-----------------+------------------+
                                                        | REST API / JSON
                                                        v
+---------------------------------------------------------------------------------------------------+
|                                      Node.js Express Backend                                      |
|                                                                                                   |
|  +------------------------+    +-----------------------------+    +----------------------------+  |
|  |     Session Router     |    |       Document Router       |    |      Analysis Router       |  |
|  | (/api/sessions)        |    | (/api/sessions/:id/docs)    |    | (/api/sessions/:id/analyze)|  |
|  +-----------+------------+    +--------------+--------------+    +--------------+-------------+  |
|              |                                |                                  |                |
|              v                                v                                  v                |
|  +-----------+------------+    +--------------+--------------+    +--------------+-------------+  |
|  |     SessionService     |    |       DocumentService       |    |      AnalysisService       |  |
|  +------------------------+    +--------------+--------------+    +--------------+-------------+  |
|                                               |                                  |                |
|                                               v                                  v                |
|                                +--------------+--------------+    +--------------+-------------+  |
|                                | Document Processing Pipeline|    |       Mock AI Engine       |  |
|                                | - Mime Validator            |    | - Key-Value Extraction     |  |
|                                | - SHA-256 Checksum          |    | - Discrepancy Detection    |  |
|                                | - PDF / CSV / TXT Parsers   |    | - Comparison Matrix        |  |
|                                | - Boundary-Preserving Chunker|   | - Provenance Citations     |  |
|                                +--------------+--------------+    +--------------+-------------+  |
|                                               |                                  |                |
+-----------------------------------------------+----------------------------------+----------------+
                                                | Sequelize ORM (TypeScript)
                                                v
                               +------------------------------------+
                               |     Relational Database (MySQL)    |
                               | - AnalysisSession                  |
                               | - Document                         |
                               | - DocumentChunk (Provenance)       |
                               | - AnalysisResult                   |
                               | - Finding                          |
                               | - FindingEvidence (Citations)      |
                               +------------------------------------+
```

### Core Design Principles
1. **Document Boundaries Retained:** Documents are never merged blindly into a single blob. Chunks and extractions maintain strict document identifiers and chunk indices.
2. **Traceable Source Provenance:** Every finding (discrepancy, comparison, or extracted fact) links directly to supporting citations (`FindingEvidence`) with document references, quotes, and chunk IDs.
3. **Fact vs. Interpretation Separation:** Clear distinction between `extracted_fact` (direct quotes and parsed entities) and `ai_interpretation` (analytical inferences, synthesized discrepancies).
4. **Graceful Fault Tolerance:** Unreadable or unsupported files do not halt processing of valid files in the batch. Errors are cataloged per document.

---

## Completed Functionality

- [x] **Multi-Document Upload:** Upload multiple files simultaneously with drag-and-drop support.
- [x] **Multi-Format Ingestion:**
  - **PDF (`application/pdf`)**: Extracts text, page counts, and metadata using `pdf-parse`.
  - **CSV (`text/csv`)**: Parses tabular rows, headers, and column relationships using `csv-parse`.
  - **Text (`text/plain`)**: Reads plain text with line metric estimation.
- [x] **Intelligent Text Chunking:** Splits long document contents with sentence-boundary awareness to preserve semantic context.
- [x] **User-Defined Prompting:** Accepts arbitrary natural language prompts (e.g., "Identify discrepancies between application form and supporting documents", "Compare financial metrics").
- [x] **Deterministic Structured AI Engine:**
  - Extracts key dates, monetary values, registration/license numbers, emails, addresses, and revenue figures.
  - Automatically compares corresponding fields across documents.
  - Detects semantic and value discrepancies between documents.
  - Generates a consolidated summary markdown report.
  - Builds an interactive comparison table.
- [x] **Source Provenance & Citations:** Each finding highlights its source document, chunk, and exact quote snippet.
- [x] **Export Capabilities:** One-click copy to clipboard and downloadable Markdown report.
- [x] **Automated Test Suite:** 7 automated tests running via Node 22 native test runner testing parsers, chunking, AI discrepancy detection, and comparison matrix generation.

---

## Setup Instructions

### Prerequisites
- **Node.js** >= 18 (Tested on Node.js v22.21.1)
- **MySQL** >= 8.0 (or PostgreSQL / SQLite)

### 1. Database Setup
Ensure MySQL is running and create the database:
```sql
CREATE DATABASE IF NOT EXISTS multiDocDB;
```

### 2. Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Copy environment file and adjust credentials if needed:
   ```bash
   cp .env.example .env
   ```
   Default `.env` configuration:
   ```env
   PORT=4000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=multiDocDB
   MAX_FILE_SIZE_MB=10
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build TypeScript:
   ```bash
   npm run build
   ```
5. Seed sample demo session (Optional):
   ```bash
   npm run seed:demo
   ```
6. Run automated tests:
   ```bash
   npm test
   ```
7. Start server:
   ```bash
   npm start
   # or development mode with hot reload:
   npm run dev
   ```
   The backend server will run on `http://localhost:4000`.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/sessions` | Create a new analysis session with user prompt |
| `GET` | `/api/sessions` | List all sessions with document status |
| `GET` | `/api/sessions/:id` | Get session details, uploaded documents, and results |
| `PATCH` | `/api/sessions/:id/prompt` | Update the analysis prompt for a session |
| `DELETE` | `/api/sessions/:id` | Delete session and associated records |
| `POST` | `/api/sessions/:sessionId/documents` | Upload multiple files (PDF, CSV, TXT) via multipart/form-data |
| `GET` | `/api/sessions/:sessionId/documents` | Get all documents for a session |
| `GET` | `/api/documents/:id/chunks` | Retrieve chunked text and provenance data for a document |
| `DELETE` | `/api/documents/:id` | Delete a document and its chunks |
| `POST` | `/api/sessions/:sessionId/analyze` | Trigger multi-document AI analysis using prompt |
| `GET` | `/api/sessions/:sessionId/result` | Retrieve structured analysis results, breakdown, and export |
| `GET` | `/api/sessions/:sessionId/export?format=markdown` | Download analysis report as a formatted Markdown file |

---

## Sample Synthetic Documents

Synthetic test documents are provided in `sample-documents/`:
1. `company_alpha_report.txt`: Annual financial statement and corporate obligations for Alpha Logistics Solutions Inc.
2. `alpha_credit_application.txt`: Credit application with deliberate discrepancies (mismatched address, altered revenue, differing license number) to test discrepancy analysis.
3. `company_beta_financials.csv`: Tabular financial data and metrics for Beta Freight Systems LLC across FY2024 and FY2025.
4. `vendor_agreement.pdf`: Master Services Agreement PDF for Beta Freight Systems LLC.

---

## Assumptions
- Synthetic document data is safe to process locally without real customer PII or banking credentials.
- The default AI engine uses a deterministic, rule-based text analysis implementation (`mock-ai-v1`) that runs locally without requiring paid API keys, while strictly mirroring the input/output schemas of LLM providers (e.g. OpenAI GPT-4o, Anthropic Claude).
- MySQL was selected as the relational database engine.

---

## Security Considerations
1. **UUID-based File Storage:** Uploaded files are renamed using UUID v4 filenames on disk to prevent path traversal attacks (`../../`) and filename collisions.
2. **MIME Type & Extension Whitelisting:** Strict validation ensures only allowed document types (`application/pdf`, `text/plain`, `text/csv`) are ingested.
3. **Payload & Size Constraints:** Enforced file upload limits (10MB max per file, 10 files per request).
4. **CORS & Helmet Protection:** HTTP headers secured via Helmet with configurable CORS origins.
5. **SQL Injection Prevention:** All database queries utilize Sequelize parameterized queries.

---

## Productionisation Roadmap
To deploy this application to a high-scale production environment:
1. **Distributed Task Queue:** Offload document parsing and LLM inference to background worker queues (e.g. BullMQ / Redis or AWS SQS / Celery).
2. **Object Storage:** Replace local disk storage (`uploads/`) with AWS S3, Google Cloud Storage, or Azure Blob Storage with pre-signed URLs.
3. **Vector Embeddings & Hybrid Search:** Integrate PGVector or Milvus for semantic similarity retrieval over million-token document corpora.
4. **Live LLM Provider Adapter:** Configure pluggable AI adapters (e.g., Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o) using structured JSON output schema validation (e.g. Zod / Instructor).
5. **Role-Based Access Control (RBAC):** Authenticate users with JWT/OAuth2 and partition session datasets per tenant or workspace.
