/**
 * Spinach Merlon Vert - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "spinach-merlon-vert",
  plantDefId: "spinach",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Epinard Merlon Vert",
  emoji: "🥬",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-spinach-merlon-vert.png",
  cardImage: "/cards/seeds/lebiau/spinach-merlon-vert.png",
  stages: [
    "/plants/spinach-stage-1.png",
    "/plants/spinach-stage-2.png",
    "/plants/spinach-stage-3.png",
    "/plants/spinach-stage-4.png",
    "/plants/spinach-stage-5.png",
    "/plants/spinach-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 25,
  gramsPerPacket: 5,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["15 fev", "15 avr", "15 aout", "15 sept"],
    },
    harvest: ["15 avr", "15 jui", "15 oct", "15 nov"],
    cycleDays: 50,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: 15,
      max: 22,
      frostResistance: -5,
    },
    waterNeeds: "high" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage frequent et copieux, ne jamais laisser secher",

    soil: {
      ph: "6.5-7.5",
      type: "Riche en azote, frais, bien draine",
      compost: "Apport modere avant semis",
    },

    light: {
      needs: 6,
      optimalLux: 25000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 8, rows: 25 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 8, note: "Levee en 5-10 jours a 10-15C" },
    firstLeaves: { days: 20, note: "Rosette de feuilles" },
    growth: { days: 35, note: "Croissance vegetative rapide" },
    harvest: { days: 50, note: "Feuilles bien developpees, recolte ext\u00e9rieure" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "300-500g/m2",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 avr", "15 jui", "15 oct", "15 nov"],
    conservation: "2-3 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Feuilles tendres et delicates, saveur douce et legere",
  consumption: "Cru en salade, vapeur, soupe, quiche",
  nutrition: {
    calories: "16 kcal/100g",
    vitaminA: "Tres eleve",
    vitaminC: "Elevee",
    fer: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete productive et resistante au froid. Semis de printemps et automnal.",
  companions: ["fraise", "pois", "haricot"],
  enemies: ["celeri", "persil"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 12, 12, 18],
    realDaysToHarvest: 50,
    optimalTemp: [5, 18],
    waterNeed: 5.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
