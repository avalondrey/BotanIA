"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Coins, Info } from "lucide-react";
import Image from "next/image";
import { PLANTULES_LOCALES } from "@/store/game-store";
import type { SeedShop } from "@/store/catalog";

interface AchatsLocauxTabProps {
  coins: number;
  allShops: SeedShop[];
  allPlantules: any[];
  selectedShopId: string;
  justBought: string | null;
  handleBuyPlantule: (plantDefId: string) => void;
  handleBuySeeds: (id: string) => void;
  setSelectedShopId: (id: string) => void;
}

export function AchatsLocauxTab({
  coins,
  allShops,
  allPlantules,
  selectedShopId,
  justBought,
  handleBuyPlantule,
  handleBuySeeds,
  setSelectedShopId,
}: AchatsLocauxTabProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-[3px] border-amber-300 rounded-2xl shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🏪</div>
          <div>
            <h3 className="text-sm font-black uppercase">Achat local et pepinieres</h3>
            <p className="text-[8px] text-stone-500">Plants et plantules de producers locaux — Circuits courts</p>
          </div>
        </div>
      </div>

      {/* Local Shop Selector */}
      <div className="flex gap-2 flex-wrap">
        {["pepiniere-locale", "les-pepineres-quissac", "marche-producteurs", "jardin-partage"].map((shopId) => {
          const shop = allShops.find(s => s.id === shopId);
          if (!shop) return null;
          return (
            <button
              key={shop.id}
              onClick={() => setSelectedShopId(shop.id)}
              className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center gap-2 min-w-[120px]
                ${selectedShopId === shop.id
                  ? `bg-gradient-to-br ${shop.color} ${shop.borderColor} shadow-[2px_2px_0_0_#000]`
                  : "bg-white border-stone-200 hover:border-stone-400"}`}
            >
              <span className="text-lg">{shop.emoji}</span>
              <div className="text-left">
                <p className={`text-[10px] font-black uppercase ${selectedShopId === shop.id ? "text-black" : "text-stone-500"}`}>{shop.name}</p>
                <p className={`text-[7px] font-bold ${selectedShopId === shop.id ? "text-stone-600" : "text-stone-300"}`}>{shop.description.slice(0, 30)}…</p>
              </div>
            </button>
          );
        })}
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
          const canAfford = coins >= item.price;
          const isFree = item.price === 0;
          const boughtKey = `local-${item.id}`;

          return (
            <motion.div
              key={item.id}
              layout
              className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                ${canAfford || isFree ? "border-amber-400 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

              <div className="relative h-32 bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="object-contain drop-shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-5xl">{item.emoji}</span>
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
                {item.grams === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black rounded-lg">
                    Plantule
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <h3 className="text-[11px] font-black uppercase">{item.name}</h3>
                    <p className="text-[7px] text-stone-400">
                      {item.grams === 0 ? "Plantule" : `${item.grams}g`} · {item.realDaysToHarvest}j
                    </p>
                  </div>
                </div>
                <p className="text-[8px] text-stone-500 line-clamp-2">{item.description}</p>

                <motion.button
                  whileHover={canAfford || isFree ? { scale: 1.03 } : {}}
                  whileTap={canAfford || isFree ? { scale: 0.97 } : {}}
                  onClick={() => (canAfford || isFree) && (item.grams === 0 ? handleBuyPlantule(item.plantDefId) : handleBuySeeds(item.id))}
                  disabled={!canAfford && !isFree}
                  className={`w-full py-2 text-[10px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                    ${canAfford || isFree
                      ? "bg-gradient-to-b from-amber-500 to-orange-600 text-white border-amber-700 shadow-[2px_2px_0_0_#000] hover:from-amber-400 hover:to-orange-500"
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
        <p className="text-center text-stone-400 text-sm py-8">Aucun plant disponible dans cette boutique.</p>
      )}

      {/* Info */}
      <div className="text-center text-[9px] text-stone-400 mt-2">
        🌍 Achat local = circuit court, plants adaptes a votre region !
      </div>
    </div>
  );
}