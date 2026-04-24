'use client';

import { useState } from 'react';
import { usePlantCatalog } from '@/hooks/usePlantCatalog';

export default function PokedexPanel() {
  const { plants, loading, error, refetch } = usePlantCatalog();
  const [filter, setFilter] = useState('all');

  const filtered = plants.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'complete') return p.overallStatus === '✅ COMPLET';
    if (filter === 'incomplete') return p.overallStatus !== '✅ COMPLET';
    return true;
  });

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 m-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">🌿 Catalogue Pokedex ({plants.length})</h2>
        <div className="flex gap-2">
          {['all', 'complete', 'incomplete'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                filter === f
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-[#21262d] text-[#8b949e] border-[#30363d] hover:bg-[#30363d]'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'complete' ? '✅ Complètes' : '❌ Incomplètes'}
            </button>
          ))}
          <button
            onClick={() => refetch()}
            className="px-2 py-1 text-[10px] font-bold rounded bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:bg-[#30363d]"
          >
            🔄
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-[#6e7681] text-xs text-center py-4">Chargement du catalogue...</div>
      )}
      {error && (
        <div className="text-red-400 text-xs text-center py-4">
          Erreur: {error}
          <br />
          <span className="text-[#6e7681]">Vérifiez que le microservice est en ligne.</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
        {filtered.map((p) => (
          <div
            key={p.plantDefId}
            className={`p-2 rounded-lg border text-center transition-all ${
              p.overallStatus === '✅ COMPLET'
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-red-500/30 bg-red-500/5'
            }`}
          >
            <div className="text-lg mb-1">{p.emoji}</div>
            <div className="text-[10px] font-bold text-white truncate">{p.displayName}</div>
            <div className="text-[9px] text-[#6e7681] font-mono truncate">{p.plantDefId}</div>
            {p.plantFamily && (
              <div className="text-[8px] text-green-400 mt-1">{p.plantFamily}</div>
            )}
            <div className={`text-[8px] mt-1 font-bold ${
              p.overallStatus === '✅ COMPLET' ? 'text-green-400' : 'text-red-400'
            }`}>
              {p.overallStatus}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
