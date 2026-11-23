import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Lock,
  Sparkles,
  Users,
} from 'lucide-react';

export function LandingPage({ onGetStarted, onSignIn, onSignUp }) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (onGetStarted) onGetStarted();
    else navigate('/dashboard');
  };

  const handleSignIn = () => {
    if (onSignIn) onSignIn();
    else navigate('/sign-in');
  };

  const handleSignUp = () => {
    if (onSignUp) onSignUp();
    else navigate('/sign-up');
  };

  const checklistItems = [
    { title: 'Parties', desc: 'Identifies contracting entities and formal legal roles.' },
    { title: 'Start Date & Term', desc: 'Extracts effective dates, duration, and expiration.' },
    { title: 'Payment Terms', desc: 'Detects fees, currency, invoicing cycles, and Net payment windows.' },
    { title: 'Termination', desc: 'Pinpoints notice periods, for-cause and for-convenience rights.' },
    { title: 'Limitation of Liability', desc: 'Finds liability caps, aggregate limits, and damage exclusions.' },
    { title: 'Confidentiality', desc: 'Identifies disclosure obligations and survival durations.' },
    { title: 'Governing Law', desc: 'Extracts applicable jurisdiction and dispute resolution venues.' },
    { title: 'Auto-Renewal', desc: 'Detects automatic extensions and opt-out notice windows.' },
  ];

  return (
    <div className="-mt-8 space-y-16">
      <section className="relative overflow-hidden pt-12 pb-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Deterministic Quote Verification (Rule 6.5)</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          AI Contract Review <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            Grounded Only in Truth.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload commercial agreements in <span className="font-semibold text-slate-800">PDF, DOCX, or TXT</span>.
          Receive an evidence-grounded review against a fixed 8-item checklist with exact verbatim clause quotes and streaming follow-up chat.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleSignUp}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <span>Sign In</span>
          </button>

          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Go to Dashboard</span>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Clerk Authentication
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            No Hallucinated Quotes
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Multi-Tenant Isolation
          </span>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            Grounded Analysis
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            The Fixed 8-Item Review Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Every contract is systematically examined against eight core categories. Missing items are honestly marked{' '}
            <span className="font-semibold text-slate-800">"Not found in the contract."</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                {idx + 1}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Backend Quote Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The backend independently validates that every AI quote exists word-for-word in the contract text before saving or displaying it.
            Unverified quotes are flagged as <span className="font-semibold text-amber-700">unclear</span>.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Streaming Contract Chat</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ask targeted questions about your contract. Responses stream in real-time via Server-Sent Events (SSE) and cite specific verified clauses with section & page numbers.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Multi-Tenant Isolation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Clerk session verification enforces strict tenant scoping. User A can never read, review, chat with, or delete User B's contracts, even by forging API IDs.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          Ready to review contracts with evidence-backed rigor?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-6">
          Sign up with Clerk, drag and drop any agreement, and inspect verified findings in seconds.
        </p>
        <button
          onClick={handleSignUp}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
