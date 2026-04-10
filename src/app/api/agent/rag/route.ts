/**
 * POST /api/agent/rag
 * DISABLED for Vercel — requires local Ollama+Qdrant
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    error: 'Agent RAG disabled for Vercel (requires local Ollama+Qdrant)',
    timestamp: Date.now(),
  }, { status: 503 });
}
