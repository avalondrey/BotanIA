"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coins, Gift, Flame, X } from "lucide-react";
import { useEconomyStore } from "@/store/economy-store";
import { useState, useEffect } from "react";

export function DailyBonusPopup() {
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<{ coins: number; streak: number; alreadyClaimed: boolean } | null>(null);
  const [claimed, setClaimed] = useState(false);

  const claimDailyBonus = useEconomyStore((s) => s.claimDailyBonus);
  const dailyStreak = useEconomyStore((s) => s.dailyStreak);
  const checkAndResetDaily = useEconomyStore((s) => s.checkAndResetDaily);

  useEffect(() => {
    checkAndResetDaily();
    // Check if bonus is available
    const r = claimDailyBonus();
    if (!r.alreadyClaimed && r.coins > 0) {
      setResult(r);
      setVisible(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClaim = () => {
    setClaimed(true);
    setTimeout(() => setVisible(false), 800);
  };

  if (!result) return null;

  const streakDays = result.streak;
  const isMaxStreak = streakDays >= 7;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { if (!claimed) return; setVisible(false); }}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: claimed ? 1.1 : 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white border-[4px] border-amber-400 rounded-3xl shadow-[8px_8px_0_0_#000] p-6 max-w-sm w-full mx-4"
          >
            {/* Close button */}
            <button
              onClick={() => setVisible(false)}
              className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-4">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1, repeat: 3, repeatDelay: 2 }}
                className="text-6xl"
              >
                <Gift className="w-16 h-16 text-amber-500 mx-auto" />
              </motion.div>

              {/* Title */}
              <div>
                <h2 className="text-xl font-black uppercase" style={{ textShadow: "2px 2px 0 #000" }}>
                  Bonus Quotidien !
                </h2>
                <p className="text-[10px] text-stone-400 font-bold">Revenez chaque jour pour augmenter votre bonus</p>
              </div>

              {/* Streak */}
              <div className="flex items-center justify-center gap-2">
                <Flame className={`w-5 h-5 ${isMaxStreak ? 'text-orange-500' : 'text-amber-500'}`} />
                <span className="text-sm font-black">
                  {isMaxStreak ? '🔥 Streak max !' : `Jour ${streakDays}`}
                </span>
              </div>

              {/* Streak progress */}
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-black
                      ${day <= streakDays
                        ? "bg-gradient-to-b from-amber-400 to-amber-500 text-white border-amber-600"
                        : "bg-stone-100 text-stone-400 border-stone-200"
                      }`}
                  >
                    {day <= streakDays ? '✓' : `J${day}`}
                  </div>
                ))}
              </div>

              {/* Reward */}
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl border-2 border-amber-300">
                <Coins className="w-6 h-6 text-amber-600" />
                <span className="text-2xl font-black text-amber-700">+{result.coins}</span>
                <span className="text-sm font-bold text-amber-600">🪙</span>
              </div>

              {/* Claim button */}
              {!claimed ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaim}
                  className="w-full py-3 bg-gradient-to-b from-green-500 to-green-600 text-white text-sm font-black uppercase rounded-xl border-2 border-green-700 shadow-[4px_4px_0_0_#000] hover:from-green-400 hover:to-green-500 flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Réclamer
                </motion.button>
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-full py-3 bg-gradient-to-b from-green-100 to-green-200 text-green-700 text-sm font-black uppercase rounded-xl border-2 border-green-300 flex items-center justify-center gap-2"
                >
                  Réclamé ! ✓
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}