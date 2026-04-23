/**
 * useWeatherAlerts — Hook d'alertes météo intelligentes
 * Analyse les prévisions Open-Meteo et pousse des notifications
 * quand des conditions dangereuses sont détectées pour le jardin.
 *
 * Alertes gérées :
 *   - Gel : température min < 2°C dans les 48h
 *   - Canicule : température max > 32°C dans les 48h
 *   - Orage : pluie > 20mm ou vent > 50 km/h dans les 24h
 *   - Sécheresse : 3 jours consécutifs sans pluie ET ET0 élevé
 *   - Vent violent : vent max > 40 km/h (risque de déracinement jeunes plants)
 */

import { useEffect, useRef } from 'react';
import { eventBus } from '@/lib/event-bus';
import { useNotificationStore } from '@/store/notification-store';
import type { WeatherForecastDay } from '@/lib/weather-service';

interface WeatherAlertCheck {
  lastFrostAlert?: number;
  lastHeatAlert?: number;
  lastStormAlert?: number;
  lastDroughtAlert?: number;
  lastWindAlert?: number;
}

/** Délai minimum entre 2 alertes du même type (ms) */
const ALERT_COOLDOWN = 4 * 60 * 60 * 1000; // 4h

function now() {
  return Date.now();
}

function canAlert(check: WeatherAlertCheck, key: keyof WeatherAlertCheck): boolean {
  const last = check[key];
  if (!last) return true;
  return now() - last > ALERT_COOLDOWN;
}

export function useWeatherAlerts(forecast: WeatherForecastDay[] | undefined) {
  const checkRef = useRef<WeatherAlertCheck>({});
  const push = useNotificationStore((s) => s.pushNotification);

  useEffect(() => {
    if (!forecast || forecast.length === 0) return;

    const check = checkRef.current;
    const today = new Date().toISOString().split('T')[0];
    const upcoming = forecast.filter((d) => d.date >= today);

    // ── 1. Alerte GEL ──
    const frostDays = upcoming.filter((d) => d.tempMin <= 2);
    if (frostDays.length > 0 && canAlert(check, 'lastFrostAlert')) {
      const day = frostDays[0];
      eventBus.emit({
        type: 'frost:warning',
        dayOffset: forecast.indexOf(day),
        minTemp: day.tempMin,
      });
      check.lastFrostAlert = now();
    }

    // ── 2. Alerte CANICULE ──
    const heatDays = upcoming.filter((d) => d.tempMax >= 32);
    if (heatDays.length > 0 && canAlert(check, 'lastHeatAlert')) {
      const day = heatDays[0];
      eventBus.emit({
        type: 'heatwave:warning',
        dayOffset: forecast.indexOf(day),
        maxTemp: day.tempMax,
      });
      check.lastHeatAlert = now();
    }

    // ── 3. Alerte ORAGE ──
    const stormDays = upcoming.filter((d) => d.precipitationMm > 20 || d.windSpeedMax > 50);
    if (stormDays.length > 0 && canAlert(check, 'lastStormAlert')) {
      const day = stormDays[0];
      eventBus.emit({ type: 'storm:warning', dayOffset: forecast.indexOf(day) });
      push({
        message: `Orage prévu ${day.date === today ? 'aujourd\'hui' : 'demain'} : ${Math.round(day.precipitationMm)}mm de pluie, vent jusqu'à ${Math.round(day.windSpeedMax)} km/h. Protégez vos plants !`,
        emoji: '⛈️',
        severity: 'warning',
      });
      check.lastStormAlert = now();
    }

    // ── 4. Alerte SÉCHERESSE ──
    // 3 jours consécutifs sans pluie ET temp max > 25°C
    let dryStreak = 0;
    for (const d of upcoming) {
      if (d.precipitationMm < 1 && d.tempMax > 25) dryStreak++;
      else dryStreak = 0;
      if (dryStreak >= 3 && canAlert(check, 'lastDroughtAlert')) {
        push({
          message: `Sécheresse : 3 jours sans pluie et forte chaleur. Pensez à arroser vos cultures sensiblement.`,
          emoji: '🌵',
          severity: 'warning',
        });
        check.lastDroughtAlert = now();
        break;
      }
    }

    // ── 5. Alerte VENT VIOLENT ──
    const windDays = upcoming.filter((d) => d.windSpeedMax >= 40);
    if (windDays.length > 0 && canAlert(check, 'lastWindAlert')) {
      const day = windDays[0];
      push({
        message: `Vent violent prévu ${day.date === today ? 'aujourd\'hui' : 'demain'} (${Math.round(day.windSpeedMax)} km/h). Stabilisez les jeunes plants et fermez les serres.`,
        emoji: '💨',
        severity: 'warning',
      });
      check.lastWindAlert = now();
    }
  }, [forecast, push]);
}
