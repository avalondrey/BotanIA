/**
 * POST /api/agent/rag
 * RAG query vers le microservice AI
 */
import { NextRequest, NextResponse } from 'next/server';
import { microRAG } from '@/lib/agent/micro-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, gameContext, collections, limit, scoreThreshold } = body;

    if (!question) {
      return NextResponse.json({ error: 'question manquante' }, { status: 400 });
    }

    if (!gameContext) {
      return NextResponse.json({ error: 'gameContext manquant' }, { status: 400 });
    }

    const result = await microRAG({
      question,
      gameContext,
      collections,
      limit,
      scoreThreshold,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[agent/rag] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
