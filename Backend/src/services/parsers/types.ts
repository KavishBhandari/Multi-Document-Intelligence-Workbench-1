/**
 * Document Processing Pipeline
 * 
 * Modular parser system that extracts text content from different document formats.
 * Each parser returns structured content preserving document boundaries and metadata.
 */

export interface ParsedContent {
  text: string;
  pageCount: number;
  metadata: Record<string, string | number>;
}

export interface DocumentParser {
  parse(filePath: string): Promise<ParsedContent>;
  supports(mimeType: string): boolean;
}
