// ============================================================
// QuantumLearn AI — Zustand Stores
// ============================================================

import { create } from 'zustand';
import type {
  QuantumCircuit,
  QuantumGate,
  SimulationResult,
  ChatMessage,
  UserProgress,
  CircuitStep,
} from './types';
import { simulator } from './simulator';

// --- Circuit Store ---

interface CircuitState {
  circuit: QuantumCircuit;
  history: QuantumCircuit[];
  historyIndex: number;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  selectedGate: string | null;

  // Actions
  setCircuit: (circuit: QuantumCircuit) => void;
  addGate: (gate: QuantumGate, stepIndex?: number) => void;
  removeGate: (stepIndex: number, gateId: string) => void;
  setNumQubits: (n: number) => void;
  clearCircuit: () => void;
  undo: () => void;
  redo: () => void;
  runSimulation: (shots?: number) => void;
  setSelectedGate: (gateType: string | null) => void;
  loadCircuit: (circuit: QuantumCircuit) => void;
}

function createEmptyCircuit(numQubits: number = 2): QuantumCircuit {
  return {
    name: 'New Circuit',
    numQubits,
    steps: [],
  };
}

function pushHistory(state: CircuitState, newCircuit: QuantumCircuit) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(newCircuit)));
  return {
    circuit: newCircuit,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  circuit: createEmptyCircuit(),
  history: [createEmptyCircuit()],
  historyIndex: 0,
  simulationResult: null,
  isSimulating: false,
  selectedGate: null,

  setCircuit: (circuit) => set((state) => pushHistory(state, circuit)),

  addGate: (gate, stepIndex) => set((state) => {
    const newCircuit = JSON.parse(JSON.stringify(state.circuit)) as QuantumCircuit;

    if (stepIndex !== undefined && stepIndex < newCircuit.steps.length) {
      newCircuit.steps[stepIndex].gates.push(gate);
    } else {
      newCircuit.steps.push({ gates: [gate] });
    }

    return pushHistory(state, newCircuit);
  }),

  removeGate: (stepIndex, gateId) => set((state) => {
    const newCircuit = JSON.parse(JSON.stringify(state.circuit)) as QuantumCircuit;
    if (stepIndex < newCircuit.steps.length) {
      newCircuit.steps[stepIndex].gates = newCircuit.steps[stepIndex].gates.filter(
        (g: QuantumGate) => g.id !== gateId
      );
      // Remove empty steps
      if (newCircuit.steps[stepIndex].gates.length === 0) {
        newCircuit.steps.splice(stepIndex, 1);
      }
    }
    return pushHistory(state, newCircuit);
  }),

  setNumQubits: (n) => set((state) => {
    const newCircuit = JSON.parse(JSON.stringify(state.circuit)) as QuantumCircuit;
    newCircuit.numQubits = Math.max(1, Math.min(8, n));

    // Remove gates that reference non-existent qubits
    for (const step of newCircuit.steps) {
      step.gates = step.gates.filter((g: QuantumGate) => {
        if (g.qubit >= newCircuit.numQubits) return false;
        if (g.control !== undefined && g.control >= newCircuit.numQubits) return false;
        if (g.target !== undefined && g.target >= newCircuit.numQubits) return false;
        return true;
      });
    }
    newCircuit.steps = newCircuit.steps.filter((s: CircuitStep) => s.gates.length > 0);

    return pushHistory(state, newCircuit);
  }),

  clearCircuit: () => set((state) => {
    const empty = createEmptyCircuit(state.circuit.numQubits);
    return pushHistory(state, empty);
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        circuit: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        circuit: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      };
    }
    return state;
  }),

  runSimulation: (shots = 1024) => {
    set({ isSimulating: true });
    try {
      const result = simulator.simulate(get().circuit, shots);
      set({ simulationResult: result, isSimulating: false });
    } catch (error) {
      console.error('Simulation error:', error);
      set({ isSimulating: false });
    }
  },

  setSelectedGate: (gateType) => set({ selectedGate: gateType }),

  loadCircuit: (circuit) => set((state) => {
    return pushHistory(state, JSON.parse(JSON.stringify(circuit)));
  }),
}));

// --- Chat Store ---

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isTutorOpen: boolean;

  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  toggleTutor: () => void;
  setTutorOpen: (open: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  isTutorOpen: false,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  toggleTutor: () => set((state) => ({ isTutorOpen: !state.isTutorOpen })),
  setTutorOpen: (open) => set({ isTutorOpen: open }),
  clearChat: () => set({ messages: [] }),
}));

// --- Progress Store ---

interface ProgressState {
  progress: UserProgress;
  loadProgress: () => Promise<void>;
  completeModule: (moduleId: string) => void;
  completeChallenge: (result: import('./types').ChallengeResult) => void;
}

const DEFAULT_PROGRESS: UserProgress = {
  completedModules: [],
  completedChallenges: [],
  lastActiveModule: null,
  totalTimeSpent: 0,
  streakDays: 0,
  lastActiveDate: '',
};

import { supabase } from '../lib/supabase';
import { fetchUserProgress, saveUserProgress, logUserActivity } from '../lib/db';

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: DEFAULT_PROGRESS,

  loadProgress: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cloudProg = await fetchUserProgress(user.id);
        set({ progress: cloudProg });
        localStorage.setItem('quantumlearn-progress', JSON.stringify(cloudProg));
        return;
      }
    } catch {
      // Fallback
    }

    try {
      const saved = localStorage.getItem('quantumlearn-progress');
      if (saved) {
        set({ progress: JSON.parse(saved) });
      }
    } catch {
      console.warn('Failed to load progress');
    }
  },

  completeModule: (moduleId) => {
    const current = get().progress;
    if (!current.completedModules.includes(moduleId)) {
      const updated: UserProgress = {
        ...current,
        completedModules: [...current.completedModules, moduleId],
        lastActiveModule: moduleId,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
      set({ progress: updated });
      localStorage.setItem('quantumlearn-progress', JSON.stringify(updated));

      // Sync to Supabase
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          saveUserProgress(user.id, updated);
          logUserActivity(user.id, 'module_complete', `Completed module: ${moduleId}`);
        }
      });
    }
  },

  completeChallenge: (result) => {
    const current = get().progress;
    const updated: UserProgress = {
      ...current,
      completedChallenges: [...current.completedChallenges, result],
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    set({ progress: updated });
    localStorage.setItem('quantumlearn-progress', JSON.stringify(updated));

    // Sync to Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        saveUserProgress(user.id, updated);
        if (result.passed) {
          logUserActivity(user.id, 'challenge_passed', `Passed challenge: ${result.challengeId}`);
        }
      }
    });
  },
}));

