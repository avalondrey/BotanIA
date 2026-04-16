"use client";

/**
 * PhotoTimeline — Journal photo horodaté
 *
 * Visualisation chronologique des photos de jardin avec
 * métadonnées EXIF (date, GPS), identification IA, notes.
 * Intègre les EventBus pour les événements de photos.
 */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotoStore, type GardenPhoto } from "@/store/photo-store";
import { useJournalStore } from "@/store/journal-store";
import { Camera, MapPin, Clock, Leaf, Bug, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";

const MOOD_ICONS: Record<string, string> = {
  great: "😊",
  good: "🙂",
  neutral: "😐",
  bad: "😟",
};

const STAGE_NAMES = ["Graine", "Levée", "Plantule", "Croissance", "Floraison", "Récolte"];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupPhotosByDay(photos: GardenPhoto[]): Map<string, GardenPhoto[]> {
  const groups = new Map<string, GardenPhoto[]>();
  for (const photo of photos) {
    const day = new Date(photo.takenAt).toISOString().slice(0, 10);
    const existing = groups.get(day) ?? [];
    existing.push(photo);
    groups.set(day, existing);
  }
  return groups;
}

export function PhotoTimeline() {
  const photos = usePhotoStore((s) => s.photos);
  const deletePhoto = usePhotoStore((s) => s.deletePhoto);
  const journalEntries = useJournalStore((s) => s.entries);
  const [selectedPhoto, setSelectedPhoto] = useState<GardenPhoto | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const groupedPhotos = useMemo(() => groupPhotosByDay(photos), [photos]);
  const sortedDays = useMemo(
    () => [...groupedPhotos.entries()].sort((a, b) => b[0].localeCompare(a[0])),
    [groupedPhotos]
  );

  // Auto-expand the most recent day when photos load
  useEffect(() => {
    if (sortedDays.length > 0) {
      setExpandedDays(new Set([sortedDays[0][0]]));
    }
  }, [sortedDays.length]);

  const toggleDay = (day: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  if (photos.length === 0) {
    return (
      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-[3px] border-purple-300 rounded-2xl shadow-[4px_4px_0_0_#000] text-center">
        <Camera className="w-10 h-10 text-purple-300 mx-auto mb-2" />
        <h3 className="text-sm font-black uppercase text-purple-700 mb-1">Journal photo</h3>
        <p className="text-xs text-stone-400">
          Prenez des photos de vos plantes pour documenter leur croissance.
        </p>
        <p className="text-[10px] text-stone-400 mt-1">
          Utilisez l'identificateur IA ou le mode photo du jardin.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-[3px] border-purple-300 rounded-2xl shadow-[4px_4px_0_0_#000]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-black uppercase text-purple-700">
            Journal photo
          </h3>
          <span className="text-[10px] font-bold text-purple-400 bg-purple-100 px-1.5 py-0.5 rounded-full">
            {photos.length}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {sortedDays.map(([day, dayPhotos]) => {
          const isExpanded = expandedDays.has(day);
          const dayDate = new Date(day + "T12:00:00");
          const dayLabel = dayDate.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

          // Check for journal entries this day
          const dayJournal = journalEntries.filter((e) => e.date === day);

          return (
            <div key={day} className="border-2 border-purple-200 rounded-xl overflow-hidden">
              {/* Day header */}
              <button
                className="w-full flex items-center justify-between p-2.5 bg-white/50 hover:bg-white/80 transition-colors"
                onClick={() => toggleDay(day)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-black text-purple-700">{dayLabel}</span>
                  <span className="text-[10px] text-purple-400">{dayPhotos.length} photo{dayPhotos.length > 1 ? "s" : ""}</span>
                  {dayJournal.length > 0 && (
                    <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">
                      📝 {dayJournal.length} note{dayJournal.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                )}
              </button>

              {/* Photos for this day */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-2 p-2">
                      {dayPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-colors group"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          {photo.dataUrl ? (
                            <img
                              src={photo.dataUrl}
                              alt="Photo jardin"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                              <Leaf className="w-6 h-6 text-stone-300" />
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-1 right-1 flex gap-0.5">
                            {photo.identificationResult && (
                              <span className="text-[8px] bg-green-500 text-white px-1 py-0.5 rounded font-bold">
                                IA
                              </span>
                            )}
                            {photo.diseaseResult && (
                              <span className="text-[8px] bg-red-500 text-white px-1 py-0.5 rounded font-bold">
                                <Bug className="w-2 h-2 inline" />
                              </span>
                            )}
                            {photo.gps && (
                              <span className="text-[8px] bg-blue-500 text-white px-1 py-0.5 rounded font-bold">
                                GPS
                              </span>
                            )}
                          </div>

                          {/* Time */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                            <span className="text-[8px] text-white font-bold">
                              {new Date(photo.takenAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Journal notes for this day */}
                    {dayJournal.length > 0 && (
                      <div className="px-2 pb-2 space-y-1">
                        {dayJournal.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-2 bg-white/70 rounded-lg border border-purple-100"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{MOOD_ICONS[entry.mood ?? "neutral"] ?? "📝"}</span>
                              <span className="text-[10px] font-bold text-stone-700">
                                {entry.title}
                              </span>
                            </div>
                            {entry.content && (
                              <p className="text-[9px] text-stone-500 mt-0.5 line-clamp-2">
                                {entry.content}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Photo detail modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo */}
              {selectedPhoto.dataUrl ? (
                <img
                  src={selectedPhoto.dataUrl}
                  alt="Photo jardin"
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video bg-stone-100 flex items-center justify-center">
                  <Leaf className="w-12 h-12 text-stone-300" />
                </div>
              )}

              {/* Details */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">
                    {formatDate(selectedPhoto.takenAt)}
                  </span>
                  <button
                    className="text-stone-400 hover:text-red-500"
                    onClick={() => {
                      deletePhoto(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {selectedPhoto.gps && (
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-600">
                    <MapPin className="w-3 h-3" />
                    {selectedPhoto.gps.lat.toFixed(4)}, {selectedPhoto.gps.lon.toFixed(4)}
                    <span className="text-blue-400">
                      ({selectedPhoto.gps.source})
                    </span>
                  </div>
                )}

                {selectedPhoto.identificationResult && (
                  <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-[10px] font-black text-green-700 mb-0.5">
                      Identification IA
                    </div>
                    <div className="text-xs font-bold text-stone-700">
                      {selectedPhoto.identificationResult.plantName}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Confiance : {(selectedPhoto.identificationResult.confidence * 100).toFixed(0)}%
                    </div>
                    {selectedPhoto.identificationResult.growthStage && (
                      <div className="text-[10px] text-green-600">
                        Stade : {STAGE_NAMES[selectedPhoto.identificationResult.growthStage.stage] ?? `Stade ${selectedPhoto.identificationResult.growthStage.stage}`}
                      </div>
                    )}
                  </div>
                )}

                {selectedPhoto.diseaseResult && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-[10px] font-black text-red-700 mb-0.5">
                      Maladie détectée
                    </div>
                    <div className="text-xs font-bold text-stone-700">
                      {selectedPhoto.diseaseResult.diseaseName}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Sévérité : {selectedPhoto.diseaseResult.severity} — Confiance : {(selectedPhoto.diseaseResult.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                )}

                {selectedPhoto.note && (
                  <p className="text-[10px] text-stone-500 italic">
                    {selectedPhoto.note}
                  </p>
                )}
              </div>

              <button
                className="absolute top-2 right-2 p-1 bg-white/80 rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}