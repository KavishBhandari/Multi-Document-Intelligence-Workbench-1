import path from 'path';
import fs from 'fs';
import Document from '../../database/models/document';
import DocumentChunk from '../../database/models/documentchunk';
import AnalysisSession from '../../database/models/analysissession';
import { DocumentProcessingService } from '../../services/documentProcessingService';
import { ApiError } from '../../utils/apiError';
import { statusCode, messages, DOCUMENT_STATUS, SUPPORTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../utils/contant';

export class DocumentService {
  static async uploadAndProcessDocuments(sessionId: number, files: Express.Multer.File[]) {
    const session = await AnalysisSession.findByPk(sessionId);
    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    if (!files || files.length === 0) {
      throw new ApiError(statusCode.BAD_REQUEST, messages.NO_FILES_PROVIDED);
    }

    const processedResults = [];

    for (const file of files) {
      let docRecord: Document | null = null;
      try {
        // Validate MIME type
        const isSupported = Boolean(SUPPORTED_MIME_TYPES[file.mimetype]);
        const initialStatus = isSupported ? DOCUMENT_STATUS.PROCESSING : DOCUMENT_STATUS.UNSUPPORTED;

        let sha256: string | null = null;
        try {
          if (fs.existsSync(file.path)) {
            sha256 = DocumentProcessingService.computeFileHash(file.path);
          }
        } catch {
          sha256 = null;
        }

        // Create initial Document row in DB
        docRecord = await Document.create({
          session_id: sessionId,
          original_name: file.originalname,
          stored_name: file.filename,
          mime_type: file.mimetype,
          size_bytes: file.size,
          sha256,
          status: initialStatus,
          error_code: isSupported ? null : 'UNSUPPORTED_FORMAT',
          error_message: isSupported ? null : `MIME type ${file.mimetype} is not supported. Supported: PDF, TXT, CSV.`,
          page_count: null,
        });

        if (!isSupported) {
          processedResults.push({
            documentId: docRecord.id,
            originalName: docRecord.original_name,
            status: DOCUMENT_STATUS.UNSUPPORTED,
            error: docRecord.error_message,
          });
          continue;
        }

        // Parse and chunk
        const processedDoc = await DocumentProcessingService.processFile(file, docRecord.id);

        // Update Document row
        docRecord.status = DOCUMENT_STATUS.PROCESSED;
        docRecord.page_count = processedDoc.pageCount;
        docRecord.sha256 = processedDoc.sha256;
        await docRecord.save();

        // Store chunks for provenance tracking
        if (processedDoc.chunks.length > 0) {
          const chunkRecords = processedDoc.chunks.map((chunk) => ({
            document_id: docRecord!.id,
            chunk_index: chunk.chunkIndex,
            page_number: chunk.pageNumber,
            text: chunk.text,
            char_start: chunk.charStart,
            char_end: chunk.charEnd,
          }));

          await DocumentChunk.bulkCreate(chunkRecords);
        }

        processedResults.push({
          documentId: docRecord.id,
          originalName: docRecord.original_name,
          status: DOCUMENT_STATUS.PROCESSED,
          pageCount: processedDoc.pageCount,
          chunkCount: processedDoc.chunks.length,
          sha256: processedDoc.sha256,
        });
      } catch (err: any) {
        console.error(`Error processing document ${file.originalname}:`, err);

        if (docRecord) {
          docRecord.status = DOCUMENT_STATUS.FAILED;
          docRecord.error_code = 'PARSING_ERROR';
          docRecord.error_message = err.message || 'Failed to extract text from document';
          await docRecord.save();
        }

        processedResults.push({
          documentId: docRecord?.id || null,
          originalName: file.originalname,
          status: DOCUMENT_STATUS.FAILED,
          error: err.message || 'Processing failed',
        });
      }
    }

    return processedResults;
  }

  static async getDocumentsBySession(sessionId: number) {
    const session = await AnalysisSession.findByPk(sessionId);
    if (!session) {
      throw new ApiError(statusCode.NOT_FOUND, messages.SESSION_NOT_FOUND);
    }

    const documents = await Document.findAll({
      where: { session_id: sessionId },
      attributes: [
        'id',
        'session_id',
        'original_name',
        'stored_name',
        'mime_type',
        'size_bytes',
        'sha256',
        'status',
        'error_code',
        'error_message',
        'page_count',
        'createdAt',
      ],
      order: [['createdAt', 'ASC']],
    });

    return documents;
  }

  static async getDocumentChunks(documentId: number) {
    const document = await Document.findByPk(documentId);
    if (!document) {
      throw new ApiError(statusCode.NOT_FOUND, messages.DOCUMENT_NOT_FOUND);
    }

    const chunks = await DocumentChunk.findAll({
      where: { document_id: documentId },
      order: [['chunk_index', 'ASC']],
    });

    return {
      document: {
        id: document.id,
        originalName: document.original_name,
        mimeType: document.mime_type,
        pageCount: document.page_count,
        status: document.status,
      },
      chunks,
    };
  }

  static async deleteDocument(documentId: number) {
    const document = await Document.findByPk(documentId);
    if (!document) {
      throw new ApiError(statusCode.NOT_FOUND, messages.DOCUMENT_NOT_FOUND);
    }

    // Delete chunks
    await DocumentChunk.destroy({ where: { document_id: documentId } });

    // Remove file if exists
    const uploadsDir = path.join(__dirname, '../../../uploads');
    const filePath = path.join(uploadsDir, document.stored_name);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Failed to delete file from disk', e);
      }
    }

    await document.destroy();
    return { id: documentId, deleted: true };
  }
}
