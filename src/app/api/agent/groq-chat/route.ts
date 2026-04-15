/**
 * POST /api/agent/groq-chat
 * Server-side proxy for Groq API — GROQ_API_KEY never leaves the server
 */
import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY non configurée' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { messages, model, temperature, max_tokens } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages requis' }, { status: 400 });
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        temperature: temperature ?? 0.35,
        max_tokens: max_tokens ?? 600,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Groq error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ content, engine: 'groq' });
  } catch (err: any) {
    console.error('[groq-chat] Error:', err);
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}
