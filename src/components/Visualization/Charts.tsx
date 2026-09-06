// ============================================================
// QuantumLearn AI — Measurement Histogram & State Vector Display
// ============================================================

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, Atom } from 'lucide-react';
import type { SimulationResult, Complex } from '../../core/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Measurement Histogram ---

interface HistogramProps {
  counts: Record<string, number>;
  totalShots?: number;
}

export function MeasurementHistogram({ counts, totalShots = 1024 }: HistogramProps) {
  const data = useMemo(() => {
    const labels = Object.keys(counts).sort();
    const values = labels.map((k) => counts[k] / totalShots);

    return {
      labels,
      datasets: [
        {
          label: 'Probability',
          data: values,
          backgroundColor: labels.map((_, i) => {
            const hue = (i * 360) / labels.length + 270;
            return `hsla(${hue % 360}, 70%, 60%, 0.7)`;
          }),
          borderColor: labels.map((_, i) => {
            const hue = (i * 360) / labels.length + 270;
            return `hsla(${hue % 360}, 70%, 60%, 1)`;
          }),
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [counts, totalShots]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing: 'easeOutQuart' as const,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 22, 41, 0.95)',
          titleColor: '#e2e8f0',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            label: (ctx: { parsed: { y: number | null } }) => {
              const y = ctx.parsed.y ?? 0;
              return `${(y * 100).toFixed(1)}% (${Math.round(y * totalShots)} shots)`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 11 } },
          grid: { display: false },
          border: { color: 'rgba(100, 116, 139, 0.2)' },
        },
        y: {
          ticks: {
            color: '#64748b',
            font: { size: 10 },
            callback: (v: string | number) => `${(Number(v) * 100).toFixed(0)}%`,
          },
          grid: { color: 'rgba(100, 116, 139, 0.08)' },
          border: { display: false },
          max: 1,
        },
      },
    }),
    [totalShots]
  );

  return (
    <div className="h-full p-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Measurement Results
      </h4>
      <div className="h-[calc(100%-24px)]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

// --- State Vector Display ---

interface StateVectorProps {
  statevector: Complex[];
  numQubits: number;
}

export function StateVectorDisplay({ statevector, numQubits }: StateVectorProps) {
  const basisStates = useMemo(() => {
    return statevector.map((amp, i) => {
      const label = `|${i.toString(2).padStart(numQubits, '0')}⟩`;
      const magnitude = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag);
      const phase = Math.atan2(amp.imag, amp.real);
      return { label, magnitude, phase, amp };
    });
  }, [statevector, numQubits]);

  const maxMag = Math.max(...basisStates.map((s) => s.magnitude), 0.001);

  return (
    <div className="h-full p-3 overflow-y-auto">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        State Vector
      </h4>
      <div className="space-y-1.5">
        {basisStates.map((state) => (
          <div key={state.label} className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 w-12 text-right shrink-0">
              {state.label}
            </span>
            <div className="flex-1 h-5 bg-space-800 rounded overflow-hidden relative">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${(state.magnitude / maxMag) * 100}%`,
                  background: `hsl(${((state.phase / Math.PI) * 180 + 270) % 360}, 70%, 55%)`,
                  opacity: state.magnitude > 0.001 ? 1 : 0.2,
                }}
              />
            </div>
            <span className="text-xs font-mono text-slate-500 w-20 shrink-0">
              {state.magnitude > 0.001
                ? `${state.amp.real >= 0 ? ' ' : ''}${state.amp.real.toFixed(3)}${state.amp.imag >= 0 ? '+' : ''}${state.amp.imag.toFixed(3)}i`
                : '0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Combined Visualization Panel ---

interface VisualizationPanelProps {
  result: SimulationResult | null;
  numQubits: number;
}

export function VisualizationPanel({ result, numQubits }: VisualizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'histogram' | 'statevector'>('histogram');

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm p-4">
        <div className="text-center">
          <BarChart3 size={28} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs">Build a circuit and click <strong>Run</strong> to see simulation results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2.5 bg-[#12172A] light:bg-white text-slate-200 light:text-slate-800 transition-colors">
      {/* Top Navigation & Stats Bar */}
      <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-white/10 light:border-slate-200 shrink-0">
        {/* Streamlined Tabs */}
        <div className="flex items-center gap-0.5 bg-[#0A0E1A] light:bg-slate-100 p-0.5 rounded-lg border border-white/10 light:border-slate-200">
          <button
            onClick={() => setActiveTab('histogram')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'histogram'
                ? 'bg-[#4FD1D9] text-[#0A0E1A] shadow-xs'
                : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black'
            }`}
          >
            <BarChart3 size={12} />
            <span>Histogram</span>
          </button>
          <button
            onClick={() => setActiveTab('statevector')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'statevector'
                ? 'bg-[#4FD1D9] text-[#0A0E1A] shadow-xs'
                : 'text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black'
            }`}
          >
            <Atom size={12} />
            <span>Amplitudes</span>
          </button>
        </div>

        {/* Compact Circuit Metrics Chip */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-lg bg-[#0A0E1A] light:bg-slate-100 border border-white/10 light:border-slate-200 select-none">
          <span className="text-[#4FD1D9] light:text-[#0D9488] font-medium" title="Circuit Depth">
            D:{result.circuitDepth}
          </span>
          <span className="text-white/20 light:text-slate-400">/</span>
          <span className="text-[#D9A441] font-medium" title="Gate Count">
            G:{result.gateCount}
          </span>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 w-full relative min-h-0 overflow-hidden rounded-xl border border-white/10 light:border-slate-200 bg-[#0A0E1A] light:bg-slate-50 p-2">
        {activeTab === 'histogram' ? (
          <div className="h-full w-full">
            <MeasurementHistogram counts={result.counts} />
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto">
            <StateVectorDisplay statevector={result.statevector} numQubits={numQubits} />
          </div>
        )}
      </div>
    </div>
  );
}
