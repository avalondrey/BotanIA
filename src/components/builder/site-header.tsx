'use client';

import { BuilderContent } from './builder-content';
import { useGameStore } from '@/store/game-store';
import { motion } from 'framer-motion';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import { useCallback } from 'react';
import { fetchWeather, getGPSLocation, loadGPSCoords, saveGPSCoords } from '@/lib/weather-service';
import { AdminButton } from '../game/AdminPanel';

interface SiteHeaderProps {
  className?: string;
}

/**
 * Site Header with real weather data
 * Editable via Builder.io model: "site-header"
 */
export function SiteHeader({ className }: SiteHeaderProps) {
  const initGame = useGameStore((s) => s.initGame);
  const gpsCoords = useGameStore((s) => s.gpsCoords);
  const setGPSCoords = useGameStore((s) => s.setGPSCoords);
  const setRealWeather = useGameStore((s) => s.setRealWeather);
  const setWeatherLoading = useGameStore((s) => s.setWeatherLoading);
  const setWeatherError = useGameStore((s) => s.setWeatherError);
  const isPaused = useGameStore((s) => s.isPaused);

  const loadWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setWeatherLoading(true);
      const data = await fetchWeather(lat, lon);
      setRealWeather(data);
      setGPSCoords({ lat, lon });
      setWeatherLoading(false);
    } catch (error) {
      console.error("Weather fetch error:", error);
      setWeatherError(error instanceof Error ? error.message : "Erreur météo");
      setWeatherLoading(false);
    }
  }, [setRealWeather, setGPSCoords, setWeatherLoading, setWeatherError]);

  const weatherLoading = useGameStore((s) => s.weatherLoading);

  // Derive weatherStatus from weatherLoading
  type WeatherStatusType = "loading" | "ready" | "error";
  const weatherStatus: WeatherStatusType = "loading"; // Default, will update

  return (
    <BuilderContent model="site-header">
      <header className="relative border-b-[3px] border-black bg-white z-10">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.8px, transparent 0.8px)", backgroundSize: "8px 8px", opacity: 0.03 }} />
        <div className="relative max-w-[1400px] mx-auto px-3 py-2.5 md:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.h1
              className="text-lg md:text-2xl font-black tracking-tight uppercase cursor-pointer"
              style={{ WebkitTextStroke: "1px #000", textShadow: "2px 2px 0 #000" }}
              whileHover={{ scale: 1.02 }}
              onClick={() => window.open('/preview.html', '_blank')}
            >
              🌱 Jardin Culture
            </motion.h1>
            <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase rounded">v2.3</span>
            <span className="hidden md:inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[7px] font-bold uppercase rounded border border-amber-300">alpha</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-green-100 text-green-800 text-[8px] font-black uppercase rounded border border-green-300">
              🌤️ Météo Réelle
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-[9px] text-stone-500">
              {weatherStatus === "loading" ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-3 h-3" />
                </motion.div>
              ) : weatherStatus === "ready" ? (
                <MapPin className="w-3 h-3 text-green-500" />
              ) : (
                <MapPin className="w-3 h-3 text-red-400" />
              )}
              <span className="font-bold">
                {weatherStatus === "loading" ? "Localisation..." :
                 weatherStatus === "ready" ? (gpsCoords?.lat != null && gpsCoords?.lon != null ? `${gpsCoords.lat.toFixed(2)}°, ${gpsCoords.lon.toFixed(2)}°` : "Météo active") :
                 "GPS indisponible"}
              </span>
            </div>

            {gpsCoords && (
              <button
                onClick={() => loadWeather(gpsCoords.lat, gpsCoords.lon)}
                className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                title="Actualiser la météo"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
              </button>
            )}

            <AdminButton />
            <button
              onClick={() => { if (confirm("Recommencer ? Toutes les données seront réinitialisées.")) useGameStore.getState().initGame(true); }}
              className="px-2 py-1 border-2 border-black bg-stone-100 text-[9px] font-black uppercase rounded-lg hover:bg-stone-200 transition-colors"
            >
              🔄 Recommencer
            </button>
          </div>
        </div>
      </header>
    </BuilderContent>
  );
}