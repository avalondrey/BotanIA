/**
 * Poivron Doux d'Espagne - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "pepper-doux-espagne",
  plantDefId: "pepper",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Poivron Doux d'Espagne",
  emoji: "🌶️",

  packetImage: "/packets/lebiau/packet-pepper-doux-espagne.png",
  cardImage: "/cards/seeds/lebiau/pepper-doux-espagne.png",
  stages: [
    "/plants/pepper-stage-1.png",
    "/plants/pepper-stage-2.png",
    "/plants/pepper-stage-3.png",
    "/plants/pepper-stage-4.png",
    "/plants/pepper-stage-5.png",
    "/plants/pepper-stage-6.png",
  ],

  price: 50,
  gramsPerPacket: 0.3,

  period: {
    sowing: {
      indoor: ["1 fev", "31 mars"],
      outdoor: ["15 mai", "15 jun"],
    },
    harvest: ["1 aou", "31 oct"],
    cycleDays: 122,
  },

  conditions: {
    temperature: {
      base: 18,
      optimal: 25,
      max: 38,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "35-45mm/semaine",
    irrigationNote: "Arrosage regulier, eviter les variations de taux d'humidite",

    soil: {
      ph: "6.0-7.0",
      type: "Sol riche et bien draine",
      compost: "Compost mûr et fumier decompose",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "2cm/semaine en sol",
    spacingCm: { between: 40, rows: 60 },
  },

  developmentStages: {
    germination: { days: 10, note: "Levee en 10-15 jours a 24C" },
    transplant: { days: 50, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 70, note: "Floraison blanche en ete" },
    firstFruits: { days: 90, note: "Fruits verts puis rouges" },
    harvest: { days: 122, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "2-3kg/plante",
    fruitsPerPlant: "8-12",
    fruitWeight: "120-180g",
    harvestPeriod: ["1 aou", "31 oct"],
    conservation: "1-2 semaines au refrigerateur",
  },

  taste: "Chair epaisse et douce, saveur sucree quand rouge, legerement amere vert",
  consumption: "Crud en salade, grille, farci, ratatouille, poêlé",
  nutrition: {
    calories: "31 kcal/100g",
    vitaminC: "Tres elevee (2x orange)",
    vitaminA: "Elevee (mature)",
  },

  notes: "Variete traditionnelle espagnole, gros fruits coniques rouges a maturite. Tres productive sous abri. Semences paysannes reproductibles.",
  companions: ["basilic", "carotte", "oignon"],
  enemies: ["pomme de terre", "fenouil"],

  gameData: {
    stageDurations: [10, 26, 28, 58],
    realDaysToHarvest: 122,
    optimalTemp: [20, 30],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;