/**
 * Cabbage Chou Milan - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "cabbage-chou-milan",
  plantDefId: "cabbage",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Chou de Milan",
  emoji: "🥬",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-cabbage-chou-milan.png",
  cardImage: "/cards/seeds/lebiau/cabbage-chou-milan.png",
  stages: [
    "/plants/cabbage-stage-1.png",
    "/plants/cabbage-stage-2.png",
    "/plants/cabbage-stage-3.png",
    "/plants/cabbage-stage-4.png",
    "/plants/cabbage-stage-5.png",
    "/plants/cabbage-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 25,
  gramsPerPacket: 1,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "15 mai"],
      outdoor: ["15 avr", "15 jui"],
    },
    harvest: ["15 sept", "15 dec"],
    cycleDays: 150,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: 16,
      max: 28,
      frostResistance: -10,
    },
    waterNeeds: "high" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage copieux et regulier, sol toujours frais",

    soil: {
      ph: "6.5-7.5",
      type: "Riche en matiere organique, profond, frais",
      compost: "Apport genereux avant plantation",
    },

    light: {
      needs: 7,
      optimalLux: 30000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 60, rows: 70 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 7, note: "Levee en 5-10 jours a 15-20C" },
    firstLeaves: { days: 30, note: "Rosette de feuilles" },
    headFormation: { days: 90, note: "Pomme commence a se former" },
    harvest: { days: 150, note: "Pomme compacte et lourde" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "2-4kg/plante",
    fruitsPerPlant: 1,
    fruitWeight: "2-4kg",
    harvestPeriod: ["15 sept", "15 dec"],
    conservation: "3-6 mois en lieu frais et sec",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair tendre et douce, saveur delicatement sucree",
  consumption: "Choucroute, pot-au-feu, gratin, cru en salade",
  nutrition: {
    calories: "20 kcal/100g",
    vitaminC: "Elevee",
    vitaminK: "Eleve",
    fibers: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Chou pommeletres tolerant au froid. Excellent pour les regions a hivpers froids.",
  companions: ["celeri", "oignon", "laitue"],
  enemies: ["fraise", "tomate", "autres choux"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [7, 30, 60, 53],
    realDaysToHarvest: 150,
    optimalTemp: [10, 22],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
