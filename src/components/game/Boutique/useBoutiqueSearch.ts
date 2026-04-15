import { useMemo } from 'react';
import { SEED_SHOPS } from '@/store/game-store';
import type { SeedVariety } from '@/store/catalog';

export interface SearchItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  image: string;
  type: 'variety' | 'plantule' | 'seed-classic';
  shopId: string;
  shopName: string;
  shopEmoji: string;
  plantDefId: string;
  unlocked?: boolean;
  owned?: number;
}

export function useBoutiqueSearch(
  query: string,
  allVarieties: SeedVariety[],
  allPlantules: any[],
  seedCatalog: any[],
  plantuleCatalog: any[],
  seedVarietiesOwned: Record<string, number>,
  unlockedVarieties: Record<string, boolean>,
  plantuleCollection: Record<string, number>,
  seedCollection: Record<string, number>,
) {
  // Build unified search index once
  const searchIndex = useMemo(() => {
    const shopMap = new Map(SEED_SHOPS.map(s => [s.id, s]));

    const items: SearchItem[] = [];

    // Seed varieties
    for (const v of allVarieties) {
      const shop = shopMap.get(v.shopId);
      items.push({
        id: v.id,
        name: v.name,
        emoji: v.emoji,
        price: v.price,
        description: v.description || '',
        image: v.image,
        type: 'variety',
        shopId: v.shopId,
        shopName: shop?.name || v.shopId,
        shopEmoji: shop?.emoji || '🌱',
        plantDefId: v.plantDefId,
        unlocked: unlockedVarieties[v.id] ?? v.unlocked,
        owned: seedVarietiesOwned[v.id] || 0,
      });
    }

    // Plantules locales
    for (const p of allPlantules) {
      const shop = shopMap.get(p.shopId);
      items.push({
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        price: p.price,
        description: p.description || '',
        image: p.image,
        type: 'plantule',
        shopId: p.shopId,
        shopName: shop?.name || p.shopId,
        shopEmoji: shop?.emoji || '🌿',
        plantDefId: p.plantDefId,
        unlocked: unlockedVarieties[p.id] ?? p.unlocked,
        owned: plantuleCollection[p.plantDefId] || 0,
      });
    }

    // Classic seed catalog
    for (const s of seedCatalog) {
      items.push({
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        price: s.price,
        description: `${s.brand} — ${s.category}`,
        image: s.packetImage,
        type: 'seed-classic',
        shopId: s.brand?.toLowerCase?.() || '',
        shopName: s.brand || '',
        shopEmoji: '🌱',
        plantDefId: s.plantDefId,
        owned: seedCollection[s.id] || 0,
      });
    }

    // Classic plantule catalog
    for (const p of plantuleCatalog) {
      items.push({
        id: `plantule-${p.plantDefId}`,
        name: p.name,
        emoji: p.emoji,
        price: p.price,
        description: 'Plantule classique',
        image: '',
        type: 'plantule',
        shopId: '',
        shopName: '',
        shopEmoji: '🌿',
        plantDefId: p.plantDefId,
        owned: plantuleCollection[p.plantDefId] || 0,
      });
    }

    return items;
  }, [allVarieties, allPlantules, seedCatalog, plantuleCatalog, seedVarietiesOwned, unlockedVarieties, plantuleCollection, seedCollection]);

  // Filter by query
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    return searchIndex.filter(item => {
      if (item.name?.toLowerCase().includes(q)) return true;
      if (item.plantDefId?.toLowerCase().includes(q)) return true;
      if (item.shopName?.toLowerCase().includes(q)) return true;
      if (item.description?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [query, searchIndex]);

  return { results, searchIndex };
}