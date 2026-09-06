// ============================================================
// QuantumLearn AI — Course Modules & Track Structure
// Grouped into Foundations, Circuits, and Algorithms tracks
// Includes rich algorithmic theory, interactive checks, and preloaded circuits
// ============================================================

import type { LearningModule, CourseTrack } from '../../core/types';

export const courseTracks: CourseTrack[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'Core principles of quantum states, superposition, and measurement.',
    moduleIds: ['superposition-single-qubit', 'quantum-measurement'],
  },
  {
    id: 'circuits',
    title: 'Circuits',
    description: 'Multi-qubit operations, entanglement, and quantum protocols.',
    moduleIds: ['entanglement-bell-states', 'quantum-teleportation'],
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Quantum speedups, phase estimation, amplitude amplification, and oracle searching.',
    moduleIds: ['grovers-search', 'deutsch-jozsa'],
  },
];

export const superpositionModule: LearningModule = {
  id: 'superposition-single-qubit',
  trackId: 'foundations',
  trackTitle: 'Foundations',
  title: 'Superposition & Single-Qubit Gates',
  description: 'Learn the fundamentals of quantum computing — qubits, superposition, and how single-qubit gates manipulate quantum states.',
  icon: 'atom',
  difficulty: 'beginner',
  estimatedMinutes: 12,
  prerequisites: [],
  glossary: [
    {
      term: 'Qubit',
      definition: 'The fundamental unit of quantum information, capable of existing in state |0⟩, |1⟩, or any linear combination (superposition) of both.',
    },
    {
      term: 'Superposition',
      definition: 'A principle of quantum mechanics where a system can exist in a linear combination of basis states simultaneously until measured.',
    },
    {
      term: 'Bloch Sphere',
      definition: 'A geometrical representation of the pure state space of a two-level quantum mechanical system (qubit).',
    },
    {
      term: 'Hadamard Gate',
      definition: 'A single-qubit operation that transforms basis states into equal superpositions: H|0⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = (|0⟩ - |1⟩)/√2.',
    },
    {
      term: 'Statevector',
      definition: 'A unit vector in complex vector space that completely describes the quantum state of a qubit system: |ψ⟩ = α|0⟩ + β|1⟩.',
    },
    {
      term: 'Probability Amplitude',
      definition: 'A complex number (α or β) whose squared magnitude (|α|² or |β|²) gives the probability of measuring that basis outcome.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      question: 'What is the state of a qubit after applying a Hadamard gate to |0⟩?',
      options: [
        'Deterministic |1⟩',
        'Equal superposition: (|0⟩ + |1⟩)/√2',
        'Statevector collapses to |0⟩',
        'Phase rotated by π around Z-axis',
      ],
      correctIndex: 1,
      explanation: 'The Hadamard gate maps the north pole |0⟩ directly to the equator (|0⟩ + |1⟩)/√2, yielding a 50% probability of measuring 0 and 50% probability of measuring 1.',
    },
    {
      id: 'q2',
      question: 'On the Bloch sphere, where do equal superposition states lie?',
      options: [
        'At the north pole',
        'At the south pole',
        'Along the equator',
        'At the origin (center of the sphere)',
      ],
      correctIndex: 2,
      explanation: 'The north pole is |0⟩ and the south pole is |1⟩. Any state with equal probability amplitudes lies on the equator circle of the sphere.',
    },
  ],
  sections: [
    {
      id: 'what-is-qubit',
      title: 'What is a Qubit?',
      type: 'theory',
      content: `In classical computation, information is stored as bits taking a definite binary value of 0 or 1. A qubit generalizes this by allowing continuous linear combinations of basis states.

The state of an isolated single qubit is mathematically represented by a normalized vector in two-dimensional complex Hilbert space:

**|ψ⟩ = α|0⟩ + β|1⟩**

Where the complex coefficients **α** and **β** satisfy **|α|² + |β|² = 1**. According to the Born rule, measuring the qubit in the computational basis yields outcome 0 with probability **|α|²** and outcome 1 with probability **|β|²**.

:::analogy The Spinning Coin
Imagine a coin resting on a desk: it is either completely *Heads (0)* or completely *Tails (1)*. This is a classical bit.

Now, spin that coin on its edge: while spinning rapidly, it is neither purely Heads nor purely Tails — it is a **continuous, dynamic blend of both states at once**!

Only when you **slap your hand down on the coin** does it randomly collapse into a definite 0 or 1. A qubit in superposition behaves just like that spinning coin!
:::`,
    },
    {
      id: 'hadamard-gate',
      title: 'The Hadamard Gate',
      type: 'interactive',
      content: `The **Hadamard gate (H)** is the canonical quantum operation that creates quantum superposition from a classical basis state.

Mathematically, the Hadamard operator acts as:
- **H|0⟩ = (|0⟩ + |1⟩) / √2 = |+⟩**
- **H|1⟩ = (|0⟩ - |1⟩) / √2 = |-⟩**

:::analogy The Optical Beam Splitter
Think of shining a single photon at a half-silvered mirror (beam splitter) in an optics laboratory. Exactly **50%** of the light wave transmits straight through and **50%** reflects at a 90° angle.

The **Hadamard gate** acts as this exact quantum beam splitter: taking a definite state |0⟩ and rotating it into an equal 50/50 superposition state |+⟩.
:::

:::hardware Quantum Random Number Generation (QRNG)
Because projective measurement of state |+⟩ yields fundamentally non-deterministic outcomes, quantum Hadamard gates are used in high-security cryptography as true hardware **Quantum Random Number Generators**.
:::`,
      preloadedCircuit: {
        name: 'Hadamard Demo',
        numQubits: 1,
        steps: [
          { gates: [{ id: 'h1', type: 'H', qubit: 0 }] },
          { gates: [{ id: 'm1', type: 'MEASURE', qubit: 0 }] },
        ],
      },
    },
    {
      id: 'pauli-gates',
      title: 'Pauli Gates: X, Y, Z',
      type: 'interactive',
      content: `The Pauli matrices form a basis for single-qubit quantum operations:

- **Pauli-X (Bit Flip):** Reversible NOT operation: X|0⟩ = |1⟩ and X|1⟩ = |0⟩. Corresponds to a π rotation around the X-axis of the Bloch sphere.
  - *Analogy:* Flipping a light switch between On and Off, executed in hardware by a calibrated 5 GHz microwave pulse.
- **Pauli-Y (Bit & Phase Flip):** Y|0⟩ = i|1⟩ and Y|1⟩ = -i|0⟩. Rotates the state vector around the Y-axis.
- **Pauli-Z (Phase Flip):** Preserves |0⟩ but inverts the sign of |1⟩: Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩.
  - *Analogy:* Active noise-canceling headphones. Fipping a sound wave's phase by 180° doesn't change its volume (probability), but when combined with another wave, it creates destructive interference!`,
      preloadedCircuit: {
        name: 'Pauli-X Demo',
        numQubits: 1,
        steps: [
          { gates: [{ id: 'x1', type: 'X', qubit: 0 }] },
          { gates: [{ id: 'm1', type: 'MEASURE', qubit: 0 }] },
        ],
      },
    },
    {
      id: 'tryit-yourself',
      title: 'Try It Yourself',
      type: 'tryit',
      content: `Test your understanding by testing gate sequences on the wire:

1. **Double Hadamard:** Apply H twice to qubit 0. Because H is Hermitian and unitary, **H · H = I** (identity). Verify that the state returns to |0⟩.
2. **X followed by H:** Start with X to flip to |1⟩, then apply H. Observe how the state vector points to (|0⟩ - |1⟩)/√2 (the |-⟩ state on the negative X-axis).
3. **Phase shift verification:** Apply H, then Z, then H. Predict the final measurement probability before running.`,
      preloadedCircuit: {
        name: 'Single Qubit Playground',
        numQubits: 1,
        steps: [],
      },
    },
  ],
};

export const measurementModule: LearningModule = {
  id: 'quantum-measurement',
  trackId: 'foundations',
  trackTitle: 'Foundations',
  title: 'Measurement & Probability Collapse',
  description: 'Understand projective measurement, Born rule statistics, and wave function collapse.',
  icon: 'bar-chart',
  difficulty: 'beginner',
  estimatedMinutes: 15,
  prerequisites: ['superposition-single-qubit'],
  glossary: [
    {
      term: 'Wave Function Collapse',
      definition: 'The reduction of a quantum superposition state to an eigenstate of the measurement operator upon observation.',
    },
    {
      term: 'Born Rule',
      definition: 'Postulate stating the probability of obtaining measurement eigenvalue λ is given by the squared magnitude of the projection onto its eigenspace.',
    },
  ],
  quiz: [
    {
      id: 'qm1',
      question: 'What happens to a qubit in superposition (|0⟩ + |1⟩)/√2 after measurement?',
      options: [
        'It stays in superposition permanently',
        'It irreversibly collapses to either |0⟩ or |1⟩',
        'It resets to the vacuum ground state',
        'It duplicates into two identical qubits',
      ],
      correctIndex: 1,
      explanation: 'Projective measurement forces the state vector to collapse to one of the computational basis eigenstates.',
    },
  ],
  sections: [
    {
      id: 'measurement-intro',
      title: 'Projective Measurement',
      type: 'theory',
      content: `Measurement in quantum computing is inherently destructive. Prior to measurement, a qubit in state |ψ⟩ = α|0⟩ + β|1⟩ evolves unitarily and deterministically under Schrödinger dynamics.

When a measurement gate is executed, the quantum superposition collapses into one of the measurement operator eigenstates with probability determined by the Born rule.

Repeated measurements on identically prepared quantum circuits accumulate statistical histograms that approximate the exact probabilities |α|² and |β|². In real quantum processors, finite shot counts introduce shot noise.`,
    },
    {
      id: 'measurement-demo',
      title: 'Observing Collapse',
      type: 'interactive',
      content: `Examine the circuit below. We prepare an arbitrary state and measure it 1024 times. Notice how the individual outcomes are discrete (0 or 1), while the aggregate distribution converges to the theoretical probabilities.`,
      preloadedCircuit: {
        name: 'Measurement Demo',
        numQubits: 1,
        steps: [
          { gates: [{ id: 'h1', type: 'H', qubit: 0 }] },
          { gates: [{ id: 'm1', type: 'MEASURE', qubit: 0 }] },
        ],
      },
    },
  ],
};

export const entanglementModule: LearningModule = {
  id: 'entanglement-bell-states',
  trackId: 'circuits',
  trackTitle: 'Circuits',
  title: 'Entanglement & Bell States',
  description: 'Construct 2-qubit entangled states and explore non-local quantum correlations.',
  icon: 'link',
  difficulty: 'intermediate',
  estimatedMinutes: 18,
  prerequisites: ['quantum-measurement'],
  glossary: [
    {
      term: 'Quantum Entanglement',
      definition: 'A phenomenon where two or more particles exhibit correlated physical properties that cannot be described independently of one another.',
    },
    {
      term: 'Bell State',
      definition: 'One of four maximally entangled two-qubit quantum states forming an orthonormal basis of the four-dimensional Hilbert space.',
    },
    {
      term: 'CNOT Gate',
      definition: 'Controlled-NOT operation that flips the target qubit if and only if the control qubit is in state |1⟩.',
    },
  ],
  quiz: [
    {
      id: 'e1',
      question: 'Which sequence of gates creates the Bell state (|00⟩ + |11⟩)/√2 from |00⟩?',
      options: [
        'CNOT then Hadamard on target',
        'Hadamard on qubit 0, then CNOT(0, 1)',
        'Pauli-X on both qubits',
        'Hadamard on both qubits simultaneously',
      ],
      correctIndex: 1,
      explanation: 'Applying H to qubit 0 creates (|00⟩ + |10⟩)/√2. Then CNOT with control q0 and target q1 flips q1 whenever q0 is 1, producing (|00⟩ + |11⟩)/√2.',
    },
  ],
  sections: [
    {
      id: 'entanglement-intro',
      title: 'What is Entanglement?',
      type: 'theory',
      content: `Two qubits are entangled when their composite state vector cannot be factored into the tensor product of individual qubit states:

**|ψ⟩ ≠ |ψ₁⟩ ⊗ |ψ₂⟩**

The four canonical maximally entangled states are the **Bell states**:
- **|Φ⁺⟩ = (|00⟩ + |11⟩) / √2**
- **|Φ⁻⟩ = (|00⟩ - |11⟩) / √2**
- **|Ψ⁺⟩ = (|01⟩ + |10⟩) / √2**
- **|Ψ⁻⟩ = (|01⟩ - |10⟩) / √2**

:::analogy The Magic Twin Dice
Imagine rolling a pair of magic dice in two different cities — one in *London*, and the other in *Sydney*.

Individually, each roll is completely unpredictable (50% chance of 0, 50% chance of 1). However, the moment the London die reveals a 0, the Sydney die is **guaranteed to land on 0 with 100% correlation** — instantly, across thousands of miles!

Einstein famously questioned this as *"spooky action at a distance"*, but quantum mechanics proves these two particles share a single unified quantum wave function.
:::

:::hardware Satellite Quantum Key Distribution (QKD)
This non-local correlation was awarded the **2022 Nobel Prize in Physics** and is deployed today:
- **Satellite Quantum Links:** The Chinese *Micius* satellite beams entangled photon pairs over **1,200 km** to ground stations.
- **Eavesdropping Immunity:** If an eavesdropper intercepts the transmission, the fragile entanglement collapses instantly, alerting both parties to the intrusion before cryptographic keys are compromised.
:::`,
    },
    {
      id: 'bell-circuit',
      title: 'Building Bell State |Φ⁺⟩',
      type: 'interactive',
      content: `To synthesize the Bell state |Φ⁺⟩:
1. Apply a Hadamard gate to control qubit q0.
2. Apply a Controlled-NOT (CNOT) gate with control q0 and target q1.

Run the simulation below to verify that measurement counts only yield '00' and '11' with equal frequency, with zero occurrences of '01' or '10'.`,
      preloadedCircuit: {
        name: 'Bell State Circuit',
        numQubits: 2,
        steps: [
          { gates: [{ id: 'h1', type: 'H', qubit: 0 }] },
          { gates: [{ id: 'cx1', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
          { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }] },
        ],
      },
    },
  ],
};

export const teleportationModule: LearningModule = {
  id: 'quantum-teleportation',
  trackId: 'circuits',
  trackTitle: 'Circuits',
  title: 'Quantum Teleportation Protocol',
  description: 'Transmit an unknown quantum state using shared entanglement and classical communication.',
  icon: 'radio',
  difficulty: 'intermediate',
  estimatedMinutes: 20,
  prerequisites: ['entanglement-bell-states'],
  glossary: [
    {
      term: 'No-Cloning Theorem',
      definition: 'Theorem stating that an unknown arbitrary quantum state cannot be replicated exactly without destroying the original.',
    },
    {
      term: 'Teleportation',
      definition: 'Protocol transferring quantum information using pre-shared entanglement and 2 classical bits.',
    },
  ],
  sections: [
    {
      id: 'teleportation-theory',
      title: 'The Protocol',
      type: 'theory',
      content: `Quantum teleportation transmits the exact state of an unknown qubit without physically sending the particle. By utilizing a pre-shared Bell pair between Alice and Bob, Alice performs a Bell measurement on her qubit and shares 2 classical bits with Bob, allowing him to reconstruct the exact state via conditional Pauli corrections.`,
    },
  ],
};

// ============================================================
// Enhanced Grover's Search Algorithm Module
// Deep dive into Phase Inversion, Diffusion, and Multi-Step Amplification
// ============================================================
export const groverModule: LearningModule = {
  id: 'grovers-search',
  trackId: 'algorithms',
  trackTitle: 'Algorithms',
  title: "Grover's Search Algorithm",
  description: 'Achieve quadratic speedup searching unsorted databases with quantum amplitude amplification.',
  icon: 'search',
  difficulty: 'advanced',
  estimatedMinutes: 25,
  prerequisites: ['entanglement-bell-states'],
  glossary: [
    {
      term: 'Quantum Oracle',
      definition: 'A unitary operation U_ω that recognizes the marked item and flips its phase: U_ω|x⟩ = -|x⟩ if x = ω, and |x⟩ otherwise.',
    },
    {
      term: 'Diffusion Operator',
      definition: 'The transformation 2|s⟩⟨s| - I that reflects state amplitudes across their mean, magnifying the marked item.',
    },
    {
      term: 'Quadratic Speedup',
      definition: 'Reducing search complexity from classical O(N) evaluations to quantum O(√N) oracle queries.',
    },
    {
      term: 'Phase Kickback',
      definition: 'A quantum technique where the eigenvalue of an auxiliary target register is kicked back into the control state as a phase factor.',
    },
  ],
  quiz: [
    {
      id: 'g1',
      question: 'How many oracle queries does Grover’s algorithm need to search an unstructured database of N items?',
      options: [
        'O(N) queries',
        'O(log N) queries',
        'O(√N) queries',
        'O(1) constant queries',
      ],
      correctIndex: 2,
      explanation: 'Grover’s algorithm achieves a proven quadratic speedup, solving unstructured search in O(√N) queries compared to classical average N/2.',
    },
    {
      id: 'g2',
      question: 'What is the role of the Grover Diffusion Operator after the oracle flips the target phase?',
      options: [
        'It measures the qubits and resets them to zero',
        'It reflects all state amplitudes about their average, magnifying the target',
        'It randomizes the phase across all registers',
        'It entangles the search qubits with an ancillary detector',
      ],
      correctIndex: 1,
      explanation: 'The diffusion operator 2|s⟩⟨s| - I inverts all amplitudes about their mean. Since the target amplitude was made negative by the oracle, reflection about the mean dramatically magnifies it while suppressing non-target states.',
    },
  ],
  sections: [
    {
      id: 'grover-overview',
      title: '1. The Unstructured Search Problem',
      type: 'theory',
      content: `Consider searching for a single target item **ω** in an unsorted database of **N = 2ⁿ** elements. 

In classical computing, the database must be queried item by item. On average, finding the solution requires **N / 2** queries, and in the worst case **N** queries: **O(N)**.

Lov Grover proved in 1996 that a quantum computer can locate the target in only **O(√N)** iterations. For a database of 1,000,000 items, classical search requires ~500,000 lookups, while Grover requires only ~1,000 iterations!

:::analogy Ocean Waves & Constructive Resonance
Imagine looking for a needle in a haystack of 1,000,000 items. Classically, you must examine items one-by-one.

Grover's algorithm transforms database search into **wave interference on water**:
1. **Equal Ripples:** All 1,000,000 possibilities start as tiny, identical ripples in a pool.
2. **Oracle Phase Inversion:** The Oracle pushes down *only* on the target ripple, flipping its crest into a trough.
3. **Diffusion Mirror:** The diffusion operator reflects all ripples across their average height. This inverts the target trough into a **massive rogue wave near 100% amplitude**, while canceling out the 999,999 wrong ripples to near zero!
:::

:::hardware Cryptography & Post-Quantum Security
Grover's quadratic speedup has profound real-world consequences for cybersecurity:
- **Symmetric Encryption:** Cracking **AES-128** drops from 2¹²⁸ operations to 2⁶⁴ operations, prompting global standards agencies (NIST) to mandate migrations to **AES-256**.
- **Database Optimization:** Provides provable quadratic acceleration for collision finding and combinatorial optimization.
:::`,
    },
    {
      id: 'grover-geometry',
      title: '2. Geometric Intuition & The Grover Step',
      type: 'interactive',
      content: `Grover’s algorithm operates as a clean rotation in a two-dimensional subspace spanned by the target state **|ω⟩** and the superposition of all non-target states **|s'⟩**.

### Step-by-Step Execution for 2 Qubits (N = 4):
1. **Initialization:** Prepare all qubits in equal superposition:
   - **|s⟩ = H⊗² |00⟩ = ½ (|00⟩ + |01⟩ + |10⟩ + |11⟩)**. Each state starts with amplitude +0.50 and probability 25%.
2. **Oracle Phase Flip:** Mark target **|11⟩** by flipping its phase:
   - **|ψ₁⟩ = ½ (|00⟩ + |01⟩ + |10⟩ - |11⟩)**. The average amplitude drops to +0.25.
3. **Diffusion (Inversion About the Mean):**
   - Reflecting across the mean (+0.25) boosts the marked state amplitude from -0.5 to **+1.00**, while suppressing all non-marked states to **0.00**!
   - For N=4, **exactly 1 Grover iteration yields a 100% probability of measuring the target state |11⟩**!`,
      preloadedCircuit: {
        name: 'Grover 2-Qubit Search',
        numQubits: 2,
        steps: [
          // Step 1: Equal superposition
          { gates: [{ id: 'h0', type: 'H', qubit: 0 }, { id: 'h1', type: 'H', qubit: 1 }] },
          // Step 2: Oracle marking |11> (Controlled-Z gate via H-CNOT-H)
          { gates: [{ id: 'cz_h1', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'cz_cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
          { gates: [{ id: 'cz_h2', type: 'H', qubit: 1 }] },
          // Step 3: Diffusion Operator: H gates
          { gates: [{ id: 'dh0', type: 'H', qubit: 0 }, { id: 'dh1', type: 'H', qubit: 1 }] },
          // Pauli-X
          { gates: [{ id: 'dx0', type: 'X', qubit: 0 }, { id: 'dx1', type: 'X', qubit: 1 }] },
          // Multi-control phase flip
          { gates: [{ id: 'dcz_h1', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'dcz_cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
          { gates: [{ id: 'dcz_h2', type: 'H', qubit: 1 }] },
          // Uncompute X and H
          { gates: [{ id: 'dx0_u', type: 'X', qubit: 0 }, { id: 'dx1_u', type: 'X', qubit: 1 }] },
          { gates: [{ id: 'dh0_u', type: 'H', qubit: 0 }, { id: 'dh1_u', type: 'H', qubit: 1 }] },
          // Measurement
          { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }] },
        ],
      },
    },
    {
      id: 'grover-circuit-analysis',
      title: '3. Constructing the Grover Circuit',
      type: 'tryit',
      content: `Examine the preloaded circuit in the workspace below. 

1. **Observe the initial Hadamards:** Qubits q0 and q1 enter equal superposition.
2. **Oracle Stage:** The Controlled-Z operator inverts the sign of basis state |11⟩.
3. **Diffusion Stage:** Notice how sandwiching the multi-qubit phase flip between Hadamards and Pauli-X operators constructs the reflection operator **2|s⟩⟨s| - I**.
4. **Run 1024 shots:** Verify that outcome **|11⟩** is measured with near-100% fidelity! Try modifying the oracle to search for |10⟩ or |01⟩.`,
      preloadedCircuit: {
        name: 'Grover Full Sandbox',
        numQubits: 2,
        steps: [
          { gates: [{ id: 'h0', type: 'H', qubit: 0 }, { id: 'h1', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'cz_h1', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'cz_cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
          { gates: [{ id: 'cz_h2', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'dh0', type: 'H', qubit: 0 }, { id: 'dh1', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'dx0', type: 'X', qubit: 0 }, { id: 'dx1', type: 'X', qubit: 1 }] },
          { gates: [{ id: 'dcz_h1', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'dcz_cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
          { gates: [{ id: 'dcz_h2', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'dx0_u', type: 'X', qubit: 0 }, { id: 'dx1_u', type: 'X', qubit: 1 }] },
          { gates: [{ id: 'dh0_u', type: 'H', qubit: 0 }, { id: 'dh1_u', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }, { id: 'm1', type: 'MEASURE', qubit: 1 }] },
        ],
      },
    },
  ],
};

// ============================================================
// New Algorithm Module: Deutsch-Jozsa Algorithm
// First demonstration of exponential quantum speedup
// ============================================================
export const deutschJozsaModule: LearningModule = {
  id: 'deutsch-jozsa',
  trackId: 'algorithms',
  trackTitle: 'Algorithms',
  title: 'Deutsch-Jozsa Algorithm',
  description: 'Determine whether an unknown black-box function is constant or balanced in a single quantum query.',
  icon: 'zap',
  difficulty: 'advanced',
  estimatedMinutes: 20,
  prerequisites: ['superposition-single-qubit', 'entanglement-bell-states'],
  glossary: [
    {
      term: 'Constant Function',
      definition: 'A function f(x) that returns the same binary value (all 0s or all 1s) for every input.',
    },
    {
      term: 'Balanced Function',
      definition: 'A function f(x) that returns 0 for exactly half of its domain and 1 for the other half.',
    },
    {
      term: 'Quantum Parallelism',
      definition: 'Evaluating a function f(x) simultaneously for all 2ⁿ input states using quantum superposition.',
    },
    {
      term: 'Phase Kickback',
      definition: 'A mechanism where the eigenvalue of a target register is transferred into the relative phase of the input register.',
    },
  ],
  quiz: [
    {
      id: 'dj1',
      question: 'How many queries does the classical deterministic algorithm need in the worst case to determine if an n-bit function is constant or balanced?',
      options: [
        '1 query',
        'n queries',
        '2ⁿ⁻¹ + 1 queries',
        '2ⁿ queries',
      ],
      correctIndex: 2,
      explanation: 'In the worst case, a classical computer might see 2ⁿ⁻¹ zeros in a row and cannot know whether the next output is 0 (constant) or 1 (balanced) without checking 2ⁿ⁻¹ + 1 times.',
    },
    {
      id: 'dj2',
      question: 'In the Deutsch-Jozsa algorithm, what measurement outcome guarantees that the function is constant?',
      options: [
        'All qubits measure 0 (|00...0⟩)',
        'All qubits measure 1 (|11...1⟩)',
        'An equal 50/50 distribution of states',
        'State |10...0⟩',
      ],
      correctIndex: 0,
      explanation: 'If f is constant, constructive interference concentrates 100% of the probability amplitude onto state |00...0⟩. If f is balanced, destructive interference completely cancels state |00...0⟩ to zero.',
    },
  ],
  sections: [
    {
      id: 'dj-problem',
      title: '1. The Constant vs. Balanced Oracle',
      type: 'theory',
      content: `The **Deutsch-Jozsa algorithm** was proposed in 1992 by David Deutsch and Richard Jozsa. It represents one of the first historical examples of an algorithm that achieves an **exponential speedup** over deterministic classical computing.

### The Challenge:
We are given a black-box oracle function:
**f : {0, 1}ⁿ → {0, 1}**

We are promised that the function is either:
- **Constant:** It produces the same value (always 0, or always 1) for all inputs.
- **Balanced:** It outputs 0 for exactly 50% of inputs, and 1 for the remaining 50%.

:::analogy The Counterfeit Coin Test
Imagine you are handed a two-sided coin and asked: is this a fair coin (one Heads and one Tails — *"balanced"*) or a trick coin with identical sides (Heads-Heads or Tails-Tails — *"constant"*)?

- **Classically:** You must inspect side 1, then flip it over and inspect side 2 — requiring **2 separate measurements**.
- **Quantumly:** Using superposition, you evaluate both sides simultaneously. **Phase kickback** causes the two possibilities to interfere with each other: destructive interference cancels out the output if the coin is balanced, determining if the function is constant or balanced in **a single query**!
:::`,
    },
    {
      id: 'dj-mechanism',
      title: '2. The Quantum Circuit & Interference Mechanism',
      type: 'interactive',
      content: `How does Deutsch-Jozsa achieve this miraculous single-shot determination?

### The Protocol:
1. **Initialize:** An n-qubit input register is initialized to **|0⟩⊗ⁿ**, and a single auxiliary qubit is initialized to **|1⟩**.
2. **Superposition:** Apply Hadamard gates to all qubits. The input register enters equal superposition **∑ |x⟩**, while the ancilla becomes **|-⟩ = (|0⟩ - |1⟩)/√2**.
3. **Oracle with Phase Kickback:** The oracle applies **U_f |x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩**. Because the ancilla is in state **|-⟩**, the function output is kicked back as a phase:
   - **U_f |x⟩|-⟩ = (-1)^(f(x)) |x⟩|-⟩**
4. **Interference:** Apply Hadamards again to all input qubits.
5. **Measurement Outcome:**
   - **If f is Constant:** Constructive interference causes all paths to add up to state **|00...0⟩** with probability **100%**.
   - **If f is Balanced:** Destructive interference cancels **|00...0⟩** completely to **0% probability**. Any other state is measured!`,
      preloadedCircuit: {
        name: 'Deutsch-Jozsa Balanced Oracle',
        numQubits: 2,
        steps: [
          // Step 1: Initialize q0 in |0> and q1 in |1>
          { gates: [{ id: 'x1', type: 'X', qubit: 1 }] },
          // Step 2: Hadamards on both
          { gates: [{ id: 'h0', type: 'H', qubit: 0 }, { id: 'h1', type: 'H', qubit: 1 }] },
          // Step 3: Balanced Oracle (CNOT: f(x) = x)
          { gates: [{ id: 'cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
          // Step 4: Final Hadamard on input qubit
          { gates: [{ id: 'hf0', type: 'H', qubit: 0 }] },
          // Step 5: Measure input qubit q0
          { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }] },
        ],
      },
    },
    {
      id: 'dj-tryit',
      title: '3. Test the Oracle Yourself',
      type: 'tryit',
      content: `Use the interactive sandbox below to test the Deutsch-Jozsa circuit.

- In the preloaded circuit, the oracle is a CNOT gate where $f(0)=0$ and $f(1)=1$ (a balanced function).
- Run the simulation with 1024 shots: notice how the input qubit **q0 measures 1 with 100% certainty**, proving immediately that the function is **balanced**!
- Try deleting the CNOT gate (making $f(x)=0$ constant) and re-running: q0 will measure **0 with 100% certainty**.`,
      preloadedCircuit: {
        name: 'Deutsch-Jozsa Testbed',
        numQubits: 2,
        steps: [
          { gates: [{ id: 'x1', type: 'X', qubit: 1 }] },
          { gates: [{ id: 'h0', type: 'H', qubit: 0 }, { id: 'h1', type: 'H', qubit: 1 }] },
          { gates: [{ id: 'cx', type: 'CNOT', qubit: 1, control: 0, target: 1 }] },
          { gates: [{ id: 'hf0', type: 'H', qubit: 0 }] },
          { gates: [{ id: 'm0', type: 'MEASURE', qubit: 0 }] },
        ],
      },
    },
  ],
};

export const allModules: LearningModule[] = [
  superpositionModule,
  measurementModule,
  entanglementModule,
  teleportationModule,
  groverModule,
  deutschJozsaModule,
];
