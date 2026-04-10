'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoStore } from '@/store/photo-store';
import { getBestGPS } from '@/lib/gps-extractor';
import { useGameStore } from '@/store/game-store';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface SeedRow {
  id: string;
  color: string;
  label?: string;
  points: { x: number; y: number }[];
  plantDefId?: string;   // Type de plante
  plantCount?: number;   // Nombre de plants
}

interface SeedRowPainterProps {
  onRowsChange?: (rows: SeedRow[]) => void;
}

interface DrawingPoint {
  x: number;
  y: number;
}

// ─── Palette de couleurs ───────────────────────────────────────────────────────
const COLORS = [
  { id: 'red', name: 'Rouge', hex: '#FF6B6B', emoji: '🔴' },
  { id: 'blue', name: 'Bleu', hex: '#4DABF7', emoji: '🔵' },
  { id: 'green', name: 'Vert', hex: '#51CF66', emoji: '🟢' },
  { id: 'yellow', name: 'Jaune', hex: '#FFD43B', emoji: '🟡' },
  { id: 'purple', name: 'Violet', hex: '#CC5DE8', emoji: '🟣' },
  { id: 'orange', name: 'Orange', hex: '#FF922B', emoji: '🟠' },
  { id: 'pink', name: 'Rose', hex: '#FF6BD5', emoji: '🩷' },
  { id: 'white', name: 'Blanc', hex: '#F8F9FA', emoji: '⚪' },
  { id: 'empty', name: 'Vide', hex: '#6C757D', emoji: '❌' }, // Nouveau marqueur
];

// ─── Plantes disponibles pour synchronisation ──────────────────────────────────
const AVAILABLE_PLANTS = [
  { id: 'tomato', name: 'Tomate', emoji: '🍅' },
  { id: 'pepper', name: 'Poivron', emoji: '🫑' },
  { id: 'lettuce', name: 'Laitue', emoji: '🥬' },
  { id: 'carrot', name: 'Carotte', emoji: '🥕' },
  { id: 'basil', name: 'Basilic', emoji: '🌿' },
  { id: 'strawberry', name: 'Fraise', emoji: '🍓' },
];

export default function SeedRowPainter({ onRowsChange }: SeedRowPainterProps) {
  const photos = usePhotoStore(s => s.photos);
  const addPhoto = usePhotoStore(s => s.addPhoto);
  const updatePhoto = usePhotoStore(s => s.updatePhoto);
  const deletePhoto = usePhotoStore(s => s.deletePhoto);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [gps, setGps] = useState<any>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle'|'loading'|'found'|'none'>('idle');
  const [rows, setRows] = useState<SeedRow[]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0].hex);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'photo' | 'camera'>('photo');
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [rowLabel, setRowLabel] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  
  // States pour synchronisation jardin
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncConfig, setSyncConfig] = useState<Record<string, { plantDefId: string; plantCount: number }>>({});

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ─── Éteindre la caméra au unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ─── Gestion photo ─────────────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      setPhotoUrl(url);
      setMode('photo');
      setGpsStatus('loading');
      const gpsResult = await getBestGPS(url);
      const gpsData = gpsResult ? { lat: gpsResult.lat, lon: gpsResult.lon, source: gpsResult.source } : undefined;
      setGps(gpsData);
      setGpsStatus(gpsData ? 'found' : 'none');
      const id = addPhoto({ dataUrl: url, gps: gpsData as any, source: 'jardin' });
      setPhotoId(id);
    };
    reader.readAsDataURL(f);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode('camera');
    } catch {
      alert('Caméra inaccessible.');
    }
  };

  const captureCamera = () => {
    const v = videoRef.current;
    const c = document.createElement('canvas');
    c.width = v?.videoWidth || 640;
    c.height = v?.videoHeight || 360;
    c.getContext('2d')?.drawImage(v!, 0, 0);
    const url = c.toDataURL('image/jpeg', 0.85);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setPhotoUrl(url);
    setMode('photo');
    getBestGPS(url).then(gpsResult => {
      const gpsData = gpsResult ? { lat: gpsResult.lat, lon: gpsResult.lon, source: gpsResult.source } : undefined;
      setGps(gpsData);
      setGpsStatus(gpsData ? 'found' : 'none');
      const id = addPhoto({ dataUrl: url, gps: gpsData as any, source: 'jardin' });
      setPhotoId(id);
    });
  };

  // ─── Dessin sur canvas ──────────────────────────────────────────────────────────
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Dessiner tous les rangs
    rows.forEach(row => {
      if (row.points.length < 2) return;
      ctx.strokeStyle = row.color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(row.points[0].x, row.points[0].y);
      row.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    // Dessiner le trait en cours
    if (currentPoints.length > 0) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setCurrentPoints(prev => [...prev, { x, y }]);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 1) {
      const newRow: SeedRow = {
        id: Math.random().toString(36).slice(2, 9),
        color: currentColor,
        points: currentPoints,
      };
      setRows(prev => {
        const updated = [...prev, newRow];
        onRowsChange?.(updated);
        return updated;
      });
    }
    setCurrentPoints([]);
  };

  // ─── Touch support ──────────────────────────────────────────────────────────────
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    setCurrentPoints(prev => [...prev, { x, y }]);
  };

  const handleCanvasTouchEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 1) {
      const newRow: SeedRow = {
        id: Math.random().toString(36).slice(2, 9),
        color: currentColor,
        points: currentPoints,
      };
      setRows(prev => {
        const updated = [...prev, newRow];
        onRowsChange?.(updated);
        return updated;
      });
    }
    setCurrentPoints([]);
  };

  // Redessiner à chaque changement de rows / photoUrl
  useEffect(() => {
    if (canvasRef.current && imgRef.current) redrawCanvas();
  }, [rows, photoUrl]);

  const clearAll = () => {
    if (!confirm('Effacer la photo et tous les rangs ?')) return;
    setPhotoUrl(null);
    const emptyRows: SeedRow[] = [];
    setRows(emptyRows);
    onRowsChange?.(emptyRows);
    setGps(null);
    setGpsStatus('idle');
    setCurrentPoints([]);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  const saveToPhotoStore = () => {
    if (!photoUrl || !photoId) return;
    updatePhoto(photoId, { seedRows: rows });
    alert(`✅ Rangs sauvegardés !\n\n${rows.length} rang(s) tracé(s).`);
    setShowModal(false);
  };

  const deleteRow = (id: string) => {
    const updated = rows.filter(r => r.id !== id);
    setRows(updated);
    onRowsChange?.(updated);
  };

  const openRowEditor = (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    setEditingRow(rowId);
    setRowLabel(row.label || '');
  };

  const saveRowLabel = () => {
    if (!editingRow) return;
    const updated = rows.map(r => r.id === editingRow ? { ...r, label: rowLabel } : r);
    setRows(updated);
    onRowsChange?.(updated);
    setEditingRow(null);
    setRowLabel('');
  };

  // ─── Synchronisation vers jardin ────────────────────────────────────────────────
  const openSyncModal = () => {
    // Initialiser syncConfig avec les rangs actuels
    const initialConfig: Record<string, { plantDefId: string; plantCount: number }> = {};
    rows.forEach(row => {
      initialConfig[row.id] = {
        plantDefId: row.plantDefId || 'tomato',
        plantCount: row.plantCount || 5
      };
    });
    setSyncConfig(initialConfig);
    setShowSyncModal(true);
  };

  const updateSyncConfig = (rowId: string, field: 'plantDefId' | 'plantCount', value: string | number) => {
    setSyncConfig(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
  };

  const syncToGarden = () => {
    const createDigitalTwin = (useGameStore.getState() as any).createDigitalTwinInGarden;
    if (!createDigitalTwin) {
      alert('❌ Fonction non disponible.\n\nVeuillez mettre à jour game-store.ts.');
      return;
    }

    let totalPlaced = 0;
    let totalFailed = 0;
    const startX = 100; // Position de départ
    let currentX = startX;
    const spacing = 80; // Espacement entre colonnes

    rows.forEach((row, rowIndex) => {
      const config = syncConfig[row.id];
      if (!config || row.color === COLORS.find(c => c.id === 'empty')?.hex) return;

      const { plantDefId, plantCount } = config;
      const startY = 100;
      const plantSpacing = 60;

      for (let i = 0; i < plantCount; i++) {
        const y = startY + (i * plantSpacing);
        const result = createDigitalTwin(plantDefId, currentX, y, {
          plantName: AVAILABLE_PLANTS.find(p => p.id === plantDefId)?.name || 'Plante',
          confidence: 0.9,
          growthStage: { stage: 1, estimatedAge: 7 },
          healthStatus: { isHealthy: true, diseaseName: 'Sain' }
        });

        if (result.success) {
          totalPlaced++;
        } else {
          totalFailed++;
        }
      }

      currentX += spacing; // Passer à la colonne suivante
    });

    setShowSyncModal(false);
    
    alert(`✅ Synchronisation terminée !\n\n🌱 ${totalPlaced} plants placés\n${totalFailed > 0 ? `⚠️ ${totalFailed} échecs` : ''}\n\nRetrouve tes plants dans Jardin → Vue Plan !`);
  };

  // ─── Statistiques ───────────────────────────────────────────────────────────────
  const totalPlants = rows.reduce((sum, r) => sum + (r.plantCount || 0), 0);
  const emptySlots = rows.filter(r => r.color === COLORS.find(c => c.id === 'empty')?.hex).length;

  return (
    <div className="sp-wrap">
      {/* Header */}
      <div className="sp-header">
        <div>
          <h2 className="sp-title">🏷️ GrainTag - Marquage Photos</h2>
          <p className="sp-sub">Marquez vos plants/semences • Comptez • Synchronisez</p>
        </div>
        <div className="sp-stats">
          {rows.length} rang{rows.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Aide dépliable */}
      <div className="sp-help-section">
        <button className="sp-help-toggle" onClick={() => setShowHelp(!showHelp)}>
          📖 Mode d'emploi {showHelp ? '▼' : '▶'}
        </button>
        {showHelp && (
          <div className="sp-help-content">
            <p><strong>Prenez une photo</strong> de votre jardin ou mini serre</p>
            <p><strong>Choisissez une couleur</strong> dans la palette (ou ❌ pour marquer un emplacement vide)</p>
            <p><strong>Tracez un trait</strong> sur chaque rangée de plants avec votre doigt</p>
            <p><strong>Sélectionnez le type de plante</strong> et indiquez le nombre de plants</p>
            <p><strong>Synchronisez</strong> avec la grille du jardin ou les mini serres</p>
            <p className="sp-help-hint">💡 Astuce : Le marqueur ❌ permet de compter les emplacements vides</p>
          </div>
        )}
      </div>

      {/* Boutons source */}
      <div className="sp-bar">
        <button className="sp-btn sp-primary" onClick={() => fileRef.current?.click()}>
          🖼️ Photo
        </button>
        <button className="sp-btn sp-secondary" onClick={startCamera}>
          📷 Caméra
        </button>
        {photoUrl && (
          <button className="sp-btn sp-danger" onClick={clearAll}>
            🗑️ Effacer
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Badge GPS */}
      {gpsStatus !== 'idle' && (
        <div className={`sp-gps-badge ${gpsStatus === 'found' ? 'sp-gps-ok' : gpsStatus === 'loading' ? 'sp-gps-loading' : 'sp-gps-none'}`}>
          {gpsStatus === 'loading' && '⏳ Recherche GPS...'}
          {gpsStatus === 'found' && gps && `📍 GPS ${gps.source === 'exif' ? 'EXIF' : '🛰️ Device'}: ${gps.lat.toFixed(5)}°, ${gps.lon.toFixed(5)}°`}
          {gpsStatus === 'none' && '📍 Pas de GPS dans cette photo'}
        </div>
      )}

      {/* Statistiques */}
      {rows.length > 0 && (
        <div className="sp-stats-panel">
          <div className="sp-stat-item">
            <span className="sp-stat-emoji">🌱</span>
            <span className="sp-stat-label">{totalPlants} plants</span>
          </div>
          <div className="sp-stat-item">
            <span className="sp-stat-emoji">❌</span>
            <span className="sp-stat-label">{emptySlots} vides</span>
          </div>
        </div>
      )}

      {/* Caméra live */}
      {mode === 'camera' && (
        <div className="sp-cam-wrap">
          <video ref={videoRef} className="sp-video" playsInline muted />
          <button className="sp-capture" onClick={captureCamera}>⚪</button>
          <button className="sp-cam-close" onClick={() => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            setMode('photo');
          }}>✕</button>
        </div>
      )}

      {/* Canvas de dessin */}
      {photoUrl && mode === 'photo' && (
        <div className="sp-canvas-wrap">
          <img
            ref={imgRef}
            src={photoUrl}
            alt="Photo jardin"
            className="sp-photo"
            style={{ display: 'none' }}
            onLoad={redrawCanvas}
          />
          <canvas
            ref={canvasRef}
            className="sp-canvas"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
          />
        </div>
      )}

      {/* Palette de couleurs */}
      {photoUrl && mode === 'photo' && (
        <div className="sp-palette">
          <div className="sp-palette-label">🎨 Couleur :</div>
          <div className="sp-palette-grid">
            {COLORS.map(c => (
              <button
                key={c.id}
                className={`sp-color-btn ${currentColor === c.hex ? 'sp-color-active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setCurrentColor(c.hex)}
                title={c.name}
              >
                {c.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des rangs */}
      {rows.length > 0 && (
        <div className="sp-rows-list">
          <div className="sp-rows-header">
            <span>📊 {rows.length} rang{rows.length !== 1 ? 's' : ''} tracé{rows.length !== 1 ? 's' : ''}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="sp-sync-btn" onClick={openSyncModal} title="Synchroniser avec le jardin virtuel">
                🌱 Sync Jardin
              </button>
              <button className="sp-save-btn" onClick={() => setShowModal(true)}>
                💾 Sauvegarder
              </button>
            </div>
          </div>
          {rows.map((row, idx) => (
            <div key={row.id} className="sp-row-item">
              <div className="sp-row-color" style={{ background: row.color }} />
              <div className="sp-row-info">
                <span className="sp-row-name">
                  {row.label || `Rang ${idx + 1}`}
                  {row.plantCount && <span className="sp-row-count"> ({row.plantCount} plants)</span>}
                </span>
                <span className="sp-row-pts">{row.points.length} points</span>
              </div>
              <button className="sp-row-edit" onClick={() => openRowEditor(row.id)}>✏️</button>
              <button className="sp-row-delete" onClick={() => deleteRow(row.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* Modale d'édition de rang */}
      <AnimatePresence>
        {editingRow && (
          <motion.div
            className="sp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingRow(null)}
          >
            <motion.div
              className="sp-modal"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sp-modal-close" onClick={() => setEditingRow(null)}>✕</button>
              <h3 className="sp-modal-title">✏️ Éditer le rang</h3>
              <div className="sp-modal-field">
                <label className="sp-modal-label">Nom du rang</label>
                <input
                  type="text"
                  className="sp-modal-input"
                  value={rowLabel}
                  onChange={(e) => setRowLabel(e.target.value)}
                  placeholder="Ex: Tomates"
                />
              </div>
              <button className="sp-modal-save" onClick={saveRowLabel}>
                ✅ Sauvegarder
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de sauvegarde */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="sp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="sp-modal"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sp-modal-close" onClick={() => setShowModal(false)}>✕</button>
              <h3 className="sp-modal-title">💾 Sauvegarder les rangs</h3>
              <p className="sp-modal-text">
                {rows.length} rang{rows.length !== 1 ? 's' : ''} tracé{rows.length !== 1 ? 's' : ''}
              </p>
              {gps && (
                <div className="sp-modal-gps">
                  📍 GPS: {gps.lat.toFixed(5)}°, {gps.lon.toFixed(5)}°
                </div>
              )}
              <button className="sp-modal-save" onClick={saveToPhotoStore}>
                ✅ Confirmer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de synchronisation jardin */}
      <AnimatePresence>
        {showSyncModal && (
          <motion.div
            className="sp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSyncModal(false)}
          >
            <motion.div
              className="sp-modal sp-modal-wide"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sp-modal-close" onClick={() => setShowSyncModal(false)}>✕</button>
              <h3 className="sp-modal-title">🌱 Synchroniser avec le Jardin</h3>
              <p className="sp-modal-text">Configure chaque rang avant import dans le jardin virtuel</p>
              
              <div className="sp-sync-list">
                {rows.map((row, idx) => {
                  const config = syncConfig[row.id] || { plantDefId: 'tomato', plantCount: 5 };
                  const isEmpty = row.color === COLORS.find(c => c.id === 'empty')?.hex;
                  
                  return (
                    <div key={row.id} className={`sp-sync-row ${isEmpty ? 'sp-sync-row-disabled' : ''}`}>
                      <div className="sp-sync-row-header">
                        <div className="sp-sync-row-color" style={{ background: row.color }} />
                        <span className="sp-sync-row-label">{row.label || `Rang ${idx + 1}`}</span>
                        {isEmpty && <span className="sp-sync-empty-badge">❌ Vide</span>}
                      </div>
                      
                      {!isEmpty && (
                        <div className="sp-sync-row-config">
                          <div className="sp-sync-field">
                            <label className="sp-sync-label">Type de plante</label>
                            <select
                              className="sp-sync-select"
                              value={config.plantDefId}
                              onChange={(e) => updateSyncConfig(row.id, 'plantDefId', e.target.value)}
                            >
                              {AVAILABLE_PLANTS.map(plant => (
                                <option key={plant.id} value={plant.id}>
                                  {plant.emoji} {plant.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sp-sync-field sp-sync-field-small">
                            <label className="sp-sync-label">Nombre</label>
                            <input
                              type="number"
                              className="sp-sync-input"
                              min="1"
                              max="20"
                              value={config.plantCount}
                              onChange={(e) => updateSyncConfig(row.id, 'plantCount', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="sp-sync-info">
                💡 Les plants seront placés en colonnes dans votre jardin virtuel
              </div>

              <button className="sp-modal-save" onClick={syncToGarden}>
                🌱 Importer dans le Jardin
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        .sp-wrap{min-height:60vh;background:linear-gradient(135deg,#0d1117,#111827,#1a1a2e);color:#fff;padding:20px;font-family:system-ui,sans-serif;border-radius:16px}
        .sp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
        .sp-title{font-size:22px;font-weight:800;margin:0 0 3px}
        .sp-sub{font-size:12px;color:#888;margin:0}
        .sp-stats{background:rgba(255,255,255,.1);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700}
        .sp-help-section{margin-bottom:14px}
        .sp-help-toggle{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#ccc;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;text-align:left;transition:all .2s}
        .sp-help-toggle:hover{background:rgba(255,255,255,.08)}
        .sp-help-content{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-top:8px;font-size:12px;line-height:1.8;color:#aaa}
        .sp-help-content p{margin:6px 0}
        .sp-help-content strong{color:#FFD60A;font-weight:700}
        .sp-help-hint{color:#30D158;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.05)}
        .sp-bar{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
        .sp-btn{padding:9px 16px;border-radius:11px;font-weight:700;font-size:12px;border:none;cursor:pointer;transition:all .2s}
        .sp-btn:active{transform:scale(.95)}
        .sp-primary{background:#30D158;color:#fff}
        .sp-secondary{background:rgba(255,255,255,.15);color:#fff}
        .sp-danger{background:rgba(255,69,58,.2);color:#FF6B6B;border:1px solid rgba(255,69,58,.3)}
        .sp-gps-badge{padding:6px 12px;border-radius:9px;font-size:11px;font-weight:700;margin-bottom:8px}
        .sp-gps-ok{background:rgba(48,209,88,.12);border:1px solid rgba(48,209,88,.3);color:#30D158}
        .sp-gps-loading{background:rgba(255,214,10,.12);border:1px solid rgba(255,214,10,.3);color:#FFD60A}
        .sp-gps-none{background:rgba(255,69,58,.1);border:1px solid rgba(255,69,58,.25);color:#FF6B6B}
        .sp-stats-panel{display:flex;gap:10px;margin-bottom:12px}
        .sp-stat-item{background:rgba(255,255,255,.05);padding:8px 14px;border-radius:10px;display:flex;align-items:center;gap:8px;flex:1}
        .sp-stat-emoji{font-size:18px}
        .sp-stat-label{font-size:12px;font-weight:700;color:#ccc}
        .sp-cam-wrap{position:relative;border-radius:14px;overflow:hidden;margin-bottom:12px;background:#000}
        .sp-video{width:100%;max-height:260px;object-fit:cover;display:block}
        .sp-capture{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.9);border:4px solid #fff;border-radius:50%;width:56px;height:56px;font-size:18px;cursor:pointer}
        .sp-cam-close{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.6);border:none;color:#fff;border-radius:50%;width:30px;height:30px;font-size:14px;cursor:pointer}
        .sp-canvas-wrap{position:relative;border-radius:14px;overflow:hidden;margin-bottom:12px;background:#000}
        .sp-canvas{width:100%;display:block;cursor:crosshair;touch-action:none}
        .sp-photo{max-width:100%;border-radius:14px}
        .sp-palette{background:rgba(255,255,255,.05);border-radius:12px;padding:12px;margin-bottom:12px}
        .sp-palette-label{font-size:11px;font-weight:700;color:#888;margin-bottom:8px}
        .sp-palette-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:6px}
        .sp-color-btn{width:44px;height:44px;border-radius:10px;border:2px solid rgba(255,255,255,.1);cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .sp-color-btn:hover{transform:scale(1.05)}
        .sp-color-active{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.3)}
        .sp-rows-list{background:rgba(255,255,255,.04);border-radius:12px;padding:12px}
        .sp-rows-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:13px;font-weight:700;color:#ccc}
        .sp-save-btn{background:#30D158;color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer}
        .sp-row-item{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);border-radius:9px;padding:9px;margin-bottom:6px}
        .sp-row-color{width:20px;height:20px;border-radius:4px;flex-shrink:0}
        .sp-row-info{flex:1;min-width:0}
        .sp-row-name{font-size:13px;font-weight:600;display:block;color:#fff}
        .sp-row-count{color:#30D158;font-size:11px;font-weight:700}
        .sp-row-pts{font-size:10px;color:#888}
        .sp-row-edit{background:rgba(255,214,10,.15);border:none;color:#FFD60A;padding:5px 9px;border-radius:6px;font-size:13px;cursor:pointer}
        .sp-row-delete{background:rgba(255,69,58,.15);border:none;color:#FF6B6B;padding:5px 9px;border-radius:6px;font-size:13px;cursor:pointer}
        .sp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;z-index:999;backdrop-filter:blur(6px);padding:16px}
        .sp-modal{background:#13131f;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:20px;width:100%;max-width:400px;position:relative}
        .sp-modal-close{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.1);border:none;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:13px}
        .sp-modal-title{font-size:18px;font-weight:800;margin:0 0 12px;color:#fff}
        .sp-modal-text{font-size:13px;color:#ccc;margin-bottom:10px}
        .sp-modal-gps{background:rgba(48,209,88,.08);padding:8px 12px;border-radius:8px;font-size:11px;color:#30D158;margin-bottom:10px}
        .sp-modal-field{margin-bottom:12px}
        .sp-modal-label{display:block;font-size:11px;font-weight:700;color:#888;margin-bottom:6px;text-transform:uppercase}
        .sp-modal-input{width:100%;padding:9px 12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:9px;color:#fff;font-size:13px}
        .sp-modal-save{width:100%;padding:10px;background:#30D158;border:none;color:#fff;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer}
        .sp-sync-btn{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s}
        .sp-sync-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(102,126,234,.4)}
        .sp-modal-wide{max-width:500px}
        .sp-sync-list{max-height:400px;overflow-y:auto;margin-bottom:14px}
        .sp-sync-row{background:rgba(255,255,255,.05);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,.08)}
        .sp-sync-row-disabled{opacity:.4;pointer-events:none}
        .sp-sync-row-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .sp-sync-row-color{width:16px;height:16px;border-radius:4px;flex-shrink:0}
        .sp-sync-row-label{font-size:13px;font-weight:700;color:#fff;flex:1}
        .sp-sync-empty-badge{font-size:10px;background:rgba(255,255,255,.1);padding:3px 8px;border-radius:6px;color:#888}
        .sp-sync-row-config{display:flex;gap:10px}
        .sp-sync-field{flex:1}
        .sp-sync-field-small{flex:0 0 100px}
        .sp-sync-label{display:block;font-size:10px;font-weight:700;color:#888;margin-bottom:6px;text-transform:uppercase}
        .sp-sync-select{width:100%;padding:8px 10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#fff;font-size:12px;cursor:pointer}
        .sp-sync-input{width:100%;padding:8px 10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#fff;font-size:12px;text-align:center}
        .sp-sync-info{background:rgba(102,126,234,.12);border:1px solid rgba(102,126,234,.3);color:#a5b4fc;padding:10px 14px;border-radius:10px;font-size:11px;margin-bottom:14px;text-align:center}
      `}</style>
    </div>
  );
}
