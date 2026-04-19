/**
 * Casselier Josta — Les Pépinières Quissac
 * Ribes x nidigrolaria
 */

export const CARD_DATA = {
  id: "josta-casselier",
  plantDefId: "josta",
  shopId: "les-pepineres-quissac",
  category: "vegetable" as const,
  name: "Casselier Josta",
  emoji: "🫐",
  packetImage: "/plantules/plantule-josta.png",
  cardImage: "/plantules/plantule-josta.png",
  stages: [
    "/plants/josta-stage-1.png",
    "/plants/josta-stage-2.png",
    "/plants/josta-stage-3.png",
    "/plants/josta-stage-4.png",
    "/plants/josta-stage-5.png",
  ],
  price: 95,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: ["02", "03"] },
    harvest: ["07", "08"],
    cycleDays: 112,
  },
  conditions: {
    temperature: { base: 5, optimal: [10, 25], max: 32, frostResistance: -20 },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage régulier, sol frais",
    soil: { ph: "6.0-7.5", type: "Riche, frais, bien drainé", compost: "Apport annuel" },
    light: { needs: 6, optimalLux: 30000 },
    growthRate: "Croissance vigoureuse",
    spacingCm: { between: 150, rows: 200 },
  },
  developmentStages: {
    germination: { days: 10, note: "Bouturage plus courant" },
    growth: { days: 22, note: "Développement buissonnant" },
    maturation: { days: 30, note: "Premiers fruits" },
    harvest: { days: 50, note: "Production soutenue" },
  },
  yield: {
    amount: "4-6kg/arbuste",
    fruitWeight: "3-4g",
    harvestPeriod: ["Juillet", "Août"],
    conservation: "Frais 5-7 jours, congelable, confiture",
  },
  taste: "Gros fruits noirs, saveur unique, légèrement sucré",
  consumption: "Frais, confiture, jus, vin",
  nutrition: { calories: "38 kcal/100g", vitaminC: "Très présente", fibers: "Élevée" },
  notes: "Ribes x nidigrolaria - Hybride groseille-cassis, gros fruits noirs, saveur unique",
  companions: ["blackcurrant", "currant"],
  enemies: [],
  gameData: {
    stageDurations: [10, 22, 30, 50],
    realDaysToHarvest: 112,
    optimalTemp: [10, 25],
    waterNeed: 4.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;