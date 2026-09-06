// ============================================================
// QuantumLearn AI — Browser-based Quantum Circuit Simulator
// Pure TypeScript statevector simulator (no external deps)
// Supports up to ~12 qubits in-browser
// ============================================================

import {
  type QuantumCircuit,
  type QuantumGate,
  type SimulationResult,
  type Complex,
  type BlochVector,
} from './types';

// --- Complex number math helpers ---

function complexMul(a: Complex, b: Complex): Complex {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  };
}

function complexAdd(a: Complex, b: Complex): Complex {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

function complexMag2(a: Complex): number {
  return a.real * a.real + a.imag * a.imag;
}

function complexConj(a: Complex): Complex {
  return { real: a.real, imag: -a.imag };
}

const ZERO: Complex = { real: 0, imag: 0 };
const ONE: Complex = { real: 1, imag: 0 };
const SQRT2_INV: Complex = { real: 1 / Math.sqrt(2), imag: 0 };
const NEG_ONE: Complex = { real: -1, imag: 0 };
const I: Complex = { real: 0, imag: 1 };
const NEG_I: Complex = { real: 0, imag: -1 };

// --- Gate matrices (2x2 for single-qubit, 4x4 for two-qubit) ---

type Matrix2x2 = [[Complex, Complex], [Complex, Complex]];

function getGateMatrix(gate: QuantumGate): Matrix2x2 {
  const theta = gate.params?.[0] ?? 0;

  switch (gate.type) {
    case 'H':
      return [
        [SQRT2_INV, SQRT2_INV],
        [SQRT2_INV, { real: -1 / Math.sqrt(2), imag: 0 }],
      ];
    case 'X':
      return [
        [ZERO, ONE],
        [ONE, ZERO],
      ];
    case 'Y':
      return [
        [ZERO, NEG_I],
        [I, ZERO],
      ];
    case 'Z':
      return [
        [ONE, ZERO],
        [ZERO, NEG_ONE],
      ];
    case 'S':
      return [
        [ONE, ZERO],
        [ZERO, I],
      ];
    case 'T':
      return [
        [ONE, ZERO],
        [ZERO, { real: Math.cos(Math.PI / 4), imag: Math.sin(Math.PI / 4) }],
      ];
    case 'RX':
      return [
        [{ real: Math.cos(theta / 2), imag: 0 }, { real: 0, imag: -Math.sin(theta / 2) }],
        [{ real: 0, imag: -Math.sin(theta / 2) }, { real: Math.cos(theta / 2), imag: 0 }],
      ];
    case 'RY':
      return [
        [{ real: Math.cos(theta / 2), imag: 0 }, { real: -Math.sin(theta / 2), imag: 0 }],
        [{ real: Math.sin(theta / 2), imag: 0 }, { real: Math.cos(theta / 2), imag: 0 }],
      ];
    case 'RZ':
      return [
        [{ real: Math.cos(theta / 2), imag: -Math.sin(theta / 2) }, ZERO],
        [ZERO, { real: Math.cos(theta / 2), imag: Math.sin(theta / 2) }],
      ];
    default:
      // Identity for MEASURE and unknown types
      return [
        [ONE, ZERO],
        [ZERO, ONE],
      ];
  }
}

// --- Statevector operations ---

/**
 * Apply a single-qubit gate to the statevector.
 * Uses the efficient approach of iterating over pairs of amplitudes.
 */
function applySingleQubitGate(
  sv: Complex[],
  numQubits: number,
  qubit: number,
  matrix: Matrix2x2
): Complex[] {
  const dim = 1 << numQubits;
  const result: Complex[] = new Array(dim);
  const bitMask = 1 << (numQubits - 1 - qubit);

  for (let i = 0; i < dim; i++) {
    if (i & bitMask) continue; // skip |1⟩ indices, process in pairs

    const i0 = i;         // index where qubit = |0⟩
    const i1 = i | bitMask; // index where qubit = |1⟩

    const a0 = sv[i0];
    const a1 = sv[i1];

    // New amplitudes: |0⟩' = M[0][0]*|0⟩ + M[0][1]*|1⟩
    //                 |1⟩' = M[1][0]*|0⟩ + M[1][1]*|1⟩
    result[i0] = complexAdd(complexMul(matrix[0][0], a0), complexMul(matrix[0][1], a1));
    result[i1] = complexAdd(complexMul(matrix[1][0], a0), complexMul(matrix[1][1], a1));
  }

  return result;
}

/**
 * Apply CNOT gate: flips target qubit if control qubit is |1⟩
 */
function applyCNOT(
  sv: Complex[],
  numQubits: number,
  control: number,
  target: number
): Complex[] {
  const dim = 1 << numQubits;
  const result: Complex[] = [...sv];
  const controlBit = 1 << (numQubits - 1 - control);
  const targetBit = 1 << (numQubits - 1 - target);

  for (let i = 0; i < dim; i++) {
    if ((i & controlBit) && !(i & targetBit)) {
      // Control is |1⟩ and target is |0⟩ → swap with target |1⟩
      const j = i | targetBit;
      result[i] = sv[j];
      result[j] = sv[i];
    }
  }

  return result;
}

/**
 * Apply CZ gate: adds phase -1 when both qubits are |1⟩
 */
function applyCZ(
  sv: Complex[],
  numQubits: number,
  control: number,
  target: number
): Complex[] {
  const dim = 1 << numQubits;
  const result: Complex[] = [...sv];
  const controlBit = 1 << (numQubits - 1 - control);
  const targetBit = 1 << (numQubits - 1 - target);

  for (let i = 0; i < dim; i++) {
    if ((i & controlBit) && (i & targetBit)) {
      result[i] = complexMul(sv[i], NEG_ONE);
    }
  }

  return result;
}

/**
 * Apply SWAP gate: exchanges two qubit states
 */
function applySWAP(
  sv: Complex[],
  numQubits: number,
  qubit1: number,
  qubit2: number
): Complex[] {
  const dim = 1 << numQubits;
  const result: Complex[] = [...sv];
  const bit1 = 1 << (numQubits - 1 - qubit1);
  const bit2 = 1 << (numQubits - 1 - qubit2);

  for (let i = 0; i < dim; i++) {
    const b1 = (i & bit1) ? 1 : 0;
    const b2 = (i & bit2) ? 1 : 0;

    if (b1 !== b2) {
      const j = i ^ bit1 ^ bit2;
      if (i < j) {
        result[i] = sv[j];
        result[j] = sv[i];
      }
    }
  }

  return result;
}

/**
 * Compute Bloch vector for a single qubit by partial trace
 */
function computeBlochVector(
  sv: Complex[],
  numQubits: number,
  qubit: number
): BlochVector {
  const bitMask = 1 << (numQubits - 1 - qubit);
  const dim = 1 << numQubits;

  // Compute reduced density matrix ρ for this qubit
  // ρ[0][0] = sum of |amp|² where qubit = |0⟩
  // ρ[1][1] = sum of |amp|² where qubit = |1⟩
  // ρ[0][1] = sum of amp0 * conj(amp1) where indices differ only in this qubit
  let rho00: Complex = ZERO;
  let rho01: Complex = ZERO;
  let rho11: Complex = ZERO;

  for (let i = 0; i < dim; i++) {
    if (!(i & bitMask)) {
      const i0 = i;
      const i1 = i | bitMask;
      const a0 = sv[i0];
      const a1 = sv[i1];

      rho00 = complexAdd(rho00, { real: complexMag2(a0), imag: 0 });
      rho11 = complexAdd(rho11, { real: complexMag2(a1), imag: 0 });
      rho01 = complexAdd(rho01, complexMul(a0, complexConj(a1)));
    }
  }

  // Bloch vector from density matrix:
  // x = 2*Re(ρ[0][1])
  // y = 2*Im(ρ[0][1])
  // z = ρ[0][0] - ρ[1][1]
  return {
    x: 2 * rho01.real,
    y: 2 * rho01.imag,
    z: rho00.real - rho11.real,
  };
}

/**
 * Generate measurement counts by sampling from the probability distribution
 */
function sampleCounts(
  probabilities: number[],
  numQubits: number,
  shots: number = 1024
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (let shot = 0; shot < shots; shot++) {
    let r = Math.random();
    for (let i = 0; i < probabilities.length; i++) {
      r -= probabilities[i];
      if (r <= 0) {
        const bitString = i.toString(2).padStart(numQubits, '0');
        counts[bitString] = (counts[bitString] || 0) + 1;
        break;
      }
    }
  }

  return counts;
}

// --- Main simulation function ---

export interface SimulatorAdapter {
  simulate(circuit: QuantumCircuit, shots?: number): SimulationResult;
}

export class BrowserQuantumSimulator implements SimulatorAdapter {
  simulate(circuit: QuantumCircuit, shots: number = 1024): SimulationResult {
    const { numQubits, steps } = circuit;
    const dim = 1 << numQubits;

    // Initialize to |00...0⟩
    let sv: Complex[] = new Array(dim).fill(ZERO);
    sv[0] = ONE;

    let gateCount = 0;

    // Apply each step's gates
    for (const step of steps) {
      for (const gate of step.gates) {
        if (gate.type === 'MEASURE') continue; // Measurement handled at end

        gateCount++;

        if (gate.type === 'CNOT') {
          sv = applyCNOT(sv, numQubits, gate.control ?? gate.qubit, gate.target ?? gate.qubit + 1);
        } else if (gate.type === 'CZ') {
          sv = applyCZ(sv, numQubits, gate.control ?? gate.qubit, gate.target ?? gate.qubit + 1);
        } else if (gate.type === 'SWAP') {
          sv = applySWAP(sv, numQubits, gate.qubit, gate.target ?? gate.qubit + 1);
        } else {
          const matrix = getGateMatrix(gate);
          sv = applySingleQubitGate(sv, numQubits, gate.qubit, matrix);
        }
      }
    }

    // Compute probabilities
    const probabilities = sv.map(complexMag2);

    // Compute Bloch vectors for each qubit
    const blochVectors: BlochVector[] = [];
    for (let q = 0; q < numQubits; q++) {
      blochVectors.push(computeBlochVector(sv, numQubits, q));
    }

    // Sample measurement counts
    const counts = sampleCounts(probabilities, numQubits, shots);

    return {
      statevector: sv,
      probabilities,
      blochVectors,
      counts,
      circuitDepth: steps.length,
      gateCount,
    };
  }
}

// Singleton instance
export const simulator = new BrowserQuantumSimulator();
