/**
 * AI Microservice Client — BotanIA
 *
 * Client pour appeler le microservice AI (sur ton PC).
 * Remplace les appels directs à Ollama/Qdrant.
 */

const MICRO_URL = process.env.NEXT_PUBLIC_AI_MICROSERVICE_URL || '';

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

// ─── Helper ───────────────────────────────────────────────────────────────────

async function microFetch<T>(path: string, body: unknown): Promise<T> {
  if (!MICRO_URL) {
    throw new Error('NEXT_PUBLIC_AI_MICROSERVICE_URL non configuré');
  }

  const url = `${MICRO_URL}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `Micro fetch failed: ${response.status}`);
  }

  return response.json();
}

// ─── API Calls ─────────────────────────────────────────────────────────────────

export async function checkMicroHealth(): Promise<MicroHealth | null> {
  if (!MICRO_URL) return null;
  try {
    const res = await fetch(`${MICRO_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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
