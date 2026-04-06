# Cartes Graines

> Fichiers de données pour chaque variété de graine

## Structure de données

```typescript
export const CARD_DATA = {
  // Identifiants
  id: "tomato-saint-pierre",           // ID unique
  plantDefId: "tomato",                 // Type de plante
  shopId: "vilmorin",                   // Boutique source
  
  // Informations de base
  name: "Saint-Pierre",                 // Nom de la variété
  emoji: "🍅",
  
  // Période de culture
  sowingPeriod: {
    indoor: ["15 fév", "30 mars"],      // Semis intérieur
    outdoor: ["15 avr", "31 mai"],     // Semis extérieur
    harvest: ["15 jui", "15 sept"]    // Récolte
  },
  
  // Conditions de croissance
  conditions: {
    rainRequired: "40-60mm/semaine",
    soil: "pH 6.0-7.0",
    optimalTemp: { min: 18, max: 28, ideal: 24 },
    lightHours: 8,
    growthRate: "3cm/semaine en sol"
  },
  
  // Récolte
  yield: {
    amount: "3-5kg/plante",
    harvestPeriod: ["15 jui", "30 sept"]
  },
  
  // Qualités
  taste: "sucré, charnu, acidulé",
  consumption: "frais, salade, sauce tomate",
  
  // Notes
  notes: "Variété traditionnelle française, résistant à la sécheresse"
};
```

## Convention de nommage

```
src/data/graines/{shopId}/{id}.ts
```

## Exemples

| Boutique | Fichier |
|----------|---------|
| Vilmorin | `src/data/graines/vilmorin/tomato-cocktail.ts` |
| Clause | `src/data/graines/clause/pepper-california-wonder.ts` |
| Kokopelli | `src/data/graines/kokopelli/tomato-cherokee-purple.ts` |
| Le Biau | `src/data/graines/lebiau/tomato-marmande.ts` |
| Sainte Marthe | `src/data/graines/saintemarthe/basil-genoveois.ts` |

## Fichiers créés

### Vilmorin
- [x] tomato-cocktail.ts ✅

### Clause
- [x] pepper-california-wonder.ts ✅
- [x] lettuce-batavia.ts ✅
- [x] cucumber-marketer.ts ✅
- [x] zucchini-black-beauty.ts ✅

### Kokopelli
- [x] tomato-cherokee-purple.ts ✅
- [x] tomato-rose-de-berne.ts ✅
- [x] tomato-noire-de-crimee.ts ✅
- [x] tomato-green-zebra.ts ✅
- [x] eggplant-longue-violette.ts ✅
- [x] squash-butternut-coco.ts ✅

### Le Biau Germe
- [x] tomato-marmande.ts ✅
- [x] carrot-guerande.ts ✅
- [x] carrot-robver.ts ✅
- [x] lettuce-feuille-de-chene.ts ✅
- [x] bean-coco-blanc.ts ✅
- [x] cabbage-chou-milan.ts ✅

### Sainte Marthe
- [x] basil-genoveeis.ts ✅
- [x] pepper-doux-de-france.ts ✅
- [x] basil-marseillais.ts ✅
- [x] strawberry-ciflorette.ts ✅
