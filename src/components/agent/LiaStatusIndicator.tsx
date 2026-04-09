/**
 * LiaStatusIndicator — Shows AI mode status (Local Ollama+Qdrant vs Classic Groq)
 * Displays a colored indicator with tooltip
 */

'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from '@/store/agent-store';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LiaStatusIndicator() {
  const status = useAgentStore((s) => s.status);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getStatusColor = () => {
    if (!status.isLocalAIActive) return 'bg-gray-400';
    if (!status.isOllamaAvailable || !status.isQdrantAvailable) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (!status.isLocalAIActive) return '🔴';
    if (!status.isOllamaAvailable || !status.isQdrantAvailable) return '🟡';
    return '🟢';
  };

  const getStatusText = () => {
    if (!status.isLocalAIActive) return 'IA Classique (Groq)';
    if (!status.isOllamaAvailable && !status.isQdrantAvailable) return 'IA Locale Indisponible';
    if (!status.isOllamaAvailable) return 'Ollama OFF';
    if (!status.isQdrantAvailable) return 'Qdrant OFF';
    return `Super IA Locale (${status.ollamaModel})`;
  };

  const getTooltip = () => {
    if (!status.isLocalAIActive) {
      return 'Clique pour activer le mode Super IA Locale (Ollama + Qdrant)';
    }
    const parts: string[] = [];
    parts.push(`Ollama: ${status.isOllamaAvailable ? '✓ Actif' : '✗ Inactif'}`);
    parts.push(`Qdrant: ${status.isQdrantAvailable ? '✓ Actif' : '✗ Inactif'}`);
    if (status.lastIndexing) {
      parts.push(`Dernier indexage: ${new Date(status.lastIndexing).toLocaleTimeString('fr-FR')}`);
    }
    if (status.indexingProgress !== 'idle') {
      parts.push(`Indexage: ${status.indexingProgress}`);
    }
    return parts.join('\n');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}
              title={getTooltip()}
            />
            <span className="text-xs">{getStatusIcon()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <pre className="text-xs whitespace-pre-wrap">{getTooltip()}</pre>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Toggle button for activating Super IA Local mode
 */
export function LiaToggleButton() {
  const status = useAgentStore((s) => s.status);
  const setLocalAIActive = useAgentStore((s) => s.setLocalAIActive);

  const isActive = status.isLocalAIActive && status.isOllamaAvailable && status.isQdrantAvailable;

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={() => setLocalAIActive(!status.isLocalAIActive)}
      className="text-xs gap-1"
    >
      {isActive ? '🔮 Super IA Locale' : '🔴 Activer Super IA Locale'}
    </Button>
  );
}
