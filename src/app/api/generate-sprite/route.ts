/**
 * API: POST /api/generate-sprite
 * Generate a plant/tree sprite using Qwen vision model
 * Request: { plantDefId: string, stage: number }
 * Response: { success: boolean, imageUrl?: string, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const IMAGE_MODEL = process.env.OLLAMA_IMAGE_MODEL || 'qwen2.5:7b'; // or qwen-vl model if available

// Sprite art style prompt for consistent game sprites
const SPRITE_PROMPT_BASE = `Pixel art style sprite, 128x128px, transparent background, game asset, detailed plant illustration, vibrant colors, centered subject, no text, no watermark. Pure RGBA PNG with alpha channel.`;

const STAGE_PROMPTS: Record<number, string> = {
  1: 'Young seedling, just germinated, tiny green sprout with cotyledon leaves',
  2: 'Seedling, 2-4 true leaves, small plant, delicate stem',
  3: 'Juvenile plant, established leaves, vegetative growth stage',
  4: 'Mature plant, full foliage, beginning of flowering',
  5: 'Plant in full production, flowering or fruiting stage, vibrant',
  6: 'Fully grown plant at peak maturity, harvest-ready appearance',
};

const TREE_STAGE_PROMPTS: Record<number, string> = {
  1: 'Young tree seedling, thin trunk, few leaves',
  2: 'Young sapling, developing crown, trunk thickening',
  3: 'Juvenile tree, established structure, growing canopy',
  4: 'Semi-mature tree, developing fruit/foliage, good canopy',
  5: 'Mature productive tree, full canopy, healthy appearance',
};

export async function POST(req: NextRequest) {
  try {
    const { plantDefId, stage, isTree } = await req.json();

    if (!plantDefId || !stage) {
      return NextResponse.json(
        { success: false, error: 'Missing plantDefId or stage' },
        { status: 400 }
      );
    }

    // Build the prompt
    const stagePrompts = isTree ? TREE_STAGE_PROMPTS : STAGE_PROMPTS;
    const stagePrompt = stagePrompts[stage] || stagePrompts[6];
    const fullPrompt = `${SPRITE_PROMPT_BASE} ${stagePrompt}. Plant type: ${plantDefId}`;

    // Try Ollama with qwen2.5 (text-only, describes what image should look like)
    // Note: qwen2.5:7b is text-only. For actual image generation,
    // you would need a vision model like qwen-vl or use an external API.
    // For now, we return a placeholder response.

    // If Ollama vision is available, use it
    try {
      const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: IMAGE_MODEL,
          prompt: `Generate a clear, concise image description (max 100 words) for a ${plantDefId} sprite at stage ${stage} in pixel art game style. Include colors, shape, and key visual features.`,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        // Ollama text model can describe but not generate images
        // Return the description for manual creation or external service
        return NextResponse.json({
          success: true,
          imageUrl: null, // No auto-generation with qwen2.5 text-only
          description: data.response || fullPrompt,
          note: 'Qwen text model — use description to generate sprite manually or via external image API',
          prompt: fullPrompt,
        });
      }
    } catch (e) {
      console.warn('[generate-sprite] Ollama not available:', e);
    }

    // Fallback: return the prompt for manual use
    return NextResponse.json({
      success: true,
      imageUrl: null,
      prompt: fullPrompt,
      note: 'No vision model available. Use the prompt to generate sprite externally.',
    });

  } catch (err) {
    console.error('[generate-sprite] Error:', err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
