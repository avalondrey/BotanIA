/**
 * Save Manager — Gestion des sauvegardes JSON via IndexedDB
 * ========================================================
 *
 * Utilise 'idb' pour IndexedDB avec slots de sauvegarde multiples
 */

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'botania-saves';
const DB_VERSION = 1;
const STORE_NAME = 'save-slots';

export interface SlotId {
  slotId: string;
}

export interface SaveSlot {
  slotId: string;
  slotName: string;
  version: string;
  savedAt: string;
  autoSaveEnabled: boolean;
  gameState: any; // GameState partial
}

interface SaveDB {
  'save-slots': {
    key: string;
    value: SaveSlot;
  };
}

// ═══════════════════════════════════════════════════════════════
//  APP VERSION
// ═══════════════════════════════════════════════════════════════

export const APP_VERSION = '0.18.0';

// ═══════════════════════════════════════════════════════════════
//  DB CONNECTION
// ═══════════════════════════════════════════════════════════════

let dbPromise: Promise<IDBPDatabase<SaveDB>> | null = null;

function getDB(): Promise<IDBPDatabase<SaveDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SaveDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

// ═══════════════════════════════════════════════════════════════
//  SAVE/LOAD OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function saveToSlot(
  slotId: string,
  slotName: string,
  gameState: any,
  autoSave: boolean = false
): Promise<void> {
  const db = await getDB();
  const saveData: SaveSlot = {
    slotId,
    slotName,
    version: APP_VERSION,
    savedAt: new Date().toISOString(),
    autoSaveEnabled: autoSave,
    gameState,
  };
  await db.put(STORE_NAME, saveData, slotId);
}

export async function loadFromSlot(slotId: string): Promise<SaveSlot | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, slotId);
}

export async function deleteSlot(slotId: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, slotId);
}

export async function getAllSlots(): Promise<SaveSlot[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function renameSlot(slotId: string, newName: string): Promise<void> {
  const db = await getDB();
  const slot = await db.get(STORE_NAME, slotId);
  if (slot) {
    slot.slotName = newName;
    await db.put(STORE_NAME, slot, slotId);
  }
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT / IMPORT JSON
// ═══════════════════════════════════════════════════════════════

export async function exportSlotToJSON(slotId: string): Promise<string | null> {
  const slot = await loadFromSlot(slotId);
  if (!slot) return null;
  return JSON.stringify(slot, null, 2);
}

export async function importJSONToSlot(jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonString) as SaveSlot;

    // Validation basique
    if (!data.slotId || !data.gameState) {
      return { success: false, error: 'Format invalide' };
    }

    // Sauvegarder
    await saveToSlot(data.slotId, data.slotName, data.gameState, data.autoSaveEnabled);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

// ═══════════════════════════════════════════════════════════════
//  AUTO-SAVE
// ═══════════════════════════════════════════════════════════════

const AUTO_SAVE_SLOT_ID = 'auto-save';

export async function autoSave(gameState: any): Promise<void> {
  await saveToSlot(AUTO_SAVE_SLOT_ID, 'Sauvegarde automatique', gameState, true);
}

export async function loadAutoSave(): Promise<SaveSlot | undefined> {
  return loadFromSlot(AUTO_SAVE_SLOT_ID);
}

export async function hasAutoSave(): Promise<boolean> {
  const slot = await loadAutoSave();
  return !!slot;
}

// ═══════════════════════════════════════════════════════════════
//  UTILITY
// ═══════════════════════════════════════════════════════════════

export function generateSlotId(): string {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSlotDisplayName(slot: SaveSlot): string {
  const date = formatDate(slot.savedAt);
  return `${slot.slotName} (${date})`;
}
