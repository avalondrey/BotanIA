/**
 * POST /api/agent/generate-image-prompt
 * Generate manga prompt for a specific image asset
 * Request: { plantDefId: string, imageType: ImageAssetType, stageNumber?: number }
 * Response: { prompt: string, expectedPath: string, assetType: ImageAssetType, stageNumber?: number, varietyName: string, emoji: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { readCardDataForPlant, buildImagePrompt, type ImageAssetType } from '@/lib/agent/plant-integrator';

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

    // Verify the asset type is valid for this plant
    if (imageType === 'pot' && cardData.category !== 'fruit-tree') {
      return NextResponse.json({ error: 'Pot images are only for fruit trees' }, { status: 400 });
    }
    if (imageType === 'evolution-card' && cardData.category === 'fruit-tree') {
      return NextResponse.json({ error: 'Evolution cards are only for vegetables' }, { status: 400 });
    }

    const prompt = buildImagePrompt(imageType, cardData, stageNumber);

    // Build expected path
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