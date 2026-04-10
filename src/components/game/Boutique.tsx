"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  useGameStore,
  SEED_CATALOG,
  SEED_SHOPS,
  SEED_VARIETIES,
  PLANTULE_CATALOG,
  PLANTULES_LOCALES,
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

type ShopTab = "graines" | "plantules" | "chambres" | "mini-serres" | "equipement" | "arbres" | "achats-locaux";

export function Boutique() {
  const coins = useGameStore((s) => s.coins);
  const seedCollection = useGameStore((s) => s.seedCollection);
  const plantuleCollection = useGameStore((s) => s.plantuleCollection);
  const serreTiles = useGameStore((s) => s.serreTiles);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const miniSerres = useGameStore((s) => s.miniSerres);
  const gardenWidthCm = useGameStore((s) => s.gardenWidthCm);
  const gardenHeightCm = useGameStore((s) => s.gardenHeightCm);
  const gardenSheds = useGameStore((s) => s.gardenSheds);
  const gardenTanks = useGameStore((s) => s.gardenTanks);
  const gardenTrees = useGameStore((s) => s.gardenTrees);
  const gardenHedges = useGameStore((s) => s.gardenHedges);
  const gardenDrums = useGameStore((s) => s.gardenDrums);
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

  // Reset shop when changing tabs
  useEffect(() => {
    if (activeTab === "arbres") {
      setSelectedShopId("guignard");
    } else if (activeTab === "achats-locaux") {
      setSelectedShopId("pepiniere-locale");
    } else if (activeTab === "plantules") {
      setSelectedShopId("jardiland");
    }
  }, [activeTab]);

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
          { key: "achats-locaux" as ShopTab, label: "🏪 Local", desc: "Pépinières" },
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

                if (!variety.unlocked) {
                  return (
                    <div
                      key={variety.id}
                      className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all cursor-pointer
                        ${canAfford ? "border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc]"}`}
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                        style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />

                      <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                        <Image
                          src={variety.packetImage}
                          alt={variety.name}
                          width={180}
                          height={180}
                          className="object-cover drop-shadow-1g"
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
                        width={220}
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
              <h3 className="text-[18px] font-black uppercase text-stone-500 tracking-wider">Graines classiques (paquet x3)</h3>
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
                        width={85}
                        height={100}
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
                  <Image src={shop.image} alt={shop.name} width={100} height={48} className="object-contain rounded-lg" />
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
            const treeShopIds = ["guignard", "inrae", "pepinieres-bordas", "arbres-tissot", "fruitiers-forest", "bientot-dispo"];
            // Filter by selected shop if it's a tree shop
            const treeVarieties = SEED_VARIETIES.filter(v =>
              treeShopIds.includes(v.shopId) &&
              (treeShopIds.includes(selectedShopId) ? v.shopId === selectedShopId : true)
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
                      <Image
                        src={item.packetImage}
                        alt={item.name}
                        width={180}
                        height={180}
                        className="object-cover drop-shadow-lg"
                      />
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
      )}

      {/* Plantules Tab */}
      {activeTab === "plantules" && (
        <div className="space-y-3">
          {/* Shop Selector - Magasins Plantules */}
          <div className="flex gap-2 flex-wrap">
            {[
              SEED_SHOPS.find(s => s.id === "jardiland"),
              SEED_SHOPS.find(s => s.id === "gamm-vert"),
              SEED_SHOPS.find(s => s.id === "esat-antes"),
              SEED_SHOPS.find(s => s.id === "jardi-leclerc"),
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
                        src={`/stages/${item.plantDefId}/1.png`}
                        alt={item.name}
                        width={80}
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
              <p className="text-[8px] text-stone-500">Cuve de récupération d'eau de pluie. Placement automatique.</p>
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

          {/* Arbre */}
          <motion.div
            layout
            className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
              ${coins >= 100 ? "border-green-600 shadow-[6px_6px_0_0_#166534] hover:shadow-[8px_8px_0_0_#166534]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
            <div className="relative h-32 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
              <div className="text-6xl">🌳</div>
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                <Coins className="w-3 h-3 text-yellow-400" />
                100
              </div>
              {gardenTrees.length > 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-black rounded-lg">×{gardenTrees.length}</div>
              )}
              <AnimatePresence>
                {justBought === "tree" && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1 }} className="text-2xl">✅</motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🌳</span>
                <div>
                  <h3 className="text-sm font-black uppercase">Arbre fruitier</h3>
                  <p className="text-[8px] text-stone-400">Pommier — Fruitier</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-400 font-bold">🌿 Fruitier</p>
                </div>
                <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-400 font-bold">⏳ +croissance</p>
                </div>
              </div>
              <p className="text-[8px] text-stone-500">Arbre fruitier pour votre jardin. Placement automatique.</p>
              <motion.button
                whileHover={coins >= 100 ? { scale: 1.03 } : {}}
                whileTap={coins >= 100 ? { scale: 0.97 } : {}}
                onClick={() => {
                  const state = useGameStore.getState();
                  if (state.buyTree && state.buyTree(100)) {
                    setJustBought("tree");
                    setTimeout(() => setJustBought(null), 1500);
                  }
                }}
                disabled={coins < 100}
                className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                  ${coins >= 100
                    ? "bg-gradient-to-b from-green-500 to-emerald-600 text-white border-green-700 shadow-[2px_2px_0_0_#000]"
                    : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  }`}
              >
                {coins >= 100 ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 100 🪙</> : <><Info className="w-3.5 h-3.5" /> Pas assez</>}
              </motion.button>
            </div>
          </motion.div>

          {/* Haie */}
          <motion.div
            layout
            className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
              ${coins >= 50 ? "border-green-500 shadow-[6px_6px_0_0_#15803d] hover:shadow-[8px_8px_0_0_#15803d]" : "border-stone-300 shadow-[2px_2px_0_0_#ccc] opacity-80"}`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "3px 3px" }} />
            <div className="relative h-32 bg-gradient-to-br from-lime-50 to-green-50 flex items-center justify-center">
              <div className="text-6xl">🌿</div>
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                <Coins className="w-3 h-3 text-yellow-400" />
                50
              </div>
              {gardenHedges.length > 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-400 text-white text-[10px] font-black rounded-lg">×{gardenHedges.length}</div>
              )}
              <AnimatePresence>
                {justBought === "hedge" && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <motion.div animate={{ y: -10, opacity: 0 }} transition={{ duration: 1 }} className="text-2xl">✅</motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🌿</span>
                <div>
                  <h3 className="text-sm font-black uppercase">Haie</h3>
                  <p className="text-[8px] text-stone-400">Délimitation de zones</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-400 font-bold">🌿 Brise-vent</p>
                </div>
                <div className="px-1.5 py-1 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-400 font-bold">🏠 Abrit</p>
                </div>
              </div>
              <p className="text-[8px] text-stone-500">Haie pour délimiter les zones du jardin. Placement automatique.</p>
              <motion.button
                whileHover={coins >= 50 ? { scale: 1.03 } : {}}
                whileTap={coins >= 50 ? { scale: 0.97 } : {}}
                onClick={() => {
                  const state = useGameStore.getState();
                  if (state.buyHedge && state.buyHedge(50)) {
                    setJustBought("hedge");
                    setTimeout(() => setJustBought(null), 1500);
                  }
                }}
                disabled={coins < 50}
                className={`w-full py-2 text-[11px] font-black uppercase rounded-xl border-2 transition-all flex items-center justify-center gap-1.5
                  ${coins >= 50
                    ? "bg-gradient-to-b from-green-400 to-emerald-500 text-white border-green-600 shadow-[2px_2px_0_0_#000]"
                    : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  }`}
              >
                {coins >= 50 ? <><ShoppingCart className="w-3.5 h-3.5" /> Acheter — 50 🪙</> : <><Info className="w-3.5 h-3.5" /> Pas assez</>}
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
              <p className="text-[8px] text-stone-500">Fût de récupération d'eau de pluie. Placement automatique.</p>
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

        </div>
      )}

      {/* Achats Locaux Tab */}
      {activeTab === "achats-locaux" && (
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
            {["pepiniere-locale", "les-pepineres-quissac", "leaderplant", "marche-producteurs", "jardin-partage"].map((shopId) => {
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
                      onClick={() => (canAfford || isFree) && handleBuySeeds(item.id)}
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
