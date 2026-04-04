// src/lib/weather-service.ts
export type RealWeatherData = {
  temp: number; weatherCode: number; isRaining: boolean; isHeatwave: boolean;
  humidity: number; windSpeed: number; description: string;
};
export type GPSCoords = { lat: number; lon: number };

export const ZONE_MODIFIERS = {
  pepiniere: { water: 0.8, growth: 0.9, protection: true },
  serre:     { water: 0.6, growth: 1.2, protection: true },
  jardin:    { water: 1.0, growth: 1.0, protection: false }
} as const;

let _cachedWeather: RealWeatherData | null = null;
let _cacheTime = 0;
const CACHE_MS = 15 * 60 * 1000;

export async function fetchRealWeather(lat = 48.8566, lon = 2.3522): Promise<RealWeatherData> {
  const now = Date.now();
  if (_cachedWeather && now - _cacheTime < CACHE_MS) return _cachedWeather;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
    const data = await res.json();
    const c = data.current_weather;
    const maxT = data.daily?.temperature_2m_max?.[0] ?? c.temperature;
    const rainCodes = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99];
    _cachedWeather = {
      temp: c.temperature, weatherCode: c.weathercode,
      isRaining: rainCodes.includes(c.weathercode),
      isHeatwave: maxT >= 30 || c.temperature >= 32,
      humidity: 60, windSpeed: c.windspeed,
      description: {0:"Ciel dégagé ☀️",1:"Peu nuageux 🌤️",2:"Partiellement nuageux ⛅",3:"Couvert ☁️",45:"Brouillard 🌫️",51:"Bruine 💧",61:"Pluie 🌧️",63:"Pluie forte 🌊",80:"Averses 🌦️",95:"Orage ⛈️"}[c.weathercode] || "Variable ⛅"
    };
    _cacheTime = now;
    return _cachedWeather;
  } catch {
    return { temp:20, weatherCode:0, isRaining:false, isHeatwave:false, humidity:60, windSpeed:10, description:"Indisponible 🌍" };
  }
}

// ✅ Alias pour matcher tes imports existants
export const fetchWeather = fetchRealWeather;
export const getRealEnvironment = fetchRealWeather;
export const getZonePrecipitation = (isRaining: boolean, zone: keyof typeof ZONE_MODIFIERS) => (zone === 'jardin' && isRaining ? 1.0 : 0);
export const isFrostRisk = (temp: number) => temp <= 2;

// ✅ GPS (navigateur)
export function getGPSLocation(): Promise<GPSCoords | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
export function loadGPSCoords(): GPSCoords | null {
  try { return JSON.parse(localStorage.getItem('botania_gps') || 'null'); } catch { return null; }
}
export function saveGPSCoords(c: GPSCoords) {
  localStorage.setItem('botania_gps', JSON.stringify(c));
}
