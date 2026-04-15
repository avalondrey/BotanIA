/**
 * Courgette Verte d'Italie - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "zucchini-verte-italie",
  plantDefId: "zucchini",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Courgette Verte d'Italie",
  emoji: "🥒",

  packetImage: "/packets/lebiau/packet-zucchini-verte-italie.png",
  cardImage: "/cards/seeds/lebiau/zucchini-verte-italie.png",
  stages: [
    "/plants/zucchini-stage-1.png",
    "/plants/zucchini-stage-2.png",
    "/plants/zucchini-stage-3.png",
    "/plants/zucchini-stage-4.png",
    "/plants/zucchini-stage-5.png",
    "/plants/zucchini-stage-6.png",
  ],

  price: 38,
  gramsPerPacket: 2.0,

  period: {
    sowing: {
      indoor: ["1 avr", "15 mai"],
      outdoor: ["15 mai", "30 juin"],
    },
    harvest: ["1 jui", "30 sept"],
    cycleDays: 92,
  },

  conditions: {
    temperature: {
      base: 12,
      optimal: 23,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage regulier, paillage recommande",

    soil: {
      ph: "6.0-7.0",
      type: "Sol frais et riche en humus",
      compost: "Compost bien decompose avant semis",
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
    firstFlowers: { days: 42, note: "Floraison abondante" },
    firstFruits: { days: 58, note: "Fruits verts clairs rayes" },
    harvest: { days: 92, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "5-7kg/plante",
    fruitsPerPlant: "18-25",
    fruitWeight: "200-350g",
    harvestPeriod: ["1 jui", "30 sept"],
    conservation: "3-5 jours au refrigerateur",
  },

  taste: "Chair fondante, saveur douce et fine, peau rayee vert clair",
  consumption: "Poële, grille, gratin, soupe froide, crue en salade",
  nutrition: {
    calories: "15 kcal/100g",
    vitaminA: "Moyenne",
    potassium: "Eleve",
  },

  notes: "Variete italienne classique, fruits cylindriques vert clair rayes de vert fonce. Tendresse et saveur appreciees.",
  companions: ["haricot", "mais", "capucine"],
  enemies: ["pomme de terre", "concombre"],

  gameData: {
    stageDurations: [7, 18, 22, 45],
    realDaysToHarvest: 92,
    optimalTemp: [18, 28],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;