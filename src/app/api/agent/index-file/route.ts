/**
 * POST /api/agent/index-file
 * DISABLED for Vercel — requires local Ollama+Qdrant
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Agent index-file disabled for Vercel (requires local Ollama+Qdrant)',
    timestamp: Date.now(),
  }, { status: 503 });
}
