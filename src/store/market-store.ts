/**
 * Market Store — Prix dynamiques du marché
 *
 * Les prix varient selon :
 * - La saison (primeur = +50%, pleine saison = normal, hors saison = -30%)
 * - L'offre/demande (plus on vend, plus le prix baisse temporairement)
 * - Les événements météo (canicule = hausse prix légumes, gel = hausse prix)
 *
 * Sources : RNM (Réseau Nouvelles Marchés), FAO Stat
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLANTS } from '@/lib/plant-db';

// ═══ Types ═══

export type MarketTrend = 'rising' | 'stable' | 'falling';

interface MarketItem {
  plantDefId: string;
  basePrice: number;        // Prix de base (pièces/unité)
  currentPrice: number;      // Prix actuel ajusté
  demandFactor: number;      // 0.5-2.0 — plus on vend, plus ça monte
  seasonModifier: number;    // Modificateur saisonnier
  trend: MarketTrend;
  lastSoldQuantity: number; // Quantité vendue récemment (reset quotidien)
}

interface MarketState {
  items: Record<string, MarketItem>;
  lastPriceUpdate: string | null;

  // Actions
  getCurrentPrice: (plantDefId: string) => number;
  getTrend: (plantDefId: string) => MarketTrend;
  sellOnMarket: (plantDefId: string, quantity: number) => number;
  refreshPrices: (currentMonth?: number) => void;
  getPriceHistory: (plantDefId: string) => { price: number; date: string }[];
}

// ═══ Prix de base réels (par unité, en "pièces" ≈ centimes d'euro) ═══

const BASE_PRICES: Record<string, number> = {
  tomato: 8, carrot: 6, strawberry: 10, lettuce: 5, basil: 7, pepper: 9,
  cucumber: 5, zucchini: 6, melon: 8, spinach: 4, radish: 3, parsley: 5,
  goji: 12, lycium: 12, mirabellier: 18,
  apple: 15, pear: 18, cherry: 20, apricot: 17, plum: 16, fig: 19, peach: 18, quince: 14,
  maple: 22, birch: 20, pine: 25, magnolia: 30,
  photinia: 10, eleagnus: 10, laurus: 8, cornus: 9, casseille: 11,
  bean: 7, squash: 9, sunflower: 6, quinoa: 12, amaranth: 11, sorrel: 4, corn: 8,
};

// ═══ Modificateurs saisonniers (par mois, index 0-11) ═══
// Primeur = cher, pleine saison = normal, hors saison = moins cher

function getSeasonModifier(plantDefId: string, month: number): number {
  const plant = PLANTS[plantDefId];
  if (!plant) return 1;

  const plantMonths = plant.optimalPlantMonths;

  // Pleine saison : prix normal
  if (plantMonths.includes(month + 1)) return 1.0;

  // Juste avant la saison (primeur) : +30-50%
  const oneMonthBefore = plantMonths.map(m => m === 1 ? 12 : m - 1);
  if (oneMonthBefore.includes(month + 1)) return 1.4;

  // Juste après la saison (surplus) : -20%
  const oneMonthAfter = plantMonths.map(m => m === 12 ? 1 : m + 1);
  if (oneMonthAfter.includes(month + 1)) return 0.8;

  // Hors saison (conserves/import) : -30%
  return 0.7;
}

// ═══ Store ═══

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => {
      function buildItems(month?: number): Record<string, MarketItem> {
        const currentMonth = month ?? new Date().getMonth();
        const items: Record<string, MarketItem> = {};

        for (const [id, basePrice] of Object.entries(BASE_PRICES)) {
          const seasonMod = getSeasonModifier(id, currentMonth);
          const demand = 1.0;
          const price = Math.max(1, Math.round(basePrice * seasonMod * demand));

          items[id] = {
            plantDefId: id,
            basePrice,
            currentPrice: price,
            demandFactor: demand,
            seasonModifier: seasonMod,
            trend: price > basePrice ? 'rising' : price < basePrice ? 'falling' : 'stable',
            lastSoldQuantity: 0,
          };
        }

        return items;
      }

      return {
        items: buildItems(),
        lastPriceUpdate: null,

        getCurrentPrice: (plantDefId: string): number => {
          const item = get().items[plantDefId];
          return item?.currentPrice ?? 5;
        },

        getTrend: (plantDefId: string): MarketTrend => {
          const item = get().items[plantDefId];
          return item?.trend ?? 'stable';
        },

        sellOnMarket: (plantDefId: string, quantity: number): number => {
          const items = { ...get().items };
          const item = items[plantDefId];
          if (!item) return 0;

          // Le prix baisse légèrement quand on vend beaucoup (offre↑)
          const total = item.currentPrice * quantity;

          // Augmenter la quantité vendue → baisse de prix future
          const newDemand = Math.max(0.5, item.demandFactor - (quantity * 0.02));
          const newSoldQty = item.lastSoldQuantity + quantity;

          items[plantDefId] = {
            ...item,
            demandFactor: newDemand,
            lastSoldQuantity: newSoldQty,
          };

          set({ items });
          return total;
        },

        refreshPrices: (currentMonth?: number) => {
          const month = currentMonth ?? new Date().getMonth();
          const today = new Date().toISOString().slice(0, 10);

          // Ne pas rafraîchir plus d'une fois par jour
          if (get().lastPriceUpdate === today) return;

          const newItems = buildItems(month);

          // Préserver les effets de demande
          const oldItems = get().items;
          for (const [id, item] of Object.entries(newItems)) {
            const old = oldItems[id];
            if (old) {
              // Réduire l'effet de demande sur 24h (retour progressif vers 1.0)
              const demandRecovery = old.demandFactor + (1.0 - old.demandFactor) * 0.5;
              item.demandFactor = demandRecovery;
              item.currentPrice = Math.max(1, Math.round(item.basePrice * item.seasonModifier * demandRecovery));
              item.lastSoldQuantity = 0;
              item.trend = item.currentPrice > item.basePrice ? 'rising' : item.currentPrice < item.basePrice ? 'falling' : 'stable';
            }
          }

          set({ items: newItems, lastPriceUpdate: today });
        },

        getPriceHistory: () => [], // Pas d'historique persisté pour le moment
      };
    },
    {
      name: 'botania-market',
      partialize: (state) => ({
        lastPriceUpdate: state.lastPriceUpdate,
        // Sauvegarder uniquement les demand factors
        items: Object.fromEntries(
          Object.entries(state.items).map(([id, item]) => [
            id,
            { demandFactor: item.demandFactor, lastSoldQuantity: item.lastSoldQuantity },
          ])
        ),
      }),
    }
  )
);