"use client";

import { useGameStore } from "@/store/game-store";

export function GameConsole() {
  const isPaused = useGameStore((s) => s.isPaused);
  const speed = useGameStore((s) => s.speed);

  return (
    <div className="p-3 bg-gradient-to-b from-stone-900 to-stone-950 rounded-xl font-mono text-[9px] h-full border border-stone-700">
      <p className="text-emerald-400 font-bold uppercase mb-2 flex items-center gap-1 text-[10px]">
        <span>⚡</span> BotanIA Console
      </p>
      <div className="space-y-0.5 text-[9px]">
        <p className="text-green-400/90">&gt; Calendrier Lunaire 🌙 + Météo 7 jours ⛅ + IA Advisor 💡</p>
        <p className="text-green-400/90">&gt; Photo Mode 📸 + Sound System 🔊 + Crop Rotation 🔄</p>
        <p className="text-green-400/90">&gt; Météo réelle Open-Meteo + GPS ✅</p>
        <p className="text-green-400/90">&gt; Graines → Pépinière/Mini Serre → Jardin ✅</p>
        <p className="text-green-400/90">&gt; Tuiles Serre: protection gel, +5°C, -70% pluie ✅</p>
        <p className="text-stone-500">&gt; Pépinière: T° 20°C, Lumière ×0.6, Croissance ×0.7</p>
        <p className="text-stone-500">&gt; Serre Jardin: T° +15%, Pluie -70%, Lumière +15%</p>
        <p className="text-stone-500">&gt; Jardin: conditions météo réelles 1:1</p>
        <p className="text-stone-500">&gt; Gel: stoppe croissance (pas de mort)</p>
        <p className="text-amber-400 animate-pulse">&gt; {isPaused ? "⏸ EN PAUSE" : `▶ ${speed}× — Simulation active`}</p>
      </div>
    </div>
  );
}