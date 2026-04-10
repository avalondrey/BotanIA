/**
 * POST /api/agent/chat
 * Proxy chat Ollama — évite les problèmes CORS
 */
import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_CHAT_MODEL || process.env.OLLAMA_MODEL || 'llama3.2';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model, options } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages manquants' }, { status: 400 });
    }

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.3,
          num_predict: options?.num_predict ?? 800,
          ...options,
        },
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => `HTTP ${response.status}`);
      return NextResponse.json({ error: `Ollama chat failed: ${response.status}`, detail: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError';
    return NextResponse.json(
      { error: isTimeout ? 'Timeout (120s)' : err?.message || 'Erreur serveur' },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
