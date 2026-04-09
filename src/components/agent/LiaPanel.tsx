/**
 * LiaPanel — Proactive suggestions panel
 * Shows Lia's suggested actions based on garden state
 */

'use client';

import { useAgent } from '@/lib/hooks/useAgent';
import { Button } from '@/components/ui/button';

interface LiaPanelProps {
  /** If true, shows a compact inline version (in chat), if false shows full standalone panel */
  compact?: boolean;
}

export function LiaPanel({ compact = false }: LiaPanelProps) {
  const { pendingSuggestions, dismissSuggestion, runProactiveScan } = useAgent();

  if (pendingSuggestions.length === 0) return null;

  const categoryIcons: Record<string, string> = {
    water: '💧',
    plant: '🌱',
    calendar: '📅',
    disease: '🦠',
    purchase: '🛒',
    harvest: '⚡',
  };

  const priorityBorder: Record<string, string> = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  if (compact) {
    // Compact inline version for chat
    return (
      <div className="border-t">
        <div className="p-2 bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">💡 Suggestions de Lia</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={runProactiveScan}
              className="text-xs h-auto p-1"
              title="Actualiser les suggestions"
            >
              🔄
            </Button>
          </div>
          <div className="space-y-1">
            {pendingSuggestions.slice(0, 3).map((sug) => (
              <div
                key={sug.id}
                className={`text-xs p-2 bg-background rounded border-l-2 ${
                  priorityBorder[sug.priority] || 'border-l-gray-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{categoryIcons[sug.category] || '💡'}</span>
                  <span className="font-medium">{sug.title}</span>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2">{sug.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full standalone panel
  return (
    <div className="w-80 bg-background border rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 border-b bg-primary text-primary-foreground">
        <p className="font-semibold text-sm">💡 Suggestions de Lia</p>
        <p className="text-xs opacity-80 mt-0.5">
          {pendingSuggestions.length} suggestion{pendingSuggestions.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {pendingSuggestions.map((sug) => (
          <div
            key={sug.id}
            className={`p-3 border-b last:border-b-0 border-l-4 ${
              priorityBorder[sug.priority] || 'border-l-gray-500'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{categoryIcons[sug.category] || '💡'}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{sug.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{sug.description}</p>
                {sug.reasoning && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    → {sug.reasoning}
                  </p>
                )}
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-0.5 px-2"
                    onClick={() => dismissSuggestion(sug.id)}
                  >
                    Ignorer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
