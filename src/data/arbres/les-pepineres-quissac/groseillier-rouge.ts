/**
 * Groseillier Rouge — Pépinière locale
 * Ribes rubrum
 */

export const CARD_DATA = {
  id: "groseillier-rouge",
  plantDefId: "currant",
  shopId: "pepiniere-locale",
  category: "fruit-tree" as const,
  name: "Groseillier Rouge",
  emoji: "🍎",
  packetImage: "/plantules/plantule-groseillier.png",
  cardImage: "/plantules/plantule-groseillier.png",
  stages: [
    "/plants/currant-stage-1.png",
    "/plants/currant-stage-2.png",
    "/plants/currant-stage-3.png",
    "/plants/currant-stage-4.png",
    "/plants/currant-stage-5.png",
  ],
  price: 120,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: ["02", "03"] },
    harvest: ["06", "07"],
    cycleDays: 365,
  },
  conditions: {
    temperature: { base: 5, optimal: [10, 20], max: 28, frostResistance: -20 },
    waterNeeds: "medium-high" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage régulier, sol toujours frais",
    soil: { ph: "6.0-7.5", type: "Riche, frais, bien drainé", compost: "Apport annuel" },
    light: { needs: 6, optimalLux: 25000 },
    growthRate: "Croissance buissonnante modérée",
    spacingCm: { between: 120, rows: 180 },
  },
  developmentStages: {
    germination: { days: 15, note: "Bouturage plus courant" },
    growth: { days: 30, note: "Développement buissonnant" },
    maturation: { days: 60, note: "Mise à fruits" },
    harvest: { days: 180, note: "Production soutenue" },
  },
  yield: {
    amount: "4-6kg/arbuste",
    fruitWeight: "2-4g",
    harvestPeriod: ["Juin", "Juillet"],
    conservation: "Frais 5-8 jours, congelable, confiture, gelée",
  },
  taste: "Petits fruits acidulés, idéals pour confiture et gelée",
  consumption: "Frais, confiture, gelée, jus, tarte",
  nutrition: { calories: "35 kcal/100g", vitaminC: "Très présente", fibers: "Modérée" },
  notes: "Arbuste local - Petits fruits acidulés, idéals pour confiture",
  companions: ["blackcurrant", "josta", "strawberry"],
  enemies: [],
  gameData: {
    stageDurations: [15, 30, 60, 180],
    realDaysToHarvest: 365,
    optimalTemp: [10, 20],
    waterNeed: 3.5,
    lightNeed: 6,
  },
};

export default CARD_DATA;