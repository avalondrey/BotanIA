// ═══════════════════════════════════════════════════════════
//  🌦️ Weather Alert Engine — Alertes Météo Intelligentes
//  Analyse les prévisions 48h et alerte par plante du jardin
//  Sources : Open-Meteo + données botaniques INRAE
// ═══════════════════════════════════════════════════════════

import { type WeatherForecastDay, type RealWeatherData } from './weather-service';
import { PLANT_GDD } from './gdd-engine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface CropWeatherAlert {
  plantDefId: string;
  plantName: string;
  plantEmoji: string;
  /** Jour concerné (ISO date) */
  date: string;
  /** Type d'alerte */
  type: 'frost' | 'heat' | 'heavyRain' | 'strongWind' | 'coldSnap' | 'drought';
  severity: AlertSeverity;
  /** Message explicatif */
  message: string;
  /** Température/période concerné */
  detail: string;
  /** Niveau derisque 0-100 */
  riskLevel: number;
}

// ─── Seuils par type d'alerte ─────────────────────────────────────────────────

const ALERT_THRESHOLDS = {
  frost: { tempMax: 2, severity: 'critical' as AlertSeverity, riskBase: 90 },
  coldSnap: { tempMax: 5, severity: 'warning' as AlertSeverity, riskBase: 60 },
  heat: { tempMax: 35, severity: 'critical' as AlertSeverity, riskBase: 90 },
  heavyRain: { precipMm: 20, severity: 'warning' as AlertSeverity, riskBase: 50 },
  strongWind: { windKmh: 50, severity: 'warning' as AlertSeverity, riskBase: 40 },
  drought: { precipMm: 0, daysNoRain: 5, severity: 'warning' as AlertSeverity, riskBase: 45 },
};

// ─── Plantes sensibles (par catégorie) ──────────────────────────────────────

const FROST_SENSITIVE = new Set([
  'tomato', 'pepper', 'eggplant', 'cucumber', 'zucchini', 'squash',
  'melon', 'corn', 'bean', 'basil', 'sunflower',
]);

const HEAT_SENSITIVE = new Set([
  'lettuce', 'spinach', 'radish', 'cabbage', 'pea', 'carrot',
  'strawberry',
]);

const COLD_HARDY = new Set([
  'cabbage', 'radish', 'spinach', 'carrot', 'pea', 'sorrel',
]);

// ─── Parsing des seuils depuis PLANT_GDD ──────────────────────────────────────

function getPlantThresholds(plantDefId: string) {
  const cfg = PLANT_GDD[plantDefId];
  if (!cfg) return { tBase: 8, tCap: 30 };
  return { tBase: cfg.tBase, tCap: cfg.tCap };
}

// ─── Analyse journalière ───────────────────────────────────────────────────────

function analyzeDay(
  day: WeatherForecastDay,
  plantDefId: string,
  plantName: string,
  plantEmoji: string,
  consecutiveDryDays: number
): CropWeatherAlert[] {
  const alerts: CropWeatherAlert[] = [];
  const thresholds = getPlantThresholds(plantDefId);
  const isFrostSensitive = FROST_SENSITIVE.has(plantDefId);
  const isHeatSensitive = HEAT_SENSITIVE.has(plantDefId);
  const isColdHardy = COLD_HARDY.has(plantDefId);

  // ── Gel (tempMin <= 2°C) ──
  if (day.tempMin <= 2) {
    if (isFrostSensitive) {
      alerts.push({
        plantDefId, plantName, plantEmoji, date: day.date,
        type: 'frost', severity: 'critical',
        message: `🌨️ RISQUE DE GEL pour ${plantName} ! Température minimale de ${day.tempMin}°C prévue.`,
        detail: `Sensibilité au gel: ${isFrostSensitive ? 'ÉLEVÉE' : 'normale'}. Couvre(r) les plantes ou rentre(r) en serre.`,
        riskLevel: ALERT_THRESHOLDS.frost.riskBase,
      });
    } else if (isColdHardy) {
      // Plantes rustiques = pas d'alerte
    } else {
      alerts.push({
        plantDefId, plantName, plantEmoji, date: day.date,
        type: 'frost', severity: 'warning',
        message: `❄️ Gelée prévue (${day.tempMin}°C) — ${plantName} peut être affectée.`,
        detail: `Prévoir un voile de protection si jeune plantule.`,
        riskLevel: 50,
      });
    }
  }

  // ── Froidsnap (tempMax < 10°C) pour plantes sensibles ──
  if (day.tempMax < 10 && isFrostSensitive) {
    alerts.push({
      plantDefId, plantName, plantEmoji, date: day.date,
      type: 'coldSnap', severity: 'warning',
      message: `🥶 froidSnap — max ${day.tempMax}°C prévu, ${plantName} peut stagner.`,
      detail: `Croissance quasi-nulle sous ${thresholds.tBase}°C. Attendre la remontée pour_semez/répiquez.`,
      riskLevel: 65,
    });
  }

  // ── Canicule (tempMax >= 35°C) ──
  if (day.tempMax >= 35) {
    const riskLevel = day.tempMax >= 40 ? 100 : 90;
    alerts.push({
      plantDefId, plantName, plantEmoji, date: day.date,
      type: 'heat', severity: 'critical',
      message: `🔥 CANICULE — ${day.tempMax}°C prévu pour ${plantName} !`,
      detail: `Arroser le matin tôt, pailler abondamment, ombrer si possible. Sécheresse physiologicale au-delà de ${thresholds.tCap}°C.`,
      riskLevel,
    });
  }

  // ── Forte chaleur pour légumes feuilles ──
  if (day.tempMax >= 30 && isHeatSensitive) {
    alerts.push({
      plantDefId, plantName, plantEmoji, date: day.date,
      type: 'heat', severity: 'warning',
      message: `🌡️ Forte chaleur — ${day.tempMax}°C, ${plantName} risque la montée en graine (montaison).`,
      detail: `Maintenir le sol humide, ombrer partiellement.`,
      riskLevel: 70,
    });
  }

  // ── Forte pluie (>= 20mm/jour) ──
  if (day.precipitationMm >= ALERT_THRESHOLDS.heavyRain.precipMm) {
    alerts.push({
      plantDefId, plantName, plantEmoji, date: day.date,
      type: 'heavyRain', severity: 'warning',
      message: `🌧️ Forte pluie — ${day.precipitationMm}mm prévus. Sol saturé pour ${plantName}.`,
      detail: `Vérifier drainage, éviter piétinement. Maladies fongiques favorisées par humidité prolongée.`,
      riskLevel: ALERT_THRESHOLDS.heavyRain.riskBase + (day.precipitationMm >= 30 ? 30 : 0),
    });
  }

  // ── Vent fort (>= 50 km/h) ──
  if (day.windSpeedMax >= ALERT_THRESHOLDS.strongWind.windKmh) {
    alerts.push({
      plantDefId, plantName, plantEmoji, date: day.date,
      type: 'strongWind', severity: 'warning',
      message: `💨 Vent fort — ${day.windSpeedMax} km/h. ${plantName} peut être abîmé.`,
      detail: `Vérifier tuteurs et supports. Haies naturelles comme brise-vent.`,
      riskLevel: ALERT_THRESHOLDS.strongWind.riskBase + (day.windSpeedMax >= 70 ? 30 : 0),
    });
  }

  // ── Sécheresse (pas de pluie depuis X jours) ──
  if (consecutiveDryDays >= 5) {
    alerts.push({
      plantDefId, plantName, plantEmoji, date: day.date,
      type: 'drought', severity: consecutiveDryDays >= 7 ? 'critical' : 'warning',
      message: `💧 Sécheresse — ${consecutiveDryDays} jours sans pluie significative. ${plantName} a besoin d'eau.`,
      detail: `Arroser profondément 1×/semaine plutôt que 2×/semaine superficiel. Paillage recommandé.`,
      riskLevel: ALERT_THRESHOLDS.drought.riskBase + consecutiveDryDays * 5,
    });
  }

  return alerts;
}

// ─── Interface principale ──────────────────────────────────────────────────────

export interface WeatherAlertConfig {
  /** Coordonnées GPS pour météo */
  lat?: number;
  lon?: number;
  /** Nombre de jours de prévision à analyser (défaut: 3, max: 7) */
  forecastDays?: number;
  /** Seuils de gel personalisés (défaut: 2°C) */
  frostThresholdC?: number;
}

export interface PlantInfo {
  plantDefId: string;
  plantName: string;
  plantEmoji: string;
}

/**
 * Analyse les prévisions météo et génère des alertes personnalisées
 * pour chaque plante du jardin.
 */
export function analyzeCropWeatherAlerts(
  weather: RealWeatherData,
  gardenPlants: PlantInfo[],
  config: WeatherAlertConfig = {}
): CropWeatherAlert[] {
  if (!weather.forecast || weather.forecast.length === 0) return [];

  const { forecastDays = 3 } = config;
  const forecast = weather.forecast.slice(0, forecastDays);
  const alerts: CropWeatherAlert[] = [];

  // Compter jours secs consécutifs
  let consecutiveDryDays = 0;
  for (const day of weather.forecast) {
    if (day.precipitationMm < 1) consecutiveDryDays++;
    else consecutiveDryDays = 0;
  }

  for (const plant of gardenPlants) {
    for (let i = 0; i < forecast.length; i++) {
      const day = forecast[i];
      const dryDays = consecutiveDryDays - i;
      const dayAlerts = analyzeDay(day, plant.plantDefId, plant.plantName, plant.plantEmoji, dryDays);
      alerts.push(...dayAlerts);
    }
  }

  // Trier par sévérité (critical > warning > info) puis par date
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => {
    const sDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sDiff !== 0) return sDiff;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return b.riskLevel - a.riskLevel;
  });

  return alerts;
}

/**
 * Retourne un résumé global des alertes (pour notification).
 */
export function summarizeAlerts(alerts: CropWeatherAlert[]): {
  total: number;
  critical: number;
  warning: number;
  summary: string;
} {
  const critical = alerts.filter(a => a.severity === 'critical').length;
  const warning = alerts.filter(a => a.severity === 'warning').length;

  let summary = '';
  if (critical > 0) {
    summary = `⚠️ ${critical} alerte(s) critique(s) — action immédiate requise !`;
  } else if (warning > 0) {
    summary = `ℹ️ ${warning} alerte(s) à surveiller`;
  } else {
    summary = `✅ Aucune alerte météo majeure`;
  }

  return { total: alerts.length, critical, warning, summary };
}

/**
 * Filtre les alertes par plante ou par type.
 */
export function filterAlerts(
  alerts: CropWeatherAlert[],
  filter: { plantDefId?: string; type?: string; severity?: AlertSeverity }
): CropWeatherAlert[] {
  return alerts.filter(a => {
    if (filter.plantDefId && a.plantDefId !== filter.plantDefId) return false;
    if (filter.type && a.type !== filter.type) return false;
    if (filter.severity && a.severity !== filter.severity) return false;
    return true;
  });
}

/**
 * Retourne les jours de forecast sans alerte (calendrier de jardinage).
 */
export function getSafePlantingDays(
  weather: RealWeatherData,
  plantDefId: string
): WeatherForecastDay[] {
  const thresholds = getPlantThresholds(plantDefId);
  const isFrostSensitive = FROST_SENSITIVE.has(plantDefId);

  return weather.forecast.filter(day => {
    // Pas de gel si sensible
    if (isFrostSensitive && day.tempMin <= 2) return false;
    // Pas de froid excessif
    if (day.tempMax < thresholds.tBase) return false;
    // Pas de canicule
    if (day.tempMax > thresholds.tCap) return false;
    return true;
  });
}
