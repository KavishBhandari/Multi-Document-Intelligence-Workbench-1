import fs from 'fs';
import { DocumentParser, ParsedContent } from './types';

export class TextParser implements DocumentParser {
  supports(mimeType: string): boolean {
    return mimeType === 'text/plain';
  }

  async parse(filePath: string): Promise<ParsedContent> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      const pageCount = Math.max(1, Math.ceil(content.length / 3000));

      return {
        text: content.trim(),
        pageCount,
        metadata: {
          encoding: 'utf-8',
          lineCount: content.split('\n').length,
          totalCharacters: content.length,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to parse text file: ${error.message}`);
    }
  }
}
