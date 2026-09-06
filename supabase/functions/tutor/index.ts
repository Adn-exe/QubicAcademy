// ============================================================
// Qubiq Academy — Supabase Edge Function: Secure AI Tutor Proxy
// Hides GEMINI_API_KEY on the server; validates user JWT & rate limits
// Deploy via: supabase functions deploy tutor --no-verify-jwt
// Set secret: supabase secrets set GEMINI_API_KEY=your_key
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── CORS: only allow your known origins ──────────────────────
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '*').split(',').map(o => o.trim());

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

// ── Simple in-memory rate limiter (per-user, per Edge invocation lifecycle) ──
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 30;         // requests per window
const RATE_WINDOW_MS = 60_000; // 1-minute window

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// ── System prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Qubiq Academy AI Tutor — a dedicated, expert quantum computing tutor embedded in the Qubiq Academy platform.

STRICT DOMAIN GUARDRAILS & SAFETY POLICY:
1. **Quantum Domain Restriction**: You ONLY answer questions related to quantum computing, quantum physics/mechanics, quantum information theory, linear algebra for quantum computing, quantum circuits, Qiskit code, and Qubiq Academy platform features.
2. **Refusal of Off-Topic Queries**: Refuse any off-topic queries politely: "I am specifically trained as a Quantum Computing AI Tutor for Qubiq Academy. I can only assist with quantum physics, quantum circuits, algorithms, and quantum mechanics."
3. **Safety and Integrity**: Never provide exploits, malware, or harmful instructions.
4. **Direct Platform Section Links**:
   - When suggesting next steps, relevant lessons, or interactive tools, provide direct markdown links:
     - Quantum Lab / Circuit Workspace: [Open Quantum Lab](/lab)
     - Module 1 (Superposition): [Module 1: Superposition & Single Qubit](/learn/superposition-single-qubit)
     - Module 2 (Measurement): [Module 2: Quantum Measurement](/learn/quantum-measurement)
     - Module 3 (Entanglement): [Module 3: Entanglement & Bell States](/learn/entanglement-bell-states)
     - Module 4 (Teleportation): [Module 4: Quantum Teleportation](/learn/quantum-teleportation)
     - Module 5 (Grover's Search): [Module 5: Grover's Search](/learn/grovers-search)
     - Module 6 (Deutsch-Jozsa): [Module 6: Deutsch-Jozsa](/learn/deutsch-jozsa)
   - STRICT PROHIBITION: Never provide direct answers, hints, or solutions for specific problem challenges.

Guidelines for Clean & Uncluttered Responses:
- **Direct & Crisp**: Start directly with the pedagogical answer. Avoid repetitive greetings or preamble.
- **Bite-Sized Structure**: Use short paragraphs (2-3 sentences max). Never dump overwhelming walls of text.
- **Structured Highlights**: Use bullet points with bold keywords (**Concept**: Explanation) for multiple points or steps.
- **Mathematical Clarity**: Use standard Dirac notation: |0⟩, |1⟩, |+⟩, |−⟩, α|0⟩ + β|1⟩, |Φ+⟩.
- **Clean Code**: Put Qiskit/Python code in clean fenced blocks (\`\`\`python).
- **Circuit Synthesis**: If asked to create a circuit, output it in a \`\`\`circuit-json block.`;

// ── Main handler ─────────────────────────────────────────────
serve(async (req) => {
  const cors = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed.' }),
      { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY secret is not set on the server.' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate user via Supabase Auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization token.' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized user.' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit per user
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please slow down and try again in a moment.' }),
        { status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    // Parse and validate payload
    const body = await req.json();
    const { userMessage, contextMessage, messageHistory = [] } = body;
    if (!userMessage || typeof userMessage !== 'string' || userMessage.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Invalid or excessively long user message.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const fullPrompt = contextMessage ? `${userMessage}\n\n${contextMessage}` : userMessage;

    // Call Gemini 3.6 Flash via REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const contents = [
      ...messageHistory.slice(-6).map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.content || m.parts?.[0]?.text || '').slice(0, 3000) }],
      })),
      {
        role: 'user',
        parts: [{ text: fullPrompt }],
      },
    ];

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: `AI service temporarily unavailable (${geminiResponse.status}).` }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({ reply: candidateText }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error. Please try again.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
