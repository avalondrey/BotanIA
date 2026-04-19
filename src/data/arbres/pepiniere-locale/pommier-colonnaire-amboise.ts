/**
 * Pommier Colonnaire Amboise® — Pépinière locale
 * Malus domestica
 */

export const CARD_DATA = {
  id: "pommier-colonnaire-amboise",
  plantDefId: "apple-colonnaire-amboise",
  shopId: "pepiniere-locale",
  category: "fruit-tree" as const,
  name: "Pommier Colonnaire Amboise®",
  emoji: "🍎",
  packetImage: "/packets/pepiniere-locale/packet-pommier-colonnaire-amboise.png",
  cardImage: "/cards/seeds/pepiniere-locale/pommier-colonnaire-amboise.png",
  stages: [
    "/plants/apple-colonnaire-amboise-stage-1.png",
    "/plants/apple-colonnaire-amboise-stage-2.png",
    "/plants/apple-colonnaire-amboise-stage-3.png",
    "/plants/apple-colonnaire-amboise-stage-4.png",
    "/plants/apple-colonnaire-amboise-stage-5.png",
  ],
  price: 1945,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: null },
    harvest: ["09", "10"],
    planting: ["11", "12", "01", "02", "03"],
    dormancy: ["12", "01"],
    cycleDays: 0,
  },
  conditions: {
    temperature: { base: 7, optimal: [10, 25], max: 35, frostResistance: -25 },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage régulier les premières années",
    soil: { ph: "6.0-7.5", type: "Profond, frais, bien drainé", compost: "Apport à la plantation" },
    light: { needs: 7, optimalLux: 35000 },
    growthRate: "Port colonnaire compact, croissance modérée",
    spacingCm: { between: 80, rows: 150 },
  },
  developmentStages: {
    germination: { days: 0, note: "Greffe sur porte-greffe colonnaire" },
    growth: { days: 90, note: "Développement du tronc" },
    maturation: { days: 180, note: "Mise à fruits" },
    harvest: { days: 0, note: "Production dès la 2ème année" },
  },
  yield: {
    amount: "5-10kg/arbre",
    fruitWeight: "150-200g",
    harvestPeriod: ["Septembre", "Octobre"],
    conservation: "2-3 mois en cave fraîche",
  },
  taste: "Chair juteuse et parfumée",
  consumption: "Frais, jus, tarte, compote",
  nutrition: { calories: "52 kcal/100g", vitaminC: "Présente", fibers: "Modérée" },
  notes: "Pommier colonnaire Amboise® - Port très étroit, idéal balcon et petit jardin. Autofertile.",
  companions: ["chive", "nasturtium", "lavender"],
  enemies: ["cabbage", "walnut"],
  gameData: {
    stageDurations: [30, 60, 90, 120],
    realDaysToHarvest: 300,
    optimalTemp: [10, 25],
    waterNeed: 4.0,
    lightNeed: 7,
  },
};

export default CARD_DATA;