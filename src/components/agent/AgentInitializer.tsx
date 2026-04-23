/**
 * AgentInitializer — Client-side initialization for Super IA Local mode
 * Checks Ollama + Qdrant availability instead of hardcoding false
 */

'use client';

import { useEffect } from 'react';
import { useAgentStore } from '@/store/agent-store';
import { startProactiveAgent, stopProactiveAgent } from '@/lib/agent/proactive-agent';

function abortTimeout(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

async function checkOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'}/api/tags`, {
      signal: abortTimeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkQdrant(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_QDRANT_URL || 'http://localhost:6333'}/`, {
      signal: abortTimeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function AgentInitializer() {
  const setStatus = useAgentStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [ollamaOk, qdrantOk] = await Promise.all([checkOllama(), checkQdrant()]);

      if (cancelled) return;

      setStatus({
        isOllamaAvailable: ollamaOk,
        isQdrantAvailable: qdrantOk,
        canUseLocalAI: ollamaOk && qdrantOk,
      });

      // Démarrer l'agent proactif (analyse locale toujours active, snapshot IA conditionnel)
      startProactiveAgent(45_000); // 45s interval
    }

    init();
    return () => {
      cancelled = true;
      stopProactiveAgent();
    };
  }, [setStatus]);

  return null;
}