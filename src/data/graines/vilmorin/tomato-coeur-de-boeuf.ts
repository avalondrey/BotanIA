/**
 * Tomato Coeur de Boeuf - Vilmorin
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-coeur-de-boeuf",
  plantDefId: "tomato",
  shopId: "vilmorin",
  category: "vegetable" as const,
  name: "Tomate Coeur de Boeuf",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/vilmorin/packet-tomato-coeur-de-boeuf.png",
  cardImage: "/cards/seeds/vilmorin/tomato-coeur-de-boeuf.png",
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
  gramsPerPacket: 0.4,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "31 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 100,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 24,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage regulier au pied, eviter les feuilles",

    soil: {
      ph: "6.0-7.0",
      type: "Riche en humus, bien draine",
      compost: "Apport genereux avant plantation",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "2-3cm/semaine en sol",
    spacingCm: { between: 60, rows: 80 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 8, note: "Levee en 5-10 jours a 20C" },
    transplant: { days: 55, note: "Repiquage quand 6-8 feuilles" },
    firstFlowers: { days: 70, note: "Floraison debut juillet" },
    firstFruits: { days: 85, note: "Fruits en formation" },
    harvest: { days: 100, note: "Recolte quand fruit est ferme et colore" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "3-5kg/plante",
    fruitsPerPlant: "10-20",
    fruitWeight: "200-400g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "7-10 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme et parfumée, saveur sucree et aromatique",
  consumption: "Frais en salade, farce, gratin",
  nutrition: {
    calories: "17 kcal/100g",
    vitaminC: "Moyenne",
    lycopene: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete italienne populaire, gros fruits en forme de coeur. Chair ferme et parfumée.",
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 22, 20, 50],
    realDaysToHarvest: 100,
    optimalTemp: [18, 28],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
