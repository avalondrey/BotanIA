'use client';

import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { regionFromPostcode } from '@/lib/collective-data';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [postcode, setPostcode] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('botania-postcode');
    if (saved) {
      setPostcode(saved);
      setRegion(regionFromPostcode(saved));
    }
  }, []);

  const handleSave = () => {
    if (!postcode.trim()) return;
    localStorage.setItem('botania-postcode', postcode.trim());
    setRegion(regionFromPostcode(postcode.trim()));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold text-lg">Paramètres</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              📍 Ma région (code postal)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Utilisé pour la comparaison anonyme avec d&apos;autres jardiniers de ta région.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
                placeholder="Ex: 44000, 75001"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                maxLength={10}
              />
              <Button onClick={handleSave} size="sm">Sauvegarder</Button>
            </div>
            {region && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">
                ✓ Région détectée : <strong>{region}</strong>
              </p>
            )}
          </div>

          <div className="pt-2 border-t">
            <h3 className="text-sm font-medium mb-2 text-gray-700">🌱 À propos</h3>
            <p className="text-xs text-gray-500">
              BotanIA stocke toutes tes données en local sur cet appareil. Aucune information
              personnelle n&apos;est envoyée vers un serveur externe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function getUserRegion(): string {
  if (typeof window === 'undefined') return 'unknown';
  return regionFromPostcode(localStorage.getItem('botania-postcode') || '');
}
