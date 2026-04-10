"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, SEED_CATALOG, SEED_VARIETIES, PLANTULE_CATALOG, PEPINIERE_STAGES, PEPINIERE_STAGE_NAMES, getStageImage, getPepiniereStage, getPepiniereTransplantDay, MINI_SERRE_ROWS, MINI_SERRE_COLS, type MiniSerre, MINI_SERRE_PRICE } from "@/store/game-store";
import { PLANTS } from "@/lib/ai-engine";
import {
  Droplets, Heart, Sprout, Pill, Plus,
  Thermometer, Sun, X,
  Trash2, Droplet, Calendar, LayoutGrid,
  Package, ChevronDown, ChevronRight, ShoppingCart, Home,
} from "lucide-react";
import Image from "next/image";

// ═══ Mini Serre Card (compact) ═══

function MiniSerreCard({ serre, serreIndex }: { serre: MiniSerre; serreIndex: number }) {
  const seedCollection = useGameStore((s) => s.seedCollection);
  const seedVarieties = useGameStore((s) => s.seedVarieties);
  const plantuleCollection = useGameStore((s) => s.plantuleCollection);
  const fillMiniSerre = useGameStore((s) => s.fillMiniSerre);
  const waterAllMiniSerre = useGameStore((s) => s.waterAllMiniSerre);
  const removeMiniSerre = useGameStore((s) => s.removeMiniSerre);
  const selectedMiniSerreId = useGameStore((s) => s.selectedMiniSerreId);
  const selectedSlot = useGameStore((s) => s.selectedSlot);
  const setSelectedSlot = useGameStore((s) => s.setSelectedSlot);

  const [showFillMenu, setShowFillMenu] = useState(false);
  const [showSlotMenu, setShowSlotMenu] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{ row: number; col: number } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerPlantDefId, setDatePickerPlantDefId] = useState<string | null>(null);
  const [daysAgoInput, setDaysAgoInput] = useState(10);

  let plantCount = 0;
  let readyCount = 0;
  serre.slots.forEach((row) => row.forEach((plant) => {
    if (plant) {
      plantCount++;
      if (getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) >= 4) readyCount++;
    }
  }));

  // Build unified seed list from BOTH inventories
  // Classic seeds (from SEED_CATALOG + seedCollection) + Shop varieties (from SEED_VARIETIES + seedVarieties)
  const availableSeeds = (() => {
    const seeds: Array<{ id: string; plantDefId: string; name: string; emoji: string; count: number; source: 'classic' | 'variety' }> = [];
    // Add classic seeds
    for (const item of SEED_CATALOG) {
      const count = seedCollection[item.plantDefId] || 0;
      if (count > 0) {
        seeds.push({ id: `classic-${item.plantDefId}`, plantDefId: item.plantDefId, name: item.name, emoji: item.emoji, count, source: 'classic' });
      }
    }
    // Add variety seeds (from shops like Vilmorin/Clause)
    for (const v of SEED_VARIETIES) {
      const count = seedVarieties[v.id] || 0;
      if (count > 0) {
        seeds.push({ id: `variety-${v.id}`, plantDefId: v.plantDefId, name: v.name, emoji: v.emoji, count, source: 'variety' });
      }
    }
    return seeds;
  })();

  const handleSlotClick = (row: number, col: number) => {
    const plant = serre.slots[row]?.[col];
    if (plant) {
      setSelectedSlot(serre.id, selectedMiniSerreId === serre.id && selectedSlot?.row === row && selectedSlot?.col === col ? null : { row, col });
    } else {
      setPendingSlot({ row, col });
      setShowSlotMenu(true);
    }
  };

  const handleFill = (plantDefId: string) => {
    fillMiniSerre(serre.id, plantDefId);
    setShowFillMenu(false);
  };

  const handleSelectSeedForSlot = (plantDefId: string) => {
    if (!pendingSlot) return;
    useGameStore.getState().placeSeedInMiniSerre(serre.id, pendingSlot.row, pendingSlot.col, plantDefId);
    setShowSlotMenu(false);
    setPendingSlot(null);
  };

  const handlePlantAtDate = (plantDefId: string) => {
    setDatePickerPlantDefId(plantDefId);
    setShowDatePicker(true);
    setDaysAgoInput(10);
  };

  const confirmPlantAtDate = (plantDefId?: string) => {
    const defId = plantDefId || datePickerPlantDefId;
    if (!pendingSlot || !defId) return;
    const success = useGameStore.getState().plantInMiniSerreAtDate(serre.id, pendingSlot.row, pendingSlot.col, defId, daysAgoInput);
    if (success) {
      setShowDatePicker(false);
      setShowSlotMenu(false);
      setPendingSlot(null);
      setDatePickerPlantDefId(null);
    }
    // If failed (e.g. slot already occupied, no seeds), dialog stays open
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative border-[3px] border-stone-400 rounded-2xl shadow-[4px_4px_0_0_#78716c] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #e5e5e5 0%, #d4d4d4 30%, #f5f5f4 100%)",
      }}
    >
      {/* Metal frame header */}
      <div className="p-2 border-b-2 border-stone-500 flex items-center justify-between"
        style={{
          background: "linear-gradient(90deg, #a8a29e, #d6d3d1, #a8a29e)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-stone-500 bg-stone-200" />
          <div>
            <p className="text-[10px] font-black uppercase text-stone-800">Serre #{serreIndex + 1}</p>
            <p className="text-[7px] text-stone-500 font-bold">{plantCount}/24 · {readyCount} prêtes</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFillMenu(!showFillMenu)}
            className="px-1.5 py-0.5 bg-green-600 text-white text-[7px] font-black rounded hover:bg-green-700 flex items-center gap-0.5 transition-colors"
            title="Tout remplir"
          >
            <LayoutGrid className="w-2.5 h-2.5" />
            Remplir
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => waterAllMiniSerre(serre.id)}
            className="p-1 bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors"
            title="Arroser tout"
          >
            <Droplets className="w-2.5 h-2.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (confirm("Supprimer cette serre ?")) removeMiniSerre(serre.id);
            }}
            className="p-1 bg-red-200 text-red-600 rounded hover:bg-red-300 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </motion.button>
        </div>
      </div>

      {/* Fill menu */}
      <AnimatePresence>
        {showFillMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b-2 border-stone-400 overflow-hidden bg-stone-50"
          >
            <div className="p-2">
              <p className="text-[7px] font-black text-stone-500 uppercase mb-1.5"><Sprout className="w-2.5 h-2.5 inline mr-0.5" />Remplir tout avec :</p>
              <div className="grid grid-cols-3 gap-1">
                {availableSeeds.map((item) => {
                  const plantDef = PLANTS[item.plantDefId];
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFill(item.plantDefId)}
                      className="py-1 px-1 bg-white border border-stone-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-center"
                    >
                      <span className="text-[10px]">{item.emoji}</span>
                      <p className="text-[6px] font-bold text-stone-600 truncate">{item.source === 'variety' ? item.name : plantDef?.name}</p>
                      <p className="text-[5px] text-stone-400">x{item.count}</p>
                    </motion.button>
                  );
                })}
              </div>
              {availableSeeds.length === 0 && (
                <p className="text-[7px] text-stone-400 text-center py-1">Aucune graine</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6×4 Compact Grid */}
      <div className="p-2">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${MINI_SERRE_COLS}, 1fr)` }}
        >
          {serre.slots.map((row, rowIdx) =>
            row.map((plant, colIdx) => {
              const isSelected = selectedMiniSerreId === serre.id && selectedSlot?.row === rowIdx && selectedSlot?.col === colIdx;
              const plantDef = plant ? PLANTS[plant.plantDefId] : null;
              const pepStage = plant ? getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) : -1;
              const isReady = pepStage >= 5;
              const isStunted = plant?.health !== undefined && plant.health <= 20;
              const waterColor = !plant ? "" : plant.waterLevel > 50 ? "bg-blue-400" : plant.waterLevel > 20 ? "bg-amber-400" : "bg-red-400";

              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSlotClick(rowIdx, colIdx)}
                  className={`relative aspect-square rounded-md border-2 cursor-pointer transition-all flex items-center justify-center overflow-hidden
                    ${!plant
                      ? "border-dashed border-stone-300 bg-white/60 hover:border-green-300 hover:bg-green-50/60"
                      : isReady
                      ? "border-green-400 bg-green-50 shadow-[1px_1px_0_0_#16a34a]"
                      : isSelected
                      ? "border-black bg-white shadow-[1px_1px_0_0_#000] z-10"
                      : "border-stone-200 bg-white/80 hover:border-stone-400"
                    }
                  `}
                >
                  {plant && plantDef ? (
                    <>
                      <div className="absolute inset-0">
                        <Image
                          src={getStageImage(plant.plantDefId, Math.min(pepStage, 5))}
                          alt={PEPINIERE_STAGE_NAMES[Math.min(pepStage, 5)]}
                          fill
                          sizes="(max-width: 768px) 12vw, 8vw"
                          className={`object-cover rounded-[3px] ${isStunted ? "grayscale opacity-40" : ""}`}
                        />
                      </div>
                      {/* Growth progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-black/15 rounded-b">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-b"
                          animate={{ width: `${(pepStage * 100) / 5}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {/* Indicateurs visuels (sans emoji) */}
                      {plant.needsWater && (
                        <div className="absolute top-[1px] right-[1px] w-2 h-2 rounded-full bg-blue-400 border border-blue-600" title="Besoin d'eau" />
                      )}
                      {plant.hasDisease && (
                        <div className="absolute top-[5px] right-[1px] w-2 h-2 rounded-full bg-purple-400 border border-purple-600" title="Maladie" />
                      )}
                      {plant.hasPest && (
                        <div className="absolute bottom-[6px] left-[1px] w-2 h-2 rounded-full bg-orange-400 border border-orange-600" title="Parasite" />
                      )}
                      {isReady && (
                        <motion.div
                          className="absolute -top-[2px] -right-[2px] w-3 h-3 rounded-full bg-green-400 border-2 border-green-600"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          title="Pret a transplanter"
                        />
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] text-stone-300 font-black">+</span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
        <div className="flex justify-between mt-1 px-0.5">
          <span className="text-[6px] text-stone-400 font-bold">6r × 4c = 24</span>
          <span className="text-[6px] text-stone-400 font-bold">E{selectedSlot ? `${selectedSlot.row + 1}-${selectedSlot.col + 1}` : '—'}</span>
        </div>
      </div>

      {/* Selected slot detail */}
      <AnimatePresence>
        {selectedMiniSerreId === serre.id && selectedSlot && (() => {
          const plant = serre.slots[selectedSlot.row]?.[selectedSlot.col];
          if (!plant) return null;
          const plantDef = PLANTS[plant.plantDefId];
          if (!plantDef) return null;
          const pepStage = getPepiniereStage(plant.daysSincePlanting, plant.plantDefId);
          const stageName = PEPINIERE_STAGE_NAMES[pepStage] || PEPINIERE_STAGES[pepStage]?.name;
          const transplantDay = getPepiniereTransplantDay(plant.plantDefId);

          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t-2 border-stone-300 p-2 bg-white/80"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-stone-100 border border-stone-300 flex items-center justify-center">
                    <span className="text-[10px] font-black text-stone-500">{pepStage + 1}/6</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black">{plantDef.name}</p>
                    <p className="text-[7px] text-stone-400">{stageName} · J{plant.daysSincePlanting}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSlot(serre.id, null)} className="text-stone-400 hover:text-black"><X className="w-3 h-3" /></button>
              </div>
              <div className="grid grid-cols-2 gap-1 mb-1.5">
                <div className="flex items-center gap-0.5">
                  <Droplets className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${plant.waterLevel > 50 ? "bg-blue-500" : plant.waterLevel > 20 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${plant.waterLevel}%` }} />
                  </div>
                  <span className="text-[7px] font-bold text-stone-400 w-6 text-right">{Math.round(plant.waterLevel)}%</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${plant.health > 60 ? "bg-green-500" : plant.health > 30 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${plant.health}%` }} />
                  </div>
                  <span className="text-[7px] font-bold text-stone-400 w-6 text-right">{Math.round(plant.health)}%</span>
                </div>
              </div>
              <div className="flex gap-0.5 flex-wrap">
                <div className="flex gap-[2px] mb-1">{PEPINIERE_STAGES.map((_, si) => (
                  <div key={si} className={`w-2 h-1 rounded-full ${si < pepStage ? "bg-green-500" : si === pepStage ? "bg-amber-400" : "bg-stone-200"}`} />
                ))}</div>
                <div className="flex gap-1 ml-auto">
                  <button onClick={(e) => { e.stopPropagation(); useGameStore.getState().waterMiniSerrePlant(serre.id, selectedSlot.row, selectedSlot.col); }} className="px-1.5 py-0.5 bg-blue-500 text-white text-[7px] font-bold rounded hover:bg-blue-600" title="Arroser"><Droplets className="w-2.5 h-2.5" /></button>
                  {(plant.hasDisease || plant.hasPest) && <button onClick={(e) => { e.stopPropagation(); useGameStore.getState().treatMiniSerrePlant(serre.id, selectedSlot.row, selectedSlot.col); }} className="px-1.5 py-0.5 bg-pink-500 text-white text-[7px] font-bold rounded hover:bg-pink-600" title="Traiter"><Pill className="w-2.5 h-2.5" /></button>}
                  <button onClick={(e) => { e.stopPropagation(); useGameStore.getState().fertilizeMiniSerrePlant(serre.id, selectedSlot.row, selectedSlot.col); }} className="px-1.5 py-0.5 bg-violet-500 text-white text-[7px] font-bold rounded hover:bg-violet-600" title="Engrais"><Sprout className="w-2.5 h-2.5" /></button>
                  {pepStage >= 5 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const def = PLANTS[plant.plantDefId];
                        useGameStore.getState().setPendingTransplant({
                          serreId: serre.id,
                          row: selectedSlot.row,
                          col: selectedSlot.col,
                          plantDefId: plant.plantDefId,
                          plantName: def?.name || plant.plantDefId,
                          plantEmoji: def?.emoji || "",
                        });
                        setSelectedSlot(serre.id, null);
                        useGameStore.setState({ activeTab: "jardin" });
                      }}
                      className="px-1.5 py-0.5 bg-gradient-to-b from-emerald-400 to-green-500 text-white text-[7px] font-bold rounded hover:from-emerald-300 hover:to-green-400 shadow-[1px_1px_0_0_#000]"
                    >
                      Transplanter
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); useGameStore.getState().removeMiniSerrePlant(serre.id, selectedSlot.row, selectedSlot.col); setSelectedSlot(serre.id, null); }} className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[7px] font-bold rounded hover:bg-red-200" title="Supprimer"><X className="w-2.5 h-2.5" /></button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Slot menu (seed / plant at date) */}
      <AnimatePresence>
        {showSlotMenu && pendingSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => { setShowSlotMenu(false); setPendingSlot(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-4 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase">Planter (E{pendingSlot.row + 1}-{pendingSlot.col + 1})</h3>
                <button onClick={() => { setShowSlotMenu(false); setPendingSlot(null); }} className="text-stone-400 hover:text-black"><X className="w-5 h-5" /></button>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => { setShowDatePicker(false); }}
                  className="flex-1 py-1.5 text-[9px] font-black rounded-lg bg-green-100 text-green-800 border-2 border-green-300"
                >
                  <Sprout className="w-3 h-3 inline mr-1" />Graine normale
                </button>
                <button
                  onClick={() => { setShowDatePicker(true); }}
                  className="flex-1 py-1.5 text-[9px] font-black rounded-lg bg-orange-100 text-orange-800 border-2 border-orange-300"
                >
                  <Calendar className="w-3 h-3 inline mr-1" />Planter a une date
                </button>
              </div>

              {/* Normal seed selection */}
              {!showDatePicker && (
                <div className="grid grid-cols-2 gap-1.5">
                  {availableSeeds.map((item) => {
                    const plantDef = PLANTS[item.plantDefId];
                    return (
                      <motion.button key={`seed-${item.id}`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectSeedForSlot(item.plantDefId)}
                        className={`p-2 rounded-xl border-2 hover:shadow-[2px_2px_0_0_#000] transition-all text-left ${item.source === 'variety' ? 'bg-gradient-to-b from-purple-50 to-white border-purple-300' : 'bg-gradient-to-b from-amber-50 to-white border-amber-300'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{item.emoji}</span>
                          <div>
                            <p className="text-[8px] font-black">{item.source === 'variety' ? item.name : plantDef?.name}</p>
                            <p className="text-[6px] text-stone-400">x{item.count}{item.source === 'variety' ? ' (variete)' : ''}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Date-based planting */}
              {showDatePicker && (
                <div>
                  <p className="text-[8px] font-bold text-stone-500 mb-2">Planter comme si semee il y a X jours :</p>
                  <div className="flex gap-1 mb-3">
                    {[5, 10, 15, 20, 30, 45].map((d) => (
                      <motion.button
                        key={d}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDaysAgoInput(d)}
                        className={`flex-1 py-1.5 text-center rounded-lg border-2 text-[9px] font-black transition-all
                          ${daysAgoInput === d ? "bg-orange-500 text-white border-orange-700" : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"}`}
                      >
                        -{d}j
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex gap-1.5 items-center mb-3">
                    <input
                      type="number" min={0} max={200}
                      value={daysAgoInput}
                      onChange={(e) => setDaysAgoInput(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 px-2 py-1 border-2 border-stone-200 rounded-lg text-[10px] font-bold text-center focus:border-orange-400 focus:outline-none"
                    />
                    <span className="text-[9px] font-bold text-stone-400">jours</span>
                  </div>
                  <p className="text-[7px] text-orange-600 mb-2">
                    Stade calcule selon la plante choisie (base sur ses durees de croissance reelles)
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {availableSeeds.map((item) => {
                      const plantDef = PLANTS[item.plantDefId];
                      return (
                        <motion.button key={`date-${item.id}`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => confirmPlantAtDate(item.plantDefId)}
                          className={`p-2 rounded-xl border-2 hover:shadow-[2px_2px_0_0_#000] transition-all text-left ${item.source === 'variety' ? 'bg-gradient-to-b from-purple-50 to-orange-50 border-purple-300' : 'bg-gradient-to-b from-orange-50 to-white border-orange-300'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{item.emoji}</span>
                            <div>
                              <p className="text-[8px] font-black">{item.source === 'variety' ? item.name : plantDef?.name}</p>
                              <p className="text-[6px] text-stone-400">x{item.count} -{daysAgoInput}j</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(availableSeeds.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-[10px] text-stone-400 mb-2">Aucune graine disponible.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowSlotMenu(false);
                      setPendingSlot(null);
                      useGameStore.setState({ activeTab: "boutique" });
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase rounded-xl border-2 border-amber-700 shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Aller a la Boutique
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══ Chambre de Culture (main component) ═══

const MAX_MINI_SERRES = 6;

export function Pepiniere() {
  const miniSerres = useGameStore((s) => s.miniSerres);
  const buyMiniSerre = useGameStore((s) => s.buyMiniSerre);
  const coins = useGameStore((s) => s.coins);
  const seedCollection = useGameStore((s) => s.seedCollection);
  const seedVarieties = useGameStore((s) => s.seedVarieties);

  let miniSerreTotalPlants = 0;
  let miniSerreReadyPlants = 0;
  miniSerres.forEach((serre) => {
    serre.slots.forEach((row) => {
      row.forEach((plant) => {
        if (plant) {
          miniSerreTotalPlants++;
          if (getPepiniereStage(plant.daysSincePlanting, plant.plantDefId) >= 4) miniSerreReadyPlants++;
        }
      });
    });
  });

  const canBuySerre = coins >= MINI_SERRE_PRICE && miniSerres.length < MAX_MINI_SERRES;

  return (
    <div className="space-y-4">
      {/* Header — grow tent style */}
      <div className="relative border-[3px] border-stone-500 rounded-2xl shadow-[6px_6px_0_0_#57534e] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #d6d3d1 0%, #a8a29e 40%, #78716c 100%)",
        }}
      >
        {/* Metal frame top bar */}
        <div className="h-3 w-full" style={{
          background: "linear-gradient(90deg, #78716c, #a8a29e, #78716c)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
        }} />

        <div className="p-4 relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, transparent 2px)", backgroundSize: "20px 100%" }} />

          <div className="relative flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {/* Grow tent icon */}
              <div className="w-12 h-12 rounded-xl border-2 border-stone-500 flex items-center justify-center"
                style={{
                  background: "linear-gradient(180deg, #e7e5e4, #d6d3d1)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 0 rgba(255,255,255,0.2)",
                }}
              >
                <Home className="w-6 h-6 text-stone-500" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}>
                  Chambre de Culture
                </h2>
                <p className="text-[9px] text-stone-200 font-bold">
                  {miniSerres.length}/{MAX_MINI_SERRES} mini serres · {miniSerreTotalPlants} plants · {miniSerreReadyPlants} prêts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-stone-900/40 border border-stone-500/50 rounded-lg text-[9px]">
                <Thermometer className="w-3 h-3 text-red-400" />
                <span className="font-bold text-stone-100">20°C</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-stone-900/40 border border-stone-500/50 rounded-lg text-[9px]">
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="font-bold text-stone-100">4.8h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metal frame bottom bar */}
        <div className="h-2 w-full" style={{
          background: "linear-gradient(90deg, #78716c, #a8a29e, #78716c)",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.3)",
        }} />
      </div>

      {/* Seed inventory bar */}
      {(() => {
        const totalClassic = Object.values(seedCollection).reduce((a, b) => a + b, 0);
        const totalVarieties = Object.values(seedVarieties).reduce((a, b) => a + b, 0);
        const totalSeeds = totalClassic + totalVarieties;
        return totalSeeds > 0 && (
          <div className="p-2.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] font-black uppercase text-emerald-700">Inventaire graines ({totalSeeds})</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => useGameStore.setState({ activeTab: "boutique" })}
                className="px-2 py-0.5 bg-emerald-600 text-white text-[7px] font-black rounded-lg flex items-center gap-1 hover:bg-emerald-700 transition-colors"
              >
                <ShoppingCart className="w-2.5 h-2.5" />
                Boutique
              </motion.button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {SEED_CATALOG.map((item) => {
                const classicCount = seedCollection[item.plantDefId] || 0;
                const varietyCount = SEED_VARIETIES
                  .filter((v) => v.plantDefId === item.plantDefId)
                  .reduce((s, v) => s + (seedVarieties[v.id] || 0), 0);
                const total = classicCount + varietyCount;
                if (total <= 0) return null;
                return (
                  <div key={item.plantDefId} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-emerald-300 rounded-lg">
                    <span className="text-[10px]">{item.emoji}</span>
                    <span className="text-[7px] font-black text-emerald-700">x{total}</span>
                  </div>
                );
              })}
              {SEED_VARIETIES.map((v) => {
                const count = seedVarieties[v.id] || 0;
                if (count <= 0) return null;
                return (
                  <div key={v.id} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 border border-purple-300 rounded-lg">
                    <span className="text-[10px]">{v.emoji}</span>
                    <span className="text-[7px] font-black text-purple-700">x{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Info banner */}
      <div className="p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl text-[9px] text-amber-800 font-medium flex items-start gap-2">
        <div>
          <strong>Achetez des Mini Serres</strong> (150 pieces) et placez vos graines dedans.
          <strong> Remplir</strong> une serre entiere en un clic. <strong>Planter a date</strong> pour simuler un semis anterieur.
          <span className="block text-[8px] text-amber-600 mt-1">Environnement controle : 20C, lumiere x0.6, croissance x0.7 - Max {MAX_MINI_SERRES} serres</span>
        </div>
      </div>

      {/* Buy mini serre button */}
      <motion.button
        whileHover={canBuySerre ? { scale: 1.02 } : {}}
        whileTap={canBuySerre ? { scale: 0.98 } : {}}
        onClick={() => canBuySerre && buyMiniSerre()}
        disabled={!canBuySerre}
        className={`w-full py-3 text-[11px] font-black uppercase rounded-xl border-[3px] transition-all flex items-center justify-center gap-2
          ${canBuySerre
            ? "bg-gradient-to-r from-stone-600 to-stone-700 text-white border-stone-800 shadow-[4px_4px_0_0_#292524] hover:from-stone-500 hover:to-stone-600"
            : "bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed"
          }`}
      >
        <Package className="w-4 h-4" />
        {miniSerres.length < MAX_MINI_SERRES ? (
          <>Acheter une Mini Serre — 150 🪙 ({miniSerres.length + 1}/{MAX_MINI_SERRES})</>
        ) : (
          <>LIMITE ATTEINTE — {MAX_MINI_SERRES} serres max</>
        )}
      </motion.button>

      {/* Mini Serres grid */}
      {miniSerres.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {miniSerres.map((serre, idx) => (
            <MiniSerreCard key={serre.id} serre={serre} serreIndex={idx} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {miniSerres.length === 0 && (
        <div className="p-8 border-[3px] border-dashed border-stone-300 rounded-2xl text-center"
          style={{
            background: "linear-gradient(180deg, #f5f5f4, #e7e5e4)",
          }}
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-xl border-2 border-stone-300 flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #e7e5e4, #d6d3d1)",
            }}
          >
            <Package className="w-8 h-8 text-stone-300" />
          </div>
          <p className="text-sm font-black text-stone-400 uppercase">Aucune mini serre</p>
          <p className="text-[9px] text-stone-300 mt-1">Achetez votre première mini serre pour commencer !</p>
        </div>
      )}
    </div>
  );
}
