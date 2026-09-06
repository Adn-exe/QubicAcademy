// ============================================================
// QuantumLearn AI — Code Editor Panel
// Resilient Monaco Editor + Native Fast Quantum Editor with Bidirectional Sync
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useCircuitStore } from '../../core/store';
import { circuitToQiskit, qiskitToCircuit } from '../../core/qiskit-codegen';
import { Copy, Check, Play, AlertCircle, Zap, Code2 } from 'lucide-react';
import { triggerToast } from '../UI/GlobalToast';

// Configure Monaco loader to use reliable fast CDN path
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs',
  },
});

export function CodeEditorPanel() {
  const circuit = useCircuitStore((s) => s.circuit);
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);
  const runSimulation = useCircuitStore((s) => s.runSimulation);
  const isSimulating = useCircuitStore((s) => s.isSimulating);

  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'monaco' | 'fast'>('monaco');
  const [monacoReady, setMonacoReady] = useState(false);
  const [monacoFailed, setMonacoFailed] = useState(false);

  const [syncDirection, setSyncDirection] = useState<'circuit' | 'code'>('circuit');
  const [isLightTheme, setIsLightTheme] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('light-theme')
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep editor theme synchronized with app theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightTheme(document.documentElement.classList.contains('light-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Preload/check Monaco with a 3.5s timeout safety net
  useEffect(() => {
    let isCancelled = false;
    const timeoutId = setTimeout(() => {
      if (!isCancelled && !monacoReady) {
        // Automatically switch to fast editor so user is never blocked
        setMonacoFailed(true);
        setEditorMode('fast');
      }
    }, 3500);

    loader.init()
      .then(() => {
        if (!isCancelled) {
          setMonacoReady(true);
        }
      })
      .catch((err) => {
        console.warn('Monaco failed to load from CDN, falling back to Native Fast Editor:', err);
        if (!isCancelled) {
          setMonacoFailed(true);
          setEditorMode('fast');
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [monacoReady]);

  // Sync circuit → code when circuit changes (and user isn't actively typing)
  useEffect(() => {
    if (syncDirection === 'circuit') {
      setCode(circuitToQiskit(circuit));
      setError(null);
    }
  }, [circuit, syncDirection]);

  // Debounced code → circuit parsing
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;
      setCode(value);
      setSyncDirection('code');

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const parsed = qiskitToCircuit(value);
        if (parsed) {
          setError(null);
          loadCircuit(parsed);
          setTimeout(() => setSyncDirection('circuit'), 50);
        } else {
          setError('Could not parse circuit. Check syntax.');
        }
      }, 500);
    },
    [loadCircuit]
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    triggerToast('Qiskit Python code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    if (syncDirection === 'code') {
      const parsed = qiskitToCircuit(code);
      if (parsed) {
        loadCircuit(parsed);
        setTimeout(() => runSimulation(), 50);
      } else {
        setError('Fix syntax errors before running.');
      }
    } else {
      runSimulation();
    }
  };

  // Keyboard navigation for Fast Native Editor (Tab indent support)
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      handleCodeChange(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineCount = Math.max(1, code.split('\n').length);

  return (
    <div className="flex flex-col h-full bg-[var(--panel)] text-[var(--ink)] border border-white/10 rounded-xl overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#0c101d] light:bg-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Qiskit v1.0</span>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center p-0.5 rounded-md bg-white/[0.06] light:bg-slate-200 border border-white/10 text-[11px]">
            <button
              onClick={() => setEditorMode('monaco')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                editorMode === 'monaco'
                  ? 'bg-[#4FD1D9] text-[#0A0E1A] font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Monaco Editor (VS Code engine)"
            >
              <Code2 size={11} />
              <span>Monaco</span>
            </button>
            <button
              onClick={() => setEditorMode('fast')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                editorMode === 'fast'
                  ? 'bg-[#4FD1D9] text-[#0A0E1A] font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fast Native Editor (Instant launch)"
            >
              <Zap size={11} />
              <span>Fast</span>
            </button>
          </div>
        </div>

        {/* Uncluttered Unified Action Pill */}
        <div className="flex items-center bg-white/[0.06] light:bg-slate-200 p-0.5 rounded-lg border border-white/10 light:border-slate-300 shrink-0">
          <button
            type="button"
            onClick={handleCopyCode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-300 light:text-slate-700 hover:text-white hover:bg-white/10 light:hover:bg-white'
            }`}
            title="Copy Qiskit Python code"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <div className="w-px h-3.5 bg-white/10 light:bg-slate-300 mx-0.5" />
          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#4FD1D9] hover:bg-[#38b2ac] text-[#0A0E1A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-[0.98]"
            title="Execute circuit from code"
          >
            {isSimulating ? (
              <span className="w-3 h-3 border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A] rounded-full animate-spin" />
            ) : (
              <Play size={11} fill="currentColor" />
            )}
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Non-colliding Slim Error Banner */}
      {error && (
        <div className="px-3 py-1 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5 shrink-0 animate-fade-in">
          <AlertCircle size={12} className="shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 relative min-h-0 bg-[#0A0E1A] light:bg-slate-50">
        {editorMode === 'monaco' && !monacoFailed ? (
          <Editor
            height="100%"
            language="python"
            theme={isLightTheme ? 'vs' : 'vs-dark'}
            value={code}
            onChange={handleCodeChange}
            onMount={() => setMonacoReady(true)}
            loading={
              <QuantumEditorLoading onSwitchFast={() => setEditorMode('fast')} />
            }
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: 20,
              padding: { top: 10 },
              scrollBeyondLastLine: false,
              renderLineHighlight: 'gutter',
              automaticLayout: true,
              wordWrap: 'on',
              tabSize: 4,
              formatOnPaste: true,
              suggestOnTriggerCharacters: true,
            }}
          />
        ) : (
          /* Native Fast Quantum Code Editor (Instant & Responsive) */
          <div className="h-full flex overflow-hidden font-mono text-xs">
            {/* Line Number Gutter */}
            <div className="w-10 select-none py-2.5 bg-[#070a13] light:bg-slate-200/70 text-right pr-2.5 text-slate-600 light:text-slate-400 border-r border-white/5 light:border-slate-300 leading-5 shrink-0 overflow-hidden">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea with Tab Support and Sync */}
            <div className="flex-1 relative h-full">
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="w-full h-full p-2.5 bg-transparent text-emerald-300 light:text-slate-800 font-mono text-xs leading-5 resize-none outline-none border-0 focus:ring-0 selection:bg-[#4FD1D9]/30"
                placeholder="# Enter Qiskit quantum code here..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced Quantum Loading State for Editor Initialization
 */
function QuantumEditorLoading({ onSwitchFast }: { onSwitchFast: () => void }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-[#0A0E1A] light:bg-slate-50 text-slate-300">
      <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#4FD1D9]/30 border-t-[#4FD1D9] animate-spin" />
        {/* Inner reverse spinning ring */}
        <div className="absolute inset-2 rounded-full border border-[var(--cryostat-gold)]/40 border-b-[var(--cryostat-gold)] animate-spin [animation-direction:reverse] [animation-duration:3s]" />
        {/* Center Quantum Pulse */}
        <div className="w-3 h-3 rounded-full bg-[#4FD1D9] animate-pulse shadow-[0_0_12px_#4FD1D9]" />
      </div>

      <div className="text-center space-y-1.5 max-w-xs">
        <h4 className="text-xs font-semibold tracking-wider uppercase text-[#4FD1D9]">
          Initializing Qiskit Python Runtime
        </h4>
        <p className="text-[11px] text-slate-400">
          Mounting syntax highlights and bidirectional circuit synchronization...
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onSwitchFast}
            className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[#D9A441] border border-[var(--cryostat-gold)]/30 hover:border-[var(--cryostat-gold)]/60 transition-all cursor-pointer"
          >
            <Zap size={11} />
            <span>Launch Instant Fast Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
}
