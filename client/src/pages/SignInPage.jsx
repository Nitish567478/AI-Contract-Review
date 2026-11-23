import React from 'react';
import { SignIn } from '@clerk/react';
import { ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignInPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      <Link
        to="/"
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8',
              headerTitle: 'text-2xl font-extrabold text-slate-900 tracking-tight',
              headerSubtitle: 'text-xs text-slate-500',
              formButtonPrimary:
                'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all',
              socialButtonsBlockButton:
                'border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl py-2.5 transition-all',
              formFieldInput:
                'text-xs rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-emerald-500',
              footerActionLink:
                'text-emerald-600 hover:text-emerald-700 font-semibold',
            },
          }}
        />
      </div>
    </div>
  );
}
