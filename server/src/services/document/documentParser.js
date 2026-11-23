import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { ApiError } from '../../utils/apiError.js';

export class DocumentParser {

  static async parseDocument(filePath, extension) {
    const ext = extension.toLowerCase().replace(/^\./, '');

    try {
      if (ext === 'pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(dataBuffer);

        if (!pdfData.text || pdfData.text.trim().length === 0) {
          throw new ApiError(400, 'EMPTY_DOCUMENT', 'The PDF file contains no extractable text (it may be scanned or empty).');
        }

        const rawPages = pdfData.text.split(/\f|\n\s*--\s*\d+\s*--\s*\n/);
        const pages = rawPages.map((pageText, idx) => ({
          pageNumber: idx + 1,
          text: pageText.trim(),
        })).filter(p => p.text.length > 0);

        return {
          text: pdfData.text,
          pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: pdfData.text }],
          totalPages: pdfData.numpages || pages.length || 1,
        };
      }

      if (ext === 'docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value || '';

        if (!text.trim()) {
          throw new ApiError(400, 'EMPTY_DOCUMENT', 'The DOCX document is empty.');
        }

        return {
          text,
          pages: [{ pageNumber: 1, text }],
          totalPages: 1,
        };
      }

      if (ext === 'txt') {
        const text = await fs.readFile(filePath, 'utf-8');
        if (!text.trim()) {
          throw new ApiError(400, 'EMPTY_DOCUMENT', 'The text document is empty.');
        }

        return {
          text,
          pages: [{ pageNumber: 1, text }],
          totalPages: 1,
        };
      }

      throw new ApiError(400, 'INVALID_FILE_TYPE', `Unsupported file type: .${ext}. Only PDF, DOCX, and TXT are supported.`);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'FILE_PARSE_FAILED', `Failed to parse document: ${error.message}`);
    }
  }
}
