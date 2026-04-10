/**
 * Pepper California Wonder - Clause
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pepper-california-wonder",
  plantDefId: "pepper",
  shopId: "clause",
  category: "vegetable" as const,
  name: "Poivron California Wonder",
  emoji: "🫑",

  // === IMAGE ASSETS ===
  packetImage: "/packets/clause/packet-pepper-california-wonder.png",
  cardImage: "/cards/seeds/clause/pepper-california-wonder.png",
  stages: [
    "/plants/pepper-stage-1.png",
    "/plants/pepper-stage-2.png",
    "/plants/pepper-stage-3.png",
    "/plants/pepper-stage-4.png",
    "/plants/pepper-stage-5.png",
    "/plants/pepper-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 35,
  gramsPerPacket: 0.5,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 mai", "15 juin"],
    },
    harvest: ["15 jui", "30 sept"],
    cycleDays: 120,
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
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regular sans exces, paillage recommande",

    soil: {
      ph: "6.0-7.0",
      type: "Bien draine, riche en matiere organique",
      compost: "Apport modere avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "2cm/semaine en sol",
    spacingCm: { between: 50, rows: 60 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 15, note: "Levee lente 12-20 jours a 20-25C" },
    transplant: { days: 65, note: "Repiquage quand 6-8 feuilles" },
    firstFlowers: { days: 85, note: "Floraison mi-juillet" },
    firstFruits: { days: 100, note: "Fruits en formation" },
    harvest: { days: 120, note: "Maturite quand rouge ou jaune selon variete" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "10-20",
    fruitWeight: "100-200g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "10-14 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair croquante et douce, saveur sucree et fruitree",
  consumption: "Frais en salade, farci, ratatouille, poele",
  nutrition: {
    calories: "20 kcal/100g",
    vitaminC: "Tres eleve",
    vitaminA: "Eleve",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete americaine classique, gros fruits cubiques. Necessite chaleur et patience.",
  companions: ["tomate", "basilic", "carotte"],
  enemies: ["fennel", "haricot"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [15, 30, 25, 50],
    realDaysToHarvest: 120,
    optimalTemp: [20, 30],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
