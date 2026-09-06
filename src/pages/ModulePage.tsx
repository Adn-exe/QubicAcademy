// ============================================================
// QuantumLearn AI — Course Learning Experience
// Column 1 (Left): Study Navigator (Sidebar with Syllabus, Glossary & Notes tabs)
// Column 2 (Center): Spacious Lesson Content (--paper background, expanded max-w-4xl)
// Exact Tokens: --void, --panel, --paper, --ink, --signal-cyan, --cryostat-gold, --error, --success
// ============================================================

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  CheckCircle2,
  Clock,
  BookOpen,
  Bot,
  FileText,
  Bookmark,
  Check,
  X,
  Play,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  Atom,
  BarChart3,
  Link2,
  Radio,
  Search,
  Zap,
  Cpu,
} from 'lucide-react';
import { courseTracks, allModules } from '../data/modules/superposition-module';
import { useCircuitStore, useProgressStore, useChatStore } from '../core/store';
import { LessonVisualizer } from '../components/Visualization/LessonVisualizer';
import { CircuitCanvas } from '../components/CircuitBuilder/CircuitCanvas';
import { GatePalette } from '../components/CircuitBuilder/GatePalette';
import { VisualizationPanel } from '../components/Visualization/Charts';
import { BlochSpherePanel } from '../components/Visualization/BlochSphere';

function getTrackModuleIcon(iconName: string, size = 16) {
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

export function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  // Progress store
  const progress = useProgressStore((s) => s.progress);
  const completeModule = useProgressStore((s) => s.completeModule);

  // Circuit store for inline "Try it yourself"
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);
  const simulationResult = useCircuitStore((s) => s.simulationResult);
  const circuit = useCircuitStore((s) => s.circuit);
  const runSimulation = useCircuitStore((s) => s.runSimulation);

  // AI Tutor store
  const toggleTutor = useChatStore((s) => s.toggleTutor);

  // Active module & track
  const currentModule = allModules.find((m) => m.id === moduleId) || allModules[0];
  const currentTrack = courseTracks.find((t) => t.id === currentModule.trackId) || courseTracks[0];

  // Accordion state for track groups (Left panel)
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({
    [currentTrack.id]: true,
    foundations: true,
    circuits: true,
    algorithms: false,
  });

  // Sidebar Tab: 'syllabus' | 'glossary' | 'notes' (Study Navigator)
  const [sidebarTab, setSidebarTab] = useState<'syllabus' | 'glossary' | 'notes'>('syllabus');

  // Auto-populate circuit sandbox when module changes
  useEffect(() => {
    const secWithCircuit = currentModule.sections.find((s) => s.preloadedCircuit);
    if (secWithCircuit?.preloadedCircuit) {
      loadCircuit(secWithCircuit.preloadedCircuit);
    }
  }, [currentModule.id, loadCircuit]);

  // Reference to lesson content container to reset scroll position on module change
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      contentRef.current.scrollTop = 0;
    }
  }, [currentModule.id]);

  // Notes state persisted per module
  const [notes, setNotes] = useState<string>('');
  useEffect(() => {
    const saved = localStorage.getItem(`quantumlearn-note-${currentModule.id}`) || '';
    setNotes(saved);
  }, [currentModule.id]);

  const handleSaveNotes = (val: string) => {
    setNotes(val);
    localStorage.setItem(`quantumlearn-note-${currentModule.id}`, val);
  };

  // Study Navigator desktop collapse/expand state
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);

  // Quiz state: selected options & submitted checks
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Mobile drawer state for sidebar
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Track accordion toggler
  const toggleTrack = (trackId: string) => {
    setExpandedTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  // Calculation of overall course progress
  const completedCount = progress.completedModules.length;
  const totalModuleCount = allModules.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalModuleCount) * 100));

  // Current module index in sequence
  const currentModuleIndex = allModules.findIndex((m) => m.id === currentModule.id);
  const prevModule = currentModuleIndex > 0 ? allModules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < allModules.length - 1 ? allModules[currentModuleIndex + 1] : null;

  // Determine if all quiz questions for this module are completed correctly
  const hasPassedQuiz =
    !currentModule.quiz ||
    currentModule.quiz.every((q) => quizSubmitted[q.id] && quizAnswers[q.id] === q.correctIndex);

  // Handle quiz option selection
  const handleSelectQuiz = (qId: string, optIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleCheckQuiz = (qId: string) => {
    setQuizSubmitted((prev) => ({ ...prev, [qId]: true }));
  };

  // Mark module complete and navigate to next
  const handleCompleteAndProceed = () => {
    completeModule(currentModule.id);
    if (nextModule) {
      navigate(`/learn/${nextModule.id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--void)] overflow-hidden">
      {/* ============================================================
          TOP BAR: Module Title, Progress Bar, Back Link
         ============================================================ */}
      <div className="h-13 px-4 sm:px-6 bg-[#12172A] light:bg-[#F7F6F1] border-b border-white/10 light:border-slate-300 flex items-center justify-between shrink-0 z-20 transition-colors">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="shrink-0 text-xs text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Back to Overview</span>
          </button>

          <span className="text-slate-600 hidden sm:inline shrink-0">|</span>

          {/* Desktop Toggle Study Navigator */}
          <button
            onClick={() => setIsNavigatorCollapsed((c) => !c)}
            className="hidden md:flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A0E1A] light:bg-white text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black border border-white/10 light:border-slate-300 light:shadow-xs text-xs font-medium transition-colors cursor-pointer"
            title={isNavigatorCollapsed ? 'Expand Study Navigator' : 'Collapse Study Navigator for full width reading'}
          >
            {isNavigatorCollapsed ? (
              <>
                <PanelLeftOpen size={14} className="text-[#4FD1D9] light:text-[#20878E]" />
                <span>Study Navigator</span>
              </>
            ) : (
              <>
                <PanelLeftClose size={14} />
                <span>Hide Navigator</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 truncate min-w-0">
            <span className="shrink-0 flex items-center justify-center">{getTrackModuleIcon(currentModule.icon)}</span>
            <span className="text-xs sm:text-sm font-bold text-white light:text-slate-900 font-heading truncate">
              {currentModule.title}
            </span>
          </div>
        </div>

        {/* Course Progress Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-mono text-slate-400">
              Course Progress: <strong className="text-[#4FD1D9]">{progressPercent}%</strong>
            </span>
            <div className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #4FD1D9 0%, #D9A441 100%)',
                }}
              />
            </div>
          </div>

          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setMobileDrawerOpen((o) => !o)}
            className="md:hidden p-1.5 rounded-lg bg-[#0A0E1A] text-slate-300 border border-white/10"
            title="Toggle Syllabus & Study Navigator"
          >
            <BookOpen size={16} />
          </button>
        </div>
      </div>

      {/* ============================================================
          THREE-COLUMN MAIN WORKSPACE
         ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ============================================================
            COLUMN 1 (LEFT): Module Navigation (Sidebar, --panel bg)
           ============================================================ */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-30 md:z-auto
            bg-[#12172A] light:bg-[#EFEFE9] border-r border-white/10 light:border-black/10 flex flex-col shrink-0
            transition-all duration-300 ease-in-out overflow-hidden
            ${mobileDrawerOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0'}
            ${isNavigatorCollapsed ? 'md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0' : 'md:w-80 md:opacity-100'}
          `}
        >
          {/* Header with Title & Tab Switcher */}
          <div className="p-3.5 border-b border-white/10 light:border-black/10 space-y-3 min-w-[320px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300 light:text-slate-700">
                  Study Navigator
                </span>
                <span className="text-[11px] font-mono text-[#D9A441] bg-[#D9A441]/10 px-1.5 py-0.5 rounded">
                  {completedCount}/{totalModuleCount} Done
                </span>
              </div>
              <button
                onClick={() => {
                  setIsNavigatorCollapsed(true);
                  setMobileDrawerOpen(false);
                }}
                className="p-1 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black hover:bg-white/5 light:hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                title="Collapse or close Study Navigator"
              >
                <X size={16} className="md:hidden" />
                <ChevronLeft size={16} className="hidden md:block" />
              </button>
            </div>

            {/* Navigation Tabs: Syllabus, Glossary, Notes */}
            <div className="flex p-1 rounded-xl bg-[#0A0E1A] light:bg-[#E2E0D8] border border-white/5 light:border-black/10 gap-1">
              {[
                { key: 'syllabus', label: 'Syllabus', icon: BookOpen },
                { key: 'glossary', label: 'Glossary', icon: Bookmark },
                { key: 'notes', label: 'Notes', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = sidebarTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSidebarTab(tab.key as any)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-[#4FD1D9]/20 text-[#4FD1D9] border border-[#4FD1D9]/30 font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: Syllabus & Modules */}
          {sidebarTab === 'syllabus' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {courseTracks.map((track) => {
                const isExpanded = expandedTracks[track.id] ?? true;
                const trackModules = allModules.filter((m) => track.moduleIds.includes(m.id));

                return (
                  <div key={track.id} className="rounded-xl bg-[#0A0E1A]/40 border border-white/5 overflow-hidden">
                    {/* Track Header (Accordion Clickable) */}
                    <button
                      onClick={() => toggleTrack(track.id)}
                      className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        {track.title}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Modules within Track */}
                    {isExpanded && (
                      <div className="py-1 space-y-0.5">
                        {trackModules.map((m) => {
                          const isCurrent = m.id === currentModule.id;
                          const isCompleted = progress.completedModules.includes(m.id);
                          const isLocked =
                            m.prerequisites.length > 0 &&
                            !m.prerequisites.every((req) => progress.completedModules.includes(req));

                          return (
                            <button
                              key={m.id}
                              disabled={isLocked}
                              onClick={() => {
                                navigate(`/learn/${m.id}`);
                                setMobileDrawerOpen(false);
                              }}
                              className={`
                                w-full px-3 py-2 text-left flex items-center justify-between transition-all group
                                ${
                                  isCurrent
                                    ? 'border-l-3 border-[#D9A441] bg-white/5 text-white font-medium pl-[9px]'
                                    : 'border-l-3 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                                }
                                ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {isLocked ? (
                                  <Lock size={12} className="text-slate-500 shrink-0" />
                                ) : isCompleted ? (
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] shrink-0 shadow-xs" />
                                ) : isCurrent ? (
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#4FD1D9] shrink-0 ring-2 ring-[#4FD1D9]/30" />
                                ) : (
                                  <span className="w-2.5 h-2.5 rounded-full border border-slate-600 shrink-0" />
                                )}

                                <span className="text-xs truncate">{m.title}</span>
                              </div>

                              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5 shrink-0 ml-2">
                                <Clock size={10} />
                                {m.estimatedMinutes}m
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Glossary */}
          {sidebarTab === 'glossary' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Bookmark size={14} className="text-[#D9A441]" />
                <span className="font-mono uppercase tracking-wider text-[11px]">Key Terminology</span>
              </div>

              {currentModule.glossary && currentModule.glossary.length > 0 ? (
                currentModule.glossary.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#0A0E1A]/60 border border-white/5 space-y-1 hover:border-[#4FD1D9]/30 transition-all group"
                  >
                    <h4 className="text-xs font-bold text-[#4FD1D9] group-hover:text-white transition-colors">
                      {item.term}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.definition}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic p-2">No terms defined for this module.</p>
              )}
            </div>
          )}

          {/* TAB 3: Notes */}
          {sidebarTab === 'notes' && (
            <div className="flex-1 flex flex-col p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[11px]">
                  <FileText size={14} className="text-[#D9A441]" />
                  Your Notes ({currentModule.title})
                </span>
                <span className="text-[10px] text-slate-500">Auto-saved</span>
              </div>

              <textarea
                value={notes}
                onChange={(e) => handleSaveNotes(e.target.value)}
                placeholder="Record derivations, ideas, and notes on this module..."
                className="flex-1 w-full bg-[#0A0E1A] border border-white/10 rounded-xl p-3 text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#D9A441]/50 resize-none leading-relaxed"
              />
            </div>
          )}
        </aside>

        {/* Mobile backdrop for drawer */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
          />
        )}

        {/* ============================================================
            COLUMN 2 (CENTER): Lesson Reading Content (Adaptive paper surface)
           ============================================================ */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto paper-surface relative flex flex-col items-center"
        >
          <div className={`w-full px-6 sm:px-12 py-10 space-y-10 text-left transition-all duration-300 ${isNavigatorCollapsed ? 'max-w-5xl' : 'max-w-4xl'}`}>
            {/* 1. Module Title & Meta */}
            <div className="border-b border-white/10 pb-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                <span>Track: {currentTrack.title}</span>
                <span>•</span>
                <span>{currentModule.difficulty}</span>
                <span>•</span>
                <span>{currentModule.estimatedMinutes} min read</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight font-heading text-inherit">
                {currentModule.title}
              </h1>
              <p className="mt-3 text-base opacity-80 leading-relaxed font-sans">
                {currentModule.description}
              </p>
            </div>

            {/* 2. Section Explanations */}
            {currentModule.sections.map((section, idx) => {
              // Place the Bloch sphere (or primary algorithm visualizer) directly after "What is a Qubit?"
              const isQubitConcept = section.id === 'what-is-qubit';
              const isFirstConceptFallback = !currentModule.sections.some((s) => s.id === 'what-is-qubit') && idx === 0;
              const shouldRenderVisualizerHere = isQubitConcept || isFirstConceptFallback;

              return (
                <div key={section.id} className="space-y-4">
                  <h2 className="text-xl font-bold font-heading text-inherit">
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-invert light:prose-slate max-w-none leading-relaxed text-sm sm:text-base opacity-90
                      [&_p]:mb-4 [&_p]:leading-relaxed
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5
                      [&_strong]:font-semibold [&_strong]:text-inherit
                      [&_code]:text-[#4FD1D9] light:[&_code]:text-[#1B1E24] [&_code]:bg-[#12172A] light:[&_code]:bg-slate-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:border [&_code]:border-white/10 light:[&_code]:border-slate-300
                    "
                    dangerouslySetInnerHTML={{ __html: formatModuleContent(section.content) }}
                  />

                  {/* Inline "Ask AI Tutor" about this section */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={toggleTutor}
                      className="inline-flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 hover:text-[#D9A441] font-medium transition-all"
                    >
                      <Bot size={12} className="text-[#D9A441]" />
                      <span>Ask AI Tutor to elaborate on this concept →</span>
                    </button>
                  </div>

                  {/* Interactive Visualizer / Bloch Sphere placed directly after What is a Qubit concept */}
                  {shouldRenderVisualizerHere && (
                    <div className="w-full pt-2 pb-4 space-y-4">
                      <LessonVisualizer
                        moduleId={currentModule.id}
                        onOpenInBuilder={() => {}}
                      />

                      {/* Real-World Hardware Spotlight placed directly after the Bloch Sphere */}
                      {isQubitConcept && (
                        <div className="hardware-card animate-fade-in">
                          <div className="hardware-badge flex items-center gap-1.5">
                            <Cpu size={12} className="text-[#4FD1D9]" />
                            <span>Real-World Quantum Hardware &bull; Physical System</span>
                          </div>
                          <h4 className="hardware-title">Industrial Quantum Processors</h4>
                          <div className="hardware-content">
                            <p className="mb-3 leading-relaxed">
                              In commercial quantum computers, the states you visualize on the Bloch sphere correspond to delicate physical quantum hardware architectures:
                            </p>
                            <ul className="list-disc pl-5 my-2 space-y-2">
                              <li>
                                <strong>Superconducting Transmon Qubits:</strong> Microscopic aluminum circuits cooled in dilution refrigerators to <strong>15 millikelvin</strong> (colder than deep space). Current circulates clockwise (|0⟩) and counter-clockwise (|1⟩) simultaneously through Josephson junctions.
                              </li>
                              <li>
                                <strong>Trapped Ions:</strong> Single ionized atoms (such as Ytterbium) suspended in electromagnetic traps in ultra-high vacuum and addressed with laser pulses to precisely rotate state vectors across the Bloch sphere.
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Plain Divider */}
            <hr className="border-white/10 my-8 opacity-40" />

            {/* 3. "Try It Yourself" Interactive Circuit Embed */}
            <div className="rounded-2xl border border-white/10 bg-[#12172A] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-lg font-bold font-heading flex items-center gap-2 text-inherit">
                  <BookOpen size={19} className="text-[#D9A441]" />
                  Try It Yourself: Live Circuit Sandbox
                </h3>

                <button
                  onClick={() => navigate('/lab')}
                  className="p-1.5 px-2.5 rounded-lg bg-[#0A0E1A] text-[#D9A441] hover:bg-[#D9A441]/10 border border-[#D9A441]/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Open in full standalone lab"
                >
                  <ExternalLink size={13} />
                  <span className="hidden sm:inline">Open in Full Lab</span>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0A0E1A] p-5 text-slate-100 space-y-4 animate-fade-in">
                {/* Top Bar with Status & Run CTA */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#4FD1D9]">
                      Interactive Workspace ({circuit.numQubits} Qubit{circuit.numQubits > 1 ? 's' : ''})
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      Drag gates from the palette onto wire lines
                    </span>
                  </div>

                  <button
                    onClick={() => runSimulation(1024)}
                    className="btn-primary py-1.5 px-4 text-xs shadow-md"
                  >
                    <Play size={13} fill="#0A0E1A" />
                    <span>Run Simulation (1024 Shots)</span>
                  </button>
                </div>

                {/* Main Builder Grid: Palette (Left) + Expansive Canvas (Right) */}
                <div className="flex flex-col md:flex-row gap-4 min-h-[280px]">
                  {/* Draggable Gate Palette */}
                  <div className="w-full md:w-[220px] shrink-0 bg-[#12172A] rounded-xl p-3 border border-white/5 overflow-hidden flex flex-col max-h-[380px] md:max-h-none">
                    <GatePalette />
                  </div>

                  {/* Expansive Circuit Canvas */}
                  <div className="flex-1 bg-[#12172A] rounded-xl overflow-auto border border-white/5 min-h-[220px] flex items-center justify-start p-2">
                    <CircuitCanvas />
                  </div>
                </div>

                {/* Results preview (Histogram & State Readout) */}
                <div className="rounded-xl overflow-hidden bg-[#12172A] border border-white/5 p-3" style={{ minHeight: '220px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Measurement Probabilities & State Readout
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">1024 Shots</span>
                  </div>
                  <div className="h-[180px] w-full">
                    {simulationResult ? (
                      <VisualizationPanel result={simulationResult} numQubits={circuit.numQubits} />
                    ) : (
                      <BlochSpherePanel blochVectors={[]} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Plain Divider */}
            <hr className="border-white/10 my-8 opacity-40" />

            {/* 5. Check for Understanding (1–2 Questions before unlocking next) */}
            {currentModule.quiz && currentModule.quiz.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-heading text-inherit">
                    Check for Understanding
                  </h3>
                  <span className="text-xs opacity-60 font-mono">
                    {currentModule.quiz.length} Question{currentModule.quiz.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-5">
                  {currentModule.quiz.map((q, qIndex) => {
                    const isSubmitted = quizSubmitted[q.id];
                    const selected = quizAnswers[q.id];
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-white/10 light:border-slate-300 bg-[#12172A] light:bg-white space-y-4 shadow-xs transition-colors"
                      >
                        <p className="text-sm font-semibold text-inherit">
                          {qIndex + 1}. {q.question}
                        </p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIndex) => {
                            const isOptSelected = selected === optIndex;
                            let optionClass = 'border-white/10 light:border-slate-300 hover:border-white/20 light:hover:border-slate-400 bg-[#0A0E1A]/70 light:bg-slate-50 text-slate-200 light:text-slate-800';

                            if (isSubmitted) {
                              if (optIndex === q.correctIndex) {
                                optionClass = 'border-[#4E9E7B] bg-[#4E9E7B]/15 text-[#4E9E7B] font-medium';
                              } else if (isOptSelected && !isCorrect) {
                                optionClass = 'border-[#C1543A] bg-[#C1543A]/15 text-[#C1543A]';
                              }
                            } else if (isOptSelected) {
                              optionClass = 'border-[#D9A441] bg-[#D9A441]/15 text-white light:text-slate-900 font-semibold';
                            }

                            return (
                              <button
                                key={optIndex}
                                disabled={isSubmitted}
                                onClick={() => handleSelectQuiz(q.id, optIndex)}
                                className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${optionClass}`}
                              >
                                <span>{opt}</span>
                                {isSubmitted && optIndex === q.correctIndex && (
                                  <Check size={16} className="text-[#4E9E7B] shrink-0 ml-2" />
                                )}
                                {isSubmitted && isOptSelected && !isCorrect && (
                                  <X size={16} className="text-[#C1543A] shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit Check Button */}
                        {!isSubmitted ? (
                          <button
                            disabled={selected === undefined}
                            onClick={() => handleCheckQuiz(q.id)}
                            className="px-4 py-2 rounded-xl bg-[#D9A441] text-[#0A0E1A] text-xs font-bold hover:bg-[#c49235] disabled:opacity-40 transition-colors shadow-xs"
                          >
                            Check Answer
                          </button>
                        ) : (
                          <div
                            className={`p-3 rounded-xl text-xs leading-relaxed ${
                              isCorrect
                                ? 'bg-[#4E9E7B]/15 text-[#4E9E7B] border border-[#4E9E7B]/30'
                                : 'bg-[#C1543A]/15 text-[#C1543A] border border-[#C1543A]/30'
                            }`}
                          >
                            <strong className="inline-flex items-center gap-1 mr-1">
                              {isCorrect ? (
                                <>
                                  <Check size={13} className="text-[#4E9E7B]" /> Correct!
                                </>
                              ) : (
                                <>
                                  <X size={13} className="text-[#C1543A]" /> Not quite.
                                </>
                              )}
                            </strong>{' '}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Plain Divider */}
            <hr className="border-white/10 my-8 opacity-40" />

            {/* 6. Navigation Bottom Controls */}
            <div className="pt-2 pb-12 flex items-center justify-between">
              {prevModule ? (
                <button
                  onClick={() => navigate(`/learn/${prevModule.id}`)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 light:border-slate-300 bg-[#12172A] light:bg-white text-slate-200 light:text-slate-800 text-xs font-semibold hover:border-white/20 light:hover:border-slate-400 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ChevronLeft size={16} />
                  <span>Previous: {prevModule.title}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleCompleteAndProceed}
                disabled={!hasPassedQuiz && !progress.completedModules.includes(currentModule.id)}
                className="btn-primary shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                title={!hasPassedQuiz ? 'Answer understanding check questions above to unlock' : 'Continue'}
              >
                {progress.completedModules.includes(currentModule.id) ? (
                  <>
                    <span>Next Module</span>
                    <ChevronRight size={16} />
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Complete & Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Markdown parser helper for content with rich callout cards
function formatSubMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold mt-4 mb-2 text-inherit font-heading">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-6 mb-3 text-inherit font-heading">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-4 text-inherit font-heading">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-inherit font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="text-[#4FD1D9] light:text-[#1B1E24] bg-[#0A0E1A] light:bg-slate-200 px-1.5 py-0.5 rounded font-mono text-xs border border-white/10 light:border-slate-300">$1</code>')
    .replace(/\n\n/g, '</p><p class="mb-3 leading-relaxed">')
    .replace(/^- (.*$)/gm, '<li class="opacity-90 leading-relaxed mb-1">$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-5 my-2 space-y-1">$1</ul>')
    .replace(/<\/ul>\s*<ul class="list-disc pl-5 my-2 space-y-1">/g, '')
    .replace(/\n/g, '<br/>');
}

function formatModuleContent(markdown: string): string {
  // 1. Extract :::analogy blocks
  let processed = markdown.replace(/:::analogy\s+(.*?)\n([\s\S]*?):::/g, (_match, title, body) => {
    return `__ANALOGY_START__${title.trim()}__SEP__${body.trim()}__ANALOGY_END__`;
  });

  // 2. Extract :::hardware blocks
  processed = processed.replace(/:::hardware\s+(.*?)\n([\s\S]*?):::/g, (_match, title, body) => {
    return `__HARDWARE_START__${title.trim()}__SEP__${body.trim()}__HARDWARE_END__`;
  });

  // 3. Format base markdown
  let html = formatSubMarkdown(processed);

  // 4. Inject formatted analogy cards
  html = html.replace(/__ANALOGY_START__(.*?)__SEP__([\s\S]*?)__ANALOGY_END__/g, (_m, title, body) => {
    return `<div class="analogy-card animate-fade-in">
      <div class="analogy-badge">Intuitive Analogy &bull; Mental Model</div>
      <h4 class="analogy-title">${title}</h4>
      <div class="analogy-content">${formatSubMarkdown(body)}</div>
    </div>`;
  });

  // 5. Inject formatted hardware cards
  html = html.replace(/__HARDWARE_START__(.*?)__SEP__([\s\S]*?)__HARDWARE_END__/g, (_m, title, body) => {
    return `<div class="hardware-card animate-fade-in">
      <div class="hardware-badge">Real-World Quantum Hardware &bull; Physical System</div>
      <h4 class="hardware-title">${title}</h4>
      <div class="hardware-content">${formatSubMarkdown(body)}</div>
    </div>`;
  });

  return html;
}
