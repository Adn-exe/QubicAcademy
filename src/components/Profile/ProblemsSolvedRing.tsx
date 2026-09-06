// ============================================================
// QuantumLearn AI — Problems Solved Ring Chart
// Tokens: --void, --panel, --paper, --ink, --signal-cyan, --cryostat-gold, --error, --success
// Solid flat strokes, 0 glow, 0 blur, single-run animation on mount
// ============================================================

import React from 'react';

interface DifficultyStats {
  solved: number;
  total: number;
}

interface ProblemsSolvedRingProps {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
}

export const ProblemsSolvedRing: React.FC<ProblemsSolvedRingProps> = ({
  easy,
  medium,
  hard,
}) => {
  const totalSolved = easy.solved + medium.solved + hard.solved;
  const totalProblems = easy.total + medium.total + hard.total;

  // Geometry for SVG ring
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Fractions
  const easyFraction = totalProblems > 0 ? easy.solved / totalProblems : 0;
  const mediumFraction = totalProblems > 0 ? medium.solved / totalProblems : 0;
  const hardFraction = totalProblems > 0 ? hard.solved / totalProblems : 0;

  // Dash lengths
  const easyLength = easyFraction * circumference;
  const mediumLength = mediumFraction * circumference;
  const hardLength = hardFraction * circumference;

  // Offsets (starting at top = -90deg)
  const easyOffset = 0;
  const mediumOffset = -easyLength;
  const hardOffset = -(easyLength + mediumLength);

  return (
    <div className="bg-[var(--panel)] rounded-[12px] border border-white/10 p-5 sm:p-6 space-y-6 text-[var(--ink)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[var(--signal-cyan)]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h3 className="text-sm font-bold font-heading text-[var(--ink)] tracking-tight">
            Problems solved
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0}% Solved
        </span>
      </div>

      {/* SVG Ring & Center Content */}
      <div className="flex justify-center items-center py-2">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 origin-center"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background Empty Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-white/5 light:text-black/5"
              strokeWidth={strokeWidth}
            />

            {/* Easy Segment: --success (#4E9E7B) */}
            {easyLength > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--success)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${easyLength} ${circumference - easyLength}`}
                strokeDashoffset={easyOffset}
                className="transition-[stroke-dasharray] duration-1000 ease-out motion-reduce:transition-none"
              />
            )}

            {/* Medium Segment: --cryostat-gold (#D9A441) */}
            {mediumLength > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--cryostat-gold)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${mediumLength} ${circumference - mediumLength}`}
                strokeDashoffset={mediumOffset}
                className="transition-[stroke-dasharray] duration-1000 ease-out motion-reduce:transition-none"
              />
            )}

            {/* Hard Segment: --error (#C1543A) */}
            {hardLength > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--error)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${hardLength} ${circumference - hardLength}`}
                strokeDashoffset={hardOffset}
                className="transition-[stroke-dasharray] duration-1000 ease-out motion-reduce:transition-none"
              />
            )}
          </svg>

          {/* Centered Numbers */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-medium font-mono text-[var(--ink)] leading-none">
              {totalSolved}
            </span>
            <div className="w-10 h-[1.5px] bg-[var(--signal-cyan)] my-1.5" />
            <span className="text-xs font-mono text-slate-400">
              {totalProblems}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Columns: Easy / Medium / Hard with thin vertical dividers */}
      <div className="grid grid-cols-3 divide-x divide-white/10 light:divide-black/10 pt-2 border-t border-white/5 light:border-black/5 text-center">
        {/* Easy Column */}
        <div className="px-2 space-y-0.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Easy
          </div>
          <div className="text-sm font-mono font-medium">
            <span style={{ color: 'var(--success)' }}>{easy.solved}</span>
            <span className="text-slate-400">/{easy.total}</span>
          </div>
        </div>

        {/* Medium Column */}
        <div className="px-2 space-y-0.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Medium
          </div>
          <div className="text-sm font-mono font-medium">
            <span style={{ color: 'var(--cryostat-gold)' }}>{medium.solved}</span>
            <span className="text-slate-400">/{medium.total}</span>
          </div>
        </div>

        {/* Hard Column */}
        <div className="px-2 space-y-0.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Hard
          </div>
          <div className="text-sm font-mono font-medium">
            <span style={{ color: 'var(--error)' }}>{hard.solved}</span>
            <span className="text-slate-400">/{hard.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
