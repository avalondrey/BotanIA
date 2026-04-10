'use client';

import { BuilderContent } from './builder-content';

/**
 * Site Footer with AI Console
 * Editable via Builder.io model: "site-footer"
 */
export function SiteFooter() {
  return (
    <BuilderContent model="site-footer">
      <div className="mt-4 p-2.5 bg-stone-900 rounded-xl font-mono text-[9px]">
        <p className="text-stone-500 font-bold uppercase mb-1 flex items-center gap-1">
          <span>⚡</span> Console IA v3.0
        </p>
        <div className="space-y-0.5 text-[9px]">
          <p className="text-green-400">&gt; Calendrier Lunaire 🌙 + Météo 7 jours ⛅ + IA Advisor 💡</p>
          <p className="text-green-400">&gt; Photo Mode 📸 + Sound System 🔊 + Crop Rotation 🔄</p>
          <p className="text-green-400">&gt; Réseau: Jardin + Pépinière + Mini Serres + Boutique ✅</p>
          <p className="text-green-400">&gt; Mini Serres: 6×4 = 24 emplacements (max 6/chambre) ✅</p>
          <p className="text-green-400">&gt; Remplir serre + Planter à date ✅</p>
          <p className="text-green-400">&gt; Tuiles Serre: protection gel, +5°C, -70% pluie ✅</p>
          <p className="text-green-400">&gt; Graines → Pépinière/Mini Serre (5 étapes) → Jardin ✅</p>
          <p className="text-green-400">&gt; Météo réelle Open-Meteo + GPS ✅</p>
          <p className="text-green-400">&gt; Plantes ne meurent jamais (mode survie) ✅</p>
          <p className="text-stone-500">&gt; Pépinière: T° 20°C, Lumière ×0.6, Croissance ×0.7</p>
          <p className="text-stone-500">&gt; Mini Serre: même env. que Pépinière (24 slots/grille)</p>
          <p className="text-stone-500">&gt; Serre Jardin: T° +15%, Pluie -70%, Lumière +15%</p>
          <p className="text-stone-500">&gt; Jardin: conditions météo réelles 1:1</p>
          <p className="text-stone-500">&gt; Gel: stoppe croissance (pas de mort)</p>
          <p className="text-amber-400 animate-pulse">&gt; Simulation active</p>
        </div>
      </div>
    </BuilderContent>
  );
}