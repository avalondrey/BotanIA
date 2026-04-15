/**
 * Growth Routes — 3 routes de croissance avec stades, labels, emojis, contenants
 * Centralise les définitions pour jardin, mini-serre et plantules.
 */

import type { GrowthRoute, ContainerType, PlantState } from './ai-engine';
import { PEPINIERE_PLANT_THRESHOLDS, DEFAULT_PEPINIERE_THRESHOLDS } from '@/store/game-store';

// ═══ Stage Labels ═══

export const ROUTE_STAGE_LABELS: Record<GrowthRoute, string[]> = {
  jardin: [
    'Graines en mini-serre',
    'Levée (petite plantule)',
    'Mini-serre / petits pots',
    'Pot serre jardin',
    'Sol jardin (post-gel)',
    'Plante adulte productive',
  ],
  miniserre: [
    'Graines en mini-serre',
    'Premières feuilles',
    'Croissance végétative',
    'Rempotage mini pots 🪴',
    'Plante mature, fleur visible',
  ],
  plantule: [
    'Plante mature, fleur visible',
    'Jeunes fruits (verts)',
    'Croissance fruits',
    'Maturation (véraison)',
    'Fruit prêt à cueillir',
  ],
};

export const ROUTE_STAGE_EMOJIS: Record<GrowthRoute, string[]> = {
  jardin:    ['🌰', '🌱', '🪴', '🏡', '🌿', '🍅'],
  miniserre: ['🌰', '🌱', '🌿', '🪴', '🌸'],
  plantule:  ['🌸', '🟢', '📈', '🟠', '🔴'],
};

export const ROUTE_MAX_STAGES: Record<GrowthRoute, number> = {
  jardin: 5,    // 6 stages (0-5)
  miniserre: 4, // 5 stages (0-4)
  plantule: 4,  // 5 stages (0-4)
};

// ═══ Container Transitions ═══

export const ROUTE_CONTAINER_TRANSITIONS: Record<GrowthRoute, ContainerType[]> = {
  jardin:     ['sachet', 'sachet', 'mini-pot', 'pot-serre', 'sol-jardin', 'sol-jardin'],
  miniserre:  ['miniserre-slot', 'miniserre-slot', 'miniserre-slot', 'mini-pot', 'mini-pot'],
  plantule:   ['mini-pot', 'mini-pot', 'mini-pot', 'mini-pot', 'mini-pot'],
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
  const stage = getVisualStage(plant);
  if (route === 'jardin') return stage >= 4;
  if (route === 'plantule') return stage >= 1; // plantules can be transplanted early
  return false;
}