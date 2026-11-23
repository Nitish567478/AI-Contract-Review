import React, { useState } from 'react';
import { Key, ShieldAlert, ExternalLink, ArrowRight } from 'lucide-react';

export function ClerkSetupPage({ onSaveKey }) {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    if (!cleanKey) {
      setError('Please enter your Clerk Publishable Key.');
      return;
    }
    if (!cleanKey.startsWith('pk_test_') && !cleanKey.startsWith('pk_live_')) {
      setError('Invalid key format. Clerk Publishable Key must start with pk_test_ or pk_live_.');
      return;
    }
    setError('');
    onSaveKey(cleanKey);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Key className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 text-center tracking-tight mb-2">
          Connect Your Clerk Application
        </h2>
        <p className="text-xs text-slate-600 text-center max-w-sm mx-auto mb-6 leading-relaxed">
          To enable live authentication with Email/Password, Google OAuth, and session tokens, provide your Clerk Publishable Key.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-xs text-slate-700 space-y-2">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            <span>How to get your key:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
            <li>
              Go to{' '}
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 font-semibold underline"
              >
                dashboard.clerk.com
              </a>
            </li>
            <li>Select your application & click <strong>API Keys</strong> in the sidebar</li>
            <li>Copy the <strong>Publishable key</strong> (starts with <code>pk_test_...</code>)</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clerk Publishable Key
            </label>
            <input
              type="text"
              required
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="pk_test_..."
              className="w-full font-mono text-xs bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-slate-900 transition-all"
            />
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <span>Activate Clerk Authentication</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-4">
          Alternatively, add <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code> into your <code>.env</code> file.
        </p>
      </div>
    </div>
  );
}
