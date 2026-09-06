// ============================================================
// QuantumLearn AI — Lab Page (Main Workspace)
// Circuit Builder + Code Editor + Visualization + Active Problem Runner
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Play,
  Lightbulb,
  ArrowLeft,
  X,
  RotateCcw,
} from 'lucide-react';
import { CircuitCanvas } from '../components/CircuitBuilder/CircuitCanvas';
import { GatePalette } from '../components/CircuitBuilder/GatePalette';
import { CircuitControls } from '../components/CircuitBuilder/CircuitControls';
import { CodeEditorPanel } from '../components/CodeEditor/CodeEditorPanel';
import { VisualizationPanel } from '../components/Visualization/Charts';
import { BlochSpherePanel } from '../components/Visualization/BlochSphere';
import { useCircuitStore } from '../core/store';
import {
  getActiveProblem,
  setActiveProblem,
  markProblemSolved,
  type QuantumProblem,
} from '../data/problems/problemsData';

function ConfettiEffect() {
  const pieces = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    color: ['#4FD1D9', '#D9A441', '#4E9E7B', '#FFFFFF'][i % 4],
    size: `${Math.random() * 8 + 4}px`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            animationDelay: p.delay,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
}

export function LabPage() {
  const navigate = useNavigate();
  const [showCode, setShowCode] = useState(false);
  const [activeProblem, setActiveProblemState] = useState<QuantumProblem | null>(() => getActiveProblem());
  const [showHints, setShowHints] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'pass' | 'fail' | null;
    message: string;
  }>({ status: null, message: '' });
  const [showConfetti, setShowConfetti] = useState(false);

  const simulationResult = useCircuitStore((s) => s.simulationResult);
  const circuit = useCircuitStore((s) => s.circuit);
  const runSimulation = useCircuitStore((s) => s.runSimulation);
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);

  // Sync active problem from storage
  useEffect(() => {
    const handleActiveProblemChange = () => {
      setActiveProblemState(getActiveProblem());
      setValidationResult({ status: null, message: '' });
    };
    window.addEventListener('quantumlearn:active_problem_changed', handleActiveProblemChange);
    return () => window.removeEventListener('quantumlearn:active_problem_changed', handleActiveProblemChange);
  }, []);

  // Validate Solution
  const handleVerifySolution = () => {
    if (!activeProblem) return;

    // Run simulation if not yet run
    runSimulation(1024);

    const currentResult = useCircuitStore.getState().simulationResult;
    if (!currentResult) {
      setValidationResult({
        status: 'fail',
        message: 'No simulation output. Ensure your circuit contains gates or measurement.',
      });
      return;
    }

    const expected = activeProblem.expectedProbabilities;
    const tolerance = activeProblem.tolerance || 0.08;

    let passed = false;
    if (expected && expected.length > 0) {
      const actual = currentResult.probabilities;
      if (actual.length === expected.length) {
        passed = expected.every((exp, i) => Math.abs(exp - (actual[i] || 0)) <= tolerance);
      }
    } else {
      // If no explicit probabilities, any successful multi-gate execution passes
      passed = circuit.steps.some((s) => s.gates.length > 0);
    }

    if (passed) {
      markProblemSolved(activeProblem.id);
      setActiveProblemState((prev) => (prev ? { ...prev, status: 'Solved' } : null));
      setValidationResult({
        status: 'pass',
        message: 'Verification Passed! Your quantum circuit produced the expected state distribution.',
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } else {
      const actualFormatted = currentResult.probabilities.map((p) => Math.round(p * 100) + '%').join(', ');
      setValidationResult({
        status: 'fail',
        message: `Output state did not match expected criteria. Expected: ${
          activeProblem.expectedDescription || 'Target state'
        }. Measured distribution: [${actualFormatted}].`,
      });
    }
  };

  const handleResetProblemCircuit = () => {
    if (activeProblem) {
      loadCircuit(activeProblem.initialCircuit);
      setValidationResult({ status: null, message: '' });
    }
  };

  const handleExitProblem = () => {
    setActiveProblem(null);
    setActiveProblemState(null);
    setValidationResult({ status: null, message: '' });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-fade-in">
      {showConfetti && <ConfettiEffect />}

      {/* ======================================================== */}
      {/* ACTIVE PROBLEM BANNER (When solving a problem) */}
      {/* ======================================================== */}
      {activeProblem && (
        <div className="px-4 pt-2 shrink-0">
          <div className="bg-[var(--panel)] border border-[var(--cryostat-gold)]/40 rounded-xl p-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--cryostat-gold)]/20 text-[var(--cryostat-gold)] border border-[var(--cryostat-gold)]/40">
                    Active Challenge
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      activeProblem.difficulty === 'Easy'
                        ? 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/40'
                        : activeProblem.difficulty === 'Medium'
                        ? 'bg-[var(--cryostat-gold)]/20 text-[var(--cryostat-gold)] border-[var(--cryostat-gold)]/40'
                        : 'bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)]/40'
                    }`}
                  >
                    {activeProblem.difficulty}
                  </span>
                  <span className="text-xs font-bold text-[var(--ink)]">
                    {activeProblem.title}
                  </span>
                  {activeProblem.status === 'Solved' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--success)]">
                      <CheckCircle2 size={13} /> Solved
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 light:text-slate-600 line-clamp-1">
                  <strong>Objective:</strong> {activeProblem.objective}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {activeProblem.hints && activeProblem.hints.length > 0 && (
                  <button
                    onClick={() => setShowHints((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 light:text-slate-700 bg-white/[0.04] light:bg-black/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <Lightbulb size={13} className="text-[var(--cryostat-gold)]" />
                    <span>Hints</span>
                  </button>
                )}

                <button
                  onClick={handleResetProblemCircuit}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--ink)] bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  title="Reset to initial starter circuit"
                >
                  <RotateCcw size={14} />
                </button>

                <button
                  onClick={handleVerifySolution}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[var(--cryostat-gold)] text-[var(--void)] hover:opacity-90 shadow-sm transition-all cursor-pointer"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Verify Solution</span>
                </button>

                <button
                  onClick={() => navigate('/problems')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-[var(--ink)] bg-white/[0.03] border border-white/10 transition-all cursor-pointer"
                  title="Back to all problems"
                >
                  <ArrowLeft size={13} />
                  <span>Problems</span>
                </button>

                <button
                  onClick={handleExitProblem}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 cursor-pointer"
                  title="Close problem mode"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Verification status feedback */}
            {validationResult.status && (
              <div
                className={`mt-2.5 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-fade-in ${
                  validationResult.status === 'pass'
                    ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/40 font-medium'
                    : 'bg-[var(--error)]/20 text-[#fca5a5] border border-[var(--error)]/40'
                }`}
              >
                {validationResult.status === 'pass' ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : (
                  <XCircle size={16} className="shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>
            )}

            {/* Hints popout */}
            {showHints && activeProblem.hints && (
              <div className="mt-2.5 pt-2 border-t border-white/10 text-xs text-slate-300 space-y-1.5 animate-fade-in">
                <div className="font-mono text-[11px] text-[var(--cryostat-gold)] uppercase tracking-wider">
                  Helpful Hints:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {activeProblem.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls toolbar */}
      <div className="px-4 py-2">
        <CircuitControls onToggleCode={() => setShowCode(!showCode)} showCode={showCode} />
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-3">
        {/* Left: Gate Palette */}
        <div className="w-[220px] shrink-0 glass-light rounded-xl overflow-hidden flex flex-col">
          <GatePalette />
        </div>

        {/* Center: Circuit Canvas + Code Editor */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Circuit Canvas */}
          <div className={`${showCode ? 'h-1/2' : 'flex-1'} min-h-[200px]`}>
            <CircuitCanvas />
          </div>

          {/* Code Editor (togglable) */}
          {showCode && (
            <div className="h-1/2 glass-light rounded-xl overflow-hidden animate-slide-in-up">
              <CodeEditorPanel />
            </div>
          )}
        </div>

        {/* Right: Visualization Panel */}
        <div className="w-[340px] shrink-0 flex flex-col gap-3">
          {/* Bloch Spheres */}
          <div className="glass-light rounded-xl overflow-hidden shrink-0 border border-white/10">
            <BlochSpherePanel
              blochVectors={simulationResult?.blochVectors ?? []}
            />
          </div>

          {/* Charts */}
          <div className="flex-1 glass-light rounded-xl overflow-hidden min-h-[200px] border border-white/10">
            <VisualizationPanel
              result={simulationResult}
              numQubits={circuit.numQubits}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
