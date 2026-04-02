// ═══════════════════════════════════════════════════
//  Service Météo — Jardin Culture v7
//  Open-Meteo API + GPS + Cache mémoire
// ═══════════════════════════════════════════════════

export interface RealWeatherData {
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    temperature: number;
    humidity: number;
    weatherCode: number;
    weatherDescription: string;
    weatherEmoji: string;
    windSpeed: number;
    gameWeather: GameWeatherType;
    timestamp: string;
  };
  today: {
    date: string;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    windMax: number;
    uvIndex: number;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    precipitation: number;
    windMax: number;
    uvIndex: number;
    gameWeather: GameWeatherType;
  }>;
}

export type GameWeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "heatwave" | "frost";

export interface GPSCoords {
  latitude: number;
  longitude: number;
}

// ═══ Cache mémoire (6 heures) ═══

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6h
let cachedWeather: { data: RealWeatherData; timestamp: number } | null = null;

export async function fetchWeather(lat: number, lon: number): Promise<RealWeatherData> {
  // Check cache
  if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_DURATION) {
    return cachedWeather.data;
  }

  const res = await fetch(`/api/weather?latitude=${lat}&longitude=${lon}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(error.error || `Erreur météo: ${res.status}`);
  }

  const data: RealWeatherData = await res.json();
  cachedWeather = { data, timestamp: Date.now() };
  return data;
}

// ═══ GPS ═══

export function getGPSLocation(): Promise<GPSCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Géolocalisation non disponible"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Permission de géolocalisation refusée"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Position indisponible"));
            break;
          case error.TIMEOUT:
            reject(new Error("Délai de géolocalisation dépassé"));
            break;
          default:
            reject(new Error("Erreur de géolocalisation inconnue"));
            break;
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 3600000, // Accept position up to 1 hour old
      }
    );
  });
}

// ═══ LocalStorage GPS coords ═══

const GPS_STORAGE_KEY = "jardin-culture-gps";

export function saveGPSCoords(coords: GPSCoords): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GPS_STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // ignore
  }
}

export function loadGPSCoords(): GPSCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(GPS_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as GPSCoords;
  } catch {
    // ignore
  }
  return null;
}

// ═══ WMO Weather Code → Game Weather ═══

export function weatherCodeToGame(code: number): GameWeatherType {
  if (code === 0) return "sunny";
  if (code <= 3) return "cloudy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "frost";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 85 && code <= 86) return "frost";
  if (code >= 95) return "stormy";
  return "cloudy";
}

// ═══ Real Weather → Game EnvironmentState ═══

import type { EnvironmentState } from "@/lib/ai-engine";

export interface ZoneModifiers {
  label: string;
  emoji: string;
  tempMin: number | null;       // null = locked range
  tempMax: number | null;
  tempMod: number;              // multiplier (if no lock)
  rainMod: number;              // 0 = no effect, 1 = full effect
  sunlightMod: number;
  humidityMod: number;
  description: string;
}

export const ZONE_MODIFIERS: Record<string, ZoneModifiers> = {
  garden: {
    label: "Jardin",
    emoji: "🌳",
    tempMin: null,
    tempMax: null,
    tempMod: 1.0,
    rainMod: 1.0,
    sunlightMod: 1.0,
    humidityMod: 1.0,
    description: "Plein air — conditions météo réelles sans modification.",
  },
  greenhouse: {
    label: "Serre",
    emoji: "🏡",
    tempMin: null,
    tempMax: null,
    tempMod: 1.3,     // +30% temp
    rainMod: 0.0,     // pas de pluie (sous verre)
    sunlightMod: 1.2,  // +20% sunlight
    humidityMod: 0.9,  // humidity ×0.9
    description: "Température +30%, pas de pluie (sous verre), lumière +20%, humidité ×0.9",
  },
  indoor: {
    label: "Chambre de Culture",
    emoji: "🏠",
    tempMin: 18,
    tempMax: 22,
    tempMod: 1.0,
    rainMod: 0.0,      // pas de pluie (intérieur)
    sunlightMod: 0.5,
    humidityMod: 0.8,
    description: "Température bloquée 18-22°C, lumière ×0.5, pluie sans effet",
  },
  mini_serre: {
    label: "Mini Serre",
    emoji: "🏡",
    tempMin: 18,
    tempMax: 25,
    tempMod: 1.0,
    rainMod: 0.0,
    sunlightMod: 0.7,
    humidityMod: 0.85,
    description: "Petite serre indoor — Température 18-25°C, lumière ×0.7, pas de pluie",
  },
};

export function getRealEnvironment(
  weather: RealWeatherData,
  zoneId: string
): EnvironmentState {
  const zone = ZONE_MODIFIERS[zoneId] || ZONE_MODIFIERS.garden;
  const current = weather.current;
  const today = weather.today;

  // Average temperature
  const avgTemp = (today.tempMax + today.tempMin) / 2;

  // Calculate temperature with zone modifiers
  let effectiveTemp: number;
  if (zone.tempMin !== null && zone.tempMax !== null) {
    // Locked range: clamp average temp
    effectiveTemp = Math.max(zone.tempMin, Math.min(zone.tempMax, avgTemp));
  } else {
    effectiveTemp = avgTemp * zone.tempMod;
  }

  // Sunlight estimation from UV index (simplified)
  // UV 0-2 = ~2h, UV 3-5 = ~6h, UV 6-7 = ~8h, UV 8+ = ~10h
  let sunlightHours: number;
  const uv = today.uvIndex;
  if (uv <= 2) sunlightHours = 2 + uv;
  else if (uv <= 5) sunlightHours = 4 + (uv - 2) * 1.5;
  else if (uv <= 7) sunlightHours = 8 + (uv - 5) * 0.5;
  else sunlightHours = 10 + (uv - 7) * 0.3;
  sunlightHours *= zone.sunlightMod;

  // Humidity from real data
  let effectiveHumidity = current.humidity * zone.humidityMod;

  // Soil quality based on conditions
  let soilQuality = 65;
  if (today.precipitation > 0) soilQuality = Math.min(100, soilQuality + 10);
  if (effectiveTemp > 30) soilQuality = Math.max(30, soilQuality - 15);

  return {
    temperature: Math.round(effectiveTemp * 10) / 10,
    humidity: Math.round(Math.max(10, Math.min(100, effectiveHumidity))),
    sunlightHours: Math.round(Math.max(0, Math.min(16, sunlightHours)) * 10) / 10,
    soilQuality: Math.round(soilQuality),
    soilPH: 6.5,
  };
}

// Get precipitation for zone (zone.rainMod affects how much rain reaches plants)
export function getZonePrecipitation(weather: RealWeatherData, zoneId: string): number {
  const zone = ZONE_MODIFIERS[zoneId] || ZONE_MODIFIERS.garden;
  return weather.today.precipitation * zone.rainMod;
}

// Weather emoji for display
export function getWeatherEmoji(gameWeather: GameWeatherType): string {
  const emojis: Record<GameWeatherType, string> = {
    sunny: "☀️",
    cloudy: "⛅",
    rainy: "🌧️",
    stormy: "⛈️",
    heatwave: "🔥",
    frost: "🥶",
  };
  return emojis[gameWeather] || "🌤️";
}

export function getWeatherLabel(gameWeather: GameWeatherType): string {
  const labels: Record<GameWeatherType, string> = {
    sunny: "Ensoleillé",
    cloudy: "Nuageux",
    rainy: "Pluvieux",
    stormy: "Orageux",
    heatwave: "Canicule",
    frost: "Gel",
  };
  return labels[gameWeather] || "Variable";
}

// ═══ Frost Risk ═══

/** Returns true if there's a risk of frost */
export function isFrostRisk(weather: RealWeatherData): boolean {
  if (weather.current.temperature < 5) return true;
  if (weather.today.tempMin < 2) return true;
  // Check forecast for next 3 days
  for (const day of weather.forecast.slice(0, 3)) {
    if (day.tempMin < 2) return true;
  }
  return false;
}

// ═══ French Month Names ═══

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function getMonthName(month: number): string {
  return MONTH_NAMES_FR[((month % 12) + 12) % 12];
}
