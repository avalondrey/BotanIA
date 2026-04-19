/**
 * Radis Flamboyant 2 - Clause
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "radish-flamboyant",
  plantDefId: "radish",
  shopId: "clause",
  category: "vegetable" as const,
  name: "Radis Flamboyant",
  emoji: "🥗",

  // === IMAGE ASSETS ===
  packetImage: "/packets/clause/packet-radish-flamboyant.png",
  cardImage: "/cards/seeds/clause/radish-flamboyant.png",
  stages: [
    "/plants/radish-stage-1.png",
    "/plants/radish-stage-2.png",
    "/plants/radish-stage-3.png",
    "/plants/radish-stage-4.png",
    "/plants/radish-stage-5.png",
  ],

  // === PRIX & QUANTITE ===
  price: 20,
  gramsPerPacket: 5,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["15 fev", "15 sept"],
    },
    harvest: ["15 mars", "15 oct"],
    cycleDays: 30,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 8,
      optimal: 15,
      max: 25,
      frostResistance: -3,
    },
    waterNeeds: "medium" as const,
    rainRequired: "25-35mm/semaine",
    irrigationNote: "Arrosage frequent et regulier pour eviter le piqure",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, sableux, bien draine, sans pierres",
      compost: "Pas de fumier frais",
    },

    light: {
      needs: 6,
      optimalLux: 25000,
    },

    growthRate: "1-2cm/semaine en sol",
    spacingCm: { between: 3, rows: 15 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 5, note: "Levee tres rapide 3-7 jours" },
    firstLeaves: { days: 15, note: "Feuilles en rosette" },
    rootGrowth: { days: 22, note: "Racine en grossissement" },
    harvest: { days: 30, note: "Radis murs, peau lisse et couleur vive" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "200-400g/m2",
    fruitsPerPlant: null,
    fruitWeight: "15-25g",
    harvestPeriod: ["15 mars", "15 oct"],
    conservation: "5-7 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair croquante et douce, saveur legement piquante",
  texture: "Ferme et croquante",
  consumption: "Frais en salade, avec du pain, decoration",
  nutrition: {
    calories: "12 kcal/100g",
    vitaminC: "Elevee",
    potassium: "Moyen",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete a racine longue et rouge. Croissance tres rapide. Arrosage regulier essentiel.",
  companions: ["carotte", "laitue", "pois"],
  enemies: ["chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [5, 8, 7, 10],
    realDaysToHarvest: 30,
    optimalTemp: [8, 20],
    waterNeed: 3.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
