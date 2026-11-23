import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from '../models/Contract.js';
import { ContractChunk } from '../models/ContractChunk.js';
import { ContractReview } from '../models/ContractReview.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { ProcessingQueue } from '../jobs/processingQueue.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class ContractController {

  static async upload(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('INVALID_FILE', 'No contract file was uploaded.');
      }

      const file = req.file;
      const ownerId = req.auth.userId;
      const originalName = file.originalname;
      const extension = path.extname(originalName).toLowerCase().replace('.', '');
      const allowedExtensions = ['pdf', 'docx', 'txt'];

      if (!allowedExtensions.includes(extension)) {

        await fs.unlink(file.path).catch(() => {});
        throw ApiError.badRequest('INVALID_FILE_TYPE', `Unsupported file extension .${extension}. Allowed: PDF, DOCX, TXT.`);
      }

      const storageKey = path.basename(file.path);

      const contract = await Contract.create({
        ownerId,
        originalName,
        storageKey,
        mimeType: file.mimetype,
        extension,
        sizeBytes: file.size,
        status: 'processing',
        processingError: null,
        uploadedAt: new Date(),
      });

      ProcessingQueue.processContract({
        contractId: contract._id,
        ownerId,
        filePath: file.path,
        extension,
      }).catch(err => {
        logger.error(`Background processing job failed for ${contract._id}`, err);
      });

      return res.status(202).json({
        contract: {
          id: contract._id.toString(),
          name: contract.originalName,
          sizeBytes: contract.sizeBytes,
          status: contract.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const ownerId = req.auth.userId;
      const contracts = await Contract.find({ ownerId }).sort({ uploadedAt: -1 }).lean();

      return res.status(200).json({
        contracts: contracts.map(c => ({
          id: c._id.toString(),
          name: c.originalName,
          sizeBytes: c.sizeBytes,
          uploadedAt: c.uploadedAt,
          status: c.status,
          processingError: c.processingError,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req, res, next) {
    try {
      const ownerId = req.auth.userId;
      const { contractId } = req.params;

      const contract = await Contract.findOne({ _id: contractId, ownerId }).lean();
      if (!contract) {
        throw ApiError.notFound('Contract not found or access denied.');
      }

      return res.status(200).json({
        contract: {
          id: contract._id.toString(),
          name: contract.originalName,
          sizeBytes: contract.sizeBytes,
          uploadedAt: contract.uploadedAt,
          status: contract.status,
          processingError: contract.processingError,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteOne(req, res, next) {
    try {
      const ownerId = req.auth.userId;
      const { contractId } = req.params;

      const contract = await Contract.findOneAndDelete({ _id: contractId, ownerId });
      if (!contract) {
        throw ApiError.notFound('Contract not found or access denied.');
      }

      await Promise.all([
        ContractChunk.deleteMany({ contractId, ownerId }),
        ContractReview.deleteMany({ contractId, ownerId }),
        ChatMessage.deleteMany({ contractId, ownerId }),
      ]);

      if (contract.storageKey) {
        const filePath = path.join(config.uploadDir, contract.storageKey);
        await fs.unlink(filePath).catch(() => {});
      }

      return res.status(200).json({
        success: true,
        id: contractId,
      });
    } catch (error) {
      next(error);
    }
  }
}
