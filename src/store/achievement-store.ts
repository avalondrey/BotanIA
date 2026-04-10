import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/hooks/use-toast';
import { triggerVisualEffect } from '@/components/game/VisualEffectManager';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS_DEF: Record<string, Achievement> = {
  green_thumb: {
    id: 'green_thumb',
    title: 'Main Verte',
    description: 'Récolter 50 plantes',
    icon: '🌱',
  },
  weather_master: {
    id: 'weather_master',
    title: 'Maître Météo',
    description: 'Jouer sous la pluie 5 fois',
    icon: '🌧️',
  },
  night_owl: {
    id: 'night_owl',
    title: 'Hibou',
    description: 'Jouer après 22h',
    icon: '🦉',
  },
};

interface AchievementState {
  unlocked: string[];
  unlockAchievement: (id: string) => void;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      unlockAchievement: (id) => {
        const { unlocked } = get();
        if (unlocked.includes(id)) return;

        const achievement = ACHIEVEMENTS_DEF[id];
        if (!achievement) return;

        set({ unlocked: [...unlocked, id] });

        triggerVisualEffect("success-pop");

        toast({
          title: `Succès débloqué ! 🏆`,
          description: `${achievement.icon} ${achievement.title} : ${achievement.description}`,
        });
      },
    }),
    { name: 'botania-achievements' }
  )
);
