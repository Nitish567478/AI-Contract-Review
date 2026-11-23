import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/react';
import { FileText, LogIn, UserPlus, LayoutDashboard, Home, Shield } from 'lucide-react';

export function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  let user = null;
  let isSignedIn = false;

  try {
    const clerk = useUser();
    user = clerk.user;
    isSignedIn = Boolean(clerk.isSignedIn);
  } catch (e) {

    isSignedIn = false;
  }

  const isCurrent = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to={isSignedIn ? '/dashboard' : '/'}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 flex items-center justify-center text-white shadow-sm transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Contract Review <span className="text-emerald-600">AI</span>
              </span>
              <span className="text-[11px] text-slate-500 block">Evidence-Grounded Legal Review</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-1 sm:gap-2 mr-2">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isCurrent('/')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              {isSignedIn && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isCurrent('/dashboard') || location.pathname.startsWith('/contracts')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>

            {isSignedIn && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {user.fullName || user.firstName || user.username || 'My Account'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-9 h-9 border border-emerald-200',
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/sign-in')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => navigate('/sign-up')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        &#169; 2026 Informational document-review tool. Not legal advice. Secured by Clerk.
      </footer>
    </div>
  );
}
