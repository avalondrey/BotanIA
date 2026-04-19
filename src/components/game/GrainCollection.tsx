"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, SEED_CATALOG, SEED_VARIETIES, PLANTULE_CATALOG, MINI_SERRE_ROWS, MINI_SERRE_COLS } from "@/store/game-store";
import { PLANTS, STAGE_IMAGES } from "@/lib/ai-engine";
import { Sprout, Coins, Droplets, Thermometer, Sun, Shield, Warehouse, PackageOpen } from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// ═══ Packet Opening Animation ═══

function PacketOpenOverlay({ variety, onDone }: { variety: typeof SEED_VARIETIES[number]; onDone: () => void }) {
  const [stage, setStage] = useState<"tear" | "reveal">("tear");
  const plantDef = PLANTS[variety.plantDefId];

  const handleTear = useCallback(() => {
    setStage("reveal");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={stage === "reveal" ? onDone : undefined}
    >
      <AnimatePresence mode="wait">
        {stage === "tear" && (
          <motion.div
            key="tear"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative cursor-pointer"
            onClick={handleTear}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Image
                src={variety.image}
                alt={variety.name}
                width={256}
                height={256}
                className="object-contain drop-shadow-2xl rounded-lg"
              />
            </motion.div>
            <motion.p
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white font-black text-sm uppercase whitespace-nowrap bg-black/60 px-4 py-2 rounded-xl"
            >
              ✂️ Cliquer pour ouvrir !
            </motion.p>
            {/* Decorative tear lines */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl">✂️</span>
            </motion.div>
          </motion.div>
        )}

        {stage === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ scale: 0, rotateZ: -15, opacity: 0 }}
            animate={{ scale: 1, rotateZ: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center space-y-4"
            onClick={onDone}
          >
            {/* Sparkle burst */}
            <div className="relative">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl pointer-events-none"
                  style={{
                    left: `${50 + 40 * Math.cos((i / 8) * Math.PI * 2)}%`,
                    top: `${50 + 40 * Math.sin((i / 8) * Math.PI * 2)}%`,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], x: [0, 30 * Math.cos((i / 8) * Math.PI * 2)], y: [0, 30 * Math.sin((i / 8) * Math.PI * 2)] }}
                  transition={{ duration: 0.8 }}
                >
                  ✨
                </motion.span>
              ))}
              <motion.div
                animate={{ rotateZ: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-7xl"
              >
                {variety.emoji || "🌱"}
              </motion.div>
            </div>

            {/* Name + seed count */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-black text-white uppercase" style={{ textShadow: "2px 2px 0 #000" }}>
                {variety.name}
              </h3>
              <p className="text-amber-300 text-sm font-bold">
                +{variety.seedCount || 1} graine{(variety.seedCount || 1) > 1 ? "s" : ""} {plantDef?.emoji || "🌱"}
              </p>
            </motion.div>

            {/* Close hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-stone-400 text-[10px]"
            >
              Cliquer pour fermer
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function GrainCollection() {
  const seedCollection = useGameStore((s) => s.seedCollection);
  const seedVarieties = useGameStore((s) => s.seedVarieties);
  const plantuleCollection = useGameStore((s) => s.plantuleCollection);
  const coins = useGameStore((s) => s.coins);
  const openSeedPacket = useGameStore((s) => s.openSeedPacket);
  const serreTiles = useGameStore((s) => s.serreTiles);
  const miniSerres = useGameStore((s) => s.miniSerres);
  const totalSeeds = Object.values(seedCollection).reduce((a, b) => a + b, 0);
  const totalPlantules = Object.values(plantuleCollection).reduce((a, b) => a + b, 0);
  const totalValue = SEED_CATALOG.reduce((sum, item) => sum + (seedCollection[item.plantDefId] || 0) * item.price, 0)
    + PLANTULE_CATALOG.reduce((sum, item) => sum + (plantuleCollection[item.plantDefId] || 0) * item.price, 0);

  // Unopened seed packets
  const unopenedPackets = SEED_VARIETIES.filter(v => (seedVarieties[v.id] || 0) > 0);
  const totalUnopened = unopenedPackets.reduce((sum, v) => sum + (seedVarieties[v.id] || 0), 0);

  const [openingVariety, setOpeningVariety] = useState<typeof SEED_VARIETIES[number] | null>(null);

  // Count mini serre plants
  let miniSerreTotalPlants = 0;
  miniSerres.forEach((serre) => {
    serre.slots.forEach((row) => {
      row.forEach((plant) => {
        if (plant) miniSerreTotalPlants++;
      });
    });
  });

  const handleOpenPacket = (variety: typeof SEED_VARIETIES[number]) => {
    setOpeningVariety(variety);
  };

  const handleOpenDone = () => {
    if (openingVariety) {
      openSeedPacket(openingVariety.id);
    }
    setOpeningVariety(null);
  };

  return (
    <div className="space-y-4">
      {/* Packet opening overlay */}
      <AnimatePresence>
        {openingVariety && (
          <PacketOpenOverlay
            key={openingVariety.id}
            variety={openingVariety}
            onDone={handleOpenDone}
          />
        )}
      </AnimatePresence>
      {/* Collection Header */}
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-black rounded-2xl relative overflow-hidden" style={{ borderWidth: 'var(--ui-border-width)', boxShadow: `var(--ui-shadow-offset) var(--ui-shadow-offset) 0 0 #000` }}>
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
            {totalUnopened > 0 && (
              <p className="text-[9px] text-amber-600 font-bold">📦 {totalUnopened} paquet{totalUnopened > 1 ? "s" : ""} à ouvrir</p>
            )}
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

      {/* Mini Serres — Vue globale compacte */}
      {miniSerres.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase mb-2 flex items-center gap-1">
            🌱🏡 Mini Serres
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
              {miniSerreTotalPlants} plants · {miniSerres.length} serre{miniSerres.length > 1 ? "s" : ""}
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {miniSerres.map((serre, serreIdx) => {
              const serrePlants: Array<{ plantDefId: string; plantName: string; emoji: string; stage: number; days: number; needsWater: boolean }> = [];
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
                        needsWater: plant.needsWater,
                      });
                    }
                  }
                });
              });
              const waterNeeded = serrePlants.filter(p => p.needsWater).length;
              const totalSlots = MINI_SERRE_ROWS * MINI_SERRE_COLS;

              return (
                <div key={serre.id} className="p-2.5 bg-white border-2 border-emerald-400 rounded-xl shadow-[2px_2px_0_0_#059669] relative">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-black uppercase text-emerald-800">Serre #{serreIdx + 1}</p>
                    <span className="text-[8px] font-bold text-stone-500">{serrePlants.length}/{totalSlots}</span>
                  </div>
                  {/* Mini barre d'occupation */}
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${(serrePlants.length / totalSlots) * 100}%` }}
                    />
                  </div>
                  {/* Emojis compacts des plantes */}
                  <div className="flex flex-wrap gap-[1px]">
                    {serrePlants.slice(0, 12).map((p, i) => (
                      <span key={i} className="text-[10px] leading-none" title={`${p.plantName} · J${p.days}${p.needsWater ? " · 💧" : ""}`}>
                        {p.emoji}
                      </span>
                    ))}
                    {serrePlants.length > 12 && (
                      <span className="text-[7px] font-bold text-stone-400">+{serrePlants.length - 12}</span>
                    )}
                  </div>
                  {waterNeeded > 0 && (
                    <p className="text-[7px] text-blue-600 font-bold mt-1">💧 {waterNeeded} besoin{waterNeeded > 1 ? "s" : ""} d'eau</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unopened Seed Packets */}
      {unopenedPackets.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase mb-2 flex items-center gap-1">
            <PackageOpen className="w-4 h-4 text-amber-600" />
            📦 Paquets à ouvrir
            <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
              {totalUnopened} paquet{totalUnopened > 1 ? "s" : ""}
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {unopenedPackets.map((variety) => {
              const count = seedVarieties[variety.id] || 0;
              const plantDef = PLANTS[variety.plantDefId];
              return (
                <motion.div
                  key={variety.id}
                  layout
                  className="relative bg-white border-[3px] border-amber-400 rounded-2xl shadow-[4px_4px_0_0_#000] overflow-hidden cursor-pointer group"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOpenPacket(variety)}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{ backgroundImage: "radial-gradient(circle, #f59e0b 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />

                  {/* Packet image */}
                  <div className="relative h-36 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center overflow-hidden">
                    <Image
                      src={variety.image}
                      alt={variety.name}
                      width={200}
                      height={120}
                      className="object-contain drop-shadow-lg group-hover:drop-shadow-xl transition-all"
                    />
                    {/* Count badge */}
                    {count > 1 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-lg shadow-[1px_1px_0_0_#000]">
                        x{count}
                      </div>
                    )}
                    {/* Scissors icon hint */}
                    <motion.div
                      className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-lg shadow-md"
                      animate={{ rotateZ: [0, -15, 0, 15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <span className="text-sm">✂️</span>
                    </motion.div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{variety.emoji}</span>
                      <div>
                        <p className="text-[10px] font-black uppercase leading-tight">{variety.name}</p>
                        <p className="text-[7px] text-amber-600 font-bold">{plantDef?.name || variety.plantDefId}</p>
                      </div>
                    </div>
                    <p className="text-[8px] text-stone-400 font-bold">
                      {variety.seedCount || 1} graine{(variety.seedCount || 1) > 1 ? "s" : ""} dedans
                    </p>
                    <div className="flex items-center gap-1 justify-center py-1 px-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border border-amber-300">
                      <PackageOpen className="w-3 h-3 text-amber-600" />
                      <span className="text-[8px] font-black text-amber-700 uppercase">Ouvrir</span>
                    </div>
                  </div>
                </motion.div>
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
                  key={item.id}
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
                      <Image
                        src={item.cardImage}
                        alt={item.name}
                        fill
                        className="object-contain rounded-lg border-2 border-black"
                      />
                    </div>

                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-xs font-black uppercase">{item.name}</p>
                    <p className="text-[7px] text-red-600 font-black">{item.brand}</p>

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
