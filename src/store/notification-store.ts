/**
 * Notification Store — Toasts in-app guidés par l'EventBus
 *
 * Les stores émettent des événements (eventBus.emit),
 * ce store s'abonne et affiche des notifications à l'utilisateur.
 *
 * Types : success, info, warning, error
 * Auto-dismiss configurable, max 5 toasts simultanés.
 */
import { create } from 'zustand';
import { eventBus } from '@/lib/event-bus';

// ═══ Types ═══

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  message: string;
  emoji: string;
  severity: NotificationSeverity;
  createdAt: number;
  dismissed: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  maxVisible: number;

  // Actions
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'dismissed'>) => string;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
}

let _idCounter = 0;

export const useNotificationStore = create<NotificationState>()(
  (set, get) => ({
    notifications: [],
    maxVisible: 5,

    pushNotification: (n) => {
      const id = `notif-${++_idCounter}`;
      const notification: AppNotification = {
        ...n,
        id,
        createdAt: Date.now(),
        dismissed: false,
      };

      set((state) => {
        const updated = [notification, ...state.notifications].slice(0, state.maxVisible);
        return { notifications: updated };
      });

      // Auto-dismiss après 4s (sauf errors = 8s)
      const delay = n.severity === 'error' ? 8000 : n.severity === 'warning' ? 6000 : 4000;
      setTimeout(() => {
        get().dismissNotification(id);
      }, delay);

      return id;
    },

    dismissNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, dismissed: true } : n
        ),
      }));
      // Retirer complètement après l'animation
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, 300);
    },

    dismissAll: () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, dismissed: true })),
      }));
      setTimeout(() => {
        set({ notifications: [] });
      }, 300);
    },
  })
);

// ═══ Wire EventBus → Notifications ═══

let _unsubFns: (() => void)[] = [];

export function subscribeNotificationEvents() {
  _unsubFns.forEach(fn => fn());
  _unsubFns = [];

  const store = useNotificationStore;

  _unsubFns.push(
    eventBus.on('plant:harvested', (payload) => {
      store.getState().pushNotification({
        message: `Récolte : ${payload.plantDefId} (+${payload.coins} 🪙)`,
        emoji: '🌾',
        severity: 'success',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('plant:planted', (payload) => {
      store.getState().pushNotification({
        message: `${payload.plantDefId} planté en ${payload.containerType === 'serre' ? 'serre' : 'jardin'} !`,
        emoji: '🌱',
        severity: 'success',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('plant:watered', () => {
      // Pas de notification pour chaque arrosage (trop bruyant)
      // Sera traité par les quêtes/onboarding à la place
    })
  );

  _unsubFns.push(
    eventBus.on('plant:died', (payload) => {
      store.getState().pushNotification({
        message: `${payload.plantDefId} est mort${payload.cause ? ` (${payload.cause})` : ''} 💀`,
        emoji: '🥀',
        severity: 'error',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('disease:detected', (payload) => {
      store.getState().pushNotification({
        message: `Maladie détectée : ${payload.diseaseName} sur ${payload.plantDefId}`,
        emoji: '🦠',
        severity: payload.severity === 'critical' ? 'error' : 'warning',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('pest:detected', (payload) => {
      store.getState().pushNotification({
        message: `Ravageur détecté : ${payload.pestName} sur ${payload.plantDefId}`,
        emoji: '🐛',
        severity: 'warning',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('frost:warning', (payload) => {
      store.getState().pushNotification({
        message: `Alerte gel : risque de gel dans ${payload.dayOffset} jour(s) (min: ${payload.minTemp}°C)`,
        emoji: '❄️',
        severity: 'warning',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('heatwave:warning', (payload) => {
      store.getState().pushNotification({
        message: `Canicule : température max ${payload.maxTemp}°C dans ${payload.dayOffset} jour(s)`,
        emoji: '🌡️',
        severity: 'warning',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('coins:earned', (payload) => {
      if (payload.amount >= 5) {
        store.getState().pushNotification({
          message: `+${payload.amount} 🪙 (${payload.source})`,
          emoji: '💰',
          severity: 'success',
        });
      }
    })
  );

  _unsubFns.push(
    eventBus.on('coins:spent', (payload) => {
      store.getState().pushNotification({
        message: `-${payload.amount} 🪙 → ${payload.item}`,
        emoji: '🛒',
        severity: 'info',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('quest:completed', (payload) => {
      store.getState().pushNotification({
        message: `Quête terminée ! +${payload.reward} 🪙`,
        emoji: '🎯',
        severity: 'success',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('achievement:unlocked', (payload) => {
      store.getState().pushNotification({
        message: `Succès débloqué : ${payload.achievementId}`,
        emoji: '🏆',
        severity: 'success',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('dailybonus:claimed', (payload) => {
      store.getState().pushNotification({
        message: `Bonus quotidien ! +${payload.coins} 🪙 (streak ${payload.streak}j)`,
        emoji: '🎁',
        severity: 'success',
      });
    })
  );

  _unsubFns.push(
    eventBus.on('eco:gesture_verified', (payload) => {
      store.getState().pushNotification({
        message: `Geste éco vérifié ! +${payload.ecoPoints} pts (${payload.gestureType})`,
        emoji: '♻️',
        severity: 'success',
      });
    })
  );
}

export function unsubscribeNotificationEvents() {
  _unsubFns.forEach(fn => fn());
  _unsubFns = [];
}