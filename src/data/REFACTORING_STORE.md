# Refactoring Store — Découpage Monolithique

**Date :** 2026-04-11  
**Version :** v2.2.0

## Contexte

`game-store.ts` était un monolithe de 4 374 lignes contenant tout l'état du jeu : économie, pépinière, jardin, simulation météo, UI, persistence manuelle via ~30 appels `localStorage`. Cela rendait le développement difficile et les bugs difficiles à tracer.

## Architecture après refactoring

```
game-store.ts (1 290 lignes)
  └─ Facade UI + délégation aux sous-stores
  └─ Réexporte types/constantes pour compatibilité arrière
  └─ initGame() orchestre l'initialisation
  └─ loadGameState() restaure l'état dans tous les sous-stores

catalog.ts (1 700 lignes)
  └─ Données statiques pures (aucun état mutable)
  └─ SEED_CATALOG, PLANTULE_CATALOG, SEED_VARIETIES, CHAMBRE_CATALOG, etc.

shop-store.ts (224 lignes)
  └─ Économie : coins, ecoPoints, ecoLevel, score, bestScore
  └─ Inventaire : seedCollection, plantuleCollection, seedVarieties
  └─ Actions : buySeeds, buyPlantule, buySeedVariety, addEcoPoints, etc.
  └─ Persistence : botania-shop (Zustand persist)

nursery-store.ts (513 lignes)
  └─ Pépinière : pepiniere (PlantState[])
  └─ Mini-serres : miniSerres (MiniSerre[])
  └─ Chambres de culture : ownedChambres, activeChambreId
  └─ Sélection : selectedMiniSerreId, selectedSlot
  └─ Actions : placeSeedInPepiniere, waterPlantPepiniere, etc.
  └─ Cross-store : importe useShopStore pour _consumeSeed
  └─ Persistence : botania-nursery (Zustand persist)

garden-store.ts (559 lignes)
  └─ Jardin : gardenPlants, gardenWidthCm/HeightCm
  └─ Zones serre : gardenSerreZones
  └─ Objets : gardenTrees, gardenHedges, gardenTanks, gardenSheds, gardenDrums, gardenZones
  └─ Actions : placePlantInGarden, harvestPlantGarden, buyTank, moveGardenPlant, etc.
  └─ Cross-store : importe useShopStore, useNurseryStore
  └─ Persistence : botania-garden (Zustand persist)

simulation-store.ts (324 lignes)
  └─ Temps : day, season
  └─ Météo : weather, realWeather, gpsCoords, weatherLoading, weatherError
  └─ Contrôles : speed, isPaused, alerts, harvested
  └─ Actions : tick() (moteur de simulation), togglePause, setSpeed, etc.
  └─ Cross-store : importe useShopStore, useNurseryStore, useGardenStore, useAchievementStore
  └─ Persistence : botania-simulation (Zustand persist, partialize sur day/season)

garden-types.ts (112 lignes)
  └─ Types et constantes partagés entre game-store et garden-store
  └─ Brise la dépendance circulaire (game-store ↔ garden-store)
  └─ GardenPlant, SerreZone, GardenTree, GardenHedge, etc.
  └─ DEFAULT_GARDEN_WIDTH_CM, MAX_GARDEN_WIDTH_CM, etc.
```

## Dépendances cross-store

```
shop-store  ← (aucun import de store)
nursery-store → shop-store (pour _consumeSeed)
garden-store → shop-store (pour coins), nursery-store (pour transplant)
simulation-store → shop-store, nursery-store, garden-store, achievement-store, sound-manager
game-store (facade) → shop-store, nursery-store, garden-store, simulation-store
```

## Persistence

Avant : ~30 appels manuels `localStorage.setItem/getItem` éparpillés dans `game-store.ts`.

Après : chaque sous-store utilise Zustand `persist` middleware avec `partialize` pour ne sauvegarder que l'état nécessaire.

| Store | Clé localStorage | Données persistées |
|---|---|---|
| shop-store | `botania-shop` | seedCollection, plantuleCollection, seedVarieties, coins, ecoPoints, ecoLevel, score, bestScore |
| nursery-store | `botania-nursery` | pepiniere, miniSerres, ownedChambres, activeChambreId, selectedMiniSerreId, selectedSlot, hologramSettings, serreTiles |
| garden-store | `botania-garden` | gardenPlants, gardenSerreZones, gardenTrees, gardenHedges, gardenTanks, gardenSheds, gardenDrums, gardenZones, gardenWidthCm, gardenHeightCm |
| simulation-store | `botania-simulation` | day, season |

## Compatibilité arrière

`game-store.ts` continue d'exporter tous les types et constantes (via réexport depuis `catalog.ts` et `garden-types.ts`). Les 34 fichiers consommateurs utilisent toujours `useGameStore` sans modification.

## Bug corrigé : date bloquée au 1er janvier

**Cause racine :**
1. `GardenSaveManager.tsx` ligne 239 : `createJardinReel()` utilisait `day: 1` au lieu de `getTodayDayOfYear()`
2. `game-store.ts` `loadGameState()` : restaurait `state.day` tel quel sans appliquer la logique de rattrapage

**Fix :**
- `GardenSaveManager.tsx` : `day: getTodayDayOfYear()`, `season: getSeason(getTodayDayOfYear())`
- `loadGameState()` : recalcul du jour si `|restoredDay - today| > 30` ou `restoredDay < 1 || restoredDay > 365`

## noImplicitAny: true

Activé dans `tsconfig.json` en supprimant `"noImplicitAny": false` (hérité de `strict: true`). Deux erreurs corrigées :
- `detect-disease/route.ts` : paramètre `p` typé explicitement
- `game-store.ts` : bloc mort `ZONE_MODIFIERS["serre_tile"]` retiré