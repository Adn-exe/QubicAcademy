// ============================================================
// QuantumLearn AI — Code Editor Panel
// Monaco Editor with Qiskit Python syntax + bidirectional sync
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useCircuitStore } from '../../core/store';
import { circuitToQiskit, qiskitToCircuit } from '../../core/qiskit-codegen';
import { Play, AlertCircle } from 'lucide-react';

export function CodeEditorPanel() {
  const circuit = useCircuitStore((s) => s.circuit);
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);
  const runSimulation = useCircuitStore((s) => s.runSimulation);
  const isSimulating = useCircuitStore((s) => s.isSimulating);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
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
          // Switch back to circuit-driven sync after applying
          setTimeout(() => setSyncDirection('circuit'), 50);
        } else {
          setError('Could not parse circuit. Check syntax.');
        }
      }, 600);
    },
    [loadCircuit]
  );

  const handleRun = () => {
    // Try to parse first if in code mode
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

  return (
    <div className="flex flex-col h-full bg-[var(--panel)] text-[var(--ink)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-quantum-700/20 light:border-black/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 light:text-slate-600">Qiskit Python</span>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-rose-500 mr-2 inline-flex items-center gap-1">
              <AlertCircle size={13} /> {error}
            </span>
          )}
          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="btn-success text-xs py-1 px-3"
          >
            {isSimulating ? <div className="spinner" /> : <Play size={12} />}
            Run
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="python"
          theme={isLightTheme ? 'vs' : 'vs-dark'}
          value={code}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 20,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'gutter',
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 4,
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>
    </div>
  );
}
