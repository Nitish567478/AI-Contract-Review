import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

let genAI = null;

function getClient() {
  if (!genAI && config.geminiApiKey) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
}

export class GeminiService {

  static async reviewChecklist(checklistItems, chunks, fullText) {
    const client = getClient();

    if (client && config.geminiApiKey) {
      try {
        const model = client.getGenerativeModel({
          model: config.geminiChatModel || 'gemini-2.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const prompt = `You are a strict, evidence-grounded legal contract review engine.
Review the provided contract text against the following 8 checklist items:
${JSON.stringify(checklistItems.map(i => ({ key: i.key, name: i.name, description: i.description })), null, 2)}

CONTRACT EXCERPTS / CHUNKS:
${chunks.map(c => `[Chunk ID: ${c._id || c.chunkIndex} | Page: ${c.pageStart || 1} | Section: ${c.section || 'General'}]\n${c.text}`).join('\n---\n')}

MANDATORY RULES:
1. Ground every finding ONLY in the provided contract excerpts.
2. Return status:
   - "found" if explicit evidence is present in the text.
   - "not_found" if the contract text contains NO evidence for the item.
   - "unclear" if the text is ambiguous, contradictory, or incomplete.
3. For "not_found", set summary to "Not found in the contract." and quote to null.
4. For "found", quote MUST BE COPIED EXACTLY, VERBATIM from the text. Never paraphrase inside the quote.
5. Provide the exact page and section from the excerpt metadata.

Return a JSON array of objects with the exact schema:
[
  {
    "itemKey": "parties",
    "status": "found" | "not_found" | "unclear",
    "summary": "1 short plain-English sentence",
    "quote": "Exact word-for-word quote or null",
    "page": 1,
    "section": "Section name or null"
  }
]`;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        logger.warn(`Gemini API review error (${err.message}). Falling back to heuristic grounding engine.`);
      }
    }

    return GeminiService.extractHeuristicFindings(checklistItems, chunks, fullText);
  }

  static extractHeuristicFindings(checklistItems, chunks, fullText) {
    const findings = [];
    const lowerText = fullText.toLowerCase();

    for (const item of checklistItems) {
      let matchedChunk = null;
      let matchedQuote = null;

      for (const chunk of chunks) {
        const cLower = chunk.text.toLowerCase();
        for (const kw of item.keywords) {
          const kwIdx = cLower.indexOf(kw.toLowerCase());
          if (kwIdx !== -1) {
            matchedChunk = chunk;

            const sentStart = Math.max(0, chunk.text.lastIndexOf('.', kwIdx) + 1);
            const sentEnd = chunk.text.indexOf('.', kwIdx + kw.length);
            const quoteCandidate = chunk.text
              .substring(sentStart, sentEnd !== -1 ? sentEnd + 1 : chunk.text.length)
              .trim();

            if (quoteCandidate.length >= 10) {
              matchedQuote = quoteCandidate;
              break;
            }
          }
        }
        if (matchedQuote) break;
      }

      if (matchedQuote && matchedChunk) {
        findings.push({
          itemKey: item.key,
          status: 'found',
          summary: `${item.name} provisions identified in ${matchedChunk.section || 'the contract'}.`,
          quote: matchedQuote,
          page: matchedChunk.pageStart || 1,
          section: matchedChunk.section || null,
        });
      } else {
        findings.push({
          itemKey: item.key,
          status: 'not_found',
          summary: 'Not found in the contract.',
          quote: null,
          page: null,
          section: null,
        });
      }
    }

    return findings;
  }

  static async generateEmbeddings(texts) {
    const client = getClient();
    if (client && config.geminiApiKey) {
      try {
        const model = client.getGenerativeModel({ model: config.geminiEmbeddingModel || 'gemini-embedding-001' });
        const embeddings = [];
        for (const text of texts) {
          const res = await model.embedContent(text.slice(0, 1000));
          embeddings.push(res.embedding.values);
        }
        return embeddings;
      } catch (err) {
        logger.warn(`Gemini embedding API error: ${err.message}. Using local fallback vector.`);
      }
    }

    return texts.map(text => GeminiService.generateLocalEmbedding(text));
  }

  static generateLocalEmbedding(text, dimensions = 128) {
    const vector = new Array(dimensions).fill(0);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dimensions;
      vector[idx] += 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map(v => v / norm);
  }
}
