"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { MapPin, Loader2, RefreshCw } from "lucide-react";
import { AdminButton, AdminModeBanner } from "@/components/game/AdminPanel";

interface GameHeaderProps {
  weatherStatus: "loading" | "ready" | "error";
  gpsCoords: { lat: number; lon: number } | null;
  onRefreshWeather: () => void;
}

export function GameHeader({ weatherStatus, gpsCoords, onRefreshWeather }: GameHeaderProps) {
  return (
    <>
      <header className="relative bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white z-10 shadow-lg">
        <div className="mx-auto px-4 py-2 flex items-center justify-between" style={{ maxWidth: 'var(--ui-container-max)' }}>
          <div className="flex items-center gap-3">
            <motion.h1
              className="text-xl md:text-2xl font-black tracking-tight cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => window.open('/preview.html', '_blank')}
            >
              🌱 BotanIA
            </motion.h1>
            <span className="px-1.5 py-0.5 bg-white/20 font-bold uppercase rounded backdrop-blur-sm" style={{ fontSize: 'var(--ui-hud-font)' }}>v2.2.0</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 bg-amber-500/30 font-bold uppercase rounded backdrop-blur-sm border border-amber-400/40" style={{ fontSize: 'var(--ui-hud-font)' }}>alpha</span>
            {weatherStatus === "ready" && (
              <span className="hidden md:inline-block px-1.5 py-0.5 bg-emerald-500/30 text-[8px] font-bold uppercase rounded backdrop-blur-sm border border-emerald-400/40">
                🌤️ Météo live
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* GPS status */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/80">
              {weatherStatus === "loading" ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-3.5 h-3.5" />
                </motion.div>
              ) : weatherStatus === "ready" ? (
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-red-300" />
              )}
              <span className="font-semibold">
                {weatherStatus === "loading" ? "Localisation..." :
                 weatherStatus === "ready" ? (gpsCoords?.lat != null && gpsCoords?.lon != null ? `${gpsCoords.lat.toFixed(2)}°, ${gpsCoords.lon.toFixed(2)}°` : "Météo active") :
                 "GPS indisponible"}
              </span>
            </div>

            {/* Refresh weather button */}
            {gpsCoords && (
              <button
                onClick={onRefreshWeather}
                className="p-1.5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                title="Actualiser la météo"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white/70" />
              </button>
            )}

            <AdminButton />
            <button
              onClick={() => { if (confirm("Recommencer ? Toutes les données seront réinitialisées.")) useGameStore.getState().initGame(true); }}
              className="px-2.5 py-1 border border-white/30 bg-white/10 text-[10px] font-bold uppercase rounded-lg hover:bg-white/20 transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </header>
      <AdminModeBanner />
    </>
  );
}