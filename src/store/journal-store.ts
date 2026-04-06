/**
 * Journal Store — Gestion du journal de jardin
 * Lie notes, photos et rangs par date
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  date: string;               // ISO date "2026-04-06"
  title: string;
  content: string;            // notes markdown
  photoIds: string[];        // refs vers GardenPhoto ids
  linkedRowIds: string[];    // refs rangs jardin
  weather?: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad';
  createdAt: number;
  updatedAt: number;
}

interface JournalStore {
  entries: JournalEntry[];

  // Actions
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEntry: (id: string, update: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;

  // Queries
  getEntriesForDate: (date: string) => JournalEntry[];
  getEntriesForDateRange: (start: string, end: string) => JournalEntry[];
  getEntryById: (id: string) => JournalEntry | undefined;
  getRecentEntries: (limit?: number) => JournalEntry[];

  // Photo linking
  linkPhotoToEntry: (entryId: string, photoId: string) => void;
  unlinkPhotoFromEntry: (entryId: string, photoId: string) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const id = Math.random().toString(36).slice(2, 9);
        const now = Date.now();
        const newEntry: JournalEntry = { ...entry, id, createdAt: now, updatedAt: now };
        set(s => ({ entries: [newEntry, ...s.entries] }));
        return id;
      },

      updateEntry: (id, update) => {
        set(s => ({
          entries: s.entries.map(e =>
            e.id === id ? { ...e, ...update, updatedAt: Date.now() } : e
          )
        }));
      },

      deleteEntry: (id) => {
        set(s => ({ entries: s.entries.filter(e => e.id !== id) }));
      },

      getEntriesForDate: (date) => {
        return get().entries.filter(e => e.date === date);
      },

      getEntriesForDateRange: (start, end) => {
        return get().entries.filter(e => e.date >= start && e.date <= end);
      },

      getEntryById: (id) => {
        return get().entries.find(e => e.id === id);
      },

      getRecentEntries: (limit = 10) => {
        return get().entries.slice(0, limit);
      },

      linkPhotoToEntry: (entryId, photoId) => {
        set(s => ({
          entries: s.entries.map(e =>
            e.id === entryId
              ? { ...e, photoIds: [...new Set([...e.photoIds, photoId])], updatedAt: Date.now() }
              : e
          )
        }));
      },

      unlinkPhotoFromEntry: (entryId, photoId) => {
        set(s => ({
          entries: s.entries.map(e =>
            e.id === entryId
              ? { ...e, photoIds: e.photoIds.filter(id => id !== photoId), updatedAt: Date.now() }
              : e
          )
        }));
      },
    }),
    { name: 'botania-journal' }
  )
);
