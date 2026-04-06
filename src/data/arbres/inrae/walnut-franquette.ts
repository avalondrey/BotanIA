/**
 * Walnut Franquette - INRAE
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "walnut-franquette",
  plantDefId: "walnut",
  shopId: "inrae",
  category: "fruit-tree" as const,
  name: "Franquette",
  emoji: "🌰",

  // === IMAGE ASSETS ===
  potImage: "/pots/inrae/pot-walnut-franquette.png",
  stages: [
    "/trees/inrae/walnut-franquette-stage-1.png",
    "/trees/inrae/walnut-franquette-stage-2.png",
    "/trees/inrae/walnut-franquette-stage-3.png",
    "/trees/inrae/walnut-franquette-stage-4.png",
    "/trees/inrae/walnut-franquette-stage-5.png",
  ],

  // === PRIX ===
  price: 200,
  grams: 0.5,
  ageYears: "2-3 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: null,
    note: "Peut produire seul mais meilleur avec autre variete tardive"
  },

  // === PERIODE ===
  period: {
    flowering: ["15 avr", "5 mai"],
    harvest: ["10 oct", "31 oct"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 nov", "31 mars"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 10,
      optimal: { min: 15, max: 28 },
      max: 38,
      frostResistance: -25,
    },
    soil: {
      ph: "6.5-7.5",
      type: "Profond, bien draine, pas trop acide",
      amendment: "Compost mature, avoidance de terrain humide",
    },
    light: {
      needs: 7,
      note: "Soleil direct minimum 7h/jour",
    },
    waterNeeds: "medium",
    irrigation: "Arrosage occasional en periode seche pour jeunes arbres",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "6-8 ans apres plantation",
    fullProduction: "12-15 ans",
    matureTreeHeight: "10-15 m",
    spread: "8-12 m",
    lifespan: "150-200 ans",
    annualGrowth: "40-60 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "30-60 kg/arbre",
    fruitSize: "3-4 cm",
    fruitsPerTree: "500-1500",
    harvestWindow: "2-3 semaines",
    conservation: "Plusieurs années en lieu sec",
  },

  // === QUALITES CULINAIRES ===
  taste: "Amande douce et parfume, saveur riche",
  texture: "Ferme et croquante",
  consumption: "Frais, gateaux, glaces, huile, confiserie",
  nutrition: {
    calories: "654 kcal/100g",
    proteins: "Eleve (15g/100g)",
    omega3: "Tres eleve",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete française tardive et productive,noix de qualité supérieure. Arbre majestueux.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["aucun - inhibe croissance nombreuses plantes"],
  enemies: ["tomate", "pomme de terre", "bleuet"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [60, 120, 240, 720],
    realDaysToHarvest: 2190,
    optimalTemp: [10, 28],
    waterNeed: 3.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
