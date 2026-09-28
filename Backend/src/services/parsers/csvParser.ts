import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { DocumentParser, ParsedContent } from './types';

export class CsvParser implements DocumentParser {
  supports(mimeType: string): boolean {
    return mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel';
  }

  async parse(filePath: string): Promise<ParsedContent> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Parse CSV to get structured data
      const records: string[][] = parse(content, {
        relaxColumnCount: true,
        skipEmptyLines: true,
      });

      if (records.length === 0) {
        return {
          text: '',
          pageCount: 1,
          metadata: { rowCount: 0, columnCount: 0, totalCharacters: 0 },
        };
      }

      // Build a structured text representation preserving tabular format
      const headers = records[0];
      const dataRows = records.slice(1);
      
      let structuredText = `CSV Table with ${headers.length} columns and ${dataRows.length} data rows.\n\n`;
      structuredText += `Headers: ${headers.join(' | ')}\n`;
      structuredText += '-'.repeat(60) + '\n';

      dataRows.forEach((row, index) => {
        const rowData = headers
          .map((header, colIdx) => `${header}: ${row[colIdx] || 'N/A'}`)
          .join(', ');
        structuredText += `Row ${index + 1}: ${rowData}\n`;
      });

      return {
        text: structuredText.trim(),
        pageCount: 1,
        metadata: {
          rowCount: dataRows.length,
          columnCount: headers.length,
          headers: headers.join(', '),
          totalCharacters: structuredText.length,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to parse CSV file: ${error.message}`);
    }
  }
}
