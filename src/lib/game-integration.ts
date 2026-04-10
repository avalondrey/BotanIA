import { getPlantAdviceSafe } from './plant-advice';

// 📦 Persistance locale
const STORAGE_KEY = 'botanIA_garden_v1';
export function saveGardenState(state: any) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }
export function loadGardenState(): any { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }

// 💡 Déclencheur IA automatique
const advicePendingSet = new WeakSet<object>();

export async function triggerAutoAdvice(
  plant: { name: string; stage: number; health: number; needsWater: boolean },
  weather: { timeLabel?: string; weatherLabel?: string },
  zone: 'pepiniere' | 'serre' | 'jardin',
  onAdvice?: (text: string) => void
) {
  if ((plant.health < 30 || plant.needsWater) && !advicePendingSet.has(plant)) {
    advicePendingSet.add(plant);
    const q = plant.health < 30 ? "Ma plante va mal, que faire ?" : "Elle a besoin d'eau, conseil ?";
    const w = weather || { timeLabel: "Jour", weatherLabel: "Normal" };
    const advice = await getPlantAdviceSafe(plant.name, plant.stage, w.timeLabel!, w.weatherLabel!, zone, q);
    if (advice && onAdvice) onAdvice(advice);
    setTimeout(() => { advicePendingSet.delete(plant); }, 60000); // Cooldown 1min
  }
}

// 🎒 Utilitaires inventaire
export type InventoryItem = { id: string; type: 'seed' | 'tool'; name: string; qty: number; icon: string; };
export function useInventory() {
  const inv = loadGardenState().inventory || [];
  const addItem = (item: InventoryItem) => { /* logique à brancher au store */ };
  const removeItem = (id: string, qty = 1) => { /* logique à brancher au store */ };
  return { inv, addItem, removeItem };
}
