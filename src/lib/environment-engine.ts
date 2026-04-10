import { RealWeatherData } from './weather-service';
export interface EnvModifiers { waterNeedMultiplier: number; growthSpeedMultiplier: number; stressRisk: 'canicule'|'gel'|'normal'|'excès_eau'; timeLabel: string; weatherLabel: string; }
export function calculateEnvironment(realDate: Date, weather: RealWeatherData): EnvModifiers {
  const hour = realDate.getHours(); const isNight = hour >= 20 || hour < 6;
  let water = 1.0, growth = 1.0, stress: EnvModifiers['stressRisk'] = 'normal';
  const timeLabel = isNight ? "Nuit 🌙" : "Jour ☀️";
  const temp = weather.current?.temperature ?? 20;
  const isRaining = weather.current?.isRaining ?? false;
  if (isNight) { growth = 0.4; water = 0.7; }
  if (temp > 35) { water *= 1.8; growth *= 0.7; stress = 'canicule'; }
  else if (isRaining) { water = 0; growth *= 1.2; stress = 'excès_eau'; }
  else if (temp < 2) { growth *= 0.3; stress = 'gel'; }
  return { waterNeedMultiplier: Math.max(0, water), growthSpeedMultiplier: growth, stressRisk: stress, timeLabel, weatherLabel: weather.description };
}
