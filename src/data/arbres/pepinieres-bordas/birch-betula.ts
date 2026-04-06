/**
 * Birch Betula - Pépinières Bordas
 * Carte arbre ornemental complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "birch-betula",
  plantDefId: "birch",
  shopId: "pepinieres-bordas",
  category: "ornamental-tree" as const,
  name: "Bouleau Blanc",
  emoji: "🌳",

  // === IMAGE ASSETS ===
  potImage: "/pots/pepinieres-bordas/pot-birch-betula.png",
  stages: [
    "/trees/pepinieres-bordas/birch-betula-stage-1.png",
    "/trees/pepinieres-bordas/birch-betula-stage-2.png",
    "/trees/pepinieres-bordas/birch-betula-stage-3.png",
    "/trees/pepinieres-bordas/birch-betula-stage-4.png",
    "/trees/pepinieres-bordas/birch-betula-stage-5.png",
  ],

  // === PRIX ===
  price: 100,
  grams: 0.5,
  ageYears: "2-3 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Anémophile",
    pollinator: null,
    note: "Pollinisation par le vent"
  },

  // === PERIODE ===
  period: {
    flowering: ["20 mars", "10 avr"],
    harvest: ["15 aout", "15 sept"],
    planting: ["15 oct", "15 mars"],
    dormancy: ["1 nov", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 0,
      optimal: { min: 10, max: 25 },
      max: 35,
      frostResistance: -35,
    },
    soil: {
      ph: "5.0-7.0",
      type: "Léger, sableux, frais, bien drainé",
      amendment: "Terreau Tourbe pour acidité",
    },
    light: {
      needs: 7,
      note: "Soleil direct, tolère mi-ombre",
    },
    waterNeeds: "medium",
    irrigation: "Arrosage regulier, especially en période seche",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: null,
    fullProduction: null,
    matureTreeHeight: "15-25 m",
    spread: "8-12 m",
    lifespan: "60-90 ans",
    annualGrowth: "40-80 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: null,
    fruitSize: "2-3 mm (graines)",
    fruitsPerTree: "Milliers de graines",
    harvestWindow: "Eté-automne",
    conservation: "Graimes à semer rapidement ou stratifier",
  },

  // === QUALITES ORNEMENTALES ===
  foliage: "Feuilles triangulaires vert clair, jaundice d'automne jaune doré",
  texture: "Écorce blanche et noire, texturée",
  usage: "Groupe, alignement, bordure, jardin",
  autumnColor: "Jaune lumineux",

  // === NOTES DE CULTURE ===
  notes: "Arbre ornemental élégant et lumineux. Écorce decorée et feuillage doré en automne.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["fougère", "mysrtille", "callune"],
  enemies: ["especes aimant sol calcaire"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [45, 90, 180, 365],
    realDaysToHarvest: null,
    optimalTemp: [0, 25],
    waterNeed: 4.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
