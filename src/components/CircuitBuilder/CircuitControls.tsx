// ============================================================
// QuantumLearn AI — Circuit Controls Toolbar
// ============================================================

import { useState } from 'react';
import {
  Play,
  Undo2,
  Redo2,
  Trash2,
  Plus,
  Minus,
  Download,
  Upload,
  Code,
  Check,
} from 'lucide-react';
import { useCircuitStore } from '../../core/store';
import { circuitToQiskit } from '../../core/qiskit-codegen';

interface CircuitControlsProps {
  onToggleCode: () => void;
  showCode: boolean;
}

export function CircuitControls({ onToggleCode, showCode }: CircuitControlsProps) {
  const circuit = useCircuitStore((s) => s.circuit);
  const runSimulation = useCircuitStore((s) => s.runSimulation);
  const isSimulating = useCircuitStore((s) => s.isSimulating);
  const undo = useCircuitStore((s) => s.undo);
  const redo = useCircuitStore((s) => s.redo);
  const clearCircuit = useCircuitStore((s) => s.clearCircuit);
  const setNumQubits = useCircuitStore((s) => s.setNumQubits);
  const historyIndex = useCircuitStore((s) => s.historyIndex);
  const historyLength = useCircuitStore((s) => s.history.length);

  const [copiedQiskit, setCopiedQiskit] = useState(false);

  const handleExport = () => {
    const json = JSON.stringify(circuit, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuit.name || 'circuit'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            useCircuitStore.getState().loadCircuit(data);
          } catch {
            alert('Invalid circuit file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportQiskit = () => {
    const code = circuitToQiskit(circuit);
    navigator.clipboard.writeText(code).then(() => {
      setCopiedQiskit(true);
      setTimeout(() => setCopiedQiskit(false), 2000);
    });
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 glass-light rounded-xl overflow-x-auto no-scrollbar touch-pan-x select-none">
      {/* File & Code Actions (Swapped from right) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleExportQiskit}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
          title="Copy Qiskit code to clipboard"
        >
          {copiedQiskit ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <span>Copy Qiskit</span>
          )}
        </button>
        <button onClick={handleImport} className="btn-icon shrink-0" title="Import circuit JSON">
          <Upload size={16} />
        </button>
        <button onClick={handleExport} className="btn-icon shrink-0" title="Export circuit JSON">
          <Download size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-700 light:bg-slate-300 mx-1 shrink-0" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="btn-icon"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= historyLength - 1}
          className="btn-icon"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-700 light:bg-slate-300 mx-1 shrink-0" />

      {/* Qubit count */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setNumQubits(circuit.numQubits - 1)}
          disabled={circuit.numQubits <= 1}
          className="btn-icon"
          title="Remove qubit"
        >
          <Minus size={14} />
        </button>
        <span className="text-xs font-mono text-slate-400 light:text-slate-600 min-w-[55px] text-center">
          {circuit.numQubits} qubit{circuit.numQubits > 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setNumQubits(circuit.numQubits + 1)}
          disabled={circuit.numQubits >= 8}
          className="btn-icon"
          title="Add qubit"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-700 light:bg-slate-300 mx-1 shrink-0" />

      {/* Clear & Code toggle */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={clearCircuit}
          className="btn-icon"
          title="Clear circuit"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={onToggleCode}
          className={`btn-icon ${showCode ? 'bg-quantum-600/30 text-quantum-300' : ''}`}
          title="Toggle code editor"
        >
          <Code size={16} />
        </button>
      </div>

      <div className="flex-1 min-w-[12px]" />

      {/* Primary Run Simulation Button (Swapped to right CTA) */}
      <button
        onClick={() => runSimulation()}
        disabled={isSimulating || circuit.steps.length === 0}
        className="btn-primary py-2 px-3.5 sm:px-4 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2 shrink-0"
        title="Run simulation"
      >
        {isSimulating ? <div className="spinner" /> : <Play size={15} fill="currentColor" />}
        <span>Run Simulation</span>
      </button>
    </div>
  );
}
