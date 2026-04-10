'use client';

import { motion } from 'framer-motion';
import { type ActiveTool, type EditMode } from './Jardin';

// NOTE: Serre, tree, hedge, tank, drum, shed → Boutique
const TOOLS: { id: ActiveTool; label: string; emoji: string; zoneType?: string }[] = [
  { id: 'zone', label: 'Zone Culture', emoji: '🟢', zoneType: 'uncultivated' },
  { id: 'zone_hedge', label: 'Zone Haie', emoji: '🌿', zoneType: 'hedge' },
  { id: 'zone_water', label: 'Zone Eau', emoji: '💧', zoneType: 'water_recovery' },
  { id: 'zone_grass', label: 'Zone Herbe', emoji: '🌱', zoneType: 'grass' },
  { id: 'zone_fleur', label: 'Zone Fleur', emoji: '🌸', zoneType: 'fleur' },
];

interface JardinPlacementControlsProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
}

export const JardinPlacementControls: React.FC<JardinPlacementControlsProps> = ({
  activeTool, onToolChange, editMode, onEditModeChange,
}) => {
  return (
    <div className="placement-controls">
      {/* Mode place / select */}
      <div className="control-label">
        <span className="label-icon">✏️</span>
        <span className="label-text">Mode</span>
      </div>
      <div className="edit-mode-toggle">
        <button
          className={`edit-mode-btn ${editMode === 'place' ? 'active' : ''}`}
          onClick={() => onEditModeChange('place')}
        >
          📍 Placer
        </button>
        <button
          className={`edit-mode-btn ${editMode === 'select' ? 'active' : ''}`}
          onClick={() => onEditModeChange('select')}
        >
          🖱️ Sélectionner
        </button>
      </div>

      <div className="tool-divider" />
      <div className="control-label">
        <span className="label-icon">🛠️</span>
        <span className="label-text">Outils</span>
      </div>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <motion.button
            key={tool.id}
            className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolChange(activeTool === tool.id ? 'none' : tool.id)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            title={tool.label}
          >
            <span className="tool-emoji">{tool.emoji}</span>
            <span className="tool-label">{tool.label}</span>
          </motion.button>
        ))}
      </div>

      {activeTool !== 'none' && (
        <motion.button
          className="cancel-tool-btn"
          onClick={() => onToolChange('none')}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✕ Annuler
        </motion.button>
      )}

      <style>{`
        .placement-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .control-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #4a5568;
        }
        .label-icon { font-size: 14px; }
        .edit-mode-toggle {
          display: flex;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .edit-mode-btn {
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          border: none;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all .2s;
        }
        .edit-mode-btn.active {
          background: #6366f1;
          color: #fff;
        }
        .tool-divider {
          width: 2px;
          height: 36px;
          background: #e2e8f0;
          border-radius: 1px;
        }
        .tool-grid {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .tool-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          cursor: pointer;
          transition: all .2s;
          min-width: 60px;
        }
        .tool-btn.active {
          border-color: #6366f1;
          background: #eef2ff;
        }
        .tool-emoji { font-size: 20px; line-height: 1; }
        .tool-label { font-size: 10px; font-weight: 700; color: #475569; }
        .tool-btn.active .tool-label { color: #6366f1; }
        .cancel-tool-btn {
          padding: 6px 14px;
          background: #fee2e2;
          color: #dc2626;
          border: 2px solid #fca5a5;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          margin-left: auto;
        }
      `}</style>
    </div>
  );
};

export default JardinPlacementControls;
