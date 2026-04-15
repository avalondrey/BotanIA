/**
 * Tomate Raisin Vert - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "tomato-raisin-vert",
  plantDefId: "tomato",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Tomate Raisin Vert",
  emoji: "🍅",

  packetImage: "/packets/lebiau/packet-tomato-raisin-vert.png",
  cardImage: "/cards/seeds/lebiau/tomato-raisin-vert.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  price: 55,
  gramsPerPacket: 0.2,

  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 93,
  },

  conditions: {
    temperature: {
      base: 12,
      optimal: 22,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "35-45mm/semaine",
    irrigationNote: "Arrosage regulier au pied, eviter les feuilles",

    soil: {
      ph: "6.0-7.0",
      type: "Sol riche en humus, bien draine",
      compost: "Compost genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "3cm/semaine en sol",
    spacingCm: { between: 50, rows: 70 },
  },

  developmentStages: {
    germination: { days: 7, note: "Levee en 5-10 jours a 20C" },
    transplant: { days: 45, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 55, note: "Floraison en grappes" },
    firstFruits: { days: 70, note: "Fruits verts restant verts a maturite" },
    harvest: { days: 93, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "40-60",
    fruitWeight: "30-50g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "3-5 jours a temperature ambiante",
  },

  taste: "Saveur sucree et acidulee, texture ferme, petit fruit en grappe verte",
  consumption: "Salade, grignotage, apéritif, confiture verte, sauce verte",
  nutrition: {
    calories: "18 kcal/100g",
    vitaminC: "Moyenne",
    chlorophylle: "Elevee (verte)",
  },

  notes: "Tomate grappe verte a maturite, saveur unique acidulee et sucree. Reste verte meme ripe. Tres productive en grappes. Semences paysannes reproductibles.",
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fenouil"],

  gameData: {
    stageDurations: [7, 20, 20, 46],
    realDaysToHarvest: 93,
    optimalTemp: [18, 28],
    waterNeed: 4.5,
    lightNeed: 8,
  },
};

export default CARD_DATA;