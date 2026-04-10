"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { Camera, Leaf, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, Loader2, Globe, Trophy } from "lucide-react";

interface GestureResult {
  verified: boolean;
  type: "mulch" | "compost" | "rainwater" | "none";
  confidence: number;
  description: string;
  ecoPoints: number;
  message: string;
}

const GESTURE_LABELS: Record<string, string> = {
  mulch: "Paillage",
  compost: "Compost",
  rainwater: "Récupération d'eau",
  none: "Non détecté",
};

const GESTURE_EMOJIS: Record<string, string> = {
  mulch: "🌾",
  compost: "♻️",
  rainwater: "💧",
  none: "❓",
};

const LEVEL_THRESHOLDS = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

function getLevelProgress(ecoPoints: number): { level: number; progress: number; nextLevelPoints: number; currentLevelPoints: number } {
  const level = Math.min(10, Math.floor(ecoPoints / 50));
  const currentLevelPoints = LEVEL_THRESHOLDS[level] ?? 0;
  const nextLevelPoints = LEVEL_THRESHOLDS[level + 1] ?? 500;
  const progress = ((ecoPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  return { level, progress, nextLevelPoints, currentLevelPoints };
}

export function EcoGestureWidget() {
  const [expanded, setExpanded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<GestureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ecoPoints = useGameStore((s) => s.ecoPoints);
  const ecoLevel = useGameStore((s) => s.ecoLevel);
  const addEcoPoints = useGameStore((s) => s.addEcoPoints);

  const { level, progress, nextLevelPoints, currentLevelPoints } = getLevelProgress(ecoPoints);

  const scanImage = useCallback(async (imageBase64: string, mediaType: string) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/scan-gesture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.hint || `Erreur ${response.status}`);
      }

      const data: GestureResult = await response.json();
      setResult(data);

      if (data.verified) {
        addEcoPoints(data.ecoPoints);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du scan");
    } finally {
      setIsScanning(false);
    }
  }, [addEcoPoints]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type || "image/jpeg";
      setPreviewUrl(dataUrl);
      await scanImage(base64, mediaType);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [scanImage]);

  const handleDemoScan = useCallback(async () => {
    // Demo: use a placeholder that Ollama will evaluate
    // In real usage, user provides an actual image
    setError("📸 Prends une vraie photo de ton jardin pour valider un geste écologique !");
    setResult(null);
  }, []);

  const resetState = () => {
    setResult(null);
    setError(null);
    setPreviewUrl(null);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl overflow-hidden">
      {/* Header button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <div className="text-left">
            <p className="text-[8px] text-emerald-400 font-bold">GESTE ÉCOLOGIQUE</p>
            <p className="text-[10px] font-black">
              {ecoPoints > 0 ? `+${ecoPoints} pts • Niveau ${ecoLevel}` : "Valide tes actions réelles"}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-emerald-200 p-3 space-y-3"
          >
            {/* Level progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  Niveau {level}/10
                </span>
                <span className="text-emerald-600">
                  {ecoPoints} / {nextLevelPoints} pts
                </span>
              </div>
              <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                />
              </div>
              <p className="text-[8px] text-stone-500 text-right">
                {nextLevelPoints - ecoPoints} pts jusqu&apos;au niveau {level + 1}
              </p>
            </div>

            {/* Gesture type legend */}
            <div className="grid grid-cols-3 gap-1 text-center">
              {[
                { type: "mulch", label: "Paillage", emoji: "🌾", pts: 15 },
                { type: "compost", label: "Compost", emoji: "♻️", pts: 20 },
                { type: "rainwater", label: "Eau", emoji: "💧", pts: 10 },
              ].map(({ type, label, emoji, pts }) => (
                <div key={type} className="bg-white rounded-lg border border-emerald-200 p-1.5">
                  <p className="text-base">{emoji}</p>
                  <p className="text-[8px] font-bold text-emerald-700">{label}</p>
                  <p className="text-[7px] text-emerald-500">+{pts} pts</p>
                </div>
              ))}
            </div>

            {/* Photo capture */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="w-full py-2.5 px-3 bg-emerald-500 text-white rounded-lg font-bold text-xs hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    📸 Prendre une photo
                  </>
                )}
              </button>

              <p className="text-[9px] text-stone-500 text-center">
                Photo de paillage, compost ou récupérateur d&apos;eau de pluie
              </p>
            </div>

            {/* Image preview */}
            {previewUrl && (
              <div className="relative rounded-lg overflow-hidden border border-emerald-300">
                <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover" />
                {!isScanning && !result && !error && (
                  <button
                    onClick={resetState}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Loading state */}
            {isScanning && (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-600">
                  Analyse de l&apos;image par IA...
                </p>
                <p className="text-[9px] text-stone-500">
                  Vérification : paillage, compost ou récupération d&apos;eau
                </p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-red-700">Scan échoué</p>
                  <p className="text-[9px] text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Result success */}
            {result?.verified && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-green-50 border-2 border-green-400 rounded-lg space-y-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-[10px] font-black text-green-800 uppercase">
                      {GESTURE_EMOJIS[result.type]} {GESTURE_LABELS[result.type]} détecté !
                    </p>
                    <p className="text-[9px] text-green-600">
                      Confiance: {(result.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                {result.description && (
                  <p className="text-[9px] text-green-700 italic">"{result.description}"</p>
                )}
                <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-[10px] font-black text-green-800">+{result.ecoPoints} EcoPoints</p>
                    <p className="text-[8px] text-green-600">Niveau {ecoLevel} atteint !</p>
                  </div>
                </div>
                <p className="text-[10px] text-green-700 font-medium">{result.message}</p>
              </motion.div>
            )}

            {/* Result not verified */}
            {result && !result.verified && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg space-y-2"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase">
                      Aucun geste détecté
                    </p>
                    <p className="text-[9px] text-amber-600">
                      Confiance: {(result.confidence * 100).toFixed(0)}% (seuil: 60%)
                    </p>
                  </div>
                </div>
                {result.description && (
                  <p className="text-[9px] text-amber-700 italic">"{result.description}"</p>
                )}
                <p className="text-[10px] text-amber-700 font-medium">{result.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={resetState}
                    className="flex-1 py-1.5 px-2 bg-amber-100 border border-amber-300 rounded-lg text-[9px] font-bold text-amber-700 hover:bg-amber-200 transition-colors"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={() => setExpanded(false)}
                    className="flex-1 py-1.5 px-2 bg-white border border-stone-300 rounded-lg text-[9px] font-bold text-stone-500 hover:bg-stone-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            )}

            {/* Ollama hint */}
            <div className="text-[8px] text-stone-400 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Scan via Ollama Vision (local, 100% privé)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
