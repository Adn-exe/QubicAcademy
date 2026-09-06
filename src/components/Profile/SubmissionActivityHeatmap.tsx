// ============================================================
// QuantumLearn AI — Submission Activity Heatmap Grid
// Tokens: --void, --panel, --paper, --ink, --signal-cyan, --cryostat-gold, --error, --success
// Solid flat fills, 0 glow, 0 blur, 12 months calendar heatmap
// ============================================================

import React, { useMemo, useState, useRef, useEffect } from 'react';

interface SubmissionActivityHeatmapProps {
  recentActivity: Array<{
    id: string;
    timestamp: string;
    action?: string;
  }>;
  currentStreak: number;
  maxStreak: number;
}

export const SubmissionActivityHeatmap: React.FC<SubmissionActivityHeatmapProps> = ({
  recentActivity,
  currentStreak,
  maxStreak,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    count: number;
    rect: DOMRect;
  } | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timers on scroll or unmount
  useEffect(() => {
    const handleScroll = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setHoveredCell(null);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Map activities by YYYY-MM-DD
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const act of recentActivity) {
      if (act.timestamp) {
        const dateKey = act.timestamp.slice(0, 10);
        map.set(dateKey, (map.get(dateKey) || 0) + 1);
      }
    }
    return map;
  }, [recentActivity]);

  const totalSubmissions = recentActivity.length;

  // Build a 52-week calendar grid ending on current week
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

    // 53 weeks * 7 days
    const totalDays = 52 * 7 + (currentDayOfWeek + 1);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    const weekCols: Array<Array<{ date: Date; dateStr: string; count: number }>> = [];
    const labels: Array<{ text: string; weekIndex: number }> = [];

    let currentWeek: Array<{ date: Date; dateStr: string; count: number }> = [];
    let prevMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dayOfWeek = d.getDay();
      const month = d.getMonth();
      const dateStr = d.toISOString().slice(0, 10);
      const count = activityMap.get(dateStr) || 0;

      // Track month labels when the 1st week of a month occurs
      if (month !== prevMonth && dayOfWeek === 0) {
        labels.push({
          text: d.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weekCols.length,
        });
        prevMonth = month;
      }

      currentWeek.push({ date: d, dateStr, count });

      if (dayOfWeek === 6 || i === totalDays - 1) {
        weekCols.push(currentWeek);
        currentWeek = [];
      }
    }

    return { weeks: weekCols, monthLabels: labels };
  }, [activityMap]);

  // Intensity color scaling:
  // Step 0: 0 -> faint border/transparent
  // Step 1: 1 -> rgba(79, 209, 217, 0.25)
  // Step 2: 2 -> rgba(79, 209, 217, 0.55)
  // Step 3: 3 -> var(--signal-cyan) (#4FD1D9)
  // Step 4: 4+ -> var(--cryostat-gold) (#D9A441)
  const getCellBg = (count: number) => {
    if (count === 0) return 'bg-white/[0.04] border border-white/10 light:bg-black/[0.04] light:border-black/10';
    if (count === 1) return 'bg-[#4FD1D9]/30 border border-[#4FD1D9]/50';
    if (count === 2) return 'bg-[#4FD1D9]/60 border border-[#4FD1D9]/80';
    if (count === 3) return 'bg-[#4FD1D9] border border-[#4FD1D9]';
    return 'bg-[#D9A441] border border-[#D9A441]';
  };

  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleCellMouseEnter = (
    day: { dateStr: string; count: number },
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    // 2 seconds hover delay as requested
    hoverTimerRef.current = setTimeout(() => {
      setHoveredCell({
        dateStr: day.dateStr,
        count: day.count,
        rect,
      });
    }, 2000);
  };

  const handleCellMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredCell(null);
  };

  const tooltipWidth = 190;
  const cellCenterX = hoveredCell ? hoveredCell.rect.left + hoveredCell.rect.width / 2 : 0;
  const safeLeft = typeof window !== 'undefined'
    ? Math.max(tooltipWidth / 2 + 10, Math.min(window.innerWidth - tooltipWidth / 2 - 10, cellCenterX))
    : cellCenterX;
  const caretOffset = cellCenterX - safeLeft;

  return (
    <div className="bg-[var(--panel)] rounded-[12px] border border-white/10 p-5 sm:p-6 space-y-6 text-[var(--ink)] relative">
      {/* Header & Subtitle */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[var(--signal-cyan)] shrink-0">
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-[var(--ink)] tracking-tight">
              Submission activity
            </h3>
            <p className="text-xs text-slate-400">Contribution history</p>
          </div>
        </div>

        {/* 3 Metric Cards across top right */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Total Submissions */}
          <div className="space-y-0.5 text-right sm:text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Total Submissions
            </div>
            <div className="text-lg font-mono font-medium text-[var(--ink)]">
              {totalSubmissions}
            </div>
          </div>

          {/* Current Streak */}
          <div className="space-y-0.5 text-right sm:text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Current Streak
            </div>
            <div
              className={`text-lg font-mono font-medium ${
                currentStreak > 0 ? 'text-[var(--cryostat-gold)]' : 'text-slate-400'
              }`}
            >
              {currentStreak} <span className="text-xs font-normal">days</span>
            </div>
          </div>

          {/* Max Streak */}
          <div className="space-y-0.5 text-right sm:text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Max Streak
            </div>
            <div className="text-lg font-mono font-medium text-[var(--success)]">
              {maxStreak} <span className="text-xs font-normal">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap Grid */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        <div className="min-w-[680px]">
          {/* Month Labels Row */}
          <div className="flex ml-6 text-[10px] font-mono text-slate-400 mb-1.5 h-3.5 relative">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.weekIndex * 13}px` }}
              >
                {m.text}
              </span>
            ))}
          </div>

          {/* Days Grid: 7 rows x weeks cols */}
          <div className="flex gap-1">
            {/* Day of Week Labels (S M T W T F S) */}
            <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-400 w-4.5 pt-0.5 select-none">
              {dayLetters.map((d, i) => (
                <div key={i} className="h-2.5 flex items-center justify-center">
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Week Columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={(e) => handleCellMouseEnter(day, e)}
                      onMouseLeave={handleCellMouseLeave}
                      className={`w-2.5 h-2.5 rounded-[2.5px] cursor-pointer transition-colors ${getCellBg(
                        day.count
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend Bottom Right */}
      <div className="flex items-center justify-end gap-2 pt-1 text-[11px] font-mono text-slate-400">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.04] border border-white/10 light:bg-black/[0.04] light:border-black/10" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4FD1D9]/30 border border-[#4FD1D9]/50" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4FD1D9]/60 border border-[#4FD1D9]/80" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4FD1D9] border border-[#4FD1D9]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#D9A441] border border-[#D9A441]" />
        </div>
        <span>More</span>
      </div>

      {/* Tooltip directly above cell with caret */}
      {hoveredCell && (
        <div
          style={{
            position: 'fixed',
            left: `${safeLeft}px`,
            top: `${hoveredCell.rect.top - 8}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 pointer-events-none px-2.5 py-1.5 rounded-md bg-[#0A0E1A] border border-white/20 text-[11px] font-mono text-white whitespace-nowrap shadow-xl animate-fade-in relative"
        >
          {/* Caret pointing directly down at the cell */}
          <div
            style={{ left: `calc(50% + ${caretOffset}px)` }}
            className="absolute -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0A0E1A] border-r border-b border-white/20"
          />

          {hoveredCell.count === 0
            ? `No submissions on ${new Date(hoveredCell.dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}`
            : `${hoveredCell.count} submission${hoveredCell.count > 1 ? 's' : ''} on ${new Date(
                hoveredCell.dateStr
              ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
        </div>
      )}
    </div>
  );
};
