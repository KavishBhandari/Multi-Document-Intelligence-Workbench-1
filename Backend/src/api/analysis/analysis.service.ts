import AnalysisSession from '../../database/models/analysissession';
import Document from '../../database/models/document';
import DocumentChunk from '../../database/models/documentchunk';
import AnalysisResult from '../../database/models/analysisresult';
import Finding from '../../database/models/finding';
import FindingEvidence from '../../database/models/findingevidence';
import { MockAIService, DocumentInput } from '../../services/mockAIService';
import { ApiError } from '../../utils/apiError';
import { statusCode, messages, SESSION_STATUS, DOCUMENT_STATUS } from '../../utils/contant';
import { library } from '../../utils/library';

export class AnalysisService {
  static async runAnalysis(sessionId: number, customPrompt?: string) {
    const session = await AnalysisSession.findByPk(sessionId);
    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    const promptToUse = (customPrompt && customPrompt.trim()) || session.prompt;
    if (!promptToUse || promptToUse.trim().length === 0) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Analysis prompt cannot be empty.');
    }

    // Update prompt on session if changed
    if (customPrompt && customPrompt.trim() !== session.prompt) {
      session.prompt = customPrompt.trim();
    }

    // Retrieve all processed documents with chunks
    const documents = await Document.findAll({
      where: {
        session_id: sessionId,
        status: DOCUMENT_STATUS.PROCESSED,
      },
      include: [
        {
          model: DocumentChunk,
          as: 'chunks',
          order: [['chunk_index', 'ASC']],
        },
      ],
    });

    if (documents.length === 0) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'No valid processed documents found in this session. Please upload at least one valid document.'
      );
    }

    // Set session status to analyzing
    session.status = SESSION_STATUS.ANALYZING;
    await session.save();

    try {
      // Prepare DocumentInputs retaining document boundaries
      const documentInputs: DocumentInput[] = documents.map((doc: any) => ({
        documentId: doc.id,
        documentName: doc.original_name,
        text: (doc.chunks || []).map((c: any) => c.text).join('\n\n'),
        chunks: (doc.chunks || []).map((c: any) => ({
          chunkId: c.id,
          chunkIndex: c.chunk_index,
          text: c.text,
        })),
      }));

      // Execute AI Analysis
      const analysisOutput = await MockAIService.analyzeDocuments(documentInputs, promptToUse);

      // Save results in a transaction to guarantee data integrity
      const sequelize = library.db.sequelize;
      const resultRecord = await sequelize.transaction(async (t: any) => {
        // Delete previous results for this session if re-analyzing
        const oldResults = await AnalysisResult.findAll({ where: { session_id: sessionId }, transaction: t });
        for (const oldRes of oldResults) {
          const oldFindings = await Finding.findAll({ where: { result_id: oldRes.id }, transaction: t });
          for (const f of oldFindings) {
            await FindingEvidence.destroy({ where: { finding_id: f.id }, transaction: t });
          }
          await Finding.destroy({ where: { result_id: oldRes.id }, transaction: t });
          await oldRes.destroy({ transaction: t });
        }

        // Create AnalysisResult record
        const newResult = await AnalysisResult.create(
          {
            session_id: sessionId,
            result_json: {
              summary: analysisOutput.summary,
              comparisonTable: analysisOutput.comparisonTable,
              model: analysisOutput.model,
              processingTimeMs: analysisOutput.processingTimeMs,
              documentCount: documents.length,
            },
            model: analysisOutput.model,
          },
          { transaction: t }
        );

        // Create Findings and FindingEvidences
        for (const findingData of analysisOutput.findings) {
          const findingRecord = await Finding.create(
            {
              result_id: newResult.id,
              type: findingData.type,
              title: findingData.title,
              description: findingData.description,
              classification: findingData.classification,
              severity: findingData.severity,
            },
            { transaction: t }
          );

          if (findingData.evidences && findingData.evidences.length > 0) {
            const evidenceRecords = findingData.evidences.map((ev) => ({
              finding_id: findingRecord.id,
              document_id: ev.documentId,
              chunk_id: ev.chunkId,
              quote: ev.quote,
              page_number: ev.pageNumber,
            }));

            await FindingEvidence.bulkCreate(evidenceRecords, { transaction: t });
          }
        }

        return newResult;
      });

      // Update session status to completed
      session.status = SESSION_STATUS.COMPLETED;
      await session.save();

      return await this.getSessionResult(sessionId);
    } catch (error: any) {
      session.status = SESSION_STATUS.FAILED;
      await session.save();
      console.error('Analysis execution failed:', error);
      throw new ApiError(statusCode.INTERNAL_SERVER_ERROR, `Analysis failed: ${error.message}`);
    }
  }

  static async getSessionResult(sessionId: number) {
    const session = await AnalysisSession.findByPk(sessionId, {
      include: [
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'original_name', 'mime_type', 'size_bytes', 'status', 'page_count', 'error_message'],
        },
      ],
    });

    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    const latestResult: any = await AnalysisResult.findOne({
      where: { session_id: sessionId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Finding,
          as: 'findings',
          include: [
            {
              model: FindingEvidence,
              as: 'evidences',
              include: [
                {
                  model: Document,
                  as: 'document',
                  attributes: ['id', 'original_name', 'mime_type'],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!latestResult) {
      return {
        session: {
          id: session.id,
          prompt: session.prompt,
          status: session.status,
          documents: (session as any).documents,
        },
        result: null,
      };
    }

    const rawJson = latestResult.result_json || {};
    const findings: any[] = latestResult.findings || [];

    // Categorize findings for versatile presentation
    const comparisonFindings = findings.filter((f) => f.type === 'comparison');
    const discrepancyFindings = findings.filter((f) => f.type === 'discrepancy');
    const keyValueFindings = findings.filter((f) => f.type === 'key_value');
    const missingInfoFindings = findings.filter((f) => f.type === 'missing_info');
    const summaryFindings = findings.filter((f) => f.type === 'summary');

    // Generate markdown export text for quick copy
    const markdownExport = this.generateMarkdownExport(session, rawJson, findings);

    return {
      session: {
        id: session.id,
        prompt: session.prompt,
        status: session.status,
        documents: (session as any).documents,
      },
      result: {
        id: latestResult.id,
        model: latestResult.model,
        summary: rawJson.summary,
        comparisonTable: rawJson.comparisonTable,
        processingTimeMs: rawJson.processingTimeMs,
        createdAt: latestResult.createdAt,
        findingsCount: findings.length,
        breakdown: {
          discrepancies: discrepancyFindings,
          comparisons: comparisonFindings,
          keyValues: keyValueFindings,
          missingInfo: missingInfoFindings,
          summaries: summaryFindings,
        },
        allFindings: findings,
        markdownExport,
      },
    };
  }

  private static generateMarkdownExport(session: any, rawJson: any, findings: any[]): string {
    let md = `# Multi-Document Analysis Report\n\n`;
    md += `**Session ID:** ${session.id}\n`;
    md += `**Prompt:** ${session.prompt}\n`;
    md += `**Model:** ${rawJson.model || 'mock-ai-v1'}\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;

    if (rawJson.summary) {
      md += `${rawJson.summary}\n\n`;
    }

    // Comparison Table
    if (rawJson.comparisonTable && rawJson.comparisonTable.length > 0) {
      md += `## Comparison Matrix\n\n`;
      const table = rawJson.comparisonTable;
      const docHeaders = Object.keys(table[0]?.values || {});
      md += `| Field | ${docHeaders.join(' | ')} | Status |\n`;
      md += `| ${'--- | '.repeat(docHeaders.length + 2)}\n`;
      table.forEach((row: any) => {
        const rowVals = docHeaders.map((h) => row.values[h] || '—').join(' | ');
        md += `| **${row.field}** | ${rowVals} | ${row.status.toUpperCase()} |\n`;
      });
      md += `\n`;
    }

    // Findings section
    md += `## Detailed Findings with Source Provenance\n\n`;
    findings.forEach((finding, idx) => {
      md += `### ${idx + 1}. [${finding.classification.toUpperCase()}] ${finding.title}\n`;
      md += `*Severity: ${finding.severity.toUpperCase()} | Type: ${finding.type}*\n\n`;
      md += `${finding.description}\n\n`;

      if (finding.evidences && finding.evidences.length > 0) {
        md += `**Supporting Citations:**\n`;
        finding.evidences.forEach((ev: any) => {
          const docName = ev.document?.original_name || `Document #${ev.document_id}`;
          md += `- *Source:* "${docName}" (Chunk #${ev.chunk_id || 'N/A'})\n  > "${ev.quote}"\n`;
        });
        md += `\n`;
      }
    });

    return md;
  }
}
