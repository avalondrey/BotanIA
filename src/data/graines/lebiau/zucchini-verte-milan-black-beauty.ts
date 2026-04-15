/**
 * Courgette Verte de Milan Black Beauty - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "zucchini-verte-milan-black-beauty",
  plantDefId: "zucchini",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Courgette Verte de Milan Black Beauty",
  emoji: "🥒",

  packetImage: "/packets/lebiau/packet-zucchini-verte-milan-black-beauty.png",
  cardImage: "/cards/seeds/lebiau/zucchini-verte-milan-black-beauty.png",
  stages: [
    "/plants/zucchini-stage-1.png",
    "/plants/zucchini-stage-2.png",
    "/plants/zucchini-stage-3.png",
    "/plants/zucchini-stage-4.png",
    "/plants/zucchini-stage-5.png",
    "/plants/zucchini-stage-6.png",
  ],

  price: 40,
  gramsPerPacket: 2.0,

  period: {
    sowing: {
      indoor: ["1 avr", "15 mai"],
      outdoor: ["15 mai", "30 juin"],
    },
    harvest: ["15 jui", "30 sept"],
    cycleDays: 87,
  },

  conditions: {
    temperature: {
      base: 12,
      optimal: 22,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage au pied, eviter les feuilles pour prevenir l'oïdium",

    soil: {
      ph: "6.0-7.0",
      type: "Sol riche et bien draine",
      compost: "Fumier decompose en automne",
    },

    light: {
      needs: 7,
      optimalLux: 35000,
    },

    growthRate: "4cm/semaine en sol",
    spacingCm: { between: 60, rows: 100 },
  },

  developmentStages: {
    germination: { days: 7, note: "Levee en 5-10 jours a 20C" },
    transplant: { days: 25, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 40, note: "Floraison males puis femelles" },
    firstFruits: { days: 55, note: "Premiers fruits a 15-20cm" },
    harvest: { days: 87, note: "Recolte echelonnee tout l'ete" },
  },

  yield: {
    amount: "6-8kg/plante",
    fruitsPerPlant: "20-30",
    fruitWeight: "200-300g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "3-5 jours au refrigerateur",
  },

  taste: "Chair tendre et saveur delicate, peau fine vert sombre",
  consumption: "Poële, grille, ratatouille, gratin, crue rapée",
  nutrition: {
    calories: "17 kcal/100g",
    vitaminA: "Moyenne",
    potassium: "Eleve",
  },

  notes: "Variete classique italienne, fruits verts sombres allonges. Tres productive et fiable. Port buissonnant compact.",
  companions: ["haricot", "mais", "capucine"],
  enemies: ["pomme de terre", "concombre"],

  gameData: {
    stageDurations: [7, 16, 20, 44],
    realDaysToHarvest: 87,
    optimalTemp: [18, 28],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;