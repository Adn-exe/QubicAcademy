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
  BookOpen,
  Bot,
  FileText,
  Bookmark,
  Check,
  X,
  Play,
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


  // Auto-populate circuit sandbox when module changes & execute initial simulation
  useEffect(() => {
    const secWithCircuit = currentModule.sections.find((s) => s.preloadedCircuit);
    if (secWithCircuit?.preloadedCircuit) {
      loadCircuit(secWithCircuit.preloadedCircuit);
      setTimeout(() => runSimulation(), 50);
    }
  }, [currentModule.id, loadCircuit, runSimulation]);

  // 1-Tap "Ask AI Tutor to elaborate on this topic" handler
  const handleAskTutorAboutSection = (sectionTitle: string) => {
    const completedCount = progress.completedModules.length;
    const userLevel =
      completedCount === 0
        ? 'Beginner (Starting journey in quantum computing)'
        : completedCount <= 2
        ? 'Foundational Learner (Familiar with single-qubit states and measurement)'
        : completedCount <= 4
        ? 'Intermediate Apprentice (Familiar with entanglement and Bell states)'
        : 'Advanced Quantum Explorer';

    const prompt = `Can you elaborate on the topic "${sectionTitle}" from the "${currentModule.title}" module?

Please calibrate to my current learning level: **${userLevel}** (${completedCount} module${completedCount === 1 ? '' : 's'} completed).
1. Explain the intuitive core idea simply and cleanly (no raw LaTeX slashes or math walls).
2. Proactively ask me 1 or 2 quick diagnostic check questions to test my understanding before wrapping up!`;

    useChatStore.getState().setPendingPrompt(prompt);
    useChatStore.getState().setTutorOpen(true);
  };

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

  // Study Navigator Slide-Over Drawer state & active tab
  const [isStudyDrawerOpen, setIsStudyDrawerOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'syllabus' | 'glossary' | 'notes'>('syllabus');

  // Quick module switcher dropdown state
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const moduleDropdownRef = useRef<HTMLDivElement>(null);

  // Close module switcher dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openStudyDrawer = (tab: 'syllabus' | 'glossary' | 'notes') => {
    setSidebarTab(tab);
    setIsStudyDrawerOpen(true);
    setIsModuleDropdownOpen(false);
  };

  // Quiz state: selected options & submitted checks
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

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
          TOP BAR: Module Switcher Popover, Study Tools, Progress
         ============================================================ */}
      <div className="h-14 px-4 sm:px-6 bg-[#12172A] light:bg-[#F7F6F1] border-b border-white/10 light:border-slate-300 flex items-center justify-between shrink-0 z-30 transition-colors">
        {/* Left: Back Link & Interactive Module Switcher Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="shrink-0 text-xs text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black flex items-center gap-1 font-medium transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white/5"
            title="Back to Course Overview"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <span className="text-slate-600 shrink-0">/</span>

          {/* Module Switcher Dropdown Anchor */}
          <div className="relative" ref={moduleDropdownRef}>
            <button
              onClick={() => setIsModuleDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0A0E1A] light:bg-white text-slate-200 light:text-slate-800 hover:text-white light:hover:text-black border border-white/10 light:border-slate-300 text-xs font-semibold transition-all cursor-pointer shadow-xs hover:border-[#4FD1D9]/40 group"
              title="Click to jump to another module"
            >
              <span className="shrink-0 flex items-center justify-center">
                {getTrackModuleIcon(currentModule.icon, 14)}
              </span>
              <span className="truncate max-w-[130px] sm:max-w-[240px] md:max-w-[340px]">
                {currentModule.title}
              </span>
              <ChevronDown
                size={13}
                className={`text-slate-400 group-hover:text-[#4FD1D9] transition-transform ${
                  isModuleDropdownOpen ? 'rotate-180 text-[#4FD1D9]' : ''
                }`}
              />
            </button>

            {/* Floating Module Switcher Popover */}
            {isModuleDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#0F1424] light:bg-white border border-white/15 light:border-slate-300 shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-3 z-50 animate-fade-in backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 light:border-slate-200">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
                    Syllabus ({completedCount}/{totalModuleCount} Done)
                  </span>
                  <button
                    onClick={() => openStudyDrawer('syllabus')}
                    className="text-[11px] text-[#4FD1D9] hover:underline font-mono cursor-pointer"
                  >
                    Open Drawer →
                  </button>
                </div>

                <div className="max-h-[340px] overflow-y-auto space-y-1 pr-1">
                  {allModules.map((m, idx) => {
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
                          setIsModuleDropdownOpen(false);
                          navigate(`/learn/${m.id}`);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'bg-[#4FD1D9]/15 border border-[#4FD1D9]/40 text-white light:text-black font-semibold'
                            : isLocked
                            ? 'opacity-40 cursor-not-allowed bg-transparent'
                            : 'hover:bg-white/5 light:hover:bg-slate-100 text-slate-300 light:text-slate-700 cursor-pointer border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            0{idx + 1}
                          </span>
                          <span className="shrink-0">{getTrackModuleIcon(m.icon, 14)}</span>
                          <div className="min-w-0">
                            <div className="text-xs truncate font-medium">{m.title}</div>
                            <div className="text-[10px] font-mono text-slate-400 capitalize">
                              {m.difficulty} &bull; {m.estimatedMinutes}m
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          {isLocked ? (
                            <Lock size={12} className="text-slate-500" />
                          ) : isCompleted ? (
                            <CheckCircle2 size={14} className="text-[#D9A441]" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-[#4FD1D9] animate-pulse block" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Study Tools Pills & Progress */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Study Tools Pills */}
          <div className="flex items-center gap-1 bg-[#0A0E1A] light:bg-[#EAE8E0] p-1 rounded-xl border border-white/10 light:border-slate-300">
            <button
              onClick={() => openStudyDrawer('syllabus')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Syllabus & Course Path"
            >
              <BookOpen size={13} className="text-[#4FD1D9]" />
              <span className="hidden sm:inline">Syllabus</span>
              <span className="text-[10px] font-mono text-slate-400">
                ({completedCount}/{totalModuleCount})
              </span>
            </button>

            <button
              onClick={() => openStudyDrawer('glossary')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Key Terms Glossary"
            >
              <Bookmark size={13} className="text-[#D9A441]" />
              <span className="hidden sm:inline">Glossary</span>
            </button>

            <button
              onClick={() => openStudyDrawer('notes')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 light:text-slate-700 hover:text-white light:hover:text-black hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Notebook"
            >
              <FileText size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Notes</span>
            </button>
          </div>

          {/* Compact Course Progress bar */}
          <div className="hidden lg:flex flex-col items-end shrink-0 pl-1">
            <span className="text-[10px] font-mono text-slate-400">
              Progress: <strong className="text-[#4FD1D9]">{progressPercent}%</strong>
            </span>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #4FD1D9 0%, #D9A441 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SLIDE-OVER STUDY DRAWER (Overlay - Never cramps reading space)
         ============================================================ */}
      {isStudyDrawerOpen && (
        <div
          onClick={() => setIsStudyDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-full sm:w-[380px]
          bg-[#0F1424] light:bg-[#F7F6F1] border-r border-white/15 light:border-slate-300
          shadow-[0_24px_60px_rgba(0,0,0,0.7)] flex flex-col
          transition-transform duration-300 ease-out
          ${isStudyDrawerOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'}
        `}
      >
        {/* Header with Title, Progress Badge & Close Button */}
        <div className="p-4 border-b border-white/10 light:border-slate-200 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold tracking-wider uppercase text-white light:text-slate-900">
                Study Navigator
              </span>
              <span className="text-[11px] font-mono text-[#D9A441] bg-[#D9A441]/10 px-2 py-0.5 rounded-full border border-[#D9A441]/20">
                {completedCount}/{totalModuleCount} Done
              </span>
            </div>
            <button
              onClick={() => setIsStudyDrawerOpen(false)}
              className="p-1.5 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black hover:bg-white/10 light:hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Close Study Navigator"
            >
              <X size={18} />
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
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {courseTracks.map((track) => {
              const isExpanded = expandedTracks[track.id] ?? true;
              const trackModules = allModules.filter((m) => track.moduleIds.includes(m.id));

              return (
                <div key={track.id} className="rounded-xl bg-[#0A0E1A]/60 border border-white/5 overflow-hidden">
                  <button
                    onClick={() => toggleTrack(track.id)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      {track.title}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

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
                              setIsStudyDrawerOpen(false);
                            }}
                            className={`
                              w-full px-3.5 py-2 text-left flex items-center justify-between transition-all group
                              ${
                                isCurrent
                                  ? 'border-l-3 border-[#D9A441] bg-white/5 text-white font-medium pl-[11px]'
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
                              ) : (
                                <span className="w-2.5 h-2.5 rounded-full border border-slate-600 shrink-0" />
                              )}
                              <span className="text-xs truncate font-sans">{m.title}</span>
                            </div>

                            <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-2">
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {currentModule.glossary && currentModule.glossary.length > 0 ? (
              currentModule.glossary.map((item) => (
                <div key={item.term} className="p-3 rounded-xl bg-[#0A0E1A]/60 border border-white/5 space-y-1">
                  <h4 className="text-xs font-bold text-[#4FD1D9] font-mono flex items-center gap-1.5">
                    <Bookmark size={12} className="text-[#D9A441]" />
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
          <div className="flex-1 flex flex-col p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[11px]">
                <FileText size={14} className="text-[#D9A441]" />
                Your Notes ({currentModule.title})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Auto-saved</span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => handleSaveNotes(e.target.value)}
              placeholder="Record derivations, insights, questions, and ideas on this module..."
              className="flex-1 w-full bg-[#0A0E1A] border border-white/10 rounded-xl p-3 text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#D9A441]/50 resize-none leading-relaxed"
            />
          </div>
        )}
      </aside>

      {/* ============================================================
          MAIN WORKSPACE: Clean, spacious, centered reading experience
         ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto paper-surface relative flex flex-col items-center w-full"
        >
          <div className="w-full px-6 sm:px-12 py-10 space-y-10 text-left max-w-4xl">
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
                      type="button"
                      onClick={() => handleAskTutorAboutSection(section.title)}
                      className="inline-flex items-center gap-1.5 text-xs opacity-75 hover:opacity-100 hover:text-[#D9A441] font-medium transition-all cursor-pointer group"
                    >
                      <Bot size={13} className="text-[#D9A441] group-hover:scale-110 transition-transform" />
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
