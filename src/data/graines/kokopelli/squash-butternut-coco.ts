/**
 * Squash Butternut Coco - Kokopelli
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "squash-butternut-coco",
  plantDefId: "squash",
  shopId: "kokopelli",
  category: "vegetable" as const,
  name: "Courge Butternut Coco",
  emoji: "🎃",

  // === IMAGE ASSETS ===
  packetImage: "/packets/kokopelli/packet-squash-butternut-coco.png",
  cardImage: "/cards/seeds/kokopelli/squash-butternut-coco.png",
  stages: [
    "/plants/squash-stage-1.png",
    "/plants/squash-stage-2.png",
    "/plants/squash-stage-3.png",
    "/plants/squash-stage-4.png",
    "/plants/squash-stage-5.png",
    "/plants/squash-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 38,
  gramsPerPacket: 5,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 avr", "15 mai"],
      outdoor: ["15 mai", "15 juin"],
    },
    harvest: ["1 sept", "15 oct"],
    cycleDays: 130,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 22,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage copieux au pied, eviter les feuilles",

    soil: {
      ph: "6.0-7.5",
      type: "Tres riche en matiere organique, profond",
      compost: "Apport tres genereux avant plantation",
    },

    light: {
      needs: 7,
      optimalLux: 35000,
    },

    growthRate: "3-5cm/semaine en sol",
    spacingCm: { between: 100, rows: 150 },
  },

  // === STADES DE DEVELOPPEMENT ===
  stages: {
    germination: { days: 8, note: "Levee rapide 5-10 jours a 20C" },
    transplant: { days: 35, note: "Repiquage quand 3-4 feuilles" },
    firstFlowers: { days: 60, note: "Floraison aout" },
    firstFruits: { days: 80, note: "Fruits en formation" },
    harvest: { days: 130, note: "Maturite complete, chair orange" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "5-10kg/plante",
    fruitsPerPlant: "3-5",
    fruitWeight: "1-3kg",
    harvestPeriod: ["1 sept", "15 oct"],
    conservation: "6-12 mois en lieu sec et frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair orange et ferme, saveur sucree et noisettee",
  consumption: "Purpe, soupe, gratin, rizotte, patisserie",
  nutrition: {
    calories: "26 kcal/100g",
    vitaminC: "Elevee",
    vitaminA: "Tres eleve (beta-carotene)",
    potassium: "Eleve",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete tres productive, longue conservation. Necessite beaucoup d'espace pour rampes.",
  companions: ["mais", "haricot", "capucine"],
  enemies: ["pomme de terre", "autres courges"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [8, 25, 30, 67],
    realDaysToHarvest: 130,
    optimalTemp: [15, 30],
    waterNeed: 4.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
