/**
 * POST /api/agent/embed
 * Proxy pour les embeddings Ollama — évite les problèmes CORS côté client
 * Le client browser ne peut pas accéder directement à localhost:11434
 */
import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

export async function POST(req: Request) {
  try {
    const { text, model } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'text manquant' }, { status: 400 });
    }

    const targetModel = model || EMBEDDING_MODEL;

    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: targetModel, prompt: text }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => `HTTP ${response.status}`);
      console.error('[embed proxy] Ollama error:', response.status, err);
      return NextResponse.json(
        { error: `Ollama embedding failed: ${response.status}`, detail: err },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      return NextResponse.json({ error: 'Réponse Ollama invalide' }, { status: 500 });
    }

    return NextResponse.json({ embedding: data.embedding, model: targetModel });
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError' || err?.message?.includes('abort');
    console.error('[embed proxy] Error:', err?.message);
    return NextResponse.json(
      { error: isTimeout ? 'Timeout embedding (15s)' : err?.message || 'Erreur serveur' },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
