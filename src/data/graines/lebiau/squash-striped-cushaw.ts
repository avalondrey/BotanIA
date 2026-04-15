/**
 * Gourge Striped Cushaw - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "squash-striped-cushaw",
  plantDefId: "squash",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Gourge Striped Cushaw",
  emoji: "🎃",

  packetImage: "/packets/lebiau/packet-squash-striped-cushaw.png",
  cardImage: "/cards/seeds/lebiau/squash-striped-cushaw.png",
  stages: [
    "/plants/squash-stage-1.png",
    "/plants/squash-stage-2.png",
    "/plants/squash-stage-3.png",
    "/plants/squash-stage-4.png",
    "/plants/squash-stage-5.png",
    "/plants/squash-stage-6.png",
  ],

  price: 55,
  gramsPerPacket: 3.0,

  period: {
    sowing: {
      indoor: ["15 avr", "15 mai"],
      outdoor: ["15 mai", "15 jun"],
    },
    harvest: ["1 sep", "15 nov"],
    cycleDays: 125,
  },

  conditions: {
    temperature: {
      base: 15,
      optimal: 24,
      max: 38,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "35-50mm/semaine",
    irrigationNote: "Arrosage genereux en periode de croissance",

    soil: {
      ph: "6.0-7.0",
      type: "Sol profond et riche en humus",
      compost: "Fumier decompose en automne",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "5cm/semaine en sol",
    spacingCm: { between: 150, rows: 200 },
  },

  developmentStages: {
    germination: { days: 8, note: "Levee en 7-12 jours a 22C" },
    transplant: { days: 30, note: "Repiquage soigne, racines fragiles" },
    firstFlowers: { days: 50, note: "Floraison monoïque" },
    firstFruits: { days: 72, note: "Fruits enflant progressivement" },
    harvest: { days: 125, note: "Recolte avant les premieres gelees" },
  },

  yield: {
    amount: "3-5 fruits/plante",
    fruitsPerPlant: "3-5",
    fruitWeight: "3-5kg",
    harvestPeriod: ["1 sep", "15 nov"],
    conservation: "3-6 mois en lieu sec et frais",
  },

  taste: "Chair orange sucree et filamenteuse, saveur de chataigne",
  consumption: "Soupe, gratin, purée, tarte, confiture",
  nutrition: {
    calories: "20 kcal/100g",
    vitaminA: "Tres elevee (beta-carotene)",
    vitaminC: "Moyenne",
  },

  notes: "Variete ancienne du sud des Etats-Unis, fruit en col de cygne raye de vert. Chair douce et onctueuse. Excellente conservation.",
  companions: ["mais", "haricot", "capucine"],
  enemies: ["pomme de terre"],

  gameData: {
    stageDurations: [8, 22, 30, 65],
    realDaysToHarvest: 125,
    optimalTemp: [18, 30],
    waterNeed: 5.5,
    lightNeed: 8,
  },
};

export default CARD_DATA;