// ═══════════════════════════════════════════════════
//  AI Advisor — Proactive intelligent suggestions
// ═══════════════════════════════════════════════════

import type { PlantState, PlantDefinition } from "./ai-engine";
import type { RealWeatherData } from "./weather-service";
import { getLunarPhase, isLunarNodeDay } from "./lunar-calendar";

export interface AdvisorSuggestion {
  id: string;
  type: "plant" | "water" | "harvest" | "protect" | "soil" | "rotate" | "season";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  emoji: string;
  actionLabel?: string;
  actionData?: Record<string, unknown>;
  reason: string; // Why this suggestion is relevant
}

export interface AdvisorContext {
  day: number;
  season: string;
  realWeather: RealWeatherData | null;
  gardenPlants: { plantDefId: string; plant: PlantState; daysSincePlanting: number }[];
  pepinierePlants: { plantDefId: string; plant: PlantState }[];
  recentAlerts: { type: string; severity: string }[];
  coins: number;
}

// Get watering advice based on weather
export function getWateringAdvice(
  plants: { plantDefId: string; waterLevel: number; plant: PlantState }[],
  realWeather: RealWeatherData | null
): AdvisorSuggestion[] {
  const suggestions: AdvisorSuggestion[] = [];

  if (!realWeather) return suggestions;

  const { temperature, isRaining, humidity } = realWeather.current;

  // Check for hot weather - increase watering
  if (temperature > 28) {
    suggestions.push({
      id: "hot-weather-water",
      type: "water",
      priority: "high",
      title: "Canicule - Arrosage intensif",
      description: `Température ${temperature}°C. Vos plantes ont besoin d'un arrosage fréquent.`,
      emoji: "🌡️",
      actionLabel: "Arroser tout",
      reason: `La chaleur ${temperature}°C augmente l'évaporation`,
    });
  }

  // Check for rain - skip watering
  if (isRaining && humidity > 80) {
    suggestions.push({
      id: "rain-skip-water",
      type: "water",
      priority: "low",
      title: "Pluie prévue - Attendez",
      description: "Inutile d'arroser, la pluie va s'occuper de vos plantes.",
      emoji: "🌧️",
      reason: "Pluie et humidité élevée détectées",
    });
  }

  // Check plants with low water
  const thirstyPlants = plants.filter(p => p.waterLevel < 30);
  if (thirstyPlants.length > 0) {
    suggestions.push({
      id: "thirsty-plants",
      type: "water",
      priority: thirstyPlants.length > 3 ? "high" : "medium",
      title: `${thirstyPlants.length} plante(s) ont soif`,
      description: "Arrosez vos plantes assoiffées pour maintenir leur santé.",
      emoji: "💧",
      actionLabel: "Arroser",
      actionData: { plantIds: thirstyPlants.map(p => p.plantDefId) },
      reason: `${thirstyPlants.length} plantes avec niveau d'eau < 30%`,
    });
  }

  return suggestions;
}

// Get harvest advice
export function getHarvestAdvice(
  plants: { plantDefId: string; isHarvestable: boolean; plant: PlantState }[]
): AdvisorSuggestion[] {
  const suggestions: AdvisorSuggestion[] = [];

  const readyToHarvest = plants.filter(p => p.isHarvestable);
  if (readyToHarvest.length > 0) {
    suggestions.push({
      id: "ready-to-harvest",
      type: "harvest",
      priority: "high",
      title: `${readyToHarvest.length} récolte(s) prête(s) !`,
      description: "Récoltez vos plantes matures pour gagner des points et libérer de l'espace.",
      emoji: "🌾",
      actionLabel: "Récolter",
      reason: `${readyToHarvest.length} plantes harvestables`,
    });
  }

  // Check for overripe (past harvest window)
  const overripe = plants.filter(p => p.isHarvestable && p.plant.daysInCurrentStage > 10);
  if (overripe.length > 0) {
    suggestions.push({
      id: "overripe-warning",
      type: "harvest",
      priority: "critical",
      title: "Plantes trop mûres !",
      description: "Certaines plantes ont dépassé leur fenêtre de récolte optimale.",
      emoji: "⚠️",
      actionLabel: "Récolter immédiatement",
      reason: "Plantes harvestables depuis plus de 10 jours",
    });
  }

  return suggestions;
}

// Get season/weather protection advice
export function getProtectionAdvice(
  realWeather: RealWeatherData | null,
  gardenPlants: { plantDefId: string; inSerre: boolean }[]
): AdvisorSuggestion[] {
  const suggestions: AdvisorSuggestion[] = [];

  if (!realWeather) return suggestions;

  const { temperature } = realWeather.current;

  // Frost warning
  if (temperature <= 3) {
    const exposedPlants = gardenPlants.filter(p => !p.inSerre);
    if (exposedPlants.length > 0) {
      suggestions.push({
        id: "frost-warning",
        type: "protect",
        priority: "critical",
        title: "Risque de gel !",
        description: `Température ${temperature}°C. Protégez vos plantes sensibles au froid.`,
        emoji: "🥶",
        actionLabel: "Voir protections",
        reason: `Température ${temperature}°C - risque de gel`,
      });
    }
  }

  // Storm warning
  if (realWeather.current.weatherCode >= 95) {
    suggestions.push({
      id: "storm-warning",
      type: "protect",
      priority: "high",
      title: "Orage prévu",
      description: "Des vents forts et pluies intenses sont attendus.",
      emoji: "⛈️",
      reason: "Code météo orageux détecté",
    });
  }

  return suggestions;
}

// Get lunar calendar advice
export function getLunarAdvice(): AdvisorSuggestion[] {
  const suggestions: AdvisorSuggestion[] = [];

  const phase = getLunarPhase();
  const isNodeDay = isLunarNodeDay();

  if (isNodeDay) {
    suggestions.push({
      id: "lunar-node",
      type: "plant",
      priority: "medium",
      title: "Jour de nœud lunaire",
      description: "Évitez les semis et transplantations aujourd'hui (influence défavorable).",
      emoji: "🌑",
      reason: "Noeud lunaire détecté",
    });
  }

  if (phase.isGoodForPlanting) {
    suggestions.push({
      id: "good-planting-moon",
      type: "plant",
      priority: "low",
      title: `${phase.emoji} ${phase.name} - Favorable semis`,
      description: phase.gardeningAdvice,
      emoji: phase.emoji,
      reason: `Phase lunaire favorable: ${phase.name}`,
    });
  }

  if (phase.isGoodForRootHarvest) {
    suggestions.push({
      id: "good-root-harvest",
      type: "harvest",
      priority: "low",
      title: `${phase.emoji} Récolte des racines`,
      description: "La lune décroissante favorise la récolte des légumes-racines.",
      emoji: "🥕",
      reason: `Lune favorable aux racines: ${phase.name}`,
    });
  }

  return suggestions;
}

// Get crop rotation advice
export function getRotationAdvice(
  gardenHistory: { plantDefId: string; x: number; y: number; lastHarvest: number }[]
): AdvisorSuggestion[] {
  const suggestions: AdvisorSuggestion[] = [];

  // Group plants by family for rotation
  const plantFamilies: Record<string, string[]> = {
    "Solanacées": ["tomato", "pepper", "eggplant"],
    "Brassicacées": ["cabbage", "lettuce"],
    "Fabacées": ["bean", "strawberry"],
    "Apiacées": ["carrot"],
    "Cucurbitacées": ["cucumber", "zucchini", "squash"],
  };

  // Find current positions
  const currentPositions = new Map<string, string>(); // key: "x,y", value: family

  gardenHistory.forEach(entry => {
    const key = `${Math.floor(entry.x / 50)},${Math.floor(entry.y / 50)}`;
    for (const [family, plants] of Object.entries(plantFamilies)) {
      if (plants.includes(entry.plantDefId)) {
        const existing = currentPositions.get(key);
        if (existing && existing !== family) {
          // Same position, different family - rotation issue
          suggestions.push({
            id: `rotation-warning-${key}`,
            type: "rotate",
            priority: "medium",
            title: "Rotation conseillée",
            description: `Évitez de replanter ${family} au même endroit (précédant: ${existing}).`,
            emoji: "🔄",
            reason: `${family} après ${existing} sur même parcelle`,
          });
        }
        currentPositions.set(key, family);
      }
    }
  });

  return suggestions;
}

// Get planting suggestions based on season
export function getSeasonPlantingAdvice(season: string, day: number): AdvisorSuggestion[] {
  const suggestions: AdvisorSuggestion[] = [];

  const seasonalPlants: Record<string, { id: string; emoji: string; name: string }[]> = {
    spring: [
      { id: "carrot", emoji: "🥕", name: "Carotte" },
      { id: "lettuce", emoji: "🥬", name: "Laitue" },
      { id: "pea", emoji: "🫛", name: "Pois" },
    ],
    summer: [
      { id: "tomato", emoji: "🍅", name: "Tomate" },
      { id: "pepper", emoji: "🌶️", name: "Poivron" },
      { id: "zucchini", emoji: "🥒", name: "Courgette" },
    ],
    autumn: [
      { id: "carrot", emoji: "🥕", name: "Carotte" },
      { id: "lettuce", emoji: "🥬", name: "Laitue" },
      { id: "spinach", emoji: "🥬", name: "Épinard" },
    ],
    winter: [
      { id: "cabbage", emoji: "🥬", name: "Choux" },
      { id: "leek", emoji: "🧅", name: "Poireau" },
    ],
  };

  const plants = seasonalPlants[season] || [];
  if (plants.length > 0) {
    suggestions.push({
      id: "seasonal-planting",
      type: "plant",
      priority: "medium",
      title: `${season === "spring" ? "🌸" : season === "summer" ? "☀️" : season === "autumn" ? "🍂" : "❄️"} Plantes de ${season}`,
      description: `C'est le moment de semer: ${plants.map(p => `${p.emoji} ${p.name}`).join(", ")}.`,
      emoji: season === "spring" ? "🌸" : season === "summer" ? "☀️" : season === "autumn" ? "🍂" : "❄️",
      reason: `Saison ${season}, jour ${day}`,
    });
  }

  return suggestions;
}

// Main advisor function - combines all suggestions
export function getAdvisorSuggestions(context: AdvisorContext): AdvisorSuggestion[] {
  const allSuggestions: AdvisorSuggestion[] = [];

  // Watering advice
  allSuggestions.push(...getWateringAdvice(
    context.gardenPlants.map(p => ({
      plantDefId: p.plantDefId,
      waterLevel: p.plant.waterLevel ?? 50,
      plant: p.plant,
    })),
    context.realWeather
  ));

  // Harvest advice
  allSuggestions.push(...getHarvestAdvice(
    context.gardenPlants.map(p => ({
      plantDefId: p.plantDefId,
      isHarvestable: p.plant.isHarvestable,
      plant: p.plant,
    }))
  ));

  // Protection advice
  allSuggestions.push(...getProtectionAdvice(
    context.realWeather,
    context.gardenPlants.map(p => ({ plantDefId: p.plantDefId, inSerre: false }))
  ));

  // Lunar advice
  allSuggestions.push(...getLunarAdvice());

  // Season advice
  allSuggestions.push(...getSeasonPlantingAdvice(context.season, context.day));

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return allSuggestions;
}
