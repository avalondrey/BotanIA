/**
 * COLLECTIVE DATA — Agrégation anonyme locale pour comparaison régionale
 * Stockage dans data/collective/aggregated.json
 * Aucune donnée individuelle — seulement des moyennes pondérées
 */

export interface PlantStats {
  avgDaysToMaturity: number;
  harvestCount: number;
  avgYield: number;
}

export interface RegionalStats {
  region: string; // ~50km grid cell, ex: "FR-44" (département)
  plants: Record<string, PlantStats>;
  updatedAt: string;
}

export interface CollectiveSubmission {
  plantId: string;
  avgDaysToMaturity: number;
  avgYield: number;
  seasonCount: number;
  region: string;
}

const COLLECTIVE_DIR = 'C:/Users/Administrateur/Desktop/BotanIA/data/collective';

/**
 * Charge les stats agrégées depuis le fichier local
 */
export async function loadCollectiveStats(region: string): Promise<RegionalStats | null> {
  try {
    const res = await fetch(`/api/collective?region=${encodeURIComponent(region)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.stats || null;
  } catch {
    return null;
  }
}

/**
 * Contribue des stats anonymisées (moyennes only)
 * Calcule une nouvelle moyenne pondérée
 */
export async function contributeAnonymizedStats(submission: CollectiveSubmission): Promise<boolean> {
  try {
    const res = await fetch('/api/collective', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'contribute', submission }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Calcule la comparaison entre les stats personnelles et la moyenne régionale
 * Retourne null si pas assez de données
 */
export function compareToRegional(
  myAvgMaturity: number,
  myPlantId: string,
  collectiveStats: RegionalStats | null
): string | null {
  if (!collectiveStats) return null;
  const regional = collectiveStats.plants[myPlantId.toLowerCase()];
  if (!regional || regional.harvestCount < 3) return null; // Need at least 3 data points in region

  const diff = myAvgMaturity - regional.avgDaysToMaturity;
  if (Math.abs(diff) < 3) return null; // less than 3 days — not significant

  const sign = diff > 0 ? 'en retard' : 'en avance';
  const days = Math.abs(Math.round(diff));
  return `Tu es ${days} jours ${sign} par rapport à la moyenne des jardiniers de ta région.`;
}

/**
 * Détermine la région à partir d'un code postal français
 */
export function regionFromPostcode(postcode: string): string {
  if (!postcode) return 'unknown';
  // French postcode: first 2 digits = department
  const dept = postcode.substring(0, 2);
  // Belgium: first 4 digits = province
  if (/^\d{4}$/.test(postcode)) return `BE-${postcode.substring(0, 2)}`;
  // Default: use department
  if (/^\d{5}$/.test(postcode)) return `FR-${dept}`;
  return postcode.toUpperCase().substring(0, 6);
}
