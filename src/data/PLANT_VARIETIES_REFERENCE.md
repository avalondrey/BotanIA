# BotanIA - Référence des Variétés (CARD_DATA)

## Vue d'ensemble

Ce fichier recense **toutes les variétés** présentes dans `src/data/graines/*/` et `src/data/arbres/*/`.

Ces données `CARD_DATA` servent de **référence statique** pour :
- Créer de nouvelles cartes via l'admin panel
- Documenter les propriétés des variétés spécifiques
- Être importées manuellement lors de l'ajout au catalogue runtime

> ⚠️ **Important** : Ces fichiers `CARD_DATA` ne sont **pas importés automatiquement** dans le runtime. Ils doivent être intégrés manuellement dans `HologramEvolution.tsx` via une PlantCard.

---

## Variétés de Graines

### Tomatoes (Solanaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Brandywine | `kokopelli/tomato-brandywine.ts` | tomato | 115 | 48 | Heirloom américaine, chair rose |
| Cherokee Purple | `kokopelli/tomato-cherokee-purple.ts` | tomato | - | - | - |
| Green Zebra | `kokopelli/tomato-green-zebra.ts` | tomato | - | - | - |
| Noire de Crimée | `kokopelli/tomato-noire-de-crimee.ts` | tomato | - | - | - |
| Rose de Berne | `kokopelli/tomato-rose-de-berne.ts` | tomato | - | - | - |
| Marmande | `lebiau/tomato-marmande.ts` | tomato | - | - | - |
| Cœur de Bœuf | `vilmorin/tomato-coeur-de-boeuf.ts` | tomato | - | - | - |
| Cocktail | `vilmorin/tomato-cocktail.ts` | tomato | - | - | - |

### Carottes (Apiaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Nationale 2 | `clause/carrot-nationale-2.ts` | carrot | - | - | - |
| de Guérande | `lebiau/carrot-guerande.ts` | carrot | - | - | - |
| Robver | `lebiau/carrot-robver.ts` | carrot | - | - | - |

### Laitues (Asteraceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Batavia | `clause/lettuce-batavia.ts` | lettuce | - | - | - |
| Feuille de Chêne | `lebiau/lettuce-feuille-de-chene.ts` | lettuce | - | - | - |
| Romaine | `lebiau/lettuce-romaine.ts` | lettuce | - | - | - |

### Aubergines (Solanaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Longue Violette | `kokopelli/eggplant-longue-violette.ts` | eggplant | - | - | - |

### Concombres/Courges (Cucurbitaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Marketer (Concombre) | `clause/cucumber-marketer.ts` | cucumber | 70 | 30 | - |
| Black Beauty (Courgette) | `clause/zucchini-black-beauty.ts` | zucchini | 55 | 32 | - |
| Butternut Coco | `kokopelli/squash-butternut-coco.ts` | squash | - | - | - |

### Haricots (Fabaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Coco Blanc | `lebiau/bean-coco-blanc.ts` | bean | 100 | 30 | Haricot à écosser sec |

### Choux (Brassicaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Chou de Milan | `lebiau/cabbage-chou-milan.ts` | cabbage | - | - | - |

### Épinards (Amaranthaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Merlon Vert | `lebiau/spinach-merlon-vert.ts` | spinach | - | - | - |

### Poivrons/Piments (Solanaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| California Wonder | `clause/pepper-california-wonder.ts` | pepper | - | - | - |
| Doux de France | `saintemarthe/pepper-doux-de-france.ts` | pepper | - | - | - |

### Radis (Brassicaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Flamboyant | `clause/radish-flamboyant.ts` | radish | - | - | - |

### Basilic (Lamiaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Génovééis | `saintemarthe/basil-genoveeis.ts` | basil | - | - | - |
| Marseillais | `saintemarthe/basil-marseillais.ts` | basil | - | - | - |

### Fraisiers (Rosaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Ciflorette | `saintemarthe/strawberry-ciflorette.ts` | strawberry | - | - | - |

### Pois (Fabaceae)

| Variété | Fichier | plantDefId | Jours Récolte | Prix | Notes |
|---------|---------|------------|---------------|------|-------|
| Douce Provence | `saintemarthe/pea-douce-provence.ts` | pea | - | - | - |

---

## Arbres Fruitiers

> ✅ **Statut** : Cartes arbres maintenant intégrées dans `HologramEvolution.tsx` (TREE_CARDS).
> Les plantDefId ci-dessous correspondent aux entrées dans `TREE_CARDS`.

### Pommiers (Malus)

| Variété | Fichier | plantDefId | Shop | Prix | Notes |
|---------|---------|------------|------|------|-------|
| Golden Delicious | `guignard/apple-golden.ts` | apple | guignard | 150 | - |
| Gala | `guignard/apple-gala.ts` | apple | guignard | - | - |
| Reine des Reinettes | `arbres-tissot/apple-reine-reinettes.ts` | apple | arbres-tissot | - | - |
| Belle Fleur | `arbres-tissot/apple-belle-fleur.ts` | apple | arbres-tissot | - | - |
| Reinette du Canada | `fruitiers-forest/apple-reinette-du-canada.ts` | apple | fruitiers-forest | - | - |

### Poiriers (Pyrus)

| Variété | Fichier | plantDefId | Shop | Prix | Notes |
|---------|---------|------------|------|------|-------|
| Williams | `guignard/pear-williams.ts` | pear | guignard | - | - |
| Conférence | `arbres-tissot/pear-conference.ts` | pear | arbres-tissot | - | - |
| Louise Bonne | `arbres-tissot/pear-louise-bonne.ts` | pear | arbres-tissot | - | - |
| Beurre Hardy | `fruitiers-forest/pear-beurre-hardy.ts` | pear | fruitiers-forest | - | - |

### Cerisiers (Prunus)

| Variété | Fichier | plantDefId | Shop | Prix | Notes |
|---------|---------|------------|------|------|-------|
| Bing | `inrae/cherry-bing.ts` | cherry | inrae | - | - |
| Montmorency | `fruitiers-forest/cherry-montmorency.ts` | cherry | fruitiers-forest | - | - |

### Citronniers (Citrus)

| Variété | Fichier | plantDefId | Shop | Prix | Notes |
|---------|---------|------------|------|------|-------|
| Meyer | `fruitiers-forest/lemon-meyer.ts` | lemon | fruitiers-forest | - | Réserve |

### Orangers (Citrus)

| Variété | Fichier | plantDefId | Shop | Prix | Notes |
|---------|---------|------------|------|------|-------|
| Valencia Late | `fruitiers-forest/orange-valencia-late.ts` | orange | fruitiers-forest | - | Réserve |

---

## Arbres Forestiers

| Variété | Fichier | plantDefId | Shop | Notes |
|---------|---------|------------|------|-------|
| Chêne Pédonculé | `inrae/oak-pedoncule.ts` | oak | inrae | - |
| Noyer Franquette | `inrae/walnut-franquette.ts` | walnut | inrae | - |
| Bouleau | `pepinieres-bordas/birch-betula.ts` | birch | pepinieres-bordas | - |
| Magnolia | `pepinieres-bordas/magnolia-grandiflora.ts` | magnolia | pepinieres-bordas | - |
| Érable | `pepinieres-bordas/maple-platanoides.ts` | maple | pepinieres-bordas | - |
| Pin Sylvestre | `pepinieres-bordas/pine-sylvestris.ts` | pine | pepinieres-bordas | - |

---

## plantDefId Non Couverts par PLANT_CARDS

Ces `plantDefId` ont des `CARD_DATA` mais **n'ont pas de PlantCard** dans `HologramEvolution.tsx` :

- [ ] `cucumber`
- [ ] `zucchini`
- [ ] `squash`
- [ ] `eggplant`
- [ ] `bean`
- [ ] `cabbage`
- [ ] `spinach`
- [ ] `radish`
- [ ] `pea`
- [ ] `apple` (arbre)
- [ ] `pear` (arbre)
- [ ] `cherry` (arbre)
- [ ] `lemon` (arbre)
- [ ] `orange` (arbre)
- [ ] `walnut` (arbre)
- [ ] `oak` (arbre)
- [ ] `birch` (arbre)
- [ ] `magnolia` (arbre)
- [ ] `maple` (arbre)
- [ ] `pine` (arbre)

---

## Comment Ajouter une Variété au Catalogue Runtime

1. Ouvrir le fichier `CARD_DATA` correspondant dans `src/data/graines/` ou `src/data/arbres/`
2. Créer une `PlantCard` dans `HologramEvolution.tsx` → `BOTANY_CATALOG`
3. Mapper les données :
   - `CARD_DATA.conditions.temperature.base` → `PlantCard.tBase`
   - `CARD_DATA.gameData.waterNeed` → `PlantCard.waterNeedMmPerDay`
   - `CARD_DATA.gameData.stageDurations` → `PlantCard.stageDurations`
   - etc.
4. Ajouter le compagnonnage et les maladies si connu
5. La variété sera automatiquement disponible via `getPlantCard(plantDefId)`

---

*Document généré le 2026-04-07*
