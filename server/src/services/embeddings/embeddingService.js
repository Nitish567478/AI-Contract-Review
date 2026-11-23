import { GeminiService } from '../gemini/geminiClient.js';
import { logger } from '../../utils/logger.js';

export class EmbeddingService {

  static async embedChunks(chunks, batchSize = 10) {
    if (!chunks || chunks.length === 0) return [];

    logger.info(`Generating embeddings for ${chunks.length} chunks in batches of ${batchSize}`);
    const embeddedChunks = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map(c => c.text);
      const vectors = await GeminiService.generateEmbeddings(texts);

      for (let j = 0; j < batch.length; j++) {
        embeddedChunks.push({
          ...batch[j],
          embedding: vectors[j] || [],
        });
      }
    }

    return embeddedChunks;
  }
}
