/**
 * Basil Marseillais - Sainte Marthe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "basil-marseillais",
  plantDefId: "basil",
  shopId: "saintemarthe",
  category: "vegetable" as const,
  name: "Basilic Marseillais",
  emoji: "🌿",

  // === IMAGE ASSETS ===
  packetImage: "/packets/saintemarthe/packet-basil-marseillais.png",
  cardImage: "/cards/seeds/saintemarthe/basil-marseillais.png",
  stages: [
    "/plants/basil-stage-1.png",
    "/plants/basil-stage-2.png",
    "/plants/basil-stage-3.png",
    "/plants/basil-stage-4.png",
    "/plants/basil-stage-5.png",
    "/plants/basil-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 30,
  gramsPerPacket: 2,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 mars", "15 mai"],
      outdoor: ["15 mai", "15 jui"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 65,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 15,
      optimal: 26,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage moderer, laisser secher entre deux",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, bien draine, moyen en matiere organique",
      compost: "Apport leger avant semis",
    },

    light: {
      needs: 8,
      optimalLux: 45000,
    },

    growthRate: "3-4cm/semaine en sol",
    spacingCm: { between: 30, rows: 35 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 7, note: "Levee en 5-10 jours a 20-25C" },
    firstLeaves: { days: 22, note: "Premieres feuilles vraies" },
    growth: { days: 42, note: "Croissance vegetative" },
    harvest: { days: 65, note: "Coupe des tiges pour stimuper ramification" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "250-450g/plante",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "Quelques jours frais ou congelpe",
  },

  // === QUALITES CULINAIRES ===
  taste: "Arome puissant et camphre, saveur robuste",
  consumption: "Pesto genois, sauce au pistou, pizza",
  nutrition: {
    calories: "15 kcal/100g",
    vitaminK: "Tres eleve",
    vitaminA: "Eleve",
    iron: "Moyen",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete provençale a grandes feuilles, plus resistant que le genoveeis. Excellent pour le pistou.",
  companions: ["tomate", "poivron", "aubergine"],
  enemies: ["rue", "sage"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [7, 18, 20, 20],
    realDaysToHarvest: 65,
    optimalTemp: [18, 30],
    waterNeed: 3.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
