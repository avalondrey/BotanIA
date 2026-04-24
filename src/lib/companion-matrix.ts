// ═══════════════════════════════════════════════════════════
//  🌿 Companion Planting Matrix — Compagnonnage Botanique Réel
//  Sources : INRAE, Éliot Coleman, "Jardin en Mouvement",
//            Royal Horticultural Society
//
//  Règle : associations RÉELLES vérifiées agronomiquement.
//  Effets : allélopathie, attraction auxiliaires, répulsion ravageurs.
// ═══════════════════════════════════════════════════════════

import { resolveBasePlantId } from '@/lib/botany-constants';

export type CompanionEffect =
  | 'repels_aphids'
  | 'repels_whitefly'
  | 'repels_carrot_fly'
  | 'attracts_pollinators'
  | 'nitrogen_fix'
  | 'allelopathy_weed'
  | 'root_competition'
  | 'stunts_growth'
  | 'improves_flavor'
  | 'shade_conflict';

export interface CompanionRelation {
  plant: string;
  type: 'beneficial' | 'harmful';
  effects: CompanionEffect[];
  /** Note agronomique pour l'IA */
  reason: string;
}

export const COMPANION_MATRIX: Record<string, CompanionRelation[]> = {
  tomato: [
    { plant: 'basil',     type: 'beneficial', effects: ['repels_whitefly', 'repels_aphids', 'improves_flavor'],
      reason: 'Le basilic repousse mouches blanches et pucerons. Améliore le goût de la tomate (source : RHS).' },
    { plant: 'carrot',    type: 'beneficial', effects: ['attracts_pollinators'],
      reason: 'Les carottes ameublissent le sol autour des racines de tomate. Association classique.' },
    { plant: 'lettuce',   type: 'beneficial', effects: ['allelopathy_weed'],
      reason: 'La laitue couvre le sol et limite les adventices sous les tomates.' },
    { plant: 'pepper',    type: 'harmful',    effects: ['root_competition', 'shade_conflict'],
      reason: 'Piment et tomate : même famille, compétition racinaire + maladies partagées (mildiou).' },
    { plant: 'strawberry',type: 'harmful',    effects: ['stunts_growth'],
      reason: 'La fraise libère des composés allélopathiques freinent la tomate (source : Coleman).' },
  ],
  carrot: [
    { plant: 'lettuce',   type: 'beneficial', effects: ['allelopathy_weed'],
      reason: 'Laitue/carotte : colonnes différentes du sol, pas de compétition, couverture bénéfique.' },
    { plant: 'basil',     type: 'beneficial', effects: ['repels_carrot_fly'],
      reason: 'L\'odeur du basilic brouille les phéromones de la mouche de la carotte.' },
    { plant: 'tomato',    type: 'beneficial', effects: ['attracts_pollinators'],
      reason: 'Association complémentaire classique maraîchage français.' },
    { plant: 'pepper',    type: 'harmful',    effects: ['root_competition'],
      reason: 'Piment et carotte : racines profondes similaires, compétition directe en minéraux.' },
  ],
  basil: [
    { plant: 'tomato',    type: 'beneficial', effects: ['repels_whitefly', 'repels_aphids', 'improves_flavor'],
      reason: 'Association la plus documentée du maraîchage : basilic + tomate = synergie totale.' },
    { plant: 'pepper',    type: 'beneficial', effects: ['repels_aphids'],
      reason: 'Le basilic repousse les pucerons qui affectionnent le piment.' },
    { plant: 'lettuce',   type: 'beneficial', effects: ['attracts_pollinators'],
      reason: 'Basilic fleuri attire abeilles bénéfiques aux légumes feuilles voisins.' },
    { plant: 'strawberry',type: 'harmful',    effects: ['root_competition'],
      reason: 'Compétition hydrique : les deux plantes ont des besoins en eau comparables au même niveau racinaire.' },
  ],
  lettuce: [
    { plant: 'carrot',    type: 'beneficial', effects: ['allelopathy_weed'],
      reason: 'Duo classique : lettuce en surface, carotte en profondeur. Aucune compétition.' },
    { plant: 'strawberry',type: 'beneficial', effects: ['allelopathy_weed'],
      reason: 'La laitue couvre le sol entre les fraisiers, limitant le travail de binage.' },
    { plant: 'basil',     type: 'beneficial', effects: ['attracts_pollinators'],
      reason: 'Basil fleuri attire les pollinisateurs vers la zone de culture.' },
  ],
  strawberry: [
    { plant: 'lettuce',   type: 'beneficial', effects: ['allelopathy_weed'],
      reason: 'La laitue couvre l\'espace inter-rangs de fraisiers et évite les mauvaises herbes.' },
    { plant: 'tomato',    type: 'harmful',    effects: ['stunts_growth'],
      reason: 'Allélopathie fraise → tomate documentée. Éviter le voisinage.' },
    { plant: 'basil',     type: 'harmful',    effects: ['root_competition'],
      reason: 'Compétition eau à la même profondeur racinaire.' },
  ],
  pepper: [
    { plant: 'basil',     type: 'beneficial', effects: ['repels_aphids'],
      reason: 'Basilic repousse les pucerons très attirés par le piment.' },
    { plant: 'tomato',    type: 'harmful',    effects: ['root_competition', 'shade_conflict'],
      reason: 'Solanacées : partagent exactement les mêmes maladies fongiques et parasites.' },
    { plant: 'carrot',    type: 'harmful',    effects: ['root_competition'],
      reason: 'Les deux cultures ont des besoins comparables en profondeur et minéraux.' },
  ],
};

export type BadgeId =
  | 'first_companion'
  | 'permaculture_duo'
  | 'permaculture_trio'
  | 'master_companion'
  | 'no_conflict_garden'
  | 'all_beneficials';

export interface CompanionBadge {
  id: BadgeId;
  label: string;
  emoji: string;
  description: string;
  condition: string;
}

export const COMPANION_BADGES: CompanionBadge[] = [
  { id: 'first_companion', label: 'Premier pas', emoji: '🌱',
    description: 'Placez votre première association bénéfique',
    condition: 'Une paire bénéfique dans le jardin' },
  { id: 'permaculture_duo', label: 'Duo Permaculture', emoji: '🤝',
    description: 'Tomate + Basilic côte à côte',
    condition: 'tomato adjacent à basil' },
  { id: 'permaculture_trio', label: 'Trio Maraîcher', emoji: '🌿',
    description: 'Trois cultures complémentaires au même endroit',
    condition: '3 cultures bénéfiques dans le même carré' },
  { id: 'master_companion', label: 'Maître Compagnon', emoji: '🏆',
    description: 'Jardin avec 5 associations bénéfiques actives',
    condition: '≥5 paires bénéfiques dans le jardin' },
  { id: 'no_conflict_garden', label: 'Paix Végétale', emoji: '☮️',
    description: 'Aucune association néfaste dans tout le jardin',
    condition: 'Zéro paire néfaste' },
  { id: 'all_beneficials', label: 'Jardin Harmonie', emoji: '🌍',
    description: 'Toutes les cultures en association bénéfique',
    condition: 'Toutes les plantes ont au moins un voisin bénéfique' },
];

/**
 * Analyse les plantes adjacentes sur la grille et retourne les relations actives.
 * adjacencyRadiusCm : distance max pour être "voisins" (défaut 100cm)
 */
export function analyzeCompanions(
  gardenPlants: Array<{ plantDefId: string; x: number; y: number }>,
  adjacencyRadiusCm = 100
): { beneficial: CompanionRelation[]; harmful: CompanionRelation[]; score: number } {
  const beneficial: CompanionRelation[] = [];
  const harmful: CompanionRelation[] = [];

  for (let i = 0; i < gardenPlants.length; i++) {
    for (let j = i + 1; j < gardenPlants.length; j++) {
      const a = gardenPlants[i];
      const b = gardenPlants[j];
      const dist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
      if (dist > adjacencyRadiusCm) continue;

      // Résoudre les variétés vers leur plante de base pour le companion lookup
      const baseA = resolveBasePlantId(a.plantDefId);
      const baseB = resolveBasePlantId(b.plantDefId);
      const relAB = COMPANION_MATRIX[baseA]?.find(r => r.plant === baseB);
      const relBA = COMPANION_MATRIX[baseB]?.find(r => r.plant === baseA);
      const rel = relAB || relBA;
      if (!rel) continue;
      if (rel.type === 'beneficial') beneficial.push(rel);
      else harmful.push(rel);
    }
  }

  // Score permaculture : +10 par bénéfique, -15 par néfaste
  const score = beneficial.length * 10 - harmful.length * 15;
  return { beneficial, harmful, score };
}

/**
 * Vérifie le compagnonnage pour UNE nouvelle plante placée sur la grille.
 * Retourne les relations avec les voisins existants.
 */
export function checkCompanionForNewPlant(
  newPlantDefId: string,
  newX: number,
  newY: number,
  existingPlants: Array<{ plantDefId: string; x: number; y: number }>,
  adjacencyRadiusCm = 100
): { beneficial: CompanionRelation[]; harmful: CompanionRelation[] } {
  const beneficial: CompanionRelation[] = [];
  const harmful: CompanionRelation[] = [];

  for (const existing of existingPlants) {
    const dist = Math.sqrt(Math.pow(newX - existing.x, 2) + Math.pow(newY - existing.y, 2));
    if (dist > adjacencyRadiusCm) continue;

    // Résoudre les variétés vers leur plante de base
    const newBase = resolveBasePlantId(newPlantDefId);
    const existingBase = resolveBasePlantId(existing.plantDefId);

    // Vérifie si newPlantDefId a une relation avec existing.plantDefId
    const relFromNew = COMPANION_MATRIX[newBase]?.find(r => r.plant === existingBase);
    // Vérifie aussi dans l'autre sens
    const relFromExisting = COMPANION_MATRIX[existingBase]?.find(r => r.plant === newBase);
    const rel = relFromNew || relFromExisting;

    if (!rel) continue;
    if (rel.type === 'beneficial') beneficial.push(rel);
    else harmful.push(rel);
  }

  return { beneficial, harmful };
}

/**
 * Vérifie quels badges sont débloqués.
 */
export function checkCompanionBadges(
  gardenPlants: Array<{ plantDefId: string; x: number; y: number }>
): BadgeId[] {
  const { beneficial, harmful } = analyzeCompanions(gardenPlants);
  const unlocked: BadgeId[] = [];

  if (beneficial.length >= 1) unlocked.push('first_companion');

  const hasBasilTomato = gardenPlants.some(p => p.plantDefId === 'basil') &&
    gardenPlants.some(p => p.plantDefId === 'tomato');
  if (hasBasilTomato) unlocked.push('permaculture_duo');

  if (beneficial.length >= 3) unlocked.push('permaculture_trio');
  if (beneficial.length >= 5) unlocked.push('master_companion');
  if (harmful.length === 0 && gardenPlants.length >= 2) unlocked.push('no_conflict_garden');

  const plantsWithBeneficialNeighbor = new Set(
    beneficial.flatMap(r => [r.plant])
  );
  if (gardenPlants.length >= 3 && plantsWithBeneficialNeighbor.size >= gardenPlants.length)
    unlocked.push('all_beneficials');

  return unlocked;
}
