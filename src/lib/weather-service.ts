// src/lib/weather-service.ts
export interface WeatherCurrent {
  temperature: number;
  weatherCode: number;
  weatherEmoji: string;
  weatherDescription: string;
  gameWeather: string;
  isRaining: boolean;
  windSpeed: number;
  humidity: number;
  timestamp: number;
}
export interface WeatherToday {
  tempMax: number;
  tempMin: number;
  uvIndex: number;
  date: string;
  /** Précipitations du jour en mm (Open-Meteo daily precipitation_sum) */
  precipitationMm: number;
}
export type RealWeatherData = {
  current: WeatherCurrent;
  today: WeatherToday;
  description: string;
};
export type GPSCoords = { lat: number; lon: number };

export const ZONE_MODIFIERS = {
  pepiniere: { water: 0.8, growth: 0.9, protection: true },
  serre:     { water: 0.6, growth: 1.2, protection: true },
  jardin:    { water: 1.0, growth: 1.0, protection: false }
} as const;

const codeToGameWeather: Record<number, string> = {
  0: "sunny", 1: "partly-cloudy", 2: "partly-cloudy", 3: "cloudy",
  45: "cloudy", 48: "cloudy",
  51: "drizzle", 53: "drizzle", 55: "drizzle",
  56: "rain", 57: "rain", 61: "rain", 63: "rain", 65: "rain",
  66: "rain", 67: "rain",
  71: "snow", 73: "snow", 75: "snow", 77: "snow",
  80: "drizzle", 81: "rain", 82: "rain",
  85: "snow", 86: "snow",
  95: "stormy", 96: "stormy", 99: "stormy",
};

const rainCodes = new Set([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99]);

function weatherCodeEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 55) return "🌧️";
  if (code >= 56 && code <= 57) return "🌧️";
  if (code >= 61 && code <= 65) return "🌧️";
  if (code >= 66 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌈";
}

function weatherCodeDescription(code: number): string {
  if (code === 0) return "Ciel dégagé";
  if (code === 1) return "Partiellement dégagé";
  if (code === 2) return "Partiellement nuageux";
  if (code === 3) return "Couvert";
  if (code >= 45 && code <= 48) return "Brouillard";
  if (code >= 51 && code <= 55) return "Bruine";
  if (code >= 56 && code <= 57) return "Bruine verglaçante";
  if (code >= 61 && code <= 65) return "Pluie";
  if (code >= 66 && code <= 67) return "Forte pluie";
  if (code >= 71 && code <= 73) return "Neige";
  if (code >= 75 && code <= 77) return "Fortes chutes de neige";
  if (code >= 80 && code <= 82) return "Averses";
  if (code >= 85 && code <= 86) return "Averses de neige";
  if (code >= 95) return "Orage";
  return "Variable";
}

let _cachedWeather: RealWeatherData | null = null;
let _cacheTime = 0;
const CACHE_MS = 15 * 60 * 1000;

export async function fetchRealWeather(lat = 48.8566, lon = 2.3522): Promise<RealWeatherData> {
  const now = Date.now();
  if (_cachedWeather && now - _cacheTime < CACHE_MS) return _cachedWeather;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${typeof lat === 'number' ? lat : (lat as any)?.latitude || 48.8566}&longitude=${typeof lon === 'number' ? lon : (lon as any)?.longitude || 2.3522}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&hourly=relative_humidity_2m&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const c = data.current_weather;
    const maxT = data.daily?.temperature_2m_max?.[0] ?? c.temperature;
    const minT = data.daily?.temperature_2m_min?.[0] ?? c.temperature;
    const uvIndex = data.daily?.uv_index_max?.[0] ?? 5;
    const precipMm: number = data.daily?.precipitation_sum?.[0] ?? (rainCodes.has(c.weathercode) ? 3 : 0);
    const isRaining = rainCodes.has(c.weathercode);
    _cachedWeather = {
      current: {
        temperature: c.temperature,
        weatherCode: c.weathercode,
        weatherEmoji: weatherCodeEmoji(c.weathercode),
        weatherDescription: weatherCodeDescription(c.weathercode),
        gameWeather: codeToGameWeather[c.weathercode] || "sunny",
        isRaining,
        windSpeed: c.windspeed,
        humidity: data.current?.relative_humidity_2m ?? 60,
        timestamp: Date.now(),
      },
      today: { tempMax: maxT, tempMin: minT, uvIndex, date: new Date().toISOString().split("T")[0], precipitationMm: precipMm },
      description: "OK",
    };
    _cacheTime = now;
    return _cachedWeather;
  } catch {
    return {
      current: { temperature: 20, weatherCode: 0, weatherEmoji: "☀️", weatherDescription: "Ciel dégagé", gameWeather: "sunny", isRaining: false, windSpeed: 10, humidity: 60, timestamp: Date.now() },
      today: { tempMax: 25, tempMin: 15, uvIndex: 5, date: "", precipitationMm: 0 },
      description: "Indisponible",
    };
  }
}

export const fetchWeather = fetchRealWeather;

export function getRealEnvironment(data: RealWeatherData, zoneId: string) {
  const zone = zoneId === "serre_tile" ? "serre" : zoneId === "garden" ? "jardin" : "pepiniere";
  const mod = ZONE_MODIFIERS[zone] || ZONE_MODIFIERS.pepiniere;
  const sunHours = data.current.weatherCode <= 1 ? 8 : data.current.weatherCode <= 2 ? 6 : 3;
  return {
    temperature: data.current.temperature * (mod.protection ? 1.15 : 1.0),
    humidity: data.current.humidity * (mod.protection ? 0.7 : 1.0),
    sunlightHours: sunHours * (mod.protection ? 0.6 : 1.0),
    soilQuality: mod.protection ? 80 : 65,
  };
}

export function getZonePrecipitation(data: RealWeatherData, zoneId: string): number {
  const zone = zoneId === "serre_tile" ? "serre" : zoneId === "garden" ? "jardin" : "pepiniere";
  if (zone !== "jardin") return 0; // serre et pépinière = pas de pluie directe
  // Retourne les mm réels du jour (depuis Open-Meteo daily precipitation_sum)
  return data.today?.precipitationMm ?? (data.current.isRaining ? 3 : 0);
}

export function isFrostRisk(data: RealWeatherData): boolean {
  return data.current.temperature <= 2;
}

export function getGPSLocation(): Promise<GPSCoords | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

export function loadGPSCoords(): GPSCoords | null {
  try { return JSON.parse(localStorage.getItem("botania_gps") || "null"); } catch { return null; }
}

export function saveGPSCoords(c: GPSCoords) {
  localStorage.setItem("botania_gps", JSON.stringify(c));
}
