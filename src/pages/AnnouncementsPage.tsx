// ============================================================
// QuantumLearn AI — Announcements Page
// Exact Tokens: --void, --panel, --paper, --ink, --signal-cyan, --cryostat-gold
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Calendar,
  Zap,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ANNOUNCEMENTS_LIST,
  getReadAnnouncementIds,
  markAnnouncementRead,
  markAllAnnouncementsRead,
} from '../data/announcementsData';
import type { AnnouncementItem } from '../data/announcementsData';

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setReadIds(getReadAnnouncementIds());

    const handleUpdate = () => {
      setReadIds(getReadAnnouncementIds());
    };
    window.addEventListener('quantumlearn:announcements_changed', handleUpdate);
    return () => window.removeEventListener('quantumlearn:announcements_changed', handleUpdate);
  }, []);

  const handleMarkAllRead = () => {
    markAllAnnouncementsRead();
    setReadIds(ANNOUNCEMENTS_LIST.map((a) => a.id));
  };

  const handleItemClick = (ann: AnnouncementItem) => {
    markAnnouncementRead(ann.id);
    setExpandedId(expandedId === ann.id ? null : ann.id);
  };

  const unreadCount = ANNOUNCEMENTS_LIST.filter((a) => !readIds.includes(a.id)).length;

  return (
    <div className="flex-1 bg-[var(--void)] text-[var(--ink)] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Back & Header Strip */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-[var(--cryostat-gold)] bg-[var(--cryostat-gold)]/10 border border-[var(--cryostat-gold)]/30 hover:bg-[var(--cryostat-gold)]/20 transition-all cursor-pointer"
            >
              <CheckCheck size={14} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Hero title */}
        <div className="bg-[var(--panel)] border border-white/10 light:border-black/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--signal-cyan)]/10 text-[var(--signal-cyan)] border border-[var(--signal-cyan)]/25 text-xs font-mono">
                <Bell size={12} />
                <span>Platform Broadcasts</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-[var(--ink)]">
                Announcements & Updates
              </h1>
              <p className="text-sm text-slate-400 max-w-xl">
                Stay updated with the latest quantum algorithms, problem challenges, interactive visualizers, and platform release notes.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-3 rounded-xl bg-[var(--void)] border border-white/10 light:border-black/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-[var(--cryostat-gold)]">
                  {unreadCount}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Unread
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-[var(--void)] border border-white/10 light:border-black/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-[var(--signal-cyan)]">
                  {ANNOUNCEMENTS_LIST.length}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {ANNOUNCEMENTS_LIST.map((item) => {
            const isRead = readIds.includes(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group cursor-pointer rounded-xl border p-5 transition-all ${
                  isRead
                    ? 'bg-[var(--panel)]/70 border-white/[0.07] light:border-black/10 hover:border-white/20'
                    : 'bg-[var(--panel)] border-[var(--cryostat-gold)]/40 hover:border-[var(--cryostat-gold)] shadow-[0_0_15px_rgba(217,164,65,0.06)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {!isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-[var(--cryostat-gold)] ring-4 ring-[var(--cryostat-gold)]/20" />
                      )}
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 light:text-slate-700 border border-white/10">
                        {item.category}
                      </span>
                      {item.badgeText && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--signal-cyan)]/15 text-[var(--signal-cyan)] border border-[var(--signal-cyan)]/30">
                          {item.badgeText}
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                        <Calendar size={12} />
                        {item.date}
                      </span>
                    </div>

                    <h2 className="text-base font-semibold text-[var(--ink)] group-hover:text-[var(--cryostat-gold)] transition-colors">
                      {item.title}
                    </h2>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.summary}
                    </p>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/10 light:border-black/10 text-xs text-slate-300 light:text-slate-600 leading-relaxed space-y-2 animate-fade-in">
                        <p>{item.details}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-slate-500 group-hover:text-slate-300 pt-1">
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Helper */}
        <div className="text-center pt-4">
          <p className="text-xs font-mono text-slate-500 flex items-center justify-center gap-1.5">
            <Zap size={13} className="text-[var(--cryostat-gold)]" />
            <span>Platform updates are delivered synchronously to all active quantum workstations.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
