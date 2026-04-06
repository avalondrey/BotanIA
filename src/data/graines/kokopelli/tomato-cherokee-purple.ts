/**
 * Tomato Cherokee Purple - Kokopelli
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-cherokee-purple",
  plantDefId: "tomato",
  shopId: "kokopelli",
  category: "vegetable" as const,
  name: "Cherokee Purple",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/kokopelli/packet-tomato-cherokee-purple.png",
  cardImage: "/cards/seeds/kokopelli/tomato-cherokee-purple.png",
  stages: [
    "/plants/tomato-stage-1.png",
    "/plants/tomato-stage-2.png",
    "/plants/tomato-stage-3.png",
    "/plants/tomato-stage-4.png",
    "/plants/tomato-stage-5.png",
    "/plants/tomato-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 45,
  gramsPerPacket: 0.3,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["1 mars", "15 avr"],
      outdoor: ["15 mai", "30 mai"],
    },
    harvest: ["15 aout", "15 sept"],
    cycleDays: 110,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 25,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-60mm/semaine",
    irrigationNote: "Arrosage regulier mais modere, eviter stres hydrique",

    soil: {
      ph: "6.0-6.8",
      type: "Bien draine, riche en matiere organique",
      compost: "Apport modere avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 45000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 60, rows: 80 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 10, note: "Levee en 7-14 jours a 20-25C" },
    transplant: { days: 60, note: "Repiquage quand 8-10 feuilles" },
    firstFlowers: { days: 75, note: "Floraison mi-juillet" },
    firstFruits: { days: 90, note: "Fruits en formation" },
    harvest: { days: 110, note: "Maturite tardive" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "20-40",
    fruitWeight: "150-300g",
    harvestPeriod: ["15 aout", "15 sept"],
    conservation: "7-10 jours a temperature ambiante",
  },

  // === QUALITES CULINAIRES ===
  taste: "Saveur riche, sucree avec une legere acidite, tres parfume",
  consumption: "Frais en salade, sauce, coulis, pizza",
  nutrition: {
    calories: "18 kcal/100g",
    vitaminC: "Elevee",
    lycopene: "Tres eleve (pigment pourpre)",
    anthocyanes: "Presents (antioxidants)",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete ancestrale americaine, chair pourpre/dhawne. Productive mais tardive. Excellent gout.",
  companions: ["basilic", "carotte", "persil"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [10, 25, 25, 50],
    realDaysToHarvest: 110,
    optimalTemp: [18, 30],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
