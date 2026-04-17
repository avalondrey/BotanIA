'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, DEFAULT_GARDEN_WIDTH_CM, DEFAULT_GARDEN_HEIGHT_CM } from '@/store/game-store';
import { PLANTS } from '@/lib/ai-engine';
import { useAgroData, type PlantAgroData } from '@/hooks/useAgroData';
import { useMissingSprites } from '@/hooks/useMissingSprites';
import type { SeedRow } from './SeedRowPainter';

interface GardenPlanViewProps {
  seedRows?: SeedRow[];
  activeTool?: string;
  editMode?: 'place' | 'select';
  onToolUsed?: () => void;
  onSelectElement?: (type: string, id: string) => void;
  onEditModeChange?: (mode: 'place' | 'select') => void;
  gridSnap?: 'off' | '25' | '50' | '100';
  onGridSnapChange?: (snap: 'off' | '25' | '50' | '100') => void;
  showGrid?: 'full' | 'major' | 'hidden';
  onShowGridChange?: (show: 'full' | 'major' | 'hidden') => void;
}

const BASE_SCALE = 0.65; // fallback scale

const TOOL_SIZES: Record<string, { w: number; h: number }> = {
  serre: { w: 600, h: 400 },
  tree:  { w: 150, h: 150 },
  hedge: { w: 300, h: 60  },
  tank:  { w: 120, h: 100 },
  drum:  { w: 60,  h: 90  },
  shed:  { w: 200, h: 180 },
  zone:  { w: 300, h: 200 },
};

const GardenPlanView: React.FC<GardenPlanViewProps> = ({
  seedRows = [],
  activeTool = 'none',
  editMode = 'place',
  onToolUsed,
  onSelectElement,
  onEditModeChange,
  gridSnap: gridSnapProp = 'off',
  onGridSnapChange,
  showGrid: showGridProp = 'full',
  onShowGridChange,
}) => {
  const gardenPlants     = useGameStore((s) => s.gardenPlants);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const gardenHedges     = useGameStore((s) => (s as any).gardenHedges || []);
  const gardenTanks      = useGameStore((s) => (s as any).gardenTanks || []);
  const gardenDrums      = useGameStore((s) => (s as any).gardenDrums || []);
  const gardenSheds      = useGameStore((s) => (s as any).gardenSheds || []);
  const gardenZones      = useGameStore((s) => (s as any).gardenZones || []);
  const gardenTrees      = useGameStore((s) => (s as any).gardenTrees || []);
  const gardenWidthCm    = useGameStore((s) => (s as any).gardenWidthCm  ?? DEFAULT_GARDEN_WIDTH_CM);
  const gardenHeightCm   = useGameStore((s) => (s as any).gardenHeightCm ?? DEFAULT_GARDEN_HEIGHT_CM);
  const setActiveTab     = useGameStore((s) => s.setActiveTab);
  const addSerreZone     = useGameStore((s) => s.addSerreZone);
  const moveSerreZone    = useGameStore((s) => (s as any).moveSerreZone as (id: string, x: number, y: number) => void);
  const moveGardenPlant  = useGameStore((s) => (s as any).moveGardenPlant as (id: string, x: number, y: number) => void);
  const moveGardenHedge  = useGameStore((s) => (s as any).moveGardenHedge as (id: string, x: number, y: number) => void);
  const moveGardenTank   = useGameStore((s) => (s as any).moveGardenTank as (id: string, x: number, y: number) => void);
  const moveGardenDrum   = useGameStore((s) => (s as any).moveGardenDrum as (id: string, x: number, y: number) => void);
  const moveGardenTree   = useGameStore((s) => (s as any).moveGardenTree as (id: string, x: number, y: number) => void);
  const moveGardenZone   = useGameStore((s) => (s as any).moveGardenZone as (id: string, x: number, y: number) => void);
  const resizeGardenZone = useGameStore((s) => (s as any).resizeGardenZone as (id: string, x: number, y: number, w: number, h: number) => void);
  const addGardenZone    = useGameStore((s) => (s as any).addGardenZone as (x: number, y: number, w: number, h: number, type?: string) => void);
  const removeGardenShed  = useGameStore((s) => (s as any).removeGardenShed as (id: string) => void);
  const moveGardenShed    = useGameStore((s) => (s as any).moveGardenShed as (id: string, x: number, y: number) => void);
  const removeGardenTank = useGameStore((s) => (s as any).removeGardenTank as (id: string) => void);
  const removeGardenDrum = useGameStore((s) => (s as any).removeGardenDrum as (id: string) => void);
  const removeGardenTree = useGameStore((s) => (s as any).removeGardenTree as (id: string) => void);
  const removeGardenHedge = useGameStore((s) => (s as any).removeGardenHedge as (id: string) => void);
  const removeGardenZone = useGameStore((s) => (s as any).removeGardenZone as (id: string) => void);
  const removeSerreZone  = useGameStore((s) => (s as any).removeSerreZone as (id: string) => void);
  const coins            = useGameStore((s) => s.coins);
  const addGardenDrum    = useGameStore((s) => (s as any).addGardenDrum as (x: number, y: number) => void);
  const addGardenTree    = useGameStore((s) => (s as any).addGardenTree as (x: number, y: number, type?: string) => void);
  const addGardenHedge   = useGameStore((s) => (s as any).addGardenHedge as (x: number, y: number, w?: number, orient?: string) => void);
  const addGardenTank    = useGameStore((s) => (s as any).addGardenTank as (x: number, y: number, cap?: number) => void);
  const addGardenShed    = useGameStore((s) => (s as any).addGardenShed as (x: number, y: number) => void);
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const agro             = useAgroData();
  const { reportMissing } = useMissingSprites();

  // ── Dynamic zoom: scale grid to fit container width ──
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGridLocal, setShowGridLocal] = useState<'full' | 'major' | 'hidden'>('full');
  const [gridSnapLocal, setGridSnapLocal] = useState<'off' | '25' | '50' | '100'>('off');
  const showGrid = onShowGridChange ? showGridProp : showGridLocal;
  const gridSnap = onGridSnapChange ? gridSnapProp : gridSnapLocal;
  const setShowGrid = onShowGridChange ?? setShowGridLocal;
  const setGridSnap = onGridSnapChange ?? setGridSnapLocal;
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // ── Alignment mode ──
  const [alignMode, setAlignMode] = useState(false);
  const [alignSelection, setAlignSelection] = useState<Array<{ type: string; id: string }>>([]);
  type AlignAxis = 'x' | 'y';
  type AlignType = 'left' | 'center' | 'right' | 'even';

  const toggleAlignMode = () => {
    setAlignMode(m => !m);
    setAlignSelection([]);
  };

  const getElemsForAlign = () => {
    const out: Array<{ type: string; id: string; x: number; y: number; w: number; h: number }> = [];
    for (const s of alignSelection) {
      if (s.type === 'plant') {
        const gp = gardenPlants.find(g => g.id === s.id);
        if (gp) out.push({ type: 'plant', id: gp.id, x: gp.x, y: gp.y, w: 80, h: 80 });
      } else if (s.type === 'zone') {
        const z = gardenZones.find((z: { id: string }) => z.id === s.id);
        if (z) out.push({ type: 'zone', id: z.id, x: z.x, y: z.y, w: z.width, h: z.height });
      } else if (s.type === 'serre') {
        const sr = gardenSerreZones.find((sr: { id: string }) => sr.id === s.id);
        if (sr) out.push({ type: 'serre', id: sr.id, x: sr.x, y: sr.y, w: sr.width, h: sr.height });
      } else if (s.type === 'tree') {
        const tr = gardenTrees.find((tr: { id: string }) => tr.id === s.id);
        if (tr) out.push({ type: 'tree', id: tr.id, x: tr.x - (tr.diameter ?? 75) / 2, y: tr.y - (tr.diameter ?? 75) / 2, w: tr.diameter ?? 75, h: tr.diameter ?? 75 });
      } else if (s.type === 'tank') {
        const t = gardenTanks.find((t: { id: string }) => t.id === s.id);
        if (t) out.push({ type: 'tank', id: t.id, x: t.x, y: t.y, w: t.width, h: t.height });
      } else if (s.type === 'shed') {
        const sh = gardenSheds.find((sh: { id: string }) => sh.id === s.id);
        if (sh) out.push({ type: 'shed', id: sh.id, x: sh.x, y: sh.y, w: sh.width, h: sh.height });
      } else if (s.type === 'drum') {
        const d = gardenDrums.find((d: { id: string }) => d.id === s.id);
        if (d) out.push({ type: 'drum', id: d.id, x: d.x, y: d.y, w: d.width, h: d.height });
      } else if (s.type === 'hedge') {
        const h = gardenHedges.find((h: { id: string }) => h.id === s.id);
        if (h) out.push({ type: 'hedge', id: h.id, x: h.x, y: h.y, w: h.width, h: h.height });
      }
    }
    return out;
  };

  const applyAlign = (axis: AlignAxis, type: AlignType) => {
    const elems = getElemsForAlign();
    if (elems.length < 2) return;
    if (axis === 'x') {
      const sorted = [...elems].sort((a, b) => a.x - b.x);
      if (type === 'left') {
        const minX = sorted[0].x;
        sorted.forEach(e => {
          if (e.type === 'plant') moveGardenPlant?.(e.id, minX, e.y);
          else if (e.type === 'zone') moveGardenZone?.(e.id, minX, e.y);
          else if (e.type === 'serre') moveSerreZone?.(e.id, minX, e.y);
          else if (e.type === 'tree') moveGardenTree?.(e.id, minX + e.w / 2, e.y + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, minX, e.y);
          else if (e.type === 'shed') moveGardenShed?.(e.id, minX, e.y);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, minX, e.y);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, minX, e.y);
        });
      } else if (type === 'right') {
        const maxX = Math.max(...sorted.map(e => e.x + e.w));
        sorted.forEach(e => {
          const nx = maxX - e.w;
          if (e.type === 'plant') moveGardenPlant?.(e.id, nx, e.y);
          else if (e.type === 'zone') moveGardenZone?.(e.id, nx, e.y);
          else if (e.type === 'serre') moveSerreZone?.(e.id, nx, e.y);
          else if (e.type === 'tree') moveGardenTree?.(e.id, nx + e.w / 2, e.y + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, nx, e.y);
          else if (e.type === 'shed') moveGardenShed?.(e.id, nx, e.y);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, nx, e.y);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, nx, e.y);
        });
      } else if (type === 'center') {
        const minX = sorted[0].x + sorted[0].w / 2;
        const maxX = Math.max(...sorted.map(e => e.x + e.w / 2));
        const span = maxX - minX;
        sorted.forEach((e, i) => {
          const nc = minX + (span * i) / (sorted.length - 1) - e.w / 2;
          if (e.type === 'plant') moveGardenPlant?.(e.id, nc, e.y);
          else if (e.type === 'zone') moveGardenZone?.(e.id, nc, e.y);
          else if (e.type === 'serre') moveSerreZone?.(e.id, nc, e.y);
          else if (e.type === 'tree') moveGardenTree?.(e.id, nc + e.w / 2, e.y + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, nc, e.y);
          else if (e.type === 'shed') moveGardenShed?.(e.id, nc, e.y);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, nc, e.y);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, nc, e.y);
        });
      } else if (type === 'even') {
        const minX = sorted[0].x;
        const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].w;
        const step = (maxX - minX) / (sorted.length - 1);
        sorted.forEach((e, i) => {
          const nx = i === sorted.length - 1 ? maxX - e.w : minX + Math.round(step * i);
          if (e.type === 'plant') moveGardenPlant?.(e.id, nx, e.y);
          else if (e.type === 'zone') moveGardenZone?.(e.id, nx, e.y);
          else if (e.type === 'serre') moveSerreZone?.(e.id, nx, e.y);
          else if (e.type === 'tree') moveGardenTree?.(e.id, nx + e.w / 2, e.y + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, nx, e.y);
          else if (e.type === 'shed') moveGardenShed?.(e.id, nx, e.y);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, nx, e.y);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, nx, e.y);
        });
      }
    } else {
      // axis === 'y'
      const sorted = [...elems].sort((a, b) => a.y - b.y);
      if (type === 'left') {
        const minY = sorted[0].y;
        sorted.forEach(e => {
          if (e.type === 'plant') moveGardenPlant?.(e.id, e.x, minY);
          else if (e.type === 'zone') moveGardenZone?.(e.id, e.x, minY);
          else if (e.type === 'serre') moveSerreZone?.(e.id, e.x, minY);
          else if (e.type === 'tree') moveGardenTree?.(e.id, e.x + e.w / 2, minY + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, e.x, minY);
          else if (e.type === 'shed') moveGardenShed?.(e.id, e.x, minY);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, e.x, minY);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, e.x, minY);
        });
      } else if (type === 'right') {
        const maxY = Math.max(...sorted.map(e => e.y + e.h));
        sorted.forEach(e => {
          const ny = maxY - e.h;
          if (e.type === 'plant') moveGardenPlant?.(e.id, e.x, ny);
          else if (e.type === 'zone') moveGardenZone?.(e.id, e.x, ny);
          else if (e.type === 'serre') moveSerreZone?.(e.id, e.x, ny);
          else if (e.type === 'tree') moveGardenTree?.(e.id, e.x + e.w / 2, ny + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, e.x, ny);
          else if (e.type === 'shed') moveGardenShed?.(e.id, e.x, ny);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, e.x, ny);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, e.x, ny);
        });
      } else if (type === 'center') {
        const minY = sorted[0].y + sorted[0].h / 2;
        const maxY = Math.max(...sorted.map(e => e.y + e.h / 2));
        const span = maxY - minY;
        sorted.forEach((e, i) => {
          const nc = minY + (span * i) / (sorted.length - 1) - e.h / 2;
          if (e.type === 'plant') moveGardenPlant?.(e.id, e.x, nc);
          else if (e.type === 'zone') moveGardenZone?.(e.id, e.x, nc);
          else if (e.type === 'serre') moveSerreZone?.(e.id, e.x, nc);
          else if (e.type === 'tree') moveGardenTree?.(e.id, e.x + e.w / 2, nc + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, e.x, nc);
          else if (e.type === 'shed') moveGardenShed?.(e.id, e.x, nc);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, e.x, nc);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, e.x, nc);
        });
      } else if (type === 'even') {
        const minY = sorted[0].y;
        const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].h;
        const step = (maxY - minY) / (sorted.length - 1);
        sorted.forEach((e, i) => {
          const ny = i === sorted.length - 1 ? maxY - e.h : minY + Math.round(step * i);
          if (e.type === 'plant') moveGardenPlant?.(e.id, e.x, ny);
          else if (e.type === 'zone') moveGardenZone?.(e.id, e.x, ny);
          else if (e.type === 'serre') moveSerreZone?.(e.id, e.x, ny);
          else if (e.type === 'tree') moveGardenTree?.(e.id, e.x + e.w / 2, ny + e.h / 2);
          else if (e.type === 'tank') moveGardenTank?.(e.id, e.x, ny);
          else if (e.type === 'shed') moveGardenShed?.(e.id, e.x, ny);
          else if (e.type === 'drum') moveGardenDrum?.(e.id, e.x, ny);
          else if (e.type === 'hedge') moveGardenHedge?.(e.id, e.x, ny);
        });
      }
    }
    setAlignSelection([]);
    setAlignMode(false);
  };

  const toggleAlignSelect = (type: string, id: string) => {
    setAlignSelection(prev => {
      const exists = prev.find(s => s.type === type && s.id === id);
      if (exists) return prev.filter(s => !(s.type === type && s.id === id));
      return [...prev, { type, id }];
    });
  };

  const isAlignSelected = (type: string, id: string) =>
    alignSelection.some(s => s.type === type && s.id === id);

  // Snap function
  const snapCm = (cm: number): number => {
    if (gridSnap === 'off') return cm;
    const step = parseInt(gridSnap); // 25, 50, or 100
    return Math.round(cm / step) * step;
  };

  // Auto-fit: fill container width at zoomLevel=1
  const displayScale = containerWidth > 0
    ? (containerWidth / gardenWidthCm) * zoomLevel
    : BASE_SCALE;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Drag state ──
  const dragRef = useRef<{
    type: 'serre' | 'plant' | 'hedge' | 'tank' | 'drum' | 'shed' | 'tree' | 'zone' | 'zone_hedge' | 'zone_water';
    id: string;
    startMouseX: number;
    startMouseY: number;
    startObjX: number;   // position initiale en cm
    startObjY: number;
    active: boolean;
  } | null>(null);
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ type: string; id: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: string; id: string } | null>(null);

  // ── Dessin de zone par glisser ──
  type ZoneDrawState = { startX: number; startY: number; curX: number; curY: number; zoneType: 'uncultivated' | 'hedge' | 'water_recovery' | 'grass' | 'fleur' } | null;
  const [drawingZone, setDrawingZone] = useState<ZoneDrawState>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const getZoneRect = (d: ZoneDrawState) => {
    if (!d) return null;
    const x = Math.min(d.startX, d.curX);
    const y = Math.min(d.startY, d.curY);
    const w = Math.abs(d.curX - d.startX);
    const h = Math.abs(d.curY - d.startY);
    return { x, y, w, h };
  };

  // ── Tooltip portal ──
  const [tooltip, setTooltip] = useState<{
    agroData: PlantAgroData;
    plantName: string;
    x: number;
    y: number;
  } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref pour éviter la stale closure dans le handler drag
  const dragPosRef = useRef<{ id: string; x: number; y: number } | null>(null);
  useEffect(() => { dragPosRef.current = dragPos; }, [dragPos]);

  // Cleanup du timer tooltip au unmount
  useEffect(() => {
    return () => { if (tooltipTimer.current) clearTimeout(tooltipTimer.current); };
  }, []);

  const displayW = Math.round(gardenWidthCm  * displayScale);
  const displayH = Math.round(gardenHeightCm * displayScale);

  const getStageSprite = (plantDefId: string, stage: number) =>
    `/plants/${plantDefId}-stage-${Math.min(stage, 6)}.png`;

  const getWaterColor = (level: number) => {
    if (level > 60) return '#4ecdc4';
    if (level > 30) return '#f9d423';
    return '#ff6b6b';
  };


  // ── Placement par clic (outil actif) ──────────────────────────────────────
  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none') return;
    if (dragRef.current?.active) return; // ignore click après un drag
    const rect = e.currentTarget.getBoundingClientRect();
    const cmX = snapCm(Math.round((e.clientX - rect.left) / displayScale));
    const cmY = snapCm(Math.round((e.clientY - rect.top)  / displayScale));

    if (activeTool === 'serre') {
      const { w, h } = TOOL_SIZES.serre;
      const ok = addSerreZone(cmX - w / 2, cmY - h / 2, w, h, 500);
      if (!ok) alert('Pas assez de pièces ou zone invalide !');
      else onToolUsed?.();
    } else if (activeTool === 'tree' && addGardenTree) {
      addGardenTree(cmX, cmY);
      onToolUsed?.();
    } else if (activeTool === 'hedge' && addGardenHedge) {
      const { w } = TOOL_SIZES.hedge;
      addGardenHedge(cmX, cmY, w, 'horizontal');
      onToolUsed?.();
    } else if (activeTool === 'tank' && addGardenTank) {
      addGardenTank(cmX, cmY);
      onToolUsed?.();
    } else if (activeTool === 'drum' && addGardenDrum) {
      addGardenDrum(cmX, cmY);
      onToolUsed?.();
    } else if (activeTool === 'shed' && addGardenShed) {
      addGardenShed(cmX, cmY);
      onToolUsed?.();
    } else if (activeTool === 'zone' && addGardenZone) {
      const { w, h } = TOOL_SIZES.zone;
      addGardenZone(cmX - w / 2, cmY - h / 2, w, h, 'uncultivated');
      onToolUsed?.();
    } else if (activeTool === 'zone_hedge' && addGardenZone) {
      const { w, h } = TOOL_SIZES.zone;
      addGardenZone(cmX - w / 2, cmY - h / 2, w, h, 'hedge');
      onToolUsed?.();
    } else if (activeTool === 'zone_water' && addGardenZone) {
      const { w, h } = TOOL_SIZES.zone;
      addGardenZone(cmX - w / 2, cmY - h / 2, w, h, 'water_recovery');
      onToolUsed?.();
    } else if (activeTool === 'zone_grass' && addGardenZone) {
      const { w, h } = TOOL_SIZES.zone;
      addGardenZone(cmX - w / 2, cmY - h / 2, w, h, 'grass');
      onToolUsed?.();
    } else if (activeTool === 'zone_fleur' && addGardenZone) {
      const { w, h } = TOOL_SIZES.zone;
      addGardenZone(cmX - w / 2, cmY - h / 2, w, h, 'fleur');
      onToolUsed?.();
    }
  }, [activeTool, addSerreZone, addGardenTree, addGardenHedge, addGardenTank, addGardenDrum, addGardenShed, addGardenZone, onToolUsed]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const startDrag = useCallback((
    e: React.MouseEvent,
    type: 'serre' | 'plant' | 'hedge' | 'tank' | 'drum' | 'shed' | 'tree' | 'zone',
    id: string,
    objXcm: number,
    objYcm: number
  ) => {
    // Pas de drag si un outil de placement est actif
    if (activeTool !== 'none') return;
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      type, id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startObjX: objXcm,
      startObjY: objYcm,
      active: false,
    };
    setTooltip(null);
  }, [activeTool]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startMouseX;
      const dy = e.clientY - dragRef.current.startMouseY;
      if (!dragRef.current.active && Math.hypot(dx, dy) < 4) return;
      dragRef.current.active = true;
      const newX = snapCm(Math.max(0, dragRef.current.startObjX + dx / displayScale));
      const newY = snapCm(Math.max(0, dragRef.current.startObjY + dy / displayScale));
      setDragPos({ id: dragRef.current.id, x: newX, y: newY });
    };
    const onUp = () => {
      if (!dragRef.current) return;
      const pos = dragPosRef.current;
      if (dragRef.current.active && pos) {
        if (dragRef.current.type === 'serre') {
          moveSerreZone?.(dragRef.current.id, pos.x, pos.y);
        } else if (dragRef.current.type === 'plant') {
          moveGardenPlant?.(dragRef.current.id, pos.x, pos.y);
        } else if (dragRef.current.type === 'hedge') {
          moveGardenHedge?.(dragRef.current.id, pos.x, pos.y);
        } else if (dragRef.current.type === 'tank') {
          moveGardenTank?.(dragRef.current.id, pos.x, pos.y);
        } else if (dragRef.current.type === 'drum') {
          moveGardenDrum?.(dragRef.current.id, pos.x, pos.y);
        } else if (dragRef.current.type === 'shed') {
          moveGardenShed?.(dragRef.current.id, pos.x, pos.y);
        } else if (dragRef.current.type === 'tree') {
          moveGardenTree?.(dragRef.current.id, pos.x, pos.y);
        } else if (dragRef.current.type === 'zone') {
          moveGardenZone?.(dragRef.current.id, pos.x, pos.y);
        }
      }
      dragRef.current = null;
      setDragPos(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragPos, moveSerreZone, moveGardenPlant, moveGardenHedge, moveGardenTank, moveGardenDrum, moveGardenShed, moveGardenTree, moveGardenZone]);

  // ── Context menu ──
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);


  // ── Canvas overlay rangs ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = displayW;
    canvas.height = displayH;
    ctx.clearRect(0, 0, displayW, displayH);
    if (!seedRows || seedRows.length === 0) return;
    for (const row of seedRows) {
      if (row.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = row.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = row.color; ctx.shadowBlur = 8;
      ctx.setLineDash([8, 5]);
      ctx.moveTo(row.points[0].x * displayW, row.points[0].y * displayH);
      for (let i = 1; i < row.points.length; i++)
        ctx.lineTo(row.points[i].x * displayW, row.points[i].y * displayH);
      ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(row.points[0].x * displayW, row.points[0].y * displayH, 5, 0, Math.PI * 2);
      ctx.fillStyle = row.color; ctx.fill();
      if (row.label) {
        const mid = row.points[Math.floor(row.points.length / 2)];
        ctx.save();
        ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4;
        ctx.fillText(row.label, mid.x * displayW + 6, mid.y * displayH - 6);
        ctx.restore();
      }
    }
  }, [seedRows, displayW, displayH]);


  const toolSize = activeTool !== 'none' ? TOOL_SIZES[activeTool] : null;

  return (
    <div className="plan-view-container" ref={containerRef}>
      {/* Info dimensions + zoom + coordonnées */}
      <div className="garden-dims-bar">
        <span>🗺️ {(gardenWidthCm/100).toFixed(0)}m × {(gardenHeightCm/100).toFixed(0)}m</span>
        <span>({(gardenWidthCm*gardenHeightCm/10000).toFixed(0)} m²)</span>
        <span className="dims-scale">1:{Math.round(1/displayScale)}</span>

        {/* Coordonnées au survol */}
        {hoverCoords && (
          <span className="dims-coords">X:{hoverCoords.x} Y:{hoverCoords.y} cm</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <button onClick={() => setZoomLevel(z => Math.max(0.2, +(z - 0.1).toFixed(1)))}
            style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>−</button>
          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(z => Math.min(3, +(z + 0.1).toFixed(1)))}
            style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>+</button>
          <button onClick={() => setZoomLevel(1)}
            style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid #ccc', background: '#f0fdf4', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>Ajuster</button>
        </div>
        {activeTool !== 'none' && (
          <span className="dims-tool-active">
            ✏️ Mode placement : {activeTool} — cliquez sur la grille
          </span>
        )}

        {alignMode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', border: '1px solid #a855f7', padding: '2px 8px', borderRadius: 6 }}>
              🎯 Aligner ({alignSelection.length} sélectionné{alignSelection.length > 1 ? 's' : ''})
            </span>
            <span style={{ fontSize: 10, color: '#6b7280' }}>Axe:</span>
            <button onClick={() => applyAlign('x', 'left')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>← Gauche</button>
            <button onClick={() => applyAlign('x', 'center')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>↔ Centre X</button>
            <button onClick={() => applyAlign('x', 'right')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>Droite →</button>
            <button onClick={() => applyAlign('x', 'even')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>⤓ Espacer X</button>
            <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 4 }}>|</span>
            <button onClick={() => applyAlign('y', 'left')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>↑ Haut</button>
            <button onClick={() => applyAlign('y', 'center')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>↕ Centre Y</button>
            <button onClick={() => applyAlign('y', 'right')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>Bas ↓</button>
            <button onClick={() => applyAlign('y', 'even')} disabled={alignSelection.length < 2} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: alignSelection.length < 2 ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 600, opacity: alignSelection.length < 2 ? 0.4 : 1 }}>⤓ Espacer Y</button>
            <button onClick={toggleAlignMode} style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#dc2626' }}>✕ Annuler</button>
          </div>
        ) : (
          <button
            onClick={toggleAlignMode}
            style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: '1px solid #7c3aed', background: '#f3e8ff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#7c3aed' }}
            title="Aligner plusieurs éléments"
          >
            🎯 Aligner
          </button>
        )}
      </div>

      {/* Grille scrollable */}
      <div style={{ position: 'relative' }}>

        /* Règle horizontale (haut) */
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: displayW,
          height: 20,
          display: 'flex',
          borderBottom: '1px solid #666',
          zIndex: 10,
          background: 'rgba(250,248,244,0.95)',
          pointerEvents: 'none',
        }}>
          {Array.from({ length: Math.ceil(gardenWidthCm / 100) + 1 }).map((_, i) => (
            <div key={`h-${i}`} style={{
              flex: '1 0 ' + (100 * displayScale) + 'px',
              borderLeft: i === 0 ? 'none' : '1px solid #999',
              fontSize: 10,
              color: '#666',
              paddingLeft: 2
            }}>
              {i}m
            </div>
          ))}
        </div>

        {/* Règle verticale (droite) */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 40,
          height: displayH,
          borderLeft: '1px solid #666',
          zIndex: 10,
          background: 'rgba(250,248,244,0.95)',
          pointerEvents: 'none',
          paddingTop: 20,
          boxSizing: 'border-box',
        }}>
          {Array.from({ length: Math.ceil(gardenHeightCm / 100) + 1 }).map((_, i) => (
            <div key={`v-${i}`} style={{
              position: 'absolute',
              top: i * 100 * displayScale,
              left: 0,
              width: 40,
              borderTop: i === 0 ? 'none' : '1px solid #999',
              fontSize: 10,
              color: '#666',
              paddingTop: 1,
              textAlign: 'center',
            }}>
              {i}m
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          className={`garden-grid${showGrid === 'hidden' ? ' grid-hidden' : showGrid === 'major' ? ' grid-minor-hidden' : ''}`}
          style={{
            width: displayW,
            height: displayH,
            /* 4 couches : majeures H, majeures V, mineures H, mineures V */
            backgroundSize: [
              `${100 * displayScale}px ${100 * displayScale}px`,
              `${100 * displayScale}px ${100 * displayScale}px`,
              `${25 * displayScale}px ${25 * displayScale}px`,
              `${25 * displayScale}px ${25 * displayScale}px`,
            ].join(', '),
            flexShrink: 0,
            cursor: activeTool !== 'none' ? 'crosshair' : 'default',
          }}
          onMouseDown={(e) => {
            if (activeTool === 'none') return;
            const rect = e.currentTarget.getBoundingClientRect();
            const cmX = snapCm(Math.round((e.clientX - rect.left) / displayScale));
            const cmY = snapCm(Math.round((e.clientY - rect.top) / displayScale));
            if (activeTool === 'zone' || activeTool === 'zone_hedge' || activeTool === 'zone_water' || activeTool === 'zone_grass' || activeTool === 'zone_fleur') {
              e.stopPropagation();
              setDrawingZone({
                startX: cmX,
                startY: cmY,
                curX: cmX,
                curY: cmY,
                zoneType: activeTool === 'zone' ? 'uncultivated' : activeTool === 'zone_hedge' ? 'hedge' : activeTool === 'zone_water' ? 'water_recovery' : activeTool === 'zone_grass' ? 'grass' : 'fleur',
              });
            }
          }}
          onMouseMove={(e) => {
            const rect = gridRef.current?.getBoundingClientRect();
            if (!rect) return;
            const cmX = Math.round((e.clientX - rect.left) / displayScale);
            const cmY = Math.round((e.clientY - rect.top) / displayScale);
            setHoverCoords({ x: cmX, y: cmY });
            if (!drawingZone) return;
            setDrawingZone(d => d ? { ...d, curX: cmX, curY: cmY } : null);
          }}
          onMouseLeave={() => setHoverCoords(null)}
          onMouseUp={() => {
            if (!drawingZone) return;
            const rect = getZoneRect(drawingZone);
            if (rect && rect.w > 20 && rect.h > 20) {
              addGardenZone?.(rect.x, rect.y, rect.w, rect.h, drawingZone.zoneType);
              onToolUsed?.();
            }
            setDrawingZone(null);
          }}
          onClick={(e) => {
            // Clic simple : ne place que si pas en train de dessiner
            if (drawingZone || activeTool === 'none') return;
            if (activeTool !== 'zone' && activeTool !== 'zone_hedge' && activeTool !== 'zone_water' && activeTool !== 'zone_grass' && activeTool !== 'zone_fleur') {
              handleGridClick(e as any);
            }
          }}
          onWheel={(e) => {
            e.preventDefault();
            setZoomLevel(z => Math.max(0.2, Math.min(3, +(z + (e.deltaY < 0 ? 0.08 : -0.08)).toFixed(2))));
          }}
        >

          {/* SERRES — draggables */}
          {gardenSerreZones && gardenSerreZones.map((serre) => {
            const isDragging = dragPos?.id === serre.id;
            const px = (isDragging ? dragPos!.x : serre.x) * displayScale;
            const py = (isDragging ? dragPos!.y : serre.y) * displayScale;
            return (
              <div key={serre.id}
                style={{
                  position: 'absolute',
                  left: px, top: py,
                  width: serre.width * displayScale,
                  height: serre.height * displayScale,
                  cursor: activeTool === 'none' ? 'grab' : 'default',
                  userSelect: 'none',
                  backgroundImage: 'url(/greenhouse-sprite.png)',
                  backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                  border: isDragging ? '2px dashed #4caf50' : isAlignSelected('serre', serre.id) ? '3px solid #a855f7' : '2px solid rgba(76,175,80,0.5)',
                  borderRadius: 8,
                  boxShadow: isDragging ? '0 8px 24px rgba(76,175,80,0.6)' : isAlignSelected('serre', serre.id) ? '0 0 0 4px rgba(168,85,247,0.3)' : undefined,
                  zIndex: isDragging ? 500 : 3,
                  opacity: isDragging ? 0.85 : 1,
                  transition: isDragging ? 'none' : 'box-shadow .2s',
                }}
                onMouseDown={(e) => {
                  if (alignMode) { e.stopPropagation(); toggleAlignSelect('serre', serre.id); return; }
                  startDrag(e, 'serre', serre.id, serre.x, serre.y);
                }}
                onClick={(e) => {
                  if (dragRef.current?.active) { e.stopPropagation(); return; }
                  e.stopPropagation();
                  if (alignMode) { toggleAlignSelect('serre', serre.id); return; }
                  if (editMode === 'select') { setSelectedElement({ type: 'serre', id: serre.id }); onSelectElement?.('serre', serre.id); }
                  else setActiveTab('serre');
                }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'serre', id: serre.id }); }}
                title="Glisser pour déplacer · Cliquer pour entrer dans la serre"
              >
                {selectedElement?.id === serre.id && selectedElement?.type === 'serre' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSerreZone?.(serre.id); setSelectedElement(null); }}
                    style={{ position:'absolute', top:-32, right:0, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:700, zIndex:9999 }}
                  >
                    🗑️ Supprimer
                  </button>
                )}
                <div style={{ position:'absolute', bottom:-20, left:'50%', transform:'translateX(-50%)',
                  fontSize:10, fontWeight:700, color:'#2e7d32', whiteSpace:'nowrap',
                  background:'rgba(255,255,255,.8)', borderRadius:4, padding:'1px 6px' }}>
                  🏡 Serre {activeTool === 'none' ? '⟺' : ''}
                </div>
              </div>
            );
          })}

          {/* ZONES NON CULTIVÉES */}
          {gardenZones.map((zone: any) => (
            <div key={zone.id}
              onMouseDown={(e) => { if (alignMode) { e.stopPropagation(); toggleAlignSelect('zone', zone.id); return; } e.stopPropagation(); startDrag(e, 'zone', zone.id, zone.x, zone.y); }}
              onClick={(e) => { e.stopPropagation(); if (alignMode) { toggleAlignSelect('zone', zone.id); return; } if (editMode === 'select') { setSelectedElement({ type: 'zone', id: zone.id }); onSelectElement?.('zone', zone.id); } }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'zone', id: zone.id }); }}
              style={{
                position: 'absolute',
                left: zone.x * displayScale,
                top: zone.y * displayScale,
                width: zone.width * displayScale,
                height: zone.height * displayScale,
                background: zone.type === 'water_recovery'
                  ? 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(100,116,139,.08) 8px, rgba(100,116,139,.08) 16px)'
                  : zone.type === 'hedge'
                  ? 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(45,80,22,.18) 8px, rgba(45,80,22,.18) 16px)'
                  : zone.type === 'grass'
                  ? 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(74,222,128,.12) 8px, rgba(74,222,128,.12) 16px)'
                  : zone.type === 'fleur'
                  ? 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(244,114,182,.12) 8px, rgba(244,114,182,.12) 16px)'
                  : 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(139,195,74,.12) 8px, rgba(139,195,74,.12) 16px)',
                border: isAlignSelected('zone', zone.id) ? '3px solid #a855f7' : selectedElement?.id === zone.id && selectedElement?.type === 'zone' ? '3px dashed #22c55e' : zone.type === 'water_recovery' ? '2px dashed rgba(100,116,139,.25)' : zone.type === 'hedge' ? '2px dashed rgba(45,80,22,.4)' : zone.type === 'grass' ? '2px dashed rgba(74,222,128,.4)' : zone.type === 'fleur' ? '2px dashed rgba(244,114,182,.4)' : '2px dashed rgba(139,195,74,.35)',
                borderRadius: 6,
                zIndex: 1,
                cursor: alignMode ? 'pointer' : activeTool === 'none' ? 'grab' : 'default',
                boxShadow: isAlignSelected('zone', zone.id) ? '0 0 0 4px rgba(168,85,247,0.3)' : undefined,
              }}
              title={zone.label || (zone.type === 'water_recovery' ? '💧 Zone récupération eau' : zone.type === 'hedge' ? '🌿 Zone haie' : zone.type === 'grass' ? '🌱 Zone herbe' : zone.type === 'fleur' ? '🌸 Zone fleur' : '🟢 Zone culture')}
            >
              {selectedElement?.id === zone.id && selectedElement?.type === 'zone' && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeGardenZone?.(zone.id); setSelectedElement(null); }}
                    style={{ position:'absolute', top:-32, right:0, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:700, zIndex:9999 }}
                    title="Supprimer"
                  >
                    🗑️ Supprimer
                  </button>
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startW = zone.width;
                      const startH = zone.height;
                      const startZx = zone.x;
                      const startZy = zone.y;
                      const onMove = (me: MouseEvent) => {
                        const dx = me.clientX - startX;
                        const dy = me.clientY - startY;
                        const newW = Math.max(30, Math.round(startW + dx / displayScale));
                        const newH = Math.max(30, Math.round(startH + dy / displayScale));
                        const newX = startZx;
                        const newY = startZy;
                        resizeGardenZone?.(zone.id, newX, newY, newW, newH);
                      };
                      const onUp = () => {
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                      };
                      window.addEventListener('mousemove', onMove);
                      window.addEventListener('mouseup', onUp);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 16,
                      height: 16,
                      background: '#22c55e',
                      borderRadius: '0 0 6px 0',
                      cursor: 'se-resize',
                      zIndex: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: '#fff',
                    }}
                    title="Glisser pour redimensionner"
                  >
                    ↘
                  </div>
                </>
              )}
              <div style={{ position:'absolute', top:4, left:6, fontSize:9, color: zone.type === 'water_recovery' ? 'rgba(100,116,139,.6)' : zone.type === 'hedge' ? 'rgba(45,80,22,.7)' : 'rgba(139,195,74,.7)', fontWeight:600 }}>
                {zone.label || (zone.type === 'water_recovery' ? '💧' : zone.type === 'hedge' ? '🌿' : zone.type === 'grass' ? '🌱' : zone.type === 'fleur' ? '🌸' : '🟢')}
              </div>
            </div>
          ))}

          {/* HAIES */}
          {gardenHedges.map((hedge: any) => (
            <div key={hedge.id}
              onClick={(e) => { e.stopPropagation(); if (alignMode) { toggleAlignSelect('hedge', hedge.id); return; } if (editMode === 'select') { setSelectedElement({ type: 'hedge', id: hedge.id }); onSelectElement?.('hedge', hedge.id); } }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'hedge', id: hedge.id }); }}
              onMouseDown={(e) => { if (alignMode) { e.stopPropagation(); toggleAlignSelect('hedge', hedge.id); return; } startDrag(e, 'hedge', hedge.id, hedge.x, hedge.y); }}
              style={{
                position: 'absolute',
                left: hedge.x * displayScale,
                top: hedge.y * displayScale,
                width: hedge.width * displayScale,
                height: hedge.height * displayScale,
                background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 50%, #2d5016 100%)',
                border: isAlignSelected('hedge', hedge.id) ? '3px solid #a855f7' : selectedElement?.id === hedge.id && selectedElement?.type === 'hedge' ? '3px dashed #22c55e' : '2px solid #1a3a0f',
                borderRadius: 4,
                zIndex: 2,
                boxShadow: isAlignSelected('hedge', hedge.id) ? '0 0 0 4px rgba(168,85,247,0.3)' : '0 2px 4px rgba(0,0,0,0.3)',
                cursor: alignMode ? 'pointer' : activeTool === 'none' ? 'grab' : 'default',
              }}
              title={`Haie ${hedge.id}`}
            >
              <div style={{ 
                position: 'absolute', 
                bottom: -18, 
                left: '50%', 
                transform: 'translateX(-50%)',
                fontSize: 9, 
                color: '#2d5016', 
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                🌿 {hedge.label || 'Haie'}
              </div>
              {selectedElement?.id === hedge.id && selectedElement?.type === 'hedge' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeGardenHedge?.(hedge.id); setSelectedElement(null); }}
                  style={{ position:'absolute', top:-32, right:0, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:700, zIndex:9999 }}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          ))}

          {/* CUVES */}
          {gardenTanks.map((tank: any) => {
            const fillPercent = tank.capacity > 0 ? (tank.currentLevel / tank.capacity) : 0;
            const isEmpty = fillPercent === 0;
            const isHalf = fillPercent > 0 && fillPercent < 0.7;
            const isFull = fillPercent >= 0.7;
            return (
            <div key={tank.id}
              onClick={(e) => { e.stopPropagation(); if (alignMode) { toggleAlignSelect('tank', tank.id); return; } if (editMode === 'select') { setSelectedElement({ type: 'tank', id: tank.id }); onSelectElement?.('tank', tank.id); } }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'tank', id: tank.id }); }}
              onMouseDown={(e) => { if (alignMode) { e.stopPropagation(); toggleAlignSelect('tank', tank.id); return; } startDrag(e, 'tank', tank.id, tank.x, tank.y); }}
              style={{
                position: 'absolute',
                left: tank.x * displayScale,
                top: tank.y * displayScale,
                width: tank.width * displayScale,
                height: tank.height * displayScale,
                background: 'linear-gradient(135deg, #374151 0%, #6b7280 50%, #374151 100%)',
                border: isAlignSelected('tank', tank.id) ? '3px solid #a855f7' : selectedElement?.id === tank.id && selectedElement?.type === 'tank' ? '3px dashed #22c55e' : '3px solid #1f2937',
                borderRadius: 8,
                zIndex: 2,
                boxShadow: isAlignSelected('tank', tank.id) ? '0 0 0 4px rgba(168,85,247,0.3)' : '0 4px 8px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                cursor: alignMode ? 'pointer' : activeTool === 'none' ? 'grab' : 'default',
              }}
              title={`Cuve ${tank.capacity}L — ${Math.round(fillPercent * 100)}%`}
            >
              {/* Eau */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${fillPercent * 100}%`,
                background: isFull
                  ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)'
                  : isHalf
                  ? 'linear-gradient(135deg, #2563eb 0%, #60a5fa 50%, #2563eb 100%)'
                  : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
                transition: 'height 0.5s ease',
              }} />
              {/* État vide */}
              {isEmpty && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 9,
                  color: '#9ca3af',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                  VIDE
                </div>
              )}
              {/* Label capacité */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 11,
                color: fillPercent > 0.5 ? '#fff' : '#93c5fd',
                fontWeight: 'bold',
                textShadow: fillPercent > 0.5 ? '1px 1px 2px rgba(0,0,0,0.9)' : '1px 1px 2px rgba(0,0,0,0.6)',
              }}>
                💧 {tank.capacity}L
              </div>
              <div style={{
                position: 'absolute',
                bottom: 2,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 8,
                color: fillPercent > 0.3 ? '#bfdbfe' : '#60a5fa',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}>
                {Math.round(fillPercent * 100)}%
              </div>
              {selectedElement?.id === tank.id && selectedElement?.type === 'tank' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeGardenTank?.(tank.id); setSelectedElement(null); }}
                  style={{ position:'absolute', top:-32, right:0, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:700, zIndex:9999 }}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          );
          })}

          {/* CABANES */}
          {gardenSheds.map((shed: any) => (
            <div key={shed.id}
              onClick={(e) => { e.stopPropagation(); if (alignMode) { toggleAlignSelect('shed', shed.id); return; } if (editMode === 'select') { setSelectedElement({ type: 'shed', id: shed.id }); onSelectElement?.('shed', shed.id); } }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'shed', id: shed.id }); }}
              onMouseDown={(e) => { if (alignMode) { e.stopPropagation(); toggleAlignSelect('shed', shed.id); return; } startDrag(e, 'shed', shed.id, shed.x, shed.y); }}
              style={{
                position: 'absolute',
                left: shed.x * displayScale,
                top: shed.y * displayScale,
                width: shed.width * displayScale,
                height: shed.height * displayScale,
                background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #92400e 100%)',
                border: isAlignSelected('shed', shed.id) ? '3px solid #a855f7' : selectedElement?.id === shed.id && selectedElement?.type === 'shed' ? '3px dashed #22c55e' : '3px solid #78350f',
                borderRadius: 6,
                zIndex: 2,
                boxShadow: isAlignSelected('shed', shed.id) ? '0 0 0 4px rgba(168,85,247,0.3)' : '0 4px 8px rgba(0,0,0,0.4)',
                cursor: alignMode ? 'pointer' : activeTool === 'none' ? 'grab' : 'default',
              }}
              title={`Cabane ${shed.id}`}
            >
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontSize: 24
              }}>
                🏚️
              </div>
              <div style={{ 
                position: 'absolute', 
                bottom: -18, 
                left: '50%', 
                transform: 'translateX(-50%)',
                fontSize: 9, 
                color: '#92400e', 
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                {shed.label || 'Cabane'}
              </div>
              {selectedElement?.id === shed.id && selectedElement?.type === 'shed' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeGardenShed?.(shed.id); setSelectedElement(null); }}
                  style={{ position:'absolute', top:-32, right:0, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:700, zIndex:9999 }}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          ))}

          {/* FÛTS PEHD 225L */}
          {gardenDrums.map((drum: any) => (
            <div key={drum.id}
              onClick={(e) => { e.stopPropagation(); if (alignMode) { toggleAlignSelect('drum', drum.id); return; } if (editMode === 'select') { setSelectedElement({ type: 'drum', id: drum.id }); onSelectElement?.('drum', drum.id); } }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'drum', id: drum.id }); }}
              onMouseDown={(e) => { if (alignMode) { e.stopPropagation(); toggleAlignSelect('drum', drum.id); return; } startDrag(e, 'drum', drum.id, drum.x, drum.y); }}
              style={{
                position: 'absolute',
                left: drum.x * displayScale,
                top: drum.y * displayScale,
                width: drum.width * displayScale,
                height: drum.height * displayScale,
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e3a5f 100%)',
                border: isAlignSelected('drum', drum.id) ? '3px solid #a855f7' : selectedElement?.id === drum.id && selectedElement?.type === 'drum' ? '3px dashed #22c55e' : '3px solid #1e40af',
                borderRadius: 6,
                zIndex: 2,
                boxShadow: isAlignSelected('drum', drum.id) ? '0 0 0 4px rgba(168,85,247,0.3)' : '0 4px 8px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: alignMode ? 'pointer' : activeTool === 'none' ? 'grab' : 'default',
              }}
              title={`Fût PEHD ${drum.capacity}L`}
            >
              <div style={{ fontSize: 22 }}>🛢️</div>
              <div style={{
                position: 'absolute',
                bottom: 2,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 8,
                color: '#93c5fd',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}>
                {drum.capacity}L
              </div>
              {selectedElement?.id === drum.id && selectedElement?.type === 'drum' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeGardenDrum?.(drum.id); setSelectedElement(null); }}
                  style={{ position:'absolute', top:-32, right:0, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:700, zIndex:9999 }}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          ))}


          {/* ARBRES */}
          {gardenTrees.map((tree: any) => (
            <div key={tree.id}
              onClick={(e) => { e.stopPropagation(); if (alignMode) { toggleAlignSelect('tree', tree.id); return; } if (editMode === 'select') { setSelectedElement({ type: 'tree', id: tree.id }); onSelectElement?.('tree', tree.id); } }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'tree', id: tree.id }); }}
              onMouseDown={(e) => { if (alignMode) { e.stopPropagation(); toggleAlignSelect('tree', tree.id); return; } startDrag(e, 'tree', tree.id, tree.x, tree.y); }}
              style={{
                position: 'absolute',
                left: tree.x * displayScale - (tree.diameter ?? 75) * 0.5 * displayScale,
                top: tree.y * displayScale - (tree.diameter ?? 75) * 0.5 * displayScale,
                width: (tree.diameter ?? 75) * displayScale,
                height: (tree.diameter ?? 75) * displayScale,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, #4ade80 0%, #16a34a 60%, #14532d 100%)',
                border: isAlignSelected('tree', tree.id) ? '3px solid #a855f7' : selectedElement?.id === tree.id && selectedElement?.type === 'tree' ? '3px dashed #22c55e' : '2px solid #166534',
                boxShadow: isAlignSelected('tree', tree.id) ? '0 0 0 4px rgba(168,85,247,0.3)' : '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 2,
                cursor: alignMode ? 'pointer' : activeTool === 'none' ? 'grab' : 'default',
              }}
              title={`Arbre ${tree.type} — ${tree.age ?? 0}j`}
            >
              {/* Tronc */}
              <div style={{
                position: 'absolute',
                bottom: '15%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20%',
                height: '35%',
                background: 'linear-gradient(90deg, #78350f 0%, #92400e 50%, #78350f 100%)',
                borderRadius: '2px',
              }} />
              {/* Label */}
              <div style={{
                position: 'absolute',
                bottom: -18,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9,
                color: '#14532d',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}>
                🌳 {tree.type}
              </div>
              {/* Bouton supprimer */}
              {selectedElement?.id === tree.id && selectedElement?.type === 'tree' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeGardenTree?.(tree.id); setSelectedElement(null); }}
                  style={{ position:'absolute', top:-32, right:0, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:700, zIndex:9999 }}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          ))}


          {/* PLANTES — draggables */}
          {gardenPlants.map((gp) => {
            const plant    = gp.plant;
            const plantDef = PLANTS[gp.plantDefId];
            const agroData = agro.plants.find(p => p.plantId === gp.id);
            const isDragging = dragPos?.id === gp.id;
            const isAlignSel = isAlignSelected('plant', gp.id);
            const cx = isDragging ? dragPos!.x : gp.x;
            const cy = isDragging ? dragPos!.y : gp.y;
            const px = cx * displayScale;
            const py = cy * displayScale;
            const sz = Math.max(40, 80 * displayScale);

            const ringColor = isAlignSel ? '#a855f7' : isDragging ? '#90caf9' :
              agroData?.waterUrgency === 'critique' ? '#ef4444' :
              agroData?.waterUrgency === 'urgent'   ? '#f97316' :
              agroData?.diseaseAlert  === 'danger'  ? '#a855f7' :
              agroData?.companionScore === 'mauvais'? '#eab308' : '#22c55e';

            return (
              <div key={gp.id} className="plant-sprite-container"
                style={{
                  left: px, top: py, width: sz, height: sz + 30,
                  cursor: alignMode ? 'pointer' : activeTool === 'none' ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  zIndex: isDragging ? 9999 : 4,
                  transform: isDragging ? 'scale(1.15)' : undefined,
                  transition: isDragging ? 'none' : 'transform .15s',
                  boxShadow: isAlignSel ? '0 0 0 4px rgba(168,85,247,0.4)' : undefined,
                }}
                onMouseDown={(e) => { if (alignMode) { e.stopPropagation(); toggleAlignSelect('plant', gp.id); return; } startDrag(e, 'plant', gp.id, gp.x, gp.y); }}
                onClick={(e) => { e.stopPropagation(); if (alignMode) { toggleAlignSelect('plant', gp.id); return; } if (editMode === 'select') { setSelectedElement({ type: 'plant', id: gp.id }); onSelectElement?.('plant', gp.id); } }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, type: 'plant', id: gp.id }); }}
                onMouseEnter={(e) => {
                  if (!agroData || dragRef.current) return;
                  if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setTooltip({ agroData, plantName: plantDef?.name ?? 'Plante', x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => { tooltipTimer.current = setTimeout(() => setTooltip(null), 120); }}
              >
                <div style={{ position:'absolute', inset:-3, borderRadius:'50%', border:`2px solid ${ringColor}`, boxShadow:`0 0 ${isDragging ? 12 : 6}px ${ringColor}88`, pointerEvents:'none', zIndex:1 }} />
                <img src={`/plants/${gp.plantDefId}-stage-${Math.min(plant.stage, 6)}.png`}
                  alt={plantDef?.name || 'Plante'} className="plant-sprite-image"
                  draggable={false} style={{ width:'100%', height:'100%', objectFit:'contain' }}
                  onError={(e) => {
                    reportMissing(gp.plantDefId);
                    (e.currentTarget as HTMLImageElement).src = `/plants/custom-plant-stage-${Math.min(plant.stage, 6)}.png`;
                  }} />
                <div className="day-badge-manga" style={{ fontSize:8, width:26, height:26 }}>J{plant.daysSincePlanting}</div>
                <div className="water-bar-manga">
                  <div className="water-fill-manga" style={{
                    height:`${plant.waterLevel}%`,
                    background:`linear-gradient(to top,${plant.waterLevel>60?'#4ecdc4':plant.waterLevel>30?'#f9d423':'#ff6b6b'},#fff)`
                  }} />
                </div>
                {agroData && (
                  <div className="agro-badges-grid">
                    <span className={`agro-badge ${agroData.waterUrgency==='critique'?'badge-red':agroData.waterUrgency==='urgent'?'badge-orange':'badge-blue'}`}>
                      💧{agroData.waterUrgency==='critique'?'🔴':agroData.waterUrgency==='urgent'?'⚠️':'✓'}
                    </span>
                    {agroData.diseaseAlert!=='none' && <span className={`agro-badge ${agroData.diseaseAlert==='danger'?'badge-purple':'badge-yellow'}`}>🦠{agroData.diseaseAlert==='danger'?'🔴':'⚠️'}</span>}
                    {agroData.companionScore!=='neutre' && <span className={`agro-badge ${agroData.companionScore==='mauvais'?'badge-red':agroData.companionScore==='excellent'?'badge-green':'badge-teal'}`}>{agroData.companionScore==='mauvais'?'⚔️':agroData.companionScore==='excellent'?'🤝✨':'🤝'}</span>}
                    {!agroData.soilTempOk && <span className="agro-badge badge-ice">🌡️❄️</span>}
                    <div className="gdd-mini-bar"><div className="gdd-mini-fill" style={{ width:`${agroData.gddProgressPct}%` }} /></div>
                  </div>
                )}
              </div>
            );
          })}

          {/* CANVAS OVERLAY RANGS */}
          {seedRows.length > 0 && (
            <canvas ref={canvasRef} style={{
              position:'absolute', inset:0, width:displayW, height:displayH,
              pointerEvents:'none', zIndex:5,
            }} />
          )}

          {/* LÉGENDE RANGS */}
          {seedRows.length > 0 && (
            <div className="seed-rows-legend">
              {seedRows.map((r, i) => (
                <div key={r.id} className="seed-row-legend-item">
                  <span className="seed-row-legend-dot" style={{ background: r.color }} />
                  <span>{r.label || `Rang ${i + 1}`}</span>
                </div>
              ))}
            </div>
          )}

          {/* PRÉVIEW ZONE EN TRAIN DE SE DESSINER */}
          {drawingZone && (() => {
            const rect = getZoneRect(drawingZone);
            if (!rect || rect.w < 5 || rect.h < 5) return null;
            return (
              <div style={{
                position: 'absolute',
                left: rect.x * displayScale,
                top: rect.y * displayScale,
                width: rect.w * displayScale,
                height: rect.h * displayScale,
                background: drawingZone.zoneType === 'water_recovery'
                  ? 'rgba(100,116,139,.15)'
                  : drawingZone.zoneType === 'hedge'
                  ? 'rgba(45,80,22,.2)'
                  : drawingZone.zoneType === 'grass'
                  ? 'rgba(74,222,128,.2)'
                  : drawingZone.zoneType === 'fleur'
                  ? 'rgba(244,114,182,.2)'
                  : 'rgba(139,195,74,.2)',
                border: '2px dashed rgba(76,175,80,.7)',
                borderRadius: 6,
                zIndex: 9998,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 10, color: 'rgba(76,175,80,.9)', fontWeight: 700 }}>
                  {Math.round(rect.w)}×{Math.round(rect.h)} cm
                </span>
              </div>
            );
          })()}

          {/* ALIGNMENT GUIDES (pendant le drag) */}
          {dragPos && (() => {
            const SNAP_PX = 5;
            const guides: Array<{ type: 'h' | 'v'; pos: number }> = [];
            const draggedEl = dragPos;
            // Collecter les boîtes de tous les éléments non-draggés
            const boxes: Array<{ cx: number; cy: number; l: number; r: number; t: number; b: number }> = [];
            gardenPlants.forEach(gp => { if (gp.id !== draggedEl.id) { const sz = 80; boxes.push({ cx: gp.x + sz/2, cy: gp.y + sz/2, l: gp.x, r: gp.x + sz, t: gp.y, b: gp.y + sz }); }});
            gardenSerreZones?.forEach((s: any) => { if (s.id !== draggedEl.id) boxes.push({ cx: s.x + s.width/2, cy: s.y + s.height/2, l: s.x, r: s.x + s.width, t: s.y, b: s.y + s.height }); });
            gardenZones?.forEach((z: any) => { if (z.id !== draggedEl.id) boxes.push({ cx: z.x + z.width/2, cy: z.y + z.height/2, l: z.x, r: z.x + z.width, t: z.y, b: z.y + z.height }); });

            const dCx = draggedEl.x + 40;
            const dCy = draggedEl.y + 40;
            for (const b of boxes) {
              if (Math.abs(dCx - b.cx) < SNAP_PX * 2) guides.push({ type: 'v', pos: b.cx });
              if (Math.abs(dCy - b.cy) < SNAP_PX * 2) guides.push({ type: 'h', pos: b.cy });
              if (Math.abs(draggedEl.x - b.l) < SNAP_PX * 2) guides.push({ type: 'v', pos: b.l });
              if (Math.abs(draggedEl.x - b.r) < SNAP_PX * 2) guides.push({ type: 'v', pos: b.r });
              if (Math.abs(draggedEl.y - b.t) < SNAP_PX * 2) guides.push({ type: 'h', pos: b.t });
              if (Math.abs(draggedEl.y - b.b) < SNAP_PX * 2) guides.push({ type: 'h', pos: b.b });
            }
            if (guides.length === 0) return null;
            return (
              <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:9990 }}>
                {guides.map((g, i) => g.type === 'h' ? (
                  <div key={`gh-${i}`} style={{ position:'absolute', left:0, right:0, top: g.pos * displayScale, height:1, background:'#3b82f6', opacity:0.7 }} />
                ) : (
                  <div key={`gv-${i}`} style={{ position:'absolute', top:0, bottom:0, left: g.pos * displayScale, width:1, background:'#3b82f6', opacity:0.7 }} />
                ))}
              </div>
            );
          })()}

          {/* GHOST PREVIEW (outil actif) */}
          {activeTool !== 'none' && hoverCoords && TOOL_SIZES[activeTool] && (() => {
            const sz = TOOL_SIZES[activeTool];
            return (
              <div style={{
                position: 'absolute',
                left: (hoverCoords.x - sz.w/2) * displayScale,
                top: (hoverCoords.y - sz.h/2) * displayScale,
                width: sz.w * displayScale,
                height: sz.h * displayScale,
                border: '2px dashed rgba(99,102,241,0.5)',
                borderRadius: 6,
                background: 'rgba(99,102,241,0.08)',
                pointerEvents: 'none',
                zIndex: 9991,
              }} />
            );
          })()}

          {/* EMPTY STATE */}
          {gardenPlants.length === 0 && (!gardenSerreZones || gardenSerreZones.length === 0) && seedRows.length === 0 && (
            <div className="empty-garden-message">
              <span className="empty-emoji">🌱</span>
              <p>Votre jardin est vide !</p>
              <p className="empty-subtitle">Transplantez depuis la Pépinière, ou placez une Serre avec les outils ci-dessus</p>
            </div>
          )}

        </div>
      </div>

      {/* ── Properties Panel (sélection) ── */}
      <AnimatePresence>
        {selectedElement && (() => {
          let obj: any = null;
          let typeLabel = '';
          let emoji = '';
          let w = 0, h = 0;
          if (selectedElement.type === 'serre') {
            obj = gardenSerreZones?.find((s: any) => s.id === selectedElement.id);
            typeLabel = 'Serre'; emoji = '🏡'; if (obj) { w = obj.width; h = obj.height; }
          } else if (selectedElement.type === 'plant') {
            obj = gardenPlants.find((gp: any) => gp.id === selectedElement.id);
            typeLabel = 'Plante'; emoji = '🌱'; if (obj) { w = 80; h = 80; }
          } else if (selectedElement.type === 'zone') {
            obj = gardenZones?.find((z: any) => z.id === selectedElement.id);
            typeLabel = 'Zone'; emoji = '🟢'; if (obj) { w = obj.width; h = obj.height; }
          } else if (selectedElement.type === 'hedge') {
            obj = gardenHedges?.find((h: any) => h.id === selectedElement.id);
            typeLabel = 'Haie'; emoji = '🌿'; if (obj) { w = obj.width; h = obj.height; }
          } else if (selectedElement.type === 'tree') {
            obj = gardenTrees?.find((t: any) => t.id === selectedElement.id);
            typeLabel = 'Arbre'; emoji = '🌳'; if (obj) { w = obj.diameter ?? 75; h = obj.diameter ?? 75; }
          } else if (selectedElement.type === 'tank') {
            obj = gardenTanks?.find((t: any) => t.id === selectedElement.id);
            typeLabel = 'Cuve'; emoji = '💧'; if (obj) { w = obj.width; h = obj.height; }
          } else if (selectedElement.type === 'drum') {
            obj = gardenDrums?.find((d: any) => d.id === selectedElement.id);
            typeLabel = 'Fût'; emoji = '🛢️'; if (obj) { w = obj.width; h = obj.height; }
          } else if (selectedElement.type === 'shed') {
            obj = gardenSheds?.find((s: any) => s.id === selectedElement.id);
            typeLabel = 'Cabane'; emoji = '🏚️'; if (obj) { w = obj.width; h = obj.height; }
          }
          if (!obj) return null;
          return (
            <motion.div
              key="props-panel"
              className="props-panel"
              initial={{ x: 260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 260, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              <div className="props-panel-header">
                <span>{emoji} {typeLabel}</span>
                <button onClick={() => setSelectedElement(null)} className="props-close">✕</button>
              </div>
              <div className="props-panel-body">
                <div className="props-field">
                  <label>X</label>
                  <span className="props-value">{Math.round(obj.x)} cm</span>
                </div>
                <div className="props-field">
                  <label>Y</label>
                  <span className="props-value">{Math.round(obj.y)} cm</span>
                </div>
                {w > 0 && <div className="props-field">
                  <label>L</label>
                  <span className="props-value">{Math.round(w)} cm</span>
                </div>}
                {h > 0 && <div className="props-field">
                  <label>H</label>
                  <span className="props-value">{Math.round(h)} cm</span>
                </div>}
                {obj.capacity && <div className="props-field">
                  <label>Capacité</label>
                  <span className="props-value">{obj.capacity}L</span>
                </div>}
                {obj.type && <div className="props-field">
                  <label>Type</label>
                  <span className="props-value">{obj.type}</span>
                </div>}
              </div>
              <div className="props-panel-actions">
                <button className="props-btn props-btn-delete"
                  onClick={() => {
                    if (selectedElement.type === 'zone') removeGardenZone?.(selectedElement.id);
                    else if (selectedElement.type === 'serre') removeSerreZone?.(selectedElement.id);
                    else if (selectedElement.type === 'hedge') removeGardenHedge?.(selectedElement.id);
                    else if (selectedElement.type === 'tank') removeGardenTank?.(selectedElement.id);
                    else if (selectedElement.type === 'drum') removeGardenDrum?.(selectedElement.id);
                    else if (selectedElement.type === 'shed') removeGardenShed?.(selectedElement.id);
                    else if (selectedElement.type === 'tree') removeGardenTree?.(selectedElement.id);
                    setSelectedElement(null);
                  }}>
                  Supprimer
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>


      {/* ── Context menu (clic droit) ── */}
      {contextMenu && typeof document !== 'undefined' && createPortal(
        <div
          className="zone-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ctx-menu-title">Options</div>
          <button className="ctx-btn ctx-btn-delete"
            onClick={() => {
              if (contextMenu.type === 'zone') removeGardenZone?.(contextMenu.id);
              else if (contextMenu.type === 'serre') removeSerreZone?.(contextMenu.id);
              else if (contextMenu.type === 'hedge') removeGardenHedge?.(contextMenu.id);
              else if (contextMenu.type === 'tank') removeGardenTank?.(contextMenu.id);
              else if (contextMenu.type === 'drum') removeGardenDrum?.(contextMenu.id);
              else if (contextMenu.type === 'shed') removeGardenShed?.(contextMenu.id);
              else if (contextMenu.type === 'tree') removeGardenTree?.(contextMenu.id);
              setContextMenu(null);
            }}
          >
            🗑️ Supprimer
          </button>
          <button className="ctx-btn"
            onClick={() => {
              setSelectedElement({ type: contextMenu.type, id: contextMenu.id });
              onSelectElement?.(contextMenu.type, contextMenu.id);
              onEditModeChange?.('select');
              setContextMenu(null);
            }}
          >
            ✏️ Sélectionner
          </button>
          <button className="ctx-btn"
            onClick={() => {
              setSelectedElement(null);
              onEditModeChange?.('place');
              setContextMenu(null);
            }}
          >
            ✕ Quitter
          </button>
        </div>,
        document.body
      )}

      {/* ── Tooltip portal — rendu hors du scroll-wrapper pour ne jamais être coupé ── */}
      {tooltip && typeof document !== 'undefined' && createPortal(
        <div
          className="agro-tooltip-portal"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
          onMouseEnter={() => { if (tooltipTimer.current) clearTimeout(tooltipTimer.current); }}
          onMouseLeave={() => setTooltip(null)}
        >
          <div className="agro-tt-name">{tooltip.plantName}</div>
          <div className="agro-tt-row">
            💧 {tooltip.agroData.needLPerDay.toFixed(2)}L/j
            <span className="agro-tt-save"> −{tooltip.agroData.waterSavingPct}%</span>
          </div>
          {tooltip.agroData.hydroBreakdown.slice(0, 2).map((b, i) =>
            <div key={i} className="agro-tt-sub">{b.emoji} {b.source} −{b.savingMm.toFixed(2)}mm</div>
          )}
          <div className="agro-tt-row">🌡️ Sol {tooltip.agroData.soilTempC}°C {tooltip.agroData.soilTempOk ? '✅' : '❌'}</div>
          <div className="agro-tt-row">🌱 GDD {tooltip.agroData.gddProgressPct.toFixed(0)}% — {tooltip.agroData.daysToNextStage}j prochain stade</div>
          <div className="agro-tt-row" style={{ whiteSpace: 'normal' }}>{tooltip.agroData.companionTip}</div>
          {tooltip.agroData.diseaseAlert !== 'none' && (
            <div className="agro-tt-disease" style={{ whiteSpace: 'normal' }}>{tooltip.agroData.diseaseMessage}</div>
          )}
        </div>,
        document.body
      )}


      <style>{`
        .garden-dims-bar{display:flex;gap:10px;align-items:center;font-size:12px;font-weight:600;color:#4a5568;margin-bottom:8px;padding:6px 12px;background:rgba(255,255,255,0.85);border-radius:8px;flex-wrap:wrap}
        .dims-scale{color:#9f7aea;font-weight:700}
        .dims-coords{background:#eef2ff;color:#4338ca;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;font-variant-numeric:tabular-nums;letter-spacing:-0.3px}
        .dims-tool-active{background:#fef3c7;color:#92400e;border:1px solid #f59e0b;padding:2px 10px;border-radius:8px;font-weight:700;animation:pulse-tool 1.5s ease-in-out infinite}
        @keyframes pulse-tool{0%,100%{opacity:1}50%{opacity:.65}}
        .garden-scroll-wrapper{position:absolute;top:0;left:0;overflow:auto;max-width:100%;max-height:100%;padding-top:20px;padding-right:40px;box-sizing:border-box;width:100%;height:100%}
        /* overflow:visible sur la grille elle-même pour que les tooltips sortent */
        .garden-grid{overflow:visible!important;position:relative;width:displayW;height:displayH}
        .seed-rows-legend{position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);border-radius:10px;padding:8px 12px;display:flex;flex-direction:column;gap:5px;z-index:10;pointer-events:none}
        .seed-row-legend-item{display:flex;align-items:center;gap:7px;font-size:11px;color:#fff;font-weight:600}
        .seed-row-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}

        /* ── Context menu ── */
        .zone-context-menu{position:fixed;z-index:99999;background:rgba(10,20,35,.97);border:1px solid rgba(144,202,249,.4);border-radius:10px;padding:8px 0;min-width:160px;box-shadow:0 16px 40px rgba(0,0,0,.75)}
        .ctx-menu-title{font-size:10px;font-weight:800;color:#90caf9;padding:0 12px 6px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:4px}
        .ctx-btn{width:100%;text-align:left;padding:7px 12px;font-size:11px;font-weight:600;color:#e2e8f0;background:none;border:none;cursor:pointer;transition:background .15s}
        .ctx-btn:hover{background:rgba(144,202,249,.15)}
        .ctx-btn-delete{color:#fca5a5}
        .ctx-btn-delete:hover{background:rgba(239,68,68,.15)}

        /* ── Badges agronomiques ── */
        .agro-badges-grid{position:absolute;bottom:-26px;left:50%;transform:translateX(-50%);display:flex;gap:2px;align-items:center;z-index:8;white-space:nowrap}
        .agro-badge{font-size:9px;padding:1px 3px;border-radius:4px;font-weight:700;line-height:1;cursor:default}
        .badge-red{background:rgba(239,68,68,.85);color:#fff}
        .badge-orange{background:rgba(249,115,22,.85);color:#fff}
        .badge-blue{background:rgba(14,165,233,.75);color:#fff}
        .badge-green{background:rgba(34,197,94,.8);color:#fff}
        .badge-teal{background:rgba(20,184,166,.8);color:#fff}
        .badge-yellow{background:rgba(234,179,8,.85);color:#000}
        .badge-purple{background:rgba(168,85,247,.85);color:#fff}
        .badge-ice{background:rgba(147,197,253,.85);color:#1e3a5f}
        .gdd-mini-bar{width:26px;height:4px;background:rgba(255,255,255,.25);border-radius:2px;overflow:hidden;align-self:center}
        .gdd-mini-fill{height:100%;background:linear-gradient(90deg,#fbbf24,#22c55e);border-radius:2px;transition:width .4s}

        /* ── Tooltip survol ── */
        .plant-sprite-container{position:absolute;overflow:visible}
        .plant-sprite-container:hover{z-index:9999!important}
        .plant-sprite-container:hover .agro-tooltip{opacity:1;pointer-events:none;transform:translateY(0)}
        .agro-tooltip{opacity:0;transition:opacity .15s,transform .15s;transform:translateY(4px);
          position:absolute;bottom:calc(100% + 10px);left:50%;translate:-50% 0;
          background:rgba(10,20,35,.97);border:1px solid rgba(144,202,249,.35);
          border-radius:10px;padding:9px 12px;font-size:10px;color:#e2e8f0;
          min-width:170px;max-width:220px;z-index:9999;line-height:1.7;pointer-events:none;
          box-shadow:0 12px 32px rgba(0,0,0,.7);white-space:nowrap}
        .agro-tt-name{font-weight:800;font-size:11px;color:#90caf9;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:3px}
        .agro-tt-row{display:flex;justify-content:space-between;gap:8px}
        .agro-tt-save{color:#86efac;font-weight:700}
        .agro-tt-sub{color:#94a3b8;font-size:9px;padding-left:4px}
        .agro-tt-disease{margin-top:3px;color:#fca5a5;font-size:9px}

        /* ── Tooltip portal (rendu dans document.body, jamais coupé) ── */
        .agro-tooltip-portal{
          position:fixed;z-index:99999;
          transform:translate(-50%,-100%);
          background:rgba(10,20,35,.97);border:1px solid rgba(144,202,249,.4);
          border-radius:10px;padding:10px 13px;font-size:10px;color:#e2e8f0;
          min-width:180px;max-width:240px;line-height:1.7;
          box-shadow:0 16px 40px rgba(0,0,0,.75);
          pointer-events:auto;
        }
        .agro-tooltip-portal::after{
          content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);
          border:6px solid transparent;border-top-color:rgba(144,202,249,.4);
        }

        /* ── Properties Panel ── */
        .props-panel{position:absolute;top:0;right:0;width:220px;height:100%;background:#fff;border-left:1px solid #e2e8f0;box-shadow:-4px 0 12px rgba(0,0,0,0.06);z-index:100;display:flex;flex-direction:column;border-radius:0 20px 20px 0;overflow:hidden}
        .props-panel-header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:800;color:#1e293b}
        .props-close{background:none;border:none;cursor:pointer;font-size:14px;color:#94a3b8;padding:2px 6px;border-radius:4px}
        .props-close:hover{background:#fee2e2;color:#dc2626}
        .props-panel-body{padding:12px 14px;display:flex;flex-direction:column;gap:8px;flex:1;overflow-y:auto}
        .props-field{display:flex;justify-content:space-between;align-items:center;font-size:12px}
        .props-field label{color:#94a3b8;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:.5px}
        .props-value{color:#1e293b;font-weight:600;font-variant-numeric:tabular-nums}
        .props-panel-actions{padding:10px 14px;border-top:1px solid #e2e8f0}
        .props-btn{width:100%;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}
        .props-btn-delete{background:#fee2e2;color:#dc2626}
        .props-btn-delete:hover{background:#dc2626;color:#fff}
      `}</style>
    </div>
  );
};

export default GardenPlanView;
