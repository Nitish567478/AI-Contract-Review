import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Quote, MapPin, Eye, AlertTriangle } from 'lucide-react';

const ITEM_NAMES = {
  parties: 'Parties',
  start_date_and_term: 'Start Date and Term',
  payment_terms: 'Payment Terms',
  termination: 'Termination',
  limitation_of_liability: 'Limitation of Liability',
  confidentiality: 'Confidentiality',
  governing_law: 'Governing Law',
  auto_renewal: 'Auto-Renewal',
};

export function FindingCard({ finding, onViewClause }) {
  const { itemKey, status, summary, quote, location, fullClause, quoteVerified, needsAttention } = finding;
  const displayName = ITEM_NAMES[itemKey] || itemKey;

  const renderBadge = () => {
    if (status === 'found') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Found
        </span>
      );
    }
    if (status === 'not_found') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <XCircle className="w-3.5 h-3.5" /> Not Found
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5" /> Unclear
      </span>
    );
  };

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
      needsAttention ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-900">{displayName}</h4>
          {needsAttention && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              <AlertTriangle className="w-3 h-3" /> Attention
            </span>
          )}
        </div>
        {renderBadge()}
      </div>

      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {status === 'not_found' ? (
          <span className="italic text-slate-500 font-medium">Not found in the contract.</span>
        ) : (
          summary
        )}
      </p>

      {quote && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 relative text-xs text-slate-700">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
            <span className="flex items-center gap-1 text-emerald-700">
              <Quote className="w-3 h-3" />
              {quoteVerified ? 'Verified Verbatim Quote' : 'Unverified Quote'}
            </span>
            {(location?.page || location?.section) && (
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3" />
                {location.section ? `${location.section}` : ''}
                {location.page ? ` (Page ${location.page})` : ''}
              </span>
            )}
          </div>
          <p className="italic font-serif leading-relaxed text-slate-800">
            "{quote}"
          </p>
        </div>
      )}

      {fullClause && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onViewClause(finding)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Clause</span>
          </button>
        </div>
      )}
    </div>
  );
}
