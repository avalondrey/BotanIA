/**
 * Pear Conference - Arbres Tissot
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pear-conference",
  plantDefId: "pear",
  shopId: "arbres-tissot",
  category: "fruit-tree" as const,
  name: "Conference",
  emoji: "🍐",

  // === IMAGE ASSETS ===
  potImage: "/pots/arbres-tissot/pot-pear-conference.png",
  stages: [
    "/trees/arbres-tissot/pear-conference-stage-1.png",
    "/trees/arbres-tissot/pear-conference-stage-2.png",
    "/trees/arbres-tissot/pear-conference-stage-3.png",
    "/trees/arbres-tissot/pear-conference-stage-4.png",
    "/trees/arbres-tissot/pear-conference-stage-5.png",
  ],

  // === PRIX ===
  price: 165,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: null,
    note: "Peut produire seul mais meilleur avec autre variete"
  },

  // === PERIODE ===
  period: {
    flowering: ["10 avr", "5 mai"],
    harvest: ["10 sept", "10 oct"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 7,
      optimal: { min: 15, max: 24 },
      max: 32,
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
    irrigation: "Regulier en periode seche, 25-35L/semaine",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "3-4 ans apres plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "3-5 m",
    spread: "2-3 m",
    lifespan: "50-75 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "50-80 kg/arbre",
    fruitSize: "7-10 cm",
    fruitsPerTree: "120-250",
    harvestWindow: "2-3 semaines",
    conservation: "3-4 semaines au frais, 2 mois en冰箱",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair fondante et sucree, saveur delicate et parfume",
  texture: "Fondante et juteuse",
  consumption: "Frais, tarte, poires au vin, conserve",
  nutrition: {
    calories: "54 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Elevee (3.1g/100g)",
    potassium: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete anglaise tres culturee, fruit allonge et fondant. Pollinitateur appreciate.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagete"],
  enemies: ["noyer", "cedre"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1095,
    optimalTemp: [7, 24],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
