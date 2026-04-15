/**
 * Photinia panaché  — Leaderplant
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "photinia-louise",
  plantDefId: "photinia",
  shopId: "leaderplant",
  category: "vegetable" as const,
  name: "Photinia panaché ",
  emoji: "🌿",

  // === IMAGE ASSETS ===
  packetImage: "/packets/leaderplant/packet-photinia-louise.png",
  cardImage: "/cards/seeds/leaderplant/photinia-louise.png",
  stages: [
    "/plants/photinia-stage-1.png",
    "/plants/photinia-stage-2.png",
    "/plants/photinia-stage-3.png",
    "/plants/photinia-stage-4.png",
    "/plants/photinia-stage-5.png",
    "/plants/photinia-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 160,
  gramsPerPacket: 3,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["15 fev", "15 aout"],
    },
    harvest: ["15 mai", "15 nov"],
    cycleDays: 70,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 10,
      optimal: 22,
      max: 32,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage régulier, sol toujours frais mais pas saturé",

    soil: {
      ph: "6.0-7.0",
      type: "Sol bien drainé et riche en matière organique",
      compost: "Apport de compost avant plantation",
    },

    light: {
      needs: 7,
      optimalLux: 35000,
    },

    growthRate: "Croissance régulière en conditions optimales",
    spacingCm: { between: 30, rows: 50 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 8, note: "Levée en 7-11 jours" },
    growth: { days: 28, note: "Développement foliaire" },
    maturation: { days: 53, note: "Formation des fruits" },
    harvest: { days: 70, note: "Maturité et récolte" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "1-3kg/plante",
    fruitWeight: "100-200g",
    harvestPeriod: ["15 mai", "15 nov"],
    conservation: "5-10 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Saveur fraîche et naturelle",
  consumption: "Frais, cuisiné, conserves",
  nutrition: {
    calories: "Variable selon préparation",
    vitaminC: "Présente",
    fibers: "Modérée",
  },

  // === NOTES DE CULTURE ===
  notes: "Photinia panaché exclusif. Feuillage tricolore : jeunes pousses rose vif sur fond vert marginé de blanc crème. Persistant, compact.",
  companions: ["persil", "basilic", "carotte"],
  enemies: ["fenouil", "ail"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [17, 17, 17, 19],
    realDaysToHarvest: 70,
    optimalTemp: [13, 27],
    waterNeed: 3.5,
    lightNeed: 7,
  },
};

export default CARD_DATA;
