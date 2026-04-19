/**
 * useServiceWorker — Enregistrement et gestion du Service Worker
 * Appelé au démarrage de l'application
 */
import { useEffect, useState, useRef } from 'react';

export type SWState = 'registered' | 'updated' | 'offline' | 'error';

export function useServiceWorker() {
  const [swState, setSwState] = useState<SWState | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    async function registerSW() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        registrationRef.current = registration;

        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.active;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        // Check if we're offline
        if (!navigator.onLine) {
          setSwState('offline');
        } else {
          setSwState('registered');
        }

        // Listen for online/offline events
        window.addEventListener('online', () => {
          setSwState('registered');
          localStorage.setItem('botania-last-sync', new Date().toISOString());
        });
        window.addEventListener('offline', () => setSwState('offline'));

      } catch (err) {
        console.warn('SW registration failed:', err);
        setSwState('error');
      }
    }

    registerSW();

    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);

  async function applyUpdate() {
    if (!registrationRef.current) return;
    await registrationRef.current.unregister();
    window.location.reload();
  }

  return { swState, updateAvailable, applyUpdate };
}

export function useSWUpdateToast(updateAvailable: boolean, onApply: () => void) {
  useEffect(() => {
    if (!updateAvailable) return;
    console.log('🔄 Nouvelle version de BotanIA disponible');
  }, [updateAvailable, onApply]);
}
