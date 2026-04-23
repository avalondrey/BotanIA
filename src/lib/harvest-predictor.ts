/**
 * Harvest Predictor — Prédiction de date de récolte
 *
 * Estime la date de récolte d'une plante en combinant :
 * 1. GDD accumulés depuis le semis
 * 2. GDD requis pour la récolte (somme des stageGDD + marge)
 * 3. Prévisions météo (température moyenne attendue)
 *
 * Retourne : date estimée, intervalle de confiance (±jours), % de progression.
 */

import { calcDailyGDD, getGDDConfig, PLANT_GDD } from './gdd-engine';
import type { WeatherForecastDay } from './weather-service';

export interface HarvestPrediction {
  /** Date estimée (ISO string) */
  estimatedDate: string;
  /** Intervalle de confiance en jours (ex: ±3) */
  confidenceDays: number;
  /** Pourcentage de progression vers la récolte (0-100) */
  progressPct: number;
  /** Jours restants estimés */
  daysRemaining: number;
  /** Texte lisible pour l'UI */
  label: string;
}

/**
 * Calcule la prédiction de récolte pour une plante.
 */
export function predictHarvestDate(
  plantDefId: string,
  /** Jours depuis le semis */
  daysSincePlanting: number,
  /** GDD déjà accumulés (si tracking actif) — sinon estimé */
  accumulatedGDD: number | null,
  /** Prévisions météo 7-14 jours */
  forecast: WeatherForecastDay[],
): HarvestPrediction | null {
  const cfg = PLANT_GDD[plantDefId];
  if (!cfg) return null;

  // GDD total requis ≈ somme des stades × 1.2 (marge récolte)
  const totalGDDNeeded = cfg.stageGDD.reduce((a, b) => a + b, 0) * 1.2;

  // GDD accumulés : si pas de tracking, on estime avec la météo passée
  let gddSoFar = accumulatedGDD ?? 0;
  if (gddSoFar === 0 && daysSincePlanting > 0) {
    // Estimation grossière : moyenne 12 GDD/jour en saison
    gddSoFar = daysSincePlanting * 12;
  }

  if (gddSoFar >= totalGDDNeeded) {
    return {
      estimatedDate: new Date().toISOString().split('T')[0],
      confidenceDays: 0,
      progressPct: 100,
      daysRemaining: 0,
      label: 'Récolte imminente',
    };
  }

  const gddRemaining = totalGDDNeeded - gddSoFar;
  const progressPct = Math.min(100, Math.round((gddSoFar / totalGDDNeeded) * 100));

  // Simuler l'accumulation future jour par jour avec les prévisions
  let simulatedGDD = 0;
  let daysSimulated = 0;

  for (const day of forecast) {
    const daily = calcDailyGDD(
      (day.tempMax + day.tempMin) / 2,
      day.tempMin,
      day.tempMax,
      cfg
    );
    simulatedGDD += daily;
    daysSimulated++;
    if (simulatedGDD >= gddRemaining) break;
  }

  // Si les prévisions ne suffisent pas, on extrapole avec la moyenne des prévisions
  if (simulatedGDD < gddRemaining) {
    const avgDailyGDD = daysSimulated > 0
      ? simulatedGDD / daysSimulated
      : 10; // fallback 10 GDD/jour
    daysSimulated += Math.ceil((gddRemaining - simulatedGDD) / avgDailyGDD);
  }

  const estimatedDate = new Date(Date.now() + daysSimulated * 24 * 60 * 60 * 1000);

  // Confiance : ±20% des jours restants, min 1 max 5
  const confidenceDays = Math.max(1, Math.min(5, Math.round(daysSimulated * 0.2)));

  return {
    estimatedDate: estimatedDate.toISOString().split('T')[0],
    confidenceDays,
    progressPct,
    daysRemaining: daysSimulated,
    label: `Récolte estimée : ${formatDateFR(estimatedDate)} (±${confidenceDays} j)`,
  };
}

function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}
