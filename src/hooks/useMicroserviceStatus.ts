/**
 * useMicroserviceStatus — Surveillance de la connexion au microservice IA
 *
 * Pingue /health toutes les 30s. Expose :
 * - online : le microservice répond
 * - degraded : répond mais Ollama ou Qdrant est down
 * - offline : ne répond pas (circuit breaker ou réseau)
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { checkMicroHealth, getCircuitState, type MicroHealth } from '@/lib/micro-client';

export type MicroStatus = 'online' | 'degraded' | 'offline';

export function useMicroserviceStatus() {
  const [status, setStatus] = useState<MicroStatus>('offline');
  const [health, setHealth] = useState<MicroHealth | null>(null);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    const circuit = getCircuitState();
    if (circuit === 'open') {
      setStatus('offline');
      return;
    }

    const h = await checkMicroHealth();
    setHealth(h);
    setLastChecked(Date.now());

    if (!h) {
      setStatus('offline');
      return;
    }

    if (h.status === 'ok' && h.ollama?.available && h.qdrant?.available) {
      setStatus('online');
    } else if (h.status === 'degraded' || !h.ollama?.available || !h.qdrant?.available) {
      setStatus('degraded');
    } else {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [check]);

  return { status, health, lastChecked, check };
}
