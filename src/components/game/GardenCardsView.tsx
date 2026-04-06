'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { PLANTS } from '@/lib/ai-engine';

const GardenCardsView: React.FC = () => {
  const gardenPlants = useGameStore((s) => s.gardenPlants);

  const getRarityBorder = (plantDefId: string) => {
    // Rarity based on plant type (can be customized later)
    const epicPlants = ['strawberry'];
    const rarePlants = ['pepper', 'basil'];
    if (epicPlants.includes(plantDefId)) return 'border-epic';
    if (rarePlants.includes(plantDefId)) return 'border-rare';
    return 'border-common';
  };

  const getStageEmoji = (stage: number) => {
    if (stage === 6) return '🌟';
    if (stage >= 4) return '🌿';
    if (stage >= 2) return '🌱';
    return '🌰';
  };

  return (
    <div className="cards-view-container">
      <div className="cards-grid">
        {gardenPlants.map((gp, index) => {
          const plant = gp.plant;
          const plantDef = PLANTS[gp.plantDefId];
          return (
            <motion.div
              key={gp.id}
              className={`plant-card-manga ${getRarityBorder(gp.plantDefId)}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                y: -12,
                rotate: 2,
                boxShadow: '0 16px 32px rgba(0,0,0,0.25)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Bordure dégradée */}
              <div className="card-gradient-border" />

              {/* Contenu de la carte */}
              <div className="card-inner-content">
                {/* Header: Stade + Jours */}
                <div className="card-header">
                  <div className="stage-indicator">
                    <span className="stage-emoji">{getStageEmoji(plant.stage)}</span>
                    <span className="stage-text">{plant.stage}/6</span>
                  </div>
                  <div className="days-badge-card">
                    J{plant.daysSincePlanting}
                  </div>
                </div>

                {/* Image centrale */}
                <div className="card-image-container">
                  <img
                    src={`/cards/card-${gp.plantDefId}.png`}
                    alt={plantDef?.name || 'Plante'}
                    className="card-plant-image"
                  />
                </div>

                {/* Nom de la plante */}
                <h3 className="plant-name-card">{plantDef?.name || 'Plante'}</h3>

                {/* Stats détaillées */}
                <div className="card-stats-container">
                  {/* Barre d'eau */}
                  <div className="stat-row-card">
                    <span className="stat-icon">💧</span>
                    <div className="stat-bar-bg">
                      <div
                        className="stat-bar-fill water"
                        style={{ width: `${plant.waterLevel}%` }}
                      />
                    </div>
                    <span className="stat-value">{plant.waterLevel}%</span>
                  </div>

                  {/* Barre de santé */}
                  <div className="stat-row-card">
                    <span className="stat-icon">❤️</span>
                    <div className="stat-bar-bg">
                      <div
                        className="stat-bar-fill health"
                        style={{ width: `${plant.health}%` }}
                      />
                    </div>
                    <span className="stat-value">{plant.health}%</span>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="card-actions">
                  <button className="action-btn water-btn" title="Arroser">
                    💧
                  </button>
                  <button className="action-btn info-btn" title="Infos">
                    ℹ️
                  </button>
                  {plant.stage === 6 && (
                    <button className="action-btn harvest-btn" title="Récolter">
                      ✅
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {gardenPlants.length === 0 && (
          <div className="empty-cards-message">
            <span className="empty-emoji">🎴</span>
            <p>Aucune plante dans votre collection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GardenCardsView;