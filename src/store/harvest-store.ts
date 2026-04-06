/**
 * Harvest Store — Gestion des récoltes réelles
 * Suit les récoltes du jardin réel avec poids, dates, rangs
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HarvestEntry {
  id: string;
  date: string;                // ISO date "2026-04-06"
  plantDefId: string;          // "tomato", "carrot"
  plantName: string;           // "Tomate Cocktail"
  plantEmoji: string;         // 🍅
  rowId?: string;              // optional garden row reference
  rowLabel?: string;           // "Rang 1 - Tomates"
  quantityKg: number;         // weight in kg
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  photoIds: string[];          // optional harvest photos
  createdAt: number;
}

interface HarvestStore {
  harvests: HarvestEntry[];

  // Actions
  addHarvest: (entry: Omit<HarvestEntry, 'id' | 'createdAt'>) => string;
  updateHarvest: (id: string, update: Partial<HarvestEntry>) => void;
  deleteHarvest: (id: string) => void;

  // Queries
  getHarvestsForDate: (date: string) => HarvestEntry[];
  getHarvestsForDateRange: (start: string, end: string) => HarvestEntry[];
  getHarvestsForPlant: (plantDefId: string) => HarvestEntry[];
  getTotalWeight: (plantDefId?: string, start?: string, end?: string) => number;
  getMonthlyStats: (year: number, month: number) => { totalKg: number; count: number; byPlant: Record<string, number> };

  // Export
  exportData: (format: 'csv' | 'json', start?: string, end?: string) => string;
}

export const useHarvestStore = create<HarvestStore>()(
  persist(
    (set, get) => ({
      harvests: [],

      addHarvest: (entry) => {
        const id = Math.random().toString(36).slice(2, 9);
        const newHarvest: HarvestEntry = { ...entry, id, createdAt: Date.now() };
        set(s => ({ harvests: [newHarvest, ...s.harvests] }));
        return id;
      },

      updateHarvest: (id, update) => {
        set(s => ({
          harvests: s.harvests.map(h => h.id === id ? { ...h, ...update } : h)
        }));
      },

      deleteHarvest: (id) => {
        set(s => ({ harvests: s.harvests.filter(h => h.id !== id) }));
      },

      getHarvestsForDate: (date) => {
        return get().harvests.filter(h => h.date === date);
      },

      getHarvestsForDateRange: (start, end) => {
        return get().harvests.filter(h => h.date >= start && h.date <= end);
      },

      getHarvestsForPlant: (plantDefId) => {
        return get().harvests.filter(h => h.plantDefId === plantDefId);
      },

      getTotalWeight: (plantDefId, start, end) => {
        return get().harvests
          .filter(h => {
            if (plantDefId && h.plantDefId !== plantDefId) return false;
            if (start && h.date < start) return false;
            if (end && h.date > end) return false;
            return true;
          })
          .reduce((sum, h) => sum + h.quantityKg, 0);
      },

      getMonthlyStats: (year, month) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        const monthHarvests = get().harvests.filter(h => h.date.startsWith(prefix));

        const byPlant: Record<string, number> = {};
        monthHarvests.forEach(h => {
          byPlant[h.plantDefId] = (byPlant[h.plantDefId] || 0) + h.quantityKg;
        });

        return {
          totalKg: monthHarvests.reduce((sum, h) => sum + h.quantityKg, 0),
          count: monthHarvests.length,
          byPlant,
        };
      },

      exportData: (format, start, end) => {
        const harvests = get().harvests.filter(h => {
          if (start && h.date < start) return false;
          if (end && h.date > end) return false;
          return true;
        });

        if (format === 'json') {
          return JSON.stringify(harvests, null, 2);
        }

        // CSV format
        const headers = ['Date', 'Plante', 'Emoji', 'Rang', 'Poids (kg)', 'Qualité', 'Notes'];
        const rows = harvests.map(h => [
          h.date,
          h.plantName,
          h.plantEmoji,
          h.rowLabel || '',
          h.quantityKg.toString(),
          h.quality,
          h.notes || '',
        ]);

        return [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
      },
    }),
    { name: 'botania-harvests' }
  )
);
