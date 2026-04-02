import { NextRequest, NextResponse } from "next/server";

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  windspeed_10m_max: number[];
  uv_index_max: number[];
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: OpenMeteoCurrent;
  daily: OpenMeteoDaily;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("latitude") || "48.8566");
  const lon = parseFloat(searchParams.get("longitude") || "2.3522");

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "Coordonnées invalides. Latitude: -90 à 90, Longitude: -180 à 180." },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=7`;

    const res = await fetch(url, {
      next: { revalidate: 21600 }, // 6 hours cache
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erreur API météo: ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }

    const data: OpenMeteoResponse = await res.json();

    // Convert WMO weather code to game weather type
    const gameWeather = weatherCodeToGame(data.current.weather_code);
    const currentDay = data.daily.time[0];
    const todayIndex = 0;

    return NextResponse.json({
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        weatherCode: data.current.weather_code,
        weatherDescription: wmoCodeDescription(data.current.weather_code),
        weatherEmoji: weatherCodeEmoji(data.current.weather_code),
        windSpeed: data.current.wind_speed_10m,
        gameWeather,
        timestamp: new Date().toISOString(),
      },
      today: {
        date: currentDay,
        tempMax: data.daily.temperature_2m_max[todayIndex],
        tempMin: data.daily.temperature_2m_min[todayIndex],
        precipitation: data.daily.precipitation_sum[todayIndex],
        windMax: data.daily.windspeed_10m_max[todayIndex],
        uvIndex: data.daily.uv_index_max[todayIndex],
      },
      forecast: data.daily.time.slice(1).map((date, i) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i + 1],
        tempMin: data.daily.temperature_2m_min[i + 1],
        precipitation: data.daily.precipitation_sum[i + 1],
        windMax: data.daily.windspeed_10m_max[i + 1],
        uvIndex: data.daily.uv_index_max[i + 1],
        gameWeather: weatherCodeToGame(
          guessWeatherCodeFromTemp(
            data.daily.temperature_2m_max[i + 1],
            data.daily.precipitation_sum[i + 1]
          )
        ),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur de connexion à l'API météo: ${error instanceof Error ? error.message : "Inconnu"}` },
      { status: 500 }
    );
  }
}

// ═══ WMO Weather Code mappings ═══

function weatherCodeToGame(code: number): "sunny" | "cloudy" | "rainy" | "stormy" | "heatwave" | "frost" {
  if (code === 0) return "sunny";
  if (code <= 3) return "cloudy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "frost";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 85 && code <= 86) return "frost";
  if (code >= 95) return "stormy";
  return "cloudy";
}

function guessWeatherCodeFromTemp(tempMax: number, precip: number): number {
  if (tempMax < 2) return 71; // snow
  if (precip > 10) return 63; // heavy rain
  if (precip > 0) return 61; // moderate rain
  if (tempMax > 35) return 0; // sunny (implied heatwave from temp)
  if (tempMax > 25) return 0; // clear sky
  return 2; // partly cloudy
}

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

function wmoCodeDescription(code: number): string {
  if (code === 0) return "Ciel dégagé";
  if (code === 1) return "Principalement dégagé";
  if (code === 2) return "Partiellement nuageux";
  if (code === 3) return "Couvert";
  if (code >= 45 && code <= 48) return "Brouillard";
  if (code >= 51 && code <= 55) return "Bruine";
  if (code >= 56 && code <= 57) return "Bruine verglaçante";
  if (code >= 61 && code <= 63) return "Pluie";
  if (code >= 65 && code <= 67) return "Forte pluie";
  if (code >= 71 && code <= 73) return "Neige";
  if (code >= 75 && code <= 77) return "Fortes chutes de neige";
  if (code >= 80 && code <= 82) return "Averses";
  if (code >= 85 && code <= 86) return "Averses de neige";
  if (code >= 95) return "Orage";
  if (code >= 96 && code <= 99) return "Orage avec grêle";
  return "Conditions variables";
}
