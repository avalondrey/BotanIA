/**
 * Tomato Green Zebra - Kokopelli
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-green-zebra",
  plantDefId: "tomato",
  shopId: "kokopelli",
  category: "vegetable" as const,
  name: "Green Zebra",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/kokopelli/packet-tomato-green-zebra.png",
  cardImage: "/cards/seeds/kokopelli/tomato-green-zebra.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 40,
  gramsPerPacket: 0.25,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "30 sept"],
    cycleDays: 95,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 24,
      max: 32,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier et constant pour eviter craquelage",

    soil: {
      ph: "6.0-7.0",
      type: "Bien draine, riche en matiere organique",
      compost: "Apport modere avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 50, rows: 70 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 8, note: "Levee en 5-10 jours a 20C" },
    transplant: { days: 52, note: "Repiquage quand 6-8 feuilles" },
    firstFlowers: { days: 65, note: "Floraison debut juillet" },
    firstFruits: { days: 78, note: "Fruits striees visibles" },
    harvest: { days: 95, note: "Maturite quand zdbro tachete de jaune" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "40-80",
    fruitWeight: "60-100g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "10-14 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme et juteuse, saveur acidulee et rafraichissante, citrus",
  consumption: "Frais en salade, sauce verte, appetissant",
  nutrition: {
    calories: "16 kcal/100g",
    vitaminC: "Elevee",
    lycopene: "Moyen",
    chlorophyll: "Eleve (pigment vert)",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete americaine populaire, chair verte striee de jaune. Productive et precose. Croissance rapide.",
  companions: ["basilic", "carotte", "laitue"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 20, 20, 47],
    realDaysToHarvest: 95,
    optimalTemp: [18, 28],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
