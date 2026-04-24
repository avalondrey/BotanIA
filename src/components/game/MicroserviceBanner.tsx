'use client';

import { useMicroserviceStatus } from '@/hooks/useMicroserviceStatus';

export function MicroserviceBanner() {
  const { status } = useMicroserviceStatus();

  if (status === 'online') return null;

  const isDegraded = status === 'degraded';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-1.5 text-center text-[11px] font-bold shadow-md ${
        isDegraded
          ? 'bg-amber-400 text-amber-900'
          : 'bg-red-600 text-white'
      }`}
    >
      {isDegraded
        ? '⚠️ Microservice IA dégradé — Lia fonctionne en mode limité'
        : '🔴 Microservice IA hors ligne — Les fonctionnalités IA sont indisponibles'}
    </div>
  );
}
