/**
 * AgentInitializer — Client-side initialization for Super IA Local mode
 * DISABLED for Vercel — requires local Ollama+Qdrant
 */

'use client';

import { useEffect } from 'react';
import { useAgentStore } from '@/store/agent-store';

export function AgentInitializer() {
  const setStatus = useAgentStore((s) => s.setStatus);

  useEffect(() => {
    // Disable local AI on Vercel (requires Ollama+Qdrant)
    setStatus({
      isLocalAIActive: false,
      isOllamaAvailable: false,
      isQdrantAvailable: false,
    });
  }, [setStatus]);

  return null;
}
