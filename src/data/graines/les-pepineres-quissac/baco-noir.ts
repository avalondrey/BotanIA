/**
 * Baco Noir — Les Pépinières Quissac
 * Vitis labrusca
 */

export const CARD_DATA = {
  id: "baco-noir",
  plantDefId: "baco-noir",
  shopId: "les-pepineres-quissac",
  category: "vegetable" as const,
  name: "Baco Noir",
  emoji: "🍇",
  packetImage: "/plantules/plantule-baco-noir.png",
  cardImage: "/plantules/plantule-baco-noir.png",
  stages: [
    "/plants/baco-noir-stage-1.png",
    "/plants/baco-noir-stage-2.png",
    "/plants/baco-noir-stage-3.png",
    "/plants/baco-noir-stage-4.png",
    "/plants/baco-noir-stage-5.png",
  ],
  price: 130,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: ["01", "02"], outdoor: ["03", "04"] },
    harvest: ["09", "10"],
    cycleDays: 184,
  },
  conditions: {
    temperature: { base: 10, optimal: [12, 28], max: 35, frostResistance: -15 },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage régulier en période sèche",
    soil: { ph: "6.0-7.0", type: "Léger, drainé, riche", compost: "Apport modéré" },
    light: { needs: 8, optimalLux: 40000 },
    growthRate: "Croissance rapide",
    spacingCm: { between: 150, rows: 200 },
  },
  developmentStages: {
    germination: { days: 14, note: "Semis ou bouturage" },
    growth: { days: 30, note: "Développement vigoureux" },
    maturation: { days: 50, note: "Floraison et nouaison" },
    harvest: { days: 90, note: "Maturité des raisins" },
  },
  yield: {
    amount: "5-10kg/plant",
    fruitWeight: "2-4g",
    harvestPeriod: ["Septembre", "Octobre"],
    conservation: "Frais 2-3 semaines",
  },
  taste: "Raisin noir rustique, saveur foxée caractéristique",
  consumption: "Vin, jus, frais",
  nutrition: { calories: "65 kcal/100g", vitaminC: "Présente", antioxidants: "Élevés" },
  notes: "Vitis labrusca - Vigne interdite hybride, raisin noir rustique, résistant aux maladies",
  companions: ["corn", "bean"],
  enemies: ["cabbage"],
  gameData: {
    stageDurations: [14, 30, 50, 90],
    realDaysToHarvest: 184,
    optimalTemp: [12, 28],
    waterNeed: 4.0,
    lightNeed: 8,
  },
};

export default CARD_DATA;