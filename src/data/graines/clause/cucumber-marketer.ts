/**
 * Cucumber Marketer - Clause
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "cucumber-marketer",
  plantDefId: "cucumber",
  shopId: "clause",
  category: "vegetable" as const,
  name: "Concombre Marketer",
  emoji: "🥒",

  // === IMAGE ASSETS ===
  packetImage: "/packets/clause/packet-cucumber-marketer.png",
  cardImage: "/cards/seeds/clause/cucumber-marketer.png",
  stages: [
    "/plants/cucumber-stage-1.png",
    "/plants/cucumber-stage-2.png",
    "/plants/cucumber-stage-3.png",
    "/plants/cucumber-stage-4.png",
    "/plants/cucumber-stage-5.png",
    "/plants/cucumber-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 30,
  gramsPerPacket: 2,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 avr", "15 mai"],
      outdoor: ["15 mai", "15 juin"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 70,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 15,
      optimal: 24,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "high" as const,
    rainRequired: "50-70mm/semaine",
    irrigationNote: "Arrosage copieux quotidien, eviter le mouillage des feuilles",

    soil: {
      ph: "6.0-7.0",
      type: "Riche, frais, bien draine",
      compost: "Apport genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "4-5cm/semaine en sol",
    spacingCm: { between: 40, rows: 100 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 7, note: "Levee rapide 5-10 jours a 20C" },
    transplant: { days: 30, note: "Repiquage quand 3-4 feuilles" },
    firstFlowers: { days: 45, note: "Floraison - fleurs males puis females" },
    firstFruits: { days: 55, note: "Fruits en formation" },
    harvest: { days: 70, note: "Recolte quand 15-20cm, peau lisse" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "5-8kg/plante",
    fruitsPerPlant: "10-15",
    fruitWeight: "200-400g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "7-10 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair aqueuse et croquante, saveur douce et rafraichissante",
  consumption: "Frais en salade, tzatziki, juice, apperitif",
  nutrition: {
    calories: "10 kcal/100g",
    vitaminC: "Faible",
    potassium: "Moyen",
    hydration: "95% eau",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete americaine productive, fruit lisse et droit. Aime la chaleur et l'eau.",
  companions: ["haricot", "pois", "mais"],
  enemies: ["pomme de terre", "aromatiques forts"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [7, 18, 18, 27],
    realDaysToHarvest: 70,
    optimalTemp: [18, 30],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
