import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    originalName: { type: String, required: true },
    storageKey: { type: String, required: true },
    mimeType: { type: String, required: true },
    extension: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    status: {
      type: String,
      enum: ['processing', 'reviewed', 'failed'],
      default: 'processing',
      index: true,
    },
    processingError: { type: String, default: null },
    extractedTextVersion: { type: Number, default: 1 },
    uploadedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

contractSchema.index({ ownerId: 1, uploadedAt: -1 });
contractSchema.index({ _id: 1, ownerId: 1 });

export const Contract = mongoose.models.Contract || mongoose.model('Contract', contractSchema);

