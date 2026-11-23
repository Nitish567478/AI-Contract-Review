import React from 'react';
import { ContractCard } from './ContractCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export function ContractList({ contracts, loading, onSelect, onDelete }) {
  if (loading && (!contracts || contracts.length === 0)) {
    return <LoadingState message="Loading your contracts..." />;
  }

  if (!contracts || contracts.length === 0) {
    return (
      <EmptyState
        title="No contracts uploaded yet"
        description="Upload an agreement in PDF, DOCX, or TXT format above to receive an evidence-grounded review."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900">
          Your Contracts ({contracts.length})
        </h3>
        <span className="text-xs text-slate-500">
          Click any contract to view checklist review & follow-up chat
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
