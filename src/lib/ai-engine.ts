// ═══════════════════════════════════════════════════
//  AI Cultivation Engine — Jardin Culture v3
//  Phase 3: Card contacts + combos
//  Phase 4: Weather + real calendar
//  Phase 5: More plants + diseases + pests
//  Phase 6: Real-time calibration (vrai calendrier + botanique réelle)
// ═══════════════════════════════════════════════════

export interface PlantDefinition {
  id: string;
  name: string;
  emoji: string;
  image: string;
  stageDurations: [number, number, number, number]; // jours réels par stade (botanique)
  optimalTemp: [number, number];
  waterNeed: number; // mm/jour réel (évapotranspiration)
  lightNeed: number;
  harvestEmoji: string;
  cropCoefficient: number; // Kc FAO réel
  // Mois de plantation optimaux (0=Jan, 11=Déc) — calendrier réel
  optimalPlantMonths: number[];
  optimalSeasons: string[]; // gardé pour compatibilité
  diseaseResistance: number;
  pestResistance: number;
  droughtResistance: number; // 0.0-1.0 — higher = loses water slower (deep roots)
  // Description botanique réelle
  realDaysToHarvest: number; // durée totale moyenne graine→récolte
}

export type GrowthRoute = 'jardin' | 'miniserre' | 'plantule' | 'semis-direct';
export type ContainerType = 'sachet' | 'mini-pot' | 'pot-serre' | 'sol-jardin' | 'miniserre-slot' | 'pepiniere-slot' | 'sillons';

export interface PlantState {
  plantDefId: string;
  stage: number;
  waterLevel: number;
  health: number;
  growthProgress: number;
  daysSincePlanting: number;
  daysInCurrentStage: number;
  isDead: boolean;
  needsWater: boolean;
  isHarvestable: boolean;
  // Phase 3: combo bonus
  comboBonus: number; // 0 = none, 1 = 1.25x, 2 = 1.5x
  // Phase 5
  hasDisease: boolean;
  hasPest: boolean;
  diseaseDays: number;
  pestDays: number;
  fertilizerBoost: number; // remaining days of fertilizer boost
  fertilizerLevel: number; // 0-100, current fertilizer level
  fruitSetRate: number; // 0-1, pollinator activity modifier for fruit formation
  diseasePressureHours: number; // heures consécutives avec conditions favorables aux maladies
  // Growth route (v0.20.0)
  growthRoute: GrowthRoute;
  containerType: ContainerType;
}

export interface EnvironmentState {
  temperature: number;
  humidity: number;
  sunlightHours: number;
  soilQuality: number;
  soilPH: number;
}

export interface WeatherData {
  type: "sunny" | "cloudy" | "rainy" | "stormy" | "heatwave" | "frost";
  emoji: string;
  label: string;
  tempMod: number;
  waterMod: number;
  lightMod: number;
  growthMod: number;
}

export interface AlertData {
  id: string;
  type: "water" | "health" | "harvest" | "death" | "stage" | "weather" | "combo" | "pest" | "disease" | "season" | "pollinator" | "success";
  message: string;
  emoji: string;
  cellX: number;
  cellY: number;
  timestamp: number;
  severity: "info" | "warning" | "critical";
}

export interface ComboInfo {
  type: string;
  label: string;
  emoji: string;
  bonus: number;
}

// ═══════════════════════════════════════════════════
//  PLANTES — Source unique : plant-db.ts (depuis HologramEvolution)
//  Les données botaniques ne sont PLUS dupliquées ici.
//  Voir src/lib/plant-db.ts pour la construction.
// ═══════════════════════════════════════════════════

export { PLANTS } from './plant-db';


export const STAGE_NAMES = ["Monticule de terre", "Petite plantule", "Plantule 2 feuilles", "Plantule 4 feuilles", "Floraison"];
export const STAGE_EMOJIS = ["", "", "", "", ""];

// Stage images per plant — manga cel-shaded cross-hatching illustrations (6 stades pepiniere)
export const STAGE_IMAGES: Record<string, string[]> = {
  tomato:      ["/plants/tomato-stage-1.png",  "/plants/tomato-stage-2.png",  "/plants/tomato-stage-3.png",  "/plants/tomato-stage-4.png",  "/plants/tomato-stage-5.png"],
  carrot:      ["/plants/carrot-stage-1.png",  "/plants/carrot-stage-2.png",  "/plants/carrot-stage-3.png",  "/plants/carrot-stage-4.png",  "/plants/carrot-stage-5.png"],
  strawberry:  ["/plants/strawberry-stage-1.png",  "/plants/strawberry-stage-2.png",  "/plants/strawberry-stage-3.png",  "/plants/strawberry-stage-4.png",  "/plants/strawberry-stage-5.png"],
  lettuce:     ["/plants/lettuce-stage-1.png", "/plants/lettuce-stage-2.png", "/plants/lettuce-stage-3.png", "/plants/lettuce-stage-4.png", "/plants/lettuce-stage-5.png"],
  basil:       ["/plants/basil-stage-1.png",   "/plants/basil-stage-2.png",   "/plants/basil-stage-3.png",   "/plants/basil-stage-4.png",   "/plants/basil-stage-5.png"],
  pepper:      ["/plants/pepper-stage-1.png",  "/plants/pepper-stage-2.png",  "/plants/pepper-stage-3.png",  "/plants/pepper-stage-4.png",  "/plants/pepper-stage-5.png"],
  goji:        ["/plants/goji-stage-1.png",    "/plants/goji-stage-2.png",    "/plants/goji-stage-3.png",    "/plants/goji-stage-4.png",    "/plants/goji-stage-5.png"],
  lycium:      ["/plants/lycium-stage-1.png",  "/plants/lycium-stage-2.png",  "/plants/lycium-stage-3.png",  "/plants/lycium-stage-4.png",  "/plants/lycium-stage-5.png"],
  mirabellier: ["/plants/mirabellier-stage-1.png", "/plants/mirabellier-stage-2.png", "/plants/mirabellier-stage-3.png", "/plants/mirabellier-stage-4.png", "/plants/mirabellier-stage-5.png"],
  photinia:    ["/plants/photinia-stage-1.png", "/plants/photinia-stage-2.png", "/plants/photinia-stage-3.png", "/plants/photinia-stage-4.png", "/plants/photinia-stage-5.png"],
  eleagnus:    ["/plants/eleagnus-stage-1.png", "/plants/eleagnus-stage-2.png", "/plants/eleagnus-stage-3.png", "/plants/eleagnus-stage-4.png", "/plants/eleagnus-stage-5.png"],
  laurus:      ["/plants/laurus-stage-1.png",   "/plants/laurus-stage-2.png",   "/plants/laurus-stage-3.png",   "/plants/laurus-stage-4.png",   "/plants/laurus-stage-5.png"],
  cornus:      ["/plants/cornus-stage-1.png",   "/plants/cornus-stage-2.png",   "/plants/cornus-stage-3.png",   "/plants/cornus-stage-4.png",   "/plants/cornus-stage-5.png"],
  casseille:   ["/plants/casseille-stage-1.png", "/plants/casseille-stage-2.png", "/plants/casseille-stage-3.png", "/plants/casseille-stage-4.png", "/plants/casseille-stage-5.png"],
  bean:        ["/plants/bean-stage-1.png", "/plants/bean-stage-2.png", "/plants/bean-stage-3.png", "/plants/bean-stage-4.png", "/plants/bean-stage-5.png"],
  squash:      ["/plants/squash-stage-1.png", "/plants/squash-stage-2.png", "/plants/squash-stage-3.png", "/plants/squash-stage-4.png", "/plants/squash-stage-5.png"],
  sunflower:   ["/plants/sunflower-stage-1.png", "/plants/sunflower-stage-2.png", "/plants/sunflower-stage-3.png", "/plants/sunflower-stage-4.png", "/plants/sunflower-stage-5.png"],
  quinoa:      ["/plants/quinoa-stage-1.png", "/plants/quinoa-stage-2.png", "/plants/quinoa-stage-3.png", "/plants/quinoa-stage-4.png", "/plants/quinoa-stage-5.png"],
  amaranth:    ["/plants/amaranth-stage-1.png", "/plants/amaranth-stage-2.png", "/plants/amaranth-stage-3.png", "/plants/amaranth-stage-4.png", "/plants/amaranth-stage-5.png"],
  sorrel:      ["/plants/sorrel-stage-1.png", "/plants/sorrel-stage-2.png", "/plants/sorrel-stage-3.png", "/plants/sorrel-stage-4.png", "/plants/sorrel-stage-5.png"],
  corn:        ["/plants/corn-stage-1.png", "/plants/corn-stage-2.png", "/plants/corn-stage-3.png", "/plants/corn-stage-4.png", "/plants/corn-stage-5.png"],
};

export const ENVIRONMENTS: Record<
  string,
  { name: string; emoji: string; image: string; tempMod: number; humidMod: number; lightMod: number; soilMod: number }
> = {
  indoor_planter: {
    name: "Chambre de Culture", emoji: "🏠", image: "/cards/card-planter.png",
    tempMod: 1.0, humidMod: 0.9, lightMod: 0.6, soilMod: 0.9,
  },
  greenhouse: {
    name: "Serre", emoji: "🏡", image: "/cards/card-greenhouse.png",
    tempMod: 1.2, humidMod: 0.95, lightMod: 0.85, soilMod: 1.0,
  },
  garden: {
    name: "Jardin", emoji: "🌳", image: "/cards/card-garden.png",
    tempMod: 0.8, humidMod: 0.7, lightMod: 1.0, soilMod: 1.1,
  },
};

// ═══════════════════════════════════════════════════
//  PLANT SPACING — Réaliste (agriculture française)
//  Sources: INRAE, filières maraîchage, GEVES
// ═══════════════════════════════════════════════════

export interface PlantSpacingInfo {
  /** Distance entre plants sur la même ligne (cm) */
  plantSpacingCm: number;
  /** Distance entre lignes (cm) */
  rowSpacingCm: number;
  /** Couleur visuelle pour le jardin */
  color: string;
  /** Label descriptif */
  label: string;
}

export const PLANT_SPACING: Record<string, PlantSpacingInfo> = {
  tomato:     { plantSpacingCm: 50, rowSpacingCm: 70, color: '#dc2626', label: '50×70cm' },
  carrot:     { plantSpacingCm: 5,  rowSpacingCm: 25, color: '#ea580c', label: '5×25cm' },
  strawberry: { plantSpacingCm: 30, rowSpacingCm: 60, color: '#db2777', label: '30×60cm' },
  lettuce:    { plantSpacingCm: 25, rowSpacingCm: 30, color: '#16a34a', label: '25×30cm' },
  basil:      { plantSpacingCm: 20, rowSpacingCm: 35, color: '#65a30d', label: '20×35cm' },
  pepper:     { plantSpacingCm: 40, rowSpacingCm: 55, color: '#ca8a04', label: '40×55cm' },
  cucumber:   { plantSpacingCm: 40, rowSpacingCm: 100, color: '#16a34a', label: '40×100cm' },
  zucchini:   { plantSpacingCm: 60, rowSpacingCm: 100, color: '#65a30d', label: '60×100cm' },
  melon:      { plantSpacingCm: 50, rowSpacingCm: 100, color: '#f59e0b', label: '50×100cm' },
  spinach:    { plantSpacingCm: 15, rowSpacingCm: 25, color: '#22c55e', label: '15×25cm' },
  radish:     { plantSpacingCm: 5, rowSpacingCm: 20, color: '#ef4444', label: '5×20cm' },
  parsley:    { plantSpacingCm: 15, rowSpacingCm: 25, color: '#4ade80', label: '15×25cm' },
  photinia:   { plantSpacingCm: 80, rowSpacingCm: 100, color: '#dc2626', label: '80×100cm' },
  eleagnus:   { plantSpacingCm: 80, rowSpacingCm: 100, color: '#a3a3a3', label: '80×100cm' },
  laurus:     { plantSpacingCm: 60, rowSpacingCm: 80, color: '#166534', label: '60×80cm' },
  cornus:     { plantSpacingCm: 80, rowSpacingCm: 100, color: '#dc2626', label: '80×100cm' },
  casseille:  { plantSpacingCm: 60, rowSpacingCm: 80, color: '#581c87', label: '60×80cm' },
  bean:       { plantSpacingCm: 10, rowSpacingCm: 40, color: '#8B4513', label: '10×40cm' },
  squash:     { plantSpacingCm: 100, rowSpacingCm: 150, color: '#f97316', label: '100×150cm' },
  sunflower:  { plantSpacingCm: 30, rowSpacingCm: 50, color: '#eab308', label: '30×50cm' },
  quinoa:     { plantSpacingCm: 20, rowSpacingCm: 40, color: '#a3a3a3', label: '20×40cm' },
  amaranth:   { plantSpacingCm: 25, rowSpacingCm: 50, color: '#dc2626', label: '25×50cm' },
  sorrel:     { plantSpacingCm: 20, rowSpacingCm: 30, color: '#22c55e', label: '20×30cm' },
  corn:       { plantSpacingCm: 30, rowSpacingCm: 75, color: '#eab308', label: '30×75cm' },
};

// ═══════════════════════════════════════════════════
//  PHASE 4: WEATHER SYSTEM
// ═══════════════════════════════════════════════════

export const WEATHER_TYPES: Record<string, WeatherData> = {
  sunny: { type: "sunny", emoji: "☀️", label: "Ensoleillé", tempMod: 1.1, waterMod: 1.3, lightMod: 1.3, growthMod: 1.1 },
  cloudy: { type: "cloudy", emoji: "⛅", label: "Nuageux", tempMod: 0.9, waterMod: 0.8, lightMod: 0.6, growthMod: 0.85 },
  rainy: { type: "rainy", emoji: "🌧️", label: "Pluvieux", tempMod: 0.85, waterMod: 0.3, lightMod: 0.4, growthMod: 0.9 },
  stormy: { type: "stormy", emoji: "⛈️", label: "Orageux", tempMod: 0.8, waterMod: 0.1, lightMod: 0.2, growthMod: 0.6 },
  heatwave: { type: "heatwave", emoji: "🔥", label: "Canicule", tempMod: 1.4, waterMod: 1.6, lightMod: 1.2, growthMod: 0.7 },
  frost: { type: "frost", emoji: "🥶", label: "Gel", tempMod: 0.4, waterMod: 0.7, lightMod: 0.7, growthMod: 0.3 },
};

function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[0][0];
}

// ═══════════════════════════════════════════════════
//  CALENDRIER RÉEL — France métropolitaine (hémisphère nord)
// ═══════════════════════════════════════════════════

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MONTH_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Jour de l'année (1-366) à partir d'une Date */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1); // 1er janvier
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000) + 1; // +1 : 1er jan = jour 1
}

/** Jour de l'année d'aujourd'hui */
export function getTodayDayOfYear(): number {
  return getDayOfYear(new Date());
}

/** Numéro du mois (0-11) à partir du jour de l'année */
export function getMonthFromDay(dayOfYear: number): number {
  let d = ((dayOfYear - 1) % 365 + 365) % 365; // normaliser 1-365
  for (let m = 0; m < 12; m++) {
    if (d < DAYS_IN_MONTH[m]) return m;
    d -= DAYS_IN_MONTH[m];
  }
  return 11;
}

/** Jour du mois (1-31) à partir du jour de l'année */
function getDayOfMonth(dayOfYear: number): number {
  let d = ((dayOfYear - 1) % 365 + 365) % 365;
  for (let m = 0; m < 12; m++) {
    if (d < DAYS_IN_MONTH[m]) return d + 1;
    d -= DAYS_IN_MONTH[m];
  }
  return 31;
}

/** Date affichable : "31 Mars" */
export function getRealDateDisplay(dayOfYear: number): string {
  const month = getMonthFromDay(dayOfYear);
  const day = getDayOfMonth(dayOfYear);
  return `${day} ${MONTH_SHORT[month]}`;
}

/** Date complète : "31 Mars 2026" */
export function getRealDateFull(dayOfYear: number): string {
  const month = getMonthFromDay(dayOfYear);
  const day = getDayOfMonth(dayOfYear);
  return `${day} ${MONTH_NAMES[month]} ${new Date().getFullYear()}`;
}

/** Mois actuel (0-11) */
export function getCurrentMonth(): number {
  return new Date().getMonth();
}

/** Année actuelle */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// ═══════════════════════════════════════════════════
//  ENVIRONNEMENT RÉEL PAR MOIS — France métropolitaine
//  Données Météo-France / INRAE moyennes mensuelles
// ═══════════════════════════════════════════════════
// température (°C), humidité (%), ensoleillement (h/jour), qualité sol (%)

const MONTHLY_ENV: EnvironmentState[] = [
  { temperature: 4,  humidity: 85, sunlightHours: 2.5, soilQuality: 40, soilPH: 6.8 }, // Jan
  { temperature: 6,  humidity: 80, sunlightHours: 3.5, soilQuality: 42, soilPH: 6.7 }, // Fév
  { temperature: 10, humidity: 72, sunlightHours: 5.5, soilQuality: 55, soilPH: 6.6 }, // Mar
  { temperature: 13, humidity: 65, sunlightHours: 7.0, soilQuality: 65, soilPH: 6.5 }, // Avr
  { temperature: 17, humidity: 58, sunlightHours: 8.5, soilQuality: 72, soilPH: 6.4 }, // Mai
  { temperature: 21, humidity: 52, sunlightHours: 10.0, soilQuality: 78, soilPH: 6.3 }, // Juin
  { temperature: 24, humidity: 48, sunlightHours: 11.0, soilQuality: 80, soilPH: 6.2 }, // Juil
  { temperature: 23, humidity: 52, sunlightHours: 10.0, soilQuality: 78, soilPH: 6.3 }, // Août
  { temperature: 19, humidity: 62, sunlightHours: 7.5, soilQuality: 70, soilPH: 6.5 }, // Sep
  { temperature: 14, humidity: 72, sunlightHours: 5.0, soilQuality: 60, soilPH: 6.6 }, // Oct
  { temperature: 8,  humidity: 82, sunlightHours: 3.0, soilQuality: 48, soilPH: 6.7 }, // Nov
  { temperature: 5,  humidity: 87, sunlightHours: 2.0, soilQuality: 42, soilPH: 6.8 }, // Déc
];

/** Environnement basé sur le mois réel */
export function getEnvironmentForMonth(month: number): EnvironmentState {
  return { ...MONTHLY_ENV[((month % 12) + 12) % 12] };
}

/** Variabilité journalière ±3°C sur la température */
export function getEnvironmentWithDailyVariation(baseEnv: EnvironmentState): EnvironmentState {
  const tempVar = (Math.random() - 0.5) * 6; // ±3°C
  const humidVar = (Math.random() - 0.5) * 10; // ±5%
  const lightVar = (Math.random() - 0.5) * 2; // ±1h
  return {
    ...baseEnv,
    temperature: Math.round((baseEnv.temperature + tempVar) * 10) / 10,
    humidity: Math.max(20, Math.min(100, Math.round(baseEnv.humidity + humidVar))),
    sunlightHours: Math.max(0, Math.min(16, +(baseEnv.sunlightHours + lightVar).toFixed(1))),
  };
}

// ═══════════════════════════════════════════════════
//  MÉTÉO RÉELLE PAR MOIS — Probabilités France
// ═══════════════════════════════════════════════════

const MONTHLY_WEATHER_WEIGHTS: Record<string, number>[] = [
  // Jan: hiver doux, pluie fréquente
  { sunny: 10, cloudy: 30, rainy: 30, stormy: 5, heatwave: 0, frost: 25 },
  // Fév: encore froid, un peu plus de soleil
  { sunny: 15, cloudy: 30, rainy: 25, stormy: 5, heatwave: 0, frost: 25 },
  // Mar: transition printemps
  { sunny: 25, cloudy: 30, rainy: 25, stormy: 8, heatwave: 0, frost: 12 },
  // Avr: printemps, giboulées
  { sunny: 30, cloudy: 28, rainy: 22, stormy: 10, heatwave: 0, frost: 10 },
  // Mai: beau, orages possibles
  { sunny: 35, cloudy: 25, rainy: 18, stormy: 12, heatwave: 0, frost: 10 },
  // Juin: été, premiers orages
  { sunny: 45, cloudy: 15, rainy: 12, stormy: 15, heatwave: 8, frost: 5 },
  // Juil: canicule possible
  { sunny: 50, cloudy: 12, rainy: 8, stormy: 10, heatwave: 18, frost: 2 },
  // Août: canicule + orages
  { sunny: 48, cloudy: 14, rainy: 10, stormy: 12, heatwave: 14, frost: 2 },
  // Sep: retour de la pluie
  { sunny: 35, cloudy: 22, rainy: 22, stormy: 10, heatwave: 3, frost: 8 },
  // Oct: automne humide
  { sunny: 20, cloudy: 30, rainy: 30, stormy: 10, heatwave: 0, frost: 10 },
  // Nov: pluie, vent, premiers froids
  { sunny: 12, cloudy: 32, rainy: 32, stormy: 8, heatwave: 0, frost: 16 },
  // Déc: hiver, gel fréquent
  { sunny: 10, cloudy: 28, rainy: 28, stormy: 5, heatwave: 0, frost: 29 },
];

export function generateWeatherForMonth(month: number): WeatherData {
  const weights = MONTHLY_WEATHER_WEIGHTS[((month % 12) + 12) % 12];
  const wType = weightedRandom(weights);
  return WEATHER_TYPES[wType];
}

/** Compatibilité : génère météo à partir de la saison (utilisé par game-store init) */
export function generateWeather(season: string): WeatherData {
  const seasonToMonth: Record<string, number> = {
    winter: 0, spring: 3, summer: 6, autumn: 9,
  };
  return generateWeatherForMonth(seasonToMonth[season] ?? 3);
}

export function getSeasonalPlantingAdvice(season: string): string {
  switch (season) {
    case "spring":
      return "🌱 Printemps : idéal pour semer tomates, carottes, fraises, salades";
    case "summer":
      return "☀️ Été : temps des bassins et basilic, surveillez l'arrosage !";
    case "autumn":
      return "🍂 Automne : récoltez, semez carottes et salades d'hiver";
    case "winter":
      return "❄️ Hiver : dormance des cultures, préparez le sol pour le printemps";
    default:
      return "";
  }
}

// ═══════════════════════════════════════════════════
//  PHASE 3: COMBO SYSTEM
// ═══════════════════════════════════════════════════

export function detectCombos(adjacentCards: { type: string; subType: string }[]): ComboInfo[] {
  const combos: ComboInfo[] = [];
  const types = adjacentCards.map((c) => c.type);
  const subTypes = adjacentCards.map((c) => c.subType);

  // Combo: Water + Soil + Light = Full Care (+50% growth)
  if (types.includes("action") && types.includes("resource") && subTypes.includes("soil") && subTypes.includes("light")) {
    combos.push({ type: "full_care", label: "Soin Complet", emoji: "✨", bonus: 0.5 });
  }
  // Combo: Soil + Plant = Rich Earth (+25% growth)
  if (subTypes.includes("soil") && types.includes("plant")) {
    combos.push({ type: "rich_earth", label: "Terre Riche", emoji: "🌍", bonus: 0.25 });
  }
  // Combo: Light + Greenhouse = Optimized Light (+20% growth)
  if (subTypes.includes("light") && adjacentCards.some((c) => c.subType === "greenhouse")) {
    combos.push({ type: "optimized_light", label: "Lumière Optimisée", emoji: "💡", bonus: 0.2 });
  }

  return combos;
}

export function getComboBonusText(comboLevel: number): string {
  switch (comboLevel) {
    case 0: return "";
    case 1: return "+25% 🌍";
    case 2: return "+50% ✨";
    default: return "+50% ✨";
  }
}

// ═══════════════════════════════════════════════════
//  CORE AI CALCULATIONS
// ═══════════════════════════════════════════════════

export function calculateEvapotranspiration(
  baseTemp: number,
  sunlightHours: number,
  cropCoefficient: number
): number {
  const tempFactor = Math.max(0, (baseTemp - 10) / 20);
  const lightFactor = sunlightHours / 12;
  const baseET = 3.5;
  return baseET * tempFactor * lightFactor * cropCoefficient;
}

export function calculateWaterNeed(plant: PlantDefinition, env: EnvironmentState, weather: WeatherData): number {
  const ET = calculateEvapotranspiration(env.temperature, env.sunlightHours, plant.cropCoefficient);
  const droughtFactor = 1.0 - (plant.droughtResistance || 0.5) * 0.6;
  // Réaliste: une tomate adulte consomme ~3-4L/semaine, soit ~0.5L/jour
  // Le waterLevel est un pourcentage (0-100), perte ~3-5%/jour en été
  return Math.min(20, ET * 1.5 * weather.waterMod * droughtFactor);
}

export function calculateGrowthRate(
  plant: PlantDefinition,
  env: EnvironmentState,
  waterLevel: number,
  comboBonus: number,
  weather: WeatherData,
  season: string,
  hasDisease: boolean,
  hasPest: boolean,
  fertilizerBoost: number
): number {
  // Temperature factor
  const [tMin, tMax] = plant.optimalTemp;
  let tempFactor = 0;
  if (env.temperature >= tMin && env.temperature <= tMax) {
    tempFactor = 1;
  } else if (env.temperature < tMin) {
    tempFactor = Math.max(0, 1 - (tMin - env.temperature) / 15);
  } else {
    tempFactor = Math.max(0, 1 - (env.temperature - tMax) / 15);
  }

  // Water factor
  const waterFactor = waterLevel > 70 ? 1 : waterLevel > 30 ? 0.5 : 0.1;

  // Light factor
  const lightFactor = Math.min(1, env.sunlightHours / plant.lightNeed);

  // Soil factor
  const soilFactor = env.soilQuality / 100;

  // Phase 4: Season factor
  const seasonFactor = plant.optimalSeasons.includes(season) ? 1.0 : 0.5;

  // Phase 3: Combo bonus
  const comboFactor = 1 + comboBonus;

  // Phase 4: Weather growth modifier
  const weatherFactor = weather.growthMod;

  // Phase 5: Disease/pest penalty
  const diseasePenalty = hasDisease ? 0.3 : 1.0;
  const pestPenalty = hasPest ? 0.4 : 1.0;

  // Phase 5: Fertilizer boost
  const fertFactor = fertilizerBoost > 0 ? 1.3 : 1.0;

  return tempFactor * waterFactor * lightFactor * soilFactor * seasonFactor *
         comboFactor * weatherFactor * diseasePenalty * pestPenalty * fertFactor;
}

export function simulateDay(
  plantDef: PlantDefinition,
  state: PlantState,
  env: EnvironmentState,
  weather: WeatherData,
  season: string,
  comboBonus: number
): { newState: PlantState; alerts: AlertData[]; cellX: number; cellY: number } {
  // Plants never die — isDead always false in new simulation
  const alerts: AlertData[] = [];
  let newState = { ...state };

  // ── Water consumption (modified by weather) ──
  const dailyWaterLoss = calculateWaterNeed(plantDef, env, weather);
  // Rain reduces water loss
  if (weather.type === "rainy" || weather.type === "stormy") {
    newState.waterLevel = Math.min(100, newState.waterLevel + 8);
  }
  newState.waterLevel = Math.max(0, newState.waterLevel - dailyWaterLoss);

  // Water alert
  if (newState.waterLevel < 20 && !newState.needsWater) {
    newState.needsWater = true;
    alerts.push({
      id: `water-${Date.now()}-${Math.random()}`,
      type: "water",
      message: `${plantDef.emoji} ${plantDef.name} a besoin d'eau ! (${Math.round(newState.waterLevel)}%)`,
      emoji: "💧", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }
  if (newState.waterLevel >= 30) newState.needsWater = false;

  // ── Health ──
  if (newState.waterLevel < 10) {
    newState.health = Math.max(0, newState.health - 15);
    alerts.push({
      id: `health-${Date.now()}-${Math.random()}`,
      type: "health",
      message: `${plantDef.emoji} ${plantDef.name} se fane ! Santé: ${Math.round(newState.health)}%`,
      emoji: "⚠️", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  } else if (newState.waterLevel > 90) {
    // Overwatering
    newState.health = Math.max(0, newState.health - 3);
  } else if (newState.waterLevel < 30) {
    newState.health = Math.max(0, newState.health - 5);
  } else {
    newState.health = Math.min(100, newState.health + 2);
  }

  // ── Phase 5: Disease ──
  if (newState.hasDisease) {
    newState.diseaseDays++;
    newState.health = Math.max(0, newState.health - 8);
    if (newState.diseaseDays > 10 && Math.random() < 0.15) {
      // May recover
      if (Math.random() < plantDef.diseaseResistance / 200) {
        newState.hasDisease = false;
        newState.diseaseDays = 0;
        alerts.push({
          id: `disease-cure-${Date.now()}`,
          type: "disease",
          message: `${plantDef.emoji} ${plantDef.name} s'est remise de sa maladie !`,
          emoji: "💚", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
        });
      }
    }
    if (newState.diseaseDays > 5) {
      alerts.push({
        id: `disease-${Date.now()}-${Math.random()}`,
        type: "disease",
        message: `🦠 ${plantDef.name} souffre d'une maladie ! Santé: ${Math.round(newState.health)}%`,
        emoji: "🦠", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
      });
    }
  } else {
    // Random disease chance (higher in humid weather, much lower indoor)
    // Default to outdoor (garden) factor for backward compatibility
    const indoorFactor = 0.1; // Lower disease risk indoors (pepiniere/serre)
    // Maladies : rare en conditions normales, plus fréquentes par temps humide
    // Réaliste : mildiou apparaît tous les 2-3 semaines en conditions favorables
    const diseaseChance = weather.type === "rainy" ? 0.008 : weather.type === "stormy" ? 0.015 : 0.002;
    if (Math.random() < diseaseChance * indoorFactor && newState.stage > 0) {
      const resistance = plantDef.diseaseResistance / 100;
      if (Math.random() > resistance) {
        newState.hasDisease = true;
        newState.diseaseDays = 1;
        alerts.push({
          id: `disease-new-${Date.now()}`,
          type: "disease",
          message: `🦠 Maladie détectée sur ${plantDef.emoji} ${plantDef.name} !`,
          emoji: "🦠", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
        });
      }
    }
  }

  // ── Phase 5: Pest ──
  if (newState.hasPest) {
    newState.pestDays++;
    newState.health = Math.max(0, newState.health - 6);
    newState.growthProgress = Math.max(0, newState.growthProgress - 2);
    if (newState.pestDays > 8 && Math.random() < 0.15) {
      if (Math.random() < plantDef.pestResistance / 200) {
        newState.hasPest = false;
        newState.pestDays = 0;
        alerts.push({
          id: `pest-gone-${Date.now()}`,
          type: "pest",
          message: `🐛 Les ravageurs ont quitté ${plantDef.name} !`,
          emoji: "✅", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
        });
      }
    }
    if (newState.pestDays > 4) {
      alerts.push({
        id: `pest-${Date.now()}-${Math.random()}`,
        type: "pest",
        message: `🐛 Ravageurs sur ${plantDef.emoji} ${plantDef.name} ! (-6 santé/jour)`,
        emoji: "🐛", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
      });
    }
  } else {
    const indoorFactor = 0.15; // Lower pest risk indoors
    // Parasites : pucerons plus fréquents en été, aleurodes en serre
    // Réaliste : attaque tous les 3-4 semaines en été
    const pestChance = season === "summer" ? 0.008 : 0.003;
    if (Math.random() < pestChance * indoorFactor && newState.stage >= 1) {
      const resistance = plantDef.pestResistance / 100;
      if (Math.random() > resistance) {
        newState.hasPest = true;
        newState.pestDays = 1;
        alerts.push({
          id: `pest-new-${Date.now()}`,
          type: "pest",
          message: `🐛 Ravageurs attaquent ${plantDef.emoji} ${plantDef.name} !`,
          emoji: "🐛", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
        });
      }
    }
  }

  // ── Fertilizer countdown ──
  if (newState.fertilizerBoost > 0) {
    newState.fertilizerBoost--;
  }

  // ── Frost damage ──
  if (weather.type === "frost" && newState.stage < 2) {
    newState.health = Math.max(0, newState.health - 20);
    alerts.push({
      id: `frost-${Date.now()}-${Math.random()}`,
      type: "weather",
      message: `🥶 Gel ! ${plantDef.emoji} ${plantDef.name} souffre (-20 santé)`,
      emoji: "🥶", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }

  // Heatwave damage
  if (weather.type === "heatwave" && newState.waterLevel < 40) {
    newState.health = Math.max(0, newState.health - 10);
    alerts.push({
      id: `heat-${Date.now()}-${Math.random()}`,
      type: "weather",
      message: `🔥 Canicule ! ${plantDef.emoji} ${plantDef.name} brûle (-10 santé)`,
      emoji: "🔥", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }

  // ── Survival mode: plants never die ──
  if (newState.health <= 0) {
    newState.health = 5; // Clamp to minimum 5%
    alerts.push({
      id: `survie-${Date.now()}-${Math.random()}`,
      type: "health",
      message: `⚠️ ${plantDef.name} est en survie ! Conditions à améliorer.`,
      emoji: "⚠️", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }

  // ── Growth (stunted when health <= 5) ──
  let growthRate: number;
  if (newState.health <= 5) {
    // Stunted: no growth, no water consumption
    growthRate = 0;
    // Slow recovery when conditions improve (water > 30% AND no disease AND no pest)
    if (newState.waterLevel > 30 && !newState.hasDisease && !newState.hasPest) {
      newState.health = Math.min(20, newState.health + 1);
    }
  } else {
    growthRate = calculateGrowthRate(
      plantDef, env, newState.waterLevel,
      comboBonus, weather, season,
      newState.hasDisease, newState.hasPest,
      newState.fertilizerBoost
    );
  }

  // Combo level tracking
  newState.comboBonus = comboBonus;

  const stageDays = plantDef.stageDurations[newState.stage];
  const dailyGrowth = (100 / stageDays) * growthRate;
  newState.growthProgress = Math.min(100, newState.growthProgress + dailyGrowth);
  newState.daysSincePlanting++;
  newState.daysInCurrentStage++;

  // Stage advancement
  if (newState.growthProgress >= 100 && newState.stage < 3) {
    newState.stage++;
    newState.growthProgress = 0;
    newState.daysInCurrentStage = 0;
    alerts.push({
      id: `stage-${Date.now()}-${Math.random()}`,
      type: "stage",
      message: `${plantDef.emoji} ${plantDef.name} → ${STAGE_NAMES[newState.stage]} ! ${STAGE_EMOJIS[newState.stage]}`,
      emoji: STAGE_EMOJIS[newState.stage], cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
    });
  }

  // Harvestable
  if (newState.stage === 3 && newState.growthProgress >= 90 && !newState.isHarvestable) {
    newState.isHarvestable = true;
    alerts.push({
      id: `harvest-${Date.now()}-${Math.random()}`,
      type: "harvest",
      message: `${plantDef.harvestEmoji} ${plantDef.name} est prête à récolter !`,
      emoji: plantDef.harvestEmoji, cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
    });
  }

  return { newState, alerts, cellX: 0, cellY: 0 };
}

// ── ACTIONS ──

export function applyWatering(state: PlantState): PlantState {
  return {
    ...state,
    waterLevel: Math.min(100, state.waterLevel + 40),
    needsWater: false,
  };
}

export function applyFertilizer(state: PlantState): PlantState {
  return {
    ...state,
    fertilizerBoost: 7, // 7 days of boosted growth
  };
}

export function applyTreatment(state: PlantState): PlantState {
  return {
    ...state,
    hasDisease: false,
    hasPest: false,
    diseaseDays: 0,
    pestDays: 0,
    health: Math.min(100, state.health + 15),
  };
}

export function createInitialPlantState(plantDefId: string): PlantState {
  return {
    plantDefId,
    stage: 0, waterLevel: 80, health: 100, growthProgress: 0,
    daysSincePlanting: 0, daysInCurrentStage: 0,
    isDead: false, needsWater: false, isHarvestable: false,
    comboBonus: 0, hasDisease: false, hasPest: false,
    diseaseDays: 0, pestDays: 0, fertilizerBoost: 0,
    fertilizerLevel: 50,
    fruitSetRate: 1.0,
    diseasePressureHours: 0,
    growthRoute: 'jardin',
    containerType: 'sachet',
  };
}

export function createPlantuleState(plantDefId: string): PlantState {
  return {
    ...createInitialPlantState(plantDefId),
    growthRoute: 'plantule',
    containerType: 'mini-pot',
    stage: 1,
    growthProgress: 60,
    daysSincePlanting: 20,
    daysInCurrentStage: 10,
  };
}

export function createMiniserreRouteState(plantDefId: string): PlantState {
  return {
    ...createInitialPlantState(plantDefId),
    growthRoute: 'miniserre',
    containerType: 'miniserre-slot',
  };
}

// Plantes qui se sèment directement en terre (pas de repiquage)
const SEMIS_DIRECT_PLANTS = new Set([
  'radish', 'carrot', 'turnip', 'bean', 'pea', 'spinach', 'beet',
  'lentil', 'chickpea', 'faba', 'parsley', 'dill', 'coriander',
]);

export function createSemisDirectState(plantDefId: string): PlantState {
  return {
    ...createInitialPlantState(plantDefId),
    growthRoute: 'semis-direct',
    containerType: 'sillons',
  };
}

export function getDefaultGrowthRoute(plantDefId: string): GrowthRoute {
  if (SEMIS_DIRECT_PLANTS.has(plantDefId)) return 'semis-direct';
  return 'jardin';
}

// ── SEASONS & ENVIRONMENT — calendrier réel ──

/** @deprecated utiliser getEnvironmentForMonth() */
export function getEnvironmentForSeason(season: string): EnvironmentState {
  const seasonToMonth: Record<string, number> = { winter: 0, spring: 3, summer: 6, autumn: 9 };
  return getEnvironmentForMonth(seasonToMonth[season] ?? 3);
}

export function getSeason(dayOfYear: number): string {
  const month = getMonthFromDay(dayOfYear);
  if (month <= 1 || month === 11) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "autumn";
}

export function getSeasonEmoji(season: string): string {
  switch (season) {
    case "spring": return "🌸";
    case "summer": return "☀️";
    case "autumn": return "🍂";
    case "winter": return "❄️";
    default: return "📅";
  }
}

export function getSeasonLabel(season: string): string {
  switch (season) {
    case "spring": return "Printemps";
    case "summer": return "Été";
    case "autumn": return "Automne";
    case "winter": return "Hiver";
    default: return season;
  }
}

export function getDayDate(day: number): string {
  return getRealDateDisplay(day);
}

// ═══ Frost Calendar ═══

/**
 * Returns approximate last frost date advice for France.
 * Last frost typically: late March (south) to mid-April (north).
 */
export function getLastFrostDate(): string {
  const month = getCurrentMonth();
  if (month >= 4) {
    // April onwards: frost risk is minimal
    return "Plantation au jardin possible — risque de gel minime 🌱";
  } else if (month === 3) {
    // March: transitional, risk remains
    return "⚠️ Mars — risques de gelées tardives, attendez mi-avril pour le jardin";
  } else {
    // Jan-Feb: too cold for outdoor planting
    return "❄️ Tôt dans la saison — démarrage en Pépinière recommandé";
  }
}

/**
 * Returns true if current month is safe for outdoor transplantation (>= April).
 */
export function isTransplantSeason(): boolean {
  return getCurrentMonth() >= 3; // April onwards (month is 0-indexed)
}

// ═══════════════════════════════════════════════════
//  PHASE 7: REAL WEATHER SIMULATION
// ═══════════════════════════════════════════════════

export interface RealWeatherParams {
  temperature: number;       // effective temperature after zone modifier
  humidity: number;          // effective humidity after zone modifier
  sunlightHours: number;     // effective sunlight after zone modifier
  precipitation: number;     // mm of rain today (after zone modifier)
  windSpeed: number;         // km/h
  uvIndex: number;           // UV index
  gameWeather: WeatherData;  // the game-converted weather type
  soilQuality: number;
}

/**
 * Simulate one day using REAL weather data instead of synthetic seasonal data.
 * This is the new recommended simulation function.
 */
// ═══════════════════════════════════════════════════════════════
//  POLLINATOR ACTIVITY — Abeilles & insects réels
// ═══════════════════════════════════════════════════════════════

/**
 * Calcule l'activité des pollinisateurs (abeilles, bourdons, etc.)
 * basée sur les conditions météo réelles.
 *
 * Les insectes ne volent pas :
 * - Si T° < 12°C (trop froid)
 * - Si vent > 20 km/h (trop venteux)
 * - Sous la pluie
 *
 * Source : biologie entomologique, observations INRAE
 */
export function getPollinatorActivity(
  temperature: number,
  windSpeed: number,
  isRaining: boolean
): number {
  if (temperature < 12) return 0.1;  // T° trop froide
  if (temperature < 15) return 0.3;  // T° fraîche, activité réduite
  if (windSpeed > 25) return 0.2;     // Vent trop fort
  if (windSpeed > 20) return 0.4;    // Vent modéré
  if (isRaining) return 0.1;        // Pluie = pas de vol
  if (temperature > 30) return 0.6; // Chaleur forte, activité réduite
  return 1.0;                          // Conditions optimales
}

/**
 * Plantes qui dépendent des pollinisateurs pour la nouaison
 * (fleurs → fruits). Certaines plantes sont autogames.
 */
const POLLINATOR_DEPENDENT: Set<string> = new Set([
  'tomato',   // Autogame mais mejor nouaison avec vibration
  'pepper',   // Autogame
  'eggplant', // Autogame
  'cucumber', // Nécessite pollinisation
  'zucchini', // Nécessite pollinisation (courge)
  'bean',     // Autogame
  'pea',      // Autogame
  'strawberry', // Parciallement autogame
  'cabbage',  // nécessite pollinisation
]);

/**
 * Retourne true si la plante a besoin de pollinisateurs
 * lorsuq'elle est en phase de floraison.
 */
export function needsPollinators(plantDefId: string): boolean {
  return POLLINATOR_DEPENDENT.has(plantDefId);
}

// ═══════════════════════════════════════════════════════════════
//  REAL WEATHER SIMULATION
// ═══════════════════════════════════════════════════════════════

export function simulateDayWithRealWeather(
  plantDef: PlantDefinition,
  state: PlantState,
  realWeather: RealWeatherParams,
  zoneId: string,
  comboBonus: number
): { newState: PlantState; alerts: AlertData[] } {
  // Plants never die — isDead always false in new simulation
  const alerts: AlertData[] = [];
  let newState = { ...state };

  // Build environment from real weather
  const env: EnvironmentState = {
    temperature: realWeather.temperature,
    humidity: realWeather.humidity,
    sunlightHours: realWeather.sunlightHours,
    soilQuality: realWeather.soilQuality,
    soilPH: 6.5,
  };

  const weather = realWeather.gameWeather;

  // ── Rain-based watering (ONLY Jardin — Serre & Chambre de Culture sont à l'intérieur) ──
  if (realWeather.precipitation > 0 && zoneId === "garden") {
    // Roughly: 1mm rain ≈ 1L/m², convert to water level percentage
    // A good rain of 5mm gives ~5% water, up to a max boost of 30%
    const rainWater = Math.min(30, realWeather.precipitation * 3);
    newState.waterLevel = Math.min(100, newState.waterLevel + rainWater);
  }

  // ── Water consumption based on evapotranspiration + drought resistance ──
  const ET = calculateEvapotranspiration(env.temperature, env.sunlightHours, plantDef.cropCoefficient);
  // Indoor zones (pepiniere, chambre) lose water much slower
  const zoneMultiplier = (zoneId === "garden") ? 1.0 : 0.3;
  // Plants with deep roots (high droughtResistance) lose water more slowly
  const droughtFactor = 1.0 - (plantDef.droughtResistance || 0.5) * 0.6; // 0.55 for drought-resistant, 0.85 for sensitive
  const dailyWaterLoss = Math.min(15, ET * 1.0 * weather.waterMod * zoneMultiplier * droughtFactor);
  newState.waterLevel = Math.max(0, newState.waterLevel - dailyWaterLoss);

  // Water alert
  if (newState.waterLevel < 20 && !newState.needsWater) {
    newState.needsWater = true;
    alerts.push({
      id: `water-${Date.now()}-${Math.random()}`,
      type: "water",
      message: `${plantDef.emoji} ${plantDef.name} a besoin d'eau ! (${Math.round(newState.waterLevel)}%)`,
      emoji: "💧", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }
  if (newState.waterLevel >= 30) newState.needsWater = false;

  // ── Health ──
  if (newState.waterLevel < 10) {
    newState.health = Math.max(0, newState.health - 15);
    alerts.push({
      id: `health-${Date.now()}-${Math.random()}`,
      type: "health",
      message: `${plantDef.emoji} ${plantDef.name} se fane ! Santé: ${Math.round(newState.health)}%`,
      emoji: "⚠️", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  } else if (newState.waterLevel > 90) {
    // Sur-arrosage : perte de santé + risque maladies
    newState.health = Math.max(0, newState.health - 3);
    // En intérieur (Serre / Chambre de Culture), l'excès d'eau est dangereux
    if (zoneId !== "garden") {
      alerts.push({
        id: `overwater-${Date.now()}-${Math.random()}`,
        type: "health",
        message: `⚠️ Excès d'eau en ${zoneId === "greenhouse" ? "Serre" : "Chambre de Culture"} ! Risque de pourriture et moisissures.`,
        emoji: "💧", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
      });
    }
  } else if (newState.waterLevel < 30) {
    newState.health = Math.max(0, newState.health - 5);
  } else {
    newState.health = Math.min(100, newState.health + 2);
  }

  // ── Disease (higher chance in humid/rainy real weather) ──
  if (newState.hasDisease) {
    newState.diseaseDays++;
    newState.health = Math.max(0, newState.health - 8);
    if (newState.diseaseDays > 10 && Math.random() < 0.15) {
      if (Math.random() < plantDef.diseaseResistance / 200) {
        newState.hasDisease = false;
        newState.diseaseDays = 0;
        alerts.push({
          id: `disease-cure-${Date.now()}`,
          type: "disease",
          message: `${plantDef.emoji} ${plantDef.name} s'est remise de sa maladie !`,
          emoji: "💚", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
        });
      }
    }
    if (newState.diseaseDays > 5) {
      alerts.push({
        id: `disease-${Date.now()}-${Math.random()}`,
        type: "disease",
        message: `🦠 ${plantDef.name} souffre d'une maladie ! Santé: ${Math.round(newState.health)}%`,
        emoji: "🦠", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
      });
    }
  } else {
    // Disease probability — very low in indoor controlled environments (grow tents)
    // Disease chance - realistic: mildew every 2-3 weeks in favorable conditions
    let diseaseChance = 0.001; // base: very low

    if (zoneId === "garden") {
      // Outdoor: normal disease risk from weather
      if (realWeather.humidity > 80) diseaseChance += 0.005;
      if (realWeather.precipitation > 5) diseaseChance += 0.008;
      if (weather.type === "rainy") diseaseChance += 0.005;
      if (weather.type === "stormy") diseaseChance += 0.01;
    } else {
      // Indoor (pepiniere, chambre de culture): near-zero disease risk
      // Only overwatering can cause mold/rot in enclosed spaces
      diseaseChance = 0.0005; // 20x less than garden
      if (newState.waterLevel > 85) {
        diseaseChance += 0.008; // slight risk from severe overwatering
      }
      if (newState.waterLevel > 95) {
        diseaseChance += 0.015; // critical overwatering → mold
      }
    }

    if (Math.random() < diseaseChance && newState.stage > 0) {
      const resistance = plantDef.diseaseResistance / 100;
      if (Math.random() > resistance) {
        newState.hasDisease = true;
        newState.diseaseDays = 1;
        alerts.push({
          id: `disease-new-${Date.now()}`,
          type: "disease",
          message: `🦠 Maladie détectée sur ${plantDef.emoji} ${plantDef.name} !`,
          emoji: "🦠", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
        });
      }
    }
  }

  // ── Disease Pressure Tracking (Mildiou / Oïdium prediction) ──
  // Track consecutive hours of favorable disease conditions
  // Mildiou: HR>90%, T°15-25°C (phytophthora infestans)
  // Oïdium: HR 60-80%, T°15-25°C, temps sec (erysiphe)
  if (zoneId === "garden" && newState.stage >= 1 && !newState.hasDisease) {
    const isMildiouConditions =
      realWeather.humidity > 90 &&
      realWeather.temperature >= 10 &&
      realWeather.temperature <= 28;
    const isOidieConditions =
      realWeather.humidity >= 55 &&
      realWeather.humidity <= 82 &&
      realWeather.temperature >= 15 &&
      realWeather.temperature <= 28 &&
      realWeather.precipitation === 0;

    if (isMildiouConditions || isOidieConditions) {
      newState.diseasePressureHours += 24; // Chaque tick = 1 jour = 24h
    } else {
      // Reset pressure si conditions défavorables
      newState.diseasePressureHours = Math.max(0, newState.diseasePressureHours - 48);
    }

    // Alerte prédictive : risque imminent après 48h连续 conditions
    if (newState.diseasePressureHours >= 48 && newState.diseasePressureHours < 72) {
      const diseaseType = isMildiouConditions ? "mildiou" : "oïdium";
      const advice = diseaseType === "mildiou"
        ? "Applique purin d'ortie ou décoction de prêle maintenant."
        : "Pulvérise du bicarbonate de soude en préventif.";
      alerts.push({
        id: `disease-forecast-${Date.now()}`,
        type: "disease",
        message: `⚠️ ${plantDef.emoji} ${plantDef.name} : risque ${diseaseType} élevé dans 24h. ${advice}`,
        emoji: "🦠", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
      });
    } else if (newState.diseasePressureHours >= 72) {
      alerts.push({
        id: `disease-critical-${Date.now()}`,
        type: "disease",
        message: `🚨 ${plantDef.emoji} ${plantDef.name} : conditions idéales pour mildiou/oïdium ! Traitement urgent nécessaire.`,
        emoji: "🚨", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
      });
    }
  }

  // ── Pest (higher chance in warm weather) ──
  if (newState.hasPest) {
    newState.pestDays++;
    newState.health = Math.max(0, newState.health - 6);
    newState.growthProgress = Math.max(0, newState.growthProgress - 2);
    if (newState.pestDays > 8 && Math.random() < 0.15) {
      if (Math.random() < plantDef.pestResistance / 200) {
        newState.hasPest = false;
        newState.pestDays = 0;
        alerts.push({
          id: `pest-gone-${Date.now()}`,
          type: "pest",
          message: `🐛 Les ravageurs ont quitté ${plantDef.name} !`,
          emoji: "✅", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
        });
      }
    }
    if (newState.pestDays > 4) {
      alerts.push({
        id: `pest-${Date.now()}-${Math.random()}`,
        type: "pest",
        message: `🐛 Ravageurs sur ${plantDef.emoji} ${plantDef.name} ! (-6 santé/jour)`,
        emoji: "🐛", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
      });
    }
  } else {
    // Pest probability — realistic: aphids every 3-4 weeks in summer
    let pestChance = 0.002; // base: low
    if (zoneId !== "garden") {
      // Indoor: very few pests (sealed environment)
      pestChance = 0.0003; // ~15x less than garden
    }
    if (realWeather.temperature > 25) pestChance += 0.01;
    if (realWeather.temperature > 30) pestChance += 0.01;
    if (weather.type === "heatwave") pestChance += 0.01;

    if (Math.random() < pestChance && newState.stage >= 1) {
      const resistance = plantDef.pestResistance / 100;
      if (Math.random() > resistance) {
        newState.hasPest = true;
        newState.pestDays = 1;
        alerts.push({
          id: `pest-new-${Date.now()}`,
          type: "pest",
          message: `🐛 Ravageurs attaquent ${plantDef.emoji} ${plantDef.name} !`,
          emoji: "🐛", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "warning",
        });
      }
    }
  }

  // ── Fertilizer countdown ──
  if (newState.fertilizerBoost > 0) {
    newState.fertilizerBoost--;
  }

  // ── Pollinator Activity (Abeilles & insects) ──
  // Only applies to plants in flowering stage (stage 3) that need pollinators
  if (newState.stage === 3 && needsPollinators(plantDef.id)) {
    const isRaining = realWeather.precipitation > 0;
    const pollinatorActivity = getPollinatorActivity(
      realWeather.temperature,
      realWeather.windSpeed,
      isRaining
    );
    newState.fruitSetRate = pollinatorActivity;

    // Alert if pollinator activity is low during flowering
    if (pollinatorActivity < 0.4) {
      const tip = pollinatorActivity < 0.2
        ? "Secoue délicatement les fleurs de tomates ce soir pour favoriser la nouaison."
        : "Activité pollinisatrice réduite aujourd'hui.";
      alerts.push({
        id: `pollinator-${Date.now()}-${Math.random()}`,
        type: "pollinator",
        message: `🐝 ${tip} (activité: ${Math.round(pollinatorActivity * 100)}%)`,
        emoji: "🐝", cellX: 0, cellY: 0, timestamp: Date.now(), severity: pollinatorActivity < 0.2 ? "warning" : "info",
      });
    }
  } else {
    // Reset fruitSetRate when not in flowering or not needing pollinators
    newState.fruitSetRate = 1.0;
  }

  // ── Frost damage (real temp based) ──
  if (realWeather.temperature < 2 && newState.stage < 2) {
    newState.health = Math.max(0, newState.health - 20);
    alerts.push({
      id: `frost-${Date.now()}-${Math.random()}`,
      type: "weather",
      message: `🥶 Gel (${Math.round(realWeather.temperature)}°C) ! ${plantDef.emoji} ${plantDef.name} souffre (-20 santé)`,
      emoji: "🥶", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }

  // ── Heatwave damage (real temp based) ──
  if (realWeather.temperature > 35 && newState.waterLevel < 40) {
    newState.health = Math.max(0, newState.health - 10);
    alerts.push({
      id: `heat-${Date.now()}-${Math.random()}`,
      type: "weather",
      message: `🔥 Canicule (${Math.round(realWeather.temperature)}°C) ! ${plantDef.emoji} ${plantDef.name} brûle (-10 santé)`,
      emoji: "🔥", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }

  // ── Survival mode: plants never die ──
  if (newState.health <= 0) {
    newState.health = 5; // Clamp to minimum 5%
    alerts.push({
      id: `survie-${Date.now()}-${Math.random()}`,
      type: "health",
      message: `⚠️ ${plantDef.name} est en survie ! Conditions à améliorer.`,
      emoji: "⚠️", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "critical",
    });
  }

  // ── Growth with real weather (stunted when health <= 5) ──
  let growthRate: number;
  if (newState.health <= 5) {
    // Stunted: no growth, no water consumption
    growthRate = 0;
    // Slow recovery when conditions improve (water > 30% AND no disease AND no pest)
    if (newState.waterLevel > 30 && !newState.hasDisease && !newState.hasPest) {
      newState.health = Math.min(20, newState.health + 1);
    }
  } else {
    growthRate = calculateGrowthRate(
      plantDef, env, newState.waterLevel,
      comboBonus, weather, getSeason(getTodayDayOfYear()),
      newState.hasDisease, newState.hasPest,
      newState.fertilizerBoost
    );
  }

  newState.comboBonus = comboBonus;

  const stageDays = plantDef.stageDurations[newState.stage];
  const dailyGrowth = (100 / stageDays) * growthRate;
  newState.growthProgress = Math.min(100, newState.growthProgress + dailyGrowth);
  newState.daysSincePlanting++;
  newState.daysInCurrentStage++;

  // Stage advancement
  if (newState.growthProgress >= 100 && newState.stage < 3) {
    newState.stage++;
    newState.growthProgress = 0;
    newState.daysInCurrentStage = 0;
    alerts.push({
      id: `stage-${Date.now()}-${Math.random()}`,
      type: "stage",
      message: `${plantDef.emoji} ${plantDef.name} → ${STAGE_NAMES[newState.stage]} ! ${STAGE_EMOJIS[newState.stage]}`,
      emoji: STAGE_EMOJIS[newState.stage], cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
    });
  }

  // Harvestable
  if (newState.stage === 3 && newState.growthProgress >= 90 && !newState.isHarvestable) {
    newState.isHarvestable = true;
    alerts.push({
      id: `harvest-${Date.now()}-${Math.random()}`,
      type: "harvest",
      message: `${plantDef.harvestEmoji} ${plantDef.name} est prête à récolter !`,
      emoji: plantDef.harvestEmoji, cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info",
    });
  }

  return { newState, alerts };
}
