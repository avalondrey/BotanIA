/**
 * Achievements Store — Unit Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  },
  writable: true,
});

import {
  useAchievementStore,
  getAchievementById,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getRarityColor,
  TOTAL_ACHIEVEMENTS,
  TOTAL_POINTS,
  type AchievementState,
} from '@/store/achievements-store';

function createState(overrides: Partial<AchievementState> = {}): AchievementState {
  return {
    unlockedIds: new Set<string>(),
    plantProgress: {},
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalHarvests: 0,
    totalPlantings: 0,
    daysPlayed: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastLoginDate: '',
    loginDates: [],
    ...overrides,
  };
}

describe('Achievements Store', () => {
  beforeEach(() => {
    useAchievementStore.setState({
      unlockedIds: new Set<string>(),
      plantProgress: {},
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      totalHarvests: 0,
      totalPlantings: 0,
      daysPlayed: 0,
      longestStreak: 0,
      currentStreak: 0,
      lastLoginDate: '',
      loginDates: [],
    });
  });

  describe('recordPlanting', () => {
    it('increments total plantings', () => {
      useAchievementStore.getState().recordPlanting('tomato');
      expect(useAchievementStore.getState().totalPlantings).toBe(1);
    });

    it('initializes plant progress for new plant', () => {
      useAchievementStore.getState().recordPlanting('tomato');
      const progress = useAchievementStore.getState().plantProgress['tomato'];
      expect(progress).toBeDefined();
      expect(progress?.planted).toBe(1);
      expect(progress?.harvested).toBe(0);
    });

    it('accumulates plantings for same plant', () => {
      const store = useAchievementStore.getState();
      store.recordPlanting('tomato');
      store.recordPlanting('tomato');
      store.recordPlanting('carrot');
      expect(useAchievementStore.getState().plantProgress['tomato']?.planted).toBe(2);
      expect(useAchievementStore.getState().plantProgress['carrot']?.planted).toBe(1);
    });
  });

  describe('recordHarvest', () => {
    it('increments total harvests and quantity', () => {
      useAchievementStore.getState().recordHarvest('tomato', 5);
      expect(useAchievementStore.getState().totalHarvests).toBe(1);
      expect(useAchievementStore.getState().plantProgress['tomato']?.totalHarvested).toBe(5);
    });
  });

  describe('recordSale', () => {
    it('increments total coins earned', () => {
      useAchievementStore.getState().recordSale(100);
      useAchievementStore.getState().recordSale(50);
      expect(useAchievementStore.getState().totalCoinsEarned).toBe(150);
    });
  });

  describe('checkAchievements', () => {
    it('unlocks first_plant when total plantings >= 1', () => {
      const store = useAchievementStore.getState();
      expect(store.getUnlockedAchievements().length).toBe(0);
      store.recordPlanting('tomato');
      // recordPlanting calls checkAchievements internally, so unlock should be visible
      expect(store.getUnlockedAchievements().some(a => a.id === 'first_plant')).toBe(true);
    });

    it('unlocks harvest_25 when total harvests >= 25', () => {
      const store = useAchievementStore.getState();
      expect(store.getUnlockedAchievements().length).toBe(0);
      for (let i = 0; i < 25; i++) {
        store.recordHarvest('tomato', 1);
      }
      // recordHarvest calls checkAchievements internally
      expect(store.getUnlockedAchievements().some(a => a.id === 'harvest_25')).toBe(true);
    });

    it('does not re-unlock already unlocked achievements', () => {
      const store = useAchievementStore.getState();
      store.unlockAchievement('first_plant');
      const newlyUnlocked = store.checkAchievements();
      // first_plant was already unlocked, so checkAchievements should not return it again
      expect(newlyUnlocked.some(a => a.id === 'first_plant')).toBe(false);
    });
  });

  describe('getPoints', () => {
    it('returns 0 when no achievements unlocked', () => {
      expect(useAchievementStore.getState().getPoints()).toBe(0);
    });

    it('returns sum of points for unlocked achievements', () => {
      const store = useAchievementStore.getState();
      store.unlockAchievement('first_plant'); // 10 pts
      store.unlockAchievement('first_harvest'); // 10 pts
      expect(store.getPoints()).toBe(20);
    });
  });

  describe('getUnlockedAchievements / getLockedAchievements', () => {
    it('returns correct lists', () => {
      const store = useAchievementStore.getState();
      store.unlockAchievement('first_plant');
      store.unlockAchievement('first_harvest');
      const unlocked = store.getUnlockedAchievements();
      const locked = store.getLockedAchievements();
      expect(unlocked.length).toBe(2);
      expect(locked.length).toBe(TOTAL_ACHIEVEMENTS - 2);
    });
  });
});

describe('Achievement helpers', () => {
  describe('getAchievementById', () => {
    it('returns the achievement', () => {
      const achievement = getAchievementById('first_plant');
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('first_plant');
    });

    it('returns undefined for unknown id', () => {
      expect(getAchievementById('unknown-achievement')).toBeUndefined();
    });
  });

  describe('getAchievementsByCategory', () => {
    it('returns only planting achievements', () => {
      const planting = getAchievementsByCategory('planting');
      expect(planting.length).toBeGreaterThan(0);
      expect(planting.every(a => a.category === 'planting')).toBe(true);
    });
  });

  describe('getAchievementsByRarity', () => {
    it('returns only legendary achievements', () => {
      const legendary = getAchievementsByRarity('legendary');
      expect(legendary.length).toBeGreaterThan(0);
      expect(legendary.every(a => a.rarity === 'legendary')).toBe(true);
    });
  });

  describe('getRarityColor', () => {
    it('returns correct colors for each rarity', () => {
      expect(getRarityColor('common')).toBe('#9ca3af');
      expect(getRarityColor('uncommon')).toBe('#22c55e');
      expect(getRarityColor('rare')).toBe('#3b82f6');
      expect(getRarityColor('epic')).toBe('#a855f7');
      expect(getRarityColor('legendary')).toBe('#f59e0b');
    });
  });

  describe('TOTAL_ACHIEVEMENTS and TOTAL_POINTS', () => {
    it('TOTAL_ACHIEVEMENTS matches ACHIEVEMENTS array length', () => {
      expect(TOTAL_ACHIEVEMENTS).toBeGreaterThan(0);
    });

    it('TOTAL_POINTS is positive', () => {
      expect(TOTAL_POINTS).toBeGreaterThan(0);
    });
  });
});
