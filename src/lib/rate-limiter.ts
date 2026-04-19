/**
 * Rate Limiter — Limitation de requêtes API
 * ==========================================
 *
 * Utilise un Map en mémoire ( TTL-based )
 * Pour une prod multi-instance, remplacer par Redis.
 *
 * Usage:
 *   import { createRateLimiter } from '@/lib/rate-limiter';
 *
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
 *   // Dans route handler:
 *   const result = limiter.check(req);
 *   if (!result.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Nombre max de requêtes */
  maxRequests: number;
  /** Fenêtre de temps en ms */
  windowMs: number;
  /** Key function (défaut: IP) */
  keyFn?: (req: Request) => string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  /** Secondes avant reset */
  retryAfter?: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

// Cleanup périodique des entrées expirées (toutes les 5 min)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of inMemoryStore.entries()) {
    if (entry.resetAt <= now) {
      inMemoryStore.delete(key);
    }
  }
}

// Démarrer le cleanup en arrière-plan
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpired, CLEANUP_INTERVAL);
}

/**
 * Crée un rate limiter avec configuration
 */
export function resetRateLimiterStore(): void {
  inMemoryStore.clear();
}

export function createRateLimiter(options: RateLimitOptions) {
  const { maxRequests, windowMs, keyFn = defaultKeyFn } = options;

  function check(req: Request): RateLimitResult {
    const key = keyFn(req);
    const now = Date.now();

    let entry = inMemoryStore.get(key);

    if (!entry || entry.resetAt <= now) {
      // Nouvelle fenêtre
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      inMemoryStore.set(key, entry);
      return {
        success: true,
        remaining: maxRequests - 1,
        resetAt: entry.resetAt,
      };
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter,
      };
    }

    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  function reset(req: Request) {
    const key = keyFn(req);
    inMemoryStore.delete(key);
  }

  return { check, reset };
}

function defaultKeyFn(req: Request): string {
  // Utiliser l'IP du X-Forwarded-For ou fallback
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Fallback pour développement local
  return '127.0.0.1';
}

// ─── Preset limiters ────────────────────────────────────────────────────────

/** Limiter pour routes Ollama/Groq (appels AI coûteux) */
export const aiRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 20 req/min
});

/** Limiter pour routes de scan (lourds) */
export const scanRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 5 req/min
});

/** Limiter pour routes de détection (analyse d'images) */
export const detectRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 10 req/min
});

/** Limiter pour routes weather (cacheables) */
export const weatherRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 30 req/min
});

/** Limiter pour routes memory (lecture/écriture) */
export const memoryRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 30 req/min
});

/** Limiter général (fallback) */
export const defaultRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 100 req/min
});

// ─── Helper pour Next.js route ─────────────────────────────────────────────

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
