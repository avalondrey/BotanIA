"use client";

/**
 * CelebrationOverlay — Animations de célébration
 *
 * Déclenchées par les événements EventBus :
 * - achievement:unlocked → Confetti + badge
 * - quest:completed → Étoiles + récompense
 * - plant:harvested → Récolte
 * - dailybonus:claimed → Pièces qui tombent
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { eventBus } from "@/lib/event-bus";

interface Celebration {
  id: string;
  type: 'achievement' | 'quest' | 'harvest' | 'bonus' | 'levelup';
  emoji: string;
  title: string;
  subtitle: string;
  coins?: number;
}

const CELEBRATION_CONFIG: Record<string, { emoji: string; title: string }> = {
  'onboarding:welcome': { emoji: '🏠', title: 'Bienvenue !' },
  'onboarding:first-seed': { emoji: '🛒', title: 'Première graine' },
  'onboarding:first-plant': { emoji: '🌱', title: 'Mise en terre' },
  'onboarding:first-water': { emoji: '💧', title: 'Premier arrosage' },
  'onboarding:first-harvest': { emoji: '🌾', title: 'Première récolte' },
  'onboarding:first-sell': { emoji: '🪙', title: 'Premier marché' },
  'onboarding:discover-3': { emoji: '🔍', title: 'Explorateur' },
  'onboarding:quest-master': { emoji: '🎯', title: 'Maître des quêtes' },
};

let _celebCounter = 0;

export function CelebrationOverlay() {
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>([]);
  const celebrationParticlesRef = useRef<Record<string, { yTarget: number; xTarget: number; rotation: number; color: string; shape: string }[]>>({});

  const addCelebration = useCallback((celeb: Omit<Celebration, 'id'>) => {
    const id = `celeb-${++_celebCounter}`;
    const celebration: Celebration = { ...celeb, id };
    setActiveCelebrations((prev) => [...prev, celebration]);

    // Pre-generate confetti positions to avoid Math.random() in render
    const particles = Array.from({ length: 8 }, (_, i) => ({
      yTarget: -80 - Math.random() * 40,
      xTarget: (Math.random() - 0.5) * 160,
      rotation: Math.random() * 360,
      color: ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'][i % 5],
      shape: ['✦', '●', '◆', '★', '✿'][i % 5],
    }));
    celebrationParticlesRef.current[id] = particles;

    // Auto-dismiss après 3.5s
    setTimeout(() => {
      setActiveCelebrations((prev) => prev.filter((c) => c.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      eventBus.on('achievement:unlocked', (payload) => {
        const config = CELEBRATION_CONFIG[payload.achievementId];
        addCelebration({
          type: 'achievement',
          emoji: config?.emoji ?? '🏆',
          title: config?.title ?? 'Succès débloqué !',
          subtitle: payload.achievementId,
        });
      })
    );

    unsubs.push(
      eventBus.on('quest:completed', (payload) => {
        addCelebration({
          type: 'quest',
          emoji: '🎯',
          title: 'Quête terminée !',
          subtitle: `+${payload.reward} pièces`,
          coins: payload.reward,
        });
      })
    );

    unsubs.push(
      eventBus.on('plant:harvested', (payload) => {
        addCelebration({
          type: 'harvest',
          emoji: '🌾',
          title: 'Récolte !',
          subtitle: `+${payload.coins} pièces`,
          coins: payload.coins,
        });
      })
    );

    unsubs.push(
      eventBus.on('dailybonus:claimed', (payload) => {
        addCelebration({
          type: 'bonus',
          emoji: '🎁',
          title: `Bonus jour ${payload.streak}`,
          subtitle: `+${payload.coins} pièces`,
          coins: payload.coins,
        });
      })
    );

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [addCelebration]);

  if (activeCelebrations.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <AnimatePresence>
        {activeCelebrations.map((celeb) => (
          <motion.div
            key={celeb.id}
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white border-[4px] border-amber-400 rounded-3xl shadow-[8px_8px_0_0_#000] p-6 text-center max-w-xs pointer-events-auto">
              {/* Emoji animé */}
              <motion.div
                animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-6xl mb-2"
              >
                {celeb.emoji}
              </motion.div>

              {/* Titre */}
              <h2 className="text-lg font-black uppercase" style={{ textShadow: "2px 2px 0 #000" }}>
                {celeb.title}
              </h2>

              {/* Sous-titre */}
              {celeb.subtitle && (
                <p className="text-sm text-stone-500 font-bold mt-1">
                  {celeb.subtitle}
                </p>
              )}

              {/* Pièces */}
              {celeb.coins && celeb.coins > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-xl border-2 border-amber-300"
                >
                  <span className="text-2xl">🪙</span>
                  <span className="text-xl font-black text-amber-700">+{celeb.coins}</span>
                </motion.div>
              )}

              {/* Confetti-like particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {(celebrationParticlesRef.current[celeb.id] || []).map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, y: 0, x: 0 }}
                    animate={{
                      opacity: [1, 1, 0],
                      y: [0, p.yTarget],
                      x: [p.xTarget],
                      rotate: [0, p.rotation],
                    }}
                    transition={{ duration: 1.2, delay: i * 0.05, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 text-xl"
                    style={{
                      color: p.color,
                    }}
                  >
                    {p.shape}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}