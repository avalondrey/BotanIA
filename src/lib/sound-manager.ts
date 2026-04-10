import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playSound, startAmbientSound, stopAmbientSound, SoundType } from './sound-system';

interface SoundManagerState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  updateAmbientState: (weather: string, hour: number) => void;
  playEventSound: (event: SoundType) => void;
}

export const useSoundManager = create<SoundManagerState>()(
  persist(
    (set, get) => ({
      enabled: true,
      setEnabled: (enabled) => {
        set({ enabled });
        if (!enabled) stopAmbientSound();
      },
      updateAmbientState: (weather, hour) => {
        const { enabled } = get();
        if (!enabled) return;

        // Priority: Rain/Storm > Day/Night
        if (weather === 'rain' || weather === 'stormy') {
          startAmbientSound('rain');
        } else {
          // Day (6-18) vs Night (18-6)
          if (hour >= 6 && hour < 18) {
            startAmbientSound('sunny');
          } else {
            // For night, we stop ambient as there's no dedicated 'night' loop in sound-system.ts yet
            stopAmbientSound();
          }
        }
      },
      playEventSound: (event) => {
        const { enabled } = get();
        if (!enabled) return;
        playSound(event);
      },
    }),
    { name: 'botania-sound-settings' }
  )
);
