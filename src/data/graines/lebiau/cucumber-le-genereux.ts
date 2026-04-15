/**
 * Concombre Le Généreux - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  id: "cucumber-le-genereux",
  plantDefId: "cucumber",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Concombre Le Généreux",
  emoji: "🥒",

  packetImage: "/packets/lebiau/packet-cucumber-le-genereux.png",
  cardImage: "/cards/seeds/lebiau/cucumber-le-genereux.png",
  stages: [
    "/plants/cucumber-stage-1.png",
    "/plants/cucumber-stage-2.png",
    "/plants/cucumber-stage-3.png",
    "/plants/cucumber-stage-4.png",
    "/plants/cucumber-stage-5.png",
    "/plants/cucumber-stage-6.png",
  ],

  price: 42,
  gramsPerPacket: 1.5,

  period: {
    sowing: {
      indoor: ["15 mars", "30 avr"],
      outdoor: ["15 mai", "15 jun"],
    },
    harvest: ["15 jui", "30 sept"],
    cycleDays: 87,
  },

  conditions: {
    temperature: {
      base: 15,
      optimal: 22,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "35-45mm/semaine",
    irrigationNote: "Arrosage regulier au pied, paillage indispensable",

    soil: {
      ph: "6.0-7.0",
      type: "Sol frais et riche en humus",
      compost: "Compost genereux avant plantation",
    },

    light: {
      needs: 7,
      optimalLux: 35000,
    },

    growthRate: "4cm/semaine en sol",
    spacingCm: { between: 40, rows: 80 },
  },

  developmentStages: {
    germination: { days: 7, note: "Levee en 5-8 jours a 20C" },
    transplant: { days: 25, note: "Repiquage apres les Saints de Glace" },
    firstFlowers: { days: 38, note: "Floraison jaune monoïque" },
    firstFruits: { days: 52, note: "Fruits de 20-25cm" },
    harvest: { days: 87, note: "Recolte echelonnee abondante" },
  },

  yield: {
    amount: "5-8kg/plante",
    fruitsPerPlant: "15-25",
    fruitWeight: "200-350g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "5-7 jours au refrigerateur",
  },

  taste: "Chair croquante et juteuse, sans amertume, saveur douce et rafraîchissante",
  consumption: "Crud en salade, tzatziki, gaspacho, conserve au vinaigre",
  nutrition: {
    calories: "12 kcal/100g",
    eau: "96%",
    potassium: "Eleve",
  },

  notes: "Variete paysanne bio tres productive, fruits lisses et de bonne taille. Nomme pour sa generosite au jardin. Sans amertume. Semences reproductibles.",
  companions: ["laitue", "radis", "haricot"],
  enemies: ["tomate", "pomme de terre"],

  gameData: {
    stageDurations: [7, 16, 20, 44],
    realDaysToHarvest: 87,
    optimalTemp: [18, 28],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;