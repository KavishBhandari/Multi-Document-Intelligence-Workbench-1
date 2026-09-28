

export interface ParsedContent {
  text: string;
  pageCount: number;
  metadata: Record<string, string | number>;
}

export interface DocumentParser {
  parse(filePath: string): Promise<ParsedContent>;
  supports(mimeType: string): boolean;
}
