import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ContractUpload } from '../features/contracts/ContractUpload';
import { ContractList } from '../features/contracts/ContractList';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { api } from '../api/client';

export function DashboardPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContracts = async () => {
    try {
      const token = await getToken();
      const data = await api.listContracts(token);
      setContracts(data.contracts || []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();

    const interval = setInterval(() => {
      setContracts((prev) => {
        const hasProcessing = prev.some((c) => c.status === 'processing');
        if (hasProcessing) {
          fetchContracts();
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = async (file) => {
    const token = await getToken();
    const res = await api.uploadContract(file, token);
    await fetchContracts();
    return res;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      await api.deleteContract(deleteTarget.id, token);
      setContracts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Contract Review Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload commercial agreements to extract evidence-grounded findings against an 8-item legal checklist.
        </p>
      </div>

      <ContractUpload onUploadSuccess={handleUploadSuccess} />

      <ContractList
        contracts={contracts}
        loading={loading}
        onSelect={(contract) => navigate(`/contracts/${contract.id}`)}
        onDelete={(c) => setDeleteTarget(c)}
      />

      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        contractName={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
