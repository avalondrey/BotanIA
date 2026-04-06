/**
 * Pear Beurre Hardy - Fruitiers Forest
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "pear-beurre-hardy",
  plantDefId: "pear",
  shopId: "fruitiers-forest",
  category: "fruit-tree" as const,
  name: "Beurre Hardy",
  emoji: "🍐",

  // === IMAGE ASSETS ===
  potImage: "/pots/fruitiers-forest/pot-pear-beurre-hardy.png",
  stages: [
    "/trees/fruitiers-forest/pear-beurre-hardy-stage-1.png",
    "/trees/fruitiers-forest/pear-beurre-hardy-stage-2.png",
    "/trees/fruitiers-forest/pear-beurre-hardy-stage-3.png",
    "/trees/fruitiers-forest/pear-beurre-hardy-stage-4.png",
    "/trees/fruitiers-forest/pear-beurre-hardy-stage-5.png",
  ],

  // === PRIX ===
  price: 165,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: "Williams, Conference",
    note: "Pollinisation croisée recommandée"
  },

  // === PERIODE ===
  period: {
    flowering: ["10 avr", "1 mai"],
    harvest: ["25 aout", "15 sept"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 7,
      optimal: { min: 15, max: 24 },
      max: 32,
      frostResistance: -25,
    },
    soil: {
      ph: "6.0-7.0",
      type: "Profond, frais, bien drainé",
      amendment: "Compost mature avant plantation",
    },
    light: {
      needs: 6,
      note: "Soleil direct minimum 6h/jour",
    },
    waterNeeds: "medium",
    irrigation: "Régulier en période sèche, 25-35L/semaine",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "3-4 ans après plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "4-6 m",
    spread: "3-4 m",
    lifespan: "50-75 ans",
    annualGrowth: "35-55 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "55-85 kg/arbre",
    fruitSize: "6-9 cm",
    fruitsPerTree: "130-280",
    harvestWindow: "2-3 semaines",
    conservation: "2-3 semaines au frais, 6-8 semaines en冰箱",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair fondante et délicate, saveur sucrée et aromatique",
  texture: "Fondante et juteuse",
  consumption: "Frais, tarte, poires au vin, conserve",
  nutrition: {
    calories: "54 kcal/100g",
    vitaminC: "Moyenne",
    fiber: "Élevée (3.1g/100g)",
    potassium: "Élevé",
  },

  // === NOTES DE CULTURE ===
  notes: "Variété française ancienne, chair fondante et très parfumée. Précoce et productive.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagète"],
  enemies: ["noyer", "cèdre"],

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
