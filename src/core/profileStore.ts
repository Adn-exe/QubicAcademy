// ============================================================
// QuantumLearn AI — User Profile & Analytics Store
// Supabase-backed persistence with local fallback
// ============================================================

import { create } from 'zustand';
import type { QuantumCircuit } from './types';
import { supabase } from '../lib/supabase';
import {
  fetchUserProfile,
  updateUserProfileHeader as dbUpdateHeader,
  updateUserSettings as dbUpdateSettings,
  saveUserCircuit as dbSaveCircuit,
  deleteUserCircuit as dbDeleteCircuit,
} from '../lib/db';

export interface UserProfileData {
  profile: {
    name: string;
    bio: string;
    role: string;
    avatarInitials: string;
    memberSince: string; // ISO date string
    theme: 'light' | 'dark' | 'system';
  };
  stats: {
    modulesCompleted: number;
    modulesTotal: number;
    circuitsBuilt: number;
    challengesPassed: number;
    challengesTotal: number;
    currentStreak: number;
  };
  tracks: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
    earnedDate: string | null;
  }>;
  activity: Array<{
    id: string;
    type: 'module_complete' | 'circuit_saved' | 'challenge_passed';
    label: string;
    timestamp: string;
  }>;
  savedCircuits: Array<{
    id: string;
    name: string;
    circuitJson: QuantumCircuit;
    lastEdited: string;
  }>;
  settings: {
    notifyStreak: boolean;
    notifyNewModules: boolean;
  };
}

export const PROFILE_STORAGE_KEY = 'quantumlearn:profile';

export const DEFAULT_PROFILE_DATA: UserProfileData = {
  profile: {
    name: 'Quantum Explorer',
    bio: '',
    role: 'Quantum Computing Student',
    avatarInitials: 'QE',
    memberSince: new Date().toISOString(),
    theme: 'dark',
  },
  stats: {
    modulesCompleted: 0,
    modulesTotal: 6,
    circuitsBuilt: 0,
    challengesPassed: 0,
    challengesTotal: 17,
    currentStreak: 0,
  },
  tracks: [
    { name: 'Foundations', completed: 0, total: 2 },
    { name: 'Circuits', completed: 0, total: 2 },
    { name: 'Algorithms', completed: 0, total: 2 },
  ],
  badges: [
    {
      id: 'first_circuit',
      name: 'First Circuit',
      description: 'Created and simulated your first quantum circuit.',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'bell_builder',
      name: 'Bell State Builder',
      description: 'Constructed a maximally entangled Bell pair |Φ+⟩.',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'streak_7',
      name: '7-Day Streak',
      description: 'Maintained active quantum practice for 7 days in a row.',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'superposition_master',
      name: 'Superposition Master',
      description: 'Mastered single-qubit rotations on the Bloch Sphere.',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'quantum_teleporter',
      name: 'Quantum Teleporter',
      description: 'Executed the 3-qubit quantum teleportation protocol.',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'grover_explorer',
      name: 'Grover Explorer',
      description: 'Discovered quadratic speedups with amplitude amplification.',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'deutsch_pioneer',
      name: 'Deutsch-Jozsa Pioneer',
      description: 'Determined constant vs balanced oracles in 1 single query.',
      earned: false,
      earnedDate: null,
    },
    {
      id: 'qiskit_coder',
      name: 'Qiskit Developer',
      description: 'Exported visual circuits directly to executable Python Qiskit.',
      earned: false,
      earnedDate: null,
    },
  ],
  activity: [],
  savedCircuits: [],
  settings: {
    notifyStreak: true,
    notifyNewModules: true,
  },
};

interface ProfileStoreState {
  data: UserProfileData;
  loadProfile: () => Promise<void>;
  updateProfileHeader: (fields: Partial<UserProfileData['profile']>) => void;
  updateSettings: (fields: Partial<UserProfileData['settings']>) => void;
  saveCircuit: (name: string, circuit: QuantumCircuit) => void;
  deleteCircuit: (id: string) => void;
  resetProgress: () => void;
}

function loadFromStorage(): UserProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const stats = { ...DEFAULT_PROFILE_DATA.stats, ...(parsed.stats || {}) };
      const cleanActivity = Array.isArray(parsed.activity)
        ? parsed.activity.filter(
            (a: { id: string; type?: string; timestamp?: string }) =>
              !a.id?.match(/^act_[1-6]$/) &&
              !a.timestamp?.match(/^2026-03-0[56]/) &&
              !(a.type === 'challenge_passed' && stats.challengesPassed === 0) &&
              !(a.type === 'module_complete' && stats.modulesCompleted === 0) &&
              !(a.type === 'circuit_saved' && stats.circuitsBuilt === 0)
          )
        : [];
      const cleanCircuits = Array.isArray(parsed.savedCircuits)
        ? parsed.savedCircuits.filter((c: { id: string }) => !c.id.match(/^sc_[1-2]$/))
        : [];

      const rawBio = parsed.profile?.bio;
      const cleanBio =
        rawBio === 'Exploring quantum algorithms, superposition, and entanglement protocols.'
          ? ''
          : (rawBio || '');

      return {
        ...DEFAULT_PROFILE_DATA,
        ...parsed,
        profile: {
          ...DEFAULT_PROFILE_DATA.profile,
          ...(parsed.profile || {}),
          bio: cleanBio,
        },
        stats,
        settings: { ...DEFAULT_PROFILE_DATA.settings, ...(parsed.settings || {}) },
        activity: cleanActivity,
        savedCircuits: cleanCircuits,
      };
    }
  } catch (err) {
    console.warn('Failed to read profile from localStorage:', err);
  }
  return DEFAULT_PROFILE_DATA;
}

function saveToStorage(data: UserProfileData) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to write profile to localStorage:', err);
  }
}

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  data: loadFromStorage(),

  loadProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cloudData = await fetchUserProfile(user.id);
        set({ data: cloudData });
        saveToStorage(cloudData);
        return;
      }
    } catch (e) {
      console.warn('Falling back to local storage profile:', e);
    }
    const local = loadFromStorage();
    set({ data: local });
  },

  updateProfileHeader: (fields) => {
    const current = get().data;
    const name = fields.name !== undefined ? fields.name : current.profile.name;
    const initials = fields.avatarInitials || (fields.name !== undefined
      ? name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'QL'
      : current.profile.avatarInitials);

    const updated: UserProfileData = {
      ...current,
      profile: {
        ...current.profile,
        ...fields,
        avatarInitials: initials,
      },
    };

    set({ data: updated });
    saveToStorage(updated);

    // Sync to Supabase in background if logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        dbUpdateHeader(user.id, { ...fields, avatarInitials: initials });
      }
    });
  },

  updateSettings: (fields) => {
    const current = get().data;
    const updated: UserProfileData = {
      ...current,
      settings: {
        ...current.settings,
        ...fields,
      },
    };

    set({ data: updated });
    saveToStorage(updated);

    // Sync to Supabase in background
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        dbUpdateSettings(user.id, fields);
      }
    });
  },

  saveCircuit: (name, circuit) => {
    const current = get().data;
    const newCircuitId = `sc_${Date.now()}`;
    const newCircuitItem = {
      id: newCircuitId,
      name,
      circuitJson: circuit,
      lastEdited: new Date().toISOString(),
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      type: 'circuit_saved' as const,
      label: `Saved circuit: '${name}'`,
      timestamp: new Date().toISOString(),
    };

    const updated: UserProfileData = {
      ...current,
      stats: {
        ...current.stats,
        circuitsBuilt: current.stats.circuitsBuilt + 1,
      },
      savedCircuits: [newCircuitItem, ...current.savedCircuits],
      activity: [newActivity, ...current.activity],
    };

    set({ data: updated });
    saveToStorage(updated);

    // Sync to Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        dbSaveCircuit(user.id, newCircuitId, name, circuit);
      }
    });
  },

  deleteCircuit: (id) => {
    const current = get().data;
    const updated: UserProfileData = {
      ...current,
      savedCircuits: current.savedCircuits.filter((c) => c.id !== id),
    };

    set({ data: updated });
    saveToStorage(updated);

    // Sync to Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        dbDeleteCircuit(user.id, id);
      }
    });
  },

  resetProgress: () => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem('quantumlearn-progress');
    const fresh = JSON.parse(JSON.stringify(DEFAULT_PROFILE_DATA));
    set({ data: fresh });
    saveToStorage(fresh);
  },
}));
