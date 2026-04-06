'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { PLANTS } from '@/lib/ai-engine';
import type { SeedRow } from './SeedRowPainter';

interface GardenPlanViewProps {
  seedRows?: SeedRow[];
}

const GardenPlanView: React.FC<GardenPlanViewProps> = ({ seedRows = [] }) => {
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const gardenSerreZones = useGameStore((s) => s.gardenSerreZones);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getStageSprite = (plantDefId: string, stage: number) =>
    `/plants/${plantDefId}-stage-${Math.min(stage, 6)}.png`;

  const getWaterColor = (level: number) => {
    if (level > 60) return '#4ecdc4';
    if (level > 30) return '#f9d423';
    return '#ff6b6b';
  };

  // ── Dessine les rangs de semences sur le canvas overlay ──────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!seedRows || seedRows.length === 0) return;

    const W = canvas.width;
    const H = canvas.height;

    for (const row of seedRows) {
      if (row.points.length < 2) continue;

      // Tracé du rang
      ctx.beginPath();
      ctx.strokeStyle = row.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = row.color;
      ctx.shadowBlur = 8;
      ctx.setLineDash([8, 5]); // pointillé pour bien montrer que c'est un rang
      ctx.moveTo(row.points[0].x * W, row.points[0].y * H);
      for (let i = 1; i < row.points.length; i++) {
        ctx.lineTo(row.points[i].x * W, row.points[i].y * H);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Point de départ
      ctx.beginPath();
      ctx.arc(row.points[0].x * W, row.points[0].y * H, 5, 0, Math.PI * 2);
      ctx.fillStyle = row.color;
      ctx.fill();

      // Label du rang
      if (row.label) {
        const midIdx = Math.floor(row.points.length / 2);
        const midPt = row.points[midIdx];
        ctx.save();
        ctx.font = 'bold 11px system-ui';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(row.label, midPt.x * W + 6, midPt.y * H - 6);
        ctx.restore();
      }
    }
  }, [seedRows]);


  return (
    <div className="plan-view-container">
      <div className="garden-grid" style={{ position: 'relative' }}>

        {/* ── SERRES (background layer) ── */}
        {gardenSerreZones && gardenSerreZones.map((serre) => (
          <motion.div
            key={serre.id}
            className="serre-zone-overlay"
            style={{
              left: `${serre.x}px`, top: `${serre.y}px`,
              width: `${serre.width}px`, height: `${serre.height}px`,
              backgroundImage: 'url(/greenhouse-sprite.png)',
              backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)' }}
            onClick={() => setActiveTab('serre')}
            title="Cliquer pour accéder à la serre"
          >
            <div className="serre-label" style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)' }}>Serre</div>
          </motion.div>
        ))}

        {/* ── PLANTES ── */}
        {gardenPlants.map((gp) => {
          const plant = gp.plant;
          const plantDef = PLANTS[gp.plantDefId];
          return (
            <motion.div key={gp.id} className="plant-sprite-container"
              style={{ left: `${gp.x}px`, top: `${gp.y}px` }}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.15, zIndex: 10, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
              transition={{ type: 'spring', stiffness: 300 }}>
              <div className="plant-shadow" />
              <img src={getStageSprite(gp.plantDefId, plant.stage)} alt={plantDef?.name || 'Plante'}
                className="plant-sprite-image" draggable={false} />
              <div className="day-badge-manga">J{plant.daysSincePlanting}</div>
              <div className="water-bar-manga">
                <div className="water-fill-manga" style={{
                  height: `${plant.waterLevel}%`,
                  background: `linear-gradient(to top, ${getWaterColor(plant.waterLevel)}, #fff)`
                }} />
              </div>
              <div className="stage-dots">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`stage-dot ${i < plant.stage ? 'active' : ''}`} />
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* ── OVERLAY RANGS DE SEMENCES ── */}
        {seedRows.length > 0 && (
          <canvas
            ref={canvasRef}
            className="seed-rows-overlay"
            width={1400}
            height={800}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        )}

        {/* ── Légende rangs ── */}
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

        {gardenPlants.length === 0 && (!gardenSerreZones || gardenSerreZones.length === 0) && seedRows.length === 0 && (
          <div className="empty-garden-message">
            <span className="empty-emoji">🌱</span>
            <p>Votre jardin est vide !</p>
            <p className="empty-subtitle">Plantez vos premières graines</p>
          </div>
        )}
      </div>

      {/* Styles overlay */}
      <style>{`
        .seed-rows-legend {
          position: absolute;
          top: 10px; right: 10px;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          border-radius: 10px;
          padding: 8px 12px;
          display: flex; flex-direction: column; gap: 5px;
          z-index: 10; pointer-events: none;
        }
        .seed-row-legend-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; color: #fff; font-weight: 600;
        }
        .seed-row-legend-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default GardenPlanView;
