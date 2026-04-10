"use client";

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import {
  saveToSlot,
  loadFromSlot,
  getAllSlots,
  deleteSlot,
  renameSlot,
  exportSlotToJSON,
  importJSONToSlot,
  type SaveSlot,
} from '@/lib/save-manager';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Download,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
} from 'lucide-react';

type FeedbackMessage = {
  type: 'success' | 'error' | 'info';
  text: string;
};

export function GardenSaveManager() {
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const activeSlot = useGameStore((s) => s.activeSlot);
  const setActiveSlot = useGameStore((s) => s.setActiveSlot);
  const autoSaveEnabled = useGameStore((s) => s.autoSaveEnabled);
  const setAutoSaveEnabled = useGameStore((s) => s.setAutoSaveEnabled);
  const loadGameState = useGameStore((s) => s.loadGameState);

  const refreshSlots = async () => {
    try {
      const allSlots = await getAllSlots();
      setSlots(allSlots);
    } catch (err) {
      showFeedback('error', 'Erreur lors du chargement des slots');
    }
  };

  useEffect(() => {
    refreshSlots();
  }, []);

  const showFeedback = (type: FeedbackMessage['type'], text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (slotId: string) => {
    try {
      const store = useGameStore.getState();
      const slot = slots.find(s => s.slotId === slotId);
      const slotName = slot?.slotName || `Sauvegarde ${slotId}`;
      
      // Extraire UNIQUEMENT les données (pas les fonctions)
      const gameState = {
        gardenWidthCm: store.gardenWidthCm,
        gardenHeightCm: store.gardenHeightCm,
        gardenPlants: store.gardenPlants,
        gardenSerreZones: store.gardenSerreZones,
        gardenTrees: store.gardenTrees,
        gardenHedges: store.gardenHedges,
        gardenTanks: store.gardenTanks,
        gardenSheds: store.gardenSheds,
        selectedMiniSerreId: store.selectedMiniSerreId,
        selectedSlot: store.selectedSlot,
        hologramSettings: store.hologramSettings,
        pepiniere: store.pepiniere,
        miniSerres: store.miniSerres,
        ownedChambres: store.ownedChambres,
        activeChambreId: store.activeChambreId,
        serreTiles: store.serreTiles,
        seedCollection: store.seedCollection,
        plantuleCollection: store.plantuleCollection,
        seedVarieties: store.seedVarieties,
        day: store.day,
        season: store.season,
        weather: store.weather,
        realWeather: store.realWeather,
        gpsCoords: store.gpsCoords,
        weatherLoading: store.weatherLoading,
        weatherError: store.weatherError,
        alerts: store.alerts,
        harvested: store.harvested,
        showConsole: store.showConsole,
        coins: store.coins,
        ecoPoints: store.ecoPoints,
        ecoLevel: store.ecoLevel,
        speed: store.speed,
        isPaused: store.isPaused,
        score: store.score,
        bestScore: store.bestScore,
        adminOpen: store.adminOpen,
        adminMode: store.adminMode,
        diseasesEnabled: store.diseasesEnabled,
        showGardenSerre: store.showGardenSerre,
        showSerreView: store.showSerreView,
        activeTab: store.activeTab,
        pendingTransplant: store.pendingTransplant,
      };
      
      await saveToSlot(slotId, slotName, gameState, autoSaveEnabled);
      setActiveSlot(slotId);
      await refreshSlots();
      showFeedback('success', `✅ Sauvegarde effectuée sur ${slotId}`);
    } catch (err) {
      showFeedback('error', 'Erreur lors de la sauvegarde');
    }
  };

  const handleLoad = async (slotId: string) => {
    if (!confirm(`Charger cette sauvegarde ? L'état actuel sera remplacé.`)) return;
    try {
      const save = await loadFromSlot(slotId);
      if (!save) {
        showFeedback('error', 'Slot vide, rien à charger');
        return;
      }
      loadGameState(save.gameState);
      setActiveSlot(slotId);
      showFeedback('success', `📂 Sauvegarde chargée depuis ${slotId}`);
    } catch (err) {
      showFeedback('error', 'Erreur lors du chargement');
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm(`Supprimer définitivement cette sauvegarde ?`)) return;
    try {
      await deleteSlot(slotId);
      if (activeSlot === slotId) setActiveSlot(null);
      await refreshSlots();
      showFeedback('success', `🗑️ Sauvegarde supprimée`);
    } catch (err) {
      showFeedback('error', 'Erreur lors de la suppression');
    }
  };

  const handleConfirmRename = async (slotId: string) => {
    if (!editName.trim()) {
      showFeedback('error', 'Le nom ne peut pas être vide');
      return;
    }
    try {
      await renameSlot(slotId, editName.trim());
      await refreshSlots();
      setEditingSlot(null);
      showFeedback('success', `✏️ Slot renommé`);
    } catch (err) {
      showFeedback('error', 'Erreur lors du renommage');
    }
  };

  const handleExport = async (slotId: string) => {
    try {
      const json = await exportSlotToJSON(slotId);
      if (!json) return;
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slotId}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showFeedback('success', `📥 Sauvegarde exportée`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Erreur lors de l\'export');
    }
  };

  const handleImport = async (slotId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const result = await importJSONToSlot(text);
        if (!result.success) { showFeedback('error', result.error || "Erreur à l'import"); return; }
        await refreshSlots();
        showFeedback('success', `📤 Sauvegarde importée`);
      } catch (err: any) {
        showFeedback('error', err.message || 'Erreur lors de l\'import');
      }
    };
    input.click();
  };

  const createJardinReel = async () => {
    try {
      const store = useGameStore.getState();
      
      const jardinReelState = {
        gardenWidthCm: 1400,
        gardenHeightCm: 3900,
        gardenHedges: [
          { id: 'haie-nord', x: 0, y: 0, width: 1400, height: 80, type: 'hedge' },
          { id: 'haie-sud', x: 0, y: 3820, width: 1400, height: 80, type: 'hedge' }
        ],
        gardenTanks: [
          { id: 'cuve-1', x: 200, y: 150, width: 120, height: 100, capacity: 1000, label: 'Cuve 1' },
          { id: 'cuve-2', x: 640, y: 150, width: 120, height: 100, capacity: 1000, label: 'Cuve 2' },
          { id: 'cuve-3', x: 1080, y: 150, width: 120, height: 100, capacity: 1000, label: 'Cuve 3' }
        ],
        gardenPlants: [],
        gardenSerreZones: [
          { 
            id: 'serre-test', 
            x: 400, 
            y: 1000, 
            width: 600, 
            height: 400, 
            type: 'greenhouse',
            label: 'Serre de test'
          }
        ],
        gardenTrees: [],
        gardenSheds: [],
        pepiniere: [],
        miniSerres: [],
        seedCollection: {},
        plantuleCollection: {},
        seedVarieties: {},
        day: 1,
        season: 'spring',
        coins: 500,
        ecoPoints: 0,
        ecoLevel: 0,
        score: 0,
        bestScore: 0,
        harvested: 0,
        speed: 0,
        isPaused: false,
        showConsole: true,
        adminOpen: false,
        adminMode: false,
        diseasesEnabled: true,
        showGardenSerre: false,
        showSerreView: false,
        activeTab: 'jardin',
        weather: store.weather,
        realWeather: store.realWeather,
        gpsCoords: store.gpsCoords,
        weatherLoading: false,
        weatherError: null,
        alerts: [],
        selectedMiniSerreId: null,
        selectedSlot: null,
        hologramSettings: store.hologramSettings,
        ownedChambres: {},
        activeChambreId: null,
        serreTiles: 0,
        pendingTransplant: null
      };
      
      await saveToSlot('slot-1', 'Mon jardin réel', jardinReelState, true);
      await refreshSlots();
      showFeedback('success', '✅ Jardin réel créé dans Slot 1 ! Clique "Charger" pour activer.');
    } catch (err: any) {
      showFeedback('error', err.message || 'Erreur création jardin');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] p-6">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Save className="w-6 h-6" />
          💾 Gestion des Sauvegardes
        </h2>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-3 rounded-lg border-2 ${
                feedback.type === 'success' ? 'bg-green-50 border-green-300' :
                feedback.type === 'error' ? 'bg-red-50 border-red-300' :
                'bg-blue-50 border-blue-300'
              }`}
            >
              <p className="text-sm font-bold">{feedback.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 p-4 bg-stone-50 border-2 border-stone-200 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <p className="font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Auto-Save (toutes les 24h)
              </p>
              <p className="text-xs text-stone-500">
                Sauvegarde automatique sur le slot actif
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={createJardinReel}
          className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-black text-base rounded-xl hover:from-green-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-green-800"
        >
          🌱 CRÉER "MON JARDIN RÉEL" (14m × 39m + haies + cuves)
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {slots.map((slot) => {
            const isActive = activeSlot === slot.slotId;
            const isEditing = editingSlot === slot.slotId;

            return (
              <div
                key={slot.slotId}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-[3px_3px_0_0_rgba(59,130,246,0.5)]'
                    : 'border-stone-300 bg-white hover:border-stone-400'
                }`}
              >
                <div className="mb-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 border-2 border-black rounded text-sm font-bold"
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmRename(slot.slotId)}
                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSlot(null)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-lg">{slot.slotName}</h3>
                      <button
                        onClick={() => {
                          setEditingSlot(slot.slotId);
                          setEditName(slot.slotName);
                        }}
                        className="p-1 hover:bg-stone-200 rounded"
                        title="Renommer"
                      >
                        <Edit2 className="w-4 h-4 text-stone-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-4 text-xs text-stone-600">
                  {!slot.gameState ? (
                    <p className="italic">Slot vide</p>
                  ) : (
                    <>
                      <p>📅 {new Date(slot.savedAt).toLocaleString('fr-FR')}</p>
                      <p className="text-[10px] text-stone-400">v{slot.version}</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSave(slot.slotId)}
                    className="px-3 py-2 bg-green-500 text-white font-bold text-xs rounded-lg hover:bg-green-600 flex items-center justify-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => handleLoad(slot.slotId)}
                    disabled={!slot.gameState}
                    className="px-3 py-2 bg-blue-500 text-white font-bold text-xs rounded-lg hover:bg-blue-600 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Charger
                  </button>
                  <button
                    onClick={() => handleExport(slot.slotId)}
                    disabled={!slot.gameState}
                    className="px-3 py-2 bg-amber-500 text-white font-bold text-xs rounded-lg hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Exporter
                  </button>
                  <button
                    onClick={() => handleImport(slot.slotId)}
                    className="px-3 py-2 bg-purple-500 text-white font-bold text-xs rounded-lg hover:bg-purple-600 flex items-center justify-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Importer
                  </button>
                </div>

                {slot.gameState && (
                  <button
                    onClick={() => handleDelete(slot.slotId)}
                    className="w-full mt-2 px-3 py-1.5 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-stone-100 border-2 border-stone-300 rounded-lg text-xs">
          <p className="font-bold mb-2">ℹ️ Informations</p>
          <ul className="space-y-1 text-stone-600">
            <li>• <strong>Sauvegarder</strong> : Enregistre l'état actuel du jeu</li>
            <li>• <strong>Charger</strong> : Restaure une sauvegarde</li>
            <li>• <strong>Exporter</strong> : Télécharge un fichier JSON</li>
            <li>• <strong>Importer</strong> : Charge un fichier JSON</li>
            <li>• <strong>Auto-Save</strong> : Sauvegarde automatique toutes les 24h sur le slot actif</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
