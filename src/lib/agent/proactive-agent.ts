/**
 * Proactive Agent — BotanIA
 *
 * Runs in background, scans game state and sends notifications/suggestions
 * BEFORE the user asks — Lia takes initiative.
 *
 * Runs every N seconds (configurable) or can be triggered manually.
 */

import { upsertPoint } from './qdrant';
import { generateEmbedding } from './ollama';
import { useAgentStore, type AgentNotification, type AgentSuggestion } from '@/store/agent-store';
import { useGameStore } from '@/store/game-store';
import { PLANTS } from '@/lib/ai-engine';
import type { GameStateSnapshot } from './persona';

// ─── Thresholds ───────────────────────────────────────────────────────────────

const WATER_CRITICAL_LITERS = 300;
const WATER_URGENT_LITERS = 600;
const SCAN_INTERVAL_MS = 60_000; // 1 minute

let scanInterval: NodeJS.Timeout | null = null;

/**
 * Analyze current game state and generate proactive notifications/suggestions
 */
export function analyzeGameState(): {
  notifications: Omit<AgentNotification, 'id' | 'timestamp' | 'read'>[];
  suggestions: Omit<AgentSuggestion, 'id' | 'timestamp'>[];
} {
  const game = useGameStore.getState();
  const notifications: Omit<AgentNotification, 'id' | 'timestamp' | 'read'>[] = [];
  const suggestions: Omit<AgentSuggestion, 'id' | 'timestamp'>[] = [];

  // ─── Water Analysis ────────────────────────────────────────────────────────

  const tank = game.gardenTanks?.[0];
  if (!tank) {
    // No tank placed yet — skip water analysis
  } else {
    const waterLiters = tank.currentLevel ?? 0;
    const waterCapacity = tank.capacity ?? 2000;

    if (waterLiters < WATER_CRITICAL_LITERS) {
      notifications.push({
        type: 'alert',
        title: '💧 Cuve presque vide!',
        message: `Il ne reste que ${waterLiters}L dans ta cuve principale. Arrosage compromis si pas de pluie!`,
        priority: 'critical',
      });
    } else if (waterLiters < WATER_URGENT_LITERS) {
      suggestions.push({
        category: 'water',
        title: 'Cuve principale basse',
        description: `Cuve à ${waterLiters}L/${waterCapacity}L. Prévois un remplissage bientôt.`,
        reasoning: 'En dessous du seuil de 600L, urgence modérée',
        priority: 'high',
      });
    }
  }

  // ─── Plant Water Needs ──────────────────────────────────────────────────────

  const thirstyPlants = (game.gardenPlants || []).filter(p => p.plant?.needsWater);
  if (thirstyPlants.length > 0) {
    const plantNames = thirstyPlants.map(p => p.plantDefId).slice(0, 5).join(', ');
    const extra = thirstyPlants.length > 5 ? ` et ${thirstyPlants.length - 5} autres` : '';

    if (thirstyPlants.length >= 5) {
      notifications.push({
        type: 'alert',
        title: `🌱 ${thirstyPlants.length} plantes ont soif!`,
        message: `Tes plantes réclament de l'eau: ${plantNames}${extra}. Passe les arroser!`,
        priority: 'high',
      });
    } else {
      suggestions.push({
        category: 'water',
        title: 'Plantes assoiffées',
        description: `${thirstyPlants.length} plantes${thirstyPlants.length > 1 ? ' ont' : ' a'} besoin d'eau: ${plantNames}${extra}`,
        reasoning: 'needsWater = true détecté dans le state',
        priority: 'medium',
      });
    }
  }

  // ─── Harvestable Plants ─────────────────────────────────────────────────────

  const harvestable = (game.gardenPlants || []).filter(p => p.plant?.isHarvestable);
  if (harvestable.length > 0) {
    suggestions.push({
      category: 'harvest',
      title: '⚡ Récoltes prêtes!',
      description: `${harvestable.length} plantes sont prêtes: ${harvestable.map(p => p.plantDefId).join(', ')}`,
      reasoning: 'isHarvestable = true, ne pas attendre trop longtemps',
      priority: harvestable.length > 3 ? 'high' : 'medium',
    });
  }

  // ─── Disease Detection ─────────────────────────────────────────────────────

  const diseased = (game.gardenPlants || []).filter(p => p.plant?.hasDisease);
  if (diseased.length > 0) {
    notifications.push({
      type: 'alert',
      title: '🦠 Plante malade détectée!',
      message: `${diseased.length} plante(s) malade(s): ${diseased.map(p => p.plantDefId).join(', ')}. Consulte l'onglet Maladies pour traiter.`,
      priority: 'critical',
    });
  }

  // ─── Weather-Dependent Alerts ───────────────────────────────────────────────

  const weatherType = (game.weather as { type?: string }).type;
  const temperature = (game.realWeather as { current?: { temperature?: number } } | null)?.current?.temperature ?? 20;

  if (weatherType === 'heatwave' || temperature >= 32) {
    const heatThirsty = (game.gardenPlants || []).filter(p => p.plant && (p.plant.waterLevel || 0) < 40);
    if (heatThirsty.length > 0) {
      notifications.push({
        type: 'alert',
        title: '🔥 Canicule détectée!',
        message: `${heatThirsty.length} plante(s) stressée(s) par la chaleur. Arrose immédiatement pour éviter le flétrissement.`,
        priority: 'critical',
      });
    }
  }

  if (weatherType === 'frost' || temperature <= 0) {
    const frostSensitive = (game.gardenPlants || []).filter(p => {
      const plantDef = PLANTS[p.plantDefId];
      if (!plantDef) return false;
      const minTemp = plantDef.optimalTemp?.[0] ?? 5;
      return minTemp > 0 && (p.plant?.waterLevel || 0) < 50;
    });
    if (frostSensitive.length > 0) {
      notifications.push({
        type: 'alert',
        title: '❄️ Risque de gel!',
        message: `${frostSensitive.length} plante(s) sensible(s) au gel. Arrose ou protège-les avant la nuit.`,
        priority: 'high',
      });
    }
  }

  if (weatherType === 'stormy') {
    const readyToHarvest = (game.gardenPlants || []).filter(p => p.plant?.isHarvestable);
    if (readyToHarvest.length > 0) {
      suggestions.push({
        category: 'harvest',
        title: '⛈️ Orage imminent',
        description: `${readyToHarvest.length} plante(s) prête(s) à récolter. Récolte avant l'orage pour éviter les dégâts!`,
        reasoning: 'Météo orageuse + récoltes matures = risque de perte',
        priority: 'high',
      });
    }
  }

  if (weatherType === 'rainy') {
    suggestions.push({
      category: 'plant',
      title: '🌧️ Bon moment pour planter',
      description: 'La pluie est prévue — c\'est le moment idéal pour semer ou transplanter sans stress hydrique.',
      reasoning: 'Pluie naturelle = arrosage gratuit et bonne reprise racinaire',
      priority: 'medium',
    });
  }

  // ─── Growth Stage Alerts (GDD-based) ───────────────────────────────────────

  const nearingStage = (game.gardenPlants || []).filter(p => {
    if (!p.plant) return false;
    const stage = p.plant.stage ?? 0;
    const progress = p.plant.growthProgress ?? 0;
    return stage < 4 && progress >= 0.85;
  });
  if (nearingStage.length > 0) {
    suggestions.push({
      category: 'plant',
      title: '📈 Plantes en transition',
      description: `${nearingStage.length} plante(s) approchent du stade suivant. Vérifie leurs besoins en eau et lumière.`,
      reasoning: 'growthProgress > 85% — stade suivant imminent',
      priority: 'low',
    });
  }

  // ─── Missing Sprites Detection ─────────────────────────────────────────────
  // Real sprite detection happens client-side in GardenPlanView via img onError
  // Here we read from the agent store which is populated by GardenPlanView
  const store = useAgentStore.getState();
  const realMissingSprites = [...store.missingSprites];

  for (const plantDefId of realMissingSprites) {
    suggestions.push({
      category: 'purchase',
      title: `🖼️ Sprite manquant: ${plantDefId}`,
      description: `Le sprite pour ${plantDefId} n'a pas été trouvé. Clique sur "Générer le sprite" dans l'onglet Tâches de Lia.`,
      reasoning: 'Image non trouvée via onError dans GardenPlanView',
      priority: 'medium',
    });
  }

  // ─── Season / Calendar ─────────────────────────────────────────────────────
  // day 0 = spring start (day 0-59 spring, 60-151 summer, 152-243 fall, 244-364 winter)
  const SPRING_START = 0;
  const SPRING_END = 60;
  const SUMMER_END = 152;
  const FALL_END = 244;
  const WINTER_END = 365;

  const dayOfYear = game.day % 365;
  let seasonName: string;
  if (dayOfYear < SPRING_END) {
    seasonName = 'printemps';
  } else if (dayOfYear < SUMMER_END) {
    seasonName = 'été';
  } else if (dayOfYear < FALL_END) {
    seasonName = 'automne';
  } else {
    seasonName = 'hiver';
  }

  const seasonalTasks = getSeasonalTasks(dayOfYear);

  if (seasonalTasks.length > 0 && Math.random() < 0.3) { // Only 30% chance each scan to not spam
    suggestions.push({
      category: 'calendar',
      title: `📅 Tâches de saison`,
      description: seasonalTasks[0],
      reasoning: `Saison: ${seasonName}, jour ${game.day % 365}/365`,
      priority: 'low',
    });
  }

  // ─── Moon Phase (if lunar calendar data available) ─────────────────────────

  // This would integrate with lunar-calendar.ts if available

  return { notifications, suggestions };
}

/**
 * Get seasonal tasks based on month
 */
function getSeasonalTasks(dayOfYear: number): string[] {
  const tasks: string[] = [];

  // Spring: day 0-59
  if (dayOfYear < 60) {
    tasks.push('C\'est le moment de semer les tomates, poivrons, aubergines en intérieur');
    tasks.push('Prépare le sol pour les semis de printemps');
  }
  // Summer: day 60-151
  else if (dayOfYear < 152) {
    tasks.push('Arrosage régulier indispensable en période de chaleur');
    tasks.push('Surveille les maladies cryptogamiques (mildiou, oïdium)');
  }
  // Fall: day 152-243
  else if (dayOfYear < 244) {
    tasks.push('C\'est la saison des récoltes! Récolte avant les gelées');
    tasks.push('Commence à préparer le sol pour l\'hiver');
  }
  // Winter: day 244-364
  else {
    tasks.push('Taille des arbres fruitiers avant la reprise de sève');
    tasks.push('Planifie les rotations de cultures pour la prochaine saison');
  }

  return tasks;
}

// ─── Snapshot Game State to Qdrant ───────────────────────────────────────────

/**
 * Take a snapshot of current game state and store in Qdrant
 */
export async function snapshotGameState(): Promise<void> {
  const game = useGameStore.getState();

  const tank = game.gardenTanks?.[0];
  const waterLiters = tank?.currentLevel ?? 0;
  const waterCapacity = tank?.capacity ?? 2000;

  const plants = (game.gardenPlants || []).map(p => ({
    plantDefId: p.plantDefId,
    zone: `(${p.x},${p.y})`,
    stage: p.plant?.stage ?? 0,
    needsWater: p.plant?.needsWater ?? false,
    isHarvestable: p.plant?.isHarvestable ?? false,
  }));

  const pendingTasks: string[] = [];
  if (plants.some(p => p.needsWater)) pendingTasks.push('arrosage');
  if (plants.some(p => p.isHarvestable)) pendingTasks.push('recolte');

  const snapshot: GameStateSnapshot = {
    day: game.day,
    season: game.season,
    weatherCondition: (game.weather as { type?: string }).type || 'unknown',
    temperatureCelsius: (game.realWeather as { current?: { temperature?: number } } | null)?.current?.temperature ?? 20,
    waterLiters,
    waterCapacity,
    waterUrgency: waterLiters < WATER_CRITICAL_LITERS ? 'critique'
      : waterLiters < WATER_URGENT_LITERS ? 'urgent'
      : 'ok',
    plants,
    pendingTasks,
    activeAlerts: (game.alerts || []).map(a => ({
      type: a.type || 'info',
      message: a.message || String(a),
      severity: 'medium',
    })),
  };

  const snapshotId = Date.now(); // numeric ID required by Qdrant
  const searchableText = buildSnapshotText(snapshot);

  try {
    const vector = await generateEmbedding(searchableText);
    await upsertPoint('botania_game_state', snapshotId, vector, {
      ...snapshot,
      _snapshotId: snapshotId,
      _createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('[ProactiveAgent] Failed to snapshot game state:', err);
  }
}

/**
 * Build searchable text from game state snapshot
 */
function buildSnapshotText(s: GameStateSnapshot): string {
  const parts: string[] = [];

  parts.push(`Jour ${s.day}, ${s.season}, ${s.weatherCondition}, ${s.temperatureCelsius}°C`);
  parts.push(`Eau: ${s.waterLiters}L/${s.waterCapacity}L — ${s.waterUrgency}`);

  if (s.plants && s.plants.length > 0) {
    const thirsty = s.plants.filter(p => p.needsWater);
    const harvestable = s.plants.filter(p => p.isHarvestable);

    parts.push(`Plantes: ${s.plants.length} total`);
    if (thirsty.length > 0) parts.push(`assoiffées: ${thirsty.map(p => p.plantDefId).join(', ')}`);
    if (harvestable.length > 0) parts.push(`récoltables: ${harvestable.map(p => p.plantDefId).join(', ')}`);
  }

  return parts.join('\n');
}

// ─── Start / Stop ─────────────────────────────────────────────────────────────

/**
 * Start the proactive agent background loop
 */
export function startProactiveAgent(intervalMs: number = SCAN_INTERVAL_MS): void {
  if (scanInterval) {
    clearInterval(scanInterval);
  }

  scanInterval = setInterval(() => {
    const store = useAgentStore.getState();

    // Local analysis always runs (no AI required — pure game-state inspection)
    const { notifications, suggestions } = analyzeGameState();
    notifications.forEach(n => store.addNotification(n));
    suggestions.forEach(s => store.addSuggestion(s));

    // AI snapshot only when local AI is active AND available
    if (store.status.isLocalAIActive && store.status.canUseLocalAI) {
      snapshotGameState().catch(console.warn);
    }

  }, intervalMs);

  console.log(`[ProactiveAgent] Started with ${intervalMs}ms interval`);
}

/**
 * Stop the proactive agent
 */
export function stopProactiveAgent(): void {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
    console.log('[ProactiveAgent] Stopped');
  }
}

/**
 * Run a single proactive scan (manual trigger)
 */
export function runProactiveScanNow(): void {
  const store = useAgentStore.getState();

  const { notifications, suggestions } = analyzeGameState();
  notifications.forEach(n => store.addNotification(n));
  suggestions.forEach(s => store.addSuggestion(s));

  if (store.status.isLocalAIActive && store.status.canUseLocalAI) {
    snapshotGameState().catch(console.warn);
  }
}
