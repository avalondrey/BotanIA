'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoStore, type GardenPhoto } from '@/store/photo-store';
import { getBestGPS } from '@/lib/gps-extractor';

// ─── Moteurs d'identification disponibles ─────────────────────────────────────
const ENGINES = [
  { id: 'groq',    label: 'Groq IA',     emoji: '⚡', color: '#f97316', desc: 'llama-3.2-vision · Gratuit · Cloud · Rapide', free: true },
  { id: 'ollama',  label: 'Ollama Local', emoji: '🏠', color: '#30D158', desc: 'llama3.2 · 100% local · Privé · Gratuit',      free: true },
  { id: 'plantid', label: 'Plant.id',     emoji: '🌿', color: '#22c55e', desc: 'API spécialisée plantes · 100/jour gratuit',    free: true },
  { id: 'claude',  label: 'Claude Vision',emoji: '🤖', color: '#8b5cf6', desc: 'Claude Opus · Précis · Clé API requise',        free: false },
];

async function identifyPlant(dataUrl: string, engine: string) {
  const base64 = dataUrl.split(',')[1];
  const mediaType = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
  const res = await fetch('/api/identify-plant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mediaType, engine }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export default function PlantIdentifier() {
  const photos = usePhotoStore(s => s.photos);
  const addPhoto = usePhotoStore(s => s.addPhoto);
  const updatePhoto = usePhotoStore(s => s.updatePhoto);
  const deletePhoto = usePhotoStore(s => s.deletePhoto);

  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GardenPhoto | null>(null);
  const [activeEngine, setActiveEngine] = useState('groq');
  const [gpsStatus, setGpsStatus] = useState<'idle'|'loading'|'found'|'none'>('idle');
  const [liveGps, setLiveGps] = useState<{lat:number;lon:number;source:string}|null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [engineError, setEngineError] = useState<string|null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const url = ev.target?.result as string;
      setGpsStatus('loading');
      const gpsResult = await getBestGPS(url);
      const gps = gpsResult ? { lat: gpsResult.lat, lon: gpsResult.lon, source: gpsResult.source } : undefined;
      setGpsStatus(gps ? 'found' : 'none');
      if (gps) setLiveGps(gps);
      addPhoto({ dataUrl: url, gps: gps as any, source: 'identificateur' });
    };
    reader.readAsDataURL(f);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraOpen(true);
    } catch { alert('Caméra inaccessible.'); }
  };

  const captureCamera = () => {
    const v = videoRef.current;
    const c = document.createElement('canvas');
    c.width = v?.videoWidth||640; c.height = v?.videoHeight||360;
    c.getContext('2d')?.drawImage(v!, 0, 0);
    const url = c.toDataURL('image/jpeg', 0.85);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOpen(false);
    getBestGPS(url).then(gpsResult => {
      const gps = gpsResult ? { lat: gpsResult.lat, lon: gpsResult.lon, source: gpsResult.source } : undefined;
      addPhoto({ dataUrl: url, gps: gps as any, source: 'identificateur' });
    });
  };

  const analyze = async (photo: GardenPhoto) => {
    if (!photo.dataUrl || analyzing) return;
    setAnalyzing(photo.id); setEngineError(null);
    try {
      const result = await identifyPlant(photo.dataUrl, activeEngine);
      updatePhoto(photo.id, { identificationResult: { ...result, analyzedAt: Date.now() } });
      if (selectedPhoto?.id === photo.id)
        setSelectedPhoto(prev => prev ? { ...prev, identificationResult: { ...result, analyzedAt: Date.now() } } : prev);
    } catch (err: any) {
      setEngineError(err.message || 'Erreur analyse');
    } finally { setAnalyzing(null); }
  };


  return (
    <div className="pi-wrap">

      {/* ── Header ── */}
      <div className="pi-header">
        <div>
          <h2 className="pi-title">🔍 Identificateur de Plantes</h2>
          <p className="pi-sub">Photo → IA → Nom, description et conseils de culture</p>
        </div>
        <div className="pi-count">{photos.length} photo{photos.length !== 1 ? 's' : ''}</div>
      </div>

      {/* ── Sélecteur de moteur IA ── */}
      <div className="pi-engines">
        <div className="pi-engines-label">🤖 Moteur d'identification :</div>
        <div className="pi-engines-grid">
          {ENGINES.map(eng => (
            <button
              key={eng.id}
              className={`pi-engine-btn ${activeEngine === eng.id ? 'pi-engine-active' : ''}`}
              style={activeEngine === eng.id ? { borderColor: eng.color, background: `${eng.color}22` } : {}}
              onClick={() => setActiveEngine(eng.id)}
            >
              <span className="pi-engine-emoji">{eng.emoji}</span>
              <span className="pi-engine-name">{eng.label}</span>
              {eng.free && <span className="pi-engine-free">GRATUIT</span>}
            </button>
          ))}
        </div>
        <div className="pi-engine-desc">
          {ENGINES.find(e => e.id === activeEngine)?.desc}
        </div>
      </div>


      {/* ── Boutons source ── */}
      <div className="pi-bar">
        <button className="pi-btn pi-primary" onClick={() => fileRef.current?.click()}>🖼️ Importer photo</button>
        <button className="pi-btn pi-secondary" onClick={startCamera}>📷 Caméra</button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* ── Badge GPS ── */}
      {gpsStatus !== 'idle' && (
        <div className={`pi-gps ${gpsStatus === 'found' ? 'pi-gps-ok' : gpsStatus === 'loading' ? 'pi-gps-load' : 'pi-gps-none'}`}>
          {gpsStatus === 'loading' && '⏳ Lecture GPS EXIF...'}
          {gpsStatus === 'found' && liveGps && `📍 GPS ${liveGps.source === 'exif' ? 'EXIF 📷' : 'Appareil 🛰️'}: ${liveGps.lat.toFixed(5)}°, ${liveGps.lon.toFixed(5)}°`}
          {gpsStatus === 'none' && '📍 Aucun GPS intégré dans cette photo'}
        </div>
      )}

      {/* ── Erreur moteur ── */}
      {engineError && (
        <div className="pi-error">⚠️ {engineError} — Essayez un autre moteur</div>
      )}

      {/* ── Caméra live ── */}
      {cameraOpen && (
        <div className="pi-cam">
          <video ref={videoRef} className="pi-video" playsInline muted />
          <button className="pi-capture" onClick={captureCamera}>⚪</button>
          <button className="pi-cam-close" onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setCameraOpen(false); }}>✕</button>
        </div>
      )}


      {/* ── Grille photos ── */}
      {photos.length === 0 ? (
        <div className="pi-empty" onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: 52 }}>🌿</div>
          <p style={{ fontWeight: 700, margin: '10px 0 6px' }}>Aucune photo pour l'instant</p>
          <p className="pi-empty-sub">
            Importez une photo ou prenez-en une avec la caméra.<br />
            Les photos du jardin (avec rangs tracés) arrivent ici automatiquement !
          </p>
        </div>
      ) : (
        <div className="pi-grid">
          {photos.map(photo => (
            <motion.div key={photo.id} className="pi-card"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>

              {/* Miniature cliquable */}
              <div className="pi-thumb-wrap" onClick={() => setSelectedPhoto(photo)}>
                {photo.dataUrl
                  ? <img src={photo.dataUrl} alt="plante" className="pi-thumb" />
                  : <div className="pi-no-img">📷</div>}

                {/* Badges */}
                <span className={`pi-badge-src ${photo.source === 'jardin' ? 'pi-src-jardin' : 'pi-src-id'}`}>
                  {photo.source === 'jardin' ? '🌱 Jardin' : '🔍 ID'}
                </span>
                {photo.gps && <span className="pi-badge-gps">📍</span>}
                {photo.seedRows && photo.seedRows.length > 0 && (
                  <span className="pi-badge-rows">{photo.seedRows.length} rangs</span>
                )}
                {photo.identificationResult && <span className="pi-badge-done">✓ Identifiée</span>}
              </div>

              {/* Infos carte */}
              <div className="pi-card-body">
                <div className="pi-card-date">
                  {new Date(photo.takenAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                {photo.gps && (
                  <div className="pi-card-gps">📍 {photo.gps.lat.toFixed(4)}°, {photo.gps.lon.toFixed(4)}°</div>
                )}

                {photo.identificationResult ? (
                  <div className="pi-result-mini">
                    <div className="pi-result-name">{photo.identificationResult.plantName}</div>
                    <div className="pi-result-conf">
                      <span className="pi-conf-bar" style={{ width: `${Math.round(photo.identificationResult.confidence * 100)}%` }} />
                      <span className="pi-conf-txt">{Math.round(photo.identificationResult.confidence * 100)}%</span>
                    </div>
                  </div>
                ) : (
                  <button
                    className={`pi-analyze-btn ${analyzing === photo.id ? 'pi-analyzing' : ''}`}
                    onClick={() => analyze(photo)}
                    disabled={!!analyzing || !photo.dataUrl}
                  >
                    {analyzing === photo.id
                      ? <span className="pi-spin">🔄</span>
                      : `${ENGINES.find(e => e.id === activeEngine)?.emoji} Identifier`}
                  </button>
                )}
                <button className="pi-delete" onClick={() => deletePhoto(photo.id)}>🗑️ Supprimer</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}


      {/* ── Modal détail photo ── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div className="pi-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}>
            <motion.div className="pi-modal" initial={{ scale: 0.88, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88 }}
              onClick={e => e.stopPropagation()}>

              <button className="pi-modal-close" onClick={() => setSelectedPhoto(null)}>✕</button>

              {selectedPhoto.dataUrl && (
                <img src={selectedPhoto.dataUrl} alt="plante" className="pi-modal-img" />
              )}

              {/* GPS */}
              {selectedPhoto.gps && (
                <div className="pi-modal-gps">
                  <span>{selectedPhoto.gps.source === 'exif' ? '📷 GPS EXIF (intégré à la photo)' : '🛰️ GPS appareil'}</span>
                  <strong>{selectedPhoto.gps.lat.toFixed(6)}°N, {selectedPhoto.gps.lon.toFixed(6)}°E</strong>
                  <a href={`https://maps.google.com/?q=${selectedPhoto.gps.lat},${selectedPhoto.gps.lon}`}
                    target="_blank" rel="noreferrer" className="pi-maps-link">🗺️ Voir sur Google Maps</a>
                </div>
              )}

              {/* Rangs tracés */}
              {selectedPhoto.seedRows && selectedPhoto.seedRows.length > 0 && (
                <div className="pi-modal-rows">
                  <strong>🌾 Rangs du jardin :</strong>
                  {selectedPhoto.seedRows.map((r, i) => (
                    <span key={r.id} className="pi-modal-row-chip">
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, display: 'inline-block', marginRight: 4 }} />
                      {r.label || `Rang ${i + 1}`}
                    </span>
                  ))}
                </div>
              )}

              {/* Résultat IA ou bouton analyse */}
              {selectedPhoto.identificationResult ? (
                <div className="pi-modal-result">
                  <div className="pi-modal-result-header">
                    <h3 className="pi-modal-plant">{selectedPhoto.identificationResult.plantName}</h3>
                    <div className="pi-modal-engine-badge">
                      {ENGINES.find(e => e.id === (selectedPhoto.identificationResult as any).engine)?.emoji || '🤖'} {(selectedPhoto.identificationResult as any).engine || 'IA'}
                    </div>
                  </div>
                  <div className="pi-modal-conf-row">
                    <div className="pi-modal-conf-bar">
                      <div className="pi-modal-conf-fill" style={{ width: `${Math.round(selectedPhoto.identificationResult.confidence * 100)}%` }} />
                    </div>
                    <span>{Math.round(selectedPhoto.identificationResult.confidence * 100)}% de confiance</span>
                  </div>
                  <p className="pi-modal-desc">{selectedPhoto.identificationResult.description}</p>
                  {selectedPhoto.identificationResult.careAdvice?.length > 0 && (
                    <div className="pi-modal-care">
                      <strong>💡 Conseils de culture :</strong>
                      <ul>{selectedPhoto.identificationResult.careAdvice.map((a, i) => <li key={i}>{a}</li>)}</ul>
                    </div>
                  )}
                  <button className="pi-reanalyze" onClick={() => { updatePhoto(selectedPhoto.id, { identificationResult: undefined }); setSelectedPhoto(prev => prev ? { ...prev, identificationResult: undefined } : prev); }}>
                    🔄 Ré-analyser avec un autre moteur
                  </button>
                </div>
              ) : (
                <button className={`pi-analyze-btn pi-analyze-lg ${analyzing === selectedPhoto.id ? 'pi-analyzing' : ''}`}
                  onClick={() => analyze(selectedPhoto)} disabled={!!analyzing || !selectedPhoto.dataUrl}>
                  {analyzing === selectedPhoto.id
                    ? '🔄 Analyse en cours...'
                    : `${ENGINES.find(e => e.id === activeEngine)?.emoji} Identifier avec ${ENGINES.find(e => e.id === activeEngine)?.label}`}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Styles ── */}
      <style>{`
        .pi-wrap{min-height:60vh;background:linear-gradient(135deg,#0d1117,#111827,#1a1a2e);color:#fff;padding:20px;font-family:system-ui,sans-serif;border-radius:16px}
        .pi-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
        .pi-title{font-size:22px;font-weight:800;margin:0 0 3px}
        .pi-sub{font-size:12px;color:#888;margin:0}
        .pi-count{background:rgba(255,255,255,.1);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap}
        /* Moteurs */
        .pi-engines{background:rgba(255,255,255,.05);border-radius:14px;padding:14px;margin-bottom:14px}
        .pi-engines-label{font-size:11px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:8px}
        .pi-engines-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:8px}
        .pi-engine-btn{display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;cursor:pointer;transition:all .2s;text-align:left}
        .pi-engine-btn:hover{border-color:rgba(255,255,255,.3)}
        .pi-engine-active{font-weight:700}
        .pi-engine-emoji{font-size:16px;flex-shrink:0}
        .pi-engine-name{font-size:12px;font-weight:600;flex:1}
        .pi-engine-free{font-size:9px;background:rgba(48,209,88,.25);color:#30D158;padding:1px 5px;border-radius:4px;font-weight:700}
        .pi-engine-desc{font-size:11px;color:#888;text-align:center}
        /* Bar */
        .pi-bar{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
        .pi-btn{padding:9px 16px;border-radius:11px;font-weight:700;font-size:12px;border:none;cursor:pointer;transition:all .2s}
        .pi-btn:active{transform:scale(.95)}
        .pi-primary{background:#30D158;color:#fff}
        .pi-secondary{background:rgba(255,255,255,.15);color:#fff}
        /* GPS / Error */
        .pi-gps{padding:6px 12px;border-radius:9px;font-size:11px;font-weight:700;margin-bottom:8px}
        .pi-gps-ok{background:rgba(48,209,88,.12);border:1px solid rgba(48,209,88,.3);color:#30D158}
        .pi-gps-load{background:rgba(255,214,10,.12);border:1px solid rgba(255,214,10,.3);color:#FFD60A}
        .pi-gps-none{background:rgba(255,69,58,.1);border:1px solid rgba(255,69,58,.25);color:#FF6B6B}
        .pi-error{background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.3);color:#FF6B6B;padding:8px 12px;border-radius:9px;font-size:12px;font-weight:600;margin-bottom:8px}
        /* Caméra */
        .pi-cam{position:relative;border-radius:14px;overflow:hidden;margin-bottom:12px;background:#000}
        .pi-video{width:100%;max-height:260px;object-fit:cover;display:block}
        .pi-capture{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.9);border:4px solid #fff;border-radius:50%;width:56px;height:56px;font-size:18px;cursor:pointer}
        .pi-cam-close{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.6);border:none;color:#fff;border-radius:50%;width:30px;height:30px;font-size:14px;cursor:pointer}
        /* Empty */
        .pi-empty{border:2px dashed rgba(255,255,255,.12);border-radius:16px;padding:52px 20px;text-align:center;cursor:pointer;margin-top:4px}
        .pi-empty-sub{color:#666;font-size:12px;line-height:1.6;margin:0}
        /* Grid */
        .pi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;margin-top:4px}
        .pi-card{background:rgba(255,255,255,.05);border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.08);transition:border-color .2s}
        .pi-card:hover{border-color:rgba(255,255,255,.2)}
        .pi-thumb-wrap{position:relative;aspect-ratio:4/3;overflow:hidden;background:#111;cursor:pointer}
        .pi-thumb{width:100%;height:100%;object-fit:cover;transition:transform .3s}
        .pi-thumb:hover{transform:scale(1.06)}
        .pi-no-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;color:#444}
        .pi-badge-src{position:absolute;top:6px;left:6px;background:rgba(0,0,0,.7);padding:3px 7px;border-radius:7px;font-size:10px;font-weight:700}
        .pi-src-jardin{color:#30D158}.pi-src-id{color:#c084fc}
        .pi-badge-gps{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.7);padding:3px 7px;border-radius:7px;font-size:11px}
        .pi-badge-rows{position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,.7);color:#FFD60A;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700}
        .pi-badge-done{position:absolute;bottom:6px;left:6px;background:rgba(48,209,88,.8);color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700}
        .pi-card-body{padding:10px}
        .pi-card-date{font-size:11px;color:#666;margin-bottom:3px}
        .pi-card-gps{font-size:10px;color:#30D158;margin-bottom:7px}
        .pi-result-mini{background:rgba(48,209,88,.08);border-radius:8px;padding:7px 9px;margin-bottom:6px}
        .pi-result-name{font-weight:700;font-size:12px;color:#30D158;margin-bottom:4px}
        .pi-result-conf{display:flex;align-items:center;gap:6px}
        .pi-conf-bar{flex:1;height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}
        .pi-conf-bar::after{content:'';display:block;height:100%;background:#30D158;width:var(--w,50%)}
        .pi-conf-txt{font-size:10px;color:#888;white-space:nowrap}
        .pi-analyze-btn{width:100%;padding:8px;border-radius:9px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:700;font-size:12px;cursor:pointer;margin-bottom:6px;transition:opacity .2s}
        .pi-analyze-lg{padding:13px;font-size:14px;margin-top:10px;margin-bottom:0}
        .pi-analyzing{opacity:.6;cursor:wait}
        .pi-spin{display:inline-block;animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pi-delete{width:100%;background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.25);color:#FF6B6B;border-radius:8px;padding:5px;font-size:11px;cursor:pointer;transition:background .2s}
        .pi-delete:hover{background:rgba(255,69,58,.25)}
        /* Overlay modal */
        .pi-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;z-index:999;backdrop-filter:blur(6px);padding:16px}
        .pi-modal{background:#13131f;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:20px;width:100%;max-width:500px;max-height:88vh;overflow-y:auto;position:relative}
        .pi-modal-close{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.1);border:none;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:13px;z-index:1}
        .pi-modal-img{width:100%;border-radius:12px;margin-bottom:12px;object-fit:cover;max-height:260px}
        .pi-modal-gps{background:rgba(48,209,88,.08);border-radius:10px;padding:10px 14px;font-size:12px;margin-bottom:10px;display:flex;flex-direction:column;gap:4px}
        .pi-modal-gps strong{color:#30D158}
        .pi-maps-link{display:inline-block;margin-top:4px;padding:4px 10px;background:rgba(10,132,255,.2);border-radius:6px;color:#60a5fa;text-decoration:none;font-weight:700;font-size:11px;width:fit-content}
        .pi-modal-rows{background:rgba(255,214,10,.07);border-radius:10px;padding:8px 12px;font-size:12px;margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
        .pi-modal-row-chip{display:inline-flex;align-items:center;background:rgba(255,255,255,.07);padding:2px 8px;border-radius:20px;font-size:11px}
        .pi-modal-result{background:rgba(48,209,88,.06);border-radius:12px;padding:14px}
        .pi-modal-result-header{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px}
        .pi-modal-plant{margin:0;font-size:18px;color:#30D158;font-weight:800}
        .pi-modal-engine-badge{background:rgba(255,255,255,.1);padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;white-space:nowrap}
        .pi-modal-conf-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .pi-modal-conf-bar{flex:1;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden}
        .pi-modal-conf-fill{height:100%;background:linear-gradient(90deg,#30D158,#34d399);border-radius:3px;transition:width .5s}
        .pi-modal-conf-row span{font-size:11px;color:#888;white-space:nowrap}
        .pi-modal-desc{font-size:13px;color:#ccc;line-height:1.6;margin-bottom:10px}
        .pi-modal-care strong{font-size:12px;color:#FFD60A}
        .pi-modal-care ul{margin:6px 0 10px 0;padding-left:18px;font-size:12px;color:#aaa;line-height:1.8}
        .pi-reanalyze{width:100%;padding:9px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#ccc;border-radius:9px;font-size:12px;cursor:pointer;margin-top:4px;transition:background .2s}
        .pi-reanalyze:hover{background:rgba(255,255,255,.14)}
      `}</style>
    </div>
  );
}
