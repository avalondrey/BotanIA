/**
 * Composant IA JARDINIER - Affichage conseils quotidiens
 */

"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { getConseilQuotidien, type JardinContext, type IAResponse } from '@/lib/ia-jardinier';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export function IAJardinier() {
  const [conseil, setConseil] = useState<IAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const day = useGameStore((s) => s.day);
  const season = useGameStore((s) => s.season);
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const pepinierePlants = useGameStore((s) => s.pepinierePlants);
  const realWeather = useGameStore((s) => s.realWeather);
  const gpsCoords = useGameStore((s) => s.gpsCoords);

  // Charger conseil automatiquement au changement de jour
  useEffect(() => {
    chargerConseil();
  }, [day]);

  async function chargerConseil() {
    setLoading(true);
    setError(null);

    try {
      // Construire contexte jardin
      const plantes = [
        ...gardenPlants.map(gp => ({
          name: gp.plant.plantName,
          stage: gp.plant.stage,
          daysSincePlanting: gp.plant.daysSincePlanting,
          waterLevel: gp.plant.waterLevel,
          health: gp.plant.health,
        })),
        ...(pepinierePlants || [])
          .filter(p => p !== null)
          .map(p => ({
            name: p!.plantName,
            stage: p!.stage,
            daysSincePlanting: p!.daysSincePlanting,
            waterLevel: p!.waterLevel,
            health: p!.health,
          })),
      ];

      const context: JardinContext = {
        plantes,
        meteo: {
          temperature: realWeather?.current?.temperature || 20,
          precipitation: realWeather?.current?.precipitation || 0,
          conditions: realWeather?.current?.weathercode ? 
            `Code ${realWeather.current.weathercode}` : 'Ensoleillé',
        },
        saison: season,
        jour: day,
        gpsCoords: gpsCoords || undefined,
      };

      const response = await getConseilQuotidien(context);
      setConseil(response);
    } catch (err) {
      console.error('Erreur chargement conseil IA:', err);
      setError('Impossible de charger le conseil IA');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-900">IA Jardinier</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Analyse de votre jardin...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-red-900">Erreur IA</h3>
        </div>
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={chargerConseil}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!conseil) return null;

  const prioriteColors = {
    haute: 'from-red-50 to-orange-50 border-red-300',
    moyenne: 'from-yellow-50 to-amber-50 border-yellow-300',
    basse: 'from-green-50 to-emerald-50 border-green-300',
  };

  return (
    <div className={`bg-gradient-to-br ${prioriteColors[conseil.priorite]} border-2 rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-purple-900">IA Jardinier - Jour {day}</h3>
        <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded ${
          conseil.priorite === 'haute' ? 'bg-red-200 text-red-800' :
          conseil.priorite === 'moyenne' ? 'bg-yellow-200 text-yellow-800' :
          'bg-green-200 text-green-800'
        }`}>
          {conseil.priorite.toUpperCase()}
        </span>
      </div>

      {/* Conseil principal */}
      <div className="bg-white/60 rounded-lg p-3 mb-3">
        <p className="text-sm font-medium text-gray-800">{conseil.conseil}</p>
      </div>

      {/* Actions recommandées */}
      {conseil.actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-purple-700 uppercase">Actions recommandées :</p>
          <ul className="space-y-1">
            {conseil.actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bouton rafraîchir */}
      <button
        onClick={chargerConseil}
        className="mt-3 w-full px-3 py-2 bg-purple-600 text-white text-sm font-bold rounded hover:bg-purple-700 transition"
      >
        🔄 Nouveau conseil
      </button>
    </div>
  );
}
