/**
 * Pine Sylvestris - Pépinières Bordas
 * Carte arbre ornemental complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pine-sylvestris",
  plantDefId: "pine",
  shopId: "pepinieres-bordas",
  category: "ornamental-tree" as const,
  name: "Pin Sylvestre",
  emoji: "🌲",

  // === IMAGE ASSETS ===
  potImage: "/pots/pepinieres-bordas/pot-pine-sylvestris.png",
  stages: [
    "/trees/pepinieres-bordas/pine-sylvestris-stage-1.png",
    "/trees/pepinieres-bordas/pine-sylvestris-stage-2.png",
    "/trees/pepinieres-bordas/pine-sylvestris-stage-3.png",
    "/trees/pepinieres-bordas/pine-sylvestris-stage-4.png",
    "/trees/pepinieres-bordas/pine-sylvestris-stage-5.png",
  ],

  // === PRIX ===
  price: 90,
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
    flowering: ["1 mai", "15 mai"],
    harvest: ["15 sept", "15 oct"],
    planting: ["15 oct", "15 mars"],
    dormancy: null,
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: -5,
      optimal: { min: 5, max: 25 },
      max: 40,
      frostResistance: -40,
    },
    soil: {
      ph: "4.5-6.5",
      type: "Sableux, tourbeux, bien drainé, pauvre",
      amendment: "Terre de bruyère si sol alcalin",
    },
    light: {
      needs: 8,
      note: "Soleil direct, grand besoin de lumière",
    },
    waterNeeds: "low",
    irrigation: "Arrosage occasionnel, tolère séchresse",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: null,
    fullProduction: null,
    matureTreeHeight: "20-35 m",
    spread: "8-12 m",
    lifespan: "200-400 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: null,
    fruitSize: "3-6 cm (pignes)",
    fruitsPerTree: "Nombreuses pignes",
    harvestWindow: "Automne-hiver",
    conservation: "Pignes décoratives",
  },

  // === QUALITES ORNEMENTALES ===
  foliage: "Aiguilles bleutées-vertes, persistantes 2-3 ans",
  texture: "Port conique, écorce rouge-orange",
  usage: "Groupe, isolé, brise-vent, reboisement",
  winterInterest: "Feuillage persistant vert toute l'année",

  // === NOTES DE CULTURE ===
  notes: "Conifère européen rustique, écorce orange décorative. Grande longévité.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["myrtille", "fougère", "mousse"],
  enemies: ["espèces aimant sol riche"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [60, 120, 240, 365],
    realDaysToHarvest: null,
    optimalTemp: [-5, 25],
    waterNeed: 2.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
