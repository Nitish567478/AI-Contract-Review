import React, { useState, useRef } from 'react';
import { Upload, FileUp, AlertCircle, Loader2 } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export function ContractUpload({ onUploadSuccess, token }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = ['.pdf', '.docx', '.txt'];
  const maxBytes = 20 * 1024 * 1024;

  const validateFile = (file) => {
    if (!file) return 'Please select a file.';
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return `Unsupported file format. Please upload a PDF, DOCX, or TXT file.`;
    }
    if (file.size > maxBytes) {
      return `File exceeds 20 MB limit (${formatBytes(file.size)}).`;
    }
    return null;
  };

  const handleUpload = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      await onUploadSuccess(file);
    } catch (err) {
      setError(err.message || 'Failed to upload contract.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
          accept=".pdf,.docx,.txt"
          className="hidden"
          disabled={uploading}
        />

        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-800 mb-1">
          {uploading ? 'Uploading & Processing...' : 'Click or drag contract here to upload'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-2">
          Supports <span className="font-semibold text-slate-700">PDF, DOCX, TXT</span> up to 20 MB.
        </p>
        <span className="inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Strict quote verification enabled
        </span>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
