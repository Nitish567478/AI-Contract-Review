import { ContractChunk } from '../../models/ContractChunk.js';
import { GeminiService } from '../gemini/geminiClient.js';
import { logger } from '../../utils/logger.js';

export class VectorSearch {
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom ? dot / denom : 0;
  }

  static async searchChunks(contractId, ownerId, queryText, topK = 5) {

    try {
      const [queryEmbedding] = await GeminiService.generateEmbeddings([queryText]);

      if (queryEmbedding && queryEmbedding.length > 0) {
        const pipeline = [
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: queryEmbedding,
              numCandidates: 50,
              limit: topK,
              filter: {
                ownerId: { $eq: ownerId },
                contractId: { $eq: contractId },
              },
            },
          },
        ];

        const results = await ContractChunk.aggregate(pipeline);
        if (results && results.length > 0) {
          return results;
        }
      }
    } catch (err) {

      logger.info(`Using scoped fallback semantic search (${err.message})`);
    }

    const chunks = await ContractChunk.find({ contractId, ownerId }).lean();
    if (!chunks || chunks.length === 0) return [];

    const [queryEmbedding] = await GeminiService.generateEmbeddings([queryText]);
    const queryTerms = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = chunks.map(chunk => {
      let score = 0;
      if (chunk.embedding && chunk.embedding.length > 0 && queryEmbedding) {
        score = VectorSearch.cosineSimilarity(queryEmbedding, chunk.embedding);
      } else {

        const lower = chunk.text.toLowerCase();
        let matches = 0;
        for (const term of queryTerms) {
          if (lower.includes(term)) matches++;
        }
        score = matches / (queryTerms.length || 1);
      }
      return { ...chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}
