/**
 * Apple Golden Delicious - Guignard
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "apple-golden",
  plantDefId: "apple",
  shopId: "guignard",
  category: "fruit-tree" as const,
  name: "Golden Delicious",
  emoji: "🍎",

  // === IMAGE ASSETS ===
  potImage: "/pots/guignard/pot-apple-golden.png",
  stages: [
    "/trees/guignard/apple-golden-stage-1.png",
    "/trees/guignard/apple-golden-stage-2.png",
    "/trees/guignard/apple-golden-stage-3.png",
    "/trees/guignard/apple-golden-stage-4.png",
    "/trees/guignard/apple-golden-stage-5.png",
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
    flowering: ["15 avr", "15 mai"],
    harvest: ["15 sept", "15 oct"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    // Temperature
    temperature: {
      base: 8,
      optimal: { min: 15, max: 22 },
      max: 35,
      frostResistance: -25,
    },
    // Sol
    soil: {
      ph: "6.0-7.0",
      type: "Profond, riche, bien draine",
      amendment: "Compost mature avant plantation",
    },
    // Lumière
    light: {
      needs: 6,
      note: "Soleil direct minimum 6h/jour",
    },
    // Eau
    waterNeeds: "medium",
    irrigation: "Regularier en periode seche, 20-30L/semaine",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "2-3 ans apres plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "3-5 m",
    spread: "3-4 m",
    lifespan: "50-80 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "50-80 kg/arbre",
    fruitSize: "6-8 cm",
    fruitsPerTree: "150-300",
    harvestWindow: "2-3 semaines",
    conservation: "6-8 mois en cave humide (3-5C)",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair douce et juteuse, saveur sucree et parfumee",
  texture: "Croquante, chair ferme",
  consumption: "Frais, gateaux, compotes, jus, tarte",
  nutrition: {
    calories: "52 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Elevee (2.4g/100g)",
    antioxidants: "Eleves (polyphenols)",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete classique worldwide, excellente conservation. Pale la peau quand mure. Chair dorée caractéristique.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagete"],
  enemies: ["noyer", "cedre", "noisetier"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 730,
    optimalTemp: [8, 22],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
