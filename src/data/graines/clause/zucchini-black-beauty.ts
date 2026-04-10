/**
 * Zucchini Black Beauty - Clause
 * Carte de croissance complete
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "zucchini-black-beauty",
  plantDefId: "zucchini",
  shopId: "clause",
  category: "vegetable" as const,
  name: "Courgette Black Beauty",
  emoji: "🥒",

  // === IMAGE ASSETS ===
  packetImage: "/packets/clause/packet-zucchini-black-beauty.png",
  cardImage: "/cards/seeds/clause/zucchini-black-beauty.png",
  stages: [
    "/plants/zucchini-stage-1.png",
    "/plants/zucchini-stage-2.png",
    "/plants/zucchini-stage-3.png",
    "/plants/zucchini-stage-4.png",
    "/plants/zucchini-stage-5.png",
    "/plants/zucchini-stage-6.png",
  ],

  // === PRIX & QUANTITE ===
  price: 32,
  gramsPerPacket: 3,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: ["15 avr", "15 mai"],
      outdoor: ["15 mai", "15 juin"],
    },
    harvest: ["15 jui", "15 sept"],
    cycleDays: 55,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 12,
      optimal: 22,
      max: 35,
      frostResistance: 0,
    },
    waterNeeds: "high" as const,
    rainRequired: "40-60mm/semaine",
    irrigationNote: "Arrosage copieux regulier, paillage pour conserver humidite",

    soil: {
      ph: "6.0-7.5",
      type: "Riche en matiere organique, bien draine",
      compost: "Apport genereux avant plantation",
    },

    light: {
      needs: 7,
      optimalLux: 35000,
    },

    growthRate: "3-4cm/semaine en sol",
    spacingCm: { between: 80, rows: 100 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 6, note: "Levee rapide 4-8 jours a 20C" },
    transplant: { days: 25, note: "Repiquage quand 3-4 feuilles" },
    firstFlowers: { days: 40, note: "Floraison avec grosses fleurs jaunes" },
    firstFruits: { days: 48, note: "Fruits en formation" },
    harvest: { days: 55, note: "Recolte jeune (15-20cm) pour meilleur gout" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "5-10kg/plante",
    fruitsPerPlant: "15-25",
    fruitWeight: "200-500g",
    harvestPeriod: ["15 jui", "15 sept"],
    conservation: "7-10 jours au frais",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair tendre et delicate, saveur delicate et neutre",
  consumption: "Gratin, ratatouille, farcie, grillee, brownie",
  nutrition: {
    calories: "15 kcal/100g",
    vitaminC: "Moyenne",
    potassium: "Moyen",
    fibers: "Faible",
  },

  // === NOTES DE CULTURE ===
  notes: "Variete tres productive, croissance rapide. Recolte reguliere stimule nouvelle production.",
  companions: ["mais", "haricot", "capucine"],
  enemies: ["pomme de terre", "autres courges"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [6, 15, 14, 20],
    realDaysToHarvest: 55,
    optimalTemp: [15, 28],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;
