/**
 * Magnolia Grandiflora - Pépinières Bordas
 * Carte arbre ornemental complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "magnolia-grandiflora",
  plantDefId: "magnolia",
  shopId: "pepinieres-bordas",
  category: "ornamental-tree" as const,
  name: "Magnolia à Grandes Fleurs",
  emoji: "🌸",

  // === IMAGE ASSETS ===
  potImage: "/pots/pepinieres-bordas/pot-magnolia-grandiflora.png",
  stages: [
    "/trees/pepinieres-bordas/magnolia-grandiflora-stage-1.png",
    "/trees/pepinieres-bordas/magnolia-grandiflora-stage-2.png",
    "/trees/pepinieres-bordas/magnolia-grandiflora-stage-3.png",
    "/trees/pepinieres-bordas/magnolia-grandiflora-stage-4.png",
    "/trees/pepinieres-bordas/magnolia-grandiflora-stage-5.png",
  ],

  // === PRIX ===
  price: 150,
  grams: 0.5,
  ageYears: "2-3 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Entomophile",
    pollinator: null,
    note: "Pollinisation par insectes"
  },

  // === PERIODE ===
  period: {
    flowering: ["15 mai", "15 jui"],
    harvest: ["1 oct", "15 oct"],
    planting: ["15 oct", "15 mars"],
    dormancy: ["1 nov", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 5,
      optimal: { min: 15, max: 28 },
      max: 35,
      frostResistance: -15,
    },
    soil: {
      ph: "5.5-6.5",
      type: "Riche en humus, frais, bien drainé, non calcaire",
      amendment: "Terre de bruyère, compost acide",
    },
    light: {
      needs: 6,
      note: "Soleil ou mi-ombre, protégé des vents forts",
    },
    waterNeeds: "medium",
    irrigation: "Arrosage régulier en période sèche",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: null,
    fullProduction: null,
    matureTreeHeight: "15-25 m",
    spread: "10-15 m",
    lifespan: "80-120 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: null,
    fruitSize: "5-8 cm (cônes décoratifs)",
    fruitsPerTree: null,
    harvestWindow: "Automne",
    conservation: "Graines à semer rapidement",
  },

  // === QUALITES ORNEMENTALES ===
  foliage: "Grandes feuilles persistantes vert foncé luisant",
  texture: "Feuilles coriaces, fleurs spectaculaires",
  usage: "Isolé, groupe, bordure",
  flowerColor: "Blanc crème, très grandes fleurs (20-30cm)",
  winterInterest: "Feuillage persistant décoratif",

  // === NOTES DE CULTURE ===
  notes: "Arbre ornemental spectaculaire, fleurs enormes et parfumées. Protéger du froid les premières années.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["fougère", "hosta", "azalée"],
  enemies: ["calendula", "espèces calcifuges"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [45, 90, 180, 365],
    realDaysToHarvest: null,
    optimalTemp: [5, 28],
    waterNeed: 4.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;
