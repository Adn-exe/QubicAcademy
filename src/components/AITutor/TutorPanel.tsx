// ============================================================
// QuantumLearn AI — AI Tutor Chat Panel
// Styled with --paper (#F7F6F1) explanation surface & --ink text
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, X, Trash2, Download } from 'lucide-react';
import { useChatStore, useCircuitStore } from '../../core/store';
import { sendTutorMessage, extractCircuitFromResponse } from '../../services/ai-tutor';
import type { ChatMessage, TutorContext } from '../../core/types';

const SUGGESTED_PROMPTS = [
  'What is superposition?',
  'What does this circuit do?',
  'How do I create a Bell state?',
  'Why is my result 50/50?',
  'Explain entanglement',
  'Make a GHZ state',
];

export function TutorPanel() {
  const location = useLocation();

  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const isLoading = useChatStore((s) => s.isLoading);
  const setLoading = useChatStore((s) => s.setLoading);
  const isTutorOpen = useChatStore((s) => s.isTutorOpen);
  const toggleTutor = useChatStore((s) => s.toggleTutor);
  const clearChat = useChatStore((s) => s.clearChat);

  const circuit = useCircuitStore((s) => s.circuit);
  const simulationResult = useCircuitStore((s) => s.simulationResult);
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Strict prohibition: AI Tutor is strictly prohibited in any problem or challenge section
  const isProblemSection =
    location.pathname.startsWith('/problems') ||
    location.pathname.startsWith('/challenge');

  // Immediately close tutor if user navigates to any problem/challenge section
  useEffect(() => {
    if (isProblemSection && isTutorOpen) {
      useChatStore.getState().setTutorOpen(false);
    }
  }, [isProblemSection, isTutorOpen]);

  // Client-side rate-limiting cooldown (anti-spam & quota defense)
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const interval = setInterval(() => {
      setCooldownSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSec]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isTutorOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isTutorOpen]);

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading || cooldownSec > 0) return;

    setInput('');
    setCooldownSec(3); // 3-second cooldown to protect API quotas
    
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setLoading(true);

    try {
      const context: TutorContext = {
        currentCircuit: circuit,
        simulationResult: simulationResult,
        currentModule: null,
        currentChallenge: null,
      };

      const reply = await sendTutorMessage(text, context);
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I had trouble connecting. Please try again in a moment.",
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [input, isLoading, circuit, simulationResult, messages, addMessage, setLoading]);

  const handleLoadCircuit = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      loadCircuit(parsed);
    } catch {
      // ignore
    }
  };

  // Strictly prohibited in problem sections or sub-sections
  if (isProblemSection) {
    return null;
  }

  if (!isTutorOpen) {
    return (
      <button
        onClick={toggleTutor}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-[var(--panel)] hover:bg-[#182038] text-[var(--cryostat-gold)] border border-[var(--cryostat-gold)]/40 hover:border-[var(--cryostat-gold)] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-200 z-50 hover:scale-105 active:scale-95 group cursor-pointer"
        title="Open Quantum AI Tutor"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:rotate-45 transition-transform duration-500"
        >
          <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" />
          <circle cx="4" cy="12" r="1.8" />
          <circle cx="20" cy="12" r="1.8" />
          <line x1="5.8" y1="12" x2="8.8" y2="12" />
          <line x1="15.2" y1="12" x2="18.2" y2="12" />
          <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="currentColor" strokeDasharray="1.5 2.5" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-[#12172A] light:bg-[#F7F6F1] text-slate-100 light:text-[#1B1E24] border-l border-white/10 light:border-black/10 flex flex-col z-50 animate-slide-in-right shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 light:border-black/10 bg-[#0A0E1A] light:bg-[#EDECE7]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] light:bg-black/5 text-[var(--cryostat-gold)] border border-white/10 light:border-black/10 flex items-center justify-center shadow-xs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" />
              <circle cx="4" cy="12" r="1.8" />
              <circle cx="20" cy="12" r="1.8" />
              <line x1="5.8" y1="12" x2="8.8" y2="12" />
              <line x1="15.2" y1="12" x2="18.2" y2="12" />
              <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="currentColor" strokeDasharray="1.5 2.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white light:text-[#1B1E24] font-heading">AI Quantum Tutor</h3>
            <p className="text-[11px] font-mono text-slate-400 light:text-slate-600">Contextual Quantum Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black hover:bg-white/5 light:hover:bg-black/5 transition-colors cursor-pointer"
            title="Clear chat"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={toggleTutor}
            className="p-1.5 rounded-lg text-slate-400 light:text-slate-600 hover:text-white light:hover:text-black hover:bg-white/5 light:hover:bg-black/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0D1222] light:bg-[#EFEFE9]">
        {messages.length === 0 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6 pt-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] light:bg-black/5 text-[var(--cryostat-gold)] border border-white/10 light:border-black/10 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" />
                  <circle cx="4" cy="12" r="1.8" />
                  <circle cx="20" cy="12" r="1.8" />
                  <line x1="5.8" y1="12" x2="8.8" y2="12" />
                  <line x1="15.2" y1="12" x2="18.2" y2="12" />
                  <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="currentColor" strokeDasharray="1.5 2.5" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-white light:text-[#1B1E24] font-heading mb-1">
                Quantum Tutor Ready
              </h4>
              <p className="text-xs text-slate-400 light:text-slate-600 max-w-[260px] mx-auto leading-relaxed">
                Ask any question about quantum states, gates, algorithms, or the current circuit.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 light:text-slate-600 font-mono">Suggested topics:</p>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl bg-[#12172A] light:bg-white text-slate-200 light:text-slate-800 hover:text-white light:hover:text-black hover:border-[#4FD1D9]/40 transition-all border border-white/5 light:border-black/10 shadow-xs cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onLoadCircuit={handleLoadCircuit}
          />
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] light:bg-black/5 text-[var(--cryostat-gold)] border border-white/10 light:border-black/10 flex items-center justify-center shrink-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" />
                <circle cx="4" cy="12" r="1.8" />
                <circle cx="20" cy="12" r="1.8" />
                <line x1="5.8" y1="12" x2="8.8" y2="12" />
                <line x1="15.2" y1="12" x2="18.2" y2="12" />
              </svg>
            </div>
            <div className="flex gap-1.5 py-2.5 bg-[#12172A] light:bg-white px-3.5 rounded-xl border border-white/10 light:border-black/10 shadow-xs">
              <div className="w-2 h-2 bg-[#D9A441] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#D9A441] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#D9A441] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 light:border-black/10 bg-[#0A0E1A] light:bg-[#EDECE7]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about quantum computing..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#12172A] light:bg-white border border-white/10 light:border-black/10 text-sm text-slate-100 light:text-[#1B1E24] placeholder-slate-500 light:placeholder-slate-400 outline-none focus:border-[#D9A441] transition-colors shadow-xs"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || cooldownSec > 0}
            className="py-2 px-3 rounded-xl bg-[#D9A441] hover:bg-[#c49235] text-[#0A0E1A] font-bold transition-all disabled:opacity-40 flex items-center justify-center min-w-[40px] cursor-pointer"
            title={cooldownSec > 0 ? `Please wait ${cooldownSec}s before next question` : 'Send question'}
          >
            {cooldownSec > 0 ? (
              <span className="text-xs font-mono font-bold">{cooldownSec}s</span>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Message Bubble ---

function MessageBubble({
  message,
  onLoadCircuit,
}: {
  message: ChatMessage;
  onLoadCircuit: (json: string) => void;
  isLoading?: boolean;
}) {
  const isUser = message.role === 'user';
  const navigate = useNavigate();

  // Check for circuit JSON in assistant messages
  const circuitJson = !isUser ? extractCircuitFromResponse(message.content) : null;
  const displayContent = message.content
    .replace(/```circuit-json\n[\s\S]*?```/g, '') // Remove circuit JSON blocks from display
    .trim();

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;
    const href = target.getAttribute('data-link') || target.getAttribute('href');
    if (href && href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-[#D9A441] text-[#0A0E1A] font-bold'
            : 'bg-white/[0.04] light:bg-black/5 text-[var(--cryostat-gold)] border border-white/10 light:border-black/10'
        }`}
      >
        {isUser ? (
          <MessageSquare size={13} />
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" />
            <circle cx="4" cy="12" r="1.8" />
            <circle cx="20" cy="12" r="1.8" />
            <line x1="5.8" y1="12" x2="8.8" y2="12" />
            <line x1="15.2" y1="12" x2="18.2" y2="12" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
          isUser
            ? 'bg-[#D9A441]/20 text-slate-100 light:text-slate-900 border border-[#D9A441]/40 rounded-tr-none shadow-xs'
            : 'bg-[#12172A] light:bg-white text-slate-200 light:text-slate-800 rounded-tl-none border border-white/10 light:border-black/10 shadow-xs'
        }`}
      >
        <div
          onClick={handleContentClick}
          className="prose prose-invert light:prose-slate prose-sm max-w-none text-inherit [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 [&_p]:mb-1.5 [&_ul]:mb-1 [&_code]:text-[#4FD1D9] light:[&_code]:text-[#20878E] [&_code]:bg-[#0A0E1A] light:[&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_strong]:text-white light:[&_strong]:text-slate-900"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(displayContent) }}
        />

        {circuitJson && (
          <button
            onClick={() => onLoadCircuit(circuitJson)}
            className="mt-2.5 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#4FD1D9]/20 text-[#4FD1D9] hover:bg-[#4FD1D9]/30 font-semibold transition-colors border border-[#4FD1D9]/30"
          >
            <Download size={13} />
            Load circuit into builder
          </button>
        )}
      </div>
    </div>
  );
}

// --- Clean LaTeX Math expressions into Unicode ---
function cleanLatexMath(str: string): string {
  return str
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\phi/g, 'ϕ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\Psi/g, 'Ψ')
    .replace(/\\rangle/g, '⟩')
    .replace(/\\langle/g, '⟨')
    .replace(/\\sqrt\{2\}/g, '√2')
    .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
    .replace(/\\frac\{1\}\{\\sqrt\{2\}\}/g, '1/√2')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
    .replace(/\\otimes/g, '⊗')
    .replace(/\\pm/g, '±')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\circ/g, '°')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\^\{\\dagger\}/g, '†')
    .replace(/\^\{([^}]+)\}/g, '^$1')
    .replace(/\$([^\$]+)\$/g, '$1') // remove $...$ wrappers
    .replace(/\$\$/g, '');
}

// --- Structured Markdown Formatter for Crisp & Uncluttered Layout ---

function formatMarkdown(raw: string): string {
  if (!raw) return '';

  // 1. Extract and preserve code blocks
  const codeBlocks: string[] = [];
  let text = raw.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const langLabel = lang ? `<span class="text-[10px] font-mono uppercase text-slate-400 select-none">${lang}</span>` : '';
    codeBlocks.push(
      `<div class="my-2.5 rounded-lg bg-[#070A12] border border-white/10 overflow-hidden font-mono text-xs">
        ${langLabel ? `<div class="px-3 py-1 bg-white/[0.03] border-b border-white/5 flex justify-between items-center">${langLabel}</div>` : ''}
        <pre class="p-3 overflow-x-auto text-[var(--signal-cyan)] leading-relaxed">${escaped.trim()}</pre>
      </div>`
    );
    return placeholder;
  });

  // 1b. Clean LaTeX math into clean Unicode before HTML escaping
  text = cleanLatexMath(text);

  // 1c. Repair any truncated/unclosed markdown link at the end of text (e.g. "[Module 5: Grover's Search](/learn/grovers")
  text = text.replace(/\[([^\]]+)\]\(([^)\n]*)$/, (_, label, partialUrl) => {
    let cleanUrl = partialUrl.trim();
    if (!cleanUrl.endsWith('/')) {
      // try to complete module path if cut off e.g. /learn/grovers -> /learn/grovers-search
      if (cleanUrl.includes('/learn/grover')) cleanUrl = '/learn/grovers-search';
      else if (cleanUrl.includes('/learn/deutsch')) cleanUrl = '/learn/deutsch-jozsa';
      else if (cleanUrl.includes('/learn/superposition')) cleanUrl = '/learn/superposition-single-qubit';
      else if (cleanUrl.includes('/learn/quantum-measure')) cleanUrl = '/learn/quantum-measurement';
      else if (cleanUrl.includes('/learn/entangle')) cleanUrl = '/learn/entanglement-bell-states';
      else if (cleanUrl.includes('/learn/quantum-tele')) cleanUrl = '/learn/quantum-teleportation';
    }
    return `[${label}](${cleanUrl})`;
  });

  // 2. Escape basic HTML in main text
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Format inline code
  text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/[0.08] text-[var(--signal-cyan)] font-mono text-[11px]">$1</code>');

  // 4. Headers
  text = text.replace(/^### (.*$)/gm, '<h3 class="text-xs font-bold text-white uppercase tracking-wider mt-3 mb-1 font-heading">$1</h3>');
  text = text.replace(/^## (.*$)/gm, '<h2 class="text-sm font-bold text-[var(--cryostat-gold)] mt-3.5 mb-1.5 font-heading pb-1 border-b border-white/5">$1</h2>');
  text = text.replace(/^# (.*$)/gm, '<h1 class="text-base font-bold text-white mt-4 mb-2 font-heading">$1</h1>');

  // 5. Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>');

  // 5b. Direct Platform Section Buttons & Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
    // Normalize localhost / domain URLs to pure relative paths
    let cleanUrl = url.trim().replace(/^https?:\/\/[^/]+/i, '');
    if (!cleanUrl.startsWith('/') && (cleanUrl.startsWith('learn/') || cleanUrl.startsWith('lab') || cleanUrl.startsWith('problems'))) {
      cleanUrl = '/' + cleanUrl;
    }
    // Clean trailing arrows or whitespace inside link label
    const cleanLabel = linkText.replace(/[→\->\s]+$/g, '').trim();
    const isInternal = cleanUrl.startsWith('/');
    return `<a href="${cleanUrl}" data-link="${cleanUrl}" class="tutor-nav-btn inline-flex items-center gap-1.5 my-1 px-3 py-1 rounded-lg bg-[#4FD1D9]/15 hover:bg-[#4FD1D9]/25 text-[#4FD1D9] light:text-[#0E7077] font-semibold text-xs transition-all border border-[#4FD1D9]/30 no-underline cursor-pointer shadow-xs" ${!isInternal ? 'target="_blank" rel="noopener noreferrer"' : ''}><span>${cleanLabel}</span><span class="text-[10px] opacity-75">→</span></a>`;
  });

  // 6. Lists
  // Clean messy bullet lists with numbers e.g. "•1." or "* 1."
  text = text.replace(/^[•*]\s*(\d+\.)/gm, '$1');

  // Transform unordered lists
  text = text.replace(/(?:^[*-•] (?:.*)\n?)+/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => {
        const content = line.replace(/^[*-•]\s*/, '').trim();
        return `<li class="flex items-start gap-2 text-xs leading-relaxed"><span class="text-[var(--signal-cyan)] leading-none mt-1 shrink-0">•</span><span>${content}</span></li>`;
      })
      .join('');
    return `<ul class="my-2 space-y-1.5 text-slate-200">${items}</ul>`;
  });

  // Transform ordered lists
  text = text.replace(/(?:^\d+\.\s*(?:.*)\n?)+/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line, idx) => {
        const content = line.replace(/^\d+\.\s*/, '').trim();
        return `<li class="flex items-start gap-2 text-xs leading-relaxed"><span class="font-mono text-[10px] text-[var(--cryostat-gold)] mt-0.5 shrink-0 font-bold">${idx + 1}.</span><span>${content}</span></li>`;
      })
      .join('');
    return `<ol class="my-2 space-y-1.5 text-slate-200">${items}</ol>`;
  });

  // 7. Paragraphs
  const blocks = text.split(/\n\n+/);
  text = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('__CODEBLOCK_')
      ) {
        return trimmed;
      }
      return `<p class="mb-2 last:mb-0 leading-relaxed text-slate-200 text-xs">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  // 8. Restore code blocks
  codeBlocks.forEach((codeHtml, i) => {
    text = text.replace(`__CODEBLOCK_${i}__`, codeHtml);
  });

  return text;
}
