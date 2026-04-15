'use client';

import { motion } from 'framer-motion';
import {
  Grid3X3, Grid2X2, Magnet, Undo2, Redo2, MousePointer2,
  Home, TreePine, Fence, Droplets, CircleDot, Warehouse,
  Square, Leaf, Waves, Flower2, Wheat,
} from 'lucide-react';

export type ActiveTool = 'none' | 'zone' | 'zone_hedge' | 'zone_water' | 'zone_grass' | 'zone_fleur'
  | 'serre' | 'tree' | 'hedge' | 'tank' | 'drum' | 'shed';
export type EditMode = 'place' | 'select';
export type GridSnapMode = 'off' | '25' | '50' | '100';
export type GridShowMode = 'full' | 'major' | 'hidden';

interface JardinPlacementControlsProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  gridSnap: GridSnapMode;
  onGridSnapChange: (snap: GridSnapMode) => void;
  showGrid: GridShowMode;
  onShowGridChange: (show: GridShowMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const ZONE_TOOLS: { id: ActiveTool; label: string; icon: React.ReactNode }[] = [
  { id: 'zone',        label: 'Culture',  icon: <Square size={14} /> },
  { id: 'zone_hedge',  label: 'Haie',     icon: <Leaf size={14} /> },
  { id: 'zone_water',  label: 'Eau',      icon: <Waves size={14} /> },
  { id: 'zone_grass',  label: 'Herbe',    icon: <Wheat size={14} /> },
  { id: 'zone_fleur',  label: 'Fleurs',   icon: <Flower2 size={14} /> },
];

const STRUCT_TOOLS: { id: ActiveTool; label: string; icon: React.ReactNode }[] = [
  { id: 'serre', label: 'Serre',  icon: <Home size={14} /> },
  { id: 'tree',  label: 'Arbre',  icon: <TreePine size={14} /> },
  { id: 'hedge', label: 'Haie',   icon: <Fence size={14} /> },
  { id: 'tank',  label: 'Cuve',   icon: <Droplets size={14} /> },
  { id: 'drum',  label: 'Fût',    icon: <CircleDot size={14} /> },
  { id: 'shed',  label: 'Cabane', icon: <Warehouse size={14} /> },
];

const SNAP_OPTIONS: { id: GridSnapMode; label: string }[] = [
  { id: 'off', label: '–' },
  { id: '25',  label: '25' },
  { id: '50',  label: '50' },
  { id: '100', label: '1m' },
];

const GRID_OPTIONS: { id: GridShowMode; label: string; icon: React.ReactNode }[] = [
  { id: 'full',  label: 'Complète',  icon: <Grid3X3 size={12} /> },
  { id: 'major', label: 'Majeure',   icon: <Grid2X2 size={12} /> },
  { id: 'hidden', label: 'Masquée',  icon: <Grid3X3 size={12} className="opacity-30" /> },
];

export const JardinPlacementControls: React.FC<JardinPlacementControlsProps> = ({
  activeTool, onToolChange, editMode, onEditModeChange,
  gridSnap, onGridSnapChange, showGrid, onShowGridChange,
  canUndo, canRedo, onUndo, onRedo,
}) => {
  return (
    <div className="placement-controls-v2">
      {/* Mode */}
      <div className="pc-group">
        <div className="pc-label">Mode</div>
        <div className="pc-toggle">
          <button className={`pc-toggle-btn${editMode === 'place' ? ' active' : ''}`}
            onClick={() => onEditModeChange('place')} title="Placer des éléments">
            <MousePointer2 size={12} /> Placer
          </button>
          <button className={`pc-toggle-btn${editMode === 'select' ? ' active' : ''}`}
            onClick={() => onEditModeChange('select')} title="Sélectionner">
            <MousePointer2 size={12} /> Sélection
          </button>
        </div>
      </div>

      <div className="pc-divider" />

      {/* Zones */}
      <div className="pc-group">
        <div className="pc-label">Zones</div>
        <div className="pc-btns">
          {ZONE_TOOLS.map(tool => (
            <button key={tool.id}
              className={`pc-tool-btn${activeTool === tool.id ? ' active' : ''}`}
              onClick={() => onToolChange(activeTool === tool.id ? 'none' : tool.id)}
              title={tool.label}>
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pc-divider" />

      {/* Structures */}
      <div className="pc-group">
        <div className="pc-label">Structures</div>
        <div className="pc-btns">
          {STRUCT_TOOLS.map(tool => (
            <button key={tool.id}
              className={`pc-tool-btn${activeTool === tool.id ? ' active' : ''}`}
              onClick={() => onToolChange(activeTool === tool.id ? 'none' : tool.id)}
              title={tool.label}>
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pc-divider" />

      {/* Snap */}
      <div className="pc-group">
        <div className="pc-label"><Magnet size={11} /> Aimant</div>
        <div className="pc-snaps">
          {SNAP_OPTIONS.map(s => (
            <button key={s.id}
              className={`pc-snap-btn${gridSnap === s.id ? ' active' : ''}`}
              onClick={() => onGridSnapChange(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div className="pc-group">
        <div className="pc-label">Grille</div>
        <div className="pc-snaps">
          {GRID_OPTIONS.map(g => (
            <button key={g.id}
              className={`pc-snap-btn${showGrid === g.id ? ' active' : ''}`}
              onClick={() => onShowGridChange(g.id)}
              title={g.label}>
              {g.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="pc-divider" />

      {/* Undo/Redo */}
      <div className="pc-group">
        <button className="pc-icon-btn" disabled={!canUndo} onClick={onUndo} title="Annuler (Ctrl+Z)">
          <Undo2 size={16} />
        </button>
        <button className="pc-icon-btn" disabled={!canRedo} onClick={onRedo} title="Rétablir (Ctrl+Shift+Z)">
          <Redo2 size={16} />
        </button>
      </div>

      {/* Cancel */}
      {activeTool !== 'none' && (
        <motion.button
          className="pc-cancel-btn"
          onClick={() => onToolChange('none')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}>
          ✕ Annuler
        </motion.button>
      )}

      <style>{`
        .placement-controls-v2{display:flex;align-items:center;gap:10px;padding:8px 14px;background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08);flex-wrap:wrap;margin-bottom:10px}
        .pc-group{display:flex;align-items:center;gap:4px}
        .pc-label{font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:3px;margin-right:2px}
        .pc-divider{width:1px;height:28px;background:#e2e8f0;border-radius:1px;flex-shrink:0}
        .pc-toggle{display:flex;border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden}
        .pc-toggle-btn{display:flex;align-items:center;gap:3px;padding:4px 10px;font-size:11px;font-weight:700;border:none;background:#f8fafc;color:#64748b;cursor:pointer;transition:all .15s}
        .pc-toggle-btn.active{background:#6366f1;color:#fff}
        .pc-btns{display:flex;gap:3px}
        .pc-tool-btn{display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 8px;border:1.5px solid #e2e8f0;border-radius:8px;background:#f8fafc;cursor:pointer;transition:all .15s;min-width:44px}
        .pc-tool-btn span{font-size:9px;font-weight:700;color:#64748b}
        .pc-tool-btn.active{border-color:#6366f1;background:#eef2ff}
        .pc-tool-btn.active span{color:#6366f1}
        .pc-tool-btn:hover:not(.active){background:#f1f5f9}
        .pc-snaps{display:flex;gap:2px}
        .pc-snap-btn{padding:3px 7px;border-radius:5px;border:1px solid #e2e8f0;background:#fff;font-size:10px;font-weight:700;color:#64748b;cursor:pointer;transition:all .15s;display:flex;align-items:center}
        .pc-snap-btn.active{background:#6366f1;color:#fff;border-color:#6366f1}
        .pc-snap-btn:hover:not(.active){background:#f3f4f6}
        .pc-icon-btn{padding:4px 8px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;transition:all .15s;display:flex;align-items:center;color:#64748b}
        .pc-icon-btn:hover:not(:disabled){background:#f1f5f9;color:#6366f1}
        .pc-icon-btn:disabled{opacity:.3;cursor:default}
        .pc-cancel-btn{padding:5px 12px;background:#fee2e2;color:#dc2626;border:1.5px solid #fca5a5;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;margin-left:auto}
      `}</style>
    </div>
  );
};

export default JardinPlacementControls;