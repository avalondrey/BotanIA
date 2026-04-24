/**
 * Arbousier Rubra — Les Pépinières Quissac
 * Arbutus unedo Rubra
 */

export const CARD_DATA = {
  id: "arbousier-rubra",
  plantDefId: "arbousier",
  shopId: "les-pepineres-quissac",
  category: "fruit-tree" as const,
  name: "Arbousier Rubra",
  emoji: "🌸",
  packetImage: "/plantules/plantule-arbousier-rubra.png",
  cardImage: "/plantules/plantule-arbousier-rubra.png",
  stages: [
    "/plants/custom-plant-stage-1.png",
    "/plants/custom-plant-stage-2.png",
    "/plants/custom-plant-stage-3.png",
    "/plants/custom-plant-stage-4.png",
    "/plants/custom-plant-stage-5.png",
  ],
  price: 120,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: ["02", "03"], outdoor: ["04", "05"] },
    harvest: ["10", "12"],
    cycleDays: 174,
  },
  conditions: {
    temperature: { base: 8, optimal: [8, 28], max: 38, frostResistance: -10 },
    waterNeeds: "low" as const,
    rainRequired: "25-35mm/semaine",
    irrigationNote: "Tolère sécheresses modérées une fois établi",
    soil: { ph: "5.0-7.0", type: "Acide, bien drainé, sableux", compost: "Aucun" },
    light: { needs: 7, optimalLux: 35000 },
    growthRate: "Croissance lente",
    spacingCm: { between: 300, rows: 400 },
  },
  developmentStages: {
    germination: { days: 14, note: "Levée lente et irréguliée" },
    growth: { days: 30, note: "Croissance initiale" },
    maturation: { days: 50, note: "Établissement" },
    harvest: { days: 80, note: "Fruits 12 mois après semis" },
  },
  yield: {
    amount: "5-10kg/arbre",
    fruitWeight: "15-25g",
    harvestPeriod: ["Octobre", "Décembre"],
    conservation: "Frais 5-7 jours, confiture, liqueur",
  },
  taste: "Chair farineuse, saveur douce et sucrée",
  consumption: "Frais, confiture, liqueur, pâtisserie",
  nutrition: { calories: "40 kcal/100g", vitaminC: "Très présente", fibers: "Modérée" },
  notes: "Arbutus unedo Rubra - Fleurs roses, fruits rouges comestibles, persistant méditerranéen",
  companions: ["lavender", "rosemary"],
  enemies: [],
  gameData: {
    stageDurations: [14, 30, 50, 80],
    realDaysToHarvest: 174,
    optimalTemp: [8, 28],
    waterNeed: 3.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;