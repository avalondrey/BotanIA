/**
 * Save Manager — Gestion des sauvegardes JSON via IndexedDB
 * ========================================================
 *
 * Utilise 'idb' pour IndexedDB avec slots de sauvegarde multiples
 */

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'botania-saves';
const DB_VERSION = 2;
const STORE_NAME = 'save-slots';
const BACKUP_STORE_NAME = 'save-backups';
const MAX_BACKUP_AGE_DAYS = 30;
const BACKUP_CHECK_KEY = 'botania-last-backup-date';

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
  'save-backups': {
    key: string;
    value: SaveSlot;
    indexes: { 'by-date': string };
  };
}

// ═══════════════════════════════════════════════════════════════
//  APP VERSION
// ═══════════════════════════════════════════════════════════════

export const APP_VERSION = '2.4';

// ═══════════════════════════════════════════════════════════════
//  DB CONNECTION
// ═══════════════════════════════════════════════════════════════

let dbPromise: Promise<IDBPDatabase<SaveDB>> | null = null;

function getDB(): Promise<IDBPDatabase<SaveDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SaveDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(BACKUP_STORE_NAME)) {
          const backupStore = db.createObjectStore(BACKUP_STORE_NAME);
          backupStore.createIndex('by-date', 'savedAt');
        }
      },
      blocked() {},
      blocking() {},
      terminated() {},
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
//  DAILY BACKUP SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface BackupInfo {
  id: string;
  slotId: string;
  slotName: string;
  savedAt: string;
  version: string;
  sizeKB: number;
}

/**
 * Creates a backup snapshot of a save slot.
 * Called automatically by checkAndCreateDailyBackup().
 */
export async function createBackup(slotId: string): Promise<BackupInfo | null> {
  const slot = await loadFromSlot(slotId);
  if (!slot) return null;

  const db = await getDB();
  const backupId = `backup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const backup: SaveSlot = { ...slot, slotId: backupId, slotName: `${slot.slotName} (backup)` };

  await db.put(BACKUP_STORE_NAME, backup, backupId);

  const sizeKB = Math.round(JSON.stringify(slot).length / 1024);
  return { id: backupId, slotId: slot.slotId, slotName: slot.slotName, savedAt: slot.savedAt, version: slot.version, sizeKB };
}

/**
 * Checks if a backup was already created today and creates one if not.
 * Safe to call on every app start — only creates one backup per calendar day.
 */
export async function checkAndCreateDailyBackup(): Promise<BackupInfo | null> {
  if (typeof window === 'undefined') return null;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastBackup = localStorage.getItem(BACKUP_CHECK_KEY);

    if (lastBackup === today) return null; // Already backed up today

    // Find the most recent save slot (or auto-save)
    const slots = await getAllSlots();
    if (slots.length === 0) return null;

    // Prefer auto-save, then most recent slot
    const autoSave = slots.find(s => s.slotId === 'auto-save' && s.autoSaveEnabled);
    const target = autoSave ?? slots.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())[0];

    const backup = await createBackup(target.slotId);
    if (backup) {
      localStorage.setItem(BACKUP_CHECK_KEY, today);
    }
    return backup;
  } catch {
    return null;
  }
}

/**
 * Lists all available backups, newest first.
 */
export async function listBackups(): Promise<BackupInfo[]> {
  const db = await getDB();
  const all: SaveSlot[] = await db.getAll(BACKUP_STORE_NAME);
  return all
    .map(b => ({
      id: b.slotId,
      slotId: b.slotId.replace(/^backup-\d+-/, ''),
      slotName: b.slotName,
      savedAt: b.savedAt,
      version: b.version,
      sizeKB: Math.round(JSON.stringify(b).length / 1024),
    }))
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

/**
 * Restores a save from a backup.
 */
export async function restoreFromBackup(backupId: string, targetSlotId: string): Promise<boolean> {
  const db = await getDB();
  const backup = await db.get(BACKUP_STORE_NAME, backupId);
  if (!backup) return false;

  await saveToSlot(targetSlotId, backup.slotName.replace(' (backup)', ''), backup.gameState, false);
  return true;
}

/**
 * Deletes old backups (older than MAX_BACKUP_AGE_DAYS).
 * Called automatically by cleanupOldBackups().
 */
export async function cleanupOldBackups(): Promise<number> {
  const db = await getDB();
  const all: SaveSlot[] = await db.getAll(BACKUP_STORE_NAME);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_BACKUP_AGE_DAYS);

  let deleted = 0;
  for (const backup of all) {
    if (new Date(backup.savedAt) < cutoff) {
      await db.delete(BACKUP_STORE_NAME, backup.slotId);
      deleted++;
    }
  }
  return deleted;
}

/**
 * Returns how many backups exist.
 */
export async function getBackupCount(): Promise<number> {
  const db = await getDB();
  return db.count(BACKUP_STORE_NAME);
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

// ═══════════════════════════════════════════════════════════════
//  FILE EXPORT / IMPORT (download & upload JSON files)
// ═══════════════════════════════════════════════════════════════

/**
 * Export a save slot as a downloadable JSON file.
 * Returns the filename used for the download.
 */
export async function exportSlotToFile(slotId: string): Promise<string | null> {
  const json = await exportSlotToJSON(slotId);
  if (!json) return null;

  const slot = await loadFromSlot(slotId);
  const safeName = (slot?.slotName || slotId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `botania_${safeName}_${dateStr}.json`;

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Import a save slot from a JSON file selected by the user.
 * Returns the result of the import operation.
 */
export function importSlotFromFile(): Promise<{ success: boolean; error?: string; slotName?: string }> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ success: false, error: 'Aucun fichier sélectionné' });
        return;
      }
      try {
        const text = await file.text();
        const result = await importJSONToSlot(text);
        if (result.success) {
          const data = JSON.parse(text) as SaveSlot;
          resolve({ success: true, slotName: data.slotName });
        } else {
          resolve(result);
        }
      } catch (err) {
        resolve({ success: false, error: err instanceof Error ? err.message : 'Erreur de lecture' });
      }
    };
    input.click();
  });
}
