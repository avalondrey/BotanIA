/**
 * 🌱 HologramEvolution — Cerveau Botanique
 * =========================================
 *
 * CE MODULE EST INVISIBLE POUR L'UTILISATEUR.
 * C'est le "cerveau" qui contient TOUTES les données botaniques réelles
 * et les fonctions de calcul agronomique.
 *
 * Sources : FAO Crop Coefficients, INRAE, GNIS, semenciers
 *
 * UTILISATION :
 *   import { getPlantCard, calcGDD, getWaterNeed, getCompanions } from './HologramEvolution';
 *
 * POUR AJOUTER UNE PLANTE :
 *   1. Ajouter son PlantCard dans PLANT_CARDS
 *   2. Ajouter ses fonctions de calcul si spécifiques
 *   3. Nothing dans l'UI — tout passe par ici
 */

// ═══════════════════════════════════════════════════════════════
//  TYPES — Définitions des données botaniques
// ═══════════════════════════════════════════════════════════════

export interface PlantCard {
  // Identifiant
  id: string;

  // Catégorie (nouveau)
  plantCategory?: 'vegetable' | 'fruit-tree' | 'forest-tree';

  // Températures seuils (°C)
  tBase: number;      // Température de base — en dessous, croissance nulle
  tCap: number;       // Température plafond — au dessus, stress

  // GDD (Growing Degree Days) — accumulateurs de chaleur
  // [stade0→stade1, stade1→stade2, ...]
  stageGDD: [number, number, number, number];

  // Eau (FAO)
  kc: number;                    // Coefficient cultural (FAO-56)
  waterNeedMmPerDay: number;     // Besoin moyen mm/jour

  // Sol
  minSoilTempForSowing: number;   // Température min du sol pour semis
  optimalSoilTemp: number;        // Température optimale du sol

  // Lumière
  lightNeedHours: number;         // Heures de lumière/jour recommandées

  // Stades de croissance (jours par stade)
  stageDurations: [number, number, number, number];

  // Companonnage (matrice INRAE)
  companions: CompanionRelation[];

  // Maladies — risques et conditions
  diseaseRisks: DiseaseRisk[];

  // Calendrier
  optimalPlantMonths: number[];    // Mois optimaux de semis (0=Jan, 11=Déc)
  harvestSeason: string[];         // Saisons de récolte

  // Données globales
  totalDaysToHarvest: number;     // Jours totaux graine → récolte
  plantFamily: string;            // Famille botanique
  droughtResistance: number;       // 0-1, résistance à la sécheresse
  diseaseResistance: number;      // 0-1, résistance générale aux maladies
  pestResistance: number;         // 0-1, résistance aux ravageurs

  // Données arbres (optionnel)
  matureTreeHeight?: number;      // Hauteur mature (m)
  treeSpread?: number;            // Étalement (m)
  treeLifespan?: number;         // Espérance de vie (ans)
  firstHarvestYears?: number;     // Années avant première récolte
  annualYield?: string;           // Rendement annuel
  treeData?: {
    pollinationType: string;
    pollinator?: string;
    frostResistance?: number;
    soilType: string;
    soilPH: string;
    pruningNotes: string;
    fruitEdible: boolean;
  };
}

export interface CompanionRelation {
  plantId: string;    // ID de la plante compagne
  type: 'beneficial' | 'harmful' | 'neutral';
  reason?: string;    // Pourquoi (optionnel)
}

export interface DiseaseRisk {
  name: string;              // Nom de la maladie
  emoji: string;             // Pour l'affichage
  triggerConditions: string;  // Conditions qui déclenchent
  prevention: string;       // Prévention
}

export interface StageInfo {
  index: number;
  label: string;
  emoji: string;
  durationDays: number;
  gddTarget: number;
  description: string;
}

export interface GDDResult {
  gddToday: number;          // GDD gagnés aujourd'hui
  accumulatedGDD: number;    // GDD totaux accumulés
  progressPct: number;       // % vers prochain stade
  daysToNextStage: number;   // Jours estimés
  nextStage: number;         // Numéro du prochain stade
}

export interface WaterNeedResult {
  etcMmPerDay: number;       // ETc (mm/jour)
  needLPerDay: number;       // Besoin en L/jour
  waterSavingPct: number;    // % économisé vs sans technique
  urgency: 'ok' | 'urgent' | 'critique';
  breakdown: WaterSavingItem[];
}

export interface WaterSavingItem {
  source: string;
  emoji: string;
  savingMm: number;
}

export interface CompanionResult {
  score: 'excellent' | 'bon' | 'neutre' | 'mauvais';
  beneficialCount: number;
  harmfulCount: number;
  tip: string;
}

export interface SoilResult {
  tempC: number;
  isOk: boolean;
  sowingAdvice: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
//  LABELS — Noms des stades de croissance
// ═══════════════════════════════════════════════════════════════

export const STAGE_LABELS: Record<number, string> = {
  0: 'Graine',
  1: 'Levée',
  2: 'Plantule',
  3: 'Croissance',
  4: 'Floraison',
  5: 'Récolte',
};

export const STAGE_EMOJIS: Record<number, string> = {
  0: '🌰',
  1: '🌱',
  2: '🌿',
  3: '🪴',
  4: '🌸',
  5: '🍅',
};

// ═══════════════════════════════════════════════════════════════
//  PLANT_CARDS — Données botaniques par plante
// ═══════════════════════════════════════════════════════════════

export const PLANT_CARDS: Record<string, PlantCard> = {

  // ─── TOMATE ───
  tomato: {
    id: 'tomato',
    tBase: 10,
    tCap: 30,
    stageGDD: [50, 200, 400, 800],
    kc: 1.05,
    waterNeedMmPerDay: 5.5,
    minSoilTempForSowing: 15,
    optimalSoilTemp: 20,
    lightNeedHours: 8,
    stageDurations: [7, 21, 28, 45],
    companions: [
      { plantId: 'basil', type: 'beneficial', reason: 'Repousse les ravageurs' },
      { plantId: 'carrot', type: 'beneficial', reason: 'Améliore la croissance' },
      { plantId: 'parsley', type: 'beneficial', reason: 'Repousse les pucerons' },
      { plantId: 'chive', type: 'beneficial', reason: 'Repousse les aleurodes' },
      { plantId: 'cabbage', type: 'harmful', reason: 'Compétition racinaire' },
      { plantId: 'fennel', type: 'harmful', reason: 'Inhibiteur de croissance' },
      { plantId: 'potato', type: 'harmful', reason: 'Risque mildiou partagé' },
    ],
    diseaseRisks: [
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'HR>90%, T10-25°C, pluie',
        prevention: 'Aérer, éviter irrigation foliaire, traitement préventif',
      },
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR 60-80%, T15-25°C',
        prevention: 'Bonne circulation d\'air, variété resistente',
      },
    ],
    optimalPlantMonths: [2, 3, 4],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 109,
    plantFamily: 'Solanaceae',
    droughtResistance: 0.75,
    diseaseResistance: 0.45,
    pestResistance: 0.40,
  },

  // ─── CAROTTE ───
  carrot: {
    id: 'carrot',
    tBase: 4,
    tCap: 27,
    stageGDD: [80, 250, 500, 900],
    kc: 1.00,
    waterNeedMmPerDay: 3.8,
    minSoilTempForSowing: 7,
    optimalSoilTemp: 15,
    lightNeedHours: 6,
    stageDurations: [14, 18, 35, 45],
    companions: [
      { plantId: 'onion', type: 'beneficial', reason: 'Repousse la mouche de la carotte' },
      { plantId: 'leek', type: 'beneficial', reason: 'Confusion olfactive' },
      { plantId: 'lettuce', type: 'beneficial', reason: 'Espace bien utilisé' },
      { plantId: 'tomato', type: 'beneficial', reason: 'Tomate protège la carotte' },
      { plantId: 'dill', type: 'harmful', reason: 'Attire les mêmes ravageurs' },
      { plantId: 'parsnip', type: 'harmful', reason: 'Compétition' },
    ],
    diseaseRisks: [
      {
        name: 'Mouche de la carotte',
        emoji: '🪰',
        triggerConditions: 'Vol en mai-juin et août-sept',
        prevention: 'Filet anti-insectes, asociation oignon',
      },
      {
        name: 'Alternaria',
        emoji: '🍂',
        triggerConditions: 'Humidité élevée, temp fraîche',
        prevention: 'Rotation, semillas saines',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 5, 8, 9],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 114,
    plantFamily: 'Apiaceae',
    droughtResistance: 0.65,
    diseaseResistance: 0.70,
    pestResistance: 0.50,
  },

  // ─── LAITUE ───
  lettuce: {
    id: 'lettuce',
    tBase: 4,
    tCap: 24,
    stageGDD: [40, 120, 220, 380],
    kc: 0.95,
    waterNeedMmPerDay: 4.0,
    minSoilTempForSowing: 5,
    optimalSoilTemp: 12,
    lightNeedHours: 6,
    stageDurations: [7, 12, 18, 12],
    companions: [
      { plantId: 'radish', type: 'beneficial', reason: 'Marqueur de ligne' },
      { plantId: 'carrot', type: 'beneficial', reason: 'Espace complémentaires' },
      { plantId: 'strawberry', type: 'beneficial', reason: 'Bon voisinage' },
      { plantId: 'chive', type: 'beneficial', reason: 'Repousse les pucerons' },
      { plantId: 'celery', type: 'harmful', reason: 'Compétition' },
    ],
    diseaseRisks: [
      {
        name: 'Botrytis',
        emoji: '🦠',
        triggerConditions: 'HR>85%, temp 15-20°C',
        prevention: 'Aérer, éviter excès d\'eau',
      },
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'Humidité, temp fraîche',
        prevention: 'Variétés resistantes, drainage',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 5, 8, 9],
    harvestSeason: ['spring', 'summer', 'autumn'],
    totalDaysToHarvest: 49,
    plantFamily: 'Asteraceae',
    droughtResistance: 0.40,
    diseaseResistance: 0.55,
    pestResistance: 0.50,
  },

  // ─── FRAISIER ───
  strawberry: {
    id: 'strawberry',
    tBase: 5,
    tCap: 28,
    stageGDD: [100, 300, 550, 950],
    kc: 1.00,
    waterNeedMmPerDay: 4.2,
    minSoilTempForSowing: 10,
    optimalSoilTemp: 18,
    lightNeedHours: 7,
    stageDurations: [21, 25, 30, 40],
    companions: [
      { plantId: 'lettuce', type: 'beneficial', reason: 'Bon voisinage' },
      { plantId: 'spinach', type: 'beneficial', reason: 'Espace complémentaire' },
      { plantId: 'bean', type: 'beneficial', reason: 'Fixation azote' },
      { plantId: 'cabbage', type: 'harmful', reason: 'Compétition' },
    ],
    diseaseRisks: [
      {
        name: 'Botrytis',
        emoji: '🦠',
        triggerConditions: 'HR>90%, temps humide',
        prevention: 'Paillage, éviter contact fruit-sol',
      },
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR modérée, T15-25°C',
        prevention: 'Variétés resistantes',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 8, 9],
    harvestSeason: ['summer'],
    totalDaysToHarvest: 123,
    plantFamily: 'Rosaceae',
    droughtResistance: 0.45,
    diseaseResistance: 0.30,
    pestResistance: 0.55,
  },

  // ─── BASILIC ───
  basil: {
    id: 'basil',
    tBase: 12,
    tCap: 32,
    stageGDD: [60, 180, 350, 650],
    kc: 0.90,
    waterNeedMmPerDay: 4.5,
    minSoilTempForSowing: 18,
    optimalSoilTemp: 22,
    lightNeedHours: 8,
    stageDurations: [6, 9, 14, 22],
    companions: [
      { plantId: 'tomato', type: 'beneficial', reason: 'Repousse ravageurs, améliore goût' },
      { plantId: 'pepper', type: 'beneficial', reason: 'Mêmes besoins' },
      { plantId: 'oregano', type: 'beneficial', reason: 'Associées naturellement' },
      { plantId: 'marjoram', type: 'beneficial', reason: 'Associées naturellement' },
      { plantId: 'rue', type: 'harmful', reason: 'Incompatible' },
    ],
    diseaseRisks: [
      {
        name: 'Fusariose',
        emoji: '🦠',
        triggerConditions: 'Temp élevée, humidité',
        prevention: 'Bon drainage, rotation',
      },
      {
        name: 'Pucerons',
        emoji: '🐛',
        triggerConditions: 'Sec, temp modérée',
        prevention: 'Savon noir, inspection régulière',
      },
    ],
    optimalPlantMonths: [3, 4, 5],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 90,
    plantFamily: 'Lamiaceae',
    droughtResistance: 0.50,
    diseaseResistance: 0.60,
    pestResistance: 0.45,
  },

  // ─── PIMENT ───
  pepper: {
    id: 'pepper',
    tBase: 10,
    tCap: 32,
    stageGDD: [80, 300, 600, 1100],
    kc: 0.90,
    waterNeedMmPerDay: 5.0,
    minSoilTempForSowing: 18,
    optimalSoilTemp: 24,
    lightNeedHours: 8,
    stageDurations: [7, 14, 22, 35],
    companions: [
      { plantId: 'tomato', type: 'beneficial', reason: 'Même famille, bons voisins' },
      { plantId: 'basil', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'carrot', type: 'beneficial', reason: 'Espace互补' },
      { plantId: 'fennel', type: 'harmful', reason: 'Incompatible' },
    ],
    diseaseRisks: [
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'Humidité élevée, T10-25°C',
        prevention: 'Aérer, éviter irrigation foliaire',
      },
      {
        name: 'Pucerons',
        emoji: '🐛',
        triggerConditions: 'Temps sec',
        prevention: 'Inspection, traitement précoce',
      },
    ],
    optimalPlantMonths: [2, 3, 4],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 130,
    plantFamily: 'Solanaceae',
    droughtResistance: 0.60,
    diseaseResistance: 0.50,
    pestResistance: 0.40,
  },

  // ─── CONCOMBRE ───
  cucumber: {
    id: 'cucumber',
    tBase: 15,
    tCap: 35,
    stageGDD: [80, 250, 450, 800],
    kc: 0.90,
    waterNeedMmPerDay: 5.0,
    minSoilTempForSowing: 18,
    optimalSoilTemp: 24,
    lightNeedHours: 8,
    stageDurations: [7, 18, 18, 27],
    companions: [
      { plantId: 'bean', type: 'beneficial', reason: 'Fixation azote' },
      { plantId: 'pea', type: 'beneficial', reason: 'Espace complémentaire' },
      { plantId: 'corn', type: 'beneficial', reason: 'Support naturel' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition, maladies partagé' },
      { plantId: 'sage', type: 'harmful', reason: 'Incompatible' },
    ],
    diseaseRisks: [
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR modérée, T20-30°C',
        prevention: 'Bonne aération, éviter mouillage feuilles',
      },
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'Humidité élevée, T15-25°C',
        prevention: 'Aérer, éviter irrigation foliaire',
      },
    ],
    optimalPlantMonths: [3, 4, 5],
    harvestSeason: ['summer'],
    totalDaysToHarvest: 70,
    plantFamily: 'Cucurbitaceae',
    droughtResistance: 0.30,
    diseaseResistance: 0.40,
    pestResistance: 0.45,
  },

  // ─── COURGETTE ───
  zucchini: {
    id: 'zucchini',
    tBase: 12,
    tCap: 35,
    stageGDD: [60, 200, 400, 700],
    kc: 0.85,
    waterNeedMmPerDay: 5.0,
    minSoilTempForSowing: 16,
    optimalSoilTemp: 22,
    lightNeedHours: 7,
    stageDurations: [6, 15, 14, 20],
    companions: [
      { plantId: 'corn', type: 'beneficial', reason: 'Polinisation, espace' },
      { plantId: 'bean', type: 'beneficial', reason: 'Fixation azote' },
      { plantId: 'nasturtium', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition racinaire' },
    ],
    diseaseRisks: [
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR 60-80%, T20-30°C',
        prevention: 'Aérer, éviter excès azote',
      },
      {
        name: 'Botrytis',
        emoji: '🦠',
        triggerConditions: 'HR>85%, temps humide',
        prevention: 'Bien Drainer, éviter contact fruits-sol',
      },
    ],
    optimalPlantMonths: [3, 4, 5],
    harvestSeason: ['summer'],
    totalDaysToHarvest: 55,
    plantFamily: 'Cucurbitaceae',
    droughtResistance: 0.35,
    diseaseResistance: 0.45,
    pestResistance: 0.50,
  },

  // ─── HARICOT ───
  bean: {
    id: 'bean',
    tBase: 12,
    tCap: 30,
    stageGDD: [100, 250, 500, 900],
    kc: 0.85,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 15,
    optimalSoilTemp: 20,
    lightNeedHours: 7,
    stageDurations: [10, 18, 30, 42],
    companions: [
      { plantId: 'corn', type: 'beneficial', reason: 'Support + fixation azote' },
      { plantId: 'cucumber', type: 'beneficial', reason: 'Espace complémentaire' },
      { plantId: 'celery', type: 'beneficial', reason: 'Bon voisinage' },
      { plantId: 'onion', type: 'harmful', reason: 'Inhibe croissance' },
      { plantId: 'garlic', type: 'harmful', reason: 'Inhibe croissance' },
      { plantId: 'fennel', type: 'harmful', reason: 'Incompatible' },
    ],
    diseaseRisks: [
      {
        name: 'Anthracnose',
        emoji: '🍂',
        triggerConditions: 'Humidité élevée, temp douce',
        prevention: 'Rotation, semences saines',
      },
      {
        name: 'Rouille',
        emoji: '🟤',
        triggerConditions: 'Humidité, T15-20°C',
        prevention: 'Variétés resistantes, drainage',
      },
    ],
    optimalPlantMonths: [4, 5, 6],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 100,
    plantFamily: 'Fabaceae',
    droughtResistance: 0.40,
    diseaseResistance: 0.50,
    pestResistance: 0.55,
  },

  // ─── POIS ───
  pea: {
    id: 'pea',
    tBase: 5,
    tCap: 25,
    stageGDD: [80, 200, 400, 700],
    kc: 0.85,
    waterNeedMmPerDay: 3.5,
    minSoilTempForSowing: 5,
    optimalSoilTemp: 15,
    lightNeedHours: 6,
    stageDurations: [10, 20, 30, 40],
    companions: [
      { plantId: 'carrot', type: 'beneficial', reason: 'Espace complémentaire' },
      { plantId: 'turnip', type: 'beneficial', reason: 'Bon voisinage' },
      { plantId: 'radish', type: 'beneficial', reason: 'Marqueur de ligne' },
      { plantId: 'onion', type: 'harmful', reason: 'Inhibe croissance' },
      { plantId: 'garlic', type: 'harmful', reason: 'Inhibe croissance' },
    ],
    diseaseRisks: [
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR modérée, T15-25°C',
        prevention: 'Aérer, éviter excès azote',
      },
      {
        name: 'Rouille',
        emoji: '🟤',
        triggerConditions: 'Humidité, T12-20°C',
        prevention: 'Rotation, drainage',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 9],
    harvestSeason: ['spring', 'summer'],
    totalDaysToHarvest: 90,
    plantFamily: 'Fabaceae',
    droughtResistance: 0.50,
    diseaseResistance: 0.55,
    pestResistance: 0.60,
  },

  // ─── ÉPINARD ───
  spinach: {
    id: 'spinach',
    tBase: 5,
    tCap: 25,
    stageGDD: [60, 150, 300, 500],
    kc: 0.90,
    waterNeedMmPerDay: 4.0,
    minSoilTempForSowing: 5,
    optimalSoilTemp: 15,
    lightNeedHours: 6,
    stageDurations: [7, 14, 21, 28],
    companions: [
      { plantId: 'strawberry', type: 'beneficial', reason: 'Bon voisinage' },
      { plantId: 'pea', type: 'beneficial', reason: 'Fixation azote' },
      { plantId: 'bean', type: 'beneficial', reason: 'Espace complémentaire' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition racinaire' },
    ],
    diseaseRisks: [
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'Humidité élevée, T10-20°C',
        prevention: 'Aérer, éviter excès eau',
      },
      {
        name: 'Rouille',
        emoji: '🟤',
        triggerConditions: 'Humidité, T12-18°C',
        prevention: 'Rotation, drainage',
      },
    ],
    optimalPlantMonths: [2, 3, 8, 9],
    harvestSeason: ['spring', 'autumn'],
    totalDaysToHarvest: 60,
    plantFamily: 'Amaranthaceae',
    droughtResistance: 0.45,
    diseaseResistance: 0.55,
    pestResistance: 0.50,
  },

  // ─── RADIS ───
  radish: {
    id: 'radish',
    tBase: 5,
    tCap: 27,
    stageGDD: [30, 80, 150, 250],
    kc: 0.80,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 5,
    optimalSoilTemp: 15,
    lightNeedHours: 6,
    stageDurations: [5, 8, 10, 7],
    companions: [
      { plantId: 'lettuce', type: 'beneficial', reason: 'Marqueur de ligne' },
      { plantId: 'carrot', type: 'beneficial', reason: 'Espace bien utilisé' },
      { plantId: 'pea', type: 'beneficial', reason: 'Bon voisinage' },
      { plantId: 'cucumber', type: 'harmful', reason: 'Inhibe croissance' },
    ],
    diseaseRisks: [
      {
        name: 'Altise',
        emoji: '🐛',
        triggerConditions: 'Temps sec, sol sec',
        prevention: 'Arroser régulièrement, filet anti-insectes',
      },
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'Humidité élevée',
        prevention: 'Rotation, drainage',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 8, 9],
    harvestSeason: ['spring', 'summer', 'autumn'],
    totalDaysToHarvest: 30,
    plantFamily: 'Brassicaceae',
    droughtResistance: 0.50,
    diseaseResistance: 0.60,
    pestResistance: 0.40,
  },

  // ─── CHOU ───
  cabbage: {
    id: 'cabbage',
    tBase: 7,
    tCap: 28,
    stageGDD: [80, 200, 400, 700],
    kc: 0.95,
    waterNeedMmPerDay: 4.5,
    minSoilTempForSowing: 10,
    optimalSoilTemp: 18,
    lightNeedHours: 7,
    stageDurations: [10, 20, 30, 40],
    companions: [
      { plantId: 'celery', type: 'beneficial', reason: 'Repousse piéride' },
      { plantId: 'dill', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'onion', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'strawberry', type: 'harmful', reason: 'Compétition' },
      { plantId: 'tomato', type: 'harmful', reason: 'Compétition racinaire' },
    ],
    diseaseRisks: [
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'Humidité élevée, T10-20°C',
        prevention: 'Aérer, éviter excès eau',
      },
      {
        name: 'Piéride',
        emoji: '🦋',
        triggerConditions: 'Printemps-été, temps doux',
        prevention: 'Filet anti-insectes, surveillance',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 7, 8],
    harvestSeason: ['summer', 'autumn', 'winter'],
    totalDaysToHarvest: 120,
    plantFamily: 'Brassicaceae',
    droughtResistance: 0.40,
    diseaseResistance: 0.45,
    pestResistance: 0.30,
  },

  // ─── AUBERGINE ───
  eggplant: {
    id: 'eggplant',
    tBase: 15,
    tCap: 35,
    stageGDD: [100, 300, 600, 1000],
    kc: 0.90,
    waterNeedMmPerDay: 5.0,
    minSoilTempForSowing: 20,
    optimalSoilTemp: 25,
    lightNeedHours: 8,
    stageDurations: [10, 21, 28, 40],
    companions: [
      { plantId: 'pepper', type: 'beneficial', reason: 'Même famille, bons voisins' },
      { plantId: 'basil', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'bean', type: 'beneficial', reason: 'Fixation azote' },
      { plantId: 'fennel', type: 'harmful', reason: 'Incompatible' },
    ],
    diseaseRisks: [
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'Humidité élevée, T15-25°C',
        prevention: 'Aérer, éviter irrigation foliaire',
      },
      {
        name: 'Doryphore',
        emoji: '🐛',
        triggerConditions: 'Printemps-été',
        prevention: 'Cueillette manuelle, insecticide naturel',
      },
    ],
    optimalPlantMonths: [2, 3, 4],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 120,
    plantFamily: 'Solanaceae',
    droughtResistance: 0.40,
    diseaseResistance: 0.40,
    pestResistance: 0.35,
  },
  },

  // ─── COURGE BUTTERNUT COCO ───
  squash: {
    id: 'squash',
    plantCategory: 'vegetable',
    tBase: 12,
    tCap: 35,
    stageGDD: [40, 125, 150, 335],
    kc: 1.00,
    waterNeedMmPerDay: 4,
    minSoilTempForSowing: 15,
    optimalSoilTemp: 15,
    lightNeedHours: 7,
    stageDurations: [8, 25, 30, 67],
    companions: [
      { plantId: 'mais', type: 'beneficial', reason: 'Associe naturellement' },
      { plantId: 'haricot', type: 'beneficial', reason: 'Associe naturellement' },
      { plantId: 'capucine', type: 'beneficial', reason: 'Associe naturellement' },
      { plantId: 'pomme-de-terre', type: 'harmful', reason: 'Incompatible' },
      { plantId: 'autres-courges', type: 'harmful', reason: 'Incompatible' }
    ],
    diseaseRisks: [
      { name: 'Mildiou', emoji: '🌧️', triggerConditions: 'HR>90%, T10-25C, humidite', prevention: 'Aerer, eviter irrigation foliaire' },
      { name: 'Oidum', emoji: '🌞', triggerConditions: 'HR 60-80%, T15-25C', prevention: 'Bonne aeration, eviter exces azote' },
      { name: 'Botrytis', emoji: '🦠', triggerConditions: 'HR>85%, temp douce', prevention: 'Aerer, drainage' }
    ],
    optimalPlantMonths: [1, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 130,
    plantFamily: 'Cucurbitaceae',
    droughtResistance: 0.63,
    diseaseResistance: 0.50,
    pestResistance: 0.50,
  },

// ═══ FIN PLANT_CARDS ═══
// ═══ FIN PLANT_CARDS ═══

// ═══════════════════════════════════════════════════════════════
//  TREE_CARDS — Arbres fruitiers et forestiers
// ═══════════════════════════════════════════════════════════════

export const TREE_CARDS: Record<string, PlantCard> = {

  // ─── POMMIER ───
  apple: {
    id: 'apple',
    plantCategory: 'fruit-tree',
    tBase: 7,
    tCap: 30,
    stageGDD: [200, 400, 800, 1500],
    kc: 0.85,
    waterNeedMmPerDay: 3.5,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 18,
    lightNeedHours: 7,
    stageDurations: [45, 90, 180, 365],
    companions: [
      { plantId: 'chive', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'nasturtium', type: 'beneficial', reason: 'Piège à pucerons' },
      { plantId: 'garlic', type: 'beneficial', reason: 'Repousse champignons' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition racinaire' },
    ],
    diseaseRisks: [
      {
        name: 'Tavelure',
        emoji: '🍂',
        triggerConditions: 'HR>85%, T15-25°C, printemps',
        prevention: 'Variétés resistantes, taille aérée',
      },
      {
        name: 'Feu bacterien',
        emoji: '🔥',
        triggerConditions: 'T° douce, humidité, fleurs',
        prevention: 'Élagage,消毒 outils',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 5475,
    plantFamily: 'Rosaceae',
    droughtResistance: 0.55,
    diseaseResistance: 0.45,
    pestResistance: 0.50,
    matureTreeHeight: 8,
    treeSpread: 6,
    treeLifespan: 100,
    firstHarvestYears: 5,
    annualYield: '30-80 kg/arbre',
    treeData: {
      pollinationType: 'Autofertile (meilleur avec pollinisation croisée)',
      pollinator: 'abeilles, bourdons',
      frostResistance: -25,
      soilType: 'Profond, bien drainé, riche',
      soilPH: '6.0-7.0',
      pruningNotes: 'Taille de formation année 1-3, taille d\'entretien annuelle',
      fruitEdible: true,
    },
  },

  // ─── POMMIER (Golden) ───
  'apple-golden': {
    id: 'apple-golden',
    plantCategory: 'fruit-tree',
    tBase: 7,
    tCap: 30,
    stageGDD: [200, 400, 800, 1500],
    kc: 0.85,
    waterNeedMmPerDay: 3.5,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 18,
    lightNeedHours: 7,
    stageDurations: [45, 90, 180, 365],
    companions: [
      { plantId: 'chive', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'nasturtium', type: 'beneficial', reason: 'Piège à pucerons' },
      { plantId: 'garlic', type: 'beneficial', reason: 'Repousse champignons' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition racinaire' },
    ],
    diseaseRisks: [
      {
        name: 'Tavelure',
        emoji: '🍂',
        triggerConditions: 'HR>85%, T15-25°C, printemps',
        prevention: 'Variétés resistantes, taille aérée',
      },
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR>70%, T15-22°C',
        prevention: 'Bonne aération, traitement préventif',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 5475,
    plantFamily: 'Rosaceae',
    droughtResistance: 0.55,
    diseaseResistance: 0.45,
    pestResistance: 0.50,
    matureTreeHeight: 6,
    treeSpread: 5,
    treeLifespan: 80,
    firstHarvestYears: 4,
    annualYield: '40-100 kg/arbre',
    treeData: {
      pollinationType: 'Autofertile',
      pollinator: 'abeilles',
      frostResistance: -25,
      soilType: 'Profond, bien drainé',
      soilPH: '6.0-7.0',
      pruningNotes: 'Taille d\'entretien annuelle en hiver',
      fruitEdible: true,
    },
  },

  // ─── POMMIER (Gala) ───
  'apple-gala': {
    id: 'apple-gala',
    plantCategory: 'fruit-tree',
    tBase: 7,
    tCap: 30,
    stageGDD: [200, 400, 800, 1500],
    kc: 0.85,
    waterNeedMmPerDay: 3.5,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 18,
    lightNeedHours: 7,
    stageDurations: [45, 90, 180, 365],
    companions: [
      { plantId: 'chive', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'nasturtium', type: 'beneficial', reason: 'Piège à pucerons' },
      { plantId: 'garlic', type: 'beneficial', reason: 'Repousse champignons' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition racinaire' },
    ],
    diseaseRisks: [
      {
        name: 'Tavelure',
        emoji: '🍂',
        triggerConditions: 'HR>85%, T15-25°C, printemps',
        prevention: 'Variétés resistantes, taille aérée',
      },
      {
        name: 'Feu bacterien',
        emoji: '🔥',
        triggerConditions: 'T° douce, humidité',
        prevention: 'Élagage, desinfaction outils',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 5110,
    plantFamily: 'Rosaceae',
    droughtResistance: 0.55,
    diseaseResistance: 0.45,
    pestResistance: 0.50,
    matureTreeHeight: 5,
    treeSpread: 4,
    treeLifespan: 60,
    firstHarvestYears: 4,
    annualYield: '25-60 kg/arbre',
    treeData: {
      pollinationType: 'Autofertile',
      pollinator: 'abeilles',
      frostResistance: -25,
      soilType: 'Profond, bien drainé',
      soilPH: '6.0-7.0',
      pruningNotes: 'Taille de formation et d\'entretien',
      fruitEdible: true,
    },
  },

  // ─── POIRIER ───
  pear: {
    id: 'pear',
    plantCategory: 'fruit-tree',
    tBase: 7,
    tCap: 30,
    stageGDD: [200, 400, 800, 1500],
    kc: 0.85,
    waterNeedMmPerDay: 3.5,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 18,
    lightNeedHours: 7,
    stageDurations: [45, 90, 180, 365],
    companions: [
      { plantId: 'chive', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'ivy', type: 'beneficial', reason: 'Hôte auxiliaires' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition racinaire' },
    ],
    diseaseRisks: [
      {
        name: 'Tavelure',
        emoji: '🍂',
        triggerConditions: 'HR>85%, T15-25°C',
        prevention: 'Taille aérée, traitement préventif',
      },
      {
        name: 'Feu bacterien',
        emoji: '🔥',
        triggerConditions: 'T° douce, humidité',
        prevention: 'Élagage urgent, stériliser outils',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['summer', 'autumn'],
    totalDaysToHarvest: 5475,
    plantFamily: 'Rosaceae',
    droughtResistance: 0.50,
    diseaseResistance: 0.40,
    pestResistance: 0.45,
    matureTreeHeight: 10,
    treeSpread: 7,
    treeLifespan: 150,
    firstHarvestYears: 5,
    annualYield: '40-100 kg/arbre',
    treeData: {
      pollinationType: 'Autofertile (meilleur avec pollinisation croisée)',
      pollinator: 'abeilles',
      frostResistance: -25,
      soilType: 'Profond, frais, bien drainé',
      soilPH: '6.0-7.0',
      pruningNotes: 'Taille en forme de palmette ou quenouille',
      fruitEdible: true,
    },
  },

  // ─── CERISIER ───
  cherry: {
    id: 'cherry',
    plantCategory: 'fruit-tree',
    tBase: 8,
    tCap: 28,
    stageGDD: [200, 400, 800, 1400],
    kc: 0.80,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 18,
    lightNeedHours: 7,
    stageDurations: [45, 90, 180, 365],
    companions: [
      { plantId: 'chive', type: 'beneficial', reason: 'Repousse pucerons' },
      { plantId: 'corn', type: 'beneficial', reason: 'Bon voisinage' },
      { plantId: 'potato', type: 'harmful', reason: 'Risque болезни partages' },
    ],
    diseaseRisks: [
      {
        name: 'Moniliose',
        emoji: '🍒',
        triggerConditions: 'Humidité élevée, T15-25°C',
        prevention: 'Taille, élimination fruits atteints',
      },
      {
        name: 'Cylindrosporiose',
        emoji: '🍂',
        triggerConditions: 'Humidité, temp douce',
        prevention: 'Traitement préventif',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['summer'],
    totalDaysToHarvest: 5475,
    plantFamily: 'Rosaceae',
    droughtResistance: 0.60,
    diseaseResistance: 0.40,
    pestResistance: 0.35,
    matureTreeHeight: 12,
    treeSpread: 10,
    treeLifespan: 100,
    firstHarvestYears: 5,
    annualYield: '20-50 kg/arbre',
    treeData: {
      pollinationType: 'Autofertile (certaines variétés besoin pollinisateur)',
      pollinator: 'abeilles',
      frostResistance: -20,
      soilType: 'Profond, bien drainé, pas trop humide',
      soilPH: '6.0-7.0',
      pruningNotes: 'Taille après récolte, éviter taille en hiver',
      fruitEdible: true,
    },
  },

  // ─── NOISETIER ───
  hazelnut: {
    id: 'hazelnut',
    plantCategory: 'fruit-tree',
    tBase: 7,
    tCap: 30,
    stageGDD: [150, 350, 700, 1200],
    kc: 0.80,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 16,
    lightNeedHours: 6,
    stageDurations: [30, 60, 120, 180],
    companions: [
      { plantId: 'corn', type: 'beneficial', reason: 'Espace complémentaire' },
      { plantId: 'potato', type: 'harmful', reason: 'Compétition' },
    ],
    diseaseRisks: [
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR modérée, T15-25°C',
        prevention: 'Bonne aération',
      },
      {
        name: 'Bacteriose',
        emoji: '🦠',
        triggerConditions: 'Humidité élevée',
        prevention: 'Taille, élimination parties malades',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 2190,
    plantFamily: 'Betulaceae',
    droughtResistance: 0.65,
    diseaseResistance: 0.50,
    pestResistance: 0.50,
    matureTreeHeight: 8,
    treeSpread: 6,
    treeLifespan: 200,
    firstHarvestYears: 6,
    annualYield: '10-25 kg/arbre',
    treeData: {
      pollinationType: 'Monoïque (pollinisation anémophile)',
      pollinator: 'vent',
      frostResistance: -25,
      soilType: 'Tous types, préfère frais',
      soilPH: '6.0-7.0',
      pruningNotes: 'Taille de formation, élimination drageons',
      fruitEdible: true,
    },
  },

  // ─── Noyer ───
  walnut: {
    id: 'walnut',
    plantCategory: 'fruit-tree',
    tBase: 10,
    tCap: 35,
    stageGDD: [200, 400, 800, 1600],
    kc: 0.85,
    waterNeedMmPerDay: 3.5,
    minSoilTempForSowing: 10,
    optimalSoilTemp: 20,
    lightNeedHours: 7,
    stageDurations: [60, 120, 240, 720],
    companions: [
      { plantId: 'none', type: 'harmful', reason: 'Inhibe croissance nombreuses plantes (juglone)' },
    ],
    diseaseRisks: [
      {
        name: 'Anthracnose',
        emoji: '🍂',
        triggerConditions: 'Humidité élevée, T15-25°C',
        prevention: 'Ramasser feuilles mortes',
      },
      {
        name: 'Bacteriose',
        emoji: '🦠',
        triggerConditions: 'Humidité, temp douce',
        prevention: 'Taille, traitement cuivre',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 6570,
    plantFamily: 'Juglandaceae',
    droughtResistance: 0.70,
    diseaseResistance: 0.45,
    pestResistance: 0.55,
    matureTreeHeight: 15,
    treeSpread: 12,
    treeLifespan: 200,
    firstHarvestYears: 8,
    annualYield: '30-60 kg/arbre',
    treeData: {
      pollinationType: 'Monoïque (autostérile pour certaines)',
      pollinator: 'vent',
      frostResistance: -20,
      soilType: 'Profond, bien drainé, riche',
      soilPH: '6.5-7.5',
      pruningNotes: 'Taille minimale, только удаление branches mortes',
      fruitEdible: true,
    },
  },

  // ─── ORANGER ───
  orange: {
    id: 'orange',
    plantCategory: 'fruit-tree',
    tBase: 10,
    tCap: 35,
    stageGDD: [150, 350, 700, 1200],
    kc: 0.80,
    waterNeedMmPerDay: 4.0,
    minSoilTempForSowing: 15,
    optimalSoilTemp: 25,
    lightNeedHours: 8,
    stageDurations: [30, 60, 120, 360],
    companions: [
      { plantId: 'basil', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'lavender', type: 'beneficial', reason: 'Repousse pucerons' },
      { plantId: 'ivy', type: 'neutral', reason: 'Neutre' },
    ],
    diseaseRisks: [
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'HR>90%, T15-25°C',
        prevention: 'Éviter irrigation foliaire, cuivre',
      },
      {
        name: 'Gommose',
        emoji: '💧',
        triggerConditions: 'Humidité excessive, blessures',
        prevention: 'Drainage, éviter blessures',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 9, 10],
    harvestSeason: ['winter', 'spring'],
    totalDaysToHarvest: 4380,
    plantFamily: 'Rutaceae',
    droughtResistance: 0.50,
    diseaseResistance: 0.40,
    pestResistance: 0.40,
    matureTreeHeight: 5,
    treeSpread: 4,
    treeLifespan: 80,
    firstHarvestYears: 4,
    annualYield: '40-70 kg/arbre',
    treeData: {
      pollinationType: 'Autofertile',
      pollinator: 'abeilles',
      frostResistance: -5,
      soilType: 'Léger, drainé, riche en matière organique',
      soilPH: '5.5-6.5',
      pruningNotes: 'Taille d\'entretien légère après récolte',
      fruitEdible: true,
    },
  },

  // ─── CITRONNIER ───
  lemon: {
    id: 'lemon',
    plantCategory: 'fruit-tree',
    tBase: 10,
    tCap: 35,
    stageGDD: [150, 350, 700, 1200],
    kc: 0.80,
    waterNeedMmPerDay: 4.0,
    minSoilTempForSowing: 15,
    optimalSoilTemp: 25,
    lightNeedHours: 8,
    stageDurations: [30, 60, 120, 360],
    companions: [
      { plantId: 'basil', type: 'beneficial', reason: 'Repousse ravageurs' },
      { plantId: 'lavender', type: 'beneficial', reason: 'Repousse pucerons' },
    ],
    diseaseRisks: [
      {
        name: 'Mildiou',
        emoji: '🌧️',
        triggerConditions: 'HR>90%, T15-25°C',
        prevention: 'Éviter irrigation foliaire',
      },
      {
        name: 'Gommose',
        emoji: '💧',
        triggerConditions: 'Humidité excessive',
        prevention: 'Drainage, taille',
      },
    ],
    optimalPlantMonths: [2, 3, 4, 9, 10],
    harvestSeason: ['summer', 'autumn', 'winter', 'spring'],
    totalDaysToHarvest: 4380,
    plantFamily: 'Rutaceae',
    droughtResistance: 0.45,
    diseaseResistance: 0.40,
    pestResistance: 0.40,
    matureTreeHeight: 4,
    treeSpread: 3,
    treeLifespan: 60,
    firstHarvestYears: 4,
    annualYield: '20-50 kg/arbre',
    treeData: {
      pollinationType: 'Autofertile',
      pollinator: 'abeilles',
      frostResistance: -3,
      soilType: 'Léger, drainé',
      soilPH: '5.5-6.5',
      pruningNotes: 'Taille légère pour maintenir forme',
      fruitEdible: true,
    },
  },

  // ─── CHÊNE ───
  oak: {
    id: 'oak',
    plantCategory: 'forest-tree',
    tBase: 5,
    tCap: 35,
    stageGDD: [200, 400, 800, 2000],
    kc: 0.85,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 8,
    optimalSoilTemp: 18,
    lightNeedHours: 6,
    stageDurations: [60, 120, 240, 1095],
    companions: [
      { plantId: 'none', type: 'neutral', reason: 'Arbre dominant, peu de compagnons directs' },
    ],
    diseaseRisks: [
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR modérée, T15-25°C',
        prevention: 'Bonne aération',
      },
      {
        name: 'Flock',
        emoji: '🪶',
        triggerConditions: 'Humidité',
        prevention: 'Surveillance',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 10950,
    plantFamily: 'Fagaceae',
    droughtResistance: 0.70,
    diseaseResistance: 0.60,
    pestResistance: 0.55,
    matureTreeHeight: 30,
    treeSpread: 20,
    treeLifespan: 1000,
    firstHarvestYears: 30,
    annualYield: ' glands (semis naturel)',
    treeData: {
      pollinationType: 'Monoïque (anémophile)',
      pollinator: 'vent',
      frostResistance: -25,
      soilType: 'Profond, frais, tous types',
      soilPH: '5.5-7.5',
      pruningNotes: 'Aucune taille nécessaire pour forêt',
      fruitEdible: false,
    },
  },

  // ─── BOULEAU ───
  birch: {
    id: 'birch',
    plantCategory: 'forest-tree',
    tBase: 5,
    tCap: 30,
    stageGDD: [150, 350, 700, 1800],
    kc: 0.80,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 5,
    optimalSoilTemp: 15,
    lightNeedHours: 6,
    stageDurations: [45, 90, 180, 730],
    companions: [
      { plantId: 'none', type: 'neutral', reason: 'Espèce pionnière, peu exigeante' },
    ],
    diseaseRisks: [
      {
        name: 'Flock',
        emoji: '🪶',
        triggerConditions: 'Humidité élevée',
        prevention: 'Surveillance',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 10950,
    plantFamily: 'Betulaceae',
    droughtResistance: 0.50,
    diseaseResistance: 0.55,
    pestResistance: 0.50,
    matureTreeHeight: 20,
    treeSpread: 8,
    treeLifespan: 150,
    firstHarvestYears: 15,
    annualYield: 'Bois (non fruitier)',
    treeData: {
      pollinationType: 'Monoïque (anémophile)',
      pollinator: 'vent',
      frostResistance: -30,
      soilType: 'Acide, frais, bien drainé',
      soilPH: '5.0-6.5',
      pruningNotes: 'Aucune taille nécessaire',
      fruitEdible: false,
    },
  },

  // ─── ÉRABLE ───
  maple: {
    id: 'maple',
    plantCategory: 'forest-tree',
    tBase: 5,
    tCap: 30,
    stageGDD: [150, 350, 700, 1600],
    kc: 0.80,
    waterNeedMmPerDay: 3.0,
    minSoilTempForSowing: 5,
    optimalSoilTemp: 15,
    lightNeedHours: 6,
    stageDurations: [45, 90, 180, 730],
    companions: [
      { plantId: 'none', type: 'neutral', reason: 'Arbre d\'ombrage, peu de compagnons' },
    ],
    diseaseRisks: [
      {
        name: 'Oïdium',
        emoji: '🌞',
        triggerConditions: 'HR modérée, T15-25°C',
        prevention: 'Bonne aération',
      },
      {
        name: 'Verticilliose',
        emoji: '🍂',
        triggerConditions: 'Humidité, blessures racinaires',
        prevention: 'Éviter blessures, drainage',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 10950,
    plantFamily: 'Sapindaceae',
    droughtResistance: 0.55,
    diseaseResistance: 0.50,
    pestResistance: 0.50,
    matureTreeHeight: 25,
    treeSpread: 15,
    treeLifespan: 200,
    firstHarvestYears: 20,
    annualYield: 'Sirop (érable)',
    treeData: {
      pollinationType: 'Monoïque (anémophile)',
      pollinator: 'vent',
      frostResistance: -30,
      soilType: 'Riche, frais, bien drainé',
      soilPH: '6.0-7.0',
      pruningNotes: 'Taille de formation si nécessaire',
      fruitEdible: false,
    },
  },

  // ─── PIN SYLVESTRE ───
  pine: {
    id: 'pine',
    plantCategory: 'forest-tree',
    tBase: 3,
    tCap: 35,
    stageGDD: [150, 350, 700, 2000],
    kc: 0.75,
    waterNeedMmPerDay: 2.0,
    minSoilTempForSowing: 5,
    optimalSoilTemp: 15,
    lightNeedHours: 7,
    stageDurations: [60, 120, 240, 1095],
    companions: [
      { plantId: 'none', type: 'neutral', reason: 'Espèce forestière, peu de strate herbacée' },
    ],
    diseaseRisks: [
      {
        name: 'Scolyte',
        emoji: '🐛',
        triggerConditions: 'Sécheresse, stress',
        prevention: 'Arrosage en période sèche',
      },
      {
        name: 'Rouille',
        emoji: '🟤',
        triggerConditions: 'Humidité, temp douce',
        prevention: 'Surveillance',
      },
    ],
    optimalPlantMonths: [10, 11, 2, 3],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 10950,
    plantFamily: 'Pinaceae',
    droughtResistance: 0.75,
    diseaseResistance: 0.50,
    pestResistance: 0.45,
    matureTreeHeight: 30,
    treeSpread: 10,
    treeLifespan: 400,
    firstHarvestYears: 30,
    annualYield: 'Bois, résine',
    treeData: {
      pollinationType: 'Monoïque (anémophile)',
      pollinator: 'vent',
      frostResistance: -30,
      soilType: 'Sableux, drainé, acide',
      soilPH: '4.5-6.0',
      pruningNotes: 'Aucune taille nécessaire',
      fruitEdible: false,
    },
  },

  // ─── MAGNOLIA ───
  magnolia: {
    id: 'magnolia',
    plantCategory: 'forest-tree',
    tBase: 8,
    tCap: 30,
    stageGDD: [150, 350, 700, 1400],
    kc: 0.80,
    waterNeedMmPerDay: 4.0,
    minSoilTempForSowing: 10,
    optimalSoilTemp: 18,
    lightNeedHours: 6,
    stageDurations: [45, 90, 180, 730],
    companions: [
      { plantId: 'none', type: 'neutral', reason: 'Arbre ornemental solitaire' },
    ],
    diseaseRisks: [
      {
        name: 'Cochenille',
        emoji: '🐛',
        triggerConditions: 'Temps sec',
        prevention: 'Inspection régulière, savon noir',
      },
      {
        name: 'Gale bacterienne',
        emoji: '🦠',
        triggerConditions: 'Humidité',
        prevention: 'Taille parties atteintes',
      },
    ],
    optimalPlantMonths: [3, 4, 9, 10],
    harvestSeason: ['autumn'],
    totalDaysToHarvest: 5475,
    plantFamily: 'Magnoliaceae',
    droughtResistance: 0.45,
    diseaseResistance: 0.50,
    pestResistance: 0.40,
    matureTreeHeight: 10,
    treeSpread: 8,
    treeLifespan: 100,
    firstHarvestYears: 10,
    annualYield: 'Ornementale (fleurs)',
    treeData: {
      pollinationType: 'Entomophile (insectes)',
      pollinator: 'coléoptères, abeille',
      frostResistance: -15,
      soilType: 'Riche, frais, bien drainé',
      soilPH: '5.5-6.5',
      pruningNotes: 'Taille minime après fleurisso, pas de taille sévère',
      fruitEdible: false,
    },
  },

};

// ═══ FIN TREE_CARDS ═══

// ═══════════════════════════════════════════════════════════════
//  FONCTIONS DE CALCUL — GDD (Growing Degree Days)
// ═══════════════════════════════════════════════════════════════

/**
 * Calcule les GDD journaliers selon la méthode FAO.
 * GDD = max(0, min(Tmean, Tcap) - Tbase)
 *
 * @param tMean  Température moyenne (°C)
 * @param tMin   Température minimale (°C)
 * @param tMax   Température maximale (°C)
 * @param plantDefId  ID de la plante
 * @returns GDD du jour
 */
export function calcDailyGDD(
  tMean: number,
  tMin: number,
  tMax: number,
  plantDefId: string
): number {
  const card = PLANT_CARDS[plantDefId];
  if (!card) return 0;

  const tEff = Math.max(card.tBase, Math.min(card.tCap, tMean));
  return Math.max(0, tEff - card.tBase);
}

/**
 * Calcule la progression vers le prochain stade.
 */
export function getStageProgression(
  plantDefId: string,
  currentStage: number,
  gddAccumulated: number,
  currentStageGDD: number
): GDDResult {
  const card = PLANT_CARDS[plantDefId];
  if (!card) {
    return { gddToday: 0, accumulatedGDD: 0, progressPct: 0, daysToNextStage: 99, nextStage: currentStage + 1 };
  }

  const nextStageIndex = Math.min(currentStage + 1, 5);
  const stageGDD = card.stageGDD[Math.min(currentStage, card.stageGDD.length - 1)] ?? currentStageGDD;

  const progressPct = stageGDD > 0 ? Math.min(100, (gddAccumulated / stageGDD) * 100) : 0;
  const daysToNextStage = 99; // Sera calculé avec GDD/jour réel

  return {
    gddToday: calcDailyGDD(18, 15, 22, plantDefId), // Valeur par défaut
    accumulatedGDD: gddAccumulated,
    progressPct,
    daysToNextStage,
    nextStage: nextStageIndex,
  };
}

/**
 * Retourne les infos d'un stade spécifique.
 */
export function getStageInfo(plantDefId: string, stageIndex: number): StageInfo {
  const card = PLANT_CARDS[plantDefId];
  const defaultDurations = [7, 21, 28, 45];
  const defaultGDD: [number, number, number, number] = [50, 200, 400, 800];

  const durations = card?.stageDurations ?? defaultDurations;
  const gdd = card?.stageGDD ?? defaultGDD;

  return {
    index: stageIndex,
    label: STAGE_LABELS[stageIndex] ?? 'Inconnu',
    emoji: STAGE_EMOJIS[stageIndex] ?? '❓',
    durationDays: durations[Math.min(stageIndex, durations.length - 1)] ?? 0,
    gddTarget: gdd[Math.min(stageIndex, gdd.length - 1)] ?? 0,
    description: getStageDescription(plantDefId, stageIndex),
  };
}

// ═══════════════════════════════════════════════════════════════
//  FONCTIONS DE CALCUL — EAU (ET0 FAO)
// ═══════════════════════════════════════════════════════════════

/**
 * Calcule les besoins en eau (ETc) selon FAO.
 * ETc = Kc × ET0
 *
 * @param plantDefId  ID de la plante
 * @param et0MmPerDay  ET0 de référence (mm/jour)
 * @param surfaceM2   Surface occupée (m²)
 */
export function getWaterNeed(
  plantDefId: string,
  et0MmPerDay: number,
  surfaceM2: number = 0.25
): WaterNeedResult {
  const card = PLANT_CARDS[plantDefId];
  const defaultKc = 1.0;
  const kc = card?.kc ?? defaultKc;

  const etcMmPerDay = kc * et0MmPerDay;
  const needLPerDay = etcMmPerDay * surfaceM2;

  return {
    etcMmPerDay,
    needLPerDay,
    waterSavingPct: 0,
    urgency: 'ok',
    breakdown: [],
  };
}

/**
 * Retourne l'urgence d'arrosage basée sur le niveau d'eau.
 */
export function getWaterUrgency(waterLevel: number): WaterNeedResult['urgency'] {
  if (waterLevel < 15) return 'critique';
  if (waterLevel < 30) return 'urgent';
  return 'ok';
}

// ═══════════════════════════════════════════════════════════════
//  FONCTIONS DE CALCUL — COMPAGNONNAGE (INRAE)
// ═══════════════════════════════════════════════════════════════

/**
 * Analyse le compagnonnage d'une plante.
 *
 * @param plantDefId  Plante à analyser
 * @param nearbyPlantIds  IDs des plantes voisines
 */
export function getCompanions(
  plantDefId: string,
  nearbyPlantIds: string[]
): CompanionResult {
  const card = PLANT_CARDS[plantDefId];
  if (!card) {
    return { score: 'neutre', beneficialCount: 0, harmfulCount: 0, tip: 'Aucune donnée' };
  }

  let beneficialCount = 0;
  let harmfulCount = 0;

  for (const companion of card.companions) {
    if (nearbyPlantIds.includes(companion.plantId)) {
      if (companion.type === 'beneficial') beneficialCount++;
      if (companion.type === 'harmful') harmfulCount++;
    }
  }

  const score: CompanionResult['score'] =
    harmfulCount > 0 ? 'mauvais'
    : beneficialCount >= 2 ? 'excellent'
    : beneficialCount === 1 ? 'bon'
    : 'neutre';

  let tip = '';
  if (harmfulCount > 0) {
    tip = `⚠️ ${harmfulCount} conflit(s) détecté(s) — risque phyto/compétition racinaire`;
  } else if (beneficialCount > 0) {
    tip = `✅ ${beneficialCount} association(s) bénéfique(s) active(s)`;
  } else {
    const firstGood = card.companions.find(c => c.type === 'beneficial');
    tip = `💡 Associer avec ${firstGood?.plantId ?? 'une autre culture'} pour synergies`;
  }

  return { score, beneficialCount, harmfulCount, tip };
}

// ═══════════════════════════════════════════════════════════════
//  FONCTIONS DE CALCUL — SOL
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifie si le sol est assez chaud pour semis.
 *
 * @param soilTempC  Température du sol (°C)
 * @param plantDefId  ID de la plante
 */
export function getSoilStatus(soilTempC: number, plantDefId: string): SoilResult {
  const card = PLANT_CARDS[plantDefId];
  const minTemp = card?.minSoilTempForSowing ?? 10;
  const optTemp = card?.optimalSoilTemp ?? 18;

  const isOk = soilTempC >= minTemp;
  let message = '';
  let sowingAdvice = '';

  if (soilTempC < minTemp) {
    if (soilTempC < minTemp - 5) {
      sowingAdvice = `Sol trop froid (${soilTempC.toFixed(1)}°C). Attendre T° > ${minTemp}°C`;
      message = '❄️ Sol trop froid — semis risqué';
    } else {
      sowingAdvice = `Proche du seuil — protéger le semis`;
      message = '🌡️ Sol encore frais — protéger';
    }
  } else if (soilTempC >= optTemp) {
    sowingAdvice = `Sol à température optimale (${optTemp}°C)`;
    message = '✅ Sol favorable';
  } else {
    sowingAdvice = `Sol correct mais peut être meilleur (opt: ${optTemp}°C)`;
    message = '🌱 Sol acceptable';
  }

  return { tempC: soilTempC, isOk, sowingAdvice, message };
}

// ═══════════════════════════════════════════════════════════════
//  FONCTIONS DE CALCUL — MALADIES
// ═══════════════════════════════════════════════════════════════

export interface DiseaseRiskResult {
  name: string;
  emoji: string;
  riskPct: number;
  level: 'low' | 'medium' | 'high';
  prevention: string;
}

/**
 * Calcule le risque de maladie basé sur les conditions météo.
 *
 * @param plantDefId  ID de la plante
 * @param humidity    Humidité relative (%)
 * @param temperature Température (°C)
 * @param precipitation Pluie (mm)
 * @param windSpeed   Vitesse du vent (km/h)
 */
export function getDiseaseRisks(
  plantDefId: string,
  humidity: number,
  temperature: number,
  precipitation: number = 0,
  windSpeed: number = 10
): DiseaseRiskResult[] {
  const card = PLANT_CARDS[plantDefId];
  if (!card) return [];

  const results: DiseaseRiskResult[] = [];

  for (const disease of card.diseaseRisks) {
    let riskPct = 0;

    // Calcul spécifique par maladie
    if (disease.name === 'Mildiou') {
      // Mildiou : humidité > 90%, T10-25°C, pluie
      if (humidity > 90 && temperature >= 10 && temperature <= 25) {
        riskPct = Math.min(95, humidity * 0.5 + (precipitation > 0 ? 30 : 0));
      } else if (humidity > 80 && temperature >= 10 && temperature <= 25) {
        riskPct = Math.min(70, humidity * 0.4);
      }
    } else if (disease.name === 'Oïdium') {
      // Oïdium : humidité modérée 60-80%, T15-25°C, peu de vent
      if (humidity >= 60 && humidity <= 80 && temperature >= 15 && temperature <= 25) {
        riskPct = Math.min(80, humidity * 0.6 - windSpeed * 0.5);
      } else if (humidity > 80 && temperature >= 15 && temperature <= 25) {
        riskPct = 50;
      }
    } else {
      // Generic risk
      if (humidity > 85 && temperature >= 15 && temperature <= 25) {
        riskPct = 60;
      }
    }

    const level: DiseaseRiskResult['level'] =
      riskPct > 60 ? 'high'
      : riskPct > 30 ? 'medium'
      : 'low';

    results.push({
      name: disease.name,
      emoji: disease.emoji,
      riskPct,
      level,
      prevention: disease.prevention,
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════
//  FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Retourne la PlantCard complète d'une plante.
 */
export function getPlantCard(plantDefId: string): PlantCard | null {
  return PLANT_CARDS[plantDefId] ?? TREE_CARDS[plantDefId] ?? null;
}

/**
 * Retourne une TreeCard (arbre).
 */
export function getTreeCard(treeDefId: string): PlantCard | null {
  return TREE_CARDS[treeDefId] ?? null;
}

/**
 * Liste toutes les plantes (légumes/herbes).
 */
export function getAllPlantIds(): string[] {
  return Object.keys(PLANT_CARDS);
}

/**
 * Liste tous les arbres.
 */
export function getAllTreeIds(): string[] {
  return Object.keys(TREE_CARDS);
}

/**
 * Liste tous les IDs (plantes + arbres).
 */
export function getAllIds(): string[] {
  return [...Object.keys(PLANT_CARDS), ...Object.keys(TREE_CARDS)];
}

/**
 * Retourne les信息的通风 par stade actuel.
 */
function getStageDescription(plantDefId: string, stageIndex: number): string {
  const descriptions: Record<string, Record<number, string>> = {
    tomato: {
      0: 'Semis en terre, humidité élevée',
      1: 'Germination, apparition de la tige',
      2: 'Cotylédons visibles, Photosynthèse active',
      3: 'Croissance végétative, nouvelles feuilles',
      4: 'Floraison, pollinisation en cours',
      5: 'Fruits en formation, maturation',
    },
    carrot: {
      0: 'Semis, sol maintenu humide',
      1: 'Levée, racine commence à grossir',
      2: 'Petites feuilles, systeme racinaire',
      3: 'Croissance active de la racine',
      4: 'Racine en thickening, feuilles développé',
      5: 'Racine mature, prête à récolter',
    },
    lettuce: {
      0: 'Semis, lumière modérée',
      1: 'Levée, cotylédons ouverts',
      2: 'Premières vraies feuilles',
      3: 'Croissance rapide, pommaison',
      4: 'Laitue compactée, presque mûre',
      5: 'Laitue mature, récolter',
    },
    strawberry: {
      0: 'Plantation, enracinement',
      1: 'Nouvelles feuilles, stress initial',
      2: 'Croissance végétative',
      3: 'Floraison imminente',
      4: 'Floraison, pollinisation',
      5: 'Fructification, fruits en développement',
    },
    basil: {
      0: 'Semis, chaleur nécessaire',
      1: 'Germination, sensibilité au froid',
      2: 'Premières feuilles, aromes',
      3: 'Croissance buissonnante',
      4: 'Floraison, saveur optimale',
      5: 'Montée en graine, feuilles mûres',
    },
    pepper: {
      0: 'Semis, température élevée',
      1: 'Germination lente (14j+)',
      2: 'Plantule, croissance initiale',
      3: 'Croissance végétative importante',
      4: 'Floraison, fruits en formation',
      5: 'Maturation des piments',
    },
    cucumber: {
      0: 'Semis, sol chaud',
      1: 'Levée rapide, cotylédons',
      2: 'Premières feuilles vraies',
      3: 'Croissance rapide, vrilles',
      4: 'Floraison, fleurs mâles/femelles',
      5: 'Fruits en formation, croissance',
    },
    zucchini: {
      0: 'Semis, sol chaud',
      1: 'Levée, premières feuilles',
      2: 'Plantule, croissance vigoureuse',
      3: 'Feuilles grandes, fleurs',
      4: 'Floraison, fruits en formation',
      5: 'Fruits croissants, récolte jeune',
    },
    bean: {
      0: 'Semis, graine gonfle',
      1: 'Levée, racine émerge',
      2: 'Premières feuilles trifoliées',
      3: 'Croissance végétative, fix azote',
      4: 'Floraison, gousses en formation',
      5: 'Gousses matures, récolte sec',
    },
    pea: {
      0: 'Semis, graine germe',
      1: 'Levée, vrilles apparaissent',
      2: 'Plantule, croissance initiale',
      3: 'Croissance rapide, feuilles',
      4: 'Floraison, pollinisation',
      5: 'Gousses en formation, maturation',
    },
    spinach: {
      0: 'Semis, germination rapide',
      1: 'Levée, premières feuilles',
      2: 'Croissance rosette',
      3: 'Feuilles se développent',
      4: 'Croissance rapide, récolte',
      5: 'Montée en graine, fin cycle',
    },
    radish: {
      0: 'Semis, graine germe',
      1: 'Levée, cotylédons visibles',
      2: 'Premières feuilles, racine gonfle',
      3: 'Racine en formation',
      4: 'Racine mature, prête',
      5: 'Montée en graine',
    },
    cabbage: {
      0: 'Semis, germination',
      1: 'Levée, premières feuilles',
      2: 'Plantule, croissance initiale',
      3: 'Feuilles s\'étendent',
      4: 'Pommaison démarre',
      5: 'Pomme compacte, récolte',
    },
    eggplant: {
      0: 'Semis, chaleur nécessaire',
      1: 'Levée, plantule fragile',
      2: 'Croissance initiale',
      3: 'Croissance végétative',
      4: 'Floraison, fruits violets',
      5: 'Fruits en maturation',
    },
  };

  return descriptions[plantDefId]?.[stageIndex] ?? 'Stade de croissance';
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTES DE RÉFÉRENCE
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_KC = 1.0;
export const DEFAULT_SURFACE_M2 = 0.25; // 50cm x 50cm par plant maraîchage
export const DAYS_INFINITE = 99;         // Jours utilisés comme "infini"
export const GDD_INFINITE = 9999;       // GDD utilisés comme "infini"

// ═══════════════════════════════════════════════════════════════
//  HOOK COMPATIBILITÉ — Pour useAgroData.ts existant
// ═══════════════════════════════════════════════════════════════

/**
 * Hook-like accessor pour les données botaniques.
 * Utilisé par useAgroData.ts pour maintain compatibility.
 *
 * @deprecated Préférer les fonctions pures directement
 */
export function usePlantCard(plantDefId: string): PlantCard | null {
  return getPlantCard(plantDefId);
}

/**
 * Alias pour calcDailyGDD avec paramètres par défaut.
 */
export function calcPlantGDD(
  tMean: number,
  tMin: number,
  tMax: number,
  plantDefId: string
): number {
  return calcDailyGDD(tMean, tMin, tMax, plantDefId);
}
