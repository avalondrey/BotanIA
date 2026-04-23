/**
 * useBiodiversityScore — Calcule un indice de biodiversité du jardin
 *
 * Basé sur :
 * 1. Richesse en familles botaniques (Shannon index simplifié)
 * 2. Présence de fleurs mellifères (plantes attirant pollinisateurs)
 * 3. Diversité de hauteurs / strates
 * 4. Couverture sol (pas de terre nue)
 *
 * Score : 0-100
 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { PLANT_CARDS } from '@/components/game/HologramEvolution';

const MELLIFEROUS_PLANTS = new Set([
  'sunflower', 'basil', 'parsley', 'lavender', 'thyme', 'rosemary',
  'sage', 'mint', 'strawberry', 'bean', 'pea', 'radish',
  'cucumber', 'zucchini', 'squash', 'melon',
]);

interface BiodiversityResult {
  score: number;           // 0-100
  familyCount: number;     // Nb familles botaniques
  speciesCount: number;    // Nb espèces uniques
  melliferousCount: number;// Nb plantes mellifères
  coveragePct: number;     // % couverture sol
  grade: string;           // A-F
}

export function useBiodiversityScore(): BiodiversityResult {
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const gardenTrees = useGameStore((s) => s.gardenTrees);
  const gardenHedges = useGameStore((s) => s.gardenHedges);

  return useMemo(() => {
    const allPlantIds = [
      ...gardenPlants.map((p) => p.plantDefId),
    ];

    if (allPlantIds.length === 0) {
      return { score: 0, familyCount: 0, speciesCount: 0, melliferousCount: 0, coveragePct: 0, grade: 'F' };
    }

    // 1. Familles botaniques uniques
    const families = new Set<string>();
    for (const id of allPlantIds) {
      const card = PLANT_CARDS[id];
      if (card?.plantFamily) families.add(card.plantFamily);
    }
    const familyCount = families.size;

    // 2. Espèces uniques
    const species = new Set(allPlantIds);
    const speciesCount = species.size;

    // 3. Mellifères
    const melliferousCount = allPlantIds.filter((id) => MELLIFEROUS_PLANTS.has(id)).length;

    // 4. Couverture sol estimée (simplifié : chaque plante = ~0.5m², chaque arbre = ~4m²)
    const totalArea = gardenPlants.length * 0.5 + gardenTrees.length * 4 + gardenHedges.length * 1.5;
    // Jardin standard ~10m²
    const coveragePct = Math.min(100, Math.round((totalArea / 10) * 100));

    // Score pondéré
    const familyScore = Math.min(40, familyCount * 8);        // max 40 pts
    const speciesScore = Math.min(25, speciesCount * 5);      // max 25 pts
    const melliScore = Math.min(20, melliferousCount * 4);   // max 20 pts
    const coverScore = Math.min(15, Math.round(coveragePct / 7)); // max 15 pts

    const score = Math.min(100, familyScore + speciesScore + melliScore + coverScore);

    let grade: string;
    if (score >= 80) grade = 'A';
    else if (score >= 60) grade = 'B';
    else if (score >= 40) grade = 'C';
    else if (score >= 20) grade = 'D';
    else grade = 'F';

    return { score, familyCount, speciesCount, melliferousCount, coveragePct, grade };
  }, [gardenPlants, gardenTrees, gardenHedges]);
}
