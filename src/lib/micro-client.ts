/**
 * AI Microservice Client — BotanIA
 *
 * Client pour appeler le microservice AI (sur ton PC).
 * Remplace les appels directs à Ollama/Qdrant et les routes proxy /api/agent/*.
 *
 * Sécurité :
 * - Header X-Botania-Version sur chaque requête
 * - Signature HMAC (X-Botania-Signature) si NEXT_PUBLIC_AI_MICROSERVICE_SECRET est défini
 * - Circuit breaker : 3 échecs consécutifs = pause 30s
 *
 * ⚠️ Le secret est exposé côté client (NEXT_PUBLIC_). Il sert de token partagé,
 *    pas d'authentification forte. Pour une vraie sécurité, passez par une
 *    Server Action ou API route intermédiaire.
 */

const _MICRO_URL = process.env.NEXT_PUBLIC_AI_MICROSERVICE_URL || '';
const MICRO_URL = _MICRO_URL.replace(/\/$/, '');
const MICRO_SECRET = process.env.NEXT_PUBLIC_AI_MICROSERVICE_SECRET || '';
export const BOTANIA_VERSION = '2.2.0';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MicroHealth {
  status: 'ok' | 'degraded' | 'error';
  ollama: { available: boolean; model?: string; latencyMs?: number; error?: string };
  qdrant: { available: boolean; collections?: number; latencyMs?: number; error?: string };
  timestamp: number;
}

export interface MicroChatRequest {
  message: string;
  systemPrompt?: string;
  contextPrompt?: string;
  gameContext?: Record<string, unknown>;
  options?: { temperature?: number; numPredict?: number };
  stream?: boolean;
}

export interface MicroChatResponse {
  answer: string;
  engine: string;
}

export interface MicroRAGRequest {
  question: string;
  gameContext: Record<string, unknown>;
  collections?: string[];
  limit?: number;
  scoreThreshold?: number;
}

export interface MicroRAGResponse {
  answer: string;
  sources: unknown[];
  suggestions: string[];
  alerts: string[];
  engine: string;
}

export interface MicroScanRequest {
  gameContext: Record<string, unknown>;
  snapshot?: boolean;
}

export interface MicroScanResponse {
  notifications: Array<{ id: string; type: string; title: string; message: string; priority: string }>;
  suggestions: Array<{ id: string; category: string; title: string; description: string; reasoning?: string; priority: string }>;
  timestamp: number;
}

// ─── Circuit Breaker ───────────────────────────────────────────────────────────

type CircuitState = 'closed' | 'open' | 'half-open';

let circuitState: CircuitState = 'closed';
let failureCount = 0;
let nextRetry = 0;
const FAILURE_THRESHOLD = 3;
const OPEN_TIMEOUT_MS = 30_000;

function recordSuccess() {
  failureCount = 0;
  circuitState = 'closed';
}

function recordFailure(): boolean {
  failureCount++;
  if (failureCount >= FAILURE_THRESHOLD) {
    circuitState = 'open';
    nextRetry = Date.now() + OPEN_TIMEOUT_MS;
    return true;
  }
  return false;
}

function canCall(): boolean {
  if (circuitState === 'closed') return true;
  if (circuitState === 'open') {
    if (Date.now() >= nextRetry) {
      circuitState = 'half-open';
      return true;
    }
    return false;
  }
  return true; // half-open
}

// ─── HMAC Signature ────────────────────────────────────────────────────────────

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function buildHeaders(body: unknown): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Botania-Version': BOTANIA_VERSION,
  };

  if (MICRO_SECRET) {
    const payload = JSON.stringify(body);
    try {
      const signature = await hmacSign(payload, MICRO_SECRET);
      headers['X-Botania-Signature'] = signature;
    } catch {
      // si SubtleCrypto échoue, on envoie sans signature
    }
  }

  return headers;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function microFetch<T>(path: string, body: unknown): Promise<T> {
  if (!MICRO_URL) {
    throw new Error('NEXT_PUBLIC_AI_MICROSERVICE_URL non configuré');
  }

  if (!canCall()) {
    throw new Error('Circuit breaker ouvert — microservice temporairement indisponible');
  }

  const url = `${MICRO_URL}${path}`;
  const headers = await buildHeaders(body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(err.error || `Micro fetch failed: ${response.status}`);
    }

    recordSuccess();
    return response.json();
  } catch (err) {
    const tripped = recordFailure();
    if (tripped) {
      console.warn(`[micro-client] Circuit breaker ouvert après ${FAILURE_THRESHOLD} échecs`);
    }
    throw err;
  }
}

// ─── API Calls ─────────────────────────────────────────────────────────────────

export async function checkMicroHealth(): Promise<MicroHealth | null> {
  if (!MICRO_URL) return null;
  if (!canCall()) return null;

  try {
    const headers: Record<string, string> = { 'X-Botania-Version': BOTANIA_VERSION };
    if (MICRO_SECRET) {
      try {
        headers['X-Botania-Signature'] = await hmacSign('health', MICRO_SECRET);
      } catch { /* ignore */ }
    }

    const res = await fetch(`${MICRO_URL}/health`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      recordFailure();
      return null;
    }
    recordSuccess();
    return res.json();
  } catch {
    recordFailure();
    return null;
  }
}

export function getCircuitState(): CircuitState {
  return circuitState;
}

export async function microChat(req: MicroChatRequest): Promise<MicroChatResponse> {
  return microFetch<MicroChatResponse>('/chat', req);
}

export async function microEmbed(text: string): Promise<{ embedding: number[] }> {
  return microFetch<{ embedding: number[] }>('/embed', { text });
}

export async function microRAG(req: MicroRAGRequest): Promise<MicroRAGResponse> {
  return microFetch<MicroRAGResponse>('/rag', req);
}

export async function microScan(req: MicroScanRequest): Promise<MicroScanResponse> {
  return microFetch<MicroScanResponse>('/scan', req);
}

export async function microMemoryAdd(entry: {
  type: string;
  content: string;
  plantDefId?: string;
  gardenZone?: string;
  tags?: string[];
}): Promise<{ success: boolean; entry: unknown }> {
  return microFetch('/memory/add', entry);
}

export async function microMemorySearch(query: string, limit?: number): Promise<{ results: unknown[]; count: number }> {
  return microFetch('/memory/search', { query, limit });
}
