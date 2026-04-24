/**
 * Botany Constants — Single source of truth for botanical data
 * ─────────────────────────────────────────────────────────────
 * Used by both client and server. No fs imports, no side effects.
 */

// ═══════════════════════════════════════════════════════════════
//  PLANT_FAMILY_MAP — famille botanique par plante
//  Sources: Wikipedia Taxaceae, GBIF Botanical Taxonomy, Plants of the World Online (Kew)
// ═══════════════════════════════════════════════════════════════

export const PLANT_FAMILY_MAP: Record<string, string> = {
  // ─── SOLANACÉES ───
  tomato: 'Solanaceae',
  pepper: 'Solanaceae',
  eggplant: 'Solanaceae',
  potato: 'Solanaceae',
  goji: 'Solanaceae',
  lycium: 'Solanaceae',

  // ─── CUCURBITACÉES ───
  cucumber: 'Cucurbitaceae',
  zucchini: 'Cucurbitaceae',
  squash: 'Cucurbitaceae',
  pumpkin: 'Cucurbitaceae',
  melon: 'Cucurbitaceae',
  watermelon: 'Cucurbitaceae',

  // ─── FABACÉES ───
  bean: 'Fabaceae',
  pea: 'Fabaceae',
  lentil: 'Fabaceae',
  chickpea: 'Fabaceae',
  faba: 'Fabaceae',

  // ─── BRASSICACÉES ───
  cabbage: 'Brassicaceae',
  kale: 'Brassicaceae',
  radish: 'Brassicaceae',
  turnip: 'Brassicaceae',
  broccoli: 'Brassicaceae',
  cauliflower: 'Brassicaceae',
  brusselsSprout: 'Brassicaceae',

  // ─── ASTÉRACÉES ───
  lettuce: 'Asteraceae',
  sunflower: 'Asteraceae',
  artichoke: 'Asteraceae',
  endive: 'Asteraceae',
  chicory: 'Asteraceae',

  // ─── APIACÉES ───
  carrot: 'Apiaceae',
  parsley: 'Apiaceae',
  celery: 'Apiaceae',
  dill: 'Apiaceae',
  fennel: 'Apiaceae',
  coriander: 'Apiaceae',

  // ─── AMARANTHACÉES ───
  spinach: 'Amaranthaceae',
  chard: 'Amaranthaceae',
  quinoa: 'Amaranthaceae',
  amaranth: 'Amaranthaceae',
  beet: 'Amaranthaceae',

  // ─── LAMIACÉES ───
  basil: 'Lamiaceae',
  mint: 'Lamiaceae',
  thyme: 'Lamiaceae',
  sage: 'Lamiaceae',
  oregano: 'Lamiaceae',
  rosemary: 'Lamiaceae',
  lavender: 'Lamiaceae',
  rosmarinus: 'Lamiaceae',

  // ─── ROSACÉES ───
  strawberry: 'Rosaceae',
  photinia: 'Rosaceae',
  apple: 'Rosaceae',
  pear: 'Rosaceae',
  cherry: 'Rosaceae',
  apricot: 'Rosaceae',
  plum: 'Rosaceae',
  peach: 'Rosaceae',
  quince: 'Rosaceae',
  almond: 'Rosaceae',
  blackberry: 'Rosaceae',
  raspberry: 'Rosaceae',
  hawthorn: 'Rosaceae',
  sorbus: 'Rosaceae',
  amelanchier: 'Rosaceae',
  cortland: 'Rosaceae',

  // ─── RUTACÉES ───
  orange: 'Rutaceae',
  lemon: 'Rutaceae',
  grapefruit: 'Rutaceae',
  lime: 'Rutaceae',
  mandarin: 'Rutaceae',
  kumquat: 'Rutaceae',

  // ─── JUGLANDACÉES ───
  walnut: 'Juglandaceae',
  hazelnut: 'Juglandaceae',
  pecan: 'Juglandaceae',
  chestnut: 'Juglandaceae',

  // ─── FAGACÉES ───
  oak: 'Fagaceae',
  beech: 'Fagaceae',

  // ─── BÉTULACÉES ───
  birch: 'Betulaceae',
  alder: 'Betulaceae',
  hornbeam: 'Betulaceae',

  // ─── SAPINDACÉES ───
  maple: 'Sapindaceae',

  // ─── PINACÉES ───
  pine: 'Pinaceae',
  spruce: 'Pinaceae',
  fir: 'Pinaceae',
  cedar: 'Pinaceae',
  larch: 'Pinaceae',

  // ─── MAGNOLIACÉES ───
  magnolia: 'Magnoliaceae',

  // ─── MORACÉES ───
  fig: 'Moraceae',

  // ─── ÉLAAGNACÉES ───
  eleagnus: 'Elaeagnaceae',

  // ─── LAURACÉES ───
  laurus: 'Lauraceae',
  bay: 'Lauraceae',

  // ─── CORNACÉES ───
  cornus: 'Cornaceae',

  // ─── GROSSULARIACÉES ───
  blackcurrant: 'Grossulariaceae',
  redcurrant: 'Grossulariaceae',
  whitecurrant: 'Grossulariaceae',
  gooseberry: 'Grossulariaceae',
  casseille: 'Grossulariaceae',
  josta: 'Grossulariaceae',

  // ─── OLÉACÉES ───
  olive: 'Oleaceae',

  // ─── ÉRICACÉES ───
  arbousier: 'Ericaceae',
  blueberry: 'Ericaceae',
  cranberry: 'Ericaceae',

  // ─── VITACÉES ───
  grape: 'Vitaceae',
  bacoNoir: 'Vitaceae',

  // ─── LARDIZABALACÉES ───
  akebia: 'Lardizabalaceae',

  // ─── LYTHRACÉES ───
  pomegranate: 'Lythraceae',

  // ─── POLYGONACÉES ───
  rhubarb: 'Polygonaceae',
  sorrel: 'Polygonaceae',

  // ─── AMARYLLIDACÉES ───
  onion: 'Amaryllidaceae',
  garlic: 'Amaryllidaceae',
  leek: 'Amaryllidaceae',
  shallot: 'Amaryllidaceae',

  // ─── ASPARAGACÉES ───
  asparagus: 'Asparagaceae',

  // ─── IRIDACÉES ───
  iris: 'Iridaceae',

  // ─── CANNABACÉES ───
  hemp: 'Cannabaceae',

  // ─── POACÉES ───
  corn: 'Poaceae',

  // ─── ÉSCALLONIACÉES ───
  escallonia: 'Escalloniaceae',

  // ─── CUPRESSACÉES ───
  cupressus: 'Cupressaceae',
  thuya: 'Cupressaceae',
};

// ═══════════════════════════════════════════════════════════════
//  PLANT_VARIETY_MAP — variétés connues et leur plante de base
//  Remplace le fragile split('-')[0]
// ═══════════════════════════════════════════════════════════════

export const PLANT_VARIETY_MAP: Record<string, string> = {
  // Arbres fruitiers
  'apple-gala': 'apple',
  'apple-golden': 'apple',
  'apple-belle': 'apple',
  'apple-reine': 'apple',
  'apricot-bergeron': 'apricot',
  'arbousier-rubra': 'arbousier',
  'cherry-bing': 'cherry',
  'pear-conference': 'pear',
  'pear-louise': 'pear',
  'pear-williams': 'pear',
  'cassis-blanc-ojeblanc': 'blackcurrant',

  // Petits fruits / bayes
  'akebia-quinata': 'akebia',
  'akebia-shirobana': 'akebia',
  'amelanchier-thiessen': 'amelanchier',
  'strawberry-ciflorette': 'strawberry',
  'fraise-anabelle': 'strawberry',
  'fraise-cirafine': 'strawberry',
  'fraise-ostara': 'strawberry',
  'fraise-rabunda': 'strawberry',

  // Haies
  'escallonia-iveyi': 'escallonia',
  'photinia-red-robin': 'photinia',
  'eleagnus-gilt-edge': 'eleagnus',
  'eleagnus-ebbingii': 'eleagnus',
  'laurus-nobilis': 'laurus',
  'cornus-alba': 'cornus',
  'thuya-smaragd': 'thuya',

  // Légumes
  'zucchini-black-beauty': 'zucchini',
  'zucchini-verte-italie': 'zucchini',
  'zucchini-verte-milan-black-beauty': 'zucchini',
  'tomato-cocktail': 'tomato',
  'tomato-cerisette': 'tomato',
  'tomato-cherokee': 'tomato',
  'tomato-kumato': 'tomato',
  'tomato-marmande': 'tomato',
  'tomato-raisin': 'tomato',
  'tomato-rose': 'tomato',
  'tomato-green': 'tomato',
  'tomato-aneas': 'tomato',
  'tomato-evergreen': 'tomato',
  'tomato-blackk': 'tomato',
  'tomato-lanterna': 'tomato',
  'tomato-saint': 'tomato',
  'pepper-ariane': 'pepper',
  'pepper-california': 'pepper',
  'pepper-chocolat': 'pepper',
  'pepper-doux': 'pepper',
  'eggplant-long': 'eggplant',
  'eggplant-longue': 'eggplant',
  'lettuce-batavia': 'lettuce',
  'lettuce-chene': 'lettuce',
  'cabbage-milan': 'cabbage',
  'carrot-guerande': 'carrot',
  'carrot-nantaise': 'carrot',
  'carrot-robver': 'carrot',
  'cucumber-bella': 'cucumber',
  'cucumber-marketer': 'cucumber',
  'cucumber-rollisons': 'cucumber',
  'basil-genoveois': 'basil',
  'basil-loki': 'basil',
  'basil-marseillais': 'basil',
  'bean-coco': 'bean',
  'squash-butternut': 'squash',
  'squash-striped': 'squash',
  'corn-miel': 'corn',
  'corn-pop': 'corn',
  'sunflower-titania': 'sunflower',
  'sunflower-velours': 'sunflower',
  'maple-acer': 'maple',
  'magnolia-grandiflora': 'magnolia',
  'pine-sylvestris': 'pine',
  'oak-pedoncule': 'oak',
  'birch-betula': 'birch',
};

/**
 * Resolve a plantDefId to its base plant ID.
 * If the ID is a known variety, returns the base plant.
 * Otherwise returns the original ID.
 */
export function resolveBasePlantId(id: string): string {
  return PLANT_VARIETY_MAP[id] ?? id;
}

/**
 * Get the botanical family for a plantDefId.
 * Supports variety IDs via PLANT_VARIETY_MAP.
 */
export function getPlantFamily(id: string): string {
  const baseId = resolveBasePlantId(id);
  return PLANT_FAMILY_MAP[baseId] ?? 'Unknown';
}

// ═══════════════════════════════════════════════════════════════
//  FAMILY_SCIENTIFIC_TO_FRENCH — traduction vernaculaire
// ═══════════════════════════════════════════════════════════════

export const FAMILY_SCIENTIFIC_TO_FRENCH: Record<string, string> = {
  Solanaceae: 'Solanacées',
  Cucurbitaceae: 'Cucurbitacées',
  Fabaceae: 'Fabacées',
  Brassicaceae: 'Brassicacées',
  Asteraceae: 'Astéracées',
  Apiaceae: 'Apiacées',
  Amaranthaceae: 'Amaranthacées',
  Lamiaceae: 'Lamiacées',
  Rosaceae: 'Rosacées',
  Rutaceae: 'Rutacées',
  Juglandaceae: 'Juglandacées',
  Fagaceae: 'Fagacées',
  Betulaceae: 'Bétulacées',
  Sapindaceae: 'Sapindacées',
  Pinaceae: 'Pinacées',
  Magnoliaceae: 'Magnoliacées',
  Moraceae: 'Moracées',
  Elaeagnaceae: 'Élaéagnacées',
  Lauraceae: 'Lauracées',
  Cornaceae: 'Cornacées',
  Grossulariaceae: 'Grossulariacées',
  Oleaceae: 'Oléacées',
  Ericaceae: 'Éricacées',
  Vitaceae: 'Vitacées',
  Lardizabalaceae: 'Lardizabalacées',
  Lythraceae: 'Lythracées',
  Polygonaceae: 'Polygonacées',
  Amaryllidaceae: 'Amaryllidacées',
  Asparagaceae: 'Asparagacées',
  Iridaceae: 'Iridacées',
  Cannabaceae: 'Cannabacées',
  Poaceae: 'Poacées',
  Escalloniaceae: 'Éscalloniacées',
  Cupressaceae: 'Cupressacées',
};

/**
 * Get plant family in French (vernacular) for rotation display.
 */
export function getPlantFamilyFrench(id: string): string {
  const scientific = getPlantFamily(id);
  return FAMILY_SCIENTIFIC_TO_FRENCH[scientific] ?? scientific;
}

/**
 * Inverse map: family French name → plant IDs.
 * Useful for crop rotation UI.
 */
export function buildPlantFamiliesByFrench(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [plantId, scientific] of Object.entries(PLANT_FAMILY_MAP)) {
    const french = FAMILY_SCIENTIFIC_TO_FRENCH[scientific] ?? scientific;
    if (!result[french]) result[french] = [];
    result[french].push(plantId);
  }
  return result;
}
