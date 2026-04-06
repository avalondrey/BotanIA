/**
 * Eggplant Longue Violette - Kokopelli
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "eggplant-longue-violette",
  plantDefId: "eggplant",
  shopId: "kokopelli",
  category: "vegetable" as const,
  name: "Aubergine Longue Violette",
  emoji: "🍆",

  // === IMAGE ASSETS ===
  packetImage: "/packets/kokopelli/packet-eggplant-longue-violette.png",
  cardImage: "/cards/seeds/kokopelli/eggplant-longue-violette.png",
  stages: [
    "/plants/eggplant-stage-1.png",
    "/plants/eggplant-stage-2.png",
    "/plants/eggplant-stage-3.png",
    "/plants/eggplant-stage-4.png",
    "/plants/eggplant-stage-5.png",
    "/plants/eggplant-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 35,
  gramsPerPacket: 0.4,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 mai", "15 juin"],
    },
    harvest: ["15 jui", "30 sept"],
    cycleDays: 110,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 15,
      optimal: 25,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "high" as const,
    rainRequired: "50-70mm/semaine",
    irrigationNote: "Arrosage copieux regulier, ne jamais laisser sec",

    soil: {
      ph: "6.0-7.0",
      type: "Riche, frais, bien draine",
      compost: "Apport genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 50, rows: 70 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 12, note: "Levee lente 10-15 jours a 20-25C" },
    transplant: { days: 60, note: "Repiquage quand 4-6 feuilles" },
    firstFlowers: { days: 75, note: "Floraison mi-juillet" },
    firstFruits: { days: 90, note: "Fruits en formation" },
    harvest: { days: 110, note: "Recolte quand chair cede sous pression" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "10-15",
    fruitWeight: "200-400g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "7-10 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair tendre et ferme, saveur delicate et neutre",
  consumption: "Gratin, ratatouille, puree, salade",
  nutrition: {
    calories: "17 kcal/100g",
    vitaminC: "Moyenne",
    potassium: "Eleve",
    fibers: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete classique française, productive et resistante. Aime la chaleur et l'eau.",
  companions: ["haricot", "poivron", "epinard"],
  enemies: ["fennel", " pomme de terre"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [12, 28, 25, 45],
    realDaysToHarvest: 110,
    optimalTemp: [20, 32],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
