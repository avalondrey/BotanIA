/**
 * Tests pour garden-journal.ts
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  addJournalEntry,
  removeJournalEntry,
  clearJournal,
  getJournalEntries,
  getJournalCount,
  getJournalStats,
  generateJournalMarkdown,
  journalPlanting,
  journalHarvest,
  journalSale,
  type JournalEntry,
} from '../garden-journal';

const JOURNAL_KEY = 'botania-garden-journal';

// Mock localStorage for Node.js environment
const storage: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
    key: (i: number) => Object.keys(storage)[i] ?? null,
    get length() { return Object.keys(storage).length; },
  },
  writable: true,
});

function lsGet() {
  return localStorage.getItem(JOURNAL_KEY);
}

beforeEach(() => {
  Object.keys(storage).forEach(k => delete storage[k]);
});

describe('garden-journal', () => {
  describe('addJournalEntry', () => {
    it('ajoute une entrée et la retourne', () => {
      const entry = addJournalEntry('planting', 'Tomate plantée', { plantDefId: 'tomato', quantity: 3 });
      expect(entry.id).toBeDefined();
      expect(entry.type).toBe('planting');
      expect(entry.summary).toBe('Tomate plantée');
      expect(entry.plantDefId).toBe('tomato');
      expect(entry.quantity).toBe(3);
      expect(entry.timestamp).toBeDefined();
    });

    it('ne duplique pas les IDs', () => {
      const e1 = addJournalEntry('planting', 'Test 1');
      const e2 = addJournalEntry('planting', 'Test 2');
      expect(e1.id).not.toBe(e2.id);
    });

    it('conserve les entrées dans localStorage', () => {
      addJournalEntry('harvest', 'Carotte récoltée', { plantDefId: 'carrot', quantity: 5 });
      const stored = lsGet();
      expect(stored).not.toBeNull();
    });
  });

  describe('removeJournalEntry', () => {
    it('supprime une entrée par ID', () => {
      const entry = addJournalEntry('planting', 'Test');
      expect(getJournalEntries()).toHaveLength(1);
      removeJournalEntry(entry.id);
      expect(getJournalEntries()).toHaveLength(0);
    });
  });

  describe('clearJournal', () => {
    it('efface toutes les entrées', () => {
      addJournalEntry('planting', 'Test 1');
      addJournalEntry('harvest', 'Test 2');
      clearJournal();
      expect(getJournalCount()).toBe(0);
    });
  });

  describe('getJournalEntries', () => {
    it('retourne les entrées triées (plus récentes)', () => {
      const e1 = addJournalEntry('planting', 'Premier');
      const e2 = addJournalEntry('harvest', 'Deuxième');
      const e3 = addJournalEntry('sale', 'Troisième');
      const entries = getJournalEntries();
      expect(entries[0].id).toBe(e3.id);
      expect(entries[1].id).toBe(e2.id);
      expect(entries[2].id).toBe(e1.id);
    });

    it('filtre par type', () => {
      addJournalEntry('planting', 'Test 1');
      addJournalEntry('harvest', 'Test 2');
      addJournalEntry('harvest', 'Test 3');
      const harvests = getJournalEntries({ type: 'harvest' });
      expect(harvests).toHaveLength(2);
    });

    it('filtre par plantDefId', () => {
      addJournalEntry('planting', 'Tomate', { plantDefId: 'tomato' });
      addJournalEntry('planting', 'Carotte', { plantDefId: 'carrot' });
      const tomatoes = getJournalEntries({ plantDefId: 'tomato' });
      expect(tomatoes).toHaveLength(1);
      expect(tomatoes[0].plantDefId).toBe('tomato');
    });

    it('respecte limit et offset', () => {
      for (let i = 0; i < 10; i++) {
        addJournalEntry('planting', `Test ${i}`);
      }
      const page = getJournalEntries({ limit: 3, offset: 2 });
      expect(page).toHaveLength(3);
    });
  });

  describe('getJournalStats', () => {
    it('compte correctement par type', () => {
      addJournalEntry('planting', 'T1', { plantDefId: 'tomato' });
      addJournalEntry('harvest', 'H1', { plantDefId: 'tomato', quantity: 5 });
      addJournalEntry('harvest', 'H2', { plantDefId: 'carrot', quantity: 3 });
      addJournalEntry('sale', 'S1', { plantDefId: 'tomato', coins: 100 });

      const stats = getJournalStats();
      expect(stats.totalEntries).toBe(4);
      expect(stats.byType.planting).toBe(1);
      expect(stats.totalHarvests).toBe(2);
      expect(stats.totalSales).toBe(1);
      expect(stats.totalCoinsEarned).toBe(100);
      expect(stats.plantsGrown.has('tomato')).toBe(true);
      expect(stats.plantsGrown.has('carrot')).toBe(true);
    });

    it('calcul coins négatifs comme dépenses', () => {
      addJournalEntry('sale', 'Vente', { coins: 50 });
      const stats = getJournalStats();
      expect(stats.totalCoinsEarned).toBe(50);
      expect(stats.totalCoinsSpent).toBe(0);
    });
  });

  describe('generateJournalMarkdown', () => {
    it('génère un markdown valide', () => {
      addJournalEntry('planting', 'Tomate plantée', { plantDefId: 'tomato', quantity: 3 });
      addJournalEntry('harvest', 'Carotte récoltée', { plantDefId: 'carrot', quantity: 5, weather: { temp: 18, description: 'Ciel dégagé', emoji: '☀️' } });
      addJournalEntry('sale', 'Vente', { plantDefId: 'tomato', coins: 100 });

      const md = generateJournalMarkdown({ includeStats: true });
      expect(md).toContain('# Journal de Bord BotanIA');
      expect(md).toContain('Saison');
      expect(md).toContain('Bilan de Saison');
      expect(md).toContain('Tomate plantée');
      expect(md).toContain('Carotte récoltée');
      expect(md).toContain('+100');
      expect(md).toContain('Météo');
    });

    it('respecte la limite dentrées', () => {
      for (let i = 0; i < 10; i++) {
        addJournalEntry('planting', `Test ${i}`);
      }
      const md = generateJournalMarkdown({ limit: 3 });
      expect(md).toContain('Test 9'); // plus récente
    });

    it('titre personnalisé', () => {
      const md = generateJournalMarkdown({ title: 'Mon Super Jardin' });
      expect(md).toContain('Mon Super Jardin');
    });
  });

  describe('helpers', () => {
    it('journalPlanting crée une entrée planting', () => {
      const entry = journalPlanting('tomato', 'Tomate', 5);
      expect(entry.type).toBe('planting');
      expect(entry.plantDefId).toBe('tomato');
      expect(entry.quantity).toBe(5);
    });

    it('journalHarvest crée une entrée harvest', () => {
      const entry = journalHarvest('carrot', 'Carotte', 10);
      expect(entry.type).toBe('harvest');
      expect(entry.quantity).toBe(10);
    });

    it('journalSale crée une entrée sale avec coins', () => {
      const entry = journalSale('tomato', 'Tomate', 3, 150);
      expect(entry.type).toBe('sale');
      expect(entry.coins).toBe(150);
    });
  });
});
