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

| Arbre | Fruit | Années maturité | Entretien |
|---|---|---|---|
| Pommier | Apple | 4-5 ans | ⭐ |
| Poirier | Pear | 4-5 ans | ⭐ |
| Cerisier | Cherry | 3-4 ans | ⭐⭐ |
| Prunier | Plum | 3-4 ans | ⭐ |
| Abricotier | Apricot | 3-4 ans | ⭐⭐ |
| Figuier | Fig | 2-3 ans | ⭐ |
| Pêcher | Peach | 3-4 ans | ⭐⭐ |
| Coing | Quince | 3-4 ans | ⭐ |

### Arbres forestiers (6)

| Arbre | Usage | Années maturité |
|---|---|---|
| Chêne | Forestier | 30-50 ans |
| Pin sylvestre | Forestier | 20-30 ans |
| Érable | Ornement | 15-20 ans |
| Bouleau | Ornement | 10-15 ans |
| Magnolia | Ornement | 10-15 ans |
| Noyer | Forestier | 8-12 ans |

---

## Cycle de vie dans l'application

```
[SEMIS] ──→ [GERMINATION] ──→ [PÉPINIÈRE] ──→ [TRANSPLANTATION]
              (7-14j)           (25-55j)         (au jardin)

     ↓
[GRAINES BOUTIQUE]
   Achat → Stock → Semis
```

### Stade 0 : Semis
- La graine est plantée
- Jours comptent à partir de 0
- Besoin : chaleur, humidité

### Stade 1 : Levée
- La germination commence
- Tige sort du sol
- GDD commence à s'accumuler

### Stade 2 : Plantule
- Cotylédons (premières feuilles) visibles
- Photosynthèse active
- Besoins : lumière, eau modérée

### Stade 3 : Croissance
- Vraies feuilles se développent
- Croissance végétative
- Besoins : eau, nutriments

### Stade 4 : Floraison
- Apparition des fleurs
- Pollinisation nécessaire (vent, insectes)
- Début fructification

### Stade 5 : Récolte
- Fruits mûrs
- Prêt à consommer/recolter
- Peut continuer à produire

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
