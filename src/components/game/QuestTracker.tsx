"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coins, Target, CheckCircle2, Gift } from "lucide-react";
import { useEconomyStore } from "@/store/economy-store";
import { useState } from "react";

export function QuestTracker() {
  const activeQuests = useEconomyStore((s) => s.activeQuests);
  const claimQuestReward = useEconomyStore((s) => s.claimQuestReward);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  const handleClaim = (questId: string) => {
    const reward = claimQuestReward(questId);
    if (reward > 0) {
      setJustClaimed(questId);
      setTimeout(() => setJustClaimed(null), 1500);
    }
  };

  return (
    <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 border-[3px] border-indigo-400 rounded-2xl shadow-[4px_4px_0_0_#000]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-black uppercase">🎯 Quêtes du jour</h3>
      </div>

      {/* Quests list */}
      <div className="space-y-2">
        <AnimatePresence>
          {activeQuests.map((quest) => {
            const progress = Math.min(quest.progress, quest.def.target);
            const pct = Math.round((progress / quest.def.target) * 100);
            const isComplete = quest.completed;
            const isClaimed = quest.rewardClaimed;

            return (
              <motion.div
                key={quest.def.id}
                layout
                className={`p-2.5 rounded-xl border-2 transition-all
                  ${isClaimed
                    ? "bg-stone-50 border-stone-200 opacity-60"
                    : isComplete
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-[2px_2px_0_0_#16a34a]"
                      : "bg-white border-stone-200"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {/* Quest icon */}
                  <span className="text-lg">{quest.def.emoji}</span>

                  {/* Quest info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-[11px] font-black truncate ${isClaimed ? 'text-stone-400 line-through' : ''}`}>
                        {quest.def.title}
                      </p>
                      {isComplete && !isClaimed && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[9px] font-black text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full"
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {!isClaimed && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.3 }}
                            className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-400'}`}
                          />
                        </div>
                        <span className="text-[8px] font-black text-stone-500 whitespace-nowrap">
                          {progress}/{quest.def.target}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reward / Claim button */}
                  <div className="flex items-center gap-1.5">
                    {isClaimed ? (
                      <CheckCircle2 className="w-4 h-4 text-stone-400" />
                    ) : isComplete ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleClaim(quest.def.id)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1
                          ${justClaimed === quest.def.id
                            ? "bg-green-200 text-green-700 border border-green-300"
                            : "bg-gradient-to-b from-green-500 to-green-600 text-white border border-green-700 shadow-[2px_2px_0_0_#000]"
                          }`}
                      >
                        <Gift className="w-3 h-3" />
                        {quest.def.reward} 🪙
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-0.5 text-[9px] font-bold text-stone-400">
                        <Coins className="w-3 h-3 text-amber-400" />
                        {quest.def.reward}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}