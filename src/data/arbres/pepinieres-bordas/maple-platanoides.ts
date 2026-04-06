/**
 * Maple Platanoides - Pépinières Bordas
 * Carte arbre ornemental complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "maple-platanoides",
  plantDefId: "maple",
  shopId: "pepinieres-bordas",
  category: "ornamental-tree" as const,
  name: "Erable Plane",
  emoji: "🍁",

  // === IMAGE ASSETS ===
  potImage: "/pots/pepinieres-bordas/pot-maple-platanoides.png",
  stages: [
    "/trees/pepinieres-bordas/maple-platanoides-stage-1.png",
    "/trees/pepinieres-bordas/maple-platanoides-stage-2.png",
    "/trees/pepinieres-bordas/maple-platanoides-stage-3.png",
    "/trees/pepinieres-bordas/maple-platanoides-stage-4.png",
    "/trees/pepinieres-bordas/maple-platanoides-stage-5.png",
  ],

  // === PRIX ===
  price: 120,
  grams: 0.5,
  ageYears: "2-3 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Anémophile",
    pollinator: null,
    note: "Pollinisation par le vent"
  },

  // === PERIODE ===
  period: {
    flowering: ["10 avr", "25 avr"],
    harvest: ["15 sept", "15 oct"],
    planting: ["15 oct", "15 mars"],
    dormancy: ["1 nov", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: { min: 10, max: 25 },
      max: 35,
      frostResistance: -25,
    },
    soil: {
      ph: "5.5-7.5",
      type: "Profond, frais, bien draine",
      amendment: "Terre de bruyère si sol alcalin",
    },
    light: {
      needs: 6,
      note: "Soleil ou mi-ombre, protège des vents forts",
    },
    waterNeeds: "medium",
    irrigation: "Arrosage regulier en periode seche",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: null,
    fullProduction: null,
    matureTreeHeight: "20-30 m",
    spread: "15-20 m",
    lifespan: "150-200 ans",
    annualGrowth: "40-60 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: null,
    fruitSize: "3-5 cm (samares)",
    fruitsPerTree: "Nombreuses samares",
    harvestWindow: "Automne",
    conservation: "Semences à stratifier avant semis",
  },

  // === QUALITES ORNEMENTALES ===
  foliage: "Feuilles palmées vert foncé, coloration jaune-orange-rouge en automne",
  texture: "Feuilles lobées élégantes",
  usage: "Ombrage, alignement, jardin, parc",
  autumnColor: "Jaune doré, orange vif, rouge écarlate",

  // === NOTES DE CULTURE ===
  notes: "Arbre ornemental majestueux, excellent pour grand jardin. Coloration automnale spectaculaire.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["fougère", "hosta", "hydrangea"],
  enemies: ["coniferes trop proches"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [45, 90, 180, 365],
    realDaysToHarvest: null,
    optimalTemp: [5, 25],
    waterNeed: 3.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
