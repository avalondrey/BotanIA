/**
 * API: POST /api/agent/generate-preview
 * Generate sprite preview using Ollama
 * Request: { plantDefId: string, stage: number, prompt: string }
 * Response: { success: boolean, imageUrl?: string, description?: string, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

export async function POST(req: NextRequest) {
  try {
    const { plantDefId, stage, prompt } = await req.json();

    if (!plantDefId || !stage) {
      return NextResponse.json(
        { success: false, error: 'Missing plantDefId or stage' },
        { status: 400 }
      );
    }

    // Build full prompt for qwen
    const fullPrompt = prompt || `Generate a pixel art sprite description for ${plantDefId} at stage ${stage}.

The description should include:
- Visual appearance (colors, shapes)
- Key features for that growth stage
- Style: manga cel-shaded, 128x128px, transparent background
- Game asset style

Be specific and detailed.`;

    // Try Ollama
    try {
      const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        return NextResponse.json({
          success: true,
          description: data.response || 'No description generated',
          model: OLLAMA_MODEL,
          note: 'Using text model - description generated. For actual image generation, a vision model is needed.',
        });
      }
    } catch (e) {
      console.warn('[generate-preview] Ollama not available:', e);
    }

    // Fallback if Ollama not available
    return NextResponse.json({
      success: true,
      description: `[PREVIEW] ${plantDefId} - Stage ${stage}

Based on plant data:
- Growth stage: ${stage}/5
- Expected appearance: ${stage === 0 ? 'Seed/germination' : stage === 1 ? 'Seedling with cotyledons' : stage === 2 ? 'Young plant with true leaves' : stage === 3 ? 'Established plant' : stage === 4 ? 'Flowering' : 'Harvest ready'}

Note: Connect to a vision model (qwen-vl, llava, FLUX) for actual sprite generation.`,
      model: 'none',
      note: 'Ollama not available - using fallback description',
    });

  } catch (err) {
    console.error('[generate-preview] Error:', err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
