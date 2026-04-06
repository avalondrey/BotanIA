'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import GardenPlanView from './GardenPlanView';
import GardenCardsView from './GardenCardsView';
import JardinPlacementControls from './JardinPlacementControls';
import PlacementTools from './PlacementTools';
import SeedRowPainter, { type SeedRow } from './SeedRowPainter';
import { usePhotoStore } from '@/store/photo-store';
import '@/styles/garden.css';

type GardenView = 'plan' | 'cards' | 'rangs';
type PlacementTool = 'none' | 'serre' | 'tree' | 'hedge' | 'tank' | 'shed';

export const Jardin: React.FC = () => {
  const [view, setView] = useState<GardenView>('plan');
  const [activeTool, setActiveTool] = useState<PlacementTool>('none');
  const [seedRows, setSeedRows] = useState<SeedRow[]>([]);
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const photoCount = usePhotoStore((s) => s.photos.filter(p => p.source === 'jardin').length);

  const plants = gardenPlants.map((gp: any) => gp.plant);
  const aArroser = plants.filter((p: any) => p.waterLevel < 30).length;
  const pretes = plants.filter((p: any) => p.stage >= 6).length;

  return (
    <div className="garden-page-container">

      {/* ── Header ── */}
      <div className="garden-header">
        <h1 className="garden-title">🌱 Mon Jardin</h1>
        <div className="view-toggle-buttons">
          <button onClick={() => setView('plan')} className={`toggle-btn ${view === 'plan' ? 'active' : ''}`}>
            📍 Vue Plan
          </button>
          <button onClick={() => setView('cards')} className={`toggle-btn ${view === 'cards' ? 'active' : ''}`}>
            🎴 Vue Cartes
          </button>
          <button onClick={() => setView('rangs')} className={`toggle-btn toggle-btn-camera ${view === 'rangs' ? 'active' : ''}`}>
            📸 Rangs {seedRows.length > 0 && <span className="toggle-badge">{seedRows.length}</span>}
            {photoCount > 0 && <span className="toggle-badge-photo">📷{photoCount}</span>}
          </button>
        </div>
      </div>

      {/* ── Stats rapides ── */}
      <div className="garden-stats-bar">
        <div className="stat-pill"><span className="stat-icon">🌱</span><span className="stat-value">{plants.length} plantes</span></div>
        <div className="stat-pill"><span className="stat-icon">💧</span><span className="stat-value">{aArroser} à arroser</span></div>
        <div className="stat-pill"><span className="stat-icon">✅</span><span className="stat-value">{pretes} prêtes</span></div>
        {seedRows.length > 0 && (
          <div className="stat-pill stat-pill-rows">
            <span className="stat-icon">🌾</span>
            <span className="stat-value">{seedRows.length} rang{seedRows.length > 1 ? 's' : ''} tracé{seedRows.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Contrôles placement (seulement vue plan) ── */}
      {view !== 'rangs' && <JardinPlacementControls />}
      {view !== 'rangs' && <PlacementTools onToolSelect={setActiveTool} activeTool={activeTool} />}

      {/* ── Contenu principal ── */}
      <AnimatePresence mode="wait">

        {view === 'plan' && (
          <motion.div key="plan-view"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <GardenPlanView seedRows={seedRows} />
          </motion.div>
        )}

        {view === 'cards' && (
          <motion.div key="cards-view"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <GardenCardsView />
          </motion.div>
        )}

        {view === 'rangs' && (
          <motion.div key="rangs-view"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <SeedRowPainter onRowsChange={setSeedRows} />
            {seedRows.length > 0 && (
              <motion.div className="rangs-sync-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ✅ {seedRows.length} rang{seedRows.length > 1 ? 's' : ''} synchronisé{seedRows.length > 1 ? 's' : ''} — visible{seedRows.length > 1 ? 's' : ''} dans la <strong>Vue Plan</strong>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      <style>{`
        .toggle-btn-camera { position: relative; }
        .toggle-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: #30D158; color: #fff; font-size: 10px; font-weight: 800;
          border-radius: 50%; width: 18px; height: 18px; margin-left: 5px;
        }
        .toggle-badge-photo {
          display: inline-flex; align-items: center;
          background: #f97316; color: #fff; font-size: 9px; font-weight: 800;
          border-radius: 10px; padding: 0 5px; margin-left: 4px; height: 16px;
        }
        .stat-pill-rows { background: rgba(48,209,88,.12); border: 1px solid rgba(48,209,88,.3); }
        .rangs-sync-hint {
          margin-top: 12px; padding: 12px 16px;
          background: rgba(48,209,88,.12); border: 1px solid rgba(48,209,88,.3);
          border-radius: 12px; font-size: 13px; color: #30D158; text-align: center;
        }
        .rangs-sync-hint strong { color: #fff; }
      `}</style>
    </div>
  );
};

export default Jardin;
