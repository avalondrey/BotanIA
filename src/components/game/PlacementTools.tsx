'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

type PlacementTool = 'none' | 'serre' | 'tree' | 'hedge' | 'tank' | 'shed';

interface PlacementToolsProps {
  onToolSelect: (tool: PlacementTool) => void;
  activeTool: PlacementTool;
}

export const PlacementTools: React.FC<PlacementToolsProps> = ({ onToolSelect, activeTool }) => {
  const coins = useGameStore((s) => s.coins);

  const tools = [
    { id: 'serre' as PlacementTool, label: '🏡 Serre', cost: 500, description: '6m × 4m - Protection contre le gel' },
    { id: 'tree' as PlacementTool, label: '🌳 Arbre', cost: 100, description: 'Fruitier ou décoratif' },
    { id: 'hedge' as PlacementTool, label: '🌿 Haie', cost: 50, description: 'Délimitation de zones' },
    { id: 'tank' as PlacementTool, label: '💧 Cuve', cost: 200, description: 'Récupération eau de pluie' },
    { id: 'shed' as PlacementTool, label: '🏚️ Cabane', cost: 300, description: 'Stockage outils' },
  ];

  return (
    <div className="placement-tools-panel">
      <div className="tools-header">
        <span className="tools-icon">🛠️</span>
        <span className="tools-title">Outils de placement</span>
        <span className="tools-coins">💰 {coins}</span>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          const canAfford = coins >= tool.cost;

          return (
            <motion.button
              key={tool.id}
              onClick={() => canAfford && onToolSelect(isActive ? 'none' : tool.id)}
              className={`tool-button ${isActive ? 'active' : ''} ${!canAfford ? 'disabled' : ''}`}
              whileHover={canAfford ? { scale: 1.05, y: -4 } : {}}
              whileTap={canAfford ? { scale: 0.95 } : {}}
            >
              <div className="tool-icon">{tool.label.split(' ')[0]}</div>
              <div className="tool-info">
                <div className="tool-name">{tool.label.split(' ')[1]}</div>
                <div className="tool-cost">{tool.cost} 💰</div>
              </div>
              <div className="tool-description">{tool.description}</div>
              {isActive && (
                <motion.div
                  className="tool-active-indicator"
                  layoutId="activeToolIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {activeTool !== 'none' && (
        <motion.div
          className="tool-instructions"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="instruction-text">
            💡 Cliquez sur la grille pour placer votre {tools.find(t => t.id === activeTool)?.label}
          </p>
          <button
            onClick={() => onToolSelect('none')}
            className="cancel-button"
          >
            ✖️ Annuler
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PlacementTools;
