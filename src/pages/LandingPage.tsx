// ============================================================
// QuantumLearn AI — Clean & Professional Landing Page
// Grounded in exact design tokens:
// --void: #0A0E1A, --panel: #12172A, --signal-cyan: #4FD1D9, --cryostat-gold: #D9A441
// ============================================================

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Atom,
  Cpu,
  Brain,
  BarChart3,
  Orbit,
  ChevronRight,
  BookOpen,
  Trophy,
  Code2,
  CheckCircle2,
  Play,
  ArrowRight,
  Zap,
  Terminal,
  Link2,
  Radio,
  Search,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { allModules } from '../data/modules/superposition-module';
import { useProgressStore, useChatStore } from '../core/store';
import Scanner from '../components/Visualization/Scanner';

function getCourseModuleIcon(iconName: string, size = 22) {
  switch (iconName) {
    case 'atom':
      return <Atom size={size} className="text-[#4FD1D9] light:text-[#20878E]" />;
    case 'bar-chart':
      return <BarChart3 size={size} className="text-[#4FD1D9] light:text-[#20878E]" />;
    case 'link':
      return <Link2 size={size} className="text-[#4FD1D9] light:text-[#20878E]" />;
    case 'radio':
      return <Radio size={size} className="text-[#4FD1D9] light:text-[#20878E]" />;
    case 'search':
      return <Search size={size} className="text-[#4FD1D9] light:text-[#20878E]" />;
    case 'zap':
      return <Zap size={size} className="text-[#4FD1D9] light:text-[#20878E]" />;
    default:
      return <Atom size={size} className="text-[#4FD1D9] light:text-[#20878E]" />;
  }
}

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Platform Overview',
    question: 'What is Qubiq Academy and who is it designed for?',
    answer:
      'Qubiq Academy is an interactive, browser-based quantum computing learning platform. It is engineered for students, software engineers, and researchers seeking an intuitive, mathematically grounded pathway into quantum information science. We bridge theoretical linear algebra and practical circuit engineering through visual simulations, Bloch sphere projections, and hands-on algorithm challenges.',
  },
  {
    category: 'Prerequisites',
    question: 'Do I need advanced quantum physics or higher math to start?',
    answer:
      'No prior physics background is necessary. Basic high school algebra and a curiosity for logic are plenty. Our curriculum starts from square one—introducing qubits, the Bloch Sphere, and single-qubit rotations—before progressively advancing to multi-qubit entanglement, phase kickback, and algorithms like Grover’s Search and Deutsch-Jozsa.',
  },
  {
    category: 'Simulation Architecture',
    question: 'How does the in-browser quantum simulator work?',
    answer:
      'The simulator calculates exact state vectors, complex probability amplitudes, and matrix tensor products directly inside your browser using client-side Web Workers and mathjs. You receive instant, deterministic feedback and probabilistic measurement histograms without physical hardware queues or cloud compute costs.',
  },
  {
    category: 'Qiskit & OpenQASM',
    question: 'Can I export my circuits to IBM Qiskit or OpenQASM?',
    answer:
      'Yes. Every circuit you build visually in the Lab or challenge workspace can be exported directly to standard OpenQASM 2.0 or executable Python code for IBM Qiskit with a single click, allowing you to run your designs on real quantum processors.',
  },
  {
    category: 'Accounts & Sync',
    question: 'How is my progress saved across devices?',
    answer:
      'When signed in, your solved problems, completed curriculum modules, custom circuits, and streak milestones are securely synchronized in real time to your cloud profile via encrypted Supabase storage protected by Row-Level Security.',
  },
  {
    category: 'Pricing',
    question: 'Is Qubiq Academy free to use?',
    answer:
      'Yes, Qubiq Academy provides full access to interactive course modules, the open quantum circuit lab, state vector visualizations, and algorithm challenge sets completely free for learners worldwide.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const progress = useProgressStore((s) => s.progress);
  const setTutorOpen = useChatStore((s) => s.setTutorOpen);

  // Interactive Hero Preview State
  const [activePreset, setActivePreset] = useState<'bell' | 'superposition' | 'x_flip'>('bell');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen text-[var(--ink)] flex flex-col items-center w-full bg-[var(--void)] transition-colors duration-250 overflow-x-hidden">
      {/* ============================================================
          1. FULL-VIEWPORT SPLIT SCREEN HERO SECTION
         ============================================================ */}
      <section className="relative w-full min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden py-10 lg:py-0">
        {/* WebGL Scanner Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <Scanner
            color1="#1A0B3B"
            color2="#4FD1D9"
            color3="#D9A441"
            speed={0.4}
            sweepSpeed={0.2}
            sweepWidth={1.6}
            sweepFalloff={6}
            scale={1.5}
            frequency={2}
            ripple={0.22}
            bandDensity={11}
            lineSharpness={5.5}
            glow={0.25}
            scanDirection="vertical"
            colorSpread={0.7}
            brightness={1.0}
            contrast={1.15}
            softness={1.4}
            vignette={0.45}
            scanline={true}
            grain={true}
            grainIntensity={0.05}
            opacity={0.75}
            mouseInteraction={true}
            mouseRadius={0.5}
            mouseStrength={0.5}
          />
        </div>

        {/* Smooth Edge Fades — Ensures Scanner does not bleed into other sections */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[var(--void)] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--void)] via-[var(--void)]/85 to-transparent pointer-events-none z-10" />

        {/* Hero Split-Screen Container */}
        <div className="relative z-20 px-6 max-w-7xl w-full mx-auto my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: BADGE + TITLE + ACTIONS */}
            <div className="lg:col-span-5 text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0E1A]/80 backdrop-blur-md border border-[#4FD1D9]/30 text-[#4FD1D9] text-xs font-medium hover:border-[#4FD1D9]/50 transition-colors shadow-lg">
                <Orbit size={14} className="text-[#4FD1D9]" />
                <span>Interactive Quantum Learning Platform</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4E9E7B] animate-pulse" />
              </div>

              {/* Main Headline (2-3 lines) */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.18] font-heading drop-shadow-md max-w-lg">
                Learn Quantum<br />
                Computing Through<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FD1D9] via-[#7FE5EC] to-[#D9A441]">
                  Interactive Practice
                </span>
              </h1>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1">
                <button
                  onClick={() => navigate('/learn/superposition-single-qubit')}
                  className="btn-primary text-xs sm:text-sm px-5 py-3 w-full sm:w-auto shadow-xl shadow-[#D9A441]/10 cursor-pointer"
                >
                  <BookOpen size={16} />
                  <span>Start Guided Course</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate('/lab')}
                  className="btn-secondary text-xs sm:text-sm px-5 py-3 w-full sm:w-auto backdrop-blur-md bg-[#0A0E1A]/80 hover:bg-[#12172A] cursor-pointer"
                >
                  <Cpu size={16} className="text-[#4FD1D9]" />
                  <span>Open Circuit Lab</span>
                </button>
              </div>

              {/* Progress Alert */}
              {progress.completedModules.length > 0 && (
                <div className="pt-1 inline-flex items-center gap-3.5 px-3.5 py-1.5 rounded-xl bg-[#12172A]/90 backdrop-blur-md border border-[#4E9E7B]/30 text-xs text-slate-300">
                  <span className="text-[#4E9E7B] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    {progress.completedModules.length} Module completed
                  </span>
                  <span className="text-[#D9A441] font-semibold flex items-center gap-1.5">
                    <Trophy size={13} />
                    {progress.completedChallenges.length} Challenge passed
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: MAC-STYLE COMPOSER STUDIO WINDOW (Slightly Decreased Size) */}
            <div className="lg:col-span-7 w-full max-w-xl lg:max-w-[580px] mx-auto lg:ml-auto">
              <div className="rounded-2xl border border-[#4FD1D9]/25 light:border-black/10 bg-[#12172A]/90 light:bg-[#FAF9F5] shadow-2xl light:shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden backdrop-blur-xl transition-all">
                {/* macOS Window Header (Clean Titlebar with status indicator) */}
                <div className="h-10 px-4 bg-[#080B14] light:bg-[#EAE8E1] border-b border-white/10 light:border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />
                    </div>
                    <span className="ml-2 text-xs font-mono font-medium text-slate-300 light:text-slate-800 truncate">
                      composer.qasm &mdash; Qubiq Academy Studio
                    </span>
                  </div>

                  {/* Engine Status Indicator */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] light:bg-black/[0.04] border border-white/10 light:border-black/10 text-[10px] font-mono text-slate-400 light:text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4E9E7B] animate-pulse" />
                    <span>QASM Live</span>
                  </div>
                </div>

                {/* Dedicated Circuit Presets Toolbar (Spacious & Clean) */}
                <div className="px-4 py-2.5 bg-[#0E1322] light:bg-[#F3F2EC] border-b border-white/10 light:border-black/10 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-400 light:text-slate-600 font-semibold uppercase tracking-wider shrink-0">
                    Preset Circuit
                  </span>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setActivePreset('bell')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activePreset === 'bell'
                          ? 'bg-[var(--cryostat-gold)] text-[#0A0E1A] font-bold shadow-md'
                          : 'bg-white/[0.04] light:bg-white text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-white/[0.08] light:hover:bg-slate-50 border border-white/10 light:border-black/10 light:shadow-xs'
                      }`}
                    >
                      Bell State
                    </button>
                    <button
                      onClick={() => setActivePreset('superposition')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activePreset === 'superposition'
                          ? 'bg-[var(--cryostat-gold)] text-[#0A0E1A] font-bold shadow-md'
                          : 'bg-white/[0.04] light:bg-white text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-white/[0.08] light:hover:bg-slate-50 border border-white/10 light:border-black/10 light:shadow-xs'
                      }`}
                    >
                      Superposition
                    </button>
                    <button
                      onClick={() => setActivePreset('x_flip')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        activePreset === 'x_flip'
                          ? 'bg-[var(--cryostat-gold)] text-[#0A0E1A] font-bold shadow-md'
                          : 'bg-white/[0.04] light:bg-white text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-white/[0.08] light:hover:bg-slate-50 border border-white/10 light:border-black/10 light:shadow-xs'
                      }`}
                    >
                      Pauli-X
                    </button>
                  </div>
                </div>

                {/* Interactive Workspace Body */}
                <div className="p-4 sm:p-4.5 space-y-3">
                  {/* Visual Circuit Canvas Simulation */}
                  <div className="bg-[#0A0E1A] light:bg-white rounded-xl p-3.5 sm:p-4 border border-white/5 light:border-black/10 light:shadow-xs space-y-3">
                    {/* Qubit 0 Wire */}
                    <div className="flex items-center gap-4">
                      <span className="w-10 text-xs font-mono font-bold text-[#4FD1D9] light:text-[#20878E]">q[0]</span>
                      <div className="flex-1 h-0.5 bg-[#4FD1D9]/25 light:bg-[#20878E]/30 relative flex items-center">
                        <div className="absolute left-8">
                          {activePreset === 'bell' && (
                            <span className="w-8 h-8 rounded-lg bg-[#12172A] light:bg-white text-[#4FD1D9] light:text-[#20878E] font-mono font-bold text-xs flex items-center justify-center shadow border border-[#4FD1D9] light:border-[#20878E]">
                              H
                            </span>
                          )}
                          {activePreset === 'superposition' && (
                            <span className="w-8 h-8 rounded-lg bg-[#D9A441] text-[#0A0E1A] font-mono font-bold text-xs flex items-center justify-center shadow border border-[#D9A441]">
                              H
                            </span>
                          )}
                          {activePreset === 'x_flip' && (
                            <span className="w-8 h-8 rounded-lg bg-[#D9A441] text-[#0A0E1A] font-mono font-bold text-xs flex items-center justify-center shadow border border-[#D9A441]">
                              X
                            </span>
                          )}
                        </div>
                        {activePreset === 'bell' && (
                          <div className="absolute left-32">
                            <span className="w-4 h-4 rounded-full bg-[#4FD1D9] flex items-center justify-center text-[#0A0E1A] font-bold text-xs">
                              ●
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Qubit 1 Wire */}
                    <div className="flex items-center gap-4">
                      <span className="w-10 text-xs font-mono font-bold text-[#4FD1D9] light:text-[#20878E]">q[1]</span>
                      <div className="flex-1 h-0.5 bg-[#4FD1D9]/25 light:bg-[#20878E]/30 relative flex items-center">
                        {activePreset === 'bell' && (
                          <div className="absolute left-32">
                            <span className="w-6 h-6 rounded-full bg-[#4FD1D9] text-[#0A0E1A] font-bold text-xs flex items-center justify-center">
                              ⊕
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Readout Panels (Probabilities & Statevector) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Probability Breakdown */}
                    <div className="p-3.5 rounded-xl bg-[#0A0E1A]/80 light:bg-white border border-white/5 light:border-black/10 light:shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-400 light:text-slate-600">
                        <span className="font-medium">Measurement Probabilities</span>
                        <span className="font-mono text-[11px] text-[#4FD1D9] light:text-[#20878E]">1024 Shots</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-mono text-slate-300 light:text-slate-800 mb-1">
                            <span>|00⟩</span>
                            <span className="text-[#4FD1D9] light:text-[#20878E] font-semibold">{activePreset === 'bell' ? '50.0%' : activePreset === 'superposition' ? '50.0%' : '0.0%'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4FD1D9] rounded-full transition-all duration-300"
                              style={{
                                width: activePreset === 'bell' ? '50%' : activePreset === 'superposition' ? '50%' : '0%',
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-mono text-slate-300 light:text-slate-800 mb-1">
                            <span>{activePreset === 'bell' ? '|11⟩' : '|01⟩'}</span>
                            <span className="text-[#D9A441] font-semibold">{activePreset === 'bell' ? '50.0%' : activePreset === 'superposition' ? '50.0%' : '100.0%'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D9A441] rounded-full transition-all duration-300"
                              style={{
                                width: activePreset === 'bell' ? '50%' : activePreset === 'superposition' ? '50%' : '100%',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statevector Math */}
                    <div className="p-3.5 rounded-xl bg-[#0A0E1A]/80 light:bg-white border border-white/5 light:border-black/10 light:shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="text-xs text-slate-400 light:text-slate-600 font-medium mb-0.5">Quantum Statevector |ψ⟩</div>
                        <div className="text-[11px] text-slate-500 light:text-slate-500">Complex State Amplitude</div>
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-semibold text-[#4FD1D9] light:text-[#20878E] bg-[#0A0E1A] light:bg-[#F3F2EC] p-2.5 rounded-lg border border-[#4FD1D9]/20 light:border-[#20878E]/30 text-center my-1.5">
                        {activePreset === 'bell' && '|Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩)'}
                        {activePreset === 'superposition' && '|ψ⟩ = 1/√2 (|0⟩ + |1⟩)'}
                        {activePreset === 'x_flip' && '|ψ⟩ = |1⟩'}
                      </div>
                      <button
                        onClick={() => navigate('/lab')}
                        className="text-xs text-[#D9A441] hover:underline font-medium flex items-center justify-end gap-1 cursor-pointer"
                      >
                        <span>Open Interactive Lab</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          3. CORE FEATURES BENTO GRID
         ============================================================ */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Everything Required to Master Quantum Logic
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Built from scratch to bridge mathematical quantum theory and visual interactive intuition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Cpu,
              title: 'Visual Gate Palette',
              desc: 'Single-qubit gates (H, X, Y, Z, S, T, Rotations) and multi-qubit gates (CNOT, SWAP) on customizable wires.',
              badge: 'Intuitive Drag & Drop',
            },
            {
              icon: BarChart3,
              title: '3D Bloch Spheres',
              desc: 'Interactive Three.js Bloch sphere visualization: axes in Signal-Cyan and state vector in Cryostat-Gold.',
              badge: 'Real-Time 3D',
            },
            {
              icon: Code2,
              title: 'Qiskit Python Sync',
              desc: 'Two-way synchronization between visual circuit layout and industry-standard Qiskit Python code.',
              badge: 'Monaco Editor',
            },
            {
              icon: Brain,
              title: 'Contextual AI Tutor',
              desc: 'Context-aware quantum mentor in dedicated paper surface explains circuits, identifies bugs, and answers questions.',
              badge: 'Real-Time Guidance',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#4FD1D9]/10 border border-[#4FD1D9]/20 text-[#4FD1D9] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 font-heading">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-6 border-t border-white/5 mt-6 text-[11px] font-mono text-[#4FD1D9]">
                  {item.badge}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          4. CURRICULUM MODULES
         ============================================================ */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full border-t border-white/10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#4FD1D9] font-semibold mb-1 flex items-center gap-1.5">
              <Zap size={13} />
              <span>Structured Learning Path</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
              Interactive Courses
            </h2>
          </div>
          <button
            onClick={() => navigate('/learn/superposition-single-qubit')}
            className="text-xs font-medium text-[#4FD1D9] hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-4">
          {allModules.map((mod) => {
            const isCompleted = progress.completedModules.includes(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => navigate(`/learn/${mod.id}`)}
                className="glass-card p-5 sm:p-6 cursor-pointer group flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0A0E1A] light:bg-slate-100 border border-white/10 light:border-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#4FD1D9]/50 transition-all shadow-xs">
                    {getCourseModuleIcon(mod.icon, 22)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-white group-hover:text-[#4FD1D9] transition-colors font-heading">
                        {mod.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[#4FD1D9]/10 text-[#4FD1D9] border border-[#4FD1D9]/20">
                        {mod.difficulty}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-lg">{mod.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                      <span>~{mod.estimatedMinutes} min</span>
                      <span>•</span>
                      <span>{mod.sections.length} interactive sections</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isCompleted ? (
                    <span className="text-xs text-[#4E9E7B] font-semibold px-3 py-1.5 rounded-lg bg-[#4E9E7B]/10 border border-[#4E9E7B]/25 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Completed
                    </span>
                  ) : (
                    <span className="btn-secondary text-xs px-3.5 py-2 group-hover:bg-[#4FD1D9] group-hover:text-[#0A0E1A] transition-all">
                      Start
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          5. GAMIFIED CHALLENGE SHOWCASE
         ============================================================ */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full border-t border-white/10 light:border-slate-300">
        <div className="glass-card p-8 sm:p-10 border border-[#D9A441]/25 light:border-slate-300 relative overflow-hidden bg-gradient-to-br from-[#12172A] via-[#12172A] to-[#1A233D] light:from-white light:via-white light:to-slate-50 light:shadow-md transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9A441]/15 border border-[#D9A441]/30 text-[#D9A441] text-xs font-semibold">
                <Trophy size={14} />
                <span>Hands-On Coding Challenge</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white light:text-slate-900 font-heading">
                Challenge: Build a Bell State
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 light:text-slate-700 leading-relaxed max-w-xl">
                Create a 2-qubit circuit that transforms state |00⟩ into maximally entangled Bell state |Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩). Pass automated verification to claim your reward.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/challenge/bell-state')}
                  className="btn-primary text-xs sm:text-sm px-6 py-3"
                >
                  <Play size={15} fill="currentColor" />
                  <span>Solve Challenge</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-4 bg-[#0A0E1A] light:bg-slate-100 p-5 rounded-xl border border-white/10 light:border-slate-300 text-center font-mono space-y-2">
              <div className="text-[11px] text-slate-400 light:text-slate-600 uppercase tracking-wider">Target State</div>
              <div className="text-sm font-bold text-[#D9A441] py-2 bg-[#12172A] light:bg-white rounded border border-[#D9A441]/20 light:border-[#D9A441]/40">
                |Φ⁺⟩ = 1/√2(|00⟩ + |11⟩)
              </div>
              <div className="text-xs text-slate-500 light:text-slate-600">Reward: 100 XP</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION
         ============================================================ */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full border-t border-white/10 light:border-slate-300">
        <div className="space-y-10">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#4FD1D9]/10 text-[#4FD1D9] light:text-[#20878E] border border-[#4FD1D9]/25 light:border-[#20878E]/30 text-xs font-mono font-medium">
              <HelpCircle size={13} />
              <span>FAQ & Knowledge Base</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white light:text-slate-900 font-heading tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 max-w-lg mx-auto leading-relaxed">
              Everything you need to know about learning quantum computing, our simulation engine, curriculum tracks, and tools.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#12172A] light:bg-white border-[#4FD1D9]/40 light:border-[#20878E]/40 shadow-sm'
                      : 'bg-[#0A0E1A]/80 light:bg-slate-50 border-white/10 light:border-slate-200 hover:border-white/20 light:hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between text-left gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#D9A441] font-semibold">
                        {faq.category}
                      </div>
                      <h3 className="text-sm sm:text-[15px] font-semibold text-white light:text-slate-900 leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-[#4FD1D9]/15 text-[#4FD1D9] light:bg-[#20878E]/15 light:text-[#20878E] rotate-180'
                          : 'bg-white/5 light:bg-slate-200 text-slate-400'
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-[13px] text-slate-300 light:text-slate-700 leading-relaxed border-t border-white/5 light:border-slate-100 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Help Banner */}
          <div className="p-6 rounded-xl bg-[#12172A] light:bg-slate-100 border border-white/10 light:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white light:text-slate-900">
                Ready to experiment with quantum states?
              </h4>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Step directly into the visual drag-and-drop workspace or solve foundational algorithm challenges.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/lab')}
                className="px-4 py-2 rounded-lg bg-[#4FD1D9] hover:bg-[#3bb8c0] text-[#0A0E1A] font-semibold text-xs transition-colors shadow-sm"
              >
                Open Lab
              </button>
              <button
                onClick={() => navigate('/learn/superposition-single-qubit')}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 light:bg-white border border-white/10 light:border-slate-300 text-xs text-white light:text-slate-900 font-medium transition-colors"
              >
                Start Curriculum
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. PROFESSIONAL CLEAN FOOTER
         ============================================================ */}
      <footer className="mt-auto border-t border-white/10 bg-[#0A0E1A] text-xs text-slate-400 w-full">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5 text-white font-bold font-heading">
                <div className="w-7 h-7 rounded-lg bg-[#D9A441] flex items-center justify-center text-[#0A0E1A] shadow-md">
                  <Atom size={16} strokeWidth={2.2} />
                </div>
                <span className="text-sm">Qubiq <span className="text-[#4FD1D9]">Academy</span></span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                An interactive quantum computing sandbox combining mathematical rigor, 3D visualization, and real-time AI guidance.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#4E9E7B]">
                <span className="w-2 h-2 rounded-full bg-[#4E9E7B] animate-pulse" />
                <span>Simulation Engine: Online</span>
              </div>
            </div>

            {/* Column 2: Curriculum */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Curriculum</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate('/learn/superposition-single-qubit')} className="hover:text-white transition-colors">Foundations & Superposition</button></li>
                <li><button onClick={() => navigate('/learn/quantum-measurement')} className="hover:text-white transition-colors">Measurement & Born Rule</button></li>
                <li><button onClick={() => navigate('/learn/entanglement-bell-states')} className="hover:text-white transition-colors">Entanglement & Bell States</button></li>
                <li><button onClick={() => navigate('/learn/grovers-search')} className="hover:text-white transition-colors">Grover's Search Algorithm</button></li>
              </ul>
            </div>

            {/* Column 3: Tools & Features */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Tools</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate('/lab')} className="hover:text-white transition-colors">Interactive Circuit Builder</button></li>
                <li><button onClick={() => navigate('/challenge/bell-state')} className="hover:text-white transition-colors">Verification Challenges</button></li>
                <li><button onClick={() => setTutorOpen(true)} className="hover:text-white transition-colors">AI Contextual Tutor</button></li>
                <li><button onClick={() => navigate('/lab')} className="hover:text-white transition-colors">Qiskit Code Generation</button></li>
              </ul>
            </div>

            {/* Column 4: Platform Specs */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Architecture</h4>
              <ul className="space-y-2 text-xs font-mono text-slate-400">
                <li className="flex items-center gap-1.5"><Terminal size={12} className="text-[#4FD1D9]" /> State Vector Simulation</li>
                <li className="flex items-center gap-1.5"><Terminal size={12} className="text-[#D9A441]" /> WebGL 3D Bloch Spheres</li>
                <li className="flex items-center gap-1.5"><Terminal size={12} className="text-[#4FD1D9]" /> Strict Design Tokens</li>
                <li className="flex items-center gap-1.5"><Terminal size={12} className="text-[#4E9E7B]" /> Client-Side Execution</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 Qubiq Academy. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Quantum Specs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
