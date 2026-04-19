/**
 * Melon Stellio HF1 — Vilmorin
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "melon-stellio",
  plantDefId: "melon",
  shopId: "vilmorin",
  category: "vegetable" as const,
  name: "Melon Stellio HF1",
  emoji: "🍈",

  // === IMAGE ASSETS ===
  packetImage: "/packets/vilmorin/packet-melon-stellio.png",
  cardImage: "/cards/seeds/vilmorin/melon-stellio.png",
  stages: [
    "/plants/melon-stage-1.png",
    "/plants/melon-stage-2.png",
    "/plants/melon-stage-3.png",
    "/plants/melon-stage-4.png",
    "/plants/melon-stage-5.png",
    "/plants/melon-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 70,
  gramsPerPacket: 0.2,

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
  notes: "Nouveauté 2026 — Récolte abondante, fruits sucrés et parfumés. Graines d",
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
