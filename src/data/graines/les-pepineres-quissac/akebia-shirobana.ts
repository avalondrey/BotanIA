/**
 * Akebia Shirobana — Les Pépinières Quissac
 * Akebia quinata
 */

export const CARD_DATA = {
  id: "akebia-shirobana",
  plantDefId: "akebia",
  shopId: "les-pepineres-quissac",
  category: "vegetable" as const,
  name: "Akebia Shirobana",
  emoji: "🌸",
  packetImage: "/plantules/plantule-akebia-shirobana.png",
  cardImage: "/plantules/plantule-akebia-shirobana.png",
  stages: [
    "/plants/akebia-stage-1.png",
    "/plants/akebia-stage-2.png",
    "/plants/akebia-stage-3.png",
    "/plants/akebia-stage-4.png",
    "/plants/akebia-stage-5.png",
  ],
  price: 115,
  gramsPerPacket: 0,
  period: {
    sowing: { indoor: ["02", "03"], outdoor: ["04", "05"] },
    harvest: ["09", "10"],
    cycleDays: 142,
  },
  conditions: {
    temperature: { base: 10, optimal: [10, 28], max: 32, frostResistance: -15 },
    waterNeeds: "medium" as const,
    rainRequired: "35-45mm/semaine",
    irrigationNote: "Arrosage régulier, sol toujours frais",
    soil: { ph: "5.5-7.0", type: "Riche, bien drainé, frais", compost: "Apport modéré" },
    light: { needs: 6, optimalLux: 25000 },
    growthRate: "Croissance rapide, liane vigoureuse",
    spacingCm: { between: 200, rows: 250 },
  },
  developmentStages: {
    germination: { days: 14, note: "Levée lente et irréguliée" },
    growth: { days: 28, note: "Croissance rapide du feuillage" },
    maturation: { days: 40, note: "Floraison printanière" },
    harvest: { days: 60, note: "Fruits comestibles maturité" },
  },
  yield: {
    amount: "Variable",
    fruitWeight: "20-30g",
    harvestPeriod: ["Septembre", "Octobre"],
    conservation: "Frais 3-5 jours",
  },
  taste: "Chair douceähnlich coco-cacao, saveur originale",
  consumption: "Frais, desserts,ukinoki",
  nutrition: { calories: "40 kcal/100g", vitaminC: "Présente", fibers: "Modérée" },
  notes: "Vigne chocolat à fleurs blanches, liane ornementale, fruits comestibles",
  companions: ["corn", "bean"],
  enemies: [],
  gameData: {
    stageDurations: [14, 28, 40, 60],
    realDaysToHarvest: 142,
    optimalTemp: [10, 28],
    waterNeed: 3.5,
    lightNeed: 6,
  },
};

export default CARD_DATA;