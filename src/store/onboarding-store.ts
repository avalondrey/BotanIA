/**
 * Onboarding Store — Quêtes narratives guidées
 *
 * Séquence d'onboarding qui guide le nouvel utilisateur à travers
 * les mécaniques clés de l'application, avec des récompenses progressives.
 *
 * Événements EventBus écoutés pour le suivi automatique.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eventBus } from '@/lib/event-bus';

// ═══ Types ═══

export type OnboardingStepId =
  | 'welcome'        // L'utilisateur ouvre l'app
  | 'first-seed'     // Achète sa première graine
  | 'first-plant'    // Plante sa première graine au jardin
  | 'first-water'    // Arrose ses plantes
  | 'first-harvest'  // Récolte sa première plante
  | 'first-sell'     // Vend sa première récolte au marché
  | 'discover-3'     // Découvre 3 plantes différentes
  | 'quest-master';  // Complète 5 quêtes quotidiennes

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  emoji: string;
  reward: number;
  order: number;
}

interface OnboardingState {
  /** Étapes complétées */
  completedSteps: OnboardingStepId[];
  /** Quêtes quotidiennes total complétées (cumul) */
  totalDailyQuestsCompleted: number;
  /** Nombre de plantes découvertes (achetées/plantées) */
  discoveredPlantDefs: string[];
  /** Onboarding terminé ? */
  onboardingDone: boolean;
  /** Nombre de récoltes vendues */
  totalSold: number;
  /** Étapes débloquées au fil du temps */
  unlockedSteps: OnboardingStepId[];

  // Actions
  completeStep: (stepId: OnboardingStepId) => void;
  addDiscoveredPlant: (plantDefId: string) => void;
  incrementDailyQuests: () => void;
  incrementSold: () => void;
  isStepCompleted: (stepId: OnboardingStepId) => boolean;
  isStepUnlocked: (stepId: OnboardingStepId) => boolean;
  getNextStep: () => OnboardingStep | null;
  getProgress: () => { completed: number; total: number; pct: number };
  resetOnboarding: () => void;
}

// ═══ Définition des étapes ═══

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Premier pas', description: 'Bienvenue dans BotanIA ! Explorez la serre.', emoji: '🏠', reward: 5, order: 0 },
  { id: 'first-seed', title: 'Graine de espoir', description: 'Achetez votre première graine à la boutique.', emoji: '🛒', reward: 10, order: 1 },
  { id: 'first-plant', title: 'Mise en terre', description: 'Plantez votre première graine dans le jardin.', emoji: '🌱', reward: 10, order: 2 },
  { id: 'first-water', title: 'Goutte d\'espoir', description: 'Arrosez vos plantes pour la première fois.', emoji: '💧', reward: 5, order: 3 },
  { id: 'first-harvest', title: 'Première récolte', description: 'Récoltez une plante arrivée à maturité.', emoji: '🌾', reward: 15, order: 4 },
  { id: 'first-sell', title: 'Premier marché', description: 'Vendez votre première récolte au marché.', emoji: '🪙', reward: 15, order: 5 },
  { id: 'discover-3', title: 'Explorateur botanique', description: 'Découvrez 3 variétés de plantes différentes.', emoji: '🔍', reward: 20, order: 6 },
  { id: 'quest-master', title: 'Maître des quêtes', description: 'Complétez 5 quêtes quotidiennes.', emoji: '🎯', reward: 30, order: 7 },
];

const STEP_ORDER: OnboardingStepId[] = ONBOARDING_STEPS.map(s => s.id);

// ═══ Store ═══

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completedSteps: [],
      totalDailyQuestsCompleted: 0,
      discoveredPlantDefs: [],
      onboardingDone: false,
      totalSold: 0,
      unlockedSteps: ['welcome'],

      completeStep: (stepId: OnboardingStepId) => {
        const state = get();
        if (state.completedSteps.includes(stepId)) return;

        const step = ONBOARDING_STEPS.find(s => s.id === stepId);
        if (!step) return;

        // Ajouter la récompense en pièces
        const { useShopStore } = require('@/store/shop-store');
        useShopStore.getState().addCoins(step.reward);

        const newCompleted = [...state.completedSteps, stepId];
        const stepIndex = STEP_ORDER.indexOf(stepId);

        // Débloquer l'étape suivante
        const nextStepId = stepIndex < STEP_ORDER.length - 1 ? STEP_ORDER[stepIndex + 1] : null;
        const newUnlocked = nextStepId && !state.unlockedSteps.includes(nextStepId)
          ? [...state.unlockedSteps, nextStepId]
          : state.unlockedSteps;

        const onboardingDone = newCompleted.length >= ONBOARDING_STEPS.length;

        set({
          completedSteps: newCompleted,
          unlockedSteps: newUnlocked,
          onboardingDone,
        });

        eventBus.emit({ type: 'achievement:unlocked', achievementId: `onboarding:${stepId}` });
      },

      addDiscoveredPlant: (plantDefId: string) => {
        const state = get();
        if (state.discoveredPlantDefs.includes(plantDefId)) return;

        const newDiscovered = [...state.discoveredPlantDefs, plantDefId];
        set({ discoveredPlantDefs: newDiscovered });

        // Vérifier l'étape "discover-3"
        if (newDiscovered.length >= 3 && !state.completedSteps.includes('discover-3')) {
          get().completeStep('discover-3');
        }
      },

      incrementDailyQuests: () => {
        const state = get();
        const newTotal = state.totalDailyQuestsCompleted + 1;
        set({ totalDailyQuestsCompleted: newTotal });

        // Vérifier l'étape "quest-master"
        if (newTotal >= 5 && !state.completedSteps.includes('quest-master')) {
          get().completeStep('quest-master');
        }
      },

      incrementSold: () => {
        const state = get();
        const newTotal = state.totalSold + 1;
        set({ totalSold: newTotal });

        // Vérifier l'étape "first-sell"
        if (!state.completedSteps.includes('first-sell')) {
          get().completeStep('first-sell');
        }
      },

      isStepCompleted: (stepId: OnboardingStepId) => {
        return get().completedSteps.includes(stepId);
      },

      isStepUnlocked: (stepId: OnboardingStepId) => {
        return get().unlockedSteps.includes(stepId);
      },

      getNextStep: (): OnboardingStep | null => {
        const state = get();
        if (state.onboardingDone) return null;
        const nextStep = ONBOARDING_STEPS.find(
          s => !state.completedSteps.includes(s.id) && state.unlockedSteps.includes(s.id)
        );
        return nextStep || null;
      },

      getProgress: () => {
        const completed = get().completedSteps.length;
        const total = ONBOARDING_STEPS.length;
        return { completed, total, pct: Math.round((completed / total) * 100) };
      },

      resetOnboarding: () => {
        set({
          completedSteps: [],
          totalDailyQuestsCompleted: 0,
          discoveredPlantDefs: [],
          onboardingDone: false,
          totalSold: 0,
          unlockedSteps: ['welcome'],
        });
      },
    }),
    {
      name: 'botania-onboarding',
      partialize: (state) => ({
        completedSteps: state.completedSteps,
        totalDailyQuestsCompleted: state.totalDailyQuestsCompleted,
        discoveredPlantDefs: state.discoveredPlantDefs,
        onboardingDone: state.onboardingDone,
        totalSold: state.totalSold,
        unlockedSteps: state.unlockedSteps,
      }),
    }
  )
);

// ═══ Wire EventBus → Onboarding ═══
// Écoute les événements métier pour suivre les étapes automatiquement

let _unsubscribeFns: (() => void)[] = [];

export function subscribeOnboardingEvents() {
  // Nettoyer les anciens listeners
  _unsubscribeFns.forEach(fn => fn());
  _unsubscribeFns = [];

  const store = useOnboardingStore;

  // Plante achetée → first-seed + discover
  _unsubscribeFns.push(
    eventBus.on('coins:spent', (payload) => {
      if (payload.item.startsWith('seed:') || payload.item.startsWith('plantule:')) {
        const plantDefId = payload.item.split(':')[1];
        if (plantDefId) {
          store.getState().addDiscoveredPlant(plantDefId);
        }
        if (!store.getState().completedSteps.includes('first-seed')) {
          store.getState().completeStep('first-seed');
        }
      }
    })
  );

  // Plante plantée → first-plant
  _unsubscribeFns.push(
    eventBus.on('plant:planted', () => {
      if (!store.getState().completedSteps.includes('first-plant')) {
        store.getState().completeStep('first-plant');
      }
    })
  );

  // Plante arrosée → first-water
  _unsubscribeFns.push(
    eventBus.on('plant:watered', () => {
      if (!store.getState().completedSteps.includes('first-water')) {
        store.getState().completeStep('first-water');
      }
    })
  );

  // Plante récoltée → first-harvest
  _unsubscribeFns.push(
    eventBus.on('plant:harvested', () => {
      if (!store.getState().completedSteps.includes('first-harvest')) {
        store.getState().completeStep('first-harvest');
      }
    })
  );

  // Quête complétée → quest-master
  _unsubscribeFns.push(
    eventBus.on('quest:completed', () => {
      store.getState().incrementDailyQuests();
    })
  );

  // Vente au marché → first-sell
  _unsubscribeFns.push(
    eventBus.on('market:sold', () => {
      store.getState().incrementSold();
    })
  );
}

/** Appelé au démontage pour nettoyer les listeners */
export function unsubscribeOnboardingEvents() {
  _unsubscribeFns.forEach(fn => fn());
  _unsubscribeFns = [];
}