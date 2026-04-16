"use client";

/**
 * PlantStatCard — Carte statistique synthétique pour une plante
 *
 * Affiche les infos clés en un coup d'œil :
 * - Nom, emoji, stade actuel
 * - Besoins en eau, lumière, température
 * - Résistances (maladie, ravageurs, sécheresse)
 * - Compagnonnage rapide
 * - Calendrier de plantation optimal
 */
import { motion } from "framer-motion";
import { getPlantDef, getPlantDisplay } from "@/lib/plant-db";
import { Droplets, Sun, Thermometer, Shield, Bug, CloudRain, Calendar } from "lucide-react";

interface PlantStatCardProps {
  plantDefId: string;
  /** Show compact version (no calendar) */
  compact?: boolean;
  /** Current growth stage 0-6 */
  stage?: number;
  /** Click handler */
  onClick?: () => void;
}

const SEASON_LABELS: Record<string, { emoji: string; label: string }> = {
  spring: { emoji: "🌸", label: "Printemps" },
  summer: { emoji: "☀️", label: "Été" },
  autumn: { emoji: "🍂", label: "Automne" },
  winter: { emoji: "❄️", label: "Hiver" },
};

const MONTH_NAMES = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

function ResistanceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-[9px] font-bold text-stone-500 w-6 text-right">{value}%</span>
    </div>
  );
}

export function PlantStatCard({ plantDefId, compact = false, stage, onClick }: PlantStatCardProps) {
  const plantDef = getPlantDef(plantDefId);
  const display = getPlantDisplay(plantDefId);

  if (!plantDef) {
    return (
      <div className="p-3 bg-stone-50 rounded-xl border-2 border-stone-200 text-center">
        <span className="text-sm text-stone-400">Plante inconnue</span>
      </div>
    );
  }

  const tempRange = plantDef.optimalTemp;
  const waterLevel = plantDef.waterNeed;
  const lightHours = plantDef.lightNeed;

  // Water need label
  const waterLabel = waterLevel <= 3 ? "Faible" : waterLevel <= 5 ? "Modéré" : waterLevel <= 7 ? "Élevé" : "Très élevé";
  const waterColor = waterLevel <= 3 ? "#86efac" : waterLevel <= 5 ? "#5eead4" : waterLevel <= 7 ? "#fbbf24" : "#ef4444";

  // Light need label
  const lightLabel = lightHours <= 4 ? "Ombre" : lightHours <= 6 ? "Mi-ombre" : lightHours <= 8 ? "Soleil" : "Plein soleil";

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`p-3 bg-white border-2 border-stone-200 rounded-xl shadow-[3px_3px_0_0_#000]
        ${onClick ? "cursor-pointer hover:border-green-400" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{display.emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-stone-800 truncate">{display.name}</h4>
          {stage !== undefined && (
            <span className="text-[9px] text-stone-400 font-bold">Stade {stage}/6</span>
          )}
        </div>
        <div className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200">
          {plantDef.realDaysToHarvest}j
        </div>
      </div>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2">
        {/* Temperature */}
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="text-[10px] text-stone-600">
            {tempRange[0]}°C – {tempRange[1]}°C
          </span>
        </div>

        {/* Water */}
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 shrink-0" style={{ color: waterColor }} />
          <span className="text-[10px] text-stone-600">{waterLabel} ({waterLevel}mm/j)</span>
        </div>

        {/* Light */}
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="text-[10px] text-stone-600">{lightLabel} ({lightHours}h)</span>
        </div>

        {/* Kc */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] shrink-0">🌊</span>
          <span className="text-[10px] text-stone-600">
            Kc {plantDef.cropCoefficient.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Resistance bars */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-green-500 shrink-0" />
          <span className="text-[9px] font-bold text-stone-500 w-12">Maladie</span>
          <div className="flex-1">
            <ResistanceBar value={plantDef.diseaseResistance} color="#22c55e" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Bug className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[9px] font-bold text-stone-500 w-12">Ravageurs</span>
          <div className="flex-1">
            <ResistanceBar value={plantDef.pestResistance} color="#f59e0b" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <CloudRain className="w-3 h-3 text-blue-500 shrink-0" />
          <span className="text-[9px] font-bold text-stone-500 w-12">Sécheresse</span>
          <div className="flex-1">
            <ResistanceBar value={Math.round(plantDef.droughtResistance * 100)} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* Planting calendar (non-compact) */}
      {!compact && plantDef.optimalPlantMonths.length > 0 && (
        <div className="border-t border-stone-100 pt-2">
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-stone-400" />
            <span className="text-[9px] font-bold text-stone-500 uppercase">Calendrier</span>
          </div>
          <div className="flex gap-0.5">
            {MONTH_NAMES.map((name, i) => {
              const isOptimal = plantDef.optimalPlantMonths.includes(i + 1);
              return (
                <div
                  key={i}
                  className={`flex-1 text-center text-[7px] font-bold py-0.5 rounded
                    ${isOptimal
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-stone-50 text-stone-300 border border-transparent"
                    }`}
                >
                  {name}
                </div>
              );
            })}
          </div>
          {/* Season tags */}
          <div className="flex gap-1 mt-1">
            {plantDef.optimalSeasons.map((season) => {
              const info = SEASON_LABELS[season];
              return info ? (
                <span
                  key={season}
                  className="text-[8px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full border border-green-200"
                >
                  {info.emoji} {info.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}