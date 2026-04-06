'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import GardenPlanView from './GardenPlanView';
import GardenCardsView from './GardenCardsView';
import JardinPlacementControls from './JardinPlacementControls';
import '@/styles/garden.css';

type GardenView = 'plan' | 'cards';

export const Jardin: React.FC = () => {
  const [view, setView] = useState<GardenView>('plan');
  const gardenPlants = useGameStore((s) => s.gardenPlants);

  // Extract plant data from nested structure
  const plants = gardenPlants.map((gp: any) => gp.plant);

  // Stats
  const aArroser = plants.filter((p: any) => p.waterLevel < 30).length;
  const pretes = plants.filter((p: any) => p.stage >= 6).length;

  return (
    <div className="garden-page-container">
      {/* Header */}
      <div className="garden-header">
        <h1 className="garden-title">🌱 Mon Jardin</h1>

        {/* Toggle Views */}
        <div className="view-toggle-buttons">
          <button
            onClick={() => setView('plan')}
            className={`toggle-btn ${view === 'plan' ? 'active' : ''}`}
          >
            📍 Vue Plan
          </button>
          <button
            onClick={() => setView('cards')}
            className={`toggle-btn ${view === 'cards' ? 'active' : ''}`}
          >
            🎴 Vue Cartes
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="garden-stats-bar">
        <div className="stat-pill">
          <span className="stat-icon">🌱</span>
          <span className="stat-value">{plants.length} plantes</span>
        </div>
        <div className="stat-pill">
          <span className="stat-icon">💧</span>
          <span className="stat-value">{aArroser} à arroser</span>
        </div>
        <div className="stat-pill">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{pretes} prêtes</span>
        </div>
      </div>

      {/* Contrôles de placement */}
      <JardinPlacementControls />

      {/* Contenu principal */}
      <AnimatePresence mode="wait">
        {view === 'plan' ? (
          <motion.div
            key="plan-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <GardenPlanView />
          </motion.div>
        ) : (
          <motion.div
            key="cards-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GardenCardsView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jardin;