/**
 * Simulation Store — Day cycle, weather, and tick simulation
 * Extracted from game-store.ts for maintainability.
 *
 * The tick() function touches all domain stores (shop, nursery, garden)
 * via cross-store imports. This is intentional — the simulation engine
 * needs to update all domains in a single coordinated tick.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type AlertData,
  type WeatherData,
  PLANTS,
  WEATHER_TYPES,
  getSeason,
  getSeasonEmoji,
  getSeasonLabel,
  getSeasonalPlantingAdvice,
  generateWeatherForMonth,
  getMonthFromDay,
  getTodayDayOfYear,
  simulateDay,
  simulateDayWithRealWeather,
  type RealWeatherParams,
  getEnvironmentForMonth,
  getEnvironmentWithDailyVariation,
} from '@/lib/ai-engine';
import {
  type RealWeatherData,
  type GPSCoords,
  getRealEnvironment,
  getZonePrecipitation,
  isFrostRisk,
  saveGPSCoords,
} from '@/lib/weather-service';
import { useShopStore } from './shop-store';
import { useNurseryStore } from './nursery-store';
import { useGardenStore } from './garden-store';
import { useAchievementStore } from './achievement-store';
import { useSoundManager } from '@/lib/sound-manager';

// ═══ State Interface ═══

export interface SimulationState {
  // Time
  day: number;
  season: string;

  // Weather
  weather: WeatherData;
  realWeather: RealWeatherData | null;
  gpsCoords: GPSCoords | null;
  weatherLoading: boolean;
  weatherError: string | null;

  // Simulation controls
  speed: number;
  isPaused: boolean;
  alerts: AlertData[];

  // Tracking
  harvested: number;

  // Actions
  tick: (adminMode?: boolean, diseasesEnabled?: boolean) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  setRealWeather: (data: RealWeatherData) => void;
  setGPSCoords: (coords: GPSCoords) => void;
  setWeatherLoading: (loading: boolean) => void;
  setWeatherError: (error: string | null) => void;
  dismissAlert: (alertId: string) => void;
  addAlert: (alert: AlertData) => void;

  // Init
  initSimulation: () => void;
}

// ═══ Tick state tracking ═══

let lastSavedDay = 0;

// ═══ Store ═══

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      day: getTodayDayOfYear(),
      season: getSeason(getTodayDayOfYear()),
      weather: WEATHER_TYPES["sunny"],
      realWeather: null,
      gpsCoords: null,
      weatherLoading: false,
      weatherError: null,
      speed: 0,
      isPaused: false,
      alerts: [],
      harvested: 0,

      // ── Tick — the core simulation engine ──

      tick: (adminMode = false, diseasesEnabled = true) => {
        const state = get();
        if (state.isPaused) return;

        const newDay = state.day + 1;
        const newMonth = getMonthFromDay(newDay);
        const newSeason = getSeason(newDay);
        const newAlerts: AlertData[] = [...state.alerts.slice(-30)];
        let scoreGain = 0;

        // Season change alert
        if (newSeason !== state.season) {
          newAlerts.push({
            id: `season-${Date.now()}`,
            type: "season",
            message: `${getSeasonEmoji(newSeason)} Nouvelle saison : ${getSeasonLabel(newSeason)} ! ${getSeasonalPlantingAdvice(newSeason)}`,
            emoji: getSeasonEmoji(newSeason), cellX: 0, cellY: 0,
            timestamp: Date.now(), severity: "info",
          });
        }

        // Pepiniere environment params
        const pepEnv: RealWeatherParams = {
          temperature: 20, humidity: 65, sunlightHours: 4.8, precipitation: 0,
          windSpeed: 0, uvIndex: 2, gameWeather: WEATHER_TYPES["sunny"], soilQuality: 75,
        };

        // ═══ TICK PÉPINIÈRE ═══
        const nursery = useNurseryStore.getState();
        const newPepiniere = nursery.pepiniere.map((plant) => {
          const plantDef = PLANTS[plant.plantDefId];
          if (!plantDef) return plant;
          const result = simulateDayWithRealWeather(plantDef, plant, pepEnv, "pepiniere", 0);
          newAlerts.push(...result.alerts.filter(
            (a) => a.type === "stage" || a.type === "harvest" || a.type === "pollinator" || a.severity === "critical"
          ));
          return result.newState;
        });

        // ═══ TICK MINI SERRES ═══
        const newMiniSerres = nursery.miniSerres.map((serre) => {
          const newSlots = serre.slots.map((row) =>
            row.map((plant) => {
              if (!plant) return null;
              const plantDef = PLANTS[plant.plantDefId];
              if (!plantDef) return plant;
              const result = simulateDayWithRealWeather(plantDef, plant, pepEnv, "pepiniere", 0);
              newAlerts.push(...result.alerts.filter(
                (a) => a.type === "stage" || a.type === "harvest" || a.type === "pollinator" || a.severity === "critical"
              ));
              return result.newState;
            })
          );
          return { ...serre, slots: newSlots };
        });

        let miniSerrePlantCount = 0;
        newMiniSerres.forEach((serre) => serre.slots.forEach((row) => row.forEach((plant) => { if (plant) miniSerrePlantCount++; })));

        // ═══ TICK JARDIN ═══
        let livingPlants = 0;
        const garden = useGardenStore.getState();
        const newGardenPlants = garden.gardenPlants.map((gp) => {
          const plantDef = PLANTS[gp.plantDefId];
          if (!plantDef) return gp;

          livingPlants++;
          let newPlant = { ...gp.plant };
          const inSerre = garden.gardenSerreZones.some(z =>
            gp.x >= z.x && gp.y >= z.y && gp.x < z.x + z.width && gp.y < z.y + z.height
          );

          // Frost check
          if (!adminMode && !inSerre && state.realWeather && isFrostRisk(state.realWeather)) {
            if (state.realWeather.current.temperature < 2) {
              newPlant.health = Math.max(5, newPlant.health - 5);
              newAlerts.push({
                id: `frost-jardin-${Date.now()}-${Math.random()}`,
                type: "weather",
                message: `🥶 Gel sur ${plantDef.emoji} ${plantDef.name} ! Croissance stoppée.`,
                emoji: "🥶", cellX: 0, cellY: 0,
                timestamp: Date.now(), severity: "warning",
              });
              newPlant.waterLevel = Math.max(0, newPlant.waterLevel - 2);
              return { ...gp, plant: newPlant };
            }
          }

          if (state.realWeather) {
            const effectiveZoneId = inSerre ? "serre_tile" : "garden";
            const isRaining = state.realWeather.current?.isRaining || false;
            if (isRaining && !inSerre) {
              newPlant.waterLevel = Math.min(100, newPlant.waterLevel + 50);
            }
            const env = getRealEnvironment(state.realWeather, effectiveZoneId);
            const precipitation = getZonePrecipitation(state.realWeather, effectiveZoneId);
            const weatherType = WEATHER_TYPES[state.realWeather.current?.gameWeather] || WEATHER_TYPES["sunny"];

            const realParams: RealWeatherParams = {
              temperature: env.temperature, humidity: env.humidity, sunlightHours: env.sunlightHours,
              precipitation, windSpeed: state.realWeather.current.windSpeed, uvIndex: state.realWeather.today.uvIndex,
              gameWeather: weatherType, soilQuality: env.soilQuality,
            };

            const result = simulateDayWithRealWeather(plantDef, newPlant, realParams, effectiveZoneId, 0);
            newAlerts.push(...result.alerts.filter(
              (a) => a.type === "stage" || a.type === "harvest" || a.type === "water" || a.type === "health" || a.type === "pest" || a.type === "disease" || a.type === "pollinator" || a.severity === "critical"
            ));
            if (result.newState.isHarvestable && !newPlant.isHarvestable) scoreGain += 200;
            newPlant = result.newState;
          } else {
            const newWeather = generateWeatherForMonth(newMonth);
            const baseEnv = getEnvironmentWithDailyVariation(getEnvironmentForMonth(newMonth));
            const result = simulateDay(plantDef, newPlant, baseEnv, newWeather, newSeason, 0);
            newAlerts.push(...result.alerts.filter(
              (a) => a.type === "stage" || a.type === "harvest" || a.type === "water" || a.type === "health" || a.type === "pest" || a.type === "disease" || a.type === "pollinator" || a.severity === "critical"
            ));
            if (result.newState.isHarvestable && !newPlant.isHarvestable) scoreGain += 200;
            newPlant = result.newState;
          }

          return { ...gp, plant: newPlant };
        });

        // Score
        scoreGain += livingPlants + newPepiniere.length + miniSerrePlantCount;

        const newWeather = state.realWeather
          ? (WEATHER_TYPES[state.realWeather.current?.gameWeather] || WEATHER_TYPES["sunny"])
          : generateWeatherForMonth(newMonth);

        const shop = useShopStore.getState();
        const newScore = shop.score + scoreGain;
        const newBest = Math.max(shop.bestScore, newScore);
        useShopStore.setState({ score: newScore, bestScore: newBest });

        // Achievement checks
        if (state.realWeather && state.realWeather.current?.isRaining) {
          useAchievementStore.getState().unlockAchievement('weather_master');
        }
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 6) {
          useAchievementStore.getState().unlockAchievement('night_owl');
        }

        // Sound
        const weatherType = state.realWeather?.current?.gameWeather || 'sunny';
        useSoundManager.getState().updateAmbientState(weatherType, hour);

        // Diseases toggle
        let finalGarden = newGardenPlants;
        let finalPepiniere = newPepiniere;
        let finalMiniSerres = newMiniSerres;
        if (!diseasesEnabled) {
          finalGarden = newGardenPlants.map(gp => ({
            ...gp, plant: { ...gp.plant, hasDisease: false, hasPest: false, diseaseDays: 0, pestDays: 0 }
          }));
          finalPepiniere = newPepiniere.map(p => ({
            ...p, hasDisease: false, hasPest: false, diseaseDays: 0, pestDays: 0
          }));
          finalMiniSerres = newMiniSerres.map(serre => ({
            ...serre,
            slots: serre.slots.map(row => row.map(p => p ? { ...p, hasDisease: false, hasPest: false, diseaseDays: 0, pestDays: 0 } : null)),
          }));
        }

        // Rain tank fill
        const isRaining = state.realWeather?.current?.isRaining || false;
        const precipMm = state.realWeather?.today?.precipitationMm ?? 0;
        const newTanks = garden.gardenTanks.map(tank => {
          if (!tank.isRainTank || tank.currentLevel >= tank.capacity) return tank;
          if (!isRaining) return tank;
          const litersCollected = precipMm * (tank.roofAreaM2 || 30) * (tank.efficiency || 0.8) / 1000;
          const newLevel = Math.min(tank.capacity, tank.currentLevel + litersCollected);
          return { ...tank, currentLevel: newLevel };
        });

        // Update all stores
        useNurseryStore.setState({ pepiniere: finalPepiniere, miniSerres: finalMiniSerres });
        useGardenStore.setState({ gardenPlants: finalGarden, gardenTanks: newTanks });

        // Save day
        if (newDay !== lastSavedDay) {
          lastSavedDay = newDay;
          try { localStorage.setItem('jardin-culture-day', String(newDay)); localStorage.setItem('jardin-culture-day-ts', String(Date.now())); } catch {}
        }

        set({
          day: newDay,
          season: newSeason,
          weather: newWeather,
          alerts: newAlerts,
        });
      },

      togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
      setSpeed: (speed) => set({ speed }),

      setRealWeather: (data: RealWeatherData) => set({ realWeather: data, weatherError: null }),
      setGPSCoords: (coords: GPSCoords) => {
        saveGPSCoords(coords);
        set({ gpsCoords: coords });
      },
      setWeatherLoading: (loading: boolean) => set({ weatherLoading: loading }),
      setWeatherError: (error: string | null) => set({ weatherError: error }),
      dismissAlert: (aid) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== aid) })),
      addAlert: (alert) => set((s) => ({ alerts: [...s.alerts.slice(-30), alert] })),

      initSimulation: () => {
        const today = getTodayDayOfYear();
        set({ day: today, season: getSeason(today) });
      },
    }),
    {
      name: 'botania-simulation',
      partialize: (_state) => ({}), // Ne rien persister — day est toujours calculé depuis getTodayDayOfYear()
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Toujours forcer la date du jour
          const today = getTodayDayOfYear();
          state.day = today;
          state.season = getSeason(today);
        }
      },
    }
  )
);