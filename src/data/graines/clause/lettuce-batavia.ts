/**
 * Lettuce Batavia - Clause
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "lettuce-batavia",
  plantDefId: "lettuce",
  shopId: "clause",
  category: "vegetable" as const,
  name: "Laitue Batavia",
  emoji: "🥬",

  // === IMAGE ASSETS ===
  packetImage: "/packets/clause/packet-lettuce-batavia.png",
  cardImage: "/cards/seeds/clause/lettuce-batavia.png",
  stages: [
    "/plants/lettuce-stage-1.png",
    "/plants/lettuce-stage-2.png",
    "/plants/lettuce-stage-3.png",
    "/plants/lettuce-stage-4.png",
    "/plants/lettuce-stage-5.png",
    "/plants/lettuce-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 25,
  gramsPerPacket: 1,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "15 sept"],
      outdoor: ["15 mars", "15 aout"],
    },
    harvest: ["15 avr", "15 oct"],
    cycleDays: 60,
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
    irrigationNote: "Arrosage frequent mais legume, eviter le soleil direct sur feuilles",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, frais, bien draine",
      compost: "Apport leger avant plantation",
    },

    light: {
      needs: 6,
      optimalLux: 25000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 30, rows: 40 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 6, note: "Levee rapide 4-8 jours a 15-20C" },
    transplant: { days: 25, note: "Repiquage possible ou semis direct" },
    firstLeaves: { days: 35, note: "Pousse vegetative rapide" },
    harvest: { days: 60, note: "Quand pomme est compacte et ferme" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "300-500g/plante",
    fruitsPerPlant: null,
    fruitWeight: null,
    harvestPeriod: ["15 avr", "15 oct"],
    conservation: "5-7 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Feuilles croquantes et Nantes, saveur douce et legere",
  consumption: "Frais en salade, burger, wrap",
  nutrition: {
    calories: "12 kcal/100g",
    vitaminC: "Moyenne",
    vitaminK: "Eleve",
    folate: "Moyen",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete frisee et croquante, tolerance a la chaleur. Rapide et productive.",
  companions: ["carotte", "radis", "fraise"],
  enemies: ["celeri", "persil"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [6, 15, 14, 25],
    realDaysToHarvest: 60,
    optimalTemp: [10, 20],
    waterNeed: 3.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
