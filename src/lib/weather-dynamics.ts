// ═══════════════════════════════════════════════════════════
//  🌧️ Weather Dynamics — Modulateurs Météo Réels
//  Calcule l'impact hydrologique et le stress végétal
//  à partir des données Open-Meteo brutes.
//  Pas de bonus fictifs — physique du sol réelle.
// ═══════════════════════════════════════════════════════════

export interface SoilWaterState {
  /** Teneur en eau du sol (0-100) */
  soilMoisture: number;
  /** Ruissellement aujourd'hui (mm) — si pluie > capacité sol */
  runoff: number;
  /** Stress hydrique (0=aucun, 1=critique) */
  waterStress: number;
  /** Stress thermique (0=aucun, 1=critique) */
  heatStress: number;
  /** Stress gel (0=aucun, 1=critique) */
  frostStress: number;
}

export interface DailyWeatherInputs {
  tMean: number;       // °C
  tMin: number;        // °C
  tMax: number;        // °C
  precipitation: number; // mm
  humidity: number;    // %
  windSpeed: number;   // km/h
  sunlightHours: number;
}

/**
 * Capacité en eau du sol (mm) selon texture
 * Sol limoneux standard : ~150mm avant saturation
 */
const SOIL_FIELD_CAPACITY = 150;
const SOIL_WILTING_POINT  = 40;  // En dessous : stress permanent

/**
 * Met à jour l'état hydrique du sol après une journée.
 * Implémente le bilan hydrique FAO-56 simplifié.
 */
export function updateSoilWater(
  prev: SoilWaterState,
  weather: DailyWeatherInputs,
  cropCoefficient: number,
  zoneId: string
): SoilWaterState {
  let moisture = prev.soilMoisture;

  // ── Apport : pluie (seulement jardin extérieur) ──
  let rain = 0;
  if (zoneId === 'garden') {
    rain = weather.precipitation;
    moisture += rain;
  }

  // ── Ruissellement : eau qui déborde si sol saturé ──
  const runoff = Math.max(0, moisture - SOIL_FIELD_CAPACITY);
  moisture = Math.min(SOIL_FIELD_CAPACITY, moisture);

  // ── Pertes : évapotranspiration (ET0 simplifié Hargreaves) ──
  const tRange = weather.tMax - weather.tMin;
  const Ra = 12; // rayonnement extraterrestre moyen France (MJ/m²/jour)
  const ET0 = 0.0023 * (weather.tMean + 17.8) * Math.sqrt(Math.max(0, tRange)) * Ra * 0.408;
  const ETc = ET0 * cropCoefficient; // Évapotranspiration culture
  const zoneETfactor = zoneId === 'garden' ? 1.0 : 0.2; // intérieur perd peu
  moisture = Math.max(0, moisture - ETc * zoneETfactor);

  // ── Stress hydrique (0-1) ──
  let waterStress = 0;
  if (moisture < SOIL_WILTING_POINT) {
    waterStress = 1 - (moisture / SOIL_WILTING_POINT);
  }

  // ── Stress thermique canicule ──
  let heatStress = 0;
  if (weather.tMax > 35) heatStress = Math.min(1, (weather.tMax - 35) / 10);
  else if (weather.tMax > 32) heatStress = (weather.tMax - 32) / 3 * 0.4;

  // ── Stress gel ──
  let frostStress = 0;
  if (weather.tMin < 0)  frostStress = Math.min(1, Math.abs(weather.tMin) / 5);
  else if (weather.tMin < 2) frostStress = (2 - weather.tMin) / 2 * 0.3;

  return { soilMoisture: Math.round(moisture * 10) / 10, runoff, waterStress, heatStress, frostStress };
}

/**
 * Traduit les stress en modificateur de croissance (0.0–1.0).
 * 1.0 = conditions parfaites. Pas de bonus au dessus de 1.
 */
export function stressToGrowthMod(stress: SoilWaterState): number {
  const waterMod  = 1 - stress.waterStress  * 0.7;  // manque d'eau → -70% max
  const heatMod   = 1 - stress.heatStress   * 0.5;  // canicule → -50% max
  const frostMod  = 1 - stress.frostStress  * 0.9;  // gel → -90% max
  return Math.max(0, Math.min(1, waterMod * heatMod * frostMod));
}

/**
 * Risque de mildiou (0-1) selon critères épidémiologiques réels.
 * Mildiou : T 15-25°C + humidité > 85% + pluie pendant 48h
 */
export function calcMildewRisk(
  humidity: number,
  tMean: number,
  precipLast48h: number
): number {
  if (tMean < 10 || tMean > 28) return 0;
  const tempFactor  = tMean >= 15 && tMean <= 25 ? 1.0 : 0.4;
  const humidFactor = humidity > 90 ? 1.0 : humidity > 80 ? 0.6 : humidity > 70 ? 0.2 : 0;
  const rainFactor  = precipLast48h > 10 ? 1.0 : precipLast48h > 3 ? 0.5 : 0;
  return tempFactor * Math.max(humidFactor, rainFactor);
}

/**
 * Risque d'oïdium (0-1) — conditions opposées au mildiou.
 * Oïdium : temps chaud + sec + vent
 */
export function calcPowderyMildewRisk(
  humidity: number,
  tMean: number,
  windSpeed: number
): number {
  if (humidity > 85 || tMean < 18) return 0;
  const tempFactor  = tMean >= 20 && tMean <= 32 ? 1.0 : 0.4;
  const humidFactor = humidity < 60 ? 1.0 : humidity < 75 ? 0.5 : 0.1;
  const windFactor  = windSpeed > 15 ? 0.8 : windSpeed > 8 ? 0.4 : 0.1;
  return tempFactor * humidFactor * windFactor;
}
