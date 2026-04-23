/**
 * useUnifiedEconomy — Hook économique unifié
 *
 * Combine shop-store + economy-store + market-store en une seule interface.
 * Les stores sous-jacents restent séparés (maintenabilité),
 * mais les composants n'importent plus que ce hook.
 */

import { useMemo } from 'react';
import { useShopStore } from '@/store/shop-store';
import { useEconomyStore } from '@/store/economy-store';
import { useMarketStore } from '@/store/market-store';
import type { QuestInstance } from '@/store/economy-store';
import type { MarketTrend } from '@/store/market-store';

export interface UnifiedEconomy {
  // ── Monnaie ──
  coins: number;
  score: number;
  bestScore: number;
  ecoPoints: number;
  ecoLevel: number;

  // ── Inventaire ──
  seedCollection: Record<string, number>;
  seedVarieties: Record<string, number>;
  unlockedVarieties: Record<string, boolean>;
  harvestInventory: Record<string, number>;

  // ── Quêtes ──
  activeQuests: QuestInstance[];
  completedQuestIds: string[];
  dailyStreak: number;
  lastDailyBonusDate: string | null;

  // ── Marché ──
  marketPrices: Record<string, number>;
  marketTrends: Record<string, MarketTrend>;

  // ── Actions unifiées ──
  claimDailyBonus: () => { coins: number; streak: number; alreadyClaimed: boolean };
  claimQuestReward: (questId: string) => number;
  refreshDailyQuests: () => void;
  sellHarvest: (plantDefId: string, quantity: number) => number;
  getSellPrice: (plantDefId: string) => number;
  getMarketPrice: (plantDefId: string) => number;
  getMarketTrend: (plantDefId: string) => MarketTrend;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  addScore: (points: number) => void;
  buySeeds: (itemId: string) => boolean;
  openSeedPacket: (varietyId: string) => boolean;
}

export function useUnifiedEconomy(): UnifiedEconomy {
  const shop = useShopStore();
  const economy = useEconomyStore();
  const market = useMarketStore();

  // Cache market prices/trends to avoid re-renders
  const marketPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    for (const id of Object.keys(market.items)) {
      prices[id] = market.getCurrentPrice(id);
    }
    return prices;
  }, [market.items, market.lastPriceUpdate]);

  const marketTrends = useMemo(() => {
    const trends: Record<string, MarketTrend> = {};
    for (const id of Object.keys(market.items)) {
      trends[id] = market.getTrend(id);
    }
    return trends;
  }, [market.items, market.lastPriceUpdate]);

  return useMemo(() => ({
    coins: shop.coins,
    score: shop.score,
    bestScore: shop.bestScore,
    ecoPoints: shop.ecoPoints,
    ecoLevel: shop.ecoLevel,

    seedCollection: shop.seedCollection,
    seedVarieties: shop.seedVarieties,
    unlockedVarieties: shop.unlockedVarieties,
    harvestInventory: economy.harvestInventory,

    activeQuests: economy.activeQuests,
    completedQuestIds: economy.completedQuestIds,
    dailyStreak: economy.dailyStreak,
    lastDailyBonusDate: economy.lastDailyBonusDate,

    marketPrices,
    marketTrends,

    claimDailyBonus: economy.claimDailyBonus,
    claimQuestReward: economy.claimQuestReward,
    refreshDailyQuests: economy.refreshDailyQuests,
    sellHarvest: economy.sellHarvest,
    getSellPrice: economy.getSellPrice,
    getMarketPrice: market.getCurrentPrice,
    getMarketTrend: market.getTrend,
    addCoins: shop.addCoins,
    deductCoins: shop.deductCoins,
    addScore: shop.addScore,
    buySeeds: shop.buySeeds,
    openSeedPacket: shop.openSeedPacket,
  }), [
    shop, economy, market,
    marketPrices, marketTrends,
  ]);
}
