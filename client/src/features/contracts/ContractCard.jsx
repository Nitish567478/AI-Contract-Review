import React from 'react';
import { FileText, ArrowRight, Trash2, Calendar, HardDrive } from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';
import { ProcessingStatus } from './ProcessingStatus';

export function ContractCard({ contract, onSelect, onDelete }) {
  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate" title={contract.name}>
                {contract.name}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  {formatBytes(contract.sizeBytes)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(contract.uploadedAt)}
                </span>
              </div>
            </div>
          </div>

          <ProcessingStatus status={contract.status} error={contract.processingError} />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={() => onDelete(contract)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Delete contract"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelect(contract)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
        >
          <span>Open Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
