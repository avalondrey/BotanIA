/**
 * Lemon Meyer - Fruitiers Forest
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "lemon-meyer",
  plantDefId: "lemon",
  shopId: "fruitiers-forest",
  category: "fruit-tree" as const,
  name: "Citron Meyer",
  emoji: "🍋",

  // === IMAGE ASSETS ===
  potImage: "/pots/fruitiers-forest/pot-lemon-meyer.png",
  stages: [
    "/trees/fruitiers-forest/lemon-meyer-stage-1.png",
    "/trees/fruitiers-forest/lemon-meyer-stage-2.png",
    "/trees/fruitiers-forest/lemon-meyer-stage-3.png",
    "/trees/fruitiers-forest/lemon-meyer-stage-4.png",
    "/trees/fruitiers-forest/lemon-meyer-stage-5.png",
  ],

  // === PRIX ===
  price: 190,
  grams: 0.5,
  ageYears: "2-3 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: null,
    note: "Peut produire seul mais meilleur avec pollinisateur"
  },

  // === PERIODE ===
  period: {
    flowering: ["15 mars", "15 mai"],
    harvest: ["15 nov", "15 mars"],
    planting: ["15 mars", "15 oct"],
    dormancy: null,
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 10,
      optimal: { min: 18, max: 28 },
      max: 35,
      frostResistance: -5,
    },
    soil: {
      ph: "5.5-6.5",
      type: "Léger, bien drainé, riche en matière organique",
      amendment: "Terre de bruyère, compost acide",
    },
    light: {
      needs: 8,
      note: "Soleil direct minimum 8h/jour",
    },
    waterNeeds: "high",
    irrigation: "Arrosage régulier, sol toujours frais",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "2-3 ans après plantation",
    fullProduction: "4-5 ans",
    matureTreeHeight: "2-4 m",
    spread: "2-3 m",
    lifespan: "30-50 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "15-30 kg/arbre",
    fruitSize: "5-7 cm",
    fruitsPerTree: "100-200",
    harvestWindow: "Plusieurs mois (fructification échelonnée)",
    conservation: "2-4 semaines à température ambiante",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair juteuse, saveur douce et moins acide que les citrons classiques",
  texture: "Juteuse et tendre",
  consumption: "Frais, jus, cuisine, pâtisserie, boissons",
  nutrition: {
    calories: "29 kcal/100g",
    vitaminC: "Très élevée",
    potassium: "Élevé",
   柠檬酸: "Modérée",
  },

  // === NOTES DE CULTURE ===
  notes: "Hybride citron-d'orange, plus doux et parfumé. Protéger du froid en hiver.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["basilic", "laitue", "fraise"],
  enemies: ["noyer", "cèdre"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1095,
    optimalTemp: [10, 28],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
