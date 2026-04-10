"use client";

import { useGameStore } from "@/store/game-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, Heart, AlertTriangle, Sprout, Clock, Trophy,
  Coins, Thermometer, Wind, Sun, MapPin, RefreshCw, Zap,
  Warehouse,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  getRealDateDisplay,
  getRealDateFull,
  getSeasonEmoji,
  getSeasonLabel,
} from "@/lib/ai-engine";
import {
  type RealWeatherData,
  isFrostRisk,
} from "@/lib/weather-service";
import { getAdvisorSuggestions } from "@/lib/ai-advisor"; // Utilisation de la fonction principale de l'advisor

// ═══ Analog Clock Component — Real time (client-only, no SSR) ═══
function AnalogClock() {
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({ h: now.getHours() % 12, m: now.getMinutes(), s: now.getSeconds() });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Before mount: render empty placeholder (matches server HTML exactly)
  if (!time) {
    return (
      <div className="relative w-11 h-11">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="46" fill="white" stroke="#1a1a1a" strokeWidth="4" />
          {/* Placeholder: 12 and 6 markers only */}
          <line x1="50" y1="10" x2="50" y2="16" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="84" x2="50" y2="90" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const { h, m, s } = time;
  const hourAngle = ((h + m / 60) / 12) * 360 - 90;
  const minuteAngle = ((m + s / 60) / 60) * 360 - 90;
  const secondAngle = (s / 60) * 360 - 90;

  return (
    <div className="relative w-11 h-11" suppressHydrationWarning>
      <svg viewBox="0 0 100 100" className="w-full h-full" suppressHydrationWarning>
        {/* Clock face */}
        <circle cx="50" cy="50" r="46" fill="white" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="50" cy="50" r="43" fill="white" stroke="#e5e5e5" strokeWidth="1" />
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const isMain = i % 3 === 0;
          const inner = isMain ? 34 : 36;
          return <line key={i} x1={50 + inner * Math.cos(angle)} y1={50 + inner * Math.sin(angle)} x2={50 + 40 * Math.cos(angle)} y2={50 + 40 * Math.sin(angle)} stroke="#1a1a1a" strokeWidth={isMain ? 3 : 1.5} strokeLinecap="round" />;
        })}
        {/* Hour hand */}
        <line x1="50" y1="50" x2={50 + 22 * Math.cos(hourAngle * Math.PI / 180)} y2={50 + 22 * Math.sin(hourAngle * Math.PI / 180)} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" />
        {/* Minute hand */}
        <line x1="50" y1="50" x2={50 + 30 * Math.cos(minuteAngle * Math.PI / 180)} y2={50 + 30 * Math.sin(minuteAngle * Math.PI / 180)} stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Second hand */}
        <line x1="50" y1="50" x2={50 + 33 * Math.cos(secondAngle * Math.PI / 180)} y2={50 + 33 * Math.sin(secondAngle * Math.PI / 180)} stroke="#e74c3c" strokeWidth="1" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="50" cy="50" r="3" fill="#e74c3c" />
        <circle cx="50" cy="50" r="1.5" fill="#1a1a1a" />
      </svg>
    </div>
  );
}

export function GameHUD() {
  const day = useGameStore((s) => s.day);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const season = useGameStore((s) => s.season);
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const harvested = useGameStore((s) => s.harvested);
  const showConsole = useGameStore((s) => s.showConsole);
  const toggleConsole = useGameStore((s) => s.toggleConsole);
  const score = useGameStore((s) => s.score);
  const bestScore = useGameStore((s) => s.bestScore);
  const coins = useGameStore((s) => s.coins);
  const realWeather = useGameStore((s) => s.realWeather);
  const gpsCoords = useGameStore((s) => s.gpsCoords);
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const pepiniere = useGameStore((s) => s.pepiniere);
  const alerts = useGameStore((s) => s.alerts);
  const weatherLoading = useGameStore((s) => s.weatherLoading);
  const weatherError = useGameStore((s) => s.weatherError);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const serreTiles = useGameStore((s) => s.serreTiles);

  // 🧠 IA Advice Memoized: Refresh only every 15 mins or on day change
  const aiAdvice = useMemo(() => {
    // Note: pepiniere est PlantState[] mais l'advisor attend {plantDefId, plant}[]
    // Cast temporaire — à corriger quand le type sera unifié
    const pepinierePlantsForAdvisor = pepiniere.map((p: any) => ({
      plantDefId: 'unknown',
      plant: p,
    }));
    return getAdvisorSuggestions({
      day,
      season,
      realWeather,
      gardenPlants: gardenPlants.map(p => ({ ...p, plant: p.plant, daysSincePlanting: p.plant.daysSincePlanting })),
      pepinierePlants: pepinierePlantsForAdvisor,
      recentAlerts: alerts.map(a => ({ type: a.type, severity: 'medium' })),
      coins
    });
  }, [day, season, realWeather, gardenPlants.length, pepiniere.length]);

  const recentAlerts = alerts.slice(-8).reverse();
  const jardinPlants = gardenPlants.length;
  const totalPlants = jardinPlants + pepiniere.length;

  const hasFrostRisk = realWeather ? isFrostRisk(realWeather) : false;

  return (
    <div className="space-y-3">
      {/* Top HUD bar */}
      <div className="flex items-center gap-1.5 flex-wrap p-2.5 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_0_#000]">
        {/* Score */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <div>
            <p className="text-[8px] text-amber-500 font-black leading-none">POINTS</p>
            <motion.p
              key={score}
              initial={{ scale: 1.3, color: "#f59e0b" }}
              animate={{ scale: 1, color: "#000" }}
              transition={{ duration: 0.3, type: "spring" }}
              className="text-sm font-black leading-tight"
            >
              {score.toLocaleString("fr-FR")}
            </motion.p>
          </div>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300">
          <Coins className="w-3.5 h-3.5 text-amber-600" />
          <div>
            <p className="text-[8px] text-amber-500 font-black leading-none">PIÈCES</p>
            <motion.p
              key={coins}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-sm font-black leading-tight"
            >
              {coins} 🪙
            </motion.p>
          </div>
        </div>

        {/* Clock + Date */}
        <div className="flex items-center gap-2 px-2 py-1 bg-stone-50 rounded-lg border border-stone-200">
          <AnalogClock />
          <div>
            <p className="text-[8px] text-stone-400 font-bold leading-none">DATE</p>
            <p className="text-xs font-black leading-tight" suppressHydrationWarning>
              {mounted ? getRealDateDisplay(day) : "—"}
            </p>
          </div>
        </div>

        {/* Season */}
        <div className="flex items-center gap-1 px-2 py-1 bg-stone-50 rounded-lg border border-stone-200">
          <span className="text-base">{getSeasonEmoji(season)}</span>
          <div>
            <p className="text-[8px] text-stone-400 font-bold leading-none">SAISON</p>
            <p className="text-[10px] font-black leading-tight">{getSeasonLabel(season)}</p>
          </div>
        </div>

        {/* Real Weather */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border whitespace-nowrap flex-shrink-0 ${
          hasFrostRisk ? "bg-blue-50 border-blue-300" : "bg-sky-50 border-sky-200"
        }`}>
          {weatherLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
            </motion.div>
          ) : (
            <span className="text-base">
              {realWeather?.current?.weatherEmoji || "🌤️"}
            </span>
          )}
          <div>
            <p className={`text-[8px] font-bold leading-none ${hasFrostRisk ? "text-blue-400" : "text-sky-400"}`}>MÉTÉO</p>
            {realWeather ? (
              <p className={`text-[10px] font-black leading-tight ${hasFrostRisk ? "text-blue-800" : ""}`}>
                {realWeather?.current?.temperature != null ? `${realWeather.current?.weatherDescription || "—"}` : "Météo indisponible"}
                {hasFrostRisk && " 🥶"}
              </p>
            ) : weatherError ? (
              <p className="text-[9px] text-red-500">Indisponible</p>
            ) : (
              <p className="text-[10px] font-black leading-tight">Chargement...</p>
            )}
          </div>
          {realWeather && (
            <span className="text-[7px] px-1 py-0.5 bg-sky-100 text-sky-700 rounded font-black border border-sky-200 ml-1">
              Réelle
            </span>
          )}
        </div>

        {/* GPS / Location */}
        {gpsCoords && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-stone-50 rounded-lg border border-stone-200 flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <p className="text-[8px] font-bold text-stone-500">
              {gpsCoords?.lat != null && gpsCoords?.lon != null ? `${gpsCoords.lat.toFixed(2)}°, ${gpsCoords.lon.toFixed(2)}°` : "Localisation..."}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg border border-green-200 flex-shrink-0 whitespace-nowrap">
          <Sprout className="w-3.5 h-3.5 text-green-600" />
          <div>
            <p className="text-[8px] text-green-400 font-bold leading-none">PLANTES</p>
            <p className="text-xs font-black leading-tight text-green-700">
              {totalPlants}
              <span className="text-[8px] text-green-400 ml-0.5">
                ({jardinPlants}🌳 {pepiniere.length}🏠)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg border border-green-200 flex-shrink-0">
          <span className="text-[9px]">✂️</span>
          <p className="text-xs font-black text-green-700">{harvested}</p>
        </div>

        {/* Serre tiles */}
        <div className="flex items-center gap-1 px-2 py-1 bg-cyan-50 rounded-lg border border-cyan-200 flex-shrink-0">
          <span className="text-[9px]">🏡</span>
          <p className="text-xs font-black text-cyan-700">{serreTiles}</p>
        </div>


      </div>

      {/* Real weather details bar */}
      {realWeather && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-2 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl flex-wrap"
        >
          <div className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-bold">
              {gpsCoords?.lat != null && gpsCoords?.lon != null ? `${gpsCoords.lat.toFixed(2)}°, ${gpsCoords.lon.toFixed(2)}°` : "Localisation..."}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold">
             {realWeather?.current?.humidity ?? "—"}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[10px] font-bold">
             {realWeather?.current?.windSpeed != null ? `${Math.round(realWeather.current.windSpeed)} km/h` : "—"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold">
              UV {realWeather?.today?.uvIndex ?? "—"}
            </span>
          </div>
           {(realWeather?.today?.precipitationMm ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-700">
                🌧️ {realWeather.today.precipitationMm} mm
              </span>
            </div>
          )}
          {hasFrostRisk && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 border border-blue-300 rounded-lg">
              <span className="text-[10px] font-black text-blue-700">🥶 Risque de gel !</span>
            </div>
          )}
          <p className="text-[8px] text-sky-400 ml-auto">
            Maj: {new Date(realWeather?.current?.timestamp ?? Date.now()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </motion.div>
      )}

      {/* Alerts */}
      <AnimatePresence>
        {recentAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_0_#000] max-h-52 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[9px] font-black uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Journal IA
              </h3>
              <button onClick={toggleConsole} className="text-[8px] text-stone-400 font-bold hover:text-black">
                {showConsole ? "Masquer" : "Voir"}
              </button>
            </div>
            {showConsole && (
              <div className="space-y-0.5">
                {recentAlerts.map((alert) => (
                  <motion.div key={alert.id} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
                    className={`px-2 py-1 rounded-lg text-[9px] font-medium border ${
                      alert.type === "water" ? "bg-blue-50 border-blue-200 text-blue-800" :
                      alert.type === "health" || alert.type === "death" ? "bg-red-50 border-red-200 text-red-800" :
                      alert.type === "harvest" ? "bg-green-50 border-green-200 text-green-800" :
                      alert.type === "combo" ? "bg-purple-50 border-purple-200 text-purple-800" :
                      alert.type === "pest" || alert.type === "disease" ? "bg-orange-50 border-orange-200 text-orange-800" :
                      alert.type === "weather" ? "bg-sky-50 border-sky-200 text-sky-800" :
                      alert.type === "season" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                      "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                    <span className="mr-0.5">{alert.emoji}</span>{alert.message}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}