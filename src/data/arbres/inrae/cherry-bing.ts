/**
 * Cherry Bing - INRAE
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "cherry-bing",
  plantDefId: "cherry",
  shopId: "inrae",
  category: "fruit-tree" as const,
  name: "Bing",
  emoji: "🍒",

  // === IMAGE ASSETS ===
  potImage: "/pots/inrae/pot-cherry-bing.png",
  stages: [
    "/trees/inrae/cherry-bing-stage-1.png",
    "/trees/inrae/cherry-bing-stage-2.png",
    "/trees/inrae/cherry-bing-stage-3.png",
    "/trees/inrae/cherry-bing-stage-4.png",
    "/trees/inrae/cherry-bing-stage-5.png",
  ],

  // === PRIX ===
  price: 180,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Auto-stérile",
    pollinator: "Stella, Van, Lapins",
    note: "Necessite un pollinisateur pour produire"
  },

  // === PERIODE ===
  period: {
    flowering: ["20 avr", "10 mai"],
    harvest: ["15 jui", "30 jui"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 8,
      optimal: { min: 15, max: 25 },
      max: 30,
      frostResistance: -20,
    },
    soil: {
      ph: "6.0-7.0",
      type: "Profond, bien draine, pas trop calcaire",
      amendment: "Compost mature avant plantation",
    },
    light: {
      needs: 7,
      note: "Soleil direct minimum 7h/jour",
    },
    waterNeeds: "medium",
    irrigation: "Arrosage regulier en periode seche",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "3-4 ans apres plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "4-6 m",
    spread: "4-5 m",
    lifespan: "40-60 ans",
    annualGrowth: "40-60 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "25-50 kg/arbre",
    fruitSize: "2-3 cm",
    fruitsPerTree: "5000-10000",
    harvestWindow: "1-2 semaines",
    conservation: "5-7 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme et sucree, saveur riche et aromatique",
  texture: "Ferme et croquante",
  consumption: "Frais, clafoutis, confiture, glace, liqueur",
  nutrition: {
    calories: "63 kcal/100g",
    vitaminC: "Elevee",
    potassium: "Eleve",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete americaine classique, chair ferme et tres parfume. Pollinitateur essentiel.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagete"],
  enemies: ["noyer", "cedre", "autres cerisiers incompatible"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1460,
    optimalTemp: [8, 25],
    waterNeed: 4.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
