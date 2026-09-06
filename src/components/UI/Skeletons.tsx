// ============================================================
// QuantumLearn AI — Skeleton Loading Components
// Shimmering skeleton placeholders matching app design tokens
// ============================================================

import React from 'react';

export const ProblemsSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-4 sm:p-5 rounded-xl bg-[var(--panel)]/70 border border-white/5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-5 h-5 rounded-full bg-white/10 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-16 h-6 rounded bg-white/10" />
            <div className="w-20 h-8 rounded-lg bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Profile Card Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--panel)] border border-white/10 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-white/10 shrink-0" />
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="h-6 bg-white/10 rounded w-48 mx-auto sm:mx-0" />
          <div className="h-4 bg-white/5 rounded w-36 mx-auto sm:mx-0" />
          <div className="h-3 bg-white/5 rounded w-64 mx-auto sm:mx-0" />
        </div>
      </div>

      {/* Grid Stats Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl bg-[var(--panel)] border border-white/5 h-44 space-y-4">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="w-24 h-24 rounded-full border-4 border-white/10 mx-auto" />
          </div>
        ))}
      </div>

      {/* Activity Heatmap Skeleton */}
      <div className="p-6 rounded-2xl bg-[var(--panel)] border border-white/5 space-y-4">
        <div className="h-5 bg-white/10 rounded w-40" />
        <div className="h-28 bg-white/5 rounded-xl w-full" />
      </div>
    </div>
  );
};

export const NavbarAuthSkeleton: React.FC = () => {
  return (
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 animate-pulse shrink-0" />
  );
};
