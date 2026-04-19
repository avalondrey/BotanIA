/**
 * Goji Amber Sweet — Les Pépinières Quissac
 * Lycium barbarum
 */

export const CARD_DATA = {
  id: "goji-amber-sweet",
  plantDefId: "goji",
  shopId: "les-pepineres-quissac",
  category: "vegetable" as const,
  name: "Goji 'Amber Sweet'",
  emoji: "🍒",
  packetImage: "/plantules/plantule-goji.png",
  cardImage: "/plantules/plantule-goji.png",
  stages: [
    "/plants/goji-stage-1.png",
    "/plants/goji-stage-2.png",
    "/plants/goji-stage-3.png",
    "/plants/goji-stage-4.png",
    "/plants/goji-stage-5.png",
  ],
  price: 120,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: ["03", "04"] },
    harvest: ["07", "09"],
    cycleDays: 109,
  },
  conditions: {
    temperature: { base: 8, optimal: [15, 28], max: 35, frostResistance: -15 },
    waterNeeds: "medium" as const,
    rainRequired: "30-40mm/semaine",
    irrigationNote: "Arrosage modéré, tolère sécheresses modérées",
    soil: { ph: "6.0-8.0", type: "Sol bien drainé, tous types", compost: "Léger apport" },
    light: { needs: 7, optimalLux: 35000 },
    growthRate: "Croissance rapide une fois établi",
    spacingCm: { between: 150, rows: 200 },
  },
  developmentStages: {
    germination: { days: 10, note: "Levée lente et irréguliée" },
    growth: { days: 24, note: "Développement vigoureux" },
    maturation: { days: 30, note: "Premiers fruits" },
    harvest: { days: 45, note: "Production continue" },
  },
  yield: {
    amount: "2-4kg/plant",
    fruitWeight: "1-2g",
    harvestPeriod: ["Juillet", "Septembre"],
    conservation: "Frais 3-5 jours, congelable",
  },
  taste: "Baies dorées douces et sucrées, sans amertume",
  consumption: "Frais, smoothie, séchées, tisanes",
  nutrition: { calories: "35 kcal/100g", vitaminC: "Très présente", fibers: "Élevée" },
  notes: "Lycium Barbarum Amber Sweet - Baies dorées, douces et sans amertume. Plante vivace",
  companions: ["lycium", "basil"],
  enemies: ["fennel"],
  gameData: {
    stageDurations: [10, 24, 30, 45],
    realDaysToHarvest: 109,
    optimalTemp: [15, 28],
    waterNeed: 3.5,
    lightNeed: 7,
  },
};

export default CARD_DATA;