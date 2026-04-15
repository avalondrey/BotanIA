/**
 * Garden Store — Plants, serre zones, garden objects, and garden actions
 * Extracted from game-store.ts for maintainability.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type PlantState,
  type AlertData,
  PLANTS,
  PLANT_SPACING,
  createInitialPlantState,
  applyWatering,
  applyTreatment,
  applyFertilizer,
  simulateDay,
} from '@/lib/ai-engine';
import { type RealWeatherData, isFrostRisk } from '@/lib/weather-service';
import { checkCompanionForNewPlant } from '@/lib/companion-matrix';
import { loadPlotHistory, findOrCreatePlot, getPlotRotationSuggestion, recordPlanting } from '@/lib/crop-rotation';
import {
  type GardenPlant,
  type SerreZone,
  type GardenTree,
  type GardenHedge,
  type GardenTank,
  type GardenShed,
  type GardenDrum,
  type GardenZone,
  DEFAULT_GARDEN_WIDTH_CM,
  DEFAULT_GARDEN_HEIGHT_CM,
  MAX_GARDEN_WIDTH_CM,
  MAX_GARDEN_HEIGHT_CM,
} from './garden-types';
import { useShopStore } from './shop-store';
import { useNurseryStore } from './nursery-store';

// ═══ Constants ═══

const EXPAND_COST = 100;

// ═══ State Interface ═══

export interface GardenState {
  // Garden dimensions
  gardenWidthCm: number;
  gardenHeightCm: number;

  // Garden plants (coordinate-based)
  gardenPlants: GardenPlant[];

  // Garden infrastructure
  gardenSerreZones: SerreZone[];
  gardenTrees: GardenTree[];
  gardenHedges: GardenHedge[];
  gardenTanks: GardenTank[];
  gardenSheds: GardenShed[];
  gardenDrums: GardenDrum[];
  gardenZones: GardenZone[];

  // Actions — Plant placement
  placePlantInGarden: (plantDefId: string, x: number, y: number, pepIndex?: number, adminMode?: boolean, realWeather?: RealWeatherData | null) => boolean;
  placeRowInGarden: (plantDefId: string, startX: number, startY: number, endX: number, endY: number, pepIndices?: number[]) => number;
  removePlantFromGarden: (plantId: string) => void;
  waterPlantGarden: (plantId: string) => void;
  treatPlantGarden: (plantId: string) => void;
  fertilizePlantGarden: (plantId: string) => void;
  harvestPlantGarden: (plantId: string) => void;
  waterAllGarden: () => void;
  moveGardenPlant: (plantId: string, newX: number, newY: number) => void;

  // Actions — Serre zones
  addSerreZone: (x: number, y: number, width: number, height: number, price?: number) => boolean;
  buySerreZone: () => boolean;
  removeSerreZone: (zoneId: string) => void;
  moveSerreZone: (zoneId: string, newX: number, newY: number) => void;

  // Actions — Garden objects
  buyShed: (cost: number) => boolean;
  buyTank: (capacity: number, cost: number) => boolean;
  buyTree: (cost: number) => boolean;
  buyHedge: (cost: number, hedgeType?: GardenHedge['type']) => boolean;
  buyDrum: (cost: number) => boolean;
  addGardenZone: (x: number, y: number, width: number, height: number, type?: GardenZone['type']) => void;
  removeGardenShed: (id: string) => void;
  removeGardenTank: (id: string) => void;
  removeGardenDrum: (id: string) => void;
  removeGardenTree: (id: string) => void;
  removeGardenHedge: (id: string) => void;
  removeGardenZone: (id: string) => void;
  moveGardenShed: (id: string, newX: number, newY: number) => void;
  moveGardenTank: (id: string, newX: number, newY: number) => void;
  moveGardenDrum: (id: string, newX: number, newY: number) => void;
  moveGardenTree: (id: string, newX: number, newY: number) => void;
  moveGardenHedge: (id: string, newX: number, newY: number) => void;
  moveGardenZone: (id: string, newX: number, newY: number) => void;
  resizeGardenZone: (id: string, newX: number, newY: number, newW: number, newH: number) => void;

  // Actions — Garden expansion
  expandGarden: (direction: 'width' | 'height') => boolean;

  // Actions — Transplant from mini-serre
  transplantFromMiniSerreToGarden: (serreId: string, row: number, col: number, gardenX: number, gardenY: number, adminMode?: boolean, realWeather?: RealWeatherData | null) => boolean;
}

// ═══ UID ═══

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// ═══ Store ═══

export const useGardenStore = create<GardenState>()(
  persist(
    (set, get) => ({
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

      // ── Plant Placement ──

      placePlantInGarden: (plantDefId, x, y, pepIndex, adminMode, realWeather) => {
        const state = get();
        const spacing = PLANT_SPACING[plantDefId];
        if (!spacing) return false;

        if (x < 0 || y < 0 || x + spacing.plantSpacingCm > state.gardenWidthCm || y + spacing.rowSpacingCm > state.gardenHeightCm) return false;

        const overlaps = state.gardenPlants.some((gp) => {
          const s = PLANT_SPACING[gp.plantDefId];
          if (!s) return false;
          return x < gp.x + s.plantSpacingCm && x + spacing.plantSpacingCm > gp.x &&
                 y < gp.y + s.rowSpacingCm && y + spacing.rowSpacingCm > gp.y;
        });
        if (overlaps) return false;

        let newPlant: PlantState;
        let newPepiniere: PlantState[] = [];
        let newSeedCollection: Record<string, number> | null = null;

        if (pepIndex !== undefined && pepIndex >= 0) {
          const nursery = useNurseryStore.getState();
          const seedling = nursery.pepiniere[pepIndex];
          if (!seedling) return false;
          const inSerre = state.gardenSerreZones.some(z =>
            x >= z.x && y >= z.y && x <= z.x + z.width && y <= z.y + z.height
          );
          if (!adminMode && !inSerre && realWeather && isFrostRisk(realWeather)) return false;
          newPlant = seedling;
          newPepiniere = nursery.pepiniere.filter((_, i) => i !== pepIndex);
          useNurseryStore.setState({ pepiniere: newPepiniere });
        } else {
          const shop = useShopStore.getState();
          const count = shop.seedCollection[plantDefId] || 0;
          if (count <= 0) return false;

          const inSerre = state.gardenSerreZones.some(z =>
            x >= z.x && y >= z.y && x <= z.x + z.width && y <= z.y + z.height
          );
          if (!adminMode && !inSerre && realWeather && isFrostRisk(realWeather)) return false;

          const updatedCollection = { ...shop.seedCollection };
          updatedCollection[plantDefId] = count - 1;
          if (updatedCollection[plantDefId] <= 0) delete updatedCollection[plantDefId];
          useShopStore.setState({ seedCollection: updatedCollection });
          newSeedCollection = updatedCollection;

          newPlant = createInitialPlantState(plantDefId);
        }

        const newGardenPlant: GardenPlant = {
          id: uid(),
          plantDefId,
          x: Math.round(x),
          y: Math.round(y),
          plant: newPlant,
        };

        const newGardenPlants = [...state.gardenPlants, newGardenPlant];
        set({ gardenPlants: newGardenPlants });

        // Track planting for daily quest
        try {
          const { useEconomyStore } = require('@/store/economy-store');
          useEconomyStore.getState().trackPlantSeed();
        } catch {}

        return true;
      },

      placeRowInGarden: (plantDefId, startX, startY, endX, endY, pepIndices) => {
        const state = get();
        const spacing = PLANT_SPACING[plantDefId];
        if (!spacing) return 0;

        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length < spacing.plantSpacingCm) return 0;

        const dirX = dx / length;
        const dirY = dy / length;
        const count = Math.floor(length / spacing.plantSpacingCm);

        let placed = 0;
        const newPlants: GardenPlant[] = [];
        const usedPepIndices = pepIndices ? [...pepIndices] : [];

        const nursery = useNurseryStore.getState();

        for (let i = 0; i <= count; i++) {
          const px = Math.round(startX + dirX * i * spacing.plantSpacingCm);
          const py = Math.round(startY + dirY * i * spacing.plantSpacingCm);

          if (px < 0 || py < 0 || px + spacing.plantSpacingCm > state.gardenWidthCm || py + spacing.rowSpacingCm > state.gardenHeightCm) continue;

          const overlaps = state.gardenPlants.some((gp) => {
            const s = PLANT_SPACING[gp.plantDefId];
            if (!s) return false;
            return px < gp.x + s.plantSpacingCm && px + spacing.plantSpacingCm > gp.x &&
                   py < gp.y + s.rowSpacingCm && py + spacing.rowSpacingCm > gp.y;
          }) || newPlants.some((gp) => {
            return px < gp.x + spacing.plantSpacingCm && px + spacing.plantSpacingCm > gp.x &&
                   py < gp.y + spacing.rowSpacingCm && py + spacing.rowSpacingCm > gp.y;
          });
          if (overlaps) continue;

          let plantState: PlantState;
          if (usedPepIndices.length > 0) {
            const pepIdx = usedPepIndices.shift()!;
            const seedling = nursery.pepiniere[pepIdx];
            if (!seedling) continue;
            plantState = seedling;
          } else {
            plantState = createInitialPlantState(plantDefId);
          }

          newPlants.push({
            id: uid(),
            plantDefId,
            x: px,
            y: py,
            plant: plantState,
          });
          placed++;
        }

        // Consume seeds for non-pep plants
        const nonPepCount = placed - (pepIndices ? Math.min(pepIndices.length, placed) : 0);
        if (nonPepCount > 0) {
          const shop = useShopStore.getState();
          const newCollection = { ...shop.seedCollection };
          const current = newCollection[plantDefId] || 0;
          if (current >= nonPepCount) {
            newCollection[plantDefId] = current - nonPepCount;
            if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
            useShopStore.setState({ seedCollection: newCollection });
          }
        }

        // Remove used pepiniere entries
        if (pepIndices && pepIndices.length > 0) {
          const newPep = nursery.pepiniere.filter((_, i) => !pepIndices.includes(i));
          useNurseryStore.setState({ pepiniere: newPep });
        }

        const newGardenPlants = [...state.gardenPlants, ...newPlants];
        set({ gardenPlants: newGardenPlants });
        return placed;
      },

      removePlantFromGarden: (plantId: string) => {
        set((s) => ({ gardenPlants: s.gardenPlants.filter((gp) => gp.id !== plantId) }));
      },

      waterPlantGarden: (plantId: string) => {
        set((s) => {
          const newGardenPlants = s.gardenPlants.map((gp) =>
            gp.id === plantId ? { ...gp, plant: applyWatering(gp.plant) } : gp
          );
          return { gardenPlants: newGardenPlants };
        });
        // Track watering for daily quest
        try {
          const { useEconomyStore } = require('@/store/economy-store');
          useEconomyStore.getState().trackWaterPlant();
        } catch {}
      },

      treatPlantGarden: (plantId: string) => {
        set((s) => {
          const newGardenPlants = s.gardenPlants.map((gp) =>
            gp.id === plantId ? { ...gp, plant: applyTreatment(gp.plant) } : gp
          );
          return { gardenPlants: newGardenPlants };
        });
      },

      fertilizePlantGarden: (plantId: string) => {
        set((s) => {
          const newGardenPlants = s.gardenPlants.map((gp) =>
            gp.id === plantId ? { ...gp, plant: applyFertilizer(gp.plant) } : gp
          );
          return { gardenPlants: newGardenPlants };
        });
      },

      harvestPlantGarden: (plantId: string) => {
        const state = get();
        const plant = state.gardenPlants.find((gp) => gp.id === plantId);
        if (!plant) return;

        const newGardenPlants = state.gardenPlants.filter((gp) => gp.id !== plantId);
        set({ gardenPlants: newGardenPlants });

        // Score only — coin rewards are handled by game-store facade
        const plantDef = PLANTS[plant.plantDefId];
        const scoreReward = plantDef ? Math.ceil(plantDef.realDaysToHarvest / 3) : 10;
        useShopStore.getState().addScore(scoreReward);
      },

      waterAllGarden: () => {
        const state = get();
        const plantCount = state.gardenPlants.length;
        set((s) => ({
          gardenPlants: s.gardenPlants.map((gp) => ({
            ...gp,
            plant: applyWatering(gp.plant),
          })),
        }));
        // Track each watered plant for daily quests
        try {
          const { useEconomyStore } = require('@/store/economy-store');
          for (let i = 0; i < plantCount; i++) {
            useEconomyStore.getState().trackWaterPlant();
          }
        } catch {}
      },

      moveGardenPlant: (plantId: string, newX: number, newY: number) => {
        set((s) => ({
          gardenPlants: s.gardenPlants.map((gp) =>
            gp.id === plantId
              ? { ...gp, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) }
              : gp
          ),
        }));
      },

      // ── Serre Zones ──

      addSerreZone: (x, y, width, height, price = 200) => {
        const shop = useShopStore.getState();
        if (price > 0 && shop.coins < price) return false;
        const newZone: SerreZone = { id: uid(), x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
        const newZones = [...get().gardenSerreZones, newZone];
        if (price > 0) useShopStore.setState({ coins: shop.coins - price });
        set({ gardenSerreZones: newZones });
        return true;
      },

      buySerreZone: () => {
        const shop = useShopStore.getState();
        if (shop.coins < 200) return false;
        const w = 600, h = 400;
        const state = get();
        const offsetX = state.gardenSerreZones.length * 20;
        const x = Math.min(state.gardenWidthCm - w - 20, 20 + offsetX);
        const newZone: SerreZone = { id: uid(), x: Math.round(x), y: 20, width: Math.round(w), height: Math.round(h) };
        useShopStore.setState({ coins: shop.coins - 200 });
        set({ gardenSerreZones: [...state.gardenSerreZones, newZone] });
        return true;
      },

      removeSerreZone: (zoneId: string) => {
        set((s) => ({ gardenSerreZones: s.gardenSerreZones.filter((z) => z.id !== zoneId) }));
      },

      moveSerreZone: (zoneId: string, newX: number, newY: number) => {
        set((s) => ({
          gardenSerreZones: s.gardenSerreZones.map((z) =>
            z.id === zoneId ? { ...z, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : z
          ),
        }));
      },

      // ── Garden Object Purchases ──

      buyShed: (cost: number) => {
        const shop = useShopStore.getState();
        if (shop.coins < cost) return false;
        const state = get();
        const newShed: GardenShed = { id: `shed-${Date.now()}`, type: 'tool_shed', x: 20, y: state.gardenHeightCm - 200, width: 200, height: 180 };
        useShopStore.setState({ coins: shop.coins - cost });
        set({ gardenSheds: [...state.gardenSheds, newShed] });
        return true;
      },

      buyTank: (capacity: number, cost: number) => {
        const shop = useShopStore.getState();
        if (shop.coins < cost) return false;
        const state = get();
        const newTank: GardenTank = {
          id: `tank-${Date.now()}`, type: 'water', x: 20 + state.gardenTanks.length * 130, y: 20,
          width: 120, height: 100, capacity, currentLevel: 0, isRainTank: true, roofAreaM2: 30, efficiency: 0.8,
        };
        useShopStore.setState({ coins: shop.coins - cost });
        set({ gardenTanks: [...state.gardenTanks, newTank] });
        return true;
      },

      buyTree: (cost: number) => {
        const shop = useShopStore.getState();
        if (shop.coins < cost) return false;
        const state = get();
        const newTree: GardenTree = { id: `tree-${Date.now()}`, type: 'apple', x: 100 + state.gardenTrees.length * 120, y: 200, diameter: 100, age: 0 };
        useShopStore.setState({ coins: shop.coins - cost });
        set({ gardenTrees: [...state.gardenTrees, newTree] });
        // Track tree planting for daily quest
        try {
          const { useEconomyStore } = require('@/store/economy-store');
          useEconomyStore.getState().trackTreePlanted();
        } catch {}
        return true;
      },

      buyHedge: (cost: number, hedgeType: GardenHedge['type'] = 'laurel') => {
        const shop = useShopStore.getState();
        if (shop.coins < cost) return false;
        const state = get();
        const newHedge: GardenHedge = { id: `hedge-${Date.now()}`, type: hedgeType, x: 20, y: state.gardenHeightCm - 100, length: 200, orientation: 'horizontal', height: 120 };
        useShopStore.setState({ coins: shop.coins - cost });
        set({ gardenHedges: [...state.gardenHedges, newHedge] });
        return true;
      },

      buyDrum: (cost: number) => {
        const shop = useShopStore.getState();
        if (shop.coins < cost) return false;
        const state = get();
        const newDrum: GardenDrum = { id: `drum-${Date.now()}`, x: 20 + state.gardenDrums.length * 80, y: 20, width: 60, height: 90, capacity: 225 };
        useShopStore.setState({ coins: shop.coins - cost });
        set({ gardenDrums: [...state.gardenDrums, newDrum] });
        return true;
      },

      addGardenZone: (x, y, width, height, type = 'uncultivated' as const) => {
        const state = get();
        const newZone: GardenZone = { id: `zone-${Date.now()}`, type, x, y, width, height };
        set({ gardenZones: [...state.gardenZones, newZone] });
      },

      // ── Remove Garden Objects ──

      removeGardenShed: (id) => set((s) => ({ gardenSheds: s.gardenSheds.filter((sh) => sh.id !== id) })),
      removeGardenTank: (id) => set((s) => ({ gardenTanks: s.gardenTanks.filter((t) => t.id !== id) })),
      removeGardenDrum: (id) => set((s) => ({ gardenDrums: s.gardenDrums.filter((d) => d.id !== id) })),
      removeGardenTree: (id) => set((s) => ({ gardenTrees: s.gardenTrees.filter((t) => t.id !== id) })),
      removeGardenHedge: (id) => set((s) => ({ gardenHedges: s.gardenHedges.filter((h) => h.id !== id) })),
      removeGardenZone: (id) => set((s) => ({ gardenZones: s.gardenZones.filter((z) => z.id !== id) })),

      // ── Move Garden Objects ──

      moveGardenShed: (id, newX, newY) => set((s) => ({
        gardenSheds: s.gardenSheds.map((sh) => sh.id === id ? { ...sh, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : sh),
      })),
      moveGardenTank: (id, newX, newY) => set((s) => ({
        gardenTanks: s.gardenTanks.map((t) => t.id === id ? { ...t, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : t),
      })),
      moveGardenDrum: (id, newX, newY) => set((s) => ({
        gardenDrums: s.gardenDrums.map((d) => d.id === id ? { ...d, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : d),
      })),
      moveGardenTree: (id, newX, newY) => set((s) => ({
        gardenTrees: s.gardenTrees.map((t) => t.id === id ? { ...t, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : t),
      })),
      moveGardenHedge: (id, newX, newY) => set((s) => ({
        gardenHedges: s.gardenHedges.map((h) => h.id === id ? { ...h, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : h),
      })),
      moveGardenZone: (id, newX, newY) => set((s) => ({
        gardenZones: s.gardenZones.map((z) => z.id === id ? { ...z, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : z),
      })),
      resizeGardenZone: (id, newX, newY, newW, newH) => set((s) => ({
        gardenZones: s.gardenZones.map((z) => z.id === id ? { ...z, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)), width: Math.max(30, Math.round(newW)), height: Math.max(30, Math.round(newH)) } : z),
      })),

      // ── Garden Expansion ──

      expandGarden: (direction) => {
        const state = get();
        const shop = useShopStore.getState();
        if (shop.coins < EXPAND_COST) return false;
        const increment = 200;

        if (direction === 'width') {
          if (state.gardenWidthCm >= MAX_GARDEN_WIDTH_CM) return false;
          const newWidth = Math.min(MAX_GARDEN_WIDTH_CM, state.gardenWidthCm + increment);
          useShopStore.setState({ coins: shop.coins - EXPAND_COST });
          set({ gardenWidthCm: newWidth });
        } else {
          if (state.gardenHeightCm >= MAX_GARDEN_HEIGHT_CM) return false;
          const newHeight = Math.min(MAX_GARDEN_HEIGHT_CM, state.gardenHeightCm + increment);
          useShopStore.setState({ coins: shop.coins - EXPAND_COST });
          set({ gardenHeightCm: newHeight });
        }
        return true;
      },

      // ── Transplant from Mini Serre ──

      transplantFromMiniSerreToGarden: (serreId, row, col, gardenX, gardenY, adminMode, realWeather) => {
        const nursery = useNurseryStore.getState();
        const state = get();
        const serreIdx = nursery.miniSerres.findIndex((s) => s.id === serreId);
        if (serreIdx < 0) return false;
        const serre = nursery.miniSerres[serreIdx];
        const plant = serre.slots[row]?.[col];
        if (!plant) return false;

        // Mini-serre route plants cannot be transplanted to garden
        if ((plant as any).growthRoute === 'miniserre') return false;

        const spacing = PLANT_SPACING[plant.plantDefId];
        if (!spacing) return false;

        if (gardenX < 0 || gardenY < 0 || gardenX + spacing.plantSpacingCm > state.gardenWidthCm || gardenY + spacing.rowSpacingCm > state.gardenHeightCm) return false;

        const overlaps = state.gardenPlants.some((gp) => {
          const s = PLANT_SPACING[gp.plantDefId];
          if (!s) return false;
          return gardenX < gp.x + s.plantSpacingCm && gardenX + spacing.plantSpacingCm > gp.x &&
                 gardenY < gp.y + s.rowSpacingCm && gardenY + spacing.rowSpacingCm > gp.y;
        });
        if (overlaps) return false;

        const inSerre = state.gardenSerreZones.some(z =>
          gardenX >= z.x && gardenY >= z.y && gardenX <= z.x + z.width && gardenY <= z.y + z.height
        );
        if (!adminMode && !inSerre && realWeather && isFrostRisk(realWeather)) return false;

        // Remove from mini serre
        const newMiniSerres = nursery.miniSerres.map((s, i) => {
          if (i !== serreIdx) return s;
          const newSlots = s.slots.map((r) => r.map((c) => c));
          newSlots[row][col] = null;
          return { ...s, slots: newSlots };
        });
        useNurseryStore.setState({ miniSerres: newMiniSerres });

        // Add to garden with correct container type
        const containerType = inSerre ? 'pot-serre' : 'sol-jardin';
        const newGardenPlant: GardenPlant = {
          id: uid(),
          plantDefId: plant.plantDefId,
          x: gardenX,
          y: gardenY,
          plant: { ...plant, containerType: containerType as any },
        };

        set({ gardenPlants: [...state.gardenPlants, newGardenPlant] });
        return true;
      },
    }),
    {
      name: 'botania-garden',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          const state = persistedState as GardenState;
          if (state.gardenPlants) {
            state.gardenPlants = state.gardenPlants.map((gp: any) => ({
              ...gp,
              plant: gp.plant ? {
                ...gp.plant,
                growthRoute: gp.plant.growthRoute || 'jardin',
                containerType: gp.plant.containerType || 'sol-jardin',
              } : gp.plant,
            }));
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        gardenWidthCm: state.gardenWidthCm,
        gardenHeightCm: state.gardenHeightCm,
        gardenPlants: state.gardenPlants,
        gardenSerreZones: state.gardenSerreZones,
        gardenTrees: state.gardenTrees,
        gardenHedges: state.gardenHedges,
        gardenTanks: state.gardenTanks,
        gardenSheds: state.gardenSheds,
        gardenDrums: state.gardenDrums,
        gardenZones: state.gardenZones,
      }),
    }
  )
);