// ═══════════════════════════════════════════════════
//  Lunar Calendar — Calendar based on real moon phases
//  Source: Astronomical calculations (synodic month ≈ 29.53 days)
// ═══════════════════════════════════════════════════

export interface LunarPhase {
  name: string;       // "Nouvelle Lune", "Premier Croissant", etc.
  emoji: string;      // 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘
  gardeningAdvice: string;
  isGoodForPlanting: boolean;   // Generally favorable
  isGoodForRootHarvest: boolean;
  isGoodForLeafHarvest: boolean;
  isGoodForPruning: boolean;
  isGoodForSoilWork: boolean;
  moonAge: number;    // Days since last new moon (0-29.53)
  illumination: number; // 0-100%
  zodiacSign: string; // Current zodiac sign
  zodiacElement: string; // Earth, Water, Air, Fire
}

const ZODIAC_SIGNS = [
  { name: "Bélier", element: "Fire", symbol: "♈" },
  { name: "Taureau", element: "Earth", symbol: "♉" },
  { name: "Gémeaux", element: "Air", symbol: "♊" },
  { name: "Cancer", element: "Water", symbol: "♋" },
  { name: "Lion", element: "Fire", symbol: "♌" },
  { name: "Vierge", element: "Earth", symbol: "♍" },
  { name: "Balance", element: "Air", symbol: "♎" },
  { name: "Scorpion", element: "Water", symbol: "♏" },
  { name: "Sagittaire", element: "Fire", symbol: "♐" },
  { name: "Capricorne", element: "Earth", symbol: "♑" },
  { name: "Verseau", element: "Air", symbol: "♒" },
  { name: "Poissons", element: "Water", symbol: "♓" },
];

const LUNAR_PHASE_DATA: Record<number, { name: string; emoji: string; gardeningAdvice: string; isGoodForPlanting: boolean; isGoodForRootHarvest: boolean; isGoodForLeafHarvest: boolean; isGoodForPruning: boolean; isGoodForSoilWork: boolean }> = {
  0: { name: "Nouvelle Lune", emoji: "🌑", gardeningAdvice: "Repos du jardin. Planification et lecture.", isGoodForPlanting: false, isGoodForRootHarvest: false, isGoodForLeafHarvest: false, isGoodForPruning: false, isGoodForSoilWork: true },
  1: { name: "Premier Croissant", emoji: "🌒", gardeningAdvice: "Semez les plantes à feuilles (laitue, épinard).", isGoodForPlanting: true, isGoodForRootHarvest: false, isGoodForLeafHarvest: true, isGoodForPruning: false, isGoodForSoilWork: true },
  2: { name: "Premier Croissant", emoji: "🌒", gardeningAdvice: "Poursuivez les semis de feuilles.", isGoodForPlanting: true, isGoodForRootHarvest: false, isGoodForLeafHarvest: true, isGoodForPruning: false, isGoodForSoilWork: true },
  3: { name: "Premier Croissant", emoji: "🌒", gardeningAdvice: "Semez les légumes-feuille.", isGoodForPlanting: true, isGoodForRootHarvest: false, isGoodForLeafHarvest: true, isGoodForPruning: false, isGoodForSoilWork: true },
  4: { name: "Premier Quartier", emoji: "🌓", gardeningAdvice: "Taille légère acceptable. Observation.", isGoodForPlanting: true, isGoodForRootHarvest: false, isGoodForLeafHarvest: true, isGoodForPruning: true, isGoodForSoilWork: false },
  5: { name: "Gibbeuse Croissante", emoji: "🌔", gardeningAdvice: "Lune croissante - bonne pour les fruits.", isGoodForPlanting: true, isGoodForRootHarvest: false, isGoodForLeafHarvest: false, isGoodForPruning: true, isGoodForSoilWork: false },
  6: { name: "Gibbeuse Croissante", emoji: "🌔", gardeningAdvice: "Semez tomates, poivrons, haricots.", isGoodForPlanting: true, isGoodForRootHarvest: false, isGoodForLeafHarvest: false, isGoodForPruning: true, isGoodForSoilWork: false },
  7: { name: "Gibbeuse Croissante", emoji: "🌔", gardeningAdvice: "Poursuivez les semis de fruits et légumes.", isGoodForPlanting: true, isGoodForRootHarvest: false, isGoodForLeafHarvest: false, isGoodForPruning: true, isGoodForSoilWork: false },
  8: { name: "Pleine Lune", emoji: "🌕", gardeningAdvice: "Récolte des racines (carottes, pommes de terre).", isGoodForPlanting: false, isGoodForRootHarvest: true, isGoodForLeafHarvest: false, isGoodForPruning: false, isGoodForSoilWork: true },
  9: { name: "Gibbeuse Décroissante", emoji: "🌖", gardeningAdvice: " transplantations réussissent bien.", isGoodForPlanting: true, isGoodForRootHarvest: true, isGoodForLeafHarvest: false, isGoodForPruning: true, isGoodForSoilWork: true },
  10: { name: "Gibbeuse Décroissante", emoji: "🌖", gardeningAdvice: "Culbenisation et compostage.", isGoodForPlanting: false, isGoodForRootHarvest: true, isGoodForLeafHarvest: false, isGoodForPruning: true, isGoodForSoilWork: true },
  11: { name: "Gibbeuse Décroissante", emoji: "🌖", gardeningAdvice: "Récolte et conservation.", isGoodForPlanting: false, isGoodForRootHarvest: true, isGoodForLeafHarvest: false, isGoodForPruning: true, isGoodForSoilWork: true },
  12: { name: "Dernier Quartier", emoji: "🌗", gardeningAdvice: "Évitez de semer. Entretien du sol.", isGoodForPlanting: false, isGoodForRootHarvest: false, isGoodForLeafHarvest: true, isGoodForPruning: true, isGoodForSoilWork: true },
  13: { name: "Dernier Croissant", emoji: "🌘", gardeningAdvice: "Désherbage et paillage.", isGoodForPlanting: false, isGoodForRootHarvest: false, isGoodForLeafHarvest: true, isGoodForPruning: false, isGoodForSoilWork: true },
  14: { name: "Dernier Croissant", emoji: "🌘", gardeningAdvice: "Récolte des légumes-racines.", isGoodForPlanting: false, isGoodForRootHarvest: true, isGoodForLeafHarvest: true, isGoodForPruning: false, isGoodForSoilWork: true },
  15: { name: "Dernier Croissant", emoji: "🌘", gardeningAdvice: "Poursuivez les récoltes.", isGoodForPlanting: false, isGoodForRootHarvest: true, isGoodForLeafHarvest: true, isGoodForPruning: false, isGoodForSoilWork: true },
};

// Synodic month duration in days
const SYNODIC_MONTH = 29.53058867;

// Reference: Known new moon date (Jan 6, 2000 at 18:14 UTC)
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z").getTime();

/**
 * Calculate moon age for a given date
 * @param date Date to calculate for
 * @returns Moon age in days (0 to ~29.53)
 */
export function getMoonAge(date: Date = new Date()): number {
  const now = date.getTime();
  const daysSinceNewMoon = (now - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  return daysSinceNewMoon % SYNODIC_MONTH;
}

/**
 * Get moon illumination percentage
 * @param moonAge Days since new moon
 * @returns Illumination 0-100%
 */
export function getMoonIllumination(moonAge: number): number {
  // illumination follows a cosine curve
  const phase = (moonAge / SYNODIC_MONTH) * 2 * Math.PI;
  return Math.round((1 - Math.cos(phase)) / 2 * 100);
}

/**
 * Get zodiac sign for a given date
 * Uses tropical zodiac calculation
 */
export function getZodiacSign(date: Date = new Date()): { name: string; element: string; symbol: string } {
  const year = date.getFullYear();
  // Approximate zodiac calculation
  // Spring equinox is around March 20
  const startOfYear = new Date(year, 0, 1).getTime();
  const now = date.getTime();
  const daysSinceStart = (now - startOfYear) / (1000 * 60 * 60 * 24);

  // Each sign is roughly 30.4 days (365/12)
  const dayOfZodiac = (daysSinceStart + 9) % 365; // Offset for Jan 1 being in Capricorn
  const signIndex = Math.floor(dayOfZodiac / 30.4) % 12;

  return ZODIAC_SIGNS[signIndex];
}

/**
 * Get lunar phase for a given date with full gardening info
 */
export function getLunarPhase(date: Date = new Date()): LunarPhase {
  const moonAge = getMoonAge(date);
  const phaseIndex = Math.floor(moonAge);
  const phaseData = LUNAR_PHASE_DATA[phaseIndex] || LUNAR_PHASE_DATA[0];
  const zodiac = getZodiacSign(date);

  return {
    ...phaseData,
    moonAge,
    illumination: getMoonIllumination(moonAge),
    zodiacSign: zodiac.name,
    zodiacElement: zodiac.element,
  };
}

/**
 * Check if today is a "node zodiac" (traditionally unfavorable)
 * Moon in Dragon's Head (Noeud Lunaire) - simplified approximation
 */
export function isLunarNodeDay(date: Date = new Date()): boolean {
  const moonAge = getMoonAge(date);
  // Approximate: around 0 and 14 days (new and full moon adjacency)
  const mod = moonAge % SYNODIC_MONTH;
  return Math.abs(mod - 0) < 0.5 || Math.abs(mod - 14.7) < 0.5;
}

/**
 * Get next favorable gardening days within the next N days
 */
export function getNextFavorableDays(days: number = 7): { date: Date; phase: LunarPhase }[] {
  const results: { date: Date; phase: LunarPhase }[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const phase = getLunarPhase(checkDate);

    if (phase.isGoodForPlanting || phase.isGoodForSoilWork) {
      results.push({ date: checkDate, phase });
    }
  }

  return results;
}

/**
 * Format lunar date for display
 */
export function formatLunarDate(date: Date = new Date()): string {
  const phase = getLunarPhase(date);
  return `${phase.emoji} ${phase.name} — ${phase.moonAge.toFixed(1)}j (${phase.illumination}%) — ${phase.zodiacSign} ${getZodiacSign(date).symbol}`;
}

/**
 * Get gardening recommendation for a specific plant type
 */
export function getPlantingRecommendation(plantType: 'leaf' | 'root' | 'fruit' | 'flower'): string {
  const phase = getLunarPhase();

  switch (plantType) {
    case 'leaf':
      return phase.isGoodForLeafHarvest
        ? `✓ Récolte favorable aujourd'hui (${phase.emoji} ${phase.name})`
        : `○ Aujourd'hui: ${phase.gardeningAdvice}`;
    case 'root':
      return phase.isGoodForRootHarvest
        ? `✓ Récolte des racines favorable (${phase.emoji} ${phase.name})`
        : `○ Aujourd'hui: ${phase.gardeningAdvice}`;
    case 'fruit':
      return phase.isGoodForPlanting
        ? `✓ Semis de fruits favorable (${phase.emoji} ${phase.name})`
        : `○ Aujourd'hui: ${phase.gardeningAdvice}`;
    case 'flower':
      return phase.isGoodForPlanting
        ? `✓ Semis de fleurs favorable (${phase.emoji} ${phase.name})`
        : `○ Aujourd'hui: ${phase.gardeningAdvice}`;
    default:
      return phase.gardeningAdvice;
  }
}
