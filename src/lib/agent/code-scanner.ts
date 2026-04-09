/**
 * Code Scanner — BotanIA Agent
 *
 * Parses .tsx/.ts files to extract:
 * - File purpose (from comments + JSDoc)
 * - Named exports (functions, interfaces, constants)
 * - Imports (dependencies on other BotanIA files)
 * - Tab associations (which page tabs use this component)
 * - Function signatures and descriptions
 *
 * This enables Lia to understand the codebase.
 */

import { generateEmbedding } from './ollama';
import { upsertPoint } from './qdrant';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScannedFile {
  path: string;
  name: string;
  type: 'tsx' | 'ts';
  rawContent: string;
  purpose: string;
  exports: ExportInfo[];
  imports: string[];
  tabs: string[];
  functions: FunctionInfo[];
  interfaces: string[];
  codeHash: string;
  lastModified: number;
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'interface' | 'type' | 'constant' | 'component';
  signature?: string;
  description?: string;
  parameters?: ParameterInfo[];
}

export interface FunctionInfo {
  name: string;
  signature: string;
  description: string;
  parameters: ParameterInfo[];
}

export interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
}

// ─── Tab detection patterns ──────────────────────────────────────────────────

const TAB_PATTERNS: Record<string, RegExp[]> = {
  jardin: [/Jardin\.tsx/, /GardenPlanView/, /GardenCardsView/, /useAgroData/],
  serre: [/SerreJardinView/, /SerreTile/, /greenhouse/i],
  pepiniere: [/Pepiniere/, /miniSerre/, /chambre.*culture/i],
  boutique: [/Boutique/, /shop/i, /PacketOpener/],
  graines: [/GrainCollection/, /SeedVariety/, /SEED_CATALOG/],
  identificateur: [/PlantIdentifier/, /identify-plant/i],
  journal: [/GardenJournal/, /LunarCalendar/],
  recoltes: [/HarvestTracker/, /harvest/i],
  maladies: [/DiseaseDetector/, /detect-disease/i],
  sauvegardes: [/GardenSaveManager/, /save/i],
};

// ─── Purpose extraction from comments ──────────────────────────────────────

function extractPurpose(content: string, filename: string): string {
  // JSDoc comment at top of file
  const jsdocMatch = content.match(/\/\*\*\s*\n([\s\S]*?)\*\//);
  if (jsdocMatch) {
    const doc = jsdocMatch[1]
      .replace(/\* /g, '')
      .replace(/\n/g    , ' ')
      .trim();
    if (doc.length > 10) return doc;
  }

  // Comment at top of file
  const topComment = content.match(/\/\/\s*(.+)/);
  if (topComment) return topComment[1].trim();

  // Known filenames
  const knownPurposes: Record<string, string> = {
    'HologramEvolution': 'Module de données botaniques pures + calculs agronomiques (GDD, eau, compagnonnage, maladies)',
    'Jardin': 'Vue principale du jardin avec grille cm, outils de placement, statistiques',
    'SerreJardinView': 'Vue du jardin sous serre avec conditions environnementales modifiées',
    'Pepiniere': 'Chambre de culture intérieure avec mini-serres et contrôle climatique',
    'Boutique': 'Boutique de graines et plants avec système de cartes collection',
    'GrainCollection': 'Collection de graines possédées et plantules disponibles',
    'GardenJournal': 'Journal de bord du jardin avec suivi photos et hum lunar',
    'LunarCalendar': 'Calendrier lunar avec phases et conseils de jardinage',
    'HarvestTracker': 'Suivi des récoltes avec statistiques et exports',
    'PlantIdentifier': 'Identification IA de plantes par photo (Groq, Ollama, Plant.id, Claude)',
    'DiseaseDetector': 'Détection IA de maladies par photo avec retour vocal',
    'WeatherEffects': 'Effets visuels météo (pluie, soleil, nuages)',
    'IAJardinier': 'Advisor IA quotidien avec conseils personnalisés',
    'EnhancedHUD': 'Interface HUD enrichie avec badges et alertes',
    'WaterBudget': 'Gestion du budget d eau avec cuves et récupérateurs',
    'ia-jardinier': 'Moteur de conseils IA (Groq/Ollama avec fallback)',
    'ai-advisor': 'Suggestions rules-based (arrosage, récolte, protection, lune)',
    'ai-engine': 'Simulation de croissance des plantes (tick, GDD, eau, santé)',
    'gdd-engine': 'Calcul des Degrés-Jours de Croissance (Growing Degree Days)',
    'hydro-engine': 'Calcul des besoins en eau FAO (ETc = Kc × ET0)',
    'companion-matrix': 'Matrice de compagnonnage INRAE (bénéfique/néfaste)',
    'weather-service': 'Intégration Open-Meteo pour météo temps réel',
    'garden-memory': 'Système de sauvegarde et restauration de l état du jardin',
  };

  for (const [key, purpose] of Object.entries(knownPurposes)) {
    if (filename.includes(key)) return purpose;
  }

  return `Composant/fichier BotanIA — ${filename}`;
}

// ─── Export extraction ───────────────────────────────────────────────────────

function extractExports(content: string): ExportInfo[] {
  const exports: ExportInfo[] = [];

  // Named function exports: export function name(...)
  const funcMatches = content.matchAll(/export\s+function\s+(\w+)\s*\(([^)]*)\)/g);
  for (const match of funcMatches) {
    const params = match[1]
      ? match[2].split(',').map((p: string) => {
          const [name, type] = p.trim().split(':').map(s => s.trim());
          return { name, type: type || 'unknown', optional: type?.includes('?') || false };
        })
      : [];
    exports.push({
      name: match[1],
      type: 'function',
      signature: `function ${match[1]}(${match[2]})`,
      parameters: params,
    });
  }

  // Async function exports
  const asyncFuncMatches = content.matchAll(/export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)/g);
  for (const match of asyncFuncMatches) {
    exports.push({
      name: match[1],
      type: 'function',
      signature: `async function ${match[1]}(${match[2]})`,
    });
  }

  // Export const/let: export const NAME = ...
  const constMatches = content.matchAll(/export\s+const\s+(\w+)\s*=/g);
  for (const match of constMatches) {
    exports.push({ name: match[1], type: 'constant' });
  }

  // Export interface
  const interfaceMatches = content.matchAll(/export\s+interface\s+(\w+)/g);
  for (const match of interfaceMatches) {
    exports.push({ name: match[1], type: 'interface' });
  }

  // Export type
  const typeMatches = content.matchAll(/export\s+type\s+(\w+)/g);
  for (const match of typeMatches) {
    exports.push({ name: match[1], type: 'type' });
  }

  // React component exports: export default function Name(...)
  const componentMatches = content.matchAll(/export\s+default\s+function\s+(\w+)/g);
  for (const match of componentMatches) {
    exports.push({
      name: match[1],
      type: 'component',
      signature: `function ${match[1]}()`,
    });
  }

  return exports;
}

// ─── Import extraction ────────────────────────────────────────────────────────

function extractImports(content: string): string[] {
  const imports: string[] = [];

  const importMatches = content.matchAll(/from\s+['"](@\/[^'"]+)['"]/g);
  for (const match of importMatches) {
    imports.push(match[1]);
  }

  // Also capture relative imports within the project
  const relativeMatches = content.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g);
  for (const match of relativeMatches) {
    imports.push(match[1]);
  }

  return [...new Set(imports)];
}

// ─── Tab association ─────────────────────────────────────────────────────────

function detectTabs(content: string, filename: string): string[] {
  const tabs: string[] = [];

  for (const [tab, patterns] of Object.entries(TAB_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(filename) || pattern.test(content)) {
        if (!tabs.includes(tab)) tabs.push(tab);
        break;
      }
    }
  }

  // If no tab detected, check if it's a React component used in the game
  if (tabs.length === 0 && /\.(tsx|jsx)$/.test(filename)) {
    // Default to 'jardin' for unknown game components
    if (filename.includes('game/')) {
      tabs.push('jardin');
    }
  }

  return tabs;
}

// ─── Function description from JSDoc ────────────────────────────────────────

function extractFunctionsWithDocs(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  // Find all exported functions
  const funcPattern = /export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;

  while ((match = funcPattern.exec(content)) !== null) {
    const name = match[1];
    const params = match[2];

    // Look for JSDoc before this function
    const beforeFunc = content.slice(Math.max(0, match.index - 500), match.index);
    const jsdocMatch = beforeFunc.match(/\/\*\*\s*\n([\s\S]*?)\*\//);

    let description = '';
    if (jsdocMatch) {
      description = jsdocMatch[1]
        .replace(/\* /g, '')
        .replace(/@param.*\n/g, '')
        .replace(/@returns.*\n/g, '')
        .replace(/@[^ *]+.*\n/g, '')
        .trim();
    }

    const paramList = params
      ? params.split(',').map((p) => {
          const [name, type] = p.trim().split(':').map(s => s.trim());
          return {
            name: name || '',
            type: type || 'unknown',
            optional: (type || '').includes('?') || false,
          };
        })
      : [];

    functions.push({
      name,
      signature: `function ${name}(${params})`,
      description,
      parameters: paramList,
    });
  }

  return functions;
}

// ─── PlantCard / Data detection ───────────────────────────────────────────────

function detectDataPurpose(content: string): string | null {
  const dataPurposes: Record<string, string[]> = {
    'PlantCard': ['PlantCard', 'tBase', 'tCap', 'stageGDD', 'kc'],
    'SeedVariety': ['SeedVariety', 'plantDefId', 'varietyId'],
    'GardenPlant': ['GardenPlant', 'gardenPlants'],
    'PlantState': ['PlantState', 'waterLevel', 'health', 'stage'],
    'WeatherData': ['WeatherData', 'temperature', 'humidity', 'precipitation'],
  };

  for (const [purpose, keywords] of Object.entries(dataPurposes)) {
    const found = keywords.filter(kw => content.includes(kw)).length;
    if (found >= 2) return purpose;
  }

  return null;
}

// ─── Main scan function ──────────────────────────────────────────────────────

export async function scanFile(filePath: string, content: string): Promise<ScannedFile> {
  const filename = filePath.split('/').pop() || filePath;
  const name = filename.replace(/\.(tsx|ts)$/, '');
  const type = filename.endsWith('.tsx') ? 'tsx' : 'ts';

  const purpose = extractPurpose(content, name);
  const exports = extractExports(content);
  const imports = extractImports(content);
  const tabs = detectTabs(content, filename);
  const functions = extractFunctionsWithDocs(content);
  const codeHash = await hashString(content.slice(0, 10000)); // hash first 10k chars

  const interfaces = exports
    .filter(e => e.type === 'interface' || e.type === 'type')
    .map(e => e.name);

  const dataPurpose = detectDataPurpose(content);

  return {
    path: filePath,
    name,
    type,
    rawContent: content,
    purpose: dataPurpose ? `${purpose} [Data: ${dataPurpose}]` : purpose,
    exports,
    imports,
    tabs,
    functions,
    interfaces,
    codeHash,
    lastModified: Date.now(),
  };
}

/**
 * Scan a BotanIA file and index it into Qdrant
 */
export async function scanAndIndex(
  filePath: string,
  content: string
): Promise<void> {
  const scanned = await scanFile(filePath, content);

  // Build searchable text for embedding
  const searchableText = buildSearchableText(scanned);

  // Generate embedding
  const vector = await generateEmbedding(searchableText);

  // Upsert to Qdrant
  await upsertPoint('botania_components', scanned.path, vector, {
    path: scanned.path,
    name: scanned.name,
    type: scanned.type,
    purpose: scanned.purpose,
    exports: scanned.exports.map(e => e.name),
    exports_detail: scanned.exports,
    imports: scanned.imports,
    tabs: scanned.tabs,
    functions: scanned.functions,
    interfaces: scanned.interfaces,
    codeHash: scanned.codeHash,
    lastModified: scanned.lastModified,
  });
}

/**
 * Build a searchable text from scanned file
 */
function buildSearchableText(s: ScannedFile): string {
  const parts: string[] = [];

  parts.push(s.name);
  parts.push(s.purpose);
  parts.push(...s.exports.map(e => e.name));

  if (s.functions.length > 0) {
    parts.push('FONCTIONS:');
    s.functions.forEach(f => {
      parts.push(`${f.name}: ${f.description}`);
    });
  }

  if (s.interfaces.length > 0) {
    parts.push('INTERFACES:');
    parts.push(...s.interfaces);
  }

  parts.push('ONGLETS:');
  parts.push(...s.tabs);

  return parts.join('\n');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// ─── Full project scan ────────────────────────────────────────────────────────

/**
 * Scan all BotanIA source files
 * Returns list of file paths that should be scanned
 */
export function getFilesToScan(): string[] {
  // This would be called server-side via glob or readdir
  // For now, we return known important files
  return [
    'src/components/game/HologramEvolution.tsx',
    'src/components/game/Jardin.tsx',
    'src/components/game/SerreJardinView.tsx',
    'src/components/game/Pepiniere.tsx',
    'src/components/game/Boutique.tsx',
    'src/components/game/GrainCollection.tsx',
    'src/components/game/GardenJournal.tsx',
    'src/components/game/LunarCalendar.tsx',
    'src/components/game/HarvestTracker.tsx',
    'src/components/game/PlantIdentifier.tsx',
    'src/components/game/DiseaseDetector.tsx',
    'src/components/game/IAJardinier.tsx',
    'src/components/game/EnhancedHUD.tsx',
    'src/components/game/GameHUD.tsx',
    'src/components/game/WeatherEffects.tsx',
    'src/components/game/WaterBudget.tsx',
    'src/components/game/JardinPlacementControls.tsx',
    'src/lib/ai-engine.ts',
    'src/lib/ai-advisor.ts',
    'src/lib/ia-jardinier.ts',
    'src/lib/gdd-engine.ts',
    'src/lib/hydro-engine.ts',
    'src/lib/companion-matrix.ts',
    'src/lib/weather-service.ts',
    'src/lib/lunar-calendar.ts',
    'src/lib/notification-system.ts',
    'src/lib/garden-memory.ts',
    'src/lib/lia-data.ts',
    'src/store/game-store.ts',
  ];
}
