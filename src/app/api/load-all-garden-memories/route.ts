import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { memoryRateLimiter } from '@/lib/rate-limiter';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'garden-memory');
const MAX_FILES = 1000; // Safety limit

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimit = memoryRateLimiter.check(req);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Trop de requêtes',
        retryAfter: rateLimit.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  }

  try {
    let files: string[] = [];
    try {
      files = await readdir(MEMORY_DIR);
    } catch (err) {
      // Directory doesn't exist yet — return empty
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ files: [] });
      }
      throw err;
    }

    const mdFiles = files.filter(f => f.endsWith('.md')).slice(0, MAX_FILES);

    if (mdFiles.length === 0) {
      return NextResponse.json({ files: [] });
    }

    const results = await Promise.all(
      mdFiles.map(async (file) => {
        try {
          const content = await readFile(path.join(MEMORY_DIR, file), 'utf-8');
          const plantId = file.replace(/\.md$/, '');
          return { plantId, content };
        } catch {
          // Skip unreadable files
          return null;
        }
      })
    );

    const validResults = results.filter((r): r is { plantId: string; content: string } => r !== null);

    return NextResponse.json({
      files: validResults,
      count: validResults.length,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[load-all-garden-memories] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
