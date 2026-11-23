import React from 'react';
import { Quote, MapPin, CheckCircle } from 'lucide-react';

export function CitationReference({ citation }) {
  const { quote, page, section, verified } = citation;

  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-slate-800">
      <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 mb-1">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          {verified ? 'Verified Contract Citation' : 'Citation'}
        </span>
        {(page || section) && (
          <span className="flex items-center gap-1 text-slate-500 font-normal">
            <MapPin className="w-3 h-3" />
            {section ? `${section}` : ''}
            {page ? ` (p. ${page})` : ''}
          </span>
        )}
      </div>
      <p className="italic font-serif text-slate-700">
        "{quote}"
      </p>
    </div>
  );
}
