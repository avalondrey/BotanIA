/**
 * Poivron Chocolat - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "pepper-chocolat",
  plantDefId: "pepper",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Poivron Chocolat",
  emoji: "🌶️",

  packetImage: "/packets/lebiau/packet-pepper-chocolat.png",
  cardImage: "/cards/seeds/lebiau/pepper-chocolat.png",
  stages: [
    "/plants/pepper-stage-1.png",
    "/plants/pepper-stage-2.png",
    "/plants/pepper-stage-3.png",
    "/plants/pepper-stage-4.png",
    "/plants/pepper-stage-5.png",
    "/plants/pepper-stage-6.png",
  ],

  price: 60,
  gramsPerPacket: 0.2,

  period: {
    sowing: {
      indoor: ["1 fev", "31 mars"],
      outdoor: ["15 mai", "15 jun"],
    },
    harvest: ["1 aou", "31 oct"],
    cycleDays: 124,
  },

  conditions: {
    temperature: {
      base: 18,
      optimal: 26,
      max: 38,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier et genereux, chaleur essentielle",

    soil: {
      ph: "6.0-7.0",
      type: "Sol riche, profond et bien draine",
      compost: "Compost genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 45000,
    },

    growthRate: "2cm/semaine en sol",
    spacingCm: { between: 45, rows: 60 },
  },

  developmentStages: {
    germination: { days: 10, note: "Levee en 10-18 jours a 24C" },
    transplant: { days: 50, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 72, note: "Floraison en ete" },
    firstFruits: { days: 92, note: "Fruits bruns chocolat" },
    harvest: { days: 124, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "2-3kg/plante",
    fruitsPerPlant: "8-12",
    fruitWeight: "130-200g",
    harvestPeriod: ["1 aou", "31 oct"],
    conservation: "1-2 semaines au refrigerateur",
  },

  taste: "Chair epaisse et sucree, saveur riche et complexe, couleur chocolat brun",
  consumption: "Crud en salade, grille, farci, confiture douce, poêlé",
  nutrition: {
    calories: "31 kcal/100g",
    vitaminC: "Tres elevee",
    antioxydants: "Tres eleves (brun)",
  },

  notes: "Variete rare au coloris brun chocolat unique. Saveur exceptionnelle, douce et sucree. Tres appreciee en gastronomie. Semences paysannes reproductibles.",
  companions: ["basilic", "carotte", "oignon"],
  enemies: ["pomme de terre", "fenouil"],

  gameData: {
    stageDurations: [10, 26, 28, 60],
    realDaysToHarvest: 124,
    optimalTemp: [20, 30],
    waterNeed: 5.5,
    lightNeed: 8,
  },
};

export default CARD_DATA;