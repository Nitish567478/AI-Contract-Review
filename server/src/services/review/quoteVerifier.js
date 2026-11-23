export class QuoteVerifier {

  static normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static verifyQuote(quote, sourceText, chunks = []) {
    if (!quote || typeof quote !== 'string') {
      return { verified: false, reason: 'Empty or missing quote' };
    }

    const trimmedQuote = quote.trim();
    if (trimmedQuote.toLowerCase() === 'not found in the contract' || trimmedQuote.toLowerCase() === 'not found') {
      return { verified: false, reason: 'Item marked not found' };
    }

    const normQuote = QuoteVerifier.normalizeText(trimmedQuote);
    if (!normQuote || normQuote.length < 5) {
      return { verified: false, reason: 'Quote too short for meaningful verification' };
    }

    if (chunks && chunks.length > 0) {
      for (const chunk of chunks) {
        const normChunk = QuoteVerifier.normalizeText(chunk.text || '');
        if (normChunk.includes(normQuote)) {
          return {
            verified: true,
            chunkId: chunk._id || chunk.id || null,
            page: chunk.pageStart ?? null,
            section: chunk.section ?? null,
            fullClause: chunk.text,
          };
        }
      }
    }

    if (sourceText) {
      const normSource = QuoteVerifier.normalizeText(sourceText);
      const idx = normSource.indexOf(normQuote);
      if (idx !== -1) {

        const start = Math.max(0, idx - 150);
        const end = Math.min(normSource.length, idx + normQuote.length + 150);
        const fullClause = normSource.substring(start, end);

        return {
          verified: true,
          chunkId: null,
          page: null,
          section: null,
          fullClause,
        };
      }
    }

    return {
      verified: false,
      reason: 'Quote does not appear verbatim in contract source text',
    };
  }
}
