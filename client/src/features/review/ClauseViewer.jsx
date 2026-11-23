import React from 'react';
import { X, FileText, MapPin, Quote } from 'lucide-react';

export function ClauseViewer({ finding, onClose }) {
  if (!finding) return null;

  const { itemKey, summary, quote, location, fullClause } = finding;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {finding.itemKey?.replace(/_/g, ' ')} — Clause Details
              </h3>
            </div>
            {(location?.page || location?.section) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {location.section ? `${location.section}` : ''}
                  {location.page ? ` (Page ${location.page})` : ''}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4">
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Plain-English Summary
            </h5>
            <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {summary}
            </p>
          </div>

          {quote && (
            <div>
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Quote className="w-3.5 h-3.5 text-emerald-600" />
                Verified Verbatim Quote
              </h5>
              <div className="text-xs text-slate-800 bg-emerald-50/50 border border-emerald-200 p-3 rounded-xl italic font-serif">
                "{quote}"
              </div>
            </div>
          )}

          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Full Clause & Surrounding Extracted Text
            </h5>
            <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
              {fullClause || 'No additional clause context available.'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
