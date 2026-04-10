/**
 * useMissingSprites — Track plant/tree sprites that fail to load
 * Lia uses this to proactively suggest generating missing sprites.
 * Backed by agent store so it's shared across the app.
 */

import { useCallback } from 'react';
import { useAgentStore } from '@/store/agent-store';

export function useMissingSprites() {
  const missingSprites = useAgentStore((s) => s.missingSprites);
  const addMissingSprite = useAgentStore((s) => s.addMissingSprite);
  const clearMissingSprite = useAgentStore((s) => s.clearMissingSprite);

  const reportMissing = useCallback((plantDefId: string) => {
    addMissingSprite(plantDefId);
  }, [addMissingSprite]);

  const clearMissing = useCallback((plantDefId?: string) => {
    clearMissingSprite(plantDefId);
  }, [clearMissingSprite]);

  return { missingSprites, reportMissing, clearMissing, hasMissing: missingSprites.size > 0 };
}
