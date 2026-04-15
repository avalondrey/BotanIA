/**
 * Plant DB — Source unique de vérité pour les données plantes
 * ==========================================================
 *
 * Ce module construit PLANTS (PlantDefinition) dynamiquement
 * à partir de PLANT_CARDS + TREE_CARDS (HologramEvolution.tsx).
 *
 * Règle : ne JAMAIS dupliquer de données botaniques ici.
 * Tout vient de HologramEvolution.tsx.
 */

import { PLANT_CARDS, TREE_CARDS, type PlantCard } from '@/components/game/HologramEvolution';
import type { PlantDefinition } from './ai-engine';

// ═══════════════════════════════════════════════════
//  DISPLAY INFO — noms, emojis, images (pas dans PlantCard)
//  Ajouté ici car PlantCard est orienté calcul, pas display
// ═══════════════════════════════════════════════════

const DISPLAY_INFO: Record<string, { name: string; emoji: string; harvestEmoji: string }> = {
  // Légumes
  tomato:     { name: 'Tomate',           emoji: '🍅', harvestEmoji: '🍅' },
  carrot:     { name: 'Carotte',          emoji: '🥕', harvestEmoji: '🥕' },
  lettuce:    { name: 'Salade',           emoji: '🥬', harvestEmoji: '🥬' },
  strawberry: { name: 'Fraise',           emoji: '🍓', harvestEmoji: '🍓' },
  basil:      { name: 'Basilic',          emoji: '🌿', harvestEmoji: '🌿' },
  pepper:     { name: 'Piment',           emoji: '🌶️', harvestEmoji: '🌶️' },
  cucumber:   { name: 'Concombre',        emoji: '🥒', harvestEmoji: '🥒' },
  zucchini:   { name: 'Courgette',        emoji: '🥒', harvestEmoji: '🥒' },
  bean:       { name: 'Haricot',          emoji: '🫘', harvestEmoji: '🫘' },
  pea:        { name: 'Pois',             emoji: '🟢', harvestEmoji: '🟢' },
  spinach:    { name: 'Épinard',          emoji: '🥬', harvestEmoji: '🥬' },
  radish:     { name: 'Radis',            emoji: '🔴', harvestEmoji: '🔴' },
  cabbage:    { name: 'Chou Fleur',       emoji: '🥬', harvestEmoji: '🥬' },
  eggplant:   { name: 'Aubergine',        emoji: '🍆', harvestEmoji: '🍆' },
  squash:     { name: 'Courge',           emoji: '🎃', harvestEmoji: '🎃' },
  parsley:    { name: 'Persil',           emoji: '🌿', harvestEmoji: '🌿' },
  melon:      { name: 'Melon',            emoji: '🍈', harvestEmoji: '🍈' },
  corn:       { name: 'Maïs',             emoji: '🌽', harvestEmoji: '🌽' },
  sunflower:  { name: 'Tournesol',        emoji: '🌻', harvestEmoji: '🌻' },
  quinoa:     { name: 'Quinoa',           emoji: '🌾', harvestEmoji: '🌾' },
  amaranth:   { name: 'Amarante',         emoji: '🌺', harvestEmoji: '🌺' },
  sorrel:     { name: 'Oseille',          emoji: '🥬', harvestEmoji: '🥬' },
  // Petits fruits / haies
  goji:       { name: 'Goji',            emoji: '🍒', harvestEmoji: '🍒' },
  lycium:     { name: 'Lyciet',           emoji: '🍇', harvestEmoji: '🍇' },
  mirabellier:{ name: 'Mirabellier',      emoji: '🫐', harvestEmoji: '🫐' },
  photinia:   { name: 'Photinia',         emoji: '🌿', harvestEmoji: '🌿' },
  eleagnus:   { name: 'Élagnus / Chalef', emoji: '🌾', harvestEmoji: '🌾' },
  laurus:     { name: 'Laurier Sauce',    emoji: '🌿', harvestEmoji: '🌿' },
  cornus:     { name: 'Cornouillier',     emoji: '🌸', harvestEmoji: '🌸' },
  casseille:  { name: 'Casseille',        emoji: '🫐', harvestEmoji: '🫐' },
  // Arbres
  apple:      { name: 'Pommier Reinette', emoji: '🍎', harvestEmoji: '🍎' },
  pear:       { name: 'Poirier Comice',   emoji: '🍐', harvestEmoji: '🍐' },
  cherry:     { name: 'Cerisier',         emoji: '🍒', harvestEmoji: '🍒' },
  hazelnut:   { name: 'Noisetier',        emoji: '🌰', harvestEmoji: '🌰' },
  walnut:     { name: 'Noyer',            emoji: '🌰', harvestEmoji: '🌰' },
  orange:     { name: 'Oranger',          emoji: '🍊', harvestEmoji: '🍊' },
  lemon:      { name: 'Citronnier',       emoji: '🍋', harvestEmoji: '🍋' },
  oak:        { name: 'Chêne',            emoji: '🌳', harvestEmoji: '🌳' },
  birch:      { name: 'Bouleau',          emoji: '🌳', harvestEmoji: '🌳' },
  maple:      { name: 'Érable',          emoji: '🌳', harvestEmoji: '🌳' },
  pine:       { name: 'Pin Sylvestre',    emoji: '🌲', harvestEmoji: '🌲' },
  magnolia:   { name: 'Magnolia',         emoji: '🌸', harvestEmoji: '🌸' },
};

// ═══════════════════════════════════════════════════
//  PLANTES MANQUANTES — ajoutées ici temporairement
//  Ces plantes existent dans PLANTS (ai-engine) mais
//  pas encore dans PLANT_CARDS. Elles seront migrées
//  vers HologramEvolution.tsx ensuite.
// ═══════════════════════════════════════════════════

const SUPPLEMENTARY_CARDS: Record<string, PlantCard> = {
  melon: {
    id: 'melon',
    tBase: 15, tCap: 35,
    stageGDD: [80, 250, 500, 1000],
    kc: 1.05,
    waterNeedMmPerDay: 5.5,
    minSoilTempForSowing: 18,
    optimalSoilTemp: 24,
    lightNeedHours: 9,
    stageDurations: [10, 25, 30, 50],
    companions: [
      { plantId: 'corn', type: 'beneficial', reason: 'Protection contre le vent' },
      { plantId: 'sunflower', type: 'beneficial', reason: 'Ombre partielle' },
    ],
    diseaseRisks: [
      { name: 'Oïdium', emoji: '🌞', triggerConditions: 'HR modérée, T15-25°C', prevention: 'Aérer, éviter excès azote' },
      { name: 'Fusariose', emoji: '🦠', triggerConditions: 'Sol chaud, humidité', prevention: 'Rotation, variétés résistantes' },
    ],
    optimalPlantMonths: [3, 4, 5],
    harvestSeason: ['summer'],
    totalDaysToHarvest: 115,
    plantFamily: 'Cucurbitaceae',
    droughtResistance: 0.40,
    diseaseResistance: 0.35,
    pestResistance: 0.30,
  },
  corn: {
    id: 'corn',
    tBase: 10, tCap: 35,
    stageGDD: [60, 200, 500, 1000],
    kc: 0.85,
    waterNeedMmPerDay: 5.0,
    minSoilTempForSowing: 12,
    optimalSoilTemp: 18,
    lightNeedHours: 8,
    stageDurations: [7, 20, 30, 55],
    companions: [
      { plantId: 'bean', type: 'beneficial', reason: 'Fixation azote pour maïs (Three Sisters)' },
      { plantId: 'squash', type: 'beneficial', reason: 'Couvre-sol (Three Sisters)' },
    ],
    diseaseRisks: [
      { name: 'Rouille', emoji: '🍂', triggerConditions: 'Humidité, temp fraîche', prevention: 'Rotation, variétés résistantes' },
    ],
    optimalPlantMonths: [4, 5],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 112,
    plantFamily: 'Poaceae',
    droughtResistance: 0.50,
    diseaseResistance: 0.55,
    pestResistance: 0.50,
  },
  sunflower: {
    id: 'sunflower',
    tBase: 8, tCap: 35,
    stageGDD: [50, 180, 400, 850],
    kc: 0.75,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 10,
    optimalSoilTemp: 18,
    lightNeedHours: 9,
    stageDurations: [7, 18, 25, 50],
    companions: [
      { plantId: 'corn', type: 'beneficial', reason: 'Brise-vent naturel' },
    ],
    diseaseRisks: [
      { name: 'Sclérotinie', emoji: '🦠', triggerConditions: 'Humidité élevée', prevention: 'Espacement, rotation' },
    ],
    optimalPlantMonths: [4, 5, 6],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 100,
    plantFamily: 'Asteraceae',
    droughtResistance: 0.70,
    diseaseResistance: 0.65,
    pestResistance: 0.60,
  },
  quinoa: {
    id: 'quinoa',
    tBase: 5, tCap: 30,
    stageGDD: [50, 160, 350, 700],
    kc: 0.70,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 15,
    lightNeedHours: 7,
    stageDurations: [7, 20, 30, 50],
    companions: [],
    diseaseRisks: [],
    optimalPlantMonths: [3, 4, 5],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 107,
    plantFamily: 'Amaranthaceae',
    droughtResistance: 0.80,
    diseaseResistance: 0.70,
    pestResistance: 0.65,
  },
  amaranth: {
    id: 'amaranth',
    tBase: 12, tCap: 35,
    stageGDD: [50, 180, 380, 750],
    kc: 0.70,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 15,
    optimalSoilTemp: 22,
    lightNeedHours: 8,
    stageDurations: [7, 18, 25, 45],
    companions: [
      { plantId: 'corn', type: 'beneficial', reason: 'Compagnon de croissance' },
    ],
    diseaseRisks: [],
    optimalPlantMonths: [4, 5, 6],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 95,
    plantFamily: 'Amaranthaceae',
    droughtResistance: 0.75,
    diseaseResistance: 0.65,
    pestResistance: 0.60,
  },
  sorrel: {
    id: 'sorrel',
    tBase: 5, tCap: 25,
    stageGDD: [40, 120, 250, 450],
    kc: 0.65,
    waterNeedMmPerDay: 3.5,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 14,
    lightNeedHours: 5,
    stageDurations: [7, 15, 20, 30],
    companions: [],
    diseaseRisks: [
      { name: 'Rouille', emoji: '🍂', triggerConditions: 'Humidité prolongée', prevention: 'Aérer, espacer les plants' },
    ],
    optimalPlantMonths: [3, 4, 8, 9],
    harvestSeason: ['spring', 'autumn'],
    totalDaysToHarvest: 72,
    plantFamily: 'Polygonaceae',
    droughtResistance: 0.60,
    diseaseResistance: 0.70,
    pestResistance: 0.65,
  },
};

// ═══════════════════════════════════════════════════
//  SEASON MAPPING — mois → saisons (utilisé par PlantDefinition)
// ═══════════════════════════════════════════════════

function monthsToSeasons(months: number[]): string[] {
  const seasons = new Set<string>();
  for (const m of months) {
    if (m <= 1 || m === 11) seasons.add('winter');
    else if (m <= 4) seasons.add('spring');
    else if (m <= 7) seasons.add('summer');
    else seasons.add('autumn');
  }
  return [...seasons];
}

// ═══════════════════════════════════════════════════
//  BUILD PLANTS — construction dynamique depuis PlantCards
// ═══════════════════════════════════════════════════

const ALL_CARDS: Record<string, PlantCard> = {
  ...PLANT_CARDS,
  ...TREE_CARDS,
  ...SUPPLEMENTARY_CARDS,
};

/**
 * Convertit un PlantCard (source de vérité) en PlantDefinition (compatibilité ai-engine).
 * Les valeurs botaniques viennent exclusivement de PlantCard.
 */
function plantCardToDefinition(id: string, card: PlantCard): PlantDefinition {
  const display = DISPLAY_INFO[id] ?? { name: id, emoji: '🌱', harvestEmoji: '🌱' };

  return {
    id,
    name: display.name,
    emoji: display.emoji,
    image: `/cards/card-${id}.png`,
    stageDurations: card.stageDurations,
    optimalTemp: [card.tBase, card.tCap],
    waterNeed: card.waterNeedMmPerDay,
    lightNeed: card.lightNeedHours,
    harvestEmoji: display.harvestEmoji,
    cropCoefficient: card.kc,
    optimalPlantMonths: card.optimalPlantMonths,
    optimalSeasons: monthsToSeasons(card.optimalPlantMonths),
    diseaseResistance: card.diseaseResistance <= 1 ? Math.round(card.diseaseResistance * 100) : card.diseaseResistance,
    pestResistance: card.pestResistance <= 1 ? Math.round(card.pestResistance * 100) : card.pestResistance,
    droughtResistance: card.droughtResistance,
    realDaysToHarvest: card.totalDaysToHarvest,
  };
}

/**
 * PLANTS — construit dynamiquement depuis PLANT_CARDS + TREE_CARDS.
 * C'est la seule version de PLANTS que les consommateurs doivent utiliser.
 * Plus aucune donnée dupliquée dans ai-engine.ts.
 */
export const PLANTS: Record<string, PlantDefinition> = Object.fromEntries(
  Object.entries(ALL_CARDS).map(([id, card]) => [id, plantCardToDefinition(id, card)])
);

/**
 * Récupère une PlantDefinition par ID.
 */
export function getPlantDef(id: string): PlantDefinition | undefined {
  return PLANTS[id];
}

/**
 * Vérifie si un plantDefId existe dans le catalogue.
 */
export function plantExists(id: string): boolean {
  return id in ALL_CARDS;
}

/**
 * Retourne le display info (name, emoji) pour un plantDefId.
 */
export function getPlantDisplay(id: string): { name: string; emoji: string; harvestEmoji: string } {
  return DISPLAY_INFO[id] ?? { name: id, emoji: '🌱', harvestEmoji: '🌱' };
}