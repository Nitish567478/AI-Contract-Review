import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { ClerkSetupPage } from './pages/ClerkSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewPage } from './pages/ReviewPage';

function AppRoutes({ onSignOut }) {
  return (
    <AppLayout onSignOut={onSignOut}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts/:contractId"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const clerkPubKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    localStorage.getItem('cra_clerk_key') ||
    '';

  const handleSaveKey = (key) => {
    localStorage.setItem('cra_clerk_key', key);
    window.location.reload();
  };

  if (!clerkPubKey || (!clerkPubKey.startsWith('pk_test_') && !clerkPubKey.startsWith('pk_live_'))) {
    return (
      <BrowserRouter>
        <AppLayout>
          <ClerkSetupPage onSaveKey={handleSaveKey} />
        </AppLayout>
      </BrowserRouter>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClerkProvider>
  );
}
