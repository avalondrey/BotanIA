/**
 * Cassis Blanc Ojeblanc — Les Pépinières Quissac
 * Ribes nigrum
 */

export const CARD_DATA = {
  id: "cassis-blanc-ojeblanc",
  plantDefId: "blackcurrant",
  shopId: "les-pepineres-quissac",
  category: "fruit-tree" as const,
  name: "Cassis Blanc Ojeblanc",
  emoji: "🍇",
  packetImage: "/packets/les-pepineres-quissac/packet-cassis-blanc-ojeblanc.png",
  cardImage: "/cards/seeds/les-pepineres-quissac/cassis-blanc-ojeblanc.png",
  potImage: "/pots/les-pepineres-quissac/pot-cassis-blanc-ojeblanc.png",
  stages: [
    "/trees/les-pepineres-quissac/cassis-blanc-ojeblanc-stage-1.png",
    "/trees/les-pepineres-quissac/cassis-blanc-ojeblanc-stage-2.png",
    "/trees/les-pepineres-quissac/cassis-blanc-ojeblanc-stage-3.png",
    "/trees/les-pepineres-quissac/cassis-blanc-ojeblanc-stage-4.png",
    "/trees/les-pepineres-quissac/cassis-blanc-ojeblanc-stage-5.png",
  ],
  price: 90,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: ["02", "03"] },
    harvest: ["06", "07"],
    cycleDays: 117,
  },
  conditions: {
    temperature: { base: 5, optimal: [10, 22], max: 30, frostResistance: -25 },
    waterNeeds: "medium-high" as const,
    rainRequired: "45-55mm/semaine",
    irrigationNote: "Arrosage généreux, sol toujours frais",
    soil: { ph: "6.0-7.5", type: "Riche, frais, profond", compost: "Apport annuel" },
    light: { needs: 6, optimalLux: 25000 },
    growthRate: "Croissance buissonnante",
    spacingCm: { between: 120, rows: 180 },
  },
  developmentStages: {
    germination: { days: 10, note: "Bouturage plus courant" },
    growth: { days: 22, note: "Développement buissonnant" },
    maturation: { days: 30, note: "Floraison" },
    harvest: { days: 55, note: "Baies maturité" },
  },
  yield: {
    amount: "3-5kg/arbuste",
    fruitWeight: "3-5g",
    harvestPeriod: ["Juin", "Juillet"],
    conservation: "Frais 5-7 jours, congelable, confiture, jus",
  },
  taste: "Baies jaune pâle douces et parfumées, moins acidulé que cassis noir",
  consumption: "Frais, jus, confiture, gelée, liqueur",
  nutrition: { calories: "33 kcal/100g", vitaminC: "Très présente", fibers: "Élevée" },
  notes: "Ribes nigrum - Cassis blanc, baies jaune pâle douces et parfumées, rare et original",
  companions: ["currant", "josta", "strawberry"],
  enemies: [],
  gameData: {
    stageDurations: [10, 22, 30, 55],
    realDaysToHarvest: 117,
    optimalTemp: [10, 22],
    waterNeed: 4.0,
    lightNeed: 6,
  },
};

export default CARD_DATA;