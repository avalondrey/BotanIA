"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, getPepiniereStage, PEPINIERE_STAGE_NAMES, getStageImage, type MiniSerre } from "@/store/game-store";
import { PLANTS } from "@/lib/ai-engine";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Thermometer, Sun, Droplets, Snowflake, Flower2, Leaf, Shrub,
  Plus, Trash2, X, ArrowRight, Home, ChevronDown, ChevronRight,
  Move, GripVertical, Eye, AlertTriangle, CloudSun,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type ZoneId = "hiver" | "arbustes" | "fragiles" | "mini-serres";

interface SerrePlant {
  id: string;
  plantDefId: string;
  name: string;
  icon: LucideIcon;
}

interface ShelfLevel {
  id: string;
  label: string;
  sublabel: string;
  slots: (SerrePlant | null)[];
}

// ═══════════════════════════════════════════════════════════════
// Default Plants per Zone (no emojis -- Lucide icons instead)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_HIVER_PLANTS: SerrePlant[] = [
  { id: "h-1", plantDefId: "chou", name: "Choux", icon: Leaf },
  { id: "h-2", plantDefId: "poireau", name: "Poireaux", icon: Leaf },
  { id: "h-3", plantDefId: "epinard", name: "Epinards", icon: Leaf },
  { id: "h-4", plantDefId: "framboisier", name: "Framboisier", icon: Shrub },
  { id: "h-5", plantDefId: "chou-fleur", name: "Chou-fleur", icon: Flower2 },
  { id: "h-6", plantDefId: "mache", name: "Mache", icon: Leaf },
];

const DEFAULT_ARBUSTES_PLANTS: SerrePlant[] = [
  { id: "a-1", plantDefId: "lavande", name: "Lavande", icon: Flower2 },
  { id: "a-2", plantDefId: "thym", name: "Thym", icon: Leaf },
  { id: "a-3", plantDefId: "romarin", name: "Romarin", icon: Shrub },
  { id: "a-4", plantDefId: "buis", name: "Buis", icon: Shrub },
  { id: "a-5", plantDefId: "myrte", name: "Myrte", icon: Shrub },
];

const DEFAULT_FRAGILES_PLANTS: SerrePlant[] = [
  { id: "f-1", plantDefId: "geranium", name: "Geranium", icon: Flower2 },
  { id: "f-2", plantDefId: "fuchsia", name: "Fuchsia", icon: Flower2 },
  { id: "f-3", plantDefId: "agrumes", name: "Agrumes en pot", icon: Leaf },
  { id: "f-4", plantDefId: "bougainville", name: "Bougainville", icon: Flower2 },
];

// ═══════════════════════════════════════════════════════════════
// Zone Definitions
// ═══════════════════════════════════════════════════════════════

interface ZoneDef {
  id: ZoneId;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  headerGradient: string;
  icon: LucideIcon;
  slotCount: number;
}

const ZONES: ZoneDef[] = [
  {
    id: "hiver",
    name: "Plantes d'hiver",
    description: "Plantes resistantes au froid : choux, poireaux, epinards",
    color: "text-blue-700",
    borderColor: "border-blue-400",
    bgColor: "bg-blue-50/40",
    headerGradient: "from-blue-50 to-cyan-50",
    icon: Snowflake,
    slotCount: 6,
  },
  {
    id: "arbustes",
    name: "Arbustes",
    description: "Petits arbustes aromatiques et ornementaux",
    color: "text-green-700",
    borderColor: "border-green-400",
    bgColor: "bg-green-50/40",
    headerGradient: "from-green-50 to-emerald-50",
    icon: Shrub,
    slotCount: 6,
  },
  {
    id: "fragiles",
    name: "Plantes fragiles",
    description: "Plantes sensibles au gel : geraniums, fuchsias, agrumes",
    color: "text-pink-700",
    borderColor: "border-pink-400",
    bgColor: "bg-pink-50/40",
    headerGradient: "from-pink-50 to-rose-50",
    icon: Flower2,
    slotCount: 6,
  },
  {
    id: "mini-serres",
    name: "Mini Serres",
    description: "Mini serres de la Chambre de Culture, deplacables ici",
    color: "text-amber-700",
    borderColor: "border-amber-400",
    bgColor: "bg-amber-50/40",
    headerGradient: "from-amber-50 to-orange-50",
    icon: Home,
    slotCount: 0,
  },
];

const SHELF_LABELS = [
  { id: "haute", label: "Etagere haute", sublabel: "Lumiere maximale" },
  { id: "moyenne", label: "Etagere moyenne", sublabel: "Zone equilibree" },
  { id: "basse", label: "Etagere basse", sublabel: "Ombre partielle" },
];

// ═══════════════════════════════════════════════════════════════
// Plant icon helper
// ═══════════════════════════════════════════════════════════════

function getPlantIcon(plantDefId: string): LucideIcon {
  const def = PLANTS[plantDefId];
  if (def) {
    if (["tomato", "strawberry", "pepper", "carrot"].includes(plantDefId)) return Flower2;
    return Leaf;
  }
  return Leaf;
}

function getPlantName(plantDefId: string): string {
  const def = PLANTS[plantDefId];
  if (def) return def.name;
  return plantDefId.charAt(0).toUpperCase() + plantDefId.slice(1);
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function SerreJardinView() {
  const realWeather = useGameStore((s) => s.realWeather);
  const day = useGameStore((s) => s.day);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const miniSerres = useGameStore((s) => s.miniSerres);
  const toggleSerreView = useGameStore((s) => s.toggleSerreView);
  const setPendingTransplant = useGameStore((s) => s.setPendingTransplant);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const buySerreZone = useGameStore((s) => s.buySerreZone);

  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ zone: ZoneId; shelfIdx: number; slotIdx: number } | null>(null);
  const [selectedMiniSerreSlot, setSelectedMiniSerreSlot] = useState<{ serreId: string; row: number; col: number } | null>(null);
  const [detailPlant, setDetailPlant] = useState<{ name: string; plantDefId: string; days: number; stage: number; serreId?: string; row?: number; col?: number } | null>(null);

  // Derived state
  const outsideTemp = realWeather?.current?.temperature ?? 12;
  const serreTemp = outsideTemp + 4;
  const serreHumidity = realWeather?.current?.humidity ? Math.round(realWeather.current.humidity * 0.85) : 65;
  const pastSaintsDeGlace = day >= 133;
  const isWinter = day < 60 || day > 335;
  const isSpring = day >= 60 && day < 152;

  // Mini serre stats
  const miniSerreStats = useMemo(() => {
    let total = 0;
    let ready = 0;
    miniSerres.forEach((serre) => {
      serre.slots.forEach((row) => {
        row.forEach((plant) => {
          if (plant) {
            total++;
            if (getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) >= 5) ready++;
          }
        });
      });
    });
    return { total, ready, count: miniSerres.length };
  }, [miniSerres]);

  // Build shelf data for a zone
  const buildShelves = useCallback((zoneId: "hiver" | "arbustes" | "fragiles"): ShelfLevel[] => {
    const plants =
      zoneId === "hiver" ? DEFAULT_HIVER_PLANTS :
      zoneId === "arbustes" ? DEFAULT_ARBUSTES_PLANTS :
      DEFAULT_FRAGILES_PLANTS;

    return SHELF_LABELS.map((shelf, shelfIdx) => {
      const start = shelfIdx * 2;
      const end = Math.min(start + 2, plants.length);
      const shelfPlants = plants.slice(start, end);
      const slots: (SerrePlant | null)[] = [];
      for (let i = 0; i < 2; i++) {
        slots.push(shelfPlants[i] ?? null);
      }
      return { ...shelf, slots };
    });
  }, []);

  // ═══════════════════════════════════════════════════════════
  // No serre zones yet -- empty state
  // ═══════════════════════════════════════════════════════════
  if (gardenSerreZones.length === 0) {
    return (
      <div className="space-y-4">
        <div className="p-8 border-[3px] border-dashed border-cyan-300 rounded-2xl text-center bg-gradient-to-b from-cyan-50 to-white">
          <div className="w-16 h-16 mx-auto mb-3 rounded-xl border-2 border-cyan-200 flex items-center justify-center bg-cyan-50">
            <Home className="w-8 h-8 text-cyan-600" />
          </div>
          <p className="text-sm font-black text-cyan-700 uppercase">Aucune serre au jardin</p>
          <p className="text-[10px] text-cyan-500 mt-1 mb-4">
            Creez une serre directement ici (6m x 4m, 200 pieces) ou dessinez-en une au Jardin avec l&apos;outil Serre.
          </p>
          <div className="flex items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const success = buySerreZone();
                if (!success) {
                  alert("Pas assez de pieces ! Il faut 200 pieces pour acheter une serre.");
                }
              }}
              className="px-4 py-2 bg-cyan-500 text-white text-[10px] font-black uppercase rounded-xl border-2 border-cyan-700 shadow-[2px_2px_0_0_#000] hover:bg-cyan-400 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Acheter une serre (200 pcs)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveTab("jardin"); }}
              className="px-4 py-2 bg-white text-cyan-700 text-[10px] font-black uppercase rounded-xl border-2 border-cyan-300 shadow-[2px_2px_0_0_#000] hover:bg-cyan-50"
            >
              Dessiner au Jardin
            </motion.button>
          </div>
        </div>
        <div className="p-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl text-[9px] text-cyan-700">
          <p className="font-black mb-1">Comment creer une serre :</p>
          <ol className="list-decimal list-inside space-y-0.5 text-cyan-600">
            <li>Allez dans l&apos;onglet <strong>Jardin</strong></li>
            <li>Cliquez sur le bouton <strong>"+ Serre"</strong> dans la barre d&apos;outils</li>
            <li>Cliquez un <strong>premier coin</strong> sur le jardin</li>
            <li>Cliquez le <strong>coin oppose</strong> pour dessiner le rectangle</li>
            <li>Revenez ici pour gerer l&apos;interieur de la serre</li>
          </ol>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Handle plant slot clicks for non-mini-serre zones
  // ═══════════════════════════════════════════════════════════
  const handleSlotClick = (
    zoneId: "hiver" | "arbustes" | "fragiles",
    shelfIdx: number,
    slotIdx: number,
    plant: SerrePlant | null,
  ) => {
    const target = { zone: zoneId, shelfIdx, slotIdx };

    if (!selectedSlot) {
      // No selection: select if plant present
      if (plant) {
        setSelectedSlot(target);
      }
    } else if (selectedSlot.zone === zoneId && selectedSlot.shelfIdx === shelfIdx && selectedSlot.slotIdx === slotIdx) {
      // Click same slot: deselect
      setSelectedSlot(null);
    } else if (plant) {
      // Click another plant: swap selection
      setSelectedSlot(target);
    } else {
      // Click empty slot: move plant there (visual only for default zones)
      setSelectedSlot(null);
    }
  };

  const handleMiniSerreSlotClick = (serreId: string, row: number, col: number, plant: import("@/lib/ai-engine").PlantState | null) => {
    const target = { serreId, row, col };

    if (!selectedMiniSerreSlot) {
      if (plant) {
        setSelectedMiniSerreSlot(target);
      }
    } else if (selectedMiniSerreSlot.serreId === serreId && selectedMiniSerreSlot.row === row && selectedMiniSerreSlot.col === col) {
      setSelectedMiniSerreSlot(null);
    } else if (plant) {
      setSelectedMiniSerreSlot(target);
    } else {
      // Move plant to empty slot via store
      const from = selectedMiniSerreSlot;
      const state = useGameStore.getState();
      const fromSerre = state.miniSerres.find(s => s.id === from.serreId);
      if (fromSerre) {
        const fromPlant = fromSerre.slots[from.row]?.[from.col];
        if (fromPlant) {
          // Use store actions to move
          state.removeMiniSerrePlant(from.serreId, from.row, from.col);
          state.placePlantuleInMiniSerre(serreId, row, col, fromPlant.plantDefId);
        }
      }
      setSelectedMiniSerreSlot(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* ═══ HEADER ═══ */}
      <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 border-[3px] border-black rounded-2xl shadow-[6px_6px_0_0_#000] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.8px, transparent 0.8px)", backgroundSize: "4px 4px" }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0_0_#000] flex items-center justify-center">
              <Home className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight" style={{ textShadow: "2px 2px 0 #000" }}>
                Serre du Jardin
              </h2>
              <p className="text-[9px] text-cyan-600 font-bold">
                {gardenSerreZones.length} zone(s) de serre
              </p>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-black/10 rounded-lg shadow-sm">
              <CloudSun className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[9px] font-bold text-blue-600">{Math.round(outsideTemp)}°C</span>
              <ArrowRight className="w-3 h-3 text-stone-300" />
              <Thermometer className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[9px] font-bold text-red-600">{Math.round(serreTemp)}°C</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-black/10 rounded-lg shadow-sm">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[9px] font-bold text-sky-600">{serreHumidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 border border-black/10 rounded-lg shadow-sm">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[9px] font-bold text-amber-600">Lum. +15%</span>
            </div>

            {/* Close (only if opened from jardin view) */}
            {useGameStore.getState().showSerreView && (
              <button
                onClick={toggleSerreView}
                className="px-2 py-1.5 bg-stone-200 text-stone-600 text-[9px] font-bold rounded-lg hover:bg-stone-300 border border-stone-300"
              >
                <X className="w-3 h-3 inline" /> Fermer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SEASONAL GUIDANCE ═══ */}
      <AnimatePresence>
        {pastSaintsDeGlace && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-green-50 border-2 border-green-300 rounded-xl text-[9px] text-green-800 flex items-center gap-2"
          >
            <Sun className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-black">Les saints de glace sont passes !</p>
              <p className="text-green-600">Vous pouvez deplacer les plantes fragiles a l&apos;exterieur.</p>
            </div>
          </motion.div>
        )}
        {!pastSaintsDeGlace && isSpring && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-[9px] text-amber-800 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-black">Attention : saints de glace (11-13 mai)</p>
              <p className="text-amber-600">Attendez la mi-mai avant de sortir les plantes fragiles.</p>
            </div>
          </motion.div>
        )}
        {isWinter && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-blue-50 border-2 border-blue-300 rounded-xl text-[9px] text-blue-800 flex items-center gap-2"
          >
            <Snowflake className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-black">Periode hivernale</p>
              <p className="text-blue-600">La serre protege vos plantes du gel. Temperature interieure +4°C.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ZONE OVERVIEW (no zone selected) ═══ */}
      {!activeZone && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ZONES.map((zone) => {
            const Icon = zone.icon;
            const plantCount =
              zone.id === "hiver" ? DEFAULT_HIVER_PLANTS.length :
              zone.id === "arbustes" ? DEFAULT_ARBUSTES_PLANTS.length :
              zone.id === "fragiles" ? DEFAULT_FRAGILES_PLANTS.length :
              miniSerreStats.total;

            return (
              <motion.button
                key={zone.id}
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => { setActiveZone(zone.id); setSelectedSlot(null); setSelectedMiniSerreSlot(null); }}
                className="relative text-left p-4 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all group overflow-hidden"
              >
                {/* Background pattern */}
                <div
                  className={`absolute inset-0 pointer-events-none opacity-[0.03]`}
                  style={{ backgroundImage: "radial-gradient(circle, #000 0.6px, transparent 0.6px)", backgroundSize: "5px 5px" }}
                />

                {/* Colored accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${zone.headerGradient}`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl border-2 ${zone.borderColor} ${zone.bgColor} flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-5 h-5 ${zone.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[8px] font-bold border-black/10">
                        {zone.id === "mini-serres" ? `${miniSerreStats.count} serre(s)` : `${plantCount} plantes`}
                      </Badge>
                      {zone.id === "mini-serres" && miniSerreStats.ready > 0 && (
                        <Badge className="text-[8px] font-bold bg-green-100 text-green-700 border-green-300">
                          {miniSerreStats.ready} pret(s)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-black uppercase">{zone.name}</h3>
                  <p className="text-[9px] text-stone-400 mt-0.5 leading-relaxed">{zone.description}</p>

                  {/* Mini preview for mini-serres */}
                  {zone.id === "mini-serres" && miniSerres.length > 0 && (
                    <div className="mt-3 flex gap-1.5">
                      {miniSerres.slice(0, 4).map((serre) => {
                        const filled = serre.slots.flat().filter(p => p).length;
                        return (
                          <div key={serre.id} className="flex-1 p-1.5 border border-stone-200 rounded-lg bg-stone-50">
                            <div className="grid grid-cols-3 gap-[1px]">
                              {serre.slots.flat().slice(0, 9).map((plant, i) => (
                                <div
                                  key={i}
                                  className={`aspect-square rounded-[2px] ${
                                    plant
                                      ? getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) >= 5
                                        ? "bg-green-200"
                                        : "bg-green-100"
                                      : "bg-stone-100"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-[7px] text-stone-400 mt-1 text-center font-bold">{filled}/24</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Mini preview for plant zones */}
                  {zone.id !== "mini-serres" && (
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: Math.min(plantCount, 6) }).map((_, i) => {
                        const PIcon = zone.id === "arbustes" ? Shrub : zone.id === "fragiles" ? Flower2 : Leaf;
                        return (
                          <div key={i} className={`w-7 h-7 rounded-lg border ${zone.borderColor} ${zone.bgColor} flex items-center justify-center`}>
                            <PIcon className={`w-3 h-3 ${zone.color}`} />
                          </div>
                        );
                      })}
                      {plantCount > 6 && (
                        <div className="w-7 h-7 rounded-lg border border-dashed border-stone-300 flex items-center justify-center bg-stone-50">
                          <span className="text-[7px] font-bold text-stone-400">+{plantCount - 6}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enter arrow */}
                  <div className="mt-3 flex items-center gap-1 text-[9px] font-bold text-stone-400 group-hover:text-black transition-colors">
                    <span>Entrer</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ═══ ZONE DETAIL VIEW ═══ */}
      {activeZone && (
        <div className="space-y-3">
          {/* Back button + zone header */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveZone(null); setSelectedSlot(null); setSelectedMiniSerreSlot(null); }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-stone-600 text-[10px] font-bold rounded-lg border-2 border-stone-300 shadow-[2px_2px_0_0_#000] hover:bg-stone-50"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              Retour
            </motion.button>

            <div className="flex-1" />

            {selectedSlot && (
              <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 border-2 border-amber-300 rounded-lg">
                <Move className="w-3 h-3 text-amber-600" />
                <span className="text-[8px] font-bold text-amber-700">Selection active -- cliquez une cible</span>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="ml-1 p-0.5 hover:bg-amber-100 rounded"
                >
                  <X className="w-3 h-3 text-amber-500" />
                </button>
              </div>
            )}

            {selectedMiniSerreSlot && (
              <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 border-2 border-amber-300 rounded-lg">
                <Move className="w-3 h-3 text-amber-600" />
                <span className="text-[8px] font-bold text-amber-700">Selection active -- cliquez une cible</span>
                <button
                  onClick={() => setSelectedMiniSerreSlot(null)}
                  className="ml-1 p-0.5 hover:bg-amber-100 rounded"
                >
                  <X className="w-3 h-3 text-amber-500" />
                </button>
              </div>
            )}
          </div>

          {/* Zone title card */}
          {(() => {
            const zoneDef = ZONES.find(z => z.id === activeZone)!;
            const Icon = zoneDef.icon;
            return (
              <div className={`p-4 bg-gradient-to-r ${zoneDef.headerGradient} border-[3px] border-black rounded-2xl shadow-[4px_4px_0_0_#000]`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border-2 ${zoneDef.borderColor} bg-white/60 flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-6 h-6 ${zoneDef.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase">{zoneDef.name}</h3>
                    <p className="text-[9px] text-stone-500">{zoneDef.description}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Zone-specific content */}
          {activeZone === "mini-serres" ? (
            <MiniSerresDetail
              selectedSlot={selectedMiniSerreSlot}
              onSelectSlot={setSelectedMiniSerreSlot}
              onSlotClick={handleMiniSerreSlotClick}
              onViewDetail={setDetailPlant}
            />
          ) : (
            <PlantZoneShelves
              zoneId={activeZone as "hiver" | "arbustes" | "fragiles"}
              buildShelves={buildShelves}
              selectedSlot={selectedSlot}
              onSlotClick={handleSlotClick}
            />
          )}
        </div>
      )}

      {/* ═══ PLANT DETAIL DIALOG ═══ */}
      <Dialog open={!!detailPlant} onOpenChange={(open) => { if (!open) setDetailPlant(null); }}>
        <DialogContent className="sm:max-w-md border-[3px] border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-0 overflow-hidden">
          {detailPlant && (
            <>
              {/* Header with stage image */}
              <div className="relative bg-gradient-to-br from-stone-50 to-stone-100 p-4 border-b-2 border-black/5">
                <DialogHeader>
                  <DialogTitle className="text-base font-black uppercase flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center">
                      {(() => {
                        const stageIdx = detailPlant.stage;
                        if (stageIdx >= 0 && stageIdx <= 5) {
                          return (
                            <img
                              src={getStageImage(detailPlant.plantDefId, stageIdx)}
                              alt={PEPINIERE_STAGE_NAMES[stageIdx]}
                              className="w-6 h-6 object-contain"
                            />
                          );
                        }
                        const PlantIcon = getPlantIcon(detailPlant.plantDefId);
                        return <PlantIcon className="w-4 h-4 text-green-600" />;
                      })()}
                    </div>
                    {detailPlant.name}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] text-stone-400">
                    {PLANTS[detailPlant.plantDefId]
                      ? `${getPlantName(detailPlant.plantDefId)} -- Jour ${detailPlant.days}`
                      : `Jour ${detailPlant.days}`}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Stage info */}
              <div className="p-4 space-y-3">
                {/* Stage progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-stone-500 uppercase">Stade de croissance</span>
                    <span className="text-[9px] font-black text-green-700">
                      {PEPINIERE_STAGE_NAMES[detailPlant.stage] || "Inconnu"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {PEPINIERE_STAGE_NAMES.map((name, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          idx <= detailPlant.stage
                            ? "bg-green-400 border border-green-500"
                            : "bg-stone-100 border border-stone-200"
                        }`}
                        title={name}
                      />
                    ))}
                  </div>
                </div>

                {/* Stage image */}
                {detailPlant.stage >= 0 && detailPlant.stage <= 5 && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
                    <img
                      src={getStageImage(detailPlant.plantDefId, detailPlant.stage)}
                      alt={PEPINIERE_STAGE_NAMES[detailPlant.stage]}
                      className="w-20 h-20 object-contain mx-auto"
                    />
                    <p className="text-[9px] font-bold text-stone-500 mt-2">{PEPINIERE_STAGE_NAMES[detailPlant.stage]}</p>
                  </div>
                )}

                {/* Plant info */}
                {PLANTS[detailPlant.plantDefId] && (() => {
                  const def = PLANTS[detailPlant.plantDefId];
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-[7px] font-bold text-blue-400 uppercase">Temperature</p>
                        <p className="text-[10px] font-black text-blue-700">{def.optimalTemp[0]}-{def.optimalTemp[1]}°C</p>
                      </div>
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-[7px] font-bold text-amber-400 uppercase">Recolte</p>
                        <p className="text-[10px] font-black text-amber-700">{def.realDaysToHarvest} jours</p>
                      </div>
                      <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg">
                        <p className="text-[7px] font-bold text-sky-400 uppercase">Arrosage</p>
                        <p className="text-[10px] font-black text-sky-700">{def.waterNeed} mm/j</p>
                      </div>
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-[7px] font-bold text-yellow-500 uppercase">Lumiere</p>
                        <p className="text-[10px] font-black text-yellow-700">{def.lightNeed}h/j</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer actions */}
              <DialogFooter className="p-3 bg-stone-50 border-t border-stone-200 gap-2">
                {detailPlant.stage >= 4 && detailPlant.serreId && detailPlant.row !== undefined && detailPlant.col !== undefined && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const plantDef = PLANTS[detailPlant.plantDefId];
                      if (plantDef) {
                        setPendingTransplant({
                          serreId: detailPlant.serreId!,
                          row: detailPlant.row!,
                          col: detailPlant.col!,
                          plantDefId: detailPlant.plantDefId,
                          plantName: plantDef.name,
                          plantEmoji: plantDef.emoji,
                        });
                        setActiveTab("jardin");
                        setDetailPlant(null);
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-green-500 text-white text-[10px] font-black uppercase rounded-xl border-2 border-green-700 shadow-[2px_2px_0_0_#000] hover:bg-green-400 flex items-center justify-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Transplanter au jardin
                  </motion.button>
                )}
                <button
                  onClick={() => setDetailPlant(null)}
                  className="flex-1 px-3 py-2 bg-white text-stone-600 text-[10px] font-bold uppercase rounded-xl border-2 border-stone-300 shadow-[2px_2px_0_0_#000] hover:bg-stone-50"
                >
                  Fermer
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Plant Zone Shelves (hiver, arbustes, fragiles)
// ═══════════════════════════════════════════════════════════════

function PlantZoneShelves({
  zoneId,
  buildShelves,
  selectedSlot,
  onSlotClick,
}: {
  zoneId: "hiver" | "arbustes" | "fragiles";
  buildShelves: (id: "hiver" | "arbustes" | "fragiles") => ShelfLevel[];
  selectedSlot: { zone: ZoneId; shelfIdx: number; slotIdx: number } | null;
  onSlotClick: (zoneId: "hiver" | "arbustes" | "fragiles", shelfIdx: number, slotIdx: number, plant: SerrePlant | null) => void;
}) {
  const zoneDef = ZONES.find(z => z.id === zoneId)!;
  const shelves = useMemo(() => buildShelves(zoneId), [zoneId, buildShelves]);

  return (
    <div className="space-y-3">
      {shelves.map((shelf, shelfIdx) => {
        const isTarget = selectedSlot !== null && selectedSlot.zone !== zoneId;
        return (
          <motion.div
            key={shelf.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shelfIdx * 0.1 }}
            className="border-[3px] border-black rounded-2xl shadow-[4px_4px_0_0_#000] overflow-hidden"
          >
            {/* Shelf header */}
            <div className={`px-4 py-2.5 bg-gradient-to-r ${zoneDef.headerGradient} border-b-2 border-black/10 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-6 rounded-full ${zoneDef.borderColor} border-2 ${zoneDef.borderColor} bg-white`} />
                <div>
                  <p className="text-[10px] font-black uppercase">{shelf.label}</p>
                  <p className="text-[7px] text-stone-400">{shelf.sublabel}</p>
                </div>
              </div>
              <span className="text-[8px] font-bold text-stone-400">
                {shelf.slots.filter(s => s).length}/{shelf.slots.length} emplacements
              </span>
            </div>

            {/* Shelf slots */}
            <div className="p-3 bg-white">
              <div className="flex gap-2 flex-wrap">
                {shelf.slots.map((plant, slotIdx) => {
                  const isSelected = selectedSlot?.zone === zoneId && selectedSlot?.shelfIdx === shelfIdx && selectedSlot?.slotIdx === slotIdx;

                  if (!plant) {
                    return (
                      <motion.div
                        key={slotIdx}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSlotClick(zoneId, shelfIdx, slotIdx, null)}
                        className={`w-[100px] h-[80px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isTarget
                            ? "border-green-400 bg-green-50 hover:bg-green-100"
                            : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
                        }`}
                      >
                        {isTarget ? (
                          <>
                            <Move className="w-4 h-4 text-green-500 mb-0.5" />
                            <span className="text-[7px] font-bold text-green-600">Placer ici</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-stone-300 mb-0.5" />
                            <span className="text-[7px] font-bold text-stone-300">Vide</span>
                          </>
                        )}
                      </motion.div>
                    );
                  }

                  const PlantIcon = plant.icon;
                  return (
                    <motion.div
                      key={plant.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSlotClick(zoneId, shelfIdx, slotIdx, plant)}
                      className={`w-[100px] h-[80px] border-[3px] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isSelected
                          ? "border-black bg-white shadow-[3px_3px_0_0_#000]"
                          : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-[2px_2px_0_0_#ccc]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${zoneDef.bgColor} ${zoneDef.borderColor} border flex items-center justify-center mb-1`}>
                        <PlantIcon className={`w-4 h-4 ${zoneDef.color}`} />
                      </div>
                      <p className="text-[9px] font-black leading-tight text-center">{plant.name}</p>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <GripVertical className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Add plant placeholder */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-[100px] h-[80px] border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/50"
                >
                  <Plus className="w-5 h-5 text-stone-300 mb-0.5" />
                  <span className="text-[7px] font-bold text-stone-300">Ajouter</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Mini Serres Detail View
// ═══════════════════════════════════════════════════════════════

function MiniSerresDetail({
  selectedSlot,
  onSelectSlot,
  onSlotClick,
  onViewDetail,
}: {
  selectedSlot: { serreId: string; row: number; col: number } | null;
  onSelectSlot: (slot: { serreId: string; row: number; col: number } | null) => void;
  onSlotClick: (serreId: string, row: number, col: number, plant: import("@/lib/ai-engine").PlantState | null) => void;
  onViewDetail: (plant: { name: string; plantDefId: string; days: number; stage: number; serreId?: string; row?: number; col?: number } | null) => void;
}) {
  const miniSerres = useGameStore((s) => s.miniSerres);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const waterAllMiniSerre = useGameStore((s) => s.waterAllMiniSerre);
  const removeMiniSerre = useGameStore((s) => s.removeMiniSerre);

  if (miniSerres.length === 0) {
    return (
      <div className="p-8 border-[3px] border-dashed border-stone-300 rounded-2xl text-center bg-white">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl border-2 border-stone-200 bg-stone-50 flex items-center justify-center">
          <Home className="w-7 h-7 text-stone-300" />
        </div>
        <p className="text-sm font-black text-stone-400 uppercase">Aucune mini serre</p>
        <p className="text-[9px] text-stone-300 mt-1 mb-4">
          Achetez des mini serres dans la Chambre de Culture, puis deplacez-les ici quand le temps s&apos;ameliorera.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("pepiniere")}
          className="px-4 py-2 bg-stone-600 text-white text-[10px] font-black uppercase rounded-xl border-2 border-stone-800 shadow-[2px_2px_0_0_#000] hover:bg-stone-500 flex items-center gap-1.5 mx-auto"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          Chambre de Culture
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mini serre cards */}
      {miniSerres.map((serre, serreIdx) => {
        const allPlants = serre.slots.flat().filter((p) => p !== null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const readyPlants = (allPlants as any[]).filter((p: any) => getPepiniereStage(p.daysSincePlanting, p.plantDefId) >= 5);

        return (
          <div
            key={serre.id}
            className="border-[3px] border-black rounded-2xl shadow-[4px_4px_0_0_#000] overflow-hidden"
          >
            {/* Mini serre header */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl border-2 border-amber-300 bg-white flex items-center justify-center shadow-sm">
                  <Home className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase">Mini Serre #{serreIdx + 1}</p>
                  <p className="text-[8px] text-stone-400">
                    {allPlants.length}/24 plantes -- {readyPlants.length} prete(s) a transplanter
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => waterAllMiniSerre(serre.id)}
                  className="p-1.5 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
                  title="Arroser tout"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (confirm("Supprimer cette mini serre et toutes ses plantes ?")) {
                      removeMiniSerre(serre.id);
                    }
                  }}
                  className="p-1.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </motion.button>
              </div>
            </div>

            {/* Grid of slots - organized by shelf-like rows */}
            <div className="p-3 bg-gradient-to-b from-white to-stone-50/50 space-y-2">
              {/* Row groups: 2 rows per "shelf" */}
              {[0, 2, 4].map((startRow, shelfGroup) => {
                const shelfLabel =
                  shelfGroup === 0 ? "Niveau superieur" :
                  shelfGroup === 1 ? "Niveau moyen" : "Niveau inferieur";

                return (
                  <div key={shelfGroup}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-4 rounded-full bg-amber-300 border border-amber-400" />
                      <span className="text-[8px] font-bold text-stone-400 uppercase">{shelfLabel}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {serre.slots.slice(startRow, startRow + 2).map((row, rowRelIdx) =>
                        row.map((plant, col) => {
                          const rowIdx = startRow + rowRelIdx;
                          const isSelected = selectedSlot?.serreId === serre.id && selectedSlot?.row === rowIdx && selectedSlot?.col === col;
                          const isReady = plant ? getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) >= 5 : false;
                          const stage = plant ? getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) : -1;

                          if (!plant) {
                            return (
                              <motion.div
                                key={`${rowIdx}-${col}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSlotClick(serre.id, rowIdx, col, null)}
                                className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                                  selectedSlot
                                    ? "border-green-400 bg-green-50 hover:bg-green-100"
                                    : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
                                }`}
                              >
                                {selectedSlot ? (
                                  <Move className="w-3 h-3 text-green-400" />
                                ) : (
                                  <Plus className="w-3 h-3 text-stone-200" />
                                )}
                              </motion.div>
                            );
                          }

                          const PlantIcon = getPlantIcon(plant.plantDefId);
                          const plantName = getPlantName(plant.plantDefId);

                          return (
                            <motion.div
                              key={`${rowIdx}-${col}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onSlotClick(serre.id, rowIdx, col, plant)}
                              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
                                isSelected
                                  ? "border-black bg-white shadow-[2px_2px_0_0_#000] z-10"
                                  : isReady
                                    ? "border-green-300 bg-green-50 hover:border-green-400 hover:shadow-[1px_1px_0_0_#000]"
                                    : "border-stone-200 bg-white hover:border-stone-300"
                              }`}
                            >
                              {/* Stage indicator dot */}
                              <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
                                stage >= 4 ? "bg-green-400" :
                                stage >= 2 ? "bg-amber-300" :
                                stage >= 1 ? "bg-yellow-300" : "bg-stone-300"
                              }`} />

                              <PlantIcon className={`w-4 h-4 ${isReady ? "text-green-600" : "text-stone-500"}`} />
                              <span className="text-[6px] font-bold text-stone-500 mt-0.5 leading-none truncate max-w-full px-0.5">
                                {plantName}
                              </span>

                              {/* Selection grip */}
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                                  <GripVertical className="w-2 h-2 text-white" />
                                </div>
                              )}

                              {/* Ready indicator */}
                              {isReady && !isSelected && (
                                <div className="absolute bottom-0.5 left-0.5">
                                  <Flower2 className="w-2.5 h-2.5 text-green-500" />
                                </div>
                              )}
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer: ready plants + actions */}
            {readyPlants.length > 0 && (
              <div className="px-4 py-2.5 bg-green-50 border-t-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[9px] font-black text-green-700">
                      {readyPlants.length} plante(s) prete(s) a transplanter
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {readyPlants.slice(0, 3).map((p, i) => {
                      const PIcon = getPlantIcon(p.plantDefId);
                      return (
                        <div key={i} className="w-5 h-5 rounded bg-green-100 border border-green-300 flex items-center justify-center">
                          <PIcon className="w-3 h-3 text-green-600" />
                        </div>
                      );
                    })}
                    {readyPlants.length > 3 && (
                      <span className="text-[7px] font-bold text-green-600">+{readyPlants.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View detail buttons for ready plants */}
            {readyPlants.length > 0 && (
              <div className="px-4 py-2.5 bg-white border-t border-stone-100 flex gap-2 flex-wrap">
                {(() => {
                  const readySlots: { row: number; col: number; plant: NonNullable<typeof readyPlants[0]> }[] = [];
                  serre.slots.forEach((row, ri) => {
                    row.forEach((plant, ci) => {
                      if (plant && getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) >= 5) {
                        readySlots.push({ row: ri, col: ci, plant });
                      }
                    });
                  });
                  return readySlots.map(({ row, col, plant }) => (
                    <motion.button
                      key={`${row}-${col}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onViewDetail({
                        name: getPlantName(plant.plantDefId),
                        plantDefId: plant.plantDefId,
                        days: plant.daysSincePlanting,
                        stage: getPepiniereStage(plant.daysSincePlanting, plant.plantDefId),
                        serreId: serre.id,
                        row,
                        col,
                      })}
                      className="px-2.5 py-1 bg-green-100 text-green-700 text-[8px] font-bold rounded-lg border border-green-300 hover:bg-green-200 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      {getPlantName(plant.plantDefId)}
                    </motion.button>
                  ));
                })()}
              </div>
            )}
          </div>
        );
      })}

      {/* Tips */}
      <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-[9px] text-amber-700">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black mb-0.5">Conseil de transplantation</p>
            <p className="text-amber-600 leading-relaxed">
              Apres les saints de glace (mi-mai), vous pouvez transplanter les plantes matures
              de la mini serre directement dans le jardin. Cliquez sur une plante prete puis
              sur &quot;Transplanter&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
