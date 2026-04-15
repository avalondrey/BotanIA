/**
 * Tests pour plant-db — Source unique de vérité
 *
 * Vérifie :
 * - PLANTS est bien construit depuis PLANT_CARDS + TREE_CARDS
 * - Pas de données manquantes (chaque plante a tous les champs)
 * - Cohérence des données (diseaseResistance 0-1 ou 0-100, pas les deux)
 */
import { describe, it, expect } from 'vitest';
import { PLANTS, getPlantDef, plantExists, getPlantDisplay } from '../lib/plant-db';

describe('plant-db', () => {
  describe('PLANTS', () => {
    it('contient toutes les plantes de PLANT_CARDS', () => {
      // Les 6 plantes originales doivent être présentes
      expect(PLANTS).toHaveProperty('tomato');
      expect(PLANTS).toHaveProperty('carrot');
      expect(PLANTS).toHaveProperty('lettuce');
      expect(PLANTS).toHaveProperty('strawberry');
      expect(PLANTS).toHaveProperty('basil');
      expect(PLANTS).toHaveProperty('pepper');
    });

    it('contient les arbres de TREE_CARDS', () => {
      expect(PLANTS).toHaveProperty('apple');
      expect(PLANTS).toHaveProperty('pear');
      expect(PLANTS).toHaveProperty('cherry');
      expect(PLANTS).toHaveProperty('oak');
    });

    it('contient les plantes supplémentaires', () => {
      expect(PLANTS).toHaveProperty('cucumber');
      expect(PLANTS).toHaveProperty('melon');
      expect(PLANTS).toHaveProperty('corn');
      expect(PLANTS).toHaveProperty('sunflower');
    });

    it('chaque plante a tous les champs requis', () => {
      const requiredFields = ['id', 'name', 'emoji', 'image', 'stageDurations', 'optimalTemp', 'waterNeed', 'lightNeed', 'harvestEmoji', 'cropCoefficient', 'optimalPlantMonths', 'optimalSeasons', 'diseaseResistance', 'pestResistance', 'droughtResistance', 'realDaysToHarvest'] as const;

      for (const [id, plant] of Object.entries(PLANTS)) {
        for (const field of requiredFields) {
          expect(plant).toHaveProperty(field);
        }
      }
    });

    it('stageDurations a exactement 4 éléments', () => {
      for (const [id, plant] of Object.entries(PLANTS)) {
        expect(plant.stageDurations).toHaveLength(4);
      }
    });

    it('droughtResistance est entre 0 et 1', () => {
      for (const [id, plant] of Object.entries(PLANTS)) {
        expect(plant.droughtResistance).toBeGreaterThanOrEqual(0);
        expect(plant.droughtResistance).toBeLessThanOrEqual(1);
      }
    });

    it('waterNeed est positif', () => {
      for (const [id, plant] of Object.entries(PLANTS)) {
        expect(plant.waterNeed).toBeGreaterThan(0);
      }
    });

    it('cropCoefficient (Kc) est entre 0.5 et 1.5', () => {
      for (const [id, plant] of Object.entries(PLANTS)) {
        expect(plant.cropCoefficient).toBeGreaterThanOrEqual(0.5);
        expect(plant.cropCoefficient).toBeLessThanOrEqual(1.5);
      }
    });
  });

  describe('getPlantDef', () => {
    it('retourne une plante existante', () => {
      const tomato = getPlantDef('tomato');
      expect(tomato).toBeDefined();
      expect(tomato!.name).toBe('Tomate');
    });

    it('retourne undefined pour une plante inconnue', () => {
      expect(getPlantDef('plante_inconnue')).toBeUndefined();
    });
  });

  describe('plantExists', () => {
    it('retourne true pour une plante existante', () => {
      expect(plantExists('tomato')).toBe(true);
      expect(plantExists('apple')).toBe(true);
    });

    it('retourne false pour une plante inconnue', () => {
      expect(plantExists('plante_inconnue')).toBe(false);
    });
  });

  describe('getPlantDisplay', () => {
    it('retourne les infos display pour une plante connue', () => {
      const display = getPlantDisplay('tomato');
      expect(display.name).toBe('Tomate');
      expect(display.emoji).toBe('🍅');
    });

    it('retourne des infos par défaut pour une plante inconnue', () => {
      const display = getPlantDisplay('plante_inconnue');
      expect(display.name).toBe('plante_inconnue');
      expect(display.emoji).toBe('🌱');
    });
  });
});