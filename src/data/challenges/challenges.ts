// ============================================================
// QuantumLearn AI — Challenges Data
// Seamlessly synced with Quantum Problems dataset
// ============================================================

import type { Challenge } from '../../core/types';
import { INITIAL_PROBLEMS } from '../problems/problemsData';

export const bellStateChallenge: Challenge = {
  id: 'bell-state',
  title: 'Build a Bell State',
  description: 'Create a maximally entangled pair of qubits — the famous Bell state |Φ+⟩.',
  instructions: `# Challenge: Build a Bell State

## Objective
Create the Bell state **|Φ+⟩ = (|00⟩ + |11⟩) / √2**

## Instructions
1. Start with 2 qubits in state |00⟩ (already set up)
2. Apply the right gates to create entanglement
3. Add measurement gates to both qubits
4. Click **Run** to simulate
5. Click **Submit** to check your answer

## Expected Result
When measured, you should see ONLY two outcomes:
- **|00⟩** — approximately 50%
- **|11⟩** — approximately 50%

You should NEVER see |01⟩ or |10⟩!`,
  difficulty: 'beginner',
  initialCircuit: {
    name: 'Bell State Challenge',
    numQubits: 2,
    steps: [],
  },
  expectedOutcome: {
    type: 'probabilities',
    value: [0.5, 0, 0, 0.5],
    tolerance: 0.08,
  },
  hints: [
    'You need just TWO gates to create a Bell state.',
    'First, put one qubit into superposition...',
    'Apply H to q0, then CNOT with q0 as control and q1 as target.',
  ],
  moduleId: 'superposition-single-qubit',
};

// Map all problems into challenges format
const convertedProblems: Challenge[] = INITIAL_PROBLEMS.map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  instructions: `# ${p.title}\n\n## Objective\n${p.objective}\n\n${p.description}\n\n## Target Output\n${p.expectedDescription || 'Observe corresponding probability distribution.'}`,
  difficulty: p.difficulty === 'Easy' ? 'beginner' : p.difficulty === 'Medium' ? 'intermediate' : 'advanced',
  initialCircuit: p.initialCircuit,
  expectedOutcome: {
    type: 'probabilities',
    value: p.expectedProbabilities || [0.5, 0.5],
    tolerance: p.tolerance || 0.08,
  },
  hints: p.hints || ['Experiment with quantum gate transformations in the circuit editor.'],
  moduleId: 'superposition-single-qubit',
}));

export const allChallenges: Challenge[] = [bellStateChallenge, ...convertedProblems];
