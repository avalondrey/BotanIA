/**
 * Carrot Robver - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "carrot-robver",
  plantDefId: "carrot",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Carotte Robver",
  emoji: "🥕",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-carrot-robver.png",
  cardImage: "/cards/seeds/lebiau/carrot-robver.png",
  stages: [
    "/plants/carrot-stage-1.png",
    "/plants/carrot-stage-2.png",
    "/plants/carrot-stage-3.png",
    "/plants/carrot-stage-4.png",
    "/plants/carrot-stage-5.png",
    "/plants/carrot-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 28,
  gramsPerPacket: 3,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["15 mars", "15 aout"],
    },
    harvest: ["15 jui", "15 oct"],
    cycleDays: 85,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 7,
      optimal: 18,
      max: 28,
      frostResistance: -5,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage moderer et regulier, sol frais",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, sableux, profond, sans pierres",
      compost: "Compost murs uniquement, pas de fumier frais",
    },

    light: {
      needs: 7,
      optimalLux: 30000,
    },

    growthRate: "1-2cm/semaine en sol",
    spacingCm: { between: 5, rows: 25 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 18, note: "Levee en 15-20 jours" },
    firstLeaves: { days: 38, note: "Feuilles en rosette" },
    rootGrowth: { days: 55, note: "Racine en formation" },
    harvest: { days: 85, note: "Racine mature, couleur rouge-orange" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "400-600g/m2",
    fruitsPerPlant: null,
    fruitWeight: "120-220g",
    harvestPeriod: ["15 jui", "15 oct"],
    conservation: "4-6 mois en cave seche",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair sucree avec note sucree et terreuse",
  consumption: "Frais en salade, jus, soupe, vapeur",
  nutrition: {
    calories: "26 kcal/100g",
    vitaminA: "Tres eleve (lycopene et beta-carotene)",
    vitaminC: "Moyenne",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete hollandaise a chair rouge-orange. Originale et appreciee pour sa couleur et gout.",
  companions: ["pois", "laitue", "oignon"],
  enemies: ["aneth", "persil", "betterave"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [18, 22, 22, 23],
    realDaysToHarvest: 85,
    optimalTemp: [10, 25],
    waterNeed: 3.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
