// ═══════════════════════════════════════════════════════════
//  📓 Garden Journal — Journal de Bord Automatique
//  Génère un fichier .md avec toutes les actions du joueur
//  Utilise localStorage pour la persistance
// ═══════════════════════════════════════════════════════════

export type JournalActionType =
  | 'planting'
  | 'watering'
  | 'harvest'
  | 'sale'
  | 'quest_completed'
  | 'daily_bonus'
  | 'disease_treated'
  | 'fertilizer_added'
  | 'plant_died'
  | 'weather_alert'
  | 'garden_expanded'
  | 'seed_bought'
  | 'tree_planted'
  | 'hedge_trimmed'
  | 'tank_filled';

export interface JournalEntry {
  id: string;
  timestamp: string; // ISO
  type: JournalActionType;
  /** Résumé en une ligne */
  summary: string;
  /** Détails optionnels */
  detail?: string;
  /** Données structurées additionnelles */
  data?: Record<string, string | number | boolean>;
  /** Météo au moment de l'action (si disponible) */
  weather?: {
    temp: number;
    description: string;
    emoji: string;
  };
  /** Plante concernée (si applicable) */
  plantDefId?: string;
  /** Quantité (si applicable) */
  quantity?: number;
  /** Monnaie gagnée/perdue (si applicable) */
  coins?: number;
}

interface JournalState {
  entries: JournalEntry[];
  lastExportDate: string;
  growingSeason: string; // e.g. "2026"
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const JOURNAL_KEY = 'botania-garden-journal';
const SEASON_KEY = 'botania-journal-season';

function getYear(): string {
  return new Date().getFullYear().toString();
}

function loadState(): JournalState {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return defaultState();
    const state = JSON.parse(raw) as JournalState;
    // Reset si nouvelle saison
    if (state.growingSeason !== getYear()) {
      return { ...defaultState(), growingSeason: getYear() };
    }
    return state;
  } catch {
    return defaultState();
  }
}

function saveState(state: JournalState): void {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(state));
  } catch {}
}

function defaultState(): JournalState {
  return { entries: [], lastExportDate: '', growingSeason: getYear() };
}

// ─── Entry Creation ───────────────────────────────────────────────────────────

function generateId(): string {
  return `jnl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Ajoute une entrée au journal.
 */
export function addJournalEntry(
  type: JournalActionType,
  summary: string,
  options: {
    detail?: string;
    data?: Record<string, string | number | boolean>;
    weather?: JournalEntry['weather'];
    plantDefId?: string;
    quantity?: number;
    coins?: number;
  } = {}
): JournalEntry {
  const state = loadState();
  const entry: JournalEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    type,
    summary,
    detail: options.detail,
    data: options.data,
    weather: options.weather,
    plantDefId: options.plantDefId,
    quantity: options.quantity,
    coins: options.coins,
  };

  state.entries.unshift(entry); // newest first

  // Garder max 5000 entrées par saison
  if (state.entries.length > 5000) {
    state.entries = state.entries.slice(0, 5000);
  }

  saveState(state);
  return entry;
}

/**
 * Supprime une entrée par ID.
 */
export function removeJournalEntry(id: string): void {
  const state = loadState();
  state.entries = state.entries.filter(e => e.id !== id);
  saveState(state);
}

/**
 * Efface tout le journal.
 */
export function clearJournal(): void {
  saveState({ ...defaultState() });
}

// ─── Query ───────────────────────────────────────────────────────────────────

/**
 * Retourne toutes les entrées, triées (défaut: plus récentes).
 */
export function getJournalEntries(options: {
  type?: JournalActionType;
  plantDefId?: string;
  limit?: number;
  offset?: number;
} = {}): JournalEntry[] {
  const state = loadState();
  let entries = state.entries;

  if (options.type) {
    entries = entries.filter(e => e.type === options.type);
  }
  if (options.plantDefId) {
    entries = entries.filter(e => e.plantDefId === options.plantDefId);
  }

  const offset = options.offset ?? 0;
  const limit = options.limit ?? entries.length;
  return entries.slice(offset, offset + limit);
}

/**
 * Nombre total d'entrées.
 */
export function getJournalCount(): number {
  return loadState().entries.length;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface JournalStats {
  totalEntries: number;
  byType: Record<JournalActionType, number>;
  totalHarvests: number;
  totalSales: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  plantsGrown: Set<string>;
  firstEntry: string | null;
  lastEntry: string | null;
}

export function getJournalStats(): JournalStats {
  const state = loadState();
  const byType: Record<JournalActionType, number> = {} as Record<JournalActionType, number>;
  let totalHarvests = 0;
  let totalSales = 0;
  let totalCoinsEarned = 0;
  let totalCoinsSpent = 0;
  const plantsGrown = new Set<string>();

  for (const entry of state.entries) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;

    if (entry.type === 'harvest') totalHarvests++;
    if (entry.type === 'sale') totalSales++;
    if (entry.coins) {
      if (entry.coins > 0) totalCoinsEarned += entry.coins;
      else totalCoinsSpent += Math.abs(entry.coins);
    }
    if (entry.plantDefId && (entry.type === 'planting' || entry.type === 'harvest')) {
      plantsGrown.add(entry.plantDefId);
    }
  }

  return {
    totalEntries: state.entries.length,
    byType,
    totalHarvests,
    totalSales,
    totalCoinsEarned,
    totalCoinsSpent,
    plantsGrown,
    firstEntry: state.entries.length > 0 ? state.entries[state.entries.length - 1].timestamp : null,
    lastEntry: state.entries.length > 0 ? state.entries[0].timestamp : null,
  };
}

// ─── Markdown Export ──────────────────────────────────────────────────────────

function escapeMd(text: string): string {
  return text.replace(/[#*_`~\[\]]/g, c => `\\${c}`);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function typeEmoji(type: JournalActionType): string {
  const map: Record<JournalActionType, string> = {
    planting: '🌱', watering: '💧', harvest: '🧺', sale: '💰',
    quest_completed: '🏆', daily_bonus: '🎁', disease_treated: '💊',
    fertilizer_added: '🌿', plant_died: '💀', weather_alert: '🌦️',
    garden_expanded: '📐', seed_bought: '🛒', tree_planted: '🌳',
    hedge_trimmed: '✂️', tank_filled: '🪣',
  };
  return map[type] || '📝';
}

function typeLabel(type: JournalActionType): string {
  const map: Record<JournalActionType, string> = {
    planting: 'Semis/Plantation', watering: 'Arrosage', harvest: 'Récolte',
    sale: 'Vente', quest_completed: 'Quête complétée', daily_bonus: 'Bonus quotidien',
    disease_treated: 'Traitement', fertilizer_added: 'Fertilisation',
    plant_died: 'Plante perdue', weather_alert: 'Alerte météo',
    garden_expanded: 'Jardin agrandi', seed_bought: 'Achat graines',
    tree_planted: 'Arbre planté', hedge_trimmed: 'Haie taillée',
    tank_filled: 'Cuve remplie',
  };
  return map[type] || type;
}

/**
 * Génère le journal complet en Markdown.
 */
export function generateJournalMarkdown(options: {
  title?: string;
  includeStats?: boolean;
  limit?: number;
} = {}): string {
  const state = loadState();
  const { title = `Journal de Bord BotanIA — Saison ${getYear()}`, includeStats = true, limit } = options;
  const entries = limit ? state.entries.slice(0, limit) : state.entries;

  const lines: string[] = [];

  // ── Header ──
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> Généré le ${formatDate(new Date().toISOString())}`);
  lines.push('');

  // ── Statistiques ──
  if (includeStats) {
    const stats = getJournalStats();
    lines.push('## 📊 Bilan de Saison');
    lines.push('');
    lines.push(`| Indicateur | Valeur |`);
    lines.push(`|---|---|`);
    lines.push(`| Total actions | ${stats.totalEntries} |`);
    lines.push(`| 🌱 Plantations | ${stats.byType.planting || 0} |`);
    lines.push(`| 🧺 Récoltes | ${stats.totalHarvests} |`);
    lines.push(`| 💰 Ventes | ${stats.totalSales} |`);
    lines.push(`| 💰 Monnaie gagnée | ${stats.totalCoinsEarned.toLocaleString('fr-FR')} |`);
    lines.push(`| 💸 Monnaie dépensée | ${stats.totalCoinsSpent.toLocaleString('fr-FR')} |`);
    lines.push(`| 🌿 Plantes cultivées | ${stats.plantsGrown.size} |`);
    lines.push(`| 🏆 Quêtes | ${stats.byType.quest_completed || 0} |`);
    lines.push(`| 💀 Plantes perdues | ${stats.byType.plant_died || 0} |`);
    lines.push('');
    lines.push(`*Première entrée: ${stats.firstEntry ? formatDate(stats.firstEntry) : 'N/A'}*`);
    lines.push(`*Dernière entrée: ${stats.lastEntry ? formatDate(stats.lastEntry) : 'N/A'}*`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // ── Entries ──
  lines.push('## 📋 Journal des Actions');
  lines.push('');

  // Grouper par date
  const byDate = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const date = entry.timestamp.split('T')[0];
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(entry);
  }

  for (const [date, dayEntries] of byDate) {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    lines.push(`### 📅 ${dateStr}`);
    lines.push('');

    for (const entry of dayEntries) {
      lines.push(`- ${typeEmoji(entry.type)} **${typeLabel(entry.type)}** — ${escapeMd(entry.summary)}`);
      if (entry.quantity) lines.push(`  - Quantité: ${entry.quantity}`);
      if (entry.coins) lines.push(`  - Monnaie: ${entry.coins > 0 ? '+' : ''}${entry.coins}`);
      if (entry.weather) lines.push(`  - Météo: ${entry.weather.emoji} ${entry.weather.temp}°C (${entry.weather.description})`);
      if (entry.detail) lines.push(`  - _${escapeMd(entry.detail)}_`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('*Journal généré par BotanIA*');

  return lines.join('\n');
}

/**
 * Exporte le journal en fichier .md téléchargeable.
 */
export function exportJournalToFile(): string {
  const markdown = generateJournalMarkdown();
  const season = getYear();
  const filename = `botania_journal_${season}.md`;
  return filename; // Le markdown est retourné pour affichage ou download
}

/**
 * Télécharge le journal comme fichier Markdown.
 */
export function downloadJournal(): void {
  const markdown = generateJournalMarkdown();
  const season = getYear();
  const filename = `botania_journal_${season}.md`;

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Importe des entrées depuis un JSON (pour synchronisation).
 */
export function importJournalEntries(entries: JournalEntry[]): number {
  const state = loadState();
  const existingIds = new Set(state.entries.map(e => e.id));
  let imported = 0;

  for (const entry of entries) {
    if (!existingIds.has(entry.id)) {
      state.entries.push(entry);
      imported++;
    }
  }

  // Re-trier par timestamp
  state.entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  saveState(state);
  return imported;
}

// ─── Pre-filled action helpers ────────────────────────────────────────────────

export function journalPlanting(plantDefId: string, plantName: string, quantity = 1, weather?: JournalEntry['weather']) {
  return addJournalEntry('planting', `${quantity}x ${plantName} planté(s)`, { plantDefId, quantity, weather });
}

export function journalHarvest(plantDefId: string, plantName: string, quantity: number, weather?: JournalEntry['weather']) {
  return addJournalEntry('harvest', `${quantity}x ${plantName} récolté(s)`, { plantDefId, quantity, weather });
}

export function journalSale(plantDefId: string, plantName: string, quantity: number, coins: number) {
  return addJournalEntry('sale', `${quantity}x ${plantName} vendu(s) pour ${coins} pièces`, { plantDefId, quantity, coins });
}

export function journalQuestCompleted(questName: string, rewardCoins?: number) {
  return addJournalEntry('quest_completed', `Quête complétée: ${questName}`, { coins: rewardCoins });
}

export function journalPlantDied(plantDefId: string, plantName: string, reason?: string) {
  return addJournalEntry('plant_died', `${plantName} n'a pas survécu`, { plantDefId, detail: reason });
}

export function journalWeatherAlert(type: string, message: string) {
  return addJournalEntry('weather_alert', `Alerte météo: ${type}`, { detail: message });
}

export function journalDailyBonus(coins: number) {
  return addJournalEntry('daily_bonus', `Bonus quotidien réclamé: +${coins} pièces`, { coins });
}
