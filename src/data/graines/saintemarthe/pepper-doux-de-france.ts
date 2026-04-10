/**
 * Pepper Doux de France - Sainte Marthe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pepper-doux-de-france",
  plantDefId: "pepper",
  shopId: "saintemarthe",
  category: "vegetable" as const,
  name: "Poivron Doux de France",
  emoji: "🫑",

  // === IMAGE ASSETS ===
  packetImage: "/packets/saintemarthe/packet-pepper-doux-de-france.png",
  cardImage: "/cards/seeds/saintemarthe/pepper-doux-de-france.png",
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
    cycleDays: 115,
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
    irrigationNote: "Arrosage regulier sans exces, paillage beneficial",

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
    germination: { days: 14, note: "Levee lente 12-18 jours a 20-25C" },
    transplant: { days: 60, note: "Repiquage quand 6-8 feuilles" },
    firstFlowers: { days: 80, note: "Floraison mi-juillet" },
    firstFruits: { days: 95, note: "Fruits en formation" },
    harvest: { days: 115, note: "Maturite quand rouge et brillant" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "10-15",
    fruitWeight: "150-250g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "10-14 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair douce et sucree, sans picance",
  consumption: "Frais en salade, farci, ratatouille, poele",
  nutrition: {
    calories: "20 kcal/100g",
    vitaminC: "Tres eleve",
    vitaminA: "Eleve",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete française traditionnelle, produit moyen et doux. Excellente pour farcir.",
  companions: ["tomate", "basilic", "carotte"],
  enemies: ["fennel", "haricot"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [14, 28, 25, 48],
    realDaysToHarvest: 115,
    optimalTemp: [20, 30],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
