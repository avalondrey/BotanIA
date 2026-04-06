// ─── Photo Store partagé entre Jardin et Identificateur ─────────────────────
// Ce store gère toutes les photos prises dans l'app :
//   - Depuis le Jardin (rangs de semences, GPS photo EXIF ou live)
//   - Vers l'Identificateur (envoi automatique pour analyse IA)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PhotoGPS {
  lat: number;
  lon: number;
  source: 'exif' | 'device' | 'manual';
  accuracy?: number;
}

export interface GardenPhoto {
  id: string;
  dataUrl: string;             // base64 JPEG
  takenAt: number;             // timestamp
  gps?: PhotoGPS;
  seedRows?: {                 // rangs dessinés sur cette photo
    id: string;
    color: string;
    label?: string;
    points: { x: number; y: number }[];
  }[];
  identificationResult?: {     // résultat IA identificateur
    plantName: string;
    confidence: number;
    description: string;
    careAdvice: string[];
    analyzedAt: number;
  };
  diseaseResult?: {            // résultat IA détection maladies
    diseaseName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    affectedParts: string[];
    treatmentAdvice: string[];
    preventionAdvice: string[];
    isTreatable: boolean;
    analyzedAt: number;
    engine: string;
  };
  source: 'jardin' | 'identificateur';
  note?: string;
  journalEntryId?: string;   // lien vers entrée journal
}

interface PhotoStore {
  photos: GardenPhoto[];
  addPhoto: (photo: Omit<GardenPhoto, 'id' | 'takenAt'>) => string;
  updatePhoto: (id: string, update: Partial<GardenPhoto>) => void;
  deletePhoto: (id: string) => void;
  getPhotosForIdentification: () => GardenPhoto[];
}

export const usePhotoStore = create<PhotoStore>()(
  persist(
    (set, get) => ({
      photos: [],

      addPhoto: (photo) => {
        const id = Math.random().toString(36).slice(2, 9);
        const newPhoto: GardenPhoto = { ...photo, id, takenAt: Date.now() };
        set(s => ({ photos: [newPhoto, ...s.photos].slice(0, 50) })); // max 50 photos
        return id;
      },

      updatePhoto: (id, update) => {
        set(s => ({
          photos: s.photos.map(p => p.id === id ? { ...p, ...update } : p)
        }));
      },

      deletePhoto: (id) => {
        set(s => ({ photos: s.photos.filter(p => p.id !== id) }));
      },

      getPhotosForIdentification: () => {
        return get().photos.filter(p => !p.identificationResult);
      },
    }),
    {
      name: 'botania-photos',
      // Ne pas persister les dataUrl trop lourdes en localStorage → on garde juste les métadonnées
      partialize: (state) => ({
        photos: state.photos.map(p => ({
          ...p,
          dataUrl: p.dataUrl.length > 500000 ? '' : p.dataUrl // strip si > 500ko
        }))
      }),
    }
  )
);
