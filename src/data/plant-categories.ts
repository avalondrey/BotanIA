/**
 * Plant Categories — Single source of truth
 * ─────────────────────────────────────────────
 * Every plantDefId maps to exactly one category.
 * This file is the ONLY place where categories are defined.
 * All other files (PLANT_CARDS, CARD_DATA, HEDGE_SHRUBS, UI) must import from here.
 *
 * Categories:
 *   'vegetable'    — Légumes (tomato, carrot, lettuce, etc.)
 *   'fruit-tree'    — Arbres fruitiers & petits fruits (apple, pear, casseille, goji)
 *   'forest-tree'   — Arbres forestiers/ornementaux (oak, birch, maple)
 *   'hedge'         — Haies ornementales (photinia, eleagnus, laurus, cornus, escallonia, thuya)
 *   'aromatic'      — Aromates (basil, parsley)
 */

export type PlantCategory = 'vegetable' | 'fruit-tree' | 'forest-tree' | 'hedge' | 'aromatic';

export const PLANT_CATEGORIES: Record<string, PlantCategory> = {
  // ═══ Légumes ═══
  tomato: 'vegetable',
  carrot: 'vegetable',
  lettuce: 'vegetable',
  strawberry: 'vegetable',
  pepper: 'vegetable',
  cucumber: 'vegetable',
  zucchini: 'vegetable',
  bean: 'vegetable',
  pea: 'vegetable',
  spinach: 'vegetable',
  radish: 'vegetable',
  cabbage: 'vegetable',
  eggplant: 'vegetable',
  squash: 'vegetable',
  melon: 'vegetable',
  corn: 'vegetable',
  sorrel: 'vegetable',
  sunflower: 'vegetable',
  amaranth: 'vegetable',
  quinoa: 'vegetable',
  custom_plant: 'vegetable',

  // ═══ Aromates ═══
  basil: 'aromatic',
  parsley: 'aromatic',

  // ═══ Arbres fruitiers & petits fruits ═══
  apple: 'fruit-tree',
  'apple-golden': 'fruit-tree',
  pear: 'fruit-tree',
  cherry: 'fruit-tree',
  peach: 'fruit-tree',
  plum: 'fruit-tree',
  apricot: 'fruit-tree',
  orange: 'fruit-tree',
  lemon: 'fruit-tree',
  olive: 'fruit-tree',
  hazelnut: 'fruit-tree',
  walnut: 'fruit-tree',
  mirabellier: 'fruit-tree',
  quince: 'fruit-tree',
  currant: 'fruit-tree',
  // Casseille = hybride cassis × groseille → petit fruit, pas haie
  casseille: 'fruit-tree',
  goji: 'fruit-tree',
  lycium: 'fruit-tree',
  josta: 'fruit-tree',
  'baco-noir': 'fruit-tree',
  arbousier: 'fruit-tree',
  amelanchier: 'fruit-tree',
  blackcurrant: 'fruit-tree',
  blackberry: 'fruit-tree',
  mirabelle: 'fruit-tree',
  pommier: 'fruit-tree',
  poirier: 'fruit-tree',
  prunier: 'fruit-tree',

  // ═══ Arbres forestiers / ornementaux ═══
  oak: 'forest-tree',
  birch: 'forest-tree',
  maple: 'forest-tree',
  pine: 'forest-tree',
  magnolia: 'forest-tree',

  // ═══ Haies ornementales ═══
  photinia: 'hedge',
  eleagnus: 'hedge',
  laurus: 'hedge',
  cornus: 'hedge',
  escallonia: 'hedge',
  thuya: 'hedge',
  cypress: 'hedge',
  ivy: 'hedge',
};

/** Get the category for a plantDefId, with fallback */
export function getPlantCategory(plantDefId: string): PlantCategory {
  return PLANT_CATEGORIES[plantDefId] ?? 'vegetable';
}

/** Check if a plantDefId is a hedge */
export function isHedge(plantDefId: string): boolean {
  return PLANT_CATEGORIES[plantDefId] === 'hedge';
}

/** Check if a plantDefId is any kind of tree (fruit or forest) */
export function isTree(plantDefId: string): boolean {
  const cat = PLANT_CATEGORIES[plantDefId];
  return cat === 'fruit-tree' || cat === 'forest-tree';
}