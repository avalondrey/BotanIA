/**
 * Economy Store — Coin earning mechanics for BotanIA
 *
 * Handles:
 * - Harvest inventory (produce to sell at market)
 * - Daily login bonus with streak
 * - Daily quests (3 per day, randomly selected)
 * - Sell prices per plant
 * - Session stats for quest tracking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══ Sell prices per plant (coins per unit) ═══
const SELL_PRICES: Record<string, number> = {
  tomato: 8, carrot: 6, strawberry: 10, lettuce: 5, basil: 7, pepper: 9,
  cucumber: 5, zucchini: 6, melon: 8, spinach: 4, radish: 3, parsley: 5,
  goji: 12, lycium: 12, mirabellier: 18,
  apple: 15, pear: 18, cherry: 20, apricot: 17, plum: 16, fig: 19, peach: 18, quince: 14,
  maple: 22, birch: 20, pine: 25, magnolia: 30,
  photinia: 10, eleagnus: 10, laurus: 8, cornus: 9, casseille: 11,
  bean: 7, squash: 9, sunflower: 6, quinoa: 12, amaranth: 11, sorrel: 4, corn: 8,
};

// ═══ Quest definitions ═══
interface QuestDef {
  id: string;
  title: string;
  emoji: string;
  statKey: keyof SessionStats;
  target: number;
  reward: number;
}

const QUEST_POOL: QuestDef[] = [
  { id: 'q-water-3', title: 'Arroser 3 plantes', emoji: '💧', statKey: 'plantsWatered', target: 3, reward: 5 },
  { id: 'q-water-5', title: 'Arroser 5 plantes', emoji: '💧', statKey: 'plantsWatered', target: 5, reward: 8 },
  { id: 'q-plant-2', title: 'Planter 2 graines', emoji: '🌱', statKey: 'seedsPlanted', target: 2, reward: 10 },
  { id: 'q-plant-4', title: 'Planter 4 graines', emoji: '🌱', statKey: 'seedsPlanted', target: 4, reward: 15 },
  { id: 'q-identify-1', title: 'Identifier 1 plante', emoji: '📸', statKey: 'plantsIdentified', target: 1, reward: 15 },
  { id: 'q-harvest-3', title: 'Récolter 3 plantes', emoji: '🌾', statKey: 'plantsHarvested', target: 3, reward: 15 },
  { id: 'q-harvest-5', title: 'Récolter 5 plantes', emoji: '🌾', statKey: 'plantsHarvested', target: 5, reward: 20 },
  { id: 'q-tree-1', title: 'Planter 1 arbre', emoji: '🌳', statKey: 'treesPlanted', target: 1, reward: 20 },
];

interface SessionStats {
  plantsWatered: number;
  seedsPlanted: number;
  plantsHarvested: number;
  plantsIdentified: number;
  treesPlanted: number;
}

export interface QuestInstance {
  def: QuestDef;
  progress: number;
  completed: boolean;
  rewardClaimed: boolean;
}

interface EconomyState {
  // ── Harvest inventory (sellable produce) ──
  harvestInventory: Record<string, number>;

  // ── Daily bonus ──
  lastDailyBonusDate: string | null;
  dailyStreak: number;
  totalDailyBonusesClaimed: number;

  // ── Quests ──
  activeQuests: QuestInstance[];
  completedQuestIds: string[];
  lastQuestResetDate: string | null;

  // ── Session stats ──
  sessionStats: SessionStats;

  // ── Actions ──
  sellHarvest: (plantDefId: string, quantity: number) => number;
  addHarvestInventory: (plantDefId: string, quantity?: number) => void;
  getSellPrice: (plantDefId: string) => number;

  claimDailyBonus: () => { coins: number; streak: number; alreadyClaimed: boolean };
  checkAndResetDaily: () => void;

  trackWaterPlant: () => void;
  trackPlantSeed: () => void;
  trackHarvest: () => void;
  trackIdentify: () => void;
  trackTreePlanted: () => void;

  checkQuestCompletion: () => QuestInstance[];
  claimQuestReward: (questId: string) => number;
  refreshDailyQuests: () => void;
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function pickRandomQuests(count: number, exclude: string[] = []): QuestDef[] {
  const available = QUEST_POOL.filter(q => !exclude.includes(q.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function createQuestInstances(defs: QuestDef[]): QuestInstance[] {
  return defs.map(def => ({
    def,
    progress: 0,
    completed: false,
    rewardClaimed: false,
  }));
}

function getStreakBonus(streak: number): number {
  if (streak <= 0) return 5;
  if (streak >= 7) return 15;
  return 4 + streak; // Day 1=5, 2=6, 3=7, 4=8, 5=9, 6=10, 7+=15
}

export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      harvestInventory: {},
      lastDailyBonusDate: null,
      dailyStreak: 0,
      totalDailyBonusesClaimed: 0,
      activeQuests: createQuestInstances(pickRandomQuests(3)),
      completedQuestIds: [],
      lastQuestResetDate: null,
      sessionStats: {
        plantsWatered: 0,
        seedsPlanted: 0,
        plantsHarvested: 0,
        plantsIdentified: 0,
        treesPlanted: 0,
      },

      // ── Sell harvest ──
      sellHarvest: (plantDefId: string, quantity: number): number => {
        const current = get().harvestInventory[plantDefId] || 0;
        const sellQty = Math.min(quantity, current);
        if (sellQty <= 0) return 0;

        const pricePerUnit = get().getSellPrice(plantDefId);
        const totalCoins = sellQty * pricePerUnit;

        const { useShopStore } = require('@/store/shop-store');
        useShopStore.getState().addCoins(totalCoins);

        set((state) => ({
          harvestInventory: {
            ...state.harvestInventory,
            [plantDefId]: Math.max(0, (state.harvestInventory[plantDefId] || 0) - sellQty),
          },
        }));

        return totalCoins;
      },

      addHarvestInventory: (plantDefId: string, quantity: number = 1) => {
        set((state) => ({
          harvestInventory: {
            ...state.harvestInventory,
            [plantDefId]: (state.harvestInventory[plantDefId] || 0) + quantity,
          },
        }));
      },

      getSellPrice: (plantDefId: string): number => {
        return SELL_PRICES[plantDefId] || 5;
      },

      // ── Daily bonus ──
      claimDailyBonus: (): { coins: number; streak: number; alreadyClaimed: boolean } => {
        const today = getTodayStr();
        if (get().lastDailyBonusDate === today) {
          return { coins: 0, streak: get().dailyStreak, alreadyClaimed: true };
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = get().lastDailyBonusDate === yesterday ? get().dailyStreak + 1 : 1;
        const bonus = getStreakBonus(newStreak);

        const { useShopStore } = require('@/store/shop-store');
        useShopStore.getState().addCoins(bonus);

        set({
          lastDailyBonusDate: today,
          dailyStreak: newStreak,
          totalDailyBonusesClaimed: get().totalDailyBonusesClaimed + 1,
        });

        return { coins: bonus, streak: newStreak, alreadyClaimed: false };
      },

      checkAndResetDaily: () => {
        const today = getTodayStr();
        // Reset daily quests if new day
        if (get().lastQuestResetDate !== today) {
          get().refreshDailyQuests();
        }
      },

      // ── Tracking ──
      trackWaterPlant: () => {
        set((s) => ({
          sessionStats: { ...s.sessionStats, plantsWatered: s.sessionStats.plantsWatered + 1 },
        }));
        get().checkQuestCompletion();
      },

      trackPlantSeed: () => {
        set((s) => ({
          sessionStats: { ...s.sessionStats, seedsPlanted: s.sessionStats.seedsPlanted + 1 },
        }));
        get().checkQuestCompletion();
      },

      trackHarvest: () => {
        set((s) => ({
          sessionStats: { ...s.sessionStats, plantsHarvested: s.sessionStats.plantsHarvested + 1 },
        }));
        get().checkQuestCompletion();
      },

      trackIdentify: () => {
        set((s) => ({
          sessionStats: { ...s.sessionStats, plantsIdentified: s.sessionStats.plantsIdentified + 1 },
        }));
        get().checkQuestCompletion();
      },

      trackTreePlanted: () => {
        set((s) => ({
          sessionStats: { ...s.sessionStats, treesPlanted: s.sessionStats.treesPlanted + 1 },
        }));
        get().checkQuestCompletion();
      },

      // ── Quests ──
      checkQuestCompletion: (): QuestInstance[] => {
        const stats = get().sessionStats;
        let changed = false;
        const updatedQuests = get().activeQuests.map(q => {
          if (q.completed) return q;
          const newProgress = stats[q.def.statKey] || 0;
          if (newProgress >= q.def.target && !q.completed) {
            changed = true;
            return { ...q, progress: newProgress, completed: true };
          }
          if (newProgress !== q.progress) {
            changed = true;
            return { ...q, progress: newProgress };
          }
          return q;
        });

        if (changed) {
          set({ activeQuests: updatedQuests });
        }
        return updatedQuests.filter(q => q.completed && !q.rewardClaimed);
      },

      claimQuestReward: (questId: string): number => {
        const quest = get().activeQuests.find(q => q.def.id === questId);
        if (!quest || !quest.completed || quest.rewardClaimed) return 0;

        const { useShopStore } = require('@/store/shop-store');
        useShopStore.getState().addCoins(quest.def.reward);

        set((state) => ({
          activeQuests: state.activeQuests.map(q =>
            q.def.id === questId ? { ...q, rewardClaimed: true } : q
          ),
          completedQuestIds: [...state.completedQuestIds, questId],
        }));

        return quest.def.reward;
      },

      refreshDailyQuests: () => {
        const today = getTodayStr();
        set({
          activeQuests: createQuestInstances(pickRandomQuests(3, get().completedQuestIds)),
          lastQuestResetDate: today,
          completedQuestIds: [],
          sessionStats: {
            plantsWatered: 0,
            seedsPlanted: 0,
            plantsHarvested: 0,
            plantsIdentified: 0,
            treesPlanted: 0,
          },
        });
      },
    }),
    {
      name: 'botania-economy',
      partialize: (state) => ({
        harvestInventory: state.harvestInventory,
        lastDailyBonusDate: state.lastDailyBonusDate,
        dailyStreak: state.dailyStreak,
        totalDailyBonusesClaimed: state.totalDailyBonusesClaimed,
        completedQuestIds: state.completedQuestIds,
        lastQuestResetDate: state.lastQuestResetDate,
        activeQuests: state.activeQuests.map(q => ({
          def: q.def,
          progress: q.progress,
          completed: q.completed,
          rewardClaimed: q.rewardClaimed,
        })),
      }),
    }
  )
);