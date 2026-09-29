import { DocumentParser, ParsedContent } from './types';
import { PdfParser } from './pdfParser';
import { TextParser } from './textParser';
import { CsvParser } from './csvParser';


class ParserRegistry {
  private parsers: DocumentParser[];

  constructor() {
    this.parsers = [
      new PdfParser(),
      new TextParser(),
      new CsvParser(),
    ];
  }

  getParser(mimeType: string): DocumentParser | null {
    return this.parsers.find((p) => p.supports(mimeType)) || null;
  }

  getSupportedTypes(): string[] {
    return ['application/pdf', 'text/plain', 'text/csv'];
  }
}

export const parserRegistry = new ParserRegistry();
export { ParsedContent, DocumentParser };
