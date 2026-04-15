/**
 * Tomate Kumato - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "tomato-kumato",
  plantDefId: "tomato",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Tomate Kumato",
  emoji: "🍅",

  packetImage: "/packets/lebiau/packet-tomato-kumato.png",
  cardImage: "/cards/seeds/lebiau/tomato-kumato.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  price: 65,
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
      optimal: 24,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier, stress modere ameliore le gout",

    soil: {
      ph: "6.0-7.0",
      type: "Sol riche en humus, bien draine",
      compost: "Compost et fumier decompose",
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
    firstFruits: { days: 78, note: "Fruits bruns-rouges en formation" },
    harvest: { days: 100, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "4-6kg/plante",
    fruitsPerPlant: "20-35",
    fruitWeight: "80-120g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "7-10 jours a temperature ambiante",
  },

  taste: "Saveur complexe sucree-acide, notes de fruits rouges et epicees, chair juteuse et ferme",
  consumption: "Salade, grignotage, carpaccio de tomate, tarte",
  nutrition: {
    calories: "20 kcal/100g",
    vitaminC: "Elevee",
    antioxydants: "Tres eleves (brun)",
  },

  notes: "Tomate brun-rouge unique, saveur exceptionnelle riche et complexe. Developpee originellement en Espagne, elle mûrit du vert au brun-rouge. Semences paysannes reproductibles.",
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