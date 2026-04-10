'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker enregistré:', registration.scope);
        })
        .catch((error) => {
          console.error('[SW] Erreur enregistrement:', error);
        });
    }
  }, []);

  return null;
}

export default ServiceWorkerRegister;
