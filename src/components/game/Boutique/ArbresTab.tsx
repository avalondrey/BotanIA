"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Coins } from "lucide-react";
import Image from "next/image";
import { SEED_SHOPS, SEED_VARIETIES } from "@/store/game-store";
import type { SeedShop, SeedVariety } from "@/store/catalog";

interface ArbresTabProps {
  coins: number;
  seedVarieties: Record<string, number>;
  allShops: SeedShop[];
  selectedShopId: string;
  justBought: string | null;
  buySeedVariety: (id: string) => void;
  setSelectedShopId: (id: string) => void;
}

export function ArbresTab({
  coins,
  seedVarieties,
  allShops,
  selectedShopId,
  justBought,
  buySeedVariety,
  setSelectedShopId,
}: ArbresTabProps) {
  return (
    <div className="space-y-3">
      {/* Shop Selector for fruit trees - Arbres + Bientôt dispo */}
      <div className="flex gap-2 flex-wrap">
        {[
          SEED_SHOPS.find(s => s.id === "guignard"),
          SEED_SHOPS.find(s => s.id === "inrae"),
          SEED_SHOPS.find(s => s.id === "pepinieres-bordas"),
          SEED_SHOPS.find(s => s.id === "arbres-tissot"),
          SEED_SHOPS.find(s => s.id === "fruitiers-forest"),
          SEED_SHOPS.find(s => s.id === "leaderplant"),
          SEED_SHOPS.find(s => s.id === "bientot-dispo"),
        ].filter(Boolean).map((shop) => (
          <button
            key={shop!.id}
            onClick={() => setSelectedShopId(shop!.id)}
            className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all flex items-center gap-2
              ${selectedShopId === shop!.id
                ? `bg-gradient-to-br ${shop!.color} ${shop!.borderColor} shadow-[2px_2px_0_0_#000]`
                : "bg-white border-stone-200 hover:border-stone-400"}`}
          >
            <span className="text-lg">{shop!.emoji}</span>
            <div className="text-left">
              <p className={`text-[10px] font-black uppercase ${selectedShopId === shop!.id ? "text-black" : "text-stone-500"}`}>{shop!.name}</p>
              <p className={`text-[7px] font-bold ${selectedShopId === shop!.id ? "text-stone-600" : "text-stone-300"}`}>{shop!.description.slice(0, 40)}…</p>
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
              <Image src={shop.image} alt={shop.name} width={180} height={48} className="object-contain rounded-lg" />
              <div>
                <h3 className="text-sm font-black uppercase">{shop.emoji} {shop.name}</h3>
                <p className="text-[8px] text-stone-500">{shop.description}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Fruit Tree Cards */}
      {(() => {
        // Tree shops ONLY (pas saintemarthe qui est dans graines)
        const treeShopIds = ["guignard", "inrae", "pepinieres-bordas", "arbres-tissot", "fruitiers-forest", "leaderplant", "bientot-dispo"];
        // Filter: show only varieties from the selected shop
        const treeVarieties = SEED_VARIETIES.filter(v =>
          treeShopIds.includes(v.shopId) && v.shopId === selectedShopId
        );
        const treePlants = treeVarieties.map(v => ({
          id: v.id,
          plantDefId: v.plantDefId,
          name: v.name,
          emoji: v.emoji,
          price: v.price,
          brand: v.shopId ? (allShops.find(s => s.id === v.shopId)?.name || v.shopId) : "Inconnu",
          packetImage: v.image,
          cardImage: v.image,
          realDaysToHarvest: v.realDaysToHarvest,
          category: "fruit-tree" as const,
          isPacket: false,
          owned: seedVarieties[v.id] || 0,
          canAfford: coins >= v.price,
          boughtKey: `variety-${v.id}`,
          stageDurations: v.stageDurations,
        }));

        if (treePlants.length === 0) {
          return <p className="text-center text-stone-400 text-sm py-8">Aucun arbre fruitier disponible dans cette boutique.</p>;
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {treePlants.map((item) => (
              <motion.div
                key={item.boughtKey}
                layout
                className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                  ${item.canAfford ? "border-green-600 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

                <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                  {item.packetImage ? (
                    <Image
                      src={item.packetImage}
                      alt={item.name}
                      width={285}
                      height={180}
                      className="object-cover drop-shadow-lg"
                    />
                  ) : (
                    <span className="text-4xl">{item.emoji || '🌱'}</span>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    {item.price}
                  </div>
                  {item.owned > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-black rounded-lg">
                      x{item.owned}
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <h3 className="text-sm font-black uppercase">{item.name}</h3>
                      <p className="text-[8px] text-stone-400">🌳 Arbre · {item.brand}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={item.canAfford ? { scale: 1.05 } : {}}
                    whileTap={item.canAfford ? { scale: 0.95 } : {}}
                    onClick={() => buySeedVariety(item.id)}
                    disabled={!item.canAfford}
                    className={`w-full py-2 text-[10px] font-black uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1
                      ${item.canAfford
                        ? "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000] hover:from-green-400 hover:to-green-500"
                        : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                      }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Acheter
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}