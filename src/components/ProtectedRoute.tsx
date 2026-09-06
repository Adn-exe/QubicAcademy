// ============================================================
// QuantumLearn AI — Protected Route Component
// Displays quantum skeleton loaders during session restoration
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { Atom } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // If Supabase is not configured, fallback gracefully so user isn't locked out
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Display rich skeleton loader while checking/restoring Supabase auth session
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="relative flex flex-col items-center max-w-sm w-full">
          {/* Animated Quantum Node Loader */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--panel)] border border-[var(--signal-cyan)]/30 flex items-center justify-center shadow-lg shadow-[var(--signal-cyan)]/10">
              <Atom className="w-8 h-8 text-[var(--signal-cyan)] animate-spin-slow" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-[var(--signal-cyan)]/20 blur-md -z-10 animate-pulse" />
          </div>

          {/* Skeleton lines */}
          <div className="w-48 h-4 rounded-md bg-[var(--panel-border)] animate-pulse mb-3" />
          <div className="w-32 h-3 rounded-md bg-[var(--panel-border)]/60 animate-pulse mb-6" />

          {/* Skeleton card grid preview */}
          <div className="w-full space-y-2.5">
            <div className="w-full h-12 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)]/40 animate-pulse" />
            <div className="w-full h-12 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)]/40 animate-pulse delay-75" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
