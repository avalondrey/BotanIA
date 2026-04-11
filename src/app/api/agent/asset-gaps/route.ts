/**
 * API: /api/agent/asset-gaps
 *
 * GET  — Détecte les écarts d'assets (sprites manquants, etc.)
 * POST — Approuve les gaps sélectionnés et lance le pipeline de génération
 *
 * Le pipeline de génération retourne une PREVIEW que l'utilisateur
 * doit valider (✅/❌) avant sauvegarde finale.
 */

import { NextRequest, NextResponse } from 'next/server';
import { useAgentStore } from '@/store/agent-store';
import {
  detectAssetGaps,
  getExpectedSpritePaths,
  buildSpritePrompt,
  getAllBotanIAPlantIds,
} from '@/lib/agent/asset-detector';
import { STAGE_IMAGES } from '@/lib/ai-engine';

// GET /api/agent/asset-gaps — Détecte les écarts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRescan = searchParams.get('force') === 'true';

    // Get existing sprites from STAGE_IMAGES in ai-engine.ts
    const existingSprites = new Set<string>();
    for (const [, paths] of Object.entries(STAGE_IMAGES)) {
      for (const path of paths) {
        if (path) existingSprites.add(path);
      }
    }

    const allPlantIds = getAllBotanIAPlantIds();
    const gaps = await detectAssetGaps(allPlantIds, existingSprites);

    // If gaps not stored yet, store them
    const store = useAgentStore.getState();
    if (store.detectedGaps.length === 0 || forceRescan) {
      store.addGaps(gaps.map((g) => ({
        ...g,
        status: 'detected',
      })));
    }

    return NextResponse.json({
      gaps: forceRescan ? gaps : store.detectedGaps,
      count: gaps.length,
      existingSpritesCount: existingSprites.size,
      missingSpritesCount: gaps.filter((g) => g.type === 'sprite').length,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[asset-gaps] GET error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/agent/asset-gaps — Approuve et génère
// Body: { gapIds: string[], action: 'approve' | 'reject' | 'generate' }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gapIds, action } = body;

    if (!gapIds || !Array.isArray(gapIds)) {
      return NextResponse.json({ error: 'gapIds array required' }, { status: 400 });
    }

    const store = useAgentStore.getState();

    if (action === 'reject') {
      // Reject selected gaps
      for (const id of gapIds) {
        store.rejectGap(id);
      }
      return NextResponse.json({
        success: true,
        message: `${gapIds.length} gap(s) rejeté(s)`,
        remainingGaps: store.detectedGaps.length,
      });
    }

    if (action === 'approve' || action === 'generate') {
      // Mark as approved
      for (const id of gapIds) {
        store.approveGap(id);
      }

      // Get approved gaps
      const approvedGaps = store.detectedGaps.filter(
        (g) => gapIds.includes(g.id) && g.status === 'approved'
      );

      // Build generation jobs
      const jobs: {
        gapId: string;
        plantDefId: string;
        stage: number;
        outputPath: string;
        prompt: string;
        isTree: boolean;
      }[] = [];

      for (const gap of approvedGaps) {
        const isTree = ['apple', 'pear', 'cherry', 'hazelnut', 'walnut', 'oak', 'birch', 'maple', 'pine', 'magnolia'].includes(gap.plantDefId);

        for (const missingPath of gap.missingPaths) {
          const stage = parseInt(missingPath.split('/').pop()!.replace('.png', ''), 10);
          jobs.push({
            gapId: gap.id,
            plantDefId: gap.plantDefId,
            stage,
            outputPath: missingPath,
            prompt: buildSpritePrompt(gap.plantDefId, {
              id: gap.plantDefId,
              plantFamily: '',
            }),
            isTree,
          });
        }

        // Mark gap as generating
        store.updateGapStatus(gap.id, 'generating');
      }

      // Call generate-sprite for each job
      const results: {
        gapId: string;
        plantDefId: string;
        stage: number;
        outputPath: string;
        status: 'preview' | 'failed';
        imageUrl?: string;
        description?: string;
        error?: string;
      }[] = [];

      for (const job of jobs) {
        try {
          const res = await fetch(req.nextUrl.origin + '/api/generate-sprite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plantDefId: job.plantDefId,
              stage: job.stage,
              isTree: job.isTree,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            results.push({
              ...job,
              status: 'preview',
              imageUrl: data.imageUrl || null,
              description: data.description || '',
            });
          } else {
            results.push({ ...job, status: 'failed', error: `HTTP ${res.status}` });
          }
        } catch (err) {
          results.push({ ...job, status: 'failed', error: String(err) });
        }
      }

      const failedCount = results.filter((r) => r.status === 'failed').length;
      const previewCount = results.filter((r) => r.status === 'preview').length;

      return NextResponse.json({
        success: true,
        message: `${previewCount} preview(s) générée(s), ${failedCount} échec(s)`,
        approvedGaps: gapIds.length,
        results,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[asset-gaps] POST error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
