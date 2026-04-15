"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Coins, Info, Sprout, Flame, Snowflake, Leaf, PackageOpen } from "lucide-react";
import Image from "next/image";
import { SEED_CATALOG, SEED_SHOPS, SEED_VARIETIES } from "@/store/game-store";
import { useGameStore } from "@/store/game-store";
import { PLANTS } from "@/lib/ai-engine";
import type { SeedShop, SeedVariety } from "@/store/catalog";
import { useState, useCallback } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CURRENT_MONTH = new Date().getMonth() + 1; // 1-12

const MONTH_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/** Badge "Semer maintenant!" si le mois actuel est dans optimalPlantMonths */
function isSowNow(plantDefId: string): boolean {
  const plant = PLANTS[plantDefId];
  if (!plant?.optimalPlantMonths) return false;
  return plant.optimalPlantMonths.includes(CURRENT_MONTH);
}

/** Rusticité basée sur optimalTemp et droughtResistance */
function getHardiness(plantDefId: string): { label: string; emoji: string; color: string } {
  const plant = PLANTS[plantDefId];
  if (!plant) return { label: "Inconnu", emoji: "❓", color: "text-stone-400" };
  const minTemp = plant.optimalTemp[0];
  const drought = plant.droughtResistance ?? 0.5;
  if (minTemp <= 5) return { label: "Rustique", emoji: "❄️", color: "text-blue-500" };
  if (minTemp <= 10) return { label: "Semi-rustique", emoji: "🌱", color: "text-green-500" };
  if (drought >= 0.7) return { label: "Thermophile", emoji: "🔥", color: "text-orange-500" };
  return { label: "Gélif", emoji: "🌡️", color: "text-red-400" };
}

/** Nouveauté 2026 — variétés ajoutées récemment */
const NOUVEAUTE_2026 = new Set([
  "tomato-lanterna", "cucumber-bella", "zucchini-boldenice", "melon-stellio",
  "spinach-soyuz", "radis-expo", "basil-loki", "parsley-lion",
  "photinia-louise", "photinia-red-robin", "eleagnus-gilt-edge", "eleagnus-ebbingii",
  "laurus-nobilis", "thuya-smaragd", "escallonia-iveyi", "cornus-alba", "casseille-hedge",
  "quinoa-tempe", "amaranth-red-garnet", "bean-coco-rouge", "corn-miel-jaune",
  "sorrel-oseille-commune", "sunflower-titania",
  "bean-coco-paimpol", "squash-butternut-musquee", "chard-vert-lyon", "sunflower-velours",
  "poppy-californie",
]);

interface GrainesTabProps {
  coins: number;
  seedCollection: Record<string, number>;
  seedVarieties: Record<string, number>;
  unlockedVarieties: Record<string, boolean>;
  selectedShopId: string;
  justBought: string | null;
  allShops: SeedShop[];
  allVarieties: SeedVariety[];
  handleBuySeeds: (id: string) => void;
  buySeedVariety: (id: string) => void;
  setSelectedShopId: (id: string) => void;
}

// ═══ Packet Open Overlay ═══

function PacketOpenOverlay({ variety, onDone }: { variety: SeedVariety; onDone: () => void }) {
  const [stage, setStage] = useState<"tear" | "reveal">("tear");
  const plantDef = PLANTS[variety.plantDefId];

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
            onClick={() => setStage("reveal")}
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-black text-white uppercase" style={{ textShadow: "2px 2px 0 #000" }}>
                {variety.name}
              </h3>
              <p className="text-amber-300 text-sm font-bold">
                +{variety.seedCount || 1} graine{(variety.seedCount || 1) > 1 ? "s" : ""} {plantDef?.emoji || "🌱"}
              </p>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-stone-400 text-[10px]">
              Cliquer pour fermer
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function GrainesTab({
  coins,
  seedCollection,
  seedVarieties,
  unlockedVarieties,
  selectedShopId,
  justBought,
  allShops,
  allVarieties,
  handleBuySeeds,
  buySeedVariety,
  setSelectedShopId,
}: GrainesTabProps) {
  const openSeedPacket = useGameStore((s) => s.openSeedPacket);

  const [openingVariety, setOpeningVariety] = useState<SeedVariety | null>(null);

  const handleOpenPacket = useCallback((variety: SeedVariety) => {
    setOpeningVariety(variety);
  }, []);

  const handleOpenDone = useCallback(() => {
    if (openingVariety) {
      openSeedPacket(openingVariety.id);
    }
    setOpeningVariety(null);
  }, [openingVariety, openSeedPacket]);

  const selectedShop = allShops.find((s) => s.id === selectedShopId) || allShops[0];
  const shopVarieties = allVarieties.filter((v) => v.shopId === selectedShopId);

  // Seed-only shops (exclude tree/plantule/local shops)
  const seedOnlyShopIds = allShops
    .filter(shop => !["guignard", "inrae", "pepinieres-bordas", "arbres-tissot", "fruitiers-forest", "bientot-dispo", "jardiland", "gamm-vert", "esat-antes", "jardi-leclerc", "pepiniere-locale", "les-pepineres-quissac", "leaderplant", "marche-producteurs", "jardin-partage"].includes(shop.id))
    .map(s => s.id);

  // Unopened packets across all seed shops
  const unopenedPackets = SEED_VARIETIES.filter(v => (seedVarieties[v.id] || 0) > 0);
  const totalUnopened = unopenedPackets.reduce((sum, v) => sum + (seedVarieties[v.id] || 0), 0);

  return (
    <div className="space-y-3">
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

      {/* Unopened Packets Section */}
      {unopenedPackets.length > 0 && (
        <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 border-[3px] border-amber-400 rounded-2xl shadow-[4px_4px_0_0_#000] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageOpen className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-black uppercase">📦 Paquets à ouvrir</h3>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300">
                {totalUnopened}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {unopenedPackets.map((variety) => {
              const count = seedVarieties[variety.id] || 0;
              const plantDef = PLANTS[variety.plantDefId];
              return (
                <motion.div
                  key={variety.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenPacket(variety)}
                  className="relative bg-white border-2 border-amber-300 rounded-xl overflow-hidden cursor-pointer shadow-[2px_2px_0_0_#d97706]"
                >
                  <div className="relative h-24 bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
                    <Image
                      src={variety.image}
                      alt={variety.name}
                      width={120}
                      height={80}
                      className="object-contain drop-shadow-md"
                    />
                    {count > 1 && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-black rounded-md">
                        x{count}
                      </div>
                    )}
                    <motion.div
                      className="absolute bottom-1 right-1 bg-white/90 p-1 rounded-md shadow-sm"
                      animate={{ rotateZ: [0, -10, 0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <span className="text-[10px]">✂️</span>
                    </motion.div>
                  </div>
                  <div className="p-1.5 text-center">
                    <p className="text-[8px] font-black uppercase truncate">{variety.name}</p>
                    <p className="text-[7px] text-stone-400">{variety.seedCount || 1} graine{(variety.seedCount || 1) > 1 ? "s" : ""} · {plantDef?.emoji}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shop Selector - ONLY seed shops (no tree shops) */}
      <div className="flex gap-2">
        {allShops.filter(shop => !["guignard", "inrae", "pepinieres-bordas", "arbres-tissot", "fruitiers-forest", "bientot-dispo", "jardiland", "gamm-vert", "esat-antes", "jardi-leclerc", "pepiniere-locale", "les-pepineres-quissac", "leaderplant", "marche-producteurs", "jardin-partage"].includes(shop.id)).map((shop) => (
          <button
            key={shop.id}
            onClick={() => setSelectedShopId(shop.id)}
            className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center gap-2
              ${selectedShopId === shop.id
                ? `bg-gradient-to-br ${shop.color} ${shop.borderColor} shadow-[2px_2px_0_0_#000]`
                : "bg-white border-stone-200 hover:border-stone-400"}`}
          >
            <span className="text-lg">{shop.emoji}</span>
            <div className="text-left">
              <p className={`text-[10px] font-black uppercase ${selectedShopId === shop.id ? "text-black" : "text-stone-500"}`}>{shop.name}</p>
              <p className={`text-[7px] font-bold ${selectedShopId === shop.id ? "text-stone-600" : "text-stone-300"}`}>{shop.description.slice(0, 40)}…</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Shop Banner */}
      <div className={`p-3 bg-gradient-to-br ${selectedShop.color} ${selectedShop.borderColor} border-[3px] rounded-2xl shadow-[4px_4px_0_0_#000]`}>
        <div className="flex items-center gap-3">
          <Image src={selectedShop.image} alt={selectedShop.name} width={100} height={48} className="object-contain rounded-lg" />
          <div>
            <h3 className="text-sm font-black uppercase">{selectedShop.emoji} {selectedShop.name}</h3>
            <p className="text-[8px] text-stone-500">{selectedShop.description}</p>
          </div>
        </div>
      </div>

      {/* Variety Grid */}
      {shopVarieties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shopVarieties.map((variety) => {
            const parentPlant = PLANTS[variety.plantDefId];
            const owned = seedVarieties[variety.id] || 0;
            const canAfford = coins >= variety.price;
            const boughtKey = `variety-${variety.id}`;
            const sowNow = isSowNow(variety.plantDefId);
            const hardiness = getHardiness(variety.plantDefId);
            const isNew = NOUVEAUTE_2026.has(variety.id);

            if (!unlockedVarieties[variety.id]) {
              return (
                <div
                  key={variety.id}
                  className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                    ${canAfford ? "border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc]"}`}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

                  {/* Badges */}
                  {(isNew || sowNow) && (
                    <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
                      {isNew && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[7px] font-black uppercase rounded shadow-md animate-pulse">
                          Nouveauté 2026
                        </span>
                      )}
                      {sowNow && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[7px] font-black uppercase rounded shadow-md flex items-center gap-0.5">
                          <Sprout className="w-2.5 h-2.5" />
                          Semer maintenant!
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative h-40 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center overflow-hidden p-2">
                    <Image
                      src={variety.image}
                      alt={variety.name}
                      fill
                      className="object-contain drop-shadow-lg opacity-70"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      {variety.price}
                    </div>
                    {/* Hardiness badge */}
                    <div className={`absolute bottom-2 right-2 px-1.5 py-0.5 bg-white/90 text-[7px] font-black rounded border border-stone-200 flex items-center gap-0.5 ${hardiness.color}`}>
                      {hardiness.emoji} {hardiness.label}
                    </div>
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-white/80 text-[8px] font-bold rounded border border-stone-200">
                      {variety.grams}g
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{variety.emoji}</span>
                      <div>
                        <h3 className="text-sm font-black uppercase">{variety.name}</h3>
                        <p className="text-[8px] text-stone-400">{parentPlant?.emoji} {parentPlant?.name} -- {variety.grams}g</p>
                      </div>
                    </div>
                    <p className="text-[8px] text-stone-500 leading-relaxed">{variety.description}</p>
                    <motion.button
                      whileHover={canAfford ? { scale: 1.03 } : {}}
                      whileTap={canAfford ? { scale: 0.97 } : {}}
                      onClick={() => canAfford && buySeedVariety(variety.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                        ${canAfford
                          ? "bg-gradient-to-b from-amber-500 to-amber-600 text-white border-amber-700 shadow-[2px_2px_0_0_#000] hover:from-amber-400 hover:to-amber-500"
                          : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                        }`}
                    >
                      {canAfford ? (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Acheter -- {variety.price} 🪙
                        </>
                      ) : (
                        <>
                          <Info className="w-3.5 h-3.5" />
                          Pas assez
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                key={variety.id}
                layout
                className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                  ${canAfford ? "border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

                {/* Badges row: Nouveauté + Semer maintenant + Rusticité */}
                {(isNew || sowNow) && (
                  <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
                    {isNew && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[7px] font-black uppercase rounded shadow-md animate-pulse">
                        Nouveauté 2026
                      </span>
                    )}
                    {sowNow && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[7px] font-black uppercase rounded shadow-md flex items-center gap-0.5">
                        <Sprout className="w-2.5 h-2.5" />
                        Semer maintenant!
                      </span>
                    )}
                  </div>
                )}

                <div className="relative h-40 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center overflow-hidden p-2">
                  <Image
                    src={variety.image}
                    alt={variety.name}
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    {variety.price}
                  </div>
                  {owned > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
                      x{owned}
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-white/80 text-[8px] font-bold rounded border border-stone-200">
                    {variety.grams}g
                  </div>
                  {/* Hardiness badge bottom-right */}
                  <div className={`absolute bottom-2 right-2 px-1.5 py-0.5 bg-white/90 text-[7px] font-black rounded border border-stone-200 flex items-center gap-0.5 ${hardiness.color}`}>
                    {hardiness.emoji} {hardiness.label}
                  </div>
                  <AnimatePresence>
                    {justBought === boughtKey && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                      >
                        <motion.div
                          animate={{ y: -10, opacity: 0 }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="text-2xl"
                        >
                          OK
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{variety.emoji}</span>
                    <div>
                      <h3 className="text-sm font-black uppercase">{variety.name}</h3>
                      <p className="text-[8px] text-stone-400">{parentPlant?.emoji} {parentPlant?.name} -- {variety.grams}g de semences</p>
                    </div>
                  </div>

                  <p className="text-[8px] text-stone-500 leading-relaxed">{variety.description}</p>

                  <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                    <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                      <p className="text-stone-400 font-bold">Recolte</p>
                      <p className="font-black">{variety.realDaysToHarvest}j</p>
                    </div>
                    <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                      <p className="text-stone-400 font-bold">Temp. opt.</p>
                      <p className="font-black">{variety.optimalTemp[0]}-{variety.optimalTemp[1]}C</p>
                    </div>
                    <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                      <p className="text-stone-400 font-bold">Lumiere</p>
                      <p className="font-black">{variety.lightNeed}h/j</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={canAfford ? { scale: 1.03 } : {}}
                    whileTap={canAfford ? { scale: 0.97 } : {}}
                    onClick={() => canAfford && buySeedVariety(variety.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                      ${canAfford
                        ? "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000] hover:from-green-400 hover:to-green-500"
                        : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                      }`}
                  >
                    {canAfford ? (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Acheter -- {variety.price} pieces
                      </>
                    ) : (
                      <>
                        <Info className="w-3.5 h-3.5" />
                        Pas assez de pieces
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Graines classiques -- all 6 seed types always available */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <h3 className="text-[18px] font-black uppercase text-stone-500 tracking-wider">Graines classiques (paquet x3)</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SEED_CATALOG.map((item) => {
            const plantDef = PLANTS[item.plantDefId];
            const owned = seedCollection[item.id] || 0;
            const canAfford = coins >= item.price;
            const boughtKey = `seed-${item.id}`;
            const sowNow = plantDef ? isSowNow(item.plantDefId) : false;
            const hardiness = getHardiness(item.plantDefId);

            return (
              <motion.div
                key={item.id}
                layout
                className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                  ${canAfford ? "border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
              >
                <div className="relative h-20 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden">
                  {item.packetImage ? (
                    <Image
                      src={item.packetImage}
                      alt={item.name}
                      width={85}
                      height={100}
                      className="object-contain drop-shadow-lg"
                    />
                  ) : (
                    <span className="text-2xl">{item.emoji || '🌱'}</span>
                  )}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-600 text-white text-[6px] font-black uppercase rounded-sm tracking-wider shadow-md">
                    {item.brand}
                  </div>
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black text-white text-[8px] font-black rounded-lg flex items-center gap-0.5">
                    <Coins className="w-2.5 h-2.5 text-yellow-400" />
                    {item.price}
                  </div>
                  {owned > 0 && (
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-black rounded-lg">
                      x{owned}
                    </div>
                  )}
                  {/* Hardiness + Sow Now for classic seeds */}
                  <div className="absolute bottom-1 right-1 flex flex-col gap-0.5 items-end">
                    {sowNow && (
                      <span className="px-1 py-0.5 bg-green-500 text-white text-[6px] font-black rounded flex items-center gap-0.5 shadow-sm">
                        <Sprout className="w-2 h-2" />
                        Semer!
                      </span>
                    )}
                    <span className={`px-1 py-0.5 bg-white/90 text-[6px] font-bold rounded ${hardiness.color}`}>
                      {hardiness.emoji} {hardiness.label}
                    </span>
                  </div>
                  <AnimatePresence>
                    {justBought === boughtKey && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                      >
                        <motion.div
                          animate={{ y: -10, opacity: 0 }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="text-2xl font-black text-green-700"
                        >
                          OK
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="p-2 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-base">{item.emoji}</span>
                    <h3 className="text-[9px] font-black uppercase truncate">{item.name}</h3>
                  </div>
                  <p className="text-[7px] text-stone-400">Paquet {item.brand} · Recolte: {item.realDaysToHarvest}j</p>
                  <motion.button
                    whileHover={canAfford ? { scale: 1.05 } : {}}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                    onClick={() => canAfford && handleBuySeeds(item.id)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 text-[9px] font-black uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1
                      ${canAfford
                        ? "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000] hover:from-green-400 hover:to-green-500"
                        : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                      }`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Acheter
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}