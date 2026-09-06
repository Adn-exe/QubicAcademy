// ============================================================
// QuantumLearn AI — Primary Navigation Bar
// Floating rectangular bar inset from viewport edges, smooth rounded corners,
// hairline border, --panel background, no shadow.
// Exact Tokens: --void, --panel, --paper, --ink, --signal-cyan, --cryostat-gold, --error, --success
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Lock,
  ChevronDown,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useProgressStore } from '../../core/store';
import { useProfileStore } from '../../core/profileStore';
import { useAuth } from '../../core/AuthContext';
import {
  ANNOUNCEMENTS_LIST,
  getReadAnnouncementIds,
  markAnnouncementRead,
  markAllAnnouncementsRead,
  getUnreadAnnouncementCount,
} from '../../data/announcementsData';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const completedModules = useProgressStore((s) => s.progress.completedModules);
  const profileData = useProfileStore((s) => s.data);
  const { user, signOut } = useAuth();

  // User menu state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Scroll state for subtle vertical compacting
  const [isScrolled, setIsScrolled] = useState(false);

  // Theme toggle state
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('quantumlearn-theme') === 'light';
  });

  // Announcements unread count & inbox popover state
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<number>(() =>
    getUnreadAnnouncementCount()
  );
  const [announcementInboxOpen, setAnnouncementInboxOpen] = useState(false);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>(() =>
    getReadAnnouncementIds()
  );
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const inboxRef = useRef<HTMLDivElement | null>(null);

  // Curriculum dropdown state
  const [curriculumDropdownOpen, setCurriculumDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll listener for subtle compact-on-scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme effect
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('quantumlearn-theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('quantumlearn-theme', 'dark');
    }
  }, [isLightMode]);

  // Announcements unread count & sync listener
  useEffect(() => {
    const updateUnread = () => {
      setUnreadAnnouncements(getUnreadAnnouncementCount());
      setReadAnnouncementIds(getReadAnnouncementIds());
    };
    window.addEventListener('quantumlearn:announcements_changed', updateUnread);
    return () => window.removeEventListener('quantumlearn:announcements_changed', updateUnread);
  }, []);

  // Click outside to dismiss announcement inbox or user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inboxRef.current && !inboxRef.current.contains(e.target as Node)) {
        setAnnouncementInboxOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (announcementInboxOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [announcementInboxOpen, userMenuOpen]);

  // Prevent background page from scrolling when scrolling inside announcement inbox
  useEffect(() => {
    if (!announcementInboxOpen) return;
    const container = inboxRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const scrollable = container.querySelector('.overflow-y-auto') as HTMLElement | null;
      if (!scrollable) {
        e.preventDefault();
        return;
      }

      // If scrolling over non-scrollable header or footer, block background scroll
      if (!scrollable.contains(e.target as Node)) {
        e.preventDefault();
        return;
      }

      // Inside scrollable message list:
      const { scrollTop, scrollHeight, clientHeight } = scrollable;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Prevent chaining to background page when reaching scroll limits
      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [announcementInboxOpen]);

  // Dropdown hover helpers with delay to avoid flicker
  const handleCurriculumMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setCurriculumDropdownOpen(true);
  };

  const handleCurriculumMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setCurriculumDropdownOpen(false);
    }, 180);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCurriculumDropdownOpen(false);
  }, [location.pathname]);

  // Track unlocking logic
  // Foundations: Always unlocked
  // Circuits: Unlocked if at least 1 foundations module completed
  // Algorithms: Unlocked if at least 1 circuits module completed
  const isFoundationsUnlocked = true;
  const isCircuitsUnlocked =
    completedModules.includes('superposition-single-qubit') ||
    completedModules.includes('quantum-measurement');
  const isAlgorithmsUnlocked =
    isCircuitsUnlocked &&
    (completedModules.includes('entanglement-bell-states') ||
      completedModules.includes('quantum-teleportation'));

  // Calculate track progress
  const foundationsProgress = Math.round(
    ((completedModules.includes('superposition-single-qubit') ? 1 : 0) +
      (completedModules.includes('quantum-measurement') ? 1 : 0)) *
      50
  );

  const circuitsProgress = Math.round(
    ((completedModules.includes('entanglement-bell-states') ? 1 : 0) +
      (completedModules.includes('quantum-teleportation') ? 1 : 0)) *
      50
  );

  const algorithmsProgress = Math.round(
    ((completedModules.includes('grovers-search') ? 1 : 0) +
      (completedModules.includes('deutsch-jozsa') ? 1 : 0)) *
      50
  );

  const tracks = [
    {
      id: 'foundations',
      name: 'Foundations',
      path: '/learn/superposition-single-qubit',
      unlocked: isFoundationsUnlocked,
      prereqName: '',
      progress: foundationsProgress,
    },
    {
      id: 'circuits',
      name: 'Circuits',
      path: '/learn/entanglement-bell-states',
      unlocked: isCircuitsUnlocked,
      prereqName: 'Foundations',
      progress: circuitsProgress,
    },
    {
      id: 'algorithms',
      name: 'Algorithms',
      path: '/learn/grovers-search',
      unlocked: isAlgorithmsUnlocked,
      prereqName: 'Circuits',
      progress: algorithmsProgress,
    },
  ];

  // Route matches
  const isOverviewActive = location.pathname === '/';
  const isCurriculumActive = location.pathname.startsWith('/learn');
  const isWorkspaceActive = location.pathname === '/lab';
  const isProblemsActive = location.pathname === '/problems';

  // Hide Navbar on authentication page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-3 sm:pb-3.5 pointer-events-none">
      <header
        className={`max-w-7xl mx-auto pointer-events-auto rounded-[22px] transition-all duration-300 ${
          isScrolled
            ? 'py-2.5 sm:py-3 px-5 sm:px-7 bg-[#12172A]/80 light:bg-[#E2E0D8]/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.14] light:border-black/[0.09] shadow-[0_12px_36px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] light:shadow-[0_10px_30px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.4)]'
            : 'py-3.5 sm:py-4 px-6 sm:px-8 bg-[#12172A]/70 light:bg-[#E2E0D8]/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.16] light:border-black/[0.08] shadow-[0_16px_44px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.12)] light:shadow-[0_12px_36px_rgba(0,0,0,0.05),inset_0_1px_0_0_rgba(255,255,255,0.5)]'
        }`}
      >
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          {/* ======================================================== */}
          {/* LEFT: Circuit-node geometric Logo + Wordmark */}
          {/* ======================================================== */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none shrink-0"
            title="Qubiq Academy Home"
          >
            {/* Geometric Circuit-Node Orbit Motif */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--cryostat-gold)] bg-white/[0.04] light:bg-black/5 border border-white/10 light:border-black/10 group-hover:border-[var(--cryostat-gold)]/50 group-hover:bg-[var(--cryostat-gold)]/10 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:rotate-45 transition-transform duration-500"
              >
                {/* Central Quantum Node */}
                <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" />
                {/* Left & Right Satellite Nodes */}
                <circle cx="4" cy="12" r="1.8" />
                <circle cx="20" cy="12" r="1.8" />
                {/* Circuit Bus Lines */}
                <line x1="5.8" y1="12" x2="8.8" y2="12" />
                <line x1="15.2" y1="12" x2="18.2" y2="12" />
                {/* Orbital Envelope */}
                <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="currentColor" strokeDasharray="1.5 2.5" />
              </svg>
            </div>

            {/* Wordmark "Qubiq Academy" */}
            <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-[var(--ink)] group-hover:opacity-90 transition-opacity">
              Qubiq <span className="text-[var(--signal-cyan)]">Academy</span>
            </span>
          </button>

          {/* ======================================================== */}
          {/* CENTER: 4 Nav Items (Sentence Case, Pill Active State) */}
          {/* ======================================================== */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm font-medium">
            {/* 1. Overview */}
            <button
              onClick={() => navigate('/')}
              className={`px-3.5 sm:px-4 py-2 rounded-full transition-all cursor-pointer ${
                isOverviewActive
                  ? 'bg-white/[0.1] light:bg-white text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:shadow-sm light:border light:border-black/5'
                  : 'text-slate-400 light:text-slate-600 hover:text-[var(--ink)] hover:bg-white/[0.04] light:hover:bg-black/[0.04]'
              }`}
            >
              Overview
            </button>

            {/* 2. Curriculum (Dropdown on Hover/Click) */}
            <div
              className="relative"
              onMouseEnter={handleCurriculumMouseEnter}
              onMouseLeave={handleCurriculumMouseLeave}
            >
              <button
                onClick={() => setCurriculumDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full transition-all cursor-pointer ${
                  isCurriculumActive
                    ? 'bg-white/[0.1] light:bg-white text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:shadow-sm light:border light:border-black/5'
                    : 'text-slate-400 light:text-slate-600 hover:text-[var(--ink)] hover:bg-white/[0.04] light:hover:bg-black/[0.04]'
                }`}
              >
                <span>Curriculum</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    curriculumDropdownOpen ? 'rotate-180 text-[var(--cryostat-gold)]' : 'text-slate-500'
                  }`}
                />
              </button>

              {/* Compact Rounded Dropdown Panel with Glassmorphism */}
              {curriculumDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2.5 w-72 p-2.5 bg-[#12172A]/85 light:bg-[#E2E0D8]/90 backdrop-blur-2xl border border-white/[0.14] light:border-black/[0.08] rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] animate-fade-in z-50 space-y-1.5"
                  style={{
                    transitionProperty: 'opacity, height',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Syllabus Tracks
                  </div>

                  {tracks.map((track) => {
                    if (!track.unlocked) {
                      return (
                        <div
                          key={track.id}
                          className="relative group/tooltip flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-[13px] text-slate-500 cursor-not-allowed select-none bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-2">
                            <Lock size={13} className="text-slate-500 shrink-0" />
                            <span className="line-through decoration-slate-600">
                              {track.name}
                            </span>
                          </div>

                          {/* Hover Tooltip */}
                          <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap px-2.5 py-1 rounded-md bg-[var(--void)]/95 backdrop-blur-md border border-white/15 text-[10px] font-mono text-slate-300 shadow-lg">
                            Complete {track.prereqName} to unlock.
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          navigate(track.path);
                          setCurriculumDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-[13px] text-[var(--ink)] hover:bg-white/[0.07] light:hover:bg-black/[0.06] transition-colors text-left cursor-pointer group"
                      >
                        <span className="font-medium group-hover:text-[var(--cryostat-gold)] transition-colors">
                          {track.name}
                        </span>

                        {/* Progress ring / percentage */}
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                          {/* Mini Progress Ring */}
                          <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-white/10 light:text-black/10"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-[var(--cryostat-gold)]"
                              strokeDasharray={`${track.progress}, 100`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span>{track.progress}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Workspace (Circuit Builder direct link) */}
            <button
              onClick={() => navigate('/lab')}
              className={`px-3.5 sm:px-4 py-2 rounded-full transition-all cursor-pointer ${
                isWorkspaceActive
                  ? 'bg-white/[0.1] light:bg-white text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:shadow-sm light:border light:border-black/5'
                  : 'text-slate-400 light:text-slate-600 hover:text-[var(--ink)] hover:bg-white/[0.04] light:hover:bg-black/[0.04]'
              }`}
            >
              Workspace
            </button>

            {/* 4. Problems (Direct link) */}
            <button
              onClick={() => navigate('/problems')}
              className={`px-3.5 sm:px-4 py-2 rounded-full transition-all cursor-pointer ${
                isProblemsActive
                  ? 'bg-white/[0.1] light:bg-white text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:shadow-sm light:border light:border-black/5'
                  : 'text-slate-400 light:text-slate-600 hover:text-[var(--ink)] hover:bg-white/[0.04] light:hover:bg-black/[0.04]'
              }`}
            >
              Problems
            </button>
          </nav>

          {/* ======================================================== */}
          {/* RIGHT: Announcement -> Theme toggle -> Profile badge */}
          {/* ======================================================== */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* 1. Announcement button & Message Inbox Popover */}
            <div className="relative" ref={inboxRef}>
              <button
                type="button"
                onClick={() => setAnnouncementInboxOpen((prev) => !prev)}
                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-300 light:text-slate-700 hover:text-[var(--ink)] bg-white/[0.04] light:bg-black/5 border transition-all cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ${
                  announcementInboxOpen
                    ? 'border-[var(--cryostat-gold)]/60 text-[var(--cryostat-gold)] bg-white/[0.08]'
                    : 'border-white/10 light:border-black/10 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
                title="Announcements & Messages"
                aria-label="Announcements & Messages"
              >
                <Bell size={17} strokeWidth={1.75} />
                {unreadAnnouncements > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--cryostat-gold)] ring-2 ring-[var(--panel)] animate-pulse" />
                )}
              </button>

              {/* Message Inbox Popover (Opaque, Window-Like, Spacious) */}
              {announcementInboxOpen && (
                <>
                  {/* Invisible backdrop to isolate wheel/touch events from scrolling the background page */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent pointer-events-auto"
                    onClick={() => setAnnouncementInboxOpen(false)}
                    onWheel={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                  <div className="absolute right-0 top-full mt-3.5 w-[92vw] sm:w-[520px] md:w-[560px] bg-[#0E1322] light:bg-[#E8E6DE] border border-white/20 light:border-black/15 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.05)] z-50 overflow-hidden animate-fade-in text-left">
                    {/* Window Chrome Titlebar */}
                    <div className="px-4 py-3 bg-[#080B14] light:bg-[#DDD9CE] border-b border-white/10 light:border-black/10 flex items-center justify-between">
                      {/* Window Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 mr-2">
                          <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20 inline-block" />
                        </div>
                        <span className="text-xs font-heading font-bold text-[var(--ink)] tracking-wide">
                          Announcements & Dispatch
                        </span>
                        {unreadAnnouncements > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--cryostat-gold)] text-[#0A0E1A] font-bold shadow-xs">
                            {unreadAnnouncements} new
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {unreadAnnouncements > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              markAllAnnouncementsRead();
                              setReadAnnouncementIds(ANNOUNCEMENTS_LIST.map((a) => a.id));
                              setUnreadAnnouncements(0);
                            }}
                            className="text-[11px] font-mono font-medium text-[var(--cryostat-gold)] hover:underline cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setAnnouncementInboxOpen(false)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--ink)] hover:bg-white/10 light:hover:bg-black/10 transition-colors cursor-pointer"
                          aria-label="Close window"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Messages List (Opaque Cards with overscroll-contain) */}
                    <div className="max-h-[420px] overflow-y-auto overscroll-contain p-3 space-y-2.5 bg-[#0E1322] light:bg-[#E8E6DE]">
                    {ANNOUNCEMENTS_LIST.map((ann) => {
                      const isRead = readAnnouncementIds.includes(ann.id);
                      const isExpanded = expandedAnnouncementId === ann.id;

                      return (
                        <div
                          key={ann.id}
                          onClick={() => {
                            markAnnouncementRead(ann.id);
                            setReadAnnouncementIds((prev) =>
                              prev.includes(ann.id) ? prev : [...prev, ann.id]
                            );
                            setUnreadAnnouncements(getUnreadAnnouncementCount());
                            setExpandedAnnouncementId(isExpanded ? null : ann.id);
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                            !isRead
                              ? 'bg-[#151C30] light:bg-[#F2EFE6] border-[var(--cryostat-gold)]/40 shadow-sm'
                              : 'bg-[#111728] light:bg-[#DED9CE] border-white/5 light:border-black/5 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {!isRead ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--cryostat-gold)] block ring-4 ring-[var(--cryostat-gold)]/20 animate-pulse" />
                              ) : (
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 block opacity-40" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-md bg-[#080B14] light:bg-white/80 text-[var(--signal-cyan)] border border-white/10">
                                  {ann.category}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {ann.date}
                                </span>
                              </div>

                              <h4 className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--cryostat-gold)] transition-colors leading-snug">
                                {ann.title}
                              </h4>

                              <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                                {ann.summary}
                              </p>

                              {isExpanded && (
                                <div className="pt-2.5 text-xs text-slate-300 light:text-slate-700 leading-relaxed border-t border-white/10 light:border-black/10 mt-2.5 space-y-2 animate-fade-in bg-black/20 p-3 rounded-lg">
                                  <p>{ann.details}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Window Footer Toolbar */}
                  <div className="px-4 py-3 bg-[#080B14] light:bg-[#DDD9CE] border-t border-white/10 light:border-black/10 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--success)] inline-block" />
                      <span>Release feed synced</span>
                    </span>
                    <button
                      onClick={() => {
                        setAnnouncementInboxOpen(false);
                        navigate('/announcements');
                      }}
                      className="text-[var(--signal-cyan)] hover:underline font-semibold cursor-pointer"
                    >
                      View full page &rarr;
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

            {/* 2. Theme toggle */}
            <button
              type="button"
              onClick={() => setIsLightMode((prev) => !prev)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-300 light:text-slate-700 hover:text-[var(--ink)] bg-white/[0.04] light:bg-black/5 border border-white/10 light:border-black/10 hover:border-white/25 hover:bg-white/[0.08] transition-all cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
              title={`Switch to ${isLightMode ? 'Dark' : 'Light'} mode`}
              aria-label="Toggle theme"
            >
              {isLightMode ? (
                <Moon size={16} className="text-[var(--cryostat-gold)]" />
              ) : (
                <Sun size={16} className="text-[var(--signal-cyan)]" />
              )}
            </button>

            {/* 3. Profile badge / Sign In */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs sm:text-sm bg-[var(--panel)] text-[var(--cryostat-gold)] border border-white/15 light:border-black/15 hover:ring-2 hover:ring-[var(--signal-cyan)] transition-all cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ${
                    location.pathname === '/profile' || userMenuOpen ? 'ring-2 ring-[var(--cryostat-gold)]' : ''
                  }`}
                  title="User Profile Menu"
                  aria-label="User Profile Menu"
                >
                  {profileData.profile.avatarInitials || user.email?.slice(0, 2).toUpperCase() || 'QL'}
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 bg-[#12172A]/95 light:bg-[#E2E0D8]/95 backdrop-blur-2xl border border-white/[0.16] light:border-black/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] z-50 overflow-hidden animate-fade-in text-left p-2 space-y-1">
                    <div className="px-3 py-2 border-b border-white/10 light:border-black/10">
                      <p className="text-xs font-semibold text-[var(--ink)] truncate">
                        {profileData.profile.name || 'Quantum Explorer'}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] text-[var(--ink)] hover:bg-white/[0.07] light:hover:bg-black/[0.06] transition-colors cursor-pointer text-left font-medium"
                    >
                      <UserIcon size={14} className="text-[var(--cryostat-gold)]" />
                      <span>View Profile & Stats</span>
                    </button>

                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors cursor-pointer text-left font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-semibold bg-gradient-to-r from-[var(--signal-cyan)]/20 to-[var(--cryostat-gold)]/20 hover:from-[var(--signal-cyan)]/30 hover:to-[var(--cryostat-gold)]/30 text-[var(--ink)] border border-[var(--signal-cyan)]/40 hover:border-[var(--signal-cyan)] transition-all cursor-pointer shadow-xs"
              >
                <LogIn size={14} className="text-[var(--signal-cyan)]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-[var(--ink)] bg-white/[0.04] light:bg-black/5 border border-white/10 light:border-black/10 cursor-pointer ml-1"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RESPONSIVE: Mobile Slide-down Panel */}
        {/* ======================================================== */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3.5 pt-3.5 border-t border-white/10 light:border-black/10 space-y-1.5 animate-fade-in">
            {/* Overview */}
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                isOverviewActive
                  ? 'bg-white/[0.1] light:bg-black/[0.08] text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                  : 'text-slate-400 hover:text-[var(--ink)] hover:bg-white/[0.04]'
              }`}
            >
              <span>Overview</span>
            </button>

            {/* Curriculum */}
            <div className="space-y-1">
              <button
                onClick={() => setCurriculumDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                  isCurriculumActive
                    ? 'bg-white/[0.1] light:bg-black/[0.08] text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                    : 'text-slate-400 hover:text-[var(--ink)] hover:bg-white/[0.04]'
                }`}
              >
                <span>Curriculum</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    curriculumDropdownOpen ? 'rotate-180 text-[var(--cryostat-gold)]' : ''
                  }`}
                />
              </button>

              {curriculumDropdownOpen && (
                <div className="pl-3 pr-2 py-2 space-y-1 bg-white/[0.03] rounded-xl border border-white/10">
                  {tracks.map((track) => (
                    <button
                      key={track.id}
                      disabled={!track.unlocked}
                      onClick={() => {
                        if (track.unlocked) {
                          navigate(track.path);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm text-left ${
                        !track.unlocked
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-300 hover:text-[var(--cryostat-gold)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {!track.unlocked && <Lock size={12} />}
                        <span>{track.name}</span>
                      </span>
                      {track.unlocked && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {track.progress}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Workspace */}
            <button
              onClick={() => {
                navigate('/lab');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                isWorkspaceActive
                  ? 'bg-white/[0.1] light:bg-black/[0.08] text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                  : 'text-slate-400 hover:text-[var(--ink)] hover:bg-white/[0.04]'
              }`}
            >
              <span>Workspace</span>
            </button>

            {/* Problems */}
            <button
              onClick={() => {
                navigate('/problems');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                isProblemsActive
                  ? 'bg-white/[0.1] light:bg-black/[0.08] text-[var(--ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                  : 'text-slate-400 hover:text-[var(--ink)] hover:bg-white/[0.04]'
              }`}
            >
              <span>Problems</span>
            </button>

            {/* Profile / Auth in Mobile Menu */}
            {user ? (
              <div className="pt-2 border-t border-white/10 space-y-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm text-[var(--ink)] hover:bg-white/[0.04]"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon size={15} className="text-[var(--cryostat-gold)]" />
                    <span>Profile ({profileData.profile.avatarInitials || 'QL'})</span>
                  </span>
                </button>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--error)] hover:bg-[var(--error)]/10"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--signal-cyan)] text-[var(--void)] hover:opacity-90 transition-opacity"
                >
                  <LogIn size={15} />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
