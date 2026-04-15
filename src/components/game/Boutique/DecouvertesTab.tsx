"use client";

import { motion } from "framer-motion";

interface DiscoveredPlant {
  id: string;
  name: string;
  emoji: string;
  discoveredAt: number;
  source: 'photo' | 'manual';
}

interface DecouvertesTabProps {
  discoveredPlants: DiscoveredPlant[];
}

export function DecouvertesTab({
  discoveredPlants,
}: DecouvertesTabProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-[3px] border-emerald-300 rounded-2xl shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center gap-3">
          <div className="text-4xl">📸</div>
          <div>
            <h3 className="text-sm font-black uppercase">Plantes découvertes par photo</h3>
            <p className="text-[8px] text-stone-500">Plantes identifiées et ajoutées via l&apos;analyseur IA — Votre herbier personnel</p>
          </div>
        </div>
      </div>

      {discoveredPlants && discoveredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {discoveredPlants.map((plant) => {
            const age = Math.floor((Date.now() - plant.discoveredAt) / (1000 * 60 * 60 * 24));
            return (
              <motion.div
                key={plant.id}
                layout
                className="relative bg-white border-[3px] border-emerald-400 rounded-2xl shadow-[4px_4px_0_0_#000] overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
                <div className="relative h-32 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                  <span className="text-5xl">{plant.emoji || '🌱'}</span>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded-lg">
                    📸 Photo
                  </div>
                  {plant.source === 'manual' && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black rounded-lg">
                      ✍️ Manuel
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{plant.emoji || '🌱'}</span>
                    <div>
                      <h3 className="text-[11px] font-black uppercase">{plant.name}</h3>
                      <p className="text-[7px] text-stone-400">
                        Découverte il y a {age === 0 ? "aujourd'hui" : `${age} jour${age > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-emerald-600 font-bold">
                    <span>✅</span> Intégrée au catalogue
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <div className="text-6xl">🔍</div>
          <p className="text-sm text-stone-400 font-bold">Aucune plante découverte par photo</p>
          <p className="text-[9px] text-stone-300">Utilisez l&apos;analyseur IA sur une photo de plante pour remplir cette section !</p>
        </div>
      )}

      {/* Info */}
      <div className="text-center text-[9px] text-stone-400 mt-2">
        📸 Identifiez des plantes par photo et retrouvez-les ici — elles sont automatiquement ajoutées au catalogue !
      </div>
    </div>
  );
}