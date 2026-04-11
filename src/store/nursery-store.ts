/**
 * Nursery Store — Pépinière, mini-serres, chambres de culture
 * Extracted from game-store.ts for maintainability.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type PlantState,
  PLANTS,
  createInitialPlantState,
  applyWatering,
  applyTreatment,
  applyFertilizer,
} from '@/lib/ai-engine';
import {
  type MiniSerre,
  createEmptyMiniSerre,
  MINI_SERRE_ROWS,
  MINI_SERRE_COLS,
  MINI_SERRE_PRICE,
  CHAMBRE_CATALOG,
  SEED_VARIETIES,
} from './catalog';
import { type HologramSettings } from './game-store';
import { useShopStore } from './shop-store';

// ═══ Constants ═══

const MAX_PEPINIERE_SLOTS = 8;

// ═══ State Interface ═══

export interface NurseryState {
  // Pépinière
  pepiniere: PlantState[];

  // Mini Serres
  miniSerres: MiniSerre[];

  // Chambre de Culture
  ownedChambres: Record<string, number>;
  activeChambreId: string | null;

  // Selection
  selectedMiniSerreId: string | null;
  selectedSlot: { row: number; col: number } | null;

  // Visual
  hologramSettings: HologramSettings;

  // Serre tile inventory
  serreTiles: number;

  // Actions — Pépinière
  placeSeedInPepiniere: (plantDefId: string) => boolean;
  placePlantuleInPepiniere: (plantDefId: string) => boolean;
  waterPlantPepiniere: (index: number) => void;
  treatPlantPepiniere: (index: number) => void;
  fertilizePlantPepiniere: (index: number) => void;
  removePlantPepiniere: (index: number) => void;

  // Actions — Mini Serres
  placeSeedInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => boolean;
  placePlantuleInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => boolean;
  waterMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  treatMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  fertilizeMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  removeMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  waterAllMiniSerre: (serreId: string) => void;
  removeMiniSerre: (serreId: string) => void;
  fillMiniSerre: (serreId: string, plantDefId: string) => boolean;
  plantInMiniSerreAtDate: (serreId: string, row: number, col: number, plantDefId: string, daysSincePlanting: number) => boolean;

  // Actions — Chambres
  buyMiniSerre: () => boolean;
  buyChambreDeCulture: (modelId: string) => boolean;
  setActiveChambre: (modelId: string | null) => void;
  buySerreTile: () => boolean;

  // Actions — Selection & Settings
  setSelectedSlot: (serreId: string, slot: { row: number; col: number } | null) => void;
  updateHologramSettings: (settings: Partial<HologramSettings>) => void;
}

// ═══ Store ═══

export const useNurseryStore = create<NurseryState>()(
  persist(
    (set, get) => ({
      pepiniere: [],
      miniSerres: [],
      ownedChambres: {},
      activeChambreId: null,
      selectedMiniSerreId: null,
      selectedSlot: null,
      hologramSettings: {
        rotationEnabled: true,
        rotationSpeed: 1,
        auraIntensity: 0.5,
        particlesEnabled: true,
      },
      serreTiles: 0,

      // ── Pépinière Actions ──

      placeSeedInPepiniere: (plantDefId: string) => {
        const state = get();
        if (state.pepiniere.length >= MAX_PEPINIERE_SLOTS) return false;

        // Consume seed from shop store
        const shop = useShopStore.getState();
        const count = shop.seedCollection[plantDefId] || 0;
        if (count <= 0) return false;

        const newCollection = { ...shop.seedCollection };
        newCollection[plantDefId] = count - 1;
        if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
        useShopStore.setState({ seedCollection: newCollection });

        const newPlant: PlantState = createInitialPlantState(plantDefId);
        const newPepiniere = [...state.pepiniere, newPlant];

        set({ pepiniere: newPepiniere });
        return true;
      },

      placePlantuleInPepiniere: (plantDefId: string) => {
        const state = get();
        if (state.pepiniere.length >= MAX_PEPINIERE_SLOTS) return false;

        const shop = useShopStore.getState();
        const count = shop.plantuleCollection[plantDefId] || 0;
        if (count <= 0) return false;

        const newCollection = { ...shop.plantuleCollection };
        newCollection[plantDefId] = count - 1;
        if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
        useShopStore.setState({ plantuleCollection: newCollection });

        const newPlant: PlantState = {
          ...createInitialPlantState(plantDefId),
          stage: 1,
          growthProgress: 60,
          daysSincePlanting: 20,
          daysInCurrentStage: 10,
        };
        const newPepiniere = [...state.pepiniere, newPlant];

        set({ pepiniere: newPepiniere });
        return true;
      },

      waterPlantPepiniere: (index: number) => {
        set((s) => {
          const newPep = [...s.pepiniere];
          if (newPep[index]) {
            newPep[index] = applyWatering(newPep[index]);
          }
          return { pepiniere: newPep };
        });
      },

      treatPlantPepiniere: (index: number) => {
        set((s) => {
          const newPep = [...s.pepiniere];
          if (newPep[index]) {
            newPep[index] = applyTreatment(newPep[index]);
          }
          return { pepiniere: newPep };
        });
      },

      fertilizePlantPepiniere: (index: number) => {
        set((s) => {
          const newPep = [...s.pepiniere];
          if (newPep[index]) {
            newPep[index] = applyFertilizer(newPep[index]);
          }
          return { pepiniere: newPep };
        });
      },

      removePlantPepiniere: (index: number) => {
        set((s) => {
          const newPep = s.pepiniere.filter((_, i) => i !== index);
          return { pepiniere: newPep };
        });
      },

      // ── Mini Serre Actions ──

      placeSeedInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => {
        const state = get();
        const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
        if (serreIdx < 0) return false;
        const serre = state.miniSerres[serreIdx];
        if (serre.slots[row]?.[col] !== null) return false;

        // Consume seed via shop store
        const consumed = useShopStore.getState()._consumeSeed(plantDefId);
        if (!consumed) return false;

        const newPlant: PlantState = createInitialPlantState(plantDefId);
        const newMiniSerres = state.miniSerres.map((s, i) => {
          if (i !== serreIdx) return s;
          const newSlots = s.slots.map((r) => r.map((c) => c));
          newSlots[row][col] = newPlant;
          return { ...s, slots: newSlots };
        });

        set({ miniSerres: newMiniSerres });
        return true;
      },

      placePlantuleInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => {
        const state = get();
        const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
        if (serreIdx < 0) return false;
        const serre = state.miniSerres[serreIdx];
        if (serre.slots[row]?.[col] !== null) return false;

        const shop = useShopStore.getState();
        const count = shop.plantuleCollection[plantDefId] || 0;
        if (count <= 0) return false;

        const newCollection = { ...shop.plantuleCollection };
        newCollection[plantDefId] = count - 1;
        if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
        useShopStore.setState({ plantuleCollection: newCollection });

        const newPlant: PlantState = {
          ...createInitialPlantState(plantDefId),
          stage: 1,
          growthProgress: 60,
          daysSincePlanting: 20,
          daysInCurrentStage: 10,
        };

        const newMiniSerres = state.miniSerres.map((s, i) => {
          if (i !== serreIdx) return s;
          const newSlots = s.slots.map((r) => r.map((c) => c));
          newSlots[row][col] = newPlant;
          return { ...s, slots: newSlots };
        });

        set({ miniSerres: newMiniSerres });
        return true;
      },

      waterMiniSerrePlant: (serreId: string, row: number, col: number) => {
        set((s) => {
          const newMiniSerres = s.miniSerres.map((serre) => {
            if (serre.id !== serreId) return serre;
            const plant = serre.slots[row]?.[col];
            if (!plant) return serre;
            const newSlots = serre.slots.map((r) => r.map((c) => c));
            newSlots[row][col] = applyWatering(plant);
            return { ...serre, slots: newSlots };
          });
          return { miniSerres: newMiniSerres };
        });
      },

      treatMiniSerrePlant: (serreId: string, row: number, col: number) => {
        set((s) => {
          const newMiniSerres = s.miniSerres.map((serre) => {
            if (serre.id !== serreId) return serre;
            const plant = serre.slots[row]?.[col];
            if (!plant) return serre;
            const newSlots = serre.slots.map((r) => r.map((c) => c));
            newSlots[row][col] = applyTreatment(plant);
            return { ...serre, slots: newSlots };
          });
          return { miniSerres: newMiniSerres };
        });
      },

      fertilizeMiniSerrePlant: (serreId: string, row: number, col: number) => {
        set((s) => {
          const newMiniSerres = s.miniSerres.map((serre) => {
            if (serre.id !== serreId) return serre;
            const plant = serre.slots[row]?.[col];
            if (!plant) return serre;
            const newSlots = serre.slots.map((r) => r.map((c) => c));
            newSlots[row][col] = applyFertilizer(plant);
            return { ...serre, slots: newSlots };
          });
          return { miniSerres: newMiniSerres };
        });
      },

      removeMiniSerrePlant: (serreId: string, row: number, col: number) => {
        set((s) => {
          const newMiniSerres = s.miniSerres.map((serre) => {
            if (serre.id !== serreId) return serre;
            if (!serre.slots[row]?.[col]) return serre;
            const newSlots = serre.slots.map((r) => r.map((c) => c));
            newSlots[row][col] = null;
            return { ...serre, slots: newSlots };
          });
          return { miniSerres: newMiniSerres };
        });
      },

      waterAllMiniSerre: (serreId: string) => {
        set((s) => {
          const newMiniSerres = s.miniSerres.map((serre) => {
            if (serre.id !== serreId) return serre;
            const newSlots = serre.slots.map((r) => r.map((c) => {
              if (c) return applyWatering(c);
              return c;
            }));
            return { ...serre, slots: newSlots };
          });
          return { miniSerres: newMiniSerres };
        });
      },

      removeMiniSerre: (serreId: string) => {
        set((s) => {
          const newMiniSerres = s.miniSerres.filter((ms) => ms.id !== serreId);
          return { miniSerres: newMiniSerres };
        });
      },

      fillMiniSerre: (serreId: string, plantDefId: string) => {
        const state = get();
        const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
        if (serreIdx < 0) return false;
        const serre = state.miniSerres[serreIdx];

        let emptySlots = 0;
        serre.slots.forEach((row) => row.forEach((c) => { if (!c) emptySlots++; }));

        const shop = useShopStore.getState();
        const totalSeeds = shop._getSeedCount(plantDefId);
        const toFill = Math.min(emptySlots, totalSeeds);
        if (toFill <= 0) return false;

        // Consume seeds
        let remaining = toFill;
        const newVarieties = { ...shop.seedVarieties };
        const matchingVarieties = SEED_VARIETIES.filter((v) => v.plantDefId === plantDefId);
        for (const v of matchingVarieties) {
          if (remaining <= 0) break;
          const available = newVarieties[v.id] || 0;
          const use = Math.min(available, remaining);
          if (use > 0) {
            newVarieties[v.id] = available - use;
            if (newVarieties[v.id] <= 0) delete newVarieties[v.id];
            remaining -= use;
          }
        }
        const newCollection = { ...shop.seedCollection };
        if (remaining > 0) {
          const classicAvail = newCollection[plantDefId] || 0;
          const classicUse = Math.min(classicAvail, remaining);
          newCollection[plantDefId] = classicAvail - classicUse;
          if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
        }
        useShopStore.setState({ seedCollection: newCollection, seedVarieties: newVarieties });

        const newMiniSerres = state.miniSerres.map((s, i) => {
          if (i !== serreIdx) return s;
          const newSlots = s.slots.map((r) => r.map((c) => c));
          let placed = 0;
          for (let r = 0; r < newSlots.length && placed < toFill; r++) {
            for (let c = 0; c < newSlots[r].length && placed < toFill; c++) {
              if (!newSlots[r][c]) {
                newSlots[r][c] = createInitialPlantState(plantDefId);
                placed++;
              }
            }
          }
          return { ...s, slots: newSlots };
        });

        set({ miniSerres: newMiniSerres });
        return true;
      },

      plantInMiniSerreAtDate: (serreId: string, row: number, col: number, plantDefId: string, daysSincePlanting: number) => {
        const state = get();
        const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
        if (serreIdx < 0) return false;
        const serre = state.miniSerres[serreIdx];
        if (serre.slots[row]?.[col] !== null) return false;

        const consumed = useShopStore.getState()._consumeSeed(plantDefId);
        if (!consumed) return false;

        const newPlant: PlantState = {
          ...createInitialPlantState(plantDefId),
          daysSincePlanting: daysSincePlanting,
        };

        const plantDef = PLANTS[plantDefId];
        if (plantDef) {
          let remaining = daysSincePlanting;
          let targetStage = 0;
          let daysInStage = 0;
          for (let s = 0; s < 4; s++) {
            const dur = plantDef.stageDurations[s];
            if (remaining <= dur) {
              targetStage = s;
              daysInStage = remaining;
              break;
            }
            remaining -= dur;
            if (s === 3) {
              targetStage = 3;
              daysInStage = dur;
            }
          }
          newPlant.stage = targetStage;
          newPlant.daysInCurrentStage = daysInStage;
          const stageDur = plantDef.stageDurations[targetStage];
          newPlant.growthProgress = stageDur > 0 ? Math.round((daysInStage / stageDur) * 100) : 100;
          if (newPlant.growthProgress >= 100) {
            newPlant.growthProgress = 99;
            if (targetStage === 3) newPlant.isHarvestable = true;
          }
        } else {
          newPlant.daysInCurrentStage = Math.min(daysSincePlanting, 10);
          if (daysSincePlanting >= 45) {
            newPlant.stage = 3; newPlant.growthProgress = 85;
          } else if (daysSincePlanting >= 30) {
            newPlant.stage = 2; newPlant.growthProgress = 60;
          } else if (daysSincePlanting >= 15) {
            newPlant.stage = 1; newPlant.growthProgress = 35;
          } else if (daysSincePlanting >= 5) {
            newPlant.stage = 1; newPlant.growthProgress = 15;
          }
        }

        const newMiniSerres = state.miniSerres.map((s, i) => {
          if (i !== serreIdx) return s;
          const newSlots = s.slots.map((r) => r.map((c) => c));
          newSlots[row][col] = newPlant;
          return { ...s, slots: newSlots };
        });

        set({ miniSerres: newMiniSerres });
        return true;
      },

      // ── Chambre/SerreTile Actions ──

      buyMiniSerre: () => {
        const shop = useShopStore.getState();
        if (shop.coins < MINI_SERRE_PRICE) return false;

        const newMiniSerre = createEmptyMiniSerre();
        const newMiniSerres = [...get().miniSerres, newMiniSerre];
        useShopStore.setState({ coins: shop.coins - MINI_SERRE_PRICE });

        set({ miniSerres: newMiniSerres });
        return true;
      },

      buyChambreDeCulture: (modelId: string) => {
        const shop = useShopStore.getState();
        const model = CHAMBRE_CATALOG.find((m) => m.id === modelId);
        if (!model) return false;
        if (shop.coins < model.price) return false;

        const newOwned = { ...get().ownedChambres };
        newOwned[modelId] = (newOwned[modelId] || 0) + 1;
        const newActive = get().activeChambreId || modelId;

        useShopStore.setState({ coins: shop.coins - model.price });
        set({ ownedChambres: newOwned, activeChambreId: newActive });
        return true;
      },

      setActiveChambre: (modelId: string | null) => {
        set({ activeChambreId: modelId });
      },

      buySerreTile: () => {
        const shop = useShopStore.getState();
        if (shop.coins < 50) return false;

        useShopStore.setState({ coins: shop.coins - 50 });
        set({ serreTiles: get().serreTiles + 1 });
        return true;
      },

      // ── Selection & Settings ──

      setSelectedSlot: (serreId: string, slot: { row: number; col: number } | null) => {
        set({ selectedMiniSerreId: slot ? serreId : null, selectedSlot: slot });
      },

      updateHologramSettings: (settings: Partial<HologramSettings>) => {
        set((s) => ({ hologramSettings: { ...s.hologramSettings, ...settings } }));
      },
    }),
    {
      name: 'botania-nursery',
      partialize: (state) => ({
        pepiniere: state.pepiniere,
        miniSerres: state.miniSerres,
        ownedChambres: state.ownedChambres,
        activeChambreId: state.activeChambreId,
        selectedMiniSerreId: state.selectedMiniSerreId,
        selectedSlot: state.selectedSlot,
        hologramSettings: state.hologramSettings,
        serreTiles: state.serreTiles,
      }),
    }
  )
);