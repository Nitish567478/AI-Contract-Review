import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function ReviewSummary({ findings, onRetry, isRetrying }) {
  const foundCount = findings.filter(f => f.status === 'found').length;
  const notFoundCount = findings.filter(f => f.status === 'not_found').length;
  const unclearCount = findings.filter(f => f.status === 'unclear').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">8-Item Contract Review Checklist</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every finding is verified against verbatim contract text with exact section and page grounding.
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Re-analyzing...' : 'Re-run Review'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Found</span>
          </div>
          <span className="text-xl font-extrabold text-emerald-800">{foundCount}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Found</span>
          </div>
          <span className="text-xl font-extrabold text-slate-800">{notFoundCount}</span>
        </div>

        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-700 text-xs font-semibold mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unclear</span>
          </div>
          <span className="text-xl font-extrabold text-amber-800">{unclearCount}</span>
        </div>
      </div>
    </div>
  );
}
