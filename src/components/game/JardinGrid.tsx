"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import {
  PLANTS, STAGE_NAMES, STAGE_EMOJIS, PLANT_SPACING,
  getLastFrostDate, type PlantSpacingInfo,
} from "@/lib/ai-engine";
import { isFrostRisk } from "@/lib/weather-service";
import { getPepiniereStage } from "@/store/game-store";
import {
  Droplets, Plus, ZoomIn, ZoomOut, Move, ArrowRight,
  Bug, Pill, FlaskRound, Scissors, Ruler, Layers,
  Home, RotateCcw, Maximize2,
} from "lucide-react";

// ═══ Zoom levels ═══
const ZOOM_LEVELS = [0.06, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];

type Tool = "select" | "plant" | "row" | "serre";

export function JardinGrid() {
  const gardenWidthCm = useGameStore((s) => s.gardenWidthCm);
  const gardenHeightCm = useGameStore((s) => s.gardenHeightCm);
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const coins = useGameStore((s) => s.coins);
  const realWeather = useGameStore((s) => s.realWeather);
  const seedCollection = useGameStore((s) => s.seedCollection);
  const pepiniere = useGameStore((s) => s.pepiniere);
  const expandGarden = useGameStore((s) => s.expandGarden);
  const addSerreZone = useGameStore((s) => s.addSerreZone);
  const removeSerreZone = useGameStore((s) => s.removeSerreZone);
  const waterAllGarden = useGameStore((s) => s.waterAllGarden);
  const showGardenSerre = useGameStore((s) => s.showGardenSerre);
  const toggleGardenSerre = useGameStore((s) => s.toggleGardenSerre);
  const toggleSerreView = useGameStore((s) => s.toggleSerreView);
  const pendingTransplant = useGameStore((s) => s.pendingTransplant);
  const setPendingTransplant = useGameStore((s) => s.setPendingTransplant);
  const transplantFromMiniSerreToGarden = useGameStore((s) => s.transplantFromMiniSerreToGarden);

  const [zoom, setZoom] = useState(0.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const [selectedPlantType, setSelectedPlantType] = useState<string>("tomato");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [hoverCm, setHoverCm] = useState<{ x: number; y: number } | null>(null);
  const [rowStart, setRowStart] = useState<{ x: number; y: number } | null>(null);
  const [serreStart, setSerreStart] = useState<{ x: number; y: number } | null>(null);
  const [showPlantMenu, setShowPlantMenu] = useState<{ x: number; y: number } | null>(null);
  const [showWaterMenu, setShowWaterMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const hasFrostRisk = realWeather ? isFrostRisk(realWeather) : false;

  // Get ready-to-transplant seedlings (per-plant threshold)
  const readySeedlings = useMemo(() =>
    pepiniere.filter((p) => getPepiniereStage(p.daysSincePlanting, p.plantDefId) >= 5),
    [pepiniere]
  );

  // Available plant types (have seeds or ready seedlings)
  const availablePlants = useMemo(() => {
    const types: string[] = [];
    for (const id of Object.keys(PLANTS)) {
      if ((seedCollection[id] || 0) > 0 || readySeedlings.some((s) => s.plantDefId === id)) {
        types.push(id);
      }
    }
    return types;
  }, [seedCollection, readySeedlings]);

  // Snap to grid
  const snapToGrid = useCallback((cm: number) => {
    return Math.round(cm / 5) * 5;
  }, []);

  // Convert mouse event to garden cm coordinates
  const mouseToCm = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cmX = (mx - pan.x) / zoom;
    const cmY = (my - pan.y) / zoom;
    return { x: cmX, y: cmY };
  }, [zoom, pan]);

  // Grid line interval based on zoom
  const gridInterval = useMemo(() => {
    if (zoom < 0.1) return 200;  // 2m
    if (zoom < 0.2) return 100;  // 1m
    if (zoom < 0.4) return 50;   // 50cm
    if (zoom < 0.8) return 20;   // 20cm
    return 10;                    // 10cm
  }, [zoom]);

  // Container dimensions
  const [containerSize, setContainerSize] = useState({ w: 800, h: 450 });
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Fit zoom to see entire garden
  const fitZoom = useMemo(() => {
    return Math.min(containerSize.w / gardenWidthCm, containerSize.h / gardenHeightCm) * 0.9;
  }, [containerSize, gardenWidthCm, gardenHeightCm]);

  // Auto-fit on mount
  useEffect(() => {
    setZoom(fitZoom);
    setPan({ x: 0, y: 0 });
  }, [fitZoom]);

  // Center garden in view
  const centerOffsetX = Math.max(0, (containerSize.w - gardenWidthCm * zoom) / 2);
  const centerOffsetY = Math.max(0, (containerSize.h - gardenHeightCm * zoom) / 2);

  // ═══ Click handler based on tool ═══

  const handleClick = useCallback((cmX: number, cmY: number) => {
    if (cmX < 0 || cmY < 0 || cmX > gardenWidthCm || cmY > gardenHeightCm) return;

    // Handle pending transplant placement
    const pt = useGameStore.getState().pendingTransplant;
    if (pt) {
      const success = useGameStore.getState().transplantFromMiniSerreToGarden(
        pt.serreId,
        pt.row,
        pt.col,
        Math.round(cmX),
        Math.round(cmY)
      );
      if (success) {
        useGameStore.getState().setPendingTransplant(null);
        const newAlerts = [...useGameStore.getState().alerts, {
          id: `transplant-${Date.now()}`,
          type: "stage",
          message: `🌱 ${pt.plantEmoji} ${pt.plantName} transplanté(e) au jardin !`,
          emoji: "🌱", cellX: 0, cellY: 0,
          timestamp: Date.now(), severity: "info",
        }];
        useGameStore.setState({ alerts: newAlerts });
      }
      return;
    }

    if (tool === "select") {
      // Check if clicked on a plant
      const clicked = gardenPlants.find((gp) => {
        const sp = PLANT_SPACING[gp.plantDefId];
        if (!sp) return false;
        return cmX >= gp.x && cmX < gp.x + sp.plantSpacingCm && cmY >= gp.y && cmY < gp.y + sp.rowSpacingCm;
      });
      setSelectedPlantId(clicked?.id || null);
      setRowStart(null);
      setSerreStart(null);
    } else if (tool === "plant") {
      setShowPlantMenu({ x: cmX, y: cmY });
    } else if (tool === "row") {
      if (!rowStart) {
        setRowStart({ x: cmX, y: cmY });
      } else {
        // Place row
        const store = useGameStore.getState();
        store.placeRowInGarden(selectedPlantType, rowStart.x, rowStart.y, cmX, cmY);
        setRowStart(null);
      }
    } else if (tool === "serre") {
      if (!serreStart) {
        setSerreStart({ x: cmX, y: cmY });
      } else {
        const x = Math.min(serreStart.x, cmX);
        const y = Math.min(serreStart.y, cmY);
        const w = Math.abs(cmX - serreStart.x);
        const h = Math.abs(cmY - serreStart.y);
        if (w >= 20 && h >= 20) {
          addSerreZone(x, y, w, h);
        }
        setSerreStart(null);
      }
    }
  }, [tool, gardenPlants, gardenWidthCm, gardenHeightCm, rowStart, serreStart, selectedPlantType, addSerreZone]);

  // ═══ Mouse handlers ═══

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      // Track all left/middle clicks for click detection
      isDragging.current = true;
      hasDragged.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
      // Only pan with select tool (no pending transplant), plant tool, or middle click
      const canPan = e.button === 1 || (e.button === 0 && (tool === "select" || tool === "plant" || tool === "row") && !e.altKey && !pendingTransplant);
      if (canPan) {
        e.preventDefault();
      }
    }
  }, [tool, pan, pendingTransplant]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
      // Only pan when allowed (select/plant/row tool or middle button)
      const canPan = e.button === 1 || (tool === "select" || tool === "plant" || tool === "row");
      if (canPan) {
        setPan({
          x: panStart.current.x + dx,
          y: panStart.current.y + dy,
        });
      }
    }

    const cm = mouseToCm(e);
    if (cm && cm.x >= 0 && cm.y >= 0 && cm.x <= gardenWidthCm && cm.y <= gardenHeightCm) {
      setHoverCm({ x: snapToGrid(cm.x), y: snapToGrid(cm.y) });
    } else {
      setHoverCm(null);
    }
  }, [mouseToCm, gardenWidthCm, gardenHeightCm, snapToGrid, tool]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging.current && !hasDragged.current) {
      // Click (not drag)
      const cm = mouseToCm(e);
      if (cm) {
        handleClick(snapToGrid(cm.x), snapToGrid(cm.y));
      }
    }
    isDragging.current = false;
  }, [mouseToCm, snapToGrid, handleClick]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const oldZoom = zoom;
    const idx = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    let newZoom: number;
    if (e.deltaY < 0) {
      newZoom = ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, idx + 1)] ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
    } else {
      newZoom = ZOOM_LEVELS[Math.max(0, idx - 1)] ?? ZOOM_LEVELS[0];
    }

    // Zoom towards cursor
    const cmX = (mx - pan.x) / oldZoom;
    const cmY = (my - pan.y) / oldZoom;
    const newPanX = mx - cmX * newZoom;
    const newPanY = my - cmY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan]);

  // ═══ Place plant from menu ═══

  const confirmPlacePlant = useCallback((cmX: number, cmY: number, useSeed: boolean) => {
    const store = useGameStore.getState();
    if (useSeed) {
      store.placePlantInGarden(selectedPlantType, cmX, cmY);
    } else {
      // Find ready seedling of this type
      const idx = store.pepiniere.findIndex((p) => p.plantDefId === selectedPlantType && getPepiniereStage(p.daysSincePlanting, p.plantDefId) >= 5);
      if (idx >= 0) {
        store.placePlantInGarden(selectedPlantType, cmX, cmY, idx);
      }
    }
    setShowPlantMenu(null);
  }, [selectedPlantType]);

  // ═══ Selected plant info ═══
  const selectedPlant = useMemo(() =>
    gardenPlants.find((p) => p.id === selectedPlantId),
    [gardenPlants, selectedPlantId]
  );

  const selectedPlantDef = selectedPlant ? PLANTS[selectedPlant.plantDefId] : null;
  const selectedSpacing = selectedPlant ? PLANT_SPACING[selectedPlant.plantDefId] : null;
  const selectedInSerre = selectedPlant ? gardenSerreZones.some((z) =>
    selectedPlant.x >= z.x && selectedPlant.y >= z.y &&
    selectedPlant.x < z.x + z.width && selectedPlant.y < z.y + z.height
  ) : false;

  // Area in m²
  const areaM2 = (gardenWidthCm * gardenHeightCm) / 10000;

  return (
    <div className="space-y-3">
      {/* ═══ Header ═══ */}
      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-[3px] border-black rounded-2xl shadow-[6px_6px_0_0_#000] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(circle, #000 0.8px, transparent 0.8px)", backgroundSize: "4px 4px" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight" style={{ textShadow: "2px 2px 0 #000" }}>
                🌿 Jardin
              </h2>
              <p className="text-[9px] text-green-600 font-bold">
                {gardenWidthCm / 100}m × {gardenHeightCm / 100}m = {areaM2}m² · {gardenPlants.length} plantes · {hasFrostRisk ? "🥶 Gel !" : "✅ OK"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white/80 border border-black/20 rounded-lg">
              <button onClick={() => {
                const idx = ZOOM_LEVELS.findIndex(z => z >= zoom);
                if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1]);
              }} className="p-1 hover:bg-stone-100 rounded">
                <ZoomOut className="w-3.5 h-3.5 text-stone-600" />
              </button>
              <span className="text-[9px] font-black text-stone-600 min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => {
                const idx = ZOOM_LEVELS.findIndex(z => z >= zoom);
                if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1]);
              }} className="p-1 hover:bg-stone-100 rounded">
                <ZoomIn className="w-3.5 h-3.5 text-stone-600" />
              </button>
              <button onClick={() => { setZoom(fitZoom); setPan({ x: 0, y: 0 }); }}
                className="p-1 hover:bg-stone-100 rounded ml-0.5" title="Vue d'ensemble">
                <Maximize2 className="w-3.5 h-3.5 text-stone-600" />
              </button>
            </div>

            {/* Water menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowWaterMenu(!showWaterMenu)}
                className="px-2.5 py-1 text-[10px] font-black uppercase rounded-xl border-2 bg-blue-500 text-white border-blue-700 shadow-[2px_2px_0_0_#000] hover:bg-blue-400 flex items-center gap-1"
              >
                💧 Arroser <span className="text-[8px]">▼</span>
              </motion.button>
              {showWaterMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowWaterMenu(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] z-40 overflow-hidden min-w-[180px]">
                    <button
                      onClick={() => { waterAllGarden(); setShowWaterMenu(false); }}
                      className="w-full px-3 py-2 text-[10px] font-bold text-left hover:bg-blue-50 flex items-center gap-2 transition-colors"
                    >
                      💧 Tout arroser
                    </button>
                    <button
                      onClick={() => {
                        const outside = gardenPlants.filter(p => {
                          return !gardenSerreZones.some(z =>
                            p.xCm >= z.x && p.xCm < z.x + z.width &&
                            p.yCm >= z.y && p.yCm < z.y + z.height
                          );
                        });
                        outside.forEach(p => useGameStore.getState().waterPlantGarden(p.id));
                        setShowWaterMenu(false);
                      }}
                      className="w-full px-3 py-2 text-[10px] font-bold text-left hover:bg-green-50 flex items-center gap-2 transition-colors"
                    >
                      🌿 Arroser hors serre
                      <span className="ml-auto text-[8px] text-stone-400">{gardenPlants.filter(p => !gardenSerreZones.some(z => p.xCm >= z.x && p.xCm < z.x + z.width && p.yCm >= z.y && p.yCm < z.y + z.height)).length}</span>
                    </button>
                    <button
                      onClick={() => {
                        const inside = gardenPlants.filter(p =>
                          gardenSerreZones.some(z =>
                            p.xCm >= z.x && p.xCm < z.x + z.width &&
                            p.yCm >= z.y && p.yCm < z.y + z.height
                          )
                        );
                        inside.forEach(p => useGameStore.getState().waterPlantGarden(p.id));
                        setShowWaterMenu(false);
                      }}
                      className="w-full px-3 py-2 text-[10px] font-bold text-left hover:bg-cyan-50 flex items-center gap-2 transition-colors"
                    >
                      🏡 Arroser dans la serre
                      <span className="ml-auto text-[8px] text-stone-400">{gardenPlants.filter(p => gardenSerreZones.some(z => p.xCm >= z.x && p.xCm < z.x + z.width && p.yCm >= z.y && p.yCm < z.y + z.height)).length}</span>
                    </button>
                    <div className="border-t border-stone-200" />
                    <button
                      onClick={() => {
                        const dry = gardenPlants.filter(p => p.waterLevel < 40);
                        dry.forEach(p => useGameStore.getState().waterPlantGarden(p.id));
                        setShowWaterMenu(false);
                      }}
                      className="w-full px-3 py-2 text-[10px] font-bold text-left hover:bg-amber-50 flex items-center gap-2 transition-colors"
                    >
                      🔴 Arroser plants secs (&lt;40%)
                      <span className="ml-auto text-[8px] text-stone-400">{gardenPlants.filter(p => p.waterLevel < 40).length}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Expand */}
            <div className="flex gap-1">
              <motion.button
                whileHover={coins >= 100 && gardenWidthCm < 2500 ? { scale: 1.03 } : {}}
                whileTap={coins >= 100 && gardenWidthCm < 2500 ? { scale: 0.97 } : {}}
                onClick={() => expandGarden("width")}
                disabled={coins < 100 || gardenWidthCm >= 2500}
                className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg border-2 flex items-center gap-1
                  ${coins >= 100 && gardenWidthCm < 2500
                    ? "bg-green-500 text-white border-green-700 shadow-[2px_2px_0_0_#000]"
                    : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  }`}
              >
                ↔ +2m 100🪙
              </motion.button>
              <motion.button
                whileHover={coins >= 100 && gardenHeightCm < 2000 ? { scale: 1.03 } : {}}
                whileTap={coins >= 100 && gardenHeightCm < 2000 ? { scale: 0.97 } : {}}
                onClick={() => expandGarden("height")}
                disabled={coins < 100 || gardenHeightCm >= 2000}
                className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg border-2 flex items-center gap-1
                  ${coins >= 100 && gardenHeightCm < 2000
                    ? "bg-green-500 text-white border-green-700 shadow-[2px_2px_0_0_#000]"
                    : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  }`}
              >
                ↕ +2m 100🪙
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Frost warning */}
      {hasFrostRisk && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="p-2.5 bg-blue-50 border-2 border-blue-300 rounded-xl text-[9px] text-blue-800 flex items-center gap-2">
          <span className="text-lg">🥶</span>
          <div>
            <p className="font-black">Attention : Risque de gel !</p>
            <p className="text-blue-600">{getLastFrostDate()}</p>
          </div>
        </motion.div>
      )}

      {/* Pending transplant banner */}
      {pendingTransplant && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="p-2.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{pendingTransplant.plantEmoji}</span>
            <div>
              <p className="text-[10px] font-black text-emerald-800">Transplant: {pendingTransplant.plantName}</p>
              <p className="text-[8px] text-emerald-600">Cliquez sur le jardin pour placer la plante</p>
            </div>
          </div>
          <button
            onClick={() => setPendingTransplant(null)}
            className="px-2 py-1 bg-stone-200 text-stone-600 text-[9px] font-bold rounded-lg hover:bg-stone-300"
          >
            ✕ Annuler
          </button>
        </motion.div>
      )}

      {/* ═══ Tool bar ═══ */}
      <div className="flex items-center gap-2 p-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_0_#000] flex-wrap">
        <span className="text-[9px] font-black uppercase text-stone-500 mr-1">Outils:</span>

        <ToolButton active={tool === "select"} onClick={() => setTool("select")} icon="👆" label="Sélection" />
        <ToolButton active={tool === "plant"} onClick={() => setTool("plant")} icon="🌱" label="Planter" />
        <ToolButton active={tool === "row"} onClick={() => { setTool("row"); setRowStart(null); }} icon="📏" label="Ligne" />
        <ToolButton active={tool === "serre"} onClick={() => { setTool("serre"); setSerreStart(null); }} icon="🏡" label="Serre" />

        <div className="w-px h-6 bg-stone-200 mx-1" />

        {/* Serre button — add/remove or toggle visibility */}
        {gardenSerreZones.length === 0 ? (
          <button
            onClick={() => { setTool("serre"); setSerreStart(null); }}
            className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border-2 flex items-center gap-1 transition-all bg-cyan-100 border-cyan-400 text-cyan-800 shadow-[2px_2px_0_0_#000] hover:bg-cyan-200"
            title="Dessiner une zone de serre"
          >
            🏡 + Serre
          </button>
        ) : (
          <button
            onClick={() => setTool(tool === "serre" ? "select" : "serre")}
            className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border-2 flex items-center gap-1 transition-all
              ${tool === "serre"
                ? "bg-cyan-100 border-cyan-400 text-cyan-800 shadow-[2px_2px_0_0_#000]"
                : showGardenSerre
                  ? "bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100"
                  : "bg-stone-100 border-stone-300 text-stone-500 hover:border-cyan-300"
              }`}
            title="Ajouter/Supprimer une serre"
          >
            🏡 {tool === "serre" ? "Annuler" : "Serre ON"}
          </button>
        )}

        <div className="w-px h-6 bg-stone-200 mx-1" />

        {/* Plant type selector */}
        {(tool === "plant" || tool === "row") && (
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-stone-500">Plante:</span>
            {availablePlants.map((id) => {
              const def = PLANTS[id];
              const sp = PLANT_SPACING[id];
              return (
                <button
                  key={id}
                  onClick={() => setSelectedPlantType(id)}
                  className={`px-1.5 py-0.5 text-[9px] font-black rounded-lg border-2 flex items-center gap-0.5 transition-all
                    ${selectedPlantType === id
                      ? "bg-green-100 border-green-500 shadow-[2px_2px_0_0_#000] scale-105"
                      : "bg-white border-stone-200 hover:border-stone-400"
                    }`}
                  title={`${def.name} — ${sp?.label}`}
                >
                  {def.emoji} <span className="hidden sm:inline text-[7px]">{sp?.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {tool === "row" && rowStart && (
          <span className="text-[9px] font-bold text-green-700 animate-pulse">
            ← Cliquez la fin de la ligne
          </span>
        )}
        {tool === "serre" && serreStart && (
          <span className="text-[9px] font-bold text-cyan-700 animate-pulse">
            ← Cliquez le coin opposé de la serre
          </span>
        )}

        {/* Spacing info */}
        {(tool === "plant" || tool === "row") && (
          <div className="ml-auto text-[8px] text-stone-400 flex items-center gap-1">
            <Ruler className="w-3 h-3" />
            {PLANT_SPACING[selectedPlantType]?.label}
          </div>
        )}
      </div>

      {/* ═══ Garden Canvas ═══ */}
      <div
        ref={containerRef}
        className="relative border-[3px] border-black rounded-2xl overflow-hidden cursor-crosshair shadow-[6px_6px_0_0_#000] select-none"
        style={{ height: "500px", background: "#f5f0e8" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        onMouseLeave={() => setHoverCm(null)}
      >
        {/* Grid + plants layer */}
        <div
          style={{
            transform: `translate(${pan.x + centerOffsetX}px, ${pan.y + centerOffsetY}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: gardenWidthCm,
            height: gardenHeightCm,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
              `,
              backgroundSize: `${gridInterval}px ${gridInterval}px`,
            }}
          />

          {/* Major grid lines (every 1m = 100cm) when zoomed enough */}
          {zoom >= 0.15 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)
                `,
                backgroundSize: `100px 100px`,
              }}
            />
          )}

          {/* Serre zones (only when visible) */}
          {showGardenSerre && gardenSerreZones.map((zone) => (
            <div
              key={zone.id}
              className={`absolute border-2 border-cyan-500 border-dashed bg-cyan-200/30 cursor-pointer ${tool === "select" ? "hover:bg-cyan-300/40" : "pointer-events-none"}`}
              style={{
                left: zone.x,
                top: zone.y,
                width: zone.width,
                height: zone.height,
                borderRadius: 4,
              }}
              onClick={(e) => {
                if (tool === "select") {
                  e.stopPropagation();
                  toggleSerreView();
                }
              }}
            >
              {/* Serre label + delete button */}
              {zoom >= 0.1 && (
                <div className="absolute top-0.5 left-0.5 flex items-center gap-0.5">
                  <span
                    className="px-1 bg-cyan-500/80 text-white text-[8px] font-black rounded"
                    style={{ fontSize: Math.max(6, 8 / zoom) }}
                  >
                    🏡 Serre
                  </span>
                  {tool === "serre" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Supprimer cette zone de serre ?")) removeSerreZone(zone.id);
                      }}
                      className="px-1 bg-red-500/90 text-white text-[8px] font-black rounded hover:bg-red-600"
                      style={{ fontSize: Math.max(6, 8 / zoom) }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
              {/* Hatching pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, #06b6d4, #06b6d4 3px, transparent 3px, transparent 8px)",
                }}
              />
            </div>
          ))}

          {/* Garden plants */}
          {gardenPlants.map((gp) => {
            const sp = PLANT_SPACING[gp.plantDefId];
            const def = PLANTS[gp.plantDefId];
            if (!sp || !def) return null;

            const isSelected = gp.id === selectedPlantId;
            const plant = gp.plant;

            return (
              <GardenPlantCell
                key={gp.id}
                gp={gp}
                sp={sp}
                def={def}
                zoom={zoom}
                isSelected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlantId(isSelected ? null : gp.id);
                  setTool("select");
                }}
              />
            );
          })}

          {/* Hover preview for plant/row/serre/transplant tool */}
          {hoverCm && tool === "plant" && !pendingTransplant && PLANT_SPACING[selectedPlantType] && (
            <div
              className="absolute pointer-events-none border-2 border-green-500 bg-green-100/40 rounded-sm flex items-center justify-center"
              style={{
                left: hoverCm.x,
                top: hoverCm.y,
                width: PLANT_SPACING[selectedPlantType].plantSpacingCm,
                height: PLANT_SPACING[selectedPlantType].rowSpacingCm,
              }}
            >
              <span style={{ fontSize: Math.max(8, Math.min(24, 16 * zoom * 3)) }}>
                {PLANTS[selectedPlantType]?.emoji}
              </span>
            </div>
          )}

          {/* Transplant preview */}
          {hoverCm && pendingTransplant && PLANT_SPACING[pendingTransplant.plantDefId] && (
            <div
              className="absolute pointer-events-none border-2 border-emerald-500 bg-emerald-100/40 rounded-sm flex items-center justify-center"
              style={{
                left: hoverCm.x,
                top: hoverCm.y,
                width: PLANT_SPACING[pendingTransplant.plantDefId].plantSpacingCm,
                height: PLANT_SPACING[pendingTransplant.plantDefId].rowSpacingCm,
              }}
            >
              <span style={{ fontSize: Math.max(8, Math.min(24, 16 * zoom * 3)) }}>
                {pendingTransplant.plantEmoji}
              </span>
            </div>
          )}

          {/* Row preview line */}
          {hoverCm && tool === "row" && rowStart && PLANT_SPACING[selectedPlantType] && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: gardenWidthCm, height: gardenHeightCm }}
            >
              <line
                x1={rowStart.x} y1={rowStart.y}
                x2={hoverCm.x} y2={hoverCm.y}
                stroke="#16a34a" strokeWidth={3} strokeDasharray="8 4"
              />
              {/* Show plant positions along the line */}
              {(() => {
                const sp = PLANT_SPACING[selectedPlantType];
                const dx = hoverCm.x - rowStart.x;
                const dy = hoverCm.y - rowStart.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len < sp.plantSpacingCm) return null;
                const dirX = dx / len;
                const dirY = dy / len;
                const count = Math.floor(len / sp.plantSpacingCm);
                return Array.from({ length: count + 1 }, (_, i) => {
                  const px = rowStart.x + dirX * i * sp.plantSpacingCm;
                  const py = rowStart.y + dirY * i * sp.plantSpacingCm;
                  return (
                    <g key={i}>
                      <circle cx={px + sp.plantSpacingCm / 2} cy={py + sp.rowSpacingCm / 2} r={Math.min(sp.plantSpacingCm, sp.rowSpacingCm) / 2.5}
                        fill={sp.color} opacity={0.4} />
                      <rect x={px} y={py} width={sp.plantSpacingCm} height={sp.rowSpacingCm}
                        fill="none" stroke={sp.color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
                    </g>
                  );
                });
              })()}
            </svg>
          )}

          {/* Serre zone preview */}
          {hoverCm && tool === "serre" && serreStart && (
            <div
              className="absolute pointer-events-none border-2 border-cyan-500 border-dashed bg-cyan-200/30"
              style={{
                left: Math.min(serreStart.x, hoverCm.x),
                top: Math.min(serreStart.y, hoverCm.y),
                width: Math.abs(hoverCm.x - serreStart.x),
                height: Math.abs(hoverCm.y - serreStart.y),
              }}
            />
          )}

          {/* Row start marker */}
          {rowStart && tool === "row" && (
            <div
              className="absolute w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-lg pointer-events-none"
              style={{ left: rowStart.x - 6, top: rowStart.y - 6 }}
            />
          )}

          {/* Serre start marker */}
          {serreStart && tool === "serre" && (
            <div
              className="absolute w-3 h-3 bg-cyan-500 border-2 border-white rounded-full shadow-lg pointer-events-none"
              style={{ left: serreStart.x - 6, top: serreStart.y - 6 }}
            />
          )}

          {/* Garden border */}
          <div
            className="absolute inset-0 border-4 border-black/20 pointer-events-none rounded"
          />

          {/* Scale indicator */}
          {zoom >= 0.15 && (
            <>
              {/* Horizontal ruler (top) */}
              {Array.from({ length: Math.floor(gardenWidthCm / 100) }, (_, i) => (
                <div key={`rh-${i}`} className="absolute text-stone-400 pointer-events-none" style={{ left: i * 100 + 2, top: 2 }}>
                  <span style={{ fontSize: Math.max(6, 7 / zoom) }}>{i}m</span>
                </div>
              ))}
              {/* Vertical ruler (left) */}
              {Array.from({ length: Math.floor(gardenHeightCm / 100) }, (_, i) => (
                <div key={`rv-${i}`} className="absolute text-stone-400 pointer-events-none" style={{ left: 2, top: i * 100 + 2 }}>
                  <span style={{ fontSize: Math.max(6, 7 / zoom) }}>{i}m</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Cursor coordinates display */}
        {hoverCm && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-[9px] font-mono rounded-lg z-20 pointer-events-none">
            ({Math.round(hoverCm.x / 10) / 10}m, {Math.round(hoverCm.y / 10) / 10}m)
            {hoverCm.x >= 0 && hoverCm.y >= 0 && (
              <span className="ml-2 text-green-400">
                [{snapToGrid(hoverCm.x)}cm, {snapToGrid(hoverCm.y)}cm]
              </span>
            )}
          </div>
        )}
      </div>

      {/* ═══ Plant placement menu ═══ */}
      <AnimatePresence>
        {showPlantMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={() => setShowPlantMenu(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-3 border-black rounded-2xl p-4 shadow-[6px_6px_0_0_#000] max-w-xs w-full mx-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase flex items-center gap-1.5">
                  {PLANTS[selectedPlantType]?.emoji} Planter
                  <span className="text-[9px] text-stone-400">
                    à ({showPlantMenu.x}cm, {showPlantMenu.y}cm)
                  </span>
                </h3>
                <button onClick={() => setShowPlantMenu(null)} className="text-stone-400 hover:text-black font-bold text-lg">✕</button>
              </div>

              <p className="text-[9px] text-stone-500 mb-3">
                Espacement: {PLANT_SPACING[selectedPlantType]?.label} · 
                Graines: {seedCollection[selectedPlantType] || 0} · 
                Plantules prêtes: {readySeedlings.filter(s => s.plantDefId === selectedPlantType).length}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => confirmPlacePlant(showPlantMenu.x, showPlantMenu.y, true)}
                  disabled={(seedCollection[selectedPlantType] || 0) <= 0}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all
                    ${(seedCollection[selectedPlantType] || 0) > 0
                      ? "bg-green-100 border-2 border-green-400 text-green-800 hover:bg-green-200 shadow-[2px_2px_0_0_#000]"
                      : "bg-stone-50 border-2 border-stone-200 text-stone-400 cursor-not-allowed"
                    }`}
                >
                  🌱 Graine — 1 utilisé
                  <span className="ml-auto text-[9px]">
                    ({seedCollection[selectedPlantType] || 0} dispo)
                  </span>
                </button>

                {readySeedlings.filter(s => s.plantDefId === selectedPlantType).length > 0 && (
                  <button
                    onClick={() => confirmPlacePlant(showPlantMenu.x, showPlantMenu.y, false)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-200 transition-all shadow-[2px_2px_0_0_#000]"
                  >
                    🌿 Transplanter plantule
                    <span className="ml-auto text-[9px]">
                      ({readySeedlings.filter(s => s.plantDefId === selectedPlantType).length} prêtes)
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Selected plant detail panel ═══ */}
      <AnimatePresence>
        {selectedPlant && selectedPlantDef && selectedSpacing && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="overflow-hidden"
          >
            <PlantDetailPanel
              gp={selectedPlant}
              def={selectedPlantDef}
              spacing={selectedSpacing}
              inSerre={selectedInSerre}
              onClose={() => setSelectedPlantId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Legend ═══ */}
      <div className="flex flex-wrap gap-2 px-1 text-[8px] text-stone-500">
        {Object.entries(PLANT_SPACING).map(([id, sp]) => (
          <span key={id} className="flex items-center gap-1 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: sp.color }}></span>
            {PLANTS[id]?.emoji} {PLANTS[id]?.name} ({sp.label})
          </span>
        ))}
        <span className="flex items-center gap-1 px-2 py-1 bg-cyan-50 border border-cyan-200 rounded-lg">
          <span className="w-3 h-3 bg-cyan-200 border border-cyan-400 border-dashed rounded-sm inline-block"></span>
          Zone Serre 🏡
        </span>
      </div>
    </div>
  );
}

// ═══ Tool Button ═══

function ToolButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border-2 flex items-center gap-1 transition-all
        ${active
          ? "bg-black text-white border-black shadow-[2px_2px_0_0_#000]"
          : "bg-white border-stone-300 text-stone-600 hover:border-black"
        }`}
    >
      {icon} {label}
    </button>
  );
}

// ═══ Individual Garden Plant Cell ═══

function GardenPlantCell({
  gp,
  sp,
  def,
  zoom,
  isSelected,
  onClick,
}: {
  gp: import("@/store/game-store").GardenPlant;
  sp: PlantSpacingInfo;
  def: import("@/lib/ai-engine").PlantDefinition;
  zoom: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const plant = gp.plant;
  const isStunted = plant.health <= 20;

  // At very low zoom, show minimal
  if (zoom < 0.1) {
    return (
      <div
        onClick={onClick}
        className="absolute cursor-pointer transition-all"
        style={{
          left: gp.x,
          top: gp.y,
          width: sp.plantSpacingCm,
          height: sp.rowSpacingCm,
          backgroundColor: sp.color,
          borderRadius: 1,
          opacity: isStunted ? 0.4 : 0.8,
          border: isSelected ? "2px solid #000" : undefined,
          zIndex: isSelected ? 10 : 1,
        }}
      />
    );
  }

  // At medium zoom, show colored rect with emoji
  if (zoom < 0.3) {
    return (
      <div
        onClick={onClick}
        className={`absolute cursor-pointer flex items-center justify-center transition-all rounded-sm
          ${isSelected ? "ring-2 ring-black ring-offset-1 z-10" : "z-1"}`}
        style={{
          left: gp.x,
          top: gp.y,
          width: sp.plantSpacingCm,
          height: sp.rowSpacingCm,
          backgroundColor: sp.color + (isStunted ? "60" : "30"),
          border: `1px solid ${sp.color}`,
        }}
      >
        <span style={{ fontSize: Math.max(6, Math.min(14, sp.rowSpacingCm * zoom * 0.5)) }}>
          {def.emoji}
        </span>
      </div>
    );
  }

  // At higher zoom, show detailed view
  return (
    <div
      onClick={onClick}
      className={`absolute cursor-pointer transition-all rounded-sm overflow-hidden
        ${isSelected ? "ring-2 ring-black ring-offset-1 z-10" : "z-1"}
        ${isStunted ? "opacity-50 grayscale" : ""}`}
      style={{
        left: gp.x,
        top: gp.y,
        width: sp.plantSpacingCm,
        height: sp.rowSpacingCm,
        backgroundColor: sp.color + "25",
        border: `2px solid ${sp.color}`,
      }}
    >
      {/* Status badges */}
      {plant.needsWater && (
        <div className="absolute -top-0.5 -left-0.5 text-[8px] bg-blue-400 rounded-full w-2.5 h-2.5 flex items-center justify-center z-5"
          style={{ fontSize: Math.max(5, 6) }}>💧</div>
      )}
      {plant.hasDisease && (
        <div className="absolute -top-0.5 -right-0.5 text-[8px] bg-red-400 rounded-full w-2.5 h-2.5 flex items-center justify-center z-5"
          style={{ fontSize: Math.max(5, 6) }}>🦠</div>
      )}
      {plant.hasPest && (
        <div className="absolute -bottom-0.5 -left-0.5 text-[8px] bg-orange-400 rounded-full w-2.5 h-2.5 flex items-center justify-center z-5"
          style={{ fontSize: Math.max(5, 6) }}>🐛</div>
      )}
      {plant.isHarvestable && (
        <div className="absolute -top-0.5 -right-0.5 text-[8px] bg-green-400 rounded-full w-2.5 h-2.5 flex items-center justify-center z-5 animate-bounce"
          style={{ fontSize: Math.max(5, 6) }}>✨</div>
      )}

      {/* Plant emoji centered */}
      <div className="flex items-center justify-center h-full w-full">
        <span style={{ fontSize: Math.max(8, Math.min(20, Math.min(sp.plantSpacingCm, sp.rowSpacingCm) * zoom * 0.6)) }}>
          {STAGE_EMOJIS[plant.stage] || def.emoji}
        </span>
      </div>

      {/* Water bar at bottom */}
      {zoom >= 0.5 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={`h-full ${plant.waterLevel > 50 ? "bg-blue-500" : plant.waterLevel > 20 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${plant.waterLevel}%` }}
          />
        </div>
      )}

      {/* Health bar */}
      {zoom >= 0.5 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={`h-full ${plant.health > 60 ? "bg-green-500" : plant.health > 30 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${plant.health}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ═══ Plant Detail Panel ═══

function PlantDetailPanel({
  gp,
  def,
  spacing,
  inSerre,
  onClose,
}: {
  gp: import("@/store/game-store").GardenPlant;
  def: import("@/lib/ai-engine").PlantDefinition;
  spacing: PlantSpacingInfo;
  inSerre: boolean;
  onClose: () => void;
}) {
  const plant = gp.plant;
  const waterPlantGarden = useGameStore((s) => s.waterPlantGarden);
  const treatPlantGarden = useGameStore((s) => s.treatPlantGarden);
  const fertilizePlantGarden = useGameStore((s) => s.fertilizePlantGarden);
  const harvestPlantGarden = useGameStore((s) => s.harvestPlantGarden);
  const removePlantFromGarden = useGameStore((s) => s.removePlantFromGarden);
  const removeSerreZone = useGameStore((s) => s.removeSerreZone);
  const toggleSerreView = useGameStore((s) => s.toggleSerreView);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);

  const isStunted = plant.health <= 20;
  const waterColor = plant.waterLevel > 50 ? "bg-blue-500" : plant.waterLevel > 20 ? "bg-amber-500" : "bg-red-500";
  const healthColor = plant.health > 60 ? "bg-green-500" : plant.health > 30 ? "bg-amber-500" : "bg-red-500";

  // Find serre zone containing this plant
  const containingSerre = gardenSerreZones.find((z) =>
    gp.x >= z.x && gp.y >= z.y && gp.x < z.x + z.width && gp.y < z.y + z.height
  );

  return (
    <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0_0_#000]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{STAGE_EMOJIS[plant.stage] || def.emoji}</span>
          <div>
            <h3 className="text-sm font-black">{def.emoji} {def.name}</h3>
            <p className="text-[9px] text-stone-400">
              {STAGE_NAMES[plant.stage]} · J{plant.daysSincePlanting} ·
              Position: ({gp.x}cm, {gp.y}cm) · Espacement: {spacing.label}
              {inSerre && <span className="text-cyan-600 font-bold"> · 🏡 Sous serre</span>}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-black font-bold text-lg">✕</button>
      </div>

      {/* Bars */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-[8px] font-bold text-stone-500 mb-0.5">💧 Eau</p>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${waterColor}`}
              animate={{ width: `${plant.waterLevel}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-[8px] text-stone-400 text-right">{Math.round(plant.waterLevel)}%</p>
        </div>
        <div>
          <p className="text-[8px] font-bold text-stone-500 mb-0.5">❤️ Santé</p>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${healthColor}`}
              animate={{ width: `${plant.health}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-[8px] text-stone-400 text-right">{Math.round(plant.health)}%</p>
        </div>
        <div>
          <p className="text-[8px] font-bold text-stone-500 mb-0.5">📈 Croissance</p>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-amber-500"
              animate={{ width: `${plant.growthProgress}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-[8px] text-stone-400 text-right">{Math.round(plant.growthProgress)}%</p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {plant.isHarvestable && (
          <span className="px-2 py-0.5 bg-green-100 border border-green-400 rounded-lg text-[9px] font-black text-green-700 animate-pulse">
            ✨ Prêt à récolter !
          </span>
        )}
        {plant.needsWater && (
          <span className="px-2 py-0.5 bg-blue-100 border border-blue-400 rounded-lg text-[9px] font-bold text-blue-700">
            💧 Besoin d&apos;eau
          </span>
        )}
        {plant.hasDisease && (
          <span className="px-2 py-0.5 bg-red-100 border border-red-400 rounded-lg text-[9px] font-bold text-red-700">
            🦠 Malade
          </span>
        )}
        {plant.hasPest && (
          <span className="px-2 py-0.5 bg-orange-100 border border-orange-400 rounded-lg text-[9px] font-bold text-orange-700">
            🐛 Ravageurs
          </span>
        )}
        {isStunted && (
          <span className="px-2 py-0.5 bg-amber-100 border border-amber-400 rounded-lg text-[9px] font-bold text-amber-700">
            ⚠️ Survie
          </span>
        )}
        {plant.fertilizerBoost > 0 && (
          <span className="px-2 py-0.5 bg-violet-100 border border-violet-400 rounded-lg text-[9px] font-bold text-violet-700">
            🧪 Engrais ({plant.fertilizerBoost}j)
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {!plant.isHarvestable && (
          <button
            onClick={() => waterPlantGarden(gp.id)}
            className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-black rounded-xl border-2 border-blue-700 shadow-[2px_2px_0_0_#000] hover:bg-blue-400 flex items-center gap-1"
          >
            <Droplets className="w-3 h-3" /> Arroser
          </button>
        )}
        {(plant.hasDisease || plant.hasPest) && (
          <button
            onClick={() => treatPlantGarden(gp.id)}
            className="px-3 py-1.5 bg-pink-500 text-white text-[10px] font-black rounded-xl border-2 border-pink-700 shadow-[2px_2px_0_0_#000] hover:bg-pink-400 flex items-center gap-1"
          >
            <Pill className="w-3 h-3" /> Soigner
          </button>
        )}
        <button
          onClick={() => fertilizePlantGarden(gp.id)}
          className="px-3 py-1.5 bg-violet-500 text-white text-[10px] font-black rounded-xl border-2 border-violet-700 shadow-[2px_2px_0_0_#000] hover:bg-violet-400 flex items-center gap-1"
        >
          <FlaskRound className="w-3 h-3" /> Engrais
        </button>
        {plant.isHarvestable && (
          <button
            onClick={() => { harvestPlantGarden(gp.id); onClose(); }}
            className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-xl border-2 border-green-700 shadow-[2px_2px_0_0_#000] hover:bg-green-400 flex items-center gap-1"
          >
            <Scissors className="w-3 h-3" /> Récolter
          </button>
        )}
        {containingSerre && (
          <button
            onClick={() => removeSerreZone(containingSerre.id)}
            className="px-3 py-1.5 bg-cyan-100 text-cyan-700 text-[10px] font-black rounded-xl border-2 border-cyan-300 shadow-[2px_2px_0_0_#000] hover:bg-cyan-200 flex items-center gap-1"
          >
            <Home className="w-3 h-3" /> Retirer Serre
          </button>
        )}
        <button
          onClick={() => { removePlantFromGarden(gp.id); onClose(); }}
          className="px-3 py-1.5 bg-red-100 text-red-600 text-[10px] font-black rounded-xl border-2 border-red-300 shadow-[2px_2px_0_0_#000] hover:bg-red-200 flex items-center gap-1 ml-auto"
        >
          ✕ Supprimer
        </button>
      </div>
    </div>
  );
}
