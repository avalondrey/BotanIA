/**
 * Olivier Cailletier — Les Pépinières Quissac
 * Olea europaea
 */

export const CARD_DATA = {
  id: "olivier-cailletier",
  plantDefId: "olive",
  shopId: "les-pepineres-quissac",
  category: "fruit-tree" as const,
  name: "Olivier Cailletier",
  emoji: "🫒",
  packetImage: "/plantules/plantule-cailletier.png",
  cardImage: "/plantules/plantule-cailletier.png",
  stages: [
    "/plants/olive-stage-1.png",
    "/plants/olive-stage-2.png",
    "/plants/olive-stage-3.png",
    "/plants/olive-stage-4.png",
    "/plants/olive-stage-5.png",
  ],
  price: 185,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: ["03", "04"] },
    harvest: ["10", "12"],
    cycleDays: 730,
  },
  conditions: {
    temperature: { base: 8, optimal: [8, 30], max: 40, frostResistance: -10 },
    waterNeeds: "low" as const,
    rainRequired: "25-35mm/semaine",
    irrigationNote: "Très tolérant à la sécheresse",
    soil: { ph: "6.0-8.5", type: "Calcaire, bien drainé, sec en été", compost: "Aucun" },
    light: { needs: 8, optimalLux: 45000 },
    growthRate: "Croissance lente mais continue",
    spacingCm: { between: 400, rows: 500 },
  },
  developmentStages: {
    germination: { days: 30, note: "Levée très lente" },
    growth: { days: 60, note: "Croissance initiale" },
    maturation: { days: 120, note: "Établissement" },
    harvest: { days: 365, note: "Premiers fruits après 3-5 ans" },
  },
  yield: {
    amount: "20-40kg/arbre",
    fruitWeight: "2-4g",
    harvestPeriod: ["Octobre", "Décembre"],
    conservation: "En saumure, huile, conservé",
  },
  taste: "Olives de table et huile, saveur méditerranéenne",
  consumption: "Huile, olives de table, cuisson",
  nutrition: { calories: "135 kcal/100g (huile)", vitaminC: "Présente", fats: "Lipides sains" },
  notes: "Olea europaea - Variété niçoise, olives de table et huile, rustique en Méditerranée",
  companions: ["lavender", "rosemary"],
  enemies: [],
  gameData: {
    stageDurations: [30, 60, 120, 365],
    realDaysToHarvest: 730,
    optimalTemp: [8, 30],
    waterNeed: 3.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;