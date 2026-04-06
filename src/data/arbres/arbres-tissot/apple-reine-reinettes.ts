/**
 * Apple Reine des Reinettes - Arbres Tissot
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "apple-reine-reinettes",
  plantDefId: "apple",
  shopId: "arbres-tissot",
  category: "fruit-tree" as const,
  name: "Reine des Reinettes",
  emoji: "🍎",

  // === IMAGE ASSETS ===
  potImage: "/pots/arbres-tissot/pot-apple-reine-reinettes.png",
  stages: [
    "/trees/arbres-tissot/apple-reine-reinettes-stage-1.png",
    "/trees/arbres-tissot/apple-reine-reinettes-stage-2.png",
    "/trees/arbres-tissot/apple-reine-reinettes-stage-3.png",
    "/trees/arbres-tissot/apple-reine-reinettes-stage-4.png",
    "/trees/arbres-tissot/apple-reine-reinettes-stage-5.png",
  ],

  // === PRIX ===
  price: 155,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Partiellement autofertile",
    pollinator: "Golden Delicious, Gala",
    note: "Meilleur rendement avec pollinisateur"
  },

  // === PERIODE ===
  period: {
    flowering: ["20 avr", "15 mai"],
    harvest: ["15 sept", "15 oct"],
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
    firstHarvest: "3-4 ans apres plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "3-5 m",
    spread: "3-4 m",
    lifespan: "50-80 ans",
    annualGrowth: "30-45 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "40-70 kg/arbre",
    fruitSize: "6-8 cm",
    fruitsPerTree: "100-200",
    harvestWindow: "2-3 semaines",
    conservation: "4-6 mois en cave humide",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme et parfumée, saveur sucree avec acidite equilibree",
  texture: "Ferme et croquante",
  consumption: "Frais, gateaux, compotes, tarte",
  nutrition: {
    calories: "52 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Elevee (2.4g/100g)",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete Holandaise ancienne, chair ferme et gouteuse. Excellente conservation.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagete"],
  enemies: ["noyer", "cedre", "noisetier"],

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
