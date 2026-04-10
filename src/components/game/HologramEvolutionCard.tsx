/**
 * 🌱 HologramEvolutionCard — Carte de croissance enrichie
 * Affiche GDD, eau réelle, sol, compagnonnage, maladies pour chaque plante du jardin
 */
'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { PLANTS } from '@/lib/ai-engine';
import { useAgroData } from '@/hooks/useAgroData';
import { getGDDConfig } from '@/lib/gdd-engine';

interface HologramProps {
  plantId?:   string;
  plantType?: string;
}

const STAGE_LABELS = ['🌰 Graine','🌱 Levée','🌿 Plantule','🪴 Croissance','🌸 Floraison','🍅 Récolte'];
const STAGE_COLORS = ['#94a3b8','#86efac','#4ade80','#22c55e','#f97316','#ef4444'];

export function HologramEvolution({ plantId, plantType = 'tomato' }: HologramProps) {
  const gardenPlants = useGameStore(s => s.gardenPlants);
  const realWeather  = useGameStore(s => s.realWeather);
  const agro         = useAgroData();

  const initGp = plantId ? gardenPlants.find(p => p.id === plantId) : gardenPlants[0];
  const [selectedId, setSelectedId] = useState<string>(initGp?.id ?? '');

  const selectedGp = gardenPlants.find(p => p.id === selectedId) ?? gardenPlants[0];
  const agroData   = agro.plants.find(p => p.plantId === selectedGp?.id);
  const plantDef   = selectedGp ? PLANTS[selectedGp.plantDefId] : PLANTS[plantType];
  const plant      = selectedGp?.plant;
  const gddCfg     = getGDDConfig(selectedGp?.plantDefId ?? plantType);

  const rw       = realWeather as any;
  const tMean    = rw?.current?.temperature ?? 18;
  const humidity = rw?.current?.humidity    ?? 65;

  if (!plantDef) return (
    <div className="holo-wrap">
      <div style={{ textAlign:'center', padding:40, color:'#888' }}>
        🌱 Aucune plante dans le jardin.<br/>
        <small>Transplantz depuis la Pépinière pour voir les données de croissance.</small>
      </div>
    </div>
  );

  const stage      = plant?.stage ?? 0;
  const stageColor = STAGE_COLORS[Math.min(stage, 5)];
  const imgId      = selectedGp?.plantDefId ?? plantType;
  const stageDurs  = ((plantDef as any).stageDurations as number[] | undefined) ?? [];
  const cropKc     = ((plantDef as any).cropCoefficient as number | undefined);

  return (
    <div className="holo-wrap">

      {/* ── Sélecteur de plantes ── */}
      {gardenPlants.length > 0 && (
        <div className="holo-selector">
          <div className="holo-sel-label">🌿 Sélectionner une plante</div>
          {gardenPlants.slice(0, 10).map(gp => {
            const def  = PLANTS[gp.plantDefId];
            const a    = agro.plants.find(p => p.plantId === gp.id);
            return (
              <button key={gp.id}
                className={`holo-sel-btn ${gp.id === selectedId ? 'holo-sel-active' : ''}`}
                onClick={() => setSelectedId(gp.id)}
                title={`${def?.name ?? gp.plantDefId} — J${gp.plant.daysSincePlanting}`}
              >
                <img src={`/plants/${gp.plantDefId}-stage-${Math.min(gp.plant.stage, 6)}.png`}
                  alt={def?.name ?? ''} style={{ width:28, height:28, objectFit:'contain' }} />
                {a && a.waterUrgency !== 'ok' && (
                  <span className="holo-sel-badge">{a.waterUrgency === 'critique' ? '🔴' : '⚠️'}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Image centrale + stade ── */}
      <div className="holo-stage-card" style={{ borderColor: stageColor }}>
        <div className="holo-plant-img-wrap" style={{ background: `${stageColor}18` }}>
          <img src={`/plants/${imgId}-stage-${Math.min(stage, 6)}.png`}
            alt={plantDef.name} className="holo-plant-img" />
          <div className="holo-stage-ring"
            style={{ borderColor: stageColor, boxShadow: `0 0 20px ${stageColor}88` }} />
        </div>
        <div className="holo-plant-name">{plantDef.name}</div>
        <div className="holo-stage-label" style={{ color: stageColor }}>
          {STAGE_LABELS[Math.min(stage, 5)]} — Stade {stage}/6
        </div>
        {agroData && (
          <div className="holo-gdd-bar-wrap">
            <div className="holo-gdd-bar-bg">
              <div className="holo-gdd-bar-fill"
                style={{ width: `${agroData.gddProgressPct}%`, background: stageColor }} />
            </div>
            <span className="holo-gdd-pct">{agroData.gddProgressPct.toFixed(0)}%</span>
          </div>
        )}
        <div className="holo-days">
          {plant ? `J${plant.daysSincePlanting}` : '—'}
          {agroData && agroData.daysToNextStage < 99 && (
            <span className="holo-days-next"> · {agroData.daysToNextStage}j prochain stade</span>
          )}
        </div>
      </div>

      {/* ── Grille agronomique ── */}
      {agroData ? (
        <div className="holo-data-grid">
          <div className="holo-data-card">
            <div className="holo-dc-title">💧 Eau</div>
            <div className="holo-dc-main">{agroData.needLPerDay.toFixed(2)} L/j</div>
            <div className="holo-dc-sub">
              {agroData.waterSavingPct > 0 && <span className="holo-save">−{agroData.waterSavingPct}%</span>}
              {' '}niveau {plant?.waterLevel ?? 0}%
            </div>
            <div className="holo-mini-bar">
              <div style={{ width:`${plant?.waterLevel ?? 0}%`, height:'100%', borderRadius:3,
                background:(plant?.waterLevel??0)<15?'#ef4444':(plant?.waterLevel??0)<30?'#f97316':'#22c55e' }} />
            </div>
            {agroData.hydroBreakdown.length > 0 && (
              <div className="holo-breakdown">
                {agroData.hydroBreakdown.slice(0,3).map((b,i)=>(
                  <span key={i} className="holo-chip">{b.emoji}−{b.savingMm.toFixed(1)}mm</span>
                ))}
              </div>
            )}
            {agroData.waterUrgency !== 'ok' && (
              <div className={`holo-alert ${agroData.waterUrgency==='critique'?'holo-alert-red':'holo-alert-orange'}`}>
                {agroData.waterUrgency==='critique'?'🔴 CRITIQUE':'⚠️ URGENT'} — Arroser
              </div>
            )}
          </div>

          <div className="holo-data-card">
            <div className="holo-dc-title">🌡️ GDD</div>
            <div className="holo-dc-main">+{agroData.gddToday.toFixed(1)}/j</div>
            <div className="holo-dc-sub">Base {gddCfg.tBase}°C · Max {gddCfg.tCap}°C</div>
            <div className="holo-dc-sub">{tMean}°C ambiant</div>
          </div>

          <div className="holo-data-card">
            <div className="holo-dc-title">🌍 Sol</div>
            <div className="holo-dc-main" style={{color:agroData.soilTempOk?'#86efac':'#93c5fd'}}>
              {agroData.soilTempC}°C
            </div>
            <div className="holo-dc-sub" style={{color:agroData.soilTempOk?'#86efac':'#f97316'}}>
              {agroData.soilTempOk?'✅ Favorable':'❄️ Trop froid'}
            </div>
            <div className="holo-dc-sub" style={{fontSize:9,whiteSpace:'normal'}}>
              {agroData.sowingAdvice.slice(0,48)}
            </div>
          </div>

          <div className="holo-data-card">
            <div className="holo-dc-title">🤝 Voisinage</div>
            <div className="holo-dc-main" style={{
              color:agroData.companionScore==='excellent'?'#86efac':
                    agroData.companionScore==='bon'?'#5eead4':
                    agroData.companionScore==='mauvais'?'#fca5a5':'#cbd5e1'
            }}>
              {agroData.companionScore==='excellent'?'✨ Excellent':
               agroData.companionScore==='bon'?'✅ Bon':
               agroData.companionScore==='mauvais'?'⚔️ Conflit':'— Neutre'}
            </div>
            <div className="holo-dc-sub" style={{fontSize:9,whiteSpace:'normal',lineHeight:1.4}}>
              {agroData.companionTip}
            </div>
          </div>

          <div className="holo-data-card" style={{gridColumn:'1 / -1'}}>
            <div className="holo-dc-title">🦠 Phytosanitaire</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
              <span className="holo-disease-pill" style={{
                background:agroData.mildewRisk>0.5?'rgba(239,68,68,.2)':'rgba(34,197,94,.1)',
                color:agroData.mildewRisk>0.5?'#fca5a5':'#86efac'
              }}>🌧️ Mildiou {(agroData.mildewRisk*100).toFixed(0)}%</span>
              <span className="holo-disease-pill" style={{
                background:agroData.powderyMildewRisk>0.5?'rgba(239,68,68,.2)':'rgba(34,197,94,.1)',
                color:agroData.powderyMildewRisk>0.5?'#fca5a5':'#86efac'
              }}>🌞 Oïdium {(agroData.powderyMildewRisk*100).toFixed(0)}%</span>
              <span className="holo-disease-pill" style={{background:'rgba(255,255,255,.06)',color:'#aaa'}}>
                💧 HR {humidity}%
              </span>
            </div>
            {agroData.diseaseAlert !== 'none' && (
              <div className="holo-dc-sub" style={{color:'#fca5a5',marginTop:6,fontSize:10}}>
                {agroData.diseaseMessage}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{textAlign:'center',padding:20,color:'#666',fontSize:12}}>
          Données agronomiques non disponibles pour cette plante
        </div>
      )}

      {/* ── Timeline stades ── */}
      <div className="holo-timeline">
        {STAGE_LABELS.map((label, i) => (
          <div key={i}
            className={`holo-tl-item ${i<=stage?'holo-tl-done':'holo-tl-todo'}`}
            style={i===stage?{borderColor:stageColor,background:`${stageColor}22`}:{}}
          >
            <div className="holo-tl-dot" style={{background:i<=stage?stageColor:'#334155'}} />
            <div className="holo-tl-label">{label}</div>
            {stageDurs[i]!==undefined && <div className="holo-tl-days">{stageDurs[i]}j</div>}
          </div>
        ))}
      </div>

      {/* ── Pied de carte ── */}
      <div className="holo-gdd-info">
        <span>🌡️ Tbase {gddCfg.tBase}°C</span>
        <span>🔺 Tmax {gddCfg.tCap}°C</span>
        <span>📅 Récolte ~{plantDef.realDaysToHarvest}j</span>
        <span>💧 Kc {cropKc?.toFixed(1) ?? '1.0'}</span>
      </div>

      <style>{`
        .holo-wrap{padding:16px;background:linear-gradient(135deg,#0d1b2a,#1b2838);color:#fff;border-radius:16px;font-family:system-ui,sans-serif;display:flex;flex-direction:column;gap:14px}
        .holo-sel-label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;width:100%;margin-bottom:2px}
        .holo-selector{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
        .holo-sel-btn{position:relative;width:40px;height:40px;border-radius:10px;border:2px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .holo-sel-btn:hover{border-color:rgba(255,255,255,.35);transform:scale(1.08)}
        .holo-sel-active{border-color:#22c55e!important;background:rgba(34,197,94,.15)!important}
        .holo-sel-badge{position:absolute;top:-4px;right:-4px;font-size:10px}
        .holo-stage-card{border:2px solid;border-radius:14px;padding:16px;text-align:center;background:rgba(255,255,255,.05)}
        .holo-plant-img-wrap{position:relative;width:120px;height:120px;margin:0 auto 10px;border-radius:50%;display:flex;align-items:center;justify-content:center}
        .holo-plant-img{width:90px;height:90px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4))}
        .holo-stage-ring{position:absolute;inset:0;border-radius:50%;border:3px solid;animation:holo-pulse 2s ease-in-out infinite}
        @keyframes holo-pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        .holo-plant-name{font-size:18px;font-weight:800;margin-bottom:3px}
        .holo-stage-label{font-size:13px;font-weight:700;margin-bottom:8px}
        .holo-gdd-bar-wrap{display:flex;align-items:center;gap:8px;margin-bottom:4px}
        .holo-gdd-bar-bg{flex:1;height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
        .holo-gdd-bar-fill{height:100%;border-radius:4px;transition:width .5s}
        .holo-gdd-pct{font-size:11px;font-weight:700;color:#aaa;min-width:30px;text-align:right}
        .holo-days{font-size:12px;color:#888}
        .holo-days-next{color:#90caf9;font-weight:600}
        .holo-data-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .holo-data-card{background:rgba(255,255,255,.06);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:3px}
        .holo-dc-title{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px}
        .holo-dc-main{font-size:16px;font-weight:800;color:#e2e8f0}
        .holo-dc-sub{font-size:10px;color:#94a3b8}
        .holo-save{color:#86efac;font-weight:800;font-size:10px}
        .holo-mini-bar{height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;margin-top:4px}
        .holo-breakdown{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px}
        .holo-chip{background:rgba(34,197,94,.15);color:#86efac;border-radius:4px;padding:1px 5px;font-size:8px;font-weight:700}
        .holo-alert{font-size:9px;font-weight:800;text-align:center;padding:3px 6px;border-radius:6px;margin-top:4px}
        .holo-alert-red{background:rgba(239,68,68,.2);color:#fca5a5}
        .holo-alert-orange{background:rgba(249,115,22,.15);color:#fdba74}
        .holo-disease-pill{padding:3px 8px;border-radius:7px;font-size:10px;font-weight:700;border:1px solid rgba(255,255,255,.08)}
        .holo-timeline{display:flex;gap:4px;overflow-x:auto;padding-bottom:2px}
        .holo-tl-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border-radius:9px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);min-width:70px;text-align:center;flex-shrink:0;transition:all .2s}
        .holo-tl-done{border-color:rgba(34,197,94,.3)!important;background:rgba(34,197,94,.06)!important}
        .holo-tl-todo{opacity:.45}
        .holo-tl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
        .holo-tl-label{font-size:9px;font-weight:700;color:#ccc}
        .holo-tl-days{font-size:8px;color:#64748b}
        .holo-gdd-info{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;font-size:10px;color:#64748b;padding:6px;background:rgba(255,255,255,.03);border-radius:8px}
        .holo-gdd-info span{font-weight:600}
      `}</style>
    </div>
  );
}
