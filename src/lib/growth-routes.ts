/**
 * Growth Routes — 3 routes de croissance avec stades, labels, emojis, contenants
 * Centralise les définitions pour jardin, mini-serre et plantules.
 */

import type { GrowthRoute, ContainerType, PlantState } from './ai-engine';
import { PEPINIERE_PLANT_THRESHOLDS, DEFAULT_PEPINIERE_THRESHOLDS } from '@/store/game-store';

// ═══ Stage Labels ═══

export const ROUTE_STAGE_LABELS: Record<GrowthRoute, string[]> = {
  jardin: [
    'Graines en mini-serre',     // STAGE 1 : pot/sachet en mini-serre
    'Levée',                      // STAGE 2 : petite plantule
    'Petits pots',                // STAGE 3 : pots individuels
    'Serre jardin',              // STAGE 4 : pots en serre
    'Pleine terre (post-gel)',   // STAGE 5 : repiquage en sol
    'Plante adulte productive',  // STAGE 6 : mature, productive
  ],
  miniserre: [
    'Graines en mini-serre',     // STAGE 1 : chambre de culture
    'Premières feuilles',        // STAGE 2
    '2-3 feuilles',             // STAGE 3
    '4-5 feuilles',             // STAGE 4
    'Croissance végétative',    // STAGE 5
    'Plante mature, fleur visible', // STAGE 6
  ],
  plantule: [
    'Mini-serre, fleur visible', // STAGE 1 : plant acheté
    'Jeunes fruits (verts)',     // STAGE 2 : en pleine terre
    'Croissance fruits',        // STAGE 3
    'Maturation (véraison)',    // STAGE 4
    'Fruit prêt à cueillir',   // STAGE 5
  ],
  'semis-direct': [
    'Semis en sillons',          // STAGE 0 : graine en terre
    'Levée, cotylédons',         // STAGE 1 : petites feuilles
    'Croissance racine',         // STAGE 2 : racine se forme
    'Racine en gonflement',      // STAGE 3 : racine grossit
    'Racine mature, récolte',    // STAGE 4 : prêt
    'Montée en graine',          // STAGE 5 : fin de cycle
  ],
};

export const ROUTE_STAGE_EMOJIS: Record<GrowthRoute, string[]> = {
  jardin:    ['🌰', '🌱', '🪴', '🏡', '🌿', '🍅'],
  miniserre: ['🌰', '🌱', '🌿', '🌱', '🌿', '🌸'],
  plantule:  ['🌸', '🟢', '📈', '🟠', '🍅'],
  'semis-direct': ['🌰', '🌱', '🌿', '🥕', '🥬', '🌾'],
};

export const ROUTE_MAX_STAGES: Record<GrowthRoute, number> = {
  jardin: 5,    // 6 stages (0-5)
  miniserre: 5, // 6 stages (0-5)
  plantule: 4,  // 5 stages (0-4)
  'semis-direct': 5, // 6 stages (0-5)
};

// ═══ Container Transitions ═══

export const ROUTE_CONTAINER_TRANSITIONS: Record<GrowthRoute, ContainerType[]> = {
  jardin:     ['sachet', 'sachet', 'mini-pot', 'pot-serre', 'sol-jardin', 'sol-jardin'],
  miniserre:  ['miniserre-slot', 'miniserre-slot', 'miniserre-slot', 'miniserre-slot', 'mini-pot', 'mini-pot'],
  plantule:   ['mini-pot', 'sol-jardin', 'sol-jardin', 'sol-jardin', 'sol-jardin'],
  'semis-direct': ['sillons', 'sillons', 'sillons', 'sillons', 'sillons', 'sillons'],
};

// ═══ Visual Stage Computation ═══

/**
 * Route-aware visual stage — replaces getPepiniereStage.
 * Returns 0-based index within the route's stage array.
 */
export function getVisualStage(plant: PlantState): number {
  const route: GrowthRoute = plant.growthRoute || 'jardin';
  const days = plant.daysSincePlanting;
  const defId = plant.plantDefId;

  const thresholds = PEPINIERE_PLANT_THRESHOLDS[defId] || DEFAULT_PEPINIERE_THRESHOLDS;

  if (route === 'plantule') {
    // Plantules skip seed stages; start at flower stage
    // Map using offset from the plantule's starting point (day 20)
    const adjustedDays = days; // daysSincePlanting already includes the 20-day offset
    if (adjustedDays >= thresholds[4]) return 4;
    if (adjustedDays >= thresholds[3]) return 3;
    if (adjustedDays >= thresholds[2]) return 2;
    if (adjustedDays >= thresholds[1]) return 1;
    return 0;
  }

  if (route === 'miniserre') {
    // 5 stages (0-4): compress thresholds
    // Use thresholds 0-4 directly but cap at 4
    if (days >= thresholds[4]) return 4;
    if (days >= thresholds[3]) return 3;
    if (days >= thresholds[2]) return 2;
    if (days >= thresholds[1]) return 1;
    return 0;
  }

  // jardin / semis-direct: 6 stages (0-5)
  if (route === 'semis-direct') {
    // Same threshold logic as jardin but no repotting — stays in sillons
    if (days >= thresholds[4]) return 5;
    if (days >= thresholds[3]) return 4;
    if (days >= thresholds[2]) return 3;
    if (days >= thresholds[1]) return 2;
    if (days >= thresholds[0]) return 1;
    return 0;
  }

  // jardin: 6 stages (0-5) — same as existing getPepiniereStage
  if (days >= thresholds[4]) return 5;
  if (days >= thresholds[3]) return 4;
  if (days >= thresholds[2]) return 3;
  if (days >= thresholds[1]) return 2;
  if (days >= thresholds[0]) return 1;
  return 0;
}

/**
 * Get the stage label for a plant based on its growth route.
 */
export function getRouteStageName(plant: PlantState): string {
  const route: GrowthRoute = plant.growthRoute || 'jardin';
  const stage = getVisualStage(plant);
  const labels = ROUTE_STAGE_LABELS[route];
  return labels[stage] || labels[labels.length - 1] || 'Inconnu';
}

/**
 * Get the stage emoji for a plant based on its growth route.
 */
export function getRouteStageEmoji(plant: PlantState): string {
  const route: GrowthRoute = plant.growthRoute || 'jardin';
  const stage = getVisualStage(plant);
  const emojis = ROUTE_STAGE_EMOJIS[route];
  return emojis[stage] || '🌱';
}

/**
 * Get the expected container type for a plant at its current visual stage.
 */
export function getExpectedContainer(plant: PlantState): ContainerType {
  const route: GrowthRoute = plant.growthRoute || 'jardin';
  const stage = getVisualStage(plant);
  const transitions = ROUTE_CONTAINER_TRANSITIONS[route];
  return transitions[stage] || 'sachet';
}

/**
 * Check if a plant needs repotting (container doesn't match expected).
 */
export function needsRepotting(plant: PlantState): boolean {
  const expected = getExpectedContainer(plant);
  return plant.containerType !== expected;
}

/**
 * Check if a plant can be transplanted to the garden.
 * Only jardin-route plants at stage >= 4 (post-gel) can go to sol-jardin.
 */
export function canTransplantToGarden(plant: PlantState): boolean {
  const route: GrowthRoute = plant.growthRoute || 'jardin';
  if (route === 'miniserre') return false; // mini-serre plants stay in mini-serre
  if (route === 'semis-direct') return false; // already in ground, no transplanting
  const stage = getVisualStage(plant);
  if (route === 'jardin') return stage >= 4;
  if (route === 'plantule') return stage >= 2; // stage 1 = pot, stage 2+ = pleine terre
  return false;
}