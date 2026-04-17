# BotanIA — Concept des Plantes Réelles

> Comment les plantes réelles sont liées à l'application.

---

## Principe fondamental

Chaque plante dans BotanIA est basée sur une **plante réelle** avec des **données botaniques véridiques** :

```
┌─────────────────────────────────────────────────────────────┐
│  PLANTE RÉELLE (dans votre jardin)                         │
│                                                             │
│  • GPS : 48.8566°N, 2.3522°E                              │
│  • Photo : vous la photographiez                           │
│  • Stade : levée, croissance, etc.                        │
│  • Symptômes : mildiou, jaunissement, etc.                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Identification IA + GPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BOTANIA (application)                                      │
│                                                             │
│  • Identifiée : Tomate (Solanum lycopersicum)              │
│  • Stade : Croissance (J+45)                              │
│  • GDD accumulés : 487°C·j                                │
│  • Prochain stade : Floraison (~GDD 800)                 │
│  • Besoin eau : 5.5L/j × surface                         │
│  • Alert : Mildiou risque 67%                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Recommendations
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  VOTRE JARDIN RÉEL                                          │
│                                                             │
│  • Action suggérée : Traitement préventif mildiou           │
│  • Conseil : Réduire irrigation foliaire                   │
│  • Companiononnage : Basilic à côté ✓                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Types de plantes dans l'application

### 1. Graines (Seeds)
- **Définition** : Variété disponible en boutique
- **Données** : Nom, semencier, prix, jours germination, description
- **Exemple** : Tomate Coeur de Boeuf (Vilmorin), Carotte Nationale 2 (Clause)

### 2. Plants en croissance (GardenPlants)
- **Définition** : Plante semée/transplantée dans le jardin
- **Données temps réel** : Stade, GDD accumulés, eau, santé
- **Localisation** : Coordonnées GPS + position dans la grille

### 3. Plantules (Seedlings)
- **Définition** : Jeune plant en pépinière/mini-serre
- **Données** : Stade germination, jours depuis semis, température serre
- **But** : Protéger germination et croissance initiale

### 4. Arbres (Trees)
- **Définition** : Arbres fruitiers ou forestiers
- **Croissance** : Multi-annuelle (pas de "récolte" annuelle)
- **Stades** : Scion → Jeune arbre → Adulte → Mature

---

## Données botaniques par plante

### Plantes potagères (6)

| Plante | Tbase | Tcap | Kc | Jours récolte | Difficulté |
|---|---|---|---|---|---|
| Tomate | 10°C | 30°C | 1.05 | ~109j | ⭐⭐ |
| Carotte | 4°C | 27°C | 1.00 | ~114j | ⭐ |
| Laitue | 4°C | 24°C | 0.95 | ~49j | ⭐ |
| Fraisier | 5°C | 28°C | 1.00 | ~123j | ⭐⭐ |
| Basilic | 12°C | 32°C | 0.90 | ~90j | ⭐⭐⭐ |
| Piment | 10°C | 32°C | 0.90 | ~130j | ⭐⭐⭐ |

### Arbres fruitiers (8)

| Arbre | Fruit | Années maturité | totalDaysToHarvest correct |
|---|---|---|---|
| Pommier | Apple | 4-5 ans | **1825** (5 ans) |
| Poirier | Pear | 4-5 ans | **1825** (5 ans) |
| Cerisier | Cherry | 3-4 ans | **1460** (4 ans) |
| Prunier | Plum | 3-4 ans | **1460** (4 ans) |
| Abricotier | Apricot | 3-4 ans | **1460** (4 ans) |
| Figuier | Fig | 2-3 ans | **1095** (3 ans) |
| Pêcher | Peach | 3-4 ans | **1460** (4 ans) |
| Coing | Quince | 3-4 ans | **1460** (4 ans) |
| Agrumes (Oranger, Citronnier) | Orange, Lemon | 3-4 ans | **1460** (4 ans) |
| Noisetier | Hazelnut | 5-6 ans | **2190** (6 ans) |
| Noyer | Walnut | 8-10 ans | **2920** (8 ans) |

### Arbres forestiers (6)

| Arbre | Usage | Années maturité | totalDaysToHarvest correct |
|---|---|---|---|
| Chêne | Forestier | 30-50 ans | **10950** (30 ans) |
| Pin sylvestre | Forestier | 20-30 ans | **9125** (25 ans) |
| Érable | Ornement | 15-20 ans | **6570** (18 ans) |
| Bouleau | Ornement | 10-15 ans | **5475** (15 ans) |
| Magnolia | Ornement | 10-15 ans | **5475** (15 ans) |
| Noyer | Forestier | 8-12 ans | **3650** (10 ans) |

### Règles de validation des données d'arbres

> ⚠️ **IMPORTANT** : Ces règles DOIVENT être respectées lors de la génération de PlantCard pour les arbres.

| Champ | Règle | Erreur courante |
|-------|-------|-----------------|
| `totalDaysToHarvest` | Fruitiers = 1095-2190 (3-6 ans). **PAS 5475 (15 ans)!** | Valeurs de 4000+ pour des fruitiers |
| `firstHarvestYears` | Doit correspondre à `totalDaysToHarvest / 365` | premierHarvestYears: 4 mais totalDays: 5475 |
| `stageDurations` | Arbres = `[45, 90, 180, 365]` (jours par stade) | `[30, 60, 120, 180]` (trop court) |
| `stageGDD` | Arbres = `[200, 400, 800, 1500]` minimum | Valeurs type légume `[6, 15, 21, 18]` |
| `plantCategory` | Doit être `'fruit-tree'` ou `'forest-tree'` | absent ou `'vegetable'` |
| `treeData` | Obligatoire pour tous les arbres | absent |

**Valeurs SANS EXCEPTION pour `totalDaysToHarvest` :**
- Fruitiers à noyaux (pêche, prune, cherry, apricot) : **1095-1460**
- Fruitiers à pepins (apple, pear, quince) : **1825**
- Agrumes : **1460**
- Noisetier : **2190**
- Noyer : **2920**
- Arbres forestiers/ornement : **5475-10950**

**Ne jamais utiliser** : 365, 4380, 5110, 5475 (pour fruitiers), 6570

---

## Cycle de vie dans l'application — 3 routes de croissance

BotanIA utilise **3 routes de croissance** distinctes selon le cheminement de la plante.

---

### Route JARDIN (6 stades)

```
[SEMIS] ──→ [POT/SACHET] ──→ [POTS INDIVIDUELS] ──→ [SERRE JARDIN] ──→ [PLEINE TERRE] ──→ [ADULTE PRODUCTIVE]
  Stage 1         Stage 2              Stage 3               Stage 4              Stage 5              Stage 6
```

| Stade | Label | Contenant | Description |
|-------|-------|-----------|-------------|
| 1 | Graines en mini-serre | Pot/sachet en mini-serre | La graine est plantée, chaleur et humidité |
| 2 | Levée | Pot/sachet | Petite plantule, GDD commence à s'accumuler |
| 3 | Petits pots | Pots individuels | Cotylédons visibles, photosynthèse active |
| 4 | Serre jardin | Pots en serre | Vraies feuilles, croissance végétative |
| 5 | Pleine terre (post-gel) | Sol jardin | Repiquage après dernier gel (début mai) |
| 6 | Plante adulte productive | Sol jardin | Grande, productive, peut récolter |

---

### Route MINI-SERRE (6 stades)

```
Stage 1       Stage 2      Stage 3       Stage 4      Stage 5         Stage 6
Graines →   1ères feuilles → 2-3 feuilles → 4-5 feuilles → Croissance végé → Fleur visible
(en chambre de culture)
```

| Stade | Label | Description |
|-------|-------|-------------|
| 1 | Graines en mini-serre | Chambre de culture, chaleur |
| 2 | Premières feuilles | 1-2 premières feuilles vraies |
| 3 | 2-3 feuilles | 2-3 feuilles, développement foliaire |
| 4 | 4-5 feuilles | 4-5 feuilles, plantule établie |
| 5 | Croissance végétative | Croissance rapide, biomasse |
| 6 | Plante mature, fleur visible | Première fleur, prête pour pollinisation |

---

### Route PLANTULE / ACHATS LOCAUX (5 stades)

```
Stage 1          Stage 2          Stage 3          Stage 4         Stage 5
Mini-serre    → Pleine terre   → Pleine terre   → Pleine terre   → Récolte
(fleur visible) (jeunes fruits)  (croissance)     (véraison)       (prêt)
```
> **Règle clé** : Stage 1 = en pot (bloque si reste en serre). Stage 2+ = pleine terre, évolue automatiquement.

| Stade | Label | Contenant | Description |
|-------|-------|-----------|-------------|
| 1 | Mini-serre, fleur visible | Pot | Plant acheté, première fleur, reste en pot |
| 2 | Jeunes fruits (verts) | Pleine terre | Fruits en formation (ex: tomates vertes) |
| 3 | Croissance fruits | Pleine terre | Fruits en développement |
| 4 | Maturation (véraison) | Pleine terre | Fruits orange-rouge, approche maturité |
| 5 | Fruit prêt à cueillir | Pleine terre | Récolte, fruit mûr |

---

### Transition entre routes

- **Jardin** : commence en pot (stage 1), évolue jusqu'au stage 6 en pleine terre
- **Mini-serre** : stage 1 en chambre, reste en pot, évolue jusqu'à stage 6 en fleur
- **Plantule** : stage 1 = plant acheté en pot → **transplanter en pleine terre** (stage 2+) pour évoluer

---

## Comment ajouter une nouvelle plante

### 1. Créer le PlantCard dans HologramEvolution.tsx

```typescript
// Exemple pour une nouvelle plante
export const PLANT_CARDS: Record<string, PlantCard> = {
  cucumber: {
    id: 'cucumber',
    name: 'Concombre',
    tBase: 12,      // °C
    tCap: 35,       // °C
    stageGDD: [60, 200, 400, 700],
    kc: 0.90,
    waterNeedMmPerDay: 6.5,
    companions: [
      { plant: 'bean', type: 'beneficial' },
      { plant: 'pea', type: 'beneficial' },
      { plant: 'tomato', type: 'harmful' },
    ],
    diseaseRisks: ['mildiou', 'oidium', 'puceron'],
    totalDaysToHarvest: 65,
    minSoilTemp: 15,
  },
};
```

### 2. Ajouter l'image

```
/public/plants/cucumber-stage-0.png  # Graine
/public/plants/cucumber-stage-1.png  # Levée
/public/plants/cucumber-stage-2.png  # Plantule
/public/plants/cucumber-stage-3.png  # Croissance
/public/plants/cucumber-stage-4.png  # Floraison
/public/plants/cucumber-stage-5.png  # Récolte
```

### 3. Ajouter dans ai-engine.ts (PLANTS record)

```typescript
export const PLANTS: Record<string, PlantDefinition> = {
  cucumber: {
    id: 'cucumber',
    name: 'Concombre',
    emoji: '🥒',
    image: '/cards/card-cucumber.png',
    // ...
  },
};
```

### 4. Ajouter la variété en boutique

```typescript
// Dans Boutique.tsx ou data/graines/
export const CUCUMBER_VARIETIES = [
  {
    id: 'cucumber-marketer',
    name: 'Marketer',
    plantDefId: 'cucumber',
    price: 2.50,
    germinationDays: 7,
    seedPerPacket: 50,
    shop: 'clause',
  },
];
```

---

## Liaison avec le jardin réel

### GPS + Photo

```
📸 Photo de votre rang de tomates
         │
         │ EXIF GPS
         ▼
   Coordonnées (lat, lon)
         │
         ├──────→ seedRows (votre dessin sur la photo)
         │
         └──────→ Plante dans BotanIA
                   • GPS: 48.8566°N
                   • Variété: Tomate Coeur de Boeuf
                   • Stade: Croissance
                   • GDD: 487°C·j
```

### Identification IA

```
📸 Photo d'une plante inconnue
         │
         │ PlantIdentifier.tsx
         │ (Groq / Ollama / Claude / Plant.id)
         ▼
   Résultat: "Tomate (Solanum lycopersicum)"
         │
         ▼
   HologramEvolution.tsx
   → Utilise les données botaniques de la tomate
   → Calcule GDD, besoins eau, compagnonnage
         │
         ▼
   Recommandations pour VOTRE plante réelle
```
