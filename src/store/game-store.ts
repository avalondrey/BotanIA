import { create } from "zustand";
import { useAchievementStore } from './achievement-store';
import { useSoundManager } from '@/lib/sound-manager';
import { triggerVisualEffect } from '@/components/game/VisualEffectManager';
import {
  type PlantState,
  type AlertData,
  type WeatherData,
  PLANTS,
  WEATHER_TYPES,
  createInitialPlantState,
  simulateDay,
  applyWatering,
  applyFertilizer,
  applyTreatment,
  getSeason,
  getSeasonEmoji,
  getSeasonLabel,
  generateWeatherForMonth,
  getMonthFromDay,
  getSeasonalPlantingAdvice,
  getDayDate,
  getTodayDayOfYear,
  getRealDateDisplay,
  getRealDateFull,
  simulateDayWithRealWeather,
  type RealWeatherParams,
  isTransplantSeason,
  PLANT_SPACING,
} from "@/lib/ai-engine";
import {
  type RealWeatherData,
  type GPSCoords,
  getRealEnvironment,
  getZonePrecipitation,
  ZONE_MODIFIERS,
  loadGPSCoords,
  saveGPSCoords,
  isFrostRisk,
} from "@/lib/weather-service";
import { checkCompanionForNewPlant } from "@/lib/companion-matrix";
import { loadPlotHistory, findOrCreatePlot, getPlotRotationSuggestion, recordPlanting } from '@/lib/crop-rotation';
import {
  getEnvironmentForMonth,
  getEnvironmentWithDailyVariation,
} from "@/lib/ai-engine";

// ═══ Pepiniere Stages (réalistes, basés sur données réelles) ═══
// Sources: jardinamel.fr, lepotagerminimaliste.fr, lepotagerdesante.com
//
// Stades mini serre / pépinière:
//   0 = Graine semée (la graine est dans la terre)
//   1 = Monticule / Levée (germination, petit monticule, levée)
//   2 = Petite plantule (cotylédons ouverts, petite pousse)
//   3 = Premières feuilles (2-4 vraies feuilles, plante encore petite)
//   4 = Prêt à transplanter (4-8 feuilles, plant robuste)
//
// Les seuils sont SPECIFIQUES à chaque plante car la germination varie:
//   Tomate:  4-6j germ. (abri), 120j récolte
//   Carotte: 5-8j germ. (abri), 90-150j récolte
//   Laitue:  3-5j germ. (abri), 60j récolte
//   Fraise:  14-21j germ., récolte longue durée
//   Basilic: 6-9j germ., 90j récolte
//   Piment:  7-12j germ. (abri), 130j récolte

export const PEPINIERE_STAGE_NAMES = [
  "Monticule de terre",
  "Petite plantule",
  "Plantule 2 feuilles",
  "Plantule 4 feuilles",
  "Plantule 5 feuilles",
  "Floraison",
];

// Helper: get stage image path for a specific plant type
export function getStageImage(plantDefId: string, stage: number): string {
  return `/stages/${plantDefId}/${Math.min(stage, 5)}.png`;
}

// Seuils par plante (jours) : [J0->stage1, J->stage2, J->stage3, J->stage4, J->stage5]
// 6 stades: monticule -> plantule 1 feuille -> 2 feuilles -> 4 feuilles -> 5+ feuilles -> pret
export const PEPINIERE_PLANT_THRESHOLDS: Record<string, number[]> = {
  tomato:      [4, 8, 15, 24, 40],   // germ. 4-6j, plantule lente, 4 feuilles ~24j, pret ~40j
  carrot:      [6, 12, 20, 32, 50],   // germ. 5-8j, croissance lente, pret ~7sem
  lettuce:     [3, 6, 10, 16, 25],   // germ. 3-5j, croissance rapide, pret ~4sem
  strawberry:  [12, 20, 30, 42, 55],  // germ. 14-21j, lent au debut, pret ~8sem
  basil:       [5, 9, 14, 22, 30],   // germ. 6-9j, croissance moyenne, pret ~4sem
  pepper:      [8, 14, 22, 35, 55],   // germ. 7-12j, lent, pret ~8sem
};

// Seuils par defaut (si plante non dans la table)
const DEFAULT_PEPINIERE_THRESHOLDS = [5, 10, 18, 28, 45];

export const PEPINIERE_STAGES = [
  { name: "Monticule de terre", minDays: 0, maxDays: 5 },
  { name: "Petite plantule", minDays: 5, maxDays: 10 },
  { name: "Plantule 2 feuilles", minDays: 10, maxDays: 18 },
  { name: "Plantule 4 feuilles", minDays: 18, maxDays: 28 },
  { name: "Plantule 5 feuilles", minDays: 28, maxDays: 45 },
  { name: "Pret a transplanter", minDays: 45, maxDays: Infinity },
];

export function getPepiniereStage(daysSincePlanting: number, plantDefId?: string): number {
  const thresholds = plantDefId
    ? (PEPINIERE_PLANT_THRESHOLDS[plantDefId] || DEFAULT_PEPINIERE_THRESHOLDS)
    : DEFAULT_PEPINIERE_THRESHOLDS;

  if (daysSincePlanting >= thresholds[4]) return 5;
  if (daysSincePlanting >= thresholds[3]) return 4;
  if (daysSincePlanting >= thresholds[2]) return 3;
  if (daysSincePlanting >= thresholds[1]) return 2;
  if (daysSincePlanting >= thresholds[0]) return 1;
  return 0;
}

export function getPepiniereTransplantDay(plantDefId: string): number {
  return (PEPINIERE_PLANT_THRESHOLDS[plantDefId] || DEFAULT_PEPINIERE_THRESHOLDS)[4];
}

// ═══ Garden Grid Cell (legacy) ═══

export interface GardenCell {
  plant: PlantState | null;
  plantDefId: string | null;
  hasSerre: boolean;
}

// ═══ Realistic Garden (cm-based) ═══

export const DEFAULT_GARDEN_WIDTH_CM = 1400;  // 14m de large
export const DEFAULT_GARDEN_HEIGHT_CM = 3900;  // 39m de long = 546m²
export const MAX_GARDEN_WIDTH_CM = 2000;
export const MAX_GARDEN_HEIGHT_CM = 5000;
export const GRID_UNIT_CM = 10;  // Agrandir la grille unité pour 546m²

export interface GardenPlant {
  id: string;
  plantDefId: string;
  x: number;  // position in cm from left
  y: number;  // position in cm from top
  plant: PlantState;
}

export interface SerreZone {
  id: string;
  x: number;  // cm
  y: number;  // cm
  width: number;  // cm
  height: number; // cm
}

// ═══ Garden Objects (Arbres, Haies, Cuves, Cabanes) ═══

export interface GardenTree {
  id: string;
  type: 'apple' | 'pear' | 'cherry' | 'plum' | 'oak' | 'pine';
  x: number;  // cm
  y: number;  // cm
  diameter: number;  // cm (largeur de la couronne)
  age: number;  // jours depuis plantation
}

export interface GardenHedge {
  id: string;
  type: 'laurel' | 'cypress' | 'boxwood' | 'bamboo';
  x: number;  // cm (point de départ)
  y: number;  // cm
  length: number;  // cm (longueur de la haie)
  orientation: 'horizontal' | 'vertical';
  height: number;  // cm (hauteur visuelle)
}

export interface GardenTank {
  id: string;
  type: 'water' | 'compost';
  x: number;  // cm
  y: number;  // cm
  width: number;  // cm
  height: number;  // cm
  capacity: number;  // litres
  currentLevel: number;  // litres
  // ── Nouveaux champs récupération pluie ──
  name?: string;           // nom affiché
  roofAreaM2?: number;     // m² toiture connectée
  efficiency?: number;     // 0.8 = 80%
  color?: string;          // couleur HUD
  isRainTank?: boolean;    // cuve récup pluie active
}

export interface GardenShed {
  id: string;
  type: 'tool_shed' | 'garden_shed' | 'storage';
  x: number;  // cm
  y: number;  // cm
  width: number;  // cm
  height: number;  // cm
}

export interface GardenDrum {
  id: string;
  x: number;  // cm
  y: number;  // cm
  width: number;  // cm
  height: number;  // cm
  capacity: number;  // litres (225)
}

export interface GardenZone {
  id: string;
  type: 'uncultivated' | 'cultivated' | 'path' | 'hedge' | 'water_recovery' | 'grass' | 'fleur';
  x: number;  // cm
  y: number;  // cm
  width: number;  // cm
  height: number;  // cm
  label?: string;
}

// ═══ Mini Serre (6×4 = 24 slots) ═══

export const MINI_SERRE_ROWS = 6;
export const MINI_SERRE_COLS = 4;
export const MINI_SERRE_PRICE = 150;
export const MINI_SERRE_WIDTH_CM = 20;
export const MINI_SERRE_DEPTH_CM = 32.5;

// ═══ Chambre de Culture ═══

export interface ChambreModel {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  maxMiniSerres: number;
  price: number;
  image: string;
  emoji: string;
  description: string;
  color: string;
}

export const CHAMBRE_CATALOG: ChambreModel[] = [
  {
    id: "chambre-small",
    name: "Chambre 60×60",
    widthCm: 60,
    heightCm: 140,
    depthCm: 60,
    maxMiniSerres: 2,
    price: 250,
    image: "/cards/card-chambre-small.png",
    emoji: "🏠",
    description: "Chambre de culture compacte idéale pour débuter. 60×60×140cm. Accueille 2 mini serres.",
    color: "from-green-100 to-emerald-100",
  },
  {
    id: "chambre-medium",
    name: "Chambre 80×80",
    widthCm: 80,
    heightCm: 160,
    depthCm: 80,
    maxMiniSerres: 4,
    price: 400,
    image: "/cards/card-chambre-medium.png",
    emoji: "🏭",
    description: "Chambre de culture intermédiaire pour jardiniers confirmés. 80×80×160cm. Accueille 4 mini serres.",
    color: "from-emerald-100 to-teal-100",
  },
  {
    id: "chambre-large",
    name: "Chambre 120×120",
    widthCm: 120,
    heightCm: 200,
    depthCm: 120,
    maxMiniSerres: 6,
    price: 650,
    image: "/cards/card-chambre-large.png",
    emoji: "🏗️",
    description: "Chambre de culture professionnelle. 120×120×200cm. Accueille 6 mini serres pour production intensive.",
    color: "from-teal-100 to-cyan-100",
  },
];

export interface MiniSerre {
  id: string;
  slots: (PlantState | null)[][]; // 6 rows × 4 cols
}

function createEmptyMiniSerre(): MiniSerre {
  return {
    id: uid(),
    slots: Array.from({ length: MINI_SERRE_ROWS }, () =>
      Array.from({ length: MINI_SERRE_COLS }, () => null)
    ),
  };
}

// ═══ Seed Shop System (multi-shop varieties) ═══

export interface SeedShop {
  id: string;
  name: string;
  emoji: string;
  color: string;
  borderColor: string;
  image: string;
  description: string;
}

export interface SeedVariety {
  id: string;
  plantDefId: string;
  shopId: string;
  name: string;
  emoji: string;
  price: number;
  grams: number;
  seedCount?: number; // Nombre de graines dans le paquet (optionnel pour compatibilité)
  description: string;
  image: string;
  unlocked: boolean;
  stageDurations: [number, number, number, number];
  realDaysToHarvest: number;
  optimalTemp: [number, number];
  waterNeed: number;
  lightNeed: number;
}

export const SEED_SHOPS: SeedShop[] = [
  {
    id: "vilmorin",
    name: "Vilmorin",
    emoji: "🌱",
    color: "from-red-50 to-orange-50",
    borderColor: "border-red-200",
    image: "/assets/shops/card-shop-vilmorin.png",
    description: "Jardinier depuis 1814 — Leader français des semences potagères et fleurs",
  },
  {
    id: "clause",
    name: "Clause",
    emoji: "🌺",
    color: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
    image: "/assets/shops/card-shop-clause.png",
    description: "Semences et plants potagers — Qualité professionnelle",
  },
  // Boutiques Bio & Paysannes
  {
    id: "kokopelli",
    name: "Kokopelli",
    emoji: "\ud83c\udf31",
    color: "from-green-50 to-emerald-50",
    borderColor: "border-green-300",
    image: "/assets/shops/card-shop-kokopelli.png",
    description: "Semences biologiques, libres de droits et reproductibles depuis +25 ans",
  },
  {
    id: "lebiau",
    name: "Le Biau Germe",
    emoji: "\ud83c\udf3e",
    color: "from-yellow-50 to-amber-50",
    borderColor: "border-amber-300",
    image: "/assets/shops/card-shop-lebiau.png",
    description: "Semences paysannes biologiques depuis 1981 - 12 fermes en France",
  },
  {
    id: "saintemarthe",
    name: "Ferme de Sainte Marthe",
    emoji: "\ud83c\udfe1",
    color: "from-orange-50 to-red-50",
    borderColor: "border-orange-300",
    image: "/assets/shops/card-shop-sainte-marthe.png",
    description: "Semences biologiques et reproductibles, Patrimoine varietal depuis 1973",
  },
  // Pepinieres & Arbres fruitiers
  {
    id: "guignard",
    name: "Guignard",
    emoji: "🌳",
    color: "from-green-50 to-teal-50",
    borderColor: "border-green-400",
    image: "/assets/shops/card-shop-guignard.png",
    description: "Pepinieriste depuis 1850 — Arbres fruitiers et d'ornement",
  },
  {
    id: "inrae",
    name: "INRAE",
    emoji: "🔬",
    color: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-300",
    image: "/assets/shops/card-shop-inrae.png",
    description: "Institut Recherche Agriculture — Semences forestieres et varietes anciennes",
  },
  {
    id: "pepinieres-bordas",
    name: "Pépinières Bordas",
    emoji: "🌲",
    color: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-300",
    image: "/assets/shops/card-shop-pepinieres-bordas.png",
    description: "Pépiniériste spécialisé en arbres fruitiers et d'ornement depuis 1920",
  },
  {
    id: "arbres-tissot",
    name: "Arbres Tissot",
    emoji: "🌴",
    color: "from-lime-50 to-green-50",
    borderColor: "border-lime-400",
    image: "/assets/shops/card-shop-arbres-tissot.png",
    description: "Spécialiste pommiers et poiriers — Vergers et arbres d'ornement",
  },
  {
    id: "fruitiers-forest",
    name: "Fruitiers Forest",
    emoji: "🍎",
    color: "from-red-50 to-pink-50",
    borderColor: "border-red-300",
    image: "/assets/shops/card-shop-fruitiers-forest.png",
    description: "Vergers et petits fruits — Gamme complète d'arbres fruitiers",
  },
  // ═══ Achats Locaux & Pepinieres ═══
  {
    id: "pepiniere-locale",
    name: "Pépinière",
    emoji: "🏡",
    color: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-300",
    image: "/assets/shops/card-shop-pepiniere-locale.png",
    description: "Plants élevés à la ferme — Arbres, arbustes et plantules de saison",
  },
  {
    id: "les-pepineres-quissac",
    name: "Les Pépinières Quissac",
    emoji: "🌿",
    color: "from-green-50 to-emerald-50",
    borderColor: "border-emerald-300",
    image: "/assets/shops/card-shop-quissac.png",
    description: "Pépiniériste local — Plants et arbustes cultivés en Occitanie",
  },
  {
    id: "leaderplant",
    name: "Leaderplant",
    emoji: "🌳",
    color: "from-teal-50 to-cyan-50",
    borderColor: "border-teal-300",
    image: "/assets/shops/card-shop-leaderplant.png",
    description: "Pépinière spécialisée — Fruitiers, petits fruits et plantes vivaces",
  },
  {
    id: "marche-producteurs",
    name: "Marché Producteurs",
    emoji: "🧺",
    color: "from-orange-50 to-red-50",
    borderColor: "border-orange-300",
    image: "/assets/shops/card-shop-marche.png",
    description: "Ventes directes — Plants et plantules de maraîchers locaux",
  },
  {
    id: "jardin-partage",
    name: "Jardin Partagé",
    emoji: "🌾",
    color: "from-green-50 to-emerald-50",
    borderColor: "border-green-300",
    image: "/assets/shops/card-shop-jardin-partage.png",
    description: "Échange entre jardiniers — Plants et semis cultivés localement",
  },
  // ═══ Bientôt disponible ═══
  {
    id: "bientot-dispo",
    name: "Bientôt dispo",
    emoji: "🔜",
    color: "from-stone-100 to-stone-200",
    borderColor: "border-stone-300",
    image: "/assets/shops/card-shop-placeholder.png",
    description: "Ce magasin arrive bientôt — Restez attentifs !",
  },
  // ═══ Magasins Plantules ═══
  {
    id: "jardiland",
    name: "Jardiland",
    emoji: "🏡",
    color: "from-green-50 to-emerald-50",
    borderColor: "border-green-300",
    image: "/assets/shops/card-shop-jardiland.png",
    description: "Le spécialiste jardin — Plants et plantules de saison",
  },
  {
    id: "gamm-vert",
    name: "Gamm Vert",
    emoji: "🌿",
    color: "from-lime-50 to-green-50",
    borderColor: "border-lime-300",
    image: "/assets/shops/card-shop-gamm-vert.png",
    description: "Proche de chez vous — Gamme complète jardin et extérieur",
  },
  {
    id: "esat-antes",
    name: 'E.S.A.T. "Les Antes"',
    emoji: "🌻",
    color: "from-yellow-50 to-amber-50",
    borderColor: "border-amber-300",
    image: "/assets/shops/card-shop-esat-antes.png",
    description: "Etablissement et Service d'Aide par le Travail — Plants adaptés",
  },
  {
    id: "jardi-leclerc",
    name: "Jardi E.Leclerc",
    emoji: "🛒",
    color: "from-red-50 to-orange-50",
    borderColor: "border-red-300",
    image: "/assets/shops/card-shop-jardi-leclerc.png",
    description: "Jardin et animalerie — Large choix à petits prix",
  },
];

// ═══ Plantules Locales (pour achats-locaux) ═══
export const PLANTULES_LOCALES: SeedVariety[] = [
  // Tomates locales
  {
    id: "plantule-tomate-coeur-boeuf",
    plantDefId: "tomato",
    shopId: "jardiland",
    name: "Tomate Coeur de Boeuf",
    emoji: "🍅",
    price: 90,
    grams: 0,
    description: "Plantule élevée en local — Variété charnue et parfumée, excellente pour salade",
    image: "/plantules/plantule-tomate-coeur-boeuf.png",
    unlocked: true,
    stageDurations: [8, 22, 20, 45],
    realDaysToHarvest: 95,
    optimalTemp: [16, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "plantule-tomate-ananas",
    plantDefId: "tomato",
    shopId: "jardiland",
    name: "Tomate Ananas",
    emoji: "🍅",
    price: 95,
    grams: 0,
    description: "Plantule locale — Chair jaune orangée, douce et sucrée, variété ancienne",
    image: "/plantules/plantule-tomate-ananas.png",
    unlocked: true,
    stageDurations: [10, 25, 25, 55],
    realDaysToHarvest: 115,
    optimalTemp: [18, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  // Courgettes et squash locaux
  {
    id: "plantule-courgette-rond",
    plantDefId: "zucchini",
    shopId: "jardiland",
    name: "Courgette Ronde de Nice",
    emoji: "🥒",
    price: 75,
    grams: 0,
    description: "Plantule locale — Variété provençale, idéale pour farcir",
    image: "/plantules/plantule-courgette-rond.png",
    unlocked: true,
    stageDurations: [6, 16, 20, 42],
    realDaysToHarvest: 84,
    optimalTemp: [18, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "plantule-potimarron",
    plantDefId: "squash",
    shopId: "jardiland",
    name: "Potimarron",
    emoji: "🎃",
    price: 80,
    grams: 0,
    description: "Plantule locale — Courge douce, chair orangée, excellente conservation",
    image: "/plantules/plantule-potimarron.png",
    unlocked: true,
    stageDurations: [8, 20, 30, 60],
    realDaysToHarvest: 118,
    optimalTemp: [15, 26],
    waterNeed: 4.5,
    lightNeed: 7,
  },
  // Poivrons et piments locaux
  {
    id: "plantule-poivron-corne",
    plantDefId: "pepper",
    shopId: "jardiland",
    name: "Poivron Corne de Boeuf",
    emoji: "🌶️",
    price: 85,
    grams: 0,
    description: "Plantule locale — Chair épaisse, doux, idéal pourfarcir",
    image: "/plantules/plantule-poivron-corne.png",
    unlocked: true,
    stageDurations: [10, 26, 26, 58],
    realDaysToHarvest: 120,
    optimalTemp: [20, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "plantule-piment-espelette",
    plantDefId: "pepper",
    shopId: "gamm-vert",
    name: "Piment d'Espelette",
    emoji: "🌶️",
    price: 95,
    grams: 0,
    description: "Plantule du Pays Basque — AOP, saveur douce et légèrement épicée",
    image: "/plantules/plantule-piment-espelette.png",
    unlocked: true,
    stageDurations: [12, 28, 30, 65],
    realDaysToHarvest: 135,
    optimalTemp: [20, 30],
    waterNeed: 4.5,
    lightNeed: 8,
  },
  // Aubergines locales
  {
    id: "plantule-aubergine-barbentane",
    plantDefId: "eggplant",
    shopId: "jardiland",
    name: "Aubergine de Barbentane",
    emoji: "🍆",
    price: 80,
    grams: 0,
    description: "Plantule locale — Variété provençale, productive et parfumée",
    image: "/plantules/plantule-aubergine-barbentane.png",
    unlocked: true,
    stageDurations: [10, 24, 25, 55],
    realDaysToHarvest: 114,
    optimalTemp: [20, 30],
    waterNeed: 5.5,
    lightNeed: 8,
  },
  // Salades locales
  {
    id: "plantule-laitue-feuille-chene",
    plantDefId: "lettuce",
    shopId: "gamm-vert",
    name: "Laitue Feuille de Chêne",
    emoji: "🥬",
    price: 55,
    grams: 0,
    description: "Plantule de maraîcher — Feuille croquante, résiste à la chaleur",
    image: "/plantules/plantule-laitue-chene.png",
    unlocked: true,
    stageDurations: [4, 10, 14, 22],
    realDaysToHarvest: 50,
    optimalTemp: [12, 20],
    waterNeed: 3.5,
    lightNeed: 6,
  },
  {
    id: "plantule-laitue-romaine",
    plantDefId: "lettuce",
    shopId: "jardiland",
    name: "Laitue Romaine",
    emoji: "🥬",
    price: 55,
    grams: 0,
    description: "Plantule locale — Coeur ferme et croquant, variety classique",
    image: "/plantules/plantule-laitue-romaine.png",
    unlocked: true,
    stageDurations: [4, 12, 16, 28],
    realDaysToHarvest: 60,
    optimalTemp: [12, 20],
    waterNeed: 3.5,
    lightNeed: 6,
  },
  // Carottes locales
  {
    id: "plantule-carotte-guerande",
    plantDefId: "carrot",
    shopId: "gamm-vert",
    name: "Carotte de Guérande",
    emoji: "🥕",
    price: 70,
    grams: 0,
    description: "Plantule de maraîcher breton — Douce et croquante, sols sableux",
    image: "/plantules/plantule-carotte-guerande.png",
    unlocked: true,
    stageDurations: [10, 28, 26, 52],
    realDaysToHarvest: 116,
    optimalTemp: [15, 22],
    waterNeed: 4.0,
    lightNeed: 6,
  },
  // Fraises locales
  {
    id: "plantule-fraise-gariguette",
    plantDefId: "strawberry",
    shopId: "jardiland",
    name: "Fraise Gariguette",
    emoji: "🍓",
    price: 90,
    grams: 0,
    description: "Plantule locale — La plus parfumée, chair fondante,抢手",
    image: "/plantules/plantule-fraise-gariguette.png",
    unlocked: true,
    stageDurations: [6, 14, 20, 40],
    realDaysToHarvest: 80,
    optimalTemp: [14, 24],
    waterNeed: 4.0,
    lightNeed: 7,
  },
  // Fraises spécialisées locales
  {
    id: "fraise-ostara",
    plantDefId: "strawberry",
    shopId: "les-pepineres-quissac",
    name: "Fraise Ostara",
    emoji: "🍓",
    price: 92, grams: 0,
    description: "Variété remontante, production de juin jusqu'aux gelées, productive",
    image: "/plantules/plantule-fraise-ostara.png", unlocked: true,
    stageDurations: [6, 14, 20, 45], realDaysToHarvest: 85,
    optimalTemp: [14, 26], waterNeed: 4.0, lightNeed: 7,
  },
  {
    id: "fraise-cirafine",
    plantDefId: "strawberry",
    shopId: "les-pepineres-quissac",
    name: "Fraise Cirafine",
    emoji: "🍓",
    price: 88, grams: 0,
    description: "Petits fruits allongés, parfum très prononcé, idéale confitures",
    image: "/plantules/plantule-fraise-cirafine.png", unlocked: true,
    stageDurations: [6, 14, 22, 42], realDaysToHarvest: 84,
    optimalTemp: [14, 24], waterNeed: 4.0, lightNeed: 7,
  },
  {
    id: "fraise-rabunda",
    plantDefId: "strawberry",
    shopId: "les-pepineres-quissac",
    name: "Fraise Rabunda",
    emoji: "🍓",
    price: 85, grams: 0,
    description: "Chair ferme, fruits coniques, bonne conservation, productive",
    image: "/plantules/plantule-fraise-rabunda.png", unlocked: true,
    stageDurations: [6, 14, 20, 40], realDaysToHarvest: 80,
    optimalTemp: [14, 25], waterNeed: 4.0, lightNeed: 7,
  },
  {
    id: "fraise-anabelle",
    plantDefId: "strawberry",
    shopId: "les-pepineres-quissac",
    name: "Fraise Anabelle",
    emoji: "🍓",
    price: 90, grams: 0,
    description: "Gros fruits ronds, chair juteuse, très sucrée, variété grand terroir",
    image: "/plantules/plantule-fraise-anabelle.png", unlocked: true,
    stageDurations: [6, 14, 22, 45], realDaysToHarvest: 87,
    optimalTemp: [14, 24], waterNeed: 4.0, lightNeed: 7,
  },
  {
    id: "plantule-fraise-mara-des-bois",
    plantDefId: "strawberry",
    shopId: "gamm-vert",
    name: "Fraise Mara des Bois",
    emoji: "🍓",
    price: 95,
    grams: 0,
    description: "Plantule de maraîcher — Parfum intense, petits fruits elongues",
    image: "/plantules/plantule-fraise-mara.png",
    unlocked: true,
    stageDurations: [6, 14, 22, 45],
    realDaysToHarvest: 87,
    optimalTemp: [14, 24],
    waterNeed: 4.0,
    lightNeed: 7,
  },
  // Basilic local
  {
    id: "plantule-basilic-genovee",
    plantDefId: "basil",
    shopId: "gamm-vert",
    name: "Basilic Génovéis",
    emoji: "🌿",
    price: 75,
    grams: 0,
    description: "Plantule de maraîcher — Feuilles larges et parfum intense, le vrai pesto",
    image: "/plantules/plantule-basilic-genovee.png",
    unlocked: true,
    stageDurations: [6, 18, 20, 40],
    realDaysToHarvest: 84,
    optimalTemp: [20, 27],
    waterNeed: 4.0,
    lightNeed: 6,
  },
  // Baies et petits fruits
  {
    id: "plantule-goji-amber-sweet",
    plantDefId: "goji",
    shopId: "les-pepineres-quissac",
    name: "Goji 'Amber Sweet'",
    emoji: "🍒",
    price: 120,
    grams: 0,
    description: "Lycium Barbarum — Baies dorées, douces et sans amertume. Plante vivace",
    image: "/plantules/plantule-goji.png",
    unlocked: true,
    stageDurations: [10, 24, 30, 45],
    realDaysToHarvest: 109,
    optimalTemp: [15, 28],
    waterNeed: 3.5,
    lightNeed: 7,
  },
  {
    id: "plantule-lyciet-rouge",
    plantDefId: "lycium",
    shopId: "les-pepineres-quissac",
    name: "Lyciet Rouge",
    emoji: "🍇",
    price: 110,
    grams: 0,
    description: "Lycium ruthenicum — Petites baies violettes, très résistant au froid",
    image: "/plantules/plantule-lyciet.png",
    unlocked: true,
    stageDurations: [8, 22, 26, 40],
    realDaysToHarvest: 96,
    optimalTemp: [12, 30],
    waterNeed: 3.0,
    lightNeed: 6,
  },
  {
    id: "plantule-mirabellier-nancy",
    plantDefId: "mirabellier",
    shopId: "pepiniere-locale",
    name: "Mirabellier de Nancy",
    emoji: "🫐",
    price: 150,
    grams: 0,
    description: "Variété de Varmonzey — Chair fine et sucrée, productive et rustique",
    image: "/plantules/plantule-mirabellier.png",
    unlocked: true,
    stageDurations: [18, 35, 55, 80],
    realDaysToHarvest: 188,
    optimalTemp: [10, 25],
    waterNeed: 4.5,
    lightNeed: 7,
  },
  {
    id: "plantule-mirabellier-pointue",
    plantDefId: "mirabellier",
    shopId: "pepiniere-locale",
    name: "Mirabellier Pointue",
    emoji: "🫐",
    price: 155,
    grams: 0,
    description: "Origine Billy-sous-les-Côtes (Meuse) — Chair parfumée, légèrement acidulée",
    image: "/plantules/plantule-mirabellier-pointue.png",
    unlocked: true,
    stageDurations: [18, 35, 55, 80],
    realDaysToHarvest: 188,
    optimalTemp: [10, 25],
    waterNeed: 4.5,
    lightNeed: 7,
  },
  // Arbres fruitiers locaux
  {
    id: "arbre-pommier-reinette",
    plantDefId: "apple",
    shopId: "jardiland",
    name: "Pommier Reinette",
    emoji: "🍎",
    price: 180,
    grams: 0,
    description: "Arbre élevé en pépinière locale — Variété ancienne, chair acidulée",
    image: "/pots/locaux/pot-pommier-reinette.png",
    unlocked: true,
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 730,
    optimalTemp: [8, 22],
    waterNeed: 5.0,
    lightNeed: 7,
  },
  {
    id: "arbre-poirier-comice",
    plantDefId: "pear",
    shopId: "jardiland",
    name: "Poirier Comice",
    emoji: "🍐",
    price: 190,
    grams: 0,
    description: "Arbre élevé en pépinière locale — Chair fondante et sucrée, variété premium",
    image: "/pots/locaux/pot-poirier-comice.png",
    unlocked: true,
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1095,
    optimalTemp: [7, 24],
    waterNeed: 5.0,
    lightNeed: 7,
  },
  {
    id: "arbre-cerisier-montmorency",
    plantDefId: "cherry",
    shopId: "gamm-vert",
    name: "Cerisier Montmorency",
    emoji: "🍒",
    price: 200,
    grams: 0,
    description: "Arbre de producteur local — Cerise acide parfaite pour tarte et confiture",
    image: "/pots/locaux/pot-cerisier-montmorency.png",
    unlocked: true,
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1460,
    optimalTemp: [8, 25],
    waterNeed: 4.0,
    lightNeed: 7,
  },
  // Arbustes et petits fruits
  {
    id: "plantule-groseillier",
    plantDefId: "currant",
    shopId: "jardiland",
    name: "Groseillier Rouge",
    emoji: "🍎",
    price: 120,
    grams: 0,
    description: "Arbuste local — Petits fruits acidules, ideales pour confiture",
    image: "/plantules/plantule-groseillier.png",
    unlocked: true,
    stageDurations: [15, 30, 60, 180],
    realDaysToHarvest: 365,
    optimalTemp: [10, 20],
    waterNeed: 3.5,
    lightNeed: 6,
  },
  {
    id: "plantule-murier",
    plantDefId: "blackberry",
    shopId: "gamm-vert",
    name: "Murier Sans Epines",
    emoji: "🫐",
    price: 130,
    grams: 0,
    description: "Plantule de producteur — Baies noires sucrées, sans épines",
    image: "/plantules/plantule-murier.png",
    unlocked: true,
    stageDurations: [15, 30, 60, 180],
    realDaysToHarvest: 365,
    optimalTemp: [12, 24],
    waterNeed: 4.0,
    lightNeed: 7,
  },
  // Plants du marché - échange jardin partagé
  {
    id: "echange-cepes-semis",
    plantDefId: "tomato",
    shopId: "esat-antes",
    name: "Semis de Tomates (Échange)",
    emoji: "🍅",
    price: 0,
    grams: 0,
    description: "Échange gratuit — Semis de tomates variées, provenants de jardiniers locaux",
    image: "/plantules/echange-tomates.png",
    unlocked: true,
    stageDurations: [8, 22, 20, 45],
    realDaysToHarvest: 95,
    optimalTemp: [16, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "echange-salades",
    plantDefId: "lettuce",
    shopId: "esat-antes",
    name: "Plants de Salades (Échange)",
    emoji: "🥬",
    price: 0,
    grams: 0,
    description: "Échange gratuit — Plants de salades diverses, surplus de jardiniers",
    image: "/plantules/echange-salades.png",
    unlocked: true,
    stageDurations: [4, 10, 14, 22],
    realDaysToHarvest: 50,
    optimalTemp: [12, 20],
    waterNeed: 3.5,
    lightNeed: 6,
  },
  // ═══ Jardi E.Leclerc ═══
  {
    id: "plantule-tomate-rouge-grappe",
    plantDefId: "tomato",
    shopId: "jardi-leclerc",
    name: "Tomate Rouge Grappe",
    emoji: "🍅",
    price: 85,
    grams: 0,
    description: "Plantule E.Leclerc — Variété classique, productive et parfumée",
    image: "/plantules/plantule-tomate-grappe.png",
    unlocked: true,
    stageDurations: [8, 22, 20, 45],
    realDaysToHarvest: 95,
    optimalTemp: [16, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "plantule-concombre-americain",
    plantDefId: "cucumber",
    shopId: "jardi-leclerc",
    name: "Concombre Américain",
    emoji: "🥒",
    price: 75,
    grams: 0,
    description: "Plantule E.Leclerc — Fruits longs et lisses, idéal pour salade",
    image: "/plantules/plantule-concombre.png",
    unlocked: true,
    stageDurations: [6, 14, 20, 40],
    realDaysToHarvest: 80,
    optimalTemp: [18, 25],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "plantule-poivron-og主席",
    plantDefId: "pepper",
    shopId: "jardi-leclerc",
    name: "Poivron Rouge",
    emoji: "🌶️",
    price: 80,
    grams: 0,
    description: "Plantule E.Leclerc — Chair épaisse, doux et juteux",
    image: "/plantules/plantule-poivron-rouge.png",
    unlocked: true,
    stageDurations: [10, 26, 26, 58],
    realDaysToHarvest: 120,
    optimalTemp: [20, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "plantule-fraise-ciflorette",
    plantDefId: "strawberry",
    shopId: "jardi-leclerc",
    name: "Fraise Ciflorette",
    emoji: "🍓",
    price: 88,
    grams: 0,
    description: "Plantule E.Leclerc — Chair fondante, sucrée et très parfumée",
    image: "/plantules/plantule-fraise-ciflorette.png",
    unlocked: true,
    stageDurations: [6, 14, 20, 40],
    realDaysToHarvest: 80,
    optimalTemp: [14, 24],
    waterNeed: 4.0,
    lightNeed: 7,
  },
  {
    id: "plantule-basilic-thailandais",
    plantDefId: "basil",
    shopId: "jardi-leclerc",
    name: "Basilic Thailandais",
    emoji: "🌿",
    price: 78,
    grams: 0,
    description: "Plantule E.Leclerc — Arôme citronné, idéal pour cuisine asiatique",
    image: "/plantules/plantule-basilic-thai.png",
    unlocked: true,
    stageDurations: [6, 18, 20, 40],
    realDaysToHarvest: 84,
    optimalTemp: [20, 27],
    waterNeed: 4.0,
    lightNeed: 6,
  },
  {
    id: "plantule-chou-fleur",
    plantDefId: "cabbage",
    shopId: "jardi-leclerc",
    name: "Chou Fleur",
    emoji: "🥬",
    price: 72,
    grams: 0,
    description: "Plantule E.Leclerc — Pommé blanc, riche en vitamine C",
    image: "/plantules/plantule-chou-fleur.png",
    unlocked: true,
    stageDurations: [8, 20, 30, 60],
    realDaysToHarvest: 118,
    optimalTemp: [12, 20],
    waterNeed: 4.5,
    lightNeed: 6,
  },
];

export const SEED_VARIETIES: SeedVariety[] = [
  {
    id: "tomato-cocktail",
    plantDefId: "tomato",
    shopId: "vilmorin",
    name: "Tomate Cocktail",
    emoji: "🍅",
    price: 40,
    grams: 0.5,
    description: "Variété précoce, fruits de 80-100g, saveur sucrée et juteuse. Idéale en salade et grignotage. Très productive.",
    image: "/packets/vilmorin/packet-tomato-cocktail.png",
    unlocked: true,
    stageDurations: [8, 22, 20, 45],
    realDaysToHarvest: 95,
    optimalTemp: [16, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
  {
    id: "tomato-aneas",
    plantDefId: "tomato",
    shopId: "vilmorin",
    name: "Tomate Anéas",
    emoji: "🍅",
    price: 55,
    grams: 0.3,
    description: "Variété allongée type Roma, fruits de 120-150g, chair dense et peu de graines. Parfaite pour sauces et conserves.",
    image: "/packets/vilmorin/packet-tomato-aneas.png",
    unlocked: true,
    stageDurations: [10, 25, 25, 55],
    realDaysToHarvest: 115,
    optimalTemp: [18, 28],
    waterNeed: 5.5,
    lightNeed: 8,
  },
  // Kokopelli - Varietes bio libres
  {
    id: "tomato-cherokee-purple",
    plantDefId: "tomato",
    shopId: "kokopelli",
    name: "Tomate Cherokee Purple",
    emoji: "\ud83c\udf45",
    price: 65, grams: 0.3,
    description: "Variete ancestrale amerindienne, fruits pourpres noirs au gout fume unique",
    image: "/packets/kokopelli/packet-tomato-cherokee-purple.png", unlocked: true,
    stageDurations: [8,24,22,50], realDaysToHarvest: 104,
    optimalTemp: [18,28], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "tomato-rose-de-berne",
    plantDefId: "tomato",
    shopId: "kokopelli",
    name: "Tomate Rose de Berne",
    emoji: "\ud83c\udf45",
    price: 70, grams: 0.3,
    description: "Variete suisse ancienne, rose et charnue, douceur exceptionnelle",
    image: "/packets/kokopelli/packet-tomato-rose-de-berne.png", unlocked: true,
    stageDurations: [8,22,23,48], realDaysToHarvest: 101,
    optimalTemp: [18,27], waterNeed: 5.0, lightNeed: 8,
  },
  // Biau Germe - Semences paysannes bio
  {
    id: "tomato-marmande",
    plantDefId: "tomato",
    shopId: "lebiau",
    name: "Tomate Marmande",
    emoji: "\ud83c\udf45",
    price: 60, grams: 0.3,
    description: "La classique du Sud-Ouest, cotelee et parfumee, tres productive",
    image: "/packets/lebiau/packet-tomato-marmande.png", unlocked: true,
    stageDurations: [7,21,21,48], realDaysToHarvest: 97,
    optimalTemp: [18,28], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "carrot-guerande",
    plantDefId: "carrot",
    shopId: "lebiau",
    name: "Carotte de Guerande",
    emoji: "\ud83e\udd55",
    price: 45, grams: 0.5,
    description: "Variete bretonne adaptee aux sols sableux, douce et croquante",
    image: "/packets/lebiau/packet-carrot-guerande.png", unlocked: true,
    stageDurations: [10,28,26,52], realDaysToHarvest: 116,
    optimalTemp: [15,22], waterNeed: 4.0, lightNeed: 6,
  },
  // Ferme de Sainte Marthe - Patrimoine varietal
  {
    id: "basil-genoveois",
    plantDefId: "basil",
    shopId: "saintemarthe",
    name: "Basilic Genois",
    emoji: "\ud83c\udf3f",
    price: 50, grams: 0.2,
    description: "Le vrai basilic italien, feuilles petites et parfum intense",
    image: "/packets/sainte-marthe/packet-basil-genoveois.png", unlocked: true,
    stageDurations: [6,18,20,40], realDaysToHarvest: 84,
    optimalTemp: [20,27], waterNeed: 4.0, lightNeed: 6,
  },
  {
    id: "pepper-doux-france",
    plantDefId: "pepper",
    shopId: "saintemarthe",
    name: "Poivron Doux de France",
    emoji: "\ud83c\udf36\ufe0f",
    price: 55, grams: 0.2,
    description: "Poivron traditionnel francais, doux et parfume, rouge a maturite",
    image: "/packets/sainte-marthe/packet-pepper-doux-france.png", unlocked: true,
    stageDurations: [10,28,28,60], realDaysToHarvest: 126,
    optimalTemp: [20,28], waterNeed: 5.5, lightNeed: 8,
  },
  // Clause — Legumes divers
  {
    id: "carrot-nantaise",
    plantDefId: "carrot",
    shopId: "clause",
    name: "Carotte Nantaise",
    emoji: "🥕",
    price: 35, grams: 0.5,
    description: "Variete classique tres douce et tendre, racine cylindrique",
    image: "/packets/clause/packet-carrot-nantaise.png", unlocked: true,
    stageDurations: [8,20,22,58], realDaysToHarvest: 108,
    optimalTemp: [15,22], waterNeed: 4.0, lightNeed: 6,
  },
  {
    id: "lettuce-batavia",
    plantDefId: "lettuce",
    shopId: "clause",
    name: "Laitue Batavia",
    emoji: "🥬",
    price: 25, grams: 0.3,
    description: "Feuilles croquantes et blondes, resistante a la chaleur",
    image: "/packets/clause/packet-lettuce-batavia.png", unlocked: true,
    stageDurations: [4,10,14,22], realDaysToHarvest: 50,
    optimalTemp: [12,20], waterNeed: 3.5, lightNeed: 6,
  },
  {
    id: "cucumber-marketer",
    plantDefId: "cucumber",
    shopId: "clause",
    name: "Concombre Marketer",
    emoji: "🥒",
    price: 40, grams: 0.3,
    description: "Variete productive, fruits lisses et sans amertume",
    image: "/packets/clause/packet-cucumber-marketer.png", unlocked: true,
    stageDurations: [6,14,20,40], realDaysToHarvest: 80,
    optimalTemp: [18,25], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "zucchini-black-beauty",
    plantDefId: "zucchini",
    shopId: "clause",
    name: "Courgette Black Beauty",
    emoji: "🥒",
    price: 45, grams: 0.5,
    description: "Variete productive, fruits sombres et tendres",
    image: "/packets/clause/packet-zucchini-black-beauty.png", unlocked: true,
    stageDurations: [6,16,20,42], realDaysToHarvest: 84,
    optimalTemp: [18,28], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "pepper-california-wonder",
    plantDefId: "pepper",
    shopId: "clause",
    name: "Poivron California Wonder",
    emoji: "🌶️",
    price: 50, grams: 0.2,
    description: "Type cloche, chair epaisse et douce",
    image: "/packets/clause/packet-pepper-california-wonder.png", unlocked: true,
    stageDurations: [10,26,26,58], realDaysToHarvest: 120,
    optimalTemp: [20,28], waterNeed: 5.0, lightNeed: 8,
  },
  // Kokopelli — Semences bio ancestrales
  {
    id: "tomato-blackk",
    plantDefId: "tomato",
    shopId: "kokopelli",
    name: "Tomate Noire de Crimee",
    emoji: "🍅",
    price: 65, grams: 0.3,
    description: "Variete noire ancienne, chair Dense et sucree",
    image: "/packets/kokopelli/packet-tomato-blackk.png", unlocked: true,
    stageDurations: [8,24,22,52], realDaysToHarvest: 106,
    optimalTemp: [18,28], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "tomato-green-zebra",
    plantDefId: "tomato",
    shopId: "kokopelli",
    name: "Tomate Green Zebra",
    emoji: "🍅",
    price: 60, grams: 0.3,
    description: "Tomate verte rayee, aciditee Balancee, originale en salade",
    image: "/packets/kokopelli/packet-tomato-green-zebra.png", unlocked: true,
    stageDurations: [8,22,20,46], realDaysToHarvest: 96,
    optimalTemp: [17,27], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "eggplant-long-violette",
    plantDefId: "eggplant",
    shopId: "kokopelli",
    name: "Aubergine Longue Violette",
    emoji: "🍆",
    price: 50, grams: 0.2,
    description: "Variete productive et precoce, fruits allonges",
    image: "/packets/kokopelli/packet-eggplant-long-violette.png", unlocked: true,
    stageDurations: [8,20,24,50], realDaysToHarvest: 102,
    optimalTemp: [20,28], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "squash-butternut-coco",
    plantDefId: "squash",
    shopId: "kokopelli",
    name: "Courge Butternut Coco",
    emoji: "🎃",
    price: 55, grams: 0.5,
    description: "Variete储藏耐, chair douce et sucree, fruits de 1-2kg",
    image: "/packets/kokopelli/packet-squash-butternut-coco.png", unlocked: true,
    stageDurations: [8,24,32,80], realDaysToHarvest: 144,
    optimalTemp: [18,28], waterNeed: 5.5, lightNeed: 8,
  },
  // Biau Germe — Semences paysannes
  {
    id: "carrot-robver",
    plantDefId: "carrot",
    shopId: "lebiau",
    name: "Carotte Rob Ver",
    emoji: "🥕",
    price: 45, grams: 0.5,
    description: "Carotte hollandaise rouge-orange, tres douce et sucree",
    image: "/packets/lebiau/packet-carrot-robver.png", unlocked: true,
    stageDurations: [9,22,24,55], realDaysToHarvest: 110,
    optimalTemp: [15,22], waterNeed: 4.0, lightNeed: 6,
  },
  {
    id: "lettuce-chene",
    plantDefId: "lettuce",
    shopId: "lebiau",
    name: "Laitue Feuille de Chene",
    emoji: "🥬",
    price: 30, grams: 0.3,
    description: "feuilles tendres et lobees, resistante a la chaleur",
    image: "/packets/lebiau/packet-lettuce-chene.png", unlocked: true,
    stageDurations: [4,10,12,24], realDaysToHarvest: 50,
    optimalTemp: [12,20], waterNeed: 3.5, lightNeed: 6,
  },
  {
    id: "bean-coco",
    plantDefId: "bean",
    shopId: "lebiau",
    name: "Haricot Coco Blanc",
    emoji: "🫘",
    price: 35, grams: 0.4,
    description: "Haricot blanc nain, grainier et savoureux",
    image: "/packets/lebiau/packet-bean-coco.png", unlocked: true,
    stageDurations: [6,14,18,30], realDaysToHarvest: 68,
    optimalTemp: [16,24], waterNeed: 4.5, lightNeed: 8,
  },
  {
    id: "cabbage-milan",
    plantDefId: "cabbage",
    shopId: "lebiau",
    name: "Chou de Milan",
    emoji: "🥬",
    price: 40, grams: 0.3,
    description: "Chou pommele rustique, resistant au froid",
    image: "/packets/lebiau/packet-cabbage-milan.png", unlocked: true,
    stageDurations: [7,20,28,70], realDaysToHarvest: 125,
    optimalTemp: [12,18], waterNeed: 4.0, lightNeed: 6,
  },
  // Sainte Marthe — Aromatiques et autres
  {
    id: "basil-marseillais",
    plantDefId: "basil",
    shopId: "saintemarthe",
    name: "Basilic Marseillais",
    emoji: "🌿",
    price: 50, grams: 0.2,
    description: "Le meilleur basilic pour le pistou,Tres parfume",
    image: "/packets/sainte-marthe/packet-basil-marseillais.png", unlocked: true,
    stageDurations: [6,16,18,38], realDaysToHarvest: 78,
    optimalTemp: [20,27], waterNeed: 4.0, lightNeed: 6,
  },
  {
    id: "strawberry-ciflorette",
    plantDefId: "strawberry",
    shopId: "saintemarthe",
    name: "Fraise Ciflorette",
    emoji: "🍓",
    price: 70, grams: 0.2,
    description: "Fraise allongee tres douce et sucree, originate du Gers",
    image: "/packets/sainte-marthe/packet-strawberry-ciflorette.png", unlocked: true,
    stageDurations: [14,24,30,58], realDaysToHarvest: 126,
    optimalTemp: [14,22], waterNeed: 4.5, lightNeed: 7,
  },
  // Arbres fruitiers — Guignard & INRAE
  {
    id: "apple-golden",
    plantDefId: "apple",
    shopId: "guignard",
    name: "Pommier Golden Delicious",
    emoji: "🍎",
    price: 150, grams: 0.5,
    description: "Variete classic, chair douce et juteuse, Bonne conservation",
    image: "/pots/guignard/pot-apple-golden.png", unlocked: true,
    stageDurations: [30,60,120,360], realDaysToHarvest: 730,
    optimalTemp: [8,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "apple-gala",
    plantDefId: "apple",
    shopId: "guignard",
    name: "Pommier Gala",
    emoji: "🍎",
    price: 160, grams: 0.5,
    description: "Variete croquante et sucree,tres瑞 populaire",
    image: "/pots/guignard/pot-apple-gala.png", unlocked: true,
    stageDurations: [28,56,110,340], realDaysToHarvest: 700,
    optimalTemp: [8,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "pear-williams",
    plantDefId: "pear",
    shopId: "guignard",
    name: "Poirier Williams",
    emoji: "🍐",
    price: 170, grams: 0.5,
    description: "Variete tres瑞 ancienne, chair fondante et parfumee",
    image: "/pots/guignard/pot-pear-williams.png", unlocked: true,
    stageDurations: [30,65,130,380], realDaysToHarvest: 800,
    optimalTemp: [10,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "cherry-bing",
    plantDefId: "cherry",
    shopId: "inrae",
    name: "Cerisier Bing",
    emoji: "🍒",
    price: 180, grams: 0.4,
    description: "Cerise rouge fonce, chair ferme et tres douce et sucree",
    image: "/pots/inrae/cherry-bing-pot.png", unlocked: true,
    stageDurations: [35,70,140,420], realDaysToHarvest: 900,
    optimalTemp: [10,24], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "walnut-franquette",
    plantDefId: "walnut",
    shopId: "inrae",
    name: "Noyer Franquette",
    emoji: "🥜",
    price: 120, grams: 0.4,
    description: "Noix de Grenoble, amande parfumee et peu de cerne",
    image: "/packets/inrae/packet-walnut-franquette.png", unlocked: true,
    stageDurations: [40,90,200,600], realDaysToHarvest: 1095,
    optimalTemp: [8,24], waterNeed: 4.5, lightNeed: 6,
  },
  // INRAE - Chene
  {
    id: "oak-pedoncule",
    plantDefId: "oak",
    shopId: "inrae",
    name: "Chene Pedoncule",
    emoji: "🌳",
    price: 120, grams: 2.0,
    description: "Chene commun des forets francaises, croissance lente, bois noble",
    image: "/packets/inrae/packet-oak-pedoncule.png", unlocked: true,
    stageDurations: [60,120,180,1095], realDaysToHarvest: 1455,
    optimalTemp: [8,22], waterNeed: 4.0, lightNeed: 7,
  },
  // Pepinieres Bordas
  {
    id: "maple-acer-platanoides",
    plantDefId: "maple",
    shopId: "pepinieres-bordas",
    name: "Erable Plane",
    emoji: "🍁",
    price: 140, grams: 1.5,
    description: "Erable majestueux, feuillage dore en automne",
    image: "/packets/pepinieres-bordas/packet-maple-platanoides.png", unlocked: true,
    stageDurations: [50,100,150,900], realDaysToHarvest: 1200,
    optimalTemp: [10,22], waterNeed: 4.5, lightNeed: 7,
  },
  // INRAE - Chene
  // Pepinieres Bordas - Arbres d'ornement
  {
    id: "birch-betula",
    plantDefId: "birch",
    shopId: "pepinieres-bordas",
    name: "Bouleau Blanc",
    emoji: "🌲",
    price: 110, grams: 0.8,
    description: "Ecorce blanche decorative, croissance rapide, resistant au froid",
    image: "/packets/pepinieres-bordas/packet-birch-white.png", unlocked: true,
    stageDurations: [40,80,120,730], realDaysToHarvest: 970,
    optimalTemp: [5,20], waterNeed: 4.0, lightNeed: 6,
  },
  {
    id: "pine-sylvestris",
    plantDefId: "pine",
    shopId: "pepinieres-bordas",
    name: "Pin Sylvestre",
    emoji: "🌲",
    price: 100, grams: 1.0,
    description: "Conifere rustique, ecorce orangee, ideal haies brise-vent",
    image: "/packets/pepinieres-bordas/packet-pine-sylvestris.png", unlocked: true,
    stageDurations: [60,120,200,1095], realDaysToHarvest: 1475,
    optimalTemp: [8,20], waterNeed: 3.5, lightNeed: 8,
  },
  {
    id: "magnolia-grandiflora",
    plantDefId: "magnolia",
    shopId: "pepinieres-bordas",
    name: "Magnolia Grandiflora",
    emoji: "🌸",
    price: 180, grams: 2.0,
    description: "Fleurs blanches geantes parfumees, feuillage persistant luisant",
    image: "/packets/pepinieres-bordas/packet-magnolia-grandiflora.png", unlocked: true,
    stageDurations: [70,140,250,1200], realDaysToHarvest: 1660,
    optimalTemp: [12,25], waterNeed: 5.0, lightNeed: 7,
  },
  // Arbres Tissot - Pommiers et Poiriers specialises
  {
    id: "apple-reine-reinettes",
    plantDefId: "apple",
    shopId: "arbres-tissot",
    name: "Pommier Reine des Reinettes",
    emoji: "🍎",
    price: 155, grams: 0.6,
    description: "Variete ancienne rustique, pommes parfumees, excellente conservation",
    image: "/pots/arbres-tissot/pot-apple-reine-reinettes.png", unlocked: true,
    stageDurations: [30,60,120,380], realDaysToHarvest: 750,
    optimalTemp: [8,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "apple-belle-fleur",
    plantDefId: "apple",
    shopId: "arbres-tissot",
    name: "Pommier Belle Fleur",
    emoji: "🍎",
    price: 150, grams: 0.6,
    description: "Pommes jaunes douces, floraison spectaculaire, tres productive",
    image: "/pots/arbres-tissot/pot-apple-belle-fleur.png", unlocked: true,
    stageDurations: [28,58,115,360], realDaysToHarvest: 720,
    optimalTemp: [8,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "pear-conference",
    plantDefId: "pear",
    shopId: "arbres-tissot",
    name: "Poirier Conference",
    emoji: "🍐",
    price: 165, grams: 0.7,
    description: "Variete anglaise, chair fondante et sucree, autofertile",
    image: "/pots/arbres-tissot/pot-pear-conference.png", unlocked: true,
    stageDurations: [32,65,130,400], realDaysToHarvest: 820,
    optimalTemp: [10,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "pear-louise-bonne",
    plantDefId: "pear",
    shopId: "arbres-tissot",
    name: "Poirier Louise Bonne",
    emoji: "🍐",
    price: 160, grams: 0.7,
    description: "Poire ancienne fondante, chair blanche juteuse, tres parfumee",
    image: "/pots/arbres-tissot/pot-pear-louise-bonne.png", unlocked: true,
    stageDurations: [30,62,125,390], realDaysToHarvest: 800,
    optimalTemp: [10,22], waterNeed: 5.0, lightNeed: 7,
  },
  // Fruitiers Forest - Fruits a noyau et specialites
  {
    id: "apricot-bergeron",
    plantDefId: "apricot",
    shopId: "fruitiers-forest",
    name: "Abricotier Bergeron",
    emoji: "🍑",
    price: 170, grams: 0.8,
    description: "Variete du Roussillon, fruits gros et parfumes, chair ferme",
    image: "/packets/fruitiers-forest/packet-apricot-bergeron.png", unlocked: true,
    stageDurations: [35,70,140,420], realDaysToHarvest: 850,
    optimalTemp: [10,25], waterNeed: 4.5, lightNeed: 8,
  },
  {
    id: "plum-reine-claude",
    plantDefId: "plum",
    shopId: "fruitiers-forest",
    name: "Prunier Reine Claude",
    emoji: "🍑",
    price: 145, grams: 0.6,
    description: "Prune verte doree, chair sucree et fondante, variete royale",
    image: "/packets/fruitiers-forest/packet-plum-reine-claude.png", unlocked: true,
    stageDurations: [28,56,110,340], realDaysToHarvest: 680,
    optimalTemp: [10,24], waterNeed: 4.5, lightNeed: 7,
  },
  {
    id: "fig-goutte-or",
    plantDefId: "fig",
    shopId: "fruitiers-forest",
    name: "Figuier Goutte d'Or",
    emoji: "🫐",
    price: 135, grams: 0.5,
    description: "Figues jaunes tres sucrees, chair rose, bifere",
    image: "/packets/fruitiers-forest/packet-fig-goutte-or.png", unlocked: true,
    stageDurations: [40,80,160,500], realDaysToHarvest: 950,
    optimalTemp: [12,28], waterNeed: 4.0, lightNeed: 8,
  },
  {
    id: "peach-sanguine",
    plantDefId: "peach",
    shopId: "fruitiers-forest",
    name: "Pecher Sanguine de Savoie",
    emoji: "🍑",
    price: 160, grams: 0.7,
    description: "Peche chair rouge sang, sucree et parfumee, variete ancienne",
    image: "/packets/fruitiers-forest/packet-peach-sanguine.png", unlocked: true,
    stageDurations: [32,65,130,400], realDaysToHarvest: 820,
    optimalTemp: [10,26], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "quince-champion",
    plantDefId: "quince",
    shopId: "fruitiers-forest",
    name: "Cognassier Champion",
    emoji: "🍋",
    price: 125, grams: 0.6,
    description: "Coings gros et parfumes, ideal gelees et pates de fruits",
    image: "/packets/fruitiers-forest/packet-quince-champion.png", unlocked: true,
    stageDurations: [35,70,140,420], realDaysToHarvest: 850,
    optimalTemp: [10,24], waterNeed: 4.5, lightNeed: 7,
  },
  // Leaderplant - Arbres etarbustes de haie
  {
    id: "photinia-panache-louise",
    plantDefId: "photinia",
    shopId: "leaderplant",
    name: "Photinia panaché 'Louise'",
    emoji: "🌿",
    price: 85, grams: 0,
    description: "Feuillage panaché vert et crème, port compact, ideal haie decorate",
    image: "/pots/leaderplant/pot-photinia-louise.png", unlocked: true,
    stageDurations: [21,40,60,90], realDaysToHarvest: 211,
    optimalTemp: [5,30], waterNeed: 3.0, lightNeed: 6,
  },
  {
    id: "photinia-carre-rouge",
    plantDefId: "photinia",
    shopId: "leaderplant",
    name: "Photinia Carré Rouge",
    emoji: "🌿",
    price: 80, grams: 0,
    description: "Jeunes feuilles rouge intense, cultivar français très colore",
    image: "/pots/leaderplant/pot-photinia-carre-rouge.png", unlocked: true,
    stageDurations: [21,40,60,90], realDaysToHarvest: 211,
    optimalTemp: [5,30], waterNeed: 3.0, lightNeed: 6,
  },
  {
    id: "eleagnus-gilt-edge",
    plantDefId: "eleagnus",
    shopId: "leaderplant",
    name: "Eleagnus 'Gilt Edge'",
    emoji: "🌾",
    price: 75, grams: 0,
    description: "Feuillage doré très lumineux, croissance rapide, très rustique",
    image: "/pots/leaderplant/pot-eleagnus-gilt-edge.png", unlocked: true,
    stageDurations: [21,45,60,90], realDaysToHarvest: 216,
    optimalTemp: [5,35], waterNeed: 2.5, lightNeed: 6,
  },
  {
    id: "photinia-red-robin",
    plantDefId: "photinia",
    shopId: "leaderplant",
    name: "Photinia Red Robin",
    emoji: "🌿",
    price: 70, grams: 0,
    description: "Le plus populaire, jeunes pousses rouge vif, persistant",
    image: "/pots/leaderplant/pot-photinia-red-robin.png", unlocked: true,
    stageDurations: [21,40,60,90], realDaysToHarvest: 211,
    optimalTemp: [5,30], waterNeed: 3.0, lightNeed: 6,
  },
  {
    id: "eleagnus-viveleg",
    plantDefId: "eleagnus",
    shopId: "leaderplant",
    name: "Eleagnus panaché Viveleg",
    emoji: "🌾",
    price: 78, grams: 0,
    description: "Feuillage panaché argenté, port vigoureux, bord de mer ok",
    image: "/pots/leaderplant/pot-eleagnus-viveleg.png", unlocked: true,
    stageDurations: [21,45,60,90], realDaysToHarvest: 216,
    optimalTemp: [5,35], waterNeed: 2.5, lightNeed: 6,
  },
  {
    id: "photinia-red-select",
    plantDefId: "photinia",
    shopId: "leaderplant",
    name: "Photinia Red Select",
    emoji: "🌿",
    price: 72, grams: 0,
    description: "Selection pour couleur rouge plus intense et reguliere",
    image: "/pots/leaderplant/pot-photinia-red-select.png", unlocked: true,
    stageDurations: [21,40,60,90], realDaysToHarvest: 211,
    optimalTemp: [5,30], waterNeed: 3.0, lightNeed: 6,
  },
  {
    id: "laurus-sauce",
    plantDefId: "laurus",
    shopId: "leaderplant",
    name: "Laurier Sauce",
    emoji: "🌿",
    price: 65, grams: 0,
    description: "Aromatique classique, feuilles pour cuisine, arbuste persistant",
    image: "/pots/leaderplant/pot-laurus-sauce.png", unlocked: true,
    stageDurations: [21,50,70,100], realDaysToHarvest: 241,
    optimalTemp: [5,30], waterNeed: 3.0, lightNeed: 5,
  },
  {
    id: "eleagnus-chalef",
    plantDefId: "eleagnus",
    shopId: "leaderplant",
    name: "Eleagnus - Chalef",
    emoji: "🌾",
    price: 60, grams: 0,
    description: "Espèce type, rustique -20°C, tolérance vent et sec",
    image: "/pots/leaderplant/pot-eleagnus-chalef.png", unlocked: true,
    stageDurations: [21,45,60,90], realDaysToHarvest: 216,
    optimalTemp: [5,35], waterNeed: 2.5, lightNeed: 6,
  },
  {
    id: "ragouminier",
    plantDefId: "eleagnus",
    shopId: "leaderplant",
    name: "Argousier / Ragouminier",
    emoji: "🫐",
    price: 95, grams: 0,
    description: "Baies orange très vitaminées, plante pionnière, fixateur d'azote",
    image: "/pots/leaderplant/pot-ragouminier.png", unlocked: true,
    stageDurations: [21,45,60,90], realDaysToHarvest: 216,
    optimalTemp: [5,35], waterNeed: 2.5, lightNeed: 6,
  },
  {
    id: "cornouillier",
    plantDefId: "cornus",
    shopId: "leaderplant",
    name: "Cornouillier",
    emoji: "🌸",
    price: 90, grams: 0,
    description: "Floraison printanière blanche, berries rouges décoratifs, haie libre",
    image: "/pots/leaderplant/pot-cornouillier.png", unlocked: true,
    stageDurations: [21,45,70,100], realDaysToHarvest: 236,
    optimalTemp: [5,28], waterNeed: 3.5, lightNeed: 6,
  },
  {
    id: "poirier-londres",
    plantDefId: "pear",
    shopId: "leaderplant",
    name: "Poirier Londres",
    emoji: "🍐",
    price: 165, grams: 0.7,
    description: "Variété anglaise chair fondante, productive, mauvaise conservation",
    image: "/pots/leaderplant/pot-poirier-londres.png", unlocked: true,
    stageDurations: [30,62,130,400], realDaysToHarvest: 822,
    optimalTemp: [10,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "pommier-ambroise",
    plantDefId: "apple",
    shopId: "leaderplant",
    name: "Pommier Ambroise de Lesogra",
    emoji: "🍎",
    price: 175, grams: 0.6,
    description: "Colonnaire, arbre compact ideal balcon et petit jardin, fruits croquants",
    image: "/pots/leaderplant/pot-pommier-ambroise.png", unlocked: true,
    stageDurations: [28,55,110,350], realDaysToHarvest: 730,
    optimalTemp: [8,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "prunier-atlanta",
    plantDefId: "plum",
    shopId: "leaderplant",
    name: "Prunier colonnaire Atlanta",
    emoji: "🍑",
    price: 170, grams: 0.7,
    description: "Colonnaire, fruits rouges sombres, chair jaune, autofertile, ideal petit jardin",
    image: "/pots/leaderplant/pot-prunier-atlanta.png", unlocked: true,
    stageDurations: [28,55,115,365], realDaysToHarvest: 763,
    optimalTemp: [8,25], waterNeed: 4.5, lightNeed: 7,
  },
  {
    id: "casseille",
    plantDefId: "casseille",
    shopId: "leaderplant",
    name: "Casseille",
    emoji: "🫐",
    price: 88, grams: 0,
    description: "Hybride groseillier x cassissier, baies noires sans pepins, très productif",
    image: "/pots/leaderplant/pot-casseille.png", unlocked: true,
    stageDurations: [18,30,40,60], realDaysToHarvest: 148,
    optimalTemp: [5,25], waterNeed: 4.0, lightNeed: 6,
  },
  // Arbres Tissot - Pommiers et Poiriers specialises
  // Fruitiers Forest - Fruits a noyau et specialites
];

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  unlocked: boolean;
  icon: string;
  dateUnlocked?: number;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "green_thumb", name: "Main Verte", desc: "Récolter 50 plantes", unlocked: false, icon: "🌱" },
  { id: "weather_master", name: "Maître Météo", desc: "Jouer sous la pluie 5 fois", unlocked: false, icon: "🌧️" },
  { id: "night_owl", name: "Hibou", desc: "Jouer après 22h", unlocked: false, icon: "🦉" },
];

export interface SeedItem {
  id: string;
  plantDefId: string;
  name: string;
  emoji: string;
  price: number;
  brand: string;         // Fournisseur (Vilmorin, Clause…)
  packetImage: string;   // Image packet/paquet avec marque
  cardImage: string;    // Image de la seed card
  realDaysToHarvest: number;
  optimalMonths: number[];
  category: "vegetable" | "fruit-tree" | "aromatic";
}

// Seed packets avec marque fournisseur — par categorie
export const SEED_CATALOG: SeedItem[] = [
  // Graines classiques (paquets generiques)
  { id:"seed-tomato",     plantDefId:"tomato",     name:"Paquet Graines Tomate",   emoji:"🍅", price:50, brand:"Vilmorin",  packetImage:"/packets/card-tomato.png",     cardImage:"/cards/card-tomato.png",     realDaysToHarvest:109, optimalMonths:[2,3,4],        category:"vegetable" },
  { id:"seed-carrot",     plantDefId:"carrot",     name:"Paquet Graines Carotte",  emoji:"🥕", price:40, brand:"Clause",    packetImage:"/packets/card-carrot.png",     cardImage:"/cards/card-carrot.png",     realDaysToHarvest:114, optimalMonths:[2,3,4,5,8,9],  category:"vegetable" },
  { id:"seed-strawberry", plantDefId:"strawberry", name:"Paquet Graines Fraise",   emoji:"🍓", price:60, brand:"Truffaut",  packetImage:"/packets/card-strawberry.png", cardImage:"/cards/card-strawberry.png", realDaysToHarvest:123, optimalMonths:[2,3,4,8,9],    category:"vegetable" },
  { id:"seed-lettuce",    plantDefId:"lettuce",    name:"Paquet Graines Salade",   emoji:"🥬", price:30, brand:"Jardiland", packetImage:"/packets/card-lettuce.png",    cardImage:"/cards/card-lettuce.png",    realDaysToHarvest:49,  optimalMonths:[1,2,3,4,8,9,10], category:"vegetable" },
  { id:"seed-basil",      plantDefId:"basil",      name:"Paquet Graines Basilic",  emoji:"🌿", price:45, brand:"St Marthe", packetImage:"/packets/card-basil.png",      cardImage:"/cards/card-basil.png",      realDaysToHarvest:88,  optimalMonths:[3,4,5],        category:"aromatic" },
  { id:"seed-pepper",     plantDefId:"pepper",     name:"Paquet Graines Piment",   emoji:"🌶️", price:55, brand:"Kokopelli", packetImage:"/packets/card-pepper.png",     cardImage:"/cards/card-pepper.png",     realDaysToHarvest:130, optimalMonths:[1,2,3,4],      category:"vegetable" },
];

// Auto-resolve image path from item id + type (new items auto-get their path)
export function resolveItemImage(itemId: string, type: string): string {
  if (type === "variety") return "/cards/" + itemId + ".png";
  if (type === "seed")    return "/packets/" + itemId + ".png";
  if (type === "plantule") return "/cards/" + itemId + ".png";
  return "/cards/card-unknown.png";
}
export function resolvePacketImage(id: string): string { return "/packets/" + id + ".png"; }
export function resolveCardImage(id: string): string { return "/cards/" + id + ".png"; }

// Auto-assign brand from shop or plant type
export const DEFAULT_BRANDS = ["Vilmorin","Clause","Truffaut","Jardiland","St Marthe","Kokopelli","Biau Germe","Guignard","INRAE"];
export function autoBrandFor(plantDefId: string, shopId?: string): string {
  if (shopId) { const s = SEED_SHOPS.find((x) => x.id === shopId); if (s) return s.name; }
  const m: Record<string,string> = {tomato:"Vilmorin",carrot:"Clause",lettuce:"Jardiland",strawberry:"Truffaut",basil:"St Marthe",pepper:"Kokopelli",apple:"Guignard",pear:"Guignard",cherry:"INRAE",walnut:"INRAE",oak:"INRAE"};
  return m[plantDefId] || DEFAULT_BRANDS[Math.floor(Math.random() * DEFAULT_BRANDS.length)];
}

// Auto image path for any new boutique item
export function autoImagePath(itemId: string, type: string): string {
  const slug = itemId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  return type === "packet" ? "/packets/" + slug + ".png" : "/cards/" + slug + ".png";
}

// Equipment cards
export const EQUIPMENT_CARDS = [
  { id:"greenhouse",     name:"Serre de Jardin",          emoji:"🏠", cardImage:"/equipment/serre-de-jardin.png",  type:"serre" },
  { id:"mini-serre",     name:"Mini Serre (24 slots)",    emoji:"🌱", cardImage:"/cards/card-mini-serre.png",     type:"equipment" },
  { id:"chambre-small",  name:"Chambre de Culture 60cm",  emoji:"📦", cardImage:"/cards/card-chambre-small.png",  type:"equipment" },
  { id:"chambre-medium", name:"Chambre de Culture 80cm",  emoji:"📦", cardImage:"/cards/card-chambre-medium.png", type:"equipment" },
  { id:"chambre-large",  name:"Chambre de Culture 120cm", emoji:"🛖", cardImage:"/cards/card-chambre-large.png",  type:"equipment" },
];

export interface PlantuleItem {
  plantDefId: string;
  name: string;
  emoji: string;
  price: number;
}

export const PLANTULE_CATALOG: PlantuleItem[] = [
  { plantDefId: "tomato", name: "Plantule Tomate", emoji: "🍅", price: 80 },
  { plantDefId: "carrot", name: "Plantule Carotte", emoji: "🥕", price: 65 },
  { plantDefId: "strawberry", name: "Plantule Fraise", emoji: "🍓", price: 85 },
  { plantDefId: "lettuce", name: "Plantule Salade", emoji: "🥬", price: 50 },
  { plantDefId: "basil", name: "Plantule Basilic", emoji: "🌿", price: 70 },
  { plantDefId: "pepper", name: "Plantule Piment", emoji: "🌶️", price: 75 },
];

// ═══ Custom cards loader (from admin panel) ═══
export async function loadCustomCards(): Promise<{
  customShops: SeedShop[];
  customVarieties: SeedVariety[];
  customPlantules: PlantuleItem[];
  customSeeds: SeedItem[];
}> {
  try {
    const res = await fetch("/data/custom-cards.json?t=" + Date.now());
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    return {
      customShops: (data.shops || []) as SeedShop[],
      customVarieties: (data.varieties || []) as SeedVariety[],
      customPlantules: (data.plantules || []) as PlantuleItem[],
      customSeeds: (data.seeds || []) as SeedItem[],
    };
  } catch {
    return { customShops: [], customVarieties: [], customPlantules: [], customSeeds: [] };
  }
}

// ═══ Game state ═══

export interface HologramSettings {
  rotationEnabled: boolean;
  rotationSpeed: number;
  auraIntensity: number;
  particlesEnabled: boolean;
}

export interface GameState {
  // Jardin (coordinate-based, cm)
  gardenWidthCm: number;
  gardenHeightCm: number;
  gardenPlants: GardenPlant[];
  gardenSerreZones: SerreZone[];
  gardenTrees: GardenTree[];
  gardenHedges: GardenHedge[];
  gardenTanks: GardenTank[];
  gardenSheds: GardenShed[];
  gardenDrums: GardenDrum[];
  gardenZones: GardenZone[];

  // Pépinière (seedling nursery)
  pepiniere: PlantState[];

  // Mini Serres in Chambre de Culture
  miniSerres: MiniSerre[];

  // Chambre de Culture
  ownedChambres: Record<string, number>; // modelId -> count owned
  activeChambreId: string | null;

  // Nursery Selection
  selectedMiniSerreId: string | null;
  selectedSlot: { row: number; col: number } | null;

  // Hologram Visual Settings
  hologramSettings: HologramSettings;

  // Serre tile inventory
  serreTiles: number;


  // Seed collection
  seedCollection: Record<string, number>;

  // Plantule collection
  plantuleCollection: Record<string, number>;

  // Seed varieties collection
  seedVarieties: Record<string, number>; // varietyId -> count owned

  // Weather
  day: number;
  season: string;
  weather: WeatherData;
  realWeather: RealWeatherData | null;
  gpsCoords: GPSCoords | null;
  weatherLoading: boolean;
  weatherError: string | null;

  // Economy
  coins: number;
  ecoPoints: number;  // Points écologiques gagnés via gestes réels
  ecoLevel: number;   // Niveau écologique (0-10) basé sur ecoPoints cumulés

  // Game controls
  speed: number;
  isPaused: boolean;
  alerts: AlertData[];
  harvested: number;
  showConsole: boolean;
  score: number;
  bestScore: number;
  adminOpen: boolean;
  adminMode: boolean;
  diseasesEnabled: boolean;
  showGardenSerre: boolean;
  showSerreView: boolean;
  activeTab: string;
  pendingTransplant: { serreId: string; row: number; col: number; plantDefId: string; plantName: string; plantEmoji: string } | null;

  // ── Save System ──
  activeSlot: string | null;
  autoSaveEnabled: boolean;

  // Actions
  initGame: (freshStart?: boolean) => void;
  buySeeds: (itemIdOrPlantDefId: string) => boolean;
  buyPlantule: (plantDefId: string) => boolean;
  buySeedVariety: (varietyId: string) => boolean;
  unlockSeedVariety: (varietyId: string) => boolean;
  buySerreTile: () => boolean;
  buyMiniSerre: () => boolean;
  buyChambreDeCulture: (modelId: string) => boolean;
  setActiveChambre: (modelId: string | null) => void;
  placeSeedInPepiniere: (plantDefId: string) => boolean;
  placePlantuleInPepiniere: (plantDefId: string) => boolean;
  placePlantInGarden: (plantDefId: string, x: number, y: number, pepIndex?: number) => boolean;
  placeRowInGarden: (plantDefId: string, startX: number, startY: number, endX: number, endY: number, pepIndices?: number[]) => number;
  removePlantFromGarden: (plantId: string) => void;
  waterPlantGarden: (plantId: string) => void;
  treatPlantGarden: (plantId: string) => void;
  fertilizePlantGarden: (plantId: string) => void;
  harvestPlantGarden: (plantId: string) => void;
  waterAllGarden: () => void;
  addSerreZone: (x: number, y: number, width: number, height: number, price?: number) => boolean;
  buySerreZone: () => boolean;
  buyShed: (cost: number) => boolean;
  buyTank: (capacity: number, cost: number) => boolean;
  buyTree: (cost: number) => boolean;
  buyHedge: (cost: number) => boolean;
  buyDrum: (cost: number) => boolean;
  removeSerreZone: (zoneId: string) => void;
  removeGardenShed: (id: string) => void;
  removeGardenTank: (id: string) => void;
  removeGardenDrum: (id: string) => void;
  removeGardenTree: (id: string) => void;
  removeGardenHedge: (id: string) => void;
  removeGardenZone: (id: string) => void;
  moveSerreZone: (zoneId: string, newX: number, newY: number) => void;
  moveGardenPlant: (plantId: string, newX: number, newY: number) => void;
  moveGardenShed: (id: string, newX: number, newY: number) => void;
  moveGardenTank: (id: string, newX: number, newY: number) => void;
  moveGardenDrum: (id: string, newX: number, newY: number) => void;
  moveGardenTree: (id: string, newX: number, newY: number) => void;
  moveGardenHedge: (id: string, newX: number, newY: number) => void;
  moveGardenZone: (id: string, newX: number, newY: number) => void;
  addGardenZone: (x: number, y: number, width: number, height: number, type?: GardenZone['type']) => void;
  expandGarden: (direction: 'width' | 'height') => boolean;
  waterPlantPepiniere: (index: number) => void;
  treatPlantPepiniere: (index: number) => void;
  fertilizePlantPepiniere: (index: number) => void;
  removePlantPepiniere: (index: number) => void;
  // Mini Serre actions
  placeSeedInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => boolean;
  placePlantuleInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => boolean;
  waterMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  treatMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  fertilizeMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  removeMiniSerrePlant: (serreId: string, row: number, col: number) => void;
  waterAllMiniSerre: (serreId: string) => void;
  removeMiniSerre: (serreId: string) => void;
  fillMiniSerre: (serreId: string, plantDefId: string) => boolean;
  plantInMiniSerreAtDate: (serreId: string, row: number, col: number, plantDefId: string, daysSincePlanting: number) => boolean;

  // Internal seed helpers (unified inventory)
  _getSeedCount: (plantDefId: string) => number;
  _consumeSeed: (plantDefId: string) => { source: 'variety' | 'classic'; newVarieties: Record<string, number> | null; newCollection: Record<string, number> | null } | null;

  togglePause: () => void;
  setSpeed: (speed: number) => void;
  toggleConsole: () => void;
  dismissAlert: (alertId: string) => void;
  toggleAdminMode: () => void;
  toggleDiseases: () => void;
  toggleGardenSerre: () => void;
  toggleSerreView: () => void;
  setActiveTab: (tab: string) => void;
  setPendingTransplant: (data: { serreId: string; row: number; col: number; plantDefId: string; plantName: string; plantEmoji: string } | null) => void;
  transplantFromMiniSerreToGarden: (serreId: string, row: number, col: number, gardenX: number, gardenY: number) => boolean;
  setSelectedSlot: (serreId: string, slot: { row: number; col: number } | null) => void;
  updateHologramSettings: (settings: Partial<HologramSettings>) => void;
  tick: () => void;
  addScore: (points: number) => void;
  addEcoPoints: (points: number) => void;

  // Jumeau Numérique - GrainTag sync
  createDigitalTwinInGarden: (
    plantDefId: string,
    x: number,
    y: number,
    scanData: {
      plantName: string;
      confidence: number;
      growthStage?: { stage: number; estimatedAge: number };
      healthStatus?: { isHealthy: boolean; diseaseName: string };
    }
  ) => { success: boolean; message: string; rewards: any };

  // Weather
  setRealWeather: (data: RealWeatherData) => void;
  setGPSCoords: (coords: GPSCoords) => void;
  setWeatherLoading: (loading: boolean) => void;
  setWeatherError: (error: string | null) => void;

  // ── Save Actions ──
  setActiveSlot: (slotId: string | null) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  loadGameState: (state: any) => void;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Track last saved day to avoid spamming localStorage
let lastSavedDay = 0;

// ═══ Persistence ═══

// Time Persistence: sync game day with real elapsed time
function loadDay(): number {
  if (typeof window === 'undefined') return getTodayDayOfYear();
  try {
    const savedDay = parseInt(localStorage.getItem('jardin-culture-day') || '', 10);
    const savedTs = parseInt(localStorage.getItem('jardin-culture-day-ts') || '', 10);
    if (isNaN(savedDay) || isNaN(savedTs)) return getTodayDayOfYear();
    const elapsedMs = Date.now() - savedTs;
    const elapsedDays = Math.floor(elapsedMs / 86_400_000);
    // Cap bonus days to prevent huge jumps (max 3 days catch-up)
    const bonusDays = Math.max(0, Math.min(elapsedDays, 3));
    const newDay = savedDay + bonusDays;
    // If we've crossed into a new year or jumped too far, reset to today
    const today = getTodayDayOfYear();
    if (newDay > 365 || newDay < 1 || Math.abs(newDay - today) > 30) {
      return today;
    }
    return newDay;
  } catch { return getTodayDayOfYear(); }
}

function saveDay(day: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('jardin-culture-day', String(day));
    localStorage.setItem('jardin-culture-day-ts', String(Date.now()));
  } catch { /* ignore */ }
}

function loadCoins(): number {
  if (typeof window === "undefined") return 200;
  try {
    return parseInt(localStorage.getItem("jardin-culture-coins") || "200", 10);
  } catch {
    return 200;
  }
}

function saveCoins(coins: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-coins", String(coins));
  } catch {
    // ignore
  }
}

function loadSeedCollection(): Record<string, number> {
  const defaults = { tomato: 3, carrot: 2, strawberry: 2, lettuce: 3, basil: 2, pepper: 1 };
  if (typeof window === "undefined") return { ...defaults };
  try {
    const stored = localStorage.getItem("jardin-culture-seeds");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        // Remove any keys with value <= 0
        for (const key of Object.keys(parsed)) {
          if ((parsed as Record<string, number>)[key] <= 0) {
            delete (parsed as Record<string, number>)[key];
          }
        }
        const values = Object.values(parsed as Record<string, number>);
        const total = values.reduce((a: number, b: number) => a + b, 0);
        if (total > 0) return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { ...defaults };
}

function saveSeedCollection(collection: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-seeds", JSON.stringify(collection));
  } catch {
    // ignore
  }
}

function loadPlantuleCollection(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("jardin-culture-plantules");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
}

function savePlantuleCollection(collection: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-plantules", JSON.stringify(collection));
  } catch {
    // ignore
  }
}

function loadEcoPoints(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem('jardin-culture-eco-points') || '0', 10);
  } catch {
    return 0;
  }
}

function loadEcoLevel(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem('jardin-culture-eco-level') || '0', 10);
  } catch {
    return 0;
  }
}

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem("jardin-culture-best-score") || "0", 10);
  } catch {
    return 0;
  }
}

function saveBestScore(score: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-best-score", String(score));
  } catch {
    // ignore
  }
}

function loadSerreTiles(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem("jardin-culture-serre-tiles") || "0", 10);
  } catch {
    return 0;
  }
}

function saveSerreTiles(count: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-serre-tiles", String(count));
  } catch {
    // ignore
  }
}

function loadOwnedChambres(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("jardin-culture-chambres");
    if (stored) return JSON.parse(stored);
  } catch { }
  return {};
}

function saveOwnedChambres(chambres: Record<string, number>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("jardin-culture-chambres", JSON.stringify(chambres)); } catch { }
}

function loadActiveChambre(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("jardin-culture-active-chambre") || null;
  } catch { }
  return null;
}

function saveActiveChambre(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem("jardin-culture-active-chambre", id);
    else localStorage.removeItem("jardin-culture-active-chambre");
  } catch { }
}

function saveHologramSettings(settings: HologramSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-hologram-settings", JSON.stringify(settings));
  } catch { }
}

function loadHologramSettings(): HologramSettings {
  const defaults: HologramSettings = {
    rotationEnabled: true,
    rotationSpeed: 0.01,
    auraIntensity: 0.8,
    particlesEnabled: true,
  };
  if (typeof window === "undefined") return { ...defaults };
  try {
    const stored = localStorage.getItem("jardin-culture-hologram-settings");
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch { }
  return { ...defaults };
}

function saveNurserySelection(serreId: string | null, slot: { row: number; col: number } | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-selected-serre", serreId || "");
    localStorage.setItem("jardin-culture-selected-slot", JSON.stringify(slot));
  } catch { }
}

function loadNurserySelection(): { serreId: string | null; slot: { row: number; col: number } | null } {
  if (typeof window === "undefined") return { serreId: null, slot: null };
  try {
    const serreId = localStorage.getItem("jardin-culture-selected-serre");
    const slotStr = localStorage.getItem("jardin-culture-selected-slot");
    return {
      serreId: serreId || null,
      slot: slotStr ? JSON.parse(slotStr) : null,
    };
  } catch { }
  return { serreId: null, slot: null };
}

function loadGardenDimensions(): { widthCm: number; heightCm: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-garden-dims");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function saveGardenDimensions(widthCm: number, heightCm: number) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("jardin-culture-garden-dims", JSON.stringify({ widthCm, heightCm })); } catch { }
}

function loadGardenPlants(): GardenPlant[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-garden-plants");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function saveGardenPlants(plants: GardenPlant[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("jardin-culture-garden-plants", JSON.stringify(plants)); } catch { }
}

function saveGardenTanks(tanks: GardenTank[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("jardin-culture-tanks", JSON.stringify(tanks)); } catch { }
}

function loadGardenTanks(): GardenTank[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-tanks");
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function loadGardenDrums(): GardenDrum[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-drums");
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function loadGardenZones(): GardenZone[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-zones");
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function loadGardenSerreZones(): SerreZone[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-garden-serres");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function saveGardenSerreZones(zones: SerreZone[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("jardin-culture-garden-serres", JSON.stringify(zones)); } catch { }
}

function loadPepiniere(): PlantState[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-pepiniere");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function savePepiniere(pepiniere: PlantState[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-pepiniere", JSON.stringify(pepiniere));
  } catch {
    // ignore
  }
}

function loadMiniSerres(): MiniSerre[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("jardin-culture-mini-serres");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function saveMiniSerres(miniSerres: MiniSerre[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-mini-serres", JSON.stringify(miniSerres));
  } catch {
    // ignore
  }
}

function loadSeedVarieties(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("jardin-culture-seed-varieties");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
}

function saveSeedVarieties(varieties: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-seed-varieties", JSON.stringify(varieties));
  } catch {
    // ignore
  }
}

function loadActiveSlot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("jardin-culture-active-slot");
  } catch {
    return null;
  }
}

function saveActiveSlot(slotId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (slotId) {
      localStorage.setItem("jardin-culture-active-slot", slotId);
    } else {
      localStorage.removeItem("jardin-culture-active-slot");
    }
  } catch { /* ignore */ }
}

function loadAutoSaveEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem("jardin-culture-auto-save");
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function saveAutoSaveEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jardin-culture-auto-save", String(enabled));
  } catch { /* ignore */ }
}

// ═══ Helpers ═══

const MAX_PEPINIERE_SLOTS = 8;
const EXPAND_COST = 100;

// ═══ Store ═══

export const useGameStore = create<GameState>((set, get) => ({
  gardenWidthCm: DEFAULT_GARDEN_WIDTH_CM,
  gardenHeightCm: DEFAULT_GARDEN_HEIGHT_CM,
  gardenPlants: [],
  gardenSerreZones: [],
  gardenTrees: [],
  gardenHedges: [],
  gardenTanks: [],
  gardenSheds: [],
  gardenDrums: [],
  gardenZones: [],
  selectedMiniSerreId: null,
  selectedSlot: null,
  hologramSettings: { rotationEnabled: true, rotationSpeed: 1, auraIntensity: 0.5, particlesEnabled: true },
  pepiniere: [],
  miniSerres: [],
  ownedChambres: {},
  activeChambreId: null,
  serreTiles: 0,
  seedCollection: { tomato: 3, carrot: 2, strawberry: 2, lettuce: 3, basil: 2, pepper: 1 },
  plantuleCollection: {},
  seedVarieties: {},

  day: loadDay(),
  season: getSeason(getTodayDayOfYear()),
  weather: WEATHER_TYPES["sunny"],
  realWeather: null,
  gpsCoords: null,
  weatherLoading: false,
  weatherError: null,

  coins: 200,
  ecoPoints: 0,
  ecoLevel: 0,
  speed: 0,  // 0 = pause (speed desactivee par defaut)
  isPaused: false,
  alerts: [],
  harvested: 0,
  showConsole: true,
  score: 0,
  bestScore: 0,
  adminOpen: false,
  adminMode: false,
  diseasesEnabled: true,
  showGardenSerre: false,
  showSerreView: false,
  activeTab: "jardin",
  pendingTransplant: null,

  // ── Save System ──
  activeSlot: loadActiveSlot(),
  autoSaveEnabled: loadAutoSaveEnabled(),

  initGame: (freshStart = false) => {
    const today = getTodayDayOfYear();
    const todaySeason = getSeason(today);

    // If fresh start, clear all saved data
    if (freshStart) {
      const keysToRemove = [
        "jardin-culture-coins",
        "jardin-culture-seeds",
        "jardin-culture-plantules",
        "jardin-culture-seed-varieties",
        "jardin-culture-garden-plants",
        "jardin-culture-garden-serres",
        "jardin-culture-garden-dims",
        "jardin-culture-pepiniere",
        "jardin-culture-mini-serres",
        "jardin-culture-serre-tiles",
        "jardin-culture-chambres",
        "jardin-culture-active-chambre",
        "jardin-culture-day",
        "jardin-culture-day-ts",
        "jardin-culture-best-score",
        "jardin-culture-garden",
        "jardin-culture-hologram-settings",
        "jardin-culture-selected-serre",
        "jardin-culture-selected-slot",
      ];
      keysToRemove.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
    }

    const savedGardenDims = loadGardenDimensions();
    const savedGardenPlants = loadGardenPlants();
    const savedGardenSerreZones = loadGardenSerreZones();
    const savedPepiniere = loadPepiniere();
    const savedMiniSerres = loadMiniSerres();
    const { serreId: savedSerreId, slot: savedSlot } = loadNurserySelection();

    // Clear old grid data
    try { localStorage.removeItem("jardin-culture-garden"); } catch { /* ignore */ }

    // Check if there's saved garden data — if so, load it instead of demo
    const hasSavedGarden = savedGardenPlants && savedGardenPlants.length > 0;
    const testPlants: GardenPlant[] = hasSavedGarden
      ? (savedGardenPlants || [])
      : [
          {
            id: 'test-1',
            plantDefId: 'tomato',
            x: 50,
            y: 50,
            plant: { ...createInitialPlantState('tomato'), stage: 3, waterLevel: 65, daysSincePlanting: 19 } as PlantState,
          },
          {
            id: 'test-2',
            plantDefId: 'tomato',
            x: 150,
            y: 50,
            plant: { ...createInitialPlantState('tomato'), stage: 2, waterLevel: 25, daysSincePlanting: 16 } as PlantState,
          },
          {
            id: 'test-3',
            plantDefId: 'tomato',
            x: 250,
            y: 50,
            plant: { ...createInitialPlantState('tomato'), stage: 5, waterLevel: 80, daysSincePlanting: 35 } as PlantState,
          },
          {
            id: 'test-4',
            plantDefId: 'tomato',
            x: 50,
            y: 150,
            plant: { ...createInitialPlantState('tomato'), stage: 1, waterLevel: 45, daysSincePlanting: 5 } as PlantState,
          },
          {
            id: 'test-5',
            plantDefId: 'tomato',
            x: 150,
            y: 150,
            plant: { ...createInitialPlantState('tomato'), stage: 6, waterLevel: 55, daysSincePlanting: 45, isHarvestable: true } as PlantState,
          },
        ];

    set({
      gardenWidthCm: savedGardenDims?.widthCm || DEFAULT_GARDEN_WIDTH_CM,
      gardenHeightCm: savedGardenDims?.heightCm || DEFAULT_GARDEN_HEIGHT_CM,
      gardenPlants: testPlants,
      gardenSerreZones: savedGardenSerreZones || [],
      gardenTrees: [],
      gardenHedges: [],
      gardenTanks: loadGardenTanks() || [],
      gardenSheds: [],
      gardenDrums: loadGardenDrums() || [],
      gardenZones: loadGardenZones() || [],
      pepiniere: savedPepiniere || [],
      miniSerres: savedMiniSerres || [],
      serreTiles: loadSerreTiles(),
      ownedChambres: loadOwnedChambres(),
      activeChambreId: loadActiveChambre(),
      seedCollection: loadSeedCollection(),
      plantuleCollection: loadPlantuleCollection(),
      seedVarieties: loadSeedVarieties(),
      day: loadDay(),
      season: todaySeason,
      weather: generateWeatherForMonth(getMonthFromDay(today)),
      alerts: [],
      harvested: 0,
      isPaused: false,
      speed: 0,  // 0 = pause (speed desactivee par defaut)
      score: 0,
      bestScore: loadBestScore(),
      coins: loadCoins(),
      ecoPoints: loadEcoPoints(),
      ecoLevel: loadEcoLevel(),
      selectedMiniSerreId: savedSerreId,
      selectedSlot: savedSlot,
      hologramSettings: loadHologramSettings(),
    });
  },

  // ── Shop ──

  buySeeds: (itemIdOrPlantDefId: string) => {
    const state = get();
    const item = SEED_CATALOG.find((s) => s.id === itemIdOrPlantDefId || s.plantDefId === itemIdOrPlantDefId);
    if (!item) return false;
    if (state.coins < item.price) return false;

    const key = item.id;
    const newCollection = { ...state.seedCollection };
    newCollection[key] = (newCollection[key] || 0) + Math.ceil(item.price / 15);
    const newCoins = state.coins - item.price;

    saveCoins(newCoins);
    saveSeedCollection(newCollection);

    set({ coins: newCoins, seedCollection: newCollection });
    return true;
  },

  buyPlantule: (plantDefId: string) => {
    const state = get();
    const item = PLANTULE_CATALOG.find((p) => p.plantDefId === plantDefId);
    if (!item) return false;
    if (state.coins < item.price) return false;

    const newCollection = { ...state.plantuleCollection };
    newCollection[plantDefId] = (newCollection[plantDefId] || 0) + 1;
    const newCoins = state.coins - item.price;

    saveCoins(newCoins);
    savePlantuleCollection(newCollection);

    set({ coins: newCoins, plantuleCollection: newCollection });
    return true;
  },

  buySeedVariety: (varietyId: string) => {
    const state = get();
    const variety = SEED_VARIETIES.find((v) => v.id === varietyId);
    if (!variety) return false;
    if (state.coins < variety.price) return false;

    // Unlock the variety card on first purchase
    if (!variety.unlocked) {
      variety.unlocked = true;
    }

    const newVarieties = { ...state.seedVarieties };
    newVarieties[varietyId] = (newVarieties[varietyId] || 0) + 1;
    const newCoins = state.coins - variety.price;

    // Also add to seedCollection so the seed is usable in mini serres & jardin
    const newCollection = { ...state.seedCollection };
     (variety.seedCount || 1);
    saveSeedCollection(newCollection);

    saveCoins(newCoins);
    saveSeedVarieties(newVarieties);

    set({ coins: newCoins, seedVarieties: newVarieties, seedCollection: newCollection });
    return true;
  },

  unlockSeedVariety: (varietyId: string) => {
    const variety = SEED_VARIETIES.find((v) => v.id === varietyId);
    if (!variety) return false;
    if (variety.unlocked) return true;

    variety.unlocked = true;
    return true;
  },

  buySerreTile: () => {
    const state = get();
    if (state.coins < 50) return false;

    const newCoins = state.coins - 50;
    const newCount = state.serreTiles + 1;

    saveCoins(newCoins);
    saveSerreTiles(newCount);

    set({ coins: newCoins, serreTiles: newCount });
    return true;
  },

  buyMiniSerre: () => {
    const state = get();
    if (state.coins < MINI_SERRE_PRICE) return false;

    const newCoins = state.coins - MINI_SERRE_PRICE;
    const newMiniSerre = createEmptyMiniSerre();
    const newMiniSerres = [...state.miniSerres, newMiniSerre];

    saveCoins(newCoins);
    saveMiniSerres(newMiniSerres);

    set({ coins: newCoins, miniSerres: newMiniSerres });
    return true;
  },

  buyChambreDeCulture: (modelId: string) => {
    const state = get();
    const model = CHAMBRE_CATALOG.find((m) => m.id === modelId);
    if (!model) return false;
    if (state.coins < model.price) return false;

    const newCoins = state.coins - model.price;
    const newOwned = { ...state.ownedChambres };
    newOwned[modelId] = (newOwned[modelId] || 0) + 1;

    saveCoins(newCoins);
    saveOwnedChambres(newOwned);

    // Auto-set as active if first purchase
    const newActive = state.activeChambreId || modelId;
    saveActiveChambre(newActive);

    set({ coins: newCoins, ownedChambres: newOwned, activeChambreId: newActive });
    return true;
  },

  setActiveChambre: (modelId: string | null) => {
    saveActiveChambre(modelId);
    set({ activeChambreId: modelId });
  },

  // ── Pépinière Actions ──

  placeSeedInPepiniere: (plantDefId: string) => {
    const state = get();
    if (state.pepiniere.length >= MAX_PEPINIERE_SLOTS) return false;
    const count = state.seedCollection[plantDefId] || 0;
    if (count <= 0) return false;

    const newCollection = { ...state.seedCollection };
    newCollection[plantDefId] = count - 1;
    if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
    saveSeedCollection(newCollection);

    const newPlant: PlantState = createInitialPlantState(plantDefId);
    const newPepiniere = [...state.pepiniere, newPlant];
    savePepiniere(newPepiniere);

    set({ pepiniere: newPepiniere, seedCollection: newCollection });
    return true;
  },

  placePlantuleInPepiniere: (plantDefId: string) => {
    const state = get();
    if (state.pepiniere.length >= MAX_PEPINIERE_SLOTS) return false;
    const count = state.plantuleCollection[plantDefId] || 0;
    if (count <= 0) return false;

    const newCollection = { ...state.plantuleCollection };
    newCollection[plantDefId] = count - 1;
    if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
    savePlantuleCollection(newCollection);

    const newPlant: PlantState = {
      ...createInitialPlantState(plantDefId),
      stage: 1,
      growthProgress: 60,
      daysSincePlanting: 20,
      daysInCurrentStage: 10,
    };
    const newPepiniere = [...state.pepiniere, newPlant];
    savePepiniere(newPepiniere);

    set({ pepiniere: newPepiniere, plantuleCollection: newCollection });
    return true;
  },

  waterPlantPepiniere: (index: number) => {
    set((s) => {
      const newPep = [...s.pepiniere];
      if (newPep[index]) {
        newPep[index] = applyWatering(newPep[index]);
        savePepiniere(newPep);
      }
      return { pepiniere: newPep };
    });
  },

  treatPlantPepiniere: (index: number) => {
    set((s) => {
      const newPep = [...s.pepiniere];
      if (newPep[index]) {
        newPep[index] = applyTreatment(newPep[index]);
        savePepiniere(newPep);
      }
      return { pepiniere: newPep };
    });
  },

  fertilizePlantPepiniere: (index: number) => {
    set((s) => {
      const newPep = [...s.pepiniere];
      if (newPep[index]) {
        newPep[index] = applyFertilizer(newPep[index]);
        savePepiniere(newPep);
      }
      return { pepiniere: newPep };
    });
  },

  removePlantPepiniere: (index: number) => {
    set((s) => {
      const newPep = s.pepiniere.filter((_, i) => i !== index);
      savePepiniere(newPep);
      return { pepiniere: newPep };
    });
  },

  // ── Mini Serre Actions ──

  /** Get total seed count for a plant type across both inventories */
  _getSeedCount: (plantDefId: string): number => {
    const state = get();
    const classicCount = state.seedCollection[plantDefId] || 0;
    const varietyCount = SEED_VARIETIES
      .filter((v) => v.plantDefId === plantDefId)
      .reduce((sum, v) => sum + (state.seedVarieties[v.id] || 0), 0);
    return classicCount + varietyCount;
  },

  /** Consume one seed from the best available source (variety first, then classic) */
  _consumeSeed: (plantDefId: string) => {
    const state = get();
    // Try variety first (most specific)
    const matchingVarieties = SEED_VARIETIES.filter((v) => v.plantDefId === plantDefId);
    for (const v of matchingVarieties) {
      if ((state.seedVarieties[v.id] || 0) > 0) {
        const newVarieties = { ...state.seedVarieties };
        newVarieties[v.id] = (newVarieties[v.id] || 0) - 1;
        if (newVarieties[v.id] <= 0) delete newVarieties[v.id];
        saveSeedVarieties(newVarieties);
        return { source: 'variety' as const, newVarieties, newCollection: null as Record<string, number> | null };
      }
    }
    // Fall back to classic seedCollection
    const count = state.seedCollection[plantDefId] || 0;
    if (count > 0) {
      const newCollection = { ...state.seedCollection };
      newCollection[plantDefId] = count - 1;
      if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
      saveSeedCollection(newCollection);
      return { source: 'classic' as const, newVarieties: null, newCollection };
    }
    return null;
  },

  placeSeedInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => {
    const state = get();
    const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
    if (serreIdx < 0) return false;
    const serre = state.miniSerres[serreIdx];
    if (serre.slots[row]?.[col] !== null) return false;

    const consumed = state._consumeSeed(plantDefId);
    if (!consumed) return false;

    const newPlant: PlantState = createInitialPlantState(plantDefId);
    const newMiniSerres = state.miniSerres.map((s, i) => {
      if (i !== serreIdx) return s;
      const newSlots = s.slots.map((r) => r.map((c) => c));
      newSlots[row][col] = newPlant;
      return { ...s, slots: newSlots };
    });
    saveMiniSerres(newMiniSerres);

    const updates: Record<string, unknown> = { miniSerres: newMiniSerres };
    if (consumed.newCollection) updates.seedCollection = consumed.newCollection;
    if (consumed.newVarieties) updates.seedVarieties = consumed.newVarieties;
    set(updates);
    return true;
  },

  placePlantuleInMiniSerre: (serreId: string, row: number, col: number, plantDefId: string) => {
    const state = get();
    const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
    if (serreIdx < 0) return false;
    const serre = state.miniSerres[serreIdx];
    if (serre.slots[row]?.[col] !== null) return false;
    const count = state.plantuleCollection[plantDefId] || 0;
    if (count <= 0) return false;

    const newCollection = { ...state.plantuleCollection };
    newCollection[plantDefId] = count - 1;
    if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
    savePlantuleCollection(newCollection);

    const newPlant: PlantState = {
      ...createInitialPlantState(plantDefId),
      stage: 1,
      growthProgress: 60,
      daysSincePlanting: 20,
      daysInCurrentStage: 10,
    };

    const newMiniSerres = state.miniSerres.map((s, i) => {
      if (i !== serreIdx) return s;
      const newSlots = s.slots.map((r) => r.map((c) => c));
      newSlots[row][col] = newPlant;
      return { ...s, slots: newSlots };
    });
    saveMiniSerres(newMiniSerres);

    set({ miniSerres: newMiniSerres, plantuleCollection: newCollection });
    return true;
  },

  waterMiniSerrePlant: (serreId: string, row: number, col: number) => {
    set((s) => {
      const newMiniSerres = s.miniSerres.map((serre) => {
        if (serre.id !== serreId) return serre;
        const plant = serre.slots[row]?.[col];
        if (!plant) return serre;
        const newSlots = serre.slots.map((r) => r.map((c) => c));
        newSlots[row][col] = applyWatering(plant);
        return { ...serre, slots: newSlots };
      });
      saveMiniSerres(newMiniSerres);
      return { miniSerres: newMiniSerres };
    });
  },

  treatMiniSerrePlant: (serreId: string, row: number, col: number) => {
    set((s) => {
      const newMiniSerres = s.miniSerres.map((serre) => {
        if (serre.id !== serreId) return serre;
        const plant = serre.slots[row]?.[col];
        if (!plant) return serre;
        const newSlots = serre.slots.map((r) => r.map((c) => c));
        newSlots[row][col] = applyTreatment(plant);
        return { ...serre, slots: newSlots };
      });
      saveMiniSerres(newMiniSerres);
      return { miniSerres: newMiniSerres };
    });
  },

  fertilizeMiniSerrePlant: (serreId: string, row: number, col: number) => {
    set((s) => {
      const newMiniSerres = s.miniSerres.map((serre) => {
        if (serre.id !== serreId) return serre;
        const plant = serre.slots[row]?.[col];
        if (!plant) return serre;
        const newSlots = serre.slots.map((r) => r.map((c) => c));
        newSlots[row][col] = applyFertilizer(plant);
        return { ...serre, slots: newSlots };
      });
      saveMiniSerres(newMiniSerres);
      return { miniSerres: newMiniSerres };
    });
  },

  removeMiniSerrePlant: (serreId: string, row: number, col: number) => {
    set((s) => {
      const newMiniSerres = s.miniSerres.map((serre) => {
        if (serre.id !== serreId) return serre;
        if (!serre.slots[row]?.[col]) return serre;
        const newSlots = serre.slots.map((r) => r.map((c) => c));
        newSlots[row][col] = null;
        return { ...serre, slots: newSlots };
      });
      saveMiniSerres(newMiniSerres);
      return { miniSerres: newMiniSerres };
    });
  },

  waterAllMiniSerre: (serreId: string) => {
    set((s) => {
      const newMiniSerres = s.miniSerres.map((serre) => {
        if (serre.id !== serreId) return serre;
        const newSlots = serre.slots.map((r) => r.map((c) => {
          if (c) return applyWatering(c);
          return c;
        }));
        return { ...serre, slots: newSlots };
      });
      saveMiniSerres(newMiniSerres);
      return { miniSerres: newMiniSerres };
    });
  },

  removeMiniSerre: (serreId: string) => {
    set((s) => {
      const newMiniSerres = s.miniSerres.filter((s) => s.id !== serreId);
      saveMiniSerres(newMiniSerres);
      return { miniSerres: newMiniSerres };
    });
  },

  fillMiniSerre: (serreId: string, plantDefId: string) => {
    const state = get();
    const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
    if (serreIdx < 0) return false;
    const serre = state.miniSerres[serreIdx];

    // Count empty slots
    let emptySlots = 0;
    serre.slots.forEach((row) => row.forEach((c) => { if (!c) emptySlots++; }));

    // Count total seeds across both inventories
    const totalSeeds = state._getSeedCount(plantDefId);
    const toFill = Math.min(emptySlots, totalSeeds);
    if (toFill <= 0) return false;

    // Consume seeds from both sources
    let remaining = toFill;
    const newVarieties = { ...state.seedVarieties };
    const matchingVarieties = SEED_VARIETIES.filter((v) => v.plantDefId === plantDefId);
    for (const v of matchingVarieties) {
      if (remaining <= 0) break;
      const available = newVarieties[v.id] || 0;
      const use = Math.min(available, remaining);
      if (use > 0) {
        newVarieties[v.id] = available - use;
        if (newVarieties[v.id] <= 0) delete newVarieties[v.id];
        remaining -= use;
      }
    }
    const newCollection = { ...state.seedCollection };
    if (remaining > 0) {
      const classicAvail = newCollection[plantDefId] || 0;
      const classicUse = Math.min(classicAvail, remaining);
      newCollection[plantDefId] = classicAvail - classicUse;
      if (newCollection[plantDefId] <= 0) delete newCollection[plantDefId];
    }
    saveSeedCollection(newCollection);
    saveSeedVarieties(newVarieties);

    const newMiniSerres = state.miniSerres.map((s, i) => {
      if (i !== serreIdx) return s;
      const newSlots = s.slots.map((r) => r.map((c) => c));
      let placed = 0;
      for (let r = 0; r < newSlots.length && placed < toFill; r++) {
        for (let c = 0; c < newSlots[r].length && placed < toFill; c++) {
          if (!newSlots[r][c]) {
            newSlots[r][c] = createInitialPlantState(plantDefId);
            placed++;
          }
        }
      }
      return { ...s, slots: newSlots };
    });
    saveMiniSerres(newMiniSerres);
    set({ miniSerres: newMiniSerres, seedCollection: newCollection, seedVarieties: newVarieties });
    return true;
  },

  plantInMiniSerreAtDate: (serreId: string, row: number, col: number, plantDefId: string, daysSincePlanting: number) => {
    const state = get();
    const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
    if (serreIdx < 0) return false;
    const serre = state.miniSerres[serreIdx];
    if (serre.slots[row]?.[col] !== null) return false;

    const consumed = state._consumeSeed(plantDefId);
    if (!consumed) return false;

    // Create plant with custom daysSincePlanting to simulate planting at a past date
    const newPlant: PlantState = {
      ...createInitialPlantState(plantDefId),
      daysSincePlanting: daysSincePlanting,
    };

    // Calculate correct stage & growthProgress using the plant's actual stageDurations
    const plantDef = PLANTS[plantDefId];
    if (plantDef) {
      let remaining = daysSincePlanting;
      let targetStage = 0;
      let daysInStage = 0;
      for (let s = 0; s < 4; s++) {
        const dur = plantDef.stageDurations[s];
        if (remaining <= dur) {
          targetStage = s;
          daysInStage = remaining;
          break;
        }
        remaining -= dur;
        if (s === 3) {
          // Plant has completed all stages
          targetStage = 3;
          daysInStage = dur;
        }
      }
      newPlant.stage = targetStage;
      newPlant.daysInCurrentStage = daysInStage;
      // growthProgress = percentage through current stage
      const stageDur = plantDef.stageDurations[targetStage];
      newPlant.growthProgress = stageDur > 0 ? Math.round((daysInStage / stageDur) * 100) : 100;
      // Cap at 100
      if (newPlant.growthProgress >= 100) {
        newPlant.growthProgress = 99;
        // If it's the last stage, mark as harvestable
        if (targetStage === 3) newPlant.isHarvestable = true;
      }
    } else {
      // Fallback if plant definition not found — use simple pepiniere thresholds
      newPlant.daysInCurrentStage = Math.min(daysSincePlanting, 10);
      if (daysSincePlanting >= 45) {
        newPlant.stage = 3; newPlant.growthProgress = 85;
      } else if (daysSincePlanting >= 30) {
        newPlant.stage = 2; newPlant.growthProgress = 60;
      } else if (daysSincePlanting >= 15) {
        newPlant.stage = 1; newPlant.growthProgress = 35;
      } else if (daysSincePlanting >= 5) {
        newPlant.stage = 1; newPlant.growthProgress = 15;
      }
    }

    const newMiniSerres = state.miniSerres.map((s, i) => {
      if (i !== serreIdx) return s;
      const newSlots = s.slots.map((r) => r.map((c) => c));
      newSlots[row][col] = newPlant;
      return { ...s, slots: newSlots };
    });
    saveMiniSerres(newMiniSerres);
    const updates: Record<string, unknown> = { miniSerres: newMiniSerres };
    if (consumed.newCollection) updates.seedCollection = consumed.newCollection;
    if (consumed.newVarieties) updates.seedVarieties = consumed.newVarieties;
    set(updates);
    return true;
  },

  // ── Jardin Actions (coordinate-based) ──

  placePlantInGarden: (plantDefId: string, x: number, y: number, pepIndex?: number) => {
    const state = get();
    const spacing = PLANT_SPACING[plantDefId];
    if (!spacing) return false;

    // Check bounds
    if (x < 0 || y < 0 || x + spacing.plantSpacingCm > state.gardenWidthCm || y + spacing.rowSpacingCm > state.gardenHeightCm) return false;

    // Check for overlap with existing plants
    const overlaps = state.gardenPlants.some((gp) => {
      const s = PLANT_SPACING[gp.plantDefId];
      if (!s) return false;
      return x < gp.x + s.plantSpacingCm && x + spacing.plantSpacingCm > gp.x &&
             y < gp.y + s.rowSpacingCm && y + spacing.rowSpacingCm > gp.y;
    });
    if (overlaps) return false;

    let newPlant: PlantState;
    let newPepiniere = state.pepiniere;
    let newSeedCollection = state.seedCollection;

    if (pepIndex !== undefined && pepIndex >= 0) {
      // Transplant from pepiniere
      const seedling = state.pepiniere[pepIndex];
      if (!seedling) return false;
      // Check frost risk if not in serre zone
      const inSerre = state.gardenSerreZones.some(z =>
        x >= z.x && y >= z.y && x <= z.x + z.width && y <= z.y + z.height
      );
      if (!state.adminMode && !inSerre && state.realWeather && isFrostRisk(state.realWeather)) return false;
      newPlant = seedling;
      newPepiniere = state.pepiniere.filter((_, i) => i !== pepIndex);
      savePepiniere(newPepiniere);
    } else {
      // Direct placement (from seed/plantule inventory)
      // Check seed availability
      const count = state.seedCollection[plantDefId] || 0;
      if (count <= 0) return false;

      // Check frost risk if not in serre zone
      const inSerre = state.gardenSerreZones.some(z =>
        x >= z.x && y >= z.y && x <= z.x + z.width && y <= z.y + z.height
      );
      if (!state.adminMode && !inSerre && state.realWeather && isFrostRisk(state.realWeather)) return false;

      // Consume the seed
      newSeedCollection = { ...state.seedCollection };
      newSeedCollection[plantDefId] = count - 1;
      if (newSeedCollection[plantDefId] <= 0) delete newSeedCollection[plantDefId];
      saveSeedCollection(newSeedCollection);

      newPlant = createInitialPlantState(plantDefId);
    }

    const newGardenPlant: GardenPlant = {
      id: uid(),
      plantDefId,
      x: Math.round(x),
      y: Math.round(y),
      plant: newPlant,
    };

    // 🌿 Crop Rotation & Companionship Check
    const plots = loadPlotHistory();
    const plot = findOrCreatePlot(plots, Math.round(x), Math.round(y));
    const rotation = getPlotRotationSuggestion(plot, plantDefId, state.day);

    // Build alerts
    const newAlerts: AlertData[] = [];

    if (rotation && rotation.type === 'bad') {
      newAlerts.push({
        id: `rotation-warn-${Date.now()}`,
        type: "weather" as const,
        message: `${rotation.emoji} ${rotation.message} (${rotation.reason})`,
        emoji: "⚠️", cellX: 0, cellY: 0,
        timestamp: Date.now(), severity: "warning" as const,
      });
    }

    // Record the planting in rotation history
    recordPlanting(plots, Math.round(x), Math.round(y), plantDefId, state.day);

    // 🌿 Companion Planting Check
    const companionCheck = checkCompanionForNewPlant(
      plantDefId,
      Math.round(x),
      Math.round(y),
      state.gardenPlants.map(gp => ({ plantDefId: gp.plantDefId, x: gp.x, y: gp.y }))
    );

    if (companionCheck.harmful.length > 0) {
      const harm = companionCheck.harmful[0];
      newAlerts.push({
        id: `companion-warn-${Date.now()}`,
        type: "pest" as const,
        message: `⚠️ Mauvais voisinage : ${harm.reason}`,
        emoji: "🤝",
        cellX: 0, cellY: 0,
        timestamp: Date.now(),
        severity: "warning" as const,
      });
    } else if (companionCheck.beneficial.length > 0) {
      const benefit = companionCheck.beneficial[0];
      newAlerts.push({
        id: `companion-ok-${Date.now()}`,
        type: "success" as const,
        message: `✅ Bon voisinage : ${benefit.reason}`,
        emoji: "🌱",
        cellX: 0, cellY: 0,
        timestamp: Date.now(),
        severity: "info" as const,
      });
    }

    const newGardenPlants = [...state.gardenPlants, newGardenPlant];
    saveGardenPlants(newGardenPlants);

    set({
      gardenPlants: newGardenPlants,
      pepiniere: newPepiniere,
      seedCollection: newSeedCollection,
      alerts: newAlerts.length > 0 ? [...state.alerts.slice(-25 + newAlerts.length), ...newAlerts] : state.alerts
    });
    useSoundManager.getState().playEventSound('plant');
    return true;
  },

  placeRowInGarden: (plantDefId: string, startX: number, startY: number, endX: number, endY: number, pepIndices?: number[]) => {
    const state = get();
    const spacing = PLANT_SPACING[plantDefId];
    if (!spacing) return 0;

    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < spacing.plantSpacingCm) return 0;

    const dirX = dx / length;
    const dirY = dy / length;
    const count = Math.floor(length / spacing.plantSpacingCm);

    let placed = 0;
    const newPlants: GardenPlant[] = [];
    const usedPepIndices = pepIndices ? [...pepIndices] : [];

    for (let i = 0; i <= count; i++) {
      const px = Math.round(startX + dirX * i * spacing.plantSpacingCm);
      const py = Math.round(startY + dirY * i * spacing.plantSpacingCm);

      // Check bounds
      if (px < 0 || py < 0 || px + spacing.plantSpacingCm > state.gardenWidthCm || py + spacing.rowSpacingCm > state.gardenHeightCm) continue;

      // Check overlap
      const overlaps = state.gardenPlants.some((gp) => {
        const s = PLANT_SPACING[gp.plantDefId];
        if (!s) return false;
        return px < gp.x + s.plantSpacingCm && px + spacing.plantSpacingCm > gp.x &&
               py < gp.y + s.rowSpacingCm && py + spacing.rowSpacingCm > gp.y;
      }) || newPlants.some((gp) => {
        return px < gp.x + spacing.plantSpacingCm && px + spacing.plantSpacingCm > gp.x &&
               py < gp.y + spacing.rowSpacingCm && py + spacing.rowSpacingCm > gp.y;
      });
      if (overlaps) continue;

      let plantState: PlantState;
      if (usedPepIndices.length > 0) {
        const pepIdx = usedPepIndices.shift()!;
        const seedling = state.pepiniere[pepIdx];
        if (!seedling) continue;
        plantState = seedling;
      } else {
        plantState = createInitialPlantState(plantDefId);
      }

      newPlants.push({
        id: uid(),
        plantDefId,
        x: px,
        y: py,
        plant: plantState,
      });
      placed++;
    }

    if (placed === 0) return 0;

    const newGardenPlants = [...state.gardenPlants, ...newPlants];
    saveGardenPlants(newGardenPlants);

    if (usedPepIndices.length < (pepIndices?.length || 0)) {
      // Some pepiniere plants were used
      const remainingIndices = usedPepIndices;
      const newPepiniere = state.pepiniere.filter((_, i) => !pepIndices!.includes(i) || remainingIndices.includes(i));
      savePepiniere(newPepiniere);
      set({ gardenPlants: newGardenPlants, pepiniere: newPepiniere });
    } else {
      set({ gardenPlants: newGardenPlants });
    }

    return placed;
  },

  removePlantFromGarden: (plantId: string) => {
    set((s) => {
      const newGardenPlants = s.gardenPlants.filter((p) => p.id !== plantId);
      saveGardenPlants(newGardenPlants);
      return { gardenPlants: newGardenPlants };
    });
  },

  // ── Jumeau Numérique (GrainTag sync) ──
  createDigitalTwinInGarden: (plantDefId, x, y, scanData) => {
    const state = get();
    const plantDef = PLANTS[plantDefId];
    if (!plantDef) {
      return {
        success: false,
        message: `❌ Type de plante "${plantDefId}" non reconnu.\n\nPlantes disponibles : tomate, poivron, laitue, carotte, basilic, fraise.`,
        rewards: null
      };
    }
    const spacing = PLANT_SPACING[plantDefId];
    if (!spacing) {
      return { success: false, message: `❌ Pas d'espacement défini pour ${plantDef.name}.`, rewards: null };
    }
    if (x < 0 || y < 0 || x + spacing.plantSpacingCm > state.gardenWidthCm || y + spacing.rowSpacingCm > state.gardenHeightCm) {
      return { success: false, message: `❌ Position hors limites du jardin.\n\nJardin: ${state.gardenWidthCm}×${state.gardenHeightCm}cm`, rewards: null };
    }
    const overlaps = state.gardenPlants.some((gp) => {
      const s = PLANT_SPACING[gp.plantDefId];
      if (!s) return false;
      return x < gp.x + s.plantSpacingCm && x + spacing.plantSpacingCm > gp.x && y < gp.y + s.rowSpacingCm && y + spacing.rowSpacingCm > gp.y;
    });
    if (overlaps) {
      return { success: false, message: `❌ Un autre plant occupe déjà cet emplacement.`, rewards: null };
    }
    const growthStage = scanData.growthStage || { stage: 2, estimatedAge: 15 };
    const healthStatus = scanData.healthStatus || { isHealthy: true, diseaseName: 'Sain' };
    const newPlant: PlantState = {
      ...createInitialPlantState(plantDefId),
      stage: Math.min(5, growthStage.stage),
      daysSincePlanting: growthStage.estimatedAge,
      daysInCurrentStage: Math.min(10, growthStage.estimatedAge),
      health: healthStatus.isHealthy ? 85 : 60,
      hasDisease: !healthStatus.isHealthy,
      diseaseDays: healthStatus.isHealthy ? 0 : 3,
      waterLevel: 70,
      fertilizerLevel: 50,
    };
    const newGardenPlant: GardenPlant = {
      id: uid(),
      plantDefId,
      x: Math.round(x),
      y: Math.round(y),
      plant: newPlant,
    };
    const newGardenPlants = [...state.gardenPlants, newGardenPlant];
    saveGardenPlants(newGardenPlants);
    const rewards = { coins: 50, xp: 100, bonusSeeds: null as { plantDefId: string; count: number } | null };
    if (scanData.confidence > 0.8) { rewards.coins += 25; rewards.xp += 50; }
    if (growthStage.stage >= 4) {
      rewards.bonusSeeds = { plantDefId, count: 3 };
      const newCollection = { ...state.seedCollection };
      newCollection[plantDefId] = (newCollection[plantDefId] || 0) + 3;
      saveSeedCollection(newCollection);
      set({ seedCollection: newCollection });
    }
    const newCoins = state.coins + rewards.coins;
    saveCoins(newCoins);
    const alerts = [...state.alerts.slice(-25), { id: `twin-${Date.now()}`, type: "success" as const, message: `✨ ${plantDef.emoji} ${plantDef.name} ajouté au jardin !`, emoji: "🌱", cellX: 0, cellY: 0, timestamp: Date.now(), severity: "info" as const }];
    set({ gardenPlants: newGardenPlants, coins: newCoins, alerts });
    useSoundManager.getState().playEventSound('plant');
    triggerVisualEffect("success-pop");
    return {
      success: true,
      message: `✅ Jumeau numérique planté !\n\n🌱 ${plantDef.emoji} ${plantDef.name}\n📍 Position: ${Math.round(x)}cm × ${Math.round(y)}cm\n📊 Stade ${growthStage.stage}/5 (${growthStage.estimatedAge}j)\n💚 Santé : ${healthStatus.isHealthy ? 'Saine ✅' : '⚠️ ' + healthStatus.diseaseName}\n\n🎁 Récompenses :\n  • +${rewards.coins} 🪙 pièces\n  • +${rewards.xp} ⭐ XP\n${rewards.bonusSeeds ? `  • +3 graines ${plantDef.emoji}` : ''}\n\nRetrouve ton plant dans la Vue Plan du Jardin !`,
      rewards,
    };
  },

  waterPlantGarden: (plantId: string) => {
    set((s) => {
      const newGardenPlants = s.gardenPlants.map((gp) => {
        if (gp.id !== plantId) return gp;
        return { ...gp, plant: applyWatering(gp.plant) };
      });
      saveGardenPlants(newGardenPlants);
      return { gardenPlants: newGardenPlants };
    });
  },

  treatPlantGarden: (plantId: string) => {
    set((s) => {
      const newGardenPlants = s.gardenPlants.map((gp) => {
        if (gp.id !== plantId) return gp;
        return { ...gp, plant: applyTreatment(gp.plant) };
      });
      saveGardenPlants(newGardenPlants);
      return { gardenPlants: newGardenPlants };
    });
  },

  fertilizePlantGarden: (plantId: string) => {
    set((s) => {
      const newGardenPlants = s.gardenPlants.map((gp) => {
        if (gp.id !== plantId) return gp;
        return { ...gp, plant: applyFertilizer(gp.plant) };
      });
      saveGardenPlants(newGardenPlants);
      return { gardenPlants: newGardenPlants };
    });
  },

  harvestPlantGarden: (plantId: string) => {
    const state = get();
    const gp = state.gardenPlants.find((p) => p.id === plantId);
    if (!gp) return;

    const plantDef = PLANTS[gp.plantDefId];
    const harvestReward = plantDef ? Math.round(plantDef.realDaysToHarvest * 0.5 + 20) : 50;
    const newScore = state.score + 100 + harvestReward;
    const newCoins = state.coins + harvestReward;
    const newBest = Math.max(state.bestScore, newScore);
    if (newBest > state.bestScore) saveBestScore(newBest);
    saveCoins(newCoins);

    const newGardenPlants = state.gardenPlants.filter((p) => p.id !== plantId);
    saveGardenPlants(newGardenPlants);

    const totalHarvested = state.harvested + 1;
    if (totalHarvested >= 50) {
      useAchievementStore.getState().unlockAchievement('green_thumb');
    }

    useSoundManager.getState().playEventSound('harvest');
    triggerVisualEffect("success-pop");

    set({
      gardenPlants: newGardenPlants,
      harvested: totalHarvested,
      score: newScore,
      bestScore: newBest,
      coins: newCoins,
      alerts: [
        ...state.alerts.slice(-25),
        {
          id: `harvest-reward-${Date.now()}`,
          type: "harvest" as const,
          message: `${plantDef?.harvestEmoji || "🌿"} Récolte ! +${harvestReward} 🪙 pièces`,
          emoji: "💰", cellX: 0, cellY: 0,
          timestamp: Date.now(), severity: "info" as const,
        },
      ],
    });
  },

  waterAllGarden: () => {
    set((s) => {
      const newGardenPlants = s.gardenPlants.map((gp) => ({
        ...gp,
        plant: applyWatering(gp.plant),
      }));
      saveGardenPlants(newGardenPlants);
      return { gardenPlants: newGardenPlants };
    });
  },

  addSerreZone: (x: number, y: number, width: number, height: number, price: number = 200) => {
    const state = get();
    if (price > 0 && state.coins < price) return false;
    const newZone: SerreZone = {
      id: uid(),
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    };
    const newZones = [...state.gardenSerreZones, newZone];
    saveGardenSerreZones(newZones);
    const newCoins = price > 0 ? state.coins - price : state.coins;
    if (price > 0) saveCoins(newCoins);
    set({ gardenSerreZones: newZones, showGardenSerre: true, coins: newCoins });
    return true;
  },

  buySerreZone: () => {
    const state = get();
    if (state.coins < 200) return false;
    // Create a default 6m x 4m (600cm x 400cm) serre zone
    const w = 600;
    const h = 400;
    // Place at right side of garden, stacked if multiple serres
    const offsetX = state.gardenSerreZones.length * 20;
    const x = Math.min(state.gardenWidthCm - w - 20, 20 + offsetX);
    const y = 20;
    // Call with price=0 (we handle coins here to avoid double deduction)
    const newZone: SerreZone = {
      id: uid(),
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(w),
      height: Math.round(h),
    };
    const newZones = [...state.gardenSerreZones, newZone];
    saveGardenSerreZones(newZones);
    const newCoins = state.coins - 200;
    saveCoins(newCoins);
    set({ gardenSerreZones: newZones, coins: newCoins, showGardenSerre: true });
    return true;
  },

  buyShed: (cost: number) => {
    const state = get();
    if (state.coins < cost) return false;
    const newShed: GardenShed = {
      id: `shed-${Date.now()}`,
      type: 'tool_shed',
      x: 20,
      y: state.gardenHeightCm - 200,
      width: 200,
      height: 180,
    };
    const newSheds = [...state.gardenSheds, newShed];
    const newCoins = state.coins - cost;
    saveCoins(newCoins);
    set({ gardenSheds: newSheds, coins: newCoins });
    try { localStorage.setItem("jardin-culture-sheds", JSON.stringify(newSheds)); } catch {}
    return true;
  },

  buyTank: (capacity: number, cost: number) => {
    const state = get();
    if (state.coins < cost) return false;
    const newTank: GardenTank = {
      id: `tank-${Date.now()}`,
      type: 'water',
      x: 20 + state.gardenTanks.length * 130,
      y: 20,
      width: 120,
      height: 100,
      capacity,
      currentLevel: 0,
      isRainTank: true,
      roofAreaM2: 30,
      efficiency: 0.8,
    };
    const newTanks = [...state.gardenTanks, newTank];
    const newCoins = state.coins - cost;
    saveCoins(newCoins);
    set({ gardenTanks: newTanks, coins: newCoins });
    try { localStorage.setItem("jardin-culture-tanks", JSON.stringify(newTanks)); } catch {}
    return true;
  },

  buyTree: (cost: number) => {
    const state = get();
    if (state.coins < cost) return false;
    const newTree: GardenTree = {
      id: `tree-${Date.now()}`,
      type: 'apple',
      x: 100 + state.gardenTrees.length * 120,
      y: 200,
      diameter: 100,
      age: 0,
    };
    const newTrees = [...state.gardenTrees, newTree];
    const newCoins = state.coins - cost;
    saveCoins(newCoins);
    set({ gardenTrees: newTrees, coins: newCoins });
    try { localStorage.setItem("jardin-culture-trees", JSON.stringify(newTrees)); } catch {}
    return true;
  },

  buyHedge: (cost: number) => {
    const state = get();
    if (state.coins < cost) return false;
    const newHedge: GardenHedge = {
      id: `hedge-${Date.now()}`,
      type: 'laurel',
      x: 20,
      y: state.gardenHeightCm - 100,
      length: 200,
      orientation: 'horizontal',
      height: 120,
    };
    const newHedges = [...state.gardenHedges, newHedge];
    const newCoins = state.coins - cost;
    saveCoins(newCoins);
    set({ gardenHedges: newHedges, coins: newCoins });
    try { localStorage.setItem("jardin-culture-hedges", JSON.stringify(newHedges)); } catch {}
    return true;
  },

  buyDrum: (cost: number) => {
    const state = get();
    if (state.coins < cost) return false;
    const newDrum: GardenDrum = {
      id: `drum-${Date.now()}`,
      x: 20 + state.gardenDrums.length * 80,
      y: 20,
      width: 60,
      height: 90,
      capacity: 225,
    };
    const newDrums = [...state.gardenDrums, newDrum];
    const newCoins = state.coins - cost;
    saveCoins(newCoins);
    set({ gardenDrums: newDrums, coins: newCoins });
    try { localStorage.setItem("jardin-culture-drums", JSON.stringify(newDrums)); } catch {}
    return true;
  },

  removeSerreZone: (zoneId: string) => {
    const state = get();
    const zone = state.gardenSerreZones.find((z) => z.id === zoneId);
    if (!zone) return;
    const newZones = state.gardenSerreZones.filter((z) => z.id !== zoneId);
    saveGardenSerreZones(newZones);
    set({ gardenSerreZones: newZones });
  },

  removeGardenShed: (id: string) => {
    const state = get();
    const newSheds = state.gardenSheds.filter((s) => s.id !== id);
    set({ gardenSheds: newSheds });
    try { localStorage.setItem("jardin-culture-sheds", JSON.stringify(newSheds)); } catch {}
  },
  removeGardenTank: (id: string) => {
    const state = get();
    const newTanks = state.gardenTanks.filter((t) => t.id !== id);
    set({ gardenTanks: newTanks });
    try { localStorage.setItem("jardin-culture-tanks", JSON.stringify(newTanks)); } catch {}
  },
  removeGardenDrum: (id: string) => {
    const state = get();
    const newDrums = state.gardenDrums.filter((d) => d.id !== id);
    set({ gardenDrums: newDrums });
    try { localStorage.setItem("jardin-culture-drums", JSON.stringify(newDrums)); } catch {}
  },
  removeGardenTree: (id: string) => {
    const state = get();
    const newTrees = state.gardenTrees.filter((t) => t.id !== id);
    set({ gardenTrees: newTrees });
    try { localStorage.setItem("jardin-culture-trees", JSON.stringify(newTrees)); } catch {}
  },
  removeGardenHedge: (id: string) => {
    const state = get();
    const newHedges = state.gardenHedges.filter((h) => h.id !== id);
    set({ gardenHedges: newHedges });
    try { localStorage.setItem("jardin-culture-hedges", JSON.stringify(newHedges)); } catch {}
  },
  removeGardenZone: (id: string) => {
    const state = get();
    const newZones = state.gardenZones.filter((z) => z.id !== id);
    set({ gardenZones: newZones });
    try { localStorage.setItem("jardin-culture-zones", JSON.stringify(newZones)); } catch {}
  },

  /** Déplacer une serre en mode libre — sauvegarde immédiate */
  moveSerreZone: (zoneId: string, newX: number, newY: number) => {
    set((s) => {
      const newZones = s.gardenSerreZones.map((z) =>
        z.id === zoneId
          ? { ...z, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) }
          : z
      );
      saveGardenSerreZones(newZones);
      return { gardenSerreZones: newZones };
    });
  },

  /** Déplacer une plante du jardin en mode libre */
  moveGardenPlant: (plantId: string, newX: number, newY: number) => {
    set((s) => {
      const newPlants = s.gardenPlants.map((gp) =>
        gp.id === plantId
          ? { ...gp, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) }
          : gp
      );
      saveGardenPlants(newPlants);
      return { gardenPlants: newPlants };
    });
  },

  moveGardenShed: (id: string, newX: number, newY: number) => {
    set((s) => {
      const newSheds = s.gardenSheds.map((sh) =>
        sh.id === id ? { ...sh, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : sh
      );
      try { localStorage.setItem("jardin-culture-sheds", JSON.stringify(newSheds)); } catch {}
      return { gardenSheds: newSheds };
    });
  },
  moveGardenTank: (id: string, newX: number, newY: number) => {
    set((s) => {
      const newTanks = s.gardenTanks.map((t) =>
        t.id === id ? { ...t, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : t
      );
      try { localStorage.setItem("jardin-culture-tanks", JSON.stringify(newTanks)); } catch {}
      return { gardenTanks: newTanks };
    });
  },
  moveGardenDrum: (id: string, newX: number, newY: number) => {
    set((s) => {
      const newDrums = s.gardenDrums.map((d) =>
        d.id === id ? { ...d, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : d
      );
      try { localStorage.setItem("jardin-culture-drums", JSON.stringify(newDrums)); } catch {}
      return { gardenDrums: newDrums };
    });
  },
  moveGardenTree: (id: string, newX: number, newY: number) => {
    set((s) => {
      const newTrees = s.gardenTrees.map((t) =>
        t.id === id ? { ...t, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : t
      );
      try { localStorage.setItem("jardin-culture-trees", JSON.stringify(newTrees)); } catch {}
      return { gardenTrees: newTrees };
    });
  },
  moveGardenHedge: (id: string, newX: number, newY: number) => {
    set((s) => {
      const newHedges = s.gardenHedges.map((h) =>
        h.id === id ? { ...h, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : h
      );
      try { localStorage.setItem("jardin-culture-hedges", JSON.stringify(newHedges)); } catch {}
      return { gardenHedges: newHedges };
    });
  },
  moveGardenZone: (id: string, newX: number, newY: number) => {
    set((s) => {
      const newZones = s.gardenZones.map((z) =>
        z.id === id ? { ...z, x: Math.max(0, Math.round(newX)), y: Math.max(0, Math.round(newY)) } : z
      );
      try { localStorage.setItem("jardin-culture-zones", JSON.stringify(newZones)); } catch {}
      return { gardenZones: newZones };
    });
  },

  addGardenZone: (x: number, y: number, width: number, height: number, type: GardenZone['type'] = 'uncultivated') => {
    const state = get();
    const newZone: GardenZone = { id: `zone-${Date.now()}`, type, x, y, width, height };
    const newZones = [...state.gardenZones, newZone];
    set({ gardenZones: newZones });
    try { localStorage.setItem("jardin-culture-zones", JSON.stringify(newZones)); } catch {}
  },

  expandGarden: (direction: 'width' | 'height') => {
    const state = get();
    if (state.coins < EXPAND_COST) return false;
    const increment = 200; // +200cm = +2m per expansion

    if (direction === 'width') {
      if (state.gardenWidthCm >= MAX_GARDEN_WIDTH_CM) return false;
      const newWidth = Math.min(MAX_GARDEN_WIDTH_CM, state.gardenWidthCm + increment);
      const newCoins = state.coins - EXPAND_COST;
      saveCoins(newCoins);
      saveGardenDimensions(newWidth, state.gardenHeightCm);
      set({ gardenWidthCm: newWidth, coins: newCoins });
    } else {
      if (state.gardenHeightCm >= MAX_GARDEN_HEIGHT_CM) return false;
      const newHeight = Math.min(MAX_GARDEN_HEIGHT_CM, state.gardenHeightCm + increment);
      const newCoins = state.coins - EXPAND_COST;
      saveCoins(newCoins);
      saveGardenDimensions(state.gardenWidthCm, newHeight);
      set({ gardenHeightCm: newHeight, coins: newCoins });
    }
    return true;
  },

  // ── Game Controls ──

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  setSpeed: (speed) => set({ speed }),
  toggleAdminMode: () => set((s) => ({ adminMode: !s.adminMode })),
  toggleDiseases: () => set((s) => ({ diseasesEnabled: !s.diseasesEnabled })),
  toggleGardenSerre: () => set((s) => ({ showGardenSerre: !s.showGardenSerre })),
  toggleSerreView: () => set((s) => ({ showSerreView: !s.showSerreView })),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setPendingTransplant: (data: { serreId: string; row: number; col: number; plantDefId: string; plantName: string; plantEmoji: string } | null) => {
    set({ pendingTransplant: data });
  },
  transplantFromMiniSerreToGarden: (serreId: string, row: number, col: number, gardenX: number, gardenY: number) => {
    const state = get();
    const serreIdx = state.miniSerres.findIndex((s) => s.id === serreId);
    if (serreIdx < 0) return false;
    const serre = state.miniSerres[serreIdx];
    const plant = serre.slots[row]?.[col];
    if (!plant) return false;

    const plantDef = PLANTS[plant.plantDefId];
    if (!plantDef) return false;
    const spacing = PLANT_SPACING[plant.plantDefId];
    if (!spacing) return false;

    // Check garden bounds
    if (gardenX < 0 || gardenY < 0 || gardenX + spacing.plantSpacingCm > state.gardenWidthCm || gardenY + spacing.rowSpacingCm > state.gardenHeightCm) return false;

    // Check for overlap
    const overlaps = state.gardenPlants.some((gp) => {
      const s = PLANT_SPACING[gp.plantDefId];
      if (!s) return false;
      return gardenX < gp.x + s.plantSpacingCm && gardenX + spacing.plantSpacingCm > gp.x &&
             gardenY < gp.y + s.rowSpacingCm && gardenY + spacing.rowSpacingCm > gp.y;
    });
    if (overlaps) return false;

    // Check frost risk if not in serre zone and not admin mode
    const inSerre = state.gardenSerreZones.some(z =>
      gardenX >= z.x && gardenY >= z.y && gardenX <= z.x + z.width && gardenY <= z.y + z.height
    );
    if (!state.adminMode && !inSerre && state.realWeather && isFrostRisk(state.realWeather)) return false;

    // Remove from mini serre
    const newMiniSerres = state.miniSerres.map((s, i) => {
      if (i !== serreIdx) return s;
      const newSlots = s.slots.map((r) => r.map((c) => c));
      newSlots[row][col] = null;
      return { ...s, slots: newSlots };
    });
    saveMiniSerres(newMiniSerres);

    // Add to garden
    const newGardenPlant: GardenPlant = {
      id: uid(),
      plantDefId: plant.plantDefId,
      x: gardenX,
      y: gardenY,
      plant: { ...plant }, // copy the plant state
    };
    const newGardenPlants = [...state.gardenPlants, newGardenPlant];
    saveGardenPlants(newGardenPlants);

    set({ miniSerres: newMiniSerres, gardenPlants: newGardenPlants });
    return true;
  },
  toggleConsole: () => set((s) => ({ showConsole: !s.showConsole })),
  dismissAlert: (aid) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== aid) })),

  addScore: (points: number) => {
    const state = get();
    const newScore = state.score + points;
    const newBest = Math.max(state.bestScore, newScore);
    if (newBest > state.bestScore) saveBestScore(newBest);
    set({ score: newScore, bestScore: newBest });
  },

  addEcoPoints: (points: number) => {
    const state = get();
    const newEcoPoints = state.ecoPoints + points;
    const newEcoLevel = Math.min(10, Math.floor(newEcoPoints / 50)); // 50 pts = 1 niveau
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jardin-culture-eco-points', String(newEcoPoints));
        localStorage.setItem('jardin-culture-eco-level', String(newEcoLevel));
      } catch { /* ignore */ }
    }
    set({ ecoPoints: newEcoPoints, ecoLevel: newEcoLevel });
  },

  setRealWeather: (data: RealWeatherData) => set({ realWeather: data, weatherError: null }),
  setGPSCoords: (coords: GPSCoords) => {
    saveGPSCoords(coords);
    set({ gpsCoords: coords });
  },
  setWeatherLoading: (loading: boolean) => set({ weatherLoading: loading }),
  setWeatherError: (error: string | null) => set({ weatherError: error }),

  // ── Tick ──

  setSelectedSlot: (serreId: string, slot: { row: number; col: number } | null) => {
    const newSerreId = slot ? serreId : null;
    const newSlot = slot;
    saveNurserySelection(newSerreId, newSlot);
    set({ selectedMiniSerreId: newSerreId, selectedSlot: newSlot });
  },
  updateHologramSettings: (settings: Partial<HologramSettings>) => {
    set((s) => {
      const newSettings = { ...s.hologramSettings, ...settings };
      saveHologramSettings(newSettings);
      return { hologramSettings: newSettings };
    });
  },
  tick: () => {
    const state = get();
    if (state.isPaused) return;

    const newDay = state.day + 1;
    const newMonth = getMonthFromDay(newDay);
    const newSeason = getSeason(newDay);
    const newAlerts: AlertData[] = [...state.alerts.slice(-30)];
    let scoreGain = 0;

    // Season change alert
    if (newSeason !== state.season) {
      newAlerts.push({
        id: `season-${Date.now()}`,
        type: "season",
        message: `${getSeasonEmoji(newSeason)} Nouvelle saison : ${getSeasonLabel(newSeason)} ! ${getSeasonalPlantingAdvice(newSeason)}`,
        emoji: getSeasonEmoji(newSeason), cellX: 0, cellY: 0,
        timestamp: Date.now(), severity: "info",
      });
    }

    // Pepiniere environment params (shared for pepiniere + mini serres)
    const pepEnv: RealWeatherParams = {
      temperature: 20,
      humidity: 65,
      sunlightHours: 4.8,
      precipitation: 0,
      windSpeed: 0,
      uvIndex: 2,
      gameWeather: WEATHER_TYPES["sunny"],
      soilQuality: 75,
    };

    // ═══ TICK PÉPINIÈRE ═══
    const newPepiniere = state.pepiniere.map((plant) => {
      const plantDef = PLANTS[plant.plantDefId];
      if (!plantDef) return plant;

      const result = simulateDayWithRealWeather(plantDef, plant, pepEnv, "pepiniere", 0);

      newAlerts.push(...result.alerts.filter(
        (a) => a.type === "stage" || a.type === "harvest" || a.type === "pollinator" || a.severity === "critical"
      ));

      return result.newState;
    });
    savePepiniere(newPepiniere);

    // ═══ TICK MINI SERRES ═══
    const newMiniSerres = state.miniSerres.map((serre) => {
      const newSlots = serre.slots.map((row) =>
        row.map((plant) => {
          if (!plant) return null;
          const plantDef = PLANTS[plant.plantDefId];
          if (!plantDef) return plant;

          const result = simulateDayWithRealWeather(plantDef, plant, pepEnv, "pepiniere", 0);
          newAlerts.push(...result.alerts.filter(
            (a) => a.type === "stage" || a.type === "harvest" || a.type === "pollinator" || a.severity === "critical"
          ));
          return result.newState;
        })
      );
      return { ...serre, slots: newSlots };
    });
    saveMiniSerres(newMiniSerres);

    // Count mini serre plants for scoring
    let miniSerrePlantCount = 0;
    newMiniSerres.forEach((serre) => {
      serre.slots.forEach((row) => {
        row.forEach((plant) => {
          if (plant) miniSerrePlantCount++;
        });
      });
    });

    // ═══ TICK JARDIN ═══
    let livingPlants = 0;
    const newGardenPlants = state.gardenPlants.map((gp) => {
      const plantDef = PLANTS[gp.plantDefId];
      if (!plantDef) return gp;

      livingPlants++;
      let newPlant = { ...gp.plant };
      const inSerre = state.gardenSerreZones.some(z =>
        gp.x >= z.x && gp.y >= z.y && gp.x < z.x + z.width && gp.y < z.y + z.height
      );

      // Frost check for plants NOT in serre (bypassed in admin mode)
      if (!state.adminMode && !inSerre && state.realWeather && isFrostRisk(state.realWeather)) {
        if (state.realWeather.current.temperature < 2) {
          newPlant.health = Math.max(5, newPlant.health - 5);
          newAlerts.push({
            id: `frost-jardin-${Date.now()}-${Math.random()}`,
            type: "weather",
            message: `🥶 Gel sur ${plantDef.emoji} ${plantDef.name} ! Croissance stoppée.`,
            emoji: "🥶", cellX: 0, cellY: 0,
            timestamp: Date.now(), severity: "warning",
          });
          newPlant.waterLevel = Math.max(0, newPlant.waterLevel - 2);
          return { ...gp, plant: newPlant };
        }
      }

      if (state.realWeather) {
        const effectiveZoneId = inSerre ? "serre_tile" : "garden";
        const isRaining = state.realWeather.current?.isRaining || false;
        // Auto-arrosage gratuit quand il pleut (jardin uniquement, pas en serre)
        if (isRaining && !inSerre) {
          newPlant.waterLevel = Math.min(100, newPlant.waterLevel + 50);
        }
        const env = getRealEnvironment(state.realWeather, effectiveZoneId);
        const precipitation = getZonePrecipitation(state.realWeather, effectiveZoneId);
        const weatherType = WEATHER_TYPES[state.realWeather.current?.gameWeather] || WEATHER_TYPES["sunny"];

        const realParams: RealWeatherParams = {
          temperature: env.temperature,
          humidity: env.humidity,
          sunlightHours: env.sunlightHours,
          precipitation,
          windSpeed: state.realWeather.current.windSpeed,
          uvIndex: state.realWeather.today.uvIndex,
          gameWeather: weatherType,
          soilQuality: env.soilQuality,
        };

        const result = simulateDayWithRealWeather(plantDef, newPlant, realParams, effectiveZoneId, 0);
        newAlerts.push(...result.alerts.filter(
          (a) => a.type === "stage" || a.type === "harvest" || a.type === "water" || a.type === "health" || a.type === "pest" || a.type === "disease" || a.type === "pollinator" || a.severity === "critical"
        ));

        if (result.newState.isHarvestable && !newPlant.isHarvestable) scoreGain += 200;
        newPlant = result.newState;
      } else {
        const newWeather = generateWeatherForMonth(newMonth);
        const baseEnv = getEnvironmentWithDailyVariation(getEnvironmentForMonth(newMonth));
        const result = simulateDay(plantDef, newPlant, baseEnv, newWeather, newSeason, 0);
        newAlerts.push(...result.alerts.filter(
          (a) => a.type === "stage" || a.type === "harvest" || a.type === "water" || a.type === "health" || a.type === "pest" || a.type === "disease" || a.type === "pollinator" || a.severity === "critical"
        ));

        if (result.newState.isHarvestable && !newPlant.isHarvestable) scoreGain += 200;
        newPlant = result.newState;
      }

      return { ...gp, plant: newPlant };
    });
    saveGardenPlants(newGardenPlants);

    // Score per living plant per day
    scoreGain += livingPlants;
    scoreGain += newPepiniere.length;
    scoreGain += miniSerrePlantCount;

    const newWeather = state.realWeather
      ? (WEATHER_TYPES[state.realWeather.current?.gameWeather] || WEATHER_TYPES["sunny"])
      : generateWeatherForMonth(newMonth);

    const newScore = state.score + scoreGain;
    const newBest = Math.max(state.bestScore, newScore);
    if (newBest > state.bestScore) saveBestScore(newBest);

    // Achievement Checks
    if (state.realWeather && state.realWeather.current?.isRaining) {
      useAchievementStore.getState().unlockAchievement('weather_master');
    }

    // Check for night owl
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      useAchievementStore.getState().unlockAchievement('night_owl');
    }

    // Update Sound Ambience
    const weatherType = state.realWeather?.current?.gameWeather || 'sunny';
    useSoundManager.getState().updateAmbientState(weatherType, hour);

    // Only save day if it changed (avoid localStorage spam at high speeds)
    if (newDay !== lastSavedDay) {
      saveDay(newDay);
      lastSavedDay = newDay;
    }

    // Admin: diseases toggle — strip all diseases/pests if disabled
    let finalGarden = newGardenPlants;
    let finalPepiniere = newPepiniere;
    let finalMiniSerres = newMiniSerres;
    if (!get().diseasesEnabled) {
      finalGarden = newGardenPlants.map(gp => ({
        ...gp,
        plant: { ...gp.plant, hasDisease: false, hasPest: false, diseaseDays: 0, pestDays: 0 }
      }));
      finalPepiniere = newPepiniere.map(p => ({
        ...p, hasDisease: false, hasPest: false, diseaseDays: 0, pestDays: 0
      }));
      finalMiniSerres = newMiniSerres.map(serre => ({
        ...serre,
        slots: serre.slots.map(row => row.map(p => p ? {
          ...p, hasDisease: false, hasPest: false, diseaseDays: 0, pestDays: 0
        } : null)),
      }));
    }

    // ═══ TICK CUVES — remplissage par la pluie ═══
    const isRaining = state.realWeather?.current?.isRaining || false;
    const precipMm = state.realWeather?.today?.precipitationMm ?? 0;
    const newTanks = state.gardenTanks.map(tank => {
      if (!tank.isRainTank || tank.currentLevel >= tank.capacity) return tank;
      if (!isRaining) return tank;
      // Calcul: precipMm * roofAreaM2 * efficiency / 1000 = litres
      const litersCollected = precipMm * (tank.roofAreaM2 || 30) * (tank.efficiency || 0.8) / 1000;
      const newLevel = Math.min(tank.capacity, tank.currentLevel + litersCollected);
      return { ...tank, currentLevel: newLevel };
    });

    set({
      gardenPlants: finalGarden,
      pepiniere: finalPepiniere,
      miniSerres: finalMiniSerres,
      gardenTanks: newTanks,
      day: newDay,
      season: newSeason,
      weather: newWeather,
      alerts: newAlerts,
      score: newScore,
      bestScore: newBest,
    });
  },

  // ── Save Actions ──
  setActiveSlot: (slotId) => {
    saveActiveSlot(slotId);
    set({ activeSlot: slotId });
  },

  setAutoSaveEnabled: (enabled) => {
    saveAutoSaveEnabled(enabled);
    set({ autoSaveEnabled: enabled });
  },

  loadGameState: (state) => {
    // Restaurer l'état complet depuis une sauvegarde JSON
    const currentState = get();
    set({
      ...state,
      // Ne pas écraser ces champs système
      isPaused: currentState.isPaused,
      speed: currentState.speed,
      showConsole: currentState.showConsole,
      adminOpen: currentState.adminOpen,
    });

    // Sauvegarder dans localStorage pour persistence
    if (state.gardenPlants) saveGardenPlants(state.gardenPlants);
    if (state.pepiniere) savePepiniere(state.pepiniere);
    if (state.gardenTanks) saveGardenTanks(state.gardenTanks);
    if (state.day !== undefined) saveDay(state.day);
    if (state.coins !== undefined) saveCoins(state.coins);
    if (state.bestScore !== undefined) saveBestScore(state.bestScore);
  },

  // ── Garden Objects ──
  addGardenShed: (x: number, y: number) => {
    const state = get();
    const newShed: GardenShed = {
      id: `shed-${Date.now()}`,
      type: 'tool_shed',
      x,
      y,
      width: 200,
      height: 180,
    };
    const newSheds = [...state.gardenSheds, newShed];
    set({ gardenSheds: newSheds });
    try { localStorage.setItem("jardin-culture-sheds", JSON.stringify(newSheds)); } catch {}
  },

  addGardenTank: (x: number, y: number, capacity: number = 1000) => {
    const state = get();
    const newTank: GardenTank = {
      id: `tank-${Date.now()}`,
      type: 'water',
      x,
      y,
      width: 120,
      height: 100,
      capacity,
      currentLevel: 0,
      isRainTank: true,
      roofAreaM2: 30,
      efficiency: 0.8,
    };
    const newTanks = [...state.gardenTanks, newTank];
    set({ gardenTanks: newTanks });
    try { localStorage.setItem("jardin-culture-tanks", JSON.stringify(newTanks)); } catch {}
  },

  addGardenTree: (x: number, y: number, treeType: GardenTree['type'] = 'apple') => {
    const state = get();
    const newTree: GardenTree = {
      id: `tree-${Date.now()}`,
      type: treeType,
      x,
      y,
      diameter: 100,
      age: 0,
    };
    const newTrees = [...state.gardenTrees, newTree];
    set({ gardenTrees: newTrees });
    try { localStorage.setItem("jardin-culture-trees", JSON.stringify(newTrees)); } catch {}
  },

  addGardenHedge: (x: number, y: number, length: number = 200, orientation: 'horizontal' | 'vertical' = 'horizontal') => {
    const state = get();
    const newHedge: GardenHedge = {
      id: `hedge-${Date.now()}`,
      type: 'laurel',
      x,
      y,
      length,
      orientation,
      height: 120,
    };
    const newHedges = [...state.gardenHedges, newHedge];
    set({ gardenHedges: newHedges });
    try { localStorage.setItem("jardin-culture-hedges", JSON.stringify(newHedges)); } catch {}
  },

  addGardenDrum: (x: number, y: number) => {
    const state = get();
    const newDrum: GardenDrum = {
      id: `drum-${Date.now()}`,
      x,
      y,
      width: 60,
      height: 90,
      capacity: 225,
    };
    const newDrums = [...state.gardenDrums, newDrum];
    set({ gardenDrums: newDrums });
    try { localStorage.setItem("jardin-culture-drums", JSON.stringify(newDrums)); } catch {}
  },
}));

// ═══ Serre Tile Zone Modifier ═══
if (!ZONE_MODIFIERS["serre_tile"]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ZONE_MODIFIERS as any)["serre_tile"] = {
    label: "Tuile Serre",
    emoji: "🏡",
    tempMin: null,
    tempMax: null,
    tempMod: 1.15,
    rainMod: 0.3,
    sunlightMod: 1.15,
    humidityMod: 0.9,
    description: "Protection serre: +5°C, -70% pluie, +15% lumière",
  };
}
