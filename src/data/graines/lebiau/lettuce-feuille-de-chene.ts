/**
 * Lettuce Feuille de Chene - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "lettuce-feuille-de-chene",
  plantDefId: "lettuce",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Laitue Feuille de Chene",
  emoji: "🥬",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-lettuce-feuille-de-chene.png",
  cardImage: "/cards/seeds/lebiau/lettuce-feuille-de-chene.png",
  stages: [
    "/plants/lettuce-stage-1.png",
    "/plants/lettuce-stage-2.png",
    "/plants/lettuce-stage-3.png",
    "/plants/lettuce-stage-4.png",
    "/plants/lettuce-stage-5.png",
    "/plants/lettuce-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 22,
  gramsPerPacket: 1,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "15 sept"],
      outdoor: ["15 mars", "15 aout"],
    },
    harvest: ["15 avr", "15 oct"],
    cycleDays: 55,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: 15,
      max: 25,
      frostResistance: -5,
    },
    waterNeeds: "medium" as const,
    rainRequired: "25-35mm/semaine",
    irrigationNote: "Arrosage frequent mais leger, sol toujours frais",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, frais, bien draine",
      compost: "Apport leger avant plantation",
    },

    light: {
      needs: 6,
      optimalLux: 25000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 25, rows: 35 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 5, note: "Levee tres rapide 3-7 jours a 15-20C" },
    firstLeaves: { days: 20, note: "Feuilles en rosette a尔德es" },
    growth: { days: 35, note: "Pousse vegetative" },
    harvest: { days: 55, note: "Quand feuilles sontbien developpees" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "200-400g/plante",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 avr", "15 oct"],
    conservation: "5-7 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Feuilles tendres et delicates, saveur douce et legere",
  consumption: "Frais en salade, burger, wrap",
  nutrition: {
    calories: "12 kcal/100g",
    vitaminC: "Moyenne",
    vitaminK: "Eleve",
    folate: "Moyen",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete a feuilles dechirees like oak leaf,tres tendre et decorative. Croissance rapide.",
  companions: ["carotte", "radis", "fraise"],
  enemies: ["celeri", "persil"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [5, 12, 13, 25],
    realDaysToHarvest: 55,
    optimalTemp: [10, 20],
    waterNeed: 3.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
