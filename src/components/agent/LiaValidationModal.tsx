/**
 * LiaValidationModal — BotanIA
 *
 * Modal qui affiche les previews d'images générées pour validation.
 * L'utilisateur clique ✅ (je valide) ou ❌ (je refuse → regenerate).
 *
 * Ce modal s'ouvre automatiquement quand Lia a des previews en attente.
 */

'use client';

import { useState } from 'react';
import { useAgentStore } from '@/store/agent-store';
import { validateGeneratedPreview } from '@/lib/agent/generation-pipeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreviewJob {
  gapId: string;
  plantDefId: string;
  stage: number;
  outputPath: string;
  status: 'preview' | 'failed';
  imageUrl?: string;
  description?: string;
  error?: string;
}

interface LiaValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previews: PreviewJob[];
  onValidated?: (job: PreviewJob) => void;
  onRejected?: (job: PreviewJob) => void;
}

export function LiaValidationModal({
  open,
  onOpenChange,
  previews,
  onValidated,
  onRejected,
}: LiaValidationModalProps) {
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'preview' | 'approved'>('preview');

  const previewJobs = previews.filter((p) => p.status === 'preview');
  const failedJobs = previews.filter((p) => p.status === 'failed');
  const approvedJobs = previews.filter((p) => (p as any).status === 'validated');

  const handleValidate = async (job: PreviewJob) => {
    setValidatingId(job.gapId);
    try {
      await validateGeneratedPreview({
        ...job,
        prompt: '',
        isTree: false,
        status: 'validated',
      });
      onValidated?.(job);
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              🎨 Validation des Sprites Générés
            </DialogTitle>
            <Badge variant="outline" className="ml-2">
              {previewJobs.length} en attente
            </Badge>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab('preview')}
            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'preview'
                ? 'border-green-500 text-green-700 bg-green-50'
                : 'border-transparent text-muted-foreground hover:bg-muted/30'
            }`}
          >
            🖼️ Previews ({previewJobs.length})
          </button>
          <button
            onClick={() => setSelectedTab('approved')}
            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'approved'
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-muted-foreground hover:bg-muted/30'
            }`}
          >
            ✅ Approuvés ({approvedJobs.length})
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {selectedTab === 'preview' && (
            <div className="space-y-4 p-4">
              {previewJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-2xl mb-2">🎨</p>
                  <p>Aucune preview en attente</p>
                  <p className="text-sm mt-1">
                    Approuve des écarts pour générer des sprites
                  </p>
                </div>
              ) : (
                previewJobs.map((job) => (
                  <div
                    key={`${job.gapId}-${job.stage}`}
                    className="border rounded-lg overflow-hidden bg-card"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          🍅 {job.plantDefId}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Stade {job.stage}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {job.outputPath}
                      </span>
                    </div>

                    {/* Image preview area */}
                    <div className="relative bg-muted/10 min-h-[200px] flex items-center justify-center">
                      {job.imageUrl ? (
                        <img
                          src={job.imageUrl}
                          alt={`${job.plantDefId} stage ${job.stage}`}
                          className="max-w-full max-h-[300px] object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <div className="text-4xl mb-2">🖼️</div>
                          <p className="text-sm">Preview non disponible</p>
                          <p className="text-xs mt-1">
                            Utilise le prompt ci-dessous pour générer manuellement
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Prompt info */}
                    <div className="p-3 bg-muted/20 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Prompt de génération:
                      </p>
                      <p className="text-xs text-muted-foreground font-mono bg-muted/30 p-2 rounded max-h-20 overflow-y-auto">
                        {job.description || 'Prompt non disponible'}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 p-3">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={validatingId === job.gapId}
                        onClick={() => handleValidate(job)}
                      >
                        {validatingId === job.gapId ? (
                          '⏳ Validation...'
                        ) : (
                          <>
                            ✅ J'aime — Je valide ce sprite
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={validatingId === job.gapId}
                        onClick={() => onRejected?.(job)}
                      >
                        ❌ Je refuse — Proposer un autre style
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {/* Failed jobs */}
              {failedJobs.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-red-600 mb-2">
                    ⚠️ Échecs ({failedJobs.length})
                  </p>
                  {failedJobs.map((job) => (
                    <div
                      key={`${job.gapId}-${job.stage}`}
                      className="p-2 bg-red-50 border border-red-200 rounded text-xs mb-1"
                    >
                      <span className="font-medium">{job.plantDefId} stage {job.stage}</span>
                      <span className="text-red-600 ml-2">{job.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'approved' && (
            <div className="p-4 space-y-3">
              {approvedJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-2xl mb-2">✅</p>
                  <p>Aucun sprite approuvé</p>
                </div>
              ) : (
                approvedJobs.map((job) => (
                  <div
                    key={`${job.gapId}-${job.stage}`}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✅</span>
                      <span className="font-medium text-sm">
                        {job.plantDefId} — Stade {job.stage}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {job.outputPath}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
