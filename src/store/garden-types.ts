/**
 * Garden Types & Constants — shared between game-store and garden-store
 *
 * This file breaks the circular dependency:
 *   garden-store imports types from game-store
 *   game-store imports useGardenStore from garden-store
 *
 * By extracting types/constants here, both stores can import from this file
 * without creating a cycle.
 */

import { type PlantState } from '@/lib/ai-engine';

// ═══ Garden Dimensions ═══

export const DEFAULT_GARDEN_WIDTH_CM = 1400;  // 14m de large
export const DEFAULT_GARDEN_HEIGHT_CM = 3900;  // 39m de long = 546m²
export const MAX_GARDEN_WIDTH_CM = 2000;
export const MAX_GARDEN_HEIGHT_CM = 5000;
export const GRID_UNIT_CM = 10;

// ═══ Garden Plant ═══

export interface GardenPlant {
  id: string;
  plantDefId: string;
  x: number;  // position in cm from left
  y: number;  // position in cm from top
  plant: PlantState;
}

// ═══ Serre Zone ═══

export interface SerreZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ═══ Garden Objects ═══

export interface GardenTree {
  id: string;
  type: 'apple' | 'pear' | 'cherry' | 'plum' | 'oak' | 'pine';
  x: number;
  y: number;
  diameter: number;
  age: number;
}

export interface GardenHedge {
  id: string;
  type: 'laurel' | 'cypress' | 'boxwood' | 'bamboo' | 'photinia' | 'eleagnus' | 'laurus' | 'thuja' | 'escallonia';
  x: number;
  y: number;
  length: number;
  orientation: 'horizontal' | 'vertical';
  height: number;
}

export interface GardenTank {
  id: string;
  type: 'water' | 'compost';
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  currentLevel: number;
  name?: string;
  roofAreaM2?: number;
  efficiency?: number;
  color?: string;
  isRainTank?: boolean;
}

export interface GardenShed {
  id: string;
  type: 'tool_shed' | 'garden_shed' | 'storage';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GardenDrum {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
}

export interface GardenZone {
  id: string;
  type: 'uncultivated' | 'cultivated' | 'path' | 'hedge' | 'water_recovery' | 'grass' | 'fleur';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

// ═══ Legacy Grid Cell ═══

export interface GardenCell {
  plant: PlantState | null;
  plantDefId: string | null;
  hasSerre: boolean;
}