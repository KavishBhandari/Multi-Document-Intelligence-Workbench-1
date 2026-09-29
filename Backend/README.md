# Multi-Document Intelligence Workbench

A full-stack, enterprise-ready application where users can upload multiple documents across different formats, supply user-defined analysis instructions, and receive structured comparisons, consolidated insights, discrepancy detections, and key-value extractions derived from those documents with source provenance tracing.



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
   DB_NAME=multiDocDB1
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



## Sample Synthetic Documents

Synthetic test documents are provided in `sample-documents/`:
1. `company_alpha_report.txt`: Annual financial statement and corporate obligations for Alpha Logistics Solutions Inc.
2. `alpha_credit_application.txt`: Credit application with deliberate discrepancies (mismatched address, altered revenue, differing license number) to test discrepancy analysis.
---

## Assumptions
- Synthetic document data is safe to process locally without real customer PII or banking credentials.
- The default AI engine uses a deterministic, rule-based text analysis implementation (`mock-ai-v1`) that runs locally without requiring paid API keys, while strictly mirroring the input/output schemas of LLM providers (e.g. OpenAI GPT-4o, Anthropic Claude).
- MySQL was selected as the relational database engine.

