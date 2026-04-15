/**
 * useAgent — React hook for Lia interface
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAgentStore, selectUnreadCount, selectCriticalSuggestions } from '@/store/agent-store';
import { getAgentModeLabel } from '@/lib/agent/fallback-chain';
import { useGameStore } from '@/store/game-store';
import { generateTip } from '@/lib/lia-data';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseAgentOptions {
  /** Auto-start proactive scanning when agent is active */
  autoProactive?: boolean;
  /** Interval for proactive scan in ms (default: 60000 = 1 minute) */
  proactiveInterval?: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAgent(options: UseAgentOptions = {}) {
  const { autoProactive = true, proactiveInterval = 60000 } = options;

  const store = useAgentStore();
  const gameStore = useGameStore();
  const proactiveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Send a message to Lia ────────────────────────────────────────────────

  const ask = useCallback(async (question: string) => {
    if (!question.trim()) return;

    store.addMessage({ role: 'user', content: question });
    store.setThinking(true);

    try {
      const gameContext = buildGameContext(gameStore);

      // ── Groq via proxy server-side (pas de RAG — nécessite local Ollama+Qdrant) ──
      try {
        const plants = (gameContext.plants as any[]) || [];
        const ctx = `Jardin: ${plants.length} plantes. Météo: ${gameContext.temperatureCelsius}°C. Saison: ${gameContext.season}. Eau: ${gameContext.waterLiters}L.`;
        const res = await fetch('/api/agent/groq-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: `Tu es Lia, assistante de jardinage bio française. Réponds en 2-3 phrases max, pratique et bienveillant. Contexte: ${ctx}` },
              { role: 'user', content: question },
            ],
            max_tokens: 400,
            temperature: 0.35,
          }),
          signal: AbortSignal.timeout(20000),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.content?.trim() || 'Je ne sais pas.';
          store.addMessage({ role: 'assistant', content: reply, engine: 'groq' });
          return;
        }
      } catch { /* fallback statique */ }

      // ── Fallback statique ──
      const tip = generateTip({ plants: (gameContext.plants as any[]) || [], weather: { temperature: gameContext.temperatureCelsius as number } });
      store.addMessage({ role: 'assistant', content: tip.message, engine: 'fallback' });

    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      store.addMessage({ role: 'assistant', content: `Désolée, j'ai eu un problème: ${error}. Réessaie!`, engine: 'fallback' });
    } finally {
      store.setThinking(false);
    }
  }, [store, gameStore]);

  // ─── Proactive scanning ────────────────────────────────────────────────────

  const runProactiveScan = useCallback(() => {
    if (!store.status.isLocalAIActive) return;

    const gameContext = buildGameContext(gameStore);

    // Check water
    const waterLiters = gameStore.gardenTanks?.[0]?.currentLevel || 0;
    const waterCapacity = gameStore.gardenTanks?.[0]?.capacity || 2000;

    if (waterLiters < waterCapacity * 0.15) {
      store.addNotification({
        type: 'alert',
        title: '💧 Cuve presque vide!',
        message: `Il ne reste que ${waterLiters}L dans ta cuve principale. Arrosage compromis!`,
        priority: 'critical',
      });
    } else if (waterLiters < waterCapacity * 0.3) {
      store.addSuggestion({
        category: 'water',
        title: 'Cuve basse',
        description: `Cuve principale à ${waterLiters}L/${waterCapacity}L. Prévois un remplissage.`,
        priority: 'high',
      });
    }

    // Check plants needing water
    const thirstyPlants = gameStore.gardenPlants?.filter(p => p.plant?.needsWater) || [];
    if (thirstyPlants.length > 0) {
      store.addSuggestion({
        category: 'water',
        title: `${thirstyPlants.length} plantes ont soif`,
        description: `Tes ${thirstyPlants.length} plantes ont besoin d'eau: ${thirstyPlants.map(p => p.plantDefId).join(', ')}`,
        reasoning: 'Dernier arrosage il y a plusieurs jours, sol sec détecté',
        priority: thirstyPlants.length > 5 ? 'critical' : 'high',
      });
    }

    // Check harvestable plants
    const harvestable = gameStore.gardenPlants?.filter(p => p.plant?.isHarvestable) || [];
    if (harvestable.length > 0) {
      store.addSuggestion({
        category: 'harvest',
        title: 'Récoltes prêtes!',
        description: `${harvestable.length} plantes sont prêtes à récolter: ${harvestable.map(p => p.plantDefId).join(', ')}`,
        priority: 'medium',
      });
    }

    // Store scan timestamp
    store.setStatus({ lastProactiveScan: Date.now() });

  }, [store, gameStore]);

  // ─── Auto-start proactive scanning ─────────────────────────────────────────

  useEffect(() => {
    if (!autoProactive || !store.status.isLocalAIActive) return;

    proactiveIntervalRef.current = setInterval(runProactiveScan, proactiveInterval);

    return () => {
      if (proactiveIntervalRef.current) {
        clearInterval(proactiveIntervalRef.current);
      }
    };
  }, [autoProactive, proactiveInterval, runProactiveScan, store.status.isLocalAIActive]);

  // ─── Toggle local AI ───────────────────────────────────────────────────────

  const toggleLocalAI = useCallback(() => {
    store.setLocalAIActive(!store.status.isLocalAIActive);
  }, [store]);

  return {
    // State
    isActive: store.status.isLocalAIActive,
    isThinking: store.isThinking,
    messages: store.messages,
    notifications: store.pendingNotifications,
    pendingSuggestions: store.pendingSuggestions,
    unreadCount: selectUnreadCount(store),
    criticalSuggestions: selectCriticalSuggestions(store),
    modeLabel: getAgentModeLabel(),
    ollamaAvailable: store.status.isOllamaAvailable,
    qdrantAvailable: store.status.isQdrantAvailable,
    indexingProgress: store.status.indexingProgress,

    // Actions
    ask,
    toggleLocalAI,
    dismissNotification: store.dismissNotification,
    dismissSuggestion: store.dismissSuggestion,
    clearMessages: store.clearMessages,
    runProactiveScan,
  };
}

// ─── Build game context from store ─────────────────────────────────────────

function buildGameContext(store: ReturnType<typeof useGameStore.getState>): Record<string, unknown> {
  return {
    day: store.day,
    season: store.season,
    weatherCondition: (store.weather as { type?: string }).type || 'unknown',
    temperatureCelsius: (store.realWeather as { current?: { temperature?: number } } | null)?.current?.temperature ?? 20,
    waterLiters: store.gardenTanks?.[0]?.currentLevel || 0,
    waterCapacity: store.gardenTanks?.[0]?.capacity || 2000,
    waterUrgency: store.gardenTanks?.[0]?.currentLevel
      ? (store.gardenTanks[0].currentLevel < 300 ? 'critique' : store.gardenTanks[0].currentLevel < 600 ? 'urgent' : 'ok')
      : 'ok',
    plants: (store.gardenPlants || []).map(p => ({
      plantDefId: p.plantDefId,
      zone: `(${p.x},${p.y})`,
      stage: p.plant?.stage || 0,
      needsWater: p.plant?.needsWater || false,
      isHarvestable: p.plant?.isHarvestable || false,
    })),
    pendingTasks: [],
    activeAlerts: store.alerts || [],
  };
}
