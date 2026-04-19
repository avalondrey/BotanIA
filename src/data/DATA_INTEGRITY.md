# BotanIA Data Integrity — Règles de Validation

> Document vital pour la cohérence des données BotanIA.
> Toute modification de HologramEvolution.tsx DOIT respecter ces règles.

---

## Règles Fondamentales

### 1. plantDefId — Clés dans HologramEvolution.tsx

- **Pas de doublons** : une même plante ne peut pas apparaître deux fois (ex: `tomato:` et `'tomato':` → doublon)
- **Format** : ID kebab-case, minuscules, sans accents (`photinia`, `eleagnus`, `blackcurrant`)
- **Source unique** : PLANT_CARDS, TREE_CARDS, et PLANT_DATA sont les seules sources de vérité pour les données botaniques

### 2. plantCategory — Catégories valides

| Valeur | Description | Exemples |
|--------|-------------|----------|
| `vegetable` | Plantes potagères annuelles | tomato, carrot, lettuce, basil |
| `hedge` | Arbustes de haie | photinia, eleagnus, thuya, escallonia, cornus |
| `fruit-tree` | Arbres fruitiers | apple, pear, cherry, hazel, walnut |
| `forest-tree` | Arbres forestiers/d'ornement | oak, pine, birch, maple, magnolia |

**Règle** : Les arbres fruitiers以南 (`apple-golden`, `apple-gala`, etc.) doivent avoir `plantCategory: 'fruit-tree'`, pas `forest-tree`.

### 3. plantFamily — Familles botaniques valides

| Famille | Plantes |
|---------|---------|
| Solanaceae | tomato, pepper, eggplant |
| Cucurbitaceae | cucumber, zucchini, squash, melon |
| Fabaceae | bean, pea |
| Brassicaceae | cabbage, radish |
| Asteraceae | lettuce, sunflower, quinoa |
| Apiaceae | parsley, carrot |
| Amaranthaceae | quinoa, amaranth, spinach |
| Lamiaceae | basil |
| Rosaceae | strawberry, apple, pear, cherry, photinia, eleagnus, cornus |
| Rosaceae (hedge) | thuya (non, c'est un Cupressaceae) |
| Poaceae | corn |
| Polygonaceae | sorrel |
| Lardizabalaceae | akebia |
| Grossulariaceae | currant, blackcurrant, gooseberry, josta, casseille |
| Oleaceae | oleaster (eleagnus), olive, ash |
| Cupressaceae | thuya, cedar, cypress |
| Lauraceae | laurel (laurus) |
| Ericaceae | strawberry tree (arbousier) |
| Magnoliaceae | magnolia |

### 4. Validation Obligatoire

Après modification de HologramEvolution.tsx :

```bash
npm run validate-plant-data
```

Si erreur → corriger AVANT de commiter.

### 5. Entrées Manquantes — Procédure

1. Lancer `npm run validate-plant-data` — liste les plantDefId manquants
2. Lancer `npm run generate-plantcards --fix` — génère les entrées depuis CARD_DATA
3. Copier manuellement les entrées générées dans HologramEvolution.tsx
4. Vérifier plantCategory et plantFamily manuellement
5. Relancer `npm run validate-plant-data` pour confirmer

### 6. Sprite Editor — Correspondance

Le dashboard (`public/dashboard.html`) scanne les sprites avec cette logique :

```javascript
const hedgeList = ['photinia','eleagnus','casseille','thuya','escallonia','cornus'];
const isHedge = plantCategory === 'hedge' || hedgeList.includes(plantDefId);
const isTree = !isHedge && (plantCategory === 'fruit-tree' || plantCategory === 'forest-tree');
const stageCount = (isTree || isHedge) ? 5 : 6;
```

Si une nouvelle haie est ajoutée, vérifier qu'elle est dans `hedgeList` OU qu'elle a `plantCategory: 'hedge'`.

---

## Structure HologramEvolution.tsx

```
PLANT_CARDS (vegetables)
TREE_CARDS (fruit-trees, forest-trees, hedges)
PLANT_DATA (data by plantDefId, referenced by code)
```

Chaque entrée PlantCard contient :
- `tBase`, `tCap` : températures de base et plafond (°C)
- `stageGDD` : accumulateurs GDD pour chaque stade
- `kc` : coefficient cultural FAO-56
- `waterNeedMmPerDay` : besoin en eau (mm/jour)
- `stageDurations` : durée de chaque stade en jours
- `companions` : plantes compagnes/ennemies
- `plantCategory` : vegetable | fruit-tree | forest-tree | hedge
- `plantFamily` : famille botanique

---

## Erreurs Courantes

### Erreur 1 : Doublon de clé quotée

```typescript
// ❌ Erreur — doublon
tomato: { id: 'tomato', ... }
'tomato': { id: 'tomato', ... }  // DOUBLON

// ✅ Correct
tomato: { id: 'tomato', ... }
```

**Nettoyage** : `npm run cleanup-hologram --fix`

### Erreur 2 : plantCategory érroné

```typescript
// ❌ Erreur — Photinia est une haie
photinia: { ... plantCategory: 'vegetable' }

// ✅ Correct
photinia: { ... plantCategory: 'hedge', plantFamily: 'Rosaceae' }
```

### Erreur 3 : plantFamily 'Unknown'

```typescript
// ❌ Erreur — famille botanique non renseignée
eleagnus: { ... plantFamily: 'Unknown' }

// ✅ Correct
eleagnus: { ... plantFamily: 'Rosaceae' }
```

---

## Tests

```bash
npm test                          # Tous les tests
npm run test -- src/lib/__tests__/water-budget.test.ts   # Tests hydriques
npm run test -- src/__tests__/gdd-engine.test.ts          # Tests GDD
```

43 tests minimum doivent passer.
