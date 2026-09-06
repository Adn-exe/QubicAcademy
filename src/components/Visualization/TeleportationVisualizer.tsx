// ============================================================
// QuantumLearn AI — Quantum Teleportation Protocol Visualizer
// Chapter 4: Interactive 3-Qubit Protocol & Conditional Recovery
// Tokens: --signal-cyan (#4FD1D9), --cryostat-gold (#D9A441), --panel (#12172A)
// ============================================================

import { useState } from 'react';
import { Radio, RotateCcw, Bot, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useChatStore } from '../../core/store';

interface TeleportationVisualizerProps {
  onOpenInBuilder?: () => void;
}

export function TeleportationVisualizer({ onOpenInBuilder: _ }: TeleportationVisualizerProps) {
  const toggleTutor = useChatStore((s) => s.toggleTutor);
  const isTutorOpen = useChatStore((s) => s.isTutorOpen);

  // Input state |ψ⟩ to teleport: |0>, |1>, |+>, |->
  const [selectedInputState, setSelectedInputState] = useState<'0' | '1' | '+' | '-'>('+');
  
  // Protocol timeline step: 0 to 3
  const [step, setStep] = useState<number>(0);

  // Classical bits measured by Alice (simulated randomly for educational realism)
  const [classicalBits, setClassicalBits] = useState<{ m1: number; m0: number }>({ m1: 0, m0: 1 });

  const inputStateLabel = {
    '0': '|0⟩',
    '1': '|1⟩',
    '+': '|+⟩ = (|0⟩ + |1⟩)/√2',
    '-': '|−⟩ = (|0⟩ - |1⟩)/√2',
  }[selectedInputState];

  const handleStepForward = () => {
    if (step === 0) {
      // Simulate Alice's measurement result randomly across 4 possibilities
      const r = Math.floor(Math.random() * 4);
      const m1 = (r >> 1) & 1;
      const m0 = r & 1;
      setClassicalBits({ m1, m0 });
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleReset = () => {
    setStep(0);
  };

  const stepDescriptions = [
    {
      title: 'Step 1: Entanglement Distribution',
      desc: 'Alice holds unknown state |ψ⟩ and entangled qubit A. Bob holds entangled qubit B. The Bell pair (|00⟩ + |11⟩)/√2 connects them across any distance.',
    },
    {
      title: "Step 2: Alice's Bell Measurement",
      desc: "Alice performs a CNOT with |ψ⟩ as control and qubit A as target, then applies Hadamard (H) to |ψ⟩. Both of Alice's qubits are measured into 2 classical bits (m₁, m₀). Notice: Alice's original state |ψ⟩ is permanently destroyed, upholding the No-Cloning theorem!",
    },
    {
      title: 'Step 3: Classical Bit Transmission',
      desc: `Alice transmits the 2 classical measurement bits (m₁=${classicalBits.m1}, m₀=${classicalBits.m0}) to Bob through a conventional classical network at the speed of light.`,
    },
    {
      title: "Step 4: Bob's Unitary Reconstruction",
      desc: `Bob inspects the bits (m₁=${classicalBits.m1}, m₀=${classicalBits.m0}) and applies conditional gates X^m₁ · Z^m₀ to his qubit B. Bob's qubit is now IDENTICAL to Alice's original state |ψ⟩ with 100% fidelity!`,
    },
  ];

  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-[#12172A] text-slate-100 overflow-hidden shadow-xl animate-fade-in">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-[#0A0E1A]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#4FD1D9]">
            Quantum Teleportation Protocol Simulator
          </span>
        </div>

        <button
          onClick={toggleTutor}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            isTutorOpen
              ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
              : 'bg-[#4FD1D9]/10 text-[#4FD1D9] border border-[#4FD1D9]/30 hover:bg-[#4FD1D9]/20'
          }`}
          title="Ask AI Tutor about teleportation"
        >
          <Bot size={13} />
          <span>Ask AI Tutor</span>
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* State Selection & Stepper Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Target State |ψ⟩:</span>
            {(['0', '1', '+', '-'] as const).map((st) => (
              <button
                key={st}
                disabled={step > 0}
                onClick={() => setSelectedInputState(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedInputState === st
                    ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 disabled:opacity-40'
                }`}
              >
                |{st}⟩
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              ← Step Back
            </button>
            <button
              disabled={step === 3}
              onClick={handleStepForward}
              className="px-3.5 py-1.5 rounded-lg bg-[#D9A441] text-[#0A0E1A] text-xs font-bold hover:bg-[#c49235] disabled:opacity-30 transition-colors shadow-xs"
            >
              Step Forward →
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Reset protocol"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Protocol Visualizer Diagram (Alice vs Bob) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Alice's Laboratory (Left) */}
          <div className="md:col-span-6 p-4 rounded-xl bg-[#0A0E1A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4FD1D9]" />
                <span className="text-xs font-mono font-bold text-white">ALICE'S LABORATORY</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Transmitter</span>
            </div>

            {/* Qubit 0 (Target state) */}
            <div className="p-3 rounded-lg bg-[#12172A] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#4FD1D9] font-bold">q[0]: Input State |ψ⟩</span>
                <span className="text-[#D9A441] font-bold">{inputStateLabel}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className={`px-2 py-1 rounded text-[11px] font-mono border ${step >= 1 ? 'bg-[#D9A441]/20 text-[#D9A441] border-[#D9A441]/40' : 'bg-white/5 text-slate-400 border-white/5'}`}>
                  {step >= 1 ? 'CNOT Control ➔ H Gate' : 'Holding |ψ⟩'}
                </div>
                {step >= 1 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C1543A]/20 text-[#C1543A] border border-[#C1543A]/40">
                    State Collapsed (m₁={classicalBits.m1})
                  </span>
                )}
              </div>
            </div>

            {/* Qubit 1 (Alice's Entangled Pair Qubit A) */}
            <div className="p-3 rounded-lg bg-[#12172A] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold">q[1]: Alice's Bell Qubit A</span>
                <span className="text-[11px] font-mono text-[#4FD1D9]">Entangled with Bob</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className={`px-2 py-1 rounded text-[11px] font-mono border ${step >= 1 ? 'bg-[#D9A441]/20 text-[#D9A441] border-[#D9A441]/40' : 'bg-white/5 text-slate-400 border-white/5'}`}>
                  {step >= 1 ? 'CNOT Target ➔ Measure' : 'Bell Pair (|00⟩+|11⟩)/√2'}
                </div>
                {step >= 1 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C1543A]/20 text-[#C1543A] border border-[#C1543A]/40">
                    State Collapsed (m₀={classicalBits.m0})
                  </span>
                )}
              </div>
            </div>

            {/* Alice's measurement status */}
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] font-mono text-slate-400">
              {step === 0 && 'Ready to execute Bell-state measurement.'}
              {step >= 1 && (
                <span className="text-[#4FD1D9] font-bold">
                  Bell measurement completed! Classical bits emitted: [{classicalBits.m1}, {classicalBits.m0}]
                </span>
              )}
            </div>
          </div>

          {/* Bob's Laboratory (Right) */}
          <div className="md:col-span-6 p-4 rounded-xl bg-[#0A0E1A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9A441]" />
                <span className="text-xs font-mono font-bold text-white">BOB'S LABORATORY</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Receiver</span>
            </div>

            {/* Qubit 2 (Bob's Entangled Pair Qubit B) */}
            <div className="p-3 rounded-lg bg-[#12172A] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#D9A441] font-bold">q[2]: Bob's Target Qubit B</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {step === 3 ? 'RECONSTRUCTED' : 'Awaiting Bits'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className={`px-2 py-1 rounded text-[11px] font-mono border ${step === 3 ? 'bg-[#4E9E7B]/20 text-[#4E9E7B] border-[#4E9E7B]/40 font-bold' : 'bg-white/5 text-slate-400 border-white/5'}`}>
                  {step === 3
                    ? `Applied Correction: ${classicalBits.m1 ? 'X' : 'I'} · ${classicalBits.m0 ? 'Z' : 'I'}`
                    : 'Uncorrected Entangled Subsystem'}
                </div>
              </div>
            </div>

            {/* Bob's Reconstructed State Display */}
            <div className={`p-3 rounded-xl border transition-all ${step === 3 ? 'bg-[#4E9E7B]/10 border-[#4E9E7B]/30' : 'bg-[#12172A] border-white/5'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
                  {step === 3 && <CheckCircle2 size={13} className="text-[#4E9E7B]" />}
                  Bob's Reconstructed Quantum State
                </span>
                <span className={`text-xs font-mono font-bold ${step === 3 ? 'text-[#4E9E7B]' : 'text-slate-500'}`}>
                  {step === 3 ? 'Fidelity 100%' : 'Incomplete'}
                </span>
              </div>

              <div className="text-sm font-mono font-bold pt-1" style={{ color: step === 3 ? '#4FD1D9' : '#64748B' }}>
                {step === 3 ? inputStateLabel : 'State is still scrambled (Requires 2 classical bits)'}
              </div>
            </div>

            {/* No-cloning safeguard note */}
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <ShieldAlert size={14} className="text-[#D9A441] shrink-0 mt-0.5" />
              <span>
                <strong>No-Cloning Compliant:</strong> The original state on Alice's qubit q[0] was irreversibly destroyed during Bell measurement before Bob reconstructed it. Information was transferred, never cloned!
              </span>
            </div>
          </div>
        </div>

        {/* Classical Channel Visual Conduit (Middle Bar) */}
        <div className="p-3 rounded-xl bg-[#0A0E1A] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Radio size={14} className={step >= 2 ? 'text-[#4FD1D9] animate-pulse' : 'text-slate-600'} />
            <span className="text-slate-400">Classical Communication Channel:</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-bold">
              {step >= 2 ? `Bits [m₁=${classicalBits.m1}, m₀=${classicalBits.m0}]` : 'Awaiting Transmission'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {step < 2 ? (
              <span>Classical channel inactive</span>
            ) : step === 2 ? (
              <span className="text-[#D9A441] font-bold animate-pulse flex items-center gap-1">
                <Send size={12} />
                Transmitting bits across channel...
              </span>
            ) : (
              <span className="text-[#4E9E7B] font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                Bits delivered to Bob!
              </span>
            )}
          </div>
        </div>

        {/* Step Progress & Educational Explanation */}
        <div className="p-4 rounded-xl bg-[#0A0E1A] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#D9A441] font-bold">{stepDescriptions[step].title}</span>
            <span className="text-slate-400">Phase {step + 1} of 4</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {stepDescriptions[step].desc}
          </p>
        </div>
      </div>
    </div>
  );
}
