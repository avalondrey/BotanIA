/**
 * Basil Genoveeis - Sainte Marthe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "basil-genoveeis",
  plantDefId: "basil",
  shopId: "saintemarthe",
  category: "vegetable" as const,
  name: "Basilic Genoveeis",
  emoji: "🌿",

  // === IMAGE ASSETS ===
  packetImage: "/packets/saintemarthe/packet-basil-genoveeis.png",
  cardImage: "/cards/seeds/saintemarthe/basil-genoveeis.png",
  stages: [
    "/plants/basil-stage-1.png",
    "/plants/basil-stage-2.png",
    "/plants/basil-stage-3.png",
    "/plants/basil-stage-4.png",
    "/plants/basil-stage-5.png",
    "/plants/basil-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 28,
  gramsPerPacket: 2,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 mars", "15 mai"],
      outdoor: ["15 mai", "15 jui"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 60,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 15,
      optimal: 25,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage regulier mais pas excessif, eviter leau sur feuilles",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, bien draine, pas trop riche",
      compost: "Apport leger avant semis",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "3-5cm/semaine en sol",
    spacingCm: { between: 25, rows: 30 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 8, note: "Levee en 5-10 jours a 20-25C" },
    firstLeaves: { days: 20, note: "Premieres feuilles vraies" },
    growth: { days: 40, note: "Croissance vegetative rapide" },
    harvest: { days: 60, note: "Coupe reguliere stimule ramification" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "200-400g/plante",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "Quelques jours frais ou congelpe",
  },

  // === QUALITES CULINAIRES ===
  taste: "Arome intense et delicat, saveur chaude et parfume",
  consumption: "Pesto, sauce, salade, pizza, decoration",
  nutrition: {
    calories: "15 kcal/100g",
    vitaminK: "Tres eleve",
    vitaminA: "Eleve",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Le basilic le plus apprecie, arome exceptionnel. Necessite chaleur et lumiere.",
  companions: ["tomate", "poivron", "laitue"],
  enemies: ["rue", "sage"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 15, 17, 20],
    realDaysToHarvest: 60,
    optimalTemp: [18, 30],
    waterNeed: 3.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
