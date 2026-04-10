/**
 * GET /api/agent/status
 * DISABLED for Vercel — requires local Ollama+Qdrant
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ollama: { available: false, reason: 'disabled on Vercel' },
    qdrant: { available: false, reason: 'disabled on Vercel' },
    disabled: true,
    timestamp: Date.now(),
  });
}
