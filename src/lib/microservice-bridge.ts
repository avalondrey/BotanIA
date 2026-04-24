/**
 * Microservice Bridge — EventBus → Microservice
 *
 * Écoute les événements critiques de BotanIA et les pousse vers le
 * microservice (webhook + mémoire long-terme).
 *
 * Nécessite côté microservice :
 *   POST /webhook/event   → réception d'événements structurés
 *   POST /memory/add      → stockage mémoire long-terme
 */

import { eventBus, type BotanIAEvent } from './event-bus';
import { microMemoryAdd } from './micro-client';

const _MICRO_URL = process.env.NEXT_PUBLIC_AI_MICROSERVICE_URL || '';
const MICRO_URL = _MICRO_URL.replace(/\/$/, '');
const BOTANIA_VERSION = '2.2.0';

// Types d'événements à synchroniser
const SYNCED_EVENT_TYPES: BotanIAEvent['type'][] = [
  'plant:harvested',
  'plant:planted',
  'plant:watered',
  'plant:died',
  'plant:stageChanged',
  'disease:detected',
  'pest:detected',
  'frost:warning',
  'heatwave:warning',
  'storm:warning',
  'coins:earned',
  'coins:spent',
  'market:sold',
  'quest:completed',
  'achievement:unlocked',
  'dailybonus:claimed',
  'eco:gesture_verified',
];

// Types d'événements à indexer en mémoire long-terme
const MEMORY_EVENT_TYPES: BotanIAEvent['type'][] = [
  'plant:harvested',
  'plant:planted',
  'plant:died',
  'disease:detected',
  'pest:detected',
  'eco:gesture_verified',
  'quest:completed',
];

let started = false;

function eventToMemoryEntry(event: BotanIAEvent): {
  type: string;
  content: string;
  tags: string[];
  plantDefId?: string;
} | null {
  const baseTags = ['event', event.type];
  const ts = new Date().toLocaleDateString('fr-FR');

  switch (event.type) {
    case 'plant:harvested':
      return {
        type: 'harvest',
        content: `[${ts}] Récolte de ${event.plantDefId} — ${event.coins} pièces gagnées.`,
        tags: [...baseTags, 'harvest', event.plantDefId],
        plantDefId: event.plantDefId,
      };
    case 'plant:planted':
      return {
        type: 'planting',
        content: `[${ts}] Plantation de ${event.plantDefId} dans ${event.containerType}.`,
        tags: [...baseTags, 'planting', event.plantDefId],
        plantDefId: event.plantDefId,
      };
    case 'plant:died':
      return {
        type: 'death',
        content: `[${ts}] ${event.plantDefId} est morte : ${event.cause}.`,
        tags: [...baseTags, 'death', event.plantDefId],
        plantDefId: event.plantDefId,
      };
    case 'disease:detected':
      return {
        type: 'disease',
        content: `[${ts}] Maladie détectée sur ${event.plantDefId} : ${event.diseaseName} (gravité ${event.severity}).`,
        tags: [...baseTags, 'disease', event.plantDefId],
        plantDefId: event.plantDefId,
      };
    case 'pest:detected':
      return {
        type: 'pest',
        content: `[${ts}] Ravageur détecté sur ${event.plantDefId} : ${event.pestName}.`,
        tags: [...baseTags, 'pest', event.plantDefId],
        plantDefId: event.plantDefId,
      };
    case 'eco:gesture_verified':
      return {
        type: 'eco',
        content: `[${ts}] Geste écologique validé : ${event.gestureType} (+${event.ecoPoints} points).`,
        tags: [...baseTags, 'eco', event.gestureType],
      };
    case 'quest:completed':
      return {
        type: 'quest',
        content: `[${ts}] Quête accomplie : ${event.questId} (+${event.reward} pièces).`,
        tags: [...baseTags, 'quest', event.questId],
      };
    default:
      return null;
  }
}

async function pushToWebhook(event: BotanIAEvent) {
  if (!MICRO_URL) return;
  try {
    await fetch(`${MICRO_URL}/webhook/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Botania-Version': BOTANIA_VERSION,
      },
      body: JSON.stringify({ event, timestamp: Date.now() }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.warn('[MicroserviceBridge] webhook failed:', err);
  }
}

async function pushToMemory(event: BotanIAEvent) {
  const entry = eventToMemoryEntry(event);
  if (!entry) return;
  try {
    await microMemoryAdd(entry);
  } catch (err) {
    console.warn('[MicroserviceBridge] memory add failed:', err);
  }
}

function handleEvent(event: BotanIAEvent) {
  if (!SYNCED_EVENT_TYPES.includes(event.type)) return;

  // Envoi asynchrone au webhook (non bloquant)
  pushToWebhook(event);

  // Indexation mémoire long-terme (non bloquant)
  if (MEMORY_EVENT_TYPES.includes(event.type)) {
    pushToMemory(event);
  }
}

/**
 * Démarre le bridge EventBus → microservice.
 * Appeler une seule fois au mount de l'application.
 */
export function startMicroserviceBridge() {
  if (started) return;
  started = true;

  // Écoute tous les types synchronisés
  const unsubscribers: (() => void)[] = [];
  for (const type of SYNCED_EVENT_TYPES) {
    unsubscribers.push(eventBus.on(type, handleEvent));
  }

  console.log('[MicroserviceBridge] Started — listening to', SYNCED_EVENT_TYPES.length, 'event types');

  return () => {
    unsubscribers.forEach((fn) => fn());
    started = false;
  };
}
