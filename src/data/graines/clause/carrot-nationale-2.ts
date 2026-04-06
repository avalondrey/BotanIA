/**
 * Carrot Nationale 2 - Clause
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "carrot-nationale-2",
  plantDefId: "carrot",
  shopId: "clause",
  category: "vegetable" as const,
  name: "Carotte Nationale 2",
  emoji: "🥕",

  // === IMAGE ASSETS ===
  packetImage: "/packets/clause/packet-carrot-nationale-2.png",
  cardImage: "/cards/seeds/clause/carrot-nationale-2.png",
  stages: [
    "/plants/carrot-stage-1.png",
    "/plants/carrot-stage-2.png",
    "/plants/carrot-stage-3.png",
    "/plants/carrot-stage-4.png",
    "/plants/carrot-stage-5.png",
    "/plants/carrot-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 25,
  gramsPerPacket: 3,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["15 fev", "15 aout"],
    },
    harvest: ["15 mai", "15 nov"],
    cycleDays: 85,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 7,
      optimal: 18,
      max: 28,
      frostResistance: -5,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage regulier, sol toujours frais mais pas sature",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, sableux, profond, sans pierres",
      compost: "Pas de fumier frais",
    },

    light: {
      needs: 7,
      optimalLux: 30000,
    },

    growthRate: "1-2cm/semaine en sol",
    spacingCm: { between: 5, rows: 25 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 18, note: "Levee en 15-20 jours" },
    firstLeaves: { days: 38, note: "Feuilles en rosette" },
    rootGrowth: { days: 58, note: "Racine en formation" },
    harvest: { days: 85, note: "Racine mature et coloree" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "300-500g/m2",
    fruitsPerPlant: null,
    fruitWeight: "100-180g",
    harvestPeriod: ["15 mai", "15 nov"],
    conservation: "4-6 mois en cave seche",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair sucree et parfume, texture tendre",
  consumption: "Frais en salade, soupe, vapeur, gateau",
  nutrition: {
    calories: "25 kcal/100g",
    vitaminA: "Tres eleve (beta-carotene)",
    vitaminC: "Moyenne",
    fibers: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete professionnelle tres culturee, racine cylindrique et lisse. Excellente conservation.",
  companions: ["pois", "laitue", "oignon"],
  enemies: ["aneth", "persil", "betterave"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [18, 22, 22, 23],
    realDaysToHarvest: 85,
    optimalTemp: [10, 25],
    waterNeed: 3.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
