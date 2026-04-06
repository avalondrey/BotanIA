/**
 * Tomato Brandywine - Kokopelli
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-brandywine",
  plantDefId: "tomato",
  shopId: "kokopelli",
  category: "vegetable" as const,
  name: "Brandywine",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/kokopelli/packet-tomato-brandywine.png",
  cardImage: "/cards/seeds/kokopelli/tomato-brandywine.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 48,
  gramsPerPacket: 0.25,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["1 mars", "15 avr"],
      outdoor: ["15 mai", "30 mai"],
    },
    harvest: ["15 aout", "15 sept"],
    cycleDays: 115,
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
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier et constant, eviter le stress hydrique",

    soil: {
      ph: "6.0-7.0",
      type: "Riche en matiere organique, bien draine",
      compost: "Apport genereux avant plantation",
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
    germination: { days: 10, note: "Levee en 7-14 jours a 20-25C" },
    transplant: { days: 65, note: "Repiquage quand 8-10 feuilles" },
    firstFlowers: { days: 80, note: "Floraison mi-juillet" },
    firstFruits: { days: 95, note: "Fruits en formation" },
    harvest: { days: 115, note: "Maturite tardive" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "20-40",
    fruitWeight: "200-400g",
    harvestPeriod: ["15 aout", "15 sept"],
    conservation: "7-10 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair dense et riche, saveur sucree avec notes de tomate ancienne",
  consumption: "Frais en salade, sauce, sandwich",
  nutrition: {
    calories: "18 kcal/100g",
    vitaminC: "Elevee",
    lycopene: "Tres eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete americaine heirloom tres appreciee, chair rose-rouge et tres parfumee. Croissance lente.",
  companions: ["basilic", "carotte", "persil"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [10, 28, 27, 50],
    realDaysToHarvest: 115,
    optimalTemp: [18, 30],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
