'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { PLANTS } from '@/lib/ai-engine';

const GardenPlanView: React.FC = () => {
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  const getStageSprite = (plantDefId: string, stage: number) => {
    return `/plants/${plantDefId}-stage-${Math.min(stage, 6)}.png`;
  };

  const getWaterColor = (level: number) => {
    if (level > 60) return '#4ecdc4';
    if (level > 30) return '#f9d423';
    return '#ff6b6b';
  };

  const handleSerreClick = (serreId: string) => {
    // Naviguer vers l'onglet Serre
    setActiveTab('serre');
  };

  return (
    <div className="plan-view-container">
      {/* Grille de terrain */}
      <div className="garden-grid">
        {/* SERRES - Render first (background layer) */}
        {gardenSerreZones && gardenSerreZones.map((serre) => (
          <motion.div
            key={serre.id}
            className="serre-zone-overlay"
            style={{
              left: `${serre.x}px`,
              top: `${serre.y}px`,
              width: `${serre.width}px`,
              height: `${serre.height}px`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)'
            }}
            onClick={() => handleSerreClick(serre.id)}
            title="Cliquer pour accéder à la serre"
          >
            {/* Icône serre */}
            <div className="serre-icon">🏡</div>
            <div className="serre-label">Serre</div>
          </motion.div>
        ))}

        {/* PLANTES - Render on top */}
        {gardenPlants.map((gp) => {
          const plant = gp.plant;
          const plantDef = PLANTS[gp.plantDefId];
          return (
            <motion.div
              key={gp.id}
              className="plant-sprite-container"
              style={{
                left: `${gp.x}px`,
                top: `${gp.y}px`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{
                scale: 1.15,
                zIndex: 10,
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Ombre portée */}
              <div className="plant-shadow" />

              {/* Sprite de la plante */}
              <img
                src={getStageSprite(gp.plantDefId, plant.stage)}
                alt={plantDef?.name || 'Plante'}
                className="plant-sprite-image"
                draggable={false}
              />

              {/* Badge Jours */}
              <div className="day-badge-manga">
                J{plant.daysSincePlanting}
              </div>

              {/* Barre d'eau */}
              <div className="water-bar-manga">
                <div
                  className="water-fill-manga"
                  style={{
                    height: `${plant.waterLevel}%`,
                    background: `linear-gradient(to top, ${getWaterColor(plant.waterLevel)}, #fff)`
                  }}
                />
              </div>

              {/* Indicateur de stade */}
              <div className="stage-dots">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`stage-dot ${i < plant.stage ? 'active' : ''}`}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}

        {gardenPlants.length === 0 && (!gardenSerreZones || gardenSerreZones.length === 0) && (
          <div className="empty-garden-message">
            <span className="empty-emoji">🌱</span>
            <p>Votre jardin est vide !</p>
            <p className="empty-subtitle">Plantez vos premières graines</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenPlanView;
