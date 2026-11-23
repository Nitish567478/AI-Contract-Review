import { DocumentParser } from '../services/document/documentParser.js';
import { Chunker } from '../services/document/chunker.js';
import { EmbeddingService } from '../services/embeddings/embeddingService.js';
import { ReviewEngine } from '../services/review/reviewEngine.js';
import { Contract } from '../models/Contract.js';
import { ContractChunk } from '../models/ContractChunk.js';
import { ContractReview } from '../models/ContractReview.js';
import { logger } from '../utils/logger.js';
import path from 'path';

export class ProcessingQueue {

  static async processContract({ contractId, ownerId, filePath, extension }) {
    logger.info(`Starting asynchronous processing for contract ${contractId} (owner: ${ownerId})`);

    try {

      const parsedDoc = await DocumentParser.parseDocument(filePath, extension);

      const rawChunks = Chunker.chunkDocument(parsedDoc, contractId, ownerId);

      const embeddedChunks = await EmbeddingService.embedChunks(rawChunks);

      await ContractChunk.deleteMany({ contractId, ownerId });
      const insertedChunks = await ContractChunk.insertMany(embeddedChunks);

      const findings = await ReviewEngine.analyzeContract(
        contractId,
        ownerId,
        insertedChunks,
        parsedDoc.text
      );

      await ContractReview.findOneAndUpdate(
        { contractId, ownerId },
        {
          contractId,
          ownerId,
          status: 'completed',
          findings,
          errorMessage: null,
        },
        { upsert: true, new: true }
      );

      await Contract.findOneAndUpdate(
        { _id: contractId, ownerId },
        {
          status: 'reviewed',
          processedAt: new Date(),
          processingError: null,
        }
      );

      logger.info(`Successfully reviewed contract ${contractId}`);
    } catch (error) {
      logger.error(`Processing failed for contract ${contractId}`, error);

      await Contract.findOneAndUpdate(
        { _id: contractId, ownerId },
        {
          status: 'failed',
          processingError: error.message || 'Processing failed.',
        }
      );

      await ContractReview.findOneAndUpdate(
        { contractId, ownerId },
        {
          status: 'failed',
          errorMessage: error.message || 'Processing failed.',
        },
        { upsert: true }
      );
    }
  }
}
