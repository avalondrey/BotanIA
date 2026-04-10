/**
 * IA JARDINIER — Conseils géolocalisés avec GDD, météo dynamique & compagnonnage
 */
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/game-store';
import { getConseilQuotidien, type JardinContext, type IAResponse } from '@/lib/ia-jardinier';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface IAJardinierProps {
  className?: string;
}

export function IAJardinier({ className = '' }: IAJardinierProps) {
  const [conseil, setConseil]   = useState<IAResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [engine, setEngine]     = useState<'groq' | 'ollama'>('ollama');

  // Prevent StrictMode double-invocation from sending duplicate API calls
  const loadKeyRef = useRef<string>('');

  const day          = useGameStore((s) => s.day);
  const season       = useGameStore((s) => s.season);
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const realWeather  = useGameStore((s) => s.realWeather);
  const gpsCoords    = useGameStore((s) => s.gpsCoords);

  useEffect(() => {
    const key = `${day}-${engine}`;
    if (key === loadKeyRef.current) return; // skip duplicate (StrictMode double-invoke)
    chargerConseil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, engine]);

  const chargerConseil = useCallback(async () => {
    const key = `${day}-${engine}`;
    if (key !== loadKeyRef.current) return; // ignore stale calls from previous render
    setLoading(true); setError(null);
    try {
      const currentKey = `${day}-${engine}`;
      if (currentKey !== loadKeyRef.current) { setLoading(false); return; } // stale — ignore
      const plantes = gardenPlants.map(gp => ({
        plantDefId:        gp.plantDefId,
        name:              gp.plantDefId,
        stage:             gp.plant.stage,
        daysSincePlanting: gp.plant.daysSincePlanting,
        waterLevel:        gp.plant.waterLevel,
        health:            gp.plant.health,
        hasDisease:        gp.plant.hasDisease,
        hasPest:           gp.plant.hasPest,
        x:                 gp.x,
        y:                 gp.y,
      }));

      const rw = realWeather;
      const ctx: JardinContext = {
        plantes,
        meteo: {
          temperature:   rw?.current?.temperature ?? 18,
          tMin:          rw?.today?.tempMin,
          tMax:          rw?.today?.tempMax,
          precipitation: (rw as any)?.today?.precipitation_sum ?? 0,
          humidity:      rw?.current?.humidity    ?? 65,
          windSpeed:     rw?.current?.windSpeed   ?? 10,
          conditions:    rw?.description          ?? rw?.current?.gameWeather ?? 'Ensoleillé',
        },
        saison: season,
        jour:   day,
        gpsCoords: gpsCoords ? { lat: gpsCoords.lat, lon: gpsCoords.lon } : undefined,
        engine,
      };

      let res;
      try {
        res = await Promise.race([
          getConseilQuotidien(ctx),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 20000)
          ),
        ]);
      } catch (err) {
        if ((err as Error).message === 'timeout') {
          setError('Ollama met trop de temps à répondre. Réessaie dans quelques secondes.');
        } else {
          setError('Impossible de charger le conseil IA');
        }
        setLoading(false);
        return;
      }
      setConseil(res);
    } catch (err) {
      console.error('Erreur IA Jardinier:', err);
      setError('Impossible de charger le conseil IA');
    } finally {
      setLoading(false);
    }
  }, [gardenPlants, realWeather, season, day, gpsCoords, engine]);


  // ── Loading ──
  if (loading) return (
    <div className={`bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-purple-900">🌱 IA Jardinier</h3>
      </div>
      <div className="flex items-center gap-2 text-sm text-purple-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Analyse GDD + météo + compagnonnage...</span>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className={`bg-red-50 border-2 border-red-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="font-bold text-red-900">Erreur IA</h3>
      </div>
      <p className="text-sm text-red-700">{error}</p>
      <button onClick={chargerConseil} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
        Réessayer
      </button>
    </div>
  );

  if (!conseil) return (
    <div className={`bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-purple-900">🌱 IA Jardinier</h3>
      </div>
      <div className="flex items-center gap-2 text-sm text-purple-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Chargement...</span>
      </div>
    </div>
  );

  const prioStyle = {
    haute:   'from-red-50 to-orange-50 border-red-300',
    moyenne: 'from-yellow-50 to-amber-50 border-yellow-300',
    basse:   'from-green-50 to-emerald-50 border-green-300',
  }[conseil.priorite];

  const prioBadge = {
    haute:   'bg-red-200 text-red-800',
    moyenne: 'bg-yellow-200 text-yellow-800',
    basse:   'bg-green-200 text-green-800',
  }[conseil.priorite];


  return (
    <div className={`bg-gradient-to-br ${prioStyle} border-2 rounded-xl p-4 space-y-3 ${className}`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
        <h3 className="font-bold text-purple-900 text-sm">🌱 IA Jardinier — Jour {day}</h3>
        <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded ${prioBadge}`}>
          {conseil.priorite.toUpperCase()}
        </span>
        {conseil.source && (
          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-100 text-purple-700">
            {conseil.source}
          </span>
        )}
      </div>

      {/* ── Sélecteur moteur ── */}
      <div className="flex gap-2 text-[10px]">
        {(['groq','ollama'] as const).map(e => (
          <button key={e} onClick={() => setEngine(e)}
            className={`px-2 py-1 rounded font-bold transition ${engine === e ? 'bg-purple-600 text-white' : 'bg-white/60 text-purple-700'}`}>
            {e === 'groq' ? '⚡ Groq' : '🏠 Ollama'}
          </button>
        ))}
      </div>

      {/* ── Alertes phytosanitaires prédictives ── */}
      {conseil.alertes && conseil.alertes.length > 0 && (
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-2 space-y-1">
          <p className="text-[10px] font-black text-orange-700 uppercase">⚠️ Alertes préventives</p>
          {conseil.alertes.map((a, i) => (
            <p key={i} className="text-xs text-orange-800">{a}</p>
          ))}
        </div>
      )}

      {/* ── Conseil principal ── */}
      <div className="bg-white/70 rounded-lg p-3">
        <p className="text-sm font-medium text-gray-800 leading-relaxed">{conseil.conseil}</p>
      </div>

      {/* ── Actions ── */}
      {conseil.actions.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-black text-purple-700 uppercase">Actions du jour</p>
          <ul className="space-y-1">
            {conseil.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-purple-500 mt-0.5 font-bold">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Badges compagnonnage ── */}
      {conseil.badges && conseil.badges.length > 0 && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-2 space-y-1">
          <p className="text-[10px] font-black text-green-700 uppercase">🏆 Badges débloqués</p>
          {conseil.badges.map((b, i) => (
            <p key={i} className="text-xs text-green-800">{b}</p>
          ))}
        </div>
      )}

      {/* ── Refresh ── */}
      <button onClick={chargerConseil}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition">
        <RefreshCw className="w-3 h-3" />
        Actualiser le conseil
      </button>
    </div>
  );
}
