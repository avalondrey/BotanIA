"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Coins, Info } from "lucide-react";
import Image from "next/image";
import { MINI_SERRE_PRICE, MINI_SERRE_WIDTH_CM, MINI_SERRE_DEPTH_CM } from "@/store/game-store";
import type { MiniSerre } from "@/store/catalog";

interface MiniSerresTabProps {
  coins: number;
  serreTiles: number;
  miniSerres: MiniSerre[];
  buyMiniSerre: () => boolean;
  buySerreTile: () => boolean;
  justBought: string | null;
  setJustBought: (key: string | null) => void;
}

export function MiniSerresTab({
  coins,
  serreTiles,
  miniSerres,
  buyMiniSerre,
  buySerreTile,
  justBought,
  setJustBought,
}: MiniSerresTabProps) {
  const handleBuyMiniSerre = () => {
    const success = buyMiniSerre();
    if (success) {
      setJustBought("mini-serre");
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <motion.div layout
        className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all sm:col-span-2 lg:col-span-1
          ${coins >= MINI_SERRE_PRICE ? "border-emerald-500 shadow-[6px_6px_0_0_#059669]" : "border-stone-300 opacity-80"}`}>

        <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
          <Image src="/cards/card-mini-serre.png" alt="Mini Serre" width={350} height={200} className="object-contain drop-shadow-lg" />
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
            <Coins className="w-3 h-3 text-yellow-400" /> {MINI_SERRE_PRICE}
          </div>
          {miniSerres.length > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg">
              ×{miniSerres.length}
            </div>
          )}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[7px] font-black rounded border border-green-300">
            ♾️ Illimité
          </div>
          <AnimatePresence>
            {justBought === "mini-serre" && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl">✅</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🌱🏡</span>
            <div>
              <h3 className="text-sm font-black uppercase">Mini Serre</h3>
              <p className="text-[8px] text-stone-400">{MINI_SERRE_WIDTH_CM}×{MINI_SERRE_DEPTH_CM}cm · 24 emplacements · 6×4 grilles</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[9px]">
            <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
              <p className="text-green-500 font-bold">🌡️ 20°C</p>
            </div>
            <div className="px-1.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-400 font-bold">💧 Auto</p>
            </div>
            <div className="px-1.5 py-1 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-amber-400 font-bold">☀️ 4.8h</p>
            </div>
          </div>

          <p className="text-[8px] text-stone-500">Mini serre propagatrice compacte ({MINI_SERRE_WIDTH_CM}×{MINI_SERRE_DEPTH_CM}cm) avec 24 emplacements pour semis et plantules. Placez-la dans la Chambre de Culture active.</p>

          <motion.button
            whileHover={coins >= MINI_SERRE_PRICE ? { scale: 1.03 } : {}}
            whileTap={coins >= MINI_SERRE_PRICE ? { scale: 0.97 } : {}}
            onClick={() => coins >= MINI_SERRE_PRICE && handleBuyMiniSerre()}
            disabled={coins < MINI_SERRE_PRICE}
            className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
              ${coins >= MINI_SERRE_PRICE
                ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white border-emerald-700 shadow-[2px_2px_0_0_#000]"
                : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
              }`}
          >
            {coins >= MINI_SERRE_PRICE
              ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — {MINI_SERRE_PRICE} 🪙</>
              : <><Info className="w-3.5 h-3.5" /> Pas assez de pièces</>
            }
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}