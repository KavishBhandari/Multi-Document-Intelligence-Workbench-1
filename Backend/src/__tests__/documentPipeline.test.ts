import { describe, test } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import { TextParser } from '../services/parsers/textParser';
import { CsvParser } from '../services/parsers/csvParser';
import { PdfParser } from '../services/parsers/pdfParser';
import { parserRegistry } from '../services/parsers';
import { DocumentProcessingService } from '../services/documentProcessingService';
import { MockAIService } from '../services/mockAIService';
import { FINDING_CLASSIFICATIONS } from '../utils/contant';

describe('Document Processing Pipeline & Parsers', () => {
  const sampleDocsDir = path.resolve(__dirname, '../../../sample-documents');

  test('TextParser extracts plain text and computes line metrics', async () => {
    const textPath = path.join(sampleDocsDir, 'company_alpha_report.txt');
    assert.strictEqual(fs.existsSync(textPath), true, 'Sample text file should exist');

    const parser = new TextParser();
    assert.strictEqual(parser.supports('text/plain'), true);
    assert.strictEqual(parser.supports('application/pdf'), false);

    const result = await parser.parse(textPath);
    assert.ok(result.text.includes('Alpha Logistics Solutions Inc.'));
    assert.ok(result.text.includes('$14,500,000 USD'));
    assert.ok(result.pageCount >= 1);
    assert.ok(result.metadata.totalCharacters > 0);
  });

  test('CsvParser converts tabular rows and columns into structured text', async () => {
    const csvPath = path.join(sampleDocsDir, 'company_beta_financials.csv');
    assert.strictEqual(fs.existsSync(csvPath), true, 'Sample CSV file should exist');

    const parser = new CsvParser();
    assert.strictEqual(parser.supports('text/csv'), true);

    const result = await parser.parse(csvPath);
    assert.ok(result.text.includes('Headers: Metric | Fiscal Year 2024 | Fiscal Year 2025 | Notes'));
    assert.ok(result.text.includes('Beta Freight Systems LLC'));
    assert.strictEqual(result.metadata.columnCount, 4);
    assert.ok(Number(result.metadata.rowCount) > 0);
  });

  test('PdfParser parses synthetic PDF agreement and extracts text', async () => {
    const pdfPath = path.join(sampleDocsDir, 'vendor_agreement.pdf');
    assert.strictEqual(fs.existsSync(pdfPath), true, 'Sample PDF should exist');

    const parser = new PdfParser();
    assert.strictEqual(parser.supports('application/pdf'), true);

    const result = await parser.parse(pdfPath);
    assert.ok(result.text.includes('MASTER SERVICES AGREEMENT'));
    assert.ok(result.text.includes('Beta Freight Systems LLC'));
    assert.strictEqual(result.pageCount, 1);
  });

  test('ParserRegistry returns correct parser for MIME types', () => {
    assert.ok(parserRegistry.getParser('application/pdf') instanceof PdfParser);
    assert.ok(parserRegistry.getParser('text/plain') instanceof TextParser);
    assert.ok(parserRegistry.getParser('text/csv') instanceof CsvParser);
    assert.strictEqual(parserRegistry.getParser('image/jpeg'), null);
  });

  test('DocumentProcessingService chunks text while preserving boundaries', () => {
    const longText = 'First sentence here. ' + 'Second sentence is longer. '.repeat(100);
    const chunks = DocumentProcessingService.chunkText(longText, 500);

    assert.ok(chunks.length > 1);
    assert.strictEqual(chunks[0].chunkIndex, 0);
    assert.ok(chunks[0].text.length <= 550);
    assert.strictEqual(chunks[1].chunkIndex, 1);
  });
});

describe('MockAIService Analysis Engine', () => {
  const docA = {
    documentId: 101,
    documentName: 'alpha_report.txt',
    text: `
      Company: Alpha Logistics Solutions Inc.
      Director: Dr. Robert Vance
      Registration No: REG-2019-88421
      Registered Address: 742 Evergreen Terrace, Springfield, OR 97477
      Revenue: $14,500,000 USD
      Net Profit: $2,100,000 USD
      Email: compliance@alphalogistics.com
    `,
    chunks: [
      {
        chunkId: 501,
        chunkIndex: 0,
        text: 'Company: Alpha Logistics Solutions Inc. Director: Dr. Robert Vance',
      },
    ],
  };

  const docB = {
    documentId: 102,
    documentName: 'alpha_application.txt',
    text: `
      Entity Name: Alpha Logistics Solutions Inc.
      Representative: Mr. Robert Vance
      Registration Number: REG-2019-99999
      Primary Business Address: 100 Main Street, Suite 400, Portland, OR 97201
      Revenue: $18,200,000 USD
      Net Profit: $3,500,000 USD
      Email: accounts@alphalogistics-portal.org
    `,
    chunks: [
      {
        chunkId: 502,
        chunkIndex: 0,
        text: 'Entity Name: Alpha Logistics Solutions Inc. Representative: Mr. Robert Vance',
      },
    ],
  };

  test('Detects cross-document discrepancies with provenance evidence', async () => {
    const result = await MockAIService.analyzeDocuments(
      [docA, docB],
      'Identify discrepancies between application form and supporting documents'
    );

    assert.ok(result.findings.length > 0);

    const discrepancies = result.findings.filter((f) => f.type === 'discrepancy');
    assert.ok(discrepancies.length >= 1, 'Should find at least 1 discrepancy');

    // Verify clear distinction between extracted facts and AI interpretation
    const aiInterpretations = result.findings.filter(
      (f) => f.classification === FINDING_CLASSIFICATIONS.AI_INTERPRETATION
    );
    const extractedFacts = result.findings.filter(
      (f) => f.classification === FINDING_CLASSIFICATIONS.EXTRACTED_FACT
    );

    assert.ok(aiInterpretations.length > 0, 'Should have AI interpretations');
    assert.ok(extractedFacts.length > 0, 'Should have extracted facts');

    // Verify source provenance exists on each discrepancy
    const firstDiscrepancy = discrepancies[0];
    assert.ok(firstDiscrepancy.evidences.length > 0);
    assert.ok(firstDiscrepancy.evidences[0].documentId !== undefined);
    assert.ok(firstDiscrepancy.evidences[0].documentName !== undefined);
    assert.ok(firstDiscrepancy.evidences[0].quote !== undefined);
  });

  test('Generates structured comparison table when multiple documents provided', async () => {
    const result = await MockAIService.analyzeDocuments(
      [docA, docB],
      'Compare financial position across companies'
    );

    assert.ok(result.comparisonTable !== null);
    assert.ok(Array.isArray(result.comparisonTable));

    const revenueRow = result.comparisonTable?.find((r) => r.field.toLowerCase().includes('revenue'));
    if (revenueRow) {
      assert.strictEqual(revenueRow.status, 'discrepant');
      assert.ok(revenueRow.values['alpha_report.txt'] !== undefined);
      assert.ok(revenueRow.values['alpha_application.txt'] !== undefined);
    }
  });
});
