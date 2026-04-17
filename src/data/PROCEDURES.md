# BotanIA - Procedures & Documentation

## Liens

- **GitHub**: https://github.com/avalondrey/BotanIA
- **Application locale**: `http://localhost:3000` (lancer avec `npm run dev`)

---

## Procedures Automatisees

### 1. Auto-Import CARD_DATA (HologramEvolution)

Ce script lit automatiquement tous les fichiers `CARD_DATA` dans `src/data/graines/*/` et `src/data/arbres/*/` et met a jour `HologramEvolution.tsx`.

```bash
# Verifier si des mises a jour sont disponibles
npx tsx scripts/auto-import.ts --check-only

# Previsualiser les changements (dry-run)
npx tsx scripts/auto-import.ts --dry-run

# Appliquer les changements + commit git
npx tsx scripts/auto-import.ts --write
```

**Workflow standard:**
1. Ajouter/modifier un fichier dans `src/data/graines/` ou `src/data/arbres/`
2. Lancer `npx tsx scripts/auto-import.ts --dry-run` pour voir le code genere
3. Lancer `npx tsx scripts/auto-import.ts --write` pour appliquer et commiter

**Fichiers suivis:**
- `scripts/auto-import.ts` — Script principal
- `src/components/game/HologramEvolution.tsx` — Cerveau botanique (PLANT_CARDS + TREE_CARDS)
- `src/data/graines/**/` — 28 fichiers de donnees semences
- `src/data/arbres/**/` — 19 fichiers de donnees arbres

---

### 2. Parser CARD_DATA (lecture seule)

Pour debug ou explorer les donnees sans modifier HologramEvolution:

```bash
# Voir ce que le parser extrait
npx tsx scripts/auto-import.ts --dry-run
```

---

## Structure des Donnees

### PlantCard (HologramEvolution.tsx)

```typescript
interface PlantCard {
  id: string;
  plantCategory?: 'vegetable' | 'fruit-tree' | 'forest-tree';

  // Temperature (°C)
  tBase: number;        // Seuil de croissance
  tCap: number;          // Temperature plafond

  // GDD accumulateurs
  stageGDD: [number, number, number, number];

  // Eau (FAO)
  kc: number;                    // Coefficient cultural
  waterNeedMmPerDay: number;     // Besoin mm/jour

  // Sol
  minSoilTempForSowing: number;
  optimalSoilTemp: number;

  // Lumiere
  lightNeedHours: number;

  // Stades
  stageDurations: [number, number, number, number];

  // Companonnage
  companions: CompanionRelation[];

  // Maladies
  diseaseRisks: DiseaseRisk[];

  // Calendrier
  optimalPlantMonths: number[];   // 0=Jan, 11=Dec
  harvestSeason: string[];

  // Donnees globales
  totalDaysToHarvest: number;
  plantFamily: string;
  droughtResistance: number;     // 0-1
  diseaseResistance: number;      // 0-1
  pestResistance: number;         // 0-1

  // Arbres uniquement
  matureTreeHeight?: number;      // m
  treeSpread?: number;            // m
  treeLifespan?: number;          // ans
  firstHarvestYears?: number;
  annualYield?: string;
  treeData?: {
    pollinationType: string;
    pollinator?: string | null;
    frostResistance: number;
    soilType: string;
    soilPH: string;
    pruningNotes: string;
    fruitEdible: boolean;
  };
}
```

### Règles de Validation pour Arbres

> ⚠️ **CRITIQUE** : Ces règles DOIVENT être respectées lors de la génération de PlantCard pour les arbres.

#### `totalDaysToHarvest` — VALEURS CORRECTES

| Type d'arbre | Valeur correcte | Équivalent | Erreur fréquente |
|-------------|-----------------|------------|------------------|
| Fruitiers à noyau (pêche, prune, cerise, abricot) | **1095-1460** | 3-4 ans | 5475, 5110 |
| Fruitiers à pepins (pomme, poire, coing) | **1825** | 5 ans | 5475 |
| Agrumes (orange, citron) | **1460** | 4 ans | 4380 |
| Noisetier | **2190** | 6 ans | OK |
| Noyer | **2920** | 8 ans | 6570 |
| Arbres forestiers/ornement | **5475-10950** | 15-30 ans | OK |

#### `firstHarvestYears` — RÈGLE

```
firstHarvestYears = totalDaysToHarvest / 365 (arrondi)

Exemples :
- 1825 / 365 = 5 → firstHarvestYears: 5
- 1460 / 365 = 4 → firstHarvestYears: 4
- 2920 / 365 = 8 → firstHarvestYears: 8
```

#### `stageDurations` — RÈGLE POUR ARBRES

```
Arbres (fruitiers et forestiers) : [45, 90, 180, 365]
PAS : [30, 60, 120, 180] ou [6, 15, 21, 18]
```

#### `stageGDD` — RÈGLE POUR ARBRES

```
Arbres : [200, 400, 800, 1500] minimum
PAS de valeurs type légume : [6, 15, 21, 18]
```

#### `plantCategory` — OBLIGATOIRE

```
Pour tous les arbres : plantCategory: 'fruit-tree' ou 'forest-tree'
Pour les légumes : plantCategory: 'vegetable' ou absent
```

#### `treeData` — OBLIGATOIRE POUR ARBRES

```
treeData doit exister avec :
{
  pollinationType: string;
  pollinator?: string | null;
  frostResistance: number;  // température min en °C (ex: -25)
  soilType: string;
  soilPH: string;
  pruningNotes: string;
  fruitEdible: boolean;
}
```

### CARD_DATA (fichiers src/data/)

Structure des fichiers semences:
```typescript
CARD_DATA = {
  id: string;           // "carrot-nationale-2"
  plantDefId: string;   // "carrot" (categorie)
  shopId: string;       // "clause"
  category: "vegetable" | "fruit-tree" | "ornamental-tree";
  name: string;
  emoji: string;
  price: number;
  gameData: {
    stageDurations: number[];
    realDaysToHarvest: number | null;
    optimalTemp: number | [number, number] | { min: number; max: number };
    waterNeed: number;
    lightNeed: number;
  };
  conditions: {
    temperature: { base: number; optimal: number; max: number; frostResistance?: number };
    waterNeeds: string;
    soil?: { ph: string; type: string; amendment?: string };
    light: { needs: number };
  };
  period?: {
    sowing?: { indoor?: string[] | null; outdoor?: string[] | null };
    harvest?: string[];
    planting?: string[];
    dormancy?: string[];
  };
  companions?: string[];
  enemies?: string[];
  growth?: {
    firstHarvest?: string | null;
    matureTreeHeight?: string | null;
    spread?: string | null;
    lifespan?: string | null;
  };
  pollination?: { type: string; pollinator?: string | null };
  yield?: { amount?: string | null; fruitSize?: string | null };
  notes?: string;
}
```

---

## Architecture BotanIA

### Flux des donnees

```
src/data/graines/*/   ──parse──>  HologramEvolution.tsx
src/data/arbres/*/    ──parse──>  PLANT_CARDS + TREE_CARDS
                                        │
                                        ▼
                              useAgroData.ts (hook)
                                        │
                                        ▼
                         GardenPlanView, GardenCardsView, Boutique
```

### Sources de donnees

| Source | Type | Usage |
|--------|------|-------|
| `PLANT_CARDS` (HologramEvolution) | Runtime | Cerveau botanique — calculs GDD, eau, compagnonage |
| `TREE_CARDS` (HologramEvolution) | Runtime | Arbres fruitiers/forestiers |
| `PLANTS` (ai-engine.ts) | Legacy | Definitions plant (nom, emoji, image, stades) |
| `SEED_CATALOG` (game-store.ts) | Boutique | Catalogue boutique avec prix, categories |
| `CARD_DATA` (src/data/) | Reference | Donnees brutes semenciers (pas auto-importees) |

### Regle importante

- `HologramEvolution.tsx` est la **seule source de verite** pour les calculs agronomiques au runtime
- `ai-engine.ts` (PLANTS) contient des donnees redondantes pour la creation de cartes
- `CARD_DATA` dans `src/data/` sert de **reference statique** — modifiee manuellement par les semenciers

---

## Commandes Utiles

```bash
# Lancer le serveur local
npm run dev

# Build production
npm run build

# TypeScript check
npx tsc --noEmit --skipLibCheck

# Voir les differences git
git diff --stat

# Status git
git status

# Commit changements
git add . && git commit -m "description"
```

---

## Ajouter une nouvelle plante

1. Creer le fichier `CARD_DATA` dans `src/data/graines/<semencier>/<nom>.ts`
2. Lancer `npx tsx scripts/auto-import.ts --dry-run` pour verifier
3. Lancer `npx tsx scripts/auto-import.ts --write` pour integrer
4. Verifier que la plante s'affiche dans la boutique et le jeu

---

## Ajouter un nouvel arbre

1. Creer le fichier `CARD_DATA` dans `src/data/arbres/<semencier>/<nom>.ts`
2. Lancer `npx tsx scripts/auto-import.ts --dry-run` pour verifier
3. Lancer `npx tsx scripts/auto-import.ts --write` pour integrer
4. Verifier que l'arbre s'affiche dans la boutique

---

## Codes Emoji par defaut pour stades (3 routes)

```typescript
// Route JARDIN (6 stades)
jardin:    ['🌰', '🌱', '🪴', '🏡', '🌿', '🍅'],

// Route MINI-SERRE (6 stades)
miniserre: ['🌰', '🌱', '🌿', '🌱', '🌿', '🌸'],

// Route PLANTULE (5 stades)
plantule:  ['🌸', '🟢', '📈', '🟠', '🍅'],
```

> **Règle** : `ROUTE_STAGE_LABELS` dans `growth-routes.ts` définit les labels — les emojis correspondent index par index.

---

## Points EcoSystem

Le systeme de validation des gestes ecologiques (Preuve de Geste Ecologique) utilise:

- API: `POST /api/scan-gesture`
- Modele: Ollama Vision (bakllava/llava) en local
- Gestes valides: paillage (15pts), compost (20pts), recup eau (10pts)
- Niveau 0-10, 50 pts par niveau

---

*Derniere mise a jour: 2026-04-08*
