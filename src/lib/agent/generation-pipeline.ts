/**
 * Generation Pipeline — BotanIA Agent
 *
 * Handles the validated generation workflow:
 * 1. User approves gaps detected by asset-detector
 * 2. Pipeline generates sprite prompts via /api/generate-sprite
 * 3. Preview is shown to user — they VALIDATE before final save
 * 4. After validation, the sprite is saved to /public/stages/
 *
 * This ensures human-in-the-loop: Lia never auto-saves generated content.
 */

import { useAgentStore } from '@/store/agent-store';
import type { AssetGap } from '@/store/agent-store';
import { buildSpritePrompt } from './asset-detector';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GenerationJob {
  gapId: string;
  plantDefId: string;
  stage: number;
  status: 'pending' | 'generating' | 'preview' | 'validated' | 'saved' | 'failed';
  prompt: string;
  imageUrl?: string;
  description?: string; // from the generation API
  error?: string;
  isTree?: boolean;
}

export interface PipelineResult {
  jobs: GenerationJob[];
  totalGaps: number;
  generatedCount: number;
  failedCount: number;
}

// ─── Run generation for approved gaps ─────────────────────────────────────

/**
 * Start generating sprite previews for all approved gaps.
 * Call this when user clicks "Générer" on selected gaps.
 *
 * Returns jobs with prompts for user validation.
 */
export async function runGenerationPipeline(
  gapIds: string[]
): Promise<PipelineResult> {
  const store = useAgentStore.getState();
  const approvedGaps = store.detectedGaps.filter(
    (g) => gapIds.includes(g.id) && g.status === 'approved'
  );

  if (approvedGaps.length === 0) {
    return { jobs: [], totalGaps: 0, generatedCount: 0, failedCount: 0 };
  }

  // Mark gaps as generating
  for (const gap of approvedGaps) {
    store.updateGapStatus(gap.id, 'generating');
  }

  const jobs: GenerationJob[] = [];

  for (const gap of approvedGaps) {
    // For each gap, generate for ALL missing stages (0-5)
    for (const missingPath of gap.missingPaths) {
      const stage = parseInt(missingPath.split('/').pop()!.replace('.png', ''), 10);
      const isTree = gap.plantDefId === 'apple' || gap.plantDefId === 'pear' ||
        gap.plantDefId === 'cherry' || gap.plantDefId === 'hazelnut' ||
        gap.plantDefId === 'walnut' || gap.plantDefId === 'oak' ||
        gap.plantDefId === 'birch' || gap.plantDefId === 'maple' ||
        gap.plantDefId === 'pine' || gap.plantDefId === 'magnolia';

      const job: GenerationJob = {
        gapId: gap.id,
        plantDefId: gap.plantDefId,
        stage,
        status: 'generating',
        prompt: gap.proposedPrompt,
        isTree,
      };

      try {
        // Call the generate-sprite API
        const res = await fetch('/api/generate-sprite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plantDefId: gap.plantDefId,
            stage,
            isTree,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          job.status = 'preview';
          job.prompt = data.prompt || gap.proposedPrompt;
          job.description = data.description || '';
          job.imageUrl = data.imageUrl || null;
        } else {
          job.status = 'failed';
          job.error = `API error: ${res.status}`;
        }
      } catch (err) {
        job.status = 'failed';
        job.error = String(err);
      }

      jobs.push(job);
    }
  }

  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  return {
    jobs,
    totalGaps: approvedGaps.length,
    generatedCount: jobs.length - failedCount,
    failedCount,
  };
}

/**
 * Validate a generated preview — user says "I like this image"
 * This is called after user reviews the preview and approves.
 *
 * For now, since we can't auto-generate images with qwen2.5 text-only,
 * "validation" means the user approves the PROMPT to be used for external generation.
 */
export async function validateGeneratedPreview(
  job: GenerationJob
): Promise<{ success: boolean; outputPath?: string; error?: string }> {
  // Build the expected output path
  const outputPath = `/stages/${job.plantDefId}/${job.stage}.png`;

  try {
    // Since actual image generation isn't possible with qwen2.5 text-only,
    // we store the approved prompt in localStorage for external use.
    // In a full implementation, this would save the actual generated image.
    const approvedPrompts = JSON.parse(
      localStorage.getItem('botania-approved-prompts') || '{}'
    );
    approvedPrompts[job.plantDefId] = approvedPrompts[job.plantDefId] || {};
    approvedPrompts[job.plantDefId][job.stage] = {
      prompt: job.prompt,
      approvedAt: Date.now(),
      outputPath,
    };
    localStorage.setItem('botania-approved-prompts', JSON.stringify(approvedPrompts));

    // Update the gap status to 'done'
    const store = useAgentStore.getState();
    const relatedGaps = store.detectedGaps.filter(
      (g) => g.plantDefId === job.plantDefId && g.status === 'generating'
    );
    for (const gap of relatedGaps) {
      store.updateGapStatus(gap.id, 'done', {
        generatedImageUrl: job.imageUrl || outputPath,
      });
    }

    return { success: true, outputPath };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Reject a generated preview — user says "I don't like this"
 * Offer to regenerate with a modified prompt.
 */
export async function requestRegeneration(
  job: GenerationJob,
  userFeedback?: string
): Promise<{ newPrompt: string }> {
  const basePrompt = job.prompt;

  // Build a modification hint based on user feedback
  const modificationHint = userFeedback
    ? `\n\nUser feedback to incorporate: ${userFeedback}`
    : '\n\nTry a slightly different interpretation while keeping the same plant type.';

  // In a full implementation, this could call an LLM to modify the prompt
  // For now, we just return a hint for manual adjustment
  return {
    newPrompt: basePrompt + modificationHint,
  };
}

/**
 * Get all approved gaps ready for generation
 */
export function getApprovedGaps(): AssetGap[] {
  const store = useAgentStore.getState();
  return store.detectedGaps.filter((g) => g.status === 'approved');
}

/**
 * Get all gaps pending validation (preview generated, awaiting user ok)
 */
export function getPreviewGaps(): AssetGap[] {
  const store = useAgentStore.getState();
  return store.detectedGaps.filter(
    (g) => g.status === 'generating' || g.status === 'done'
  );
}

/**
 * Count gaps by status
 */
export function getGapCounts(): {
  detected: number;
  approved: number;
  generating: number;
  done: number;
  failed: number;
} {
  const store = useAgentStore.getState();
  const gaps = store.detectedGaps;
  return {
    detected: gaps.filter((g) => g.status === 'detected' || g.status === 'proposed').length,
    approved: gaps.filter((g) => g.status === 'approved').length,
    generating: gaps.filter((g) => g.status === 'generating').length,
    done: gaps.filter((g) => g.status === 'done').length,
    failed: gaps.filter((g) => g.status === 'failed').length,
  };
}
