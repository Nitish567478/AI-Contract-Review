import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    chunkId: { type: mongoose.Schema.Types.ObjectId, default: null },
    quote: { type: String, required: true },
    page: { type: Number, default: null },
    section: { type: String, default: null },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    citations: { type: [citationSchema], default: [] },
    model: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ ownerId: 1, contractId: 1, createdAt: 1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
