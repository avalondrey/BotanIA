"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  useGameStore,
  SEED_CATALOG,
  SEED_SHOPS,
  SEED_VARIETIES,
  PLANTULE_CATALOG,
  PLANTULES_LOCALES,
  loadCustomCards,
} from "@/store/game-store";
import { ShoppingCart, Coins, Store } from "lucide-react";
import { useState, useEffect } from "react";

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
import { BoutiqueSearchBar } from "./Boutique/BoutiqueSearchBar";
import { BoutiqueSearchResults } from "./Boutique/BoutiqueSearchResults";
import { useBoutiqueSearch } from "./Boutique/useBoutiqueSearch";

type ShopCategory = "graines-plantes" | "arbres-local" | "infrastructure" | "marche" | "decouvertes";
type SubTab = "graines" | "plantules" | "fruitiers" | "pepinieres" | "chambres" | "serres" | "equipement" | null;

const CATEGORY_SUBTABS: Record<ShopCategory, { key: SubTab; label: string }[]> = {
  "graines-plantes": [
    { key: "graines", label: "🌱 Graines" },
    { key: "plantules", label: "🌿 Plantules" },
  ],
  "arbres-local": [
    { key: "fruitiers", label: "🌳 Fruitiers" },
    { key: "pepinieres", label: "🏪 Pépinières" },
  ],
  "infrastructure": [
    { key: "chambres", label: "🏠 Chambres" },
    { key: "serres", label: "🏡 Mini-Serres" },
    { key: "equipement", label: "🔧 Équipement" },
  ],
  "marche": [],
  "decouvertes": [],
};

const CATEGORIES: { key: ShopCategory; label: string; desc: string }[] = [
  { key: "graines-plantes", label: "🌱 Graines & Plantes", desc: "Semences & plants" },
  { key: "arbres-local", label: "🌳 Arbres & Local", desc: "Fruitiers & pépinières" },
  { key: "infrastructure", label: "🏠 Infrastructure", desc: "Serres & équipement" },
  { key: "marche", label: "🌾 Marché", desc: "Vendre" },
  { key: "decouvertes", label: "📸 Découvertes", desc: "Photo ID" },
];

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

  const [activeCategory, setActiveCategory] = useState<ShopCategory>("graines-plantes");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("graines");
  const [justBought, setJustBought] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>(SEED_SHOPS[0]?.id || "vilmorin");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearchMode = searchQuery.trim().length >= 2;

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

  // Reset shop when changing sub-tabs
  useEffect(() => {
    if (activeSubTab === "fruitiers") setSelectedShopId("guignard");
    else if (activeSubTab === "pepinieres") setSelectedShopId("pepiniere-locale");
    else if (activeSubTab === "plantules") setSelectedShopId("jardiland");
    else if (activeSubTab === "graines") setSelectedShopId(SEED_SHOPS[0]?.id || "vilmorin");
  }, [activeSubTab]);

  // Merged lists
  const allShops = [...SEED_SHOPS, ...customShops];
  const allVarieties = [...SEED_VARIETIES, ...customVarieties];
  const allPlantules = [...PLANTULE_CATALOG, ...customPlantules];

  // Search
  const { results: searchResults } = useBoutiqueSearch(
    searchQuery,
    allVarieties,
    PLANTULES_LOCALES,
    SEED_CATALOG,
    PLANTULE_CATALOG,
    seedVarieties,
    unlockedVarieties,
    plantuleCollection,
    seedCollection,
  );

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

  const handleSearchBuyVariety = (id: string) => {
    const success = buySeedVariety(id);
    if (success) setJustBought(`search-${id}`);
    setTimeout(() => setJustBought(null), 1500);
  };

  const handleSearchBuySeeds = (plantDefId: string) => {
    const success = buySeeds(plantDefId);
    if (success) setJustBought(`search-seed-${plantDefId}`);
    setTimeout(() => setJustBought(null), 1500);
  };

  const handleSearchBuyPlantule = (plantDefId: string) => {
    const success = buyPlantule(plantDefId);
    if (success) setJustBought(`search-plantule-${plantDefId}`);
    setTimeout(() => setJustBought(null), 1500);
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

      {/* Search Bar */}
      <BoutiqueSearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        resultCount={isSearchMode ? searchResults.length : undefined}
      />

      <AnimatePresence mode="wait">
        {isSearchMode ? (
          <motion.div key="search-results"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <BoutiqueSearchResults
              results={searchResults}
              query={searchQuery}
              coins={coins}
              justBought={justBought}
              onBuyVariety={handleSearchBuyVariety}
              onBuySeeds={handleSearchBuySeeds}
              onBuyPlantule={handleSearchBuyPlantule}
            />
          </motion.div>
        ) : (
          <motion.div key="tab-content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {/* Category Tabs */}
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    const subTabs = CATEGORY_SUBTABS[cat.key];
                    if (subTabs.length > 0 && !subTabs.some(st => st.key === activeSubTab)) {
                      setActiveSubTab(subTabs[0].key);
                    }
                  }}
                  className={`flex-1 py-2 px-3 text-[10px] font-black uppercase rounded-xl border-2 transition-all flex flex-col items-center gap-0.5
                    ${activeCategory === cat.key
                      ? "bg-black text-white border-black shadow-[2px_2px_0_0_#000]"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                    }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[7px] font-bold ${activeCategory === cat.key ? "text-stone-300" : "text-stone-400"}`}>
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Sub-tabs */}
            {CATEGORY_SUBTABS[activeCategory].length > 1 && (
              <div className="flex gap-2">
                {CATEGORY_SUBTABS[activeCategory].map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => setActiveSubTab(sub.key)}
                    className={`flex-1 py-1.5 px-3 text-[10px] font-black rounded-lg border-2 transition-all
                      ${activeSubTab === sub.key
                        ? "bg-indigo-500 text-white border-indigo-600 shadow-[2px_2px_0_0_#4338ca]"
                        : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                      }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tab Content */}
            {activeSubTab === "graines" && (
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

            {activeSubTab === "plantules" && (
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

            {activeSubTab === "fruitiers" && (
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

            {activeSubTab === "pepinieres" && (
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

            {activeSubTab === "chambres" && (
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

            {activeSubTab === "serres" && (
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

            {activeSubTab === "equipement" && (
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

            {activeCategory === "marche" && (
              <MarcheTab />
            )}

            {activeCategory === "decouvertes" && (
              <DecouvertesTab
                discoveredPlants={discoveredPlants}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

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