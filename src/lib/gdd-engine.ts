// ═══════════════════════════════════════════════════════════
//  🌡️ GDD Engine — Growing Degree Days (Degrés-Jours de Croissance)
//  Sources : FAO, INRAE, Cornell Cooperative Extension
//
//  Principe : les plantes n'avancent pas au chrono mais selon
//  la chaleur accumulée. GDD = Σ max(0, (Tmax+Tmin)/2 - Tbase)
//
//  Pas de bonus fictifs — calcul agronomique exact.
//  DONNÉES : issues de PLANT_CARDS (HologramEvolution.tsx)
// ═══════════════════════════════════════════════════════════

import { PLANT_CARDS, TREE_CARDS, type PlantCard } from '@/components/game/HologramEvolution';

export interface GDDConfig {
  /** Température de base (°C) — en dessous, croissance nulle */
  tBase: number;
  /** Température plafond (°C) — au dessus, la chaleur n'aide plus */
  tCap: number;
  /** GDD totaux nécessaires pour franchir chaque stade */
  stageGDD: [number, number, number, number];
}

// Source unique : PLANT_CARDS + TREE_CARDS → PLANT_GDD dérivé
const ALL_CARDS: Record<string, PlantCard> = { ...PLANT_CARDS, ...TREE_CARDS };

// Supplementary plants (melon, corn, sunflower, quinoa, amaranth, sorrel)
// that have GDD data in plant-db.ts but aren't in PLANT_CARDS/TREE_CARDS
const SUPPLEMENTARY_GDD: Record<string, GDDConfig> = {
  melon:      { tBase: 15, tCap: 35, stageGDD: [80, 250, 500, 1000] },
  corn:       { tBase: 10, tCap: 35, stageGDD: [60, 200, 500, 1000] },
  sunflower:  { tBase: 8,  tCap: 34, stageGDD: [50, 180, 400, 800] },
  quinoa:     { tBase: 5,  tCap: 30, stageGDD: [50, 200, 450, 850] },
  amaranth:   { tBase: 12, tCap: 35, stageGDD: [60, 220, 500, 900] },
  sorrel:     { tBase: 3,  tCap: 25, stageGDD: [40, 150, 350, 700] },
};

export const PLANT_GDD: Record<string, GDDConfig> = {
  ...Object.fromEntries(
    Object.entries(ALL_CARDS).map(([id, card]) => [
      id,
      { tBase: card.tBase, tCap: card.tCap, stageGDD: card.stageGDD },
    ])
  ),
  ...SUPPLEMENTARY_GDD,
};

const DEFAULT_GDD: GDDConfig = {
  tBase: 8, tCap: 28,
  stageGDD: [70, 220, 450, 850],
};

/**
 * Calcule les GDD d'une journée selon la méthode standard FAO.
 * Teff = clamp((Tmax + Tmin) / 2, tBase, tCap) - tBase
 */
export function calcDailyGDD(
  tMean: number,
  tMin: number,
  tMax: number,
  config: GDDConfig
): number {
  // Méthode des moyennes — standard agronomique
  const tEff = Math.max(config.tBase, Math.min(config.tCap, tMean));
  return Math.max(0, tEff - config.tBase);
}

/**
 * GDD requis pour atteindre le prochain stade.
 */
export function getStageGDDTarget(plantDefId: string, currentStage: number): number {
  const cfg = PLANT_GDD[plantDefId] || DEFAULT_GDD;
  return cfg.stageGDD[Math.min(currentStage, cfg.stageGDD.length - 1)];
}

/**
 * GDD base pour une culture.
 */
export function getGDDConfig(plantDefId: string): GDDConfig {
  return PLANT_GDD[plantDefId] || DEFAULT_GDD;
}

/**
 * Pourcentage de progression dans le stade actuel basé sur les GDD accumulés.
 * gddAccumulated : GDD cumulés depuis le début du stade actuel.
 */
export function getStageProgressFromGDD(
  plantDefId: string,
  currentStage: number,
  gddAccumulated: number
): number {
  const target = getStageGDDTarget(plantDefId, currentStage);
  if (target <= 0) return 100;
  return Math.min(100, (gddAccumulated / target) * 100);
}
