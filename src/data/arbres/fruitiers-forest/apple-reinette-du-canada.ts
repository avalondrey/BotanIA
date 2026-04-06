/**
 * Apple Reinette du Canada - Fruitiers Forest
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "apple-reinette-du-canada",
  plantDefId: "apple",
  shopId: "fruitiers-forest",
  category: "fruit-tree" as const,
  name: "Reinette du Canada",
  emoji: "🍎",

  // === IMAGE ASSETS ===
  potImage: "/pots/fruitiers-forest/pot-apple-reinette-du-canada.png",
  stages: [
    "/trees/fruitiers-forest/apple-reinette-du-canada-stage-1.png",
    "/trees/fruitiers-forest/apple-reinette-du-canada-stage-2.png",
    "/trees/fruitiers-forest/apple-reinette-du-canada-stage-3.png",
    "/trees/fruitiers-forest/apple-reinette-du-canada-stage-4.png",
    "/trees/fruitiers-forest/apple-reinette-du-canada-stage-5.png",
  ],

  // === PRIX ===
  price: 160,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Partiellement autofertile",
    pollinator: "Golden Delicious, Belle Fleur",
    note: "Pollinisation croisée recommandée pour meilleur rendement"
  },

  // === PERIODE ===
  period: {
    flowering: ["20 avr", "15 mai"],
    harvest: ["20 sept", "15 oct"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 7,
      optimal: { min: 15, max: 24 },
      max: 30,
      frostResistance: -25,
    },
    soil: {
      ph: "6.0-7.0",
      type: "Profond, riche, bien drainé",
      amendment: "Compost mature avant plantation",
    },
    light: {
      needs: 6,
      note: "Soleil direct minimum 6h/jour",
    },
    waterNeeds: "medium",
    irrigation: "Régulier en période sèche, 20-30L/semaine",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "3-4 ans après plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "4-6 m",
    spread: "4-5 m",
    lifespan: "60-100 ans",
    annualGrowth: "35-50 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "60-100 kg/arbre",
    fruitSize: "7-9 cm",
    fruitsPerTree: "150-300",
    harvestWindow: "2-3 semaines",
    conservation: "6-8 mois en cave humide",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme et acidulée, saveur équilibrée sucre-acide",
  texture: "Ferme et croquante",
  consumption: "Frais, cuisson, compotes, tarte",
  nutrition: {
    calories: "52 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Élevée (2.5g/100g)",
    antioxidants: "Élevés",
  },

  // === NOTES DE CULTURE ===
  notes: "Variété française ancienne très rustique, excellente pour la cuisson et la conservation.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagète"],
  enemies: ["noyer", "cèdre", "noisetier"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1095,
    optimalTemp: [7, 24],
    waterNeed: 4.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
