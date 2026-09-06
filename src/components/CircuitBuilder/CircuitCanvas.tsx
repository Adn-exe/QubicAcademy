// ============================================================
// QuantumLearn AI — Circuit Canvas Component
// SVG-based quantum circuit with drag-and-drop gate placement
// ============================================================

import { useCallback, useRef } from 'react';
import { useCircuitStore } from '../../core/store';
import { GATE_REGISTRY, type GateType, type QuantumGate } from '../../core/types';

const WIRE_Y_START = 60;
const WIRE_SPACING = 60;
const STEP_WIDTH = 64;
const STEP_START_X = 100;
const GATE_SIZE = 40;

let gateIdCounter = Date.now();
function nextGateId() {
  return `gate-${gateIdCounter++}`;
}

export function CircuitCanvas() {
  const circuit = useCircuitStore((s) => s.circuit);
  const addGate = useCircuitStore((s) => s.addGate);
  const removeGate = useCircuitStore((s) => s.removeGate);
  const selectedGate = useCircuitStore((s) => s.selectedGate);
  const setSelectedGate = useCircuitStore((s) => s.setSelectedGate);
  const svgRef = useRef<SVGSVGElement>(null);

  const numQubits = circuit.numQubits;
  const numSteps = Math.max(circuit.steps.length + 2, 8);

  const canvasWidth = STEP_START_X + numSteps * STEP_WIDTH + 40;
  const canvasHeight = WIRE_Y_START + numQubits * WIRE_SPACING + 20;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const gateType = e.dataTransfer.getData('gateType') as GateType;
      if (!gateType) return;

      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const qubit = Math.round((svgPt.y - WIRE_Y_START) / WIRE_SPACING);
      const stepIndex = Math.round((svgPt.x - STEP_START_X) / STEP_WIDTH);

      if (qubit < 0 || qubit >= numQubits || stepIndex < 0) return;

      const gate = createGate(gateType, qubit, numQubits);
      if (gate) {
        addGate(gate, stepIndex < circuit.steps.length ? stepIndex : undefined);
      }
      setSelectedGate(null);
    },
    [addGate, circuit.steps.length, numQubits, setSelectedGate]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!selectedGate) return;

      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const qubit = Math.round((svgPt.y - WIRE_Y_START) / WIRE_SPACING);
      const stepIndex = Math.round((svgPt.x - STEP_START_X) / STEP_WIDTH);

      if (qubit < 0 || qubit >= numQubits || stepIndex < 0) return;

      const gate = createGate(selectedGate as GateType, qubit, numQubits);
      if (gate) {
        addGate(gate, stepIndex < circuit.steps.length ? stepIndex : undefined);
      }
    },
    [selectedGate, addGate, circuit.steps.length, numQubits]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const loadCircuit = useCircuitStore((s) => s.loadCircuit);
  const numGates = circuit.steps.reduce((acc, step) => acc + step.gates.length, 0);

  const handleLoadPreset = (presetType: 'bell' | 'superposition' | 'ghz') => {
    if (presetType === 'bell') {
      loadCircuit({
        name: 'Bell State',
        numQubits: 2,
        steps: [
          { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
          { gates: [{ id: 'g2', type: 'CNOT', qubit: 0, control: 0, target: 1 }] },
        ],
      });
    } else if (presetType === 'superposition') {
      loadCircuit({
        name: 'Superposition',
        numQubits: 1,
        steps: [{ gates: [{ id: 'g1', type: 'H', qubit: 0 }] }],
      });
    } else if (presetType === 'ghz') {
      loadCircuit({
        name: 'GHZ State',
        numQubits: 3,
        steps: [
          { gates: [{ id: 'g1', type: 'H', qubit: 0 }] },
          { gates: [{ id: 'g2', type: 'CNOT', qubit: 0, control: 0, target: 1 }] },
          { gates: [{ id: 'g3', type: 'CNOT', qubit: 1, control: 1, target: 2 }] },
        ],
      });
    }
  };

  return (
    <div className="flex-1 overflow-auto circuit-canvas rounded-xl border border-quantum-700/20 relative">
      {numGates === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 pointer-events-none">
          <div className="bg-[#12172A]/90 backdrop-blur-md border border-[var(--signal-cyan)]/30 rounded-2xl p-5 max-w-sm text-center space-y-3 shadow-2xl pointer-events-auto animate-fade-in">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--signal-cyan)]">
              Empty Quantum Wire Grid
            </h4>
            <p className="text-xs text-slate-300">
              Drag gates from the palette above, or launch a quick-start circuit preset:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleLoadPreset('bell')}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[var(--cryostat-gold)]/20 text-[var(--cryostat-gold)] border border-[var(--cryostat-gold)]/40 hover:bg-[var(--cryostat-gold)] hover:text-[#0A0E1A] transition-all cursor-pointer shadow-xs"
              >
                Bell State (|Φ⁺⟩)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('superposition')}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[var(--signal-cyan)]/20 text-[var(--signal-cyan)] border border-[var(--signal-cyan)]/40 hover:bg-[var(--signal-cyan)] hover:text-[#0A0E1A] transition-all cursor-pointer shadow-xs"
              >
                Superposition (|+⟩)
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('ghz')}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500 hover:text-white transition-all cursor-pointer shadow-xs"
              >
                GHZ State (3Q)
              </button>
            </div>
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        width={canvasWidth}
        height={canvasHeight}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="min-w-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleCanvasClick}
        style={{ cursor: selectedGate ? 'crosshair' : 'default' }}
      >
        {/* Qubit labels & wires */}
        {Array.from({ length: numQubits }, (_, q) => {
          const y = WIRE_Y_START + q * WIRE_SPACING;
          return (
            <g key={`wire-${q}`}>
              {/* Qubit label */}
              <text
                x={16}
                y={y + 5}
                className="fill-slate-400 light:fill-slate-700 font-semibold"
                fontSize="13"
                fontFamily="'JetBrains Mono', monospace"
              >
                |q{q}⟩
              </text>

              {/* Wire line */}
              <line
                x1={STEP_START_X - 20}
                y1={y}
                x2={canvasWidth - 20}
                y2={y}
                className="qubit-wire"
              />

              {/* Drop zone indicators */}
              {Array.from({ length: numSteps }, (_, s) => {
                const isTarget = !!selectedGate;
                return (
                  <rect
                    key={`zone-${q}-${s}`}
                    x={STEP_START_X + s * STEP_WIDTH - GATE_SIZE / 2}
                    y={y - GATE_SIZE / 2}
                    width={GATE_SIZE}
                    height={GATE_SIZE}
                    rx={6}
                    fill={isTarget ? 'rgba(79, 209, 217, 0.08)' : 'transparent'}
                    stroke={isTarget ? 'rgba(79, 209, 217, 0.6)' : 'rgba(79, 209, 217, 0.12)'}
                    strokeWidth={isTarget ? 1.5 : 1}
                    strokeDasharray={isTarget ? '3 3' : '4 4'}
                    className={isTarget ? 'cursor-pointer hover:fill-[rgba(79,209,217,0.2)] transition-colors' : ''}
                    onClick={(e) => {
                      if (selectedGate) {
                        e.stopPropagation();
                        const gate = createGate(selectedGate as GateType, q, numQubits);
                        if (gate) {
                          addGate(gate, s < circuit.steps.length ? s : undefined);
                        }
                      }
                    }}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Step labels */}
        {Array.from({ length: numSteps }, (_, s) => (
          <text
            key={`step-${s}`}
            x={STEP_START_X + s * STEP_WIDTH}
            y={28}
            textAnchor="middle"
            className="fill-slate-500 light:fill-slate-600"
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
          >
            {s}
          </text>
        ))}

        {/* Placed gates */}
        {circuit.steps.map((step, stepIdx) =>
          step.gates.map((gate) => (
            <GateNode
              key={gate.id}
              gate={gate}
              stepIndex={stepIdx}
              numQubits={numQubits}
              onRemove={() => removeGate(stepIdx, gate.id)}
            />
          ))
        )}
      </svg>
    </div>
  );
}

// --- Gate Node on the circuit ---

function GateNode({
  gate,
  stepIndex,
  onRemove,
}: {
  gate: QuantumGate;
  stepIndex: number;
  numQubits?: number;
  onRemove: () => void;
}) {
  const info = GATE_REGISTRY[gate.type];
  const x = STEP_START_X + stepIndex * STEP_WIDTH;
  const y = WIRE_Y_START + gate.qubit * WIRE_SPACING;
  const gateColor = '#4FD1D9'; // --signal-cyan default

  // Multi-qubit gates: draw connector line
  if (gate.type === 'CNOT' && gate.control !== undefined && gate.target !== undefined) {
    const controlY = WIRE_Y_START + gate.control * WIRE_SPACING;
    const targetY = WIRE_Y_START + gate.target * WIRE_SPACING;

    return (
      <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onRemove(); }} onDoubleClick={onRemove}>
        {/* Connector line */}
        <line
          x1={x}
          y1={controlY}
          x2={x}
          y2={targetY}
          stroke={gateColor}
          strokeWidth={2}
          opacity={0.8}
        />
        {/* Control dot */}
        <circle cx={x} cy={controlY} r={6} fill={gateColor} />
        {/* Target circle (⊕) */}
        <circle cx={x} cy={targetY} r={14} fill="var(--panel)" stroke={gateColor} strokeWidth={2} />
        <line x1={x - 8} y1={targetY} x2={x + 8} y2={targetY} stroke={gateColor} strokeWidth={2} />
        <line x1={x} y1={targetY - 8} x2={x} y2={targetY + 8} stroke={gateColor} strokeWidth={2} />
      </g>
    );
  }

  if (gate.type === 'MEASURE') {
    return (
      <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onRemove(); }} onDoubleClick={onRemove}>
        <rect
          x={x - GATE_SIZE / 2}
          y={y - GATE_SIZE / 2}
          width={GATE_SIZE}
          height={GATE_SIZE}
          rx={8}
          fill="var(--panel)"
          stroke={gateColor}
          strokeWidth={1.5}
        />
        {/* Meter icon */}
        <path
          d={`M ${x - 8} ${y + 6} Q ${x} ${y - 10} ${x + 8} ${y + 6}`}
          fill="none"
          stroke={gateColor}
          strokeWidth={1.5}
        />
        <line
          x1={x}
          y1={y + 6}
          x2={x + 6}
          y2={y - 4}
          stroke={gateColor}
          strokeWidth={1.5}
        />
      </g>
    );
  }

  // Multi-qubit SWAP
  if ((gate.type === 'SWAP' || gate.type === 'CZ') && gate.target !== undefined) {
    const y2 = WIRE_Y_START + gate.target * WIRE_SPACING;
    return (
      <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onRemove(); }} onDoubleClick={onRemove}>
        <line x1={x} y1={y} x2={x} y2={y2} stroke={gateColor} strokeWidth={2} opacity={0.8} />
        <text x={x} y={y + 5} textAnchor="middle" fill={gateColor} fontSize="16" fontWeight="bold">×</text>
        <text x={x} y={y2 + 5} textAnchor="middle" fill={gateColor} fontSize="16" fontWeight="bold">×</text>
      </g>
    );
  }

  // Standard single-qubit gate box
  return (
    <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onRemove(); }} onDoubleClick={onRemove}>
      <rect
        x={x - GATE_SIZE / 2}
        y={y - GATE_SIZE / 2}
        width={GATE_SIZE}
        height={GATE_SIZE}
        rx={8}
        fill="var(--panel)"
        stroke={gateColor}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fill={gateColor}
        fontSize="14"
        fontWeight="bold"
        fontFamily="'JetBrains Mono', monospace"
      >
        {info.label}
      </text>
      {/* Show rotation angle if parameterized */}
      {gate.params && gate.params.length > 0 && (
        <text
          x={x}
          y={y + 28}
          textAnchor="middle"
          fill={info.color}
          fontSize="9"
          opacity={0.7}
        >
          {(gate.params[0] / Math.PI).toFixed(2)}π
        </text>
      )}
    </g>
  );
}

// --- Helpers ---

function createGate(type: GateType, qubit: number, numQubits: number): QuantumGate | null {
  const base: QuantumGate = {
    id: nextGateId(),
    type,
    qubit,
  };

  switch (type) {
    case 'CNOT': {
      const target = qubit + 1 < numQubits ? qubit + 1 : qubit - 1;
      if (target < 0 || target >= numQubits) return null;
      return { ...base, control: qubit, target };
    }
    case 'CZ': {
      const target = qubit + 1 < numQubits ? qubit + 1 : qubit - 1;
      if (target < 0 || target >= numQubits) return null;
      return { ...base, control: qubit, target };
    }
    case 'SWAP': {
      const target = qubit + 1 < numQubits ? qubit + 1 : qubit - 1;
      if (target < 0 || target >= numQubits) return null;
      return { ...base, target };
    }
    case 'RX':
    case 'RY':
    case 'RZ':
      return { ...base, params: [Math.PI / 2] }; // Default rotation
    default:
      return base;
  }
}
