"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coins, Package, TrendingUp, ShoppingCart } from "lucide-react";
import { useEconomyStore } from "@/store/economy-store";
import { PLANTS } from "@/lib/ai-engine";

export function MarcheTab() {
  const harvestInventory = useEconomyStore((s) => s.harvestInventory);
  const sellHarvest = useEconomyStore((s) => s.sellHarvest);
  const getSellPrice = useEconomyStore((s) => s.getSellPrice);

  const entries = Object.entries(harvestInventory).filter(([, qty]) => qty > 0);

  const handleSellOne = (plantDefId: string) => {
    sellHarvest(plantDefId, 1);
  };

  const handleSellAll = (plantDefId: string) => {
    const qty = harvestInventory[plantDefId] || 0;
    sellHarvest(plantDefId, qty);
  };

  const handleSellEverything = () => {
    entries.forEach(([plantDefId, qty]) => {
      sellHarvest(plantDefId, qty);
    });
  };

  const totalValue = entries.reduce((sum, [id, qty]) => sum + qty * getSellPrice(id), 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border-[3px] border-amber-400 rounded-2xl shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-black uppercase">🌾 Marché</h3>
              <p className="text-[8px] text-amber-600 font-bold">Vendez vos récoltes pour gagner des pièces</p>
            </div>
          </div>
          {totalValue > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSellEverything}
              className="px-3 py-1.5 bg-gradient-to-b from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase rounded-lg border-2 border-amber-700 shadow-[2px_2px_0_0_#000] hover:from-amber-400 hover:to-amber-500 flex items-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Tout vendre ({totalValue} 🪙)
            </motion.button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-stone-400 text-sm font-bold">Aucune récolte à vendre</p>
          <p className="text-stone-300 text-[10px]">Récoltez des plantes dans votre jardin pour remplir votre inventaire</p>
        </div>
      )}

      {/* Harvest items */}
      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entries.map(([plantDefId, quantity]) => {
            const plantDef = PLANTS[plantDefId];
            const pricePerUnit = getSellPrice(plantDefId);
            const totalItemValue = quantity * pricePerUnit;

            return (
              <motion.div
                key={plantDefId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border-[3px] border-amber-400 rounded-2xl shadow-[4px_4px_0_0_#000] overflow-hidden"
              >
                <div className="relative h-24 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                  <span className="text-4xl">{plantDef?.harvestEmoji || "🌿"}</span>
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-lg">
                    x{quantity}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    {pricePerUnit}/u
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{plantDef?.emoji || "🌱"}</span>
                    <div>
                      <h3 className="text-sm font-black uppercase">{plantDef?.name || plantDefId}</h3>
                      <p className="text-[8px] text-stone-400">Total: {totalItemValue} 🪙</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSellOne(plantDefId)}
                      className="flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg border-2 bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000] hover:from-green-400 hover:to-green-500 flex items-center justify-center gap-1"
                    >
                      <Coins className="w-3 h-3" />
                      Vendre 1
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSellAll(plantDefId)}
                      className="flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg border-2 bg-gradient-to-b from-amber-500 to-amber-600 text-white border-amber-700 shadow-[2px_2px_0_0_#000] hover:from-amber-400 hover:to-amber-500 flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Vendre tout
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}