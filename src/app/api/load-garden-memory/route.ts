import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { memoryRateLimiter } from '@/lib/rate-limiter';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'garden-memory');

function sanitizePlantId(id: string): string {
  // Alphanumeric and hyphens only, max 64 chars
  return id.replace(/[^a-zA-Z0-9\-]/g, '').slice(0, 64);
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimit = memoryRateLimiter.check(req);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit atteint', retryAfter: rateLimit.retryAfter },
      { status: 429 }
    );
  }

  let rawPlantId: string | null = null;
  let plantId: string | null = null;

  try {
    const { searchParams } = new URL(req.url);
    rawPlantId = searchParams.get('plantId');

    if (!rawPlantId) {
      return NextResponse.json({ error: 'plantId requis' }, { status: 400 });
    }

    plantId = sanitizePlantId(rawPlantId);
    if (!plantId || plantId.length < 2) {
      return NextResponse.json({ error: 'plantId invalide' }, { status: 400 });
    }

    const filePath = path.join(MEMORY_DIR, `${plantId}.md`);
    // Ensure path stays within MEMORY_DIR
    if (!filePath.startsWith(MEMORY_DIR)) {
      console.error(`[load-garden-memory] Path traversal attempt: ${rawPlantId}`);
      return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 });
    }

    const content = await readFile(filePath, 'utf-8');
    return NextResponse.json({
      content,
      plantId,
      rateLimit: { remaining: rateLimit.remaining },
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ content: null, plantId: plantId ?? rawPlantId, notFound: true }, { status: 200 });
    }
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[load-garden-memory] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
