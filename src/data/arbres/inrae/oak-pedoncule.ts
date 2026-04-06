/**
 * Oak Pedoncule - INRAE
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "oak-pedoncule",
  plantDefId: "oak",
  shopId: "inrae",
  category: "fruit-tree" as const,
  name: "Chêne Pédonculé",
  emoji: "🌳",

  // === IMAGE ASSETS ===
  potImage: "/pots/inrae/pot-oak-pedoncule.png",
  stages: [
    "/trees/inrae/oak-pedoncule-stage-1.png",
    "/trees/inrae/oak-pedoncule-stage-2.png",
    "/trees/inrae/oak-pedoncule-stage-3.png",
    "/trees/inrae/oak-pedoncule-stage-4.png",
    "/trees/inrae/oak-pedoncule-stage-5.png",
  ],

  // === PRIX ===
  price: 180,
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
    flowering: ["15 avr", "15 mai"],
    harvest: ["1 oct", "30 nov"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: { min: 10, max: 30 },
      max: 40,
      frostResistance: -30,
    },
    soil: {
      ph: "5.0-7.5",
      type: "Profond, frais, bien draine, tolère les sols humides",
      amendment: "Aucune amendment nécessaire",
    },
    light: {
      needs: 6,
      note: "Soleil direct ou mi-ombre",
    },
    waterNeeds: "medium",
    irrigation: "Arrosage occasionnel pour jeunes arbres",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "15-20 ans (glands comestibles)",
    fullProduction: "40-60 ans",
    matureTreeHeight: "20-40 m",
    spread: "15-25 m",
    lifespan: "500-1000 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "Variable selon age et conditions",
    fruitSize: "2-3 cm",
    fruitsPerTree: "Plusieurs milliers de glands",
    harvestWindow: "2-3 mois",
    conservation: "Glands à traiter (toxiques crus) avant consommation",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair douce et légèrement amère après traitement (torréfaction)",
  texture: "Ferme après préparation",
  consumption: "Café de glands, farine, huile alimentaire (traitée)",
  nutrition: {
    calories: "200 kcal/100g (secs)",
    proteins: "Modérée",
    amidon: "Élevé",
    tannins: "Élevés (à éliminer)",
  },

  // === NOTES DE CULTURE ===
  notes: "Arbre majestueux européen, glands à transformer. Très long terme - héritage pour générations.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["trèfle", "fougères"],
  enemies: ["espèces sensibles aux tannins"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [60, 120, 240, 720],
    realDaysToHarvest: 5475,
    optimalTemp: [5, 30],
    waterNeed: 3.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
