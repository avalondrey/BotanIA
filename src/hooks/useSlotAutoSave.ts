/**
 * useSlotAutoSave — Hook pour l'auto-sauvegarde par slot
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/game-store';
import { autoSave, hasAutoSave } from '@/lib/save-manager';

export function useSlotAutoSave() {
  const activeSlot = useGameStore((s) => s.activeSlot);
  const autoSaveEnabled = useGameStore((s) => s.autoSaveEnabled);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Vérifier s'il y a une sauvegarde auto
    hasAutoSave().then((exists) => {
      if (exists && !activeSlot) {
        console.log('[AutoSave] Sauvegarde auto trouvée, restauration...');
      }
    });

    // Auto-save toutes les 30 secondes si activé
    if (autoSaveEnabled) {
      timerRef.current = setInterval(async () => {
        try {
          const state = useGameStore.getState();
          // Ne sauvegarder que si le jeu est actif
          if (!state.isPaused || state.speed > 0) {
            await autoSave({
              day: state.day,
              season: state.season,
              score: state.score,
              coins: state.coins,
              gardenPlants: state.gardenPlants,
              miniSerres: state.miniSerres,
              weather: state.realWeather,
              // ajouter d'autres données si nécessaire
            });
            console.log('[AutoSave] Sauvegarde auto effectuée');
          }
        } catch (e) {
          console.error('[AutoSave] Erreur:', e);
        }
      }, 30000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeSlot, autoSaveEnabled]);
}
