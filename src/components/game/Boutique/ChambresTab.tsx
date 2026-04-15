"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Coins, Info } from "lucide-react";
import Image from "next/image";
import { CHAMBRE_CATALOG } from "@/store/game-store";
import type { ChambreModel } from "@/store/catalog";

interface ChambresTabProps {
  coins: number;
  ownedChambres: Record<string, number>;
  activeChambreId: string | null;
  buyChambreDeCulture: (modelId: string) => boolean;
  setActiveChambre: (modelId: string) => void;
  justBought: string | null;
  setJustBought: (key: string | null) => void;
}

export function ChambresTab({
  coins,
  ownedChambres,
  activeChambreId,
  buyChambreDeCulture,
  setActiveChambre,
  justBought,
  setJustBought,
}: ChambresTabProps) {
  const handleBuyChambre = (modelId: string) => {
    const success = buyChambreDeCulture(modelId);
    if (success) {
      setJustBought(`chambre-${modelId}`);
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CHAMBRE_CATALOG.map((model) => {
        const owned = ownedChambres[model.id] || 0;
        const isActive = activeChambreId === model.id;
        const canAfford = coins >= model.price;
        const boughtKey = `chambre-${model.id}`;

        return (
          <motion.div key={model.id} layout
            className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
              ${isActive ? "border-emerald-500 shadow-[6px_6px_0_0_#059669]" :
                canAfford ? "border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]" :
                "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}>

            {/* Image header */}
            <div className={`relative h-44 bg-gradient-to-br ${model.color} flex items-center justify-center`}>
              <Image src={model.image} alt={model.name} width={130} height={170} className="object-contain drop-shadow-lg" />
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                <Coins className="w-3 h-3 text-yellow-400" /> {model.price}
              </div>
              {owned > 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg">
                  ×{owned}
                </div>
              )}
              {isActive && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-lg animate-pulse">
                  ✅ Active
                </div>
              )}
              {/* Just bought animation */}
              <AnimatePresence>
                {justBought === boughtKey && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                    <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1, delay: 0.3 }} className="text-2xl">✅</motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{model.emoji}</span>
                <div>
                  <h3 className="text-sm font-black uppercase">{model.name}</h3>
                  <p className="text-[8px] text-stone-400">{model.widthCm}×{model.depthCm}×{model.heightCm}cm · {model.maxMiniSerres} mini serres max</p>
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-stone-400 font-bold">Largeur</p>
                  <p className="font-black">{model.widthCm}cm</p>
                </div>
                <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-stone-400 font-bold">Profondeur</p>
                  <p className="font-black">{model.depthCm}cm</p>
                </div>
                <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-stone-400 font-bold">Hauteur</p>
                  <p className="font-black">{model.heightCm}cm</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-500 font-bold">🌡️ Environnement</p>
                  <p className="font-black">20°C / 65% / 4.8h</p>
                </div>
                <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                  <p className="text-stone-400 font-bold">🌱 Capacité</p>
                  <p className="font-black">{model.maxMiniSerres} mini serres</p>
                </div>
              </div>

              <p className="text-[8px] text-stone-500">{model.description}</p>

              {/* Set active button if owned */}
              {owned > 0 && !isActive && (
                <button
                  onClick={() => setActiveChambre(model.id)}
                  className="w-full py-1.5 text-[10px] font-black uppercase rounded-xl border-2 bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 transition-all"
                >
                  📌 Définir comme active
                </button>
              )}

              <motion.button
                whileHover={canAfford ? { scale: 1.03 } : {}}
                whileTap={canAfford ? { scale: 0.97 } : {}}
                onClick={() => canAfford && handleBuyChambre(model.id)}
                disabled={!canAfford}
                className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                  ${canAfford
                    ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white border-emerald-700 shadow-[2px_2px_0_0_#000]"
                    : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  }`}
              >
                {canAfford
                  ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — {model.price} 🪙</>
                  : <><Info className="w-3.5 h-3.5" /> Pas assez de pièces</>
                }
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}