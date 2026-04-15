# BotanIA - Assets Documentation

> Documentation complète pour la génération et l'organisation des assets graphiques.

---

## Table des Matières

1. [Styles Graphiques](#1-styles-graphiques)
2. [Structure des Fichiers](#2-structure-des-fichiers)
3. [Prompts Templates](#3-prompts-templates)
4. [Liste des Assets par Boutique](#4-liste-des-assets-par-boutique)
5. [Procédure de Génération](#5-procédure-de-génération)
6. [Données Botaniques](#6-données-botaniques)

---

# 1. STYLES GRAPHIQUES

## Règles Générales

| Critère | Valeur |
|---------|--------|
| Format | 512x512px |
| Style | Manga cel-shade |
| Bordures | Noires épaisses |
| Fond par défaut | Beige kraft |
| Esthétique | Kawaii |

## 1.1 Paquets de Graines
- **Style** : Manga cel-shade isométrique
- **Fond** : Beige kraft texturé
- **Éléments** : Logo fournisseur + variété + illustration légume
- **Angle** : Isométrique 3/4

## 1.2 Cards Graines (Collection)
- **Style** : Manga cel-shade frontal
- **Fond** : Beige kraft
- **Éléments** : Illustration légume + nom variété + badge fournisseur
- **Usage** : Cartes posables dans le jardin/mini-serres

## 1.3 Plants - Stades de Croissance

Trois routes distinctes selon le mode de culture :

### Route Jardin (6 stades) — semis en mini-serre → transvasements successifs → sol jardin

| Stage | Description | Contenant |
|-------|-------------|-----------|
| 1 | Graines semées | Mini-serre (sachet/petit pot) |
| 2 | Levée (petite plantule) | Mini-serre |
| 3 | Croissance en mini-serre | Mini-serre ou petits pots individuels |
| 4 | Repiquage dans serre jardin | Pots individuels en serre |
| 5 | Après dernier gel → repiquage en sol | Sol jardin (pleine terre) |
| 6 | Plante adulte productive | Sol jardin — récolte |

> **Note** : Stade 3 = les plantules sortent de la mini-serre pour aller en petits pots individuels. Stade 5 = on attend le dernier gel (début mai) avant de transplanter en pleine terre.

### Route Mini-Serre (5 stades) — croissance en serre uniquement, pas de transplantation en sol

| Stage | Description | Contenant |
|-------|-------------|-----------|
| 1 | Graines semées en mini-serre | Mini-serre (chambre de culture) |
| 2 | Premières feuilles | Mini-serre |
| 3 | Croissance végétative | Mini-serre |
| 4 | 2-3 feuilles, rempotage | Mini pots individuels dans mini-serre |
| 5 | Plante mature, première fleur visible | Mini-serre — récolte en intérieur |

> **Note** : La plante reste en serre. Au stade 4, passage en pots individuels pour attendre les conditions idéales. Pas de transplantation en sol jardin.

### Route Plantules (5 stades) — achat local, skip les stades serre

| Stage | Description | Contenant |
|-------|-------------|-----------|
| 1 | Plante mature en mini-serre (première fleur) | Mini-serre ou pot |
| 2 | Jeunes fruits (ex: tomates vertes) | Pot / sol jardin |
| 3 | Croissance des fruits (ex: tomates vertes développement) | Sol jardin |
| 4 | Maturation (ex: tomates orange-rouge, véraison) | Sol jardin |
| 5 | Plante adulte productive, fruit prêt à cueillir | Sol jardin — récolte |

> **Note** : Les plantules achetées localement (Pépinière Locale, Marché Producteurs) sautent les stades de semis et arrivent directement au stade mature. Elles sont prêtes à être repiquées en sol après le dernier gel.

### Résumé visuel des 3 routes

```
GRAINES (achat)                    PLANTULES (achat local)
     │                                      │
     ▼                                      ▼
 ┌─────────┐                          ┌──────────┐
 │Mini-Serre│                          │ Plante    │
 │ S1→S2→S3 │                          │ mature   │
 └────┬─────┘                          │ (fleur)  │
      │                                 └────┬─────┘
      ▼                                      ▼
 ┌─────────┐                          ┌──────────┐
 │Petits    │                          │ Jeunes   │
 │pots S4  │                          │ fruits   │
 └────┬─────┘                          └────┬─────┘
      │                                      │
      ▼  (après dernier gel)                  ▼
 ┌─────────┐                          ┌──────────┐
 │Sol S5   │                          │Croissance│
 │jardin   │                          │ fruits   │
 └────┬─────┘                          └────┬─────┘
      │                                      │
      ▼                                      ▼
 ┌─────────┐                          ┌──────────┐
 │Plante   │                          │Récolte   │
 │adulte S6│                          │ S5       │
 └─────────┘                          └──────────┘
```

## 1.4 Arbres Fruitiers - POTS

| Critère | Valeur |
|---------|--------|
| Style | Manga cel-shade |
| Format | 512x512px |
| Fond | Beige kraft |
| Contenant | Pot terracotta ~20cm |
| Stages | 5 (croissance sur plusieurs années) |

**⚠️ IMPORTANT** : Les arbres fruitiers sont vendus en POT, jamais en sachet de graines!

| Stage | Taille | Description |
|-------|--------|-------------|
| 1 | ~20cm | Mini scion en pot |
| 2 | ~40cm | Jeune arbre, petites branches |
| 3 | ~80cm | Structure définie |
| 4 | ~150cm | Floraison/fruits apparaître |
| 5 | ~200cm | Arbre adulte, pleine production |

## 1.5 Cards Shops (Fournisseurs)
- **Style** : Manga kawaii avec mascotte
- **Fond** : Beige texturé
- **Éléments** : Nom coloré + mascotte + bordures végétales

## 1.6 Équipements (Serres)
- **Style** : Ornemental baroque vintage
- **Format** : Rectangulaire vertical
- **Cadre** : Vignettes florales complexes
- **Fond** : Papier vieilli

---

# 2. STRUCTURE DES FICHIERS

```
public/
├── packets/                          # Paquets de graines
│   ├── vilmorin/
│   ├── clause/
│   ├── kokopelli/
│   ├── lebiau/
│   └── saintemarthe/
├── cards/
│   ├── seeds/                       # Cards collection
│   └── shops/                       # Cards boutiques
├── plants/                          # Stages croissance
├── pots/                           # Arbres en pot (boutique)
│   ├── guignard/
│   ├── inrae/
│   ├── arbres-tissot/
│   ├── pepinieres-bordas/
│   ├── fruitiers-forest/
│   └── reserve/
├── trees/                           # Stages arbres
└── equipment/
    └── mini-serre.png
```

---

# 3. PROMPTS TEMPLATES

## 3.1 Paquet de Graines
```
manga-style seed packet illustration, {SUPPLIER} brand logo at top,
"{VARIETY}" variety text, drawing of a {VEGETABLE} on the front of the packet,
cel-shaded, thick black manga borders, beige kraft paper background,
isometric angle, kawaii aesthetic, 512x512px, BotanIA game style
```

## 3.2 Card Graine (Collection)
```
manga-style collectible card illustration, {VEGETABLE} {VARIETY},
{SUPPLIER} brand badge, cel-shaded, thick black manga borders,
beige kraft paper background, kawaii aesthetic,
512x512px, BotanIA game style
```

## 3.3 Plant Stage
```
manga-style plant growth stage {N} of {TOTAL},
{VEGETABLE} {VARIETY} in terracotta pot, cel-shaded,
thick black manga borders, beige background,
kawaii aesthetic, 512x512px, BotanIA game style
```

## 3.4 Pot Arbre Fruitier (boutique ~20cm)
```
manga-style {TREE_VARIETY} tree in 20cm terracotta pot,
young fruit tree ready for sale, cel-shaded, thick black manga borders,
beige kraft background, kawaii aesthetic, 512x512px, BotanIA game style
```

## 3.5 Arbre Fruitier Stage
```
manga-style {TREE_VARIETY} fruit tree growth stage {N} of 5,
in terracotta pot, cel-shaded, thick black manga borders,
beige background, kawaii aesthetic, {HEIGHT}, 512x512px, BotanIA game style
```

## 3.6 Card Shop
```
manga-style kawaii shop card, {SHOP_NAME} logo with colorful typography,
cute character mascot holding {PLANTS}, decorative floral border,
cel-shaded, beige kraft background, botanical illustrations,
512x512px, BotanIA game style
```

## 3.7 Équipement (Serre)
```
vintage botanical encyclopedia card style, ornate baroque frame
with floral decorations, {EQUIPMENT_NAME} title at top,
greenhouse with multiple plants inside, perspective view,
open door, sunlight rays, detailed illustration,
beige aged paper background, 512x512px, BotanIA game style
```

---

# 4. LISTE DES ASSETS PAR BOUTIQUE

## Boutiques Graines (Onglet Graines)

| Boutique | ID | Status |
|---------|-----|--------|
| Vilmorin | vilmorin | À faire |
| Clause | clause | À faire |
| Kokopelli | kokopelli | À faire |
| Le Biau Germe | lebiau | À faire |
| Sainte Marthe | saintemarthe | À faire |

## Boutiques Arbres (Onglet Arbres)

| Boutique | ID | Status |
|---------|-----|--------|
| Guignard | guignard | ✅ Complet |
| INRAE | inrae | Partiel |
| Arbres Tissot | arbres-tissot | ✅ Complet |
| Pépinières Bordas | pepinieres-bordas | À faire |
| Fruitiers Forest | fruitiers-forest | À faire |

---

# 5. PROCÉDURE DE GÉNÉRATION

1. Définir les variétés manquantes par boutique
2. Générer avec prompts templates
3. Organiser dans les dossiers
4. Mettre à jour le code (paths)
5. Commit & Push

---

# 6. DONNÉES BOTANIQUES

## Structure Cards (src/data/graines/, src/data/arbres/)

Chaque carte contient :

### Pour les Graines
```typescript
{
  id: "tomato-saint-pierre",
  variety: "Saint-Pierre",
  period: ["15 mai", "30 juillet"],
  rainRequired: "40-60mm/semaine",
  soil: "pH 6.5-7.0",
  optimalTemp: "20-25°C",
  growthRate: "3cm/semaine en sol, 1.5cm hydroponie",
  yield: "3-5kg/plante",
  taste: "sucré, charnu, acidulé",
  consumption: "frais, salade, sauce tomate",
  notes: "résistant à la sécheresse"
}
```

### Pour les Arbres
```typescript
{
  id: "apple-golden",
  variety: "Golden Delicious",
  pollination: "Autofertile",
  harvestPeriod: ["15 sept", "15 oct"],
  fruitBearing: "Mixte (1-2 ans)",
  yield: "50-80kg/arbre",
  conservation: "6-8 mois en cave",
  soil: " profond, drainé, pH 6-7",
  notes: "Chair douce et juteuse"
}
```

---

*Document généré le 2026-04-06*
