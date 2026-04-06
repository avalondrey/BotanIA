'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

type PlacementMode = 'guided' | 'free';

export const JardinPlacementControls: React.FC = () => {
  const [mode, setMode] = useState<PlacementMode>('guided');
  const placementMode = useGameStore((s) => s.placementMode);
  const setPlacementMode = useGameStore((s) => s.setPlacementMode);

  const handleModeToggle = () => {
    const newMode = mode === 'guided' ? 'free' : 'guided';
    setMode(newMode);
    
    // Update store if function exists
    if (setPlacementMode) {
      setPlacementMode(newMode);
    }
  };

  return (
    <div className="placement-controls">
      <div className="control-label">
        <span className="label-icon">📐</span>
        <span className="label-text">Mode de placement</span>
      </div>

      <motion.button
        onClick={handleModeToggle}
        className={`mode-toggle-btn ${mode === 'free' ? 'active' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          backgroundColor: mode === 'free' ? '#4CAF50' : '#9E9E9E'
        }}
      >
        <motion.span
          className="mode-indicator"
          animate={{
            x: mode === 'free' ? 20 : 0
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        
        <div className="mode-labels">
          <span className={`mode-label ${mode === 'guided' ? 'active' : ''}`}>
            🎯 Guidé
          </span>
          <span className={`mode-label ${mode === 'free' ? 'active' : ''}`}>
            ✋ Libre
          </span>
        </div>
      </motion.button>

      {mode === 'free' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mode-description"
        >
          <p className="description-text">
            💡 Cliquez n'importe où sur la grille pour placer vos plantes librement
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default JardinPlacementControls;
