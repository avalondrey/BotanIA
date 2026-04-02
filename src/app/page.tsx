"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { JardinGrid } from "@/components/game/JardinGrid";
import { Pepiniere } from "@/components/game/Pepiniere";
import { SerreJardinView } from "@/components/game/SerreJardinView";
import { GameHUD } from "@/components/game/GameHUD";
import { Boutique } from "@/components/game/Boutique";
import { GrainCollection } from "@/components/game/GrainCollection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminPanel, AdminButton, AdminModeBanner } from "@/components/game/AdminPanel";
import {
  fetchWeather,
  getGPSLocation,
  loadGPSCoords,
  saveGPSCoords,
} from "@/lib/weather-service";
import {
  TreePine, ShoppingBag, Sprout, RefreshCw, MapPin, Loader2,
  Warehouse, Home,
} from "lucide-react";

export default function GamePage() {
  const initGame = useGameStore((s) => s.initGame);
  const tick = useGameStore((s) => s.tick);
  const speed = useGameStore((s) => s.speed);
  const isPaused = useGameStore((s) => s.isPaused);
  const realWeather = useGameStore((s) => s.realWeather);
  const gpsCoords = useGameStore((s) => s.gpsCoords);
  const setRealWeather = useGameStore((s) => s.setRealWeather);
  const setGPSCoords = useGameStore((s) => s.setGPSCoords);
  const setWeatherLoading = useGameStore((s) => s.setWeatherLoading);
  const setWeatherError = useGameStore((s) => s.setWeatherError);
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const showSerreView = useGameStore((s) => s.showSerreView);
  const toggleSerreView = useGameStore((s) => s.toggleSerreView);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const weatherRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "error">("loading");
  const [statusMessage, setStatusMessage] = useState("Chargement...");

  // Load weather data
  const loadWeather = useCallback(async (coords: { latitude: number; longitude: number }) => {
    try {
      setWeatherLoading(true);
      setWeatherStatus("loading");
      setStatusMessage("Récupération des données météo...");

      const data = await fetchWeather(coords.latitude, coords.longitude);
      setRealWeather(data);
      setGPSCoords(coords);
      setWeatherStatus("ready");
      setStatusMessage("");
      setWeatherLoading(false);
    } catch (error) {
      console.error("Weather fetch error:", error);
      setWeatherError(error instanceof Error ? error.message : "Erreur météo");
      setWeatherStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Erreur de chargement");
      setWeatherLoading(false);
    }
  }, [setRealWeather, setGPSCoords, setWeatherLoading, setWeatherError]);

  // Initial setup
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Load weather on mount
  useEffect(() => {
    let cancelled = false;

    async function doLoad(coords: { latitude: number; longitude: number }) {
      if (cancelled) return;
      try {
        await loadWeather(coords);
      } catch (err) {
        console.warn("Meteo indisponible, mode simulation:", err);
        setWeatherStatus("error");
        setWeatherLoading(false);
      }
    }

    // Try to load GPS coords from cache first
    const cachedCoords = loadGPSCoords();

    if (cachedCoords) {
      doLoad(cachedCoords);
    } else {
      // Try GPS
      getGPSLocation()
        .then((coords) => {
          saveGPSCoords(coords);
          doLoad(coords);
        })
        .catch((gpsError) => {
          console.warn("GPS failed, using default Paris:", gpsError);
          // Fallback to Paris
          const defaultCoords = { latitude: 48.8566, longitude: 2.3522 };
          doLoad(defaultCoords);
        });
    }

    // Refresh weather every 6 hours
    weatherRefreshRef.current = setInterval(() => {
      const currentCoords = useGameStore.getState().gpsCoords;
      if (currentCoords) {
        doLoad(currentCoords);
      }
    }, 6 * 60 * 60 * 1000);

    return () => {
      if (weatherRefreshRef.current) clearInterval(weatherRefreshRef.current);
    };
  }, [initGame, loadWeather]);

  // Game tick
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!isPaused) {
      // 1 day = 20 seconds at 1x speed
      // At speed N: run N days per 20 seconds
      // Use batch ticks to avoid blocking: max 10 ticks per 50ms interval
      const targetTicksPerSecond = speed / 20; // days per second
      const ticksPerInterval = Math.min(Math.max(1, Math.ceil(targetTicksPerSecond * 0.05)), 50);
      const interval = Math.max(50, Math.round((ticksPerInterval / targetTicksPerSecond) * 1000));
      tickRef.current = setInterval(() => {
        for (let i = 0; i < ticksPerInterval; i++) tick();
      }, interval);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [speed, isPaused, tick]);

  // Hotkeys: [1-5] = speed, [Space] = pause/play
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " ") { e.preventDefault(); useGameStore.getState().togglePause(); }
      if (e.key === "1") setSpeed(1);
      if (e.key === "2") setSpeed(5);
      if (e.key === "3") setSpeed(10);
      if (e.key === "4") setSpeed(25);
      if (e.key === "5") setSpeed(100);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "5px 5px", opacity: 0.03 }} />

      {/* HEADER */}
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
            <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase rounded">v0.10.0</span>
            <span className="hidden md:inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[7px] font-bold uppercase rounded border border-amber-300">alpha</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-green-100 text-green-800 text-[8px] font-black uppercase rounded border border-green-300">
              🌤️ Météo Réelle
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* GPS status */}
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
                 weatherStatus === "ready" ? (gpsCoords ? `${gpsCoords.latitude.toFixed(2)}°, ${gpsCoords.longitude.toFixed(2)}°` : "Météo active") :
                 "GPS indisponible"}
              </span>
            </div>

            {/* Refresh weather button */}
            {gpsCoords && (
              <button
                onClick={() => loadWeather(gpsCoords)}
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

      {/* Admin mode banner */}
      <AdminModeBanner />

      {/* Loading overlay */}
      {weatherStatus === "loading" && !realWeather && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-white/90 flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="text-5xl mb-4 inline-block"
            >
              🌱
            </motion.div>
            <p className="text-sm font-black text-stone-700">Jardin Culture</p>
            <p className="text-xs text-stone-400 mt-1">{statusMessage}</p>
          </div>
        </motion.div>
      )}

      {/* MAIN */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-3 py-3 md:py-4">
        <GameHUD />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_0_#000] p-1 h-auto">
            <TabsTrigger
              value="jardin"
              className="data-[state=active]:bg-green-100 data-[state=active]:border-green-300 border-2 border-transparent rounded-lg px-4 py-2 text-xs font-black uppercase gap-1.5"
            >
              <TreePine className="w-4 h-4" />
              🌿 Jardin
            </TabsTrigger>
            <TabsTrigger
              value="serre"
              className="data-[state=active]:bg-cyan-100 data-[state=active]:border-cyan-300 border-2 border-transparent rounded-lg px-4 py-2 text-xs font-black uppercase gap-1.5"
            >
              <Home className="w-4 h-4" />
              🏡 Serre
            </TabsTrigger>
            <TabsTrigger
              value="pepiniere"
              className="data-[state=active]:bg-stone-100 data-[state=active]:border-stone-300 border-2 border-transparent rounded-lg px-4 py-2 text-xs font-black uppercase gap-1.5"
            >
              <Warehouse className="w-4 h-4" />
              🏠 Chambre de Culture
            </TabsTrigger>
            <TabsTrigger
              value="boutique"
              className="data-[state=active]:bg-amber-100 data-[state=active]:border-amber-300 border-2 border-transparent rounded-lg px-4 py-2 text-xs font-black uppercase gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              🏪 Boutique
            </TabsTrigger>
            <TabsTrigger
              value="graines"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:border-emerald-300 border-2 border-transparent rounded-lg px-4 py-2 text-xs font-black uppercase gap-1.5"
            >
              <Sprout className="w-4 h-4" />
              🌱 Graines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jardin" className="mt-4">
            {showSerreView ? <SerreJardinView /> : <JardinGrid />}
          </TabsContent>

          <TabsContent value="serre" className="mt-4">
            <SerreJardinView />
          </TabsContent>

          <TabsContent value="pepiniere" className="mt-4">
            <Pepiniere />
          </TabsContent>

          <TabsContent value="boutique" className="mt-4">
            <Boutique />
          </TabsContent>

          <TabsContent value="graines" className="mt-4">
            <GrainCollection />
          </TabsContent>
        </Tabs>

        {/* Footer AI Console */}
        <div className="mt-4 p-2.5 bg-stone-900 rounded-xl font-mono text-[9px]">
          <p className="text-stone-500 font-bold uppercase mb-1 flex items-center gap-1">
            <span>⚡</span> Console IA v2.0
          </p>
          <div className="space-y-0.5 text-[9px]">
            <p className="text-green-400">&gt; Réseau: Jardin + Pépinière + Mini Serres + Boutique ✅</p>
            <p className="text-green-400">&gt; Mini Serres: 6×4 = 24 emplacements (max 6/chambre) ✅</p>
            <p className="text-green-400">&gt; Remplir serre + Planter à date ✅</p>
            <p className="text-green-400">&gt; Tuiles Serre: protection gel, +5°C, -70% pluie ✅</p>
            <p className="text-green-400">&gt; Graines → Pépinière/Mini Serre (5 étapes) → Jardin ✅</p>
            <p className="text-green-400">&gt; Météo réelle Open-Meteo + GPS ✅</p>
            <p className="text-green-400">&gt; Plantes ne meurent jamais (mode survie) ✅</p>
            <p className="text-green-400">&gt; Inventaire graines + plantules + mini serres ✅</p>
            <p className="text-stone-500">&gt; Pépinière: T° 20°C, Lumière ×0.6, Croissance ×0.7</p>
            <p className="text-stone-500">&gt; Mini Serre: même env. que Pépinière (24 slots/grille)</p>
            <p className="text-stone-500">&gt; Serre Jardin: T° +15%, Pluie -70%, Lumière +15%</p>
            <p className="text-stone-500">&gt; Jardin: conditions météo réelles 1:1</p>
            <p className="text-stone-500">&gt; Gel: stoppe croissance (pas de mort)</p>
            <p className="text-amber-400 animate-pulse">&gt; {isPaused ? "⏸ EN PAUSE" : `▶ ${speed}x — Simulation active`}</p>
          </div>
        </div>
      </div>

      {/* Admin Panel — rendered via portal to body (z-99999) */}
      <AdminPanel />
    </div>
  );
}
