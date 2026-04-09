/**
 * INATURALIST CLIENT — Envoyer des observations phénologiques vers iNaturalist
 * API: https://www.inaturalist.org/pages/api
 */

// Mapping BotanIA plant ID → iNaturalist taxon ID
// Source: recherche sur inaturalist.org
export const TAXON_MAP: Record<string, number> = {
  tomato: 50686,        // Solanum lycopersicum
  carrot: 47892,        // Daucus carota
  lettuce: 47795,       // Lactuca sativa
  basil: 861376,        // Ocimum basilicum
  pepper: 122476,       // Capsicum annuum
  cucumber: 54062,     // Cucumis sativus
  zucchini: 54837,      // Cucurbita pepo
  bean: 52461,          // Phaseolus vulgaris
  radish: 47691,        // Raphanus sativus
  eggplant: 124876,     // Solanum melongena
  spinach: 48328,       // Spinacia oleracea
  strawberry: 47793,    // Fragaria × ananassa
  pea: 1023484,        // Pisum sativum
  cabbage: 303953,      // Brassica oleracea
  onion: 46752,         // Allium cepa
  potato: 54792,        // Solanum tuberosum
  garlic: 47269,         // Allium sativum
  leek: 47384,           // Allium ampeloprasum
  celery: 47803,         // Apium graveolens
  parsley: 47719,        // Petroselinum crispum
  coriander: 49512,     // Coriandrum sativum
  chive: 47585,          // Allium schoenoprasum
  melon: 54799,          // Cucumis melo
  pumpkin: 54839,        // Cucurbita maxima
  squash: 54841,         // Cucurbita
  parsley_root: 47719,   // Petroselinum crispum (radice)
  cauliflower: 303953,    // Brassica oleracea botrytis
  broccoli: 48484,       // Brassica oleracea italica
  lamb_lettuce: 47963,   // Valerianella locusta
  arugula: 48137,        // Eruca vesicaria
  dill: 48210,           // Anethum graveolens
  fennel: 48237,         // Foeniculum vulgare
  thyme: 47738,          // Thymus vulgaris
  rosemary: 47856,       // Salvia rosmarinus
  sage: 47873,           // Salvia officinalis
  lavender: 48777,       // Lavandula angustifolia
  mint: 47889,           // Mentha
  lemon_balm: 48792,     // Melissa officinalis
  valerian: 48795,        // Valeriana officinalis
  calendula: 49586,      // Calendula officinalis
};

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

export interface INatSubmission {
  species_guess: string;
  taxon_id: number;
  observed_on: string; // YYYY-MM-DD
  description: string;
  latitude: number;
  longitude: number;
  positional_accuracy?: number;
}

export function getINatTaxonId(plantDefId: string): number | null {
  const id = plantDefId.toLowerCase().replace(/\s+/g, '_');
  return TAXON_MAP[id] || null;
}

const EVENT_TYPE_LABELS: Record<PhenologicalEventType, string> = {
  sowing: 'Semis / Sowing',
  germination: 'Levée / Germination',
  transplant: 'Repiquage / Transplant',
  flowering: 'Floraison / Flowering',
  fruiting: 'Fructification / Fruiting',
  harvest: 'Récolte / Harvest',
  frost: 'Gel / Frost event',
  pest: 'Ravageur / Pest observed',
  other: 'Observation',
};

export function buildPhenologyDescription(eventType: PhenologicalEventType, notes?: string): string {
  return `[BotanIA Phénologie] ${EVENT_TYPE_LABELS[eventType]}. ${notes || ''}`.trim();
}

/**
 * Soumet une observation à iNaturalist via le proxy API
 */
export async function submitObservation(
  submission: INatSubmission,
  apiKey: string
): Promise<{ success: boolean; observation_id?: number; error?: string }> {
  try {
    const res = await fetch('/api/inaturalist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', submission, apiKey }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Submission failed' };
    return { success: true, observation_id: data.observation_id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
