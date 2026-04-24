/**
 * usePlantCatalog — Récupère le catalogue Pokedex depuis le microservice
 *
 * Source de vérité externalisée : ajoutez une plante dans le microservice,
 * BotanIA la récupère automatiquement au prochain refresh.
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export interface CatalogPlant {
  plantDefId: string;
  displayName: string;
  emoji: string;
  shopId: string;
  category: string;
  catalogSource: string;
  spritesComplete: boolean;
  plantuleComplete: boolean;
  overallStatus: string;
  plantFamily?: string;
}

const MICRO_URL = (process.env.NEXT_PUBLIC_AI_MICROSERVICE_URL || '').replace(/\/$/, '');

async function fetchCatalog(): Promise<CatalogPlant[]> {
  if (!MICRO_URL) return [];
  const res = await fetch(`${MICRO_URL}/api/pokedex/plants`, {
    headers: { 'X-Botania-Version': '2.2.0' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.plants || []).map((p: Record<string, unknown>) => ({
    plantDefId: String(p.plantDefId ?? p.id ?? ''),
    displayName: String(p.displayName ?? p.name ?? 'Inconnu'),
    emoji: String(p.emoji ?? '🌱'),
    shopId: String(p.shopId ?? 'unknown'),
    category: String(p.category ?? 'vegetable'),
    catalogSource: String(p.catalogSource ?? ''),
    spritesComplete: Boolean(p.spritesComplete),
    plantuleComplete: Boolean(p.plantuleComplete),
    overallStatus: String(p.overallStatus ?? 'unknown'),
    plantFamily: p.plantFamily ? String(p.plantFamily) : undefined,
  }));
}

export function usePlantCatalog() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['plant-catalog'],
    queryFn: fetchCatalog,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    plants: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Erreur catalogue') : null,
    refetch,
  };
}
