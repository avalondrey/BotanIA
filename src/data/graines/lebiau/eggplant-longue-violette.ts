/**
 * Aubergine Longue Violette - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "eggplant-longue-violette",
  plantDefId: "eggplant",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Aubergine Longue Violette",
  emoji: "🍆",

  packetImage: "/packets/lebiau/packet-eggplant-longue-violette.png",
  cardImage: "/cards/seeds/lebiau/eggplant-longue-violette.png",
  stages: [
    "/plants/eggplant-stage-1.png",
    "/plants/eggplant-stage-2.png",
    "/plants/eggplant-stage-3.png",
    "/plants/eggplant-stage-4.png",
    "/plants/eggplant-stage-5.png",
    "/plants/eggplant-stage-6.png",
  ],

  price: 48,
  gramsPerPacket: 0.2,

  period: {
    sowing: {
      indoor: ["1 fev", "31 mars"],
      outdoor: ["15 mai", "15 jun"],
    },
    harvest: ["15 jui", "30 sept"],
    cycleDays: 102,
  },

  conditions: {
    temperature: {
      base: 18,
      optimal: 25,
      max: 38,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier et genereux, paillage indispensable",

    soil: {
      ph: "6.0-7.0",
      type: "Sol profond, riche et bien draine",
      compost: "Compost genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 45000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 50, rows: 70 },
  },

  developmentStages: {
    germination: { days: 8, note: "Levee en 8-14 jours a 24C, chaleur obligatoire" },
    transplant: { days: 45, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 60, note: "Floraison violette en juillet" },
    firstFruits: { days: 75, note: "Fruits allonges en formation" },
    harvest: { days: 102, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "8-12",
    fruitWeight: "150-250g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "5-7 jours au refrigerateur",
  },

  taste: "Chair tendre et fondante, saveur douce et legerement amere",
  consumption: "Grille, ratatouille, moussaka, caviar d'aubergine, poêlée",
  nutrition: {
    calories: "25 kcal/100g",
    fibre: "Elevee",
    potassium: "Eleve",
  },

  notes: "Variete paysanne bio, fruits allonges violet fonce. Excellente adaptation au climat tempere sous abri. Semences reproductibles.",
  companions: ["haricot", "basilic", "marigold"],
  enemies: ["pomme de terre", "tomate"],

  gameData: {
    stageDurations: [8, 20, 24, 50],
    realDaysToHarvest: 102,
    optimalTemp: [20, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;