/**
 * Tomato Rose de Berne - Kokopelli
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-rose-de-berne",
  plantDefId: "tomato",
  shopId: "kokopelli",
  category: "vegetable" as const,
  name: "Rose de Berne",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/kokopelli/packet-tomato-rose-de-berne.png",
  cardImage: "/cards/seeds/kokopelli/tomato-rose-de-berne.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 42,
  gramsPerPacket: 0.25,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 100,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 24,
      max: 32,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier et constant, eviter les variations",

    soil: {
      ph: "6.0-7.0",
      type: "Riche, frais, bien draine",
      compost: "Apport genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 50, rows: 70 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 8, note: "Levee rapide en 5-10 jours" },
    transplant: { days: 55, note: "Repiquage quand 6-8 feuilles" },
    firstFlowers: { days: 70, note: "Floraison debut juillet" },
    firstFruits: { days: 80, note: "Fruits visibles" },
    harvest: { days: 100, note: "Recolte echelonnee" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "4-6kg/plante",
    fruitsPerPlant: "30-50",
    fruitWeight: "120-200g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "5-7 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme, saveur equilibree, sucree et parfume",
  consumption: "Frais en salade, ratatouille, sauce",
  nutrition: {
    calories: "17 kcal/100g",
    vitaminC: "Moyenne",
    lycopene: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete suisse tres appreciee, chair rose tres parfumee. Productive et resistante.",
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 22, 20, 50],
    realDaysToHarvest: 100,
    optimalTemp: [18, 28],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
