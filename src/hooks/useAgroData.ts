/**
 * 🌾 useAgroData — Hook central terrain maraîchage
 * =================================================
 *
 * Calcule en temps réel TOUTES les données agronomiques
 * pour chaque plante du jardin.
 *
 * UTILISE le cerveau botanique (HologramEvolution.tsx) pour les données de base,
 * puis enrichit avec les calculs temps réel.
 *
 * Sources : FAO, INRAE, jardinmame.fr
 */
'use client';
import { useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import {
  PLANT_CARDS,
  type PlantCard,
  getCompanions,
  getSoilStatus,
  getDiseaseRisks,
  getWaterUrgency,
} from '@/components/game/HologramEvolution';
import { loadWaterBudgetState } from '@/lib/water-budget';
import { calcFullHydroNeed, defaultHydroContext, type AtmosphericInputs } from '@/lib/hydro-engine';
import { calcDailyGDD, getGDDConfig, getStageGDDTarget } from '@/lib/gdd-engine';
import { analyzeCompanions } from '@/lib/companion-matrix';
import { loadSoilTempState, SOWING_SOIL_TEMP } from '@/lib/soil-temperature';

export interface PlantAgroData {
  plantId: string;
  plantDefId: string;
  plantCard: PlantCard | null;

  // ── Eau ──
  needLPerDay: number;
  etcFinal: number;
  etcRaw: number;
  waterSavingPct: number;
  hydroBreakdown: { emoji: string; source: string; savingMm: number }[];
  waterUrgency: 'ok' | 'urgent' | 'critique';

  // ── GDD ──
  gddToday: number;
  gddStageTarget: number;
  gddProgressPct: number;
  daysToNextStage: number;

  // ── Sol ──
  soilTempOk: boolean;
  soilTempC: number;
  sowingAdvice: string;

  // ── Compagnonnage ──
  companionScore: 'excellent' | 'bon' | 'neutre' | 'mauvais';
  companionBeneficialCount: number;
  companionHarmfulCount: number;
  companionTip: string;

  // ── Maladies ──
  mildewRisk: number;
  powderyMildewRisk: number;
  diseaseAlert: 'none' | 'attention' | 'danger';
  diseaseMessage: string;
}

export interface GlobalAgroSummary {
  et0Daily: number;
  precipTodayMm: number;
  soilTemp10cm: number;
  totalSavingPct: number;
  companionGlobalScore: number;
  mildewRiskAvg: number;
  plants: PlantAgroData[];
}

export function useAgroData(): GlobalAgroSummary {
  const gardenPlants = useGameStore(s => s.gardenPlants);
  const realWeather  = useGameStore(s => s.realWeather);
  const rw = realWeather as any;

  return useMemo(() => {
    // ── Météo brute ──
    const tMean       = rw?.current?.temperature   ?? 18;
    const tMin        = rw?.today?.tempMin          ?? tMean - 5;
    const tMax        = rw?.today?.tempMax          ?? tMean + 5;
    const humidity    = rw?.current?.humidity       ?? 65;
    const windSpeed   = rw?.current?.windSpeed      ?? 10;
    const precipMm    = rw?.today?.precipitationMm  ?? 0;
    const weatherCode = rw?.current?.weatherCode    ?? 0;
    const sunHours    = weatherCode <= 1 ? 9 : weatherCode <= 3 ? 6 : 3;
    const fogFreq     = humidity >= 95 && windSpeed < 5 ? 0.6
                      : humidity >= 90 ? 0.2 : 0;

    // ── ET0 (Hargreaves simplifié) ──
    const et0Daily = Math.max(1, (tMax - 5) * 0.1 + 2);

    // ── Contexte hydro terrain ──
    const waterState  = loadWaterBudgetState();
    const hydroCtxBase = waterState.hydroContext ?? {};

    // ── Sol ──
    const soilState = loadSoilTempState();
    const soilTemp  = soilState.depth10cm;

    // ── Données atmosphériques ──
    const atmo: AtmosphericInputs = {
      precipMm, humidity, fogFrequency: fogFreq,
      tMin, tMean, windSpeed, sunHours,
    };

    // ── Compagnonnage global ──
    const globalCompanion = analyzeCompanions(
      gardenPlants.map(gp => ({ plantDefId: gp.plantDefId, x: gp.x, y: gp.y }))
    );

    // ── Maladies globales ──
    const precipLast48h = precipMm * 1.5;
    const mildewGlobal  = precipLast48h > 5 ? 0.6 : precipLast48h > 2 ? 0.3 : 0.1;
    const powderyGlobal = humidity >= 60 && humidity <= 80 && tMean >= 15 && tMean <= 25
      ? 0.5 : humidity > 80 ? 0.3 : 0.1;

    // ── Par plante ──
    const plantsData: PlantAgroData[] = gardenPlants.map(gp => {
      const plant = gp.plant;
      if (!plant) return null as any;

      // PlantCard depuis le cerveau botanique
      const plantCard = PLANT_CARDS[gp.plantDefId] ?? null;

      // Surface estimée 0.25 m² par plant maraîchage
      const surfM2 = 0.25;
      const fullCtx = { ...defaultHydroContext(surfM2), ...hydroCtxBase, surfaceM2: surfM2 };
      const kc = plantCard?.kc ?? 1.0;

      // Hydro
      const hydro = calcFullHydroNeed({ kc, et0Daily, atmo, ctx: fullCtx });
      const needLPerDay = hydro.etcFinal * surfM2;
      const savingPct = hydro.et0Base > 0
        ? Math.round((1 - hydro.etcFinal / hydro.et0Base) * 100) : 0;

      // Urgence eau
      const wl = plant.waterLevel;
      const waterUrgency = getWaterUrgency(wl);

      // GDD
      const gddCfg     = getGDDConfig(gp.plantDefId);
      const gddToday   = calcDailyGDD(tMean, tMin, tMax, gddCfg);
      const stageTarget = getStageGDDTarget(gp.plantDefId, plant.stage);
      const gddAccum   = plant.gddAccumulated ?? 0;
      const gddPct     = stageTarget > 0 ? Math.min(100, (gddAccum / stageTarget) * 100) : 0;
      const gddRemain  = Math.max(0, stageTarget - gddAccum);
      const daysToNext = gddToday > 0 ? Math.ceil(gddRemain / gddToday) : 99;

      // Sol
      const soilThresh = SOWING_SOIL_TEMP[gp.plantDefId] ?? (plantCard?.minSoilTempForSowing ?? 10);
      const soilStatus  = getSoilStatus(soilTemp, gp.plantDefId);

      // Compagnonnage — utilise le cerveau botanique
      const nearbyIds = gardenPlants
        .filter(other => {
          if (other.id === gp.id) return false;
          const d = Math.hypot(other.x - gp.x, other.y - gp.y);
          return d <= 120;
        })
        .map(o => o.plantDefId);

      const companionResult = getCompanions(gp.plantDefId, nearbyIds);

      // Maladies — utilise le cerveau botanique (riskPct est 0-100)
      const diseaseRisks = getDiseaseRisks(gp.plantDefId, humidity, tMean, precipMm, windSpeed);
      const mRisk  = (diseaseRisks.find(d => d.name === 'Mildiou')?.riskPct ?? 0) / 100;
      const pmRisk = (diseaseRisks.find(d => d.name === 'Oïdium')?.riskPct ?? 0) / 100;

      const diseaseAlert: PlantAgroData['diseaseAlert'] =
        mRisk > 0.7 || pmRisk > 0.7 ? 'danger'
        : mRisk > 0.4 || pmRisk > 0.4 ? 'attention'
        : 'none';

      const diseaseMsg =
        diseaseAlert === 'danger'
          ? mRisk > pmRisk
            ? `🦠 Risque mildiou élevé (${(mRisk * 100).toFixed(0)}%) — HR ${humidity}% + ${precipMm}mm`
            : `🌫️ Risque oïdium élevé (${(pmRisk * 100).toFixed(0)}%) — T${tMean}°C sec`
          : diseaseAlert === 'attention'
            ? `⚠️ Surveiller : mildiou ${(mRisk * 100).toFixed(0)}% / oïdium ${(pmRisk * 100).toFixed(0)}%`
            : 'Aucun risque phytosanitaire';

      return {
        plantId: gp.id,
        plantDefId: gp.plantDefId,
        plantCard,
        needLPerDay,
        etcFinal: hydro.etcFinal,
        etcRaw: hydro.et0Base,
        waterSavingPct: savingPct,
        hydroBreakdown: hydro.breakdown.map(b => ({ emoji: b.emoji, source: b.source, savingMm: b.savingMm })),
        waterUrgency,
        gddToday,
        gddStageTarget: stageTarget,
        gddProgressPct: gddPct,
        daysToNextStage: daysToNext,
        soilTempOk: soilStatus.isOk,
        soilTempC: soilStatus.tempC,
        sowingAdvice: soilStatus.sowingAdvice,
        companionScore: companionResult.score,
        companionBeneficialCount: companionResult.beneficialCount,
        companionHarmfulCount: companionResult.harmfulCount,
        companionTip: companionResult.tip,
        mildewRisk: mRisk,
        powderyMildewRisk: pmRisk,
        diseaseAlert,
        diseaseMessage: diseaseMsg,
      } satisfies PlantAgroData;
    }).filter(Boolean);

    const totalSavingPct = plantsData.length > 0
      ? Math.round(plantsData.reduce((s, p) => s + p.waterSavingPct, 0) / plantsData.length) : 0;

    return {
      et0Daily,
      precipTodayMm: precipMm,
      soilTemp10cm: soilTemp,
      totalSavingPct,
      companionGlobalScore: globalCompanion.score,
      mildewRiskAvg: mildewGlobal,
      plants: plantsData,
    };
  }, [gardenPlants, realWeather]);
}
