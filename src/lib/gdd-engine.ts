// ═══════════════════════════════════════════════════════════
//  🌡️ GDD Engine — Growing Degree Days (Degrés-Jours de Croissance)
//  Sources : FAO, INRAE, Cornell Cooperative Extension
//
//  Principe : les plantes n'avancent pas au chrono mais selon
//  la chaleur accumulée. GDD = Σ max(0, (Tmax+Tmin)/2 - Tbase)
//
//  Pas de bonus fictifs — calcul agronomique exact.
// ═══════════════════════════════════════════════════════════

export interface GDDConfig {
  /** Température de base (°C) — en dessous, croissance nulle */
  tBase: number;
  /** Température plafond (°C) — au dessus, la chaleur n'aide plus */
  tCap: number;
  /** GDD totaux nécessaires pour franchir chaque stade */
  stageGDD: [number, number, number, number];
}

// Données GDD réelles par culture (sources INRAE, FAO, semenciers)
export const PLANT_GDD: Record<string, GDDConfig> = {
  tomato: {
    tBase: 10,   // La tomate stoppe sous 10°C
    tCap: 30,    // Au dessus de 30°C : stress, pas de gain
    stageGDD: [50, 200, 400, 800], // Germination→Plantule→Végétatif→Floraison+Fruit
  },
  carrot: {
    tBase: 4,    // Carotte très rustique
    tCap: 27,
    stageGDD: [80, 250, 500, 900],
  },
  lettuce: {
    tBase: 4,
    tCap: 24,    // Monte vite en graine au dessus
    stageGDD: [40, 120, 220, 380],
  },
  strawberry: {
    tBase: 5,
    tCap: 28,
    stageGDD: [100, 300, 550, 950],
  },
  basil: {
    tBase: 12,   // Très sensible au froid
    tCap: 32,
    stageGDD: [60, 180, 350, 650],
  },
  pepper: {
    tBase: 10,
    tCap: 32,
    stageGDD: [80, 300, 600, 1100],
  },
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
