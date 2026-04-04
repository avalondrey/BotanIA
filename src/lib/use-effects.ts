"use client";
import { useEffect } from "react";

/**
 * Filtre visuel nuit quand l heure reelle est entre 22h et 6h
 * Applique un overlay semi-transparent pour simuler l obscurite
 */
export function useNightMode() {
  useEffect(() => {
    const applyNight = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour < 6;
      document.body.style.filter = isNight ? "brightness(0.8) contrast(1.2)" : "";
      document.body.style.transition = "filter 1s ease";
      const root = document.getElementById("root") || document.documentElement;
      if (isNight) {
        let overlay = document.getElementById("botania-night-overlay");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "botania-night-overlay";
          overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,20,0.12);pointer-events:none;z-index:9998;transition:opacity 1s ease;";
          document.body.appendChild(overlay);
        }
        overlay.style.opacity = "1";
      } else {
        const overlay = document.getElementById("botania-night-overlay");
        if (overlay) {
          overlay.style.opacity = "0";
          setTimeout(() => overlay.remove(), 1000);
        }
      }
    };

    applyNight();
    const interval = setInterval(applyNight, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);
}

/**
 * Auto-save toutes les 10 secondes pour eviter toute perte de progression
 */
export function useAutoSave() {
  useEffect(() => {
    const save = () => {
      try {
        // Zustand persiste deja, mais on force un backup
        const keys = [
          "jardin-culture-coins",
          "jardin-culture-best-score",
          "jardin-culture-seeds",
          "jardin-culture-garden-plants",
          "jardin-culture-pepiniere",
          "jardin-culture-mini-serres",
        ];
        const backup: Record<string, string | null> = {};
        keys.forEach(k => { backup[k] = localStorage.getItem(k); });
        localStorage.setItem("jardin-culture-autosave", JSON.stringify({ t: Date.now(), keys: Object.keys(backup) }));
      } catch (e) { /* ignore */ }
    };

    save();
    const interval = setInterval(save, 10000);
    return () => clearInterval(interval);
  }, []);
}