// ============================================================
// QuantumLearn AI — Measurement & Probability Collapse Visualizer
// Chapter 2: Interactive Wavefunction Collapse & Born Rule Engine
// Tokens: --signal-cyan (#4FD1D9), --cryostat-gold (#D9A441), --panel (#12172A)
// ============================================================

import { useState, useMemo } from 'react';
import { Eye, RotateCcw, Bot, Activity, BarChart2 } from 'lucide-react';
import { useChatStore } from '../../core/store';

interface MeasurementVisualizerProps {
  onOpenInBuilder?: () => void;
}

export function MeasurementVisualizer({ onOpenInBuilder: _ }: MeasurementVisualizerProps) {
  const toggleTutor = useChatStore((s) => s.toggleTutor);
  const isTutorOpen = useChatStore((s) => s.isTutorOpen);

  // Angle theta controls the pre-measurement state |ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩
  const [theta, setTheta] = useState<number>(Math.PI / 2); // Default to equal superposition (50/50)
  
  // Collapse state: null = wave in superposition, '0' = collapsed to |0>, '1' = collapsed to |1>
  const [collapsedState, setCollapsedState] = useState<'0' | '1' | null>(null);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // Accumulated shots for Monte Carlo statistics
  const [counts, setCounts] = useState<{ '0': number; '1': number }>({ '0': 0, '1': 0 });
  const [totalShots, setTotalShots] = useState<number>(0);

  // Theoretical probabilities
  const prob0 = useMemo(() => Math.cos(theta / 2) ** 2, [theta]);
  const prob0Percent = Math.round(prob0 * 100);
  const prob1Percent = 100 - prob0Percent;

  // Single projective measurement trigger
  const handleSingleMeasurement = () => {
    setIsCollapsing(true);
    setTimeout(() => {
      const outcome = Math.random() < prob0 ? '0' : '1';
      setCollapsedState(outcome);
      setCounts((prev) => ({ ...prev, [outcome]: prev[outcome] + 1 }));
      setTotalShots((s) => s + 1);
      setIsCollapsing(false);
    }, 280);
  };

  // Multi-shot Monte Carlo run
  const handleBatchShots = (batchSize: number) => {
    let c0 = 0;
    let c1 = 0;
    for (let i = 0; i < batchSize; i++) {
      if (Math.random() < prob0) {
        c0++;
      } else {
        c1++;
      }
    }
    setCounts((prev) => ({ '0': prev['0'] + c0, '1': prev['1'] + c1 }));
    setTotalShots((s) => s + batchSize);
    // Last sampled outcome
    setCollapsedState(Math.random() < prob0 ? '0' : '1');
  };

  const handleReset = () => {
    setCollapsedState(null);
    setCounts({ '0': 0, '1': 0 });
    setTotalShots(0);
  };

  const observedProb0 = totalShots > 0 ? ((counts['0'] / totalShots) * 100).toFixed(1) : '0.0';
  const observedProb1 = totalShots > 0 ? ((counts['1'] / totalShots) * 100).toFixed(1) : '0.0';

  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-[#12172A] text-slate-100 overflow-hidden shadow-xl animate-fade-in">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-[#0A0E1A]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4FD1D9] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#4FD1D9]">
            Wavefunction Collapse & Born Rule Chamber
          </span>
        </div>

        <button
          onClick={toggleTutor}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            isTutorOpen
              ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
              : 'bg-[#4FD1D9]/10 text-[#4FD1D9] border border-[#4FD1D9]/30 hover:bg-[#4FD1D9]/20'
          }`}
          title="Ask AI Tutor about quantum measurement"
        >
          <Bot size={13} />
          <span>Ask AI Tutor</span>
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Step 1: Pre-Measurement Superposition Preparation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <Activity size={14} className="text-[#4FD1D9]" />
              Pre-Measurement State Preparation:
              <span className="text-[#D9A441]">
                |ψ⟩ = {Math.cos(theta / 2).toFixed(2)}|0⟩ + {Math.sin(theta / 2).toFixed(2)}|1⟩
              </span>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setTheta(0);
                  setCollapsedState(null);
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-[#4FD1D9] border border-white/10"
              >
                100% |0⟩
              </button>
              <button
                onClick={() => {
                  setTheta(Math.PI / 2);
                  setCollapsedState(null);
                }}
                className="px-2 py-0.5 rounded bg-[#D9A441]/20 hover:bg-[#D9A441]/30 text-[11px] font-mono text-[#D9A441] border border-[#D9A441]/30 font-bold"
              >
                50/50 (|+)
              </button>
              <button
                onClick={() => {
                  setTheta(Math.PI);
                  setCollapsedState(null);
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-[#D9A441] border border-white/10"
              >
                100% |1⟩
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-12">θ angle</span>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.02"
              value={theta}
              onChange={(e) => {
                setTheta(parseFloat(e.target.value));
                setCollapsedState(null);
              }}
              className="flex-1 accent-[#D9A441] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-xs font-mono text-[#D9A441] w-12 text-right">
              {Math.round((theta / Math.PI) * 180)}°
            </span>
          </div>
        </div>

        {/* Physical Chamber: Wave vs. Collapsed Particle */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Wave chamber */}
          <div className="md:col-span-7 bg-[#0A0E1A] border border-white/10 rounded-xl p-4 relative min-h-[210px] flex flex-col justify-between overflow-hidden">
            {/* Status watermark */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-white/5">
              <span>PHYSICAL QUANTUM STATE</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  collapsedState
                    ? 'bg-[#C1543A]/20 text-[#C1543A] border border-[#C1543A]/40'
                    : 'bg-[#4FD1D9]/20 text-[#4FD1D9] border border-[#4FD1D9]/40'
                }`}
              >
                {collapsedState ? 'COLLAPSED TO EIGENSTATE' : 'COHERENT SUPERPOSITION'}
              </span>
            </div>

            {/* Dynamic visual representation of the wave or collapsed particle */}
            <div className="my-auto py-6 flex items-center justify-center relative">
              {collapsedState === null ? (
                /* Continuous Wave Animation */
                <div className="w-full flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-full h-16 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-16" viewBox="0 0 300 60" preserveAspectRatio="none">
                      <path
                        d="M 0 30 Q 37.5 5, 75 30 T 150 30 T 225 30 T 300 30"
                        fill="none"
                        stroke="#4FD1D9"
                        strokeWidth="2.5"
                        className="animate-pulse opacity-80"
                      />
                      <path
                        d="M 0 30 Q 37.5 55, 75 30 T 150 30 T 225 30 T 300 30"
                        fill="none"
                        stroke="#D9A441"
                        strokeWidth="2"
                        className="opacity-60"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-[#4FD1D9]">Amplitude α: {Math.cos(theta / 2).toFixed(2)}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-[#D9A441]">Amplitude β: {Math.sin(theta / 2).toFixed(2)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 text-center">
                    Wavefunction simultaneously carries both possibilities. Unobserved & continuous.
                  </span>
                </div>
              ) : (
                /* Collapsed Discrete Eigenstate */
                <div className={`flex flex-col items-center justify-center space-y-3 animate-scale-in ${isCollapsing ? 'scale-75 opacity-50' : 'scale-100 opacity-100'} transition-all`}>
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-2xl border shadow-lg ${
                      collapsedState === '0'
                        ? 'bg-[#4FD1D9]/20 text-[#4FD1D9] border-[#4FD1D9] shadow-[#4FD1D9]/30'
                        : 'bg-[#D9A441]/20 text-[#D9A441] border-[#D9A441] shadow-[#D9A441]/30'
                    }`}
                  >
                    |{collapsedState}⟩
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-xs font-bold text-white">
                      Wavefunction Collapsed to |{collapsedState}⟩!
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Superposition destroyed. State is now a definite classical binary bit {collapsedState}.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Born Rule Probabilities Bar */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#4FD1D9]">Born Rule P(|0⟩) = |α|²: {prob0Percent}%</span>
                <span className="text-[#D9A441]">P(|1⟩) = |β|²: {prob1Percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#4FD1D9] transition-all duration-300"
                  style={{ width: `${prob0Percent}%` }}
                />
                <div
                  className="h-full bg-[#D9A441] transition-all duration-300"
                  style={{ width: `${prob1Percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detector Controls & Shot Accumulator */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#0A0E1A] border border-white/10 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Eye size={14} className="text-[#D9A441]" />
                Projective Measurement (Observer)
              </span>

              <button
                onClick={handleSingleMeasurement}
                disabled={isCollapsing}
                className="w-full py-2.5 rounded-xl bg-[#D9A441] hover:bg-[#c49235] text-[#0A0E1A] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Eye size={15} />
                <span>Trigger Measurement (1 Shot)</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleBatchShots(100)}
                  className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10 transition-colors"
                >
                  +100 Shots
                </button>
                <button
                  onClick={() => handleBatchShots(1024)}
                  className="py-1.5 px-2 rounded-lg bg-[#4FD1D9]/15 hover:bg-[#4FD1D9]/25 text-xs font-mono text-[#4FD1D9] border border-[#4FD1D9]/30 transition-colors font-bold"
                >
                  +1024 Shots
                </button>
              </div>

              {totalShots > 0 && (
                <button
                  onClick={handleReset}
                  className="w-full py-1 text-[11px] font-mono text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw size={11} />
                  <span>Reset Experiment & Shots</span>
                </button>
              )}
            </div>

            {/* Accumulated Histogram */}
            <div className="p-3.5 rounded-xl bg-[#0A0E1A] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <BarChart2 size={13} className="text-[#4FD1D9]" />
                  Detector Clicks ({totalShots} shots)
                </span>
                <span className="text-[10px] text-slate-400">
                  {totalShots === 0 ? 'Awaiting measurement' : 'Empirical Frequency'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
                <div className="bg-[#12172A] p-2.5 rounded-lg border border-white/5">
                  <div className="flex justify-between text-[#4FD1D9] mb-1">
                    <span>|0⟩ Clicks</span>
                    <strong>{counts['0']}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Observed: <strong className="text-white">{observedProb0}%</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Theory: {prob0Percent}%
                  </div>
                </div>

                <div className="bg-[#12172A] p-2.5 rounded-lg border border-white/5">
                  <div className="flex justify-between text-[#D9A441] mb-1">
                    <span>|1⟩ Clicks</span>
                    <strong>{counts['1']}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Observed: <strong className="text-white">{observedProb1}%</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Theory: {prob1Percent}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explanatory takeaway */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">The Born Rule in Action:</strong> Prior to observation, the qubit resides in an undisturbed continuous wave superposition. Every individual measurement triggers an irreversible collapse into either |0⟩ or |1⟩. Notice that as you run 100 or 1024 shots, the statistical frequency of discrete clicks converges precisely toward the square of the probability amplitudes (|α|² and |β|²)!
        </div>
      </div>
    </div>
  );
}
