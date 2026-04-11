/**
 * GET /api/agent/status
 * Vérifie le microservice AI (via Tailscale)
 */
import { NextResponse } from 'next/server';
import { checkMicroHealth } from '@/lib/agent/micro-client';

export async function GET() {
  const microHealth = await checkMicroHealth();

  if (!microHealth) {
    return NextResponse.json({
      ollama: { available: false, reason: 'Microservice non configuré' },
      qdrant: { available: false, reason: 'Microservice non configuré' },
      micro: { available: false },
      timestamp: Date.now(),
    });
  }

  return NextResponse.json({
    ollama: {
      available: microHealth.ollama.available,
      model: microHealth.ollama.model,
      latencyMs: microHealth.ollama.latencyMs,
    },
    qdrant: {
      available: microHealth.qdrant.available,
      collections: microHealth.qdrant.collections,
      latencyMs: microHealth.qdrant.latencyMs,
    },
    micro: { available: true },
    status: microHealth.status,
    timestamp: microHealth.timestamp,
  });
}
