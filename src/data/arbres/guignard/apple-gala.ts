/**
 * Apple Gala - Guignard
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "apple-gala",
  plantDefId: "apple",
  shopId: "guignard",
  category: "fruit-tree" as const,
  name: "Gala",
  emoji: "🍎",

  // === IMAGE ASSETS ===
  potImage: "/pots/guignard/pot-apple-gala.png",
  stages: [
    "/trees/guignard/apple-gala-stage-1.png",
    "/trees/guignard/apple-gala-stage-2.png",
    "/trees/guignard/apple-gala-stage-3.png",
    "/trees/guignard/apple-gala-stage-4.png",
    "/trees/guignard/apple-gala-stage-5.png",
  ],

  // === PRIX ===
  price: 150,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: null,
    note: "Peut produire seul mais meilleur rendement avec autre variete"
  },

  // === PERIODE ===
  period: {
    flowering: ["20 avr", "20 mai"],
    harvest: ["15 aout", "30 sept"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 8,
      optimal: { min: 15, max: 24 },
      max: 32,
      frostResistance: -25,
    },
    soil: {
      ph: "6.0-7.0",
      type: "Profond, riche, bien draine",
      amendment: "Compost mature avant plantation",
    },
    light: {
      needs: 6,
      note: "Soleil direct minimum 6h/jour",
    },
    waterNeeds: "medium",
    irrigation: "Regulier en periode seche, 20-30L/semaine",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "2-3 ans apres plantation",
    fullProduction: "4-6 ans",
    matureTreeHeight: "2.5-4 m",
    spread: "2-3 m",
    lifespan: "40-60 ans",
    annualGrowth: "25-40 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "40-70 kg/arbre",
    fruitSize: "5-7 cm",
    fruitsPerTree: "100-200",
    harvestWindow: "2-3 semaines",
    conservation: "4-6 mois en cave humide (3-5C)",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair croquante et juteuse, saveur sucree et aromatique",
  texture: "Ferme et croquante",
  consumption: "Frais, gateaux, compotes, jus",
  nutrition: {
    calories: "52 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Elevee (2.4g/100g)",
    antioxidants: "Moyens",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete neo-zelandaise tres populaire, chair ferme et parfume. Bonne conservation.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagete"],
  enemies: ["noyer", "cedre", "noisetier"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 730,
    optimalTemp: [8, 24],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
