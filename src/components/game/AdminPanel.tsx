"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, SEED_CATALOG, MINI_SERRE_WIDTH_CM, MINI_SERRE_DEPTH_CM } from "@/store/game-store";
import { X, Coins, Gauge, Zap, Trash2, Shield, Plus, Copy, Wand2, Code, Image as ImageIcon, LayoutDashboard, RotateCcw } from "lucide-react";
import { PLANTS, PLANT_SPACING } from "@/lib/ai-engine";
import { useUISettingsStore, UI_PRESETS, UI_SLIDER_GROUPS, type UIPreset, type UIDimensions } from "@/store/ui-settings-store";
import { microScan } from "@/lib/micro-client";

// ── Admin button (rendered in place, in the header) ──

export function AdminButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => useGameStore.setState({ adminOpen: true })}
      className="p-1.5 border-2 border-amber-400 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors relative"
      title="Panneau Admin"
    >
      <Shield className="w-3.5 h-3.5" />
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
    </motion.button>
  );
}

// ── Admin mode indicator banner ──

export function AdminModeBanner() {
  const adminMode = useGameStore((s) => s.adminMode);
  const toggleAdminMode = useGameStore((s) => s.toggleAdminMode);
  const diseasesEnabled = useGameStore((s) => s.diseasesEnabled);
  const speed = useGameStore((s) => s.speed);
  const day = useGameStore((s) => s.day);
  const setSpeed = useGameStore((s) => s.setSpeed);

  // Date display
  const month = Math.floor((day % 360) / 30);
  const dayOfMonth = (day % 30) + 1;
  const year = Math.floor(day / 360) + 1;
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  const handleDeactivate = () => {
    setSpeed(1); // Reset speed to 1x
    toggleAdminMode();
  };

  if (!adminMode) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-3 py-1.5 flex items-center justify-between z-20 relative">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="animate-pulse text-sm">🛡️</span>
        <span className="text-[10px] font-black uppercase tracking-wider">Mode Admin</span>
        <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded font-bold">GEL OFF · HORS SAISON · ILLIMITÉ</span>
        {/* Speed display */}
        <div className="flex items-center gap-1 bg-black/30 rounded-lg px-1.5 py-0.5">
          <span className="text-[8px] font-bold">⚡</span>
          <span className="text-[9px] font-black">{speed}×</span>
          <span className="text-[7px] text-white/60">vitesse</span>
        </div>
        {!diseasesEnabled && (
          <span className="text-[8px] bg-violet-500/50 px-1.5 py-0.5 rounded font-bold">🦠 MALADIES OFF</span>
        )}
        {/* Date display */}
        <div className="flex items-center gap-1 bg-black/30 rounded-lg px-1.5 py-0.5">
          <span className="text-[8px] font-bold">📅</span>
          <span className="text-[9px] font-black">{dayOfMonth} {monthNames[month]} An {year}</span>
          <span className="text-[7px] text-white/60">Jour {day}</span>
        </div>
      </div>
      <button
        onClick={handleDeactivate}
        className="text-white/80 hover:text-white text-[9px] font-bold underline underline-offset-2 transition-colors"
      >
        Désactiver
      </button>
    </div>
  );
}

// ── Admin modal (rendered via portal to body, z-[9999]) ──

export function AdminPanel() {
  const isOpen = useGameStore((s) => s.adminOpen);
  const coins = useGameStore((s) => s.coins);
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const score = useGameStore((s) => s.score);
  const bestScore = useGameStore((s) => s.bestScore);
  const day = useGameStore((s) => s.day);
  const initGame = useGameStore((s) => s.initGame);
  const seedCollection = useGameStore((s) => s.seedCollection);
  const plantuleCollection = useGameStore((s) => s.plantuleCollection);
  const serreTiles = useGameStore((s) => s.serreTiles);
  const miniSerres = useGameStore((s) => s.miniSerres);
  const pepiniere = useGameStore((s) => s.pepiniere);
  const gardenPlantsList = useGameStore((s) => s.gardenPlants);
  const adminMode = useGameStore((s) => s.adminMode);
  const toggleAdminMode = useGameStore((s) => s.toggleAdminMode);
  const diseasesEnabled = useGameStore((s) => s.diseasesEnabled);
  const toggleDiseases = useGameStore((s) => s.toggleDiseases);

  const [coinAmount, setCoinAmount] = useState(500);
  const [customSpeed, setCustomSpeed] = useState(speed);
  const [mounted, setMounted] = useState(false);
  const [showCardEngine, setShowCardEngine] = useState(false);
  const [showInterface, setShowInterface] = useState(false);

  // Card Engine form state
  const [ceType, setCeType] = useState<"plant" | "chambre" | "mini-serre">("plant");
  const [ceId, setCeId] = useState("");
  const [ceName, setCeName] = useState("");
  const [ceEmoji, setCeEmoji] = useState("🌱");
  const [cePrice, setCePrice] = useState(50);
  const [ceImage, setCeImage] = useState("/cards/card-");
  const [ceDescription, setCeDescription] = useState("");

  // Plant-specific fields
  const [cePlantSpacingCm, setCePlantSpacingCm] = useState(30);
  const [ceRowSpacingCm, setCeRowSpacingCm] = useState(40);
  const [ceOptimalTempMin, setCeOptimalTempMin] = useState(15);
  const [ceOptimalTempMax, setCeOptimalTempMax] = useState(25);
  const [ceWaterNeed, setCeWaterNeed] = useState(4.0);
  const [ceLightNeed, setCeLightNeed] = useState(7);
  const [ceRealDaysToHarvest, setCeRealDaysToHarvest] = useState(90);
  const [ceOptimalMonths, setCeOptimalMonths] = useState("2,3,4");
  const [ceStageDurations, setCeStageDurations] = useState("10,25,22,52");
  const [ceDiseaseResist, setCeDiseaseResist] = useState(50);
  const [cePestResist, setCePestResist] = useState(50);

  // Chambre-specific fields
  const [ceChambreWidth, setCeChambreWidth] = useState(80);
  const [ceChambreHeight, setCeChambreHeight] = useState(160);
  const [ceChambreDepth, setCeChambreDepth] = useState(80);
  const [ceMaxMiniSerres, setCeMaxMiniSerres] = useState(4);

  const [generatedScript, setGeneratedScript] = useState("");
  const [scriptCopied, setScriptCopied] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const close = () => useGameStore.setState({ adminOpen: false });

  // ═══ Admin Debug Actions ═══
  const cureAllDiseases = () => {
    const state = useGameStore.getState();
    // Cure garden plants
    const curedGarden = state.gardenPlants.map(p => ({ ...p, hasDisease: false, hasPest: false, diseaseDays: 0, health: 100 }));
    // Cure pepiniere
    const curedPepiniere = state.pepiniere.map(p => ({ ...p, hasDisease: false, hasPest: false, diseaseDays: 0, health: 100 }));
    // Cure mini serres
    const curedMiniSerres = state.miniSerres.map(serre => ({
      ...serre,
      slots: serre.slots.map(row => row.map(p => p ? { ...p, hasDisease: false, hasPest: false, diseaseDays: 0, health: 100 } : null)),
    }));
    useGameStore.setState({ gardenPlants: curedGarden, pepiniere: curedPepiniere, miniSerres: curedMiniSerres });
  };

  const maxAllPlants = () => {
    const state = useGameStore.getState();
    const maxedGarden = state.gardenPlants.map(p => ({ ...p, stage: 3, growthProgress: 100, waterLevel: 100, health: 100, isHarvestable: true, hasDisease: false, hasPest: false, needsWater: false }));
    const maxedPepiniere = state.pepiniere.map(p => ({ ...p, stage: 3, growthProgress: 100, waterLevel: 100, health: 100, hasDisease: false, hasPest: false, needsWater: false }));
    const maxedMiniSerres = state.miniSerres.map(serre => ({
      ...serre,
      slots: serre.slots.map(row => row.map(p => p ? { ...p, stage: 3, growthProgress: 100, waterLevel: 100, health: 100, hasDisease: false, hasPest: false, needsWater: false, daysSincePlanting: 999 } : null)),
    }));
    useGameStore.setState({ gardenPlants: maxedGarden, pepiniere: maxedPepiniere, miniSerres: maxedMiniSerres });
  };

  const waterAllPlants = () => {
    const state = useGameStore.getState();
    const wateredGarden = state.gardenPlants.map(p => ({ ...p, waterLevel: 100, needsWater: false }));
    const wateredPepiniere = state.pepiniere.map(p => ({ ...p, waterLevel: 100, needsWater: false }));
    const wateredMiniSerres = state.miniSerres.map(serre => ({
      ...serre,
      slots: serre.slots.map(row => row.map(p => p ? { ...p, waterLevel: 100, needsWater: false } : null)),
    }));
    useGameStore.setState({ gardenPlants: wateredGarden, pepiniere: wateredPepiniere, miniSerres: wateredMiniSerres });
  };

  const giveCoins = (amount: number) => {
    if (amount <= 0) return;
    const newCoins = coins + amount;
    useGameStore.setState({ coins: newCoins });
    if (typeof window !== "undefined") {
      localStorage.setItem("jardin-culture-coins", String(newCoins));
    }
  };

  const setCoinsExact = (amount: number) => {
    if (amount < 0) return;
    useGameStore.setState({ coins: amount });
    if (typeof window !== "undefined") {
      localStorage.setItem("jardin-culture-coins", String(amount));
    }
  };

  const applyCustomSpeed = () => {
    setSpeed(customSpeed);
  };

  const resetAll = () => {
    if (confirm("Admin : Réinitialiser TOUTE la partie ?")) {
      initGame(true);
      close();
    }
  };

  const giveAllSeeds = () => {
    const allSeeds = { tomato: 99, carrot: 99, strawberry: 99, lettuce: 99, basil: 99, pepper: 99 };
    useGameStore.setState({ seedCollection: allSeeds });
    if (typeof window !== "undefined") {
      localStorage.setItem("jardin-culture-seeds", JSON.stringify(allSeeds));
    }
  };

  const fixInventory = () => {
    // Reset seedCollection to defaults and clear corrupted localStorage
    const defaults = { tomato: 3, carrot: 2, strawberry: 2, lettuce: 3, basil: 2, pepper: 1 };
    useGameStore.setState({ seedCollection: defaults, seedVarieties: {} });
    if (typeof window !== "undefined") {
      localStorage.removeItem("jardin-culture-seeds");
      localStorage.removeItem("jardin-culture-seed-varieties");
    }
    close();
    window.location.reload();
  };

  const giveAllPlantules = () => {
    const allPlantules = { tomato: 10, carrot: 10, strawberry: 10, lettuce: 10, basil: 10, pepper: 10 };
    useGameStore.setState({ plantuleCollection: allPlantules });
    if (typeof window !== "undefined") {
      localStorage.setItem("jardin-culture-plantules", JSON.stringify(allPlantules));
    }
  };

  // Count stats
  const totalSeeds = Object.values(seedCollection).reduce((a, b) => a + b, 0);
  const totalPlantules = Object.values(plantuleCollection).reduce((a, b) => a + b, 0);
  let gardenPlants = gardenPlantsList.length;
  let miniSerrePlants = 0;
  miniSerres.forEach((s) => s.slots.forEach((row) => row.forEach((p) => { if (p) miniSerrePlants++; })));

  const speedOptions = [
    { value: 1, label: "1×", desc: "Normal" },
    { value: 2, label: "2×", desc: "Rapide" },
    { value: 5, label: "5×", desc: "Très rapide" },
    { value: 10, label: "10×", desc: "Ultra rapide" },
    { value: 25, label: "25×", desc: "Hyper vitesse" },
    { value: 50, label: "50×", desc: "⚡ Turbo" },
    { value: 100, label: "100×", desc: "🔥 Extrême" },
  ];

  // ═══ Card Engine: Generate Script ═══

  const generateCardScript = () => {
    if (!ceId || !ceName) return;

    let script = "";

    if (ceType === "plant") {
      const months = ceOptimalMonths.split(",").map(m => parseInt(m.trim())).filter(m => !isNaN(m));
      const stages = ceStageDurations.split(",").map(s => parseInt(s.trim())).filter(s => !isNaN(s));
      while (stages.length < 4) stages.push(30);

      script = `// ═══ Nouvelle carte plante : ${ceName} ═══
// 1. Ajouter dans ai-engine.ts → PLANTS :
${ceId}: {
  id: "${ceId}", name: "${ceName}", emoji: "${ceEmoji}",
  image: "${ceImage || `/cards/card-${ceId}.png`}",
  stageDurations: [${stages.join(", ")}],
  optimalTemp: [${ceOptimalTempMin}, ${ceOptimalTempMax}],
  waterNeed: ${ceWaterNeed},
  lightNeed: ${ceLightNeed},
  harvestEmoji: "${ceEmoji}",
  cropCoefficient: ${(ceWaterNeed / 4.5).toFixed(2)},
  optimalPlantMonths: [${months.join(", ")}],
  optimalSeasons: [${months.some(m => m >= 2 && m <= 4) ? '"spring", "summer"' : '"spring", "autumn"'}],
  diseaseResistance: ${ceDiseaseResist},
  pestResistance: ${cePestResist},
  realDaysToHarvest: ${ceRealDaysToHarvest},
},

// 2. Ajouter dans ai-engine.ts → PLANT_SPACING :
${ceId}: { plantSpacingCm: ${cePlantSpacingCm}, rowSpacingCm: ${ceRowSpacingCm}, color: "#888888", label: "${cePlantSpacingCm}×${ceRowSpacingCm}cm" },

// 3. Ajouter dans ai-engine.ts → STAGE_IMAGES :
${ceId}: ["/stages/${ceId}/0.png", "/stages/${ceId}/1.png", "/stages/${ceId}/2.png", "/stages/${ceId}/3.png", "/stages/${ceId}/4.png", "/stages/${ceId}/5.png"],

// 4. Ajouter dans game-store.ts → SEED_CATALOG :
{ plantDefId: "${ceId}", name: "Graine ${ceName}", emoji: "${ceEmoji}", price: ${cePrice}, realDaysToHarvest: ${ceRealDaysToHarvest}, optimalMonths: [${months.join(", ")}] },

// 5. Ajouter dans game-store.ts → PLANTULE_CATALOG :
{ plantDefId: "${ceId}", name: "Plantule ${ceName}", emoji: "${ceEmoji}", price: ${Math.round(cePrice * 1.5)} },

// 6. Images à générer (via admin image gen) :
// z-ai-generate -p "Manga cel-shaded cross-hatching ${ceName} dirt mound in terracotta pot, white background" -o "./public/stages/${ceId}/0.png"
// z-ai-generate -p "Manga cel-shaded cross-hatching ${ceName} seedling 1 leaf in terracotta pot, white background" -o "./public/stages/${ceId}/1.png"
// z-ai-generate -p "Manga cel-shaded cross-hatching ${ceName} seedling 2 leaves in terracotta pot, white background" -o "./public/stages/${ceId}/2.png"
// z-ai-generate -p "Manga cel-shaded cross-hatching ${ceName} seedling 3 leaves slightly bigger in terracotta pot, white background" -o "./public/stages/${ceId}/3.png"
// z-ai-generate -p "Manga cel-shaded cross-hatching ${ceName} seedling 4 leaves in terracotta pot, white background" -o "./public/stages/${ceId}/4.png"
// z-ai-generate -p "Manga cel-shaded cross-hatching ${ceName} seedling 5 leaves ready to transplant in terracotta pot, white background" -o "./public/stages/${ceId}/5.png"`;
    } else if (ceType === "chambre") {
      script = `// ═══ Nouvelle carte Chambre de Culture : ${ceName} ═══
// 1. Ajouter dans game-store.ts → CHAMBRE_CATALOG :
{
  id: "${ceId}",
  name: "${ceName}",
  widthCm: ${ceChambreWidth},
  heightCm: ${ceChambreHeight},
  depthCm: ${ceChambreDepth},
  maxMiniSerres: ${ceMaxMiniSerres},
  price: ${cePrice},
  image: "${ceImage || `/cards/card-${ceId}.png`}",
  emoji: "${ceEmoji}",
  description: "${ceDescription || `Chambre de culture ${ceChambreWidth}×${ceChambreDepth}×${ceChambreHeight}cm.`}",
  color: "from-green-100 to-emerald-100",
},

// 2. Image à générer :
// z-ai-generate -p "${ceName}, grow tent ${ceChambreWidth}x${ceChambreDepth}x${ceChambreHeight}cm, illustration style, white background, no text" -o "./public/cards/card-${ceId}.png"`;
    } else {
      script = `// ═══ Configuration mini serre : ${ceName} ═══
// Note: Les mini serres sont un type unique avec 24 slots (6×4)
// Les dimensions réelles sont: ${MINI_SERRE_WIDTH_CM}×${MINI_SERRE_DEPTH_CM}cm
// Pour personnaliser les mini serres, modifiez:
// - MINI_SERRE_WIDTH_CM = ${ceChambreWidth}
// - MINI_SERRE_DEPTH_CM = ${ceChambreDepth}
// - MINI_SERRE_PRICE = ${cePrice}
// dans game-store.ts`;
    }

    setGeneratedScript(script);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999, backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-black rounded-2xl w-full overflow-y-auto"
            style={{ borderWidth: 'var(--ui-border-width)', maxWidth: 'var(--ui-modal-width)', maxHeight: 'var(--ui-modal-max-height)', boxShadow: `var(--ui-modal-shadow-offset) var(--ui-modal-shadow-offset) 0 0 #000` }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-b-[3px] border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <div>
                  <h2 className="text-base font-black uppercase" style={{ textShadow: "2px 2px 0 #000" }}>
                    ⚙️ Panneau Admin
                  </h2>
                  <p className="text-[8px] text-amber-600 font-bold">Options de jeu — Mode administrateur</p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* ═══ MODE ADMIN (tous les droits) ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className={`w-4 h-4 ${adminMode ? 'text-red-600' : 'text-stone-400'}`} />
                  <h3 className="text-xs font-black uppercase text-stone-800">Mode Admin</h3>
                  {adminMode && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black rounded border border-red-700 animate-pulse">
                      ACTIF
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleAdminMode}
                  className={`w-full py-3 text-[11px] font-black uppercase rounded-xl border-[3px] transition-all flex items-center justify-center gap-2
                    ${adminMode
                      ? "bg-gradient-to-b from-red-500 to-red-600 text-white border-red-800 shadow-[4px_4px_0_0_#000]"
                      : "bg-gradient-to-b from-stone-100 to-stone-200 text-stone-600 border-stone-300 hover:border-red-300"
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  {adminMode ? "🔴 Désactiver le Mode Admin" : "🛡️ Activer le Mode Admin"}
                </motion.button>

                {/* Debug buttons (only when admin mode active) */}
                {adminMode && (
                  <>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={cureAllDiseases}
                      className="px-2 py-1.5 bg-gradient-to-b from-emerald-400 to-emerald-500 text-white rounded-lg border-2 border-emerald-700 text-[8px] font-black uppercase shadow-[1px_1px_0_0_#000] hover:from-emerald-300 hover:to-emerald-400"
                    >
                      💊 Guérir tout
                    </button>
                    <button
                      onClick={waterAllPlants}
                      className="px-2 py-1.5 bg-gradient-to-b from-blue-400 to-blue-500 text-white rounded-lg border-2 border-blue-700 text-[8px] font-black uppercase shadow-[1px_1px_0_0_#000] hover:from-blue-300 hover:to-blue-400"
                    >
                      💧 Arroser tout
                    </button>
                    <button
                      onClick={maxAllPlants}
                      className="px-2 py-1.5 bg-gradient-to-b from-amber-400 to-amber-500 text-white rounded-lg border-2 border-amber-700 text-[8px] font-black uppercase shadow-[1px_1px_0_0_#000] hover:from-amber-300 hover:to-amber-400"
                    >
                      ⚡ Max croissance
                    </button>
                  </div>

                  {/* Disease toggle */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={toggleDiseases}
                      className={`flex-1 px-2 py-1.5 rounded-lg border-2 text-[8px] font-black uppercase shadow-[1px_1px_0_0_#000] transition-all ${
                        diseasesEnabled
                          ? "bg-gradient-to-b from-stone-100 to-stone-200 text-stone-600 border-stone-300"
                          : "bg-gradient-to-b from-violet-400 to-violet-500 text-white border-violet-700"
                      }`}
                    >
                      {diseasesEnabled ? "🦠 Maladies: ON" : "🦠 Maladies: OFF"}
                    </button>
                  </div>
                  </>
                )}

                <div className="mt-2 p-2 rounded-xl border border-stone-200 bg-stone-50 text-[8px] text-stone-500 space-y-1">
                  <p className="font-black text-stone-700 uppercase">Avantages du mode admin :</p>
                  <ul className="space-y-0.5 ml-3 list-disc">
                    <li>🌱 Planter <strong>hors saison</strong> (hiver, gel)</li>
                    <li>❄️ <strong>Aucun dégât de gel</strong> sur les plantes</li>
                    <li>💰 Pièces et ressources <strong>illimitées</strong></li>
                    <li>⚡ Vitesse <strong>jusqu'à 100×</strong></li>
                    <li>🔧 Reset et debug <strong>complets</strong></li>
                  </ul>
                </div>
              </div>

              {/* ═══ INTERFACE ═══ */}
              <div>
                <button
                  onClick={() => setShowInterface(!showInterface)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase text-indigo-800">Interface</h3>
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black rounded border border-indigo-300">
                      {useUISettingsStore.getState().preset.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-500">{showInterface ? "▼" : "▶"}</span>
                </button>

                <AnimatePresence>
                  {showInterface && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      {/* Preset buttons */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["compact", "normal", "grand", "ultra"] as UIPreset[]).map((p) => {
                          const ui = useUISettingsStore.getState();
                          const isActive = ui.preset === p;
                          const icons: Record<UIPreset, string> = { compact: "📱", normal: "📐", grand: "🖥️", ultra: "🏯" };
                          return (
                            <motion.button
                              key={p}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => useUISettingsStore.getState().setPreset(p)}
                              className={`py-2 px-1 text-center rounded-xl border-2 transition-all ${
                                isActive
                                  ? "bg-indigo-500 text-white border-indigo-700 shadow-[2px_2px_0_0_#000]"
                                  : "bg-white text-stone-600 border-stone-200 hover:border-indigo-300"
                              }`}
                            >
                              <p className="text-[12px]">{icons[p]}</p>
                              <p className="text-[8px] font-bold">{p.charAt(0).toUpperCase() + p.slice(1)}</p>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Advanced sliders */}
                      <UIAdvancedSliders />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ═══ VITESSE DE CULTURE ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-black uppercase text-orange-800">Vitesse de culture</h3>
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[8px] font-black rounded border border-orange-300">
                    Actuel: {speed}×
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {speedOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSpeed(opt.value);
                        setCustomSpeed(opt.value);
                      }}
                      className={`py-2 px-1 text-center rounded-xl border-2 transition-all
                        ${speed === opt.value
                          ? "bg-orange-500 text-white border-orange-700 shadow-[2px_2px_0_0_#000]"
                          : "bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:bg-orange-50"
                        }`}
                    >
                      <p className="text-[11px] font-black">{opt.label}</p>
                      <p className={`text-[6px] font-bold ${speed === opt.value ? "text-orange-200" : "text-stone-400"}`}>
                        {opt.desc}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <label className="text-[9px] font-bold text-stone-500 whitespace-nowrap">Vitesse libre:</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={customSpeed}
                    onChange={(e) => setCustomSpeed(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-2 py-1 border-2 border-stone-200 rounded-lg text-[11px] font-bold text-center focus:border-orange-400 focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-stone-400">×</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={applyCustomSpeed}
                    className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-lg border-2 border-orange-700 shadow-[2px_2px_0_0_#000] hover:bg-orange-400"
                  >
                    OK
                  </motion.button>
                </div>
              </div>

              {/* ═══ PIÈCES ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-black uppercase text-amber-800">Pièces</h3>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded border border-amber-300">
                    {coins} 🪙
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[
                    { amount: 100, label: "+100" },
                    { amount: 500, label: "+500" },
                    { amount: 1000, label: "+1K" },
                    { amount: 5000, label: "+5K" },
                    { amount: 10000, label: "+10K" },
                    { amount: 50000, label: "+50K" },
                    { amount: 100000, label: "+100K" },
                    { amount: 999999, label: "MAX" },
                  ].map((opt) => (
                    <motion.button
                      key={opt.amount}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => giveCoins(opt.amount)}
                      className="py-2 px-1 bg-gradient-to-b from-yellow-50 to-amber-50 border-2 border-amber-300 rounded-xl text-center hover:border-amber-500 hover:shadow-[2px_2px_0_0_#000] transition-all"
                    >
                      <p className="text-[10px] font-black text-amber-800">{opt.label}</p>
                      <p className="text-[6px] font-bold text-amber-500">🪙 pièces</p>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <label className="text-[9px] font-bold text-stone-500 whitespace-nowrap">Montant libre:</label>
                  <input
                    type="number"
                    min={1}
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-2 py-1 border-2 border-stone-200 rounded-lg text-[11px] font-bold text-center focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-stone-400">🪙</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => giveCoins(coinAmount)}
                    className="px-3 py-1 bg-gradient-to-b from-yellow-400 to-amber-500 text-white text-[10px] font-black rounded-lg border-2 border-amber-600 shadow-[2px_2px_0_0_#000] hover:from-yellow-300 hover:to-amber-400"
                  >
                    + Ajouter
                  </motion.button>
                </div>

                <div className="flex gap-2 items-center mt-2">
                  <label className="text-[9px] font-bold text-stone-500 whitespace-nowrap">Définir à:</label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={coins}
                    id="admin-set-coins"
                    className="flex-1 px-2 py-1 border-2 border-stone-200 rounded-lg text-[11px] font-bold text-center focus:border-amber-400 focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const input = document.getElementById("admin-set-coins") as HTMLInputElement;
                      const val = parseInt(input?.value || "0");
                      if (val >= 0) setCoinsExact(val);
                    }}
                    className="px-3 py-1 bg-stone-700 text-white text-[10px] font-black rounded-lg border-2 border-stone-800 shadow-[2px_2px_0_0_#000] hover:bg-stone-600"
                  >
                    Définir
                  </motion.button>
                </div>
              </div>

              {/* ═══ RESSOURCES GRATUITES ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-black uppercase text-emerald-800">Ressources gratuites</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={giveAllSeeds}
                    className="py-2.5 px-3 bg-gradient-to-b from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-center hover:border-green-500 hover:shadow-[2px_2px_0_0_#000] transition-all"
                  >
                    <p className="text-[10px] font-black text-green-800">🌱 Donner toutes graines</p>
                    <p className="text-[7px] text-green-500 font-bold">×99 de chaque type</p>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={giveAllPlantules}
                    className="py-2.5 px-3 bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl text-center hover:border-emerald-500 hover:shadow-[2px_2px_0_0_#000] transition-all"
                  >
                    <p className="text-[10px] font-black text-emerald-800">Donner toutes plantules</p>
                    <p className="text-[7px] text-emerald-500 font-bold">x10 de chaque type</p>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={fixInventory}
                    className="py-2.5 px-3 bg-gradient-to-b from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl text-center hover:border-orange-500 hover:shadow-[2px_2px_0_0_#000] transition-all"
                  >
                    <p className="text-[10px] font-black text-orange-800">Fix Inventaire</p>
                    <p className="text-[7px] text-orange-500 font-bold">Reset graines + reload</p>
                  </motion.button>
                </div>
              </div>

              {/* ═══ SCAN PLANTES ═══ */}
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <button
                  onClick={async () => {
                    try {
                      const game = useGameStore.getState();
                      const result = await microScan({
                        gameContext: {
                          day: game.day,
                          season: game.season,
                          gardenPlants: game.gardenPlants,
                          pepiniere: game.pepiniere,
                          gardenTanks: game.gardenTanks,
                          weather: game.weather,
                          realWeather: game.realWeather,
                        },
                        snapshot: false,
                      });
                      if (result.notifications?.length || result.suggestions?.length) {
                        const r = result;
                        alert(`Scan termine!\n\nNotifications: ${r.notifications.length}\nSuggestions: ${r.suggestions.length}`);
                      } else {
                        alert('Scan termine — aucun probleme detecte.');
                      }
                    } catch (e) {
                      alert('Erreur scan: ' + e);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded transition-colors"
                >
                  🔍 Scanner les Plantes (via microservice)
                </button>
                <p className="text-[8px] text-green-600 mt-1 text-center">Detecte les PlantCards, sprites et entrees manquants via le microservice IA</p>
              </div>

              {/* ═══ MOTEUR DE CARTES ═══ */}
              <div>
                <button
                  onClick={() => setShowCardEngine(!showCardEngine)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-black uppercase text-purple-800">🪄 Moteur de Cartes</h3>
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[7px] font-black rounded border border-purple-300">
                      NEW
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-500">{showCardEngine ? "▼" : "▶"}</span>
                </button>

                <AnimatePresence>
                  {showCardEngine && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <p className="text-[8px] text-stone-500">Créez de nouvelles cartes (plantes, chambres, équipement). Remplissez le formulaire et générez un script à copier-coller.</p>

                      {/* Type selector */}
                      <div className="flex gap-1.5">
                        {(["plant", "chambre", "mini-serre"] as const).map((t) => (
                          <button key={t} onClick={() => setCeType(t)}
                            className={`flex-1 py-1.5 px-2 text-[9px] font-black uppercase rounded-lg border-2 transition-all
                              ${ceType === t ? "bg-purple-500 text-white border-purple-700" : "bg-white text-stone-500 border-stone-200 hover:border-purple-300"}`}
                          >
                            {t === "plant" ? "🌱 Plante" : t === "chambre" ? "🏠 Chambre" : "🏡 Mini Serre"}
                          </button>
                        ))}
                      </div>

                      {/* Common fields */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] font-bold text-stone-500">ID (anglais, unique)</label>
                          <input value={ceId} onChange={(e) => setCeId(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                            placeholder="ex: courgette" className="w-full px-2 py-1 border-2 border-stone-200 rounded-lg text-[10px] font-bold focus:border-purple-400 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-stone-500">Nom</label>
                          <input value={ceName} onChange={(e) => setCeName(e.target.value)}
                            placeholder="ex: Courgette" className="w-full px-2 py-1 border-2 border-stone-200 rounded-lg text-[10px] font-bold focus:border-purple-400 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-stone-500">Emoji</label>
                          <input value={ceEmoji} onChange={(e) => setCeEmoji(e.target.value)}
                            className="w-full px-2 py-1 border-2 border-stone-200 rounded-lg text-[14px] text-center focus:border-purple-400 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-stone-500">Prix (🪙)</label>
                          <input type="number" value={cePrice} onChange={(e) => setCePrice(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border-2 border-stone-200 rounded-lg text-[10px] font-bold text-center focus:border-purple-400 focus:outline-none" />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-[8px] font-bold text-stone-500">Description</label>
                        <input value={ceDescription} onChange={(e) => setCeDescription(e.target.value)}
                          placeholder="Description courte..." className="w-full px-2 py-1 border-2 border-stone-200 rounded-lg text-[10px] font-bold focus:border-purple-400 focus:outline-none" />
                      </div>

                      {/* Plant-specific fields */}
                      {ceType === "plant" && (
                        <div className="space-y-2 p-2 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-[8px] font-black text-green-700 uppercase">🌱 Paramètres plante</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Espacement (cm)</label>
                              <div className="flex gap-1">
                                <input type="number" value={cePlantSpacingCm} onChange={(e) => setCePlantSpacingCm(parseInt(e.target.value) || 10)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                                <input type="number" value={ceRowSpacingCm} onChange={(e) => setCeRowSpacingCm(parseInt(e.target.value) || 10)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                              </div>
                              <p className="text-[6px] text-stone-400 text-center">plant × ligne</p>
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Temp. opt. (°C)</label>
                              <div className="flex gap-1">
                                <input type="number" value={ceOptimalTempMin} onChange={(e) => setCeOptimalTempMin(parseInt(e.target.value) || 0)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                                <input type="number" value={ceOptimalTempMax} onChange={(e) => setCeOptimalTempMax(parseInt(e.target.value) || 0)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                              </div>
                              <p className="text-[6px] text-stone-400 text-center">min – max</p>
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Récolte (jours)</label>
                              <input type="number" value={ceRealDaysToHarvest} onChange={(e) => setCeRealDaysToHarvest(parseInt(e.target.value) || 60)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Eau (mm/j)</label>
                              <input type="number" step="0.5" value={ceWaterNeed} onChange={(e) => setCeWaterNeed(parseFloat(e.target.value) || 1)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Lumière (h/j)</label>
                              <input type="number" value={ceLightNeed} onChange={(e) => setCeLightNeed(parseInt(e.target.value) || 4)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Résist. mal.</label>
                              <div className="flex gap-1">
                                <input type="number" value={ceDiseaseResist} onChange={(e) => setCeDiseaseResist(parseInt(e.target.value) || 0)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" placeholder="🦠" />
                                <input type="number" value={cePestResist} onChange={(e) => setCePestResist(parseInt(e.target.value) || 0)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" placeholder="🐛" />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Mois optimaux (0-11)</label>
                              <input value={ceOptimalMonths} onChange={(e) => setCeOptimalMonths(e.target.value)}
                                placeholder="2,3,4" className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold" />
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Durées stades (4 vals)</label>
                              <input value={ceStageDurations} onChange={(e) => setCeStageDurations(e.target.value)}
                                placeholder="10,25,22,52" className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Chambre-specific fields */}
                      {ceType === "chambre" && (
                        <div className="space-y-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <p className="text-[8px] font-black text-emerald-700 uppercase">🏠 Dimensions Chambre</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Largeur (cm)</label>
                              <input type="number" value={ceChambreWidth} onChange={(e) => setCeChambreWidth(parseInt(e.target.value) || 60)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Profondeur (cm)</label>
                              <input type="number" value={ceChambreDepth} onChange={(e) => setCeChambreDepth(parseInt(e.target.value) || 60)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Hauteur (cm)</label>
                              <input type="number" value={ceChambreHeight} onChange={(e) => setCeChambreHeight(parseInt(e.target.value) || 140)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                            </div>
                            <div>
                              <label className="text-[7px] font-bold text-stone-400">Max mini serres</label>
                              <input type="number" value={ceMaxMiniSerres} onChange={(e) => setCeMaxMiniSerres(parseInt(e.target.value) || 2)} className="w-full px-1.5 py-1 border-2 border-stone-200 rounded text-[9px] font-bold text-center" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generate button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateCardScript}
                        disabled={!ceId || !ceName}
                        className={`w-full py-2.5 text-[11px] font-black uppercase rounded-xl border-2 flex items-center justify-center gap-2 transition-all
                          ${ceId && ceName
                            ? "bg-gradient-to-b from-purple-500 to-violet-600 text-white border-purple-700 shadow-[2px_2px_0_0_#000] hover:from-purple-400 hover:to-violet-500"
                            : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                          }`}
                      >
                        <Code className="w-4 h-4" />
                        🪄 Générer le script
                      </motion.button>

                      {/* Generated script output */}
                      <AnimatePresence>
                        {generatedScript && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1">
                                <Code className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-[9px] font-black text-purple-700 uppercase">Script généré — copiez et envoyez-le moi !</span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={copyScript}
                                className={`px-2.5 py-1 text-[9px] font-black rounded-lg border-2 flex items-center gap-1 transition-all
                                  ${scriptCopied
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200"
                                  }`}
                              >
                                <Copy className="w-3 h-3" />
                                {scriptCopied ? "✅ Copié !" : "Copier"}
                              </motion.button>
                            </div>
                            <pre className="p-3 bg-stone-900 text-green-400 rounded-xl text-[8px] font-mono overflow-x-auto max-h-60 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                              {generatedScript}
                            </pre>
                            <p className="text-[8px] text-stone-500 mt-1.5">💡 Envoyez ce script dans le chat pour que je l&apos;applique au jeu. Les images seront générées automatiquement.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Existing plants reference */}
                      <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl">
                        <p className="text-[8px] font-black text-stone-500 uppercase mb-1.5">📋 Plantes existantes (référence)</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(PLANTS).map(([id, p]) => (
                            <button
                              key={id}
                              onClick={() => {
                                setCeId(id);
                                setCeName(p.name);
                                setCeEmoji(p.emoji);
                                setCePrice(SEED_CATALOG.find(s => s.plantDefId === id)?.price || 50);
                                const sp = PLANT_SPACING[id];
                                if (sp) {
                                  setCePlantSpacingCm(sp.plantSpacingCm);
                                  setCeRowSpacingCm(sp.rowSpacingCm);
                                }
                                setCeOptimalTempMin(p.optimalTemp[0]);
                                setCeOptimalTempMax(p.optimalTemp[1]);
                                setCeWaterNeed(p.waterNeed);
                                setCeLightNeed(p.lightNeed);
                                setCeRealDaysToHarvest(p.realDaysToHarvest);
                                setCeOptimalMonths(p.optimalPlantMonths.join(","));
                                setCeStageDurations(p.stageDurations.join(","));
                                setCeDiseaseResist(p.diseaseResistance);
                                setCePestResist(p.pestResistance);
                              }}
                              className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[8px] font-bold hover:border-purple-400 hover:bg-purple-50 transition-all"
                              title="Cliquer pour pré-remplir le formulaire"
                            >
                              {p.emoji} {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ═══ STATS ═══ */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-stone-600" />
                  <h3 className="text-xs font-black uppercase text-stone-700">Statistiques</h3>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <p className="text-[7px] text-stone-400 font-bold uppercase">Score</p>
                    <p className="text-sm font-black text-stone-800">{score}</p>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <p className="text-[7px] text-stone-400 font-bold uppercase">Meilleur</p>
                    <p className="text-sm font-black text-stone-800">{bestScore}</p>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <p className="text-[7px] text-stone-400 font-bold uppercase">Jour</p>
                    <p className="text-sm font-black text-stone-800">J{day}</p>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <p className="text-[7px] text-stone-400 font-bold uppercase">Graines</p>
                    <p className="text-sm font-black text-stone-800">{totalSeeds}</p>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <p className="text-[7px] text-stone-400 font-bold uppercase">Plantules</p>
                    <p className="text-sm font-black text-stone-800">{totalPlantules}</p>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <p className="text-[7px] text-stone-400 font-bold uppercase">Plants vivants</p>
                    <p className="text-sm font-black text-stone-800">{gardenPlants + pepiniere.length + miniSerrePlants}</p>
                  </div>
                </div>
                <div className="mt-1.5 grid grid-cols-4 gap-1.5 text-[8px]">
                  <div className="p-1.5 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-400 font-bold">Jardin</p>
                    <p className="font-black text-green-800">{gardenPlants}</p>
                  </div>
                  <div className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-center">
                    <p className="text-stone-400 font-bold">Pépinière</p>
                    <p className="font-black">{pepiniere.length}</p>
                  </div>
                  <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <p className="text-emerald-400 font-bold">Mini Serres</p>
                    <p className="font-black text-emerald-800">{miniSerrePlants}</p>
                  </div>
                  <div className="p-1.5 bg-cyan-50 border border-cyan-200 rounded-lg text-center">
                    <p className="text-cyan-400 font-bold">Tuiles</p>
                    <p className="font-black text-cyan-800">{serreTiles}</p>
                  </div>
                </div>
              </div>

              {/* ═══ DANGER ZONE ═══ */}
              <div className="pt-3 border-t-2 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-black uppercase text-red-600">Zone dangereuse</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (confirm("Admin : Remettre les scores à zéro ?")) {
                        useGameStore.setState({ score: 0, bestScore: 0 });
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("jardin-culture-best-score");
                        }
                      }
                    }}
                    className="py-2 px-3 bg-red-50 border-2 border-red-300 rounded-xl text-center hover:bg-red-100 transition-colors"
                  >
                    <p className="text-[10px] font-black text-red-700">🔄 Reset Scores</p>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={resetAll}
                    className="py-2 px-3 bg-red-50 border-2 border-red-400 rounded-xl text-center hover:bg-red-100 transition-colors"
                  >
                    <p className="text-[10px] font-black text-red-700">💣 Reset Complet</p>
                    <p className="text-[7px] text-red-400 font-bold">Tout supprimer</p>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render via portal to body — guaranteed highest z-index
  if (!mounted) return null;
  return createPortal(panel, document.body);
}

// ── UI Advanced Sliders Component ──

function UISlider({ label, value, onChange, min, max, step = 1, unit = "px" }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[8px] font-bold text-stone-500 w-20 shrink-0">{label}</label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
      />
      <span className="text-[9px] font-black text-stone-700 w-14 text-right">{value}{unit === "px" ? "px" : unit === "vh" ? "vh" : unit}</span>
    </div>
  );
}

function UIAdvancedSliders() {
  const settings = useUISettingsStore();

  return (
    <div className="space-y-2">
      {UI_SLIDER_GROUPS.map((group) => (
        <div key={group.label} className="bg-stone-50 rounded-xl p-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black text-stone-600">{group.icon} {group.label}</span>
            <button
              onClick={() => useUISettingsStore.getState().resetGroup(group.keys.map((k) => k.key))}
              className="flex items-center gap-1 text-[7px] font-bold text-stone-400 hover:text-indigo-600 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Réinitialiser
            </button>
          </div>
          <div className="space-y-1">
            {group.keys.map((k) => (
              <UISlider
                key={k.key}
                label={k.label}
                value={settings[k.key] as number}
                onChange={(v) => useUISettingsStore.getState().setSetting(k.key, v)}
                min={k.min}
                max={k.max}
                step={k.step}
                unit={k.unit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
