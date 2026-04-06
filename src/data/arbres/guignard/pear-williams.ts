/**
 * Pear Williams - Guignard
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pear-williams",
  plantDefId: "pear",
  shopId: "guignard",
  category: "fruit-tree" as const,
  name: "Williams",
  emoji: "🍐",

  // === IMAGE ASSETS ===
  potImage: "/pots/guignard/pot-pear-williams.png",
  stages: [
    "/trees/guignard/pear-williams-stage-1.png",
    "/trees/guignard/pear-williams-stage-2.png",
    "/trees/guignard/pear-williams-stage-3.png",
    "/trees/guignard/pear-williams-stage-4.png",
    "/trees/guignard/pear-williams-stage-5.png",
  ],

  // === PRIX ===
  price: 160,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: "Conference ou Beurre Hardy",
    note: "Meilleur rendement avec pollinisateur"
  },

  // === PERIODE ===
  period: {
    flowering: ["15 avr", "5 mai"],
    harvest: ["20 aout", "15 sept"],
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
    spread: "3-4 m",
    lifespan: "50-75 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "60-100 kg/arbre",
    fruitSize: "6-8 cm",
    fruitsPerTree: "150-300",
    harvestWindow: "1-2 semaines",
    conservation: "2-3 semaines au frais, 1 mois en冰箱",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair fine, juteuse et sucrée, arôme délicat",
  texture: "Fondante et juteuse",
  consumption: "Frais, jus, liqueur (Poire), tarte, poêlée",
  nutrition: {
    calories: "54 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Elevee (3.1g/100g)",
    potassium: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete anglaise tres populaire, chair fondante et parfumée. Ideal pour le jus et l'eau-de-vie.",

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
