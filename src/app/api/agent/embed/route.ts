/**
 * POST /api/agent/embed
 * Proxy embeddings vers le microservice AI
 */
import { NextRequest, NextResponse } from 'next/server';
import { microEmbed } from '@/lib/agent/micro-client';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'text manquant' }, { status: 400 });
    }

    const result = await microEmbed(text);

    return NextResponse.json({ embedding: result.embedding });
  } catch (err: any) {
    console.error('[agent/embed] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
