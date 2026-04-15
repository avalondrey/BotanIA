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

import { GrainesTab } from "./Boutique/GrainesTab";
import { ArbresTab } from "./Boutique/ArbresTab";
import { PlantulesTab } from "./Boutique/PlantulesTab";
import { ChambresTab } from "./Boutique/ChambresTab";
import { EquipementTab } from "./Boutique/EquipementTab";
import { MiniSerresTab } from "./Boutique/MiniSerresTab";
import { AchatsLocauxTab } from "./Boutique/AchatsLocauxTab";
import { DecouvertesTab } from "./Boutique/DecouvertesTab";
import { MarcheTab } from "./Boutique/MarcheTab";
import { QuestTracker } from "./QuestTracker";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

type ShopTab = "graines" | "plantules" | "chambres" | "mini-serres" | "equipement" | "arbres" | "achats-locaux" | "decouvertes-photo" | "marche";

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
  const unlockedVarieties = useGameStore((s) => s.unlockedVarieties);
  const buySeedVariety = useGameStore((s) => s.buySeedVariety);
  const discoveredPlants = useGameStore((s) => s.discoveredPlants);

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

  return (
    <div className="space-y-4">
      {/* Quest Tracker */}
      <QuestTracker />

      {/* Shop Header */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-black rounded-2xl relative overflow-hidden" style={{ borderWidth: 'var(--ui-border-width)', boxShadow: `var(--ui-shadow-offset) var(--ui-shadow-offset) 0 0 #000` }}>
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
          { key: "marche" as ShopTab, label: "🌾 Marché", desc: "Vendre" },
          { key: "chambres" as ShopTab, label: "🏠 Chambres", desc: "Grow tents" },
          { key: "mini-serres" as ShopTab, label: "🏡 Mini Serres", desc: "Propagateurs" },
          { key: "equipement" as ShopTab, label: "🔧 Equipement", desc: "Terrain & serre" },
          { key: "achats-locaux" as ShopTab, label: "🏪 Local", desc: "Pépinières" },
          { key: "decouvertes-photo" as ShopTab, label: "📸 Photo", desc: "Découvertes" },
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

      {/* Tab Content */}
      {activeTab === "graines" && (
        <GrainesTab
          coins={coins}
          seedCollection={seedCollection}
          seedVarieties={seedVarieties}
          unlockedVarieties={unlockedVarieties}
          selectedShopId={selectedShopId}
          justBought={justBought}
          allShops={allShops}
          allVarieties={allVarieties}
          handleBuySeeds={handleBuySeeds}
          buySeedVariety={buySeedVariety}
          setSelectedShopId={setSelectedShopId}
        />
      )}

      {activeTab === "arbres" && (
        <ArbresTab
          coins={coins}
          seedVarieties={seedVarieties}
          allShops={allShops}
          selectedShopId={selectedShopId}
          justBought={justBought}
          buySeedVariety={buySeedVariety}
          setSelectedShopId={setSelectedShopId}
        />
      )}

      {activeTab === "marche" && (
        <MarcheTab />
      )}

      {activeTab === "plantules" && (
        <PlantulesTab
          coins={coins}
          plantuleCollection={plantuleCollection}
          allShops={allShops}
          allPlantules={allPlantules}
          selectedShopId={selectedShopId}
          justBought={justBought}
          handleBuyPlantule={handleBuyPlantule}
          setSelectedShopId={setSelectedShopId}
        />
      )}

      {activeTab === "chambres" && (
        <ChambresTab
          coins={coins}
          ownedChambres={ownedChambres}
          activeChambreId={activeChambreId}
          buyChambreDeCulture={buyChambreDeCulture}
          setActiveChambre={setActiveChambre}
          justBought={justBought}
          setJustBought={setJustBought}
        />
      )}

      {activeTab === "mini-serres" && (
        <MiniSerresTab
          coins={coins}
          serreTiles={serreTiles}
          miniSerres={miniSerres}
          buyMiniSerre={buyMiniSerre}
          buySerreTile={buySerreTile}
          justBought={justBought}
          setJustBought={setJustBought}
        />
      )}

      {activeTab === "equipement" && (
        <EquipementTab
          coins={coins}
          serreTiles={serreTiles}
          gardenWidthCm={gardenWidthCm}
          gardenHeightCm={gardenHeightCm}
          gardenSheds={gardenSheds}
          gardenTanks={gardenTanks}
          gardenTrees={gardenTrees}
          gardenHedges={gardenHedges}
          gardenDrums={gardenDrums}
          gardenSerreZones={gardenSerreZones}
          expandGarden={expandGarden}
          buySerreZone={buySerreZone}
          buySerreTile={buySerreTile}
          justBought={justBought}
          setJustBought={setJustBought}
        />
      )}

      {activeTab === "achats-locaux" && (
        <AchatsLocauxTab
          coins={coins}
          allShops={allShops}
          allPlantules={allPlantules}
          selectedShopId={selectedShopId}
          justBought={justBought}
          handleBuyPlantule={handleBuyPlantule}
          handleBuySeeds={handleBuySeeds}
          setSelectedShopId={setSelectedShopId}
        />
      )}

      {activeTab === "decouvertes-photo" && (
        <DecouvertesTab
          discoveredPlants={discoveredPlants}
        />
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