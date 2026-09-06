// ============================================================
// QuantumLearn AI — Announcements Data & Persistence
// ============================================================

import { supabase } from '../lib/supabase';
import { fetchUserReadAnnouncements, markUserAnnouncementRead as dbMarkRead } from '../lib/db';

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  details: string;
  category: 'Feature' | 'Curriculum' | 'Update' | 'Event';
  date: string;
  badgeText?: string;
}

export const ANNOUNCEMENTS_LIST: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Quantum Problems Studio & Circuit Challenges Live',
    summary: 'Practice 12 new LeetCode-style quantum algorithmic challenges with interactive starter circuits.',
    details: 'The Problems system allows you to build single-qubit superpositions, assemble Bell states, construct quantum teleportation circuits, and synthesize Grover oracles. Each challenge starts directly inside the Circuit Builder with preloaded state.',
    category: 'Feature',
    date: '2026-03-06',
    badgeText: 'New',
  },
  {
    id: 'ann-2',
    title: 'Interactive Bloch Sphere Visualizer 2.0 Released',
    summary: 'Enhanced real-time 3D statevector rendering with phase kickback inspection and measurement collapse.',
    details: 'You can now drag along spherical angles θ and φ directly in the visualizer, inspect continuous unitary rotations, and observe projection probabilities directly mapped to computational basis states |0⟩ and |1⟩.',
    category: 'Update',
    date: '2026-03-04',
  },
  {
    id: 'ann-3',
    title: 'Curriculum Track: Quantum Algorithms Unlocked',
    summary: 'Explore Grover’s Search and Deutsch-Jozsa algorithms with step-by-step mathematical breakdowns.',
    details: 'Master amplitude amplification, phase oracles, and quantum parallelism. Complete the prerequisite Circuits track to unlock full interactive lessons and circuit exercises.',
    category: 'Curriculum',
    date: '2026-02-28',
  },
  {
    id: 'ann-4',
    title: 'Custom User Profiles & Analytics Dashboard',
    summary: 'Track your daily study streaks, circuit compile statistics, gate counts, and mastered milestones.',
    details: 'All analytics and circuit histories are preserved client-side with full instant recovery and export capabilities. Customize your bio, research focus, and handle.',
    category: 'Feature',
    date: '2026-02-20',
  },
];

const ANNOUNCEMENTS_READ_KEY = 'quantumlearn:announcements_read';

export function getReadAnnouncementIds(): string[] {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_READ_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read announcements status', e);
  }
  return ['ann-3', 'ann-4']; // default some older ones as read
}

export async function syncReadAnnouncementsFromSupabase(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const cloudRead = await fetchUserReadAnnouncements(user.id);
      localStorage.setItem(ANNOUNCEMENTS_READ_KEY, JSON.stringify(cloudRead));
      window.dispatchEvent(new Event('quantumlearn:announcements_changed'));
      return cloudRead;
    }
  } catch (e) {
    console.warn('Could not sync announcements from Supabase:', e);
  }
  return getReadAnnouncementIds();
}

export function markAnnouncementRead(id: string) {
  const read = getReadAnnouncementIds();
  if (!read.includes(id)) {
    const updated = [...read, id];
    localStorage.setItem(ANNOUNCEMENTS_READ_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('quantumlearn:announcements_changed'));

    // Sync to Supabase in background
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        dbMarkRead(user.id, id);
      }
    });
  }
}

export function markAllAnnouncementsRead() {
  const allIds = ANNOUNCEMENTS_LIST.map((a) => a.id);
  localStorage.setItem(ANNOUNCEMENTS_READ_KEY, JSON.stringify(allIds));
  window.dispatchEvent(new Event('quantumlearn:announcements_changed'));

  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      allIds.forEach((id) => dbMarkRead(user.id, id));
    }
  });
}

export function getUnreadAnnouncementCount(): number {
  const read = getReadAnnouncementIds();
  return ANNOUNCEMENTS_LIST.filter((a) => !read.includes(a.id)).length;
}


