/**
 * Fallback Chain — Agent IA
 *
 * When local AI mode (Ollama+Qdrant) is not active or unavailable,
 * this module provides seamless fallback to the existing AI implementation.
 *
 * Chain: Ollama+Qdrant → Groq (existing) → Ollama only → static tips
 */

import { useAgentStore } from '@/store/agent-store';
import { getConseilQuotidien } from '@/lib/ia-jardinier';
import { getAdvisorSuggestions } from '@/lib/ai-advisor';
import { generateTip } from '@/lib/lia-data';
import type { AdvisorContext } from '@/lib/ai-advisor';
import type { JardinContext } from '@/lib/ia-jardinier';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FallbackResponse {
  engine: 'ollama-qdrant' | 'groq' | 'ollama-only' | 'static';
  content: string;
  suggestions: string[];
  alerts: string[];
}

/**
 * Determines which AI mode to use and returns appropriate response
 */
export async function getAgentResponse(
  userMessage: string,
  gameContext: Record<string, unknown>
): Promise<FallbackResponse> {
  const store = useAgentStore.getState();
  const { isLocalAIActive, isOllamaAvailable, isQdrantAvailable } = store.status;

  // ─── Mode Super IA Locale ─────────────────────────────────────────────────
  if (isLocalAIActive && isOllamaAvailable && isQdrantAvailable) {
    // Full RAG mode — handled by rag-engine.ts
    try {
      const { ragQuery } = await import('./rag-engine');
      const response = await ragQuery(userMessage, gameContext);
      return {
        engine: 'ollama-qdrant',
        content: response.answer,
        suggestions: response.suggestions,
        alerts: response.alerts,
      };
    } catch (err) {
      console.warn('[Agent] RAG failed, falling back to Groq:', err);
      // Fall through to Groq fallback
    }
  }

  // ─── Fallback: Existing IA (Groq → Ollama → static) ─────────────────────

  try {
    // Build proper JardinContext from game state
    const plainPlants = (gameContext.plants as { plantDefId: string; zone?: string; stage: number; needsWater: boolean }[]) || [];
    const weather = (gameContext.weather as { temperature?: number; condition?: string; precipitation?: number }) || {};

    const jardinContext: JardinContext = {
      plantes: plainPlants.map((p) => ({
        plantDefId: p.plantDefId,
        name: p.plantDefId,
        stage: p.stage,
        daysSincePlanting: 0,
        waterLevel: p.needsWater ? 20 : 80,
        health: 90,
      })),
      meteo: {
        temperature: weather.temperature ?? 20,
        precipitation: weather.precipitation ?? 0,
        conditions: weather.condition || 'ensoleille',
      },
      saison: (gameContext.season as string) || 'printemps',
      jour: (gameContext.day as number) || 1,
    };

    const iaResponse = await getConseilQuotidien(jardinContext);

    // Build AdvisorContext
    const advisorContext: AdvisorContext = {
      day: jardinContext.jour,
      season: jardinContext.saison,
      realWeather: null,
      gardenPlants: plainPlants.map((p) => ({
        plantDefId: p.plantDefId,
        plant: {
          plantDefId: p.plantDefId,
          stage: p.stage,
          waterLevel: p.needsWater ? 20 : 80,
          health: 90,
          growthProgress: 0,
          daysSincePlanting: 0,
          daysInCurrentStage: 0,
          isDead: false,
          needsWater: p.needsWater || false,
          isHarvestable: false,
          comboBonus: 0,
          hasDisease: false,
          hasPest: false,
          diseaseDays: 0,
          pestDays: 0,
          fertilizerBoost: 0,
          fertilizerLevel: 0,
          fruitSetRate: 1,
          diseasePressureHours: 0,
          growthRoute: 'jardin' as const,
          containerType: 'sol-jardin' as const,
        },
        daysSincePlanting: 0,
      })),
      pepinierePlants: [],
      recentAlerts: [],
      coins: 0,
    };

    const advisorSuggestions = getAdvisorSuggestions(advisorContext);

    const suggestions = advisorSuggestions
      .slice(0, 5)
      .map((s) => `${s.type}: ${s.description}`);

    const alerts: string[] = [];

    return {
      engine: 'groq',
      content: iaResponse.conseil || 'Tout va bien dans ton jardin!',
      suggestions,
      alerts,
    };
  } catch {
    // Ultimate fallback: static tips
    const tip = generateTip({
      plants: (gameContext.plants as { plantDefId: string }[]) || [],
      weather: (gameContext.weather as { temperature: number }) || { temperature: 20 },
    });

    return {
      engine: 'static',
      content: tip.message,
      suggestions: [],
      alerts: [],
    };
  }
}

/**
 * Quick status check for the UI
 */
export function getAgentModeLabel(): string {
  const { isLocalAIActive, isOllamaAvailable, isQdrantAvailable } = useAgentStore.getState().status;

  if (!isLocalAIActive) return '🔴 Mode Classique';
  if (!isOllamaAvailable && !isQdrantAvailable) return '🔴 IA Locale Indisponible';
  if (!isOllamaAvailable) return '🟡 Qdrant OK, Ollama Indisponible';
  if (!isQdrantAvailable) return '🟡 Ollama OK, Qdrant Indisponible';
  return '🟢 Super IA Locale Active';
}
