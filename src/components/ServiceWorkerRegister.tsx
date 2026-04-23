'use client';

import { useEffect } from 'react';

const SW_VERSION = 'botania-v4';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register SW — production AND dev (dev uses stale-while-revalidate)
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker enregistré:', registration.scope);

          // Check for updates on page load
          registration.update().catch(() => {});
        })
        .catch((error) => {
          console.error('[SW] Erreur enregistrement:', error);
        });

      // Listen for controller changes (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Nouveau contrôleur actif — rechargement suggéré');
      });
    }
  }, []);

  return null;
}

export default ServiceWorkerRegister;
