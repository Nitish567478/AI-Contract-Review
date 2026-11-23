import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export function ProcessingStatus({ status, error }) {
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Processing
      </span>
    );
  }

  if (status === 'reviewed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Reviewed
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span
        title={error || 'Processing failed'}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
      {status || 'Unknown'}
    </span>
  );
}
