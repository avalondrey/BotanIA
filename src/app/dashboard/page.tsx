'use client';

import { useState, useEffect } from 'react';
import PokedexPanel from './PokedexPanel';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f1117]">
        <div className="flex items-center gap-3 text-[#6e7681] text-sm">
          <div className="w-4 h-4 border-2 border-[#30363d] border-t-green-500 rounded-full animate-spin" />
          Chargement du dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 min-h-0">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f1117] z-10">
            <div className="flex items-center gap-3 text-[#6e7681] text-sm">
              <div className="w-4 h-4 border-2 border-[#30363d] border-t-green-500 rounded-full animate-spin" />
              Chargement du dashboard...
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f1117] z-10">
            <div className="text-center text-[#8b949e]">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="text-sm font-medium text-red-400 mb-2">Impossible de charger le dashboard</div>
              <div className="text-xs text-[#6e7681]">Vérifiez que le fichier public/dashboard.html existe.</div>
            </div>
          </div>
        )}

        <iframe
          src="/dashboard.html"
          className="w-full h-full border-0"
          title="BotanIA Agent Dashboard"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>

      <div className="shrink-0">
        <PokedexPanel />
      </div>
    </div>
  );
}
