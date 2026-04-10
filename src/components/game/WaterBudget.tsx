'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import {
  type RainwaterTank, type WaterBudgetState, type WaterSourceMode,
  type WeeklyWaterBudget, type WateringAlert,
  loadWaterBudgetState, saveWaterBudgetState, defaultWaterState,
  calcWeeklyBudget, updateTanksAfterRain, addManualWater,
  calcWateringAlerts, markWatered, resetDailyWatering,
} from '@/lib/water-budget';
import {
  type HydroContext, type AtmosphericInputs, type MulchType,
  type IrrigationTech, type PermacultureElement,
  SOIL_PRESETS, defaultHydroContext, calcFullHydroNeed,
} from '@/lib/hydro-engine';
import { PLANTS } from '@/lib/ai-engine';
import HydroSettings from './HydroSettings';

const MODE_LABELS: Record<WaterSourceMode, { label: string; emoji: string; color: string; desc: string }> = {
  reseau:     { label: 'Réseau',          emoji: '🚰', color: '#2196f3', desc: 'Eau du réseau communal — illimitée' },
  cuve_only:  { label: 'Cuves seules',    emoji: '🛢️', color: '#1565c0', desc: 'Récupération pluie uniquement — aucun réseau' },
  cuve_bidon: { label: 'Cuves + Bidons',  emoji: '🟦', color: '#0288d1', desc: 'Cuves + apports manuels bidons/citerne livrée' },
  puit:       { label: 'Puit / Forage',   emoji: '⛏️', color: '#00695c', desc: 'Source souterraine — recharge naturelle quotidienne' },
};

function uid() { return Math.random().toString(36).slice(2, 9); }

function TankLevelBar({ tank }: { tank: RainwaterTank }) {
  const pct = tank.capacityL > 0 ? (tank.currentLevelL / tank.capacityL) * 100 : 0;
  const color = pct < 20 ? '#ef4444' : pct < 40 ? '#f97316' : tank.isPuit ? '#26a69a' : '#22c55e';
  return (
    <div className="wb-tank-bar-bg">
      <div className="wb-tank-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function WaterBudget() {
  const gardenPlants = useGameStore(s => s.gardenPlants);
  const realWeather  = useGameStore(s => s.realWeather);

  const [state, setState]       = useState<WaterBudgetState>(defaultWaterState);
  const [budget, setBudget]     = useState<WeeklyWaterBudget | null>(null);
  const [editTank, setEditTank] = useState<RainwaterTank | null>(null);
  const [showAddTank, setShowAddTank] = useState(false);
  const [manualLiters, setManualLiters] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'alertes' | 'overview' | 'tanks' | 'hydro' | 'history'>('alertes');
  const [showHydroSettings, setShowHydroSettings] = useState(false);
  useEffect(() => {
    const s = loadWaterBudgetState();
    setState(resetDailyWatering(s));
  }, []);

  // Précipitations du jour depuis Open-Meteo (mm réels)
  const precipTodayMm: number = (realWeather as any)?.today?.precipitationMm ?? 0;
  const humidityNow: number   = (realWeather as any)?.current?.humidity ?? 65;
  const tMinNow: number       = (realWeather as any)?.today?.tempMin ?? 10;
  const windNow: number       = (realWeather as any)?.current?.windSpeed ?? 10;

  // Données atmosphériques pour le moteur hydro
  const atmoNow: Partial<AtmosphericInputs> = {
    precipMm: precipTodayMm,
    humidity: humidityNow,
    tMin: tMinNow,
    tMean: (realWeather as any)?.current?.temperature ?? 18,
    windSpeed: windNow,
    sunHours: (realWeather as any)?.current?.weatherCode <= 2 ? 8 : 4,
    fogFrequency: humidityNow >= 95 && windNow < 5 ? 0.6 : humidityNow >= 90 ? 0.2 : 0,
  };

  // Alertes arrosage — intègre pluviométrie + hydro
  const wateringAlerts = useMemo(() =>
    calcWateringAlerts(
      gardenPlants as any, PLANTS as any, state.wateredTodayIds,
      precipTodayMm, state.hydroContext, atmoNow
    ),
    [gardenPlants, state.wateredTodayIds, precipTodayMm, humidityNow]
  );
  const criticalCount = wateringAlerts.filter(a => a.urgency === 'critique').length;
  const urgentCount   = wateringAlerts.filter(a => a.urgency === 'urgent').length;

  // Budget hebdo
  useEffect(() => {
    const crops = Object.entries(
      gardenPlants.reduce((acc, gp) => {
        const def = PLANTS[gp.plantDefId];
        if (!def) return acc;
        acc[gp.plantDefId] = acc[gp.plantDefId] ?? { kc: def.cropCoefficient, count: 0, name: def.name };
        acc[gp.plantDefId].count++;
        return acc;
      }, {} as Record<string, { kc: number; count: number; name: string }>)
    ).map(([, v]) => ({ name: v.name, surfaceM2: v.count * 0.25, kc: v.kc }));

    const forecast = (realWeather as any)?.forecast
      ? (realWeather as any).forecast.slice(0, 7).map((f: any) => f.precipitation ?? 0)
      : Array(7).fill(2);
    const et0 = realWeather ? Math.max(1, (realWeather.today?.tempMax - 5) * 0.1 + 2) : 3.5;

    setBudget(calcWeeklyBudget({
      tanks: state.tanks,
      crops: crops.length ? crops : [{ name: 'Jardin (vide)', surfaceM2: 1, kc: 0.8 }],
      forecastPrecipMm: forecast,
      et0Daily: et0,
      mode: state.mode,
      hydroCtx: state.hydroContext,
      atmo: atmoNow,
    }));
  }, [state, gardenPlants, realWeather]);

  const save = useCallback((s: WaterBudgetState) => { setState(s); saveWaterBudgetState(s); }, []);
  const setMode = (mode: WaterSourceMode) => save({ ...state, mode });
  const saveHydroCtx = (ctx: Partial<HydroContext>) => save({ ...state, hydroContext: ctx });

  const handleMarkWatered = (plantId: string) => save(markWatered(state, plantId));
  const handleMarkAllWatered = () => {
    let s = state;
    wateringAlerts.forEach(a => { s = markWatered(s, a.plantId); });
    save(s);
  };
  const handleAddManual = (tankId: string) => {
    const L = parseFloat(manualLiters[tankId] || '0');
    if (L <= 0) return;
    save(addManualWater(state, tankId, L, state.mode === 'cuve_bidon' ? 'Bidon' : 'Apport manuel'));
    setManualLiters(p => ({ ...p, [tankId]: '' }));
  };
  const handleSaveTank = (tank: RainwaterTank) => {
    const tanks = state.tanks.find(t => t.id === tank.id)
      ? state.tanks.map(t => t.id === tank.id ? tank : t)
      : [...state.tanks, tank];
    save({ ...state, tanks });
    setEditTank(null); setShowAddTank(false);
  };
  const handleDeleteTank = (id: string) => save({ ...state, tanks: state.tanks.filter(t => t.id !== id) });

  const totalCapacity = state.tanks.filter(t => t.isActive).reduce((s, t) => s + t.capacityL, 0);
  const totalCurrent  = state.tanks.filter(t => t.isActive).reduce((s, t) => s + t.currentLevelL, 0);
  const totalPct = totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;

  return (
    <div className="wb-wrap">

      {/* ── Header ── */}
      <div className="wb-header">
        <div>
          <h2 className="wb-title">💧 Gestion de l'eau</h2>
          <p className="wb-sub">Cuves · Puit · Récupération pluie · Alertes arrosage</p>
        </div>
        <div className="wb-header-badges">
          {criticalCount > 0 && (
            <span className="wb-badge wb-critical">🔴 {criticalCount} critique{criticalCount > 1 ? 's' : ''}</span>
          )}
          {urgentCount > 0 && (
            <span className="wb-badge wb-warning">⚠️ {urgentCount} urgent{urgentCount > 1 ? 's' : ''}</span>
          )}
          {budget && criticalCount === 0 && urgentCount === 0 && (
            <span className="wb-badge wb-ok">✅ {budget.autonomyDays >= 999 ? '∞' : `${budget.autonomyDays}j`}</span>
          )}
        </div>
      </div>

      {/* ── Source d'eau ── */}
      <div className="wb-modes">
        <div className="wb-modes-title">🔧 Source d'eau</div>
        <div className="wb-modes-grid">
          {(Object.entries(MODE_LABELS) as [WaterSourceMode, typeof MODE_LABELS.reseau][]).map(([key, val]) => (
            <button key={key}
              className={`wb-mode-btn ${state.mode === key ? 'wb-mode-active' : ''}`}
              style={state.mode === key ? { borderColor: val.color, background: `${val.color}22` } : {}}
              onClick={() => setMode(key)}>
              <span className="wb-mode-emoji">{val.emoji}</span>
              <div>
                <div className="wb-mode-label">{val.label}</div>
                <div className="wb-mode-desc">{val.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="wb-tabs">
        <button className={`wb-tab ${tab === 'alertes' ? 'wb-tab-active' : ''}`} onClick={() => setTab('alertes')}>
          💧 Arrosage
          {(criticalCount + urgentCount) > 0 && (
            <span className="wb-tab-badge">{criticalCount + urgentCount}</span>
          )}
        </button>
        <button className={`wb-tab ${tab === 'overview' ? 'wb-tab-active' : ''}`} onClick={() => setTab('overview')}>
          📊 Budget
        </button>
        <button className={`wb-tab ${tab === 'tanks' ? 'wb-tab-active' : ''}`} onClick={() => setTab('tanks')}>
          🛢️ Stocks ({state.tanks.length})
        </button>
        <button className={`wb-tab ${tab === 'hydro' ? 'wb-tab-active' : ''}`} onClick={() => setTab('hydro')}>
          🌿 Terrain
          {(state.hydroContext?.mulch || (state.hydroContext?.permaElements?.length ?? 0) > 0) && (
            <span className="wb-tab-badge" style={{ background: '#22c55e' }}>✓</span>
          )}
        </button>
        <button className={`wb-tab ${tab === 'history' ? 'wb-tab-active' : ''}`} onClick={() => setTab('history')}>
          📅 Historique
        </button>
      </div>


      {/* ══ ONG ALERTES ARROSAGE ══ */}
      {tab === 'alertes' && (
        <div className="wb-section">

          {/* Bandeau pluie si elle arrose le terrain */}
          {precipTodayMm > 0 && (
            <div className={`wb-rain-banner ${precipTodayMm >= 8 ? 'wb-rain-ok' : 'wb-rain-partial'}`}>
              <span className="wb-rain-icon">🌧️</span>
              <div>
                <div className="wb-rain-title">
                  {precipTodayMm >= 8
                    ? `${precipTodayMm.toFixed(1)}mm — Arrosage naturel suffisant aujourd'hui`
                    : `${precipTodayMm.toFixed(1)}mm — Pluie partielle (+${(precipTodayMm * 1.5).toFixed(0)}% niveau eau estimé)`}
                </div>
                <div className="wb-rain-sub">
                  {precipTodayMm >= 8
                    ? 'Toutes les alertes sont annulées — pas besoin d\'arroser'
                    : 'Les seuils d\'alerte ont été ajustés, certaines plantes peuvent encore en avoir besoin'}
                </div>
              </div>
            </div>
          )}

          {wateringAlerts.length === 0 ? (
            <div className="wb-alert-empty">
              <div style={{ fontSize: 40 }}>{precipTodayMm >= 8 ? '🌧️' : '✅'}</div>
              <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>
                {precipTodayMm >= 8
                  ? 'La pluie arrose le terrain aujourd\'hui'
                  : 'Toutes les plantes sont hydratées'}
              </p>
              <p style={{ fontSize: 12, color: '#888' }}>
                {precipTodayMm >= 8
                  ? `${precipTodayMm.toFixed(1)}mm tombés — aucun arrosage manuel nécessaire`
                  : state.wateredTodayIds.length > 0
                    ? `${state.wateredTodayIds.length} plante(s) arrosée(s) aujourd'hui`
                    : 'Aucun arrosage requis pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <div className="wb-alert-header">
                <span className="wb-alert-count">
                  {wateringAlerts.length} plante{wateringAlerts.length > 1 ? 's' : ''} à arroser
                </span>
                <button className="wb-btn-all-watered" onClick={handleMarkAllWatered}>
                  ✅ Tout arrosé
                </button>
              </div>

              {wateringAlerts.map(alert => (
                <motion.div key={alert.plantId}
                  className={`wb-alert-card ${alert.urgency === 'critique' ? 'wb-alert-critique' : 'wb-alert-urgent'}`}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>

                  <div className="wb-alert-plant">
                    <span className="wb-alert-emoji">{alert.plantEmoji}</span>
                    <div className="wb-alert-info">
                      <div className="wb-alert-name">{alert.plantName}</div>
                      <div className="wb-alert-level">
                        <div className="wb-alert-bar-bg">
                          <div className="wb-alert-bar-fill" style={{
                            width: `${alert.waterLevel}%`,
                            background: alert.urgency === 'critique' ? '#ef4444' : '#f97316'
                          }} />
                        </div>
                        <span className="wb-alert-pct">{alert.waterLevel.toFixed(0)}%</span>
                      </div>
                      <div className="wb-alert-need">≈ {alert.needL}L nécessaires</div>
                    </div>
                  </div>

                  <div className="wb-alert-right">
                    <span className={`wb-alert-badge ${alert.urgency === 'critique' ? 'wb-badge-critique' : 'wb-badge-urgent'}`}>
                      {alert.urgency === 'critique' ? '🔴 CRITIQUE' : '⚠️ URGENT'}
                    </span>
                    <button className="wb-btn-watered" onClick={() => handleMarkWatered(alert.plantId)}>
                      ✅ J'ai arrosé
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Résumé stock après arrosage */}
              {state.mode !== 'reseau' && budget && budget.deficitL > 0 && (
                <div className="wb-deficit-warn">
                  ⚠️ Stock insuffisant — il manque {budget.deficitL.toFixed(0)}L pour la semaine
                </div>
              )}
            </>
          )}
        </div>
      )}


      {/* ══ ONG BUDGET ══ */}
      {tab === 'overview' && (
        <div className="wb-section">
          {state.mode !== 'reseau' && (
            <div className="wb-total-card">
              <div className="wb-total-header">
                <span>💧 Stock total ({state.mode === 'puit' ? 'Puit + Cuves' : 'Cuves'})</span>
                <span className="wb-total-vol">{totalCurrent.toFixed(0)}L / {totalCapacity.toFixed(0)}L</span>
              </div>
              <div className="wb-total-bar">
                <div className="wb-total-fill" style={{
                  width: `${totalPct}%`,
                  background: totalPct < 20 ? '#ef4444' : totalPct < 40 ? '#f97316' : '#22c55e'
                }} />
              </div>
              <div className="wb-total-pct">{totalPct.toFixed(0)}% de capacité</div>
              {state.mode === 'puit' && (
                <div className="wb-puit-info">⛏️ Puit actif — recharge automatique ~5%/jour</div>
              )}
            </div>
          )}

          {budget && (
            <div className={`wb-budget-card ${budget.isCritical ? 'wb-budget-critical' : budget.deficitL > 0 ? 'wb-budget-warning' : 'wb-budget-ok'}`}>
              <div className="wb-budget-summary">{budget.summary}</div>
              <div className="wb-budget-grid">
                <div className="wb-budget-item">
                  <span className="wb-bi-label">🌿 Besoins cultures</span>
                  <span className="wb-bi-val">{budget.totalNeedL.toFixed(0)} L/sem</span>
                </div>
                <div className="wb-budget-item">
                  <span className="wb-bi-label">🌧️ Pluie prévue (7j)</span>
                  <span className="wb-bi-val">+{budget.rainContributionL.toFixed(0)} L</span>
                </div>
                {state.mode !== 'reseau' && (
                  <div className="wb-budget-item">
                    <span className="wb-bi-label">🛢️ Disponible cuves</span>
                    <span className="wb-bi-val">{budget.tanksAvailableL.toFixed(0)} L</span>
                  </div>
                )}
                {budget.deficitL > 0
                  ? <div className="wb-budget-item wb-deficit"><span className="wb-bi-label">❌ Déficit</span><span className="wb-bi-val">{budget.deficitL.toFixed(0)} L</span></div>
                  : <div className="wb-budget-item wb-surplus"><span className="wb-bi-label">✅ Excédent</span><span className="wb-bi-val">+{budget.surplusL.toFixed(0)} L</span></div>
                }
              </div>

              {/* Économies techniques */}
              {budget.hydroSavingsL > 0 && (
                <div className="wb-hydro-mini-banner">
                  🌿 Économies techniques : <strong>−{budget.hydroSavingsL.toFixed(0)} L</strong>
                  {budget.passiveInputsL > 0 && <span> · 💦 Passifs : −{budget.passiveInputsL.toFixed(0)} L</span>}
                  {' '}<button className="wb-btn-config-terrain" onClick={() => setTab('hydro')}>Configurer →</button>
                </div>
              )}
              {budget.hydroSavingsL === 0 && (
                <div className="wb-hydro-hint">
                  💡 <button className="wb-btn-config-terrain" onClick={() => setTab('hydro')}>Configurer votre terrain</button> pour activer les économies (paillage, oyas, permaculture...)
                </div>
              )}
            </div>
          )}

          {budget && budget.perCropNeed.length > 0 && (
            <details className="wb-crop-details">
              <summary className="wb-crop-summary">Détail par culture</summary>
              {budget.perCropNeed.map((c, i) => (
                <div key={i} className="wb-crop-row">
                  <span>{c.name}</span>
                  <span className="wb-crop-area">{c.areaM2.toFixed(1)} m²</span>
                  <span className="wb-crop-need">{c.needL.toFixed(0)} L/sem</span>
                </div>
              ))}
            </details>
          )}
        </div>
      )}

      {/* ══ ONG STOCKS / CUVES ══ */}
      {tab === 'tanks' && (
        <div className="wb-section">
          <div className="wb-tanks-header">
            <span className="wb-tanks-count">{state.tanks.length} source{state.tanks.length > 1 ? 's' : ''} d'eau</span>
            <button className="wb-add-btn" onClick={() => { setEditTank(null); setShowAddTank(true); }}>+ Ajouter</button>
          </div>

          {state.tanks.map(tank => (
            <div key={tank.id} className={`wb-tank-card ${!tank.isActive ? 'wb-tank-inactive' : ''}`}>
              <div className="wb-tank-header">
                <div className="wb-tank-dot" style={{ background: tank.isPuit ? '#26a69a' : tank.color }} />
                <span className="wb-tank-name">
                  {tank.isPuit ? '⛏️' : '🛢️'} {tank.name}
                </span>
                <div className="wb-tank-actions">
                  <button className="wb-tank-btn" onClick={() =>
                    save({ ...state, tanks: state.tanks.map(t => t.id === tank.id ? { ...t, isActive: !t.isActive } : t) })}>
                    {tank.isActive ? '⏸' : '▶'}
                  </button>
                  <button className="wb-tank-btn" onClick={() => { setEditTank(tank); setShowAddTank(true); }}>✏️</button>
                  <button className="wb-tank-btn wb-tank-del" onClick={() => handleDeleteTank(tank.id)}>🗑️</button>
                </div>
              </div>

              <TankLevelBar tank={tank} />

              <div className="wb-tank-stats">
                <span>💧 {tank.currentLevelL.toFixed(0)}L / {tank.capacityL.toFixed(0)}L</span>
                {tank.isPuit
                  ? <span>⛏️ Profondeur {tank.puitDepthM ?? '?'}m · Débit max {tank.puitDailyLimitL ?? tank.capacityL}L/j</span>
                  : <span>🏠 Toiture {tank.roofAreaM2} m² · Eff. {(tank.efficiency * 100).toFixed(0)}%</span>}
              </div>

              {/* Apport manuel uniquement pour cuves/bidons (pas pour puit) */}
              {state.mode !== 'reseau' && tank.isActive && !tank.isPuit && (
                <div className="wb-manual">
                  <input type="number" className="wb-manual-input" placeholder="Litres à ajouter"
                    min="0" value={manualLiters[tank.id] || ''}
                    onChange={e => setManualLiters(p => ({ ...p, [tank.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddManual(tank.id)} />
                  <button className="wb-manual-btn" onClick={() => handleAddManual(tank.id)}>
                    {state.mode === 'cuve_bidon' ? '🟦 Bidon' : '+ Remplir'}
                  </button>
                </div>
              )}

              {/* Puit : recharge info */}
              {tank.isPuit && tank.isActive && (
                <div className="wb-puit-recharge">
                  ♻️ Recharge naturelle ~{(tank.capacityL * 0.05).toFixed(0)}L/jour (nappe phréatique)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ ONG TERRAIN / HYDRO ══ */}
      {tab === 'hydro' && (
        <div className="wb-section">
          {/* Badge économies actives */}
          {budget && budget.hydroSavingsL > 0 && (
            <div className="wb-hydro-savings-banner">
              🌿 Techniques actives — économie cette semaine :
              <strong> {budget.hydroSavingsL.toFixed(0)} L économisés</strong>
              {budget.passiveInputsL > 0 && (
                <span> + <strong>{budget.passiveInputsL.toFixed(0)} L</strong> apports passifs (brouillard/rosée)</span>
              )}
            </div>
          )}

          <HydroSettings
            ctx={state.hydroContext ?? {}}
            onChange={saveHydroCtx}
            et0={realWeather ? Math.max(1, ((realWeather as any).today?.tempMax - 5) * 0.1 + 2) : 3.5}
            precipMm={precipTodayMm}
            humidity={humidityNow}
            tMin={tMinNow}
          />
        </div>
      )}

      {/* ══ ONG HISTORIQUE ══ */}
      {tab === 'history' && (
        <div className="wb-section">
          <div className="wb-hist-title">📅 Apports manuels récents</div>
          {state.manualAddHistory.length === 0
            ? <div className="wb-hist-empty">Aucun apport enregistré</div>
            : state.manualAddHistory.slice(0, 20).map((h, i) => (
              <div key={i} className="wb-hist-row">
                <span className="wb-hist-date">{new Date(h.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                <span className="wb-hist-vol">+{h.liters.toFixed(0)} L</span>
                {h.note && <span className="wb-hist-note">{h.note}</span>}
              </div>
          ))}
        </div>
      )}

      {/* ══ MODAL CUVE ══ */}
      <AnimatePresence>
        {showAddTank && (
          <TankEditor initial={editTank ?? undefined} onSave={handleSaveTank}
            onClose={() => { setShowAddTank(false); setEditTank(null); }} />
        )}
      </AnimatePresence>


      {/* ══ STYLES ══ */}
      <style>{`
        .wb-wrap{background:linear-gradient(135deg,#0d1b2a,#1b2838,#0d2137);color:#fff;padding:20px;border-radius:16px;font-family:system-ui,sans-serif;min-height:60vh}
        .wb-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
        .wb-title{font-size:20px;font-weight:800;margin:0 0 3px}
        .wb-sub{font-size:12px;color:#888;margin:0}
        .wb-header-badges{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
        .wb-badge{padding:4px 10px;border-radius:9px;font-size:12px;font-weight:800}
        .wb-critical{background:rgba(239,68,68,.2);border:1px solid rgba(239,68,68,.4);color:#fca5a5}
        .wb-warning{background:rgba(249,115,22,.2);border:1px solid rgba(249,115,22,.4);color:#fdba74}
        .wb-ok{background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:#86efac}

        .wb-modes{background:rgba(255,255,255,.05);border-radius:12px;padding:12px;margin-bottom:12px}
        .wb-modes-title{font-size:11px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:8px}
        .wb-modes-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
        .wb-mode-btn{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;cursor:pointer;text-align:left;transition:all .2s}
        .wb-mode-active{font-weight:700}
        .wb-mode-emoji{font-size:18px;flex-shrink:0}
        .wb-mode-label{font-size:12px;font-weight:700}
        .wb-mode-desc{font-size:10px;color:#888}

        .wb-tabs{display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap}
        .wb-tab{position:relative;padding:6px 12px;border-radius:8px;border:none;background:rgba(255,255,255,.07);color:#aaa;cursor:pointer;font-size:11px;font-weight:600;transition:all .2s}
        .wb-tab-active{background:rgba(33,150,243,.3);color:#90caf9}
        .wb-tab-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;width:16px;height:16px;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center}

        .wb-section{display:flex;flex-direction:column;gap:10px}

        /* Alertes arrosage */
        .wb-rain-banner{display:flex;align-items:flex-start;gap:10px;border-radius:10px;padding:10px 13px;margin-bottom:2px}
        .wb-rain-ok{background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3)}
        .wb-rain-partial{background:rgba(99,179,237,.1);border:1px solid rgba(99,179,237,.3)}
        .wb-rain-icon{font-size:22px;flex-shrink:0;margin-top:1px}
        .wb-rain-title{font-size:13px;font-weight:700;color:#86efac;margin-bottom:2px}
        .wb-rain-partial .wb-rain-title{color:#90cdf4}
        .wb-rain-sub{font-size:11px;color:#888}
        .wb-alert-empty{text-align:center;padding:32px 16px;color:#ccc}
        .wb-alert-header{display:flex;justify-content:space-between;align-items:center}
        .wb-alert-count{font-size:13px;font-weight:700;color:#fbbf24}
        .wb-btn-all-watered{padding:7px 14px;border-radius:9px;border:none;background:#166534;color:#bbf7d0;font-weight:700;font-size:12px;cursor:pointer}
        .wb-alert-card{border-radius:12px;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:10px}
        .wb-alert-critique{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35)}
        .wb-alert-urgent{background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3)}
        .wb-alert-plant{display:flex;align-items:center;gap:10px;flex:1}
        .wb-alert-emoji{font-size:28px;flex-shrink:0}
        .wb-alert-info{flex:1}
        .wb-alert-name{font-weight:700;font-size:14px;margin-bottom:5px}
        .wb-alert-level{display:flex;align-items:center;gap:6px;margin-bottom:3px}
        .wb-alert-bar-bg{flex:1;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden}
        .wb-alert-bar-fill{height:100%;border-radius:3px;transition:width .4s}
        .wb-alert-pct{font-size:11px;color:#aaa;white-space:nowrap}
        .wb-alert-need{font-size:11px;color:#888}
        .wb-alert-right{display:flex;flex-direction:column;align-items:flex-end;gap:7px;flex-shrink:0}
        .wb-alert-badge{padding:3px 8px;border-radius:7px;font-size:10px;font-weight:800}
        .wb-badge-critique{background:rgba(239,68,68,.25);color:#fca5a5}
        .wb-badge-urgent{background:rgba(249,115,22,.2);color:#fdba74}
        .wb-btn-watered{padding:7px 12px;border-radius:9px;border:none;background:#166534;color:#bbf7d0;font-weight:700;font-size:12px;cursor:pointer;transition:opacity .2s;white-space:nowrap}
        .wb-btn-watered:hover{opacity:.85}
        .wb-deficit-warn{background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3);border-radius:9px;padding:9px 12px;font-size:12px;color:#fdba74}

        /* Budget */
        .wb-total-card{background:rgba(255,255,255,.07);border-radius:12px;padding:12px}
        .wb-total-header{display:flex;justify-content:space-between;margin-bottom:7px;font-size:13px;font-weight:700}
        .wb-total-vol{color:#90caf9}
        .wb-total-bar{height:10px;background:rgba(255,255,255,.1);border-radius:5px;overflow:hidden;margin-bottom:4px}
        .wb-total-fill{height:100%;border-radius:5px;transition:width .5s}
        .wb-total-pct{font-size:11px;color:#888;text-align:right}
        .wb-puit-info{font-size:11px;color:#4db6ac;margin-top:5px}
        .wb-puit-recharge{font-size:11px;color:#4db6ac;margin-top:5px;padding:5px 8px;background:rgba(38,166,154,.1);border-radius:7px}
        .wb-budget-card{border-radius:12px;padding:12px}
        .wb-budget-critical{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3)}
        .wb-budget-warning{background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3)}
        .wb-budget-ok{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25)}
        .wb-budget-summary{font-size:13px;font-weight:700;margin-bottom:10px}
        .wb-budget-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .wb-budget-item{display:flex;flex-direction:column;background:rgba(255,255,255,.06);border-radius:8px;padding:7px 9px}
        .wb-bi-label{font-size:11px;color:#aaa;margin-bottom:2px}
        .wb-bi-val{font-size:14px;font-weight:800}
        .wb-deficit .wb-bi-val{color:#fca5a5}.wb-surplus .wb-bi-val{color:#86efac}
        .wb-crop-details{margin-top:9px;font-size:12px}
        .wb-crop-summary{cursor:pointer;font-weight:700;color:#90caf9;padding:4px 0}
        .wb-crop-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.06);color:#aaa}
        .wb-crop-need{color:#90caf9;font-weight:700}

        /* Cuves */
        .wb-tanks-header{display:flex;justify-content:space-between;align-items:center}
        .wb-tanks-count{font-size:13px;font-weight:700;color:#aaa}
        .wb-add-btn{padding:6px 13px;border-radius:8px;border:none;background:#1565c0;color:#fff;font-weight:700;font-size:12px;cursor:pointer}
        .wb-tank-card{background:rgba(255,255,255,.07);border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,.1)}
        .wb-tank-inactive{opacity:.5}
        .wb-tank-header{display:flex;align-items:center;gap:8px;margin-bottom:9px}
        .wb-tank-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
        .wb-tank-name{flex:1;font-weight:700;font-size:13px}
        .wb-tank-actions{display:flex;gap:3px}
        .wb-tank-btn{background:rgba(255,255,255,.1);border:none;color:#fff;border-radius:6px;padding:3px 7px;cursor:pointer;font-size:12px}
        .wb-tank-del{color:#fca5a5}
        .wb-tank-bar-bg{height:9px;background:rgba(255,255,255,.1);border-radius:5px;overflow:hidden;margin-bottom:7px}
        .wb-tank-bar-fill{height:100%;border-radius:5px;transition:width .5s}
        .wb-tank-stats{display:flex;gap:8px;font-size:11px;color:#888;flex-wrap:wrap;margin-bottom:7px}
        .wb-manual{display:flex;gap:6px;margin-top:5px}
        .wb-manual-input{flex:1;padding:7px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:12px;outline:none}
        .wb-manual-input:focus{border-color:#2196f3}
        .wb-manual-btn{padding:7px 12px;border-radius:8px;border:none;background:#0288d1;color:#fff;font-weight:700;font-size:12px;cursor:pointer}

        /* Historique */
        .wb-hist-title{font-size:13px;font-weight:700;color:#90caf9;margin-bottom:7px}
        .wb-hist-empty{font-size:12px;color:#666;text-align:center;padding:20px}
        .wb-hist-row{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(255,255,255,.05);border-radius:8px}
        .wb-hist-date{font-size:11px;color:#888;flex:1}
        .wb-hist-vol{font-size:13px;font-weight:700;color:#90caf9}
        .wb-hist-note{font-size:11px;color:#aaa}
        .wb-hydro-savings-banner{background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);border-radius:10px;padding:9px 13px;font-size:12px;color:#86efac;margin-bottom:4px}
      `}</style>
    </div>
  );
}

// ── Formulaire ajout/édition cuve ou puit ────────────────────────────────────
function TankEditor({ initial, onSave, onClose }: {
  initial?: RainwaterTank;
  onSave: (t: RainwaterTank) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<RainwaterTank>(initial ?? {
    id: uid(), name: '', capacityL: 1000, currentLevelL: 0,
    roofAreaM2: 30, efficiency: 0.8, color: '#2196f3',
    isActive: true, isPuit: false, puitDepthM: 0, puitDailyLimitL: 500,
  });
  const set = (k: keyof RainwaterTank, v: any) => setForm(p => ({ ...p, [k]: v }));
  const COLORS = ['#2196f3','#0288d1','#1565c0','#26a69a','#43a047','#00695c','#e53935','#f57c00'];

  return (
    <motion.div className="wb-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="wb-modal" initial={{ scale: 0.88 }} animate={{ scale: 1 }} exit={{ scale: 0.88 }}
        onClick={e => e.stopPropagation()}>

        <div className="wb-modal-title">{initial ? '✏️ Modifier' : '+ Nouvelle source d\'eau'}</div>

        {/* Type de source */}
        <div className="wb-type-toggle">
          <button className={`wb-type-btn ${!form.isPuit ? 'wb-type-active' : ''}`}
            onClick={() => set('isPuit', false)}>🛢️ Cuve / Bidon</button>
          <button className={`wb-type-btn ${form.isPuit ? 'wb-type-active' : ''}`}
            onClick={() => set('isPuit', true)}>⛏️ Puit / Forage</button>
        </div>

        <div className="wb-form">
          <label className="wb-label">Nom</label>
          <input className="wb-input" value={form.name}
            placeholder={form.isPuit ? 'Ex: Puit Nord, Forage...' : 'Ex: Cuve principale, Bidon...'}
            onChange={e => set('name', e.target.value)} />

          {form.isPuit ? (
            <>
              <label className="wb-label">Capacité estimée (litres) <span className="wb-label-hint">— volume utilisable de la nappe</span></label>
              <input className="wb-input" type="number" min="100" value={form.capacityL} onChange={e => set('capacityL', +e.target.value)} />

              <label className="wb-label">Niveau actuel (litres)</label>
              <input className="wb-input" type="number" min="0" value={form.currentLevelL}
                onChange={e => set('currentLevelL', Math.min(form.capacityL, +e.target.value))} />

              <label className="wb-label">Profondeur (m) <span className="wb-label-hint">— info seulement</span></label>
              <input className="wb-input" type="number" min="0" value={form.puitDepthM ?? 0} onChange={e => set('puitDepthM', +e.target.value)} />

              <label className="wb-label">Débit journalier max (L/jour) <span className="wb-label-hint">— protection nappe</span></label>
              <input className="wb-input" type="number" min="50" value={form.puitDailyLimitL ?? 500} onChange={e => set('puitDailyLimitL', +e.target.value)} />

              <div className="wb-preview">♻️ Recharge naturelle estimée : <strong>{(form.capacityL * 0.05).toFixed(0)} L/jour</strong></div>
            </>
          ) : (
            <>
              <label className="wb-label">Capacité (litres)</label>
              <input className="wb-input" type="number" min="10" value={form.capacityL} onChange={e => set('capacityL', +e.target.value)} />

              <label className="wb-label">Niveau actuel (litres)</label>
              <input className="wb-input" type="number" min="0" max={form.capacityL} value={form.currentLevelL}
                onChange={e => set('currentLevelL', Math.min(form.capacityL, +e.target.value))} />

              <label className="wb-label">Surface de toiture connectée (m²)</label>
              <input className="wb-input" type="number" min="0" value={form.roofAreaM2} onChange={e => set('roofAreaM2', +e.target.value)} />

              <label className="wb-label">Efficacité de récupération <span className="wb-label-hint">({(form.efficiency*100).toFixed(0)}%)</span></label>
              <input className="wb-input" type="range" min="0.5" max="1" step="0.05" value={form.efficiency} onChange={e => set('efficiency', +e.target.value)} />

              <div className="wb-preview">💡 Pour 10mm de pluie → <strong>{(10 * form.roofAreaM2 * form.efficiency).toFixed(0)} L</strong> récupérés</div>
            </>
          )}

          <label className="wb-label">Couleur</label>
          <div className="wb-colors">
            {COLORS.map(c => (
              <button key={c} className={`wb-color-dot ${form.color === c ? 'wb-color-selected' : ''}`}
                style={{ background: c }} onClick={() => set('color', c)} />
            ))}
          </div>
        </div>

        <div className="wb-modal-actions">
          <button className="wb-btn-cancel" onClick={onClose}>Annuler</button>
          <button className="wb-btn-save" onClick={() => form.name && onSave(form)} disabled={!form.name}>
            ✓ Enregistrer
          </button>
        </div>

        <style>{`
          .wb-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(6px);padding:16px}
          .wb-modal{background:#0d1b2a;border:1px solid rgba(255,255,255,.15);border-radius:18px;padding:20px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto}
          .wb-modal-title{font-size:15px;font-weight:800;margin-bottom:12px;color:#90caf9}
          .wb-type-toggle{display:flex;gap:6px;margin-bottom:12px}
          .wb-type-btn{flex:1;padding:8px;border-radius:9px;border:2px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#aaa;cursor:pointer;font-weight:700;font-size:12px;transition:all .2s}
          .wb-type-active{border-color:#2196f3;background:rgba(33,150,243,.2);color:#90caf9}
          .wb-form{display:flex;flex-direction:column;gap:7px}
          .wb-label{font-size:11px;font-weight:700;color:#aaa;margin-top:3px}
          .wb-label-hint{font-weight:400;color:#666}
          .wb-input{padding:8px 11px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#fff;font-size:12px;outline:none}
          .wb-input:focus{border-color:#2196f3}
          .wb-input[type=range]{padding:3px 0;background:none;border:none}
          .wb-preview{background:rgba(33,150,243,.1);border:1px solid rgba(33,150,243,.25);border-radius:8px;padding:8px 11px;font-size:11px;color:#90caf9;margin-top:3px}
          .wb-colors{display:flex;gap:7px;flex-wrap:wrap;margin-top:2px}
          .wb-color-dot{width:26px;height:26px;border-radius:50%;border:3px solid transparent;cursor:pointer;transition:transform .2s}
          .wb-color-selected{border-color:#fff!important;transform:scale(1.2)}
          .wb-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
          .wb-btn-cancel{padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#aaa;cursor:pointer}
          .wb-btn-save{padding:7px 14px;border-radius:8px;border:none;background:#1565c0;color:#fff;font-weight:700;cursor:pointer}
          .wb-btn-save:disabled{opacity:.4;cursor:not-allowed}
        `}</style>
      </motion.div>
    </motion.div>
  );
}
