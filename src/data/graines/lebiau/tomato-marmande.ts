/**
 * Tomato Marmande - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-marmande",
  plantDefId: "tomato",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Tomate Marmande",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-tomato-marmande.png",
  cardImage: "/cards/seeds/lebiau/tomato-marmande.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 38,
  gramsPerPacket: 0.4,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 95,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 24,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier au pied, eviter les feuilles",

    soil: {
      ph: "6.0-7.0",
      type: "Riche en humus, bien draine",
      compost: "Apport genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "3cm/semaine en sol",
    spacingCm: { between: 60, rows: 80 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 8, note: "Levee en 5-10 jours a 20C" },
    transplant: { days: 50, note: "Repiquage quand 6-8 feuilles" },
    firstFlowers: { days: 65, note: "Floraison debut juillet" },
    firstFruits: { days: 80, note: "Fruits en formation" },
    harvest: { days: 95, note: "Recolte echelonnee" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "4-6kg/plante",
    fruitsPerPlant: "30-50",
    fruitWeight: "150-250g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "5-7 jours a temperature ambiante",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme et juteuse, saveur sucree et parfume",
  consumption: "Frais en salade, ratatouille, sauce, pizza",
  nutrition: {
    calories: "17 kcal/100g",
    vitaminC: "Moyenne",
    lycopene: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete française traditionnelle tres appreciee. Chair dense et gouteuse. Productive.",
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 20, 20, 47],
    realDaysToHarvest: 95,
    optimalTemp: [18, 28],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
