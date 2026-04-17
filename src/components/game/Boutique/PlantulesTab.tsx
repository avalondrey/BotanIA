"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Coins, Info } from "lucide-react";
import Image from "next/image";
import { SEED_SHOPS, PLANTULES_LOCALES } from "@/store/game-store";
import { PLANTS } from "@/lib/ai-engine";
import type { SeedShop, SeedVariety } from "@/store/catalog";

interface PlantulesTabProps {
  coins: number;
  plantuleCollection: Record<string, number>;
  allShops: SeedShop[];
  allPlantules: any[];
  selectedShopId: string;
  justBought: string | null;
  handleBuyPlantule: (plantDefId: string) => void;
  setSelectedShopId: (id: string) => void;
}

export function PlantulesTab({
  coins,
  plantuleCollection,
  allShops,
  allPlantules,
  selectedShopId,
  justBought,
  handleBuyPlantule,
  setSelectedShopId,
}: PlantulesTabProps) {
  return (
    <div className="space-y-3">
      {/* Shop Selector - Magasins Plantules */}
      <div className="flex gap-2 flex-wrap">
        {[
          SEED_SHOPS.find(s => s.id === "jardiland"),
          SEED_SHOPS.find(s => s.id === "gamm-vert"),
          SEED_SHOPS.find(s => s.id === "esat-antes"),
          SEED_SHOPS.find(s => s.id === "jardi-leclerc"),
          SEED_SHOPS.find(s => s.id === "leaderplant"),
        ].filter(Boolean).map((shop) => (
          <button
            key={shop!.id}
            onClick={() => setSelectedShopId(shop!.id)}
            className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center gap-2 min-w-[120px]
              ${selectedShopId === shop!.id
                ? `bg-gradient-to-br ${shop!.color} ${shop!.borderColor} shadow-[2px_2px_0_0_#000]`
                : "bg-white border-stone-200 hover:border-stone-400"}`}
          >
            <span className="text-lg">{shop!.emoji}</span>
            <div className="text-left">
              <p className={`text-[10px] font-black uppercase ${selectedShopId === shop!.id ? "text-black" : "text-stone-500"}`}>{shop!.name}</p>
              <p className={`text-[7px] font-bold ${selectedShopId === shop!.id ? "text-stone-600" : "text-stone-300"}`}>{shop!.description.slice(0, 30)}…</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Shop Banner */}
      {(() => {
        const shop = allShops.find(s => s.id === selectedShopId);
        if (!shop) return null;
        return (
          <div className={`p-3 bg-gradient-to-br ${shop.color} ${shop.borderColor} border-[3px] rounded-2xl shadow-[4px_4px_0_0_#000]`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{shop.emoji}</div>
              <div>
                <h3 className="text-sm font-black uppercase">{shop.name}</h3>
                <p className="text-[8px] text-stone-500">{shop.description}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Plantules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLANTULES_LOCALES.filter(p => p.shopId === selectedShopId).map((item) => {
          const plantDef = PLANTS[item.plantDefId];
          const owned = plantuleCollection[item.plantDefId] || 0;
          const canAfford = coins >= item.price;
          const isFree = item.price === 0;
          const boughtKey = `plantule-${item.id}`;

          return (
            <motion.div
              key={item.id}
              layout
              className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                ${canAfford || isFree ? "border-emerald-600 shadow-[4px_4px_0_0_#059669] hover:shadow-[6px_6px_0_0_#059669]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

              <div className="relative h-28 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                {plantDef && (
                  <Image
                    src={`/plants/${item.plantDefId}-stage-1.png`}
                    alt={item.name}
                    width={105}
                    height={80}
                    className="object-contain drop-shadow-lg"
                  />
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                  {isFree ? (
                    <span className="text-green-400">GRATUIT</span>
                  ) : (
                    <>
                      <Coins className="w-3 h-3 text-yellow-400" />
                      {item.price}
                    </>
                  )}
                </div>
                {owned > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
                    ×{owned}
                  </div>
                )}
                <AnimatePresence>
                  {justBought === boughtKey && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-emerald-500/20"
                    >
                      <motion.div
                        animate={{ y: -10, opacity: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-2xl"
                      >
                        ✅
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <h3 className="text-sm font-black uppercase">{item.name}</h3>
                    <p className="text-[8px] text-stone-400">Jeune plantule prête à pousser</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                  <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                    <p className="text-stone-400 font-bold">Stade initial</p>
                    <p className="font-black">🌿 Plantule</p>
                  </div>
                  <div className="px-1.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                    <p className="text-stone-400 font-bold">Gain temps</p>
                    <p className="font-black">~20j d&apos;avance</p>
                  </div>
                </div>

                <motion.button
                  whileHover={canAfford || isFree ? { scale: 1.03 } : {}}
                  whileTap={canAfford || isFree ? { scale: 0.97 } : {}}
                  onClick={() => (canAfford || isFree) && handleBuyPlantule(item.plantDefId)}
                  disabled={!canAfford && !isFree}
                  className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                    ${canAfford || isFree
                      ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-700 shadow-[2px_2px_0_0_#000] hover:from-emerald-400 hover:to-teal-500"
                      : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                    }`}
                >
                  {isFree ? (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Échanger
                    </>
                  ) : canAfford ? (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Acheter — {item.price} 🪙
                    </>
                  ) : (
                    <>
                      <Info className="w-3.5 h-3.5" />
                      Pas assez de pièces
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {PLANTULES_LOCALES.filter(p => p.shopId === selectedShopId).length === 0 && (
        <p className="text-center text-stone-400 text-sm py-8">Aucun plantule disponible dans cette boutique.</p>
      )}
    </div>
  );
}