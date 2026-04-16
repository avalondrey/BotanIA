"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { GameHUD } from "@/components/game/GameHUD";
import { VisualEffectManager } from "@/components/game/VisualEffectManager";
import { EnhancedHUD } from "@/components/game/EnhancedHUD";
import { AdminPanel } from "@/components/game/AdminPanel";
import { WeatherEffects } from "@/components/game/WeatherEffects";
import { GameHeader } from "@/components/game/GameHeader";
import { GameTabs } from "@/components/game/GameTabs";
import {
  fetchWeather,
  getGPSLocation,
  loadGPSCoords,
  saveGPSCoords,
} from "@/lib/weather-service";
import { useNightMode, useAutoSave } from "@/lib/use-effects";
import { useSlotAutoSave } from "@/hooks/useSlotAutoSave";
import { useUISync } from "@/hooks/useUISync";
import { loadAutoSave, hasAutoSave, getAllSlots } from "@/lib/save-manager";
import { subscribeOnboardingEvents, unsubscribeOnboardingEvents } from "@/store/onboarding-store";
import { subscribeNotificationEvents, unsubscribeNotificationEvents } from "@/store/notification-store";
import { NotificationContainer } from "@/components/game/NotificationContainer";
import { CelebrationOverlay } from "@/components/game/CelebrationOverlay";

export default function GamePage() {
  const initGame = useGameStore((s) => s.initGame);
  const tick = useGameStore((s) => s.tick);
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const isPaused = useGameStore((s) => s.isPaused);
  const realWeather = useGameStore((s) => s.realWeather);
  const gpsCoords = useGameStore((s) => s.gpsCoords);
  const setRealWeather = useGameStore((s) => s.setRealWeather);
  const setGPSCoords = useGameStore((s) => s.setGPSCoords);
  const setWeatherLoading = useGameStore((s) => s.setWeatherLoading);
  const setWeatherError = useGameStore((s) => s.setWeatherError);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const weatherRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useNightMode();
  useAutoSave();
  useSlotAutoSave();
  useUISync();

  // Onboarding event subscription
  useEffect(() => {
    subscribeOnboardingEvents();
    subscribeNotificationEvents();
    // Auto-complete "welcome" step on first load
    const { useOnboardingStore } = require('@/store/onboarding-store');
    if (!useOnboardingStore.getState().completedSteps.includes('welcome')) {
      useOnboardingStore.getState().completeStep('welcome');
    }
    return () => {
      unsubscribeOnboardingEvents();
      unsubscribeNotificationEvents();
    };
  }, []);

  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "error">("loading");
  const [statusMessage, setStatusMessage] = useState("Chargement...");

  // Load weather data
  const loadWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setWeatherLoading(true);
      setWeatherStatus("loading");
      setStatusMessage("Récupération des données météo...");

      const data = await fetchWeather(lat, lon);
      setRealWeather(data);
      setGPSCoords({ lat, lon });
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
    async function setupGame() {
      initGame();

      try {
        const [autoSaveExists, allSlots] = await Promise.all([
          hasAutoSave(),
          getAllSlots(),
        ]);

        const activeSlot = allSlots.find(s => s.autoSaveEnabled) || allSlots[0];
        if (activeSlot?.gameState) {
          const loadGameState = useGameStore.getState().loadGameState;
          const setActiveSlot = useGameStore.getState().setActiveSlot;
          loadGameState(activeSlot.gameState);
          setActiveSlot(activeSlot.slotId);
        }
      } catch (err) {
        console.warn("No saved game found, starting fresh");
      }
    }
    setupGame();
  }, [initGame]);

  // Load weather on mount
  useEffect(() => {
    let cancelled = false;

    async function doLoad(lat: number, lon: number) {
      if (cancelled) return;
      try {
        await loadWeather(lat, lon);
      } catch (err) {
        console.warn("Meteo indisponible, mode simulation:", err);
        setWeatherStatus("error");
        setWeatherLoading(false);
      }
    }

    const cachedCoords = loadGPSCoords();

    if (cachedCoords) {
      doLoad(cachedCoords.lat, cachedCoords.lon);
    } else {
      getGPSLocation()
        .then((coords) => {
          if (coords) {
            saveGPSCoords(coords);
            doLoad(coords.lat, coords.lon);
          } else {
            doLoad(48.8566, 2.3522);
          }
        })
        .catch((gpsError) => {
          console.warn("GPS failed, using default Paris:", gpsError);
          doLoad(48.8566, 2.3522);
        });
    }

    // Refresh weather every 6 hours
    weatherRefreshRef.current = setInterval(() => {
      const currentCoords = useGameStore.getState().gpsCoords;
      if (currentCoords) {
        doLoad(currentCoords.lat, currentCoords.lon);
      }
    }, 6 * 60 * 60 * 1000);

    // Auto-save every 10 seconds
    autoSaveRef.current = setInterval(() => {
      try {
        const s = useGameStore.getState();
        const backup = JSON.stringify({ day: s.day, season: s.season, score: s.score, coins: s.coins, bestScore: s.bestScore });
        localStorage.setItem('botania-autosave', backup);
      } catch(e) {}
    }, 10000);

    return () => {
      if (weatherRefreshRef.current) clearInterval(weatherRefreshRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [initGame, loadWeather]);

  // Game tick
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);

    if (!isPaused && speed > 0) {
      const targetTicksPerSecond = speed / 20;
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

  // Auto-pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const currentState = useGameStore.getState();
        if (!currentState.isPaused && currentState.speed > 0) {
          useGameStore.getState().togglePause();
          sessionStorage.setItem("botania_auto_paused", "true");
        }
      } else {
        const wasAutoPaused = sessionStorage.getItem("botania_auto_paused");
        if (wasAutoPaused === "true") {
          useGameStore.getState().togglePause();
          sessionStorage.removeItem("botania_auto_paused");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <GameHeader
        weatherStatus={weatherStatus}
        gpsCoords={gpsCoords}
        onRefreshWeather={() => {
          if (gpsCoords) loadWeather(gpsCoords.lat, gpsCoords.lon);
        }}
      />

      {/* Loading overlay */}
      {weatherStatus === "loading" && !realWeather && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="text-5xl mb-4 inline-block"
            >
              🌱
            </motion.div>
            <p className="text-lg font-black text-green-800">BotanIA</p>
            <p className="text-xs text-stone-400 mt-1">{statusMessage}</p>
          </div>
        </motion.div>
      )}

      {/* MAIN */}
      <div className="mx-auto px-3 py-3 md:py-4" style={{ maxWidth: 'var(--ui-container-max)' }}>
        <GameHUD />
        <VisualEffectManager />
        <EnhancedHUD />
        <GameTabs />
      </div>

      <AdminPanel />
      <WeatherEffects />
      <NotificationContainer />
      <CelebrationOverlay />
    </div>
  );
}