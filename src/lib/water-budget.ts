// ═══════════════════════════════════════════════════════════
//  💧 Water Budget Engine — Bilan Hydrique Complet
//  Gestion cuves, récupération pluie toiture, calcul hebdo
//  Sources : ADEME, FAO-56, données pluviométrie France
// ═══════════════════════════════════════════════════════════

import { type HydroContext, type AtmosphericInputs, calcFullHydroNeed, defaultHydroContext } from './hydro-engine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WaterSourceMode = 'reseau' | 'cuve_only' | 'cuve_bidon' | 'puit';

export interface RainwaterTank {
  id: string;
  name: string;           // "Cuve Nord", "Bidon 1", "Puit Sud"...
  capacityL: number;      // litres — capacité max (puit : débit journalier max)
  currentLevelL: number;  // litres actuellement disponibles
  roofAreaM2: number;     // m² de surface de toiture connectée (0 pour puit)
  efficiency: number;     // 0.8 = 80% récupération
  color: string;          // couleur d'affichage
  isActive: boolean;      // en service
  isPuit?: boolean;       // true = source souterraine (se recharge automatiquement)
  puitDepthM?: number;    // profondeur du puit (m) — info seulement
  puitDailyLimitL?: number; // débit journalier max (L/j) — protection nappes
}

// ─── Alerte arrosage ─────────────────────────────────────────────────────────

export interface WateringAlert {
  plantId: string;
  plantName: string;
  plantEmoji: string;
  /** Niveau d'eau actuel (%) */
  waterLevel: number;
  /** Urgence : critique < 15%, urgent < 30%, ok >= 30% */
  urgency: 'critique' | 'urgent' | 'ok';
  /** Litres estimés nécessaires pour remonter à 80% */
  needL: number;
  /** Rang associé (depuis SeedRowPainter) */
  rowLabel?: string;
}

export interface WaterBudgetState {
  mode: WaterSourceMode;
  tanks: RainwaterTank[];
  consumptionHistory: number[];
  lastUpdated: string;
  manualAddHistory: { date: string; liters: number; note: string }[];
  wateredTodayIds: string[];
  lastWateringDate: string;
  /** Contexte terrain hydro (paillage, oyas, sol, permaculture...) */
  hydroContext?: Partial<HydroContext>;
}

export interface WeeklyWaterBudget {
  totalNeedL: number;
  rainContributionL: number;
  tanksAvailableL: number;
  deficitL: number;
  surplusL: number;
  autonomyDays: number;
  perCropNeed: { name: string; areaM2: number; needL: number; kc: number }[];
  isCritical: boolean;
  summary: string;
  /** Économies hydro détaillées (paillage, oyas, permaculture...) */
  hydroSavingsL: number;
  /** Apports passifs cette semaine (brouillard, rosée...) */
  passiveInputsL: number;
}

// ─── Calculs physiques ────────────────────────────────────────────────────────

/**
 * Volume d'eau récupéré depuis une toiture sur une pluie donnée.
 * V = précipitation (mm) × surface (m²) × efficacité
 * 1 mm de pluie sur 1 m² = 1 litre
 */
export function calcRainHarvest(
  precipMm: number,
  tank: RainwaterTank
): number {
  if (!tank.isActive || precipMm <= 0) return 0;
  // Première pluie de la saison (< 2mm) : chasse le toit, perte totale
  if (precipMm < 2) return 0;
  const raw = precipMm * tank.roofAreaM2 * tank.efficiency;
  const available = tank.capacityL - tank.currentLevelL;
  return Math.min(raw, available); // Ne dépasse pas la capacité
}

/**
 * Besoin en eau d'une culture sur 7 jours (litres).
 * Formule FAO-56 : ETc = ET0 × Kc × surface
 * ET0 moyen France été : 5 mm/jour
 */
export function calcCropWeeklyNeed(
  et0Daily: number,     // mm/jour (issu de la météo ou 4mm défaut)
  kc: number,           // coefficient cultural FAO
  surfaceM2: number,    // surface plantée
  days = 7
): number {
  // 1 mm/m² = 1 litre
  return et0Daily * kc * surfaceM2 * days;
}

/**
 * Calcule le bilan hydrique complet de la semaine.
 * Si hydroContext et atmo sont fournis, utilise le moteur hydro complet
 * (paillage, oyas, brouillard, rosée, permaculture, sol...).
 */
export function calcWeeklyBudget(params: {
  tanks: RainwaterTank[];
  crops: { name: string; surfaceM2: number; kc: number }[];
  forecastPrecipMm: number[];
  et0Daily: number;
  mode: WaterSourceMode;
  /** Optionnel : contexte hydro pour le moteur avancé */
  hydroCtx?: Partial<HydroContext>;
  /** Optionnel : données atmosphériques du jour */
  atmo?: Partial<AtmosphericInputs>;
}): WeeklyWaterBudget {
  const { tanks, crops, forecastPrecipMm, et0Daily, mode } = params;

  // ── Disponible dans les cuves ──
  const tanksAvailableL = mode === 'reseau'
    ? Infinity  // réseau = illimité
    : mode === 'puit'
      ? tanks.filter(t => t.isActive && t.isPuit).reduce((s, t) => {
          // Puit : débit journalier max × 7 jours
          const dailyLimit = t.puitDailyLimitL ?? t.capacityL;
          return s + Math.min(t.currentLevelL, dailyLimit * 7);
        }, 0) + tanks.filter(t => t.isActive && !t.isPuit).reduce((s, t) => s + t.currentLevelL, 0)
      : tanks.filter(t => t.isActive).reduce((s, t) => s + t.currentLevelL, 0);

  // ── Apport pluie prévu (somme des 7 jours × toutes cuves) ──
  let rainContributionL = 0;
  if (mode !== 'reseau') {
    for (const tank of tanks.filter(t => t.isActive)) {
      for (const dayMm of forecastPrecipMm) {
        rainContributionL += calcRainHarvest(dayMm, tank);
      }
    }
  }

  // ── Besoins cultures (avec moteur hydro si dispo) ──
  let hydroSavingsL = 0;
  let passiveInputsL = 0;

  const perCropNeed = crops.map(c => {
    let needL: number;

    if (params.hydroCtx && params.atmo) {
      // Moteur hydro complet
      const fullCtx: HydroContext = {
        ...defaultHydroContext(c.surfaceM2),
        ...params.hydroCtx,
        surfaceM2: c.surfaceM2,
      };
      const fullAtmo: AtmosphericInputs = {
        precipMm: forecastPrecipMm[0] ?? 0,
        humidity: 65,
        fogFrequency: 0,
        tMin: et0Daily > 4 ? 12 : 5,
        tMean: et0Daily > 4 ? 22 : 12,
        windSpeed: 10,
        sunHours: 6,
        ...params.atmo,
      };
      const result = calcFullHydroNeed({ kc: c.kc, et0Daily, atmo: fullAtmo, ctx: fullCtx });
      needL = result.needLPerM2PerDay * c.surfaceM2 * 7;
      const rawNeedL = et0Daily * c.kc * c.surfaceM2 * 7;
      hydroSavingsL += Math.max(0, rawNeedL - needL);
      passiveInputsL += result.passiveInputMm * c.surfaceM2 * 7;
    } else {
      // Calcul FAO-56 simple
      needL = calcCropWeeklyNeed(et0Daily, c.kc, c.surfaceM2);
    }

    return { name: c.name, areaM2: c.surfaceM2, kc: c.kc, needL };
  });
  const totalNeedL = perCropNeed.reduce((s, c) => s + c.needL, 0);

  // ── Bilan ──
  const totalAvailable = (mode === 'reseau' ? 99999 : tanksAvailableL) + rainContributionL;
  const deficitL = Math.max(0, totalNeedL - totalAvailable);
  const surplusL = Math.max(0, totalAvailable - totalNeedL);

  // ── Autonomie ──
  const dailyConsumption = totalNeedL / 7;
  const autonomyDays = dailyConsumption > 0
    ? Math.floor(totalAvailable / dailyConsumption)
    : 999;

  // ── Critique si < 3 jours d'autonomie et mode cuve ──
  const isCritical = mode !== 'reseau' && autonomyDays < 3;

  // ── Résumé ──
  let summary: string;
  if (mode === 'reseau') {
    summary = `🚰 Réseau — Besoins semaine : ${totalNeedL.toFixed(0)}L`;
  } else if (isCritical) {
    summary = `🔴 CRITIQUE — ${autonomyDays}j d'autonomie — Rechargez les cuves !`;
  } else if (deficitL > 0) {
    summary = `⚠️ Déficit ${deficitL.toFixed(0)}L — Apport manuel requis cette semaine`;
  } else {
    summary = `✅ Autonomie ${autonomyDays}j — Excédent ${surplusL.toFixed(0)}L`;
  }

  return {
    totalNeedL, rainContributionL, tanksAvailableL,
    deficitL, surplusL, autonomyDays, perCropNeed,
    isCritical, summary, hydroSavingsL, passiveInputsL,
  };
}

// ─── Mise à jour automatique des cuves après pluie ───────────────────────────

/**
 * Après chaque tick journalier : ajoute la pluie du jour dans toutes les cuves actives.
 * Pour les puits : recharge partielle automatique (nappe souterraine).
 * Retourne les nouvelles cuves avec niveaux mis à jour.
 */
export function updateTanksAfterRain(
  tanks: RainwaterTank[],
  precipMm: number
): RainwaterTank[] {
  return tanks.map(tank => {
    if (!tank.isActive) return tank;
    if (tank.isPuit) {
      // Puit : recharge ~5% par jour (nappe phréatique), plafonné à capacité
      const dailyRecharge = tank.capacityL * 0.05;
      return { ...tank, currentLevelL: Math.min(tank.capacityL, tank.currentLevelL + dailyRecharge) };
    }
    const gained = calcRainHarvest(precipMm, tank);
    return { ...tank, currentLevelL: Math.min(tank.capacityL, tank.currentLevelL + gained) };
  });
}

/**
 * Consomme des litres depuis les cuves (priorité : cuve la plus pleine).
 * Retourne { tanks, consumed, shortfall }.
 */
export function consumeFromTanks(
  tanks: RainwaterTank[],
  needL: number,
  mode: WaterSourceMode
): { tanks: RainwaterTank[]; consumed: number; shortfall: number } {
  if (mode === 'reseau') {
    return { tanks, consumed: needL, shortfall: 0 };
  }
  let remaining = needL;
  const newTanks = [...tanks];
  // Trier par niveau décroissant
  const sorted = newTanks
    .map((t, i) => ({ tank: t, idx: i }))
    .filter(x => x.tank.isActive && x.tank.currentLevelL > 0)
    .sort((a, b) => b.tank.currentLevelL - a.tank.currentLevelL);

  for (const { tank, idx } of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, newTanks[idx].currentLevelL);
    newTanks[idx] = { ...newTanks[idx], currentLevelL: newTanks[idx].currentLevelL - take };
    remaining -= take;
  }
  return { tanks: newTanks, consumed: needL - remaining, shortfall: remaining };
}

// ─── Persistence localStorage ────────────────────────────────────────────────

const WATER_STORAGE_KEY = 'botania-water-budget';

export function loadWaterBudgetState(): WaterBudgetState {
  if (typeof window === 'undefined') return defaultWaterState();
  try {
    const s = localStorage.getItem(WATER_STORAGE_KEY);
    if (s) return { ...defaultWaterState(), ...JSON.parse(s) };
  } catch {}
  return defaultWaterState();
}

export function saveWaterBudgetState(state: WaterBudgetState): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function defaultWaterState(): WaterBudgetState {
  return {
    mode: 'cuve_only',
    tanks: [
      {
        id: 'tank-1',
        name: 'Cuve principale',
        capacityL: 1000,
        currentLevelL: 500,
        roofAreaM2: 30,
        efficiency: 0.8,
        color: '#2196f3',
        isActive: true,
        isPuit: false,
      },
    ],
    consumptionHistory: Array(7).fill(0),
    lastUpdated: new Date().toISOString(),
    manualAddHistory: [],
    wateredTodayIds: [],
    lastWateringDate: new Date().toISOString().slice(0, 10),
  };
}

/** Ajouter un apport manuel (bidon, citerne livrée...) */
export function addManualWater(
  state: WaterBudgetState,
  tankId: string,
  liters: number,
  note = ''
): WaterBudgetState {
  const tanks = state.tanks.map(t => {
    if (t.id !== tankId) return t;
    return { ...t, currentLevelL: Math.min(t.capacityL, t.currentLevelL + liters) };
  });
  return {
    ...state,
    tanks,
    manualAddHistory: [
      { date: new Date().toISOString(), liters, note },
      ...state.manualAddHistory.slice(0, 29), // max 30 entrées
    ],
  };
}

/**
 * Calcule les alertes d'arrosage à partir des plantes du jardin.
 *
 * Logique pluviométrie réelle :
 *   - precipTodayMm : pluie tombée aujourd'hui (Open-Meteo daily precipitation_sum)
 *   - Si pluie >= RAIN_CANCEL_THRESHOLD → toutes les alertes sont annulées (arrosage naturel suffisant)
 *   - Si pluie entre RAIN_PARTIAL et RAIN_CANCEL → seuils d'urgence remontés (moins urgent)
 *   - Si pluie < RAIN_PARTIAL → seuils normaux
 *
 * Sources : FAO-56, INRAE — 5mm = arrosage léger suffisant pour la plupart des cultures
 */
const RAIN_CANCEL_MM   = 8;   // ≥8mm → annule TOUTES les alertes
const RAIN_PARTIAL_MM  = 3;   // 3-8mm → remonte les seuils d'urgence

export function calcWateringAlerts(
  gardenPlants: Array<{ id: string; plantDefId: string; plant: { waterLevel: number } }>,
  plantDefs: Record<string, { name: string; emoji: string; cropCoefficient: number }>,
  wateredTodayIds: string[],
  precipTodayMm = 0,
  /** Optionnel : contexte hydro pour affiner les seuils */
  hydroCtx?: Partial<HydroContext>,
  /** Optionnel : données atmosphériques */
  atmo?: Partial<AtmosphericInputs>
): WateringAlert[] {

  // ── Pluie suffisante → aucune alerte ──────────────────────────────────────
  if (precipTodayMm >= RAIN_CANCEL_MM) return [];

  // ── Calcul apports passifs (brouillard, rosée) si données dispo ──
  let passiveBoostMm = 0;
  if (atmo) {
    const { calcPassiveInputs } = require('./hydro-engine');
    const fullAtmo: AtmosphericInputs = {
      precipMm: precipTodayMm,
      humidity: 65,
      fogFrequency: 0,
      tMin: 10,
      tMean: 18,
      windSpeed: 10,
      sunHours: 6,
      ...atmo,
    };
    const passive = calcPassiveInputs(fullAtmo);
    passiveBoostMm = passive.totalMm;
  }

  // ── Bonus paillage sur les seuils d'alerte ──
  // Paillage réduit la dessiccation → on peut tolérer un niveau plus bas
  let mulchTolerancePct = 0;
  if (hydroCtx?.mulch) {
    // Paillage bien posé → +10% de tolérance (plante moins stressée à même niveau)
    mulchTolerancePct = 10;
  }

  // ── Seuils dynamiques selon la pluie ──────────────────────────────────────
  // Avec pluie partielle (3-8mm) : on remonte les seuils, moins de pression
  const thresholdCritique = precipTodayMm >= RAIN_PARTIAL_MM ? 8  : 15;
  const thresholdUrgent   = precipTodayMm >= RAIN_PARTIAL_MM ? 18 : 30;

  const alerts: WateringAlert[] = [];

  for (const gp of gardenPlants) {
    if (wateredTodayIds.includes(gp.id)) continue;
    const def = plantDefs[gp.plantDefId];
    if (!def) continue;

    // Niveau d'eau ajusté : pluie + rosée/brouillard + paillage
    const rainBoost = precipTodayMm * 1.5;
    const effectiveLevel = Math.min(100,
      gp.plant.waterLevel + rainBoost + (passiveBoostMm * 2)
    );

    // Seuils ajustés selon paillage (plante moins stressée)
    const adjCritique = thresholdCritique - mulchTolerancePct;
    const adjUrgent   = thresholdUrgent   - mulchTolerancePct;

    let urgency: WateringAlert['urgency'] = 'ok';
    if      (effectiveLevel < adjCritique) urgency = 'critique';
    else if (effectiveLevel < adjUrgent)   urgency = 'urgent';
    else continue;

    const needL = Math.round(Math.max(0, (80 - effectiveLevel) * 0.1));
    alerts.push({
      plantId:     gp.id,
      plantName:   def.name,
      plantEmoji:  def.emoji,
      waterLevel:  gp.plant.waterLevel,
      urgency,
      needL,
    });
  }

  return alerts.sort((a, b) => (a.urgency === 'critique' ? -1 : 1));
}

/**
 * Marque une plante comme arrosée aujourd'hui.
 * Réinitialise la liste si nouveau jour.
 */
export function markWatered(state: WaterBudgetState, plantId: string): WaterBudgetState {
  const today = new Date().toISOString().slice(0, 10);
  const freshState = state.lastWateringDate !== today
    ? { ...state, wateredTodayIds: [], lastWateringDate: today }
    : state;
  return {
    ...freshState,
    wateredTodayIds: [...new Set([...freshState.wateredTodayIds, plantId])],
  };
}

/** Reset quotidien des arrosages (appelé à chaque nouveau jour) */
export function resetDailyWatering(state: WaterBudgetState): WaterBudgetState {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastWateringDate === today) return state;
  return { ...state, wateredTodayIds: [], lastWateringDate: today };
}
