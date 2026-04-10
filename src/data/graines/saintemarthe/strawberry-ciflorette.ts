/**
 * Strawberry Ciflorette - Sainte Marthe
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "strawberry-ciflorette",
  plantDefId: "strawberry",
  shopId: "saintemarthe",
  category: "vegetable" as const,
  name: "Fraise Ciflorette",
  emoji: "🍓",

  // === IMAGE ASSETS ===
  packetImage: "/packets/saintemarthe/packet-strawberry-ciflorette.png",
  cardImage: "/cards/seeds/saintemarthe/strawberry-ciflorette.png",
  stages: [
    "/plants/strawberry-stage-1.png",
    "/plants/strawberry-stage-2.png",
    "/plants/strawberry-stage-3.png",
    "/plants/strawberry-stage-4.png",
    "/plants/strawberry-stage-5.png",
    "/plants/strawberry-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 45,
  gramsPerPacket: 0.3,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 dec", "15 fev"],
      outdoor: ["15 mars", "15 mai"],
    },
    harvest: ["15 mai", "15 oct"],
    cycleDays: 150,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 10,
      optimal: 20,
      max: 30,
      frostResistance: -5,
    },
    waterNeeds: "high" as const,
    rainRequired: "50-70mm/semaine",
    irrigationNote: "Arrosage copieux regulier, goute-a-goutte ideal",

    soil: {
      ph: "5.5-6.5",
      type: "Leger, riche en humus, bien draine",
      compost: "Apport modere avant plantation, pas de fumier frais",
    },

    light: {
      needs: 8,
      optimalLux: 40000,
    },

    growthRate: "1-2cm/semaine en sol",
    spacingCm: { between: 30, rows: 40 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 30, note: "Levee tres lente 20-40 jours, besoin de froid" },
    firstLeaves: { days: 60, note: "Rosette de feuilles" },
    flowering: { days: 100, note: "Fleurs blanches apparaissent" },
    firstFruits: { days: 120, note: "Fruits en formation" },
    harvest: { days: 150, note: "Fruits murs et parfumés" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "500-800g/plante",
    fruitsPerPlant: "30-50",
    fruitWeight: "15-25g",
    harvestPeriod: ["15 mai", "15 oct"],
    conservation: "2-3 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair tres parfumée and sucree, saveur intense",
  consumption: "Frais, confiture, gateau, smoothie, dehydratpe",
  nutrition: {
    calories: "28 kcal/100g",
    vitaminC: "Tres eleve",
    manganese: "Eleve",
    antioxidants: "Eleves",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete Remontante productive et parfumée. Production echelonnee de mai aux gelees.",
  companions: ["laitue", "epinard", "haricot"],
  enemies: ["chou", "fennel", "bleuet"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 40, 40, 40],
    realDaysToHarvest: 150,
    optimalTemp: [15, 25],
    waterNeed: 5.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;
