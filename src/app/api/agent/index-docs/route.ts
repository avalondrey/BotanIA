/**
 * POST /api/agent/index-docs
 * DISABLED for Vercel — requires local Ollama+Qdrant
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Agent index-docs disabled for Vercel (requires local Ollama+Qdrant)',
    timestamp: Date.now(),
  }, { status: 503 });
}

export async function GET() {
  return NextResponse.json({
    disabled: true,
    message: 'Agent index-docs requires local Ollama+Qdrant — disabled on Vercel',
    timestamp: Date.now(),
  });
}
