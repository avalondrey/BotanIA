/**
 * Memory Manager — BotanIA Agent
 *
 * Manages botania_memory collection in Qdrant:
 * - User observations (plants, diseases, treatments)
 * - Decisions (why something was planted where)
 * - Flashcards / notes
 * - Journal entries
 *
 * All entries are stored with embeddings for semantic RAG search.
 */

import { generateEmbedding } from './ollama';
import { upsertPoint, search, deletePoint } from './qdrant';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  type: 'observation' | 'decision' | 'flashcard' | 'journal' | 'treatment' | 'note';
  content: string;
  date: number;
  plantDefId?: string;
  gardenZone?: string;
  tags: string[];
  context: Record<string, unknown>;
}

/**
 * Add a memory entry (observation, decision, etc.)
 */
export async function addMemory(entry: Omit<MemoryEntry, 'id'>): Promise<MemoryEntry> {
  const id = `memory-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const fullEntry: MemoryEntry = {
    ...entry,
    id,
  };

  const searchableText = buildSearchableText(fullEntry);
  const vector = await generateEmbedding(searchableText);

  await upsertPoint('botania_memory', id, vector, {
    ...fullEntry,
    _createdAt: Date.now(),
  });

  return fullEntry;
}

/**
 * Add an observation about a plant
 */
export async function addPlantObservation(
  plantDefId: string,
  content: string,
  gardenZone?: string,
  extra: Record<string, unknown> = {}
): Promise<MemoryEntry> {
  return addMemory({
    type: 'observation',
    content,
    date: Date.now(),
    plantDefId,
    gardenZone,
    tags: [plantDefId, 'observation'],
    context: extra,
  });
}

/**
 * Add a decision (e.g., why a plant was placed in a specific zone)
 */
export async function addDecision(
  content: string,
  plantDefId?: string,
  gardenZone?: string
): Promise<MemoryEntry> {
  return addMemory({
    type: 'decision',
    content,
    date: Date.now(),
    plantDefId,
    gardenZone,
    tags: ['decision', plantDefId || 'general'],
    context: {},
  });
}

/**
 * Add a treatment record (what was applied, when, result)
 */
export async function addTreatment(
  plantDefId: string,
  treatment: string,
  result: string,
  gardenZone?: string
): Promise<MemoryEntry> {
  return addMemory({
    type: 'treatment',
    content: `Traitement: ${treatment}. Résultat: ${result}`,
    date: Date.now(),
    plantDefId,
    gardenZone,
    tags: ['traitement', plantDefId, 'sante'],
    context: { treatment, result },
  });
}

/**
 * Add a flashcard / note (for learning)
 */
export async function addFlashcard(content: string, tags: string[] = []): Promise<MemoryEntry> {
  return addMemory({
    type: 'flashcard',
    content,
    date: Date.now(),
    tags: ['flashcard', ...tags],
    context: {},
  });
}

/**
 * Search memories by content similarity
 */
export async function searchMemories(
  query: string,
  limit: number = 10,
  filters?: { plantDefId?: string; type?: string; gardenZone?: string }
): Promise<MemoryEntry[]> {
  const queryVector = await generateEmbedding(query);

  const filterObj: Record<string, unknown> = {};
  if (filters?.plantDefId) filterObj.plantDefId = filters.plantDefId;
  if (filters?.type) filterObj.type = filters.type;
  if (filters?.gardenZone) filterObj.gardenZone = filters.gardenZone;

  const results = await search(
    'botania_memory',
    queryVector,
    limit,
    Object.keys(filterObj).length > 0 ? filterObj : undefined,
    0.3 // minimum similarity score
  );

  return results.map((r) => ({
    id: r.id,
    type: (r.payload.type as MemoryEntry['type']) || 'note',
    content: (r.payload.content as string) || '',
    date: (r.payload.date as number) || 0,
    plantDefId: r.payload.plantDefId as string | undefined,
    gardenZone: r.payload.gardenZone as string | undefined,
    tags: (r.payload.tags as string[]) || [],
    context: (r.payload.context as Record<string, unknown>) || {},
  }));
}

/**
 * Get all memories about a specific plant
 */
export async function getPlantMemories(plantDefId: string): Promise<MemoryEntry[]> {
  return searchMemories(plantDefId, 20, { plantDefId });
}

/**
 * Delete a memory
 */
export async function deleteMemory(id: string): Promise<void> {
  await deletePoint('botania_memory', id);
}

/**
 * Build searchable text from memory entry
 */
function buildSearchableText(e: MemoryEntry): string {
  const parts: string[] = [];

  parts.push(e.type.toUpperCase());
  parts.push(e.content);
  if (e.plantDefId) parts.push(`Plante: ${e.plantDefId}`);
  if (e.gardenZone) parts.push(`Zone: ${e.gardenZone}`);
  parts.push(...e.tags);
  parts.push(new Date(e.date).toLocaleDateString('fr-FR'));

  return parts.join('\n');
}
