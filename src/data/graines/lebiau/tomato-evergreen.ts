/**
 * Tomate Evergreen - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "tomato-evergreen",
  plantDefId: "tomato",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Tomate Evergreen",
  emoji: "🍅",

  packetImage: "/packets/lebiau/packet-tomato-evergreen.png",
  cardImage: "/cards/seeds/lebiau/tomato-evergreen.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  price: 60,
  gramsPerPacket: 0.2,

  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 100,
  },

  conditions: {
    temperature: {
      base: 12,
      optimal: 23,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier, leger stress ameliore la saveur",

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
    spacingCm: { between: 50, rows: 80 },
  },

  developmentStages: {
    germination: { days: 8, note: "Levee en 6-10 jours a 20C" },
    transplant: { days: 48, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 62, note: "Floraison debut juillet" },
    firstFruits: { days: 78, note: "Fruits restant verts a maturite" },
    harvest: { days: 100, note: "Recolte quand le fruit legerement jaunit" },
  },

  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "20-35",
    fruitWeight: "100-200g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "5-7 jours a temperature ambiante",
  },

  taste: "Saveur sucree et acidulee, notes d'agrumes, chair tendre et juteuse. Reste verte a maturite.",
  consumption: "Salade, salsa verte, confiture, grillee, frite",
  nutrition: {
    calories: "18 kcal/100g",
    vitaminC: "Elevee",
    chlorophylle: "Elevee (verte)",
  },

  notes: "Tomate verte a maturite, saveur unique et rafraichissante. Chair tendre et juteuse avec notes d'agrumes. Maturite indiquee par un leger jaunissement. Semences paysannes reproductibles.",
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fenouil"],

  gameData: {
    stageDurations: [8, 22, 22, 48],
    realDaysToHarvest: 100,
    optimalTemp: [18, 28],
    waterNeed: 4.5,
    lightNeed: 8,
  },
};

export default CARD_DATA;