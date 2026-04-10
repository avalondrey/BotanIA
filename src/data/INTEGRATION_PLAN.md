# BotanIA - Plan d'Intégration du Cerveau Botanique

## Résumé de la Refonte

### Avant

```
PLANTS (ai-engine.ts) ← utilisé pour nom/image/stade
PLANT_CARDS (HologramEvolution) ← utilisé pour calculs agro
SEED_CATALOG (game-store) ← utilisé pour boutique
CARD_DATA (data/graines/*/) ← INUTILISÉ
CARD_DATA (data/arbres/*/) ← INUTILISÉ
```

### Après

```
┌──────────────────────────────────────────────────────────────┐
│                  HologramEvolution.tsx                       │
│                                                               │
│  PLANT_CARDS = 15 plantes                                   │
│  TREE_CARDS = 14 arbres fruitiers et forestiers            │
│                                                               │
│  Plantes :                                                    │
│  ✅ tomato, carrot, lettuce, strawberry, basil, pepper       │
│  ✅ cucumber, zucchini, bean, pea, spinach, radish            │
│  ✅ cabbage, eggplant                                         │
│                                                               │
│  Arbres :                                                     │
│  ✅ apple, apple-gala, apple-golden                          │
│  ✅ pear, cherry, hazelnut, walnut                           │
│  ✅ orange, lemon                                            │
│  ✅ oak, birch, maple, pine, magnolia                         │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │ useAgroData.ts         │
         │ (aucun changement)       │
         └─────────────────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │ GardenPlanView.tsx      │
         │ GardenCardsView.tsx     │
         │ Boutique.tsx             │
         └─────────────────────────┘
```

## Étapes d'Intégration

### Étape 1 : Validation ✅ (Terminé)

- [x] HologramEvolution.tsx mis à jour avec 15 PlantCards
- [x] Descriptions de stades ajoutées pour toutes les plantes
- [x] Compagnonnage corrigé (oregano → marjoram)

### Étape 2 : Tests (À faire)

- [ ] Vérifier que `useAgroData.ts` fonctionne avec les nouvelles plantes
- [ ] Vérifier que `GardenPlanView` affiche les badges pour cucumber, zucchini, etc.
- [ ] Vérifier que `getCompanions()` fonctionne pour les nouvelles plantes

### Étape 3 : Arbres ✅ (Terminé 2026-04-08)

Les arbres ont maintenant des PlantCards dans `TREE_CARDS` dans `HologramEvolution.tsx`.

Arbres ajoutés :
- apple, apple-gala, apple-golden (Rosaceae)
- pear (Rosaceae)
- cherry (Rosaceae)
- hazelnut (Betulaceae)
- walnut (Juglandaceae)
- orange, lemon (Rutaceae)
- oak (Fagaceae)
- birch (Betulaceae)
- maple (Sapindaceae)
- pine (Pinaceae)
- magnolia (Magnoliaceae)

Chaque arbre inclut : matureTreeHeight, treeSpread, treeLifespan, firstHarvestYears, annualYield, et treeData (pollinisation, frostResistance, soilType, pruningNotes, fruitEdible).

### Étape 4 : CARD_DATA Variétés (À faire)

Les 28+ fichiers `CARD_DATA` dans `src/data/graines/*/` et `src/data/arbres/*/` ne sont **toujours pas importés**.

Pour les utiliser :
1. Créer un script qui génère les PlantCards à partir des CARD_DATA
2. Ou les intégrer manuellement lors de l'ajout de nouvelles variétés

## Fichiers Modifiés/Créés

### Modifiés

- `src/components/game/HologramEvolution.tsx` - PlantCards + TREE_CARDS (15 plantes + 14 arbres)
- `src/components/game/EcoGestureWidget.tsx` - Widget UI pour geste écologique
- `src/components/game/EnhancedHUD.tsx` - Ajout EcoGestureWidget
- `src/store/game-store.ts` - Ajout ecoPoints, ecoLevel, addEcoPoints
- `src/lib/ai-engine.ts` - Activité pollinisatrice + prévention phytosanitaire

### Créés

- `src/app/api/scan-gesture/route.ts` - API scan geste écologique Ollama Vision
- `src/data/BOTANY_BRAIN_ANALYSIS.md` - Analyse initiale du problème
- `src/data/ARCHITECTURE_BOTANY.md` - Architecture du cerveau botanique
- `src/data/PLANT_VARIETIES_REFERENCE.md` - Référence des 47+ variétés
- `src/data/ECOLOGICAL_GESTURE_SYSTEM.md` - Système de validation gestes
- `src/data/POLLINATOR_DISEASE_SYSTEM.md` - Pollinisation + prévision maladies
- `src/data/INTEGRATION_PLAN.md` - Ce document

## PlantCards Maintenant Disponibles

| plantDefId | Nom | Famille | Jours Récolte | Status |
|------------|-----|---------|---------------|--------|
| tomato | Tomate | Solanaceae | 109 | ✅ |
| carrot | Carotte | Apiaceae | 114 | ✅ |
| lettuce | Laitue | Asteraceae | 49 | ✅ |
| strawberry | Fraise | Rosaceae | 123 | ✅ |
| basil | Basilic | Lamiaceae | 90 | ✅ |
| pepper | Piment | Solanaceae | 130 | ✅ |
| cucumber | Concombre | Cucurbitaceae | 70 | ✅ |
| zucchini | Courgette | Cucurbitaceae | 55 | ✅ |
| bean | Haricot | Fabaceae | 100 | ✅ |
| pea | Pois | Fabaceae | 90 | ✅ |
| spinach | Épinard | Amaranthaceae | 60 | ✅ |
| radish | Radis | Brassicaceae | 30 | ✅ |
| cabbage | Chou | Brassicaceae | 120 | ✅ |
| eggplant | Aubergine | Solanaceae | 120 | ✅ |

## TreeCards Maintenant Disponibles

| plantDefId | Nom | Famille | Hauteur | Récolte | Status |
|------------|-----|---------|---------|---------|--------|
| apple | Pommier | Rosaceae | 8m | 5 ans | ✅ |
| apple-gala | Pommier Gala | Rosaceae | 5m | 4 ans | ✅ |
| apple-golden | Pommier Golden | Rosaceae | 6m | 4 ans | ✅ |
| pear | Poirier | Rosaceae | 10m | 5 ans | ✅ |
| cherry | Cerisier | Rosaceae | 12m | 5 ans | ✅ |
| hazelnut | Noisettier | Betulaceae | 8m | 6 ans | ✅ |
| walnut | Noyer | Juglandaceae | 15m | 8 ans | ✅ |
| orange | Oranger | Rutaceae | 5m | 4 ans | ✅ |
| lemon | Citronnier | Rutaceae | 4m | 4 ans | ✅ |
| oak | Chêne | Fagaceae | 30m | 30 ans | ✅ |
| birch | Bouleau | Betulaceae | 20m | 15 ans | ✅ |
| maple | Érable | Sapindaceae | 25m | 20 ans | ✅ |
| pine | Pin sylvestre | Pinaceae | 30m | 30 ans | ✅ |
| magnolia | Magnolia | Magnoliaceae | 10m | 10 ans | ✅ |

## Nouvelles Fonctionnalités

### Activité Pollinisatrice Locale ✅
- Abeilles ne volent pas si T° < 12°C, vent > 20 km/h, ou pluie
- fruitSetRate appliqué selon conditions réelles
- Alertes générées si activité < 0.4

### Prévention Phytosanitaire ✅
- Tracking diseasePressureHours (24h/jour de conditions favorables)
- Alertes prédictives 48h avant risque mildiou/oïdium
- Basé sur seuils épidémiologiques INRAE

### Preuve de Geste Écologique ✅
- Photo → Ollama Vision (bakllava) → validation mulch/compost/rainwater
- EcoPoints gagnés : mulch +15, compost +20, rainwater +10
- Niveaux 0-10 avec récompenses progressives

## Prochaines Étapes

1. **Tester** l'application pour vérifier les nouvelles plantes et arbres
2. **CARD_DATA auto-import** — script pour générer PlantCards depuis les fichiersgraines/*/
3. **UI arbres** — vérifier que les arbres s'affichent correctement dans la boutique

---

*Document généré le 2026-04-07, mis à jour 2026-04-08*
