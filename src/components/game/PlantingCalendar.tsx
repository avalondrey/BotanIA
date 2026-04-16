"use client";

/**
 * PlantingCalendar — Calendrier de plantation INRAE
 *
 * Visualisation mensuelle des périodes optimales de semis/plantation/récolte
 * pour toutes les plantes du catalogue.
 * Sources : INRAE, GNIS, Centre technique interprofessionnel des oléagineux.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLANTS } from "@/lib/plant-db";
import { getPlantDisplay } from "@/lib/plant-db";
import { Calendar, Filter, ChevronDown, ChevronUp } from "lucide-react";

const MONTH_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

const MONTH_FULL = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const SEASON_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  spring: { emoji: "🌸", label: "Printemps", color: "bg-green-100 text-green-700 border-green-300" },
  summer: { emoji: "☀️", label: "Été", color: "bg-amber-100 text-amber-700 border-amber-300" },
  autumn: { emoji: "🍂", label: "Automne", color: "bg-orange-100 text-orange-700 border-orange-300" },
  winter: { emoji: "❄️", label: "Hiver", color: "bg-blue-100 text-blue-700 border-blue-300" },
};

type FilterSeason = "all" | "spring" | "summer" | "autumn" | "winter";

export function PlantingCalendar() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [filterSeason, setFilterSeason] = useState<FilterSeason>("all");
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);

  const plantEntries = useMemo(() => {
    const entries = Object.entries(PLANTS)
      .map(([id, def]) => {
        const display = getPlantDisplay(id);
        // Sowing months: months in optimalPlantMonths before the harvest season
        // For simplicity, use optimalPlantMonths as the sowing window
        const sowingMonths = def.optimalPlantMonths;
        const harvestMonths = inferHarvestMonths(def.optimalSeasons);

        return {
          id,
          name: display.name,
          emoji: display.emoji,
          sowingMonths,
          harvestMonths,
          seasons: def.optimalSeasons,
          waterNeed: def.waterNeed,
          lightNeed: def.lightNeed,
          daysToHarvest: def.realDaysToHarvest,
          tempRange: def.optimalTemp,
        };
      })
      .filter((entry) => {
        if (filterSeason === "all") return true;
        return entry.seasons.includes(filterSeason);
      })
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    return entries;
  }, [filterSeason]);

  // Plants that can be sown in the selected month
  const plantsForMonth = useMemo(() => {
    return plantEntries.filter((p) =>
      p.sowingMonths.includes(selectedMonth + 1)
    );
  }, [plantEntries, selectedMonth]);

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-[3px] border-green-400 rounded-2xl shadow-[4px_4px_0_0_#000]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-green-600" />
        <h3 className="text-sm font-black uppercase">📅 Calendrier INRAE</h3>
      </div>

      {/* Season filters */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <button
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border-2 transition-all ${
            filterSeason === "all"
              ? "bg-green-200 border-green-400 text-green-800"
              : "bg-white border-stone-200 text-stone-500 hover:border-green-300"
          }`}
          onClick={() => setFilterSeason("all")}
        >
          Toutes
        </button>
        {Object.entries(SEASON_INFO).map(([key, info]) => (
          <button
            key={key}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border-2 transition-all ${
              filterSeason === key
                ? `${info.color} border-current`
                : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
            }`}
            onClick={() => setFilterSeason(key === filterSeason ? "all" : (key as FilterSeason))}
          >
            {info.emoji} {info.label}
          </button>
        ))}
      </div>

      {/* Month selector */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {MONTH_SHORT.map((name, i) => {
          const isCurrentMonth = i === new Date().getMonth();
          const isSelected = i === selectedMonth;
          const plantCount = plantEntries.filter((p) =>
            p.sowingMonths.includes(i + 1)
          ).length;

          return (
            <button
              key={i}
              className={`flex-shrink-0 flex flex-col items-center px-2 py-1.5 rounded-xl border-2 transition-all ${
                isSelected
                  ? "bg-green-200 border-green-500 text-green-800 shadow-[2px_2px_0_0_#16a34a]"
                  : isCurrentMonth
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-white border-stone-200 text-stone-600 hover:border-green-300"
              }`}
              onClick={() => setSelectedMonth(i)}
            >
              <span className="text-[10px] font-black">{name}</span>
              {plantCount > 0 && (
                <span className="text-[8px] font-bold text-stone-400">{plantCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Month summary */}
      <div className="mb-3 p-2.5 bg-white rounded-xl border-2 border-green-200">
        <div className="text-xs font-black text-green-700 mb-1">
          {MONTH_FULL[selectedMonth]} — Semis & plantation
        </div>
        {plantsForMonth.length === 0 ? (
          <p className="text-[11px] text-stone-400">
            Aucune plante à semer ce mois-ci
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {plantsForMonth.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-lg text-[10px] font-bold text-green-700 cursor-pointer hover:bg-green-100"
                onClick={() => setExpandedPlant(expandedPlant === p.id ? null : p.id)}
              >
                <span>{p.emoji}</span>
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded plant detail */}
      <AnimatePresence>
        {expandedPlant && (() => {
          const plant = plantEntries.find((p) => p.id === expandedPlant);
          if (!plant) return null;

          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-white rounded-xl border-2 border-amber-200 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{plant.emoji}</span>
                    <div>
                      <h4 className="text-sm font-black text-stone-800">{plant.name}</h4>
                      <div className="flex gap-1">
                        {plant.seasons.map((s) => {
                          const info = SEASON_INFO[s];
                          return info ? (
                            <span key={s} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${info.color}`}>
                              {info.emoji} {info.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-stone-400 hover:text-stone-600"
                    onClick={() => setExpandedPlant(null)}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                {/* Year calendar grid */}
                <div className="grid grid-cols-12 gap-0.5 mb-2">
                  {MONTH_SHORT.map((month, i) => {
                    const monthNum = i + 1;
                    const isSowing = plant.sowingMonths.includes(monthNum);
                    const isHarvesting = plant.harvestMonths.includes(monthNum);
                    const isCurrentMonth = i === new Date().getMonth();

                    let bg = "bg-stone-50";
                    if (isSowing && isHarvesting) bg = "bg-amber-200";
                    else if (isSowing) bg = "bg-green-300";
                    else if (isHarvesting) bg = "bg-amber-300";

                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center py-1 rounded-md text-[7px] font-bold ${bg} ${
                          isCurrentMonth ? "ring-2 ring-stone-400" : ""
                        }`}
                      >
                        <span className={isSowing ? "text-green-800" : "text-stone-400"}>
                          {month}
                        </span>
                        {isSowing && <span className="text-green-700">🌱</span>}
                        {isHarvesting && <span className="text-amber-700">🌾</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span>🌡️</span>
                    <span className="text-stone-600 font-bold">{plant.tempRange[0]}°C – {plant.tempRange[1]}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>💧</span>
                    <span className="text-stone-600 font-bold">{plant.waterNeed}mm/j</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>☀️</span>
                    <span className="text-stone-600 font-bold">{plant.lightNeed}h lumière</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span className="text-stone-600 font-bold">{plant.daysToHarvest}j → récolte</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-3 mt-2 text-[8px] text-stone-500">
                  <span>🟢 Semis</span>
                  <span>🟠 Récolte</span>
                  <span>🟡 Semis + Récolte</span>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Full calendar grid */}
      <details className="mt-2">
        <summary className="text-[11px] font-bold text-green-600 cursor-pointer flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Vue complète ({plantEntries.length} plantes)
          <ChevronDown className="w-3 h-3" />
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[8px]">
            <thead>
              <tr>
                <th className="text-left p-1 font-black text-stone-500 sticky left-0 bg-green-50 z-10 min-w-[80px]">
                  Plante
                </th>
                {MONTH_SHORT.map((m) => (
                  <th key={m} className="p-0.5 text-center font-bold text-stone-400">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plantEntries.slice(0, 30).map((plant) => (
                <tr key={plant.id} className="hover:bg-green-100/50">
                  <td className="p-1 font-bold text-stone-700 sticky left-0 bg-green-50 z-10 whitespace-nowrap">
                    {plant.emoji} {plant.name}
                  </td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNum = i + 1;
                    const isSowing = plant.sowingMonths.includes(monthNum);
                    const isHarvesting = plant.harvestMonths.includes(monthNum);

                    let cellClass = "bg-transparent";
                    let emoji = "";
                    if (isSowing && isHarvesting) { cellClass = "bg-amber-200"; emoji = "🌱🌾"; }
                    else if (isSowing) { cellClass = "bg-green-200"; emoji = "🌱"; }
                    else if (isHarvesting) { cellClass = "bg-amber-200"; emoji = "🌾"; }

                    return (
                      <td
                        key={i}
                        className={`p-0.5 text-center ${cellClass} rounded-sm`}
                      >
                        {emoji || "·"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/** Infère les mois de récolte à partir des saisons */
function inferHarvestMonths(seasons: string[]): number[] {
  const months: number[] = [];
  for (const season of seasons) {
    switch (season) {
      case "spring": months.push(4, 5, 6); break;
      case "summer": months.push(7, 8, 9); break;
      case "autumn": months.push(10, 11, 12); break;
      case "winter": months.push(1, 2, 3); break;
    }
  }
  return [...new Set(months)];
}