// ============================================================
// QuantumLearn AI — User Profile & Analytics Dashboard
// Single scrollable page, max-w-[960px], centered.
// Tokens: --void (#0A0E1A), --panel (#12172A), --signal-cyan (#4FD1D9), --cryostat-gold (#D9A441), --error (#C1543A)
// Single localStorage JSON blob under key "quantumlearn:profile"
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit2,
  BookOpen,
  Cpu,
  Trophy,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useProfileStore } from '../core/profileStore';
import { useCircuitStore } from '../core/store';
import type { QuantumCircuit } from '../core/types';
import { EditProfileModal } from '../components/Profile/EditProfileModal';
import { ProblemsSolvedRing } from '../components/Profile/ProblemsSolvedRing';
import { SubmissionActivityHeatmap } from '../components/Profile/SubmissionActivityHeatmap';
import {
  loadProblems,
  loadProblemsProgress,
  syncProblemsFromSupabase,
  syncProblemsProgressFromSupabase,
} from '../data/problems/problemsData';
import type { QuantumProblem, ProblemsProgress } from '../data/problems/problemsData';

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFormatted(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Inline SVG renderer for circuit thumbnails
function CircuitThumbnail({ circuit }: { circuit: QuantumCircuit }) {
  const numQubits = Math.max(1, Math.min(4, circuit.numQubits || 2));
  const steps = (circuit.steps || []).slice(0, 6);

  return (
    <div className="w-full h-24 bg-[var(--void)] rounded-lg border border-white/5 light:border-black/10 p-2 flex flex-col justify-center overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet">
        {/* Qubit wire lines */}
        {Array.from({ length: numQubits }).map((_, qIdx) => {
          const y = 20 + qIdx * (40 / Math.max(1, numQubits - 1 || 1));
          return (
            <g key={qIdx}>
              <line x1="10" y1={y} x2="190" y2={y} stroke="#4FD1D9" strokeWidth="1" strokeOpacity="0.3" />
              <text x="2" y={y + 3} fill="#4FD1D9" fontSize="8" fontFamily="monospace">
                q{qIdx}
              </text>
            </g>
          );
        })}

        {/* Gate blocks */}
        {steps.map((step, sIdx) => {
          const x = 30 + sIdx * 26;
          return (step.gates || []).map((gate) => {
            const qIdx = Math.min(numQubits - 1, gate.qubit);
            const y = 20 + qIdx * (40 / Math.max(1, numQubits - 1 || 1));

            if (gate.type === 'CNOT' && gate.control !== undefined) {
              const ctrlY = 20 + gate.control * (40 / Math.max(1, numQubits - 1 || 1));
              return (
                <g key={gate.id}>
                  <line x1={x + 10} y1={ctrlY} x2={x + 10} y2={y} stroke="#D9A441" strokeWidth="1.5" />
                  <circle cx={x + 10} cy={ctrlY} r="3" fill="#D9A441" />
                  <circle cx={x + 10} cy={y} r="7" fill="var(--panel)" stroke="#D9A441" strokeWidth="1.5" />
                  <line x1={x + 5} y1={y} x2={x + 15} y2={y} stroke="#D9A441" strokeWidth="1.5" />
                  <line x1={x + 10} y1={y - 5} x2={x + 10} y2={y + 5} stroke="#D9A441" strokeWidth="1.5" />
                </g>
              );
            }

            const color = gate.type === 'H' ? '#D9A441' : '#4FD1D9';
            return (
              <g key={gate.id}>
                <rect
                  x={x + 2}
                  y={y - 8}
                  width="16"
                  height="16"
                  rx="3"
                  fill="var(--panel)"
                  stroke={color}
                  strokeWidth="1.2"
                />
                <text
                  x={x + 10}
                  y={y + 3}
                  fill={color}
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {gate.type === 'MEASURE' ? 'M' : gate.type}
                </text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}

import { ProfileSkeleton } from '../components/UI/Skeletons';

export function ProfilePage() {
  const navigate = useNavigate();
  const data = useProfileStore((s) => s.data);
  const updateSettings = useProfileStore((s) => s.updateSettings);
  const deleteCircuit = useProfileStore((s) => s.deleteCircuit);
  const resetProgress = useProfileStore((s) => s.resetProgress);

  const loadCircuitInBuilder = useCircuitStore((s) => s.loadCircuit);

  // Edit Profile modal state & button ref
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Settings accordion state
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Recent activity expand state
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Problems & Heatmap Activity State
  const [problems, setProblems] = useState<QuantumProblem[]>(() => loadProblems());
  const [problemsProgress, setProblemsProgress] = useState<ProblemsProgress>(() => loadProblemsProgress());

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      if (mounted) {
        setProblems(loadProblems());
        setProblemsProgress(loadProblemsProgress());
      }
    };
    refresh();
    Promise.all([syncProblemsFromSupabase(), syncProblemsProgressFromSupabase()]).finally(() => {
      if (mounted) {
        refresh();
        setLoading(false);
      }
    });

    window.addEventListener('quantumlearn:problems_changed', refresh);
    return () => {
      mounted = false;
      window.removeEventListener('quantumlearn:problems_changed', refresh);
    };
  }, []);

  // Compute breakdown for ProblemsSolvedRing
  const easyStats = {
    solved: problems.filter((p) => p.difficulty === 'Easy' && p.status === 'Solved').length,
    total: problems.filter((p) => p.difficulty === 'Easy').length,
  };
  const mediumStats = {
    solved: problems.filter((p) => p.difficulty === 'Medium' && p.status === 'Solved').length,
    total: problems.filter((p) => p.difficulty === 'Medium').length,
  };
  const hardStats = {
    solved: problems.filter((p) => p.difficulty === 'Hard' && p.status === 'Solved').length,
    total: problems.filter((p) => p.difficulty === 'Hard').length,
  };

  // Unified activity list combining profile events (modules, circuits) and problem solutions
  // Filter out any mock/unearned activities that don't match the user's real stats
  const validProfileActivity = (data.activity || []).filter((a) => {
    if (a.id?.match(/^act_[1-6]$/)) return false;
    if (a.timestamp?.match(/^2026-03-0[56]/)) return false;
    if (a.type === 'challenge_passed' && data.stats.challengesPassed === 0) return false;
    if (a.type === 'module_complete' && data.stats.modulesCompleted === 0) return false;
    if (a.type === 'circuit_saved' && data.stats.circuitsBuilt === 0) return false;
    return true;
  });

  const validProblemsActivity = data.stats.challengesPassed > 0
    ? (problemsProgress.recentActivity || [])
        .filter((p) => p.action === 'solved' && !p.id?.match(/^ra[1-6]$/) && !p.timestamp?.match(/^2026-03-0[56]/))
        .map((p) => ({
          id: p.id,
          type: 'challenge_passed' as const,
          label: `Solved problem: ${p.problemTitle}`,
          timestamp: p.timestamp,
        }))
    : [];

  const unifiedActivity = [
    ...validProfileActivity,
    ...validProblemsActivity,
  ]
    // Filter duplicates by label + date if any
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id || (t.label === v.label && Math.abs(new Date(t.timestamp).getTime() - new Date(v.timestamp).getTime()) < 5000)) === i)
    // Sort descending by timestamp
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Combine for heatmap contribution history
  const heatmapActivity = unifiedActivity.map((a) => ({
    id: a.id,
    timestamp: a.timestamp,
    action: a.type,
  }));

  const handleOpenCircuit = (circuitJson: QuantumCircuit) => {
    loadCircuitInBuilder(circuitJson);
    navigate('/lab');
  };

  const trackRoutes: Record<string, string> = {
    Foundations: '/learn/superposition-single-qubit',
    Circuits: '/learn/entanglement-bell-states',
    Algorithms: '/learn/grovers-search',
  };

  const overallPercent = Math.round((data.stats.modulesCompleted / data.stats.modulesTotal) * 100);

  const displayedActivity = showAllActivity ? unifiedActivity : unifiedActivity.slice(0, 8);

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--ink)] py-10 px-4 sm:px-6 transition-colors duration-250">
      <div className="max-w-[960px] mx-auto space-y-8 animate-fade-in">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
        <section className="bg-[var(--panel)] rounded-2xl border border-white/10 light:border-black/10 p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              {/* Initials Avatar Circle */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--void)] border border-[#D9A441]/40 flex items-center justify-center font-mono font-bold text-xl sm:text-2xl text-[#D9A441] shadow-inner shrink-0">
                {data.profile.avatarInitials || 'QL'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] font-heading">
                    {data.profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#4FD1D9]/10 text-[#4FD1D9] border border-[#4FD1D9]/20">
                    {data.profile.role}
                  </span>
                </div>
                {data.profile.bio ? (
                  <p className="text-xs sm:text-sm text-slate-300 light:text-slate-700 italic max-w-xl">
                    &quot;{data.profile.bio}&quot;
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 light:text-slate-400 italic max-w-xl flex items-center gap-1.5">
                    <span>No bio added yet.</span>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-[#4FD1D9] hover:underline not-italic cursor-pointer font-sans font-medium"
                    >
                      Add a bio →
                    </button>
                  </p>
                )}
                <div className="text-xs font-mono text-slate-400 light:text-slate-600 pt-1 flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-500 light:text-slate-400" />
                  <span>Member since {formatDateFormatted(data.profile.memberSince)}</span>
                </div>
              </div>
            </div>

            {/* Edit Button top-right */}
            <button
              ref={editButtonRef}
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-white/15 light:border-black/15 text-xs font-mono text-slate-300 light:text-slate-700 hover:text-[var(--ink)] hover:border-[#4FD1D9]/40 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Edit2 size={13} className="text-[#4FD1D9]" />
              <span>Edit Profile</span>
            </button>
          </div>
        </section>


        {/* ============================================================
            B. STATS SUMMARY ROW (Top Overview)
           ============================================================ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--panel)] p-5 rounded-2xl border border-white/5 light:border-black/10 space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-600 font-semibold flex items-center gap-1.5">
              <BookOpen size={13} className="text-[#4FD1D9]" />
              <span>Modules Completed</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--ink)] pt-1">
              {data.stats.modulesCompleted} <span className="text-slate-500 light:text-slate-400 text-lg">/ {data.stats.modulesTotal}</span>
            </div>
          </div>

          <div className="bg-[var(--panel)] p-5 rounded-2xl border border-white/5 light:border-black/10 space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-600 font-semibold flex items-center gap-1.5">
              <Cpu size={13} className="text-[#4FD1D9]" />
              <span>Circuits Built</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[var(--ink)] pt-1">
              {data.stats.circuitsBuilt}
            </div>
          </div>
        </section>

        {/* ============================================================
            C. PROBLEMS SOLVED & SUBMISSION ACTIVITY SECTION
            Ring Chart first, Contribution Heatmap below it.
           ============================================================ */}
        <section className="space-y-6">
          {/* 1. Problems Solved Ring Chart */}
          <ProblemsSolvedRing
            easy={easyStats}
            medium={mediumStats}
            hard={hardStats}
          />

          {/* 2. Submission Activity Heatmap */}
          <SubmissionActivityHeatmap
            recentActivity={heatmapActivity}
            currentStreak={problemsProgress.currentStreak || data.stats.currentStreak}
            maxStreak={problemsProgress.maxStreak || Math.max(problemsProgress.currentStreak, data.stats.currentStreak)}
          />
        </section>

        {/* ============================================================
            C. LEARNING PROGRESS (Main Content Block)
           ============================================================ */}
        <section className="bg-[var(--panel)] rounded-2xl border border-white/10 light:border-black/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-heading text-[var(--ink)] flex items-center gap-2">
                <BookOpen size={16} className="text-[#4FD1D9]" />
                <span>Learning Progress</span>
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-600">Overall curriculum mastery across quantum tracks.</p>
            </div>

            <button
              onClick={() => navigate('/learn/superposition-single-qubit')}
              className="text-xs font-mono text-[#D9A441] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>View full course</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 light:text-slate-700 font-semibold">Overall Course Completion</span>
              <span className={overallPercent === 100 ? 'text-[#D9A441] font-bold' : 'text-[#4FD1D9] font-bold'}>
                {overallPercent}% ({data.stats.modulesCompleted} of {data.stats.modulesTotal} Modules)
              </span>
            </div>
            <div className="w-full h-3 bg-[var(--void)] rounded-full overflow-hidden border border-white/5 light:border-black/10 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercent === 100 ? 'bg-[#D9A441]' : 'bg-[#4FD1D9]'
                }`}
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Track Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {data.tracks.map((track) => {
              const pct = Math.round((track.completed / track.total) * 100);
              const route = trackRoutes[track.name] || '/learn/superposition-single-qubit';

              return (
                <div
                  key={track.name}
                  onClick={() => navigate(route)}
                  className="bg-[var(--void)] p-4 rounded-xl border border-white/5 light:border-black/10 hover:border-[#4FD1D9]/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--ink)] group-hover:text-[#4FD1D9] transition-colors">
                      {track.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 light:text-slate-600">
                      {track.completed}/{track.total}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4FD1D9] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            D. ACHIEVEMENTS / BADGES
           ============================================================ */}
        <section className="bg-[var(--panel)] rounded-2xl border border-white/10 light:border-black/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-heading text-[var(--ink)] flex items-center gap-2">
                <Award size={16} className="text-[#D9A441]" />
                <span>Achievements & Badges</span>
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-600">Earn badges by completing modules, challenges, and maintaining active streaks.</p>
            </div>
            <span className="text-xs font-mono text-[#D9A441] font-bold">
              {data.badges.filter((b) => b.earned).length} / {data.badges.length} Earned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-all space-y-2 relative group ${
                  badge.earned
                    ? 'bg-[var(--void)] border-[#D9A441]/30 hover:border-[#D9A441]'
                    : 'bg-[var(--void)]/40 border-dashed border-slate-700 light:border-slate-300 opacity-50 grayscale hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      badge.earned
                        ? 'bg-[#D9A441]/15 text-[#D9A441] border border-[#D9A441]/30'
                        : 'bg-slate-800 light:bg-slate-200 text-slate-500 light:text-slate-400 border border-slate-700 light:border-slate-300'
                    }`}
                  >
                    <Award size={18} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 light:text-slate-600">
                    {badge.earned ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[var(--ink)] group-hover:text-[#D9A441] transition-colors">
                    {badge.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 light:text-slate-600 leading-snug mt-1">
                    {badge.description}
                  </p>
                </div>

                {badge.earned && badge.earnedDate && (
                  <div className="text-[10px] font-mono text-[#D9A441] pt-1">
                    Earned {formatDateFormatted(badge.earnedDate)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            E. RECENT ACTIVITY
           ============================================================ */}
        <section className="bg-[var(--panel)] rounded-2xl border border-white/10 light:border-black/10 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-[var(--ink)] flex items-center gap-2">
              <Clock size={16} className="text-[#4FD1D9]" />
              <span>Recent Activity</span>
            </h2>
            {data.activity.length > 8 && (
              <button
                onClick={() => setShowAllActivity((s) => !s)}
                className="text-xs font-mono text-[#4FD1D9] hover:underline cursor-pointer"
              >
                {showAllActivity ? 'Show Less' : `View All (${data.activity.length})`}
              </button>
            )}
          </div>

          {displayedActivity.length > 0 ? (
            <div className="divide-y divide-white/5 light:divide-black/5 border border-white/5 light:border-black/10 rounded-xl overflow-hidden bg-[var(--void)]">
              {displayedActivity.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 text-xs font-mono hover:bg-white/[0.02] light:hover:bg-black/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.type === 'module_complete' && <CheckCircle2 size={15} className="text-[#4E9E7B] shrink-0" />}
                    {item.type === 'circuit_saved' && <Cpu size={15} className="text-[#4FD1D9] shrink-0" />}
                    {item.type === 'challenge_passed' && <Trophy size={15} className="text-[#D9A441] shrink-0" />}
                    <span className="text-slate-200 light:text-slate-800 truncate">{item.label}</span>
                  </div>
                  <span className="text-slate-400 light:text-slate-600 text-[11px] shrink-0">{formatRelativeTime(item.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[var(--void)] border border-dashed border-slate-700 light:border-slate-300 text-center space-y-2">
              <Clock size={24} className="text-slate-500 light:text-slate-400 mx-auto opacity-70" />
              <p className="text-xs font-medium text-slate-300 light:text-slate-700">No recent activity yet</p>
              <p className="text-[11px] text-slate-500 light:text-slate-600 font-mono">
                Completed modules, simulated circuits, and solved challenges will appear here automatically.
              </p>
            </div>
          )}
        </section>

        {/* ============================================================
            F. SAVED CIRCUITS
           ============================================================ */}
        <section className="bg-[var(--panel)] rounded-2xl border border-white/10 light:border-black/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-heading text-[var(--ink)] flex items-center gap-2">
                <Cpu size={16} className="text-[#4FD1D9]" />
                <span>Saved Circuits</span>
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-600">Circuits saved from your lab interactive sessions.</p>
            </div>

            <button
              onClick={() => navigate('/lab')}
              className="text-xs font-mono text-[#4FD1D9] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>Open Circuit Builder</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {data.savedCircuits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.savedCircuits.map((sc) => (
                <div
                  key={sc.id}
                  className="bg-[var(--void)] p-4 rounded-xl border border-white/5 light:border-black/10 hover:border-[#4FD1D9]/40 transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--ink)] truncate max-w-[200px]">
                      {sc.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCircuit(sc.id);
                      }}
                      className="p-1 rounded text-slate-500 light:text-slate-400 hover:text-[#C1543A] hover:bg-white/5 light:hover:bg-black/5 transition-colors"
                      title="Delete saved circuit"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <CircuitThumbnail circuit={sc.circuitJson} />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400 light:text-slate-600">
                      Edited {formatRelativeTime(sc.lastEdited)}
                    </span>
                    <button
                      onClick={() => handleOpenCircuit(sc.circuitJson)}
                      className="px-2.5 py-1 rounded bg-[#4FD1D9]/10 text-[#4FD1D9] text-[11px] font-mono font-bold hover:bg-[#4FD1D9]/20 transition-colors"
                    >
                      Open in Builder ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 rounded-xl bg-[var(--void)] border border-dashed border-slate-700 light:border-slate-300 text-center space-y-3">
              <Cpu size={24} className="text-slate-500 light:text-slate-400 mx-auto" />
              <p className="text-xs text-slate-300 light:text-slate-700">
                Circuits you save from the builder will show up here.
              </p>
              <button
                onClick={() => navigate('/lab')}
                className="btn-primary text-xs px-4 py-2"
              >
                Open Circuit Builder
              </button>
            </div>
          )}
        </section>

        {/* ============================================================
            G. SETTINGS SECTION (Collapsed Accordion)
           ============================================================ */}
        <section className="bg-[var(--panel)] rounded-2xl border border-white/10 light:border-black/10 overflow-hidden">
          <button
            onClick={() => setSettingsExpanded((e) => !e)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] light:hover:bg-black/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[#4FD1D9]" />
              <div>
                <h2 className="text-base font-bold font-heading text-[var(--ink)]">
                  Account Settings & Preferences
                </h2>
                <p className="text-xs text-slate-400 light:text-slate-600">Manage display options, notifications, and data controls.</p>
              </div>
            </div>
            {settingsExpanded ? <ChevronUp size={18} className="text-slate-400 light:text-slate-600" /> : <ChevronDown size={18} className="text-slate-400 light:text-slate-600" />}
          </button>

          {settingsExpanded && (
            <div className="p-6 pt-0 border-t border-white/5 light:border-black/10 space-y-6">
              {/* Notification Toggles */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 light:text-slate-700 font-semibold">
                  Notification Preferences
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--void)] border border-white/5 light:border-black/10 cursor-pointer">
                    <span className="text-xs text-slate-200 light:text-slate-800">Daily Streak Reminders</span>
                    <input
                      type="checkbox"
                      checked={data.settings.notifyStreak}
                      onChange={(e) => updateSettings({ notifyStreak: e.target.checked })}
                      className="accent-[#4FD1D9] h-4 w-4 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--void)] border border-white/5 light:border-black/10 cursor-pointer">
                    <span className="text-xs text-slate-200 light:text-slate-800">New Quantum Module & Track Alerts</span>
                    <input
                      type="checkbox"
                      checked={data.settings.notifyNewModules}
                      onChange={(e) => updateSettings({ notifyNewModules: e.target.checked })}
                      className="accent-[#4FD1D9] h-4 w-4 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Reset Progress (Quiet Destructive Action) */}
              <div className="pt-6 border-t border-white/5 light:border-black/10 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#C1543A] font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>Destructive Actions</span>
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-600">
                  Resetting progress will permanently erase your completed modules, streak days, badges, and saved circuits.
                </p>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-xl border border-[#C1543A]/40 text-[#C1543A] text-xs font-mono hover:bg-[#C1543A]/10 transition-colors cursor-pointer"
                >
                  Reset Progress & Data...
                </button>
              </div>
            </div>
          )}
        </section>
          </>
        )}
      </div>

      {/* Confirmation Modal for Reset Progress */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--panel)] border border-[#C1543A]/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-[#C1543A]">
              <ShieldAlert size={22} />
              <h3 className="text-base font-bold font-heading">Confirm Data Reset</h3>
            </div>
            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
              Are you sure you want to reset all progress? This will clear your completed course stats, active streak, earned badges, and saved circuits in local storage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/5 light:bg-black/5 hover:bg-white/10 text-xs font-mono text-slate-300 light:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#C1543A] hover:bg-[#a8442e] text-white text-xs font-mono font-bold transition-colors"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        triggerRef={editButtonRef}
        onSuccessToast={handleShowToast}
      />

      {/* Profile Updated Confirmation Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[var(--panel)] border border-[var(--cryostat-gold)]/40 text-[var(--ink)] text-xs sm:text-sm font-mono rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] animate-fade-in"
        >
          <CheckCircle2 size={16} className="text-[var(--success)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

