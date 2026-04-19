/**
 * Prunier Colonnaire Atlanta® — Pépinière locale
 * Prunus domestica
 */

export const CARD_DATA = {
  id: "prunier-colonnaire-atlanta",
  plantDefId: "plum-colonnaire-atlanta",
  shopId: "pepiniere-locale",
  category: "fruit-tree" as const,
  name: "Prunier Colonnaire Atlanta®",
  emoji: "🫐",
  packetImage: "/packets/pepiniere-locale/packet-prunier-colonnaire-atlanta.png",
  cardImage: "/cards/seeds/pepiniere-locale/prunier-colonnaire-atlanta.png",
  stages: [
    "/plants/plum-colonnaire-atlanta-stage-1.png",
    "/plants/plum-colonnaire-atlanta-stage-2.png",
    "/plants/plum-colonnaire-atlanta-stage-3.png",
    "/plants/plum-colonnaire-atlanta-stage-4.png",
    "/plants/plum-colonnaire-atlanta-stage-5.png",
  ],
  price: 9290,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: null, outdoor: null },
    harvest: ["08", "09"],
    planting: ["11", "12", "01", "02", "03"],
    dormancy: ["12", "01"],
    cycleDays: 0,
  },
  conditions: {
    temperature: { base: 8, optimal: [12, 28], max: 35, frostResistance: -20 },
    waterNeeds: "medium" as const,
    rainRequired: "40-50mm/semaine",
    irrigationNote: "Arrosage régulier en période sèche",
    soil: { ph: "6.0-7.5", type: "Profond, frais, bien drainé", compost: "Apport modéré" },
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
    amount: "8-15kg/arbre",
    fruitWeight: "40-60g",
    harvestPeriod: ["Août", "Septembre"],
    conservation: "1-2 semaines au frais",
  },
  taste: "Chair ferme et sucrée",
  consumption: "Frais, confiture, tarte, pruneau",
  nutrition: { calories: "46 kcal/100g", vitaminC: "Présente", fibers: "Élevée" },
  notes: "Prunier colonnaire Atlanta® - Port très étroit, idéal petit jardin. Partiellement autofertile.",
  companions: ["lavender", "rose", "chive"],
  enemies: ["cabbage", "potato"],
  gameData: {
    stageDurations: [30, 60, 90, 120],
    realDaysToHarvest: 330,
    optimalTemp: [12, 28],
    waterNeed: 3.5,
    lightNeed: 7,
  },
};

export default CARD_DATA;