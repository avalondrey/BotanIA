// ═══════════════════════════════════════════════════════════
//  📦 Garden Export/Import System
//  Exporte et importe un jardin complet en JSON
//  Pour backup ou partage entre joueurs
// ═══════════════════════════════════════════════════════════

import { getAllSlots, type SaveSlot } from './save-manager';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExportedGarden {
  version: string;
  exportedAt: string;
  gameVersion: string;
  garden: ExportGardenData;
  stats: ExportStats;
  /** Hash pour vérifier l'intégrité */
  checksum?: string;
}

export interface ExportGardenData {
  gardenWidthCm: number;
  gardenHeightCm: number;
  plants: ExportPlant[];
  tanks: ExportTank[];
  zones: ExportZone[];
}

export interface ExportPlant {
  id: string;
  plantDefId: string;
  plotId?: string;
  position?: { x: number; y: number };
  stage: number;
  health: number;
  waterLevel: number;
  plantedAt: string;
  /** GDD accumulés */
  gddAccumulated: number;
  /** Stade actuel GDD target */
  currentGDDTarget: number;
}

export interface ExportTank {
  id: string;
  name: string;
  capacityL: number;
  currentLevelL: number;
  roofAreaM2: number;
  efficiency: number;
  isActive: boolean;
  isPuit?: boolean;
}

export interface ExportZone {
  id: string;
  type: 'serre' | 'pepiniere' | 'jardin';
  widthCm: number;
  heightCm: number;
}

export interface ExportStats {
  totalPlants: number;
  totalHarvests: number;
  totalCoinsEarned: number;
  daysPlayed: number;
  plantsGrown: string[];
}

// ─── Encode/Decode (pour share codes) ─────────────────────────────────────────

/**
 * Encode un garden exporté en base64 (pour share code URL).
 * Limité à ~2000 caractères pour les URLs.
 */
export function encodeGardenToShareCode(exported: ExportedGarden): string {
  try {
    const json = JSON.stringify(exported);
    // Compression simple via encodeURIComponent + base64
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch {
    return '';
  }
}

/**
 * Decode un share code en ExportedGarden.
 */
export function decodeShareCode(code: string): ExportedGarden | null {
  try {
    const decoded = decodeURIComponent(atob(code));
    return JSON.parse(decoded) as ExportedGarden;
  } catch {
    return null;
  }
}

// ─── Export Garden ────────────────────────────────────────────────────────────

/**
 * Exporte le jardin depuis un slot de sauvegarde.
 * Retourne l'export complet ou null si erreur.
 */
export async function exportGardenFromSlot(slotId: string): Promise<ExportedGarden | null> {
  const slot = await getAllSlots().then(s => s.find(x => x.slotId === slotId));
  if (!slot) return null;

  const gameState = slot.gameState;
  if (!gameState) return null;

  const garden = gameState.garden;
  if (!garden) return null;

  // Extract plants
  const plants: ExportPlant[] = (garden.plants || [])
    .filter((p: any) => p.id && p.plantDefId)
    .map((p: any) => ({
      id: p.id,
      plantDefId: p.plantDefId,
      plotId: p.plotId,
      position: p.position,
      stage: p.stage ?? 0,
      health: p.health ?? 100,
      waterLevel: p.waterLevel ?? 50,
      plantedAt: p.plantedAt ?? new Date().toISOString(),
      gddAccumulated: p.gddAccumulated ?? 0,
      currentGDDTarget: p.currentGDDTarget ?? 0,
    }));

  // Extract tanks
  const tanks: ExportTank[] = (garden.tanks || [])
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      capacityL: t.capacityL,
      currentLevelL: t.currentLevelL,
      roofAreaM2: t.roofAreaM2 ?? 0,
      efficiency: t.efficiency ?? 0.8,
      isActive: t.isActive ?? true,
      isPuit: t.isPuit,
    }));

  // Extract zones
  const zones: ExportZone[] = (garden.zones || [])
    .map((z: any) => ({
      id: z.id,
      type: z.type ?? 'jardin',
      widthCm: z.widthCm ?? 300,
      heightCm: z.heightCm ?? 200,
    }));

  // Extract stats
  const stats: ExportStats = {
    totalPlants: plants.length,
    totalHarvests: gameState.economy?.totalHarvests ?? 0,
    totalCoinsEarned: gameState.economy?.totalCoinsEarned ?? 0,
    daysPlayed: gameState.daysPlayed ?? 0,
    plantsGrown: [...new Set(plants.map(p => p.plantDefId))],
  };

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    gameVersion: '2.4.0',
    garden: {
      gardenWidthCm: garden.gardenWidthCm ?? 300,
      gardenHeightCm: garden.gardenHeightCm ?? 200,
      plants,
      tanks,
      zones,
    },
    stats,
  };
}

/**
 * Exporte le jardin vers un fichier JSON téléchargeable.
 */
export async function exportGardenToFile(slotId: string): Promise<boolean> {
  const exported = await exportGardenFromSlot(slotId);
  if (!exported) return false;

  const json = JSON.stringify(exported, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const filename = `botania_garden_${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return true;
}

// ─── Import Garden ────────────────────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  error?: string;
  warnings?: string[];
  /** Slot ID créé */
  slotId?: string;
}

/**
 * Importe un jardin depuis un fichier JSON.
 * Crée un nouveau slot de sauvegarde.
 */
export async function importGardenFromFile(): Promise<ImportResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ success: false, error: 'Aucun fichier sélectionné' });
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text) as ExportedGarden;
        const result = await importGardenFromData(data);
        resolve(result);
      } catch (err) {
        resolve({ success: false, error: err instanceof Error ? err.message : 'Erreur de lecture' });
      }
    };
    input.click();
  });
}

/**
 * Importe un jardin depuis un objet ExportedGarden.
 */
export async function importGardenFromData(data: ExportedGarden): Promise<ImportResult> {
  const warnings: string[] = [];

  // Validate
  if (!data.version || !data.garden) {
    return { success: false, error: 'Format invalide' };
  }

  if (!data.garden.plants) {
    return { success: false, error: 'Aucune plante dans l\'export' };
  }

  // Check version compatibility
  if (data.gameVersion && data.gameVersion !== '2.4.0') {
    warnings.push(`Version différente (${data.gameVersion}) — certaines données peuvent être incompatibles`);
  }

  // Build a minimal game state for the slot
  const gameState = {
    garden: {
      gardenWidthCm: data.garden.gardenWidthCm,
      gardenHeightCm: data.garden.gardenHeightCm,
      plants: data.garden.plants.map((p: ExportPlant) => ({
        ...p,
        // Ensure required fields
        stageDurations: [14, 28, 35, 42],
        currentStage: p.stage ?? 0,
        health: p.health ?? 100,
        waterLevel: p.waterLevel ?? 50,
        plantedAt: p.plantedAt ?? new Date().toISOString(),
        gddAccumulated: p.gddAccumulated ?? 0,
        currentGDDTarget: p.currentGDDTarget ?? 0,
      })),
      tanks: data.garden.tanks ?? [],
      zones: data.garden.zones ?? [],
    },
    economy: {
      totalHarvests: data.stats.totalHarvests ?? 0,
      totalCoinsEarned: data.stats.totalCoinsEarned ?? 0,
    },
    daysPlayed: data.stats.daysPlayed ?? 0,
  };

  // Generate a slot ID
  const slotId = `imported-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const slotName = `Importé (${new Date().toLocaleDateString('fr-FR')})`;

  try {
    // Use save-manager to create the slot
    const { saveToSlot } = await import('./save-manager');
    await saveToSlot(slotId, slotName, gameState, false);

    return { success: true, warnings: warnings.length > 0 ? warnings : undefined, slotId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur lors de l\'import' };
  }
}

/**
 * Importe depuis un share code (base64).
 */
export async function importGardenFromShareCode(code: string): Promise<ImportResult> {
  const data = decodeShareCode(code);
  if (!data) {
    return { success: false, error: 'Code invalide ou corrompu' };
  }
  return importGardenFromData(data);
}

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Valide la structure d'un export sans l'importer.
 */
export function validateExport(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Format invalide'] };
  }

  const d = data as Record<string, unknown>;

  if (typeof d.version !== 'string') errors.push('version manquante');
  if (!d.garden || typeof d.garden !== 'object') errors.push('garden manquant');
  else {
    const garden = d.garden as Record<string, unknown>;
    if (!Array.isArray(garden.plants)) errors.push('plants manquant ou invalide');
    if (garden.gardenWidthCm && typeof garden.gardenWidthCm !== 'number') errors.push('gardenWidthCm invalide');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Retourne un aperçu de l'export sans l'importer.
 */
export function previewExport(data: unknown): {
  plantCount: number;
  tankCount: number;
  speciesCount: number;
  exportedAt: string;
  gameVersion: string;
} | null {
  const validated = validateExport(data);
  if (!validated.valid) return null;

  const d = data as ExportedGarden;
  const plants = d.garden.plants ?? [];
  const species = new Set(plants.map((p: ExportPlant) => p.plantDefId));

  return {
    plantCount: plants.length,
    tankCount: (d.garden.tanks ?? []).length,
    speciesCount: species.size,
    exportedAt: d.exportedAt,
    gameVersion: d.gameVersion,
  };
}
