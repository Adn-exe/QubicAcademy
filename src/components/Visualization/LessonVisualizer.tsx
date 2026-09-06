// ============================================================
// QuantumLearn AI — Interactive Lesson Visualizer
// Dedicated Educational Diagrams & Visual Representations for ALL 6 Syllabus Modules:
// 1. Superposition: 3D Bloch Sphere + Spinning Coin vs Qubit Diagram
// 2. Measurement: Wavefunction Collapse & Born Rule Chamber (MeasurementVisualizer)
// 3. Entanglement: Twin Particle Link & Bell State Synthesis + Measurement Test
// 4. Teleportation: 3-Qubit Protocol & Conditional Recovery (TeleportationVisualizer)
// 5. Grover's Search: Target Selector + Wave Inversion & 2D Geometric Rotation
// 6. Deutsch-Jozsa: Constant vs Balanced Oracle Selector & Phase Kickback
// Grounded in tokens: --signal-cyan (#4FD1D9), --cryostat-gold (#D9A441), --panel (#12172A)
// ============================================================

import { useState, useMemo } from 'react';
import { Bot, ExternalLink, RotateCcw, Link2, Eye, Compass, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useChatStore } from '../../core/store';
import { MeasurementVisualizer } from './MeasurementVisualizer';
import { TeleportationVisualizer } from './TeleportationVisualizer';

interface LessonVisualizerProps {
  moduleId: string;
  onOpenInBuilder?: () => void;
}

export function LessonVisualizer({ moduleId, onOpenInBuilder }: LessonVisualizerProps) {
  const navigate = useNavigate();
  const toggleTutor = useChatStore((s) => s.toggleTutor);
  const isTutorOpen = useChatStore((s) => s.isTutorOpen);

  // Dispatch dedicated chapter visualizers
  if (moduleId.includes('measurement')) {
    return <MeasurementVisualizer onOpenInBuilder={onOpenInBuilder} />;
  }

  if (moduleId.includes('teleportation')) {
    return <TeleportationVisualizer onOpenInBuilder={onOpenInBuilder} />;
  }

  // --- Module 1: Superposition States ---
  const [theta, setTheta] = useState(0); // initial |0>
  const [phi, setPhi] = useState(0);
  const [activeGate, setActiveGate] = useState<string>('INIT');
  const [isCoinSpinning, setIsCoinSpinning] = useState(false);
  const [coinResult, setCoinResult] = useState<'HEADS (0)' | 'TAILS (1)' | 'SPINNING SUPERPOSITION'>('SPINNING SUPERPOSITION');

  // --- Module 3: Entanglement States ---
  const [entanglementStep, setEntanglementStep] = useState(0);
  const [measuredAlice, setMeasuredAlice] = useState<'0' | '1' | null>(null);

  // --- Module 5: Grover States ---
  const [groverStep, setGroverStep] = useState(0);
  const [groverTarget, setGroverTarget] = useState<'00' | '01' | '10' | '11'>('11');
  const [groverViewMode, setGroverViewMode] = useState<'waves' | 'geometry'>('waves');

  // --- Module 6: Deutsch-Jozsa States ---
  const [djStep, setDjStep] = useState(0);
  const [djOracleType, setDjOracleType] = useState<'constant_0' | 'constant_1' | 'balanced_x' | 'balanced_not'>('balanced_x');

  // Calculate Bloch Vector components for superposition
  const blochVec = useMemo(() => {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    return { x, y, z };
  }, [theta, phi]);

  const prob0 = useMemo(() => Math.round(Math.cos(theta / 2) ** 2 * 100), [theta]);
  const prob1 = useMemo(() => 100 - prob0, [prob0]);

  const isGrover = moduleId.includes('grover');
  const isDeutschJozsa = moduleId.includes('deutsch');
  const isEntanglement = moduleId.includes('entanglement');

  // Dynamic plain-language caption
  const caption = useMemo(() => {
    if (isGrover) {
      if (groverStep === 0) return `1. Uniform Superposition: All 4 basis states start with equal amplitude +0.50 (25% probability).`;
      if (groverStep === 1) return `2. Oracle Phase Inversion: Target |${groverTarget}⟩ is marked by flipping its phase negative (-0.50). Average amplitude drops to +0.25.`;
      return `3. Diffusion (Inversion About Mean): Reflecting amplitudes across the mean (+0.25) amplifies target |${groverTarget}⟩ to 100% and cancels out non-targets!`;
    }
    if (isDeutschJozsa) {
      const isConstant = djOracleType.startsWith('constant');
      if (djStep === 0) return '1. Initialization: Input enters |+⟩, and ancilla enters |−⟩ preparing phase kickback.';
      if (djStep === 1) return `2. Oracle Evaluation: The ${isConstant ? 'constant' : 'balanced'} function transfers phase factor (-1)^f(x) back to the input register without measurement.`;
      return `3. Interference & Readout: Applying H to input causes ${isConstant ? 'constructive interference on |0⟩ (100% certainty) proving f is CONSTANT' : 'destructive cancellation of |0⟩ (measures |1⟩ with 100% certainty) proving f is BALANCED'} in a single query!`;
    }
    if (isEntanglement) {
      if (entanglementStep === 0) return 'Initial state |00⟩: both qubits are at ground state with 100% chance of measuring 00.';
      if (entanglementStep === 1) return 'Hadamard on q0 creates (|00⟩ + |10⟩)/√2: q0 is in equal superposition while q1 remains unentangled.';
      return 'CNOT entangles both qubits into Bell state (|00⟩ + |11⟩)/√2: measuring either particle instantaneously collapses the other!';
    }
    if (activeGate === 'H') return 'Rotating the qubit toward the equator creates an equal 50/50 superposition of |0⟩ and |1⟩.';
    if (activeGate === 'X') return 'Pauli-X flips the qubit 180° around the X-axis from the north pole |0⟩ to the south pole |1⟩.';
    if (activeGate === 'Z') return 'Pauli-Z applies a 180° phase flip around the Z-axis, reversing relative phase without altering Z-probabilities.';
    if (theta > 0 && theta < Math.PI) {
      return `Rotating the qubit toward the equator (${Math.round((theta / Math.PI) * 180)}°) changes the chance of measuring 1 to ${prob1}%.`;
    }
    return 'State |0⟩ at the north pole: measuring in the computational basis yields 0 with 100% certainty.';
  }, [isGrover, isDeutschJozsa, isEntanglement, activeGate, theta, prob1, groverStep, groverTarget, djStep, djOracleType, entanglementStep]);

  // Handle Preset gate clicks for Superposition
  const applyPreset = (gate: string) => {
    setActiveGate(gate);
    if (gate === 'RESET') {
      setTheta(0);
      setPhi(0);
    } else if (gate === 'H') {
      setTheta(Math.PI / 2);
      setPhi(0);
    } else if (gate === 'X') {
      setTheta(Math.PI);
      setPhi(0);
    } else if (gate === 'Z') {
      if (theta === 0) {
        setTheta(0);
      } else {
        setPhi((p) => (p + Math.PI) % (2 * Math.PI));
      }
    }
  };

  // Coin spin trigger
  const handleSpinCoin = () => {
    setIsCoinSpinning(true);
    setCoinResult('SPINNING SUPERPOSITION');
    setTimeout(() => {
      setIsCoinSpinning(false);
      const res = Math.random() < (prob0 / 100) ? 'HEADS (0)' : 'TAILS (1)';
      setCoinResult(res);
    }, 600);
  };

  // ============================================================
  // VIEW 1: SUPERPOSITION & SINGLE-QUBIT GATES (Module 1)
  // ============================================================
  if (!isGrover && !isDeutschJozsa && !isEntanglement) {
    return (
      <div className="w-full my-6 space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* 3D WebGL Bloch Sphere Canvas with OrbitControls */}
          <div className="md:col-span-7 h-[360px] w-full relative flex items-center justify-center rounded-2xl bg-[#0A0E1A] border border-white/10 overflow-hidden shadow-2xl">
            <Canvas
              style={{ width: '100%', height: '100%', display: 'block' }}
              camera={{ position: [2.3, 1.8, 2.3], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.7} />
              <pointLight position={[5, 5, 5]} intensity={0.9} />
              <pointLight position={[-4, -4, -4]} intensity={0.3} />
              <BlochSphere3DView vector={blochVec} />
              <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.7} />
            </Canvas>

            {/* State vector coordinate badge */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#12172A]/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 pointer-events-none shadow-md z-10">
              |ψ⟩ = [{blochVec.x.toFixed(2)}, {blochVec.y.toFixed(2)}, {blochVec.z.toFixed(2)}]
            </div>
          </div>

          {/* Controls & Gates */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <span className="text-xs font-mono text-slate-400 block mb-2">Gate Rotations</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '|0⟩ Ground', key: 'RESET' },
                  { label: 'H (Superposition)', key: 'H' },
                  { label: 'X (Bit Flip)', key: 'X' },
                  { label: 'Z (Phase Flip)', key: 'Z' },
                ].map((btn) => {
                  const isSelected = activeGate === btn.key;
                  return (
                    <button
                      key={btn.key}
                      onClick={() => applyPreset(btn.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        isSelected
                          ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 text-[#4FD1D9] border border-white/10 hover:border-[#4FD1D9]/40'
                      }`}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Angle Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Polar Angle θ</span>
                <span className="text-[#D9A441] font-semibold">{Math.round((theta / Math.PI) * 180)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.02"
                value={theta}
                onChange={(e) => {
                  setTheta(parseFloat(e.target.value));
                  setActiveGate('CUSTOM');
                }}
                className="w-full accent-[#D9A441] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Measurement Probabilities */}
            <div className="p-3.5 rounded-xl bg-[#0A0E1A] border border-white/10 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#4FD1D9] font-medium">P(|0⟩): {prob0}%</span>
                <span className="text-[#D9A441] font-medium">P(|1⟩): {prob1}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#4FD1D9] transition-all duration-200"
                  style={{ width: `${prob0}%` }}
                />
                <div
                  className="h-full bg-[#D9A441] transition-all duration-200"
                  style={{ width: `${prob1}%` }}
                />
              </div>
            </div>

            {/* Caption & Ask Tutor */}
            <div className="flex items-center justify-between gap-3 text-xs pt-1">
              <span className="text-slate-400 italic text-xs leading-relaxed">{caption}</span>
              <button
                onClick={toggleTutor}
                className="flex items-center gap-1.5 text-xs text-[#4FD1D9] hover:text-[#D9A441] transition-colors shrink-0 ml-2"
                title="Ask AI Tutor"
              >
                <Bot size={13} />
                <span>Ask Tutor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Educational Diagram: Classical Bit vs Quantum Qubit Superposition */}
        <div className="p-5 rounded-2xl bg-[#0A0E1A] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <Compass size={14} className="text-[#D9A441]" />
              VISUAL INTUITION: THE SPINNING COIN ANALOGY
            </span>
            <button
              onClick={handleSpinCoin}
              className="px-3 py-1 rounded-lg bg-[#D9A441] hover:bg-[#c49235] text-[#0A0E1A] text-xs font-bold font-mono transition-all shadow-sm"
            >
              {isCoinSpinning ? 'Slapping hand down...' : 'Spin / Flip Coin ➔'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Classical Bit Box */}
            <div className="p-4 rounded-xl bg-[#12172A] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-slate-300 font-bold font-mono">
                <span>Classical Bit</span>
                <span className="text-slate-400">Static / Binary</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                A coin resting on a flat table is either completely <strong>Heads (0)</strong> or <strong>Tails (1)</strong>. It cannot exist in any intermediate state.
              </p>
              <div className="h-14 flex items-center justify-center bg-[#0A0E1A] rounded-lg font-mono font-bold text-[#4FD1D9]">
                State ∈ {'{ 0, 1 }'}
              </div>
            </div>

            {/* Quantum Qubit Box */}
            <div className="p-4 rounded-xl bg-[#12172A] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[#D9A441] font-bold font-mono">
                <span>Quantum Qubit</span>
                <span className="text-[#4FD1D9]">Continuous Superposition</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Spin the coin rapidly: while spinning, it is a <strong>simultaneous continuous blend</strong> of both states. Only when observed (slapped down) does it collapse!
              </p>
              <div className="h-14 flex items-center justify-center bg-[#0A0E1A] rounded-lg font-mono font-bold text-[#D9A441] border border-[#D9A441]/20">
                {isCoinSpinning ? (
                  <span className="animate-pulse">Spinning: α|0⟩ + β|1⟩ ...</span>
                ) : (
                  <span>Observation: {coinResult}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MULTI-QUBIT MODULES: Entanglement, Grover, Deutsch-Jozsa
  // ============================================================
  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-[#12172A] text-slate-100 overflow-hidden shadow-xl animate-fade-in">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-[#0A0E1A]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#4FD1D9]">
            {isGrover
              ? "Grover's Search Algorithm & Wave Interference Engine"
              : isDeutschJozsa
              ? 'Deutsch-Jozsa Parallelism & Oracle Decision Engine'
              : 'Quantum Entanglement & Bell State Protocol Lab'}
          </span>
        </div>

        <button
          onClick={toggleTutor}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            isTutorOpen
              ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
              : 'bg-[#4FD1D9]/10 text-[#4FD1D9] border border-[#4FD1D9]/30 hover:bg-[#4FD1D9]/20'
          }`}
          title="Ask AI Tutor about this visualizer"
        >
          <Bot size={13} />
          <span>Ask AI Tutor</span>
        </button>
      </div>

      <div className="p-5">
        {/* ============================================================
            MODULE 5: GROVER'S SEARCH ALGORITHM
           ============================================================ */}
        {isGrover ? (
          <div className="space-y-5">
            {/* Top Toolbar: Search Target Selector & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Search Target |ω⟩:</span>
                {(['00', '01', '10', '11'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setGroverTarget(t);
                      setGroverStep(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      groverTarget === t
                        ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    |{t}⟩
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10 text-xs font-mono">
                  <button
                    onClick={() => setGroverViewMode('waves')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                      groverViewMode === 'waves' ? 'bg-[#4FD1D9] text-[#0A0E1A] font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Waves size={13} />
                    <span>Wave Amplitudes</span>
                  </button>
                  <button
                    onClick={() => setGroverViewMode('geometry')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                      groverViewMode === 'geometry' ? 'bg-[#4FD1D9] text-[#0A0E1A] font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass size={13} />
                    <span>2D Geometric Plane</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  disabled={groverStep === 0}
                  onClick={() => setGroverStep((s) => Math.max(0, s - 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
                >
                  ← Step Back
                </button>
                <button
                  disabled={groverStep === 2}
                  onClick={() => setGroverStep((s) => Math.min(2, s + 1))}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D9A441] text-[#0A0E1A] text-xs font-bold hover:bg-[#c49235] disabled:opacity-30 transition-colors shadow-xs"
                >
                  Step Forward →
                </button>
                <button
                  onClick={() => setGroverStep(0)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Reset Grover steps"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Phase {groverStep + 1} of 3: {groverStep === 0 ? 'Equal Superposition' : groverStep === 1 ? 'Oracle Phase Inversion' : 'Diffusion Reflection'}
              </span>
            </div>

            {/* VIEW A: Wave Amplitudes & Inversion About the Mean */}
            {groverViewMode === 'waves' ? (
              <div className="p-4 rounded-xl bg-[#0A0E1A] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>State Amplitudes & Average Inversion Line</span>
                  <span className="text-[#D9A441]">
                    Mean Threshold: {groverStep === 0 ? '+0.50' : '+0.25'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-4 pb-2 items-end h-44">
                  {(['00', '01', '10', '11'] as const).map((st) => {
                    const isTarget = st === groverTarget;
                    const amp = groverStep === 0
                      ? 0.5
                      : groverStep === 1
                      ? isTarget ? -0.5 : 0.5
                      : isTarget ? 1.0 : 0.0;

                    const heightPercent = Math.abs(amp) * 100;
                    const isNegative = amp < 0;

                    return (
                      <div key={st} className="flex flex-col items-center h-full justify-end">
                        <span
                          className="text-[11px] font-mono font-bold mb-1"
                          style={{ color: isTarget ? '#D9A441' : '#4FD1D9' }}
                        >
                          {amp >= 0 ? `+${amp.toFixed(2)}` : amp.toFixed(2)}
                        </span>
                        <div className="w-full bg-[#12172A] h-32 rounded-lg relative overflow-hidden flex flex-col justify-center items-center border border-white/5">
                          {/* Mean indicator line */}
                          <div
                            className="absolute w-full border-b border-dashed border-[#D9A441]/60 z-10"
                            style={{ bottom: groverStep === 0 ? '50%' : '25%' }}
                          />
                          <div
                            className="w-full transition-all duration-300 rounded"
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: isTarget
                                ? isNegative ? '#C1543A' : '#D9A441'
                                : '#4FD1D9',
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono mt-2 text-slate-300 font-bold">
                          |{st}⟩ {isTarget && '(Target)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VIEW B: 2D Geometric Plane Rotation Subspace */
              <div className="p-4 rounded-xl bg-[#0A0E1A] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>2D Subspace Rotation: Plane spanned by |s'⟩ and |ω⟩</span>
                  <span className="text-[#D9A441]">
                    Angle θ = {groverStep === 0 ? '30°' : groverStep === 1 ? '-30° (Phase Flipped)' : '90° (Target Aligned)'}
                  </span>
                </div>

                <div className="relative w-full h-44 flex items-center justify-center">
                  <svg className="w-72 h-40" viewBox="0 0 200 120">
                    {/* Axes */}
                    <line x1="20" y1="100" x2="180" y2="100" stroke="#4FD1D9" strokeWidth="1.5" strokeOpacity="0.4" />
                    <line x1="20" y1="100" x2="20" y2="15" stroke="#D9A441" strokeWidth="1.5" strokeOpacity="0.4" />
                    <text x="182" y="104" fill="#4FD1D9" fontSize="9" fontFamily="monospace">|s'⟩</text>
                    <text x="15" y="10" fill="#D9A441" fontSize="9" fontFamily="monospace">|ω⟩ Target</text>

                    {/* State Vector Arrow */}
                    {groverStep === 0 && (
                      <g>
                        <line x1="20" y1="100" x2="85" y2="62" stroke="#4FD1D9" strokeWidth="2.5" />
                        <circle cx="85" cy="62" r="3.5" fill="#4FD1D9" />
                        <text x="92" y="62" fill="#4FD1D9" fontSize="9" fontFamily="monospace">|s⟩ (Equal)</text>
                      </g>
                    )}
                    {groverStep === 1 && (
                      <g>
                        <line x1="20" y1="100" x2="85" y2="115" stroke="#C1543A" strokeWidth="2.5" strokeDasharray="3,3" />
                        <circle cx="85" cy="115" r="3.5" fill="#C1543A" />
                        <text x="92" y="115" fill="#C1543A" fontSize="9" fontFamily="monospace">Oracle Flipped</text>
                      </g>
                    )}
                    {groverStep === 2 && (
                      <g>
                        <line x1="20" y1="100" x2="20" y2="25" stroke="#D9A441" strokeWidth="3" />
                        <circle cx="20" cy="25" r="4" fill="#D9A441" />
                        <text x="28" y="32" fill="#D9A441" fontSize="10" fontWeight="bold" fontFamily="monospace">100% |ω⟩</text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* Probability Gauge */}
            <div className="p-3 rounded-xl bg-[#0A0E1A] border border-white/5 space-y-1.5">
              <span className="text-xs font-mono text-slate-400 block">Probability of Measuring Target |{groverTarget}⟩</span>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#D9A441] transition-all duration-300"
                  style={{ width: groverStep === 2 ? '100%' : '25%' }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400 pt-1">
                <span>P(|{groverTarget}⟩): <strong className="text-[#D9A441]">{groverStep === 2 ? '100%' : '25%'}</strong></span>
                <span>Wrong States: {groverStep === 2 ? '0%' : '75%'}</span>
              </div>
            </div>
          </div>
        ) : isDeutschJozsa ? (
          /* ============================================================
             MODULE 6: DEUTSCH-JOZSA ALGORITHM
             ============================================================ */
          <div className="space-y-5">
            {/* Oracle Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400">Black-Box Function f(x):</span>
                <button
                  onClick={() => {
                    setDjOracleType('constant_0');
                    setDjStep(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    djOracleType === 'constant_0'
                      ? 'bg-[#4FD1D9] text-[#0A0E1A] shadow-xs'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  Constant (All 0s)
                </button>
                <button
                  onClick={() => {
                    setDjOracleType('constant_1');
                    setDjStep(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    djOracleType === 'constant_1'
                      ? 'bg-[#4FD1D9] text-[#0A0E1A] shadow-xs'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  Constant (All 1s)
                </button>
                <button
                  onClick={() => {
                    setDjOracleType('balanced_x');
                    setDjStep(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    djOracleType === 'balanced_x'
                      ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  Balanced: f(x)=x
                </button>
                <button
                  onClick={() => {
                    setDjOracleType('balanced_not');
                    setDjStep(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    djOracleType === 'balanced_not'
                      ? 'bg-[#D9A441] text-[#0A0E1A] shadow-xs'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  Balanced: f(x)=NOT(x)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={djStep === 0}
                  onClick={() => setDjStep((s) => Math.max(0, s - 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
                >
                  ← Step Back
                </button>
                <button
                  disabled={djStep === 2}
                  onClick={() => setDjStep((s) => Math.min(2, s + 1))}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D9A441] text-[#0A0E1A] text-xs font-bold hover:bg-[#c49235] disabled:opacity-30 transition-colors shadow-xs"
                >
                  Step Forward →
                </button>
                <button
                  onClick={() => setDjStep(0)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Reset DJ steps"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Circuit Wire Diagram */}
            <div className="p-4 rounded-xl bg-[#0A0E1A] border border-white/5 space-y-4">
              {/* Wire 0 (Input) */}
              <div className="flex items-center gap-4">
                <span className="w-16 text-xs font-mono text-[#4FD1D9]">q[0] Input</span>
                <div className="flex-1 h-0.5 bg-[#4FD1D9]/30 relative flex items-center">
                  <div className={`absolute left-10 w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${djStep >= 0 ? 'bg-[#12172A] text-[#4FD1D9] border-[#4FD1D9]' : 'opacity-20'}`}>
                    H
                  </div>
                  <div className={`absolute left-32 w-3.5 h-3.5 rounded-full ${djStep >= 1 ? 'bg-[#D9A441]' : 'opacity-20 bg-slate-600'}`} />
                  <div className={`absolute left-56 w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${djStep >= 2 ? 'bg-[#D9A441] text-[#0A0E1A] border-[#D9A441]' : 'opacity-20'}`}>
                    H
                  </div>
                </div>
              </div>

              {/* Wire 1 (Ancilla) */}
              <div className="flex items-center gap-4">
                <span className="w-16 text-xs font-mono text-slate-400">q[1] Ancilla</span>
                <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center">
                  <div className="absolute left-2 w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] bg-[#12172A] text-[#D9A441] border border-[#D9A441]/40">
                    X
                  </div>
                  <div className="absolute left-10 w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-[#12172A] text-[#4FD1D9] border border-[#4FD1D9]">
                    H
                  </div>
                  <div className={`absolute left-32 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${djStep >= 1 ? 'bg-[#D9A441] text-[#0A0E1A] border-[#D9A441]' : 'opacity-20 border-slate-600 text-slate-600'}`}>
                    {djOracleType.startsWith('constant') ? 'I' : '⊕'}
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict Card */}
            <div className="p-4 rounded-xl bg-[#0A0E1A] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-slate-400 block mb-1">Measurement Outcome on Input Register q[0]</span>
                <span className="text-sm font-bold text-white font-mono">
                  {djStep < 2
                    ? 'Superposition evolving...'
                    : djOracleType.startsWith('constant')
                    ? 'Outcome = |0⟩ (100% Probability)'
                    : 'Outcome = |1⟩ (100% Probability)'}
                </span>
              </div>

              <div
                className={`px-4 py-1.5 rounded-xl font-mono font-bold text-xs border ${
                  djStep < 2
                    ? 'bg-white/5 text-slate-400 border-white/10'
                    : djOracleType.startsWith('constant')
                    ? 'bg-[#4FD1D9]/20 text-[#4FD1D9] border-[#4FD1D9]/40 shadow-sm'
                    : 'bg-[#D9A441]/20 text-[#D9A441] border-[#D9A441]/40 shadow-sm'
                }`}
              >
                {djStep < 2 ? 'EVALUATING...' : djOracleType.startsWith('constant') ? 'FUNCTION IS CONSTANT' : 'FUNCTION IS BALANCED'}
              </div>
            </div>
          </div>
        ) : isEntanglement ? (
          /* ============================================================
             MODULE 3: ENTANGLEMENT & BELL STATES
             ============================================================ */
          <div className="space-y-5">
            {/* Stepper Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  disabled={entanglementStep === 0}
                  onClick={() => {
                    setEntanglementStep((s) => Math.max(0, s - 1));
                    setMeasuredAlice(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
                >
                  ← Step Back
                </button>
                <button
                  disabled={entanglementStep === 2}
                  onClick={() => {
                    setEntanglementStep((s) => Math.min(2, s + 1));
                    setMeasuredAlice(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D9A441] text-[#0A0E1A] text-xs font-bold hover:bg-[#c49235] disabled:opacity-30 transition-colors shadow-xs"
                >
                  Step Forward →
                </button>
                <button
                  onClick={() => {
                    setEntanglementStep(0);
                    setMeasuredAlice(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Reset steps"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              <span className="text-xs font-mono text-slate-400">
                Step {entanglementStep + 1} of 3: {entanglementStep === 0 ? 'Ground State |00⟩' : entanglementStep === 1 ? 'H on q0' : 'CNOT(0,1) Entangles Pair'}
              </span>
            </div>

            {/* Visual Diagram: Twin Entangled Particles Link */}
            <div className="p-4 rounded-xl bg-[#0A0E1A] border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/5">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Link2 size={14} className={entanglementStep === 2 ? 'text-[#D9A441]' : 'text-slate-500'} />
                  Non-Local Correlation Diagram (Alice in London & Bob in Sydney)
                </span>
                <span className={`text-[11px] font-bold ${entanglementStep === 2 ? 'text-[#D9A441]' : 'text-slate-500'}`}>
                  {entanglementStep === 2 ? 'ENTANGLED |Φ⁺⟩' : 'SEPARABLE'}
                </span>
              </div>

              {/* Two particles connected by glowing link */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-2 items-center py-3">
                {/* Particle A (Alice) */}
                <div className="md:col-span-4 p-3 rounded-xl bg-[#12172A] border border-white/5 space-y-1 text-center">
                  <div className="text-[11px] font-mono text-slate-400">Alice (London) &bull; Qubit 0</div>
                  <div className="text-sm font-bold font-mono text-[#4FD1D9]">
                    {measuredAlice !== null ? `Collapsed: |${measuredAlice}⟩` : entanglementStep === 0 ? '|0⟩' : '(|0⟩ + |1⟩)/√2'}
                  </div>
                </div>

                {/* Quantum Entanglement Link */}
                <div className="md:col-span-3 flex flex-col items-center justify-center">
                  <div className="w-full h-1 relative flex items-center justify-center">
                    <div className={`w-full h-0.5 ${entanglementStep === 2 ? 'bg-[#D9A441] animate-pulse shadow-md shadow-[#D9A441]/50' : 'bg-slate-700'}`} />
                    {entanglementStep === 2 && (
                      <div className="absolute px-2 py-0.5 rounded bg-[#D9A441] text-[#0A0E1A] font-mono font-bold text-[10px]">
                        Bell Link
                      </div>
                    )}
                  </div>
                </div>

                {/* Particle B (Bob) */}
                <div className="md:col-span-4 p-3 rounded-xl bg-[#12172A] border border-white/5 space-y-1 text-center">
                  <div className="text-[11px] font-mono text-slate-400">Bob (Sydney) &bull; Qubit 1</div>
                  <div className="text-sm font-bold font-mono text-[#D9A441]">
                    {measuredAlice !== null ? `Instant Collapse: |${measuredAlice}⟩` : entanglementStep < 2 ? '|0⟩' : 'Correlated with A'}
                  </div>
                </div>
              </div>

              {/* Interactive Measurement Test Button */}
              {entanglementStep === 2 && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12172A] p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-300">
                    Click to test non-local collapse: observe how Bob instantly matches Alice!
                  </span>
                  <button
                    onClick={() => {
                      const res = Math.random() < 0.5 ? '0' : '1';
                      setMeasuredAlice(res);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#D9A441] hover:bg-[#c49235] text-[#0A0E1A] font-mono font-bold text-xs transition-all shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    <Eye size={13} />
                    <span>Measure Alice's Qubit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Synced Probability Histogram */}
            <div className="p-3.5 rounded-xl bg-[#0A0E1A] border border-white/5">
              <span className="text-xs font-mono text-slate-400 block mb-2">Synced Composite Outcome Probabilities</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {[
                  { state: '|00⟩', val: entanglementStep === 0 ? 100 : 50 },
                  { state: '|01⟩', val: 0 },
                  { state: '|10⟩', val: entanglementStep === 1 ? 50 : 0 },
                  { state: '|11⟩', val: entanglementStep === 2 ? 50 : 0 },
                ].map((item) => (
                  <div key={item.state} className="bg-[#12172A] p-2.5 rounded-lg border border-white/5">
                    <div className="text-slate-400 mb-1">{item.state}</div>
                    <div
                      className="font-bold transition-all text-sm"
                      style={{ color: item.val > 0 ? (item.val === 100 ? '#4E9E7B' : '#D9A441') : '#64748B' }}
                    >
                      {item.val}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Caption footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-400 leading-relaxed font-sans italic">
            {caption}
          </p>

          <button
            onClick={() => {
              if (onOpenInBuilder) {
                onOpenInBuilder();
              } else {
                navigate('/lab');
              }
            }}
            className="text-[#D9A441] hover:underline font-medium inline-flex items-center gap-1 shrink-0 font-sans"
          >
            <span>Open in full circuit builder</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}



// 3D Bloch Sphere Mesh (WebGL / Three.js)
function BlochSphere3DView({ vector }: { vector: { x: number; y: number; z: number } }) {
  const axes = useMemo(
    () => [
      { from: [-1.35, 0, 0] as [number, number, number], to: [1.35, 0, 0] as [number, number, number], label: 'X', color: '#4FD1D9' },
      { from: [0, -1.35, 0] as [number, number, number], to: [0, 1.35, 0] as [number, number, number], label: 'Z', color: '#4FD1D9' },
      { from: [0, 0, -1.35] as [number, number, number], to: [0, 0, 1.35] as [number, number, number], label: 'Y', color: '#4FD1D9' },
    ],
    []
  );

  return (
    <group>
      {/* Wireframe outer sphere */}
      <mesh>
        <sphereGeometry args={[1, 28, 28]} />
        <meshBasicMaterial color="#4FD1D9" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Semi-transparent inner sphere surface */}
      <mesh>
        <sphereGeometry args={[0.99, 32, 32]} />
        <meshPhongMaterial color="#12172A" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Equator circle ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1, 64]} />
        <meshBasicMaterial color="#4FD1D9" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Axes and text labels */}
      {axes.map((axis) => (
        <group key={axis.label}>
          <Line points={[axis.from, axis.to]} color={axis.color} lineWidth={1.2} transparent opacity={0.4} />
          <Html center position={axis.to}>
            <span style={{ color: axis.color, fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', userSelect: 'none', pointerEvents: 'none' }}>
              {axis.label}
            </span>
          </Html>
        </group>
      ))}

      {/* |0⟩ North and |1⟩ South labels */}
      <Html center position={[0, 1.25, 0]}>
        <span style={{ color: '#4FD1D9', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold', userSelect: 'none', pointerEvents: 'none', textShadow: '0 0 10px rgba(79,209,217,0.6)' }}>
          |0⟩
        </span>
      </Html>
      <Html center position={[0, -1.25, 0]}>
        <span style={{ color: '#D9A441', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold', userSelect: 'none', pointerEvents: 'none', textShadow: '0 0 10px rgba(217,164,65,0.6)' }}>
          |1⟩
        </span>
      </Html>

      {/* Golden State Vector Arrow & Tip */}
      <group>
        <Line points={[[0, 0, 0], [vector.x, vector.z, vector.y]]} color="#D9A441" lineWidth={3.8} />
        <mesh position={[vector.x, vector.z, vector.y]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial color="#D9A441" />
        </mesh>
      </group>
    </group>
  );
}


