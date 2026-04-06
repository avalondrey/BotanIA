/**
 * Cherry Montmorency - Fruitiers Forest
 * Carte arbre fruitier complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "cherry-montmorency",
  plantDefId: "cherry",
  shopId: "fruitiers-forest",
  category: "fruit-tree" as const,
  name: "Cerise Montmorency",
  emoji: "🍒",

  // === IMAGE ASSETS ===
  potImage: "/pots/fruitiers-forest/pot-cherry-montmorency.png",
  stages: [
    "/trees/fruitiers-forest/cherry-montmorency-stage-1.png",
    "/trees/fruitiers-forest/cherry-montmorency-stage-2.png",
    "/trees/fruitiers-forest/cherry-montmorency-stage-3.png",
    "/trees/fruitiers-forest/cherry-montmorency-stage-4.png",
    "/trees/fruitiers-forest/cherry-montmorency-stage-5.png",
  ],

  // === PRIX ===
  price: 175,
  grams: 0.5,
  ageYears: "1-2 ans (jeune arbre)",

  // === POLLINISATION ===
  pollination: {
    type: "Auto-stérile",
    pollinator: "Bing, Stella, Van",
    note: "Nécessite un pollinisateur pour produire"
  },

  // === PERIODE ===
  period: {
    flowering: ["10 avr", "25 avr"],
    harvest: ["20 jui", "10 jui"],
    planting: ["15 nov", "15 mars"],
    dormancy: ["1 dec", "28 fev"],
  },

  // === CONDITIONS DE CULTURE ===
  conditions: {
    temperature: {
      base: 8,
      optimal: { min: 15, max: 25 },
      max: 30,
      frostResistance: -20,
    },
    soil: {
      ph: "6.0-7.0",
      type: "Profond, bien drainé, pas trop calcaire",
      amendment: "Compost mature avant plantation",
    },
    light: {
      needs: 7,
      note: "Soleil direct minimum 7h/jour",
    },
    waterNeeds: "medium",
    irrigation: "Arrosage régulier en période sèche",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "3-4 ans après plantation",
    fullProduction: "5-7 ans",
    matureTreeHeight: "4-6 m",
    spread: "4-5 m",
    lifespan: "40-60 ans",
    annualGrowth: "40-60 cm",
  },

  // === RECOLTE ===
  yield: {
    amount: "30-50 kg/arbre",
    fruitSize: "2-3 cm",
    fruitsPerTree: "6000-12000",
    harvestWindow: "1-2 semaines",
    conservation: "5-7 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair ferme et acidulée, saveur riche et rafraîchissante",
  texture: "Ferme et juteuse",
  consumption: "Frais, clafoutis, confiture, tarte, liqueur",
  nutrition: {
    calories: "50 kcal/100g",
    vitaminC: "Élevée",
    potassium: "Élevé",
    antioxidants: "Élevés",
  },

  // === NOTES DE CULTURE ===
  notes: "Variété française classique, chair acidulée parfaite pour pâtisserie et confiture.",

  // === COMPAGNONNAGE (ALLELOPATHIE) ===
  companions: ["laitue", "fraise", "tagète"],
  enemies: ["noyer", "cèdre", "autres cerisiers incompatibles"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 1460,
    optimalTemp: [8, 25],
    waterNeed: 4.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
