// ═══════════════════════════════════════════════════
//  Advanced Weather System — Real-time + Forecast
//  Integrates Open-Meteo API with plant-specific alerts
// ═══════════════════════════════════════════════════

import type { RealWeatherData } from "./weather-service";
import type { PlantDefinition } from "./ai-engine";
import { PLANTS } from "./ai-engine";

export interface WeatherForecast {
  date: string;
  dayOfYear: number;
  weatherCode: number;
  gameWeather: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  uvIndex: number;
  humidity: number;
  emoji: string;
  label: string;
}

export interface WeatherAlert {
  type: "frost" | "heatwave" | "storm" | "drought" | "heavy_rain";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affectedPlants: string[];
  recommendations: string[];
}

// Fetch 7-day weather forecast
export async function fetchWeatherForecast(
  lat: number = 48.8566,
  lon: number = 2.3522
): Promise<WeatherForecast[]> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,relative_humidity_2m_max&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    const data = await res.json();

    const codeToGameWeather: Record<number, string> = {
      0: "sunny", 1: "partly-cloudy", 2: "partly-cloudy", 3: "cloudy",
      45: "cloudy", 48: "cloudy",
      51: "drizzle", 53: "drizzle", 55: "drizzle",
      56: "rain", 57: "rain", 61: "rain", 63: "rain", 65: "rain",
      66: "rain", 67: "rain",
      71: "snow", 73: "snow", 75: "snow",
      77: "snow",
      80: "drizzle", 81: "rain", 82: "rain",
      85: "snow", 86: "snow",
      95: "stormy", 96: "stormy", 99: "stormy",
    };

    const codeToEmoji: Record<number, string> = {
      0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
      45: "🌫️", 48: "🌫️",
      51: "🌦️", 53: "🌦️", 55: "🌧️",
      56: "🌧️", 57: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
      66: "🌧️", 67: "🌧️",
      71: "🌨️", 73: "🌨️", 75: "🌨️",
      77: "🌨️",
      80: "🌦️", 81: "🌧️", 82: "🌧️",
      85: "🌨️", 86: "🌨️",
      95: "⛈️", 96: "⛈️", 99: "⛈️",
    };

    const codeToLabel: Record<number, string> = {
      0: "Dégagé", 1: "Partiellement nuageux", 2: "Nuageux", 3: "Couvert",
      45: "Brouillard", 48: "Brouillard givrant",
      51: "Bruine légère", 53: "Bruine modérée", 55: "Bruine dense",
      56: "Pluie et froid", 57: "Pluie et froid",
      61: "Pluie légère", 63: "Pluie modérée", 65: "Pluie forte",
      66: "Pluie verglaçante", 67: "Pluie verglaçante forte",
      71: "Neige légère", 73: "Neige modérée", 75: "Neige forte",
      77: "Grêle",
      80: "Averses légères", 81: "Averses modérées", 82: "Averses violentes",
      85: "Averses de neige", 86: "Fortes averses de neige",
      95: "Orage", 96: "Orage avec grêle", 99: "Orage violent",
    };

    const daily = data.daily;
    const forecasts: WeatherForecast[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      const code = daily.weather_code[i];
      forecasts.push({
        date: daily.time[i],
        dayOfYear: Math.floor((new Date(daily.time[i]).getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000),
        weatherCode: code,
        gameWeather: codeToGameWeather[code] || "sunny",
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        precipitation: daily.precipitation_sum[i] || 0,
        uvIndex: daily.uv_index_max[i] || 0,
        humidity: daily.relative_humidity_2m_max[i] || 50,
        emoji: codeToEmoji[code] || "☀️",
        label: codeToLabel[code] || "Inconnu",
      });
    }

    return forecasts;
  } catch {
    return [];
  }
}

// Check for frost risk
export function hasFrostRisk(forecast: WeatherForecast | RealWeatherData): boolean {
  if ("current" in forecast) {
    return forecast.current.temperature <= 2;
  }
  return forecast.tempMin <= 2;
}

// Check for heatwave risk
export function hasHeatwaveRisk(forecast: WeatherForecast | RealWeatherData): boolean {
  if ("current" in forecast) {
    return forecast.current.temperature >= 35;
  }
  return forecast.tempMax >= 35;
}

// Check for storm risk
export function hasStormRisk(forecast: WeatherForecast | RealWeatherData): boolean {
  if ("current" in forecast) {
    return forecast.current.weatherCode >= 95;
  }
  return forecast.weatherCode >= 95;
}

// Get temperature stress level for plants
export function getTemperatureStress(
  currentTemp: number,
  plantDef: PlantDefinition
): { level: "none" | "mild" | "moderate" | "severe"; message: string } {
  const [optMin, optMax] = plantDef.optimalTemp;

  if (currentTemp >= optMin && currentTemp <= optMax) {
    return { level: "none", message: "Température optimale" };
  }

  if (currentTemp >= optMin - 5 && currentTemp <= optMax + 5) {
    return { level: "mild", message: `Légère stress: ${currentTemp}°C (optimal: ${optMin}-${optMax}°C)` };
  }

  if (currentTemp >= optMin - 10 || currentTemp <= optMax + 10) {
    return { level: "moderate", message: `Stress modéré: ${currentTemp}°C` };
  }

  return { level: "severe", message: `Stress sévère: ${currentTemp}°C` };
}

// Generate weather alerts for plants
export function generateWeatherAlerts(
  forecast: WeatherForecast[],
  currentWeather: RealWeatherData | null
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Check current weather
  if (currentWeather) {
    // Current frost
    if (hasFrostRisk(currentWeather)) {
      alerts.push({
        type: "frost",
        severity: "critical",
        title: "🥶 Alerte Gel IMMINENT",
        description: `Température actuelle: ${currentWeather.current.temperature.toFixed(1)}°C`,
        affectedPlants: findFrostSensitivePlants(),
        recommendations: [
          "Rentrez les plantes sensibles en serre",
          "Couvrez les plants extérieurs avec un voile",
          "Réduisez l'arrosage pour éviter le gel des racines",
        ],
      });
    }

    // Current heatwave
    if (hasHeatwaveRisk(currentWeather)) {
      alerts.push({
        type: "heatwave",
        severity: "high",
        title: "🌡️ Canicule",
        description: `Température actuelle: ${currentWeather.current.temperature.toFixed(1)}°C`,
        affectedPlants: findHeatSensitivePlants(),
        recommendations: [
          "Arrosez plus fréquemment (matin et soir)",
          "Paillez le sol pour conserver l'humidité",
          "Ombrez les plantes les plus sensibles",
        ],
      });
    }

    // Current storm
    if (hasStormRisk(currentWeather)) {
      alerts.push({
        type: "storm",
        severity: "high",
        title: "⛈️ Orage en cours",
        description: "Vents forts et pluies intenses",
        affectedPlants: findAllPlants(),
        recommendations: [
          "Rentrez les plantes en pot",
          "Protégez les jeunes plants",
          "Vérifiez le drainage du sol",
        ],
      });
    }
  }

  // Check forecast
  forecast.forEach((day, index) => {
    // Frost warning (next 3 days)
    if (index <= 2 && hasFrostRisk(day)) {
      alerts.push({
        type: "frost",
        severity: index === 0 ? "critical" : "high",
        title: `🥶 Gel prévu: ${day.tempMin.toFixed(0)}°C`,
        description: `${day.date} — ${day.emoji} ${day.label}`,
        affectedPlants: findFrostSensitivePlants(),
        recommendations: [
          `Préparez la protection pour ${day.date}`,
          "Paillez les massifs",
          "Rentrez les plantes mobiles",
        ],
      });
    }

    // Heatwave warning
    if (index <= 2 && hasHeatwaveRisk(day)) {
      alerts.push({
        type: "heatwave",
        severity: index === 0 ? "high" : "medium",
        title: `🌡️ Canicule prévue: ${day.tempMax.toFixed(0)}°C`,
        description: `${day.date} — ${day.emoji} ${day.label}`,
        affectedPlants: findHeatSensitivePlants(),
        recommendations: [
          `Anticipez l'arrosage pour ${day.date}`,
          "Préparez le paillage",
          "Prévoyez l'ombrage",
        ],
      });
    }

    // Heavy rain
    if (day.precipitation > 20) {
      alerts.push({
        type: "heavy_rain",
        severity: "medium",
        title: `🌧️ Forte pluie prévue: ${day.precipitation.toFixed(1)}mm`,
        description: `${day.date} — ${day.emoji} ${day.label}`,
        affectedPlants: findRainSensitivePlants(),
        recommendations: [
          "Vérifiez le drainage",
          "Protégez les semis",
          "Évitez les traitements",
        ],
      });
    }
  });

  return alerts;
}

// Find plants by sensitivity
function findFrostSensitivePlants(): string[] {
  return Object.values(PLANTS)
    .filter(p => p.droughtResistance < 0.5)
    .map(p => p.id);
}

function findHeatSensitivePlants(): string[] {
  return Object.values(PLANTS)
    .filter(p => p.optimalTemp[1] < 28)
    .map(p => p.id);
}

function findRainSensitivePlants(): string[] {
  return ["lettuce", "strawberry", "basil"];
}

function findAllPlants(): string[] {
  return Object.keys(PLANTS);
}

// Get watering recommendation based on forecast
export function getWateringRecommendation(
  forecast: WeatherForecast[],
  plantsWaterNeeds: number[]
): { shouldWater: boolean; urgency: "low" | "medium" | "high"; reason: string } {
  const rainDays = forecast.filter(d => d.precipitation > 5).length;

  if (rainDays >= 3) {
    return {
      shouldWater: false,
      urgency: "low",
      reason: `${rainDays} jours de pluie prévus dans la semaine`,
    };
  }

  const hotDays = forecast.filter(d => d.tempMax > 28).length;
  if (hotDays >= 3) {
    return {
      shouldWater: true,
      urgency: "high",
      reason: `${hotDays} jours chauds prévus — besoins en eau élevés`,
    };
  }

  const avgNeeds = plantsWaterNeeds.reduce((a, b) => a + b, 0) / plantsWaterNeeds.length;
  if (avgNeeds > 5) {
    return {
      shouldWater: true,
      urgency: "medium",
      reason: `Plantes avec besoins hydriques élevés (${avgNeeds.toFixed(1)}mm/jour)`,
    };
  }

  return {
    shouldWater: false,
    urgency: "low",
    reason: "Météo stable, sol encore humide",
  };
}

// Format weather for display
export function formatWeatherDisplay(weather: RealWeatherData | null): string {
  if (!weather) return "Météo indisponible";

  const { temperature, isRaining, humidity } = weather.current;
  const weatherEmoji = isRaining ? "🌧️" : "☀️";

  return `${weatherEmoji} ${temperature.toFixed(1)}°C | Humidité: ${humidity}%`;
}
