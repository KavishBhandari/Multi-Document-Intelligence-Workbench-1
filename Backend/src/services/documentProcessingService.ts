import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { library } from '../utils/library';
import { parserRegistry, ParsedContent } from './parsers';
import { MAX_CHUNK_SIZE, DOCUMENT_STATUS, SUPPORTED_MIME_TYPES } from '../utils/contant';

export interface ProcessedDocument {
  documentId: number;
  originalName: string;
  text: string;
  pageCount: number;
  chunks: ChunkData[];
  metadata: Record<string, string | number>;
  sha256: string;
}

export interface ChunkData {
  chunkIndex: number;
  text: string;
  charStart: number;
  charEnd: number;
  pageNumber: number | null;
}

/**
 * Document Processing Service
 * 
 * Handles the full pipeline: file validation -> parsing -> chunking -> storage.
 * Preserves document boundaries and provenance throughout.
 */
export class DocumentProcessingService {
  /**
   * Validates that a file is supported and readable
   */
  static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!SUPPORTED_MIME_TYPES[file.mimetype]) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.mimetype}. Supported types: PDF, TXT, CSV`,
      };
    }

    if (!fs.existsSync(file.path)) {
      return { valid: false, error: 'File not found on server' };
    }

    return { valid: true };
  }

  /**
   * Compute SHA-256 hash for file integrity and deduplication
   */
  static computeFileHash(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Parse a file using the appropriate parser
   */
  static async parseFile(filePath: string, mimeType: string): Promise<ParsedContent> {
    const parser = parserRegistry.getParser(mimeType);
    if (!parser) {
      throw new Error(`No parser available for MIME type: ${mimeType}`);
    }
    return parser.parse(filePath);
  }

  /**
   * Split text into manageable chunks while trying to preserve sentence boundaries.
   * This is important for handling large documents without overwhelming the AI.
   */
  static chunkText(text: string, maxChunkSize: number = MAX_CHUNK_SIZE): ChunkData[] {
    if (!text || text.length === 0) {
      return [];
    }

    if (text.length <= maxChunkSize) {
      return [
        {
          chunkIndex: 0,
          text,
          charStart: 0,
          charEnd: text.length,
          pageNumber: null,
        },
      ];
    }

    const chunks: ChunkData[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
      let end = Math.min(start + maxChunkSize, text.length);

      // Try to break at sentence boundary
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('. ', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);

        if (breakPoint > start + maxChunkSize * 0.5) {
          end = breakPoint + 1;
        }
      }

      chunks.push({
        chunkIndex,
        text: text.slice(start, end).trim(),
        charStart: start,
        charEnd: end,
        pageNumber: null,
      });

      start = end;
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Process a single uploaded file: parse, chunk, and prepare for storage
   */
  static async processFile(
    file: Express.Multer.File,
    documentId: number
  ): Promise<ProcessedDocument> {
    const sha256 = this.computeFileHash(file.path);
    const parsed = await this.parseFile(file.path, file.mimetype);
    const chunks = this.chunkText(parsed.text);

    return {
      documentId,
      originalName: file.originalname,
      text: parsed.text,
      pageCount: parsed.pageCount,
      chunks,
      metadata: parsed.metadata,
      sha256,
    };
  }

  /**
   * Clean up uploaded file from disk
   */
  static async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup file: ${filePath}`, error);
    }
  }
}
