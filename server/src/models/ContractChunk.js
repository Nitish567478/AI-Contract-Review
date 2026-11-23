import mongoose from 'mongoose';

const contractChunkSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    pageStart: { type: Number, default: null },
    pageEnd: { type: Number, default: null },
    section: { type: String, default: null },
    embedding: { type: [Number], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

contractChunkSchema.index({ ownerId: 1, contractId: 1, chunkIndex: 1 });

export const ContractChunk = mongoose.models.ContractChunk || mongoose.model('ContractChunk', contractChunkSchema);
