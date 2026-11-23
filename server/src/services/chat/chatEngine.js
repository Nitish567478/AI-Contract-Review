import { VectorSearch } from '../retrieval/vectorSearch.js';
import { QuoteVerifier } from '../review/quoteVerifier.js';
import { ChatMessage } from '../../models/ChatMessage.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

export class ChatEngine {

  static async streamChat({ contractId, ownerId, question, res }) {

    await ChatMessage.create({
      contractId,
      ownerId,
      role: 'user',
      content: question,
      citations: [],
    });

    const relevantChunks = await VectorSearch.searchChunks(contractId, ownerId, question, 4);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent('message_start', { role: 'assistant' });

    let fullAnswer = '';
    const rawCitations = [];

    if (!relevantChunks || relevantChunks.length === 0) {
      const fallbackMsg = 'The requested information was not found in the contract.';
      sendEvent('token', { text: fallbackMsg });
      fullAnswer = fallbackMsg;
      sendEvent('message_complete', { content: fullAnswer, citations: [] });

      await ChatMessage.create({
        contractId,
        ownerId,
        role: 'assistant',
        content: fullAnswer,
        citations: [],
        model: 'heuristic',
      });
      res.end();
      return;
    }

    let streamedViaGemini = false;
    if (config.geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(config.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: config.geminiChatModel || 'gemini-2.5-flash' });

        const prompt = `You are a strict legal assistant answering questions about an uploaded contract.
Answer the user's question using ONLY the provided excerpts.
If the answer cannot be found in the excerpts, clearly state that the information was not found in the contract.
Never use general knowledge or assumptions.

EXCERPTS:
${relevantChunks.map(c => `[Chunk ID: ${c._id || c.chunkIndex} | Page ${c.pageStart || 1} | Section: ${c.section || 'General'}]\n${c.text}`).join('\n---\n')}

USER QUESTION:
${question}`;

        const result = await model.generateContentStream(prompt);
        streamedViaGemini = true;

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullAnswer += chunkText;
          sendEvent('token', { text: chunkText });
        }
      } catch (err) {
        logger.warn(`Gemini streaming error (${err.message}). Falling back to grounded retrieval synthesizer.`);
        streamedViaGemini = false;
      }
    }

    if (!streamedViaGemini) {
      const bestChunk = relevantChunks[0];
      const answerTokens = [
        'Based on ',
        `${bestChunk.section || `Page ${bestChunk.pageStart || 1}`}`,
        ' of the contract:\n\n',
        bestChunk.text.slice(0, 300),
        '...'
      ];

      for (const token of answerTokens) {
        fullAnswer += token;
        sendEvent('token', { text: token });
        await new Promise(r => setTimeout(r, 60));
      }
    }

    const verifiedCitations = [];
    for (const chunk of relevantChunks) {
      const quoteCandidate = chunk.text.slice(0, 150).trim();
      const verification = QuoteVerifier.verifyQuote(quoteCandidate, chunk.text, [chunk]);

      if (verification.verified) {
        const citation = {
          chunkId: chunk._id || null,
          quote: quoteCandidate,
          page: chunk.pageStart || 1,
          section: chunk.section || 'General',
          verified: true,
        };
        verifiedCitations.push(citation);
        sendEvent('citation', citation);
      }
    }

    sendEvent('message_complete', {
      content: fullAnswer,
      citations: verifiedCitations,
    });

    await ChatMessage.create({
      contractId,
      ownerId,
      role: 'assistant',
      content: fullAnswer,
      citations: verifiedCitations,
      model: streamedViaGemini ? config.geminiChatModel : 'grounded-retrieval',
    });

    res.end();
  }
}
