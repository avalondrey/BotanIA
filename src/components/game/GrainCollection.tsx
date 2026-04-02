"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, SEED_CATALOG, PLANTULE_CATALOG, MINI_SERRE_ROWS, MINI_SERRE_COLS } from "@/store/game-store";
import { PLANTS, STAGE_IMAGES } from "@/lib/ai-engine";
import { Sprout, Coins, Droplets, Thermometer, Sun, Shield, Warehouse } from "lucide-react";
import Image from "next/image";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export function GrainCollection() {
  const seedCollection = useGameStore((s) => s.seedCollection);
  const plantuleCollection = useGameStore((s) => s.plantuleCollection);
  const coins = useGameStore((s) => s.coins);
  const serreTiles = useGameStore((s) => s.serreTiles);
  const miniSerres = useGameStore((s) => s.miniSerres);
  const totalSeeds = Object.values(seedCollection).reduce((a, b) => a + b, 0);
  const totalPlantules = Object.values(plantuleCollection).reduce((a, b) => a + b, 0);
  const totalValue = SEED_CATALOG.reduce((sum, item) => sum + (seedCollection[item.plantDefId] || 0) * item.price, 0)
    + PLANTULE_CATALOG.reduce((sum, item) => sum + (plantuleCollection[item.plantDefId] || 0) * item.price, 0);

  // Count mini serre plants
  let miniSerreTotalPlants = 0;
  miniSerres.forEach((serre) => {
    serre.slots.forEach((row) => {
      row.forEach((plant) => {
        if (plant) miniSerreTotalPlants++;
      });
    });
  });

  return (
    <div className="space-y-4">
      {/* Collection Header */}
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-[3px] border-black rounded-2xl shadow-[6px_6px_0_0_#000] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.8px, transparent 0.8px)", backgroundSize: "4px 4px" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-green-700" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight" style={{ textShadow: "2px 2px 0 #000" }}>
                🌱 Inventaire
              </h2>
              <p className="text-[9px] text-green-600 font-bold">Vos graines, plantules et équipement</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-green-600 font-bold">{totalSeeds} graines · {totalPlantules} plantules</p>
            <p className="text-[9px] text-stone-400">Valeur: {totalValue} 🪙</p>
          </div>
        </div>
      </div>

      {/* Coins & Equipment summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-300 rounded-xl">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-[9px] text-amber-500 font-bold uppercase">Pièces</p>
              <motion.p
                key={coins}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-lg font-black text-amber-800"
              >
                {coins} 🪙
              </motion.p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-cyan-50 to-sky-50 border-2 border-cyan-300 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏡</span>
            <div>
              <p className="text-[9px] text-cyan-500 font-bold uppercase">Tuiles Serre</p>
              <p className="text-lg font-black text-cyan-800">{serreTiles}</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱🏡</span>
            <div>
              <p className="text-[9px] text-emerald-500 font-bold uppercase">Mini Serres</p>
              <p className="text-lg font-black text-emerald-800">{miniSerres.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Serres detail */}
      {miniSerres.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase mb-2 flex items-center gap-1">
            🌱🏡 Mini Serres
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
              {miniSerreTotalPlants} plants en culture
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {miniSerres.map((serre, serreIdx) => {
              const serrePlants: Array<{ plantDefId: string; plantName: string; emoji: string; stage: number; days: number }> = [];
              serre.slots.forEach((row) => {
                row.forEach((plant) => {
                  if (plant) {
                    const def = PLANTS[plant.plantDefId];
                    if (def) {
                      serrePlants.push({
                        plantDefId: plant.plantDefId,
                        plantName: def.name,
                        emoji: def.emoji,
                        stage: plant.stage,
                        days: plant.daysSincePlanting,
                      });
                    }
                  }
                });
              });

              return (
                <div key={serre.id} className="p-3 bg-white border-[3px] border-emerald-500 rounded-2xl shadow-[3px_3px_0_0_#059669] relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase text-emerald-800">Mini Serre #{serreIdx + 1}</p>
                    <p className="text-[8px] text-emerald-600 font-bold">{serrePlants.length}/24 plantées</p>
                  </div>

                  {/* Compact overview grid */}
                  <div className="grid gap-[2px] mb-2" style={{ gridTemplateColumns: `repeat(${MINI_SERRE_COLS}, 1fr)` }}>
                    {serre.slots.map((row, rIdx) =>
                      row.map((plant, cIdx) => {
                        const def = plant ? PLANTS[plant.plantDefId] : null;
                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className={`aspect-square rounded-sm border flex items-center justify-center overflow-hidden relative
                              ${plant ? "border-emerald-200 bg-emerald-50" : "border-stone-100 bg-stone-50"}
                            `}
                          >
                            {plant && def && (
                              <>
                                <Image
                                  src={STAGE_IMAGES[plant.plantDefId]?.[Math.min(plant.stage, 3)] || def.image}
                                  alt={def.name}
                                  fill
                                  className="object-cover rounded-sm opacity-70"
                                />
                                {plant.needsWater && (
                                  <span className="absolute top-0 left-0 text-[5px]">💧</span>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Plant summary */}
                  {serrePlants.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {serrePlants.slice(0, 8).map((p, i) => (
                        <span key={i} className="text-[7px] px-1.5 py-0.5 bg-stone-50 border border-stone-200 rounded font-bold">
                          {p.emoji} {p.plantName} · J{p.days}
                        </span>
                      ))}
                      {serrePlants.length > 8 && (
                        <span className="text-[7px] px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded font-bold text-stone-500">
                          +{serrePlants.length - 8} autres
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seeds */}
      <div>
        <h3 className="text-sm font-black uppercase mb-2 flex items-center gap-1">
          🌱 Graines
        </h3>
        {totalSeeds === 0 ? (
          <div className="p-4 bg-white border-2 border-dashed border-stone-300 rounded-xl text-center">
            <p className="text-2xl mb-1">📭</p>
            <p className="text-[10px] font-bold text-stone-500">Aucune graine</p>
            <p className="text-[8px] text-stone-400 mt-0.5">Visitez la Boutique pour acheter des graines !</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SEED_CATALOG.map((item) => {
              const owned = seedCollection[item.plantDefId] || 0;
              if (owned <= 0) return null;
              const plantDef = PLANTS[item.plantDefId];

              return (
                <motion.div
                  key={item.plantDefId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-3 bg-white border-[3px] border-black rounded-2xl shadow-[3px_3px_0_0_#000] relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

                  <div className="relative flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-1">
                      {plantDef && STAGE_IMAGES[item.plantDefId] && (
                        <Image
                          src={STAGE_IMAGES[item.plantDefId][1]}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg border-2 border-black"
                        />
                      )}
                    </div>

                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-xs font-black uppercase">{item.name.replace("Graine ", "")}</p>

                    <div className="mt-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-black rounded-lg">
                      ×{owned}
                    </div>

                    <div className="mt-1.5 space-y-0.5 w-full text-[8px] text-stone-500">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-2.5 h-2.5 text-red-400" />
                        <span>{plantDef?.optimalTemp[0]}–{plantDef?.optimalTemp[1]}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="w-2.5 h-2.5 text-blue-400" />
                        <span>{plantDef?.waterNeed} mm/j</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sun className="w-2.5 h-2.5 text-amber-400" />
                        <span>{plantDef?.lightNeed}h lumière</span>
                      </div>
                    </div>

                    <div className="flex gap-0.5 flex-wrap mt-1.5 justify-center">
                      {item.optimalMonths.map((m) => (
                        <span key={m} className="text-[7px] px-1 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold">
                          {MONTH_NAMES[m]}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plantules */}
      <div className="mt-4">
        <h3 className="text-sm font-black uppercase mb-2 flex items-center gap-1">
          🌿 Plantules
        </h3>
        {totalPlantules === 0 ? (
          <div className="p-4 bg-white border-2 border-dashed border-stone-300 rounded-xl text-center">
            <p className="text-2xl mb-1">📭</p>
            <p className="text-[10px] font-bold text-stone-500">Aucune plantule</p>
            <p className="text-[8px] text-stone-400 mt-0.5">Achetez des plantules à la Boutique !</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLANTULE_CATALOG.map((item) => {
              const owned = plantuleCollection[item.plantDefId] || 0;
              if (owned <= 0) return null;
              const plantDef = PLANTS[item.plantDefId];

              return (
                <motion.div
                  key={item.plantDefId}
                  layout
                  className="p-3 bg-white border-[3px] border-emerald-600 rounded-2xl shadow-[3px_3px_0_0_#059669] relative overflow-hidden"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-1">
                      {plantDef && STAGE_IMAGES[item.plantDefId] && (
                        <Image
                          src={STAGE_IMAGES[item.plantDefId][1]}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg border-2 border-emerald-600"
                        />
                      )}
                    </div>

                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-xs font-black uppercase">{item.name.replace("Plantule ", "")}</p>

                    <div className="mt-1 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg">
                      ×{owned}
                    </div>
                    <p className="text-[8px] text-emerald-600 mt-1 font-bold">Stade initial: 🌿 Plantule</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
