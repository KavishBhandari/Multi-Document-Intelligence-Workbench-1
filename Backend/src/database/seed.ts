import path from 'path';
import fs from 'fs';
import DatabaseConnection from './index';
import AnalysisSession from './models/analysissession';
import Document from './models/document';
import DocumentChunk from './models/documentchunk';
import AnalysisResult from './models/analysisresult';
import Finding from './models/finding';
import FindingEvidence from './models/findingevidence';
import { MockAIService } from '../services/mockAIService';
import { DocumentProcessingService } from '../services/documentProcessingService';
import { DOCUMENT_STATUS, SESSION_STATUS } from '../utils/contant';

async function seed() {
  console.log('--- Starting Database Seed ---');
  const connected = await DatabaseConnection.load();
  if (!connected) {
    console.error('Failed to connect to database for seeding.');
    process.exit(1);
  }

  const sampleDocsDir = path.resolve(__dirname, '../../../sample-documents');
  const alphaReportPath = path.join(sampleDocsDir, 'company_alpha_report.txt');
  const creditAppPath = path.join(sampleDocsDir, 'alpha_credit_application.txt');
  const betaCsvPath = path.join(sampleDocsDir, 'company_beta_financials.csv');

  if (!fs.existsSync(alphaReportPath) || !fs.existsSync(creditAppPath)) {
    console.warn('Sample documents not found. Skipping seed.');
    process.exit(0);
  }

  // Create demo session 1: Discrepancy analysis
  console.log('Seeding Demo Session 1: Discrepancy Analysis...');
  const session1 = await AnalysisSession.create({
    prompt: 'Identify inconsistencies and discrepancies between the application form and supporting financial documents.',
    status: SESSION_STATUS.COMPLETED,
  });

  // Read files and compute sha
  const alphaText = fs.readFileSync(alphaReportPath, 'utf-8');
  const creditAppText = fs.readFileSync(creditAppPath, 'utf-8');

  const doc1 = await Document.create({
    session_id: session1.id,
    original_name: 'company_alpha_report.txt',
    stored_name: 'seed-alpha-report.txt',
    mime_type: 'text/plain',
    size_bytes: Buffer.byteLength(alphaText),
    sha256: DocumentProcessingService.computeFileHash(alphaReportPath),
    status: DOCUMENT_STATUS.PROCESSED,
    page_count: 1,
  });

  const doc2 = await Document.create({
    session_id: session1.id,
    original_name: 'alpha_credit_application.txt',
    stored_name: 'seed-credit-app.txt',
    mime_type: 'text/plain',
    size_bytes: Buffer.byteLength(creditAppText),
    sha256: DocumentProcessingService.computeFileHash(creditAppPath),
    status: DOCUMENT_STATUS.PROCESSED,
    page_count: 1,
  });

  // Chunks
  const chunk1 = await DocumentChunk.create({
    document_id: doc1.id,
    chunk_index: 0,
    page_number: 1,
    text: alphaText,
    char_start: 0,
    char_end: alphaText.length,
  });

  const chunk2 = await DocumentChunk.create({
    document_id: doc2.id,
    chunk_index: 0,
    page_number: 1,
    text: creditAppText,
    char_start: 0,
    char_end: creditAppText.length,
  });

  // Run mock analysis
  const docInputs = [
    {
      documentId: doc1.id,
      documentName: doc1.original_name,
      text: alphaText,
      chunks: [{ chunkId: chunk1.id, chunkIndex: 0, text: alphaText }],
    },
    {
      documentId: doc2.id,
      documentName: doc2.original_name,
      text: creditAppText,
      chunks: [{ chunkId: chunk2.id, chunkIndex: 0, text: creditAppText }],
    },
  ];

  const analysisOutput = await MockAIService.analyzeDocuments(docInputs, session1.prompt);

  const result1 = await AnalysisResult.create({
    session_id: session1.id,
    result_json: {
      summary: analysisOutput.summary,
      comparisonTable: analysisOutput.comparisonTable,
      model: analysisOutput.model,
      processingTimeMs: analysisOutput.processingTimeMs,
      documentCount: 2,
    },
    model: analysisOutput.model,
  });

  for (const finding of analysisOutput.findings) {
    const findingRecord = await Finding.create({
      result_id: result1.id,
      type: finding.type,
      title: finding.title,
      description: finding.description,
      classification: finding.classification,
      severity: finding.severity,
    });

    if (finding.evidences && finding.evidences.length > 0) {
      const evidences = finding.evidences.map((ev) => ({
        finding_id: findingRecord.id,
        document_id: ev.documentId,
        chunk_id: ev.chunkId,
        quote: ev.quote,
        page_number: ev.pageNumber,
      }));
      await FindingEvidence.bulkCreate(evidences);
    }
  }

  console.log(`Demo Session ${session1.id} seeded successfully with ${analysisOutput.findings.length} findings!`);
  console.log('--- Seed Completed Successfully ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
