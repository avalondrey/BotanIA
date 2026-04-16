"use client";

/**
 * WeatherForecast — Prévisions météo 7 jours avec alertes
 *
 * Utilise les données Open-Meteo (forecast 7 jours) pour afficher
 * les prévisions et émettre des alertes gel/canicule/tempête via EventBus.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { type RealWeatherData, type WeatherForecastDay } from "@/lib/weather-service";
import { eventBus } from "@/lib/event-bus";
import { AlertTriangle, Thermometer, Droplets, Wind, Sun, Umbrella, Snowflake } from "lucide-react";

// Seuils d'alerte
const FROST_THRESHOLD = 2;     // Température min en °C pour alerte gel
const HEAT_THRESHOLD = 35;     // Température max en °C pour alerte canicule
const STORM_WIND_THRESHOLD = 60; // Vent max en km/h pour alerte tempête

interface WeatherAlert {
  type: 'frost' | 'heatwave' | 'storm';
  dayOffset: number;
  message: string;
  severity: 'warning' | 'critical';
}

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function WeatherForecast() {
  const realWeather = useGameStore((s) => s.realWeather) as RealWeatherData | null;
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [alertDismissed, setAlertDismissed] = useState<Set<string>>(new Set());
  const emittedAlertsRef = useRef<Set<string>>(new Set());

  const forecast: WeatherForecastDay[] = useMemo(() => {
    if (!realWeather?.forecast?.length) return [];
    return realWeather.forecast;
  }, [realWeather]);

  // Analyser les prévisions pour détecter les alertes
  useEffect(() => {
    if (!forecast.length) return;

    const newAlerts: WeatherAlert[] = [];
    const emitted = emittedAlertsRef.current;

    for (let i = 0; i < forecast.length; i++) {
      const day = forecast[i];
      const dayOffset = i;

      // Alerte gel
      if (day.tempMin <= FROST_THRESHOLD) {
        const severity: 'warning' | 'critical' = day.tempMin <= -2 ? 'critical' : 'warning';
        newAlerts.push({
          type: 'frost',
          dayOffset,
          message: severity === 'critical'
            ? `Gel sévère prévu (${day.tempMin.toFixed(0)}°C) — Protéger toutes les cultures`
            : `Risque de gel (${day.tempMin.toFixed(0)}°C) — Protéger les plantes gélives`,
          severity,
        });
        const key = `frost:${dayOffset}:${day.tempMin.toFixed(0)}`;
        if (!emitted.has(key)) {
          eventBus.emit({ type: 'frost:warning', dayOffset, minTemp: day.tempMin });
          emitted.add(key);
        }
      }

      // Alerte canicule
      if (day.tempMax >= HEAT_THRESHOLD) {
        newAlerts.push({
          type: 'heatwave',
          dayOffset,
          message: `Canicule prévue (${day.tempMax.toFixed(0)}°C) — Ombrer et arroser abondamment`,
          severity: 'critical',
        });
        const key = `heat:${dayOffset}:${day.tempMax.toFixed(0)}`;
        if (!emitted.has(key)) {
          eventBus.emit({ type: 'heatwave:warning', dayOffset, maxTemp: day.tempMax });
          emitted.add(key);
        }
      }

      // Alerte tempête (vent fort)
      if (day.windSpeedMax >= STORM_WIND_THRESHOLD) {
        newAlerts.push({
          type: 'storm',
          dayOffset,
          message: `Vent fort prévu (${day.windSpeedMax.toFixed(0)} km/h) — Tuteurer les plantes hautes`,
          severity: 'warning',
        });
        const key = `storm:${dayOffset}:${day.windSpeedMax.toFixed(0)}`;
        if (!emitted.has(key)) {
          eventBus.emit({ type: 'storm:warning', dayOffset });
          emitted.add(key);
        }
      }
    }

    setAlerts(newAlerts);
  }, [forecast]);

  const dismissAlert = useCallback((key: string) => {
    setAlertDismissed(prev => new Set([...prev, key]));
  }, []);

  if (!realWeather || !forecast.length) {
    return (
      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-[3px] border-blue-300 rounded-2xl shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center gap-2 mb-2">
          <Sun className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-black uppercase text-blue-700">Prévisions météo</h3>
        </div>
        <p className="text-xs text-stone-400 text-center py-4">
          Chargement des prévisions...
        </p>
      </div>
    );
  }

  const today = forecast[0];

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-[3px] border-blue-300 rounded-2xl shadow-[4px_4px_0_0_#000]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sun className="w-5 h-5 text-blue-500" />
        <h3 className="text-sm font-black uppercase text-blue-700">Prévisions 7 jours</h3>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.filter(a => !alertDismissed.has(`${a.type}-${a.dayOffset}`)).map((alert) => {
          const key = `${alert.type}-${alert.dayOffset}`;
          const isCritical = alert.severity === 'critical';
          const dayLabel = alert.dayOffset === 0 ? "Aujourd'hui" : alert.dayOffset === 1 ? "Demain" : `J+${alert.dayOffset}`;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-2 p-2.5 rounded-xl border-2 flex items-start gap-2 ${
                alert.type === 'frost'
                  ? isCritical ? 'bg-blue-50 border-blue-400' : 'bg-blue-50/50 border-blue-200'
                  : alert.type === 'heatwave'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-amber-50 border-amber-400'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {alert.type === 'frost' && <Snowflake className={`w-4 h-4 ${isCritical ? 'text-blue-600' : 'text-blue-400'}`} />}
                {alert.type === 'heatwave' && <Thermometer className="w-4 h-4 text-red-500" />}
                {alert.type === 'storm' && <Wind className="w-4 h-4 text-amber-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-stone-500">{dayLabel}</span>
                <p className={`text-[11px] font-bold ${isCritical ? 'text-red-700' : 'text-stone-700'}`}>
                  {alert.message}
                </p>
              </div>
              <button
                className="shrink-0 text-stone-400 hover:text-stone-600"
                onClick={() => dismissAlert(key)}
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Today summary */}
      <div className="mb-3 p-3 bg-white rounded-xl border-2 border-blue-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xl">{today?.weatherEmoji ?? '☀️'}</span>
          <div className="text-right">
            <span className="text-lg font-black text-stone-800">{realWeather.current.temperature.toFixed(0)}°C</span>
            <div className="text-[10px] text-stone-400 font-bold">
              {today ? `${today.tempMin.toFixed(0)}°C – ${today.tempMax.toFixed(0)}°C` : ''}
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-[10px] text-stone-500">
          {today && (
            <>
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{today.precipitationMm.toFixed(1)}mm</span>
              <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{today.windSpeedMax.toFixed(0)} km/h</span>
              <span className="flex items-center gap-1"><Sun className="w-3 h-3" />UV {today.uvIndex.toFixed(0)}</span>
            </>
          )}
        </div>
      </div>

      {/* 7-day forecast */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {forecast.map((day, i) => {
          const date = new Date(day.date);
          const dayName = i === 0 ? "Auj" : i === 1 ? "Dem" : DAY_NAMES[date.getDay()];
          const isFrost = day.tempMin <= FROST_THRESHOLD;
          const isHeat = day.tempMax >= HEAT_THRESHOLD;
          const isStorm = day.windSpeedMax >= STORM_WIND_THRESHOLD;
          const hasAlert = isFrost || isHeat || isStorm;

          return (
            <div
              key={day.date}
              className={`flex-shrink-0 flex flex-col items-center p-1.5 rounded-xl border-2 min-w-[42px] transition-all ${
                i === 0
                  ? "bg-blue-50 border-blue-300 shadow-[2px_2px_0_0_#3b82f6]"
                  : hasAlert
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-white border-stone-200"
              }`}
            >
              <span className="text-[9px] font-bold text-stone-500">{dayName}</span>
              <span className="text-base">{day.weatherEmoji}</span>
              <span className="text-[10px] font-black text-stone-700">{day.tempMax.toFixed(0)}°</span>
              <span className="text-[9px] text-stone-400">{day.tempMin.toFixed(0)}°</span>
              {day.precipitationMm > 0 && (
                <span className="text-[7px] text-blue-500 font-bold">
                  <Umbrella className="w-2 h-2 inline" />{day.precipitationMm.toFixed(0)}
                </span>
              )}
              {isFrost && <span className="text-[8px] text-blue-600">❄️</span>}
              {isHeat && <span className="text-[8px] text-red-500">🌡️</span>}
              {isStorm && <span className="text-[8px] text-amber-500">💨</span>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-2 text-[8px] text-stone-400">
        <span>❄️ Gel</span>
        <span>🌡️ Canicule</span>
        <span>💨 Vent fort</span>
        <span className="ml-auto flex items-center gap-0.5">
          <Umbrella className="w-2.5 h-2.5" /> Pluie (mm)
        </span>
      </div>
    </div>
  );
}