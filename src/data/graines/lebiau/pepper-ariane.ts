/**
 * Poivron Ariane - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "pepper-ariane",
  plantDefId: "pepper",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Poivron Ariane",
  emoji: "🌶️",

  packetImage: "/packets/lebiau/packet-pepper-ariane.png",
  cardImage: "/cards/seeds/lebiau/pepper-ariane.png",
  stages: [
    "/plants/pepper-stage-1.png",
    "/plants/pepper-stage-2.png",
    "/plants/pepper-stage-3.png",
    "/plants/pepper-stage-4.png",
    "/plants/pepper-stage-5.png",
    "/plants/pepper-stage-6.png",
  ],

  price: 55,
  gramsPerPacket: 0.2,

  period: {
    sowing: {
      indoor: ["1 fev", "31 mars"],
      outdoor: ["15 mai", "15 jun"],
    },
    harvest: ["1 aou", "31 oct"],
    cycleDays: 119,
  },

  conditions: {
    temperature: {
      base: 18,
      optimal: 24,
      max: 36,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "35-45mm/semaine",
    irrigationNote: "Arrosage regulier, eviter le stress hydrique",

    soil: {
      ph: "6.0-7.0",
      type: "Sol riche et bien draine",
      compost: "Compost et fumier decompose",
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
    transplant: { days: 48, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 68, note: "Floraison en ete" },
    firstFruits: { days: 85, note: "Fruits oranges vifs" },
    harvest: { days: 119, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "2-4kg/plante",
    fruitsPerPlant: "10-15",
    fruitWeight: "100-150g",
    harvestPeriod: ["1 aou", "31 oct"],
    conservation: "1-2 semaines au refrigerateur",
  },

  taste: "Chair epaisse et croquante, saveur douce et sucree, fruit orange vif",
  consumption: "Crud, grille, farci, ratatouille, congelé en lanières",
  nutrition: {
    calories: "31 kcal/100g",
    vitaminC: "Tres elevee",
    betaCarotene: "Eleve (orange)",
  },

  notes: "Variete orange vif, tres productive et precoce. Fruits coniques de taille moyenne. Resistance au virus de la mosaicque du tabac.",
  companions: ["basilic", "carotte", "oignon"],
  enemies: ["pomme de terre", "fenouil"],

  gameData: {
    stageDurations: [10, 25, 28, 56],
    realDaysToHarvest: 119,
    optimalTemp: [20, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;