"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  useGameStore,
  SEED_CATALOG,
  SEED_SHOPS,
  SEED_VARIETIES,
  PLANTULE_CATALOG,
  MINI_SERRE_PRICE,
  CHAMBRE_CATALOG,
  MINI_SERRE_WIDTH_CM,
  MINI_SERRE_DEPTH_CM,
  MAX_GARDEN_WIDTH_CM,
  MAX_GARDEN_HEIGHT_CM,
  loadCustomCards,
} from "@/store/game-store";
import { PLANTS } from "@/lib/ai-engine";
import { ShoppingCart, Coins, Info, Store } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

type ShopTab = "graines" | "plantules" | "chambres" | "mini-serres" | "equipement" | "arbres";

export function Boutique() {
  const coins = useGameStore((s) => s.coins);
  const seedCollection = useGameStore((s) => s.seedCollection);
  const plantuleCollection = useGameStore((s) => s.plantuleCollection);
  const serreTiles = useGameStore((s) => s.serreTiles);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const miniSerres = useGameStore((s) => s.miniSerres);
  const gardenWidthCm = useGameStore((s) => s.gardenWidthCm);
  const gardenHeightCm = useGameStore((s) => s.gardenHeightCm);
  const buySeeds = useGameStore((s) => s.buySeeds);
  const buyPlantule = useGameStore((s) => s.buyPlantule);
  const buySerreTile = useGameStore((s) => s.buySerreTile);
  const buySerreZone = useGameStore((s) => s.buySerreZone);
  const buyMiniSerre = useGameStore((s) => s.buyMiniSerre);
  const buyChambreDeCulture = useGameStore((s) => s.buyChambreDeCulture);
  const ownedChambres = useGameStore((s) => s.ownedChambres);
  const activeChambreId = useGameStore((s) => s.activeChambreId);
  const setActiveChambre = useGameStore((s) => s.setActiveChambre);
  const expandGarden = useGameStore((s) => s.expandGarden);
  const seedVarieties = useGameStore((s) => s.seedVarieties);
  const buySeedVariety = useGameStore((s) => s.buySeedVariety);

  const [activeTab, setActiveTab] = useState<ShopTab>("graines");
  const [justBought, setJustBought] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>(SEED_SHOPS[0]?.id || "vilmorin");

  // Custom cards from admin
  const [customShops, setCustomShops] = useState<any[]>([]);
  const [customVarieties, setCustomVarieties] = useState<any[]>([]);
  const [customPlantules, setCustomPlantules] = useState<any[]>([]);

  useEffect(() => {
    loadCustomCards().then(({ customShops, customVarieties, customPlantules }) => {
      setCustomShops(customShops);
      setCustomVarieties(customVarieties);
      setCustomPlantules(customPlantules);
    });
  }, []);

  // Merged lists
  const allShops = [...SEED_SHOPS, ...customShops];
  const allVarieties = [...SEED_VARIETIES, ...customVarieties];
  const allPlantules = [...PLANTULE_CATALOG, ...customPlantules];

  const handleBuySeeds = (plantDefId: string) => {
    const success = buySeeds(plantDefId);
    if (success) {
      setJustBought(`seed-${plantDefId}`);
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  const handleBuyPlantule = (plantDefId: string) => {
    const success = buyPlantule(plantDefId);
    if (success) {
      setJustBought(`plantule-${plantDefId}`);
      setTimeout(() => setJustBought(null), 1500);
    }
  };

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

  const handleBuyMiniSerre = () => {
    const success = buyMiniSerre();
    if (success) {
      setJustBought("mini-serre");
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  const handleBuyChambre = (modelId: string) => {
    const success = buyChambreDeCulture(modelId);
    if (success) {
      setJustBought(`chambre-${modelId}`);
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

  const handleBuyVariety = (varietyId: string) => {
    const success = buySeedVariety(varietyId);
    if (success) {
      setJustBought(`variety-${varietyId}`);
      setTimeout(() => setJustBought(null), 1500);
    }
  };

  const selectedShop = allShops.find((s) => s.id === selectedShopId) || allShops[0];
  const shopVarieties = allVarieties.filter((v) => v.shopId === selectedShopId);

  return (
    <div className="space-y-4">
      {/* Shop Header */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-[3px] border-black rounded-2xl shadow-[6px_6px_0_0_#000] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.8px, transparent 0.8px)", backgroundSize: "4px 4px" }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <ShoppingCart className="w-6 h-6 text-amber-700" />
            </motion.div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight" style={{ textShadow: "2px 2px 0 #000" }}>
                🏪 Boutique
              </h2>
              <p className="text-[9px] text-amber-600 font-bold">Graines, plantules, chambres et équipement pour votre jardin</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl border-2 border-amber-400 shadow-[2px_2px_0_0_#000]">
            <Coins className="w-4 h-4 text-amber-600" />
            <motion.span
              key={coins}
              initial={{ scale: 1.3, color: "#d97706" }}
              animate={{ scale: 1, color: "#000" }}
              className="text-sm font-black"
            >
              {coins}
            </motion.span>
            <span className="text-[8px] font-bold text-amber-600">🪙</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {[
          { key: "graines" as ShopTab, label: "🌱 Graines", desc: "Paquets" },
          { key: "arbres" as ShopTab, label: "🌳 Arbres", desc: "Fruitiers" },
          { key: "plantules" as ShopTab, label: "🌿 Plantules", desc: "Jeunes plants" },
          { key: "chambres" as ShopTab, label: "🏠 Chambres", desc: "Grow tents" },
          { key: "mini-serres" as ShopTab, label: "🏡 Mini Serres", desc: "Propagateurs" },
          { key: "equipement" as ShopTab, label: "🔧 Equipement", desc: "Terrain & serre" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 text-[10px] font-black uppercase rounded-xl border-2 transition-all flex flex-col items-center gap-0.5
              ${activeTab === tab.key
                ? "bg-black text-white border-black shadow-[2px_2px_0_0_#000]"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[7px] font-bold ${activeTab === tab.key ? "text-stone-300" : "text-stone-400"}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Graines Tab — Multi-shop varieties */}
      {activeTab === "graines" && (
        <div className="space-y-3">
          {/* Shop Selector */}
          <div className="flex gap-2">
            {allShops.map((shop) => (
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
              <Image src={selectedShop.image} alt={selectedShop.name} width={48} height={48} className="object-contain rounded-lg" />
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

                if (!variety.unlocked) {
                  return (
                    <div
                      key={variety.id}
                      layout
                      className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all cursor-pointer
                        ${canAfford ? "border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc]"}`}
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                        style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

                      <div className="relative h-32 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                        <Image
                          src={variety.packetImage}
                          alt={variety.name}
                          width={90}
                          height={90}
                          className="object-contain drop-shadow-lg"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                          <Coins className="w-3 h-3 text-yellow-400" />
                          {variety.price}
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{variety.emoji}</span>
                          <div>
                            <h3 className="text-sm font-black uppercase">{variety.name}</h3>
                            <p className="text-[8px] text-stone-400">{parentPlant?.emoji} {parentPlant?.name} -- {variety.grams}g de semences</p>
                          </div>
                        </div>

                       
                     






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

                    <div className="relative h-32 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                      <Image
                        src={variety.image}
                        alt={variety.name}
                        width={90}
                        height={90}
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
                        onClick={() => canAfford && handleBuyVariety(variety.id)}
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
              <h3 className="text-[10px] font-black uppercase text-stone-500 tracking-wider">Graines classiques (paquet x3)</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SEED_CATALOG.map((item) => {
                const plantDef = PLANTS[item.plantDefId];
                const owned = seedCollection[item.id] || 0;
                const canAfford = coins >= item.price;
                const boughtKey = `seed-${item.id}`;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                      ${canAfford ? "border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
                  >
                    <div className="relative h-20 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.packetImage}
                        alt={item.name}
                        width={80}
                        height={48}
                        className="object-contain drop-shadow-lg"
                      />
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
      )}

      {/* Arbres Fruitiers Tab */}
      {activeTab === "arbres" && (
        <div className="space-y-3">
          {/* Shop Selector for fruit trees */}
          <div className="flex gap-2 flex-wrap">
            {[SEED_SHOPS.find(s => s.id === "guignard"), SEED_SHOPS.find(s => s.id === "inrae"), SEED_SHOPS.find(s => s.id === "saintemarthe")].filter(Boolean).map((shop) => (
              <button
                key={shop!.id}
                onClick={() => setSelectedShopId(shop!.id)}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl border-2 transition-all flex items-center gap-2
                  ${selectedShopId === shop!.id
                    ? `bg-gradient-to-br ${shop!.color} ${shop!.borderColor} shadow-[2px_2px_0_0_#000]`
                    : "bg-white border-stone-200 hover:border-stone-400"}`}
              >
                <span className="text-lg">{shop!.emoji}</span>
                <div className="text-left">
                  <p className={`text-[10px] font-black uppercase ${selectedShopId === shop!.id ? "text-black" : "text-stone-500"}`}>{shop!.name}</p>
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
                  <Image src={shop.image} alt={shop.name} width={48} height={48} className="object-contain rounded-lg" />
                  <div>
                    <h3 className="text-sm font-black uppercase">{shop.emoji} {shop.name}</h3>
                    <p className="text-[8px] text-stone-500">{shop.description}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Fruit Tree Seed Cards */}
          {(() => {
            const fruitSeeds = SEED_CATALOG.filter(s => s.category === "fruit-tree");
            const shopFruitVarieties = SEED_VARIETIES.filter(v =>
              (v.shopId === "guignard" || v.shopId === "inrae" || v.shopId === "saintemarthe" || v.shopId === "kokopelli") &&
              fruitSeeds.some(s => s.plantDefId === v.plantDefId)
            );
            const treePlants = [...fruitSeeds.map(s => ({
              ...s,
              isPacket: true,
              owned: seedCollection[s.id] || 0,
              canAfford: coins >= s.price,
              boughtKey: `seed-${s.id}`,
            })), ...shopFruitVarieties.map(v => {
              const parentSeed = fruitSeeds.find(s => s.plantDefId === v.plantDefId);
              return {
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
              };
            })];

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
                      ${item.canAfford ? "border-green-600 shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
                  >
                    <div className="relative h-20 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.packetImage}
                        alt={item.name}
                        width={80}
                        height={48}
                        className="object-contain drop-shadow-lg"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[6px] font-black uppercase rounded-sm tracking-wider shadow-md">
                        {item.brand}
                      </div>
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black text-white text-[8px] font-black rounded-lg flex items-center gap-0.5">
                        <Coins className="w-2.5 h-2.5 text-yellow-400" />
                        {item.price}
                      </div>
                      {item.owned > 0 && (
                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-black rounded-lg">
                          x{item.owned}
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-base">{item.emoji}</span>
                        <h3 className="text-[9px] font-black uppercase truncate">{item.name}</h3>
                      </div>
                      <p className="text-[7px] text-stone-400">Arbre · Recolte: {item.realDaysToHarvest}j</p>
                      <motion.button
                        whileHover={item.canAfford ? { scale: 1.05 } : {}}
                        whileTap={item.canAfford ? { scale: 0.95 } : {}}
                        onClick={() => item.isPacket ? buySeeds(item.id) : buySeedVariety(item.id)}
                        disabled={!item.canAfford}
                        className={`w-full py-1.5 text-[9px] font-black uppercase rounded-lg border-2 transition-all flex items-center justify-center gap-1
                          ${item.canAfford
                            ? "bg-gradient-to-b from-green-500 to-green-600 text-white border-green-700 shadow-[2px_2px_0_0_#000] hover:from-green-400 hover:to-green-500"
                            : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                          }`}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Acheter
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Plantules Tab */}
      {activeTab === "plantules" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allPlantules.map((item) => {
            const plantDef = PLANTS[item.plantDefId];
            const owned = plantuleCollection[item.plantDefId] || 0;
            const canAfford = coins >= item.price;
            const boughtKey = `plantule-${item.plantDefId}`;

            return (
              <motion.div
                key={item.plantDefId}
                layout
                className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                  ${canAfford ? "border-emerald-600 shadow-[4px_4px_0_0_#059669] hover:shadow-[6px_6px_0_0_#059669]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

                <div className="relative h-28 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                  {plantDef && (
                    <Image
                      src={`/stages/${item.plantDefId}/1.png`}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-contain drop-shadow-lg"
                    />
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    {item.price}
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
                    whileHover={canAfford ? { scale: 1.03 } : {}}
                    whileTap={canAfford ? { scale: 0.97 } : {}}
                    onClick={() => canAfford && handleBuyPlantule(item.plantDefId)}
                    disabled={!canAfford}
                    className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                      ${canAfford
                        ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-700 shadow-[2px_2px_0_0_#000] hover:from-emerald-400 hover:to-teal-500"
                        : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                      }`}
                  >
                    {canAfford ? (
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
      )}

      {/* Chambres de Culture Tab */}
      {activeTab === "chambres" && (
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
                  <Image src={model.image} alt={model.name} width={160} height={160} className="object-contain drop-shadow-lg" />
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
      )}

      {/* Mini Serres Tab */}
      {activeTab === "mini-serres" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div layout
            className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all sm:col-span-2 lg:col-span-1
              ${coins >= MINI_SERRE_PRICE ? "border-emerald-500 shadow-[6px_6px_0_0_#059669]" : "border-stone-300 opacity-80"}`}>

            <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
              <Image src="/cards/card-mini-serre.png" alt="Mini Serre" width={160} height={160} className="object-contain drop-shadow-lg" />
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
      )}

      {/* Equipment Tab */}
      {activeTab === "equipement" && (
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
              <p className="text-[8px] text-stone-500">Serre tunnel 6x4m avec protection contre le gel. Les plantes beneficient d'un microclimat favorable (+4°C, pluie reduite, plus de lumiere). Placee automatiquement dans votre jardin.</p>
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
        </div>
      )}

      {/* Real French Garden Centers */}
      <div className="p-4 bg-gradient-to-br from-stone-50 to-zinc-100 border-[3px] border-black rounded-2xl shadow-[6px_6px_0_0_#000] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.8px, transparent 0.8px)", backgroundSize: "4px 4px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-5 h-5 text-stone-600" />
            <h3 className="text-sm font-black uppercase">🏪 Jardineries partenaires</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { name: "Truffaut", emoji: "🌿", desc: "Jardinerie premium" },
              { name: "Jardiland", emoji: "🌻", desc: "Le spécialiste jardin" },
              { name: "Botanic", emoji: "🌱", desc: "Jardin bio & éco" },
              { name: "Point Vert", emoji: "🌲", desc: "Au cœur de la nature" },
              { name: "Gamm Vert", emoji: "🌳", desc: "Proche de chez vous" },
            ].map((store) => (
              <div key={store.name} className="p-2 bg-white border-2 border-stone-200 rounded-xl text-center hover:border-stone-400 transition-colors">
                <span className="text-lg">{store.emoji}</span>
                <p className="text-[10px] font-black mt-1">{store.name}</p>
                <p className="text-[7px] text-stone-400">{store.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[8px] text-stone-400 mt-2 text-center">Informations décoratives — retrouvez ces jardineries en France ! 🇫🇷</p>
        </div>
      </div>
    </div>
  );
}
