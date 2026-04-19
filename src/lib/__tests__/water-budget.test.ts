/**
 * Tests pour water-budget.ts — Calculs hydriques FAO-56
 *
 * Couvre :
 * - calcRainHarvest : récupération pluie
 * - calcCropWeeklyNeed : besoin hebdomadaire
 * - calcWeeklyBudget : bilan complet
 * - calcWateringAlerts : alertes d'arrosage
 * - consumeFromTanks : consommation cuves
 */
import { describe, it, expect } from 'vitest';
import {
  calcRainHarvest,
  calcCropWeeklyNeed,
  calcWeeklyBudget,
  calcWateringAlerts,
  consumeFromTanks,
  updateTanksAfterRain,
  defaultWaterState,
  addManualWater,
  markWatered,
  type RainwaterTank,
} from '../water-budget';

describe('water-budget', () => {
  describe('calcRainHarvest', () => {
    const tank: RainwaterTank = {
      id: 't1', name: 'Cuve', capacityL: 1000, currentLevelL: 0,
      roofAreaM2: 30, efficiency: 0.8, color: '#2196f3', isActive: true,
    };

    it('retourne 0 si pluie < 2mm (chasse du toit)', () => {
      expect(calcRainHarvest(1, tank)).toBe(0);
    });

    it('retourne 0 si tank inactif', () => {
      expect(calcRainHarvest(10, { ...tank, isActive: false })).toBe(0);
    });

    it('calcule correctement : 10mm × 30m² × 0.8 = 240L', () => {
      expect(calcRainHarvest(10, tank)).toBe(240);
    });

    it('ne dépasse pas la capacité restante', () => {
      const fullTank = { ...tank, currentLevelL: 990 };
      expect(calcRainHarvest(10, fullTank)).toBe(10); // 240 demandé, 10 disponible
    });

    it('pluie négative retourne 0', () => {
      expect(calcRainHarvest(-5, tank)).toBe(0);
    });
  });

  describe('calcCropWeeklyNeed', () => {
    it('calcule : ET0 × Kc × surface × 7 jours', () => {
      // 5mm/j × 0.9 × 2m² × 7j = 63L
      expect(calcCropWeeklyNeed(5, 0.9, 2)).toBe(63);
    });

    it('surface 0 retourne 0', () => {
      expect(calcCropWeeklyNeed(5, 0.9, 0)).toBe(0);
    });

    it('KC 0 retourne 0', () => {
      expect(calcCropWeeklyNeed(5, 0, 10)).toBe(0);
    });

    it('supporte jours personnalisés', () => {
      expect(calcCropWeeklyNeed(5, 0.9, 2, 14)).toBe(126);
    });
  });

  describe('calcWeeklyBudget', () => {
    const tanks: RainwaterTank[] = [{
      id: 't1', name: 'Cuve', capacityL: 1000, currentLevelL: 500,
      roofAreaM2: 30, efficiency: 0.8, color: '#2196f3', isActive: true,
    }];

    const crops = [{ name: 'Tomate', surfaceM2: 4, kc: 0.9 }];

    it('calcul complet avec pluie prévue', () => {
      const result = calcWeeklyBudget({
        tanks, crops, forecastPrecipMm: [5, 0, 0, 3, 0, 0, 2],
        et0Daily: 5, mode: 'cuve_only',
      });
      expect(result.totalNeedL).toBe(126); // 5×0.9×4×7
      expect(result.autonomyDays).toBeGreaterThan(0);
      expect(result.isCritical).toBe(false);
    });

    it('mode réseau = illimité (grde autonomie)', () => {
      const result = calcWeeklyBudget({
        tanks, crops, forecastPrecipMm: [0, 0, 0, 0, 0, 0, 0],
        et0Daily: 5, mode: 'reseau',
      });
      expect(result.deficitL).toBe(0);
      expect(result.autonomyDays).toBeGreaterThan(100); //实质上illimité
    });

    it('détecte критический déficit', () => {
      const result = calcWeeklyBudget({
        tanks: [{ ...tanks[0], currentLevelL: 10 }],
        crops: [{ name: 'Melon', surfaceM2: 10, kc: 1.05 }],
        forecastPrecipMm: [0, 0, 0, 0, 0, 0, 0],
        et0Daily: 5, mode: 'cuve_only',
      });
      expect(result.isCritical).toBe(true);
      expect(result.autonomyDays).toBeLessThan(3);
    });
  });

  describe('consumeFromTanks', () => {
    const tanks: RainwaterTank[] = [
      { id: 't1', name: 'T1', capacityL: 500, currentLevelL: 500, roofAreaM2: 0, efficiency: 1, color: '#000', isActive: true },
      { id: 't2', name: 'T2', capacityL: 500, currentLevelL: 200, roofAreaM2: 0, efficiency: 1, color: '#000', isActive: true },
    ];

    it('consomme depuis la cuve la plus pleine', () => {
      const { tanks: newTanks, consumed, shortfall } = consumeFromTanks(tanks, 100, 'cuve_only');
      expect(consumed).toBe(100);
      expect(shortfall).toBe(0);
      expect(newTanks[0].currentLevelL).toBe(400); // T1 débité
    });

    it('fallback sur deuxième cuve si première insuffisante', () => {
      const { tanks: newTanks, consumed, shortfall } = consumeFromTanks(tanks, 600, 'cuve_only');
      expect(consumed).toBe(600);
      expect(newTanks[0].currentLevelL).toBe(0);
      expect(newTanks[1].currentLevelL).toBe(100);
    });

    it('signale shortfall si toutes les cuves vides', () => {
      const empty: RainwaterTank[] = [
        { id: 't1', name: 'T1', capacityL: 500, currentLevelL: 0, roofAreaM2: 0, efficiency: 1, color: '#000', isActive: true },
      ];
      const { shortfall } = consumeFromTanks(empty, 100, 'cuve_only');
      expect(shortfall).toBe(100);
    });

    it('mode réseau = pas de shortfall', () => {
      const { consumed, shortfall } = consumeFromTanks(tanks, 9999, 'reseau');
      expect(consumed).toBe(9999);
      expect(shortfall).toBe(0);
    });

    it('ignore cuves inactives', () => {
      const tanks2: RainwaterTank[] = [
        { id: 't1', name: 'T1', capacityL: 500, currentLevelL: 100, roofAreaM2: 0, efficiency: 1, color: '#000', isActive: true },
        { id: 't2', name: 'T2', capacityL: 500, currentLevelL: 200, roofAreaM2: 0, efficiency: 1, color: '#000', isActive: false },
      ];
      const { tanks: newTanks } = consumeFromTanks(tanks2, 150, 'cuve_only');
      expect(newTanks[0].currentLevelL).toBe(0);
      expect(newTanks[1].currentLevelL).toBe(200); // inchangé
    });
  });

  describe('updateTanksAfterRain', () => {
    it('ajoute la pluie à la cuve', () => {
      const tank: RainwaterTank = {
        id: 't1', name: 'T', capacityL: 1000, currentLevelL: 200,
        roofAreaM2: 20, efficiency: 0.8, color: '#000', isActive: true,
      };
      const updated = updateTanksAfterRain([tank], 10);
      expect(updated[0].currentLevelL).toBe(200 + 160); // 10×20×0.8
    });

    it('ne dépasse pas capacité', () => {
      const tank: RainwaterTank = {
        id: 't1', name: 'T', capacityL: 1000, currentLevelL: 900,
        roofAreaM2: 20, efficiency: 0.8, color: '#000', isActive: true,
      };
      const updated = updateTanksAfterRain([tank], 20);
      expect(updated[0].currentLevelL).toBe(1000);
    });

    it('puit : recharge 5%/jour', () => {
      const puit: RainwaterTank = {
        id: 'p1', name: 'Puit', capacityL: 5000, currentLevelL: 1000,
        roofAreaM2: 0, efficiency: 1, color: '#000', isActive: true, isPuit: true,
      };
      const updated = updateTanksAfterRain([puit], 0);
      expect(updated[0].currentLevelL).toBe(1000 + 250); // 5% de 5000
    });
  });

  describe('calcWateringAlerts', () => {
    const plantDefs = {
      tomato: { name: 'Tomate', emoji: '🍅', cropCoefficient: 0.9 },
      lettuce: { name: 'Salade', emoji: '🥬', cropCoefficient: 0.85 },
    };

    it('aucune alerte si pluie ≥ 8mm', () => {
      const garden = [{ id: 'g1', plantDefId: 'tomato', plant: { waterLevel: 10 } }];
      const alerts = calcWateringAlerts(garden, plantDefs, [], 10);
      expect(alerts).toHaveLength(0);
    });

    it('alerte critique si niveau < 15%', () => {
      const garden = [{ id: 'g1', plantDefId: 'tomato', plant: { waterLevel: 10 } }];
      const alerts = calcWateringAlerts(garden, plantDefs, [], 0);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].urgency).toBe('critique');
    });

    it('alerte urgent si niveau 15-30%', () => {
      const garden = [{ id: 'g1', plantDefId: 'tomato', plant: { waterLevel: 20 } }];
      const alerts = calcWateringAlerts(garden, plantDefs, [], 0);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].urgency).toBe('urgent');
    });

    it('aucune alerte si niveau ≥ 30%', () => {
      const garden = [{ id: 'g1', plantDefId: 'tomato', plant: { waterLevel: 40 } }];
      const alerts = calcWateringAlerts(garden, plantDefs, [], 0);
      expect(alerts).toHaveLength(0);
    });

    it('ignore les plantes déjà arrosées', () => {
      const garden = [{ id: 'g1', plantDefId: 'tomato', plant: { waterLevel: 10 } }];
      const alerts = calcWateringAlerts(garden, plantDefs, ['g1'], 0);
      expect(alerts).toHaveLength(0);
    });

    it('eau de pluie partielle (3-8mm) remonte les seuils', () => {
      const garden = [{ id: 'g1', plantDefId: 'tomato', plant: { waterLevel: 12 } }];
      // Seuils remontés : critique<8%, urgent<18%
      const alerts = calcWateringAlerts(garden, plantDefs, [], 5);
      expect(alerts).toHaveLength(0); // 12% > 8%
    });

    it('plant inconnue ignorée', () => {
      const garden = [
        { id: 'g1', plantDefId: 'tomato', plant: { waterLevel: 10 } },
        { id: 'g2', plantDefId: 'unknown', plant: { waterLevel: 10 } },
      ];
      const alerts = calcWateringAlerts(garden, plantDefs, [], 0);
      expect(alerts).toHaveLength(1);
    });
  });

  describe('addManualWater', () => {
    it('ajoute des litres à la cuve', () => {
      const state = defaultWaterState();
      const updated = addManualWater(state, 'tank-1', 200, 'Bidons livré');
      expect(updated.tanks[0].currentLevelL).toBe(700); // 500+200
    });

    it('ne dépasse pas la capacité', () => {
      const state = defaultWaterState();
      const updated = addManualWater(state, 'tank-1', 1000, 'Trop');
      expect(updated.tanks[0].currentLevelL).toBe(1000);
    });

    it('conserve historique', () => {
      const state = defaultWaterState();
      const updated = addManualWater(state, 'tank-1', 100, 'Test');
      expect(updated.manualAddHistory).toHaveLength(1);
      expect(updated.manualAddHistory[0].liters).toBe(100);
    });
  });

  describe('markWatered', () => {
    it('ajoute la plante à la liste', () => {
      const state = defaultWaterState();
      const updated = markWatered(state, 'plant-1');
      expect(updated.wateredTodayIds).toContain('plant-1');
    });

    it('ne duplique pas si déjà marquée', () => {
      const state = { ...defaultWaterState(), wateredTodayIds: ['plant-1'] };
      const updated = markWatered(state, 'plant-1');
      expect(updated.wateredTodayIds.filter(id => id === 'plant-1')).toHaveLength(1);
    });
  });
});
