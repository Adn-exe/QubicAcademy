// ============================================================
// QuantumLearn AI — Challenge Page
// Coding challenge with auto-validation
// ============================================================

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  Layers,
  Cpu,
  BarChart3,
} from 'lucide-react';
import { allChallenges } from '../data/challenges/challenges';
import { useCircuitStore, useProgressStore } from '../core/store';
import { CircuitCanvas } from '../components/CircuitBuilder/CircuitCanvas';
import { GatePalette } from '../components/CircuitBuilder/GatePalette';
import { CircuitControls } from '../components/CircuitBuilder/CircuitControls';
import { VisualizationPanel } from '../components/Visualization/Charts';
import { BlochSpherePanel } from '../components/Visualization/BlochSphere';
import type { ChallengeResult } from '../core/types';

export function ChallengePage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<'pass' | 'fail' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mobileTab, setMobileTab] = useState<'instructions' | 'gates' | 'circuit' | 'visuals'>('circuit');

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

      {/* Mobile Top Tab Switcher (< lg) */}
      <div className="lg:hidden px-3 pt-2 shrink-0">
        <div className="flex items-center p-1 bg-white/[0.04] light:bg-black/[0.04] border border-white/10 light:border-black/10 rounded-xl">
          <button
            onClick={() => setMobileTab('instructions')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'instructions'
                ? 'bg-[var(--signal-cyan)] text-[var(--void)] font-bold shadow'
                : 'text-slate-400 hover:text-[var(--ink)]'
            }`}
          >
            <BookOpen size={13} />
            <span>Task</span>
          </button>
          <button
            onClick={() => setMobileTab('gates')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'gates'
                ? 'bg-[var(--signal-cyan)] text-[var(--void)] font-bold shadow'
                : 'text-slate-400 hover:text-[var(--ink)]'
            }`}
          >
            <Layers size={13} />
            <span>Gates</span>
          </button>
          <button
            onClick={() => setMobileTab('circuit')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'circuit'
                ? 'bg-[var(--signal-cyan)] text-[var(--void)] font-bold shadow'
                : 'text-slate-400 hover:text-[var(--ink)]'
            }`}
          >
            <Cpu size={13} />
            <span>Circuit</span>
          </button>
          <button
            onClick={() => setMobileTab('visuals')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'visuals'
                ? 'bg-[var(--signal-cyan)] text-[var(--void)] font-bold shadow'
                : 'text-slate-400 hover:text-[var(--ink)]'
            }`}
          >
            <BarChart3 size={13} />
            <span>Visuals</span>
          </button>
        </div>
      </div>

      {/* Left: Challenge instructions */}
      <div className={`challenge-panel ${mobileTab === 'instructions' ? 'flex flex-1' : 'hidden'} lg:flex lg:w-[400px] lg:shrink-0 flex-col border-r border-white/10 transition-colors min-h-0 overflow-hidden`}>
        <div className="px-6 pt-4 pb-2 shrink-0">
          <button onClick={() => navigate('/problems')} className="text-xs text-slate-400 hover:text-quantum-300 mb-3 inline-flex items-center gap-1 transition-colors cursor-pointer">
            <ChevronLeft size={14} /> Back
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
          <div className="prose prose-sm max-w-none
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
                <p className="text-xs text-[#4E9E7B]/80">You've created a Bell state successfully!</p>
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
              onClick={() => { runSimulation(); setTimeout(handleSubmit, 100); }}
              className="btn-primary flex-1"
            >
              <CheckCircle size={14} />
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Right: Circuit builder & Visualizer */}
      <div className={`flex-1 flex-col min-w-0 ${mobileTab === 'instructions' ? 'hidden lg:flex' : 'flex'}`}>
        {/* Controls - visible on desktop and circuit tab */}
        <div className={`px-3 py-2 ${mobileTab === 'circuit' ? 'block' : 'hidden lg:block'}`}>
          <CircuitControls onToggleCode={() => {}} showCode={false} />
        </div>

        <div className="flex-1 flex overflow-hidden px-3 pb-3 gap-2">
          {/* Gate Palette */}
          <div className={`${mobileTab === 'gates' ? 'flex flex-1' : 'hidden'} lg:flex lg:w-[210px] lg:shrink-0 glass-light rounded-xl overflow-hidden flex-col`}>
            <GatePalette />
          </div>

          {/* Center Canvas */}
          <div className={`${mobileTab === 'circuit' ? 'flex flex-1' : 'hidden'} lg:flex lg:flex-1 flex-col gap-2 min-w-0`}>
            <div className="flex-1 min-h-[200px]">
              <CircuitCanvas />
            </div>
            {/* Desktop Visualizer Sub-panel */}
            <div className="hidden lg:flex h-[285px] gap-2">
              <div className="flex-1 glass-light rounded-xl overflow-hidden shadow-xs">
                <VisualizationPanel result={simulationResult} numQubits={circuit.numQubits} />
              </div>
              <div className="w-[320px] shrink-0 glass-light rounded-xl overflow-hidden shadow-xs">
                <BlochSpherePanel blochVectors={simulationResult?.blochVectors ?? []} />
              </div>
            </div>
          </div>

          {/* Mobile Visualizer Panel */}
          <div className={`${mobileTab === 'visuals' ? 'flex flex-1 overflow-y-auto' : 'hidden'} lg:hidden flex-col gap-2`}>
            <div className="glass-light rounded-xl overflow-hidden shrink-0">
              <BlochSpherePanel blochVectors={simulationResult?.blochVectors ?? []} />
            </div>
            <div className="flex-1 glass-light rounded-xl overflow-hidden min-h-[220px]">
              <VisualizationPanel result={simulationResult} numQubits={circuit.numQubits} />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="lg:hidden p-3 border-t border-white/10 bg-[var(--void)]/95 backdrop-blur shrink-0 space-y-2">
          {result === 'pass' && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#4E9E7B]/15 border border-[#4E9E7B]/40 text-xs text-[#4E9E7B]">
              <CheckCircle size={16} className="shrink-0" />
              <span>Challenge Passed! Bell state created.</span>
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
              onClick={() => { runSimulation(); setTimeout(handleSubmit, 100); }}
              className="btn-primary flex-1 py-2 text-xs"
            >
              <CheckCircle size={13} />
              Submit
            </button>
          </div>
        </div>
      </div>
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
