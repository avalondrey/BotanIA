/**
 * Tomato Noire de Crimee - Kokopelli
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-noire-de-crimee",
  plantDefId: "tomato",
  shopId: "kokopelli",
  category: "vegetable" as const,
  name: "Noire de Crimee",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/kokopelli/packet-tomato-noire-de-crimee.png",
  cardImage: "/cards/seeds/kokopelli/tomato-noire-de-crimee.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 45,
  gramsPerPacket: 0.3,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["1 mars", "15 avr"],
      outdoor: ["15 mai", "30 mai"],
    },
    harvest: ["1 aout", "15 sept"],
    cycleDays: 105,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 25,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-60mm/semaine",
    irrigationNote: "Arrosage regulier sans exces, tolere la chaleur",

    soil: {
      ph: "6.0-7.0",
      type: "Bien draine, riche, pas trop nitrogen",
      compost: "Apport equilibre avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 45000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 60, rows: 80 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 10, note: "Levee en 7-12 jours a 20-25C" },
    transplant: { days: 60, note: "Repiquage quand 8-10 feuilles" },
    firstFlowers: { days: 72, note: "Floraison mi-juillet" },
    firstFruits: { days: 88, note: "Fruits en formation" },
    harvest: { days: 105, note: "Maturite complete" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "4-6kg/plante",
    fruitsPerPlant: "25-40",
    fruitWeight: "150-350g",
    harvestPeriod: ["1 aout", "15 sept"],
    conservation: "7-10 jours au frais et sec",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair dense, saveur sucree avec notes fumees, tres parfume",
  consumption: "Frais en salade, sauce, coulis, pizza",
  nutrition: {
    calories: "20 kcal/100g",
    vitaminC: "Elevee",
    lycopene: "Tres eleve",
    anthocyanes: "Eleves (pigment sombre)",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete ukrainienne ancestrale, chair sombre et goma. Excellent gout sucre/sale. Vigoureuse.",
  companions: ["basilic", "carotte", "persil"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [10, 25, 22, 48],
    realDaysToHarvest: 105,
    optimalTemp: [18, 30],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
