/**
 * DiseaseDetector — Détection de maladies vegetales
 * Même pipeline que PlantIdentifier, prompt différent pour les maladies
 */

'use client';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
  start: () => void;
  stop: () => void;
}
declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};
declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoStore, type GardenPhoto } from '@/store/photo-store';
import { getBestGPS } from '@/lib/gps-extractor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle, Info, Mic, MicOff, Send } from 'lucide-react';

// ─── Moteurs disponibles (mêmes que PlantIdentifier) ─────────────────────────
const ENGINES = [
  { id: 'groq',    label: 'Groq IA',       emoji: '⚡', color: '#f97316', desc: 'llama-3.2-vision · Gratuit · Cloud · Rapide', free: true },
  { id: 'ollama',  label: 'Ollama Local',  emoji: '🏠', color: '#30D158', desc: 'llama3.2 · 100% local · Privé · Gratuit',      free: true },
  { id: 'plantid', label: 'Plant.id',      emoji: '🌿', color: '#22c55e', desc: 'API spécialisée plantes · 100/jour gratuit',    free: true },
  { id: 'claude',  label: 'Claude Vision', emoji: '🤖', color: '#8b5cf6', desc: 'Claude Opus · Précis · Clé API requise',        free: false },
];

async function detectDisease(dataUrl: string, engine: string) {
  const base64 = dataUrl.split(',')[1];
  const mediaType = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
  const res = await fetch('/api/detect-disease', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mediaType, engine }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

const SEVERITY_COLORS = {
  low:      { bg: 'bg-green-100',      text: 'text-green-800', border: 'border-green-300',  label: 'Faible' },
  medium:   { bg: 'bg-yellow-100',     text: 'text-yellow-800', border: 'border-yellow-300', label: 'Moyen' },
  high:     { bg: 'bg-orange-100',     text: 'text-orange-800', border: 'border-orange-300', label: 'Élevé' },
  critical: { bg: 'bg-red-100',        text: 'text-red-800',   border: 'border-red-300',    label: 'Critique' },
};

export default function DiseaseDetector() {
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
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceHistory, setVoiceHistory] = useState<{text:string; time:Date}[]>([]);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

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

  // ── Voice dictation ──────────────────────────────────────────────
  const recognitionRef = useRef<SpeechRecognition|null>(null);

  const startVoiceInput = () => {
    const win = window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition };
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) {
      alert('Dictée vocale non supportée par ce navigateur.');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setVoiceText(final || interim);
    };

    recognition.onend = () => {
      if (isRecording) {
        // restart if still recording
        try { recognition.start(); } catch {}
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (voiceText.trim()) {
      setVoiceHistory(prev => [{ text: voiceText.trim(), time: new Date() }, ...prev]);
      setVoiceText('');
    }
  };

  const submitVoiceText = () => {
    if (!voiceText.trim()) return;
    setVoiceHistory(prev => [{ text: voiceText.trim(), time: new Date() }, ...prev]);
    setVoiceText('');
  };

  const analyze = async (photo: GardenPhoto) => {
    if (!photo.dataUrl || analyzing) return;
    setAnalyzing(photo.id); setEngineError(null);
    try {
      const result = await detectDisease(photo.dataUrl, activeEngine);
      updatePhoto(photo.id, { diseaseResult: { ...result, analyzedAt: Date.now() } });
      if (selectedPhoto?.id === photo.id)
        setSelectedPhoto(prev => prev ? { ...prev, diseaseResult: { ...result, analyzedAt: Date.now() } } : prev);
    } catch (err: any) {
      setEngineError(err.message || 'Erreur analyse');
    } finally { setAnalyzing(null); }
  };

  return (
    <div className="dd-wrap space-y-4 p-4">
      {/* ── Header ── */}
      <div className="dd-header flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">🦠 Détection de Maladies</h2>
          <p className="text-sm text-muted-foreground">Photo → IA → Maladie identifiée + conseils de traitement</p>
        </div>
        <Badge variant="outline">{photos.length} photo{photos.length !== 1 ? 's' : ''}</Badge>
      </div>

      {/* ── Sélecteur de moteur IA ── */}
      <div className="dd-engines space-y-2">
        <div className="text-sm font-medium">🤖 Moteur de détection :</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ENGINES.map(eng => (
            <button
              key={eng.id}
              onClick={() => setActiveEngine(eng.id)}
              className={`p-2 rounded-lg border-2 transition-colors text-left ${
                activeEngine === eng.id ? 'border-solid' : 'border-dashed opacity-60 hover:opacity-100'
              }`}
              style={activeEngine === eng.id ? { borderColor: eng.color, background: `${eng.color}22` } : {}}
            >
              <div className="flex items-center gap-1">
                <span>{eng.emoji}</span>
                <span className="font-medium text-sm">{eng.label}</span>
              </div>
              {eng.free && <span className="text-xs text-green-600 font-medium">GRATUIT</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {ENGINES.find(e => e.id === activeEngine)?.desc}
        </p>
      </div>

      {/* ── Boutons source ── */}
      <div className="dd-bar flex gap-2">
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          🖼️ Importer photo
        </Button>
        <Button variant="outline" onClick={startCamera}>
          📷 Caméra
        </Button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* ── Badge GPS ── */}
      {gpsStatus !== 'idle' && (
        <Alert variant={gpsStatus === 'found' ? 'default' : 'default'} className={gpsStatus === 'found' ? 'border-green-300 bg-green-50' : ''}>
          {gpsStatus === 'loading' && <AlertDescription>⏳ Lecture GPS EXIF...</AlertDescription>}
          {gpsStatus === 'found' && liveGps && (
            <AlertDescription className="text-green-700">
              📍 GPS {liveGps.source === 'exif' ? 'EXIF 📷' : 'Appareil 🛰️'}: {liveGps.lat.toFixed(5)}°, {liveGps.lon.toFixed(5)}°
            </AlertDescription>
          )}
          {gpsStatus === 'none' && <AlertDescription>📍 Aucun GPS intégré dans cette photo</AlertDescription>}
        </Alert>
      )}

      {/* ── Voice dictation ── */}
      <div className="dd-voice-section">
        <Button
          variant={showVoiceInput ? "secondary" : "outline"}
          onClick={() => setShowVoiceInput(v => !v)}
          className="w-full"
        >
          {showVoiceInput ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
          🎙️ Mode Dictée Terrain
        </Button>

        {showVoiceInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-4 border rounded-lg bg-muted/30 space-y-3"
          >
            <p className="text-sm text-muted-foreground">
              Parlez pour noter vos observations dans le journal. L'IA analysera vos mots.
            </p>

            {/* Recording controls */}
            <div className="flex gap-2">
              {!isRecording ? (
                <Button onClick={startVoiceInput} className="flex-1">
                  <Mic className="h-4 w-4 mr-2" /> Commencer
                </Button>
              ) : (
                <Button onClick={stopVoiceInput} variant="destructive" className="flex-1">
                  <MicOff className="h-4 w-4 mr-2" /> Arrêter
                </Button>
              )}
            </div>

            {/* Live transcription */}
            {isRecording && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-700">Enregistrement...</span>
                </div>
                <p className="text-sm italic text-red-600">{voiceText || "Parlez maintenant..."}</p>
              </div>
            )}

            {/* Manual text input */}
            {!isRecording && voiceText && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voiceText}
                  onChange={e => setVoiceText(e.target.value)}
                  placeholder="Éditez ou tapez votre observation..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <Button size="sm" onClick={submitVoiceText}><Send className="h-4 w-4" /></Button>
              </div>
            )}

            {/* History */}
            {voiceHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">📖 Journal d'observations</h4>
                {voiceHistory.map((entry, i) => (
                  <div key={i} className="p-2 bg-background border rounded text-sm">
                    <div className="text-xs text-muted-foreground mb-1">
                      {entry.time.toLocaleDateString('fr-FR')} — {entry.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p>{entry.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Erreur moteur ── */}
      {engineError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {engineError} — Essayez un autre moteur
          </AlertDescription>
        </Alert>
      )}

      {/* ── Caméra live ── */}
      {cameraOpen && (
        <div className="dd-cam relative">
          <video ref={videoRef} className="w-full rounded-lg" playsInline muted />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button variant="secondary" size="lg" onClick={captureCamera}>⚪ Capturer</Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80"
            onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setCameraOpen(false); }}
          >
            ✕ Fermer
          </Button>
        </div>
      )}

      {/* ── Grille photos ── */}
      {photos.length === 0 ? (
        <div className="dd-empty text-center py-12 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: 52 }}>🦠</div>
          <p className="font-bold mt-3">Aucune photo pour l'instant</p>
          <p className="text-sm text-muted-foreground mt-1">
            Importez une photo de plante pour détecter d'éventuelles maladies.
          </p>
        </div>
      ) : (
        <div className="dd-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map(photo => (
            <motion.div
              key={photo.id}
              className="dd-card border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Miniature */}
              <div className="dd-thumb-wrap relative aspect-square cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                {photo.dataUrl
                  ? <img src={photo.dataUrl} alt="plante" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">📷</div>}

                {/* Badge maladie détectée */}
                {photo.diseaseResult && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    photo.diseaseResult.diseaseName === 'Plante saine'
                      ? 'bg-green-200 text-green-800 border-green-300'
                      : SEVERITY_COLORS[photo.diseaseResult.severity].bg + ' ' + SEVERITY_COLORS[photo.diseaseResult.severity].text + ' ' + SEVERITY_COLORS[photo.diseaseResult.severity].border
                  }`}>
                    {photo.diseaseResult.diseaseName === 'Plante saine' ? '✓ Saine' : photo.diseaseResult.diseaseName}
                  </span>
                )}
              </div>

              {/* Infos */}
              <div className="dd-card-body p-2 space-y-1">
                <div className="text-xs text-muted-foreground">
                  {new Date(photo.takenAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </div>

                {photo.diseaseResult ? (
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className={`${SEVERITY_COLORS[photo.diseaseResult.severity].bg} ${SEVERITY_COLORS[photo.diseaseResult.severity].text} ${SEVERITY_COLORS[photo.diseaseResult.severity].border} text-xs`}
                    >
                      {SEVERITY_COLORS[photo.diseaseResult.severity].label}
                    </Badge>
                    <div className="text-xs">
                      Confiance: {Math.round(photo.diseaseResult.confidence * 100)}%
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => analyze(photo)}
                    disabled={!!analyzing || !photo.dataUrl}
                  >
                    {analyzing === photo.id ? '🔄' : '🔍'} Analyser
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => deletePhoto(photo.id)}
                >
                  🗑️
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modal détail photo ── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="bg-background rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Image */}
              {selectedPhoto.dataUrl && (
                <img src={selectedPhoto.dataUrl} alt="plante" className="w-full max-h-64 object-contain rounded-t-xl" />
              )}

              <div className="p-4 space-y-4">
                {/* Bouton fermer */}
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>✕</Button>
                </div>

                {/* Résultat maladie */}
                {selectedPhoto.diseaseResult ? (
                  <div className="space-y-4">
                    {/* Header résultat */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">
                          {selectedPhoto.diseaseResult.diseaseName}
                        </h3>
                        <Badge
                          className={`mt-1 ${SEVERITY_COLORS[selectedPhoto.diseaseResult.severity].bg} ${SEVERITY_COLORS[selectedPhoto.diseaseResult.severity].text} ${SEVERITY_COLORS[selectedPhoto.diseaseResult.severity].border}`}
                        >
                          Sévérité: {SEVERITY_COLORS[selectedPhoto.diseaseResult.severity].label}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {ENGINES.find(e => e.id === selectedPhoto.diseaseResult?.engine)?.emoji} {selectedPhoto.diseaseResult.engine}<br />
                        Confiance: {Math.round(selectedPhoto.diseaseResult.confidence * 100)}%
                      </div>
                    </div>

                    {/* Parties affectées */}
                    {selectedPhoto.diseaseResult.affectedParts?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">🎯 Parties affectées</h4>
                        <div className="flex gap-1 flex-wrap">
                          {selectedPhoto.diseaseResult.affectedParts.map((part, i) => (
                            <Badge key={i} variant="outline">{part}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Traitable ? */}
                    <Alert variant={selectedPhoto.diseaseResult.isTreatable ? 'default' : 'destructive'} className={selectedPhoto.diseaseResult.isTreatable ? 'border-green-300 bg-green-50' : ''}>
                      {selectedPhoto.diseaseResult.isTreatable
                        ? <CheckCircle className="h-4 w-4 text-green-600" />
                        : <XCircle className="h-4 w-4 text-red-600" />}
                      <AlertDescription className={selectedPhoto.diseaseResult.isTreatable ? 'text-green-800' : ''}>
                        {selectedPhoto.diseaseResult.isTreatable ? '✓ Cette maladie est traitable' : '⚠️ Maladie difficile à traiter'}
                      </AlertDescription>
                    </Alert>

                    {/* Conseils de traitement */}
                    {selectedPhoto.diseaseResult.treatmentAdvice?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          💊 Conseils de traitement
                        </h4>
                        <ul className="space-y-1">
                          {selectedPhoto.diseaseResult.treatmentAdvice.map((advice, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {advice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Conseils de prévention */}
                    {selectedPhoto.diseaseResult.preventionAdvice?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          🛡️ Prévention
                        </h4>
                        <ul className="space-y-1">
                          {selectedPhoto.diseaseResult.preventionAdvice.map((advice, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {advice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ré-analyser */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        updatePhoto(selectedPhoto.id, { diseaseResult: undefined });
                        setSelectedPhoto(prev => prev ? { ...prev, diseaseResult: undefined } : prev);
                      }}
                    >
                      🔄 Ré-analyser avec un autre moteur
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <Info className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Cliquez sur "Analyser" pour détecter d'éventuelles maladies.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => analyze(selectedPhoto)}
                      disabled={!!analyzing || !selectedPhoto.dataUrl}
                    >
                      {analyzing === selectedPhoto.id ? '🔄 Analyse en cours...' : '🔍 Analyser'}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
