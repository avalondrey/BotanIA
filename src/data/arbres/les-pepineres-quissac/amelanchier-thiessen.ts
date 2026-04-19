/**
 * Amelanchier Thiessen — Les Pépinières Quissac
 * Amelanchier alnifolia
 */

export const CARD_DATA = {
  id: "amelanchier-thiessen",
  plantDefId: "amelanchier",
  shopId: "les-pepineres-quissac",
  category: "fruit-tree" as const,
  name: "Amelanchier Thiessen",
  emoji: "🫐",
  packetImage: "/plantules/plantule-amelanchier.png",
  cardImage: "/plantules/plantule-amelanchier.png",
  stages: [
    "/plants/amelanchier-stage-1.png",
    "/plants/amelanchier-stage-2.png",
    "/plants/amelanchier-stage-3.png",
    "/plants/amelanchier-stage-4.png",
    "/plants/amelanchier-stage-5.png",
  ],
  price: 110,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: ["01", "02"], outdoor: ["03", "04"] },
    harvest: ["06", "07"],
    cycleDays: 147,
  },
  conditions: {
    temperature: { base: 5, optimal: [5, 25], max: 35, frostResistance: -40 },
    waterNeeds: "medium" as const,
    rainRequired: "35-45mm/semaine",
    irrigationNote: "Arrosage régulier en période sèche",
    soil: { ph: "5.5-7.0", type: "Acide à neutre, frais, bien drainé", compost: "Léger" },
    light: { needs: 7, optimalLux: 30000 },
    growthRate: "Croissance modérée",
    spacingCm: { between: 200, rows: 250 },
  },
  developmentStages: {
    germination: { days: 12, note: "Levée lente" },
    growth: { days: 25, note: "Développement buissonnant" },
    maturation: { days: 40, note: "Floraison printanière" },
    harvest: { days: 70, note: "Baies maturité" },
  },
  yield: {
    amount: "3-5kg/arbuste",
    fruitWeight: "3-5g",
    harvestPeriod: ["Juin", "Juillet"],
    conservation: "Frais 3-5 jours, congelable, confiture",
  },
  taste: "Gros fruits sucrés, saveur de myrtille avec note d'amande",
  consumption: "Frais, smoothie, confiture, tarte",
  nutrition: { calories: "35 kcal/100g", vitaminC: "Très présente", fibers: "Élevée" },
  notes: "Amelanchier alnifolia - Myrtille en arbre, gros fruits sucrés, rusticité -40°C",
  companions: ["strawberry", "blueberry"],
  enemies: [],
  gameData: {
    stageDurations: [12, 25, 40, 70],
    realDaysToHarvest: 147,
    optimalTemp: [5, 25],
    waterNeed: 3.5,
    lightNeed: 7,
  },
};

export default CARD_DATA;