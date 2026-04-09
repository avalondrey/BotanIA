/**
 * AgentInitializer — Client-side initialization for Super IA Local mode
 *
 * Runs on mount to:
 * 1. Check Ollama + Qdrant availability
 * 2. Trigger full code scan if needed
 * 3. Start proactive agent if enabled
 */

'use client';

import { useEffect } from 'react';
import { useAgentStore } from '@/store/agent-store';
import { startProactiveAgent, stopProactiveAgent } from '@/lib/agent/proactive-agent';

export function AgentInitializer() {
  const setStatus = useAgentStore((s) => s.setStatus);
  const status = useAgentStore((s) => s.status);

  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined') return;

      // Check Ollama
      try {
        const ollamaRes = await fetch('/api/agent/status');
        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          setStatus({
            isOllamaAvailable: data.ollama?.available ?? false,
            isQdrantAvailable: data.qdrant?.available ?? false,
            ollamaModel: data.ollama?.defaultModel || 'qwen2.5:7b',
          });
        }
      } catch {
        setStatus({ isOllamaAvailable: false, isQdrantAvailable: false });
      }
    }

    init();
  }, [setStatus]);

  // Start/stop proactive agent based on isLocalAIActive
  useEffect(() => {
    if (status.isLocalAIActive && status.isOllamaAvailable && status.isQdrantAvailable) {
      startProactiveAgent(60_000); // Every 1 minute

      // Trigger initial scan
      fetch('/api/agent/scan', { method: 'POST' })
        .then(() => setStatus({ indexingProgress: 'idle', lastIndexing: Date.now() }))
        .catch(() => setStatus({ indexingProgress: 'error', errorMessage: 'Scan failed' }));

      return () => stopProactiveAgent();
    } else {
      stopProactiveAgent();
    }
  }, [status.isLocalAIActive, status.isOllamaAvailable, status.isQdrantAvailable]);

  // This component doesn't render anything
  return null;
}
