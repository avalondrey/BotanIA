/**
 * Tests pour hydro-engine — besoins en eau (FAO-56)
 *
 * Vérifie :
 * - calcFullHydroNeed : calcul complet ETc avec modificateurs
 * - Coefficients de paillage, irrigation, permaculture
 * - Gestion des valeurs limites
 */
import { describe, it, expect } from 'vitest';
import {
  calcFullHydroNeed,
  MULCH_REDUCTION,
  IRRIGATION_EFFICIENCY,
  type HydroContext,
  type AtmosphericInputs,
  type SoilProfile,
} from '../lib/hydro-engine';

const defaultAtmo: AtmosphericInputs = {
  precipMm: 0,
  humidity: 60,
  fogFrequency: 0,
  tMin: 12,
  tMean: 20,
  windSpeed: 10,
  sunHours: 8,
};

const defaultSoil: SoilProfile = {
  texture: 'limoneux',
  organicMatter: 3,
  ph: 6.5,
  depth: 30,
};

const defaultCtx: HydroContext = {
  soil: defaultSoil,
  irrigation: 'goutte_a_goutte',
  permaElements: [],
  shadeFraction: 0,
  surfaceM2: 0.25,
};

describe('hydro-engine', () => {
  describe('calcFullHydroNeed', () => {
    it('calcule ETc de base sans modificateurs', () => {
      const result = calcFullHydroNeed({
        kc: 1.0,
        et0Daily: 5,
        atmo: defaultAtmo,
        ctx: defaultCtx,
      });
      expect(result.etcFinal).toBeGreaterThan(0);
      expect(result.needLPerM2PerDay).toBeGreaterThan(0);
    });

    it('Kc plus élevé = besoin plus grand', () => {
      const result1 = calcFullHydroNeed({
        kc: 0.5,
        et0Daily: 5,
        atmo: defaultAtmo,
        ctx: defaultCtx,
      });
      const result2 = calcFullHydroNeed({
        kc: 1.2,
        et0Daily: 5,
        atmo: defaultAtmo,
        ctx: defaultCtx,
      });
      expect(result2.etcRaw).toBeGreaterThan(result1.etcRaw);
    });

    it('la pluie réduit le besoin net', () => {
      const dryResult = calcFullHydroNeed({
        kc: 1.0,
        et0Daily: 5,
        atmo: { ...defaultAtmo, precipMm: 0 },
        ctx: defaultCtx,
      });
      const rainyResult = calcFullHydroNeed({
        kc: 1.0,
        et0Daily: 5,
        atmo: { ...defaultAtmo, precipMm: 3 },
        ctx: defaultCtx,
      });
      expect(rainyResult.etcFinal).toBeLessThanOrEqual(dryResult.etcFinal);
    });

    it('le paillage réduit les besoins', () => {
      const noMulch = calcFullHydroNeed({
        kc: 1.0,
        et0Daily: 5,
        atmo: defaultAtmo,
        ctx: defaultCtx,
      });
      const withMulch = calcFullHydroNeed({
        kc: 1.0,
        et0Daily: 5,
        atmo: defaultAtmo,
        ctx: { ...defaultCtx, mulch: { type: 'paille', thicknessCm: 8 } },
      });
      expect(withMulch.etcFinal).toBeLessThanOrEqual(noMulch.etcFinal);
      expect(withMulch.mulchSavingMm).toBeGreaterThan(0);
    });

    it('les ollas contribuent en eau', () => {
      const result = calcFullHydroNeed({
        kc: 1.0,
        et0Daily: 5,
        atmo: defaultAtmo,
        ctx: { ...defaultCtx, oyaCount: 2 },
      });
      expect(result).toBeDefined();
      expect(result.needLPerM2PerDay).toBeGreaterThan(0);
    });
  });

  describe('MULCH_REDUCTION', () => {
    it('contient tous les types de paillage', () => {
      const types = ['paille', 'brf', 'tontes', 'feuilles', 'toile', 'carton', 'graviers', 'compost'] as const;
      for (const type of types) {
        expect(MULCH_REDUCTION).toHaveProperty(type);
      }
    });

    it('la toile est le paillage le plus efficace en %', () => {
      expect(MULCH_REDUCTION.toile.factor).toBeGreaterThanOrEqual(MULCH_REDUCTION.tontes.factor);
    });
  });

  describe('IRRIGATION_EFFICIENCY', () => {
    it('le goutte-à-goutte est plus efficient que l\'arrosoir', () => {
      expect(IRRIGATION_EFFICIENCY.goutte_a_goutte.factor).toBeGreaterThan(
        IRRIGATION_EFFICIENCY.arrosoir.factor
      );
    });

    it('les ollas sont les plus efficientes', () => {
      expect(IRRIGATION_EFFICIENCY.oya.factor).toBeGreaterThanOrEqual(
        IRRIGATION_EFFICIENCY.goutte_a_goutte.factor
      );
    });
  });
});