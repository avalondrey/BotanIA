/**
 * Tests pour companion-matrix — associations végétales (INRAE)
 *
 * Vérifie :
 * - COMPANION_MATRIX : couverture des plantes principales
 * - checkCompanionForNewPlant : logique beneficial/harmful
 * - Cohérence des données
 */
import { describe, it, expect } from 'vitest';
import { COMPANION_MATRIX, checkCompanionForNewPlant } from '../lib/companion-matrix';

describe('companion-matrix', () => {
  describe('COMPANION_MATRIX', () => {
    it('contient les plantes principales', () => {
      expect(COMPANION_MATRIX).toHaveProperty('tomato');
      expect(COMPANION_MATRIX).toHaveProperty('carrot');
      expect(COMPANION_MATRIX).toHaveProperty('lettuce');
      expect(COMPANION_MATRIX).toHaveProperty('basil');
      expect(COMPANION_MATRIX).toHaveProperty('pepper');
      expect(COMPANION_MATRIX).toHaveProperty('strawberry');
    });

    it('les associations beneficial existent', () => {
      // Tomate + Basilic = beneficial (association classique INRAE)
      const tomato = COMPANION_MATRIX.tomato;
      expect(tomato).toBeDefined();
      const basilEntry = tomato!.find(c => c.plant === 'basil');
      expect(basilEntry).toBeDefined();
      expect(basilEntry!.type).toBe('beneficial');
    });

    it('les associations harmful existent', () => {
      // Tomate + Piment = harmful
      const tomato = COMPANION_MATRIX.tomato;
      const pepperEntry = tomato!.find(c => c.plant === 'pepper');
      expect(pepperEntry).toBeDefined();
      expect(pepperEntry!.type).toBe('harmful');
    });

    it('chaque entrée a les champs requis', () => {
      for (const [plant, relations] of Object.entries(COMPANION_MATRIX)) {
        for (const rel of relations) {
          expect(rel).toHaveProperty('plant');
          expect(rel).toHaveProperty('type');
          expect(rel).toHaveProperty('reason');
          expect(['beneficial', 'harmful']).toContain(rel.type);
        }
      }
    });
  });

  describe('checkCompanionForNewPlant', () => {
    it('détecte les bénéfiques à proximité', () => {
      const result = checkCompanionForNewPlant('tomato', 50, 50, [
        { plantDefId: 'basil', x: 60, y: 50 },
      ]);
      expect(result.beneficial.length).toBeGreaterThanOrEqual(1);
    });

    it('détecte les nuisibles à proximité', () => {
      const result = checkCompanionForNewPlant('tomato', 50, 50, [
        { plantDefId: 'pepper', x: 60, y: 50 },
      ]);
      expect(result.harmful.length).toBeGreaterThanOrEqual(1);
    });

    it('ignore les plantes trop éloignées', () => {
      const result = checkCompanionForNewPlant('tomato', 0, 0, [
        { plantDefId: 'basil', x: 500, y: 500 },
      ]);
      expect(result.beneficial.length).toBe(0);
      expect(result.harmful.length).toBe(0);
    });

    it('gère une plante inconnue sans crash', () => {
      const result = checkCompanionForNewPlant('unknown_plant', 50, 50, [
        { plantDefId: 'tomato', x: 60, y: 50 },
      ]);
      expect(result).toBeDefined();
    });
  });
});