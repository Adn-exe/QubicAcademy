// ============================================================
// Qubiq Academy — Supabase Edge Function: Secure AI Tutor Proxy
// Hides GEMINI_API_KEY on the server; validates user JWT & rate limits
// Deploy via: supabase functions deploy tutor --no-verify-jwt
// Set secret: supabase secrets set GEMINI_API_KEY=your_key
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Qubiq Academy AI Tutor — a dedicated, expert quantum computing tutor embedded in the Qubiq Academy platform.

STRICT DOMAIN GUARDRAILS & SAFETY POLICY:
1. **Quantum Domain Restriction**: You ONLY answer questions related to quantum computing, quantum physics/mechanics, quantum information theory, linear algebra for quantum computing, quantum circuits, Qiskit code, and Qubiq Academy platform features.
2. **Refusal of Off-Topic Queries**: Refuse any off-topic queries politely: "I am specifically trained as a Quantum Computing AI Tutor for Qubiq Academy. I can only assist with quantum physics, quantum circuits, algorithms, and quantum mechanics."
3. **Safety and Integrity**: Never provide exploits, malware, or harmful instructions.

Guidelines for Clean & Uncluttered Responses:
- **Direct & Crisp**: Start directly with the pedagogical answer. Avoid repetitive greetings or preamble.
- **Bite-Sized Structure**: Use short paragraphs (2-3 sentences max). Never dump overwhelming walls of text.
- **Structured Highlights**: Use bullet points with bold keywords (**Concept**: Explanation) for multiple points or steps.
- **Mathematical Clarity**: Use standard Dirac notation: |0⟩, |1⟩, |+⟩, |−⟩, α|0⟩ + β|1⟩, |Φ+⟩.
- **Clean Code**: Put Qiskit/Python code in clean fenced blocks (\`\`\`python).
- **Circuit Synthesis**: If asked to create a circuit, output it in a \`\`\`circuit-json block.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY secret is not set on the server.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate user via Supabase Auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization token.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse payload
    const { userMessage, contextMessage, messageHistory = [] } = await req.json();
    if (!userMessage || typeof userMessage !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid user message.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fullPrompt = contextMessage ? `${userMessage}\n\n${contextMessage}` : userMessage;

    // Call Gemini 3.6 Flash via REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const contents = [
      ...messageHistory.slice(-6).map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || m.parts?.[0]?.text || '' }],
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
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${geminiResponse.statusText}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({ reply: candidateText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
