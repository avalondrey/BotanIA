/**
 * GET /api/agent/status
 * Returns Ollama + Qdrant availability status
 */

import { NextResponse } from 'next/server';
import { isQdrantAvailable } from '@/lib/agent/qdrant';
import { getOllamaStatus } from '@/lib/agent/ollama';

export async function GET() {
  const start = Date.now();

  const [ollamaStatus, qdrantOk] = await Promise.all([
    getOllamaStatus().catch(() => ({ available: false, models: [], defaultModel: 'qwen2.5:7b' })),
    isQdrantAvailable().catch(() => false),
  ]);

  const responseTime = Date.now() - start;

  return NextResponse.json({
    ollama: {
      available: ollamaStatus.available,
      models: ollamaStatus.models,
      defaultModel: ollamaStatus.defaultModel,
      url: process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434',
    },
    qdrant: {
      available: qdrantOk,
      url: process.env.NEXT_PUBLIC_QDRANT_URL || 'http://localhost:6333',
    },
    responseTime,
    timestamp: Date.now(),
  });
}
