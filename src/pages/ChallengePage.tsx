// ============================================================
// QuantumLearn AI — Challenge Page
// Coding challenge with auto-validation
// ============================================================

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  BarChart3,
  X,
} from 'lucide-react';
import { allChallenges } from '../data/challenges/challenges';
import { useCircuitStore, useProgressStore } from '../core/store';
import { CircuitCanvas } from '../components/CircuitBuilder/CircuitCanvas';
import { GatePalette } from '../components/CircuitBuilder/GatePalette';
import { CircuitControls } from '../components/CircuitBuilder/CircuitControls';
import { MobileGateDock } from '../components/CircuitBuilder/MobileGateDock';
import { VisualizationPanel } from '../components/Visualization/Charts';
import { BlochSpherePanel } from '../components/Visualization/BlochSphere';
import type { ChallengeResult } from '../core/types';

export function ChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mobileInstructionsOpen, setMobileInstructionsOpen] = useState(false);
  const [showMobileVisuals, setShowMobileVisuals] = useState(false);

  const loadCircuit = useCircuitStore((s) => s.loadCircuit);
  const circuit = useCircuitStore((s) => s.circuit);
  const simulationResult = useCircuitStore((s) => s.simulationResult);
  const runSimulation = useCircuitStore((s) => s.runSimulation);
  const completeChallenge = useProgressStore((s) => s.completeChallenge);

  const challenge = allChallenges.find((c) => c.id === challengeId);

  useEffect(() => {
    if (challenge) {
      loadCircuit(challenge.initialCircuit);
    }
  }, [challengeId]); // eslint-disable-line

  const handleSubmit = useCallback(() => {
    if (!challenge || !simulationResult) {
      runSimulation();
      return;
    }

    // Validate against expected outcome
    const expected = challenge.expectedOutcome;
    let passed = false;

    if (expected.type === 'probabilities') {
      const expectedProbs = expected.value as number[];
      const actualProbs = simulationResult.probabilities;

      if (actualProbs.length === expectedProbs.length) {
        passed = expectedProbs.every(
          (exp, i) => Math.abs(exp - actualProbs[i]) <= expected.tolerance
        );
      }
    }

    setResult(passed ? 'pass' : 'fail');

    if (passed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      const challengeResult: ChallengeResult = {
        challengeId: challenge.id,
        passed: true,
        userCircuit: circuit,
        userResult: simulationResult,
        timestamp: Date.now(),
      };
      completeChallenge(challengeResult);
    }
  }, [challenge, simulationResult, circuit, runSimulation, completeChallenge]);

  const handleReset = () => {
    if (challenge) {
      loadCircuit(challenge.initialCircuit);
      setResult(null);
    }
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-slate-400">
        Challenge not found.
        <button onClick={() => navigate('/')} className="text-quantum-400 underline ml-2">
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden animate-fade-in">
      {/* Confetti */}
      {showConfetti && <ConfettiEffect />}

      {/* ======================================================== */}
      {/* MOBILE COLLAPSIBLE TASK HEADER (< lg) */}
      {/* ======================================================== */}
      <div className="lg:hidden px-3 pt-2 shrink-0">
        <div className="bg-[#12172A] light:bg-[#FAF9F5] border border-white/10 light:border-slate-300 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => navigate('/problems')}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Back to Problems"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-quantum-500 to-neon-cyan flex items-center justify-center shrink-0">
                <Trophy size={13} className="text-white" />
              </div>
              <span className="text-xs font-bold font-heading truncate text-[var(--ink)]">
                {challenge.title}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--cryostat-gold)]/20 text-[var(--cryostat-gold)] border border-[var(--cryostat-gold)]/30 shrink-0">
                {challenge.difficulty}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileInstructionsOpen((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] font-mono text-[var(--signal-cyan)] hover:underline shrink-0 cursor-pointer"
            >
              <span>{mobileInstructionsOpen ? 'Hide Task' : 'Task Details'}</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${mobileInstructionsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Collapsible Instructions Drawer */}
          {mobileInstructionsOpen && (
            <div className="pt-2.5 border-t border-white/10 light:border-slate-200 text-xs text-slate-300 light:text-slate-700 space-y-2 max-h-[42vh] overflow-y-auto animate-fade-in pr-1">
              <div
                className="prose prose-sm max-w-none text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(challenge.instructions) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP LEFT PANEL: Challenge instructions (lg+) */}
      {/* ======================================================== */}
      <div className="challenge-panel hidden lg:flex lg:w-[400px] lg:shrink-0 flex-col border-r border-white/10 transition-colors min-h-0 overflow-hidden">
        <div className="px-6 pt-4 pb-2 shrink-0">
          <button
            onClick={() => navigate('/problems')}
            className="text-xs text-slate-400 hover:text-quantum-300 mb-3 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} /> Back to Problems
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quantum-500 to-neon-cyan flex items-center justify-center shadow-xs">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading">{challenge.title}</h1>
              <span className="difficulty-tag text-xs px-2 py-0.5 rounded font-mono font-semibold">
                {challenge.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div
            className="prose prose-sm max-w-none
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3
            [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-quantum-300
            [&_p]:mb-2.5 [&_p]:leading-relaxed
            [&_li]:my-1
            [&_strong]:font-semibold
            [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs
            [&_details]:rounded-xl [&_details]:p-3 [&_details]:my-2.5
            [&_summary]:cursor-pointer [&_summary]:font-semibold
          "
            dangerouslySetInnerHTML={{ __html: formatMarkdown(challenge.instructions) }}
          />
        </div>

        {/* Result & Submit (Desktop) */}
        <div className="challenge-action-bar px-6 py-4 border-t border-white/10 space-y-3 transition-colors shrink-0">
          {result === 'pass' && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#4E9E7B]/15 border border-[#4E9E7B]/40 animate-fade-in">
              <CheckCircle size={20} className="text-[#4E9E7B]" />
              <div>
                <p className="text-sm font-semibold text-[#4E9E7B]">Challenge Passed!</p>
                <p className="text-xs text-[#4E9E7B]/80">Your circuit produced the target quantum state!</p>
              </div>
            </div>
          )}

          {result === 'fail' && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#C1543A]/15 border border-[#C1543A]/40 animate-fade-in">
              <XCircle size={20} className="text-[#C1543A]" />
              <div>
                <p className="text-sm font-semibold text-[#C1543A]">Not quite right</p>
                <p className="text-xs text-[#C1543A]/80">Check the hints and try again!</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleReset} className="btn-secondary flex-1">
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={() => {
                runSimulation();
                setTimeout(handleSubmit, 100);
              }}
              className="btn-primary flex-1"
            >
              <CheckCircle size={14} />
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT/CENTER: Circuit Builder, Controls & Visualizer */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Controls - visible on all screens */}
        <div className="px-3 py-2 shrink-0">
          <CircuitControls onToggleCode={() => {}} showCode={false} />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden px-2.5 sm:px-3 pb-2.5 sm:pb-3 gap-2">
          {/* Gate Palette (Desktop lg+) */}
          <div className="hidden lg:flex lg:w-[210px] lg:shrink-0 glass-light rounded-xl overflow-hidden flex-col">
            <GatePalette />
          </div>

          {/* Center Canvas + Mobile Gate Dock */}
          <div className="flex-1 flex flex-col min-w-0 glass-light rounded-xl overflow-hidden border border-white/10">
            <div className="flex-1 min-h-[220px] flex flex-col">
              <CircuitCanvas />
            </div>

            {/* Visuals Pull-up Bar on Mobile (< lg) */}
            <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-[#080B14] light:bg-[#EAE8E0] border-t border-white/10 light:border-slate-300 text-xs font-mono shrink-0">
              <div className="flex items-center gap-2 text-slate-300 light:text-slate-700 truncate">
                <BarChart3 size={13} className="text-[var(--signal-cyan)] shrink-0" />
                <span className="truncate">
                  {simulationResult ? 'Sim Result Ready' : 'Sim: Not run yet'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileVisuals(true)}
                className="flex items-center gap-1 text-[var(--signal-cyan)] hover:underline font-bold shrink-0 cursor-pointer"
              >
                <span>View Visuals</span>
                <ChevronUp size={14} />
              </button>
            </div>

            {/* Mobile Gate Dock (< lg) */}
            <div className="lg:hidden">
              <MobileGateDock />
            </div>

            {/* Desktop Visualizer Sub-panel (lg+) */}
            <div className="hidden lg:flex h-[285px] gap-2 p-2 border-t border-white/10">
              <div className="flex-1 glass-light rounded-xl overflow-hidden shadow-xs">
                <VisualizationPanel result={simulationResult} numQubits={circuit.numQubits} />
              </div>
              <div className="w-[320px] shrink-0 glass-light rounded-xl overflow-hidden shadow-xs">
                <BlochSpherePanel blochVectors={simulationResult?.blochVectors ?? []} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Submit Bar (< lg) */}
        <div className="lg:hidden p-3 border-t border-white/10 bg-[var(--void)]/95 backdrop-blur shrink-0 space-y-2">
          {result === 'pass' && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#4E9E7B]/15 border border-[#4E9E7B]/40 text-xs text-[#4E9E7B]">
              <CheckCircle size={16} className="shrink-0" />
              <span>Challenge Passed! Great job!</span>
            </div>
          )}
          {result === 'fail' && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#C1543A]/15 border border-[#C1543A]/40 text-xs text-[#C1543A]">
              <XCircle size={16} className="shrink-0" />
              <span>Not quite right. Check hints and try again!</span>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleReset} className="btn-secondary flex-1 py-2 text-xs">
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              onClick={() => {
                runSimulation();
                setTimeout(handleSubmit, 100);
              }}
              className="btn-primary flex-1 py-2 text-xs"
            >
              <CheckCircle size={13} />
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Slide-up Visuals Modal Sheet on Mobile (< lg) */}
      {showMobileVisuals && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="flex-1" onClick={() => setShowMobileVisuals(false)} />
          <div className="w-full max-h-[82vh] bg-[#0E1322] light:bg-[#FAF9F5] border-t border-white/20 light:border-slate-300 rounded-t-3xl p-4 sm:p-5 space-y-4 shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 light:border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-[var(--signal-cyan)]" />
                <h3 className="text-sm font-heading font-bold text-[var(--ink)]">
                  Quantum State & Bloch Sphere
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileVisuals(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white light:hover:text-black hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="glass-light rounded-xl overflow-hidden border border-white/10">
                <BlochSpherePanel blochVectors={simulationResult?.blochVectors ?? []} />
              </div>
              <div className="glass-light rounded-xl overflow-hidden min-h-[220px] border border-white/10">
                <VisualizationPanel result={simulationResult} numQubits={circuit.numQubits} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Confetti Effect ---

function ConfettiEffect() {
  const colors = ['#8B5CF6', '#22D3EE', '#4ADE80', '#F472B6', '#FB923C', '#FACC15'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
  }));

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<details>/g, '<details>')
    .replace(/<\/details>/g, '</details>')
    .replace(/<summary>(.*?)<\/summary>/g, '<summary>$1</summary>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}
