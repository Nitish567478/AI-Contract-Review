import { Contract } from '../models/Contract.js';
import { ContractReview } from '../models/ContractReview.js';
import { ProcessingQueue } from '../jobs/processingQueue.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/index.js';
import path from 'path';

export class ReviewController {

  static async getReview(req, res, next) {
    try {
      const ownerId = req.auth.userId;
      const { contractId } = req.params;

      const contract = await Contract.findOne({ _id: contractId, ownerId }).lean();
      if (!contract) {
        throw ApiError.notFound('Contract not found or access denied.');
      }

      const review = await ContractReview.findOne({ contractId, ownerId }).lean();

      return res.status(200).json({
        review: review
          ? {
              id: review._id.toString(),
              status: review.status,
              findings: review.findings || [],
              errorMessage: review.errorMessage,
              createdAt: review.createdAt,
            }
          : {
              status: contract.status === 'processing' ? 'processing' : 'pending',
              findings: [],
            },
      });
    } catch (error) {
      next(error);
    }
  }

  static async retryReview(req, res, next) {
    try {
      const ownerId = req.auth.userId;
      const { contractId } = req.params;

      const contract = await Contract.findOne({ _id: contractId, ownerId });
      if (!contract) {
        throw ApiError.notFound('Contract not found or access denied.');
      }

      const filePath = path.join(config.uploadDir, contract.storageKey);

      contract.status = 'processing';
      contract.processingError = null;
      await contract.save();

      ProcessingQueue.processContract({
        contractId: contract._id,
        ownerId,
        filePath,
        extension: contract.extension,
      }).catch(() => {});

      return res.status(202).json({
        message: 'Review restarted successfully.',
        status: 'processing',
      });
    } catch (error) {
      next(error);
    }
  }
}
