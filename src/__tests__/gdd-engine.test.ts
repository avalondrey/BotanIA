/**
 * Tests pour gdd-engine — GDD (Growing Degree Days)
 *
 * Vérifie les calculs agronomiques de base :
 * - calcDailyGDD : accumulation de chaleur
 * - getStageGDDTarget : seuils par stade
 * - PLANT_GDD : couverture des plantes
 */
import { describe, it, expect } from 'vitest';
import { calcDailyGDD, getStageGDDTarget, getGDDConfig, PLANT_GDD } from '../lib/gdd-engine';

describe('gdd-engine', () => {
  describe('calcDailyGDD', () => {
    it('retourne 0 quand la température est en dessous de tBase', () => {
      const config = { tBase: 10, tCap: 30, stageGDD: [50, 200, 400, 800] as const };
      expect(calcDailyGDD(5, 2, 8, config)).toBe(0); // Tmean < tBase
    });

    it('accumule correctement les GDD dans la zone optimale', () => {
      const config = { tBase: 10, tCap: 30, stageGDD: [50, 200, 400, 800] as const };
      // Tmean = 20°C, tBase = 10°C → GDD = 10
      expect(calcDailyGDD(20, 15, 25, config)).toBe(10);
    });

    it('plafonne les GDD à tCap', () => {
      const config = { tBase: 10, tCap: 30, stageGDD: [50, 200, 400, 800] as const };
      // Tmean = 35°C, clamp à tCap=30 → GDD = 30-10 = 20
      expect(calcDailyGDD(35, 25, 40, config)).toBe(20);
    });

    it('retourne exactement tCap-tBase quand la température est au plafond', () => {
      const config = { tBase: 10, tCap: 30, stageGDD: [50, 200, 400, 800] as const };
      expect(calcDailyGDD(30, 25, 35, config)).toBe(20);
    });
  });

  describe('getStageGDDTarget', () => {
    it('retourne les seuils GDD pour la tomate', () => {
      // Tomate : tBase=10, tCap=30, stageGDD=[50,200,400,800]
      expect(getStageGDDTarget('tomato', 0)).toBe(50);
      expect(getStageGDDTarget('tomato', 1)).toBe(200);
      expect(getStageGDDTarget('tomato', 2)).toBe(400);
      expect(getStageGDDTarget('tomato', 3)).toBe(800);
    });

    it('retourne le dernier seuil pour les stades au-delà', () => {
      const lastStage = getStageGDDTarget('tomato', 10);
      expect(lastStage).toBe(800); // Dernier seuil
    });

    it('retourne le seuil par défaut pour une plante inconnue', () => {
      const target = getStageGDDTarget('unknown_plant', 0);
      expect(target).toBe(70); // DEFAULT_GDD stageGDD[0]
    });
  });

  describe('PLANT_GDD', () => {
    it('contient toutes les plantes de PLANT_CARDS', () => {
      // Les plantes principales doivent être présentes
      expect(PLANT_GDD).toHaveProperty('tomato');
      expect(PLANT_GDD).toHaveProperty('carrot');
      expect(PLANT_GDD).toHaveProperty('lettuce');
      expect(PLANT_GDD).toHaveProperty('strawberry');
      expect(PLANT_GDD).toHaveProperty('basil');
      expect(PLANT_GDD).toHaveProperty('pepper');
    });

    it('les GDD sont des nombres positifs', () => {
      for (const [id, config] of Object.entries(PLANT_GDD)) {
        for (const gdd of config.stageGDD) {
          expect(gdd).toBeGreaterThan(0);
        }
        expect(config.tBase).toBeGreaterThan(-5);
        expect(config.tCap).toBeGreaterThan(config.tBase);
      }
    });
  });

  describe('getGDDConfig', () => {
    it('retourne la config pour une plante connue', () => {
      const config = getGDDConfig('tomato');
      expect(config.tBase).toBe(10);
      expect(config.tCap).toBe(30);
    });

    it('retourne la config par défaut pour une plante inconnue', () => {
      const config = getGDDConfig('plante_inconnue');
      expect(config.tBase).toBe(8);
      expect(config.tCap).toBe(28);
    });
  });
});