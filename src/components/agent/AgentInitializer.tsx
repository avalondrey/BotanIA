/**
 * AgentInitializer — Client-side initialization for Super IA via Microservice
 * Checks microservice health instead of local Ollama/Qdrant
 */

'use client';

import { useEffect } from 'react';
import { useAgentStore } from '@/store/agent-store';
import { checkMicroHealth, microScan } from '@/lib/micro-client';
import { useGameStore } from '@/store/game-store';
import { startMicroserviceBridge } from '@/lib/microservice-bridge';

const PROACTIVE_INTERVAL_MS = 45_000;

function abortTimeout(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

function buildGameContext(): Record<string, unknown> {
  const game = useGameStore.getState();
  return {
    day: game.day,
    season: game.season,
    coins: game.coins,
    weather: game.weather,
    realWeather: game.realWeather,
    gardenPlants: (game.gardenPlants || []).map(p => ({
      plantDefId: p.plantDefId,
      x: p.x,
      y: p.y,
      stage: p.plant?.stage ?? 0,
      growthProgress: p.plant?.growthProgress ?? 0,
      needsWater: p.plant?.needsWater ?? false,
      isHarvestable: p.plant?.isHarvestable ?? false,
      hasDisease: p.plant?.hasDisease ?? false,
      hasPest: p.plant?.hasPest ?? false,
      waterLevel: p.plant?.waterLevel ?? 0,
      health: p.plant?.health ?? 100,
    })),
    pepiniere: (game.pepiniere || []).map(p => ({
      plantDefId: p.plantDefId,
      stage: p.stage,
      needsWater: p.needsWater,
      health: p.health,
    })),
    gardenTanks: game.gardenTanks,
    alerts: game.alerts,
  };
}

export function AgentInitializer() {
  const setStatus = useAgentStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;
    let interval: NodeJS.Timeout | null = null;

    async function init() {
      const health = await checkMicroHealth();

      if (cancelled) return;

      const ollamaOk = health?.ollama?.available ?? false;
      const qdrantOk = health?.qdrant?.available ?? false;

      setStatus({
        isOllamaAvailable: ollamaOk,
        isQdrantAvailable: qdrantOk,
        canUseLocalAI: ollamaOk && qdrantOk,
        ollamaModel: health?.ollama?.model ?? 'qwen2.5:7b',
        qdrantCollectionsCount: health?.qdrant?.collections ?? 0,
      });

      // Start proactive scan loop via microservice
      interval = setInterval(async () => {
        if (!useAgentStore.getState().status.isLocalAIActive) return;
        try {
          const result = await microScan({ gameContext: buildGameContext(), snapshot: true });
          const store = useAgentStore.getState();
          result.notifications?.forEach((n) =>
            store.addNotification({
              type: n.type as 'alert' | 'suggestion' | 'reminder' | 'info',
              title: n.title,
              message: n.message,
              priority: n.priority as 'critical' | 'high' | 'medium' | 'low',
            })
          );
          result.suggestions?.forEach((s) =>
            store.addSuggestion({
              category: s.category as 'water' | 'plant' | 'calendar' | 'disease' | 'purchase' | 'harvest',
              title: s.title,
              description: s.description,
              reasoning: s.reasoning,
              priority: s.priority as 'critical' | 'high' | 'medium' | 'low',
            })
          );
        } catch (err) {
          console.warn('[AgentInitializer] microScan failed:', err);
        }
      }, PROACTIVE_INTERVAL_MS);
    }

    init();
    const stopBridge = startMicroserviceBridge();
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      stopBridge?.();
    };
  }, [setStatus]);

  return null;
}
