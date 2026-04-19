# BotanIA — Scripts de Maintenance & Validation

Ce dossier contient les scripts de maintenance pour BotanIA. Tous utilisent `npx tsx` pour exécuter TypeScript directement.

---

## Scripts de Validation

### `validate-plant-data.ts`

Valide l'intégrité des données dans `HologramEvolution.tsx`.

```bash
npm run validate-plant-data
# ou
npx tsx scripts/validate-plant-data.ts
```

**Vérifications :**
1. **TREE_CARDS** — totalDaysToHarvest, firstHarvestYears, stageGDD, stageDurations
2. **plantDefId** — tous les ID du catalog existent dans PLANT_CARDS/TREE_CARDS
3. **plantCategory** — vegetable / fruit-tree / forest-tree / hedge
4. **companions** — plantDefId compagnes valides, type correct, reason non vide

**Règles plantCategory :**
| Catégorie | Description | Exemples |
|-----------|-------------|----------|
| `vegetable` | Plantes potagères | tomato, carrot, lettuce |
| `hedge` | Arbustes de haie | photinia, eleagnus, thuya |
| `fruit-tree` | Arbres fruitiers | apple, pear, cherry |
| `forest-tree` | Arbres forestiers | oak, pine, maple |

**Règles compagnes :**
- `plantId` doit exister dans PLANT_CARDS ou TREE_CARDS
- `type` doit être `'beneficial'` ou `'harmful'`
- `reason` doit avoir au moins 5 caractères

---

### `cleanup-hologram.ts`

Supprime les entrées dupliquées dans `HologramEvolution.tsx`.

```bash
# Aperçu des doublons sans modifier
npm run cleanup-hologram -- --dry-run

# Applique les suppressions
npm run cleanup-hologram -- --fix
```

**Problème résolu :** Certaines plantes avaient deux entrées (une sans guillemets, une avec guillemets) :
```typescript
// Doublon ❌
tomato: { id: 'tomato', ... }
'tomato': { id: 'tomato', ... }  // DUPLICATA

// Correct ✅
tomato: { id: 'tomato', ... }
```

---

### `generate-plantcards.ts`

Génère automatiquement des PlantCards depuis les fichiers `CARD_DATA` dans `src/data/graines/`.

```bash
# Aperçu des entrées à générer
npm run generate-plantcards

# Génère et affiche les entrées (copier manuellement)
npm run generate-plantcards -- --fix
```

**Problème résolu :** Quand de nouvelles plantes sont ajoutées dans `src/data/graines/`, leurs PlantCards ne sont pas automatiquement créées dans `HologramEvolution.tsx`.

---

## Scripts de Génération

### `generate-cards.ts`

Génère les cartes de jeu BotanIA (assets sprites).

```bash
npm run generate-cards
```

---

### `generate-sprite-sheets.ts`

Combine les sprites individuels en sprite sheets PNG + WebP. Réduction de 60-80% du poids.

```bash
npx tsx scripts/generate-sprite-sheets.ts
npx tsx scripts/generate-sprite-sheets.ts --preview  # Aperçu
npx tsx scripts/generate-sprite-sheets.ts --check    # Vérifie sans générer
```

**Résultats :**
- 9 sprite sheets générés dans `public/sprites/`
- PNG: 4.5MB → WebP: 576KB (basil) = **87% de réduction**
- 431 fichiers PNG convertis → **90% de réduction totale**

**Fichiers générés :**
- `public/sprites/*.webp` — sprite sheets WebP
- `src/styles/sprites.css` — CSS des sprites
- `src/lib/sprite-sheets.ts` — mapping TypeScript
- `public/sprites/sprite-sheets.json` — données JSON

**Utilisation :**
```typescript
import { SPRITE_SHEETS, getSpritePosition } from '@/lib/sprite-sheets';
import '@/styles/sprites.css';

// CSS class
<div class={`sprite-tomato stage-${stage}`} />

// Ou via position CSS
const pos = getSpritePosition("tomato", 3);
// → { x: 384, y: 0, width: 128, height: 128 }
```

---

### `optimize-images.ts`

Convertit automatiquement tous les PNG en WebP qualité 85 avec conservation de l'alpha.

```bash
npx tsx scripts/optimize-images.ts        # Conversion
npx tsx scripts/optimize-images.ts --dry-run   # Aperçu
npx tsx scripts/optimize-images.ts --check     # Stats seules
```

**Résultat :** 388MB → 38MB (**90% de réduction**)

**Fonctionne pour :**
- `public/plants/*.png` → `*.webp`
- `public/trees/*.png` → `*.webp`
- `public/cards/*.png` → `*.webp`
- Tous les PNG du répertoire `public/`

**Les PNG originaux sont conservés** pour référence. Supprimez-les après vérification.

---

## Hook Pre-commit

### `pre-commit-hook.sh`

Hook Git qui valide les données avant chaque commit.

```bash
# Installation
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Ce qu'il fait :**
1. Lance `npx tsc --noEmit` — vérification TypeScript
2. Lance `npx tsx scripts/validate-plant-data.ts` — validation données botaniques

Si l'une des deux validations échoue, le commit est bloqué.

---

## Notes

- Tous les scripts TypeScript utilisent `#!/usr/bin/env npx tsx` en shebang
- Les paths sont résolus dynamiquement via `__dirname`
- Les scripts de validation sont intégrés dans le hook pre-commit
