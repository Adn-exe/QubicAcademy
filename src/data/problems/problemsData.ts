// ============================================================
// QuantumLearn AI — Problems & Challenge Dataset
// LeetCode-style dense scannable problems with starter circuits and validation
// Persisted in localStorage under "quantumlearn:problems"
// ============================================================

import type { QuantumCircuit } from '../../core/types';
import { supabase } from '../../lib/supabase';
import {
  fetchUserProblems,
  fetchUserProblemsProgress,
  saveUserProblemsProgress as dbSaveProblemsProgress,
  upsertUserProblemStatus,
  logUserActivity,
} from '../../lib/db';

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemTopic = 'Superposition' | 'Entanglement' | 'Measurement' | 'Teleportation' | 'Algorithms';
export type ProblemStatus = 'Solved' | 'Attempted' | 'Unsolved';

export interface QuantumProblem {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: ProblemDifficulty;
  topic: ProblemTopic;
  status: ProblemStatus;
  solvedDate?: string;
  initialCircuit: QuantumCircuit;
  hints: string[];
  expectedProbabilities?: number[];
  expectedDescription?: string;
  tolerance?: number;
}

export interface ProblemsProgress {
  currentStreak: number;
  maxStreak: number;
  recentActivity: Array<{
    id: string;
    problemId: string;
    problemTitle: string;
    action: 'solved' | 'attempted';
    timestamp: string;
  }>;
}

export const PROBLEMS_STORAGE_KEY = 'quantumlearn:problems';
export const PROBLEMS_PROGRESS_KEY = 'quantumlearn:problems_progress';
export const ACTIVE_PROBLEM_KEY = 'quantumlearn:active_problem';

export const INITIAL_PROBLEMS: QuantumProblem[] = [
  // --- EASY (6 problems) ---
  {
    id: 'p1',
    title: 'Prepare Equal Superposition (|+) State)',
    description: 'Transform a single ground-state qubit |0⟩ into equal superposition |+⟩ = (|0⟩ + |1⟩)/√2 using the Hadamard gate.',
    objective: 'Apply Hadamard gate H to qubit 0 and measure to produce 50% |0⟩ and 50% |1⟩.',
    difficulty: 'Easy',
    topic: 'Superposition',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Prepare |+⟩',
      numQubits: 1,
      steps: [
        { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'm1', type: 'MEASURE', qubit: 0 }] },
      ],
    },
    hints: [
      'The Hadamard gate creates an equal superposition when applied to basis states.',
      'Add a measurement gate to observe the 50/50 probability distribution.',
    ],
    expectedProbabilities: [0.5, 0.5],
    expectedDescription: '|0⟩: 50%, |1⟩: 50%',
    tolerance: 0.08,
  },
  {
    id: 'p2',
    title: 'Construct Pauli-X Bit Flip',
    description: 'Invert the computational ground state |0⟩ to state |1⟩ using a single Pauli-X gate.',
    objective: 'Apply Pauli-X gate to qubit 0 to flip its state from |0⟩ to |1⟩ with 100% probability.',
    difficulty: 'Easy',
    topic: 'Superposition',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Pauli-X Flip',
      numQubits: 1,
      steps: [
        { gates: [{ id: 'g1', type: 'X', qubit: 0 }] },
        { gates: [{ id: 'm1', type: 'MEASURE', qubit: 0 }] },
      ],
    },
    hints: [
      'The Pauli-X gate acts as a quantum NOT gate.',
      'Applying X to |0⟩ transforms it directly into |1⟩.',
    ],
    expectedProbabilities: [0.0, 1.0],
    expectedDescription: '|0⟩: 0%, |1⟩: 100%',
    tolerance: 0.05,
  },
  {
    id: 'p3',
    title: 'Synthesize Bell State |Φ+⟩',
    description: 'Create a maximally entangled 2-qubit Bell pair (|00⟩ + |11⟩)/√2 using a Hadamard gate and a CNOT gate.',
    objective: 'Create entanglement between qubit 0 and qubit 1 such that only |00⟩ and |11⟩ are observed.',
    difficulty: 'Easy',
    topic: 'Entanglement',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Bell State |Φ+⟩',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'g2', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }] },
      ],
    },
    hints: [
      'First apply H to qubit 0 to create superposition.',
      'Then apply CNOT with qubit 0 as control and qubit 1 as target.',
    ],
    expectedProbabilities: [0.5, 0, 0, 0.5],
    expectedDescription: '|00⟩: 50%, |01⟩: 0%, |10⟩: 0%, |11⟩: 50%',
    tolerance: 0.08,
  },
  {
    id: 'p4',
    title: 'Projective Z-Basis Measurement',
    description: 'Prepare an arbitrary state and measure it in the computational basis to observe projective wavefunction collapse.',
    objective: 'Apply a single-qubit rotation and measure to demonstrate computational basis projection.',
    difficulty: 'Easy',
    topic: 'Measurement',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Projective Collapse',
      numQubits: 1,
      steps: [
        { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'm1', type: 'MEASURE', qubit: 0 }] },
      ],
    },
    hints: [
      'Measurement in the Z-basis collapses any superposition into either |0⟩ or |1⟩.',
    ],
    expectedProbabilities: [0.5, 0.5],
    expectedDescription: '|0⟩: 50%, |1⟩: 50%',
    tolerance: 0.08,
  },
  {
    id: 'p5',
    title: 'Phase Flip to Create |−⟩ State',
    description: 'Apply a Pauli-Z gate to state |+⟩ to invert relative phase and produce state |−⟩ = (|0⟩ − |1⟩)/√2.',
    objective: 'Construct state |−⟩ by applying H then Z, then verify phase by applying H again to arrive at |1⟩.',
    difficulty: 'Easy',
    topic: 'Superposition',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Create |−⟩',
      numQubits: 1,
      steps: [
        { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'g2', type: 'Z', qubit: 0 }] },
      ],
    },
    hints: [
      'Applying H transforms |0⟩ into |+⟩.',
      'Applying Z to |+⟩ converts it to |−⟩.',
      'Applying a second H will map |−⟩ cleanly to |1⟩!',
    ],
    expectedProbabilities: [0.5, 0.5],
    expectedDescription: 'Equal amplitudes with π relative phase',
    tolerance: 0.08,
  },
  {
    id: 'p13',
    title: '2-Qubit Product State |01⟩ Preparation',
    description: 'Initialize a 2-qubit register into computational product basis state |01⟩ (qubit 0 in |0⟩, qubit 1 in |1⟩).',
    objective: 'Leave qubit 0 in ground state |0⟩ and flip qubit 1 to |1⟩ with a Pauli-X gate.',
    difficulty: 'Easy',
    topic: 'Superposition',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Product State |01⟩',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'x1', type: 'X', qubit: 1 }] },
        { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }] },
      ],
    },
    hints: [
      'Leave qubit 0 untouched.',
      'Apply Pauli-X to qubit 1.',
    ],
    expectedProbabilities: [0, 0, 1.0, 0], // q0=0, q1=1 corresponds to state index 2 in standard little-endian/big-endian
    expectedDescription: '|01⟩: 100%',
    tolerance: 0.05,
  },

  // --- MEDIUM (6 problems) ---
  {
    id: 'p6',
    title: 'Synthesize Bell State |Ψ+⟩',
    description: 'Transform |00⟩ into the entangled Bell state (|01⟩ + |10⟩)/√2 using X, H, and CNOT operations.',
    objective: 'Synthesize the odd-parity Bell state with 50% |01⟩ and 50% |10⟩.',
    difficulty: 'Medium',
    topic: 'Entanglement',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Bell State |Ψ+⟩',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'g1', type: 'X', qubit: 1 }] },
        { gates: [{ id: 'g2', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'g3', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }] },
      ],
    },
    hints: [
      'Start by applying X to qubit 1 to flip it to |1⟩.',
      'Apply H to qubit 0 to generate superposition.',
      'Finally add CNOT with qubit 0 control and qubit 1 target.',
    ],
    expectedProbabilities: [0, 0.5, 0.5, 0],
    expectedDescription: '|01⟩: 50%, |10⟩: 50%',
    tolerance: 0.08,
  },
  {
    id: 'p7',
    title: '3-Qubit Greenberger–Horne–Zeilinger (GHZ) State',
    description: 'Synthesize the tripartite maximally entangled state (|000⟩ + |111⟩)/√2 across three qubits.',
    objective: 'Entangle 3 qubits such that only |000⟩ and |111⟩ are observed with equal 50% probability.',
    difficulty: 'Medium',
    topic: 'Entanglement',
    status: 'Unsolved',
    initialCircuit: {
      name: 'GHZ State',
      numQubits: 3,
      steps: [
        { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'g2', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'g3', type: 'CNOT', qubit: 2, control: 1, target: 2 }] },
        { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }, { id: 'm2', type: 'MEASURE', qubit: 2 }] },
      ],
    },
    hints: [
      'Hadamard on qubit 0.',
      'CNOT from qubit 0 to qubit 1.',
      'CNOT from qubit 1 to qubit 2 to propagate entanglement.',
    ],
    expectedProbabilities: [0.5, 0, 0, 0, 0, 0, 0, 0.5],
    expectedDescription: '|000⟩: 50%, |111⟩: 50%',
    tolerance: 0.08,
  },
  {
    id: 'p8',
    title: 'Quantum Teleportation Alice Bell Measurement',
    description: 'Assemble the transmitter stage of the teleportation protocol by performing CNOT and H gates on Alice’s registers.',
    objective: 'Perform joint Bell measurement on input qubit 0 and shared EPR qubit 1.',
    difficulty: 'Medium',
    topic: 'Teleportation',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Alice Teleportation Stage',
      numQubits: 3,
      steps: [
        { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'g2', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'g3', type: 'CNOT', qubit: 2, control: 1, target: 2 }] },
        { gates: [{ id: 'g4', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'g5', type: 'H', qubit: 0 }] },
      ],
    },
    hints: [
      'Alice entangles the unknown state with her half of the EPR pair using CNOT.',
      'She then rotates into the X-basis with a Hadamard gate on qubit 0.',
    ],
    expectedDescription: 'Bell basis discrimination across registers 0 and 1',
  },
  {
    id: 'p10',
    title: 'Grover Oracle for Target State |11⟩',
    description: 'Design a phase-inversion oracle that marks basis state |11⟩ by flipping its amplitude sign to negative using a Controlled-Z gate.',
    objective: 'Implement a Controlled-Z gate on 2 qubits using Hadamard and CNOT gates.',
    difficulty: 'Medium',
    topic: 'Algorithms',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Grover Oracle |11⟩',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'h0', type: 'H', qubit: 0 }, { id: 'h1', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'cz_h1', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'cz_cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'cz_h2', type: 'H', qubit: 1 }] },
      ],
    },
    hints: [
      'A Controlled-Z gate can be synthesized by sandwiching CNOT between two Hadamard gates on the target qubit.',
      'This flips the phase of only |11⟩ to -1.',
    ],
    expectedDescription: 'Sign inversion on amplitude |11⟩',
  },
  {
    id: 'p14',
    title: 'Quantum SWAP Gate using 3 CNOTs',
    description: 'Synthesize a complete quantum state SWAP operation between 2 qubits using exclusively 3 alternating CNOT gates.',
    objective: 'Exchange the quantum states of qubit 0 and qubit 1 without using the native SWAP gate.',
    difficulty: 'Medium',
    topic: 'Algorithms',
    status: 'Unsolved',
    initialCircuit: {
      name: '3-CNOT SWAP',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'x0', type: 'X', qubit: 0 }] }, // prepare |10⟩
        { gates: [{ id: 'cx1', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'cx2', type: 'CNOT', qubit: 0, control: 1, target: 0 }] },
        { gates: [{ id: 'cx3', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }] },
      ],
    },
    hints: [
      'Three CNOT gates with alternating control and target will swap any 2-qubit state.',
      'Order: CNOT(0→1), CNOT(1→0), CNOT(0→1).',
    ],
    expectedProbabilities: [0, 0, 1.0, 0],
    expectedDescription: 'States swapped cleanly: |10⟩ becomes |01⟩',
    tolerance: 0.05,
  },
  {
    id: 'p15',
    title: 'Quantum Phase Kickback Circuit',
    description: 'Demonstrate phase kickback by applying a Controlled-U gate when the target register is prepared in an eigenstate with eigenvalue -1.',
    objective: 'Prepare target qubit in |−⟩ state, apply CNOT from control qubit in |+⟩, and observe control qubit flip to |−⟩.',
    difficulty: 'Medium',
    topic: 'Algorithms',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Phase Kickback',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'h0', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'x1', type: 'X', qubit: 1 }] },
        { gates: [{ id: 'h1', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'h0_test', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }] },
      ],
    },
    hints: [
      'Prepare qubit 1 in state |−⟩ by applying X then H.',
      'Prepare qubit 0 in state |+⟩ with H.',
      'The CNOT kicks back a phase factor of -1 to qubit 0!',
    ],
    expectedDescription: 'Control qubit reflects kickback phase',
  },

  // --- HARD (6 problems) ---
  {
    id: 'p9',
    title: 'Full Teleportation Recovery Circuit',
    description: 'Construct the complete 3-qubit teleportation protocol including Bob’s conditional Pauli corrections (X and Z).',
    objective: 'Transmit unknown quantum state from qubit 0 to qubit 2 across an entangled channel.',
    difficulty: 'Hard',
    topic: 'Teleportation',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Full Teleportation',
      numQubits: 3,
      steps: [
        { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'g2', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'g3', type: 'CNOT', qubit: 2, control: 1, target: 2 }] },
        { gates: [{ id: 'g4', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'g5', type: 'H', qubit: 0 }] },
      ],
    },
    hints: [
      'Bob requires conditional Pauli-X if Alice measures qubit 1 in |1⟩.',
      'Bob requires conditional Pauli-Z if Alice measures qubit 0 in |1⟩.',
    ],
    expectedDescription: 'Fidelity 1.0 teleported state on qubit 2',
  },
  {
    id: 'p11',
    title: 'Grover Diffusion Operator (2|s⟩⟨s| − I)',
    description: 'Assemble the 2-qubit amplitude amplification diffusion operator via Hadamard layers, Pauli-X inversion, and multi-control phase flip.',
    objective: 'Implement reflection about the uniform superposition state |s⟩.',
    difficulty: 'Hard',
    topic: 'Algorithms',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Grover Diffusion Operator',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'dh0', type: 'H', qubit: 0 }, { id: 'dh1', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'dx0', type: 'X', qubit: 0 }, { id: 'dx1', type: 'X', qubit: 1 }] },
        { gates: [{ id: 'cz_h', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'cz_cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'cz_h2', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'dx0_b', type: 'X', qubit: 0 }, { id: 'dx1_b', type: 'X', qubit: 1 }] },
        { gates: [{ id: 'dh0_b', type: 'H', qubit: 0 }, { id: 'dh1_b', type: 'H', qubit: 1 }] },
      ],
    },
    hints: [
      'Layer 1: Hadamard on all qubits.',
      'Layer 2: Pauli-X on all qubits.',
      'Layer 3: Controlled-Z across the qubits.',
      'Layer 4: Invert X and H layers.',
    ],
    expectedDescription: 'Amplitude inversion about average state',
  },
  {
    id: 'p12',
    title: 'Deutsch-Jozsa Constant vs Balanced Oracle',
    description: 'Evaluate an unknown boolean black box in a single quantum query using quantum parallelism and phase kickback on the ancilla register.',
    objective: 'Distinguish balanced oracle from constant oracle in a single quantum evaluation.',
    difficulty: 'Hard',
    topic: 'Algorithms',
    status: 'Unsolved',
    initialCircuit: {
      name: 'Deutsch-Jozsa Oracle Test',
      numQubits: 2,
      steps: [
        { gates: [{ id: 'x1', type: 'X', qubit: 1 }] },
        { gates: [{ id: 'h0', type: 'H', qubit: 0 }, { id: 'h1', type: 'H', qubit: 1 }] },
        { gates: [{ id: 'cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'hf0', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }] },
      ],
    },
    hints: [
      'If the oracle is balanced, constructive interference on |1⟩ occurs.',
      'If constant, constructive interference on |0⟩ occurs.',
    ],
    expectedProbabilities: [0, 1.0],
    expectedDescription: 'Qubit 0 measures |1⟩ indicating balanced function',
    tolerance: 0.05,
  },
  {
    id: 'p16',
    title: '3-Qubit W-State Synthesis',
    description: 'Synthesize the multipartite W-state (|001⟩ + |010⟩ + |100⟩)/√3 which remains entangled even under loss of any single qubit.',
    objective: 'Generate equal superposition across 3 single-excitation basis states.',
    difficulty: 'Hard',
    topic: 'Entanglement',
    status: 'Unsolved',
    initialCircuit: {
      name: 'W-State Synthesis',
      numQubits: 3,
      steps: [
        { gates: [{ id: 'h0', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'x1', type: 'X', qubit: 1 }] },
        { gates: [{ id: 'cx1', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'cx2', type: 'CNOT', qubit: 2, control: 1, target: 2 }] },
      ],
    },
    hints: [
      'The W-state features exactly one qubit in |1⟩ and two in |0⟩.',
      'Controlled rotations or CNOT combinations can distribute the excitation across 3 wires.',
    ],
    expectedDescription: 'Equal probability across |001⟩, |010⟩, and |100⟩',
  },
  {
    id: 'p17',
    title: 'Quantum 3-Qubit Bit-Flip Code Detection',
    description: 'Implement syndrome extraction for the 3-qubit bit-flip error correction code without destroying data superposition.',
    objective: 'Detect bit flip errors using 2 ancilla parity check measurements.',
    difficulty: 'Hard',
    topic: 'Algorithms',
    status: 'Unsolved',
    initialCircuit: {
      name: '3-Qubit Error Code',
      numQubits: 3,
      steps: [
        { gates: [{ id: 'h0', type: 'H', qubit: 0 }] },
        { gates: [{ id: 'cx1', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
        { gates: [{ id: 'cx2', type: 'CNOT', qubit: 2, control: 0, target: 2 }] },
        { gates: [{ id: 'err', type: 'X', qubit: 1 }] }, // simulated noise error on qubit 1
      ],
    },
    hints: [
      'Encoding maps |ψ⟩ = α|0⟩ + β|1⟩ into α|000⟩ + β|111⟩.',
      'Parity checks Z0Z1 and Z1Z2 isolate which wire experienced the bit flip.',
    ],
    expectedDescription: 'Syndrome identifies flipped qubit without state collapse',
  },
];

export const INITIAL_PROGRESS: ProblemsProgress = {
  currentStreak: 0,
  maxStreak: 0,
  recentActivity: [],
};

export function loadProblems(): QuantumProblem[] {
  try {
    const raw = localStorage.getItem(PROBLEMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with INITIAL_PROBLEMS to ensure all new problems and initialCircuits exist!
        const parsedMap = new Map(parsed.map((p: QuantumProblem) => [p.id, p]));
        return INITIAL_PROBLEMS.map((initial) => {
          const saved = parsedMap.get(initial.id);
          if (saved) {
            // Strip legacy hardcoded template mock statuses
            const isLegacyMock = saved.solvedDate && (
              saved.solvedDate.startsWith('2026-03-05') ||
              saved.solvedDate.startsWith('2026-03-06')
            );
            return {
              ...initial,
              status: isLegacyMock ? 'Unsolved' : (saved.status || 'Unsolved'),
              solvedDate: isLegacyMock ? undefined : saved.solvedDate,
            };
          }
          return initial;
        });
      }
    }
  } catch (err) {
    console.warn('Error reading problems from localStorage:', err);
  }
  return INITIAL_PROBLEMS;
}

export async function syncProblemsFromSupabase(): Promise<QuantumProblem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const cloudProblems = await fetchUserProblems(user.id);
      saveProblems(cloudProblems);
      window.dispatchEvent(new Event('quantumlearn:problems_changed'));
      return cloudProblems;
    }
  } catch (e) {
    console.warn('Could not sync problems from Supabase:', e);
  }
  return loadProblems();
}

export function saveProblems(problems: QuantumProblem[]) {
  try {
    localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(problems));
  } catch (err) {
    console.warn('Error writing problems to localStorage:', err);
  }
}

export function loadProblemsProgress(): ProblemsProgress {
  try {
    const raw = localStorage.getItem(PROBLEMS_PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanActivity = Array.isArray(parsed?.recentActivity)
        ? parsed.recentActivity.filter(
            (a: any) =>
              !a.id?.match(/^ra[1-6]$/) &&
              !a.timestamp?.match(/^2026-03-0[56]/) &&
              a.action === 'solved'
          )
        : [];

      return {
        currentStreak: cleanActivity.length === 0 ? 0 : (parsed.currentStreak || 0),
        maxStreak: cleanActivity.length === 0 ? 0 : (parsed.maxStreak || 0),
        recentActivity: cleanActivity,
      };
    }
  } catch (err) {
    console.warn('Error reading problems progress from localStorage:', err);
  }
  return INITIAL_PROGRESS;
}

export async function syncProblemsProgressFromSupabase(): Promise<ProblemsProgress> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const cloudProgress = await fetchUserProblemsProgress(user.id);
      saveProblemsProgress(cloudProgress);
      window.dispatchEvent(new Event('quantumlearn:problems_changed'));
      return cloudProgress;
    }
  } catch (e) {
    console.warn('Could not sync problems progress from Supabase:', e);
  }
  return loadProblemsProgress();
}


export function saveProblemsProgress(progress: ProblemsProgress) {
  try {
    localStorage.setItem(PROBLEMS_PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Error writing problems progress to localStorage:', err);
  }
}

export function getActiveProblem(): QuantumProblem | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PROBLEM_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to get active problem', e);
  }
  return null;
}

export function setActiveProblem(problem: QuantumProblem | null) {
  try {
    if (problem) {
      localStorage.setItem(ACTIVE_PROBLEM_KEY, JSON.stringify(problem));
    } else {
      localStorage.removeItem(ACTIVE_PROBLEM_KEY);
    }
    window.dispatchEvent(new Event('quantumlearn:active_problem_changed'));
  } catch (e) {
    console.warn('Failed to set active problem', e);
  }
}

export function markProblemSolved(problemId: string): QuantumProblem[] {
  const problems = loadProblems();
  const now = new Date().toISOString();
  const updated = problems.map((p) =>
    p.id === problemId ? { ...p, status: 'Solved' as ProblemStatus, solvedDate: now } : p
  );
  saveProblems(updated);

  // Update progress
  const progress = loadProblemsProgress();
  const pTarget = problems.find((p) => p.id === problemId);
  const updatedActivity = [
    {
      id: 'act-' + Date.now(),
      problemId,
      problemTitle: pTarget?.title || 'Quantum Problem',
      action: 'solved' as const,
      timestamp: now,
    },
    ...progress.recentActivity.filter((a) => a.problemId !== problemId),
  ].slice(0, 6);

  const newProgress: ProblemsProgress = {
    ...progress,
    currentStreak: progress.currentStreak + 1,
    maxStreak: Math.max(progress.maxStreak, progress.currentStreak + 1),
    recentActivity: updatedActivity,
  };

  saveProblemsProgress(newProgress);

  // Sync to Supabase in background
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      upsertUserProblemStatus(user.id, problemId, 'Solved', now);
      dbSaveProblemsProgress(user.id, newProgress);
      logUserActivity(user.id, 'challenge_passed', `Solved problem: ${pTarget?.title || problemId}`);
    }
  });

  return updated;
}

