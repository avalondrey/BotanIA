/**
 * Qdrant REST Client — BotanIA Agent
 * No SDK, pure fetch to localhost:6333
 *
 * Collections:
 *   - botania_components  (code BotanIA parsed)
 *   - botania_data        (graines, arbres, encyclopedia)
 *   - botania_docs        (markdown files)
 *   - botania_memory      (user observations, decisions)
 *   - botania_game_state  (game state snapshots)
 */

const QDRANT_URL = process.env.NEXT_PUBLIC_QDRANT_URL || 'http://localhost:6333';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QdrantVector {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface QdrantSearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export interface QdrantCollection {
  name: string;
  vectors_count: number;
  points_count: number;
  status: string;
  payload_schema: Record<string, unknown>;
}

export interface CollectionConfig {
  name: string;
  vectorSize: number;
  distance: 'Cosine' | 'Euclidean' | 'Dot';
}

// ─── Embedding Generation via Ollama ──────────────────────────────────────────

/**
 * Generate embedding for a text using Ollama's embedding endpoint
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}

// ─── Collection Management ────────────────────────────────────────────────────

const COLLECTIONS: CollectionConfig[] = [
  { name: 'botania_components', vectorSize: 768, distance: 'Cosine' },
  { name: 'botania_data', vectorSize: 768, distance: 'Cosine' },
  { name: 'botania_docs', vectorSize: 768, distance: 'Cosine' },
  { name: 'botania_memory', vectorSize: 768, distance: 'Cosine' },
  { name: 'botania_game_state', vectorSize: 768, distance: 'Cosine' },
];

/**
 * Ensure all collections exist, create if missing
 */
export async function ensureCollections(): Promise<void> {
  for (const config of COLLECTIONS) {
    const exists = await collectionExists(config.name);
    if (!exists) {
      await createCollection(config);
      console.log(`[Qdrant] Created collection: ${config.name}`);
    }
  }
}

/**
 * Check if a collection exists
 */
export async function collectionExists(name: string): Promise<boolean> {
  try {
    const response = await fetch(`${QDRANT_URL}/collections/${name}`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Create a collection with given config
 */
export async function createCollection(config: CollectionConfig): Promise<void> {
  const response = await fetch(`${QDRANT_URL}/collections/${config.name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vectors: {
        size: config.vectorSize,
        distance: config.distance,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create collection ${config.name}: ${error}`);
  }
}

/**
 * List all collections
 */
export async function listCollections(): Promise<QdrantCollection[]> {
  const response = await fetch(`${QDRANT_URL}/collections`);
  if (!response.ok) throw new Error(`Qdrant list failed: ${response.statusText}`);
  const data = await response.json();
  return data.collections;
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

/**
 * Upsert (insert or update) a point in a collection
 */
export async function upsertPoint(
  collectionName: string,
  id: string | number,
  vector: number[],
  payload: Record<string, unknown>
): Promise<void> {
  const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      points: [
        {
          id,
          vector,
          payload: {
            ...payload,
            _updatedAt: Date.now(),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qdrant upsert failed: ${error}`);
  }
}

/**
 * Search for similar points in a collection
 */
export async function search(
  collectionName: string,
  queryVector: number[],
  limit: number = 5,
  filter?: Record<string, unknown>,
  scoreThreshold?: number
): Promise<QdrantSearchResult[]> {
  const body: Record<string, unknown> = {
    vector: queryVector,
    limit,
    with_payload: true,
  };

  if (filter) {
    body.filter = filter;
  }

  if (scoreThreshold !== undefined) {
    body.score_threshold = scoreThreshold;
  }

  const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qdrant search failed: ${error}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Search across multiple collections at once
 */
export async function searchMulti(
  collections: string[],
  queryVector: number[],
  limit: number = 5
): Promise<Map<string, QdrantSearchResult[]>> {
  const results = new Map<string, QdrantSearchResult[]>();

  await Promise.all(
    collections.map(async (col) => {
      const r = await search(col, queryVector, limit);
      results.set(col, r);
    })
  );

  return results;
}

/**
 * Retrieve a specific point by ID
 */
export async function getPoint(
  collectionName: string,
  id: string
): Promise<QdrantSearchResult | null> {
  const response = await fetch(
    `${QDRANT_URL}/collections/${collectionName}/points/${id}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Qdrant get failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.payload ? { id, score: 1, payload: data.payload } : null;
}

/**
 * Delete a specific point by ID
 */
export async function deletePoint(collectionName: string, id: string): Promise<void> {
  const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points: [id] }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qdrant delete failed: ${error}`);
  }
}

/**
 * Delete all points matching a filter
 */
export async function deleteByFilter(
  collectionName: string,
  filter: Record<string, unknown>
): Promise<void> {
  const response = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filter }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qdrant deleteByFilter failed: ${error}`);
  }
}

/**
 * Get collection info (count, status)
 */
export async function getCollectionInfo(
  collectionName: string
): Promise<{ count: number; status: string }> {
  const response = await fetch(`${QDRANT_URL}/collections/${collectionName}`);
  if (!response.ok) throw new Error(`Qdrant info failed: ${response.statusText}`);
  const data = await response.json();
  return {
    count: data.result?.points_count ?? 0,
    status: data.result?.status ?? 'unknown',
  };
}

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * Check if Qdrant is reachable
 */
export async function isQdrantAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${QDRANT_URL}/`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}
