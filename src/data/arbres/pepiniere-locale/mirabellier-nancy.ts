/**
 * Mirabellier de Nancy — Pépinière locale
 * Prunus domestica subsp. insititia var. syriaca
 */

export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "mirabellier-nancy",
  plantDefId: "mirabellier",
  shopId: "pepiniere-locale",
  category: "fruit-tree" as const,
  name: "Mirabellier de Nancy",
  emoji: "🫐",

  // === IMAGE ASSETS ===
  packetImage: "/plantules/plantule-mirabellier.png",
  cardImage: "/plantules/plantule-mirabellier.png",
  stages: [
    "/plants/mirabellier-stage-1.png",
    "/plants/mirabellier-stage-2.png",
    "/plants/mirabellier-stage-3.png",
    "/plants/mirabellier-stage-4.png",
    "/plants/mirabellier-stage-5.png",
  ],

  // === PRIX & QUANTITE ===
  price: 150,
  gramsPerPacket: 0,

  // === PERIODE DE CULTURE ===
  period: {
    sowing: {
      indoor: null,
      outdoor: ["02", "03"],
    },
    harvest: ["08", "09"],
    cycleDays: 188,
  },

  // === CONDITIONS DE CROISSANCE ===
  conditions: {
    temperature: {
      base: 7,
      optimal: [10, 25],
      max: 30,
      frostResistance: -20,
    },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage régulier en période sèche, sol frais mais bien drainé",
    soil: {
      ph: "6.0-7.5",
      type: "Sol profond, frais et bien drainé, riche en matière organique",
      compost: "Apport de compost avant plantation",
    },
    light: {
      needs: 7,
      optimalLux: 35000,
    },
    growthRate: "Croissance régulière, mise à fruits rapide",
    spacingCm: { between: 400, rows: 500 },
  },

  // === STADES DE DEVELOPPEMENT ===
  developmentStages: {
    germination: { days: 18, note: "Levée lente, sol frais requis" },
    growth: { days: 35, note: "Développement foliaire vigorous" },
    maturation: { days: 55, note: "Floraison et formation des fruits" },
    harvest: { days: 80, note: "Maturité et récolte des mirabelles" },
  },

  // === RECOLTE & RENDEMENT ===
  yield: {
    amount: "15-25kg/arbuste",
    fruitWeight: "8-12g",
    harvestPeriod: ["15 août", "15 septembre"],
    conservation: "7-10 jours au frais, congelable",
  },

  // === QUALITES CULINAIRES ===
  taste: "Chair fine, sucrée et parfumée, saveur typique de la mirabelle",
  consumption: "Frais, tarte, confiture, liqueur, congelé",
  nutrition: {
    calories: "45 kcal/100g",
    vitaminC: "Présente",
    fibers: "Modérée",
  },

  // === NOTES DE CULTURE ===
  notes: "Variété de Varmonzey rustique et productive. Chair fine et sucrée. Autofertile mais meilleurs rendements avec un polinisateur.",
  companions: ["basilic", "carotte", "cresson"],
  enemies: ["aucun"],

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [18, 35, 55, 80],
    realDaysToHarvest: 188,
    optimalTemp: [10, 25],
    waterNeed: 4.5,
    lightNeed: 7,
  },
};

export default CARD_DATA;