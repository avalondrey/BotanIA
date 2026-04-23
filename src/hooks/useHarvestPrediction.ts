/**
 * useHarvestPrediction — Hook de prédiction de récolte
 *
 * Utilise le harvest-predictor avec les données temps réel du store.
 */
'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { predictHarvestDate, type HarvestPrediction } from '@/lib/harvest-predictor';

export function useHarvestPrediction(plantDefId: string, daysSincePlanting: number, accumulatedGDD: number): HarvestPrediction | null {
  const forecast = useGameStore((s) => s.realWeather?.forecast);

  return useMemo(() => {
    if (!forecast || forecast.length === 0) return null;
    return predictHarvestDate(
      plantDefId,
      daysSincePlanting,
      accumulatedGDD > 0 ? accumulatedGDD : null,
      forecast
    );
  }, [plantDefId, daysSincePlanting, accumulatedGDD, forecast]);
}
