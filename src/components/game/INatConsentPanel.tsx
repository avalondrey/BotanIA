'use client';

import { useState } from 'react';
import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface INatConsentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConsented: (apiKey: string) => void;
}

export default function INatConsentPanel({ isOpen, onClose, onConsented }: INatConsentPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(
    localStorage.getItem('botania-inat-enabled') === 'true'
  );
  const [savedKey] = useState(localStorage.getItem('botania-inat-apikey') || '');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim() && !savedKey) return;
    const key = apiKey.trim() || savedKey;
    localStorage.setItem('botania-inat-apikey', key);
    localStorage.setItem('botania-inat-enabled', 'true');
    onConsented(key);
    onClose();
  };

  const handleDisable = () => {
    localStorage.setItem('botania-inat-enabled', 'false');
    setEnabled(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦉</span>
            <h2 className="text-white font-bold text-lg">iNaturalist</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-700">
            Partage tes observations phénologiques avec <strong>iNaturalist</strong>, la plus grande base de données
            naturaliste au monde. Contribue à la science citoyenne !
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Ce qui est partagé :</strong>
            <ul className="mt-1 space-y-0.5">
              <li>• Date de l&apos;événement (semis, récolte...)</li>
              <li>• Coordonnées GPS de ton jardin</li>
              <li>• Nom de l&apos;espèce cultivée</li>
            </ul>
            <p className="mt-2 font-medium">Ce qui n&apos;est JAMAIS partagé : photos, notes personnelles, données financières.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Clé API iNaturalist
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Récupère ta clé sur{' '}
              <a
                href="https://www.inaturalist.org/oauth/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline inline-flex items-center gap-0.5"
              >
                inaturalist.org/oauth <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={savedKey ? '•••••••••••••••• (déjà enregistrée)' : 'Colle ta clé API ici'}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {savedKey && !apiKey && (
              <p className="text-xs text-green-600 mt-1">Clé déjà enregistrée — laisse vide pour la conserver.</p>
            )}
          </div>

          {enabled ? (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Partage iNaturalist activé</span>
            </div>
          ) : null}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            {enabled ? (
              <Button variant="destructive" onClick={handleDisable} className="flex-1">
                Désactiver
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!apiKey.trim() && !savedKey} className="flex-1">
                Activer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function isINatEnabled(): boolean {
  return localStorage.getItem('botania-inat-enabled') === 'true';
}

export function getINatApiKey(): string | null {
  return localStorage.getItem('botania-inat-apikey');
}
