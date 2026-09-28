import fs from 'fs';
const pdfModule = require('pdf-parse');
import { DocumentParser, ParsedContent } from './types';

export class PdfParser implements DocumentParser {
  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  async parse(filePath: string): Promise<ParsedContent> {
    const buffer = fs.readFileSync(filePath);

    try {
      // Support pdf-parse 2.x class structure
      if (pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const result = await parser.getText();
        const text = typeof result === 'string' ? result : result.text || '';
        const pageCount = (result && (result.total || result.pages?.length)) || 1;

        return {
          text: text.trim(),
          pageCount,
          metadata: {
            engine: 'pdf-parse-v2',
            totalCharacters: text.length,
          },
        };
      }

      // Fallback for pdf-parse 1.x function signature
      const parseFn = typeof pdfModule === 'function' ? pdfModule : pdfModule.default || pdfModule;
      const data = await parseFn(buffer);

      return {
        text: (data.text || '').trim(),
        pageCount: data.numpages || 1,
        metadata: {
          pdfVersion: data.version || 'unknown',
          title: data.info?.Title || '',
          author: data.info?.Author || '',
          totalCharacters: (data.text || '').length,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }
}
