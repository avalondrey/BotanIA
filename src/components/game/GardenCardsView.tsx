'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { PLANTS } from '@/lib/ai-engine';
import { useAgroData } from '@/hooks/useAgroData';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getRarityBorder = (id: string) =>
  id === 'strawberry' ? 'border-epic' : ['pepper','basil'].includes(id) ? 'border-rare' : 'border-common';

const getStageEmoji = (s: number) =>
  s === 6 ? '🌟' : s >= 4 ? '🌿' : s >= 2 ? '🌱' : '🌰';

const DISEASE_COLOR: Record<string,'#fca5a5'|'#fde68a'|'#86efac'> = {
  danger: '#fca5a5', attention: '#fde68a', none: '#86efac',
};
const COMPANION_COLOR: Record<string, string> = {
  excellent: '#86efac', bon: '#5eead4', neutre: '#cbd5e1', mauvais: '#fca5a5',
};

export default function GardenCardsView() {
  const gardenPlants = useGameStore(s => s.gardenPlants);
  const agro         = useAgroData();

  return (
    <div className="cards-view-container">

      {/* ── Bandeau global terrain ── */}
      <div className="agro-global-bar">
        <div className="agro-gb-item">
          <span className="agro-gb-label">🌡️ Sol</span>
          <span className="agro-gb-val">{agro.soilTemp10cm.toFixed(1)}°C</span>
        </div>
        <div className="agro-gb-item">
          <span className="agro-gb-label">💧 ET0</span>
          <span className="agro-gb-val">{agro.et0Daily.toFixed(1)}mm/j</span>
        </div>
        <div className="agro-gb-item">
          <span className="agro-gb-label">🌧️ Pluie</span>
          <span className="agro-gb-val">{agro.precipTodayMm.toFixed(1)}mm</span>
        </div>
        <div className="agro-gb-item">
          <span className="agro-gb-label">🌿 Éco eau</span>
          <span className="agro-gb-val" style={{color:'#86efac'}}>−{agro.totalSavingPct}%</span>
        </div>
        <div className="agro-gb-item">
          <span className="agro-gb-label">🤝 Compagnon</span>
          <span className="agro-gb-val" style={{color: agro.companionGlobalScore >= 0 ? '#86efac' : '#fca5a5'}}>
            {agro.companionGlobalScore >= 0 ? '+' : ''}{agro.companionGlobalScore}
          </span>
        </div>
        <div className="agro-gb-item">
          <span className="agro-gb-label">🦠 Mildiou</span>
          <span className="agro-gb-val" style={{color: agro.mildewRiskAvg > 0.5 ? '#fca5a5' : '#86efac'}}>
            {(agro.mildewRiskAvg * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="cards-grid">
        {gardenPlants.map((gp, index) => {
          const plant   = gp.plant;
          const def     = PLANTS[gp.plantDefId];
          const a       = agro.plants.find(p => p.plantId === gp.id);

          return (
            <motion.div key={gp.id}
              className={`plant-card-manga ${getRarityBorder(gp.plantDefId)}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -10, rotate: 1, boxShadow: '0 16px 32px rgba(0,0,0,.25)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="card-gradient-border" />
              <div className="card-inner-content">

                {/* ── Header ── */}
                <div className="card-header">
                  <div className="stage-indicator">
                    <span className="stage-emoji">{getStageEmoji(plant.stage)}</span>
                    <span className="stage-text">{plant.stage}/6</span>
                  </div>
                  <div className="days-badge-card">J{plant.daysSincePlanting}</div>
                </div>

                {/* ── Image ── */}
                <div className="card-image-container">
                  <img src={`/cards/card-${gp.plantDefId}.png`} alt={def?.name || 'Plante'}
                    className="card-plant-image" />
                  {/* Badge maladie sur l'image */}
                  {a && a.diseaseAlert !== 'none' && (
                    <div className="card-disease-badge"
                      style={{ background: a.diseaseAlert === 'danger' ? '#7c3aed' : '#d97706' }}>
                      🦠 {a.diseaseAlert === 'danger' ? 'Danger' : 'Attention'}
                    </div>
                  )}
                </div>

                <h3 className="plant-name-card">{def?.name || 'Plante'}</h3>

                {/* ── Stats eau + GDD ── */}
                <div className="card-stats-container">
                  {/* Eau */}
                  <div className="stat-row-card">
                    <span className="stat-icon">💧</span>
                    <div className="stat-bar-bg">
                      <div className="stat-bar-fill water" style={{ width: `${plant.waterLevel}%` }} />
                    </div>
                    <span className="stat-value">{plant.waterLevel}%</span>
                  </div>
                  {/* Santé */}
                  <div className="stat-row-card">
                    <span className="stat-icon">❤️</span>
                    <div className="stat-bar-bg">
                      <div className="stat-bar-fill health" style={{ width: `${plant.health}%` }} />
                    </div>
                    <span className="stat-value">{plant.health}%</span>
                  </div>
                  {/* GDD progression */}
                  {a && (
                    <div className="stat-row-card">
                      <span className="stat-icon">🌡️</span>
                      <div className="stat-bar-bg">
                        <div className="stat-bar-fill gdd"
                          style={{ width: `${a.gddProgressPct}%`, background: 'linear-gradient(90deg,#fbbf24,#f97316)' }} />
                      </div>
                      <span className="stat-value" style={{fontSize:9}}>{a.gddProgressPct.toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                {/* ── Bloc agronomique ── */}
                {a && (
                  <div className="card-agro-block">

                    {/* Eau réelle avec économies */}
                    <div className="agro-row" title={a.hydroBreakdown.map(b=>`${b.emoji}${b.source} -${b.savingMm.toFixed(2)}mm`).join(' | ')}>
                      <span className="agro-row-label">💧 Besoin réel</span>
                      <span className="agro-row-val">
                        {a.needLPerDay.toFixed(2)}L/j
                        {a.waterSavingPct > 0 && (
                          <span className="agro-saving">−{a.waterSavingPct}%</span>
                        )}
                      </span>
                    </div>

                    {/* Économies détail (si > 0) */}
                    {a.hydroBreakdown.length > 0 && (
                      <div className="agro-savings-mini">
                        {a.hydroBreakdown.slice(0,3).map((b,i) => (
                          <span key={i} className="agro-saving-chip">
                            {b.emoji}−{b.savingMm.toFixed(1)}mm
                          </span>
                        ))}
                      </div>
                    )}

                    {/* GDD */}
                    <div className="agro-row">
                      <span className="agro-row-label">🌱 GDD/j</span>
                      <span className="agro-row-val">
                        +{a.gddToday.toFixed(1)}
                        <span className="agro-dim"> → {a.daysToNextStage}j stade</span>
                      </span>
                    </div>

                    {/* Sol */}
                    <div className="agro-row">
                      <span className="agro-row-label">🌍 Sol</span>
                      <span className="agro-row-val" style={{color: a.soilTempOk ? '#86efac' : '#93c5fd'}}>
                        {a.soilTempC}°C {a.soilTempOk ? '✅' : '❄️ trop froid'}
                      </span>
                    </div>

                    {/* Compagnonnage */}
                    <div className="agro-row">
                      <span className="agro-row-label">🤝 Voisinage</span>
                      <span className="agro-row-val"
                        style={{ color: COMPANION_COLOR[a.companionScore] }}>
                        {a.companionScore === 'excellent' ? '✨ Excellent' :
                         a.companionScore === 'bon'       ? '✅ Bon' :
                         a.companionScore === 'mauvais'   ? '⚠️ Conflit' : '— Neutre'}
                      </span>
                    </div>
                    {a.companionScore !== 'neutre' && (
                      <div className="agro-companion-tip">{a.companionTip}</div>
                    )}

                    {/* Maladies */}
                    {a.diseaseAlert !== 'none' && (
                      <div className="agro-disease-row"
                        style={{ color: DISEASE_COLOR[a.diseaseAlert] }}>
                        {a.diseaseMessage}
                      </div>
                    )}

                    {/* Alerte urgence arrosage */}
                    {a.waterUrgency !== 'ok' && (
                      <div className={`agro-water-alert ${a.waterUrgency === 'critique' ? 'alert-critique' : 'alert-urgent'}`}>
                        {a.waterUrgency === 'critique' ? '🔴 CRITIQUE' : '⚠️ URGENT'} — Arroser maintenant
                      </div>
                    )}
                  </div>
                )}
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


      {/* ── Styles ── */}
      <style>{`
        /* Bandeau global terrain */
        .agro-global-bar{display:flex;flex-wrap:wrap;gap:8px;padding:10px 14px;background:linear-gradient(135deg,rgba(13,27,42,.95),rgba(27,40,56,.95));border-radius:12px;margin-bottom:14px;border:1px solid rgba(255,255,255,.1)}
        .agro-gb-item{display:flex;flex-direction:column;align-items:center;min-width:55px}
        .agro-gb-label{font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
        .agro-gb-val{font-size:13px;font-weight:800;color:#e2e8f0;margin-top:1px}

        /* Bloc agronomique carte */
        .card-agro-block{background:rgba(0,0,0,.25);border-radius:8px;padding:7px 8px;margin-top:6px;display:flex;flex-direction:column;gap:3px;font-size:10px}
        .agro-row{display:flex;justify-content:space-between;align-items:center;gap:4px}
        .agro-row-label{color:#94a3b8;font-size:9px;white-space:nowrap}
        .agro-row-val{color:#e2e8f0;font-weight:700;font-size:10px;text-align:right}
        .agro-saving{color:#86efac;font-weight:800;margin-left:4px;font-size:9px}
        .agro-dim{color:#64748b;font-weight:400;font-size:9px}
        .agro-savings-mini{display:flex;flex-wrap:wrap;gap:3px;margin-top:1px;margin-bottom:2px}
        .agro-saving-chip{background:rgba(34,197,94,.15);color:#86efac;border-radius:4px;padding:1px 5px;font-size:8px;font-weight:700}
        .agro-companion-tip{font-size:8.5px;color:#94a3b8;font-style:italic;line-height:1.3;margin-top:1px}
        .agro-disease-row{font-size:9px;font-weight:700;margin-top:2px;line-height:1.3}
        .agro-water-alert{font-size:9px;font-weight:800;text-align:center;padding:3px 6px;border-radius:6px;margin-top:3px}
        .alert-critique{background:rgba(239,68,68,.25);color:#fca5a5;border:1px solid rgba(239,68,68,.4)}
        .alert-urgent{background:rgba(249,115,22,.2);color:#fdba74;border:1px solid rgba(249,115,22,.35)}

        /* Badge maladie sur image */
        .card-image-container{position:relative}
        .card-disease-badge{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);padding:2px 7px;border-radius:6px;font-size:8px;font-weight:800;color:#fff;white-space:nowrap}

        /* Barre GDD */
        .stat-bar-fill.gdd{background:linear-gradient(90deg,#fbbf24,#f97316)}
      `}</style>
    </div>
  );
}
