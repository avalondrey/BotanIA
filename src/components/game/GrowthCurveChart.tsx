"use client";

/**
 * GrowthCurveChart — Courbe de croissance sigmoïdale (GDD)
 *
 * Visualisation de la progression de croissance basée sur les
 * Growing Degree Days (GDD) accumulés. Utilise une courbe
 * logistique pour représenter la transition entre stades.
 *
 * Source : FAO-56, données PLANT_GDD (HologramEvolution)
 */
import { useMemo } from "react";
import { PLANT_GDD } from "@/lib/gdd-engine";
import { getPlantDisplay } from "@/lib/plant-db";

interface GrowthCurveChartProps {
  plantDefId: string;
  currentStage: number;
  gddAccumulated: number;
  className?: string;
}

const STAGE_LABELS = ["Graine", "Levée", "Croissance", "Maturité"];
const STAGE_COLORS = ["#94a3b8", "#86efac", "#4ade80", "#f97316"];

/**
 * Fonction sigmoïde logistique pour la progression intra-stade.
 * k = 0.008 contrôle la pente (progression douce)
 */
function sigmoid(x: number, k: number = 0.008): number {
  return 1 / (1 + Math.exp(-k * (x - 500)));
}

/**
 * Calcule les points de la courbe de croissance pour le SVG.
 */
function computeGrowthPoints(
  stageGDD: [number, number, number, number],
  totalGDD: number,
  width: number,
  height: number,
  padding: number
): { x: number; y: number; stage: number }[] {
  const points: { x: number; y: number; stage: number }[] = [];
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const gdd = (i / steps) * totalGDD;
    let progress = 0;
    let stageIdx = 0;

    // Determine which stage and intra-stage progress
    let cumulativeGDD = 0;
    for (let s = 0; s < stageGDD.length; s++) {
      if (gdd >= cumulativeGDD + stageGDD[s]) {
        cumulativeGDD += stageGDD[s];
        progress = (s + 1) / stageGDD.length;
        stageIdx = s;
      } else {
        const intraProgress = (gdd - cumulativeGDD) / stageGDD[s];
        // Apply sigmoid for smoother transition
        const smoothed = sigmoid(intraProgress * 1000, 0.01);
        progress = (s + smoothed) / stageGDD.length;
        stageIdx = s;
        break;
      }
    }

    const x = padding + (gdd / totalGDD) * chartWidth;
    const y = padding + chartHeight - progress * chartHeight;

    points.push({ x, y, stage: stageIdx });
  }

  return points;
}

export function GrowthCurveChart({
  plantDefId,
  currentStage,
  gddAccumulated,
  className,
}: GrowthCurveChartProps) {
  const config = PLANT_GDD[plantDefId];
  const display = getPlantDisplay(plantDefId);

  const chartData = useMemo(() => {
    if (!config) return null;

    const totalGDD = config.stageGDD.reduce((a, b) => a + b, 0);
    const width = 320;
    const height = 160;
    const padding = 30;

    const points = computeGrowthPoints(config.stageGDD, totalGDD, width, height, padding);

    // Current position on the curve
    const currentGDDPct = Math.min(1, gddAccumulated / totalGDD);
    const currentX = padding + currentGDDPct * (width - 2 * padding);

    // Calculate progress at current GDD
    let currentProgress = 0;
    let cumulativeGDD = 0;
    for (let s = 0; s < config.stageGDD.length; s++) {
      if (gddAccumulated >= cumulativeGDD + config.stageGDD[s]) {
        cumulativeGDD += config.stageGDD[s];
        currentProgress = (s + 1) / config.stageGDD.length;
      } else {
        const intraProgress = (gddAccumulated - cumulativeGDD) / config.stageGDD[s];
        const smoothed = sigmoid(intraProgress * 1000, 0.01);
        currentProgress = (s + smoothed) / config.stageGDD.length;
        break;
      }
    }
    const currentY = padding + (height - 2 * padding) - currentProgress * (height - 2 * padding);

    // Stage boundary X positions
    const stageBoundaries: { x: number; label: string; color: string }[] = [];
    let cumGDD = 0;
    for (let s = 0; s < config.stageGDD.length; s++) {
      cumGDD += config.stageGDD[s];
      const x = padding + (cumGDD / totalGDD) * (width - 2 * padding);
      stageBoundaries.push({
        x,
        label: STAGE_LABELS[s] || `Stade ${s + 1}`,
        color: STAGE_COLORS[s] || "#888",
      });
    }

    return { points, currentX, currentY, totalGDD, width, height, padding, stageBoundaries };
  }, [config, gddAccumulated, currentStage]);

  if (!config || !chartData) {
    return (
      <div className={`p-3 bg-stone-50 rounded-xl text-center text-stone-400 text-xs ${className ?? ""}`}>
        Données de croissance non disponibles
      </div>
    );
  }

  const { points, currentX, currentY, totalGDD, width, height, padding, stageBoundaries } = chartData;

  // Build SVG path
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // Build area under curve
  const areaD = pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(height - padding).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(height - padding).toFixed(1)} Z`;

  return (
    <div className={className ?? ""}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{display.emoji}</span>
        <span className="text-[11px] font-black text-stone-700">{display.name}</span>
        <span className="text-[9px] text-stone-400 ml-auto">
          GDD: {gddAccumulated}/{totalGDD}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1={padding}
            y1={padding + (1 - pct) * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + (1 - pct) * (height - 2 * padding)}
            stroke="#e5e7eb"
            strokeDasharray="3,3"
            strokeWidth="0.5"
          />
        ))}

        {/* Stage boundaries */}
        {stageBoundaries.map((b, i) => (
          <g key={i}>
            <line
              x1={b.x}
              y1={padding}
              x2={b.x}
              y2={height - padding}
              stroke={b.color}
              strokeDasharray="4,4"
              strokeWidth="0.8"
              opacity="0.5"
            />
            <text
              x={b.x}
              y={height - padding + 12}
              textAnchor="middle"
              fill={b.color}
              fontSize="7"
              fontWeight="bold"
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* Area under curve */}
        <path d={areaD} fill="url(#growthGradient)" opacity="0.3" />

        {/* Curve line */}
        <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />

        {/* Current position marker */}
        <circle cx={currentX} cy={currentY} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />

        {/* Y-axis labels */}
        <text x={padding - 3} y={padding + 4} textAnchor="end" fill="#9ca3af" fontSize="7">100%</text>
        <text x={padding - 3} y={height - padding + 3} textAnchor="end" fill="#9ca3af" fontSize="7">0%</text>
        <text x={padding - 3} y={(padding + height - 2 * padding) / 2 + 3} textAnchor="end" fill="#9ca3af" fontSize="7">50%</text>

        {/* X-axis labels */}
        <text x={padding} y={height - 4} textAnchor="start" fill="#9ca3af" fontSize="7">0</text>
        <text x={width - padding} y={height - 4} textAnchor="end" fill="#9ca3af" fontSize="7">{totalGDD} GDD</text>

        {/* Gradient definition */}
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stage legend */}
      <div className="flex gap-2 mt-1">
        {STAGE_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[i] }} />
            <span className="text-[8px] text-stone-500 font-bold">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[8px] text-stone-500 font-bold">Actuel</span>
        </div>
      </div>
    </div>
  );
}