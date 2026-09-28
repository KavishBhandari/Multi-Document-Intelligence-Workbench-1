# Document Analysis Workbench

A modern, production-grade frontend application for multi-document ingestion, verification, and comparative AI analysis. Built with React 19, TypeScript, Vite, Redux Toolkit, and Tailwind CSS.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Environment Configuration](#environment-configuration)
- [Completed Functionality](#completed-functionality)
- [Automated Tests](#automated-tests)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Security Considerations](#security-considerations)
- [How the Solution Would Be Productionised](#how-the-solution-would-be-productionised)
- [Commit History Guidelines](#commit-history-guidelines)

---

## Overview

The Document Analysis Workbench allows users to upload multiple heterogeneous documents (e.g., application forms, financial records, bank statements, identification proofs), submit structured evaluation prompts, and review comprehensive discrepancy audits. The system extracts facts, highlights inconsistencies across documents, flags missing data, and traces every finding back to its source document evidence.

---

## Architecture

The application adheres to a modular, feature-first architecture that separates UI presentation, state management, and API normalization layers:

```
src/
├── App/                         # Application root, routing & global styles
│   ├── App.css                  # Tailored design system tokens & typography
│   ├── App.tsx                  # Main router view
│   └── store.ts                 # Redux Toolkit store configuration
├── features/
│   ├── workbench/               # Document ingestion & prompt drafting feature
│   │   ├── components/          # DropZone, DocumentList, PromptPanel, PresetChips, RunAnalysisButton
│   │   ├── hook/                # useDocuments, useRunAnalysis
│   │   ├── pages/               # WorkbenchPage
│   │   ├── service/             # workbench.service (multipart upload & evaluate trigger)
│   │   └── state/               # workbench.slice (upload queue & prompt state)
│   └── results/                 # Evaluation reporting & visualization feature
│       ├── components/          # AnalysisHeader, ResultTabs, SummaryCard, ComparisonTable,
│       │                        # DiscrepancyList, MissingInfoReport, KeyValueGrid, SourceDrawer
│       ├── hook/                # useCopyOutput
│       ├── pages/               # ResultsPage, NotFoundPage
│       ├── service/             # results.service & results.schemas (normalization & type guards)
│       └── state/               # results.slice (analysis result & active drawer state)
└── shared/                      # Cross-cutting types, hooks, and constants
    ├── hooks/                   # Typed Redux hooks (useAppDispatch, useAppSelector)
    └── types/                   # Unified TypeScript domain definitions & API contracts
```

### Architectural Decisions:
- **Redux Toolkit for Predictable State**: Ingestion status and evaluation datasets are isolated in distinct slices (`workbench` and `results`), allowing seamless multi-step workflows and clean reset lifecycles.
- **Normalization Layer (`results.schemas.ts`)**: Rather than binding UI components tightly to raw backend payloads, a normalization pipeline transforms backend responses into strongly typed internal structures (`AnalysisResult`), providing runtime validation and fallback defaults.
- **Tailwind CSS v4 & Clean Typography**: Styled using a restrained, human-crafted neutral palette (Inter typography, subtle borders, high contrast ratios) optimized for readability without distracting visual noise.

---

## Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Clone or extract the repository:
   ```bash
   git clone <repository-url>
   cd Assesment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

5. Build for production:
   ```bash
   npm run build
   ```

6. Preview production build:
   ```bash
   npm run preview
   ```

---

## Environment Configuration

Environment settings are controlled via Vite environment variables:

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base endpoint URL for the backend API | `http://localhost:4000/api` |

- `.env.example`: Committed template defining expected keys.
- `.env`: Local configuration file (ignored by Git for security).

---

## Completed Functionality

- **Multi-Document Ingestion**:
  - Drag-and-drop or browse file picker.
  - Multi-format validation: PDF, TXT, CSV, PNG, JPEG, WEBP.
  - File size validation capped at 10 MB per document.
  - Real-time file inventory with individual document removal.
- **Flexible Prompt Composer**:
  - Custom textarea input with preset chip suggestions (financial comparisons, discrepancy checks, missing info audit).
- **Two-Stage Analysis Execution**:
  - Stage 1: Uploads files via `POST /api/upload` (multipart/form-data) receiving session metadata.
  - Stage 2: Triggers `POST /api/evaluate/:sessionId` to perform AI comparative evaluation.
  - Inline error handling and reactive button states preventing duplicate submissions.
- **Multi-Dimensional Results Dashboard**:
  - **Executive Summary**: High-level overview, execution duration, model name, and prompt metadata.
  - **Comparison Matrix**: Side-by-side tabular view comparing extracted fields across each document with visual discrepancy indicators.
  - **Discrepancy Inspector**: Severity tags, descriptions, and side-by-side cited quotes from conflicting files.
  - **Missing Information Audit**: Details which document omitted critical required fields and why.
  - **Key Values & Findings**: Distinguishes extracted factual data from AI interpretations with visual badges.
  - **Source Provenance Drawer**: Clicking cited document chips opens a slide-over panel displaying source attribution.
  - **Export Capability**: One-click copy of the raw Markdown / JSON analysis report.

---

## Automated Tests

Automated testing is configured using **Vitest** for fast unit and regression testing.

### Running Tests
```bash
npm test
```

### Test Coverage Highlights:
- **`src/features/results/service/__tests__/results.schemas.test.ts`**:
  - Verifies normalization of raw evaluate API responses into internal data models.
  - Asserts correct mapping of discrepancies, comparison rows, and evidence citations.
  - Validates runtime schema type guards (`isValidAnalysisResult`, `isFinding`).
- **`src/features/workbench/state/__tests__/workbench.slice.test.ts`**:
  - Tests adding and removing documents from upload queue.
  - Tests document status and error message propagation.
  - Tests prompt setting and complete workbench cleanup.

---

## Assumptions

1. **Backend Contract**: The backend provides standard REST endpoints (`/api/upload` and `/api/evaluate/:sessionId`) adhering to the structured JSON schemas defined in `src/shared/types/index.ts`.
2. **File Size & Types**: Files under 10 MB in standard text, image, and PDF formats can be processed synchronously or within reasonable HTTP request timeouts.
3. **Session Lifespan**: Analysis sessions are referenced by `sessionId`, and navigating to `/results/:sessionId` loads the corresponding evaluation results.
4. **Authentication**: Authentication is assumed to be handled at the gateway level or with public tokens during initial assessment; Axios services are structured to accept Bearer tokens when integrated.

---

## Known Limitations

1. **Persistence Across Reloads**: Results are maintained in memory via Redux and fetched on demand. If a user refreshes `/results/:sessionId` without persistent backend session storage, the session must be re-fetched from the API.
2. **Streaming / WebSockets**: Long-running evaluations (> 30s) currently rely on HTTP promises. A production enhancement would use Server-Sent Events (SSE) or WebSockets for real-time progress updates.
3. **Offline Mode**: Document previews and offline caching (IndexedDB) are not enabled in this phase.

---

## Security Considerations

- **Secrets Isolation**: No secret tokens or sensitive URLs are committed to source control. `.env` is explicitly listed in `.gitignore`.
- **Client-Side File Validation**: Files are checked against an allowed MIME whitelist and file size constraints before network transmission, mitigating denial-of-service or invalid upload payloads.
- **XSS Prevention**: React automatically escapes untrusted text during rendering. Rendered markdown and text fields avoid using `dangerouslySetInnerHTML`.
- **Content Security Policy (CSP)**: Vite builds are compatible with strict CSP headers (no inline un-hashed scripts).

---

## How the Solution Would Be Productionised

To deploy this service into high-availability production environments:

1. **CI/CD Automation**:
   - Automated GitHub Actions pipeline running `npm run lint`, `tsc -b`, `npm test`, and `npm run build` on all branches and pull requests.
2. **Containerization & Hosting**:
   - Multi-stage Docker build utilizing an Nginx unprivileged Alpine base image with HTTP/2 and Brotli compression.
   - Deployment to AWS ECS / Cloud Run / Kubernetes behind an Application Load Balancer with SSL termination.
3. **Observability & Error Tracking**:
   - Integrate Sentry or Datadog RUM for frontend runtime error capture and Web Vitals telemetry.
   - Structured client logging with correlation IDs passed in API headers (`X-Request-ID`).
4. **Resiliency & Performance**:
   - Implement exponential backoff and retry logic for transient 5xx HTTP errors in Axios interceptors.
   - Edge asset delivery using Cloudflare or AWS CloudFront CDN with long-term cache headers (`Cache-Control: max-age=31536000, immutable`) for hashed assets.
5. **Enhanced User Experience**:
   - Add SSE (Server-Sent Events) or WebSocket streaming for multi-document token generation.
   - In-browser PDF side-by-side rendering using PDF.js with jump-to-page citation links.

---

## Commit History Guidelines

The project uses the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` Introduces a new feature to the codebase.
- `fix:` Patches a bug or resolves an issue.
- `test:` Adds or updates automated test coverage.
- `refactor:` Code restructuring without functional alterations.
- `style:` Design, layout, and aesthetic improvements.
- `docs:` Documentation updates.