/**
 * Pea Douce Provence - Sainte Marthe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pea-douce-provence",
  plantDefId: "pea",
  shopId: "saintemarthe",
  category: "vegetable" as const,
  name: "Pois Douce Provence",
  emoji: "🫛",

  // === IMAGE ASSETS ===
  packetImage: "/packets/saintemarthe/packet-pea-douce-provence.png",
  cardImage: "/cards/seeds/saintemarthe/pea-douce-provence.png",
  stages: [
    "/plants/pea-stage-1.png",
    "/plants/pea-stage-2.png",
    "/plants/pea-stage-3.png",
    "/plants/pea-stage-4.png",
    "/plants/pea-stage-5.png",
    "/plants/pea-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 28,
  gramsPerPacket: 100,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["15 fev", "15 avr"],
    },
    harvest: ["15 mai", "15 jui"],
    cycleDays: 75,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: 15,
      max: 25,
      frostResistance: -5,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage moderer et regulier",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, bien draine, pas trop riche en azote",
      compost: "Apport leger avant semis",
    },

    light: {
      needs: 7,
      optimalLux: 30000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 5, rows: 40 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 12, note: "Levee en 10-15 jours" },
    firstLeaves: { days: 28, note: "Premieres feuilles trifoliees" },
    flowering: { days: 50, note: "Floraison" },
    harvest: { days: 75, note: "Grains murs et tendres" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "400-600g/m2",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 mai", "15 jui"],
    conservation: "Quelques jours au frais, congelable",
  },

  // === QUALITES CULINAIRES ===
  taste: "Grains doux et sucrees, texture tendre",
  consumption: "Frais, vapeur, soupe, puree",
  nutrition: {
    calories: "65 kcal/100g",
    proteins: "Eleve (5g/100g)",
    fibers: "Eleve",
    fer: "Moyen",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete française productive, grains ronds et doux. Semis precoce possible.",
  companions: ["carotte", "radis", "courgette"],
  enemies: ["oignon", "ail", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [12, 18, 22, 23],
    realDaysToHarvest: 75,
    optimalTemp: [5, 20],
    waterNeed: 3.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
