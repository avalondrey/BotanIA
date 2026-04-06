/**
 * Tomato Cocktail - Vilmorin
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "tomato-cocktail",
  plantDefId: "tomato",
  shopId: "vilmorin",
  category: "vegetable" as const,
  name: "Tomate Cocktail",
  emoji: "🍅",

  // === IMAGE ASSETS ===
  packetImage: "/packets/vilmorin/packet-tomato-cocktail.png",
  cardImage: "/cards/seeds/vilmorin/tomato-cocktail.png",
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
  gramsPerPacket: 0.5,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 fev", "30 mars"],
      outdoor: ["15 avr", "31 mai"],
    },
    harvest: ["15 jui", "30 sept"],
    cycleDays: 95,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    // Temperature (C)
    temperature: {
      base: 12,
      optimal: 24,
      max: 35,
      frostResistance: 0,
    },
    // Eau
    waterNeeds: "high" as const,
    rainRequired: "50-70mm/semaine",
    irrigationNote: "Arrosage regulier au pied, eviter les feuilles",

    // Sol
    soil: {
      ph: "6.0-7.0",
      type: "Riche en humus, bien draine",
      compost: "Apport genereux avant plantation",
    },

    // Lumiere
    light: {
      needs: 8,
      optimalLux: 40000,
    },

    // Croissance
    growthRate: "3cm/semaine en sol",
    spacingCm: { between: 60, rows: 80 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 8, note: "Levee en 5-10 jours a 20C" },
    transplant: { days: 50, note: "Repiquage quand 6-8 feuilles" },
    firstFlowers: { days: 70, note: "Floraison debut juillet" },
    firstFruits: { days: 85, note: "Fruits en formation" },
    harvest: { days: 95, note: "Recolte echelonnee" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "4-6kg/plante",
    fruitsPerPlant: "50-80",
    fruitWeight: "30-50g",
    harvestPeriod: ["15 jui", "30 sept"],
    conservation: "5-7 jours a temperature ambiante",
  },

  // === QUALITES CULINAIRES ===
  taste: "Sucree, juteuse, tres aromatique",
  consumption: "Frais en aperitif, salade, grignotage",
  nutrition: {
    calories: "18 kcal/100g",
    vitaminC: "tres riche",
    lycopene: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete precoce et productive, ideale pour balcon et culture en pot. Supporte mal les exces d'eau.",

  // === COMPAGNONNAGE ===
  companions: ["basilic", "laitue", "carotte"],
  enemies: ["pomme de terre", "chou", "fennel"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 22, 20, 45],
    realDaysToHarvest: 95,
    optimalTemp: [18, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
