# Dashboard Agent

## Architecture

Le dashboard est une page Next.js (`/dashboard`) qui affiche :
1. Un **iframe** pointant vers `public/dashboard.html` (dashboard standalone)
2. Un **PokedexPanel** en bas affichant le catalogue de plantes

## Fichiers

| Fichier | Rôle |
|---------|------|
| `src/app/dashboard/page.tsx` | Page principale, pattern `mounted` pour éviter SSR |
| `src/app/dashboard/PokedexPanel.tsx` | Panel catalogue avec filtres |
| `src/app/dashboard/layout.tsx` | Layout dédié au dashboard |
| `src/hooks/usePlantCatalog.ts` | Hook React Query pour `/api/pokedex/plants` |

## PokedexPanel

### Filtres
- **Toutes** — toutes les plantes du catalogue
- **Complètes** — `overallStatus === '✅ COMPLET'`
- **Incomplètes** — tout le reste

### Données affichées
- Emoji + nom de la plante
- `plantDefId` (monospace)
- Famille botanique (si disponible)
- Statut global (vert/rouge)

### Cache
- `staleTime: 5 minutes` via React Query
- Bouton 🔄 pour forcer le refetch

## Environnement requis

```env
NEXT_PUBLIC_AI_MICROSERVICE_URL=https://votre-microservice.com
```

Sans cette variable, le catalogue retourne un tableau vide.
