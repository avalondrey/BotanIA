/**
 * EventBus — Système d'événements léger pour BotanIA
 * ================================================
 *
 * Permet aux modules de communiquer sans couplage direct.
 * Les stores émettent des événements, l'UI et les quêtes s'abonnent.
 *
 * Usage :
 *   import { eventBus } from '@/lib/event-bus';
 *   eventBus.emit('plant:harvested', { plantDefId: 'tomato', coins: 8 });
 *   eventBus.on('plant:harvested', (payload) => { ... });
 */

// ═══════════════════════════════════════════════════
//  TYPES — Événements métier de l'application
// ═══════════════════════════════════════════════════

export type BotanIAEvent =
  // Jardin
  | { type: 'plant:harvested'; plantDefId: string; coins: number }
  | { type: 'plant:planted'; plantDefId: string; containerType: string }
  | { type: 'plant:watered'; plantDefId: string; waterLevel: number }
  | { type: 'plant:died'; plantDefId: string; cause: string }
  | { type: 'plant:stageChanged'; plantDefId: string; fromStage: number; toStage: number }
  // Maladies & ravageurs
  | { type: 'disease:detected'; plantDefId: string; diseaseName: string; severity: 'warning' | 'critical' }
  | { type: 'pest:detected'; plantDefId: string; pestName: string }
  // Météo
  | { type: 'frost:warning'; dayOffset: number; minTemp: number }
  | { type: 'heatwave:warning'; dayOffset: number; maxTemp: number }
  | { type: 'storm:warning'; dayOffset: number }
  // Économie
  | { type: 'coins:earned'; amount: number; source: string }
  | { type: 'coins:spent'; amount: number; item: string }
  | { type: 'market:sold'; plantDefId: string; units: number; coinsPerUnit: number }
  // Quêtes & badges
  | { type: 'quest:completed'; questId: string; reward: number }
  | { type: 'achievement:unlocked'; achievementId: string }
  | { type: 'dailybonus:claimed'; streak: number; coins: number }
  // Écologie
  | { type: 'eco:gesture_verified'; gestureType: string; ecoPoints: number }
  // Notifications génériques
  | { type: 'notification:show'; message: string; emoji: string; severity: 'info' | 'warning' | 'success' };

type EventTypeName = BotanIAEvent['type'];

// Extraire le payload spécifique à un type d'événement
type EventPayload<T extends EventTypeName> = Extract<BotanIAEvent, { type: T }>;

type EventHandler<T extends EventTypeName> = (payload: EventPayload<T>) => void;

// ═══════════════════════════════════════════════════
//  BUS — Implementation
// ═══════════════════════════════════════════════════

type AnyHandler = (payload: BotanIAEvent) => void;

class EventBus {
  private listeners: Map<EventTypeName, Set<AnyHandler>> = new Map();

  /**
   * S'abonner à un type d'événement.
   * Retourne une fonction de désabonnement.
   */
  on<T extends EventTypeName>(eventType: T, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as AnyHandler);

    // Retourne unsubscribe
    return () => {
      this.listeners.get(eventType)?.delete(handler as AnyHandler);
    };
  }

  /**
   * Émettre un événement.
   * Les handlers sont appelés de manière synchrone.
   */
  emit<T extends EventTypeName>(event: EventPayload<T>): void {
    const handlers = this.listeners.get(event.type);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        handler(event);
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event.type}":`, err);
      }
    }
  }

  /**
   * Émettre un événement de manière différée (après le rendu React).
   * Utile pour éviter les mises à jour d'état pendant un dispatch Zustand.
   */
  emitAsync<T extends EventTypeName>(event: EventPayload<T>): void {
    setTimeout(() => this.emit(event), 0);
  }

  /**
   * Retirer tous les listeners d'un type d'événement.
   */
  offAll(eventType?: EventTypeName): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Nombre de listeners pour un type d'événement (debug).
   */
  listenerCount(eventType: EventTypeName): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
}

// Singleton
export const eventBus = new EventBus();