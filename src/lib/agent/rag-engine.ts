/**
 * RAG Engine — BotanIA Agent
 *
 * Retrieval Augmented Generation:
 * 1. Embed user question
 * 2. Search Qdrant across collections
 * 3. Build context from results
 * 4. Generate answer via Ollama
 */

import { generateEmbedding } from './ollama';
import { search, searchMulti } from './qdrant';
import { LIA_PERSONA, buildGameStateContext, SYSTEM_PARTS, type GameStateSnapshot } from './persona';
import { simpleChat } from './ollama';
import { useAgentStore, type AgentSuggestion } from '@/store/agent-store';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RAGQueryOptions {
  collections?: string[];
  limit?: number;
  scoreThreshold?: number;
}

export interface RAGResult {
  answer: string;
  sources: RAGSource[];
  suggestions: string[];
  alerts: string[];
  engine: 'ollama-qdrant';
}

export interface RAGSource {
  collection: string;
  id: string;
  score: number;
  payload: Record<string, unknown>;
  snippet: string;
}

// ─── RAG Collections to search ────────────────────────────────────────────────

const DEFAULT_COLLECTIONS = [
  'botania_components',
  'botania_data',
  'botania_docs',
  'botania_memory',
];

// ─── Parse action from answer ─────────────────────────────────────────────────

function parseActionsFromAnswer(answer: string): { suggestions: string[]; alerts: string[] } {
  const suggestions: string[] = [];
  const alerts: string[] = [];

  const actionRegex = /\[ACTION: (NOTIFY|SUGGEST|ALERT|REMIND)\]\s*\[Message: ([^\]]+)\]/gi;
  let match;

  while ((match = actionRegex.exec(answer)) !== null) {
    const [, action, message] = match;
    const entry = message.trim();

    if (action === 'SUGGEST' || action === 'REMIND') {
      suggestions.push(entry);
    } else if (action === 'NOTIFY' || action === 'ALERT') {
      alerts.push(entry);
    }
  }

  return { suggestions, alerts };
}

// ─── Format Qdrant results as context ────────────────────────────────────────

function formatResultsAsContext(results: Map<string, { id: string; score: number; payload: Record<string, unknown>; }[]>): string {
  const sections: string[] = [];

  for (const [collection, hits] of results) {
    if (hits.length === 0) continue;

    const collectionLabel = {
      botania_components: '📁 CODE BOTANIA',
      botania_data: '🌱 DONNÉES BOTANIQUES',
      botania_docs: '📄 DOCUMENTATION',
      botania_memory: '🧠 MÉMOIRE UTILISATEUR',
      botania_game_state: '🎮 ÉTAT DU JEU',
    }[collection] || collection;

    sections.push(`\n### ${collectionLabel}\n`);

    for (const hit of hits) {
      const purpose = hit.payload.purpose as string || '';
      const name = hit.payload.name as string || hit.id;
      const score = (hit.score * 100).toFixed(0);

      sections.push(`\n**[${name}]** (${score}% pertinent)`);

      if (purpose) sections.push(purpose);

      // Add function exports if available
      const exports = hit.payload.exports as string[] | undefined;
      if (exports && exports.length > 0) {
        sections.push(`Fonctions: ${exports.slice(0, 10).join(', ')}`);
      }

      // Add tabs if available
      const tabs = hit.payload.tabs as string[] | undefined;
      if (tabs && tabs.length > 0) {
        sections.push(`Onglets: ${tabs.join(', ')}`);
      }

      // Add detail if available
      const detail = hit.payload.detail as string | undefined;
      if (detail) sections.push(detail);
    }
  }

  return sections.join('\n');
}

// ─── Main RAG Query ─────────────────────────────────────────────────────────

/**
 * Process a user question through the RAG pipeline
 */
export async function ragQuery(
  userMessage: string,
  gameContext: Record<string, unknown>,
  options: RAGQueryOptions = {}
): Promise<RAGResult> {
  const collections = options.collections || DEFAULT_COLLECTIONS;
  const limit = options.limit || 8;
  const scoreThreshold = options.scoreThreshold || 0.5;

  // 1. Generate embedding for the question (with fallback if Ollama embeddings unavailable)
  let questionEmbedding: number[] | null = null;
  let contextText = '';
  let results: Map<string, { id: string; score: number; payload: Record<string, unknown>; }[]> = new Map();
  try {
    questionEmbedding = await generateEmbedding(userMessage);
    // 2. Search Qdrant across collections
    results = await searchMulti(collections, questionEmbedding, limit);
    // 3. Build context from results
    contextText = formatResultsAsContext(results);
  } catch (embedErr) {
    console.warn('[RAG] Embeddings unavailable, falling back to simple chat:', embedErr);
  }

  // 4. Build game state context
  const gameState = gameContext as unknown as GameStateSnapshot;
  const gameStateText = buildGameStateContext(gameState);

  // 5. Determine query type for targeted system prompt
  const queryType = detectQueryType(userMessage);

  // 6. Select appropriate system prompt part
  const systemPromptPart = SYSTEM_PARTS[queryType] || SYSTEM_PARTS.RAG_ANSWER;

  // 7. Build full context prompt
  const contextPrompt = `
=== CONTEXTE BOTANIA ===
${gameStateText}

${contextText}
=== FIN CONTEXTE ===

${systemPromptPart}
`.trim();

  // 8. Generate answer via Ollama (with 30s timeout)
  let answer: string;
  try {
    answer = await Promise.race([
      simpleChat(LIA_PERSONA, userMessage, contextPrompt, { temperature: 0.4, numPredict: 600 }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('chat-timeout')), 30000)),
    ]);
  } catch (e) {
    console.warn('[RAG] Chat timeout or error, using fallback:', e);
    answer = "Je rencontre des difficultés à me connecter à Ollama. Peux-tu réessayer dans quelques secondes ?";
  }

  // 9. Parse any actions from the answer
  const { suggestions, alerts } = parseActionsFromAnswer(answer);

  // 10. Add suggestions to agent store
  if (suggestions.length > 0) {
    const store = useAgentStore.getState();
    suggestions.forEach(sug => {
      store.addSuggestion({
        category: detectCategory(sug),
        title: sug.slice(0, 50),
        description: sug,
        priority: 'medium',
      });
    });
  }

  // 11. Build source list
  const sources: RAGSource[] = [];
  for (const [collection, hits] of results) {
    for (const hit of hits) {
      sources.push({
        collection,
        id: hit.id,
        score: hit.score,
        payload: hit.payload,
        snippet: (hit.payload.purpose as string) || '',
      });
    }
  }

  return {
    answer,
    sources: sources.slice(0, 10),
    suggestions,
    alerts,
    engine: 'ollama-qdrant',
  };
}

/**
 * Detect the type of query to use appropriate system prompt
 */
function detectQueryType(question: string): keyof typeof SYSTEM_PARTS {
  const q = question.toLowerCase();

  if (q.includes('pourquoi') || q.includes('jaun') || q.includes('malad') || q.includes('tache') || q.includes('flétr')) {
    return 'PLANT_DOCTOR';
  }
  if (q.includes('explique') || q.includes('comment') || q.includes('code') || q.includes('fonction')) {
    return 'CODE_EXPLAINER';
  }
  if (q.includes('prochain') || q.includes('sem') || q.includes('rappele') || q.includes('calendrier') || q.includes('lune')) {
    return 'PROACTIVE_ALERT';
  }

  return 'RAG_ANSWER';
}

/**
 * Detect suggestion category from text
 */
function detectCategory(text: string): AgentSuggestion['category'] {
  const t = text.toLowerCase();
  if (t.includes('eau') || t.includes('arros')) return 'water';
  if (t.includes('malad') || t.includes('traitement')) return 'disease';
  if (t.includes('récolt')) return 'harvest';
  if (t.includes('graine') || t.includes('achet')) return 'purchase';
  if (t.includes('lune') || t.includes('calendrier') || t.includes('sem')) return 'calendar';
  return 'plant';
}
