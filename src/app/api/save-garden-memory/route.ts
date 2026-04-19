import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { memoryRateLimiter } from '@/lib/rate-limiter';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'garden-memory');

// ─── Path sanitization ─────────────────────────────────────────────────────────

function sanitizeFilename(filename: string): string {
  // Ne garder que les caractères alphanumériques, tirets et underscores
  // et limiter la longueur
  const sanitized = filename.replace(/[^a-zA-Z0-9_\-. ]/g, '');
  // Empêcher les paths traversant des répertoires
  const basename = path.basename(sanitized);
  // Limiter à 64 caractères
  return basename.slice(0, 64);
}

function isPathSafe(filePath: string, baseDir: string): boolean {
  const resolved = path.resolve(baseDir, filePath);
  return resolved.startsWith(baseDir);
}

// ─── Route handlers ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimit = memoryRateLimiter.check(req);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Trop de requêtes',
        retryAfter: rateLimit.retryAfter,
        message: `Rate limit atteint. Réessayez dans ${rateLimit.retryAfter}s.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  }

  try {
    const { filePath, content } = await req.json();

    // Validation des entrées
    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'filePath manquant' }, { status: 400 });
    }
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content manquant' }, { status: 400 });
    }

    // Limiter la taille du contenu (max 1MB)
    if (content.length > 1024 * 1024) {
      return NextResponse.json({ error: 'Contenu trop volumineux (max 1MB)' }, { status: 400 });
    }

    // Extraire et sanitizer le filename
    const filename = sanitizeFilename(filePath);
    if (!filename || filename.length < 3) {
      return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 });
    }

    // Vérifier que le path reste dans MEMORY_DIR (path traversal)
    const fullPath = path.join(MEMORY_DIR, filename);
    if (!isPathSafe(fullPath, MEMORY_DIR)) {
      console.error(`[save-garden-memory] Path traversal attempt: ${filePath}`);
      return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 });
    }

    // Ensure directory exists
    if (!existsSync(MEMORY_DIR)) {
      await mkdir(MEMORY_DIR, { recursive: true });
    }

    await writeFile(fullPath, content, 'utf-8');
    return NextResponse.json({
      success: true,
      path: fullPath,
      filename,
      savedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[save-garden-memory] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
