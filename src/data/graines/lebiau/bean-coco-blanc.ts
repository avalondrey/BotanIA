/**
 * Bean Coco Blanc - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "bean-coco-blanc",
  plantDefId: "bean",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Haricot Coco Blanc",
  emoji: "🫘",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-bean-coco-blanc.png",
  cardImage: "/cards/seeds/lebiau/bean-coco-blanc.png",
  stages: [
    "/plants/bean-stage-1.png",
    "/plants/bean-stage-2.png",
    "/plants/bean-stage-3.png",
    "/plants/bean-stage-4.png",
    "/plants/bean-stage-5.png",
    "/plants/bean-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 30,
  gramsPerPacket: 200,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["15 mai", "15 aout"],
    },
    harvest: ["15 aout", "15 oct"],
    cycleDays: 100,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 22,
      max: 30,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage moderer, eviter exces d'eau",

    soil: {
      ph: "6.0-7.0",
      type: "Bien draine, pas trop riche en azote",
      compost: "Apport leger avant semis",
    },

    light: {
      needs: 7,
      optimalLux: 35000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 10, rows: 50 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 10, note: "Levee en 8-12 jours a 15-20C" },
    firstLeaves: { days: 25, note: "Premieres feuilles trifoliees" },
    flowering: { days: 55, note: "Floraison blanche" },
    podFormation: { days: 70, note: "Gousses en formation" },
    harvest: { days: 100, note: "Maturite quand gousses seches et claires" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "500-800g/m2",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 aout", "15 oct"],
    conservation: "Plusieurs annees en lieu sec",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair fine et delicate, saveur subtile",
  consumption: "Salade, semoule, pot-au-feu, puree",
  nutrition: {
    calories: "120 kcal/100g sec",
    proteins: "Eleve (20g/100g)",
    fibers: "Eleve",
    iron: "Moyen",
  },

  // === NOTES DE CULTURE ===
  notes: "Haricot a écosser sec, tres productif. Necessite chaleur pour maturir completement.",
  companions: ["mais", "concombre", "celeri"],
  enemies: ["oignon", "ail", "fenouil"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [10, 18, 30, 42],
    realDaysToHarvest: 100,
    optimalTemp: [15, 28],
    waterNeed: 3.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
