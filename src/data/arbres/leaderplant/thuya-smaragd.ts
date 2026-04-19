/**
 * Thuya Smaragd — Leaderplant
 * Thuja occidentalis Smaragd
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "thuya-smaragd",
  plantDefId: "thuya",
  shopId: "leaderplant",
  category: "hedge" as const,
  name: "Thuya Smaragd",
  emoji: "🌲",
  packetImage: "/packets/leaderplant/packet-thuya-smaragd.png",
  cardImage: "/cards/seeds/leaderplant/thuya-smaragd.png",
  stages: [
    "/plants/thuya-stage-1.png",
    "/plants/thuya-stage-2.png",
    "/plants/thuya-stage-3.png",
    "/plants/thuya-stage-4.png",
    "/plants/thuya-stage-5.png",
  ],

  // === PRIX & QUANTITE ===
  price: 85,
  gramsPerPacket: 0,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["03", "04", "05"],
    },
    harvest: null,
    planting: ["10", "11", "02", "03"],
    dormancy: ["12", "01"],
    cycleDays: 0,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: [10, 25],
      max: 35,
      frostResistance: -25,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage régulier la première année, puis autonome",
    soil: {
      ph: "6.0-7.5",
      type: "Tous types, préfère frais et bien drainé",
      compost: "Léger apport à la plantation",
    },
    light: {
      needs: 6,
      optimalLux: 35000,
    },
    growthRate: "Croissance lente à modérée (15-30cm/an)",
    spacingCm: { between: 60, rows: 80 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 21, note: "Levée lente et irréguliée" },
    growth: { days: 90, note: "Croissance initiale lente" },
    maturation: { days: 180, note: "Établissement" },
    harvest: { days: 0, note: "Culture ornementale, pas de récolte" },
  },

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [21, 90, 180, 365],
    realDaysToHarvest: 0,
    optimalTemp: [10, 25],
    waterNeed: 3.5,
    lightNeed: 6,
  },

  // === NOTES DE CULTURE ===
  notes: "Thuja occidentalis Smaragd - Conifère persistant, port columnaire étroit, idéal haie. Rustique jusqu'à -25°C.",
  companions: [],
  enemies: [],
};

export default CARD_DATA;