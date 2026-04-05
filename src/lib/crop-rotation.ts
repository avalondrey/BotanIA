// ═══════════════════════════════════════════════════
//  Crop Rotation System — Track and optimize garden plots
// ═══════════════════════════════════════════════════

export interface PlotHistory {
  x: number;
  y: number;
  width: number;
  height: number;
  history: PlotEntry[];
}

export interface PlotEntry {
  plantDefId: string;
  plantedDay: number;
  harvestedDay: number | null;
  yield: number;
  family: string; // Plant family for rotation
}

export interface RotationSuggestion {
  type: "good" | "neutral" | "bad";
  message: string;
  reason: string;
  emoji: string;
}

// Plant families for rotation planning
export const PLANT_FAMILIES: Record<string, string[]> = {
  "Solanacées": ["tomato", "pepper", "eggplant", "potato"],
  "Brassicacées": ["cabbage", "lettuce", "broccoli", "cauliflower"],
  "Fabacées": ["bean", "pea", "lentil", "strawberry"],
  "Apiacées": ["carrot", "parsley", "celery", "fennel"],
  "Cucurbitacées": ["cucumber", "zucchini", "squash", "melon", "pumpkin"],
  "Alliacées": ["onion", "garlic", "leek", "shallot"],
  "Astéracées": ["sunflower", "artichoke", "lettuce"],
  "Poacées": ["corn", "wheat", "rice"],
};

export function getPlantFamily(plantDefId: string): string {
  for (const [family, plants] of Object.entries(PLANT_FAMILIES)) {
    if (plants.includes(plantDefId)) {
      return family;
    }
  }
  return "Autres";
}

// Storage
const ROTATION_STORAGE_KEY = "botania-plot-history";

export function loadPlotHistory(): PlotHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ROTATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
}

export function savePlotHistory(history: PlotHistory[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROTATION_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

// Find or create plot at position
export function findOrCreatePlot(
  plots: PlotHistory[],
  x: number,
  y: number,
  width: number = 50,
  height: number = 50
): PlotHistory {
  const existing = plots.find(
    p => Math.abs(p.x - x) < width && Math.abs(p.y - y) < height
  );

  if (existing) return existing;

  const newPlot: PlotHistory = {
    x,
    y,
    width,
    height,
    history: [],
  };

  return newPlot;
}

// Record a planting in plot history
export function recordPlanting(
  plots: PlotHistory[],
  x: number,
  y: number,
  plantDefId: string,
  day: number
): PlotHistory[] {
  const newPlots = [...plots];
  const plot = findOrCreatePlot(newPlots, x, y);
  const plotIndex = newPlots.findIndex(p => p.x === plot.x && p.y === plot.y);

  const entry: PlotEntry = {
    plantDefId,
    plantedDay: day,
    harvestedDay: null,
    yield: 0,
    family: getPlantFamily(plantDefId),
  };

  if (plotIndex >= 0) {
    newPlots[plotIndex] = {
      ...newPlots[plotIndex],
      history: [...newPlots[plotIndex].history, entry],
    };
  } else {
    newPlots.push({
      ...plot,
      history: [entry],
    });
  }

  savePlotHistory(newPlots);
  return newPlots;
}

// Record a harvest in plot history
export function recordHarvest(
  plots: PlotHistory[],
  x: number,
  y: number,
  plantDefId: string,
  day: number,
  yield_?: number
): PlotHistory[] {
  const newPlots = [...plots];
  const plotIndex = newPlots.findIndex(
    p => Math.abs(p.x - x) < p.width && Math.abs(p.y - y) < p.height
  );

  if (plotIndex < 0) return plots;

  const plot = newPlots[plotIndex];
  const entryIndex = plot.history.findLastIndex(
    e => e.plantDefId === plantDefId && e.harvestedDay === null
  );

  if (entryIndex >= 0) {
    const newHistory = [...plot.history];
    newHistory[entryIndex] = {
      ...newHistory[entryIndex],
      harvestedDay: day,
      yield: yield_ || 0,
    };

    newPlots[plotIndex] = {
      ...plot,
      history: newHistory,
    };

    savePlotHistory(newPlots);
  }

  return newPlots;
}

// Check rotation compatibility
export function checkRotationCompatibility(
  currentFamily: string,
  previousFamily: string,
  seasonsSince: number
): RotationSuggestion {
  // Same family after less than 3 seasons = bad
  if (currentFamily === previousFamily) {
    if (seasonsSince < 1) {
      return {
        type: "bad",
        message: "Évitez de replanter la même famille",
        reason: `Même famille (${currentFamily}) sans pause. Attendez 2-3 saisons.`,
        emoji: "⚠️",
      };
    } else if (seasonsSince < 3) {
      return {
        type: "neutral",
        message: "Rotation courte",
        reason: `${currentFamily} après ${seasonsSince} saison(s). Idéal: 3+ saisons.`,
        emoji: "😐",
      };
    }
  }

  // Good rotations
  const goodRotations: Record<string, string[]> = {
    "Fabacées": ["Solanacées", "Brassicacées", "Cucurbitacées", "Astéracées"],
    "Solanacées": ["Fabacées", "Apiacées", "Alliacées"],
    "Brassicacées": ["Fabacées", "Cucurbitacées", "Solanacées"],
    "Cucurbitacées": ["Fabacées", "Solanacées", "Alliacées"],
    "Apiacées": ["Brassicacées", "Cucurbitacées", "Solanacées"],
    "Alliacées": ["Solanacées", "Cucurbitacées", "Fabacées"],
  };

  const goodFor = goodRotations[previousFamily] || [];
  if (goodFor.includes(currentFamily)) {
    return {
      type: "good",
      message: "Bonne rotation !",
      reason: `${currentFamily} suit bien ${previousFamily}.`,
      emoji: "✅",
    };
  }

  return {
    type: "neutral",
    message: "Rotation acceptable",
    reason: `${currentFamily} après ${previousFamily}.`,
    emoji: "👌",
  };
}

// Get rotation suggestion for a plot
export function getPlotRotationSuggestion(
  plot: PlotHistory,
  proposedPlantDefId: string,
  currentDay: number
): RotationSuggestion | null {
  if (plot.history.length === 0) return null;

  const proposedFamily = getPlantFamily(proposedPlantDefId);
  const lastEntry = plot.history[plot.history.length - 1];

  // Calculate seasons since last planting
  const daysSince = currentDay - lastEntry.plantedDay;
  const seasonsSince = Math.floor(daysSince / 90); // ~90 days per season

  return checkRotationCompatibility(proposedFamily, lastEntry.family, seasonsSince);
}

// Get all rotation issues in the garden
export function getGardenRotationIssues(
  plots: PlotHistory[],
  currentDay: number
): { plot: PlotHistory; suggestion: RotationSuggestion }[] {
  const issues: { plot: PlotHistory; suggestion: RotationSuggestion }[] = [];

  plots.forEach(plot => {
    if (plot.history.length < 2) return;

    const lastEntry = plot.history[plot.history.length - 1];
    if (lastEntry.harvestedDay === null) return; // Still growing

    const daysSince = currentDay - lastEntry.harvestedDay;
    if (daysSince > 180) return; // More than 6 months, assume replanted

    // Check if same family was planted without enough gap
    if (plot.history.length >= 2) {
      const secondLast = plot.history[plot.history.length - 2];
      if (
        lastEntry.family === secondLast.family &&
        lastEntry.harvestedDay !== null &&
        secondLast.harvestedDay !== null
      ) {
        const gap = lastEntry.harvestedDay - secondLast.harvestedDay;
        if (gap < 180) {
          // Less than 6 months gap
          issues.push({
            plot,
            suggestion: {
              type: "bad",
              message: `Rotation insuffisante: ${lastEntry.family}`,
              reason: `Même famille plantée avec seulement ${Math.floor(gap / 30)} mois d'écart.`,
              emoji: "⚠️",
            },
          });
        }
      }
    }
  });

  return issues;
}

// Calculate plot productivity stats
export function getPlotStats(plot: PlotHistory): {
  totalHarvests: number;
  averageYield: number;
  bestCrop: { plantDefId: string; yield: number } | null;
  mostGrownFamily: string;
} {
  const harvestedEntries = plot.history.filter(e => e.harvestedDay !== null && e.yield > 0);

  if (harvestedEntries.length === 0) {
    return {
      totalHarvests: 0,
      averageYield: 0,
      bestCrop: null,
      mostGrownFamily: plot.history[0]?.family || "Autres",
    };
  }

  const totalYield = harvestedEntries.reduce((sum, e) => sum + e.yield, 0);
  const avgYield = totalYield / harvestedEntries.length;

  const bestCrop = harvestedEntries.reduce(
    (best, e) => (e.yield > (best?.yield || 0) ? { plantDefId: e.plantDefId, yield: e.yield } : best),
    null as { plantDefId: string; yield: number } | null
  );

  // Count family occurrences
  const familyCounts: Record<string, number> = {};
  plot.history.forEach(e => {
    familyCounts[e.family] = (familyCounts[e.family] || 0) + 1;
  });

  const mostGrownFamily = Object.entries(familyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Autres";

  return {
    totalHarvests: harvestedEntries.length,
    averageYield: Math.round(avgYield * 10) / 10,
    bestCrop,
    mostGrownFamily,
  };
}
