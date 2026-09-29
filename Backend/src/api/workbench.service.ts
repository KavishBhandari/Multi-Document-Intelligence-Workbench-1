import AnalysisSession from '../database/models/analysissession';
import Document from '../database/models/document';
import DocumentChunk from '../database/models/documentchunk';
import AnalysisResult from '../database/models/analysisresult';
import Finding from '../database/models/finding';
import FindingEvidence from '../database/models/findingevidence';
import { DocumentProcessingService } from '../services/documentProcessingService';
import { MockAIService, DocumentInput } from '../services/mockAIService';
import { ApiError } from '../utils/apiError';
import { statusCode, messages, DOCUMENT_STATUS, SESSION_STATUS, SUPPORTED_MIME_TYPES } from '../utils/contant';
import { library } from '../utils/library';

export class WorkbenchService {
  
  static async uploadAndIngest(prompt: string, files: Express.Multer.File[]) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Analysis prompt is required in request body.');
    }

    if (!files || files.length === 0) {
      throw new ApiError(statusCode.BAD_REQUEST, 'Please upload at least one document (PDF, CSV, or TXT).');
    }

    
    const session = await AnalysisSession.create({
      prompt: prompt.trim(),
      status: SESSION_STATUS.PROCESSING,
    });

    const processedDocuments = [];

   
    for (const file of files) {
      let docRecord: Document | null = null;
      try {
        const isSupported = Boolean(SUPPORTED_MIME_TYPES[file.mimetype]);
        let sha256: string | null = null;

        try {
          sha256 = DocumentProcessingService.computeFileHash(file.path);
        } catch {
          sha256 = null;
        }

        
        docRecord = await Document.create({
          session_id: session.id,
          original_name: file.originalname,
          stored_name: file.filename,
          mime_type: file.mimetype,
          size_bytes: file.size,
          sha256,
          status: isSupported ? DOCUMENT_STATUS.PROCESSING : DOCUMENT_STATUS.UNSUPPORTED,
          error_code: isSupported ? null : 'UNSUPPORTED_FORMAT',
          error_message: isSupported
            ? null
            : `Unsupported format (${file.mimetype}). Supported formats: PDF, CSV, TXT.`,
          page_count: null,
        });

        if (!isSupported) {
          processedDocuments.push({
            documentId: docRecord.id,
            originalName: docRecord.original_name,
            mimeType: file.mimetype,
            status: DOCUMENT_STATUS.UNSUPPORTED,
            error: docRecord.error_message,
          });
          continue;
        }

       
        const processed = await DocumentProcessingService.processFile(file, docRecord.id);

        docRecord.status = DOCUMENT_STATUS.PROCESSED;
        docRecord.page_count = processed.pageCount;
        docRecord.sha256 = processed.sha256;
        await docRecord.save();

        
        if (processed.chunks.length > 0) {
          const chunkRecords = processed.chunks.map((c) => ({
            document_id: docRecord!.id,
            chunk_index: c.chunkIndex,
            page_number: c.pageNumber,
            text: c.text,
            char_start: c.charStart,
            char_end: c.charEnd,
          }));
          await DocumentChunk.bulkCreate(chunkRecords);
        }

        processedDocuments.push({
          documentId: docRecord.id,
          originalName: docRecord.original_name,
          mimeType: docRecord.mime_type,
          sizeBytes: docRecord.size_bytes,
          status: DOCUMENT_STATUS.PROCESSED,
          pageCount: processed.pageCount,
          chunkCount: processed.chunks.length,
          sha256: processed.sha256,
        });
      } catch (err: any) {
        console.error(`Error processing file ${file.originalname}:`, err);
        if (docRecord) {
          docRecord.status = DOCUMENT_STATUS.FAILED;
          docRecord.error_code = 'PARSING_ERROR';
          docRecord.error_message = err.message || 'Failed to extract content from file.';
          await docRecord.save();
        }

        processedDocuments.push({
          documentId: docRecord?.id || null,
          originalName: file.originalname,
          status: DOCUMENT_STATUS.FAILED,
          error: err.message || 'File processing failed.',
        });
      }
    }

    session.status = SESSION_STATUS.CREATED;
    await session.save();

    return {
      sessionId: session.id,
      prompt: session.prompt,
      status: session.status,
      uploadedCount: files.length,
      processedCount: processedDocuments.filter((d) => d.status === DOCUMENT_STATUS.PROCESSED).length,
      documents: processedDocuments,
    };
  }

  
  static async evaluate(sessionId: number, promptOverride?: string) {
    if (!sessionId || isNaN(sessionId)) {
      throw new ApiError(statusCode.BAD_REQUEST, 'A valid numeric sessionId is required.');
    }

    const session = await AnalysisSession.findByPk(sessionId, {
      include: [
        {
          model: Document,
          as: 'documents',
          where: { status: DOCUMENT_STATUS.PROCESSED },
          required: false,
          include: [
            {
              model: DocumentChunk,
              as: 'chunks',
              order: [['chunk_index', 'ASC']],
            },
          ],
        },
      ],
    });

    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    const docs = (session as any).documents || [];
    if (docs.length === 0) {
      throw new ApiError(
        statusCode.BAD_REQUEST,
        'No valid processed documents found for this session. Please upload at least one valid document first.'
      );
    }

    const promptToUse = (promptOverride && promptOverride.trim()) || session.prompt;
    session.status = SESSION_STATUS.ANALYZING;
    await session.save();

    try {
      // 1. Structure document inputs retaining boundaries
      const documentInputs: DocumentInput[] = docs.map((doc: any) => ({
        documentId: doc.id,
        documentName: doc.original_name,
        text: (doc.chunks || []).map((c: any) => c.text).join('\n\n'),
        chunks: (doc.chunks || []).map((c: any) => ({
          chunkId: c.id,
          chunkIndex: c.chunk_index,
          text: c.text,
        })),
      }));

     
      const analysisOutput = await MockAIService.analyzeDocuments(documentInputs, promptToUse);

     
      const sequelize = library.db.sequelize;
      await sequelize.transaction(async (t: any) => {
        
        const existingResults = await AnalysisResult.findAll({ where: { session_id: sessionId }, transaction: t });
        for (const res of existingResults) {
          const findings = await Finding.findAll({ where: { result_id: res.id }, transaction: t });
          for (const f of findings) {
            await FindingEvidence.destroy({ where: { finding_id: f.id }, transaction: t });
          }
          await Finding.destroy({ where: { result_id: res.id }, transaction: t });
          await res.destroy({ transaction: t });
        }

        const newResult = await AnalysisResult.create(
          {
            session_id: sessionId,
            result_json: {
              summary: analysisOutput.summary,
              comparisonTable: analysisOutput.comparisonTable,
              model: analysisOutput.model,
              processingTimeMs: analysisOutput.processingTimeMs,
              documentCount: docs.length,
            },
            model: analysisOutput.model,
          },
          { transaction: t }
        );

        for (const finding of analysisOutput.findings) {
          const findingRecord = await Finding.create(
            {
              result_id: newResult.id,
              type: finding.type,
              title: finding.title,
              description: finding.description,
              classification: finding.classification,
              severity: finding.severity,
            },
            { transaction: t }
          );

          if (finding.evidences && finding.evidences.length > 0) {
            const evidences = finding.evidences.map((ev) => ({
              finding_id: findingRecord.id,
              document_id: ev.documentId,
              chunk_id: ev.chunkId,
              quote: ev.quote,
              page_number: ev.pageNumber,
            }));
            await FindingEvidence.bulkCreate(evidences, { transaction: t });
          }
        }
      });

      session.status = SESSION_STATUS.COMPLETED;
      await session.save();

      
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

      const findings: any[] = latestResult.findings || [];
      const comparisonTable = analysisOutput.comparisonTable;
      const summary = analysisOutput.summary;

     
      const discrepancies = findings.filter((f) => f.type === 'discrepancy');
      const comparisons = findings.filter((f) => f.type === 'comparison');
      const keyValues = findings.filter((f) => f.type === 'key_value');
      const missingInfo = findings.filter((f) => f.type === 'missing_info');

     
      const markdownOutput = this.buildMarkdownReport(session, docs, summary, comparisonTable, findings);

      return {
        sessionId: session.id,
        prompt: promptToUse,
        status: session.status,
        model: latestResult.model,
        processingTimeMs: analysisOutput.processingTimeMs,
        documentsAnalyzed: docs.map((d: any) => ({
          id: d.id,
          name: d.original_name,
          mimeType: d.mime_type,
          pageCount: d.page_count,
        })),
        summary,
        comparisonTable,
        discrepancies,
        keyValues,
        comparisons,
        missingInformation: missingInfo,
        allFindingsCount: findings.length,
        markdownOutput,
      };
    } catch (err: any) {
      session.status = SESSION_STATUS.FAILED;
      await session.save();
      throw new ApiError(statusCode.INTERNAL_SERVER_ERROR, `Evaluation failed: ${err.message}`);
    }
  }

  private static buildMarkdownReport(
    session: any,
    docs: any[],
    summary: string,
    comparisonTable: any[] | null,
    findings: any[]
  ): string {
    let md = `# Multi-Document Intelligence Evaluation Report\n\n`;
    md += `**Session ID:** ${session.id}\n`;
    md += `**Prompt:** "${session.prompt}"\n`;
    md += `**Documents:** ${docs.map((d: any) => d.original_name).join(', ')}\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;

    if (summary) {
      md += `${summary}\n\n`;
    }

    if (comparisonTable && comparisonTable.length > 0) {
      md += `## Structured Comparison Matrix\n\n`;
      const docHeaders = Object.keys(comparisonTable[0]?.values || {});
      md += `| Field | ${docHeaders.join(' | ')} | Status |\n`;
      md += `| ${'--- | '.repeat(docHeaders.length + 2)}\n`;
      comparisonTable.forEach((row: any) => {
        const rowVals = docHeaders.map((h) => row.values[h] || '—').join(' | ');
        md += `| **${row.field}** | ${rowVals} | ${row.status.toUpperCase()} |\n`;
      });
      md += `\n`;
    }

    md += `## Detailed Findings with Source Provenance\n\n`;
    findings.forEach((finding, idx) => {
      md += `### ${idx + 1}. [${finding.classification.toUpperCase()}] ${finding.title}\n`;
      md += `*Severity: ${finding.severity.toUpperCase()} | Type: ${finding.type}*\n\n`;
      md += `${finding.description}\n\n`;

      if (finding.evidences && finding.evidences.length > 0) {
        md += `**Supporting Citations:**\n`;
        finding.evidences.forEach((ev: any) => {
          const docName = ev.document?.original_name || `Document #${ev.document_id}`;
          md += `- Source: "${docName}" (Chunk #${ev.chunk_id || 'N/A'})\n  > "${ev.quote}"\n`;
        });
        md += `\n`;
      }
    });

    return md;
  }
}
