import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema(
  {
    itemKey: { type: String, required: true },
    status: {
      type: String,
      enum: ['found', 'not_found', 'unclear'],
      required: true,
    },
    summary: { type: String, required: true },
    quote: { type: String, default: null },
    location: {
      page: { type: Number, default: null },
      section: { type: String, default: null },
      chunkId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    fullClause: { type: String, default: null },
    quoteVerified: { type: Boolean, default: false },
    needsAttention: { type: Boolean, default: false },
  },
  { _id: false }
);

const contractReviewSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    model: { type: String, default: 'gemini-2.5-flash' },
    findings: { type: [findingSchema], default: [] },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

contractReviewSchema.index({ ownerId: 1, contractId: 1, createdAt: -1 });

export const ContractReview = mongoose.models.ContractReview || mongoose.model('ContractReview', contractReviewSchema);
