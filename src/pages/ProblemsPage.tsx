// ============================================================
// QuantumLearn AI — Problems & Challenges Page (LeetCode Style)
// Exact Tokens: --void, --panel, --paper, --ink, --signal-cyan, --cryostat-gold, --error, --success
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  X,
  Play,
  Filter,
  ChevronDown,
  Lightbulb,
  Cpu,
  Shuffle,
} from 'lucide-react';
import {
  loadProblems,
  loadProblemsProgress,
  setActiveProblem,
  syncProblemsFromSupabase,
  syncProblemsProgressFromSupabase,
} from '../data/problems/problemsData';
import type {
  QuantumProblem,
  ProblemDifficulty,
  ProblemTopic,
  ProblemStatus,
  ProblemsProgress,
} from '../data/problems/problemsData';
import { useCircuitStore } from '../core/store';

import { ProblemsSkeleton } from '../components/UI/Skeletons';

export function ProblemsPage() {
  const navigate = useNavigate();
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);

  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<QuantumProblem[]>(() => loadProblems());
  const [progress, setProgress] = useState<ProblemsProgress>(() => loadProblemsProgress());
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);
  const [mobileStatsExpanded, setMobileStatsExpanded] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ProblemDifficulty[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ProblemTopic | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus | 'All'>('All');

  // Reload problems on mount & sync with database
  useEffect(() => {
    let mounted = true;
    const refreshData = () => {
      if (mounted) {
        setProblems(loadProblems());
        setProgress(loadProblemsProgress());
      }
    };

    refreshData();
    Promise.all([syncProblemsFromSupabase(), syncProblemsProgressFromSupabase()]).finally(() => {
      if (mounted) {
        refreshData();
        setLoading(false);
      }
    });

    window.addEventListener('quantumlearn:problems_changed', refreshData);
    return () => {
      mounted = false;
      window.removeEventListener('quantumlearn:problems_changed', refreshData);
    };
  }, []);

  // Stats Calculations
  const stats = useMemo(() => {
    const easyTotal = problems.filter((p) => p.difficulty === 'Easy').length;
    const easySolved = problems.filter((p) => p.difficulty === 'Easy' && p.status === 'Solved').length;

    const mediumTotal = problems.filter((p) => p.difficulty === 'Medium').length;
    const mediumSolved = problems.filter((p) => p.difficulty === 'Medium' && p.status === 'Solved').length;

    const hardTotal = problems.filter((p) => p.difficulty === 'Hard').length;
    const hardSolved = problems.filter((p) => p.difficulty === 'Hard' && p.status === 'Solved').length;

    const totalSolved = easySolved + mediumSolved + hardSolved;
    const totalProblems = problems.length;

    return {
      easy: { solved: easySolved, total: easyTotal, pct: easyTotal ? (easySolved / easyTotal) * 100 : 0 },
      medium: { solved: mediumSolved, total: mediumTotal, pct: mediumTotal ? (mediumSolved / mediumTotal) * 100 : 0 },
      hard: { solved: hardSolved, total: hardTotal, pct: hardTotal ? (hardSolved / hardTotal) * 100 : 0 },
      totalSolved,
      totalProblems,
    };
  }, [problems]);

  // Filtered List
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesObj = (p.objective || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesObj) return false;
      }

      // Difficulty (multi-select)
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(p.difficulty)) {
        return false;
      }

      // Topic
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) {
        return false;
      }

      // Status
      if (selectedStatus !== 'All' && p.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [problems, searchQuery, selectedDifficulties, selectedTopic, selectedStatus]);

  // Toggle Difficulty Filter
  const toggleDifficulty = (d: ProblemDifficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulties([]);
    setSelectedTopic('All');
    setSelectedStatus('All');
  };

  // Launch problem in Workspace with Active Problem Banner
  const handleLaunchProblem = (problem: QuantumProblem) => {
    // Set as active problem and load initial circuit into store
    setActiveProblem(problem);
    loadCircuit(problem.initialCircuit);
    navigate('/lab');
  };

  // Random problem launcher
  const handlePickRandomProblem = () => {
    const pool = filteredProblems.length > 0 ? filteredProblems : problems;
    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    handleLaunchProblem(pool[randomIndex]);
  };

  // Format relative timestamp
  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 60) return `${Math.max(1, mins)}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'recently';
    }
  };

  const topics: ProblemTopic[] = ['Superposition', 'Entanglement', 'Measurement', 'Teleportation', 'Algorithms'];

  return (
    <div className="flex-1 bg-[var(--void)] text-[var(--ink)] py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08] light:border-black/10">
          <div>
            <h1 className="text-2xl font-heading font-extrabold tracking-tight text-[var(--ink)]">
              Quantum Problems
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Curated quantum algorithmic exercises, state synthesis challenges, and circuit verifications across all difficulties.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePickRandomProblem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[var(--cryostat-gold)] bg-[var(--cryostat-gold)]/10 border border-[var(--cryostat-gold)]/30 hover:bg-[var(--cryostat-gold)]/20 transition-all cursor-pointer shadow-xs"
              title="Pick a random problem to solve"
            >
              <Shuffle size={13} />
              <span>Random Problem</span>
            </button>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Solved:{' '}
              <strong className="text-[var(--cryostat-gold)] font-bold">
                {stats.totalSolved} / {stats.totalProblems}
              </strong>
            </span>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* ======================================================== */}
          {/* LEFT COLUMN: ~280px Your Progress Sidebar Card */}
          {/* ======================================================== */}
          <aside className="w-full lg:w-[280px] shrink-0 bg-[var(--panel)] border border-white/10 light:border-black/10 rounded-2xl p-4 sm:p-5 space-y-4 lg:space-y-6">
            <div
              onClick={() => setMobileStatsExpanded((prev) => !prev)}
              className="flex items-center justify-between cursor-pointer lg:cursor-default select-none"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-[var(--ink)]">
                  Your progress
                </h2>
                <span className="text-xs font-mono font-bold text-[var(--cryostat-gold)] px-2 py-0.5 rounded bg-[var(--cryostat-gold)]/10 border border-[var(--cryostat-gold)]/30">
                  {stats.totalSolved} / {stats.totalProblems}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {Math.round((stats.totalSolved / Math.max(1, stats.totalProblems)) * 100)}%
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 lg:hidden ${
                    mobileStatsExpanded ? 'rotate-180 text-[var(--signal-cyan)]' : ''
                  }`}
                />
              </div>
            </div>

            {/* Sidebar body: always open on desktop lg:, expandable on mobile */}
            <div className={`${mobileStatsExpanded ? 'block' : 'hidden lg:block'} space-y-5 lg:space-y-6 animate-fade-in`}>
              <div>
                {/* LeetCode-style Horizontal Bars */}
              <div className="mt-4 space-y-3.5">
                {/* Easy Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--success)] font-medium">Easy</span>
                    <span className="text-slate-400">
                      <strong className="text-[var(--ink)] font-bold">{stats.easy.solved}</strong> / {stats.easy.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--void)] overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-[var(--success)] transition-all duration-500"
                      style={{ width: `${stats.easy.pct}%` }}
                    />
                  </div>
                </div>

                {/* Medium Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--cryostat-gold)] font-medium">Medium</span>
                    <span className="text-slate-400">
                      <strong className="text-[var(--ink)] font-bold">{stats.medium.solved}</strong> / {stats.medium.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--void)] overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-[var(--cryostat-gold)] transition-all duration-500"
                      style={{ width: `${stats.medium.pct}%` }}
                    />
                  </div>
                </div>

                {/* Hard Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--error)] font-medium">Hard</span>
                    <span className="text-slate-400">
                      <strong className="text-[var(--ink)] font-bold">{stats.hard.solved}</strong> / {stats.hard.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--void)] overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-[var(--error)] transition-all duration-500"
                      style={{ width: `${stats.hard.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Stats Rows */}
            <div className="pt-4 border-t border-white/[0.08] light:border-black/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Flame size={14} className="text-[var(--cryostat-gold)] stroke-[1.75]" />
                  <span>Current streak</span>
                </span>
                <span className="font-mono font-bold text-[var(--ink)]">
                  {progress.currentStreak} days
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Flame size={14} className="text-slate-500 stroke-[1.75]" />
                  <span>Max streak</span>
                </span>
                <span className="font-mono font-bold text-slate-300 light:text-slate-700">
                  {progress.maxStreak} days
                </span>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="pt-4 border-t border-white/[0.08] light:border-black/10">
              <div className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 mb-3">
                Recent activity
              </div>
              {progress.recentActivity && progress.recentActivity.length > 0 ? (
                <div className="divide-y divide-white/[0.06] light:divide-black/[0.08]">
                  {progress.recentActivity.slice(0, 6).map((act) => (
                    <div key={act.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[var(--ink)] line-clamp-1">
                          {act.problemTitle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span
                          className={
                            act.action === 'solved'
                              ? 'text-[var(--success)] font-medium'
                              : 'text-[var(--cryostat-gold)] font-medium'
                          }
                        >
                          {act.action === 'solved' ? 'Solved' : 'Attempted'}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock size={10} />
                          {formatRelativeTime(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-500 font-mono">No recent activity yet</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Solve a problem to track progress!</p>
                </div>
              )}
            </div>
          </div>
        </aside>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Main Content (Search, Filters, Problems) */}
          {/* ======================================================== */}
          <section className="flex-1 min-w-0 space-y-4 w-full">
            {/* Search Bar */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quantum problems..."
                className="w-full bg-[var(--panel)] border border-white/10 light:border-black/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--ink)] placeholder-slate-500 focus:outline-none focus:border-[var(--signal-cyan)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--ink)] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Row Beneath Search (Smooth Horizontal Chip Scroll on Mobile) */}
            <div className="bg-[var(--panel)] border border-white/10 light:border-black/10 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 text-xs overflow-x-auto no-scrollbar touch-pan-x">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono shrink-0">
                <Filter size={13} />
                <span className="hidden xs:inline">Filters:</span>
              </div>

              {/* Difficulty Multi-select buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {(['Easy', 'Medium', 'Hard'] as ProblemDifficulty[]).map((diff) => {
                  const isSelected = selectedDifficulties.includes(diff);
                  const colorClass =
                    diff === 'Easy'
                      ? isSelected
                        ? 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)] font-semibold'
                        : 'text-slate-400 border-white/10 hover:border-white/20'
                      : diff === 'Medium'
                      ? isSelected
                        ? 'bg-[var(--cryostat-gold)]/20 text-[var(--cryostat-gold)] border-[var(--cryostat-gold)] font-semibold'
                        : 'text-slate-400 border-white/10 hover:border-white/20'
                      : isSelected
                      ? 'bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)] font-semibold'
                      : 'text-slate-400 border-white/10 hover:border-white/20';

                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => toggleDifficulty(diff)}
                      className={`px-2.5 py-1 rounded-md border text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${colorClass}`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>

              <div className="w-[1px] h-4 bg-white/10 shrink-0" />

              {/* Topic dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-slate-500">Topic:</span>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value as ProblemTopic | 'All')}
                  aria-label="Filter by Topic"
                  className="bg-[var(--void)] border border-white/10 light:border-black/10 text-slate-300 light:text-slate-800 text-[11px] font-mono rounded-md px-2 py-1 focus:outline-none focus:border-[var(--signal-cyan)]"
                >
                  <option value="All">All Topics</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-[1px] h-4 bg-white/10 shrink-0" />

              {/* Status filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-slate-500">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ProblemStatus | 'All')}
                  aria-label="Filter by Status"
                  className="bg-[var(--void)] border border-white/10 light:border-black/10 text-slate-300 light:text-slate-800 text-[11px] font-mono rounded-md px-2 py-1 focus:outline-none focus:border-[var(--signal-cyan)]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Solved">Solved</option>
                  <option value="Attempted">Attempted</option>
                  <option value="Unsolved">Unsolved</option>
                </select>
              </div>

              {/* Clear filters shortcut */}
              {(selectedDifficulties.length > 0 ||
                selectedTopic !== 'All' ||
                selectedStatus !== 'All' ||
                searchQuery.trim() !== '') && (
                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-[11px] font-mono text-[var(--cryostat-gold)] hover:underline cursor-pointer shrink-0 whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Dense Scannable List of Problems (Bordered rows, LeetCode-style) */}
            <div className="bg-[var(--panel)] border border-white/10 light:border-black/10 rounded-2xl overflow-hidden shadow-xs">
              {/* Header Row */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 bg-[var(--void)]/60 border-b border-white/10 light:border-black/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <div className="col-span-1 flex items-center justify-center">Status</div>
                <div className="col-span-6 sm:col-span-6 flex items-center gap-1">Title & Objective</div>
                <div className="col-span-3 sm:col-span-3">Topic</div>
                <div className="col-span-2 sm:col-span-2 text-right">Difficulty</div>
              </div>

              {/* Skeleton loading or Rows or Empty state */}
              {loading ? (
                <div className="p-4">
                  <ProblemsSkeleton />
                </div>
              ) : filteredProblems.length > 0 ? (
                <div className="divide-y divide-white/[0.06] light:divide-black/[0.06]">
                  {filteredProblems.map((problem) => {
                    const isSolved = problem.status === 'Solved';
                    const isAttempted = problem.status === 'Attempted';
                    const isExpanded = expandedProblemId === problem.id;

                    return (
                      <div key={problem.id} className="transition-colors">
                        {/* Desktop Problem Row Strip (sm and up) */}
                        <div
                          onClick={() => setExpandedProblemId(isExpanded ? null : problem.id)}
                          className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3.5 items-center hover:bg-white/[0.03] light:hover:bg-black/[0.03] transition-colors cursor-pointer group"
                        >
                          {/* Status Icon */}
                          <div className="col-span-1 flex items-center justify-center">
                            {isSolved ? (
                              <CheckCircle2 size={16} className="text-[var(--success)]" />
                            ) : isAttempted ? (
                              <Circle size={14} className="text-[var(--cryostat-gold)] fill-[var(--cryostat-gold)]/20" />
                            ) : (
                              <Circle size={14} className="text-slate-600" />
                            )}
                          </div>

                          {/* Problem Title & Objective snippet */}
                          <div className="col-span-6 sm:col-span-6 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--signal-cyan)] transition-colors">
                                {problem.title}
                              </span>
                              <ChevronDown
                                size={13}
                                className={`text-slate-500 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-[var(--signal-cyan)]' : ''
                                }`}
                              />
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {problem.objective || problem.description}
                            </p>
                          </div>

                          {/* Topic Tag */}
                          <div className="col-span-3 sm:col-span-3">
                            <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] light:bg-black/5 text-slate-300 light:text-slate-700 border border-white/10 light:border-black/10">
                              {problem.topic}
                            </span>
                          </div>

                          {/* Difficulty Tag + Action Button */}
                          <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-2">
                            <span
                              className={`text-[11px] font-mono font-medium ${
                                problem.difficulty === 'Easy'
                                  ? 'text-[var(--success)]'
                                  : problem.difficulty === 'Medium'
                                  ? 'text-[var(--cryostat-gold)]'
                                  : 'text-[var(--error)]'
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchProblem(problem);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-[var(--signal-cyan)] hover:bg-white/[0.05] transition-all cursor-pointer"
                              title="Solve problem directly in Circuit Builder"
                            >
                              <Play size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Problem Row Card (< sm) */}
                        <div
                          onClick={() => setExpandedProblemId(isExpanded ? null : problem.id)}
                          className="sm:hidden flex flex-col gap-2 p-3.5 hover:bg-white/[0.03] light:hover:bg-black/[0.03] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="shrink-0">
                                {isSolved ? (
                                  <CheckCircle2 size={15} className="text-[var(--success)]" />
                                ) : isAttempted ? (
                                  <Circle size={13} className="text-[var(--cryostat-gold)] fill-[var(--cryostat-gold)]/20" />
                                ) : (
                                  <Circle size={13} className="text-slate-600" />
                                )}
                              </div>
                              <span className="text-xs font-semibold text-[var(--ink)] truncate">
                                {problem.title}
                              </span>
                              <ChevronDown
                                size={13}
                                className={`text-slate-500 shrink-0 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-[var(--signal-cyan)]' : ''
                                }`}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-mono font-medium shrink-0 px-2 py-0.5 rounded border ${
                                problem.difficulty === 'Easy'
                                  ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30'
                                  : problem.difficulty === 'Medium'
                                  ? 'bg-[var(--cryostat-gold)]/10 text-[var(--cryostat-gold)] border-[var(--cryostat-gold)]/30'
                                  : 'bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/30'
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 pl-6">
                            {problem.objective || problem.description}
                          </p>

                          <div className="flex items-center justify-between pl-6 pt-1">
                            <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] light:bg-black/5 text-slate-300 light:text-slate-700 border border-white/10 light:border-black/10">
                              {problem.topic}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchProblem(problem);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-[var(--cryostat-gold)] bg-[var(--cryostat-gold)]/10 hover:bg-[var(--cryostat-gold)]/20 border border-[var(--cryostat-gold)]/30 transition-all cursor-pointer"
                            >
                              <Play size={11} fill="currentColor" />
                              <span>Solve</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Problem Details Drawer */}
                        {isExpanded && (
                          <div className="px-6 py-4 bg-[var(--void)]/50 border-t border-b border-white/[0.08] light:border-black/10 space-y-3 animate-fade-in">
                            <div className="space-y-1">
                              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--cryostat-gold)]">
                                Problem Description & Objective
                              </h3>
                              <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                                {problem.description}
                              </p>
                              <p className="text-xs font-medium text-[var(--signal-cyan)]">
                                <strong>Goal:</strong> {problem.objective}
                              </p>
                            </div>

                            {problem.expectedDescription && (
                              <div className="text-xs font-mono text-slate-400 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                                <span className="text-slate-500">Expected Outcome:</span> {problem.expectedDescription}
                              </div>
                            )}

                            {problem.hints && problem.hints.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                                  <Lightbulb size={12} className="text-[var(--cryostat-gold)]" />
                                  <span>Hints:</span>
                                </div>
                                <ul className="list-disc pl-4 text-xs text-slate-400 space-y-0.5">
                                  {problem.hints.map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="pt-2 flex items-center justify-between gap-3">
                              <div className="text-[11px] font-mono text-slate-500">
                                Starter Circuit: {problem.initialCircuit.numQubits} Qubit(s), {problem.initialCircuit.steps.length} Step(s)
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleLaunchProblem(problem)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-[var(--cryostat-gold)] text-[var(--void)] hover:opacity-90 shadow-sm transition-all cursor-pointer"
                                >
                                  <Cpu size={13} />
                                  <span>Solve in Circuit Builder</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                    <Search size={22} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--ink)]">No Quantum Problems Match Your Filter</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try adjusting your search query, topic, or difficulty filters to discover available challenges.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[var(--signal-cyan)] font-mono font-semibold transition-all cursor-pointer"
                  >
                    <X size={14} />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Note */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
              <span>Showing {filteredProblems.length} of {problems.length} problems</span>
              <span>Click any problem row to review objectives and launch directly into Circuit Studio</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
