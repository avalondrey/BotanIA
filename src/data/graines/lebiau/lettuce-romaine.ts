/**
 * Lettuce Romaine - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "lettuce-romaine",
  plantDefId: "lettuce",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Laitue Romaine",
  emoji: "🥬",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-lettuce-romaine.png",
  cardImage: "/cards/seeds/lebiau/lettuce-romaine.png",
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
      indoor: ["15 fev", "15 aout"],
      outdoor: ["15 mars", "15 aout"],
    },
    harvest: ["15 avr", "15 oct"],
    cycleDays: 65,
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
    rainRequired: "30-40mm/semaine",
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
    spacingCm: { between: 30, rows: 40 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 6, note: "Levee rapide 4-8 jours a 15-20C" },
    firstLeaves: { days: 22, note: "Rosette de feuilles" },
    growth: { days: 40, note: "Pousse vegetative" },
    harvest: { days: 65, note: "Quand pomme est compacte et haute" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "400-600g/plante",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 avr", "15 oct"],
    conservation: "5-7 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Feuilles croquantes et Nantes, saveur douce et legere",
  consumption: "Frais en salade Cesar, burger, wrap",
  nutrition: {
    calories: "11 kcal/100g",
    vitaminC: "Moyenne",
    vitaminK: "Tres eleve",
    folate: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete a pomme elongate et feuilles croquantes. Excellente pour salade Cesar.",
  companions: ["carotte", "radis", "fraise"],
  enemies: ["celeri", "persil"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [6, 12, 18, 29],
    realDaysToHarvest: 65,
    optimalTemp: [10, 20],
    waterNeed: 3.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
