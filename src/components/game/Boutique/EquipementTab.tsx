"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Coins, Info } from "lucide-react";
import {
  useGameStore,
  MAX_GARDEN_WIDTH_CM,
  MAX_GARDEN_HEIGHT_CM,
} from "@/store/game-store";
import type { GardenTank, GardenShed, GardenTree, GardenHedge, GardenDrum, SerreZone } from "@/store/garden-types";

// ── Hedge catalog with types and prices ──
const HEDGE_CATALOG: { type: GardenHedge['type']; name: string; emoji: string; price: number; height: number; description: string }[] = [
  { type: 'laurel', name: 'Laurier Palme', emoji: '🌿', price: 90, height: 180, description: 'Persistant, croissance rapide, 40-60cm/an. Le classique des haies.' },
  { type: 'photinia', name: 'Photinia Red Robin', emoji: '🌿', price: 120, height: 200, description: 'Jeunes pousses rouges écarlates. Persistant, très décoratif.' },
  { type: 'eleagnus', name: 'Élagnus ebbingei', emoji: '🌾', price: 100, height: 200, description: 'Feuillage argenté, résiste au sel et sécheresse. Persistant.' },
  { type: 'laurus', name: 'Laurier Sauce', emoji: '🌿', price: 90, height: 160, description: 'Persistant aromatique, feuilles comestibles. Tailleur docile.' },
  { type: 'thuja', name: 'Thuya Smaragd', emoji: '🌲', price: 110, height: 250, description: 'Conifère compact vert émeraude. Brise-vent, 20-30cm/an.' },
  { type: 'escallonia', name: 'Escallonia Iveyi', emoji: '🌸', price: 95, height: 180, description: 'Persistant fleuri, roses tout l\'été. Résiste aux embruns.' },
  { type: 'cypress', name: 'Cyprès de Leyland', emoji: '🌲', price: 85, height: 300, description: 'Croissance très rapide 80cm/an. Brise-vent puissant.' },
  { type: 'boxwood', name: 'Buis', emoji: '🍃', price: 75, height: 80, description: 'Persistant compact, idéal bordures et topiaires. Pousse lente.' },
];

interface EquipementTabProps {
  coins: number;
  serreTiles: number;
  gardenWidthCm: number;
  gardenHeightCm: number;
  gardenSheds: GardenShed[];
  gardenTanks: GardenTank[];
  gardenTrees: GardenTree[];
  gardenHedges: GardenHedge[];
  gardenDrums: GardenDrum[];
  gardenSerreZones: SerreZone[];
  expandGarden: (direction: "width" | "height") => boolean;
  buySerreZone: () => boolean;
  buySerreTile: () => boolean;
  justBought: string | null;
  setJustBought: (key: string | null) => void;
}

export function EquipementTab({
  coins,
  serreTiles,
  gardenWidthCm,
  gardenHeightCm,
  gardenSheds,
  gardenTanks,
  gardenTrees,
  gardenHedges,
  gardenDrums,
  gardenSerreZones,
  expandGarden,
  buySerreZone,
  buySerreTile,
  justBought,
  setJustBought,
}: EquipementTabProps) {
  const [selectedHedge, setSelectedHedge] = useState<GardenHedge['type']>('laurel');
  const handleBuySerreTile = () => {
    const success = buySerreTile();
    if (success) {
      setJustBought("serre-tile");
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  const handleBuySerreZone = () => {
    const success = buySerreZone();
    if (success) {
      setJustBought("serre-zone");
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  const handleExpandWidth = () => {
    const success = expandGarden("width");
    if (success) {
      setJustBought("expand-w");
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  const handleExpandHeight = () => {
    const success = expandGarden("height");
    if (success) {
      setJustBought("expand-h");
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Serre (Greenhouse) */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
          ${coins >= 200 ? "border-cyan-600 shadow-[6px_6px_0_0_#0891b2] hover:shadow-[8px_8px_0_0_#0891b2]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-cyan-50 to-sky-50 flex items-center justify-center">
          <div className="text-6xl">🏡</div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            200
          </div>
          {gardenSerreZones.length > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
              x{gardenSerreZones.length}
            </div>
          )}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-[7px] font-black rounded border border-cyan-300">
            6m x 4m
          </div>
          <AnimatePresence>
            {justBought === "serre-zone" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-cyan-500/20"
              >
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl font-black text-cyan-700">OK</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🏡</span>
            <div>
              <h3 className="text-sm font-black uppercase">Serre de jardin</h3>
              <p className="text-[8px] text-stone-400">6m x 4m (24m2) -- placee automatiquement</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-400 font-bold">+4°C</p>
            </div>
            <div className="px-1.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-400 font-bold">-70% pluie</p>
            </div>
            <div className="px-1.5 py-1 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-amber-400 font-bold">+15% lum.</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Serre tunnel 6x4m avec protection contre le gel. Les plantes beneficient d&apos;un microclimat favorable (+4°C, pluie reduite, plus de lumiere). Placee automatiquement dans votre jardin.</p>
          <motion.button
            whileHover={coins >= 200 ? { scale: 1.03 } : {}}
            whileTap={coins >= 200 ? { scale: 0.97 } : {}}
            onClick={() => coins >= 200 && handleBuySerreZone()}
            disabled={coins < 200}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= 200
                ? "bg-gradient-to-b from-cyan-500 to-sky-600 text-white border-cyan-700 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= 200 ? (
              <><ShoppingCart className="w-3.5 h-3.5" /> Acheter -- 200 pieces</>
            ) : (
              <><Info className="w-3.5 h-3.5" /> Pas assez de pieces</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Serre Tile */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
          ${coins >= 50 ? "border-cyan-500 shadow-[6px_6px_0_0_#0891b2] hover:shadow-[8px_8px_0_0_#0891b2]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-cyan-50 to-sky-50 flex items-center justify-center">
          <div className="text-6xl">🏡</div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            50
          </div>
          {serreTiles > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
              ×{serreTiles}
            </div>
          )}
          <AnimatePresence>
            {justBought === "serre-tile" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-cyan-500/20"
              >
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🏡</span>
            <div>
              <h3 className="text-sm font-black uppercase">Tuile Serre</h3>
              <p className="text-[8px] text-stone-400">Protège une zone du jardin (dessinable)</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-400 font-bold">🌡️ +5°C</p>
            </div>
            <div className="px-1.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-400 font-bold">🌧️ -70%</p>
            </div>
            <div className="px-1.5 py-1 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-amber-400 font-bold">☀️ +15%</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Protège contre le gel. Dessinez une zone serre sur le jardin. Les plantes dans cette zone bénéficient d&apos;un microclimat (+5°C, -70% pluie, +15% lumière).</p>
          <motion.button
            whileHover={coins >= 50 ? { scale: 1.03 } : {}}
            whileTap={coins >= 50 ? { scale: 0.97 } : {}}
            onClick={() => coins >= 50 && handleBuySerreTile()}
            disabled={coins < 50}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= 50
                ? "bg-gradient-to-b from-cyan-500 to-sky-600 text-white border-cyan-700 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= 50 ? (
              <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 50 🪙</>
            ) : (
              <><Info className="w-3.5 h-3.5" /> Pas assez de pièces</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Expand Terrain */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all sm:col-span-2
          ${coins >= 100 && (gardenWidthCm < MAX_GARDEN_WIDTH_CM || gardenHeightCm < MAX_GARDEN_HEIGHT_CM) ? "border-green-600 shadow-[6px_6px_0_0_#16a34a] hover:shadow-[8px_8px_0_0_#16a34a]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
          <div className="text-6xl">📐</div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            100
          </div>
          <AnimatePresence>
            {justBought === "expand-w" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-green-500/20"
              >
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
            {justBought === "expand-h" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-green-500/20"
              >
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">📐</span>
            <div>
              <h3 className="text-sm font-black uppercase">Agrandir le terrain</h3>
              <p className="text-[8px] text-stone-400">+2m par direction · {Math.round(gardenWidthCm / 100)}m × {Math.round(gardenHeightCm / 100)}m</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
              <p className="text-stone-400 font-bold">Actuel</p>
              <p className="font-black">{Math.round(gardenWidthCm / 100)}m × {Math.round(gardenHeightCm / 100)}m</p>
            </div>
            <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
              <p className="text-stone-400 font-bold">Largeur max</p>
              <p className="font-black">{Math.round(gardenWidthCm / 100)}/{Math.round(MAX_GARDEN_WIDTH_CM / 100)}m</p>
            </div>
            <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
              <p className="text-stone-400 font-bold">Hauteur max</p>
              <p className="font-black">{Math.round(gardenHeightCm / 100)}/{Math.round(MAX_GARDEN_HEIGHT_CM / 100)}m</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Agrandissez votre jardin de 2m (200cm) par direction. Largeur max 25m, hauteur max 20m.</p>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={coins >= 100 && gardenWidthCm < MAX_GARDEN_WIDTH_CM ? { scale: 1.03 } : {}}
              whileTap={coins >= 100 && gardenWidthCm < MAX_GARDEN_WIDTH_CM ? { scale: 0.97 } : {}}
              onClick={() => coins >= 100 && gardenWidthCm < MAX_GARDEN_WIDTH_CM && handleExpandWidth()}
              disabled={coins < 100 || gardenWidthCm >= MAX_GARDEN_WIDTH_CM}
              className={`py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                ${coins >= 100 && gardenWidthCm < MAX_GARDEN_WIDTH_CM
                  ? "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000]"
                  : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                }`}
            >
              {gardenWidthCm >= MAX_GARDEN_WIDTH_CM ? (
                <>Max atteint</>
              ) : coins >= 100 ? (
                <><ShoppingCart className="w-3.5 h-3.5" /> Largeur +2m</>
              ) : (
                <><Info className="w-3.5 h-3.5" /> 100 🪙</>
              )}
            </motion.button>
            <motion.button
              whileHover={coins >= 100 && gardenHeightCm < MAX_GARDEN_HEIGHT_CM ? { scale: 1.03 } : {}}
              whileTap={coins >= 100 && gardenHeightCm < MAX_GARDEN_HEIGHT_CM ? { scale: 0.97 } : {}}
              onClick={() => coins >= 100 && gardenHeightCm < MAX_GARDEN_HEIGHT_CM && handleExpandHeight()}
              disabled={coins < 100 || gardenHeightCm >= MAX_GARDEN_HEIGHT_CM}
              className={`py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                ${coins >= 100 && gardenHeightCm < MAX_GARDEN_HEIGHT_CM
                  ? "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000]"
                  : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                }`}
            >
              {gardenHeightCm >= MAX_GARDEN_HEIGHT_CM ? (
                <>Max atteint</>
              ) : coins >= 100 ? (
                <><ShoppingCart className="w-3.5 h-3.5" /> Hauteur +2m</>
              ) : (
                <><Info className="w-3.5 h-3.5" /> 100 🪙</>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Cabane */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
          ${coins >= 300 ? "border-amber-600 shadow-[6px_6px_0_0_#92400e] hover:shadow-[8px_8px_0_0_#92400e]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
          <div className="text-6xl">🏚️</div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            300
          </div>
          {gardenSheds.length > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
              ×{gardenSheds.length}
            </div>
          )}
          <AnimatePresence>
            {justBought === "shed" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-amber-500/20"
              >
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🏚️</span>
            <div>
              <h3 className="text-sm font-black uppercase">Cabane à outils</h3>
              <p className="text-[8px] text-stone-400">200×180cm — Stockage</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-amber-400 font-bold">200cm</p>
            </div>
            <div className="px-1.5 py-1 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-amber-400 font-bold">180cm</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Cabane de jardin pour ranger vos outils. Placement automatique dans le jardin.</p>
          <motion.button
            whileHover={coins >= 300 ? { scale: 1.03 } : {}}
            whileTap={coins >= 300 ? { scale: 0.97 } : {}}
            onClick={() => {
              const state = useGameStore.getState();
              if (state.buyShed && state.buyShed(300)) {
                setJustBought("shed");
                setTimeout(() => setJustBought(null), 1500);
              }
            }}
            disabled={coins < 300}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= 300
                ? "bg-gradient-to-b from-amber-500 to-orange-600 text-white border-amber-700 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= 300 ? (
              <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 300 🪙</>
            ) : (
              <><Info className="w-3.5 h-3.5" /> Pas assez de pièces</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Cuve 1000L */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
          ${coins >= 200 ? "border-blue-600 shadow-[6px_6px_0_0_#1e40af] hover:shadow-[8px_8px_0_0_#1e40af]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
          <div className="relative">
            <div className="text-6xl">🛢️</div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded border-2 border-white">1000L</div>
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            200
          </div>
          {gardenTanks.filter(t => t.capacity === 1000).length > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-lg">×{gardenTanks.filter(t => t.capacity === 1000).length}</div>
          )}
          <AnimatePresence>
            {justBought === "tank-1000" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🛢️</span>
            <div>
              <h3 className="text-sm font-black uppercase">Cuve 1000L</h3>
              <p className="text-[8px] text-stone-400">Récupération eau de pluie</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <p className="text-blue-400 font-bold">1000 litres</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Cuve de récupération d&apos;eau de pluie. Placement automatique.</p>
          <motion.button
            whileHover={coins >= 200 ? { scale: 1.03 } : {}}
            whileTap={coins >= 200 ? { scale: 0.97 } : {}}
            onClick={() => {
              const state = useGameStore.getState();
              if (state.buyTank && state.buyTank(1000, 200)) {
                setJustBought("tank-1000");
                setTimeout(() => setJustBought(null), 1500);
              }
            }}
            disabled={coins < 200}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= 200
                ? "bg-gradient-to-b from-blue-500 to-cyan-600 text-white border-blue-700 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= 200 ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 200 🪙</> : <><Info className="w-3.5 h-3.5" /> Pas assez</>}
          </motion.button>
        </div>
      </motion.div>

      {/* Cuve 500L */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
          ${coins >= 120 ? "border-blue-500 shadow-[6px_6px_0_0_#1e40af] hover:shadow-[8px_8px_0_0_#1e40af]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
          <div className="relative">
            <div className="text-6xl">🛢️</div>
            <div className="absolute -bottom-2 -right-2 bg-blue-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded border-2 border-white">500L</div>
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            120
          </div>
          {gardenTanks.filter(t => t.capacity === 500).length > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-400 text-white text-[10px] font-black rounded-lg">×{gardenTanks.filter(t => t.capacity === 500).length}</div>
          )}
          <AnimatePresence>
            {justBought === "tank-500" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🛢️</span>
            <div>
              <h3 className="text-sm font-black uppercase">Cuve 500L</h3>
              <p className="text-[8px] text-stone-400">Récupération eau de pluie</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <p className="text-blue-400 font-bold">500 litres</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Cuve compacte pour petits jardins. Placement automatique.</p>
          <motion.button
            whileHover={coins >= 120 ? { scale: 1.03 } : {}}
            whileTap={coins >= 120 ? { scale: 0.97 } : {}}
            onClick={() => {
              const state = useGameStore.getState();
              if (state.buyTank && state.buyTank(500, 120)) {
                setJustBought("tank-500");
                setTimeout(() => setJustBought(null), 1500);
              }
            }}
            disabled={coins < 120}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= 120
                ? "bg-gradient-to-b from-blue-400 to-cyan-500 text-white border-blue-600 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= 120 ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 120 🪙</> : <><Info className="w-3.5 h-3.5" /> Pas assez</>}
          </motion.button>
        </div>
      </motion.div>

      {/* Cuve 800L */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
          ${coins >= 160 ? "border-blue-700 shadow-[6px_6px_0_0_#1e3a8a] hover:shadow-[8px_8px_0_0_#1e3a8a]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
          <div className="relative">
            <div className="text-6xl">🛢️</div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded border-2 border-white">800L</div>
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            160
          </div>
          {gardenTanks.filter(t => t.capacity === 800).length > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-lg">×{gardenTanks.filter(t => t.capacity === 800).length}</div>
          )}
          <AnimatePresence>
            {justBought === "tank-800" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🛢️</span>
            <div>
              <h3 className="text-sm font-black uppercase">Cuve 800L</h3>
              <p className="text-[8px] text-stone-400">Récupération eau de pluie</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
              <p className="text-indigo-400 font-bold">800 litres</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Cuve moyenne capacité. Placement automatique.</p>
          <motion.button
            whileHover={coins >= 160 ? { scale: 1.03 } : {}}
            whileTap={coins >= 160 ? { scale: 0.97 } : {}}
            onClick={() => {
              const state = useGameStore.getState();
              if (state.buyTank && state.buyTank(800, 160)) {
                setJustBought("tank-800");
                setTimeout(() => setJustBought(null), 1500);
              }
            }}
            disabled={coins < 160}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= 160
                ? "bg-gradient-to-b from-indigo-500 to-blue-600 text-white border-indigo-700 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= 160 ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 160 🪙</> : <><Info className="w-3.5 h-3.5" /> Pas assez</>}
          </motion.button>
        </div>
      </motion.div>

      {/* Fût PEHD 225L */}
      <motion.div
        layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
          ${coins >= 80 ? "border-blue-500 shadow-[6px_6px_0_0_#1d4ed8] hover:shadow-[8px_8px_0_0_#1d4ed8]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
        <div className="relative h-32 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
          <div className="text-6xl">🛢️</div>
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" />
            80
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-black rounded-lg">
            225L
          </div>
          {gardenDrums.length > 0 && (
            <div className="absolute top-2 left-2 mt-6 px-2 py-0.5 bg-blue-400 text-white text-[10px] font-black rounded-lg">×{gardenDrums.length}</div>
          )}
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🛢️</span>
            <div>
              <h3 className="text-sm font-black uppercase">Fût PEHD</h3>
              <p className="text-[8px] text-stone-400">225L — Polyéthylène haute densité</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-400 font-bold">🛢️ 225L</p>
            </div>
            <div className="px-1.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-400 font-bold">♻️ PEHD</p>
            </div>
          </div>
          <p className="text-[8px] text-stone-500">Fût de récupération d&apos;eau de pluie. Placement automatique.</p>
          <motion.button
            whileHover={coins >= 80 ? { scale: 1.03 } : {}}
            whileTap={coins >= 80 ? { scale: 0.97 } : {}}
            onClick={() => {
              const state = useGameStore.getState();
              if (state.buyDrum && state.buyDrum(80)) {
                setJustBought("drum");
                setTimeout(() => setJustBought(null), 1500);
              }
            }}
            disabled={coins < 80}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= 80
                ? "bg-gradient-to-b from-blue-500 to-cyan-600 text-white border-blue-700 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= 80 ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 80 🪙</> : <><Info className="w-3.5 h-3.5" /> Pas assez</>}
          </motion.button>
        </div>
      </motion.div>

      {/* Haies persistantes */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <h3 className="text-[18px] font-black uppercase text-stone-500 tracking-wider">Haies persistantes</h3>
        </div>

        {/* Hedge type selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {HEDGE_CATALOG.map((hedge) => (
            <button
              key={hedge.type}
              onClick={() => setSelectedHedge(hedge.type)}
              className={`py-1.5 px-1.5 rounded-lg border-2 transition-all text-center
                ${selectedHedge === hedge.type
                  ? "bg-green-100 border-green-500 shadow-[2px_2px_0_0_#000]"
                  : "bg-white border-stone-200 hover:border-stone-400"}`}
            >
              <span className="text-lg">{hedge.emoji}</span>
              <p className="text-[7px] font-black uppercase leading-tight mt-0.5">{hedge.name}</p>
            </button>
          ))}
        </div>

        {/* Selected hedge detail */}
        {(() => {
          const hedge = HEDGE_CATALOG.find(h => h.type === selectedHedge) || HEDGE_CATALOG[0];
          const canAfford = coins >= hedge.price;
          return (
            <motion.div
              layout
              className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                ${canAfford ? "border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
              <div className="relative h-24 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <span className="text-6xl">{hedge.emoji}</span>
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                  <Coins className="w-3 h-3 text-yellow-400" />
                  {hedge.price}
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-lg">
                  {hedge.height}cm
                </div>
                {gardenHedges.filter(h => h.type === selectedHedge).length > 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-lg">
                    x{gardenHedges.filter(h => h.type === selectedHedge).length}
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{hedge.emoji}</span>
                  <div>
                    <h3 className="text-sm font-black uppercase">{hedge.name}</h3>
                    <p className="text-[8px] text-stone-400">Haie persistante · {hedge.height}cm adulte</p>
                  </div>
                </div>
                <p className="text-[8px] text-stone-500 leading-relaxed">{hedge.description}</p>
                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                  <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-green-500 font-bold">Hauteur</p>
                    <p className="font-black">{hedge.height}cm</p>
                  </div>
                  <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-green-500 font-bold">Longueur</p>
                    <p className="font-black">200cm</p>
                  </div>
                  <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-green-500 font-bold">Type</p>
                    <p className="font-black text-[7px]">Persistant</p>
                  </div>
                </div>
                <motion.button
                  whileHover={canAfford ? { scale: 1.03 } : {}}
                  whileTap={canAfford ? { scale: 0.97 } : {}}
                  onClick={() => {
                    const state = useGameStore.getState();
                    if (state.buyHedge(hedge.price, selectedHedge)) {
                      setJustBought(`hedge-${selectedHedge}`);
                      setTimeout(() => setJustBought(null), 1500);
                    }
                  }}
                  disabled={!canAfford}
                  className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                    ${canAfford
                      ? "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000] hover:from-green-400 hover:to-green-500"
                      : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                    }`}
                >
                  {canAfford ? (
                    <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — {hedge.price} 🪙</>
                  ) : (
                    <><Info className="w-3.5 h-3.5" /> Pas assez de pièces</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })()}
      </div>

    </div>
  );
}