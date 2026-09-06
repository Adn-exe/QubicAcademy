// ============================================================
// QuantumLearn AI — Mobile Gate Dock Component
// Touch-first swipeable gate dock for mobile & tablet viewports.
// Allows tap-to-select and tap-to-place onto circuit wires.
// ============================================================

import { useState } from 'react';
import { useCircuitStore } from '../../core/store';
import { GATE_REGISTRY, type GateType } from '../../core/types';
import { X, Plus, Layers } from 'lucide-react';

const QUICK_GATES: GateType[] = ['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT', 'CZ', 'SWAP', 'MEASURE'];

const ALL_CATEGORIES = [
  {
    name: 'Single Qubit',
    types: ['H', 'X', 'Y', 'Z', 'S', 'T'] as GateType[],
  },
  {
    name: 'Continuous Rotations',
    types: ['RX', 'RY', 'RZ'] as GateType[],
  },
  {
    name: 'Multi-Qubit Entanglement',
    types: ['CNOT', 'CZ', 'SWAP'] as GateType[],
  },
  {
    name: 'Measurement & Readout',
    types: ['MEASURE'] as GateType[],
  },
];

export function MobileGateDock() {
  const selectedGate = useCircuitStore((s) => s.selectedGate);
  const setSelectedGate = useCircuitStore((s) => s.setSelectedGate);
  const [isAllGatesModalOpen, setIsAllGatesModalOpen] = useState(false);

  const handleSelectGate = (gateType: GateType) => {
    if (selectedGate === gateType) {
      setSelectedGate(null);
    } else {
      setSelectedGate(gateType);
    }
  };

  return (
    <div className="w-full shrink-0 flex flex-col bg-[#0A0E1A]/95 light:bg-slate-100/95 backdrop-blur-md border-t border-white/10 light:border-slate-300 py-2 px-3 space-y-1.5 select-none z-20">
      {/* Active Selected Gate Status Banner */}
      {selectedGate ? (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--signal-cyan)]/20 border border-[var(--signal-cyan)]/40 text-xs animate-fade-in">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[var(--signal-cyan)] animate-pulse" />
            <span className="font-bold text-[var(--signal-cyan)]">Selected: {selectedGate}</span>
            <span className="text-slate-300 light:text-slate-700 text-[11px] hidden xs:inline">
              &bull; Tap wire slot to place
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedGate(null)}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white light:hover:text-black cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            <X size={12} />
            <span>Cancel</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-400 light:text-slate-600">
          <span>Tap a gate to place onto wire:</span>
          <button
            type="button"
            onClick={() => setIsAllGatesModalOpen(true)}
            className="flex items-center gap-1 text-[var(--cryostat-gold)] hover:underline cursor-pointer"
          >
            <Layers size={12} />
            <span>All Gates</span>
          </button>
        </div>
      )}

      {/* Horizontal Swipeable Ribbon of Quick Gates */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x pb-0.5">
        {QUICK_GATES.map((gateType) => {
          const info = GATE_REGISTRY[gateType];
          const isSelected = selectedGate === gateType;

          return (
            <button
              key={gateType}
              type="button"
              onClick={() => handleSelectGate(gateType)}
              className={`shrink-0 min-w-[44px] h-[40px] px-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm border ${
                isSelected
                  ? 'bg-[var(--signal-cyan)] text-[var(--void)] border-[var(--signal-cyan)] scale-105 shadow-[0_0_12px_rgba(79,209,217,0.5)]'
                  : 'bg-[#12172A] light:bg-white text-slate-200 light:text-slate-800 border-white/15 light:border-slate-300 hover:border-white/30 hover:bg-white/5 active:scale-95'
              }`}
              title={info.description}
            >
              <span>{info.label}</span>
            </button>
          );
        })}

        {/* View All Gates Button */}
        <button
          type="button"
          onClick={() => setIsAllGatesModalOpen(true)}
          className="shrink-0 h-[40px] px-3 rounded-xl font-mono text-xs font-medium text-slate-300 light:text-slate-700 bg-white/[0.04] light:bg-white border border-white/15 light:border-slate-300 hover:bg-white/[0.08] active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus size={13} />
          <span>More</span>
        </button>
      </div>

      {/* Slide-up Modal for All Gates */}
      {isAllGatesModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="flex-1"
            onClick={() => setIsAllGatesModalOpen(false)}
          />
          <div className="w-full max-h-[75vh] bg-[#0E1322] light:bg-[#FAF9F5] border-t border-white/20 light:border-slate-300 rounded-t-3xl p-5 space-y-4 shadow-2xl overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 light:border-slate-200">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[var(--signal-cyan)]" />
                <h3 className="text-sm font-heading font-bold text-[var(--ink)]">
                  Quantum Gate Registry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAllGatesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white light:hover:text-black hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Categorized Gate Groups */}
            <div className="space-y-4">
              {ALL_CATEGORIES.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
                    {cat.name}
                  </span>
                  <div className="grid grid-cols-3 xs:grid-cols-4 gap-2">
                    {cat.types.map((gt) => {
                      const info = GATE_REGISTRY[gt];
                      const isSelected = selectedGate === gt;

                      return (
                        <button
                          key={gt}
                          type="button"
                          onClick={() => {
                            handleSelectGate(gt);
                            setIsAllGatesModalOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--signal-cyan)] text-[var(--void)] border-[var(--signal-cyan)] font-bold'
                              : 'bg-white/[0.03] light:bg-white text-slate-200 light:text-slate-800 border-white/10 light:border-slate-300 hover:border-white/25 active:scale-95'
                          }`}
                        >
                          <div className="font-mono text-sm font-bold">{info.label}</div>
                          <div className="text-[10px] text-slate-400 light:text-slate-500 line-clamp-1 mt-0.5">
                            {info.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
