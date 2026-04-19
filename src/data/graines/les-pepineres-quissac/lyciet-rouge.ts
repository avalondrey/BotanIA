/**
 * Lyciet Rouge — Les Pépinières Quissac
 * Lycium ruthenicum
 */

export const CARD_DATA = {
  id: "lyciet-rouge",
  plantDefId: "lycium",
  shopId: "les-pepineres-quissac",
  category: "vegetable" as const,
  name: "Lyciet Rouge",
  emoji: "🍇",
  packetImage: "/plantules/plantule-lyciet.png",
  cardImage: "/plantules/plantule-lyciet.png",
  stages: [
    "/plants/lycium-stage-1.png",
    "/plants/lycium-stage-2.png",
    "/plants/lycium-stage-3.png",
    "/plants/lycium-stage-4.png",
    "/plants/lycium-stage-5.png",
  ],
  price: 110,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: ["03", "04"] },
    harvest: ["08", "10"],
    cycleDays: 96,
  },
  conditions: {
    temperature: { base: 6, optimal: [12, 30], max: 38, frostResistance: -25 },
    waterNeeds: "low" as const,
    rainRequired: "20-30mm/semaine",
    irrigationNote: "Très tolérant à la sécheresse une fois établi",
    soil: { ph: "6.5-9.0", type: "Tous types, préfère sableux", compost: "Aucun" },
    light: { needs: 6, optimalLux: 40000 },
    growthRate: "Croissance lente mais vigoureuse",
    spacingCm: { between: 150, rows: 200 },
  },
  developmentStages: {
    germination: { days: 8, note: "Levée lente" },
    growth: { days: 22, note: "Développement modéré" },
    maturation: { days: 26, note: "Floraison" },
    harvest: { days: 40, note: "Baies violettes" },
  },
  yield: {
    amount: "1-2kg/plant",
    fruitWeight: "1-1.5g",
    harvestPeriod: ["Août", "Octobre"],
    conservation: "Frais 5-7 jours, congelable",
  },
  taste: "Petites baies violettes, légèrement sucré-acidulé",
  consumption: "Frais, séché, smoothie, vin",
  nutrition: { calories: "30 kcal/100g", vitaminC: "Très présente", antioxidants: "Élevés" },
  notes: "Lycium ruthenicum - Petites baies violettes, très résistant au froid (-25°C)",
  companions: ["goji"],
  enemies: [],
  gameData: {
    stageDurations: [8, 22, 26, 40],
    realDaysToHarvest: 96,
    optimalTemp: [12, 30],
    waterNeed: 3.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;