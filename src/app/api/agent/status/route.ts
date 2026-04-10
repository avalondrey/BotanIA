/**
 * GET /api/agent/status
 * Returns Ollama + Qdrant availability status with collection counts
 */

import { NextResponse } from 'next/server';
import { isQdrantAvailable, getCollectionInfo } from '@/lib/agent/qdrant';
import { getOllamaStatus } from '@/lib/agent/ollama';

const COLLECTIONS = [
  'botania_components',
  'botania_data',
  'botania_docs',
  'botania_memory',
  'botania_game_state',
];

export async function GET() {
  const start = Date.now();

  const [ollamaStatus, qdrantOk] = await Promise.all([
    getOllamaStatus().catch(() => ({ available: false, models: [], defaultModel: 'qwen2.5:7b' })),
    isQdrantAvailable().catch(() => false),
  ]);

  // Get collection counts if Qdrant is available
  const collections: Record<string, { count: number; status: string }> = {};
  if (qdrantOk) {
    await Promise.all(
      COLLECTIONS.map(async (col) => {
        try {
          const info = await getCollectionInfo(col);
          collections[col] = info;
        } catch {
          collections[col] = { count: 0, status: 'unknown' };
        }
      })
    );
  }

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
      collections,
    },
    responseTime,
    timestamp: Date.now(),
  });
}
