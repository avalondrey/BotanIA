// ─── Import game-store pour créer jumeau ──────────────────────────────────────
import { useGameStore } from '@/store/game-store';

// ─── Helper: Mapper nom de plante → plantDefId ────────────────────────────────
function mapPlantNameToDefId(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes('tomate')) return 'tomato';
  if (lower.includes('poivron') || lower.includes('piment')) return 'pepper';
  if (lower.includes('laitue') || lower.includes('salade')) return 'lettuce';
  if (lower.includes('carotte')) return 'carrot';
  if (lower.includes('basilic')) return 'basil';
  if (lower.includes('fraise')) return 'strawberry';
  return null;
}
