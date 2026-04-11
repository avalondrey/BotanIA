/**
 * Shop Store — Economy, seeds, plantules, and purchases
 * Extracted from game-store.ts for maintainability.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SEED_CATALOG,
  PLANTULE_CATALOG,
  SEED_VARIETIES,
} from './catalog';

// ═══ State Interface ═══

export interface ShopState {
  // Inventory
  seedCollection: Record<string, number>;
  plantuleCollection: Record<string, number>;
  seedVarieties: Record<string, number>;

  // Economy
  coins: number;
  ecoPoints: number;
  ecoLevel: number;

  // Score
  score: number;
  bestScore: number;

  // Actions
  buySeeds: (itemIdOrPlantDefId: string) => boolean;
  buyPlantule: (plantDefId: string) => boolean;
  buySeedVariety: (varietyId: string) => boolean;
  unlockSeedVariety: (varietyId: string) => boolean;
  addEcoPoints: (points: number) => void;
  addScore: (points: number) => void;
  deductCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;

  // Internal helpers
  _getSeedCount: (plantDefId: string) => number;
  _consumeSeed: (plantDefId: string) => boolean;

  // Init (called from game-store initGame)
  initShop: () => void;
}

// ═══ Default values ═══

const DEFAULT_SEEDS: Record<string, number> = {
  tomato: 3,
  carrot: 2,
  strawberry: 2,
  lettuce: 3,
  basil: 2,
  pepper: 1,
};

// ═══ Store ═══

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      seedCollection: { ...DEFAULT_SEEDS },
      plantuleCollection: {},
      seedVarieties: {},

      coins: 200,
      ecoPoints: 0,
      ecoLevel: 0,

      score: 0,
      bestScore: 0,

      // ── Shop Actions ──

      buySeeds: (itemIdOrPlantDefId: string) => {
        const state = get();
        const item = SEED_CATALOG.find((s) => s.id === itemIdOrPlantDefId || s.plantDefId === itemIdOrPlantDefId);
        if (!item) return false;
        if (state.coins < item.price) return false;

        const key = item.id;
        const newCollection = { ...state.seedCollection };
        newCollection[key] = (newCollection[key] || 0) + Math.ceil(item.price / 15);
        const newCoins = state.coins - item.price;

        set({ coins: newCoins, seedCollection: newCollection });
        return true;
      },

      buyPlantule: (plantDefId: string) => {
        const state = get();
        const item = PLANTULE_CATALOG.find((p) => p.plantDefId === plantDefId);
        if (!item) return false;
        if (state.coins < item.price) return false;

        const newCollection = { ...state.plantuleCollection };
        newCollection[plantDefId] = (newCollection[plantDefId] || 0) + 1;
        const newCoins = state.coins - item.price;

        set({ coins: newCoins, plantuleCollection: newCollection });
        return true;
      },

      buySeedVariety: (varietyId: string) => {
        const state = get();
        const variety = SEED_VARIETIES.find((v) => v.id === varietyId);
        if (!variety) return false;
        if (state.coins < variety.price) return false;

        // Unlock the variety card on first purchase
        if (!variety.unlocked) {
          variety.unlocked = true;
        }

        const newVarieties = { ...state.seedVarieties };
        newVarieties[varietyId] = (newVarieties[varietyId] || 0) + 1;
        const newCoins = state.coins - variety.price;

        // Also add to seedCollection so the seed is usable
        const newCollection = { ...state.seedCollection };
        newCollection[variety.plantDefId] = (newCollection[variety.plantDefId] || 0) + (variety.seedCount || 1);

        set({ coins: newCoins, seedVarieties: newVarieties, seedCollection: newCollection });
        return true;
      },

      unlockSeedVariety: (varietyId: string) => {
        const variety = SEED_VARIETIES.find((v) => v.id === varietyId);
        if (!variety) return false;
        if (variety.unlocked) return true;
        variety.unlocked = true;
        return true;
      },

      addEcoPoints: (points: number) => {
        const state = get();
        const newEcoPoints = state.ecoPoints + points;
        const newEcoLevel = Math.min(10, Math.floor(newEcoPoints / 50));
        set({ ecoPoints: newEcoPoints, ecoLevel: newEcoLevel });
      },

      addScore: (points: number) => {
        const state = get();
        const newScore = state.score + points;
        const newBest = Math.max(state.bestScore, newScore);
        set({ score: newScore, bestScore: newBest });
      },

      deductCoins: (amount: number) => {
        const state = get();
        if (state.coins < amount) return false;
        set({ coins: state.coins - amount });
        return true;
      },

      addCoins: (amount: number) => {
        set((state) => ({ coins: state.coins + amount }));
      },

      // ── Seed helpers (used by nursery-store & garden-store) ──

      _getSeedCount: (plantDefId: string) => {
        const state = get();
        let count = state.seedCollection[plantDefId] || 0;
        // Also count from variety seeds that match this plantDefId
        for (const [varietyId, qty] of Object.entries(state.seedVarieties)) {
          const variety = SEED_VARIETIES.find((v) => v.id === varietyId);
          if (variety && variety.plantDefId === plantDefId) {
            count += qty;
          }
        }
        return count;
      },

      _consumeSeed: (plantDefId: string) => {
        const state = get();
        // Priority: consume from varieties first, then classic
        const newVarieties = { ...state.seedVarieties };
        const newCollection = { ...state.seedCollection };

        // Try variety seeds first
        for (const [varietyId, qty] of Object.entries(newVarieties)) {
          if (qty <= 0) continue;
          const variety = SEED_VARIETIES.find((v) => v.id === varietyId);
          if (variety && variety.plantDefId === plantDefId) {
            newVarieties[varietyId] = qty - 1;
            if (newVarieties[varietyId] <= 0) delete newVarieties[varietyId];
            set({ seedVarieties: newVarieties });
            return true;
          }
        }

        // Fallback to classic seeds
        const count = newCollection[plantDefId] || 0;
        if (count <= 0) return false;
        newCollection[plantDefId] = count - 1;
        if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
        set({ seedCollection: newCollection });
        return true;
      },

      // ── Init ──

      initShop: () => {
        // Reset to defaults — Zustand persist will hydrate from localStorage
      },
    }),
    {
      name: 'botania-shop',
      partialize: (state) => ({
        seedCollection: state.seedCollection,
        plantuleCollection: state.plantuleCollection,
        seedVarieties: state.seedVarieties,
        coins: state.coins,
        ecoPoints: state.ecoPoints,
        ecoLevel: state.ecoLevel,
        score: state.score,
        bestScore: state.bestScore,
      }),
    }
  )
);