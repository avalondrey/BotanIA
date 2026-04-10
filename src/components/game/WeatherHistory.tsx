/**
 * WeatherHistory — Historique météo 30 derniers jours
 * Graphique température et pluie avec Recharts
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, CloudRain, Thermometer, Calendar } from 'lucide-react';

interface DayWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  dayLabel: string;
}

export default function WeatherHistory() {
  const gpsCoords = useGameStore((s) => s.gpsCoords);
  const [history, setHistory] = useState<DayWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);

      try {
        const lat = gpsCoords?.lat || 48.8566;
        const lon = gpsCoords?.lon || 2.3522;

        // Open-Meteo Historical Weather API (gratuit, 90 jours max)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Erreur fetch météo');

        const data = await res.json();

        const days: DayWeather[] = (data.daily?.time || []).map((date: string, i: number) => {
          const d = new Date(date);
          return {
            date,
            dayLabel: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
            tempMax: data.daily?.temperature_2m_max?.[i] ?? 20,
            tempMin: data.daily?.temperature_2m_min?.[i] ?? 10,
            precipitation: data.daily?.precipitation_sum?.[i] ?? 0,
          };
        });

        setHistory(days);
      } catch (e) {
        console.error('[WeatherHistory]', e);
        setError('Historique indisponible');
        // Generate mock data for demo
        const mockDays: DayWeather[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          mockDays.push({
            date: d.toISOString().split('T')[0],
            dayLabel: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
            tempMax: 18 + Math.random() * 12,
            tempMin: 8 + Math.random() * 8,
            precipitation: Math.random() > 0.6 ? Math.random() * 15 : 0,
          });
        }
        setHistory(mockDays);
      }

      setLoading(false);
    }

    fetchHistory();
  }, [gpsCoords]);

  // Stats
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const avgMax = history.reduce((s, d) => s + d.tempMax, 0) / history.length;
    const avgMin = history.reduce((s, d) => s + d.tempMin, 0) / history.length;
    const totalRain = history.reduce((s, d) => s + d.precipitation, 0);
    const rainyDays = history.filter(d => d.precipitation > 0).length;
    return { avgMax, avgMin, totalRain, rainyDays };
  }, [history]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-3xl">⏳</div>
        <p className="ml-3 text-stone-500">Chargement historique...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-stone-400">
        <CloudRain className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center gap-1 text-xs text-orange-600 font-bold">
            <Thermometer className="w-3 h-3" />
            T° max moy
          </div>
          <p className="text-lg font-black text-orange-700">{stats?.avgMax.toFixed(1)}°C</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center gap-1 text-xs text-blue-600 font-bold">
            <Thermometer className="w-3 h-3" />
            T° min moy
          </div>
          <p className="text-lg font-black text-blue-700">{stats?.avgMin.toFixed(1)}°C</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3 border border-cyan-200">
          <div className="flex items-center gap-1 text-xs text-cyan-600 font-bold">
            <CloudRain className="w-3 h-3" />
            Pluie totale
          </div>
          <p className="text-lg font-black text-cyan-700">{stats?.totalRain.toFixed(1)} mm</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
          <div className="flex items-center gap-1 text-xs text-indigo-600 font-bold">
            <Calendar className="w-3 h-3" />
            Jours pluie
          </div>
          <p className="text-lg font-black text-indigo-700">{stats?.rainyDays} / 30</p>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-black uppercase text-stone-600">Températures (30 derniers jours)</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 8 }}
                interval={4}
                stroke="#9ca3af"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" unit="°" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '2px solid #e5e5e5', fontSize: 12 }}
                formatter={(value: number) => [`${value.toFixed(1)}°C`]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="tempMax"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Max"
              />
              <Line
                type="monotone"
                dataKey="tempMin"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Min"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Precipitation Chart */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <CloudRain className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-black uppercase text-stone-600">Précipitations (30 derniers jours)</h3>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 8 }}
                interval={4}
                stroke="#9ca3af"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" unit=" mm" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '2px solid #e5e5e5', fontSize: 12 }}
                formatter={(value: number) => [`${value.toFixed(1)} mm`]}
              />
              <Bar dataKey="precipitation" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Pluie" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
