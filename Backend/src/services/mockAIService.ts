/**
 * Mock AI Analysis Service
 * 
 * This is a structured, deterministic AI mock that performs real text analysis
 * without requiring an external LLM API. It demonstrates the architecture of
 * how a real LLM integration would work while producing meaningful results.
 * 
 * The mock performs:
 * - Key-value extraction (dates, amounts, names, emails)
 * - Cross-document comparison
 * - Discrepancy detection
 * - Missing information identification
 * - Consolidated summary generation
 * 
 * Each finding is classified as either 'extracted_fact' or 'ai_interpretation'
 * to clearly distinguish between data pulled directly from documents and
 * AI-generated insights.
 */

import { FINDING_TYPES, FINDING_CLASSIFICATIONS, FINDING_SEVERITIES } from '../utils/contant';

export interface DocumentInput {
  documentId: number;
  documentName: string;
  text: string;
  chunks: Array<{
    chunkId: number;
    chunkIndex: number;
    text: string;
  }>;
}

export interface EvidenceItem {
  documentId: number;
  documentName: string;
  chunkId: number | null;
  quote: string;
  pageNumber: number | null;
}

export interface AIFinding {
  type: string;
  title: string;
  description: string;
  classification: string;
  severity: string;
  evidences: EvidenceItem[];
}

export interface AnalysisOutput {
  summary: string;
  findings: AIFinding[];
  comparisonTable: ComparisonRow[] | null;
  model: string;
  processingTimeMs: number;
}

export interface ComparisonRow {
  field: string;
  values: Record<string, string>; // documentName -> value
  status: 'consistent' | 'discrepant' | 'partial';
}

// Regex patterns for extracting structured data from text
const PATTERNS = {
  date: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})\b/gi,
  money: /[\$£€₹][\s]?[\d,]+\.?\d*|\b\d[\d,]*\.?\d*\s*(?:USD|EUR|GBP|INR|dollars?|pounds?)\b/gi,
  email: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi,
  phone: /(?:\+?\d{1,3}[\s\-]?)?(?:\(?\d{2,4}\)?[\s\-]?)?\d{3,4}[\s\-]?\d{3,4}/gi,
  percentage: /\d+\.?\d*\s*%/gi,
  name: /(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g,
  address: /\d+\s+[A-Z][a-zA-Z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)[.,]?\s*(?:[A-Z][a-zA-Z\s]+,?\s*)?(?:[A-Z]{2}\s+)?\d{5,6}?/gi,
  licenseNumber: /(?:License|Licence|Registration|Reg)\s*(?:No|Number|#|:)?\s*[:\s]?\s*([A-Z0-9\-\/]+)/gi,
  companyName: /(?:Company|Organization|Organisation|Firm|Corporation|Corp|Ltd|LLC|Inc|Pvt)\s*[:\s]?\s*([A-Za-z\s&.,]+?)(?:\n|$|,|\.|;)/gi,
  revenue: /(?:Revenue|Turnover|Sales|Income|Profit|Loss|EBITDA|Net\s+Worth)\s*[:\s]?\s*[\$£€₹]?\s?[\d,]+\.?\d*/gi,
};

export class MockAIService {
  /**
   * Main analysis entry point - orchestrates all analysis steps
   */
  static async analyzeDocuments(
    documents: DocumentInput[],
    prompt: string
  ): Promise<AnalysisOutput> {
    const startTime = Date.now();

    // Step 1: Extract key-value pairs from each document independently
    const documentExtractions = documents.map((doc) => ({
      document: doc,
      extractions: this.extractKeyValues(doc),
    }));

    // Step 2: Build findings based on the analysis prompt
    const findings: AIFinding[] = [];

    // Always extract key values
    findings.push(...this.buildKeyValueFindings(documentExtractions));

    // Cross-document comparison
    if (documents.length > 1) {
      findings.push(...this.buildComparisonFindings(documentExtractions));
      findings.push(...this.detectDiscrepancies(documentExtractions));
    }

    // Missing information analysis
    findings.push(...this.detectMissingInformation(documentExtractions, prompt));

    // Prompt-specific analysis
    findings.push(...this.analyzeByPrompt(documentExtractions, prompt));

    // Step 3: Build comparison table if multiple documents
    const comparisonTable = documents.length > 1
      ? this.buildComparisonTable(documentExtractions)
      : null;

    // Step 4: Generate consolidated summary
    const summary = this.generateSummary(documents, findings, prompt);

    return {
      summary,
      findings,
      comparisonTable,
      model: 'mock-ai-v1 (deterministic-text-analysis)',
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Extract structured key-value pairs from a document's text
   */
  private static extractKeyValues(
    doc: DocumentInput
  ): Map<string, { value: string; quote: string; chunkId: number | null }[]> {
    const extractions = new Map<string, { value: string; quote: string; chunkId: number | null }[]>();
    const text = doc.text;

    const extractAndStore = (key: string, pattern: RegExp) => {
      const matches = text.match(pattern);
      if (matches) {
        const uniqueMatches = [...new Set(matches)];
        extractions.set(
          key,
          uniqueMatches.map((match) => {
            // Find which chunk contains this match for provenance
            const chunk = doc.chunks.find((c) => c.text.includes(match));
            // Get surrounding context for the quote
            const idx = text.indexOf(match);
            const contextStart = Math.max(0, idx - 40);
            const contextEnd = Math.min(text.length, idx + match.length + 40);
            return {
              value: match.trim(),
              quote: text.slice(contextStart, contextEnd).trim(),
              chunkId: chunk?.chunkId || null,
            };
          })
        );
      }
    };

    extractAndStore('dates', PATTERNS.date);
    extractAndStore('monetary_values', PATTERNS.money);
    extractAndStore('emails', PATTERNS.email);
    extractAndStore('percentages', PATTERNS.percentage);
    extractAndStore('names', PATTERNS.name);
    extractAndStore('license_numbers', PATTERNS.licenseNumber);
    extractAndStore('revenue_figures', PATTERNS.revenue);
    extractAndStore('addresses', PATTERNS.address);

    return extractions;
  }

  /**
   * Build key-value extraction findings
   */
  private static buildKeyValueFindings(
    documentExtractions: Array<{
      document: DocumentInput;
      extractions: Map<string, { value: string; quote: string; chunkId: number | null }[]>;
    }>
  ): AIFinding[] {
    const findings: AIFinding[] = [];

    for (const { document, extractions } of documentExtractions) {
      for (const [key, values] of extractions) {
        if (values.length > 0) {
          findings.push({
            type: FINDING_TYPES.KEY_VALUE,
            title: `${this.formatFieldName(key)} found in "${document.documentName}"`,
            description: `Extracted ${values.length} ${this.formatFieldName(key).toLowerCase()}: ${values.map((v) => v.value).join(', ')}`,
            classification: FINDING_CLASSIFICATIONS.EXTRACTED_FACT,
            severity: FINDING_SEVERITIES.INFO,
            evidences: values.map((v): EvidenceItem => ({
              documentId: document.documentId,
              documentName: document.documentName,
              chunkId: v.chunkId,
              quote: v.quote,
              pageNumber: null,
            })),
          });
        }
      }
    }

    return findings;
  }

  /**
   * Compare extracted values across documents
   */
  private static buildComparisonFindings(
    documentExtractions: Array<{
      document: DocumentInput;
      extractions: Map<string, { value: string; quote: string; chunkId: number | null }[]>;
    }>
  ): AIFinding[] {
    const findings: AIFinding[] = [];
    const allFields = new Set<string>();

    documentExtractions.forEach(({ extractions }) => {
      extractions.forEach((_, key) => allFields.add(key));
    });

    for (const field of allFields) {
      const docsWithField = documentExtractions.filter(
        ({ extractions }) => extractions.has(field) && extractions.get(field)!.length > 0
      );

      if (docsWithField.length > 1) {
        const allValues = docsWithField.map(({ document, extractions }) => ({
          docName: document.documentName,
          values: extractions.get(field)!.map((v) => v.value),
        }));

        const allSame = allValues.every(
          (v) => JSON.stringify(v.values.sort()) === JSON.stringify(allValues[0].values.sort())
        );

        findings.push({
          type: FINDING_TYPES.COMPARISON,
          title: `Cross-document comparison: ${this.formatFieldName(field)}`,
          description: allSame
            ? `${this.formatFieldName(field)} are consistent across all documents: ${allValues[0].values.join(', ')}`
            : `${this.formatFieldName(field)} differ across documents. ${allValues
                .map((v) => `${v.docName}: ${v.values.join(', ')}`)
                .join(' | ')}`,
          classification: FINDING_CLASSIFICATIONS.AI_INTERPRETATION,
          severity: allSame ? FINDING_SEVERITIES.INFO : FINDING_SEVERITIES.WARNING,
          evidences: docsWithField.flatMap(({ document, extractions }) =>
            extractions.get(field)!.map((v): EvidenceItem => ({
              documentId: document.documentId,
              documentName: document.documentName,
              chunkId: v.chunkId,
              quote: v.quote,
              pageNumber: null,
            }))
          ),
        });
      }
    }

    return findings;
  }

  /**
   * Detect specific discrepancies between documents
   */
  private static detectDiscrepancies(
    documentExtractions: Array<{
      document: DocumentInput;
      extractions: Map<string, { value: string; quote: string; chunkId: number | null }[]>;
    }>
  ): AIFinding[] {
    const findings: AIFinding[] = [];
    const fieldsToCompare = ['names', 'addresses', 'license_numbers', 'revenue_figures', 'monetary_values'];

    for (const field of fieldsToCompare) {
      const docsWithField = documentExtractions.filter(
        ({ extractions }) => extractions.has(field) && extractions.get(field)!.length > 0
      );

      if (docsWithField.length > 1) {
        const valueSets = docsWithField.map(({ document, extractions }) => ({
          docName: document.documentName,
          docId: document.documentId,
          values: new Set(extractions.get(field)!.map((v) => v.value.toLowerCase().trim())),
          rawExtractions: extractions.get(field)!,
        }));

        // Check if values differ
        for (let i = 0; i < valueSets.length; i++) {
          for (let j = i + 1; j < valueSets.length; j++) {
            const setA = valueSets[i];
            const setB = valueSets[j];

            const onlyInA = [...setA.values].filter((v) => !setB.values.has(v));
            const onlyInB = [...setB.values].filter((v) => !setA.values.has(v));

            if (onlyInA.length > 0 || onlyInB.length > 0) {
              findings.push({
                type: FINDING_TYPES.DISCREPANCY,
                title: `Discrepancy in ${this.formatFieldName(field)} between "${setA.docName}" and "${setB.docName}"`,
                description: [
                  onlyInA.length > 0 ? `Only in "${setA.docName}": ${onlyInA.join(', ')}` : '',
                  onlyInB.length > 0 ? `Only in "${setB.docName}": ${onlyInB.join(', ')}` : '',
                ]
                  .filter(Boolean)
                  .join('. '),
                classification: FINDING_CLASSIFICATIONS.AI_INTERPRETATION,
                severity: FINDING_SEVERITIES.WARNING,
                evidences: [
                  ...setA.rawExtractions.map((v): EvidenceItem => ({
                    documentId: setA.docId,
                    documentName: setA.docName,
                    chunkId: v.chunkId,
                    quote: v.quote,
                    pageNumber: null,
                  })),
                  ...setB.rawExtractions.map((v): EvidenceItem => ({
                    documentId: setB.docId,
                    documentName: setB.docName,
                    chunkId: v.chunkId,
                    quote: v.quote,
                    pageNumber: null,
                  })),
                ],
              });
            }
          }
        }
      }
    }

    return findings;
  }

  /**
   * Detect information that might be expected but is missing
   */
  private static detectMissingInformation(
    documentExtractions: Array<{
      document: DocumentInput;
      extractions: Map<string, { value: string; quote: string; chunkId: number | null }[]>;
    }>,
    prompt: string
  ): AIFinding[] {
    const findings: AIFinding[] = [];

    const expectedFields = [
      { field: 'dates', label: 'dates or deadlines' },
      { field: 'monetary_values', label: 'financial values or amounts' },
      { field: 'emails', label: 'contact email addresses' },
      { field: 'names', label: 'person names' },
    ];

    for (const { document, extractions } of documentExtractions) {
      const missingFields = expectedFields.filter(
        (ef) => !extractions.has(ef.field) || extractions.get(ef.field)!.length === 0
      );

      if (missingFields.length > 0) {
        findings.push({
          type: FINDING_TYPES.MISSING_INFO,
          title: `Potentially missing information in "${document.documentName}"`,
          description: `The following information types were not found: ${missingFields.map((f) => f.label).join(', ')}. This may be expected depending on the document type.`,
          classification: FINDING_CLASSIFICATIONS.AI_INTERPRETATION,
          severity: FINDING_SEVERITIES.INFO,
          evidences: [
            {
              documentId: document.documentId,
              documentName: document.documentName,
              chunkId: null as number | null,
              quote: `Document "${document.documentName}" was analyzed but did not contain detectable ${missingFields.map((f) => f.label).join(', ')}.`,
              pageNumber: null as number | null,
            },
          ],
        });
      }
    }

    return findings;
  }

  /**
   * Additional analysis based on prompt keywords
   */
  private static analyzeByPrompt(
    documentExtractions: Array<{
      document: DocumentInput;
      extractions: Map<string, { value: string; quote: string; chunkId: number | null }[]>;
    }>,
    prompt: string
  ): AIFinding[] {
    const findings: AIFinding[] = [];
    const promptLower = prompt.toLowerCase();

    // Financial analysis prompt
    if (
      promptLower.includes('financial') ||
      promptLower.includes('revenue') ||
      promptLower.includes('profit') ||
      promptLower.includes('income')
    ) {
      for (const { document, extractions } of documentExtractions) {
        const monetaryValues = extractions.get('monetary_values') || [];
        const revenueValues = extractions.get('revenue_figures') || [];

        if (monetaryValues.length > 0 || revenueValues.length > 0) {
          findings.push({
            type: FINDING_TYPES.SUMMARY,
            title: `Financial overview of "${document.documentName}"`,
            description: `Found ${monetaryValues.length} monetary values and ${revenueValues.length} revenue/financial figures. ${
              monetaryValues.length > 0
                ? `Monetary: ${monetaryValues.map((v) => v.value).join(', ')}.`
                : ''
            } ${
              revenueValues.length > 0
                ? `Financial metrics: ${revenueValues.map((v) => v.value).join(', ')}.`
                : ''
            }`,
            classification: FINDING_CLASSIFICATIONS.AI_INTERPRETATION,
            severity: FINDING_SEVERITIES.INFO,
            evidences: [...monetaryValues, ...revenueValues].map((v): EvidenceItem => ({
              documentId: document.documentId,
              documentName: document.documentName,
              chunkId: v.chunkId,
              quote: v.quote,
              pageNumber: null,
            })),
          });
        }
      }
    }

    // Obligations / deadlines prompt
    if (
      promptLower.includes('obligation') ||
      promptLower.includes('deadline') ||
      promptLower.includes('date') ||
      promptLower.includes('schedule')
    ) {
      for (const { document, extractions } of documentExtractions) {
        const dates = extractions.get('dates') || [];
        if (dates.length > 0) {
          findings.push({
            type: FINDING_TYPES.SUMMARY,
            title: `Key dates and potential obligations in "${document.documentName}"`,
            description: `Found ${dates.length} date references: ${dates.map((v) => v.value).join(', ')}. These may represent deadlines, effective dates, or other time-bound obligations.`,
            classification: FINDING_CLASSIFICATIONS.AI_INTERPRETATION,
            severity: FINDING_SEVERITIES.INFO,
            evidences: dates.map((v): EvidenceItem => ({
              documentId: document.documentId,
              documentName: document.documentName,
              chunkId: v.chunkId,
              quote: v.quote,
              pageNumber: null,
            })),
          });
        }
      }
    }

    return findings;
  }

  /**
   * Build structured comparison table across documents
   */
  private static buildComparisonTable(
    documentExtractions: Array<{
      document: DocumentInput;
      extractions: Map<string, { value: string; quote: string; chunkId: number | null }[]>;
    }>
  ): ComparisonRow[] {
    const allFields = new Set<string>();
    documentExtractions.forEach(({ extractions }) => {
      extractions.forEach((_, key) => allFields.add(key));
    });

    const rows: ComparisonRow[] = [];

    for (const field of allFields) {
      const values: Record<string, string> = {};
      let hasMultipleDistinct = false;
      const uniqueValues = new Set<string>();

      for (const { document, extractions } of documentExtractions) {
        const fieldValues = extractions.get(field);
        if (fieldValues && fieldValues.length > 0) {
          const val = fieldValues.map((v) => v.value).join('; ');
          values[document.documentName] = val;
          uniqueValues.add(val.toLowerCase());
        } else {
          values[document.documentName] = '—';
        }
      }

      const hasAnyMissing = Object.values(values).includes('—');
      hasMultipleDistinct = uniqueValues.size > 1;

      let status: 'consistent' | 'discrepant' | 'partial' = 'consistent';
      if (hasMultipleDistinct) status = 'discrepant';
      else if (hasAnyMissing) status = 'partial';

      rows.push({
        field: this.formatFieldName(field),
        values,
        status,
      });
    }

    return rows;
  }

  /**
   * Generate a consolidated narrative summary
   */
  private static generateSummary(
    documents: DocumentInput[],
    findings: AIFinding[],
    prompt: string
  ): string {
    const docNames = documents.map((d) => `"${d.documentName}"`).join(', ');
    const discrepancies = findings.filter((f) => f.type === FINDING_TYPES.DISCREPANCY);
    const keyValues = findings.filter((f) => f.type === FINDING_TYPES.KEY_VALUE);
    const missingInfo = findings.filter((f) => f.type === FINDING_TYPES.MISSING_INFO);
    const comparisons = findings.filter((f) => f.type === FINDING_TYPES.COMPARISON);

    let summary = `## Analysis Summary\n\n`;
    summary += `**Documents analyzed:** ${documents.length} (${docNames})\n`;
    summary += `**Analysis prompt:** "${prompt}"\n`;
    summary += `**Total findings:** ${findings.length}\n\n`;

    if (keyValues.length > 0) {
      summary += `### Extracted Information\n`;
      summary += `Found ${keyValues.length} categories of structured data across the documents.\n\n`;
    }

    if (comparisons.length > 0) {
      summary += `### Cross-Document Comparison\n`;
      summary += `Compared ${comparisons.length} data fields across documents. `;
      const consistent = comparisons.filter((c) => c.severity === 'info').length;
      const inconsistent = comparisons.length - consistent;
      summary += `${consistent} fields are consistent, ${inconsistent} show differences.\n\n`;
    }

    if (discrepancies.length > 0) {
      summary += `### ⚠️ Discrepancies Detected\n`;
      summary += `Found ${discrepancies.length} discrepancies between documents:\n`;
      discrepancies.forEach((d) => {
        summary += `- ${d.title}\n`;
      });
      summary += '\n';
    }

    if (missingInfo.length > 0) {
      summary += `### Missing Information\n`;
      summary += `Identified potential missing data in ${missingInfo.length} documents.\n\n`;
    }

    summary += `---\n*Analysis performed by mock-ai-v1 (deterministic text analysis engine). `;
    summary += `Findings classified as "extracted_fact" are directly sourced from document content. `;
    summary += `Findings classified as "ai_interpretation" involve analytical inference.*`;

    return summary;
  }

  /**
   * Format field names for display
   */
  private static formatFieldName(field: string): string {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
