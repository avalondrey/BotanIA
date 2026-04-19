/**
 * Game Store — UI state, orchestration, and facade for sub-stores
 *
 * This file was decomposed from a 4,374-line monolith into:
 *   - catalog.ts       — Static catalog data
 *   - shop-store.ts    — Economy, seeds, plantules
 *   - nursery-store.ts — Pépinière, mini-serres, chambres
 *   - garden-store.ts  — Garden plants, objects, zones
 *   - simulation-store.ts — Day cycle, weather, tick
 *
 * game-store.ts now acts as a facade: it holds only UI state and
 * delegates domain actions to the appropriate sub-stores.
 */

import { create } from 'zustand';
import {
  type PlantState,
  type GrowthRoute,
  type AlertData,
  type WeatherData,
  PLANTS,
  PLANT_SPACING,
  createInitialPlantState,
  getSeason,
  getSeasonEmoji,
  getSeasonLabel,
  getSeasonalPlantingAdvice,
  generateWeatherForMonth,
  getMonthFromDay,
  getTodayDayOfYear,
} from '@/lib/ai-engine';

// Growth route utilities (v0.20.0)
export {
  ROUTE_STAGE_LABELS,
  ROUTE_STAGE_EMOJIS,
  ROUTE_MAX_STAGES,
  ROUTE_CONTAINER_TRANSITIONS,
  getVisualStage,
  getRouteStageName,
  getRouteStageEmoji,
  getExpectedContainer,
  needsRepotting,
  canTransplantToGarden,
} from '@/lib/growth-routes';
import {
  type RealWeatherData,
  type GPSCoords,
} from '@/lib/weather-service';
import { useAchievementStore } from './achievement-store';
import { useSoundManager } from '@/lib/sound-manager';
import { triggerVisualEffect } from '@/components/game/VisualEffectManager';

// Sub-stores
import { useShopStore } from './shop-store';
import { useNurseryStore } from './nursery-store';
import { useGardenStore } from './garden-store';
import { useSimulationStore } from './simulation-store';

// Catalog re-exports for backward compatibility
export {
  MINI_SERRE_ROWS,
  MINI_SERRE_COLS,
  MINI_SERRE_PRICE,
  MINI_SERRE_WIDTH_CM,
  MINI_SERRE_DEPTH_CM,
  PLATEAU_ROWS,
  PLATEAU_COLS,
  ETAGERE_PRICE,
  ETAGERE_MAX_PLATEAUX,
  PLATEAU_ADD_PRICE,
  type ChambreModel,
  CHAMBRE_CATALOG,
  type MiniSerre,
  type Etagere,
  createEmptyMiniSerre,
  createEmptyEtagere,
  type SeedShop,
  type SeedVariety,
  SEED_SHOPS,
  PLANTULES_LOCALES,
  SEED_VARIETIES,
  type SeedItem,
  SEED_CATALOG,
  resolveItemImage,
  resolvePacketImage,
  resolveCardImage,
  DEFAULT_BRANDS,
  autoBrandFor,
  autoImagePath,
  EQUIPMENT_CARDS,
  type PlantuleItem,
  PLANTULE_CATALOG,
  loadCustomCards,
} from './catalog';

// ═══ Pepiniere Stages (réalistes) ═══

export const PEPINIERE_STAGE_NAMES = [
  "Monticule de terre",
  "Petite plantule",
  "Plantule 2 feuilles",
  "Plantule 4 feuilles",
  "Plantule 5 feuilles",
  "Floraison",
];

export function getStageImage(plantDefId: string, stage: number, route?: string): string {
  // Graines en mini-serre → /plantules/ (6 stades: 1-6)
  // Plantules du shop → /plantules/ (5 stades: 1-5)
  // Jardin / semis-direct → /plants/ (6 stades: 1-6)
  // Arbres → /trees/ (5 stades: 1-5)
  if (route === 'miniserre') {
    // Mini-serre: stage 0-5 → filenames 1-6
    return `/plantules/${plantDefId}-stage-${Math.min(stage, 5) + 1}.png`;
  }
  if (route === 'plantule') {
    // Plantules du shop: stage 0-4 → filenames 1-5
    return `/plantules/${plantDefId}-stage-${Math.min(stage, 4) + 1}.png`;
  }
  if (route === 'tree') {
    // Arbres: stage 0-4 → filenames 1-5
    return `/trees/${plantDefId}-stage-${Math.min(stage, 4) + 1}.png`;
  }
  // Jardin / semis-direct: stage 0-5 → filenames 1-6
  return `/plants/${plantDefId}-stage-${Math.min(stage, 5) + 1}.png`;
}

export const PEPINIERE_PLANT_THRESHOLDS: Record<string, number[]> = {
  tomato:      [4, 8, 15, 24, 40],
  carrot:      [6, 12, 20, 32, 50],
  lettuce:     [3, 6, 10, 16, 25],
  strawberry:  [12, 20, 30, 42, 55],
  basil:       [5, 9, 14, 22, 30],
  pepper:      [8, 14, 22, 35, 55],
};

export const DEFAULT_PEPINIERE_THRESHOLDS = [5, 10, 18, 28, 45];

export const PEPINIERE_STAGES = [
  { name: "Monticule de terre", minDays: 0, maxDays: 5 },
  { name: "Petite plantule", minDays: 5, maxDays: 10 },
  { name: "Plantule 2 feuilles", minDays: 10, maxDays: 18 },
  { name: "Plantule 4 feuilles", minDays: 18, maxDays: 28 },
  { name: "Plantule 5 feuilles", minDays: 28, maxDays: 45 },
  { name: "Pret a transplanter", minDays: 45, maxDays: Infinity },
];

export function getPepiniereStage(daysSincePlanting: number, plantDefId?: string): number {
  const thresholds = plantDefId
    ? (PEPINIERE_PLANT_THRESHOLDS[plantDefId] || DEFAULT_PEPINIERE_THRESHOLDS)
    : DEFAULT_PEPINIERE_THRESHOLDS;
  if (daysSincePlanting >= thresholds[4]) return 5;
  if (daysSincePlanting >= thresholds[3]) return 4;
  if (daysSincePlanting >= thresholds[2]) return 3;
  if (daysSincePlanting >= thresholds[1]) return 2;
  if (daysSincePlanting >= thresholds[0]) return 1;
  return 0;
}

export function getPepiniereTransplantDay(plantDefId: string): number {
  return (PEPINIERE_PLANT_THRESHOLDS[plantDefId] || DEFAULT_PEPINIERE_THRESHOLDS)[4];
}

// ═══ Garden types & constants — imported from garden-types.ts, re-exported for backward compat ═══

import {
  type GardenPlant,
  type SerreZone,
  type GardenTree,
  type GardenHedge,
  type GardenTank,
  type GardenShed,
  type GardenDrum,
  type GardenZone,
  type GardenCell,
  DEFAULT_GARDEN_WIDTH_CM,
  DEFAULT_GARDEN_HEIGHT_CM,
  MAX_GARDEN_WIDTH_CM,
  MAX_GARDEN_HEIGHT_CM,
  GRID_UNIT_CM,
} from './garden-types';

export {
  type GardenPlant,
  type SerreZone,
  type GardenTree,
  type GardenHedge,
  type GardenTank,
  type GardenShed,
  type GardenDrum,
  type GardenZone,
  type GardenCell,
  DEFAULT_GARDEN_WIDTH_CM,
  DEFAULT_GARDEN_HEIGHT_CM,
  MAX_GARDEN_WIDTH_CM,
  MAX_GARDEN_HEIGHT_CM,
  GRID_UNIT_CM,
};

// ═══ HologramSettings (shared by nursery-store) ═══

export interface HologramSettings {
  rotationEnabled: boolean;
  rotationSpeed: number;
  auraIntensity: number;
  particlesEnabled: boolean;
}

// ═══ Game State — facade that composes sub-stores ═══

export interface GameState {
  // ── Garden (delegated to garden-store) ──
  gardenWidthCm: number;
  gardenHeightCm: number;
  gardenPlants: GardenPlant[];
  gardenSerreZones: SerreZone[];
  gardenTrees: GardenTree[];
  gardenHedges: GardenHedge[];
  gardenTanks: GardenTank[];
  gardenSheds: GardenShed[];
  gardenDrums: GardenDrum[];
  gardenZones: GardenZone[];

  // ── Nursery (delegated to nursery-store) ──
  pepiniere: PlantState[];
  miniSerres: import('./catalog').MiniSerre[];
  etageres: import('./catalog').Etagere[];
  ownedChambres: Record<string, number>;
  activeChambreId: string | null;
  selectedMiniSerreId: string | null;
  selectedSlot: { row: number; col: number } | null;
  hologramSettings: HologramSettings;
  serreTiles: number;

  // ── Shop (delegated to shop-store) ──
  seedCollection: Record<string, number>;
  plantuleCollection: Record<string, number>;
  seedVarieties: Record<string, number>;
  unlockedVarieties: Record<string, boolean>;
  coins: number;
  ecoPoints: number;
  ecoLevel: number;
  score: number;
  bestScore: number;

  // ── Simulation (delegated to simulation-store) ──
  day: number;
  season: string;
  weather: WeatherData;
  realWeather: RealWeatherData | null;
  gpsCoords: GPSCoords | null;
  weatherLoading: boolean;
  weatherError: string | null;
  speed: number;
  isPaused: boolean;
  alerts: AlertData[];
  harvested: number;

  // ── Discovered plants (via photo identification) ──
  discoveredPlants: Array<{ id: string; name: string; emoji: string; discoveredAt: number; source: 'photo' | 'manual' }>;

  // ── UI State (owned by game-store) ──
  showConsole: boolean;
  adminOpen: boolean;
  adminMode: boolean;
  diseasesEnabled: boolean;
  showGardenSerre: boolean;
  showSerreView: boolean;
  activeTab: string;
  pendingTransplant: { serreId: string; row: number; col: number; plantDefId: string; plantName: string; plantEmoji: string } | null;
  activeSlot: string | null;
  autoSaveEnabled: boolean;

  // ── Actions — Shop ──
  buySeeds: (itemIdOrPlantDefId: string) => boolean;
  buyPlantule: (plantDefId: string) => boolean;
  buySeedVariety: (varietyId: string) => boolean;
  openSeedPacket: (varietyId: string) => boolean;
  unlockSeedVariety: (varietyId: string) => boolean;
  addEcoPoints: (points: number) => void;
  addScore: (points: number) => void;
  deductCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;

  // ── Actions — Nursery ──
  buySerreTile: () => boolean;
  buyMiniSerre: () => boolean;
  buyChambreDeCulture: (modelId: string) => boolean;
  setActiveChambre: (modelId: string | null) => void;
  placeSeedInPepiniere: (plantDefId: string, growthRoute?: GrowthRoute) => boolean;
  placePlantuleInPepiniere: (plantDefId: string) => boolean;
  waterPlantPepiniere: (index: number) => void;
  treatPlantPepiniere: (index: number) => void;
  fertilizePlantPepiniere: (index: number) => void;
  removePlantPepiniere: (index: number) => void;
  placeSeedInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string, growthRoute?: GrowthRoute) => boolean;
  placePlantuleInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => boolean;
  rempoterMiniSerre: (serreId: string, row: number, col: number) => boolean;
  waterMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  treatMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  fertilizeMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  removeMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  waterAllMiniSerre: (serreId: string) => void;
  removeMiniSerre: (serreId: string) => void;
  fillMiniSerre: (serreId: string, plantDefId: string) => boolean;
  plantInMiniSerreAtDate: (serreId: string, row: number, col: number, plantDefId: string, daysSincePlanting: number) => boolean;
  setSelectedSlot: (serreId: string, slot: { row: number; col: number } | null) => void;
  updateHologramSettings: (settings: Partial<HologramSettings>) => void;

  // ── Actions — Étagères & Plateaux ──
  buyEtagere: () => boolean;
  addPlateauToEtagere: (etagereId: string) => boolean;
  removeEtagere: (etagereId: string) => void;
  placePlantuleOnPlateau: (etagereId: string, plateauIdx: number, row: number, col: number, plantDefId: string) => boolean;
  removeFromPlateau: (etagereId: string, plateauIdx: number, row: number, col: number) => void;
  waterAllPlateau: (etagereId: string, plateauIdx: number) => void;

  // ── Actions — Garden ──
  placePlantInGarden: (plantDefId: string, x: number, y: number, pepIndex?: number) => boolean;
  placeRowInGarden: (plantDefId: string, startX: number, startY: number, endX: number, endY: number, pepIndices?: number[]) => number;
  removePlantFromGarden: (plantId: string) => void;
  waterPlantGarden: (plantId: string) => void;
  treatPlantGarden: (plantId: string) => void;
  fertilizePlantGarden: (plantId: string) => void;
  harvestPlantGarden: (plantId: string) => void;
  waterAllGarden: () => void;
  addSerreZone: (x: number, y: number, width: number, height: number, price?: number) => boolean;
  buySerreZone: () => boolean;
  buyShed: (cost: number) => boolean;
  buyTank: (capacity: number, cost: number) => boolean;
  buyTree: (cost: number) => boolean;
  buyHedge: (cost: number, hedgeType?: GardenHedge['type']) => boolean;
  buyDrum: (cost: number) => boolean;
  removeSerreZone: (zoneId: string) => void;
  removeGardenShed: (id: string) => void;
  removeGardenTank: (id: string) => void;
  removeGardenDrum: (id: string) => void;
  removeGardenTree: (id: string) => void;
  removeGardenHedge: (id: string) => void;
  removeGardenZone: (id: string) => void;
  moveSerreZone: (zoneId: string, newX: number, newY: number) => void;
  moveGardenPlant: (plantId: string, newX: number, newY: number) => void;
  moveGardenShed: (id: string, newX: number, newY: number) => void;
  moveGardenTank: (id: string, newX: number, newY: number) => void;
  moveGardenDrum: (id: string, newX: number, newY: number) => void;
  moveGardenTree: (id: string, newX: number, newY: number) => void;
  moveGardenHedge: (id: string, newX: number, newY: number) => void;
  moveGardenZone: (id: string, newX: number, newY: number) => void;
  resizeGardenZone: (id: string, newX: number, newY: number, newW: number, newH: number) => void;
  addGardenZone: (x: number, y: number, width: number, height: number, type?: GardenZone['type']) => void;
  expandGarden: (direction: 'width' | 'height') => boolean;
  transplantFromMiniSerreToGarden: (serreId: string, row: number, col: number, gardenX: number, gardenY: number) => boolean;

  // ── Actions — Simulation ──
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  tick: () => void;
  setRealWeather: (data: RealWeatherData) => void;
  setGPSCoords: (coords: GPSCoords) => void;
  setWeatherLoading: (loading: boolean) => void;
  setWeatherError: (error: string | null) => void;
  dismissAlert: (alertId: string) => void;

  // ── Actions — UI ──
  toggleConsole: () => void;
  toggleAdminMode: () => void;
  toggleDiseases: () => void;
  toggleGardenSerre: () => void;
  toggleSerreView: () => void;
  setActiveTab: (tab: string) => void;
  setPendingTransplant: (data: { serreId: string; row: number; col: number; plantDefId: string; plantName: string; plantEmoji: string } | null) => void;

  // ── Actions — Save ──
  setActiveSlot: (slotId: string | null) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  loadGameState: (state: any) => void;

  // ── Actions — Init ──
  initGame: (freshStart?: boolean) => void;

  // ── Internal helpers ──
  _getSeedCount: (plantDefId: string) => number;
  _consumeSeed: (plantDefId: string) => { source: 'variety' | 'classic'; newVarieties: Record<string, number> | null; newCollection: Record<string, number> | null } | null;

  // ── Digital Twin ──
  createDigitalTwinInGarden: (
    plantDefId: string,
    x: number,
    y: number,
    scanData: {
      plantName: string;
      confidence: number;
      growthStage?: { stage: number; estimatedAge: number };
      healthStatus?: { isHealthy: boolean; diseaseName: string };
    }
  ) => { success: boolean; message: string; rewards: any };

  // ── Garden Object add (used by GardenPlanView) ──
  addGardenShed: (x: number, y: number) => void;
  addGardenTank: (x: number, y: number, capacity?: number) => void;
  addGardenTree: (x: number, y: number, treeType?: GardenTree['type']) => void;
  addGardenHedge: (x: number, y: number, length?: number, orientation?: 'horizontal' | 'vertical') => void;
  addGardenDrum: (x: number, y: number) => void;
}

// ═══ Helper ═══

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ═══ Store — Facade composing sub-stores ═══
//
// State is read from sub-stores. Actions delegate to sub-stores.
// UI-only state lives here.

export const useGameStore = create<GameState>((set, get) => ({
  // ── State — delegated from sub-stores (initial defaults, synced on initGame) ──

  gardenWidthCm: DEFAULT_GARDEN_WIDTH_CM,
  gardenHeightCm: DEFAULT_GARDEN_HEIGHT_CM,
  gardenPlants: [],
  gardenSerreZones: [],
  gardenTrees: [],
  gardenHedges: [],
  gardenTanks: [],
  gardenSheds: [],
  gardenDrums: [],
  gardenZones: [],

  pepiniere: [],
  miniSerres: [],
  etageres: [],
  ownedChambres: {},
  activeChambreId: null,
  selectedMiniSerreId: null,
  selectedSlot: null,
  hologramSettings: { rotationEnabled: true, rotationSpeed: 1, auraIntensity: 0.5, particlesEnabled: true },
  serreTiles: 0,

  seedCollection: { tomato: 3, carrot: 2, strawberry: 2, lettuce: 3, basil: 2, pepper: 1 },
  plantuleCollection: {},
  seedVarieties: {},
  unlockedVarieties: {},
  coins: 200,
  ecoPoints: 0,
  ecoLevel: 0,
  score: 0,
  bestScore: 0,

  day: getTodayDayOfYear(),
  season: getSeason(getTodayDayOfYear()),
  weather: { type: 'sunny', emoji: '☀️', label: 'Ensoleillé', tempMod: 1.1, waterMod: 1.3, lightMod: 1.3, growthMod: 1.1 } as WeatherData,
  realWeather: null,
  gpsCoords: null,
  weatherLoading: false,
  weatherError: null,
  speed: 0,
  isPaused: false,
  alerts: [],
  harvested: 0,

  // ── Discovered plants ──
  discoveredPlants: [],

  // ── UI State ──
  showConsole: true,
  adminOpen: false,
  adminMode: false,
  diseasesEnabled: true,
  showGardenSerre: false,
  showSerreView: false,
  activeTab: "jardin",
  pendingTransplant: null,
  activeSlot: null,
  autoSaveEnabled: true,

  // ═══════════════════════════════════════════
  // ── Actions — Shop (delegated to shop-store) ──
  // ═══════════════════════════════════════════

  buySeeds: (itemIdOrPlantDefId: string) => {
    const result = useShopStore.getState().buySeeds(itemIdOrPlantDefId);
    if (result) {
      const shop = useShopStore.getState();
      set({ seedCollection: shop.seedCollection, coins: shop.coins });
    }
    return result;
  },

  buyPlantule: (plantDefId: string) => {
    const result = useShopStore.getState().buyPlantule(plantDefId);
    if (result) {
      const shop = useShopStore.getState();
      set({ plantuleCollection: shop.plantuleCollection, coins: shop.coins });
    }
    return result;
  },

  buySeedVariety: (varietyId: string) => {
    const result = useShopStore.getState().buySeedVariety(varietyId);
    if (result) {
      const shop = useShopStore.getState();
      set({ seedVarieties: shop.seedVarieties, coins: shop.coins, unlockedVarieties: shop.unlockedVarieties });
    }
    return result;
  },

  openSeedPacket: (varietyId: string) => {
    const result = useShopStore.getState().openSeedPacket(varietyId);
    if (result) {
      const shop = useShopStore.getState();
      set({ seedVarieties: shop.seedVarieties, seedCollection: shop.seedCollection });
    }
    return result;
  },

  unlockSeedVariety: (varietyId: string) => {
    return useShopStore.getState().unlockSeedVariety(varietyId);
  },

  addEcoPoints: (points: number) => {
    useShopStore.getState().addEcoPoints(points);
    const shop = useShopStore.getState();
    set({ ecoPoints: shop.ecoPoints, ecoLevel: shop.ecoLevel });
  },

  addScore: (points: number) => {
    useShopStore.getState().addScore(points);
    const shop = useShopStore.getState();
    set({ score: shop.score, bestScore: shop.bestScore });
  },

  deductCoins: (amount: number) => {
    return useShopStore.getState().deductCoins(amount);
  },

  addCoins: (amount: number) => {
    useShopStore.getState().addCoins(amount);
    set({ coins: useShopStore.getState().coins });
  },

  // ═══════════════════════════════════════════
  // ── Actions — Nursery (delegated to nursery-store) ──
  // ═══════════════════════════════════════════

  buySerreTile: () => {
    const result = useNurseryStore.getState().buySerreTile();
    if (result) {
      const nursery = useNurseryStore.getState();
      set({ serreTiles: nursery.serreTiles, coins: useShopStore.getState().coins });
    }
    return result;
  },

  buyMiniSerre: () => {
    const result = useNurseryStore.getState().buyMiniSerre();
    if (result) {
      const nursery = useNurseryStore.getState();
      set({ miniSerres: nursery.miniSerres, etageres: nursery.etageres, coins: useShopStore.getState().coins });
    }
    return result;
  },

  buyChambreDeCulture: (modelId: string) => {
    const result = useNurseryStore.getState().buyChambreDeCulture(modelId);
    if (result) {
      const nursery = useNurseryStore.getState();
      set({ ownedChambres: nursery.ownedChambres, activeChambreId: nursery.activeChambreId, coins: useShopStore.getState().coins });
    }
    return result;
  },

  setActiveChambre: (modelId: string | null) => {
    useNurseryStore.getState().setActiveChambre(modelId);
    set({ activeChambreId: useNurseryStore.getState().activeChambreId });
  },

  placeSeedInPepiniere: (plantDefId: string, growthRoute?: GrowthRoute) => {
    const result = useNurseryStore.getState().placeSeedInPepiniere(plantDefId, growthRoute);
    if (result) {
      set({
        pepiniere: useNurseryStore.getState().pepiniere,
        seedCollection: useShopStore.getState().seedCollection,
      });
    }
    return result;
  },

  placePlantuleInPepiniere: (plantDefId: string) => {
    const result = useNurseryStore.getState().placePlantuleInPepiniere(plantDefId);
    if (result) {
      set({
        pepiniere: useNurseryStore.getState().pepiniere,
        plantuleCollection: useShopStore.getState().plantuleCollection,
      });
    }
    return result;
  },

  waterPlantPepiniere: (index: number) => {
    useNurseryStore.getState().waterPlantPepiniere(index);
    set({ pepiniere: useNurseryStore.getState().pepiniere });
  },

  treatPlantPepiniere: (index: number) => {
    useNurseryStore.getState().treatPlantPepiniere(index);
    set({ pepiniere: useNurseryStore.getState().pepiniere });
  },

  fertilizePlantPepiniere: (index: number) => {
    useNurseryStore.getState().fertilizePlantPepiniere(index);
    set({ pepiniere: useNurseryStore.getState().pepiniere });
  },

  removePlantPepiniere: (index: number) => {
    useNurseryStore.getState().removePlantPepiniere(index);
    set({ pepiniere: useNurseryStore.getState().pepiniere });
  },

  placeSeedInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string, growthRoute?: GrowthRoute) => {
    const result = useNurseryStore.getState().placeSeedInMiniSerre(serreId, row, col, plantDefId, growthRoute);
    if (result) {
      set({
        miniSerres: useNurseryStore.getState().miniSerres,
        seedCollection: useShopStore.getState().seedCollection,
        seedVarieties: useShopStore.getState().seedVarieties,
      });
    }
    return result;
  },

  placePlantuleInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => {
    const result = useNurseryStore.getState().placePlantuleInMiniSerre(serreId, row, col, plantDefId);
    if (result) {
      set({
        miniSerres: useNurseryStore.getState().miniSerres,
        plantuleCollection: useShopStore.getState().plantuleCollection,
      });
    }
    return result;
  },

  rempoterMiniSerre: (serreId: string, row: number, col: number) => {
    const result = useNurseryStore.getState().rempoterMiniSerre(serreId, row, col);
    if (result) {
      set({ miniSerres: useNurseryStore.getState().miniSerres });
    }
    return result;
  },

  waterMiniSerrePlant: (serreId: string, row: number, col: number) => {
    useNurseryStore.getState().waterMiniSerrePlant(serreId, row, col);
    set({ miniSerres: useNurseryStore.getState().miniSerres });
  },

  treatMiniSerrePlant: (serreId: string, row: number, col: number) => {
    useNurseryStore.getState().treatMiniSerrePlant(serreId, row, col);
    set({ miniSerres: useNurseryStore.getState().miniSerres });
  },

  fertilizeMiniSerrePlant: (serreId: string, row: number, col: number) => {
    useNurseryStore.getState().fertilizeMiniSerrePlant(serreId, row, col);
    set({ miniSerres: useNurseryStore.getState().miniSerres });
  },

  removeMiniSerrePlant: (serreId: string, row: number, col: number) => {
    useNurseryStore.getState().removeMiniSerrePlant(serreId, row, col);
    set({ miniSerres: useNurseryStore.getState().miniSerres });
  },

  waterAllMiniSerre: (serreId: string) => {
    useNurseryStore.getState().waterAllMiniSerre(serreId);
    set({ miniSerres: useNurseryStore.getState().miniSerres });
  },

  removeMiniSerre: (serreId: string) => {
    useNurseryStore.getState().removeMiniSerre(serreId);
    set({ miniSerres: useNurseryStore.getState().miniSerres });
  },

  fillMiniSerre: (serreId: string, plantDefId: string) => {
    const result = useNurseryStore.getState().fillMiniSerre(serreId, plantDefId);
    if (result) {
      const nursery = useNurseryStore.getState();
      const shop = useShopStore.getState();
      set({ miniSerres: nursery.miniSerres, etageres: nursery.etageres, seedCollection: shop.seedCollection, seedVarieties: shop.seedVarieties, unlockedVarieties: shop.unlockedVarieties });
    }
    return result;
  },

  plantInMiniSerreAtDate: (serreId: string, row: number, col: number, plantDefId: string, daysSincePlanting: number) => {
    const result = useNurseryStore.getState().plantInMiniSerreAtDate(serreId, row, col, plantDefId, daysSincePlanting);
    if (result) {
      const nursery = useNurseryStore.getState();
      const shop = useShopStore.getState();
      const updates: Record<string, unknown> = { miniSerres: nursery.miniSerres, etageres: nursery.etageres };
      if (shop.seedCollection !== get().seedCollection) updates.seedCollection = shop.seedCollection;
      if (shop.seedVarieties !== get().seedVarieties) updates.seedVarieties = shop.seedVarieties;
      set(updates);
    }
    return result;
  },

  setSelectedSlot: (serreId: string, slot: { row: number; col: number } | null) => {
    useNurseryStore.getState().setSelectedSlot(serreId, slot);
    const nursery = useNurseryStore.getState();
    set({ selectedMiniSerreId: nursery.selectedMiniSerreId, selectedSlot: nursery.selectedSlot });
  },

  updateHologramSettings: (settings: Partial<HologramSettings>) => {
    useNurseryStore.getState().updateHologramSettings(settings);
    set({ hologramSettings: useNurseryStore.getState().hologramSettings });
  },

  // ═══════════════════════════════════════════
  // ── Actions — Étagères & Plateaux (delegated to nursery-store) ──
  // ═══════════════════════════════════════════

  buyEtagere: () => {
    const result = useNurseryStore.getState().buyEtagere();
    if (result) {
      set({ etageres: useNurseryStore.getState().etageres, coins: useShopStore.getState().coins });
    }
    return result;
  },

  addPlateauToEtagere: (etagereId: string) => {
    const result = useNurseryStore.getState().addPlateauToEtagere(etagereId);
    if (result) {
      set({ etageres: useNurseryStore.getState().etageres, coins: useShopStore.getState().coins });
    }
    return result;
  },

  removeEtagere: (etagereId: string) => {
    useNurseryStore.getState().removeEtagere(etagereId);
    set({ etageres: useNurseryStore.getState().etageres });
  },

  placePlantuleOnPlateau: (etagereId: string, plateauIdx: number, row: number, col: number, plantDefId: string) => {
    const result = useNurseryStore.getState().placePlantuleOnPlateau(etagereId, plateauIdx, row, col, plantDefId);
    if (result) {
      const nursery = useNurseryStore.getState();
      const shop = useShopStore.getState();
      set({ etageres: nursery.etageres, plantuleCollection: shop.plantuleCollection });
    }
    return result;
  },

  removeFromPlateau: (etagereId: string, plateauIdx: number, row: number, col: number) => {
    useNurseryStore.getState().removeFromPlateau(etagereId, plateauIdx, row, col);
    set({ etageres: useNurseryStore.getState().etageres });
  },

  waterAllPlateau: (etagereId: string, plateauIdx: number) => {
    useNurseryStore.getState().waterAllPlateau(etagereId, plateauIdx);
    set({ etageres: useNurseryStore.getState().etageres });
  },

  // ═══════════════════════════════════════════
  // ── Actions — Garden (delegated to garden-store) ──
  // ═══════════════════════════════════════════

  placePlantInGarden: (plantDefId: string, x: number, y: number, pepIndex?: number) => {
    const state = get();
    const result = useGardenStore.getState().placePlantInGarden(plantDefId, x, y, pepIndex, state.adminMode, state.realWeather);
    if (result) {
      const garden = useGardenStore.getState();
      const nursery = useNurseryStore.getState();
      const shop = useShopStore.getState();
      set({
        gardenPlants: garden.gardenPlants,
        pepiniere: nursery.pepiniere,
        seedCollection: shop.seedCollection,
      });
      useSoundManager.getState().playEventSound('plant');
    }
    return result;
  },

  placeRowInGarden: (plantDefId: string, startX: number, startY: number, endX: number, endY: number, pepIndices?: number[]) => {
    const state = get();
    const result = useGardenStore.getState().placeRowInGarden(plantDefId, startX, startY, endX, endY, pepIndices);
    if (result > 0) {
      const garden = useGardenStore.getState();
      const nursery = useNurseryStore.getState();
      set({
        gardenPlants: garden.gardenPlants,
        pepiniere: nursery.pepiniere,
      });
    }
    return result;
  },

  removePlantFromGarden: (plantId: string) => {
    useGardenStore.getState().removePlantFromGarden(plantId);
    set({ gardenPlants: useGardenStore.getState().gardenPlants });
  },

  waterPlantGarden: (plantId: string) => {
    useGardenStore.getState().waterPlantGarden(plantId);
    set({ gardenPlants: useGardenStore.getState().gardenPlants });
  },

  treatPlantGarden: (plantId: string) => {
    useGardenStore.getState().treatPlantGarden(plantId);
    set({ gardenPlants: useGardenStore.getState().gardenPlants });
  },

  fertilizePlantGarden: (plantId: string) => {
    useGardenStore.getState().fertilizePlantGarden(plantId);
    set({ gardenPlants: useGardenStore.getState().gardenPlants });
  },

  harvestPlantGarden: (plantId: string) => {
    const garden = useGardenStore.getState();
    const gp = garden.gardenPlants.find((p) => p.id === plantId);
    if (!gp) return;

    useGardenStore.getState().harvestPlantGarden(plantId);

    const plantDef = PLANTS[gp.plantDefId];
    // Base harvest reward: 3 coins per harvest action
    const harvestReward = 3;

    // Add base reward + score
    useShopStore.getState().addScore(20);
    useShopStore.getState().addCoins(harvestReward);

    // Add harvested produce to sellable inventory (economy-store)
    try {
      const { useEconomyStore } = require('@/store/economy-store');
      useEconomyStore.getState().addHarvestInventory(gp.plantDefId);
      useEconomyStore.getState().trackHarvest();
    } catch {}

    const totalHarvested = get().harvested + 1;
    if (totalHarvested >= 50) {
      useAchievementStore.getState().unlockAchievement('green_thumb');
    }

    useSoundManager.getState().playEventSound('harvest');
    triggerVisualEffect("success-pop");

    set({
      gardenPlants: useGardenStore.getState().gardenPlants,
      harvested: totalHarvested,
      score: useShopStore.getState().score,
      bestScore: useShopStore.getState().bestScore,
      coins: useShopStore.getState().coins,
      alerts: [
        ...get().alerts.slice(-25),
        {
          id: `harvest-reward-${Date.now()}`,
          type: "harvest" as const,
          message: `${plantDef?.harvestEmoji || "🌿"} Récolte ! +${harvestReward} 🪙 · Vendre au marché pour plus`,
          emoji: "💰", cellX: 0, cellY: 0,
          timestamp: Date.now(), severity: "info" as const,
        },
      ],
    });
  },

  waterAllGarden: () => {
    useGardenStore.getState().waterAllGarden();
    set({ gardenPlants: useGardenStore.getState().gardenPlants });
  },

  addSerreZone: (x: number, y: number, width: number, height: number, price: number = 200) => {
    const result = useGardenStore.getState().addSerreZone(x, y, width, height, price);
    if (result) {
      const garden = useGardenStore.getState();
      set({ gardenSerreZones: garden.gardenSerreZones, showGardenSerre: true, coins: useShopStore.getState().coins });
    }
    return result;
  },

  buySerreZone: () => {
    const result = useGardenStore.getState().buySerreZone();
    if (result) {
      const garden = useGardenStore.getState();
      set({ gardenSerreZones: garden.gardenSerreZones, coins: useShopStore.getState().coins, showGardenSerre: true });
    }
    return result;
  },

  buyShed: (cost: number) => {
    const result = useGardenStore.getState().buyShed(cost);
    if (result) {
      set({ gardenSheds: useGardenStore.getState().gardenSheds, coins: useShopStore.getState().coins });
    }
    return result;
  },

  buyTank: (capacity: number, cost: number) => {
    const result = useGardenStore.getState().buyTank(capacity, cost);
    if (result) {
      set({ gardenTanks: useGardenStore.getState().gardenTanks, coins: useShopStore.getState().coins });
    }
    return result;
  },

  buyTree: (cost: number) => {
    const result = useGardenStore.getState().buyTree(cost);
    if (result) {
      set({ gardenTrees: useGardenStore.getState().gardenTrees, coins: useShopStore.getState().coins });
    }
    return result;
  },

  buyHedge: (cost: number, hedgeType?: GardenHedge['type']) => {
    const result = useGardenStore.getState().buyHedge(cost, hedgeType);
    if (result) {
      set({ gardenHedges: useGardenStore.getState().gardenHedges, coins: useShopStore.getState().coins });
    }
    return result;
  },

  buyDrum: (cost: number) => {
    const result = useGardenStore.getState().buyDrum(cost);
    if (result) {
      set({ gardenDrums: useGardenStore.getState().gardenDrums, coins: useShopStore.getState().coins });
    }
    return result;
  },

  removeSerreZone: (zoneId: string) => {
    useGardenStore.getState().removeSerreZone(zoneId);
    set({ gardenSerreZones: useGardenStore.getState().gardenSerreZones });
  },

  removeGardenShed: (id: string) => {
    useGardenStore.getState().removeGardenShed(id);
    set({ gardenSheds: useGardenStore.getState().gardenSheds });
  },

  removeGardenTank: (id: string) => {
    useGardenStore.getState().removeGardenTank(id);
    set({ gardenTanks: useGardenStore.getState().gardenTanks });
  },

  removeGardenDrum: (id: string) => {
    useGardenStore.getState().removeGardenDrum(id);
    set({ gardenDrums: useGardenStore.getState().gardenDrums });
  },

  removeGardenTree: (id: string) => {
    useGardenStore.getState().removeGardenTree(id);
    set({ gardenTrees: useGardenStore.getState().gardenTrees });
  },

  removeGardenHedge: (id: string) => {
    useGardenStore.getState().removeGardenHedge(id);
    set({ gardenHedges: useGardenStore.getState().gardenHedges });
  },

  removeGardenZone: (id: string) => {
    useGardenStore.getState().removeGardenZone(id);
    set({ gardenZones: useGardenStore.getState().gardenZones });
  },

  moveSerreZone: (zoneId: string, newX: number, newY: number) => {
    useGardenStore.getState().moveSerreZone(zoneId, newX, newY);
    set({ gardenSerreZones: useGardenStore.getState().gardenSerreZones });
  },

  moveGardenPlant: (plantId: string, newX: number, newY: number) => {
    useGardenStore.getState().moveGardenPlant(plantId, newX, newY);
    set({ gardenPlants: useGardenStore.getState().gardenPlants });
  },

  moveGardenShed: (id: string, newX: number, newY: number) => {
    useGardenStore.getState().moveGardenShed(id, newX, newY);
    set({ gardenSheds: useGardenStore.getState().gardenSheds });
  },

  moveGardenTank: (id: string, newX: number, newY: number) => {
    useGardenStore.getState().moveGardenTank(id, newX, newY);
    set({ gardenTanks: useGardenStore.getState().gardenTanks });
  },

  moveGardenDrum: (id: string, newX: number, newY: number) => {
    useGardenStore.getState().moveGardenDrum(id, newX, newY);
    set({ gardenDrums: useGardenStore.getState().gardenDrums });
  },

  moveGardenTree: (id: string, newX: number, newY: number) => {
    useGardenStore.getState().moveGardenTree(id, newX, newY);
    set({ gardenTrees: useGardenStore.getState().gardenTrees });
  },

  moveGardenHedge: (id: string, newX: number, newY: number) => {
    useGardenStore.getState().moveGardenHedge(id, newX, newY);
    set({ gardenHedges: useGardenStore.getState().gardenHedges });
  },

  moveGardenZone: (id: string, newX: number, newY: number) => {
    useGardenStore.getState().moveGardenZone(id, newX, newY);
    set({ gardenZones: useGardenStore.getState().gardenZones });
  },

  resizeGardenZone: (id: string, newX: number, newY: number, newW: number, newH: number) => {
    useGardenStore.getState().resizeGardenZone(id, newX, newY, newW, newH);
    set({ gardenZones: useGardenStore.getState().gardenZones });
  },

  addGardenZone: (x: number, y: number, width: number, height: number, type?: GardenZone['type']) => {
    useGardenStore.getState().addGardenZone(x, y, width, height, type);
    set({ gardenZones: useGardenStore.getState().gardenZones });
  },

  expandGarden: (direction: 'width' | 'height') => {
    const result = useGardenStore.getState().expandGarden(direction);
    if (result) {
      const garden = useGardenStore.getState();
      set({ gardenWidthCm: garden.gardenWidthCm, gardenHeightCm: garden.gardenHeightCm, coins: useShopStore.getState().coins });
    }
    return result;
  },

  transplantFromMiniSerreToGarden: (serreId: string, row: number, col: number, gardenX: number, gardenY: number) => {
    const state = get();
    const result = useGardenStore.getState().transplantFromMiniSerreToGarden(serreId, row, col, gardenX, gardenY, state.adminMode, state.realWeather);
    if (result) {
      const garden = useGardenStore.getState();
      const nursery = useNurseryStore.getState();
      set({ miniSerres: nursery.miniSerres, etageres: nursery.etageres, gardenPlants: garden.gardenPlants });
    }
    return result;
  },

  // ── Garden Object add (used by GardenPlanView) ──

  addGardenShed: (x: number, y: number) => {
    const newShed: GardenShed = { id: `shed-${Date.now()}`, type: 'tool_shed', x, y, width: 200, height: 180 };
    const garden = useGardenStore.getState();
    useGardenStore.setState({ gardenSheds: [...garden.gardenSheds, newShed] });
    set({ gardenSheds: useGardenStore.getState().gardenSheds });
  },

  addGardenTank: (x: number, y: number, capacity: number = 1000) => {
    const newTank: GardenTank = { id: `tank-${Date.now()}`, type: 'water', x, y, width: 120, height: 100, capacity, currentLevel: 0, isRainTank: true, roofAreaM2: 30, efficiency: 0.8 };
    const garden = useGardenStore.getState();
    useGardenStore.setState({ gardenTanks: [...garden.gardenTanks, newTank] });
    set({ gardenTanks: useGardenStore.getState().gardenTanks });
  },

  addGardenTree: (x: number, y: number, treeType: GardenTree['type'] = 'apple') => {
    const newTree: GardenTree = { id: `tree-${Date.now()}`, type: treeType, x, y, diameter: 100, age: 0 };
    const garden = useGardenStore.getState();
    useGardenStore.setState({ gardenTrees: [...garden.gardenTrees, newTree] });
    set({ gardenTrees: useGardenStore.getState().gardenTrees });
  },

  addGardenHedge: (x: number, y: number, length: number = 200, orientation: 'horizontal' | 'vertical' = 'horizontal') => {
    const newHedge: GardenHedge = { id: `hedge-${Date.now()}`, type: 'laurel', x, y, length, orientation, height: 120 };
    const garden = useGardenStore.getState();
    useGardenStore.setState({ gardenHedges: [...garden.gardenHedges, newHedge] });
    set({ gardenHedges: useGardenStore.getState().gardenHedges });
  },

  addGardenDrum: (x: number, y: number) => {
    const newDrum: GardenDrum = { id: `drum-${Date.now()}`, x, y, width: 60, height: 90, capacity: 225 };
    const garden = useGardenStore.getState();
    useGardenStore.setState({ gardenDrums: [...garden.gardenDrums, newDrum] });
    set({ gardenDrums: useGardenStore.getState().gardenDrums });
  },

  // ═══════════════════════════════════════════
  // ── Actions — Simulation (delegated to simulation-store) ──
  // ═══════════════════════════════════════════

  togglePause: () => {
    useSimulationStore.getState().togglePause();
    set({ isPaused: useSimulationStore.getState().isPaused });
  },

  setSpeed: (speed: number) => {
    useSimulationStore.getState().setSpeed(speed);
    set({ speed: useSimulationStore.getState().speed });
  },

  tick: () => {
    const state = get();
    useSimulationStore.getState().tick(state.adminMode, state.diseasesEnabled);

    // Sync all simulation-driven state back from sub-stores
    const sim = useSimulationStore.getState();
    const shop = useShopStore.getState();
    const nursery = useNurseryStore.getState();
    const garden = useGardenStore.getState();
    set({
      day: sim.day,
      season: sim.season,
      weather: sim.weather,
      alerts: sim.alerts,
      pepiniere: nursery.pepiniere,
      miniSerres: nursery.miniSerres,
      etageres: nursery.etageres,
      gardenPlants: garden.gardenPlants,
      gardenTanks: garden.gardenTanks,
      score: shop.score,
      bestScore: shop.bestScore,
    });
  },

  setRealWeather: (data: RealWeatherData) => {
    useSimulationStore.getState().setRealWeather(data);
    set({ realWeather: useSimulationStore.getState().realWeather, weatherError: null });
  },

  setGPSCoords: (coords: GPSCoords) => {
    useSimulationStore.getState().setGPSCoords(coords);
    set({ gpsCoords: useSimulationStore.getState().gpsCoords });
  },

  setWeatherLoading: (loading: boolean) => {
    useSimulationStore.getState().setWeatherLoading(loading);
    set({ weatherLoading: useSimulationStore.getState().weatherLoading });
  },

  setWeatherError: (error: string | null) => {
    useSimulationStore.getState().setWeatherError(error);
    set({ weatherError: useSimulationStore.getState().weatherError });
  },

  dismissAlert: (alertId: string) => {
    useSimulationStore.getState().dismissAlert(alertId);
    set({ alerts: useSimulationStore.getState().alerts });
  },

  // ═══════════════════════════════════════════
  // ── Actions — UI (owned by game-store) ──
  // ═══════════════════════════════════════════

  toggleConsole: () => set((s) => ({ showConsole: !s.showConsole })),
  toggleAdminMode: () => set((s) => ({ adminMode: !s.adminMode })),
  toggleDiseases: () => set((s) => ({ diseasesEnabled: !s.diseasesEnabled })),
  toggleGardenSerre: () => set((s) => ({ showGardenSerre: !s.showGardenSerre })),
  toggleSerreView: () => set((s) => ({ showSerreView: !s.showSerreView })),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setPendingTransplant: (data) => set({ pendingTransplant: data }),

  // ═══════════════════════════════════════════
  // ── Actions — Save (owned by game-store) ──
  // ═══════════════════════════════════════════

  setActiveSlot: (slotId) => {
    try { if (typeof window !== 'undefined') localStorage.setItem('jardin-culture-active-slot', slotId || ''); } catch {}
    set({ activeSlot: slotId });
  },

  setAutoSaveEnabled: (enabled) => {
    try { if (typeof window !== 'undefined') localStorage.setItem('jardin-culture-auto-save', String(enabled)); } catch {}
    set({ autoSaveEnabled: enabled });
  },

  loadGameState: (state) => {
    const currentState = get();

    // Date — toujours aujourd'hui, ignorer la sauvegarde
    const today = getTodayDayOfYear();
    const restoredDay = today;
    const restoredSeason = getSeason(today);

    // Restore domain state to sub-stores
    if (state.gardenPlants) useGardenStore.setState({ gardenPlants: state.gardenPlants });
    if (state.gardenSerreZones) useGardenStore.setState({ gardenSerreZones: state.gardenSerreZones });
    if (state.gardenTanks) useGardenStore.setState({ gardenTanks: state.gardenTanks });
    if (state.gardenTrees) useGardenStore.setState({ gardenTrees: state.gardenTrees });
    if (state.gardenHedges) useGardenStore.setState({ gardenHedges: state.gardenHedges });
    if (state.gardenSheds) useGardenStore.setState({ gardenSheds: state.gardenSheds });
    if (state.gardenDrums) useGardenStore.setState({ gardenDrums: state.gardenDrums });
    if (state.gardenZones) useGardenStore.setState({ gardenZones: state.gardenZones });
    if (state.gardenWidthCm || state.gardenHeightCm) useGardenStore.setState({ gardenWidthCm: state.gardenWidthCm, gardenHeightCm: state.gardenHeightCm });

    if (state.pepiniere) useNurseryStore.setState({ pepiniere: state.pepiniere });
    if (state.miniSerres) useNurseryStore.setState({ miniSerres: state.miniSerres });
    if (state.etageres) useNurseryStore.setState({ etageres: state.etageres } as any);
    if (state.ownedChambres) useNurseryStore.setState({ ownedChambres: state.ownedChambres });
    if (state.activeChambreId !== undefined) useNurseryStore.setState({ activeChambreId: state.activeChambreId });

    if (state.seedCollection) useShopStore.setState({ seedCollection: state.seedCollection });
    if (state.plantuleCollection) useShopStore.setState({ plantuleCollection: state.plantuleCollection });
    if (state.seedVarieties) useShopStore.setState({ seedVarieties: state.seedVarieties });
    if (state.unlockedVarieties) useShopStore.setState({ unlockedVarieties: state.unlockedVarieties });
    if (state.discoveredPlants) useShopStore.setState({ discoveredPlants: state.discoveredPlants });
    if (state.coins !== undefined) useShopStore.setState({ coins: state.coins });
    if (state.ecoPoints !== undefined) useShopStore.setState({ ecoPoints: state.ecoPoints, ecoLevel: state.ecoLevel });
    if (state.score !== undefined) useShopStore.setState({ score: state.score });
    if (state.bestScore !== undefined) useShopStore.setState({ bestScore: state.bestScore });

    useSimulationStore.setState({ day: restoredDay, season: restoredSeason });

    // Sync facade state from sub-stores
    const garden = useGardenStore.getState();
    const nursery = useNurseryStore.getState();
    const shop = useShopStore.getState();
    const sim = useSimulationStore.getState();

    set({
      ...state,
      day: restoredDay,
      season: restoredSeason,
      // Overwrite with sub-store state
      gardenPlants: garden.gardenPlants,
      gardenSerreZones: garden.gardenSerreZones,
      gardenTanks: garden.gardenTanks,
      gardenTrees: garden.gardenTrees,
      gardenHedges: garden.gardenHedges,
      gardenSheds: garden.gardenSheds,
      gardenDrums: garden.gardenDrums,
      gardenZones: garden.gardenZones,
      gardenWidthCm: garden.gardenWidthCm,
      gardenHeightCm: garden.gardenHeightCm,
      pepiniere: nursery.pepiniere,
      miniSerres: nursery.miniSerres,
      etageres: nursery.etageres,
      ownedChambres: nursery.ownedChambres,
      activeChambreId: nursery.activeChambreId,
      seedCollection: shop.seedCollection,
      plantuleCollection: shop.plantuleCollection,
      seedVarieties: shop.seedVarieties,
      unlockedVarieties: shop.unlockedVarieties,
      discoveredPlants: shop.discoveredPlants,
      coins: shop.coins,
      ecoPoints: shop.ecoPoints,
      ecoLevel: shop.ecoLevel,
      score: shop.score,
      bestScore: shop.bestScore,
      // Don't overwrite system fields
      isPaused: currentState.isPaused,
      speed: currentState.speed,
      showConsole: currentState.showConsole,
      adminOpen: currentState.adminOpen,
    });
  },

  // ═══════════════════════════════════════════
  // ── Init (orchestrator) ──
  // ═══════════════════════════════════════════

  initGame: (freshStart = false) => {
    if (freshStart) {
      // Clear Zustand persist storage for all sub-stores
      const keysToRemove = [
        'botania-shop', 'botania-nursery', 'botania-garden', 'botania-simulation',
        // Legacy keys
        'jardin-culture-coins', 'jardin-culture-seeds', 'jardin-culture-plantules',
        'jardin-culture-seed-varieties', 'jardin-culture-garden-plants',
        'jardin-culture-garden-serres', 'jardin-culture-garden-dims',
        'jardin-culture-pepiniere', 'jardin-culture-mini-serres',
        'jardin-culture-serre-tiles', 'jardin-culture-chambres',
        'jardin-culture-active-chambre', 'jardin-culture-day', 'jardin-culture-day-ts',
        'jardin-culture-best-score', 'jardin-culture-garden',
        'jardin-culture-hologram-settings', 'jardin-culture-selected-serre',
        'jardin-culture-selected-slot',
      ];
      keysToRemove.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
    }

    // Init simulation
    useSimulationStore.getState().initSimulation();

    const today = getTodayDayOfYear();
    const todaySeason = getSeason(today);

    // Build test plants if no saved garden
    const hasSavedGarden = useGardenStore.getState().gardenPlants.length > 0;
    const testPlants: GardenPlant[] = hasSavedGarden
      ? useGardenStore.getState().gardenPlants
      : [
          { id: 'test-1', plantDefId: 'tomato', x: 50, y: 50, plant: { ...createInitialPlantState('tomato'), stage: 3, waterLevel: 65, daysSincePlanting: 19 } as PlantState },
          { id: 'test-2', plantDefId: 'tomato', x: 150, y: 50, plant: { ...createInitialPlantState('tomato'), stage: 2, waterLevel: 25, daysSincePlanting: 16 } as PlantState },
          { id: 'test-3', plantDefId: 'tomato', x: 250, y: 50, plant: { ...createInitialPlantState('tomato'), stage: 5, waterLevel: 80, daysSincePlanting: 35 } as PlantState },
          { id: 'test-4', plantDefId: 'tomato', x: 50, y: 150, plant: { ...createInitialPlantState('tomato'), stage: 1, waterLevel: 45, daysSincePlanting: 5 } as PlantState },
          { id: 'test-5', plantDefId: 'tomato', x: 150, y: 150, plant: { ...createInitialPlantState('tomato'), stage: 6, waterLevel: 55, daysSincePlanting: 45, isHarvestable: true } as PlantState },
        ];

    if (!hasSavedGarden && testPlants.length > 0) {
      useGardenStore.setState({ gardenPlants: testPlants });
    }

    // Clear old grid data
    try { localStorage.removeItem("jardin-culture-garden"); } catch { /* ignore */ }

    // Sync all facade state from sub-stores
    const garden = useGardenStore.getState();
    const nursery = useNurseryStore.getState();
    const shop = useShopStore.getState();
    const sim = useSimulationStore.getState();

    set({
      gardenWidthCm: garden.gardenWidthCm,
      gardenHeightCm: garden.gardenHeightCm,
      gardenPlants: garden.gardenPlants,
      gardenSerreZones: garden.gardenSerreZones,
      gardenTrees: garden.gardenTrees,
      gardenHedges: garden.gardenHedges,
      gardenTanks: garden.gardenTanks,
      gardenSheds: garden.gardenSheds,
      gardenDrums: garden.gardenDrums,
      gardenZones: garden.gardenZones,
      pepiniere: nursery.pepiniere,
      miniSerres: nursery.miniSerres,
      etageres: nursery.etageres,
      serreTiles: nursery.serreTiles,
      ownedChambres: nursery.ownedChambres,
      activeChambreId: nursery.activeChambreId,
      selectedMiniSerreId: nursery.selectedMiniSerreId,
      selectedSlot: nursery.selectedSlot,
      hologramSettings: nursery.hologramSettings,
      seedCollection: shop.seedCollection,
      plantuleCollection: shop.plantuleCollection,
      seedVarieties: shop.seedVarieties,
      unlockedVarieties: shop.unlockedVarieties,
      discoveredPlants: shop.discoveredPlants,
      coins: shop.coins,
      ecoPoints: shop.ecoPoints,
      ecoLevel: shop.ecoLevel,
      score: shop.score,
      bestScore: shop.bestScore,
      day: sim.day,
      season: todaySeason,
      weather: generateWeatherForMonth(getMonthFromDay(today)),
      alerts: [],
      harvested: 0,
      isPaused: false,
      speed: 0,
      showConsole: get().showConsole,
      adminOpen: get().adminOpen,
    });
  },

  // ═══════════════════════════════════════════
  // ── Internal helpers ──
  // ═══════════════════════════════════════════

  _getSeedCount: (plantDefId: string): number => {
    return useShopStore.getState()._getSeedCount(plantDefId);
  },

  _consumeSeed: (plantDefId: string) => {
    const shop = useShopStore.getState();
    const result = shop._consumeSeed(plantDefId);
    // Sync back the potentially changed collections
    const newShop = useShopStore.getState();
    set({ seedCollection: newShop.seedCollection, seedVarieties: newShop.seedVarieties });
    // Return in the old format
    if (result) {
      return { source: 'variety' as const, newVarieties: newShop.seedVarieties !== get().seedVarieties ? newShop.seedVarieties : null, newCollection: newShop.seedCollection !== get().seedCollection ? newShop.seedCollection : null };
    }
    return null;
  },

  // ═══════════════════════════════════════════
  // ── Digital Twin ──
  // ═══════════════════════════════════════════

  createDigitalTwinInGarden: (plantDefId, x, y, scanData) => {
    const state = get();
    let plantDef = PLANTS[plantDefId];

    // Si la plante n'est pas dans le catalogue, créer une définition générique
    if (!plantDef) {
      const customName = scanData?.plantName || plantDefId;
      plantDef = {
        id: plantDefId, name: customName, emoji: '🌱',
        image: '/cards/card-custom-plant.png',
        stageDurations: [7, 21, 28, 45] as [number, number, number, number],
        optimalTemp: [12, 28], waterNeed: 4.0, lightNeed: 7,
        harvestEmoji: '🌿', cropCoefficient: 0.8,
        optimalPlantMonths: [3, 4, 5], optimalSeasons: ['summer'],
        diseaseResistance: 0.5, pestResistance: 0.5, droughtResistance: 0.4,
        realDaysToHarvest: 90,
      };
      // Enregistrer dans PLANTS pour les prochaines fois
      PLANTS[plantDefId] = plantDef;
      // Ajouter l'espacement par défaut
      if (!PLANT_SPACING[plantDefId]) {
        PLANT_SPACING[plantDefId] = { plantSpacingCm: 30, rowSpacingCm: 40, color: '#22c55e', label: '30×40cm' };
      }
      // Sauvegarder comme plante découverte (dans shop-store pour persistance)
      const shopDiscovered = [...(useShopStore.getState().discoveredPlants || []), { id: plantDefId, name: customName, emoji: '🌱', discoveredAt: Date.now(), source: 'photo' as const }];
      useShopStore.setState({ discoveredPlants: shopDiscovered });
      // Track identification for daily quest
      try {
        const { useEconomyStore } = require('@/store/economy-store');
        useEconomyStore.getState().trackIdentify();
      } catch {}
    }

    const spacing = PLANT_SPACING[plantDefId];
    if (x < 0 || y < 0 || x + spacing.plantSpacingCm > state.gardenWidthCm || y + spacing.rowSpacingCm > state.gardenHeightCm) {
      return { success: false, message: `❌ Position hors limites du jardin.`, rewards: null };
    }
    const overlaps = state.gardenPlants.some((gp) => {
      const s = PLANT_SPACING[gp.plantDefId];
      if (!s) return false;
      return x < gp.x + s.plantSpacingCm && x + spacing.plantSpacingCm > gp.x && y < gp.y + s.rowSpacingCm && y + spacing.rowSpacingCm > gp.y;
    });
    if (overlaps) {
      return { success: false, message: `❌ Un autre plant occupe déjà cet emplacement.`, rewards: null };
    }

    const growthStage = scanData.growthStage || { stage: 2, estimatedAge: 15 };
    const healthStatus = scanData.healthStatus || { isHealthy: true, diseaseName: 'Sain' };
    const newPlant: PlantState = {
      ...createInitialPlantState(plantDefId),
      stage: Math.min(5, growthStage.stage),
      daysSincePlanting: growthStage.estimatedAge,
      daysInCurrentStage: Math.min(10, growthStage.estimatedAge),
      health: healthStatus.isHealthy ? 85 : 60,
      hasDisease: !healthStatus.isHealthy,
      diseaseDays: healthStatus.isHealthy ? 0 : 3,
      waterLevel: 70,
      fertilizerLevel: 50,
    };
    const newGardenPlant: GardenPlant = { id: uid(), plantDefId, x: Math.round(x), y: Math.round(y), plant: newPlant };
    const newGardenPlants = [...state.gardenPlants, newGardenPlant];
    useGardenStore.setState({ gardenPlants: newGardenPlants });

    const rewards = { coins: 50, xp: 100, bonusSeeds: null as { plantDefId: string; count: number } | null };
    if (scanData.confidence > 0.8) { rewards.coins += 25; rewards.xp += 50; }
    if (growthStage.stage >= 4) {
      rewards.bonusSeeds = { plantDefId, count: 3 };
      const newCollection = { ...state.seedCollection };
      newCollection[plantDefId] = (newCollection[plantDefId] || 0) + 3;
      useShopStore.setState({ seedCollection: newCollection });
    }

    useShopStore.getState().addCoins(rewards.coins);
    const newShop = useShopStore.getState();

    const alerts = [...state.alerts.slice(-25), { id: `twin-${Date.now()}`, type: "success" as const, message: `✨ ${plantDef.emoji} ${plantDef.name} ajouté au jardin !`, emoji: "🌱", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info" as const }];
    set({ gardenPlants: newGardenPlants, coins: newShop.coins, seedCollection: newShop.seedCollection, alerts });

    useSoundManager.getState().playEventSound('plant');
    triggerVisualEffect("success-pop");

    return {
      success: true,
      message: `✅ Jumeau numérique planté !\n\n🌱 ${plantDef.emoji} ${plantDef.name}\n📍 Position: ${Math.round(x)}cm × ${Math.round(y)}cm\n📊 Stade ${growthStage.stage}/5 (${growthStage.estimatedAge}j)\n💚 Santé : ${healthStatus.isHealthy ? 'Saine ✅' : '⚠️ ' + healthStatus.diseaseName}\n\n🎁 Récompenses :\n  • +${rewards.coins} 🪙 pièces\n  • +${rewards.xp} ⭐ XP\n${rewards.bonusSeeds ? `  • +3 graines ${plantDef.emoji}` : ''}`,
      rewards,
    };
  },
}));