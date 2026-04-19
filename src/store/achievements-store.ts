/**
 * Achievements Store — Badges et collection de plantes
 * Système de achievements pour gamification
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AchievementCategory =
  | 'harvest'
  | 'planting'
  | 'collection'
  | 'economy'
  | 'weather'
  | 'exploration'
  | 'mastery';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  /** Points attribués */
  points: number;
  /** Condition à remplir */
  condition: (state: AchievementState) => boolean;
  /** Date d'obtention (null si pas encore obtenu) */
  unlockedAt?: string;
}

export interface PlantAchievement {
  plantDefId: string;
  /** Nombre de plantations/plantules */
  planted: number;
  /** Nombre de récoltes */
  harvested: number;
  /** Date de première récolte */
  firstHarvest?: string;
  /** Quantité totale récoltée */
  totalHarvested: number;
  /** Date de première plantation */
  firstPlanted?: string;
}

export interface AchievementState {
  /** Achievements obtenus */
  unlockedIds: Set<string>;
  /** Suivi par plante */
  plantProgress: Record<string, PlantAchievement>;
  /** Stats globales */
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalHarvests: number;
  totalPlantings: number;
  daysPlayed: number;
  longestStreak: number;
  currentStreak: number;
  /** Date du dernier login */
  lastLoginDate: string;
  /** Jours de login consécutifs */
  loginDates: string[];
}

// ─── Définitions des achievements ─────────────────────────────────────────────

const ACHIEVEMENTS: Achievement[] = [
  // 🌱 Plantation
  {
    id: 'first_plant',
    name: 'Premier semis',
    description: 'Plantez votre première graine',
    emoji: '🌱',
    category: 'planting',
    rarity: 'common',
    points: 10,
    condition: (s) => s.totalPlantings >= 1,
  },
  {
    id: 'plant_10',
    name: 'Jardinier en herbe',
    description: 'Plantez 10 légumes',
    emoji: '🌿',
    category: 'planting',
    rarity: 'common',
    points: 25,
    condition: (s) => s.totalPlantings >= 10,
  },
  {
    id: 'plant_50',
    name: ' Maraîcher',
    description: 'Plantez 50 légumes',
    emoji: '🪴',
    category: 'planting',
    rarity: 'uncommon',
    points: 50,
    condition: (s) => s.totalPlantings >= 50,
  },

  // 🧺 Récolte
  {
    id: 'first_harvest',
    name: 'Première récolte',
    description: 'Récoltez votre premier légume',
    emoji: '🧺',
    category: 'harvest',
    rarity: 'common',
    points: 10,
    condition: (s) => s.totalHarvests >= 1,
  },
  {
    id: 'harvest_25',
    name: 'Récolte abondante',
    description: 'Effectuez 25 récoltes',
    emoji: '🥬',
    category: 'harvest',
    rarity: 'uncommon',
    points: 50,
    condition: (s) => s.totalHarvests >= 25,
  },
  {
    id: 'harvest_100',
    name: 'Prodigue',
    description: 'Effectuez 100 récoltes',
    emoji: '🌾',
    category: 'harvest',
    rarity: 'rare',
    points: 100,
    condition: (s) => s.totalHarvests >= 100,
  },
  {
    id: 'harvest_500',
    name: 'Maître harvestier',
    description: 'Effectuez 500 récoltes',
    emoji: '🏆',
    category: 'harvest',
    rarity: 'epic',
    points: 250,
    condition: (s) => s.totalHarvests >= 500,
  },

  // 💰 Économie
  {
    id: 'first_sale',
    name: 'Marchand novice',
    description: 'Vendez votre première récolte',
    emoji: '💰',
    category: 'economy',
    rarity: 'common',
    points: 10,
    condition: (s) => s.totalCoinsEarned >= 1,
  },
  {
    id: 'earn_1000',
    name: 'Marchand confirmé',
    description: 'Gagnez 1000 pièces',
    emoji: '💵',
    category: 'economy',
    rarity: 'uncommon',
    points: 50,
    condition: (s) => s.totalCoinsEarned >= 1000,
  },
  {
    id: 'earn_10000',
    name: 'Marchand expert',
    description: 'Gagnez 10 000 pièces',
    emoji: '💎',
    category: 'economy',
    rarity: 'rare',
    points: 100,
    condition: (s) => s.totalCoinsEarned >= 10000,
  },
  {
    id: 'earn_100000',
    name: 'Magnat du jardin',
    description: 'Gagnez 100 000 pièces',
    emoji: '👑',
    category: 'economy',
    rarity: 'legendary',
    points: 500,
    condition: (s) => s.totalCoinsEarned >= 100000,
  },

  // 🌿 Collection
  {
    id: 'collect_5_plants',
    name: 'Botaniste amateur',
    description: 'Cultivez 5 espèces différentes',
    emoji: '🍅',
    category: 'collection',
    rarity: 'common',
    points: 25,
    condition: (s) => Object.values(s.plantProgress).filter(p => p.harvested > 0).length >= 5,
  },
  {
    id: 'collect_10_plants',
    name: 'Botaniste confirmé',
    description: 'Cultivez 10 espèces différentes',
    emoji: '🥕',
    category: 'collection',
    rarity: 'uncommon',
    points: 75,
    condition: (s) => Object.values(s.plantProgress).filter(p => p.harvested > 0).length >= 10,
  },
  {
    id: 'collect_all_vegetables',
    name: 'Encyclopédie vivante',
    description: 'Récoltez au moins une fois chaque légume',
    emoji: '📖',
    category: 'collection',
    rarity: 'epic',
    points: 300,
    condition: (s) => {
      const vegHarvested = Object.values(s.plantProgress).filter(p => p.harvested > 0).length;
      return vegHarvested >= 15; // Adjust based on total vegetable count
    },
  },

  // 🌦️ Météo
  {
    id: 'survived_frost',
    name: 'Robuste',
    description: 'Surmonoez une nuit de gel avec vos plantes',
    emoji: '❄️',
    category: 'weather',
    rarity: 'uncommon',
    points: 50,
    condition: (s) => s.plantProgress['tomato']?.harvested > 0, // Proxy: if tomato harvested, survived weather
  },
  {
    id: 'perfect_year',
    name: 'Année parfaite',
    description: 'Jouez 30 jours consécutifs',
    emoji: '📅',
    category: 'weather',
    rarity: 'rare',
    points: 150,
    condition: (s) => s.longestStreak >= 30,
  },

  // 🔄 Exploration / Streaks
  {
    id: 'week_streak',
    name: 'Semaine parfaite',
    description: 'Connectez-vous 7 jours de suite',
    emoji: '🔥',
    category: 'exploration',
    rarity: 'uncommon',
    points: 50,
    condition: (s) => s.currentStreak >= 7,
  },
  {
    id: 'month_streak',
    name: 'Mois parfait',
    description: 'Connectez-vous 30 jours de suite',
    emoji: '⭐',
    category: 'exploration',
    rarity: 'rare',
    points: 200,
    condition: (s) => s.currentStreak >= 30,
  },

  // 🎓 Maîtrise
  {
    id: 'master_tomato',
    name: 'Maître tomato',
    description: 'Récoltez 50 tomates',
    emoji: '🍅',
    category: 'mastery',
    rarity: 'rare',
    points: 100,
    condition: (s) => (s.plantProgress['tomato']?.totalHarvested ?? 0) >= 50,
  },
  {
    id: 'master_carrot',
    name: 'Maître carrot',
    description: 'Récoltez 50 carottes',
    emoji: '🥕',
    category: 'mastery',
    rarity: 'rare',
    points: 100,
    condition: (s) => (s.plantProgress['carrot']?.totalHarvested ?? 0) >= 50,
  },
  {
    id: 'all_mastery',
    name: 'Grand maître BotanIA',
    description: 'Obtenez tous les autres achievements',
    emoji: '🏅',
    category: 'mastery',
    rarity: 'legendary',
    points: 1000,
    condition: (s) => {
      const legendary = ACHIEVEMENTS.filter(a => a.rarity === 'legendary' && a.id !== 'all_mastery');
      const unlocked = legendary.every(a => s.unlockedIds.has(a.id));
      return unlocked && s.unlockedIds.size >= 15;
    },
  },
];

// ─── Store ───────────────────────────────────────────────────────────────────

interface AchievementStore extends AchievementState {
  // Actions
  checkAchievements: () => Achievement[];
  unlockAchievement: (id: string) => void;
  recordPlanting: (plantDefId: string) => void;
  recordHarvest: (plantDefId: string, quantity: number) => void;
  recordSale: (coins: number) => void;
  recordLogin: () => void;
  getPoints: () => number;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getProgress: (achievementId: string) => { current: number; target: number; percent: number } | null;
}

function getDefaultState(): AchievementState {
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
  };
}

function updateStreak(state: AchievementState): AchievementState {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let currentStreak = state.currentStreak;
  if (state.lastLoginDate === today) {
    // Already logged in today
  } else if (state.lastLoginDate === yesterday) {
    currentStreak = state.currentStreak + 1;
  } else {
    currentStreak = 1;
  }

  const longestStreak = Math.max(state.longestStreak, currentStreak);

  return {
    ...state,
    currentStreak,
    longestStreak,
    lastLoginDate: today,
    loginDates: [...new Set([...state.loginDates, today])].slice(-365),
    daysPlayed: new Set([...state.loginDates, today]).size,
  };
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      ...getDefaultState(),

      checkAchievements: () => {
        const state = get();
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
          if (state.unlockedIds.has(achievement.id)) continue;
          if (achievement.condition(state)) {
            newlyUnlocked.push(achievement);
            set(s => ({ unlockedIds: new Set([...s.unlockedIds, achievement.id]) }));
          }
        }

        return newlyUnlocked;
      },

      unlockAchievement: (id: string) => {
        set(s => ({ unlockedIds: new Set([...s.unlockedIds, id]) }));
      },

      recordPlanting: (plantDefId: string) => {
        set(s => {
          const progress = s.plantProgress[plantDefId] ?? {
            plantDefId, planted: 0, harvested: 0, totalHarvested: 0,
          };
          const updated: PlantAchievement = {
            ...progress,
            planted: progress.planted + 1,
            firstPlanted: progress.firstPlanted ?? new Date().toISOString(),
          };
          return {
            plantProgress: { ...s.plantProgress, [plantDefId]: updated },
            totalPlantings: s.totalPlantings + 1,
          };
        });
        get().checkAchievements();
      },

      recordHarvest: (plantDefId: string, quantity: number) => {
        set(s => {
          const progress = s.plantProgress[plantDefId] ?? {
            plantDefId, planted: 0, harvested: 0, totalHarvested: 0,
          };
          const updated: PlantAchievement = {
            ...progress,
            harvested: progress.harvested + 1,
            totalHarvested: progress.totalHarvested + quantity,
            firstHarvest: progress.firstHarvest ?? new Date().toISOString(),
          };
          return {
            plantProgress: { ...s.plantProgress, [plantDefId]: updated },
            totalHarvests: s.totalHarvests + 1,
          };
        });
        get().checkAchievements();
      },

      recordSale: (coins: number) => {
        set(s => ({
          totalCoinsEarned: s.totalCoinsEarned + coins,
        }));
        get().checkAchievements();
      },

      recordLogin: () => {
        set(s => updateStreak(s));
        get().checkAchievements();
      },

      getPoints: () => {
        const state = get();
        return ACHIEVEMENTS
          .filter(a => state.unlockedIds.has(a.id))
          .reduce((sum, a) => sum + a.points, 0);
      },

      getUnlockedAchievements: () => {
        const state = get();
        return ACHIEVEMENTS.filter(a => state.unlockedIds.has(a.id));
      },

      getLockedAchievements: () => {
        const state = get();
        return ACHIEVEMENTS.filter(a => !state.unlockedIds.has(a.id));
      },

      getProgress: (achievementId: string) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return null;

        // Simple progress estimation
        const state = get();
        if (achievement.id === 'collect_5_plants') {
          const count = Object.values(state.plantProgress).filter(p => p.harvested > 0).length;
          return { current: count, target: 5, percent: Math.min(100, (count / 5) * 100) };
        }
        if (achievement.id === 'collect_10_plants') {
          const count = Object.values(state.plantProgress).filter(p => p.harvested > 0).length;
          return { current: count, target: 10, percent: Math.min(100, (count / 10) * 100) };
        }
        if (achievement.id === 'totalPlantings') {
          return { current: state.totalPlantings, target: 10, percent: Math.min(100, (state.totalPlantings / 10) * 100) };
        }
        return null;
      },
    }),
    {
      name: 'botania-achievements',
      partialize: (state) => ({
        unlockedIds: [...state.unlockedIds],
        plantProgress: state.plantProgress,
        totalCoinsEarned: state.totalCoinsEarned,
        totalCoinsSpent: state.totalCoinsSpent,
        totalHarvests: state.totalHarvests,
        totalPlantings: state.totalPlantings,
        daysPlayed: state.daysPlayed,
        longestStreak: state.longestStreak,
        currentStreak: state.currentStreak,
        lastLoginDate: state.lastLoginDate,
        loginDates: state.loginDates,
      }),
    }
  )
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity);
}

export function getRarityColor(rarity: AchievementRarity): string {
  const colors: Record<AchievementRarity, string> = {
    common: '#9ca3af',    // gray
    uncommon: '#22c55e',  // green
    rare: '#3b82f6',      // blue
    epic: '#a855f7',      // purple
    legendary: '#f59e0b', // gold
  };
  return colors[rarity];
}

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;
export const TOTAL_POINTS = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
