"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore, ONBOARDING_STEPS } from "@/store/onboarding-store";
import { useState } from "react";
import { ChevronRight, Trophy, CheckCircle2, Lock } from "lucide-react";

const STEPS = ONBOARDING_STEPS;

export function OnboardingTracker() {
  const completedSteps = useOnboardingStore((s) => s.completedSteps);
  const unlockedSteps = useOnboardingStore((s) => s.unlockedSteps);
  const onboardingDone = useOnboardingStore((s) => s.onboardingDone);
  const getNextStep = useOnboardingStore((s) => s.getNextStep);
  const getProgress = useOnboardingStore((s) => s.getProgress);
  const [expanded, setExpanded] = useState(true);

  const progress = getProgress();
  const nextStep = getNextStep();

  if (onboardingDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-[3px] border-amber-400 rounded-2xl shadow-[4px_4px_0_0_#000]"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-black uppercase text-amber-700">
            Onboarding terminé !
          </span>
          <span className="text-[10px] text-amber-500 font-bold">
            {progress.completed}/{progress.total}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-[3px] border-green-400 rounded-2xl shadow-[4px_4px_0_0_#000]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🌿</span>
          <h3 className="text-xs font-black uppercase text-green-700">
            Parcours BotanIA
          </h3>
          <span className="text-[9px] font-bold text-green-500 bg-green-100 px-1.5 py-0.5 rounded-full">
            {progress.completed}/{progress.total}
          </span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          className="text-green-500"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Progress bar */}
      <div className="mt-2 h-2 bg-green-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.pct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
        />
      </div>

      {/* Steps */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1.5">
              {STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isUnlocked = unlockedSteps.includes(step.id);
                const isNext = nextStep?.id === step.id;
                const isLocked = !isCompleted && !isUnlocked;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                      isCompleted
                        ? "bg-green-50 border-green-300"
                        : isNext
                          ? "bg-amber-50 border-amber-400 shadow-[2px_2px_0_0_#d97706]"
                          : isLocked
                            ? "bg-stone-50 border-stone-200 opacity-50"
                            : "bg-white border-stone-200"
                    }`}
                  >
                    {/* Status icon */}
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-stone-300 shrink-0" />
                    ) : (
                      <span className="text-base shrink-0">{step.emoji}</span>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-black truncate ${
                        isCompleted ? 'text-green-600 line-through' : isLocked ? 'text-stone-400' : 'text-stone-700'
                      }`}>
                        {step.title}
                      </p>
                      {isNext && (
                        <p className="text-[8px] text-amber-600 font-bold truncate">
                          {step.description}
                        </p>
                      )}
                    </div>

                    {/* Reward */}
                    <span className={`text-[9px] font-black shrink-0 ${
                      isCompleted ? 'text-green-500' : 'text-amber-500'
                    }`}>
                      {isCompleted ? '✓' : `+${step.reward} 🪙`}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}