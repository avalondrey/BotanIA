/**
 * Sprite Sheets Mapping — Auto-générés
 * Ne pas éditer manuellement
 */

export interface SpriteSheetInfo {
  image: string;
  stageWidth: number;
  stageHeight: number;
  stages: { index: number; x: number; y: number }[];
}

export const SPRITE_SHEETS: Record<string, SpriteSheetInfo> = {
  'basil': {
    image: '\sprites\basil-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
  'cucumber': {
    image: '\sprites\cucumber-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
  'custom-plant': {
    image: '\sprites\custom-plant-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
  'eggplant': {
    image: '\sprites\eggplant-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
    ],
  },
  'melon': {
    image: '\sprites\melon-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
  'parsley': {
    image: '\sprites\parsley-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
  'spinach': {
    image: '\sprites\spinach-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
  'tomato': {
    image: '\sprites\tomato-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
  'zucchini': {
    image: '\sprites\zucchini-stages.png',
    stageWidth: 1664,
    stageHeight: 928,
    stages: [
      { index: 1, x: 0, y: 0 },
      { index: 2, x: 1664, y: 0 },
      { index: 3, x: 3328, y: 0 },
      { index: 4, x: 4992, y: 0 },
      { index: 5, x: 6656, y: 0 },
      { index: 6, x: 8320, y: 0 },
    ],
  },
};

/**
 * Retourne l'URL de l'image pour un stage donné
 */
export function getSpriteSheetURL(plantId: string): string | undefined {
  return SPRITE_SHEETS[plantId]?.image;
}

/**
 * Retourne les coordonnées CSS pour un stage
 */
export function getSpritePosition(
  plantId: string,
  stage: number
): { x: number; y: number; width: number; height: number } | undefined {
  const sheet = SPRITE_SHEETS[plantId];
  if (!sheet) return undefined;
  const s = sheet.stages.find(st => st.index === stage);
  if (!s) return undefined;
  return { x: s.x, y: s.y, width: sheet.stageWidth, height: sheet.stageHeight };
}