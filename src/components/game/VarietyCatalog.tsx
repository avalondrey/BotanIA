"use client";

/**
 * VarietyCatalog — Catalogue des variétés de plantes
 *
 * Affiche toutes les variétés disponibles avec filtres,
 * et pour chaque variété : PlantStatCard + GrowthCurveChart + calendrier.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLANTS } from "@/lib/plant-db";
import { getPlantDisplay } from "@/lib/plant-db";
import { PlantStatCard } from "./PlantStatCard";
import { GrowthCurveChart } from "./GrowthCurveChart";
import { Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react";

type SeasonFilter = "all" | "spring" | "summer" | "autumn" | "winter";
type CategoryFilter = "all" | "vegetable" | "tree" | "small-fruit";

const SEASON_LABELS: Record<string, string> = {
  spring: "Printemps",
  summer: "Été",
  autumn: "Automne",
  winter: "Hiver",
};

const SEASON_EMOJIS: Record<string, string> = {
  spring: "🌸",
  summer: "☀️",
  autumn: "🍂",
  winter: "❄️",
};

// Classification basique par famille
function getCategory(id: string): CategoryFilter {
  const trees = ["apple", "pear", "cherry", "apricot", "plum", "fig", "peach", "quince", "oak", "birch", "pine", "maple", "magnolia", "hazelnut", "walnut", "orange", "lemon"];
  const smallFruits = ["strawberry", "goji", "lycium", "mirabellier", "casseille"];
  if (trees.includes(id)) return "tree";
  if (smallFruits.includes(id)) return "small-fruit";
  return "vegetable";
}

export function VarietyCatalog() {
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPlants = useMemo(() => {
    const entries = Object.entries(PLANTS);

    return entries.filter(([id, def]) => {
      // Search filter
      if (search) {
        const display = getPlantDisplay(id);
        const q = search.toLowerCase();
        if (!display.name.toLowerCase().includes(q) && !id.includes(q)) return false;
      }

      // Season filter
      if (seasonFilter !== "all") {
        if (!def.optimalSeasons.includes(seasonFilter)) return false;
      }

      // Category filter
      if (categoryFilter !== "all") {
        const cat = getCategory(id);
        if (cat !== categoryFilter) return false;
      }

      return true;
    }).sort(([, a], [, b]) => {
      const aDisplay = getPlantDisplay(a.id);
      const bDisplay = getPlantDisplay(b.id);
      return aDisplay.name.localeCompare(bDisplay.name, "fr");
    });
  }, [search, seasonFilter, categoryFilter]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-[3px] border-green-400 rounded-2xl shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🌿</span>
          <h3 className="text-sm font-black uppercase text-green-700">
            Catalogue des variétés
          </h3>
          <span className="text-[10px] font-bold text-green-500 bg-green-100 px-1.5 py-0.5 rounded-full">
            {filteredPlants.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une variété..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-stone-200 text-xs font-bold text-stone-700 bg-white focus:border-green-400 focus:outline-none"
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              onClick={() => setSearch("")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            className={`px-2 py-1 rounded-lg text-[9px] font-bold border-2 transition-all ${
              categoryFilter === "all"
                ? "bg-green-200 border-green-400 text-green-800"
                : "bg-white border-stone-200 text-stone-500 hover:border-green-300"
            }`}
            onClick={() => setCategoryFilter("all")}
          >
            Toutes
          </button>
          <button
            className={`px-2 py-1 rounded-lg text-[9px] font-bold border-2 transition-all ${
              categoryFilter === "vegetable"
                ? "bg-green-200 border-green-400 text-green-800"
                : "bg-white border-stone-200 text-stone-500 hover:border-green-300"
            }`}
            onClick={() => setCategoryFilter("vegetable")}
          >
            🥬 Légumes
          </button>
          <button
            className={`px-2 py-1 rounded-lg text-[9px] font-bold border-2 transition-all ${
              categoryFilter === "tree"
                ? "bg-green-200 border-green-400 text-green-800"
                : "bg-white border-stone-200 text-stone-500 hover:border-green-300"
            }`}
            onClick={() => setCategoryFilter("tree")}
          >
            🌳 Arbres
          </button>
          <button
            className={`px-2 py-1 rounded-lg text-[9px] font-bold border-2 transition-all ${
              categoryFilter === "small-fruit"
                ? "bg-green-200 border-green-400 text-green-800"
                : "bg-white border-stone-200 text-stone-500 hover:border-green-300"
            }`}
            onClick={() => setCategoryFilter("small-fruit")}
          >
            🍒 Petits fruits
          </button>

          <div className="w-px bg-stone-200 mx-1" />

          {(["spring", "summer", "autumn", "winter"] as SeasonFilter[]).map((season) => (
            <button
              key={season}
              className={`px-2 py-1 rounded-lg text-[9px] font-bold border-2 transition-all ${
                seasonFilter === season
                  ? "bg-green-200 border-green-400 text-green-800"
                  : "bg-white border-stone-200 text-stone-500 hover:border-green-300"
              }`}
              onClick={() => setSeasonFilter(seasonFilter === season ? "all" : season)}
            >
              {SEASON_EMOJIS[season]} {SEASON_LABELS[season]}
            </button>
          ))}
        </div>
      </div>

      {/* Plant grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPlants.map(([id, def]) => {
          const isExpanded = expandedId === id;

          return (
            <div key={id}>
              <div onClick={() => setExpandedId(isExpanded ? null : id)} className="cursor-pointer">
                <PlantStatCard
                  plantDefId={id}
                  compact={isExpanded}
                />
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 bg-white border-2 border-green-200 rounded-xl space-y-3">
                      {/* Growth curve */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] font-black text-green-600 uppercase">
                            Courbe de croissance
                          </span>
                        </div>
                        <GrowthCurveChart
                          plantDefId={id}
                          currentStage={0}
                          gddAccumulated={0}
                        />
                      </div>

                      {/* Seasons */}
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold text-stone-500 mr-1">Saisons :</span>
                        {def.optimalSeasons.map((season) => (
                          <span
                            key={season}
                            className="text-[8px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full border border-green-200"
                          >
                            {SEASON_EMOJIS[season]} {SEASON_LABELS[season]}
                          </span>
                        ))}
                      </div>

                      {/* Varietal info */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                        <div>
                          <span className="text-stone-400">Récolte :</span>{" "}
                          <span className="font-bold text-stone-700">{def.realDaysToHarvest} jours</span>
                        </div>
                        <div>
                          <span className="text-stone-400">Kc :</span>{" "}
                          <span className="font-bold text-stone-700">{def.cropCoefficient.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredPlants.length === 0 && (
        <div className="text-center py-8">
          <span className="text-3xl">🔍</span>
          <p className="text-sm font-bold text-stone-400 mt-2">Aucune variété trouvée</p>
          <p className="text-[10px] text-stone-400">
            Essayez un autre filtre ou terme de recherche
          </p>
        </div>
      )}
    </div>
  );
}