/**
 * Pear Louise Bonne - Arbres Tissot
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pear-louise-bonne",
  plantDefId: "pear",
  shopId: "arbres-tissot",
  category: "fruit-tree" as const,
  name: "Louise Bonne",
  emoji: "🍐",

  // === IMAGE ASSETS ===
  potImage: "/pots/arbres-tissot/pot-pear-louise-bonne.png",
  stages: [
    "/trees/arbres-tissot/pear-louise-bonne-stage-1.png",
    "/trees/arbres-tissot/pear-louise-bonne-stage-2.png",
    "/trees/arbres-tissot/pear-louise-bonne-stage-3.png",
    "/trees/arbres-tissot/pear-louise-bonne-stage-4.png",
    "/trees/arbres-tissot/pear-louise-bonne-stage-5.png",
  ],

  // === PRIX ===
  price: 160,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: "Conference, Williams",
    note: "Pollinisation croisee recommandee"
  },

  // === PERIODE ===
  period: {
    flowering: ["12 avr", "1 mai"],
    harvest: ["5 sept", "25 sept"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 7,
      optimal: { min: 15, max: 24 },
      max: 30,
      frostResistance: -25,
    },
    soil: {
      ph: "6.0-7.0",
      type: "Profond, frais, bien draine",
      amendment: "Compost mature avant plantation",
    },
    light: {
      needs: 6,
      note: "Soleil direct minimum 6h/jour",
    },
    waterNeeds: "medium",
    irrigation: "Regulier en periode seche, 25-30L/semaine",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "3-4 ans apres plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "4-6 m",
    spread: "3-4 m",
    lifespan: "50-75 ans",
    annualGrowth: "35-55 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "45-75 kg/arbre",
    fruitSize: "6-8 cm",
    fruitsPerTree: "100-200",
    harvestWindow: "1-2 semaines",
    conservation: "2-4 semaines au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair fine et fondante, saveur sucree et delicate",
  texture: "Fondante et delicatement beurreuse",
  consumption: "Frais, tarte, poires au vin",
  nutrition: {
    calories: "54 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Elevee (3.0g/100g)",
    potassium: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete française ancienne, chair fondante et parfumée. Fruit妒 Length et elegant.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagete"],
  enemies: ["noyer", "cedre"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1095,
    optimalTemp: [7, 24],
    waterNeed: 4.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
