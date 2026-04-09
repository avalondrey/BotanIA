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
  const waterLiters = tank?.currentLevel ?? 0;
  const waterCapacity = tank?.capacity ?? 2000;

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

  // ─── Season / Calendar ─────────────────────────────────────────────────────

  const month = Math.floor((game.day % 365) / 30.4); // 0-11
  const seasonalTasks = getSeasonalTasks(month);

  if (seasonalTasks.length > 0 && Math.random() < 0.3) { // Only 30% chance each scan to not spam
    suggestions.push({
      category: 'calendar',
      title: `📅 Tâches de saison`,
      description: seasonalTasks[0],
      reasoning: `Mois ${month + 1}, saison: ${game.season}`,
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
function getSeasonalTasks(month: number): string[] {
  const tasks: string[] = [];

  // Spring (months 2-4: March-May)
  if (month >= 2 && month <= 4) {
    tasks.push('C\'est le moment de semer les tomates, poivrons, aubergines en intérieur');
    tasks.push('Prépare le sol pour les semis de printemps');
  }

  // Summer (months 5-7: June-August)
  if (month >= 5 && month <= 7) {
    tasks.push('Arrosage régulier indispensable en période de chaleur');
    tasks.push('Surveille les maladies cryptogamiques (mildiou, oïdium)');
  }

  // Fall (months 8-10: September-November)
  if (month >= 8 && month <= 10) {
    tasks.push('C\'est la saison des récoltes! Récolte avant les gelées');
    tasks.push('Commence à préparer le sol pour l\'hiver');
  }

  // Winter (months 11, 0, 1: December-February)
  if (month === 11 || month <= 1) {
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

  const snapshotId = `snapshot-${Date.now()}`;
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
    if (!store.status.isLocalAIActive) return;

    // Run analysis
    const { notifications, suggestions } = analyzeGameState();

    // Add to store
    notifications.forEach(n => store.addNotification(n));
    suggestions.forEach(s => store.addSuggestion(s));

    // Snapshot to Qdrant
    snapshotGameState().catch(console.warn);

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
  if (!store.status.isLocalAIActive) {
    console.warn('[ProactiveAgent] Cannot run — local AI not active');
    return;
  }

  const { notifications, suggestions } = analyzeGameState();
  notifications.forEach(n => store.addNotification(n));
  suggestions.forEach(s => store.addSuggestion(s));
  snapshotGameState().catch(console.warn);
}
