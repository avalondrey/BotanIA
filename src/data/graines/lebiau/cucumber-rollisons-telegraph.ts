/**
 * Concombre Rollison's Telegraph - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "cucumber-rollisons-telegraph",
  plantDefId: "cucumber",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Concombre Rollison's Telegraph",
  emoji: "🥒",

  packetImage: "/packets/lebiau/packet-cucumber-rollisons-telegraph.png",
  cardImage: "/cards/seeds/lebiau/cucumber-rollisons-telegraph.png",
  stages: [
    "/plants/cucumber-stage-1.png",
    "/plants/cucumber-stage-2.png",
    "/plants/cucumber-stage-3.png",
    "/plants/cucumber-stage-4.png",
    "/plants/cucumber-stage-5.png",
    "/plants/cucumber-stage-6.png",
  ],

  price: 48,
  gramsPerPacket: 1.0,

  period: {
    sowing: {
      indoor: ["15 mars", "30 avr"],
      outdoor: ["15 mai", "15 jun"],
    },
    harvest: ["1 jui", "30 sept"],
    cycleDays: 95,
  },

  conditions: {
    temperature: {
      base: 16,
      optimal: 24,
      max: 36,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage genereux et regulier, chaleur constante requise",

    soil: {
      ph: "6.0-7.0",
      type: "Sol profond et tres riche",
      compost: "Fumier et compost melanges en automne",
    },

    light: {
      needs: 7,
      optimalLux: 35000,
    },

    growthRate: "4cm/semaine en sol",
    spacingCm: { between: 45, rows: 100 },
  },

  developmentStages: {
    germination: { days: 7, note: "Levee en 6-10 jours a 22C" },
    transplant: { days: 28, note: "Repiquage soigne sous serre ou apres gelées" },
    firstFlowers: { days: 42, note: "Floraison en serre ou plein champ" },
    firstFruits: { days: 58, note: "Longs fruits de 25-35cm" },
    harvest: { days: 95, note: "Recolte echelonnee" },
  },

  yield: {
    amount: "6-10kg/plante",
    fruitsPerPlant: "12-20",
    fruitWeight: "300-500g",
    harvestPeriod: ["1 jui", "30 sept"],
    conservation: "5-7 jours au refrigerateur",
  },

  taste: "Chair ferme et croquante, saveur douce et aromatique, fruit long et elegant",
  consumption: "Salade, poêlé, conserves, soupes froides, crudites",
  nutrition: {
    calories: "12 kcal/100g",
    eau: "96%",
    potassium: "Eleve",
  },

  notes: "Variete anglaise historique, longs fruits de 25-35cm, chair ferme et sans amertume. Excellente en serre comme en plein champ. Semences paysannes reproductibles.",
  companions: ["laitue", "radis", "haricot"],
  enemies: ["tomate", "pomme de terre"],

  gameData: {
    stageDurations: [7, 18, 22, 48],
    realDaysToHarvest: 95,
    optimalTemp: [20, 28],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;