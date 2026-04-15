/**
 * Tomate Cerisette Brin de Muguet - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "tomato-cerisette-brin-muguet",
  plantDefId: "tomato",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Tomate Cerisette Brin de Muguet",
  emoji: "🍅",

  packetImage: "/packets/lebiau/packet-tomato-cerisette-brin-muguet.png",
  cardImage: "/cards/seeds/lebiau/tomato-cerisette-brin-muguet.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  price: 50,
  gramsPerPacket: 0.15,

  period: {
    sowing: {
      indoor: ["1 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "15 oct"],
    cycleDays: 87,
  },

  conditions: {
    temperature: {
      base: 12,
      optimal: 22,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "low" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage modere, eviter l'exces qui fend les fruits",

    soil: {
      ph: "6.0-7.0",
      type: "Sol leger et bien draine",
      compost: "Compost leger, eviter l'exces d'azote",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "3cm/semaine en sol",
    spacingCm: { between: 40, rows: 60 },
  },

  developmentStages: {
    germination: { days: 7, note: "Levee en 5-8 jours a 20C" },
    transplant: { days: 40, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 50, note: "Longues grappes en muguet" },
    firstFruits: { days: 65, note: "Minis fruits rouges en grappes" },
    harvest: { days: 87, note: "Recolte echelonnee abondante" },
  },

  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "100-200",
    fruitWeight: "8-15g",
    harvestPeriod: ["15 jui", "15 oct"],
    conservation: "2-3 jours a temperature ambiante",
  },

  taste: "Saveur intense et sucree, explosion de gout en bouche, petit fruit rouge vif",
  consumption: "Grignotage, apéritif, salade, brochette, confiture",
  nutrition: {
    calories: "18 kcal/100g",
    vitaminC: "Elevee",
    lycopene: "Tres eleve (petit fruit concentre)",
  },

  notes: "Variete cerisette en longues grappes decoratives comme du muguet. Fruits minis d'une douceur exceptionnelle. Tres productive et precose. Semences paysannes reproductibles.",
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fenouil"],

  gameData: {
    stageDurations: [7, 18, 18, 44],
    realDaysToHarvest: 87,
    optimalTemp: [16, 28],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;