/**
 * Tests pour weather-alert-engine.ts
 */
import { describe, it, expect } from 'vitest';
import {
  analyzeCropWeatherAlerts,
  summarizeAlerts,
  filterAlerts,
  getSafePlantingDays,
} from '../weather-alert-engine';
import type { WeatherForecastDay, RealWeatherData } from '../weather-service';
import type { PlantInfo } from '../weather-alert-engine';

function makeWeather(forecast: WeatherForecastDay[]): RealWeatherData {
  return {
    current: { temperature: 15, weatherCode: 0, weatherEmoji: '☀️', weatherDescription: 'Ciel dégagé', gameWeather: 'sunny', isRaining: false, windSpeed: 10, humidity: 60, timestamp: Date.now() },
    today: { tempMax: 20, tempMin: 10, uvIndex: 5, date: '2026-04-19', precipitationMm: 0 },
    forecast,
    description: 'OK',
  };
}

const tomato: PlantInfo = { plantDefId: 'tomato', plantName: 'Tomate', plantEmoji: '🍅' };
const carrot: PlantInfo = { plantDefId: 'carrot', plantName: 'Carotte', plantEmoji: '🥕' };
const lettuce: PlantInfo = { plantDefId: 'lettuce', plantName: 'Salade', plantEmoji: '🥬' };

describe('weather-alert-engine', () => {
  describe('analyzeCropWeatherAlerts', () => {
    it('aucune alerte par temps normal', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 22, tempMin: 12, precipitationMm: 2, windSpeedMax: 15, weatherCode: 2, weatherEmoji: '⛅', uvIndex: 5 },
        { date: '2026-04-20', tempMax: 24, tempMin: 13, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 6 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato, carrot]);
      expect(alerts.filter(a => a.severity === 'critical')).toHaveLength(0);
    });

    it('détecte alerte gel pour tomate (sensible)', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 8, tempMin: 1, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 5 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const frost = alerts.find(a => a.type === 'frost' && a.plantDefId === 'tomato');
      expect(frost).toBeDefined();
      expect(frost!.severity).toBe('critical');
      expect(frost!.riskLevel).toBeGreaterThanOrEqual(90);
    });

    it('pas dalerte gel pour carotte (rustique)', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 10, tempMin: 1, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 5 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [carrot]);
      const frost = alerts.find(a => a.type === 'frost');
      expect(frost).toBeUndefined();
    });

    it('détecte canicule pour tomate', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 38, tempMin: 22, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 8 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const heat = alerts.find(a => a.type === 'heat');
      expect(heat).toBeDefined();
      expect(heat!.severity).toBe('critical');
    });

    it('détecte montée en graine pour salade par forte chaleur', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 32, tempMin: 18, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 7 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [lettuce]);
      const heat = alerts.find(a => a.type === 'heat' && a.plantDefId === 'lettuce');
      expect(heat).toBeDefined();
      expect(heat!.severity).toBe('warning');
    });

    it('détecte tempête (vent >= 50 km/h)', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 20, tempMin: 12, precipitationMm: 0, windSpeedMax: 55, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 5 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const wind = alerts.find(a => a.type === 'strongWind');
      expect(wind).toBeDefined();
      expect(wind!.severity).toBe('warning');
    });

    it('détecte fortes pluies', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 18, tempMin: 12, precipitationMm: 25, windSpeedMax: 20, weatherCode: 61, weatherEmoji: '🌧️', uvIndex: 2 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const rain = alerts.find(a => a.type === 'heavyRain');
      expect(rain).toBeDefined();
    });

    it('détecte froid snap pour plante sensible', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 8, tempMin: 4, precipitationMm: 0, windSpeedMax: 10, weatherCode: 3, weatherEmoji: '☁️', uvIndex: 3 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const cold = alerts.find(a => a.type === 'coldSnap');
      expect(cold).toBeDefined();
    });

    it('avertissement sécheresse après 5 jours sans pluie', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 25, tempMin: 12, precipitationMm: 0, windSpeedMax: 15, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 6 },
        { date: '2026-04-20', tempMax: 26, tempMin: 13, precipitationMm: 0, windSpeedMax: 15, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 6 },
        { date: '2026-04-21', tempMax: 27, tempMin: 14, precipitationMm: 0, windSpeedMax: 15, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 6 },
        { date: '2026-04-22', tempMax: 28, tempMin: 15, precipitationMm: 0, windSpeedMax: 15, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 7 },
        { date: '2026-04-23', tempMax: 29, tempMin: 16, precipitationMm: 0, windSpeedMax: 15, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 7 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const drought = alerts.find(a => a.type === 'drought');
      expect(drought).toBeDefined();
      expect(drought!.severity).toBe('warning');
    });

    it('alertes critiques prioritaires sur warning dans le tri', () => {
      const weather = makeWeather([
        { date: '2026-04-19', tempMax: 38, tempMin: 22, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 8 },
        { date: '2026-04-19', tempMax: 8, tempMin: 1, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 5 },
      ]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      expect(alerts[0].severity).toBe('critical');
    });
  });

  describe('summarizeAlerts', () => {
    it('résumé vide', () => {
      const result = summarizeAlerts([]);
      expect(result.total).toBe(0);
      expect(result.critical).toBe(0);
      expect(result.warning).toBe(0);
      expect(result.summary).toContain('Aucune alerte');
    });

    it('résumé avec critiques', () => {
      const weather = makeWeather([{ date: '2026-04-19', tempMax: 38, tempMin: 22, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 8 }]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const result = summarizeAlerts(alerts);
      expect(result.critical).toBeGreaterThan(0);
      expect(result.summary).toContain('critique');
    });
  });

  describe('filterAlerts', () => {
    it('filtre par plante', () => {
      const weather = makeWeather([{ date: '2026-04-19', tempMax: 38, tempMin: 22, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 8 }]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato, carrot]);
      const tomatoAlerts = filterAlerts(alerts, { plantDefId: 'tomato' });
      expect(tomatoAlerts.every(a => a.plantDefId === 'tomato')).toBe(true);
    });

    it('filtre par sévérité', () => {
      const weather = makeWeather([{ date: '2026-04-19', tempMax: 38, tempMin: 22, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 8 }]);
      const alerts = analyzeCropWeatherAlerts(weather, [tomato]);
      const critical = filterAlerts(alerts, { severity: 'critical' });
      expect(critical.every(a => a.severity === 'critical')).toBe(true);
    });
  });

  describe('getSafePlantingDays', () => {
    it('gelee = jour non sûr pour tomate', () => {
      const weather = makeWeather([{ date: '2026-04-19', tempMax: 8, tempMin: 1, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 5 }]);
      const safe = getSafePlantingDays(weather, 'tomato');
      expect(safe).toHaveLength(0);
    });

    it('temps normal = jour sûr pour tomate', () => {
      const weather = makeWeather([{ date: '2026-04-19', tempMax: 22, tempMin: 12, precipitationMm: 2, windSpeedMax: 15, weatherCode: 2, weatherEmoji: '⛅', uvIndex: 5 }]);
      const safe = getSafePlantingDays(weather, 'tomato');
      expect(safe).toHaveLength(1);
    });

    it('carotte rustique = jour sûr même par temps froid', () => {
      const weather = makeWeather([{ date: '2026-04-19', tempMax: 10, tempMin: 2, precipitationMm: 0, windSpeedMax: 10, weatherCode: 0, weatherEmoji: '☀️', uvIndex: 3 }]);
      const safe = getSafePlantingDays(weather, 'carrot');
      expect(safe).toHaveLength(1);
    });
  });
});
