// ============================================================
// QuantumLearn AI — Core Type Definitions
// ============================================================

// --- Gate Types ---

export type SingleQubitGateType =
  | 'H' | 'X' | 'Y' | 'Z'
  | 'S' | 'T'
  | 'RX' | 'RY' | 'RZ';

export type MultiQubitGateType = 'CNOT' | 'CZ' | 'SWAP';

export type MeasurementType = 'MEASURE';

export type GateType = SingleQubitGateType | MultiQubitGateType | MeasurementType;

export interface GateInfo {
  type: GateType;
  label: string;
  description: string;
  color: string;
  category: 'single' | 'rotation' | 'multi' | 'measurement';
  paramCount: number; // 0 for fixed gates, 1+ for parameterized
}

// --- Circuit Model ---

export interface QuantumGate {
  id: string;
  type: GateType;
  qubit: number;       // target qubit index (0-based)
  control?: number;    // control qubit for CNOT, CZ
  target?: number;     // second qubit for SWAP
  params?: number[];   // rotation angles for RX, RY, RZ (in radians)
}

export interface CircuitStep {
  gates: QuantumGate[];
}

export interface QuantumCircuit {
  name: string;
  numQubits: number;
  steps: CircuitStep[];
}

// --- Simulation Results ---

export interface Complex {
  real: number;
  imag: number;
}

export interface BlochVector {
  x: number;
  y: number;
  z: number;
}

export interface SimulationResult {
  statevector: Complex[];
  probabilities: number[];
  blochVectors: BlochVector[];
  counts: Record<string, number>;
  circuitDepth: number;
  gateCount: number;
}

// --- AI Tutor ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  circuitContext?: QuantumCircuit;
}

export interface TutorContext {
  currentCircuit: QuantumCircuit | null;
  simulationResult: SimulationResult | null;
  currentModule: string | null;
  currentChallenge: string | null;
}

// --- Learning Modules & Course Tracks ---

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;           // Markdown content
  type: 'theory' | 'interactive' | 'tryit';
  preloadedCircuit?: QuantumCircuit;  // For "Try it" sections
}

export interface LearningModule {
  id: string;
  trackId: string;
  trackTitle: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  sections: LessonSection[];
  prerequisites: string[];
  glossary?: GlossaryTerm[];
  quiz?: QuizQuestion[];
}

export interface CourseTrack {
  id: string;
  title: string;
  description: string;
  moduleIds: string[];
}

// --- Assessments ---

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;      // Markdown
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  initialCircuit: QuantumCircuit;
  expectedOutcome: {
    type: 'statevector' | 'probabilities' | 'counts';
    value: Complex[] | number[] | Record<string, number>;
    tolerance: number;
  };
  hints: string[];
  moduleId: string;
}

export interface ChallengeResult {
  challengeId: string;
  passed: boolean;
  userCircuit: QuantumCircuit;
  userResult: SimulationResult;
  timestamp: number;
}

// --- Progress ---

export interface UserProgress {
  completedModules: string[];
  completedChallenges: ChallengeResult[];
  lastActiveModule: string | null;
  totalTimeSpent: number; // in seconds
  streakDays: number;
  lastActiveDate: string;
}

// --- Gate Registry ---

export const GATE_REGISTRY: Record<GateType, GateInfo> = {
  H: {
    type: 'H',
    label: 'H',
    description: 'Hadamard gate — creates superposition',
    color: '#8B5CF6',
    category: 'single',
    paramCount: 0,
  },
  X: {
    type: 'X',
    label: 'X',
    description: 'Pauli-X (NOT) gate — bit flip',
    color: '#EF4444',
    category: 'single',
    paramCount: 0,
  },
  Y: {
    type: 'Y',
    label: 'Y',
    description: 'Pauli-Y gate — bit + phase flip',
    color: '#F59E0B',
    category: 'single',
    paramCount: 0,
  },
  Z: {
    type: 'Z',
    label: 'Z',
    description: 'Pauli-Z gate — phase flip',
    color: '#3B82F6',
    category: 'single',
    paramCount: 0,
  },
  S: {
    type: 'S',
    label: 'S',
    description: 'S gate — π/2 phase',
    color: '#6366F1',
    category: 'single',
    paramCount: 0,
  },
  T: {
    type: 'T',
    label: 'T',
    description: 'T gate — π/4 phase',
    color: '#8B5CF6',
    category: 'single',
    paramCount: 0,
  },
  RX: {
    type: 'RX',
    label: 'Rx',
    description: 'Rotation around X-axis',
    color: '#EC4899',
    category: 'rotation',
    paramCount: 1,
  },
  RY: {
    type: 'RY',
    label: 'Ry',
    description: 'Rotation around Y-axis',
    color: '#F97316',
    category: 'rotation',
    paramCount: 1,
  },
  RZ: {
    type: 'RZ',
    label: 'Rz',
    description: 'Rotation around Z-axis',
    color: '#14B8A6',
    category: 'rotation',
    paramCount: 1,
  },
  CNOT: {
    type: 'CNOT',
    label: 'CX',
    description: 'Controlled-NOT — entangles two qubits',
    color: '#06B6D4',
    category: 'multi',
    paramCount: 0,
  },
  CZ: {
    type: 'CZ',
    label: 'CZ',
    description: 'Controlled-Z gate',
    color: '#0EA5E9',
    category: 'multi',
    paramCount: 0,
  },
  SWAP: {
    type: 'SWAP',
    label: 'SW',
    description: 'SWAP gate — exchanges two qubits',
    color: '#22D3EE',
    category: 'multi',
    paramCount: 0,
  },
  MEASURE: {
    type: 'MEASURE',
    label: 'M',
    description: 'Measurement in computational basis',
    color: '#64748B',
    category: 'measurement',
    paramCount: 0,
  },
};
