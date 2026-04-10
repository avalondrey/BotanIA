/**
 * POST /api/agent/scan
 * DISABLED for Vercel — requires local Ollama+Qdrant
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Agent scan disabled for Vercel (requires local Ollama+Qdrant)',
    timestamp: Date.now(),
  }, { status: 503 });
}

export async function GET() {
  return NextResponse.json({
    disabled: true,
    message: 'Agent scan requires local Ollama+Qdrant — disabled on Vercel',
    timestamp: Date.now(),
  });
}
