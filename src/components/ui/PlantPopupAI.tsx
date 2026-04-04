"use client";
import { useState, useEffect } from "react";
import { triggerAutoAdvice } from "@/lib/game-integration";

type PlantPopupProps = {
  plant: any;
  weather: { timeLabel?: string; weatherLabel?: string };
  zone: "pepiniere" | "serre" | "jardin";
  onClose: () => void;
};

export default function PlantPopupAI({ plant, weather, zone, onClose }: PlantPopupProps) {
  const [visible, setVisible] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => { setVisible(true); triggerAutoAdvice(plant, weather, zone, setAdvice); }, [plant, weather, zone]);

  const askGardener = async () => {
    setAsking(true);
    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantName: plant.name, stage: plant.stage, season: "Printemps", weather: weather.weatherLabel || "Normal", zone, question: "Conseil personnalisé ?" })
      });
      const d = await res.json();
      setAdvice(d.success ? d.advice : "Le jardinier est en pause... 🌙");
    } catch { setAdvice("Erreur de connexion"); } finally { setAsking(false); }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} onClick={onClose}>
      <div className={`relative w-full max-w-md bg-[#f4f1ea] border-4 border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] rounded-xl p-6 transform transition-all duration-300 scale-100 ${visible ? "translate-y-0" : "translate-y-8 scale-95"}`} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl font-bold hover:text-red-600 transition">×</button>
        <h2 className="text-2xl font-extrabold text-[#2b2b2b] mb-2">{plant.name} <span className="text-sm font-normal text-gray-500">Stade {plant.stage}/5</span></h2>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <span>❤️ Santé: <b>{plant.health}%</b></span>
          <span>💧 Eau: <b>{plant.needsWater ? "Besoin" : "OK"}</b></span>
          <span>🌤️ Météo: {weather.weatherLabel || "—"}</span>
          <span>🏡 Zone: {zone}</span>
        </div>

        {advice && (
          <div className="bg-[#e8f5e9] border-2 border-[#4caf50] p-3 rounded-lg mb-4 text-sm font-medium animate-pulse-once">
            🌿 {advice}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={askGardener} disabled={asking} className="flex-1 bg-[#ffcc00] hover:bg-[#e6b800] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] font-bold py-2 rounded transition active:translate-y-0.5 active:shadow-none disabled:opacity-50">
            {asking ? "🤔 Réflexion..." : "💡 Vieux jardinier"}
          </button>
          <button onClick={onClose} className="px-4 bg-[#e0e0e0] hover:bg-[#d0d0d0] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] font-bold rounded transition">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
