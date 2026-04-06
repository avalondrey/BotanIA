# Cartes Arbres

> Fichiers de donnees pour chaque variete d'arbre

## Structure de donnees

```typescript
export const CARD_DATA = {
  // === IDENTIFICATION ===
  id: "apple-golden",
  plantDefId: "apple",
  shopId: "guignard",
  category: "fruit-tree" as const,
  name: "Golden Delicious",
  emoji: "🍎",

  // === IMAGE ASSETS ===
  potImage: "/pots/guignard/pot-apple-golden.png",
  stages: [
    "/trees/guignard/apple-golden-stage-1.png",
    // ... 5 stages
  ],

  // === PRIX ===
  price: 150,
  grams: 0.5,

  // === POLLINISATION ===
  pollination: {
    type: "Autofertile",
    pollinator: null,
    note: "Peut produire seul mais meilleur rendement avec partenaire"
  },

  // === PERIODE ===
  period: {
    flowering: ["15 avr", "15 mai"],
    harvest: ["15 sept", "15 oct"],
    planting: ["15 nov", "15 mars"],
  },

  // === CONDITIONS ===
  conditions: {
    temperature: { min: -25, max: 35, optimal: [15, 22] },
    soil: "Profond, draine, pH 6-7",
    light: "Soleil 6h+",
    waterNeeds: "medium",
  },

  // === CROISSANCE ===
  growth: {
    firstHarvest: "2-3 ans",
    fullProduction: "5-7 ans",
    lifespan: "50-80 ans",
    treeHeight: "3-5m",
  },

  // === RECOLTE ===
  yield: {
    amount: "50-80kg/arbre",
    fruitSize: "6-8cm",
    conservation: "6-8 mois en cave",
  },

  // === QUALITES ===
  taste: "Chair douce et juteuse, saveur sucree",
  consumption: "Frais, cuisine,jus,pâtisserie",
  nutrition: "Riche en fibres et vitamine C",

  // === NOTES ===
  notes: "Variete classique, excellente conservation",

  // === DONNEES JEUX ===
  gameData: {
    stageDurations: [30, 60, 120, 360],
    realDaysToHarvest: 730,
    optimalTemp: [8, 22],
    waterNeed: 5.0,
    lightNeed: 7,
  },
};
```

## Convention de nommage

```
src/data/arbres/{shopId}/{id}.ts
```

## Boutiques

| Boutique | Dossier |
|----------|----------|
| Guignard | guignard/ |
| INRAE | inrae/ |
| Arbres Tissot | arbres-tissot/ |
| Pépinières Bordas | pepinieres-bordas/ |
| Fruitiers Forest | fruitiers-forest/ |

## Fichiers à créer

### Guignard
- [x] apple-golden.ts ✅
- [x] apple-gala.ts ✅
- [x] pear-williams.ts ✅

### Arbres Tissot
- [x] apple-reine-reinettes.ts ✅
- [x] apple-belle-fleur.ts ✅
- [x] pear-conference.ts ✅
- [x] pear-louise-bonne.ts ✅

### INRAE
- [x] cherry-bing.ts ✅
- [x] walnut-franquette.ts ✅
- [x] oak-pedoncule.ts ✅

### Pépinières Bordas
- [x] maple-platanoides.ts ✅
- [x] birch-betula.ts ✅
- [x] pine-sylvestris.ts ✅
- [x] magnolia-grandiflora.ts ✅

### Fruitiers Forest
- [x] apple-reinette-du-canada.ts ✅
- [x] pear-beurre-hardy.ts ✅
- [x] cherry-montmorency.ts ✅
- [x] lemon-meyer.ts ✅
- [x] orange-valencia-late.ts ✅
