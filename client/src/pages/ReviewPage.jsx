import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { ArrowLeft, RefreshCw, AlertCircle, FileText, Calendar, HardDrive } from 'lucide-react';
import { ReviewSummary } from '../features/review/ReviewSummary';
import { FindingCard } from '../features/review/FindingCard';
import { ClauseViewer } from '../features/review/ClauseViewer';
import { ChatPanel } from '../features/chat/ChatPanel';
import { LoadingState } from '../components/LoadingState';
import { ProcessingStatus } from '../features/contracts/ProcessingStatus';
import { formatBytes, formatDate } from '../utils/formatters';
import { api } from '../api/client';

export function ReviewPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [contract, setContract] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [activeTab, setActiveTab] = useState('review');

  const fetchData = async () => {
    if (!contractId) return;
    try {
      const token = await getToken();
      const [contractRes, reviewRes] = await Promise.all([
        api.getContract(contractId, token),
        api.getReview(contractId, token),
      ]);
      setContract(contractRes.contract || null);
      setReview(reviewRes.review || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching contract and review:', err);
      setError(err.message || 'Failed to load contract details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      if (contract?.status === 'processing' || review?.status === 'processing') {
        fetchData();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [contractId, contract?.status, review?.status]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const token = await getToken();
      await api.retryReview(contractId, token);
      await fetchData();
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading contract review & evidence..." />;
  }

  if (error || !contract) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-8 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Contract Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">{error || 'This contract does not exist or access was denied.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const findings = review?.findings || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contracts</span>
        </button>

        <div className="flex items-center gap-3">
          <ProcessingStatus status={contract.status} error={contract.processingError} />
          <div className="flex lg:hidden bg-slate-200 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Checklist
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Chat
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 truncate">
              {contract.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`lg:col-span-7 space-y-4 ${activeTab === 'chat' ? 'hidden lg:block' : 'block'}`}>
          {review?.status === 'processing' ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Review in Progress
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Extracting clauses and verifying quotations against contract text. Results will appear automatically.
              </p>
            </div>
          ) : review?.status === 'failed' ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800">
              <div className="flex items-center gap-2 font-bold mb-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Contract Analysis Encountered an Issue</span>
              </div>
              <p className="text-xs mb-4">{review.errorMessage || 'Unknown processing error.'}</p>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Retry Analysis
              </button>
            </div>
          ) : (
            <>
              <ReviewSummary
                findings={findings}
                onRetry={handleRetry}
                isRetrying={isRetrying}
              />

              <div className="space-y-3">
                {findings.map((finding) => (
                  <FindingCard
                    key={finding.itemKey}
                    finding={finding}
                    onViewClause={(f) => setSelectedFinding(f)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className={`lg:col-span-5 ${activeTab === 'review' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-24">
            <ChatPanel contractId={contractId} />
          </div>
        </div>
      </div>

      <ClauseViewer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
}
