/**
 * Asset Detector — BotanIA Agent
 *
 * Scans for gaps between:
 * 1. Plant definitions (HologramEvolution PLANT_CARDS/TREE_CARDS) and sprite files (/stages/*)
 * 2. CARD_DATA files (graines/arbres) and integrated plantDefIds in HologramEvolution
 *
 * This enables Lia to proactively detect missing assets and propose generation.
 */

import { useAgentStore } from '@/store/agent-store';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GapType = 'sprite' | 'card_data' | 'tsx_file' | 'documentation';
export type GapSeverity = 'critical' | 'warning' | 'info';

export interface AssetGap {
  id: string;
  type: GapType;
  plantDefId: string;
  severity: GapSeverity;
  message: string;
  proposedPrompt: string;
  existingPaths: string[];
  missingPaths: string[];
  stageCount: number; // number of sprite stages (0-5 = 6 stages)
}

export interface PlantCard {
  id: string;
  plantCategory?: 'vegetable' | 'fruit-tree' | 'forest-tree' | 'hedge';
  plantFamily?: string;
  totalDaysToHarvest?: number;
}

// ─── Stage image paths ────────────────────────────────────────────────────────

const STAGE_COUNT = 6; // stages 0-5

/**
 * Get all sprite paths that should exist for a plantDefId
 */
export function getExpectedSpritePaths(plantDefId: string): string[] {
  return Array.from({ length: STAGE_COUNT }, (_, i) => `/stages/${plantDefId}/${i}.png`);
}

// ─── Build generation prompt ─────────────────────────────────────────────────

const PLANT_FAMILY_PROMPTS: Record<string, string> = {
  Solanaceae: 'nightshade family — fruit (tomato/pepper/eggplant) red, orange or purple depending on variety',
  Cucurbitaceae: 'cucurbit — trailing or climbing vine with large rounded leaves',
  Apiaceae: 'carrot family — feathery divided leaves, aromatic herbs',
  Asteraceae: 'daisy family — composite flowers, yellow or white flower heads',
  Fabaceae: 'legume family — pod-bearing plants, clover-like leaves',
  Brassicaceae: 'cabbage family — leafy vegetables, branching pattern',
  Rosaceae: 'rose family — fruit trees, woody stems with broad leaves',
  Lamiaceae: 'mint family — square stems, aromatic ovate leaves',
  Amaranthaceae: 'amaranth family — spinach, broad tender leaves',
  Elaeagnaceae: 'oleaster family — silver-green narrow leaves, berry-producing',
  Lauraceae: 'bay family — glossy evergreen oval leaves',
  Cornaceae: 'dogwood family — woody shrub with pointed leaves',
  Grossulariaceae: 'currant/gooseberry family — lobed leaves on woody shrub',
  Betulaceae: 'birch/hazelnut family — pointed serrated leaves, catkins',
  Juglandaceae: 'walnut family — large compound pinnate leaves',
  Fagaceae: 'oak/beech family — large lobed leaves (oak), rounded (beech)',
  Rutaceae: 'citrus family — leathery evergreen leaves, aromatic',
  Pinaceae: 'pine family — needle-like leaves, evergreen conifer',
  Sapindaceae: 'maple family — palmate lobed leaves, deciduous tree',
  Magnoliaceae: 'magnolia family — large showy flowers, broad oval leaves',
};

/**
 * Build a sprite generation prompt for a given plant
 */
export function buildSpritePrompt(plantDefId: string, plantCard?: PlantCard): string {
  const family = plantCard?.plantFamily || '';
  const familyDesc = PLANT_FAMILY_PROMPTS[family] || 'vegetable plant, garden crop';

  const stageDescriptions = [
    'Graine germée — tiny sprout, just broke soil, cotyledon leaves barely visible, pale green',
    'Petite plantule — 2-4 true leaves, delicate thin stem, fresh green, 3-5cm tall',
    'Plantule établie — 6-10 leaves, stronger stem, bushy appearance, 8-12cm tall',
    'Plante juvénile — full foliage, established root system, beginning of structural growth',
    'Plante mature — flowering or early fruiting, full size, vibrant healthy leaves',
    'Récolte prête — peak maturity, abundant fruit/vegetable visible, harvest-ready appearance',
  ];

  const categoryHint = plantCard?.plantCategory === 'fruit-tree' || plantCard?.plantCategory === 'forest-tree'
    ? 'tree sprite, woody trunk visible, garden tree proportions'
    : 'garden vegetable/herb sprite, herbaceous plant';

  const promptParts = [
    `Pixel art game sprite, 128x128px`,
    `Transparent background (PNG with alpha channel)`,
    `Game asset style, centered subject`,
    `${categoryHint}`,
    `Plant family: ${familyDesc}`,
    `Plant name: ${plantDefId}`,
    '',
    'Stage descriptions:',
    ...stageDescriptions.map((s, i) => `  Stage ${i}: ${s}`),
    '',
    'CRITICAL STYLE RULES:',
    '- Manga cel-shaded cross-hatching illustration style',
    '- White background for stages 0-4, transparent background for final stages',
    '- Vibrant natural colors, no text, no watermark, no signature',
    '- Pure PNG output, no borders or frames',
  ];

  return promptParts.join('\n');
}

// ─── Detect sprite gaps ────────────────────────────────────────────────────────

/**
 * Check if sprite files exist for a plantDefId
 * Returns { exists: boolean, missingCount: number, existingPaths: string[] }
 */
export function checkSpriteExists(plantDefId: string, existingSprites: Set<string>): {
  exists: boolean;
  missingCount: number;
  existingPaths: string[];
  missingPaths: string[];
} {
  const expected = getExpectedSpritePaths(plantDefId);
  const existing: string[] = [];
  const missing: string[] = [];

  for (const path of expected) {
    if (existingSprites.has(path)) {
      existing.push(path);
    } else {
      missing.push(path);
    }
  }

  return {
    exists: missing.length === 0,
    missingCount: missing.length,
    existingPaths: existing,
    missingPaths: missing,
  };
}

// ─── Main gap detection ─────────────────────────────────────────────────────

/**
 * Detect all asset gaps in the BotanIA project
 *
 * Uses PLANT_CARDS and TREE_CARDS from HologramEvolution (imported inline)
 * Scans the known sprite paths (/stages/{plantDefId}/{i}.png)
 *
 * Note: This runs server-side in API routes or during build.
 * For client-side detection, use detectGapsClient() with pre-built sprite list.
 */
export async function detectAssetGaps(
  plantDefIds: string[],
  existingSprites: Set<string>,
  plantCards?: Map<string, PlantCard>
): Promise<AssetGap[]> {
  const gaps: AssetGap[] = [];
  const now = Date.now();

  for (const plantDefId of plantDefIds) {
    const check = checkSpriteExists(plantDefId, existingSprites);
    const plantCard = plantCards?.get(plantDefId);

    if (!check.exists) {
      const missingCount = check.missingCount;
      const totalCount = STAGE_COUNT;

      let severity: GapSeverity;
      if (missingCount === totalCount) {
        severity = 'critical'; // completely missing
      } else if (missingCount >= 3) {
        severity = 'warning';
      } else {
        severity = 'info';
      }

      const prompt = buildSpritePrompt(plantDefId, plantCard);

      gaps.push({
        id: `gap-${plantDefId}-${now}`,
        type: 'sprite',
        plantDefId,
        severity,
        message: `Sprite manquant pour "${plantDefId}" — ${missingCount}/${totalCount} étapes absentes dans /stages/`,
        proposedPrompt: prompt,
        existingPaths: check.existingPaths,
        missingPaths: check.missingPaths,
        stageCount: totalCount - missingCount,
      });
    }
  }

  return gaps;
}

/**
 * Propose gaps to the user via agent-store suggestions
 */
export function proposeGapsAsSuggestions(gaps: AssetGap[]): void {
  const store = useAgentStore.getState();

  for (const gap of gaps) {
    const categoryIcon: Record<GapType, string> = {
      sprite: '🖼️',
      card_data: '📋',
      tsx_file: '📄',
      documentation: '📚',
    };

    store.addSuggestion({
      category: 'purchase',
      title: `${categoryIcon[gap.type]} ${gap.type === 'sprite' ? 'Sprite manquant' : 'Écart détecté'}: ${gap.plantDefId}`,
      description: gap.message,
      reasoning: `Détection automatique — ${gap.missingPaths.length} fichier(s) manquant(s)`,
      priority: gap.severity === 'critical' ? 'high' : gap.severity === 'warning' ? 'medium' : 'low',
    });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Get the list of all plantDefIds that should have sprites
 * These come from PLANT_CARDS and TREE_CARDS in HologramEvolution.tsx
 */
export function getAllBotanIAPlantIds(): string[] {
  return [
    // PLANT_CARDS (seeds + bushes)
    'tomato', 'carrot', 'lettuce', 'strawberry', 'basil', 'pepper',
    'cucumber', 'zucchini', 'bean', 'pea', 'spinach', 'radish',
    'cabbage', 'eggplant', 'squash', 'goji', 'lycium', 'mirabellier',
    'photinia', 'eleagnus', 'laurus', 'cornus', 'casseille',
    // TREE_CARDS (fruit + forest trees)
    'apple', 'apple-golden', 'apple-gala', 'pear', 'cherry',
    'hazelnut', 'walnut', 'orange', 'lemon', 'oak', 'birch',
    'maple', 'pine', 'magnolia',
  ];
}

/**
 * Parse the STAGE_IMAGES from ai-engine.ts to get actual existing sprites
 * This is a simplified client-side check using the known paths.
 * In API routes (server-side), prefer direct filesystem scan.
 */
export function getExistingSpritesFromStageImages(stageImages: Record<string, string[]>): Set<string> {
  const sprites = new Set<string>();
  for (const [, paths] of Object.entries(stageImages)) {
    for (const path of paths) {
      if (path) sprites.add(path);
    }
  }
  return sprites;
}

/**
 * Get the list of plantDefIds that have at least some sprites
 */
export function getSpritesPresentInStageImages(stageImages: Record<string, string[]>): string[] {
  return Object.keys(stageImages);
}
