import { useState, useEffect, useCallback } from 'react';
import { RealWeatherData, fetchRealWeather } from './weather-service';
import { calculateEnvironment, EnvModifiers } from './environment-engine';
export function useEnvironmentSync(lat?: number, lon?: number) {
  const [env, setEnv] = useState<EnvModifiers | null>(null);
  const [weather, setWeather] = useState<RealWeatherData | null>(null);
  const [realDate, setRealDate] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setRealDate(new Date()), 1000); return () => clearInterval(t); }, []);
  const refresh = useCallback(async () => { const w = await fetchRealWeather(lat, lon); setWeather(w); setEnv(calculateEnvironment(new Date(), w)); }, [lat, lon]);
  useEffect(() => { refresh(); const i = setInterval(refresh, 15*60*1000); return () => clearInterval(i); }, [refresh]);
  return { env, weather, realDate, refresh };
}
