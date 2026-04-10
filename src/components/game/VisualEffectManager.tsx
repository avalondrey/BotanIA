"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type EffectType = "flash" | "speedlines" | "success-pop";

interface VisualEffectProps {
  type: EffectType;
  duration?: number;
}

export function VisualEffectManager() {
  const [activeEffects, setActiveEffects] = useState<{ id: string; type: EffectType }[]>([]);

  useEffect(() => {
    // Listen for custom events triggered by the game store/actions
    const handleEffect = (e: any) => {
      const type = e.detail as EffectType;
      const id = Math.random().toString(36).slice(2);
      setActiveEffects(prev => [...prev, { id, type }]);

      // Auto-remove effect after duration
      setTimeout(() => {
        setActiveEffects(prev => prev.filter(eff => eff.id !== id));
      }, 1000);
    };

    window.addEventListener("game-visual-effect", handleEffect);
    return () => window.removeEventListener("game-visual-effect", handleEffect);
  }, []);

  return (
    <AnimatePresence>
      {activeEffects.map(eff => (
        <div key={eff.id} className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {eff.type === "flash" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-white"
            />
          )}
          {eff.type === "speedlines" && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-speedlines"
              style={{
                backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg, transparent 1deg, rgba(0,0,0,0.2) 1deg, rgba(0,0,0,0.2) 2deg)`,
              }}
            />
          )}
          {eff.type === "success-pop" && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-8xl font-black text-yellow-400 italic drop-shadow-[0_5px_0_#000] uppercase">
                K-CHING!
              </span>
            </motion.div>
          )}
        </div>
      ))}
    </AnimatePresence>
  );
}

// Helper to trigger effects from anywhere in the app
export function triggerVisualEffect(type: EffectType) {
  const event = new CustomEvent("game-visual-effect", { detail: type });
  window.dispatchEvent(event);
}
