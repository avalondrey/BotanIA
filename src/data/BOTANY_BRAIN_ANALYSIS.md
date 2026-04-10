# BotanIA - Analyse du Cerveau Botanique

## HologramEvolution.tsx — Le Cerveau Botanique Invisible

```
┌─────────────────────────────────────────────────────┐
│  🌱 CARTE MÉMOIRE BOTANIQUE (invisible)            │
│                                                     │
│  Chaque graine/plant/plantule/arbre a SA carte     │
│  avec ses données réelles :                         │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ TOMATE                                      │  │
│  │ • Tbase: 10°C | Tcap: 30°C                 │  │
│  │ • GDD stades: [50, 200, 400, 800]          │  │
│  │ • Kc FAO: 1.05                             │  │
│  │ • Besoin eau: 5.5 mm/jour                   │  │
│  │ • Temp sol min semis: 15°C                  │  │
│  │ • Companonnage: basilic✓, choux✗             │  │
│  │ • Risques: mildiou, oïdium                  │  │
│  │ • Stades: [7j, 21j, 28j, 45j]              │  │
│  │ • Jours récolte: ~109j                      │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  → Cette carte ALIMENTE tous les calculs            │
│  → useAgroData.ts l'utilise                        │
│  → Les plants dans le jardin s'y réfèrent          │
│  → C'est INVISIBLE mais INDISPENSABLE              │
└─────────────────────────────────────────────────────┘
```

## Rôle du Module

**HologramEvolution.tsx** est le module de données et calculs botaniques.

### Caractéristiques

1. Module de données pures (pas de JSX/UI)
2. Fonctions de calcul botanique exportées
3. Constantes/tableaux de données réelles par plante
4. Hook `usePlantCard(plantDefId)` qui retourne toutes les données agronomiques

### Exports principaux

```typescript
export function getPlantCard(plantDefId: string): PlantCard
export function calcGDD(tMean, tMin, tMax, plantDefId): number
export function getWaterNeed(plantDefId, et0, ctx): number
export function getCompanions(plantDefId): Companion[]
export function getDiseaseRisks(plantDefId, weather): DiseaseRisk
export function getStageInfo(plantDefId, currentStage): StageInfo
```

---

## Architecture Actuelle

```
HologramEvolution.tsx (données pures / le cerveau)
        │
        ▼ utilise
useAgroData.ts (calculs temps réel)
        │
        ▼ alimente
GardenPlanView.tsx (tooltip/badges UI)
GardenCardsView.tsx (badges UI)
```

---

## Analyse de Couverture

### 1. Plantes dans PLANT_CARDS (HologramEvolution)

| Plante | Status |
|--------|--------|
| tomato | ✅ |
| carrot | ✅ |
| lettuce | ✅ |
| strawberry | ✅ |
| basil | ✅ |
| pepper | ✅ |

**Total : 6 plantes** — utilisées pour les calculs agronomiques via `useAgroData`

### 2. CARD_DATA dans src/data/graines/ (jamais utilisées)

| Fichier | Variété | plantDefId | Status |
|---------|---------|------------|--------|
| clause/carrot-nationale-2.ts | Carotte Nationale 2 | carrot | ❌ Non importé |
| clause/cucumber-marketer.ts | Concombre Marketer | cucumber | ❌ Non importé |
| clause/lettuce-batavia.ts | Laitue Batavia | lettuce | ❌ Non importé |
| clause/pepper-california-wonder.ts | Poivron California Wonder | pepper | ❌ Non importé |
| clause/radish-flamboyant.ts | Radis Flamboyant | radish | ❌ Non importé |
| clause/zucchini-black-beauty.ts | Courgette Black Beauty | zucchini | ❌ Non importé |
| kokopelli/eggplant-longue-violette.ts | Aubergine Longue Violette | eggplant | ❌ Non importé |
| kokopelli/squash-butternut-coco.ts | Butternut Coco | squash | ❌ Non importé |
| kokopelli/tomato-brandywine.ts | Tomate Brandywine | tomato | ❌ Non importé |
| kokopelli/tomato-cherokee-purple.ts | Tomate Cherokee Purple | tomato | ❌ Non importé |
| kokopelli/tomato-green-zebra.ts | Tomate Green Zebra | tomato | ❌ Non importé |
| kokopelli/tomato-noire-de-crimee.ts | Tomate Noire de Crimée | tomato | ❌ Non importé |
| kokopelli/tomato-rose-de-berne.ts | Tomate Rose de Berne | tomato | ❌ Non importé |
| lebiau/bean-coco-blanc.ts | Haricot Coco Blanc | bean | ❌ Non importé |
| lebiau/cabbage-chou-milan.ts | Chou de Milan | cabbage | ❌ Non importé |
| lebiau/carrot-guerande.ts | Carotte de Guérande | carrot | ❌ Non importé |
| lebiau/carrot-robver.ts | Carotte Robver | carrot | ❌ Non importé |
| lebiau/lettuce-feuille-de-chene.ts | Laitue Feuille de Chêne | lettuce | ❌ Non importé |
| lebiau/lettuce-romaine.ts | Laitue Romaine | lettuce | ❌ Non importé |
| lebiau/spinach-merlon-vert.ts | Épinard Merlon Vert | spinach | ❌ Non importé |
| lebiau/tomato-marmande.ts | Tomate Marmande | tomato | ❌ Non importé |
| saintemarthe/basil-genoveeis.ts | Basilic Génovééis | basil | ❌ Non importé |
| saintemarthe/basil-marseillais.ts | Basilic Marseillais | basil | ❌ Non importé |
| saintemarthe/pea-douce-provence.ts | Pois Douce Provence | pea | ❌ Non importé |
| saintemarthe/pepper-doux-de-france.ts | Poivron Doux de France | pepper | ❌ Non importé |
| saintemarthe/strawberry-ciflorette.ts | Fraise Ciflorette | strawberry | ❌ Non importé |
| vilmorin/tomato-cocktail.ts | Tomate Cocktail | tomato | ❌ Non importé |
| vilmorin/tomato-coeur-de-boeuf.ts | Tomate Cœur de Bœuf | tomato | ❌ Non importé |

**Total : 28+ variétés** — CARD_DATA jamais importée/utilisée

### 3. CARD_DATA dans src/data/arbres/ (jamais utilisées)

| Fichier | Variété | plantDefId | Status |
|---------|---------|------------|--------|
| guignard/apple-golden.ts | Pommier Golden Delicious | apple | ❌ Non importé |
| guignard/apple-gala.ts | Pommier Gala | apple | ❌ Non importé |
| guignard/pear-williams.ts | Poirier Williams | pear | ❌ Non importé |
| inrae/cherry-bing.ts | Cerisier Bing | cherry | ❌ Non importé |
| inrae/walnut-franquette.ts | Noyer Franquette | walnut | ❌ Non importé |
| inrae/oak-pedoncule.ts | Chêne Pédonculé | oak | ❌ Non importé |
| arbres-tissot/apple-reine-reinettes.ts | Reine des Reinettes | apple | ❌ Non importé |
| arbres-tissot/apple-belle-fleur.ts | Belle Fleur | apple | ❌ Non importé |
| arbres-tissot/pear-conference.ts | Poirier Conférence | pear | ❌ Non importé |
| arbres-tissot/pear-louise-bonne.ts | Poirier Louise Bonne | pear | ❌ Non importé |
| pepinieres-bordas/birch-betula.ts | Bouleau | birch | ❌ Non importé |
| pepinieres-bordas/magnolia-grandiflora.ts | Magnolia | magnolia | ❌ Non importé |
| pepinieres-bordas/maple-platanoides.ts | Érable | maple | ❌ Non importé |
| pepinieres-bordas/pine-sylvestris.ts | Pin Sylvestre | pine | ❌ Non importé |
| fruitiers-forest/apple-reinette-du-canada.ts | Reinette du Canada | apple | ❌ Non importé |
| fruitiers-forest/pear-beurre-hardy.ts | Beurre Hardy | pear | ❌ Non importé |
| fruitiers-forest/cherry-montmorency.ts | Cerisier Montmorency | cherry | ❌ Non importé |
| fruitiers-forest/lemon-meyer.ts | Citronnier Meyer | lemon | ❌ Non importé |
| fruitiers-forest/orange-valencia-late.ts | Oranger Valencia Late | orange | ❌ Non importé |

**Total : 19+ arbres** — CARD_DATA jamais importée/utilisée

---

## Sources de Données Botaniques Multiples

| Source | Fichier | Plantes | Usage |
|--------|---------|---------|-------|
| PLANTS | `ai-engine.ts` | 6 | Nom, image, stades (via PLANTS[plantDefId]) |
| PLANT_CARDS | `HologramEvolution.tsx` | 6 | Calculs agronomiques (via useAgroData) |
| SEED_CATALOG | `game-store.ts` | 6 | Boutique, prix, marques |
| CARD_DATA | `src/data/graines/*/` | 28+ | ❌ **INUTILISÉ** |
| CARD_DATA | `src/data/arbres/*/` | 19+ | ❌ **INUTILISÉ** |

### Points de Conflit Détectés

1. **PLANTS vs PLANT_CARDS** : Mêmes 6 plantes avec données légèrement différentes
   - Exemple : `waterNeed` diverge entre les deux sources
   - Exemple : `stageDurations` peut varier

2. **CARD_DATA non exploité** : Les 28+ fichiers de variétés et 19+ fichiers d'arbres contiennent des données complètes mais ne sont jamais importés

3. **Pas de PlantCard pour les arbres** : `PLANT_CARDS` ne couvre que 6 légumes/herbes, aucun arbre fruitier ou forestier

---

## Fonctions Utilisées dans HologramEvolution

| Fonction | Utilisée par | Status |
|----------|--------------|--------|
| `PLANT_CARDS` | useAgroData | ✅ |
| `getCompanions()` | useAgroData | ✅ |
| `getSoilStatus()` | useAgroData | ✅ |
| `getDiseaseRisks()` | useAgroData | ✅ |
| `getWaterUrgency()` | useAgroData | ✅ |
| `calcDailyGDD()` | useAgroData (via gdd-engine) | ✅ |
| `usePlantCard()` | (existe mais non utilisée ailleurs) | ⚠️ |
| `getStageProgression()` | (jamais utilisée) | ❌ |
| `getWaterNeed()` | (jamais utilisée) | ❌ |

### Problèmes de Fonctions

- **`getStageProgression`** : `daysToNextStage` retourne toujours `99` (non calculé)
- **`getWaterNeed`** : `waterSavingPct` toujours `0`, `breakdown` toujours vide (les vrais calculs sont dans `hydro-engine.ts`)

---

## Prochaines Étapes Possibles

1. **Fusionner PLANTS et PLANT_CARDS** en une seule source de vérité
2. **Importer CARD_DATA** des fichiers variétés pour enrichir les données
3. **Ajouter des PlantCards** pour les arbres fruitiers et forestiers
4. **Corriger getStageProgression** pour calculer réellement `daysToNextStage`
5. **Supprimer les données en double** dans `ai-engine.ts`

---

*Document généré le 2026-04-07*
