// ═══════════════════════════════════════════════════════════
//  🌡️ Soil Temperature Model — Température du Sol
//  Le sol répond avec un délai de 4-5 jours aux changements d'air
//  Sources : INRAE, Soltempature Model (Parton 1984)
// ═══════════════════════════════════════════════════════════

// Constante de délai thermique sol/air — valeur empirique INRAE
const SOIL_THERMAL_INERTIA = 0.85; // 85% de persistance → ~6 jours de délai

/** Seuils de semis par culture (°C sol minimum) */
export const SOWING_SOIL_TEMP: Record<string, number> = {
  tomato:     12, // INRAE: ne semer que si T_sol > 12°C
  carrot:     7,
  lettuce:    5,
  strawberry: 8,
  basil:      14, // très sensible
  pepper:     14,
  bean:       12,
  pea:        5,
  corn:       10,
  cucumber:   12,
};

/**
 * Met à jour la température du sol après un jour.
 * Modèle simplifié : T_sol(j) = T_sol(j-1) × α + T_air(j) × (1-α)
 * Avec α = inertie thermique (0.85 → délai ~6j)
 */
export function updateSoilTemperature(
  prevSoilTemp: number,
  todayAirTemp: number,
  depth: 'surface' | '10cm' | '20cm' = '10cm'
): number {
  // Plus on va en profondeur, plus l'inertie est forte
  const inertia =
    depth === 'surface' ? 0.70 :
    depth === '10cm'    ? 0.85 :
                          0.92;
  const newTemp = prevSoilTemp * inertia + todayAirTemp * (1 - inertia);
  return Math.round(newTemp * 10) / 10;
}

/**
 * Estime la température sol initiale si pas d'historique.
 * Moyenne pondérée des 5 derniers jours d'air.
 */
export function estimateSoilTempFromHistory(airTempHistory: number[]): number {
  if (airTempHistory.length === 0) return 10;
  // Pondération décroissante : jour le plus récent = poids le plus faible (inertie)
  const weights = airTempHistory.map((_, i) => Math.pow(SOIL_THERMAL_INERTIA, airTempHistory.length - 1 - i));
  const total = weights.reduce((s, w) => s + w, 0);
  return airTempHistory.reduce((s, t, i) => s + t * weights[i], 0) / total;
}

/**
 * Conseils de semis selon température sol actuelle.
 */
export function getSowingAdvice(
  soilTemp: number,
  plantDefId: string
): { canSow: boolean; message: string; daysToWait?: number } {
  const threshold = SOWING_SOIL_TEMP[plantDefId] ?? 10;
  if (soilTemp >= threshold) {
    return {
      canSow: true,
      message: `Sol à ${soilTemp}°C ✅ — Conditions favorables pour semer (seuil : ${threshold}°C)`,
    };
  }
  // Estimation jours d'attente (sol chauffe ~0.5°C/jour en printemps)
  const delta = threshold - soilTemp;
  const daysToWait = Math.ceil(delta / 0.5);
  return {
    canSow: false,
    daysToWait,
    message: `Sol à ${soilTemp}°C ❌ — Seuil ${threshold}°C. Environ ${daysToWait} jours à attendre.`,
  };
}

/** Persistence localStorage */
const SOIL_TEMP_KEY = 'botania-soil-temp';

export interface SoilTempState {
  surface: number;
  depth10cm: number;
  depth20cm: number;
  airHistory: number[]; // 14 derniers jours
}

export function loadSoilTempState(): SoilTempState {
  if (typeof window === 'undefined') return defaultSoilState();
  try {
    const s = localStorage.getItem(SOIL_TEMP_KEY);
    if (s) return { ...defaultSoilState(), ...JSON.parse(s) };
  } catch {}
  return defaultSoilState();
}

export function saveSoilTempState(state: SoilTempState): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(SOIL_TEMP_KEY, JSON.stringify(state)); } catch {}
}

function defaultSoilState(): SoilTempState {
  return { surface: 10, depth10cm: 10, depth20cm: 10, airHistory: [] };
}

export function updateSoilTempState(state: SoilTempState, todayAirTemp: number): SoilTempState {
  const newHistory = [...state.airHistory.slice(-13), todayAirTemp];
  return {
    surface:    updateSoilTemperature(state.surface,    todayAirTemp, 'surface'),
    depth10cm:  updateSoilTemperature(state.depth10cm,  todayAirTemp, '10cm'),
    depth20cm:  updateSoilTemperature(state.depth20cm,  todayAirTemp, '20cm'),
    airHistory: newHistory,
  };
}
