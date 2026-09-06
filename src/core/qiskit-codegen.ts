// ============================================================
// QuantumLearn AI — Circuit ↔ Qiskit Code Translation
// ============================================================

import type { QuantumCircuit, QuantumGate, GateType } from './types';

/**
 * Safely parse an angle expression (e.g., "-1.57", "np.pi / 2", "3.1415")
 */
function parseAngle(str: string): number {
  try {
    const sanitized = str
      .replace(/np\.pi/gi, `${Math.PI}`)
      .replace(/math\.pi/gi, `${Math.PI}`)
      .replace(/pi/gi, `${Math.PI}`)
      .replace(/[^0-9+\-*/().\s]/g, '');

    if (/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      // Arithmetic evaluation for pi fractions
      // eslint-disable-next-line no-new-func
      const val = Function(`'use strict'; return (${sanitized})`)();
      if (typeof val === 'number' && !isNaN(val)) return val;
    }
  } catch {
    // Fall back to parseFloat
  }
  const f = parseFloat(str);
  return isNaN(f) ? 0 : f;
}

/**
 * Convert a QuantumCircuit to Qiskit Python code
 */
export function circuitToQiskit(circuit: QuantumCircuit): string {
  let hasMeasurement = false;
  for (const step of circuit.steps) {
    for (const gate of step.gates) {
      if (gate.type === 'MEASURE') hasMeasurement = true;
    }
  }

  const lines: string[] = [
    'from qiskit import QuantumCircuit',
    'try:',
    '    from qiskit_aer import AerSimulator',
    '    simulator = AerSimulator()',
    'except ImportError:',
    '    from qiskit.providers.basic_provider import BasicSimulator',
    '    simulator = BasicSimulator()',
    '',
    `# ${circuit.name || 'Quantum Circuit'}`,
    hasMeasurement
      ? `qc = QuantumCircuit(${circuit.numQubits}, ${circuit.numQubits})`
      : `qc = QuantumCircuit(${circuit.numQubits})`,
    '',
  ];

  for (const step of circuit.steps) {
    for (const gate of step.gates) {
      const line = gateToQiskit(gate);
      if (line) {
        lines.push(line);
      }
    }
  }

  if (!hasMeasurement) {
    lines.push('');
    lines.push('# Add measurements for all qubits');
    lines.push('qc.measure_all()');
  }

  lines.push('');
  lines.push('# Simulate circuit with 1024 shots');
  lines.push('job = simulator.run(qc, shots=1024)');
  lines.push('result = job.result()');
  lines.push('counts = result.get_counts()');
  lines.push('print("Measurement counts:", counts)');

  return lines.join('\n');
}

function gateToQiskit(gate: QuantumGate): string | null {
  switch (gate.type) {
    case 'H':
      return `qc.h(${gate.qubit})`;
    case 'X':
      return `qc.x(${gate.qubit})`;
    case 'Y':
      return `qc.y(${gate.qubit})`;
    case 'Z':
      return `qc.z(${gate.qubit})`;
    case 'S':
      return `qc.s(${gate.qubit})`;
    case 'T':
      return `qc.t(${gate.qubit})`;
    case 'RX': {
      const angle = (gate.params?.[0] ?? 0).toFixed(4);
      return `qc.rx(${angle}, ${gate.qubit})`;
    }
    case 'RY': {
      const angle = (gate.params?.[0] ?? 0).toFixed(4);
      return `qc.ry(${angle}, ${gate.qubit})`;
    }
    case 'RZ': {
      const angle = (gate.params?.[0] ?? 0).toFixed(4);
      return `qc.rz(${angle}, ${gate.qubit})`;
    }
    case 'CNOT':
      return `qc.cx(${gate.control ?? gate.qubit}, ${gate.target ?? gate.qubit + 1})`;
    case 'CZ':
      return `qc.cz(${gate.control ?? gate.qubit}, ${gate.target ?? gate.qubit + 1})`;
    case 'SWAP':
      return `qc.swap(${gate.qubit}, ${gate.target ?? gate.qubit + 1})`;
    case 'MEASURE':
      return `qc.measure(${gate.qubit}, ${gate.target ?? gate.qubit})`;
    default:
      return null;
  }
}

/**
 * Parse Qiskit Python code into a QuantumCircuit.
 * Supports arbitrary circuit names, negative angles, pi expressions, cnot synonyms, and measure_all.
 */
export function qiskitToCircuit(code: string): QuantumCircuit | null {
  try {
    const rawLines = code.split('\n').map(l => l.trim());
    const lines = rawLines.filter(l => l && !l.startsWith('#'));

    let numQubits = 2;
    const gates: QuantumGate[] = [];
    let gateId = 0;

    for (const line of lines) {
      // Parse QuantumCircuit constructor: qc = QuantumCircuit(numQubits, ...)
      const qcMatch = line.match(/QuantumCircuit\((\d+)/i);
      if (qcMatch) {
        numQubits = Math.max(1, Math.min(8, parseInt(qcMatch[1])));
        continue;
      }

      // Parse single-qubit gates: qc.h(0), circuit.x(1), etc.
      const singleMatch = line.match(/(?:\w+)\.([hxyzst])\((\d+)\)/i);
      if (singleMatch) {
        const gateMap: Record<string, GateType> = {
          h: 'H', x: 'X', y: 'Y', z: 'Z', s: 'S', t: 'T',
        };
        const gateType = gateMap[singleMatch[1].toLowerCase()];
        const qubit = parseInt(singleMatch[2]);
        if (gateType && qubit < numQubits) {
          gates.push({
            id: `g${gateId++}`,
            type: gateType,
            qubit,
          });
        }
        continue;
      }

      // Parse rotation gates: qc.rx(angle, qubit), supports negative and math expressions
      const rotMatch = line.match(/(?:\w+)\.(rx|ry|rz)\(([^,]+),\s*(\d+)\)/i);
      if (rotMatch) {
        const gateMap: Record<string, GateType> = {
          rx: 'RX', ry: 'RY', rz: 'RZ',
        };
        const gateType = gateMap[rotMatch[1].toLowerCase()];
        const angle = parseAngle(rotMatch[2]);
        const qubit = parseInt(rotMatch[3]);
        if (gateType && qubit < numQubits) {
          gates.push({
            id: `g${gateId++}`,
            type: gateType,
            qubit,
            params: [angle],
          });
        }
        continue;
      }

      // Parse CNOT / CX: qc.cx(c, t) or qc.cnot(c, t)
      const cxMatch = line.match(/(?:\w+)\.(?:cx|cnot)\((\d+),\s*(\d+)\)/i);
      if (cxMatch) {
        const control = parseInt(cxMatch[1]);
        const target = parseInt(cxMatch[2]);
        if (control < numQubits && target < numQubits && control !== target) {
          gates.push({
            id: `g${gateId++}`,
            type: 'CNOT',
            qubit: control,
            control,
            target,
          });
        }
        continue;
      }

      // Parse CZ
      const czMatch = line.match(/(?:\w+)\.cz\((\d+),\s*(\d+)\)/i);
      if (czMatch) {
        const control = parseInt(czMatch[1]);
        const target = parseInt(czMatch[2]);
        if (control < numQubits && target < numQubits && control !== target) {
          gates.push({
            id: `g${gateId++}`,
            type: 'CZ',
            qubit: control,
            control,
            target,
          });
        }
        continue;
      }

      // Parse SWAP
      const swapMatch = line.match(/(?:\w+)\.swap\((\d+),\s*(\d+)\)/i);
      if (swapMatch) {
        const qubit1 = parseInt(swapMatch[1]);
        const qubit2 = parseInt(swapMatch[2]);
        if (qubit1 < numQubits && qubit2 < numQubits && qubit1 !== qubit2) {
          gates.push({
            id: `g${gateId++}`,
            type: 'SWAP',
            qubit: Math.min(qubit1, qubit2),
            target: Math.max(qubit1, qubit2),
          });
        }
        continue;
      }

      // Parse measure: qc.measure(qubit, cbit)
      const measureMatch = line.match(/(?:\w+)\.measure\((\d+)/i);
      if (measureMatch) {
        const qubit = parseInt(measureMatch[1]);
        if (qubit < numQubits) {
          gates.push({
            id: `g${gateId++}`,
            type: 'MEASURE',
            qubit,
          });
        }
        continue;
      }

      // Parse measure_all: qc.measure_all()
      if (line.match(/(?:\w+)\.measure_all\(\)/i)) {
        for (let q = 0; q < numQubits; q++) {
          gates.push({
            id: `g${gateId++}`,
            type: 'MEASURE',
            qubit: q,
          });
        }
        continue;
      }
    }

    // Pack gates into parallel steps when qubits do not conflict
    const steps: { gates: QuantumGate[] }[] = [];

    for (const gate of gates) {
      // Determine all qubits used by this gate
      const occupiedQubits = new Set<number>();
      occupiedQubits.add(gate.qubit);
      if (gate.control !== undefined) occupiedQubits.add(gate.control);
      if (gate.target !== undefined) occupiedQubits.add(gate.target);

      // Find earliest step where none of these qubits are in use
      let placed = false;
      for (const step of steps) {
        const stepQubits = new Set<number>();
        for (const existing of step.gates) {
          stepQubits.add(existing.qubit);
          if (existing.control !== undefined) stepQubits.add(existing.control);
          if (existing.target !== undefined) stepQubits.add(existing.target);
        }

        const hasConflict = Array.from(occupiedQubits).some(q => stepQubits.has(q));
        if (!hasConflict) {
          step.gates.push(gate);
          placed = true;
          break;
        }
      }

      if (!placed) {
        steps.push({ gates: [gate] });
      }
    }

    return {
      name: 'Parsed Circuit',
      numQubits,
      steps,
    };
  } catch {
    return null;
  }
}
