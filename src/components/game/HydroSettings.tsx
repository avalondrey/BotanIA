'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type HydroContext, type MulchType, type IrrigationTech, type PermacultureElement,
  SOIL_PRESETS, defaultHydroContext, calcFullHydroNeed,
} from '@/lib/hydro-engine';

// ─── Labels / meta ───────────────────────────────────────────────────────────

const MULCH_OPTIONS: { id: MulchType; emoji: string; label: string; pct: number }[] = [
  { id: 'paille',   emoji: '🌾', label: 'Paille 5-10cm',           pct: 60 },
  { id: 'brf',      emoji: '🪵', label: 'BRF 10-15cm',              pct: 65 },
  { id: 'tontes',   emoji: '🌿', label: 'Tontes de gazon',          pct: 45 },
  { id: 'feuilles', emoji: '🍂', label: 'Feuilles broyées',         pct: 50 },
  { id: 'toile',    emoji: '🏗️', label: 'Toile géotextile',         pct: 80 },
  { id: 'carton',   emoji: '📦', label: 'Carton / Lasagne',         pct: 70 },
  { id: 'graviers', emoji: '🪨', label: 'Graviers 5cm',             pct: 55 },
  { id: 'compost',  emoji: '♻️', label: 'Compost 3cm',              pct: 40 },
];

const IRRIGATION_OPTIONS: { id: IrrigationTech; emoji: string; label: string; eff: number }[] = [
  { id: 'arrosoir',        emoji: '🪣', label: 'Arrosoir surface',      eff: 65 },
  { id: 'goutte_a_goutte', emoji: '💧', label: 'Goutte-à-goutte',       eff: 92 },
  { id: 'oya',             emoji: '🏺', label: 'Oyas (pots argile)',    eff: 95 },
  { id: 'aspersion',       emoji: '💦', label: 'Aspersion / sprinkler', eff: 75 },
  { id: 'submersion',      emoji: '🌊', label: 'Submersion',            eff: 50 },
  { id: 'capillarite',     emoji: '🧵', label: 'Mèches capillaires',    eff: 88 },
];

const PERMA_OPTIONS: { id: PermacultureElement; emoji: string; label: string; pct: number; desc: string }[] = [
  { id: 'swale',             emoji: '〰️', label: 'Swale (ligne de niveau)',  pct: 10, desc: 'Retient le ruissellement sur le terrain' },
  { id: 'keyline',           emoji: '🔑', label: 'Keyline design',           pct: 15, desc: 'Infiltration profonde, réserve souterraine' },
  { id: 'hugelkultur',       emoji: '🏔️', label: 'Hugelkultur (butte bois)', pct: 35, desc: 'Éponge hydrique, quasi autonome en eau' },
  { id: 'agroforesterie',    emoji: '🌳', label: 'Agroforesterie',            pct: 40, desc: 'Ombrage + micro-climat, -40% transpiration' },
  { id: 'couverture_vivante',emoji: '🍀', label: 'Couverture vivante',        pct: 12, desc: 'Trèfle/phacélie — réduit évaporation sol' },
  { id: 'bocage',            emoji: '🌿', label: 'Bocage / brise-vent',       pct: 15, desc: 'Haie réduit vent → moins de transpiration' },
];

const SOIL_PRESETS_LIST = Object.entries(SOIL_PRESETS).map(([id, s]) => ({
  id,
  label: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  texture: s.texture,
  mo: s.organicMatter,
}));


// ─── Props ────────────────────────────────────────────────────────────────────

interface HydroSettingsProps {
  ctx: Partial<HydroContext>;
  onChange: (ctx: Partial<HydroContext>) => void;
  /** Données météo du jour pour le preview */
  et0?: number;
  precipMm?: number;
  humidity?: number;
  tMin?: number;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function HydroSettings({ ctx, onChange, et0 = 3.5, precipMm = 0, humidity = 65, tMin = 10 }: HydroSettingsProps) {
  const [section, setSection] = useState<'sol'|'paillage'|'irrigation'|'perma'|'preview'>('sol');

  const set = (patch: Partial<HydroContext>) => onChange({ ...ctx, ...patch });

  const togglePerma = (el: PermacultureElement) => {
    const cur = ctx.permaElements ?? [];
    const next = cur.includes(el) ? cur.filter(e => e !== el) : [...cur, el];
    set({ permaElements: next });
  };

  // ── Preview en temps réel ──
  const previewCtx: HydroContext = {
    ...defaultHydroContext(100),
    ...ctx,
    surfaceM2: 100,
  };
  const previewAtmo = {
    precipMm, humidity, tMin, tMean: tMin + 8, windSpeed: 10, sunHours: 6, fogFrequency: humidity >= 95 ? 0.5 : 0,
  };
  const previewResult = calcFullHydroNeed({ kc: 1.0, et0Daily: et0, atmo: previewAtmo, ctx: previewCtx });
  const pctSaved = et0 > 0 ? Math.round((1 - previewResult.etcFinal / et0) * 100) : 0;

  return (
    <div className="hs-wrap">
      <div className="hs-title">🌿 Configuration terrain</div>
      <p className="hs-sub">Ces paramètres affinent le calcul des besoins en eau</p>

      {/* Onglets section */}
      <div className="hs-tabs">
        {[
          { id: 'sol',        label: '🌍 Sol' },
          { id: 'paillage',   label: '🌾 Paillage' },
          { id: 'irrigation', label: '💧 Irrigation' },
          { id: 'perma',      label: '🌿 Permaculture' },
          { id: 'preview',    label: '📊 Résultat' },
        ].map(t => (
          <button key={t.id} className={`hs-tab ${section === t.id ? 'hs-tab-active' : ''}`}
            onClick={() => setSection(t.id as any)}>{t.label}</button>
        ))}
      </div>


      {/* ══ SOL ══ */}
      {section === 'sol' && (
        <div className="hs-section">
          <div className="hs-section-title">Texture et profil de votre sol</div>
          <div className="hs-grid-2">
            {SOIL_PRESETS_LIST.map(p => (
              <button key={p.id}
                className={`hs-choice-btn ${(ctx.soil && JSON.stringify(ctx.soil) === JSON.stringify(SOIL_PRESETS[p.id])) ? 'hs-choice-active' : ''}`}
                onClick={() => set({ soil: SOIL_PRESETS[p.id] })}>
                <span className="hs-choice-icon">
                  {p.texture === 'sableux' ? '🏖️' : p.texture === 'argileux' ? '🧱' : p.texture === 'humifere' ? '🍂' : '🌱'}
                </span>
                <div>
                  <div className="hs-choice-label">{p.label}</div>
                  <div className="hs-choice-sub">MO {p.mo}% · {p.texture}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Infos sol sélectionné */}
          {ctx.soil && (
            <div className="hs-info-box">
              <div className="hs-info-row"><span>Texture</span><strong>{ctx.soil.texture}</strong></div>
              <div className="hs-info-row"><span>Matière organique</span><strong>{ctx.soil.organicMatter}%</strong></div>
              <div className="hs-info-row"><span>pH</span><strong>{ctx.soil.ph}</strong></div>
              <div className="hs-info-row"><span>Profondeur utile</span><strong>{ctx.soil.depth} cm</strong></div>
            </div>
          )}

          {/* Ombre */}
          <div className="hs-field">
            <label className="hs-label">☀️ Part de la culture à l'ombre : <strong>{Math.round((ctx.shadeFraction ?? 0) * 100)}%</strong></label>
            <input type="range" className="hs-range" min="0" max="0.9" step="0.1"
              value={ctx.shadeFraction ?? 0}
              onChange={e => set({ shadeFraction: +e.target.value })} />
            <div className="hs-range-hint">Agroforesterie, bâtiments, treilles...</div>
          </div>
        </div>
      )}


      {/* ══ PAILLAGE ══ */}
      {section === 'paillage' && (
        <div className="hs-section">
          <div className="hs-section-title">Type de paillage</div>
          <p className="hs-section-desc">Le paillage réduit l'évaporation directe du sol (−40 à −80%). Il n'agit pas sur la transpiration foliaire.</p>

          <div className="hs-grid-2">
            <button className={`hs-choice-btn ${!ctx.mulch ? 'hs-choice-active' : ''}`}
              onClick={() => set({ mulch: undefined })}>
              <span className="hs-choice-icon">🚫</span>
              <div><div className="hs-choice-label">Sans paillage</div><div className="hs-choice-sub">Sol nu</div></div>
            </button>

            {MULCH_OPTIONS.map(m => (
              <button key={m.id}
                className={`hs-choice-btn ${ctx.mulch?.type === m.id ? 'hs-choice-active' : ''}`}
                onClick={() => set({ mulch: { type: m.id, thicknessCm: ctx.mulch?.thicknessCm ?? 7 } })}>
                <span className="hs-choice-icon">{m.emoji}</span>
                <div>
                  <div className="hs-choice-label">{m.label}</div>
                  <div className="hs-choice-sub">−{m.pct}% évap. sol</div>
                </div>
              </button>
            ))}
          </div>

          {ctx.mulch && (
            <div className="hs-field" style={{ marginTop: 12 }}>
              <label className="hs-label">Épaisseur : <strong>{ctx.mulch.thicknessCm} cm</strong></label>
              <input type="range" className="hs-range" min="2" max="20" step="1"
                value={ctx.mulch.thicknessCm}
                onChange={e => set({ mulch: { ...ctx.mulch!, thicknessCm: +e.target.value } })} />
              <div className="hs-range-hint">Efficacité max à 10cm (palier ensuite)</div>
            </div>
          )}
        </div>
      )}


      {/* ══ IRRIGATION ══ */}
      {section === 'irrigation' && (
        <div className="hs-section">
          <div className="hs-section-title">Technique d'arrosage</div>
          <p className="hs-section-desc">L'efficience détermine la part d'eau réellement utilisée par la plante. Le reste est perdu par évaporation ou ruissellement.</p>

          <div className="hs-grid-2">
            {IRRIGATION_OPTIONS.map(irr => (
              <button key={irr.id}
                className={`hs-choice-btn ${(ctx.irrigation ?? 'arrosoir') === irr.id ? 'hs-choice-active' : ''}`}
                onClick={() => set({ irrigation: irr.id })}>
                <span className="hs-choice-icon">{irr.emoji}</span>
                <div>
                  <div className="hs-choice-label">{irr.label}</div>
                  <div className="hs-choice-sub">Efficience {irr.eff}%</div>
                </div>
                <div className="hs-eff-bar">
                  <div className="hs-eff-fill" style={{ width: `${irr.eff}%`, background: irr.eff >= 90 ? '#22c55e' : irr.eff >= 75 ? '#f97316' : '#ef4444' }} />
                </div>
              </button>
            ))}
          </div>

          {/* Oyas : nombre */}
          {(ctx.irrigation === 'oya') && (
            <div className="hs-field" style={{ marginTop: 12 }}>
              <label className="hs-label">Nombre d'oyas : <strong>{ctx.oyaCount ?? 1}</strong></label>
              <input type="range" className="hs-range" min="1" max="20" step="1"
                value={ctx.oyaCount ?? 1}
                onChange={e => set({ oyaCount: +e.target.value })} />
              <div className="hs-info-box" style={{ marginTop: 8 }}>
                🏺 {ctx.oyaCount ?? 1} oya(s) → {((ctx.oyaCount ?? 1) * 0.3).toFixed(1)} L/jour diffusés directement dans la rhizosphère (Rao et al. 2018)
              </div>
            </div>
          )}
        </div>
      )}


      {/* ══ PERMACULTURE ══ */}
      {section === 'perma' && (
        <div className="hs-section">
          <div className="hs-section-title">Éléments de permaculture actifs</div>
          <p className="hs-section-desc">Cochez les éléments présents sur votre terrain. Cumul possible, plafonné à −65% du besoin total.</p>

          <div className="hs-perma-list">
            {PERMA_OPTIONS.map(el => {
              const active = (ctx.permaElements ?? []).includes(el.id);
              return (
                <button key={el.id} className={`hs-perma-btn ${active ? 'hs-perma-active' : ''}`}
                  onClick={() => togglePerma(el.id)}>
                  <div className="hs-perma-left">
                    <span className="hs-perma-check">{active ? '✅' : '⬜'}</span>
                    <span className="hs-perma-emoji">{el.emoji}</span>
                    <div>
                      <div className="hs-perma-label">{el.label}</div>
                      <div className="hs-perma-desc">{el.desc}</div>
                    </div>
                  </div>
                  <span className={`hs-perma-saving ${active ? 'hs-perma-saving-active' : ''}`}>
                    −{el.pct}%
                  </span>
                </button>
              );
            })}
          </div>

          {(ctx.permaElements?.length ?? 0) > 0 && (
            <div className="hs-info-box" style={{ marginTop: 10 }}>
              {(ctx.permaElements ?? []).map(el => {
                const opt = PERMA_OPTIONS.find(o => o.id === el);
                return opt ? <span key={el} style={{ marginRight: 8 }}>{opt.emoji} {opt.label}</span> : null;
              })}
              <br />
              <strong>Économie estimée : ~{Math.min(65, (ctx.permaElements ?? []).reduce((s, el) => s + (PERMA_OPTIONS.find(o => o.id === el)?.pct ?? 0), 0))}% ET0</strong>
            </div>
          )}
        </div>
      )}


      {/* ══ PREVIEW ══ */}
      {section === 'preview' && (
        <div className="hs-section">
          <div className="hs-section-title">Résultat du calcul hydrique</div>
          <p className="hs-section-desc">Basé sur les conditions météo actuelles (ET0 {et0.toFixed(1)}mm/j, {precipMm}mm pluie, HR {humidity}%)</p>

          {/* Résumé principal */}
          <div className="hs-preview-main">
            <div className="hs-preview-row">
              <span>ET0 base</span>
              <span>{et0.toFixed(2)} mm/j</span>
            </div>
            <div className="hs-preview-row">
              <span>ETc brut (× Kc 1.0)</span>
              <span>{previewResult.etcRaw.toFixed(2)} mm/j</span>
            </div>
            <div className="hs-preview-divider" />

            {previewResult.breakdown.map((b, i) => (
              <div key={i} className="hs-preview-saving">
                <span>{b.emoji} {b.source}</span>
                <span className="hs-saving-val">−{b.savingMm.toFixed(2)} mm/j (−{b.pct.toFixed(0)}%)</span>
              </div>
            ))}

            {previewResult.breakdown.length === 0 && (
              <div className="hs-preview-saving" style={{ color: '#666' }}>
                <span>Aucun modificateur actif</span>
                <span>−0 mm/j</span>
              </div>
            )}

            <div className="hs-preview-divider" />
            <div className="hs-preview-final">
              <span>Besoin réel</span>
              <span className={pctSaved >= 30 ? 'hs-final-good' : pctSaved >= 10 ? 'hs-final-mid' : 'hs-final-bad'}>
                {previewResult.etcFinal.toFixed(2)} mm/j
              </span>
            </div>
            <div className="hs-preview-economy">
              Économie totale : <strong style={{ color: pctSaved >= 30 ? '#86efac' : '#fbbf24' }}>−{pctSaved}%</strong> vs sol nu sans technique
            </div>
            <div className="hs-preview-liters">
              → <strong>{(previewResult.etcFinal * 100).toFixed(0)} L</strong> nécessaires pour 100 m² par jour
            </div>
          </div>

          {/* Décomposition apports passifs */}
          {previewResult.passiveInputMm > 0.01 && (
            <div className="hs-info-box" style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: '#90caf9' }}>💦 Apports atmosphériques passifs</div>
              <div>🌫️ Brouillard : {((previewResult.passiveInputMm * 0.5)).toFixed(2)} mm/j estimé</div>
              <div>💦 Rosée nocturne : actif si T_min &lt; {(tMin + 1).toFixed(0)}°C et RH &gt; 80%</div>
              <div>🌡️ Humidité ambiante {humidity}% : tampon évaporation</div>
            </div>
          )}
        </div>
      )}


      {/* ══ STYLES ══ */}
      <style>{`
        .hs-wrap{color:#fff;font-family:system-ui,sans-serif}
        .hs-title{font-size:16px;font-weight:800;margin-bottom:3px;color:#90caf9}
        .hs-sub{font-size:11px;color:#888;margin:0 0 12px}
        .hs-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px}
        .hs-tab{padding:5px 10px;border-radius:7px;border:none;background:rgba(255,255,255,.07);color:#aaa;cursor:pointer;font-size:11px;font-weight:600;transition:all .2s;white-space:nowrap}
        .hs-tab-active{background:rgba(34,197,94,.2);color:#86efac;border:1px solid rgba(34,197,94,.3)}
        .hs-section{display:flex;flex-direction:column;gap:8px}
        .hs-section-title{font-size:13px;font-weight:700;color:#ccc}
        .hs-section-desc{font-size:11px;color:#888;margin:0}
        .hs-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .hs-choice-btn{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;cursor:pointer;text-align:left;transition:all .2s}
        .hs-choice-active{border-color:#22c55e;background:rgba(34,197,94,.15)}
        .hs-choice-icon{font-size:18px;flex-shrink:0}
        .hs-choice-label{font-size:11px;font-weight:700}
        .hs-choice-sub{font-size:10px;color:#888}
        .hs-eff-bar{width:100%;height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin-top:3px}
        .hs-eff-fill{height:100%;border-radius:2px;transition:width .3s}
        .hs-field{display:flex;flex-direction:column;gap:4px}
        .hs-label{font-size:11px;font-weight:700;color:#aaa}
        .hs-range{width:100%;accent-color:#22c55e}
        .hs-range-hint{font-size:10px;color:#666}
        .hs-info-box{background:rgba(255,255,255,.06);border-radius:9px;padding:10px 12px;font-size:11px;color:#aaa;line-height:1.7}
        .hs-info-row{display:flex;justify-content:space-between;padding:2px 0}
        .hs-perma-list{display:flex;flex-direction:column;gap:6px}
        .hs-perma-btn{display:flex;align-items:center;justify-content:space-between;padding:9px 11px;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;cursor:pointer;text-align:left;transition:all .2s;width:100%}
        .hs-perma-active{border-color:#22c55e;background:rgba(34,197,94,.1)}
        .hs-perma-left{display:flex;align-items:center;gap:8px}
        .hs-perma-check{font-size:14px;flex-shrink:0}
        .hs-perma-emoji{font-size:18px;flex-shrink:0}
        .hs-perma-label{font-size:11px;font-weight:700}
        .hs-perma-desc{font-size:10px;color:#888}
        .hs-perma-saving{font-size:11px;font-weight:700;color:#666;white-space:nowrap}
        .hs-perma-saving-active{color:#86efac}
        .hs-preview-main{background:rgba(255,255,255,.06);border-radius:11px;padding:13px}
        .hs-preview-row{display:flex;justify-content:space-between;font-size:12px;color:#aaa;padding:2px 0}
        .hs-preview-divider{height:1px;background:rgba(255,255,255,.1);margin:8px 0}
        .hs-preview-saving{display:flex;justify-content:space-between;font-size:11px;color:#aaa;padding:2px 0}
        .hs-saving-val{color:#86efac;font-weight:700}
        .hs-preview-final{display:flex;justify-content:space-between;font-size:15px;font-weight:800;padding:4px 0}
        .hs-final-good{color:#86efac}
        .hs-final-mid{color:#fbbf24}
        .hs-final-bad{color:#fca5a5}
        .hs-preview-economy{font-size:11px;color:#aaa;margin-top:5px}
        .hs-preview-liters{font-size:12px;color:#90caf9;margin-top:3px}
      `}</style>
    </div>
  );
}
