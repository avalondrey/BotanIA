"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/store/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { captureElementAsDataUrl } from "@/lib/photo-mode";
import {
  Moon, Volume2, VolumeX, Camera, Sun, Calendar,
  AlertTriangle, Droplets, Thermometer, Wind,
  ChevronDown, ChevronUp, Info, Lightbulb,
  Share2, Download, Trash2, X,
} from "lucide-react";
import {
  getLunarPhase,
  formatLunarDate,
  isLunarNodeDay,
  getPlantingRecommendation,
} from "@/lib/lunar-calendar";
import {
  loadSoundConfig,
  saveSoundConfig,
  playSound,
  type SoundConfig,
} from "@/lib/sound-system";
import {
  loadNotificationConfig,
  saveNotificationConfig,
  requestNotificationPermission,
  supportsNotifications,
  getNotificationPermission,
  type NotificationConfig,
} from "@/lib/notification-system";
import {
  fetchWeatherForecast,
  generateWeatherAlerts,
  type WeatherForecast,
} from "@/lib/advanced-weather";
import {
  loadPhotos,
  deletePhoto,
  clearAllPhotos,
  formatPhotoDate,
  addPhoto,
  downloadPhoto,
  sharePhoto,
  type PhotoMetadata,
} from "@/lib/photo-mode";
import { getAdvisorSuggestions, type AdvisorSuggestion } from "@/lib/ai-advisor";
import { EcoGestureWidget } from "./EcoGestureWidget";

// ═══ Sound Toggle ═══
function SoundToggle() {
  const [config, setConfig] = useState<SoundConfig>({ enabled: true, volume: 0.5 });

  useEffect(() => {
    setConfig(loadSoundConfig());
  }, []);

  const toggle = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    saveSoundConfig(newConfig);
    if (newConfig.enabled) playSound("click");
  };

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-lg border transition-colors ${
        config.enabled
          ? "bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100"
          : "bg-stone-100 border-stone-300 text-stone-400 hover:bg-stone-200"
      }`}
      title={config.enabled ? "Son activé" : "Son désactivé"}
    >
      {config.enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
    </button>
  );
}

// ═══ Notification Toggle ═══
function NotificationToggle() {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setConfig(loadNotificationConfig());
    setPermission(getNotificationPermission());
  }, []);

  const toggle = async () => {
    if (!config) return;

    if (!config.enabled && permission !== "granted") {
      const granted = await requestNotificationPermission();
      setPermission(granted ? "granted" : "denied");
      if (!granted) return;
    }

    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    saveNotificationConfig(newConfig);
  };

  if (!config) return null;

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-lg border transition-colors ${
        config.enabled
          ? "bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100"
          : "bg-stone-100 border-stone-300 text-stone-400 hover:bg-stone-200"
      }`}
      title={config.enabled ? "Notifications activées" : "Notifications désactivées"}
    >
      {config.enabled ? "🔔" : "🔕"}
    </button>
  );
}

// ═══ Lunar Calendar Widget ═══
function LunarWidget() {
  const [phase, setPhase] = useState(getLunarPhase());
  const [expanded, setExpanded] = useState(false);
  const day = useGameStore((s) => s.day);

  useEffect(() => {
    setPhase(getLunarPhase());
  }, [day]);

  const isNodeDay = isLunarNodeDay();

  return (
    <div className={`px-2 py-1 rounded-lg border flex-shrink-0 ${
      isNodeDay ? "bg-purple-100 border-purple-400" : "bg-indigo-50 border-indigo-200"
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5"
      >
        <span className="text-base">{phase.emoji}</span>
        <div className="text-left">
          <p className={`text-[8px] font-bold ${isNodeDay ? "text-purple-600" : "text-indigo-400"}`}>
            {isNodeDay ? "NŒUD LUNAIRE" : "LUNE"}
          </p>
          <p className="text-[9px] font-black">{phase.name}</p>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3 text-stone-400" /> : <ChevronDown className="w-3 h-3 text-stone-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1 text-[9px]">
              <p className="text-indigo-700">🌱 {phase.gardeningAdvice}</p>
              {phase.isGoodForPlanting && <p className="text-green-600">✅ Semis favorable</p>}
              {phase.isGoodForRootHarvest && <p className="text-orange-600">🥕 Récolte racines</p>}
              <p className="text-stone-500">{phase.illumination}% illuminée</p>
              <p className="text-stone-500">{phase.zodiacSign} {phase.zodiacElement}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ Weather Forecast Widget ═══
function ForecastWidget() {
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [expanded, setExpanded] = useState(false);
  const realWeather = useGameStore((s) => s.realWeather);
  const gpsCoords = useGameStore((s) => s.gpsCoords);

  useEffect(() => {
    const load = async () => {
      const lat = gpsCoords?.lat ?? 48.8566;
      const lon = gpsCoords?.lon ?? 2.3522;
      const data = await fetchWeatherForecast(lat, lon);
      setForecast(data);
    };
    load();
    const interval = setInterval(load, 30 * 60 * 1000); // Refresh every 30 min
    return () => clearInterval(interval);
  }, [gpsCoords]);

  if (forecast.length === 0) return null;

  const alerts = generateWeatherAlerts(forecast.slice(0, 3), realWeather);

  return (
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{forecast[0]?.emoji || "🌤️"}</span>
          <div className="text-left">
            <p className="text-[8px] text-sky-400 font-bold">PRÉVISION</p>
            <p className="text-[10px] font-black">
              {forecast[0]?.tempMin?.toFixed(0)}° / {forecast[0]?.tempMax?.toFixed(0)}°
            </p>
          </div>
          {alerts.length > 0 && (
            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">
              {alerts.length} alerte(s)
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-sky-200"
          >
            {/* 7-day forecast */}
            <div className="flex overflow-x-auto p-2 gap-2">
              {forecast.slice(0, 7).map((day, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 text-center p-1.5 rounded-lg ${
                    i === 0 ? "bg-sky-100 border border-sky-300" : "bg-white border border-stone-200"
                  }`}
                >
                  <p className="text-[8px] font-bold text-stone-500">
                    {i === 0 ? "Aujourd'hui" : new Date(day.date).toLocaleDateString("fr-FR", { weekday: "short" })}
                  </p>
                  <p className="text-lg">{day.emoji}</p>
                  <p className="text-[9px] font-black">
                    {day.tempMin?.toFixed(0)}° / {day.tempMax?.toFixed(0)}°
                  </p>
                  {day.precipitation > 0 && (
                    <p className="text-[7px] text-blue-500">💧 {day.precipitation.toFixed(1)}mm</p>
                  )}
                </div>
              ))}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="p-2 border-t border-sky-200 space-y-1">
                <p className="text-[9px] font-bold text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Alertes Météo
                </p>
                {alerts.slice(0, 3).map((alert, i) => (
                  <div key={i} className="text-[9px] bg-orange-50 border border-orange-200 rounded p-1">
                    <p className="font-bold">{alert.title}</p>
                    <p className="text-orange-700">{alert.description}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ AI Advisor Widget ═══
function AdvisorWidget() {
  const [suggestions, setSuggestions] = useState<AdvisorSuggestion[]>([]);
  const [expanded, setExpanded] = useState(false);

  const day = useGameStore((s) => s.day);
  const season = useGameStore((s) => s.season);
  const realWeather = useGameStore((s) => s.realWeather);
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const pepiniere = useGameStore((s) => s.pepiniere);

  useEffect(() => {
    const context = {
      day,
      season,
      realWeather,
      gardenPlants: gardenPlants.map(p => ({
        plantDefId: p.plantDefId,
        plant: p.plant,
        daysSincePlanting: p.plant.daysSincePlanting,
      })),
      pepinierePlants: pepiniere.map(p => ({
        plantDefId: p.plantDefId,
        plant: p,
      })),
      recentAlerts: [],
      coins: 0,
    };
    const advice = getAdvisorSuggestions(context);
    setSuggestions(advice.slice(0, 5));
  }, [day, season, realWeather, gardenPlants, pepiniere]);

  const criticalCount = suggestions.filter(s => s.priority === "critical" || s.priority === "high").length;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <div className="text-left">
            <p className="text-[8px] text-emerald-400 font-bold">CONSEIL IA</p>
            <p className="text-[10px] font-black">
              {suggestions.length > 0 ? suggestions[0].title : "Aucun conseil"}
            </p>
          </div>
          {criticalCount > 0 && (
            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {criticalCount} urgent(s)
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-emerald-200 p-2 space-y-1"
          >
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className={`text-[9px] p-1.5 rounded-lg border ${
                  suggestion.priority === "critical" ? "bg-red-50 border-red-300" :
                  suggestion.priority === "high" ? "bg-orange-50 border-orange-300" :
                  suggestion.priority === "medium" ? "bg-yellow-50 border-yellow-300" :
                  "bg-white border-stone-200"
                }`}
              >
                <p className="font-bold flex items-center gap-1">
                  <span>{suggestion.emoji}</span>
                  <span className={
                    suggestion.priority === "critical" ? "text-red-700" :
                    suggestion.priority === "high" ? "text-orange-700" :
                    suggestion.priority === "medium" ? "text-yellow-700" :
                    "text-stone-700"
                  }>
                    {suggestion.title}
                  </span>
                </p>
                <p className="text-stone-600 mt-0.5">{suggestion.description}</p>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className="text-[9px] text-stone-500 text-center py-2">Tout va bien ! Votre jardin est en bonne santé.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ Photo Mode Widget ═══
function PhotoModeWidget() {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isMangaMode, setIsMangaMode] = useState(false);
  const day = useGameStore((s) => s.day);
  const season = useGameStore((s) => s.season);
  const score = useGameStore((s) => s.score);
  const harvested = useGameStore((s) => s.harvested);
  const gardenPlants = useGameStore((s) => s.gardenPlants);

  const loadPhotos_ = useCallback(() => {
    setPhotos(loadPhotos());
  }, []);

  useEffect(() => {
    loadPhotos_();
  }, [loadPhotos_]);

  const takePhoto = async () => {
    const gardenElement = document.querySelector('.garden-grid') as HTMLElement | null;
    if (!gardenElement) return;

    if (isMangaMode) {
      gardenElement.classList.add('photo-mode-manga-filter');
    }

    const dataUrl = await captureElementAsDataUrl(gardenElement);

    if (isMangaMode) {
      gardenElement.classList.remove('photo-mode-manga-filter');
    }

    if (dataUrl) {
      const metadata = addPhoto({
        day,
        season,
        plantCount: gardenPlants.length,
        harvested,
        score,
        dataUrl,
      });
      loadPhotos_();
      playSound("click");
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <div className="text-left">
              <p className="text-[8px] text-pink-400 font-bold">PHOTO MODE</p>
              <p className="text-[10px] font-black">{photos.length} photo(s)</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-pink-200 p-2 space-y-2"
            >
              <button
                onClick={takePhoto}
                className="w-full py-2 px-3 bg-pink-500 text-white rounded-lg font-bold text-xs hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" /> Prendre une photo
              </button>

              <button
                onClick={() => setIsMangaMode(!isMangaMode)}
                className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                  isMangaMode
                    ? "bg-amber-500 text-white"
                    : "bg-white border border-amber-300 text-amber-600 hover:bg-amber-50"
                }`}
              >
                <span className="text-sm">🎨</span> Filtre Manga {isMangaMode ? "Activé" : "Désactivé"}
              </button>

              <button
                onClick={() => { setShowGallery(true); loadPhotos_(); }}
                className="w-full py-1.5 px-3 bg-white border border-pink-300 text-pink-600 rounded-lg font-bold text-xs hover:bg-pink-50 transition-colors"
              >
                📷 Voir la galerie ({photos.length})
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-lg">📷 Galerie Photos</h2>
                <div className="flex gap-2">
                  {photos.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("Supprimer toutes les photos ?")) {
                          clearAllPhotos();
                          loadPhotos_();
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Tout supprimer
                    </button>
                  )}
                  <button
                    onClick={() => setShowGallery(false)}
                    className="text-stone-500 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {photos.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">Aucune photo. Utilisez le bouton ci-dessus pour capturer votre jardin !</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.slice().reverse().map((photo) => (
                      <div key={photo.id} className="border rounded-lg overflow-hidden bg-stone-50">
                        <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
                          {photo.dataUrl ? (
                            <img src={photo.dataUrl} alt="Garden snapshot" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-4xl">🏡</span>
                          )}
                        </div>
                        <div className="p-2 text-[10px]">
                          <p className="font-bold">{formatPhotoDate(photo.timestamp)}</p>
                          <p className="text-stone-500">Jour {photo.day} • {photo.plantCount} plantes</p>
                          <p className="text-stone-500">Score: {photo.score}</p>
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => {
                                // For now, just show a message - real implementation would need actual image data
                                alert("Téléchargement... (fonctionnalité complète bientôt)");
                              }}
                              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                deletePhoto(photo.id);
                                loadPhotos_();
                              }}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══ Main Enhanced HUD Component ═══
export function EnhancedHUD() {
  const [mounted, setMounted] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-2">
      {/* Widgets Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowWidgets(!showWidgets)}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
            showWidgets
              ? "bg-indigo-500 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          {showWidgets ? "Masquer outils" : "🛠️ Outils"}
        </button>

        <div className="flex gap-1">
          <SoundToggle />
          <NotificationToggle />
        </div>
      </div>

      {/* Expanded Widgets */}
      <AnimatePresence>
        {showWidgets && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <LunarWidget />
              <PhotoModeWidget />
              <EcoGestureWidget />
            </div>
            <ForecastWidget />
            <AdvisorWidget />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
