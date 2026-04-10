/**
 * Carrot Guerande - Le Biau Germe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "carrot-guerande",
  plantDefId: "carrot",
  shopId: "lebiau",
  category: "vegetable" as const,
  name: "Carotte Guerande",
  emoji: "🥕",

  // === IMAGE ASSETS ===
  packetImage: "/packets/lebiau/packet-carrot-guerande.png",
  cardImage: "/cards/seeds/lebiau/carrot-guerande.png",
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
      outdoor: ["15 fev", "15 sept"],
    },
    harvest: ["15 mai", "15 nov"],
    cycleDays: 90,
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
    irrigationNote: "Arrosage regulier, sol toujours frais mais jamais imbibpe",

    soil: {
      ph: "6.0-7.0",
      type: "Leger, sableux, profond, sans pierres",
      compost: "Pas de fumier frais, utiliser du compost murs",
    },

    light: {
      needs: 7,
      optimalLux: 30000,
    },

    growthRate: "1-2cm/semaine en sol",
    spacingCm: { between: 5, rows: 25 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 20, note: "Levee lente et irreguliere 15-25 jours" },
    firstLeaves: { days: 40, note: "Feuilles en rosette" },
    rootGrowth: { days: 60, note: "Racine commence a grossir" },
    harvest: { days: 90, note: "Racine mature, couleur orange vif" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "300-500g/m2",
    fruitsPerPlant: null,
    fruitWeight: "100-200g",
    harvestPeriod: ["15 mai", "15 nov"],
    conservation: "Plusieurs mois en cave seche (sable)",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair sucree et croquante, tres parfumee",
  consumption: "Frais en salade, carotte rapee, soupe, vapeur, gateau",
  nutrition: {
    calories: "25 kcal/100g",
    vitaminA: "Tres eleve (beta-carotene)",
    vitaminC: "Moyenne",
    fibers: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete traditionelle francaise, calibre moyen et excellent gout. Haute tolerance au froid.",
  companions: ["pois", "laitue", "oignon"],
  enemies: ["aneth", "persil", "betterave"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [20, 25, 25, 20],
    realDaysToHarvest: 90,
    optimalTemp: [10, 25],
    waterNeed: 3.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
