/**
 * POST /api/agent/generate-image-prompt
 * Generate manga prompt for a specific image asset
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { buildImagePrompt, type ImageAssetType, type CardDataInfo } from '@/lib/agent/image-prompt-utils';

async function readCardDataForPlant(plantDefId: string): Promise<CardDataInfo | null> {
  const DATA_GRAINES_PATH = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'data', 'graines');
  const DATA_ARBRES_PATH = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'data', 'arbres');
  const searchDirs = [DATA_GRAINES_PATH, DATA_ARBRES_PATH];

  for (const baseDir of searchDirs) {
    try {
      const entries = await readdir(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const subDir = path.join(baseDir, entry.name);
        const files = await readdir(subDir);
        for (const file of files) {
          if (!file.endsWith('.ts')) continue;
          const filePath = path.join(subDir, file);
          const content = await readFile(filePath, 'utf-8');
          if (!content.includes(`plantDefId: "${plantDefId}"`) && !content.includes(`plantDefId: '${plantDefId}'`)) continue;

          const get = (key: string): string | undefined => {
            const m = content.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
            return m ? m[1] : undefined;
          };

          const id = get('id') || plantDefId;
          const name = get('name') || plantDefId;
          const emoji = get('emoji') || '🌱';
          const shopId = get('shopId') || entry.name;

          let category: CardDataInfo['category'];
          if (content.includes('hedge') || content.includes('ornamental-hedge')) {
            category = 'hedge';
          } else if (content.includes('forest-tree') || content.includes('ornamental-tree')) {
            category = 'forest-tree';
          } else if (content.includes('fruit-tree')) {
            category = 'fruit-tree';
          } else {
            category = 'vegetable';
          }

          const stages: string[] = [];
          const stagesMatch = content.match(/stages:\\s*\[([\\s\\S]*?)\]/);
          if (stagesMatch) {
            for (const m of stagesMatch[1].matchAll(/["']([^"']+)["']/g)) {
              stages.push(m[1]);
            }
          }

          return {
            id, plantDefId, shopId, category, name, emoji,
            packetImage: get('packetImage'),
            cardImage: get('cardImage'),
            potImage: get('potImage'),
            stages,
          };
        }
      }
    } catch { /* skip */ }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plantDefId, imageType, stageNumber } = body as {
      plantDefId: string;
      imageType: ImageAssetType;
      stageNumber?: number;
    };

    if (!plantDefId || !imageType) {
      return NextResponse.json({ error: 'plantDefId et imageType requis' }, { status: 400 });
    }

    const cardData = await readCardDataForPlant(plantDefId);
    if (!cardData) {
      return NextResponse.json({ error: `CARD_DATA introuvable pour "${plantDefId}"` }, { status: 404 });
    }

    if (imageType === 'pot' && cardData.category !== 'fruit-tree') {
      return NextResponse.json({ error: 'Pot images are only for fruit trees' }, { status: 400 });
    }
    if (imageType === 'evolution-card' && cardData.category === 'fruit-tree') {
      return NextResponse.json({ error: 'Evolution cards are only for vegetables' }, { status: 400 });
    }

    const prompt = buildImagePrompt(imageType, cardData, stageNumber);

    let expectedPath: string;
    if (imageType === 'plant-stage') {
      expectedPath = `/plants/${plantDefId}-stage-${stageNumber || 1}.png`;
    } else if (imageType === 'tree-stage') {
      expectedPath = `/trees/${cardData.shopId}/${cardData.id}-stage-${stageNumber || 1}.png`;
    } else if (imageType === 'packet') {
      expectedPath = cardData.packetImage || `/packets/${cardData.shopId}/packet-${cardData.id}.png`;
    } else if (imageType === 'card') {
      expectedPath = cardData.cardImage || `/cards/seeds/${cardData.shopId}/${cardData.id}.png`;
    } else if (imageType === 'pot') {
      expectedPath = cardData.potImage || `/pots/${cardData.shopId}/pot-${cardData.id}.png`;
    } else if (imageType === 'evolution-card') {
      expectedPath = `/plants/card-${plantDefId}-evolution.png`;
    } else {
      expectedPath = `/equipment/...`;
    }

    return NextResponse.json({
      prompt,
      expectedPath,
      assetType: imageType,
      stageNumber,
      varietyName: cardData.name,
      emoji: cardData.emoji,
      shopId: cardData.shopId,
      category: cardData.category,
    });
  } catch (err: any) {
    console.error('[generate-image-prompt] Error:', err);
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}
