/**
 * GARDEN MEMORY — Système de mémoire agronomique multi-saisons
 * Stocke l'historique dans des fichiers MD locaux pour que Lia apprenne de ton jardin
 */

export interface PlantMemory {
  plantId: string;
  name: string;
  harvests: HarvestRecord[];
  diseases: DiseaseRecord[];
  observations: ObservationRecord[];
  events: PhenologicalEvent[];
  averages: CalculatedAverages;
}

export interface HarvestRecord {
  date: string;
  quantity: number; // kg/m²
  quality: 'excellent' | 'good' | 'average' | 'poor';
  daysToMaturity: number;
  notes: string;
}

export interface DiseaseRecord {
  date: string;
  disease: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  treated: boolean;
  treatment: string;
}

export interface ObservationRecord {
  date: string;
  text: string;
  category: 'growth' | 'problem' | 'treatment' | 'weather' | 'general';
}

export type PhenologicalEventType =
  | 'sowing'
  | 'germination'
  | 'transplant'
  | 'flowering'
  | 'fruiting'
  | 'harvest'
  | 'frost'
  | 'pest'
  | 'other';

export interface PhenologicalEvent {
  id: string;
  type: PhenologicalEventType;
  date: string; // YYYY-MM-DD
  notes?: string;
  gpsLat?: number;
  gpsLon?: number;
  syncedToINat?: boolean;
}

export interface CalculatedAverages {
  avgDaysToMaturity: number;
  avgYield: number;
  sampleCount: number;
  lastUpdated: string;
}

// ── Storage paths ──────────────────────────────────────────────

const MEMORY_DIR = 'C:/Users/Administrateur/Desktop/BotanIA/data/garden-memory';

// ── Memory operations ──────────────────────────────────────────

export async function savePlantMemory(memory: PlantMemory): Promise<boolean> {
  try {
    const content = formatPlantMemory(memory);
    await fetch('/api/save-garden-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath: `${MEMORY_DIR}/${memory.plantId}.md`,
        content,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function loadPlantMemory(plantId: string): Promise<PlantMemory | null> {
  try {
    const res = await fetch(`/api/load-garden-memory?plantId=${plantId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return parsePlantMemory(data.content, plantId);
  } catch {
    return null;
  }
}

export async function loadAllPlantMemories(): Promise<PlantMemory[]> {
  try {
    const res = await fetch('/api/load-all-garden-memories');
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map((f: any) => parsePlantMemory(f.content, f.plantId));
  } catch {
    return [];
  }
}

export async function addHarvestRecord(plantId: string, record: HarvestRecord): Promise<void> {
  const existing = await loadPlantMemory(plantId);
  const memory = existing || createEmptyMemory(plantId, record.plantId || plantId);
  memory.harvests.push(record);
  memory.averages = calculateAverages(memory);
  await savePlantMemory(memory);
}

export async function addDiseaseRecord(plantId: string, record: DiseaseRecord): Promise<void> {
  const existing = await loadPlantMemory(plantId);
  const memory = existing || createEmptyMemory(plantId, plantId);
  memory.diseases.push(record);
  await savePlantMemory(memory);
}

export async function addObservationRecord(plantId: string, record: ObservationRecord): Promise<void> {
  const existing = await loadPlantMemory(plantId);
  const memory = existing || createEmptyMemory(plantId, plantId);
  memory.observations.push(record);
  await savePlantMemory(memory);
}

export async function addPhenologicalEvent(plantId: string, event: Omit<PhenologicalEvent, 'id'>): Promise<void> {
  const existing = await loadPlantMemory(plantId);
  const memory = existing || createEmptyMemory(plantId, plantId);
  memory.events.push({ ...event, id: 'evt-' + Date.now() });
  await savePlantMemory(memory);
}

// ── Phenological helpers ────────────────────────────────────────

export function getSeasonCount(plantId: string, memories: PlantMemory[]): number {
  const mem = memories.find(m => m.plantId === plantId || m.name.toLowerCase() === plantId.toLowerCase());
  if (!mem || mem.events.length === 0) return 0;
  const years = new Set(mem.events.map(e => e.date.substring(0, 4)));
  return years.size;
}

export function getPlantPhenology(plantId: string, memories: PlantMemory[]): PhenologicalEvent[] {
  const mem = memories.find(m => m.plantId === plantId || m.name.toLowerCase() === plantId.toLowerCase());
  return mem?.events || [];
}

export function getAverageEventDate(events: PhenologicalEvent[], type: PhenologicalEventType): string | null {
  const filtered = events.filter(e => e.type === type);
  if (filtered.length === 0) return null;

  // Compute average day-of-year
  const dayNums = filtered.map(e => {
    const d = new Date(e.date + 'T00:00:00');
    const start = new Date(d.getFullYear() + '-01-01T00:00:00');
    return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  const avgDay = Math.round(dayNums.reduce((s, d) => s + d, 0) / dayNums.length);

  // Find the most common year or use current
  const yearCounts = new Map<string, number>();
  for (const e of filtered) {
    const y = e.date.substring(0, 4);
    yearCounts.set(y, (yearCounts.get(y) || 0) + 1);
  }
  const mostCommonYear = [...yearCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || String(new Date().getFullYear());

  // Reconstruct date from average day-of-year
  const avgDate = new Date(mostCommonYear + '-01-01T00:00:00');
  avgDate.setDate(avgDate.getDate() + avgDay);
  return avgDate.toISOString().split('T')[0];
}

// ── Formatting (MD) ─────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<PhenologicalEventType, string> = {
  sowing: 'semis',
  germination: 'levée',
  transplant: 'repiquage',
  flowering: 'floraison',
  fruiting: 'fructification',
  harvest: 'récolte',
  frost: 'gel',
  pest: 'ravageur',
  other: 'autre',
};

function formatPlantMemory(memory: PlantMemory): string {
  const avg = memory.averages;
  const lines = [
    `# ${memory.name}`,
    '',
    '## Mémoire agronomique',
    '',
    `> **Moyenne jours maturité:** ${avg.avgDaysToMaturity} jours (sur ${avg.sampleCount} saisons)`,
    `> **Rendement moyen:** ${avg.avgYield.toFixed(2)} kg/m²`,
    `> **Dernière mise à jour:** ${avg.lastUpdated}`,
    '',
    '---',
    '',
    '## Phénologie',
    ...memory.events.map(e =>
      `- **${e.date}** [${EVENT_TYPE_LABELS[e.type]}]${e.syncedToINat ? ' ✓iNat' : ''} ${e.notes || ''}`
    ),
    '',
    '## Récoltes',
    ...memory.harvests.map(h =>
      `- **${h.date}** | ${h.daysToMaturity}j maturité | ${h.quantity} kg/m² | Quality: ${h.quality} | *${h.notes}*`
    ),
    '',
    '## Maladies rencontrées',
    ...memory.diseases.map(d =>
      `- **${d.date}** | ${d.disease} | Sévérité: ${d.severity} | ${d.treated ? 'Traité: ' + d.treatment : 'Non traité'}`
    ),
    '',
    '## Observations',
    ...memory.observations.map(o =>
      `- **${o.date}** [${o.category}] ${o.text}`
    ),
    '',
    '---',
    '*Ce fichier est automatiquement mis à jour par BotanIA*',
  ];
  return lines.join('\n');
}

function parsePlantMemory(content: string, plantId: string): PlantMemory {
  const memory: PlantMemory = {
    plantId,
    name: plantId,
    harvests: [],
    diseases: [],
    observations: [],
    events: [],
    averages: { avgDaysToMaturity: 0, avgYield: 0, sampleCount: 0, lastUpdated: new Date().toISOString() },
  };

  const lines = content.split('\n');
  let section = '';
  for (const line of lines) {
    if (line.startsWith('# ') && !line.startsWith('##')) {
      memory.name = line.replace('# ', '').trim();
    } else if (line.startsWith('## ')) {
      section = line;
    } else if (line.startsWith('> **Moyenne')) {
      const days = line.match(/(\d+)\s*jours/)?.[1];
      const count = line.match(/\((\d+)\s*saisons\)/)?.[1];
      if (days) memory.averages.avgDaysToMaturity = parseInt(days);
      if (count) memory.averages.sampleCount = parseInt(count);
    } else if (line.startsWith('> **Rendement')) {
      const yield_ = line.match(/([\d.]+)\s*kg/)?.[1];
      if (yield_) memory.averages.avgYield = parseFloat(yield_);
    } else if (line.startsWith('- **') && section.includes('Phénologie')) {
      const date = line.match(/\*\*([\d-]+)\*\*/)?.[1] || '';
      const typeMatch = line.match(/\[(\w+(?:-\w+)*)\]/)?.[1] || '';
      const synced = line.includes('✓iNat');
      const notes = line.replace(/-\s*\*\*[^*]+\*\*\s*\[[^\]]+\]\s*(?:✓iNat\s*)?/, '').trim();
      // Reverse lookup from label to type
      const type = (Object.entries(EVENT_TYPE_LABELS).find(([, v]) => v === typeMatch)?.[0] || 'other') as PhenologicalEventType;
      if (date) memory.events.push({ id: 'parsed-' + date, type, date, notes, syncedToINat: synced });
    } else if (line.startsWith('- **') && section.includes('Récoltes')) {
      const date = line.match(/\*\*([\d-]+)\*\*/)?.[1] || '';
      const days = parseInt(line.match(/(\d+)j\s*maturité/)?.[1] || '0');
      const qty = parseFloat(line.match(/\| ([\d.]+)\s*kg/)?.[1] || '0');
      const quality = line.match(/Quality:\s*(\w+)/)?.[1] as any || 'average';
      const note = line.match(/\*([^*]+)\*/)?.[1] || '';
      if (date) memory.harvests.push({ date, daysToMaturity: days, quantity: qty, quality, notes: note });
    } else if (line.startsWith('- **') && section.includes('Maladies')) {
      const date = line.match(/\*\*([\d-]+)\*\*/)?.[1] || '';
      const disease = line.match(/\|\s*([^|]+)\s*\|/)?.[1]?.trim() || '';
      const severity = line.match(/Sévérité:\s*(\w+)/)?.[1] as any || 'medium';
      const treated = line.includes('Traité:');
      const treatment = line.match(/Traité:\s*(.+?)(?:\s*\|?\s*$)/)?.[1] || '';
      if (date) memory.diseases.push({ date, disease, severity, treated, treatment });
    } else if (line.startsWith('- **') && section.includes('Observations')) {
      const date = line.match(/\*\*([\d-]+)\*\*/)?.[1] || '';
      const cat = line.match(/\[(\w+)\]/)?.[1] as any || 'general';
      const text = line.replace(/-\s*\*\*[^*]+\*\*\s*\[\w+\]\s*/, '').trim();
      if (date) memory.observations.push({ date, text, category: cat });
    }
  }
  return memory;
}

function calculateAverages(memory: PlantMemory): CalculatedAverages {
  if (memory.harvests.length === 0) {
    return { avgDaysToMaturity: 0, avgYield: 0, sampleCount: 0, lastUpdated: new Date().toISOString() };
  }
  const avgDays = memory.harvests.reduce((s, h) => s + h.daysToMaturity, 0) / memory.harvests.length;
  const avgYield = memory.harvests.reduce((s, h) => s + h.quantity, 0) / memory.harvests.length;
  return {
    avgDaysToMaturity: Math.round(avgDays),
    avgYield: Math.round(avgYield * 100) / 100,
    sampleCount: memory.harvests.length,
    lastUpdated: new Date().toISOString(),
  };
}

function createEmptyMemory(plantId: string, name: string): PlantMemory {
  return {
    plantId,
    name,
    harvests: [],
    diseases: [],
    observations: [],
    events: [],
    averages: { avgDaysToMaturity: 0, avgYield: 0, sampleCount: 0, lastUpdated: new Date().toISOString() },
  };
}

// ── Lia integration helpers ──────────────────────────────────

export function getPersonalizedTip(plantName: string, memories: PlantMemory[]): string | null {
  const mem = memories.find(m => m.name.toLowerCase().includes(plantName.toLowerCase()));
  if (!mem || mem.harvests.length === 0) return null;
  const { avgDaysToMaturity, avgYield, sampleCount } = mem.averages;
  if (sampleCount < 2) return null;
  return `D'après ton historique (${sampleCount} saisons), tes ${plantName} atteignent maturité en ~${avgDaysToMaturity} jours avec un rendement moyen de ${avgYield} kg/m².`;
}

export function getDiseaseWarning(memories: PlantMemory[]): string | null {
  const recentDiseases = memories
    .flatMap(m => m.diseases)
    .filter(d => {
      const diff = Date.now() - new Date(d.date).getTime();
      return diff < 90 * 24 * 60 * 60 * 1000;
    });
  if (recentDiseases.length === 0) return null;
  const byDisease = new Map<string, number>();
  for (const d of recentDiseases) {
    byDisease.set(d.disease, (byDisease.get(d.disease) || 0) + 1);
  }
  const mostCommon = [...byDisease.entries()].sort((a, b) => b[1] - a[1])[0];
  return `${mostCommon[0]} est apparue ${mostCommon[1]}x sur ton terrain récemment. Surveille cette plante.`;
}

export function getPhenologicalSummary(plantName: string, memories: PlantMemory[]): string | null {
  const mem = memories.find(m => m.name.toLowerCase().includes(plantName.toLowerCase()));
  if (!mem || mem.events.length === 0) return null;

  const seasonCount = getSeasonCount(mem.plantId, memories);
  if (seasonCount < 2) return null;

  const flowerDates = mem.events.filter(e => e.type === 'flowering');
  if (flowerDates.length === 0) return null;

  const avgDate = getAverageEventDate(mem.events, 'flowering');
  if (!avgDate) return null;

  const dateObj = new Date(avgDate + 'T00:00:00');
  const formatted = dateObj.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' });

  return `D'après tes ${seasonCount} saisons, les ${plantName} fleurissent en moyenne autour du ${formatted}.`;
}

export function getSeasonContext(plantName: string, memories: PlantMemory[]): string | null {
  const mem = memories.find(m => m.name.toLowerCase().includes(plantName.toLowerCase()));
  if (!mem) return null;
  const count = getSeasonCount(mem.plantId, memories);
  if (count === 0) return null;
  const msg = count === 1
    ? `Tu en es à ta 1ère saison de ${plantName} ! Continue à noter tes observations.`
    : `Tu en es à ta ${count + 1}ème saison de ${plantName} ! ${count >= 2 ? 'Tu commences à avoir pas mal de données.' : 'Continue à enregistrer pour que j\'apprenne.'}`;
  return msg;
}

export function getPlantEventSummary(plantName: string, eventType: PhenologicalEventType, memories: PlantMemory[]): string | null {
  const mem = memories.find(m => m.name.toLowerCase().includes(plantName.toLowerCase()));
  if (!mem) return null;
  const avgDate = getAverageEventDate(mem.events, eventType);
  if (!avgDate) return null;
  const dateObj = new Date(avgDate + 'T00:00:00');
  const labels: Record<PhenologicalEventType, string> = {
    sowing: 'semis',
    germination: 'levée',
    transplant: 'repiquage',
    flowering: 'floraison',
    fruiting: 'fructification',
    harvest: 'récolte',
    frost: 'gel',
    pest: 'ravageur',
    other: 'événement',
  };
  const formatted = dateObj.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' });
  return `En moyenne, le ${labels[eventType]} a lieu autour du ${formatted} (sur ${mem.events.filter(e => e.type === eventType).length} saisons).`;
}
