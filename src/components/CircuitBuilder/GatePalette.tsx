// ============================================================
// Qubic AI — Gate Palette Component
// Draggable, un-squeezed gate tiles with hover tooltips and category groups
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GATE_REGISTRY, type GateType, type GateInfo } from '../../core/types';
import { useCircuitStore } from '../../core/store';
import { Layers, HelpCircle } from 'lucide-react';

const GATE_CATEGORIES = [
  {
    label: 'Single Qubit',
    description: 'Fundamental superposition and Pauli phase operations',
    types: ['H', 'X', 'Y', 'Z', 'S', 'T'] as GateType[],
  },
  {
    label: 'Rotation',
    description: 'Continuous rotations on Bloch sphere axes (RX, RY, RZ)',
    types: ['RX', 'RY', 'RZ'] as GateType[],
  },
  {
    label: 'Multi Qubit',
    description: 'Entanglement & 2-qubit swap operations',
    types: ['CNOT', 'CZ', 'SWAP'] as GateType[],
  },
  {
    label: 'Measurement',
    description: 'Projective Born rule readout into classical bits',
    types: ['MEASURE'] as GateType[],
  },
];

export function GatePalette() {
  const selectedGate = useCircuitStore((s) => s.selectedGate);
  const setSelectedGate = useCircuitStore((s) => s.setSelectedGate);

  // Active hover tooltip state
  const [hoveredGate, setHoveredGate] = useState<{
    gate: GateInfo;
    rect: DOMRect;
  } | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timers on scroll or unmount
  useEffect(() => {
    const handleScroll = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setHoveredGate(null);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleMouseEnter = (gate: GateInfo, e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    // 2 seconds hover delay as requested
    hoverTimerRef.current = setTimeout(() => {
      setHoveredGate({ gate, rect });
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredGate(null);
  };

  const handleDragStart = (e: React.DragEvent, gateType: GateType) => {
    handleMouseLeave();
    e.dataTransfer.setData('gateType', gateType);
    e.dataTransfer.effectAllowed = 'copy';
    setSelectedGate(gateType);
  };

  const handleClick = (gateType: GateType) => {
    handleMouseLeave();
    setSelectedGate(selectedGate === gateType ? null : gateType);
  };

  // Safe clamping calculations for tooltip positioning right above button
  const tooltipWidth = 220;
  const centerX = hoveredGate ? hoveredGate.rect.left + hoveredGate.rect.width / 2 : 0;
  const safeLeft = typeof window !== 'undefined'
    ? Math.max(tooltipWidth / 2 + 10, Math.min(window.innerWidth - tooltipWidth / 2 - 10, centerX))
    : centerX;
  const caretOffset = centerX - safeLeft;
  const isNearTop = hoveredGate ? hoveredGate.rect.top < 140 : false;

  return (
    <div className="flex flex-col h-full bg-[var(--panel)] text-[var(--ink)] select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 light:border-black/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[var(--signal-cyan)]">
            <Layers size={13} />
          </div>
          <div>
            <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-white light:text-slate-900">
              Gate Palette
            </h3>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400">13 Gates</span>
      </div>

      {/* Categories & Chips (Scrollable body with ample padding) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 scrollbar-thin">
        {GATE_CATEGORIES.map((category) => (
          <div key={category.label} className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                {category.label}
              </span>
            </div>

            {/* Grid of Chips: 3 columns with relaxed gap and ample touch target */}
            <div className="grid grid-cols-3 gap-2">
              {category.types.map((type) => {
                const gate: GateInfo = GATE_REGISTRY[type];
                const isSelected = selectedGate === type;

                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    onClick={() => handleClick(type)}
                    onMouseEnter={(e) => handleMouseEnter(gate, e)}
                    onMouseLeave={handleMouseLeave}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing font-mono transition-all duration-150 border ${
                      isSelected
                        ? 'bg-[var(--cryostat-gold)]/20 text-[var(--cryostat-gold)] border-[var(--cryostat-gold)] font-bold shadow-md scale-[1.02]'
                        : 'bg-white/[0.04] light:bg-black/[0.04] text-[var(--ink)] border-white/10 light:border-black/10 hover:border-[var(--signal-cyan)]/60 hover:text-[var(--signal-cyan)] hover:bg-[var(--signal-cyan)]/10 hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="pointer-events-none text-xs font-bold leading-tight tracking-tight">
                      {gate.label}
                    </span>
                    <span className="pointer-events-none text-[8px] opacity-60 font-sans leading-none mt-0.5">
                      {category.label === 'Rotation' ? 'θ' : category.label === 'Multi Qubit' ? '2-q' : '1-q'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Tip Box */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 light:border-black/10 space-y-1 mt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--cryostat-gold)]">
            <HelpCircle size={12} />
            <span>Usage Tip</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Drag a tile onto any wire or click to select then click a circuit wire slot.
          </p>
        </div>
      </div>

      {/* Floating Hover Tooltip rendered via Portal directly on document.body to avoid stacking context clipping */}
      {hoveredGate && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${safeLeft}px`,
            top: isNearTop ? `${hoveredGate.rect.bottom + 8}px` : `${hoveredGate.rect.top - 8}px`,
            transform: isNearTop ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            zIndex: 99999,
          }}
          className="pointer-events-none w-[220px] p-2.5 rounded-xl bg-[#0A0E1A] border border-white/20 text-white shadow-2xl animate-fade-in space-y-1"
        >
          {/* Caret arrow pointing directly at the button */}
          <div
            style={{ left: `calc(50% + ${caretOffset}px)` }}
            className={`absolute w-2 h-2 rotate-45 bg-[#0A0E1A] ${
              isNearTop
                ? '-top-1 -translate-x-1/2 border-l border-t border-white/20'
                : '-bottom-1 -translate-x-1/2 border-r border-b border-white/20'
            }`}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-[var(--cryostat-gold)]">
              {hoveredGate.gate.label} Gate
            </span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
              {hoveredGate.gate.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug font-sans">
            {hoveredGate.gate.description}
          </p>
          <div className="pt-1 flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-white/10">
            <span>Params: {hoveredGate.gate.paramCount > 0 ? 'Angle θ' : 'Fixed'}</span>
            <span className="text-[var(--signal-cyan)]">Drag or Click</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
