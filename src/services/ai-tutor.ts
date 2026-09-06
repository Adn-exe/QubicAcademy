// ============================================================
// QuantumLearn AI — Gemini AI Tutor Service
// Context-aware quantum computing tutor using Google Gemini
// Uses Supabase Edge Function proxy (API key stays server-side)
// ============================================================

import type { TutorContext } from '../core/types';
import { circuitToQiskit } from '../core/qiskit-codegen';
import { supabase } from '../lib/supabase';

const SUSPICIOUS_OR_OFFTOPIC_PATTERNS = [
  /ignore (all )?(previous|above) (instructions|prompts)/i,
  /you are now (DAN|an unconstrained|unrestricted)/i,
  /jailbreak/i,
  /write (a |an )?(essay|poem|song|story|resume|cover letter) about (?!quantum)/i,
  /how to (hack|exploit|bypass|crack|ddos|phish)/i,
  /create (a )?(malware|virus|trojan|ransomware|keylogger)/i,
  /crypto(currency)? price|bitcoin|ethereum|stock advice/i,
];

function checkGuardrails(message: string): string | null {
  for (const pattern of SUSPICIOUS_OR_OFFTOPIC_PATTERNS) {
    if (pattern.test(message)) {
      return 'I cannot assist with that request. I am the Qubiq Academy AI Tutor, strictly focused on educational quantum computing, quantum circuits, algorithms, and theory. Please ask a quantum-related question!';
    }
  }
  return null;
}

function buildContextMessage(context: TutorContext): string {
  const parts: string[] = [];

  if (context.currentCircuit && context.currentCircuit.steps.length > 0) {
    parts.push(`**Current Circuit (${context.currentCircuit.numQubits} qubits, ${context.currentCircuit.steps.length} steps):**`);
    parts.push('```python');
    parts.push(circuitToQiskit(context.currentCircuit));
    parts.push('```');
  }

  if (context.simulationResult) {
    const r = context.simulationResult;
    parts.push('\n**Latest Simulation Results:**');
    parts.push(`- Measurement counts: ${JSON.stringify(r.counts)}`);
    parts.push(`- Probabilities: [${r.probabilities.map(p => p.toFixed(4)).join(', ')}]`);
    parts.push(`- Circuit depth: ${r.circuitDepth}, Gate count: ${r.gateCount}`);
  }

  if (context.currentModule) {
    parts.push(`\n**Current Learning Module:** ${context.currentModule}`);
  }

  return parts.length > 0 ? `\n\n---\nCONTEXT:\n${parts.join('\n')}` : '';
}

export async function sendTutorMessage(
  userMessage: string,
  context: TutorContext,
  messageHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<string> {
  const guardrailViolation = checkGuardrails(userMessage);
  if (guardrailViolation) {
    return guardrailViolation;
  }

  const contextStr = buildContextMessage(context);

  // ── Primary path: Supabase Edge Function Proxy (API key stays on server) ──
  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('tutor', {
      body: {
        userMessage,
        contextMessage: contextStr,
        messageHistory: messageHistory.slice(-6).map(m => ({
          role: m.role,
          content: m.parts?.[0]?.text || '',
        })),
      },
    });

    if (!edgeErr && edgeData?.reply) {
      return edgeData.reply;
    }

    // If the edge function returned an error object, log it
    if (edgeErr) {
      console.warn('Edge function error:', edgeErr.message || edgeErr);
    }
  } catch (edgeCatch) {
    console.warn('Edge function unreachable:', edgeCatch);
  }

  // ── Fallback: local built-in responses (no API key needed) ──
  return getFallbackResponse(userMessage, context);
}

/**
 * Fallback responses when Edge Function is unavailable.
 * Provides basic quantum computing knowledge without needing any API key.
 */
function getFallbackResponse(message: string, context: TutorContext): string {
  const lower = message.toLowerCase();

  if (lower.includes('superposition')) {
    return `## Superposition

In classical computing, a bit is either 0 or 1. A **qubit** can be in a superposition — simultaneously in both states!

Mathematically: **|ψ⟩ = α|0⟩ + β|1⟩**

Where |α|² + |β|² = 1. The Hadamard gate (**H**) creates an equal superposition: H|0⟩ = (|0⟩ + |1⟩)/√2

Try placing an H gate on q0 and running the simulation — you'll see 50/50 measurement probabilities!`;
  }

  if (lower.includes('entangle') || lower.includes('bell')) {
    return `## Entanglement & Bell States

**Entanglement** is when two qubits become correlated — measuring one instantly determines the other.

To create a **Bell state** (maximally entangled pair):
1. Apply **H** gate to q0 (creates superposition)
2. Apply **CNOT** from q0 → q1 (entangles them)

Result: **|Φ+⟩ = (|00⟩ + |11⟩)/√2**

When measured, you'll always get either "00" or "11" — never "01" or "10"! 

\`\`\`circuit-json
{"name":"Bell State","numQubits":2,"steps":[{"gates":[{"id":"g1","type":"H","qubit":0}]},{"gates":[{"id":"g2","type":"CNOT","qubit":0,"control":0,"target":1}]}]}
\`\`\``;
  }

  if (lower.includes('what does this circuit') || lower.includes('explain')) {
    if (context.currentCircuit && context.currentCircuit.steps.length > 0) {
      const gates = context.currentCircuit.steps.flatMap(s => s.gates);
      const gateNames = gates.map(g => g.type).join(', ');
      return `## Circuit Analysis

Your circuit has **${context.currentCircuit.numQubits} qubits** and applies: **${gateNames}**

${context.simulationResult
    ? `The simulation shows measurement results: ${JSON.stringify(context.simulationResult.counts)}

This means ${Object.entries(context.simulationResult.counts)
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => `state |${state}⟩ appears ${((count / 1024) * 100).toFixed(1)}% of the time`)
      .join(', ')}.`
    : 'Run the simulation to see what this circuit produces!'}

**Note:** The AI tutor service is temporarily unavailable. Basic analysis is shown above.`;
    }
    return 'Build a circuit first, then I can explain what it does! Drag gates from the palette onto the qubit wires.';
  }

  if (lower.includes('50/50') || lower.includes('why')) {
    if (context.simulationResult) {
      const counts = context.simulationResult.counts;
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const probs = Object.entries(counts)
        .map(([k, v]) => `|${k}⟩: ${((v / total) * 100).toFixed(1)}%`)
        .join(', ');
      return `## Understanding Your Results

Your measurement results show: **${probs}**

This happens because your circuit creates a quantum state where these outcomes have the given probabilities. The Hadamard gate, for example, creates an equal superposition giving ~50/50 probabilities.

Remember: quantum measurement is probabilistic! Run it multiple times and you'll see slight variations.`;
    }
  }

  return `## Qubiq Academy AI Tutor

I'm here to help you learn quantum computing! I can:

- **Explain concepts**: "What is superposition?", "How does entanglement work?"
- **Analyze circuits**: "What does this circuit do?"
- **Debug**: "Why am I not getting a Bell state?"
- **Generate circuits**: "Make a GHZ state"

> **Note:** AI responses are currently in offline mode. Deploy the Supabase Edge Function for full AI capabilities.

Try asking me something!`;
}

/**
 * Extract circuit JSON from AI response if present
 */
export function extractCircuitFromResponse(response: string): string | null {
  const match = response.match(/```circuit-json\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}
