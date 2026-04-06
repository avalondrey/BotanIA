/**
 * Orange Valencia Late - Fruitiers Forest
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "orange-valencia-late",
  plantDefId: "orange",
  shopId: "fruitiers-forest",
  category: "fruit-tree" as const,
  name: "Orange Valencia Late",
  emoji: "🍊",

  // === IMAGE ASSETS ===
  potImage: "/pots/fruitiers-forest/pot-orange-valencia-late.png",
  stages: [
    "/trees/fruitiers-forest/orange-valencia-late-stage-1.png",
    "/trees/fruitiers-forest/orange-valencia-late-stage-2.png",
    "/trees/fruitiers-forest/orange-valencia-late-stage-3.png",
    "/trees/fruitiers-forest/orange-valencia-late-stage-4.png",
    "/trees/fruitiers-forest/orange-valencia-late-stage-5.png",
  ],

  // === PRIX ===
  price: 195,
  grams: 0.5,
  ageYears: "2-3 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: null,
    note: "Peut produire seul mais meilleur avec autre variété"
  },

  // === PERIODE ===
  period: {
    flowering: ["15 avr", "15 mai"],
    harvest: ["15 mars", "15 jui"],
    planting: ["15 mars", "15 oct"],
    dormancy: null,
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 10,
      optimal: { min: 18, max: 30 },
      max: 38,
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
    irrigation: "Arrosage régulier, sol toujours frais mais drainé",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "3-4 ans après plantation",
    fullProduction: "5-6 ans",
    matureTreeHeight: "3-5 m",
    spread: "3-4 m",
    lifespan: "40-60 ans",
    annualGrowth: "30-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "40-70 kg/arbre",
    fruitSize: "6-8 cm",
    fruitsPerTree: "200-400",
    harvestWindow: "3-4 mois (fructification tardive)",
    conservation: "2-3 mois à température fraîche",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair juteuse et sucrée, saveur équilibrée et parfumée",
  texture: "Juteuse et fondante",
  consumption: "Frais, jus, cuisine, pâtisserie, confiture",
  nutrition: {
    calories: "47 kcal/100g",
    vitaminC: "Très élevée",
    folate: "Élevé",
    thiamine: "Modérée",
  },

  // === NOTES DE CULTURE ===
  notes: "Variété espagnole tardive, excellents fruits juteux. Longue conservation sur l'arbre.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["basilic", "laitue", "fraise"],
  enemies: ["noyer", "cèdre"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1460,
    optimalTemp: [10, 30],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
