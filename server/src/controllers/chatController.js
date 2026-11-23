import { Contract } from '../models/Contract.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { ChatEngine } from '../services/chat/chatEngine.js';
import { ApiError } from '../utils/apiError.js';

export class ChatController {

  static async getHistory(req, res, next) {
    try {
      const ownerId = req.auth.userId;
      const { contractId } = req.params;

      const contract = await Contract.findOne({ _id: contractId, ownerId }).lean();
      if (!contract) {
        throw ApiError.notFound('Contract not found or access denied.');
      }

      const messages = await ChatMessage.find({ contractId, ownerId }).sort({ createdAt: 1 }).lean();

      return res.status(200).json({
        messages: messages.map(m => ({
          id: m._id.toString(),
          role: m.role,
          content: m.content,
          citations: m.citations || [],
          createdAt: m.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async streamChat(req, res, next) {
    try {
      const ownerId = req.auth.userId;
      const { contractId } = req.params;
      const { question } = req.body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        throw ApiError.badRequest('VALIDATION_ERROR', 'A valid question is required.');
      }

      const contract = await Contract.findOne({ _id: contractId, ownerId }).lean();
      if (!contract) {
        throw ApiError.notFound('Contract not found or access denied.');
      }

      await ChatEngine.streamChat({
        contractId,
        ownerId,
        question: question.trim(),
        res,
      });
    } catch (error) {
      next(error);
    }
  }
}
