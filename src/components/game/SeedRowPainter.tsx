'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoStore } from '@/store/photo-store';
import { getBestGPS } from '@/lib/gps-extractor';

export interface SeedRow {
  id: string; color: string;
  points: { x: number; y: number }[];
  label?: string; createdAt: number;
}

interface Props { onRowsChange?: (rows: SeedRow[]) => void; }

const COLORS = [
  { hex: '#FF9500', name: 'Orange' }, { hex: '#FF2D87', name: 'Rose' },
  { hex: '#1C1C1E', name: 'Noir' },  { hex: '#FFD60A', name: 'Jaune' },
  { hex: '#30D158', name: 'Vert' },  { hex: '#0A84FF', name: 'Bleu' },
  { hex: '#FFFFFF', name: 'Blanc' }, { hex: '#FF453A', name: 'Rouge' },
];

function uid() { return Math.random().toString(36).slice(2, 9); }

function getPos(e: React.PointerEvent<HTMLCanvasElement>, c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}

function drawAllRows(
  ctx: CanvasRenderingContext2D, rows: SeedRow[], w: number, h: number,
  cur?: { color: string; points: { x: number; y: number }[] } | null
) {
  ctx.clearRect(0, 0, w, h);
  const all = cur ? [...rows, { id: '__c', color: cur.color, points: cur.points, createdAt: 0 }] : rows;
  for (const row of all) {
    if (row.points.length < 2) continue;
    ctx.beginPath(); ctx.strokeStyle = row.color; ctx.lineWidth = 4;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = row.color; ctx.shadowBlur = 10;
    ctx.moveTo(row.points[0].x * w, row.points[0].y * h);
    for (let i = 1; i < row.points.length; i++)
      ctx.lineTo(row.points[i].x * w, row.points[i].y * h);
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(row.points[0].x * w, row.points[0].y * h, 6, 0, Math.PI * 2);
    ctx.fillStyle = row.color; ctx.fill();
  }
}

export default function SeedRowPainter({ onRowsChange }: Props) {
  const addPhoto = usePhotoStore(s => s.addPhoto);

  const [rows, setRows] = useState<SeedRow[]>([]);
  const [activeColor, setActiveColor] = useState(COLORS[0].hex);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cur, setCur] = useState<{ color: string; points: { x: number; y: number }[] } | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'photo' | 'camera'>('photo');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingRow, setPendingRow] = useState<SeedRow | null>(null);
  const [rowLabel, setRowLabel] = useState('');
  const [gps, setGps] = useState<{ lat: number; lon: number; source: string } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'found' | 'none'>('idle');
  const [savedToStore, setSavedToStore] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    drawAllRows(ctx, rows, c.width, c.height, cur);
  }, [rows, cur]);

  useEffect(() => { onRowsChange?.(rows); }, [rows]);
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  // ── GPS extraction sur import photo ──
  const extractGPS = async (url: string) => {
    setGpsStatus('loading');
    const result = await getBestGPS(url);
    if (result) { setGps({ lat: result.lat, lon: result.lon, source: result.source }); setGpsStatus('found'); }
    else setGpsStatus('none');
  };

  // ── Caméra ──
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setMode('camera'); setPhotoUrl(null);
    } catch { alert('Caméra inaccessible. Utilisez "Choisir une photo".'); }
  };

  const captureCamera = () => {
    const v = videoRef.current;
    const c = document.createElement('canvas');
    c.width = v?.videoWidth || 640; c.height = v?.videoHeight || 360;
    c.getContext('2d')?.drawImage(v!, 0, 0);
    const url = c.toDataURL('image/jpeg', 0.85);
    setPhotoUrl(url); streamRef.current?.getTracks().forEach(t => t.stop()); setMode('photo');
    extractGPS(url); setSavedToStore(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const url = ev.target?.result as string;
      setPhotoUrl(url); setRows([]); setSavedToStore(false);
      extractGPS(url);
    };
    r.readAsDataURL(f);
  };


  // ── Drawing ──
  const onDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault(); if (!canvasRef.current) return;
    setIsDrawing(true); setCur({ color: activeColor, points: [getPos(e, canvasRef.current)] });
  }, [activeColor]);

  const onMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !cur || !canvasRef.current) return; e.preventDefault();
    setCur(p => p ? { ...p, points: [...p.points, getPos(e, canvasRef.current!)] } : null);
  }, [isDrawing, cur]);

  const onUp = useCallback(() => {
    if (!isDrawing || !cur) return; setIsDrawing(false);
    if (cur.points.length >= 2) {
      setPendingRow({ id: uid(), color: cur.color, points: cur.points, createdAt: Date.now() });
      setRowLabel(''); setShowConfirm(true);
    }
    setCur(null);
  }, [isDrawing, cur]);

  const confirmRow = () => {
    if (!pendingRow) return;
    setRows(p => [...p, { ...pendingRow, label: rowLabel || `Rang ${p.length + 1}` }]);
    setShowConfirm(false); setPendingRow(null); setSavedToStore(false);
  };

  // ── Sauvegarder vers le photo store (Jardin → Identificateur) ──
  const saveToStore = () => {
    if (!photoUrl) return;
    addPhoto({
      dataUrl: photoUrl,
      gps: gps ? { lat: gps.lat, lon: gps.lon, source: gps.source as any } : undefined,
      seedRows: rows,
      source: 'jardin',
    });
    setSavedToStore(true);
  };

  const clearAll = () => { setRows([]); setPhotoUrl(null); setGps(null); setGpsStatus('idle'); setSavedToStore(false); };


  return (
    <div className="sp-wrap">
      {/* Header */}
      <div className="sp-head">
        <h2 className="sp-title">📸 Marquer vos semences</h2>
        <p className="sp-sub">Photo + GPS + rangs colorés → Identificateur IA</p>
      </div>

      {/* Boutons source */}
      <div className="sp-bar">
        <button className="sp-btn sp-primary" onClick={() => fileRef.current?.click()}>🖼️ Photo</button>
        <button className="sp-btn sp-secondary" onClick={startCamera}>📷 Caméra</button>
        {photoUrl && <button className="sp-btn sp-danger" onClick={clearAll}>🗑️ Effacer</button>}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* Badge GPS */}
      {gpsStatus !== 'idle' && (
        <div className={`sp-gps-badge ${gpsStatus === 'found' ? 'sp-gps-ok' : gpsStatus === 'loading' ? 'sp-gps-loading' : 'sp-gps-none'}`}>
          {gpsStatus === 'loading' && '⏳ Recherche GPS...'}
          {gpsStatus === 'found' && gps && `📍 GPS ${gps.source === 'exif' ? 'EXIF' : '🛰️ Device'}: ${gps.lat.toFixed(5)}°, ${gps.lon.toFixed(5)}°`}
          {gpsStatus === 'none' && '📍 Pas de GPS dans cette photo'}
        </div>
      )}

      {/* Caméra live */}
      {mode === 'camera' && (
        <div className="sp-cam-wrap">
          <video ref={videoRef} className="sp-video" playsInline muted />
          <button className="sp-capture" onClick={captureCamera}>⚪</button>
        </div>
      )}

      {/* Zone canvas */}
      {photoUrl && mode === 'photo' && (
        <div className="sp-canvas-zone">
          <img src={photoUrl} alt="Jardin" className="sp-bg" draggable={false} />
          <canvas ref={canvasRef} className="sp-canvas" width={800} height={450}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            style={{ touchAction: 'none' }} />
          {rows.length === 0 && !isDrawing && (
            <div className="sp-hint">✏️ Tracez un rang sur la photo</div>
          )}
        </div>
      )}

      {/* Placeholder */}
      {!photoUrl && mode === 'photo' && (
        <div className="sp-placeholder" onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: 48 }}>🌱</div>
          <p>Choisir une photo de votre jardin</p>
          <p className="sp-placeholder-sub">ou utilisez la caméra pour capturer avec GPS</p>
        </div>
      )}

      {/* Palette */}
      {photoUrl && (
        <div className="sp-palette">
          {COLORS.map(c => (
            <button key={c.hex} className={`sp-color ${activeColor === c.hex ? 'sp-color-active' : ''}`}
              style={{ background: c.hex }} onClick={() => setActiveColor(c.hex)} title={c.name} />
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 22 }}>🎨</span>
        </div>
      )}


      {/* Liste rangs */}
      {rows.length > 0 && (
        <div className="sp-rows">
          <div className="sp-rows-title">🌾 Rangs tracés ({rows.length})</div>
          {rows.map((r, i) => (
            <motion.div key={r.id} className="sp-row-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="sp-row-dot" style={{ background: r.color }} />
              <span className="sp-row-lbl">{r.label || `Rang ${i + 1}`}</span>
              <button className="sp-row-del" onClick={() => setRows(p => p.filter(x => x.id !== r.id))}>✕</button>
            </motion.div>
          ))}

          {/* Boutons d'action */}
          <div className="sp-actions">
            <button className="sp-btn sp-sync" onClick={() => onRowsChange?.(rows)}>
              🗺️ Sync grille jardin
            </button>
            <button
              className={`sp-btn ${savedToStore ? 'sp-saved' : 'sp-identify'}`}
              onClick={saveToStore}
              disabled={savedToStore}
            >
              {savedToStore ? '✅ Envoyé à l\'Identificateur' : '🔍 Envoyer à l\'Identificateur'}
            </button>
          </div>
        </div>
      )}

      {/* Modale nommer rang */}
      <AnimatePresence>
        {showConfirm && pendingRow && (
          <motion.div className="sp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="sp-modal" initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}>
              <div className="sp-modal-head">
                <div className="sp-modal-dot" style={{ background: pendingRow.color }} />
                <span>Nommer ce rang</span>
              </div>
              <input className="sp-modal-input" placeholder="Ex: Carottes, Tomates..." value={rowLabel}
                onChange={e => setRowLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmRow()} autoFocus />
              <div className="sp-modal-btns">
                <button className="sp-btn sp-secondary" onClick={() => setShowConfirm(false)}>Annuler</button>
                <button className="sp-btn sp-primary" onClick={confirmRow}>✓ Ajouter</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <style>{`
        .sp-wrap{background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);border-radius:20px;padding:20px;color:#fff;font-family:system-ui,sans-serif;position:relative;}
        .sp-head{margin-bottom:14px}.sp-title{font-size:19px;font-weight:800;margin:0 0 3px}.sp-sub{font-size:12px;color:#aaa;margin:0}
        .sp-bar{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
        .sp-btn{padding:9px 16px;border-radius:11px;font-weight:700;font-size:12px;border:none;cursor:pointer;transition:all .2s}
        .sp-btn:active{transform:scale(.95)}
        .sp-primary{background:#30D158;color:#fff}.sp-primary:hover{background:#25a645}
        .sp-secondary{background:rgba(255,255,255,.15);color:#fff}.sp-secondary:hover{background:rgba(255,255,255,.25)}
        .sp-danger{background:#FF453A;color:#fff}
        .sp-sync{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;width:100%}
        .sp-identify{background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff;width:100%;margin-top:6px}
        .sp-saved{background:#30D158;color:#fff;width:100%;margin-top:6px;opacity:.7}
        .sp-gps-badge{padding:7px 12px;border-radius:10px;font-size:11px;font-weight:700;margin-bottom:10px}
        .sp-gps-ok{background:rgba(48,209,88,.2);border:1px solid rgba(48,209,88,.4);color:#30D158}
        .sp-gps-loading{background:rgba(255,214,10,.2);border:1px solid rgba(255,214,10,.4);color:#FFD60A}
        .sp-gps-none{background:rgba(255,69,58,.15);border:1px solid rgba(255,69,58,.3);color:#FF453A}
        .sp-cam-wrap{position:relative;border-radius:14px;overflow:hidden;margin-bottom:12px}
        .sp-video{width:100%;max-height:280px;object-fit:cover;display:block}
        .sp-capture{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.9);border:4px solid white;border-radius:50%;width:58px;height:58px;font-size:18px;cursor:pointer}
        .sp-canvas-zone{position:relative;border-radius:14px;overflow:hidden;margin-bottom:12px;aspect-ratio:16/9;background:#000}
        .sp-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        .sp-canvas{position:absolute;inset:0;width:100%;height:100%;cursor:crosshair}
        .sp-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.65);color:#fff;padding:6px 14px;border-radius:18px;font-size:12px;pointer-events:none;white-space:nowrap}
        .sp-placeholder{border:2px dashed rgba(255,255,255,.2);border-radius:14px;padding:44px 16px;text-align:center;cursor:pointer;margin-bottom:12px}
        .sp-placeholder-sub{color:#888;font-size:11px;margin-top:4px}
        .sp-palette{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}
        .sp-color{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.3)}
        .sp-color-active{transform:scale(1.3);border-color:#fff!important;box-shadow:0 0 0 2px rgba(255,255,255,.4),0 4px 12px rgba(0,0,0,.4)}
        .sp-rows{background:rgba(255,255,255,.07);border-radius:14px;padding:14px}
        .sp-rows-title{font-size:14px;font-weight:700;margin-bottom:10px}
        .sp-row-item{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.08);border-radius:9px;padding:7px 10px;margin-bottom:6px}
        .sp-row-dot{width:14px;height:14px;border-radius:50%;flex-shrink:0}
        .sp-row-lbl{flex:1;font-weight:600;font-size:12px}
        .sp-row-del{background:rgba(255,69,58,.2);border:none;color:#FF453A;border-radius:5px;padding:2px 7px;cursor:pointer;font-weight:700}
        .sp-actions{margin-top:10px;display:flex;flex-direction:column;gap:0}
        .sp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px)}
        .sp-modal{background:#1c1c2e;border:1px solid rgba(255,255,255,.15);border-radius:18px;padding:22px;width:300px;max-width:90vw}
        .sp-modal-head{display:flex;align-items:center;gap:8px;margin-bottom:14px;font-weight:700;font-size:15px}
        .sp-modal-dot{width:18px;height:18px;border-radius:50%}
        .sp-modal-input{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:#fff;font-size:14px;margin-bottom:14px;box-sizing:border-box;outline:none}
        .sp-modal-input:focus{border-color:#30D158}
        .sp-modal-input::placeholder{color:#666}
        .sp-modal-btns{display:flex;gap:8px;justify-content:flex-end}
      `}</style>
    </div>
  );
}
