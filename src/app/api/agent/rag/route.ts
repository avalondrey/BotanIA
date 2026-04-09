/**
 * POST /api/agent/rag
 * RAG query: embed question → search Qdrant → generate Ollama → response
 */

import { NextRequest, NextResponse } from 'next/server';
import { ragQuery } from '@/lib/agent/rag-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, gameContext, collections, limit } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const result = await ragQuery(question, gameContext || {}, { collections, limit });

    return NextResponse.json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('[Agent/RAG] Error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
