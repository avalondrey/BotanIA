/**
 * Tomate Saint Pierre - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "tomato-saint-pierre",
  plantDefId: "tomato",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Tomate Saint Pierre",
  emoji: "🍅",

  packetImage: "/packets/lebiau/packet-tomato-saint-pierre.png",
  cardImage: "/cards/seeds/lebiau/tomato-saint-pierre.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  price: 55,
  gramsPerPacket: 0.3,

  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 102,
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
    spacingCm: { between: 50, rows: 80 },
  },

  developmentStages: {
    germination: { days: 8, note: "Levee en 6-10 jours a 20C" },
    transplant: { days: 50, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 65, note: "Floraison debut juillet" },
    firstFruits: { days: 80, note: "Fruits ronds en formation" },
    harvest: { days: 102, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "4-6kg/plante",
    fruitsPerPlant: "25-40",
    fruitWeight: "150-250g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "5-7 jours a temperature ambiante",
  },

  taste: "Chair ferme et parfumee, equilibre sucree-acide, tomate ronde classique",
  consumption: "Salade, sauce, soupe, grillee, farcie, conserves",
  nutrition: {
    calories: "18 kcal/100g",
    vitaminC: "Moyenne",
    lycopene: "Eleve",
  },

  notes: "Variete francaise traditionnelle, la reference du jardinier. Fruit rond, rouge, ferme et gouteux. Tres polyvalente en cuisine. Semences paysannes reproductibles.",
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fenouil"],

  gameData: {
    stageDurations: [8, 22, 22, 50],
    realDaysToHarvest: 102,
    optimalTemp: [18, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;