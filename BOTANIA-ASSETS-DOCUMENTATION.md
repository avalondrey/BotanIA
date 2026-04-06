# BotanIA - Assets & Encyclopedia Documentation

> Documentation complète pour les assets graphiques et les données botaniques.

---

## Table des Matières

### Assets Graphiques
1. [Styles Graphiques](#1-styles-graphiques)
2. [Structure des Fichiers](#2-structure-des-fichiers)
3. [Prompts Templates](#3-prompts-templates)
4. [Liste des Assets par Boutique](#4-liste-des-assets-par-boutique)
5. [Procédure de Génération](#5-procédure-de-génération)

### Données Botaniques (Encyclopedia)
6. [Données Plantes - Graines](#6-données-plantes---graines)
7. [Données Arbres Fruitiers](#7-données-arbres-fruitiers)
8. [Données Arbres Forestiers/Ornement](#8-données-arbres-forestiersornement)

---

# ASSETS GRAPHIQUES

---

## 1. Styles Graphiques

### Règles Générales
| Critère | Valeur |
|---------|--------|
| Format | 512x512px |
| Style | Manga cel-shade |
| Bordures | Noires épaisses |
| Fond par défaut | Beige kraft |
| Esthétique | Kawaii |

### 1.1 Paquets de Graines
- **Style** : Manga cel-shade isométrique
- **Fond** : Beige kraft texturé
- **Éléments** : Logo fournisseur + variété + illustration légume
- **Angle** : Isométrique 3/4

### 1.2 Cards Graines (Seed Cards)
- **Style** : Manga cel-shade frontal
- **Fond** : Beige kraft
- **Éléments** : Illustration légume + nom variété + badge fournisseur
- **Style** : Carte à collectionner

### 1.3 Plants - Stages de Croissance
- **Style** : Manga cel-shade
- **Fond** : Beige uni
- **Éléments** : Plante en pot terracotta
- **Stages** : 5 (mini-serre) ou 6 (jardin)

| Stage | Description |
|-------|-------------|
| 1 | Germination/plantule |
| 2 | Premières feuilles |
| 3 | Croissance végétative |
| 4 | Développement/fleurs |
| 5 | Premiers fruits (mini-serre) ou maturité |
| 6 | Pleine maturité/récolte (jardin) |

### 1.4 Arbres Fruitiers - POTS (⚠️ PAS de graines!)

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

### 1.5 Cards Shops (Fournisseurs)
- **Style** : Manga kawaii avec mascotte
- **Fond** : Beige texturé
- **Éléments** : Nom coloré + mascotte + bordures végétales

### 1.6 Équipements (Serres)
- **Style** : Ornemental baroque vintage
- **Format** : Rectangulaire vertical
- **Cadre** : Vignettes florales complexes
- **Fond** : Papier vieilli

---

## 2. Structure des Fichiers

```
public/
├── packets/                          # Paquets de graines
│   ├── clause/
│   ├── kokopelli/
│   ├── lebiau/
│   ├── Sainte-marthe/
│   └── vilmorin/
├── cards/
│   ├── seeds/                       # Cards graines (collection)
│   └── shops/                       # Cards boutiques ✅
├── plants/                          # Stages croissance ✓ (tomato fait)
│   ├── tomato-stage-{1-6}.png
│   ├── clause/
│   ├── kokopelli/
│   ├── lebiau/
│   └── Sainte-marthe/
├── pots/                            # Arbres fruitiers en pot (boutique)
│   ├── guignard/
│   │   ├── pot-apple-golden.png
│   │   ├── pot-apple-gala.png
│   │   └── pot-pear-williams.png
│   ├── inrae/
│   │   └── cherry-bing-pot.png
│   ├── arbres-tissot/
│   │   ├── pot-apple-reine-reinettes.png
│   │   ├── pot-apple-belle-fleur.png
│   │   ├── pot-pear-conference.png
│   │   └── pot-pear-louise-bonne.png
│   └── reserve/                    # En attente d'implémentation
│       ├── pot-lemon.png
│       └── pot-orange.png
├── trees/                           # Stages croissance arbres
│   ├── guignard/
│   │   ├── apple-golden-stage-{1-5}.png
│   │   ├── apple-gala-stage-{1-5}.png
│   │   └── pear-williams-stage-{1-5}.png
│   ├── inrae/
│   │   └── cherry-bing-stage-{1-5}.png
│   ├── arbres-tissot/
│   │   ├── apple-reine-reinettes-stage-{1-5}.png
│   │   ├── apple-belle-fleur-stage-{1-5}.png
│   │   ├── pear-conference-stage-{1-5}.png
│   │   └── pear-louise-bonne-stage-{1-5}.png
│   └── reserve/
│       ├── lemon-stage-{1-5}.png
│       └── orange-stage-{1-5}.png
└── equipment/
    └── mini-serre.png
```

---

## 3. Prompts Templates

### 3.1 Paquet de Graines
```
manga-style seed packet illustration, {SUPPLIER} brand logo at top,
"{VARIETY}" variety text, drawing of a {VEGETABLE} on the front of the packet,
cel-shaded, thick black manga borders, beige kraft paper background,
isometric angle, kawaii aesthetic, 512x512px, BotanIA game style
```

**Variables** :
- `{SUPPLIER}` : CLAUSE, KOKOPELLI, LE BIAU, SAINTE MARTHE, VILMORIN
- `{VARIETY}` : Nom variété (ex: "California Wonder", "Cherokee Purple")
- `{VEGETABLE}` : Description légume (ex: "green bell pepper", "purple tomato")

### 3.2 Card Graine
```
manga-style collectible card illustration, {VEGETABLE} {VARIETY},
{SUPPLIER} brand badge, cel-shaded, thick black manga borders,
beige kraft paper background, kawaii aesthetic,
512x512px, BotanIA game style
```

### 3.3 Plant Stage
```
manga-style plant growth stage {N} of {TOTAL},
{VEGETABLE} {VARIETY} in terracotta pot, cel-shaded,
thick black manga borders, beige background,
kawaii aesthetic, 512x512px, BotanIA game style
```

### 3.4 Pot Arbre Fruitier (boutique ~20cm)
```
manga-style {TREE_VARIETY} tree in 20cm terracotta pot,
young fruit tree ready for sale, cel-shaded, thick black manga borders,
beige kraft background, kawaii aesthetic, 512x512px, BotanIA game style
```

### 3.5 Arbre Fruitier Stage
```
manga-style {TREE_VARIETY} fruit tree growth stage {N} of 5,
in terracotta pot, cel-shaded, thick black manga borders,
beige background, kawaii aesthetic, {HEIGHT}, 512x512px, BotanIA game style
```

**Heights** : "mini scion 20cm" / "young tree 40cm" / "medium tree 80cm" / "tall tree 150cm" / "mature tree 200cm"

### 3.6 Card Shop
```
manga-style kawaii shop card, {SHOP_NAME} logo with colorful typography,
cute character mascot holding {PLANTS}, decorative floral border,
cel-shaded, beige kraft background, botanical illustrations,
512x512px, BotanIA game style
```

### 3.7 Équipement (Serre)
```
vintage botanical encyclopedia card style, ornate baroque frame
with floral decorations, {EQUIPMENT_NAME} title at top,
greenhouse with multiple plants inside, perspective view,
open door, sunlight rays, detailed illustration,
beige aged paper background, 512x512px, BotanIA game style
```

---

## 4. Liste des Assets par Boutique

### 4.1 CLAUSE (Graines)
| Type | Variétés | Status |
|------|----------|--------|
| Paquets | California Wonder, Batavia, Marketer, Black Beauty | À faire |
| Cards Graines | 4 variétés | À faire |
| Plants | (par variété, 5 stages) | À faire |

### 4.2 KOKOPELLI (Graines Bio) ✅
| Type | Variétés | Status |
|------|----------|--------|
| Paquets | Cherokee Purple, Rose de Berne, Noire de Crimée, Green Zebra, Longue Violette, Butternut Coco | À faire |
| Cards Graines | 6 variétés | À faire |
| Plants | (par variété, 6 stages) | À faire |

### 4.3 LE BIAU GERME (Graines Bio)
| Type | Variétés | Status |
|------|----------|--------|
| Paquets | Marmande, Carotte Guérande, Rob Ver, Feuille de Chêne, Haricot Coco Blanc, Chou de Milan | À faire |
| Cards Graines | 6 variétés | À faire |
| Plants | (par variété, 5-6 stages) | À faire |

### 4.4 SAINTE MARTHE (Graines Bio)
| Type | Variétés | Status |
|------|----------|--------|
| Paquets | Basilic Génois, Doux de France, Basilic Marseillais, Fraise Ciflorette | À faire |
| Cards Graines | 4 variétés | À faire |
| Plants | (basilic: 5, légumes: 6) | À faire |

### 4.5 VILMORIN (Graines)
| Type | Variétés | Status |
|------|----------|--------|
| Paquets | Cocktail, Anéas | À faire |
| Cards Graines | 2 variétés | À faire |
| Plants | (par variété, 6 stages) | À faire |

### 4.6 GUIGNARD (Arbres Fruitiers)
| Type | Variétés | Stages | Status |
|------|----------|--------|--------|
| Pots boutique | Pommier Golden, Pommier Gala, Poirier Williams | - | ✅ |
| Trees stages | (par variété) | 5 | ✅ |
| Card Shop | Guignard | - | ✅ |

### 4.7 INRAE (Arbres Forestiers)
| Type | Variétés | Stages | Status |
|------|----------|--------|--------|
| Pots boutique | Cerisier Bing | - | ✅ |
| Trees stages | Cerisier Bing | 5 | ✅ |
| Pots à faire | Noyer Franquette, Chêne Pédoncule | - | **À GÉNÉRER** |
| Trees à faire | Noyer, Chêne | 5 | **À GÉNÉRER** |
| Card Shop | INRAE | - | ✅ |

### 4.8 ARBRES TISSOT (Arbres Fruitiers)
| Type | Variétés | Stages | Status |
|------|----------|--------|--------|
| Pots boutique | Pommier Reine des Reinettes, Pommier Belle Fleur, Poirier Conference, Poirier Louise Bonne | - | ✅ (copies Guignard) |
| Trees stages | (par variété) | 5 | ✅ |
| Card Shop | Arbres Tissot | - | ✅ |

### 4.9 PEPINIERES BORDAS (Arbres Ornement)
| Type | Variétés | Stages | Status |
|------|----------|--------|--------|
| Pots boutique | Érable Plane, Bouleau Blanc, Pin Sylvestre, Magnolia Grandiflora | - | **À GÉNÉRER** |
| Trees stages | (par variété) | 5 | **À GÉNÉRER** |
| Card Shop | Pépinières Bordas | - | ✅ |

### 4.10 FRUITIERS FOREST (Arbres Fruitiers)
| Type | Variétés | Stages | Status |
|------|----------|--------|--------|
| Pots boutique | À définir | - | **À GÉNÉRER** |
| Trees stages | À définir | 5 | **À GÉNÉRER** |
| Card Shop | Fruitiers Forest | - | ✅ |

### 4.11 RÉSERVE (En attente d'implémentation)
| Type | Variétés | Stages | Status |
|------|----------|--------|--------|
| Pots | Citronnier, Oranger | - | ✅ En réserve |
| Trees stages | Citronnier, Oranger | 5 | ✅ En réserve |

---

## 5. Procédure de Génération

### Étape 1 : Préparer
1. Définir les variétés manquantes par boutique
2. Créer les dossiers si nécessaire
3. Vérifier la connectivité IA

### Étape 2 : Générer
1. Tester 1 asset avec le prompt template
2. Valider le style avec l'utilisateur
3. Générer par lots (4-6 images)
4. Vérifier la cohérence

### Étape 3 : Organiser
1. Placer dans les bons dossiers
2. Renommer selon convention
3. Vérifier les paths dans le code

### Étape 4 : Commit
```bash
git add public/
git status
git commit -m "feat: Add {type} assets for {shop}"
git push origin main
```

---

## Résumé - Assets Prioritaires à Générer

### URGENT : Pots & Trees manquants
- [ ] INRAE : Noyer Franquette, Chêne Pédoncule (pots + 5 stages chacun)
- [ ] Pépinières Bordas : Érable, Bouleau, Pin, Magnolia (pots + 5 stages chacun)
- [ ] Fruitiers Forest : À définir (pots + stages)

### URGENT : Graines (paquets + cards + stages)
- [ ] CLAUSE : 4 paquets + cards + plants
- [ ] KOKOPELLI : 6 paquets + cards + plants
- [ ] LE BIAU : 6 paquets + cards + plants
- [ ] SAINTE MARTHE : 4 paquets + cards + plants
- [ ] VILMORIN : paquets + cards + plants

### DÉJÀ FAIT ✅
- Shop cards : 9/9
- Pots Guignard : 3/3 + stages 15/15
- Pots Arbres Tissot : 4/4 + stages 20/20
- Pots INRAE : 1/1 + stages 5/5 (cerisier)
- Reserve : lemon, orange (en attente)
- Boutique : onglets "Graines" et "Arbres" séparés

---

# DONNÉES BOTANIQUES (ENCYCLOPEDIA)

---

## 6. Données Plantes - Graines

> Source: INRAE, GNIS,文献 botaniques
> Structure: `plantDefId`, `botanicalName`, Températures, Stades, Espace, Compagnons, Besoins

### TOMATE (Solanum lycopersicum)
- **Temp**: Base 12°C, Optimal 24°C, Max 35°C, Gèle à 0°C
- **Semis**: Prof 0.5cm, Intérieur [Fév,Mar,Avr], Extérieur [Avr,Mai]
- **Stades**: Germ 8j, Repiquage 50j, Récolte 110j
- **Espace**: 60cm entre plants, 80cm entre lignes
- **Compagnons**: basil, lettuce, carrot
- **Ennemis**: potato, pepper
- **Eau**: Fort | Lumière: 40000 lux | NPK: [2,1,3]

### CAROTTE (Daucus carota)
- **Temp**: Base 7°C, Optimal 18°C, Max 28°C, Rustique -5°C
- **Semis**: Prof 1cm, Extérieur [Fév,Mar,Avr,Mai,Juin,Juil,Août]
- **Stades**: Germ 14j, Repiquage impossible, Récolte 110j
- **Espace**: 5cm entre plants, 25cm entre lignes
- **Compagnons**: tomato, lettuce, onion
- **Ennemis**: dill
- **Eau**: Moyen | Lumière: 30000 lux | NPK: [1,2,2]

### LAITUE (Lactuca sativa)
- **Temp**: Base 5°C, Optimal 16°C, Max 25°C, Gèle -4°C
- **Semis**: Prof 0.2cm, Intérieur [Jan,Fév,Août,Sep], Extérieur [Mar,Avr,Mai,Juin,Juil,Août,Sep]
- **Stades**: Germ 4j, Repiquage 25j, Récolte 55j
- **Espace**: 25cm entre plants, 30cm entre lignes
- **Compagnons**: carrot, strawberry
- **Ennemis**: sunflower
- **Eau**: Moyen | Lumière: 20000 lux | NPK: [2,1,1]

### FRAISE (Fragaria × ananassa)
- **Temp**: Base 8°C, Optimal 20°C, Max 30°C, Rustique -10°C
- **Semis**: Prof 0cm (stolons), Intérieur [Fév,Mar], Extérieur [Mar,Avr,Août,Sep]
- **Stades**: Germ 20j, Repiquage 60j, Récolte 120j
- **Espace**: 30cm entre plants, 50cm entre lignes
- **Compagnons**: lettuce, borage
- **Ennemis**: cabbage
- **Eau**: Fort | Lumière: 30000 lux | NPK: [1,2,3]

### BASILIC (Ocimum basilicum)
- **Temp**: Base 12°C, Optimal 22°C, Max 30°C, Gèle à 0°C
- **Semis**: Prof 0.3cm, Intérieur [Fév,Mar,Avr], Extérieur [Avr,Mai,Juin]
- **Stades**: Germ 6j, Repiquage 35j, Récolte 80j
- **Espace**: 25cm entre plants, 30cm entre lignes
- **Compagnons**: tomato, pepper, oregano
- **Ennemis**: rue
- **Eau**: Moyen | Lumière: 35000 lux | NPK: [3,1,2]

---

## 7. Données Arbres Fruitiers

### POMMIER (Malus domestica)
- **Temp**: Base 8°C, Optimal 15-22°C, Max 35°C, Gèle -25°C (rustique)
- **Croissance**: 5 stages sur plusieurs années
- **Espacement**: 4-6m entre arbres
- **Pollinisation**: Auto-stérile (variétés besoin d'un pollorisateur)
- **Récolte**: 2-4 ans après plantation
- **Besoins**: Soleil 6h+, Sol profond et drainé, Eau régulier

**Variétés BotanIA**:
| Variété | shopId | realDaysToHarvest | Notes |
|---------|--------|------------------|-------|
| Golden Delicious | guignard | 730j (2 ans) | Autofertile, conservation excellente |
| Gala | guignard | 700j (2 ans) | Partiellement autofertile |
| Reine des Reinettes | arbres-tissot | 750j (2 ans) | Ancienne, parfumée |
| Belle Fleur | arbres-tissot | 720j (2 ans) | Productive, gelées tardives |

### POIRIER (Pyrus communis)
- **Temp**: Base 10°C, Optimal 15-22°C, Max 35°C, Gèle -25°C
- **Croissance**: 5 stages sur plusieurs années
- **Espacement**: 4-5m entre arbres
- **Pollinisation**: Auto-stérile (besoin de variété compatible)
- **Récolte**: 3-5 ans après plantation
- **Besoins**: Soleil 6h+, Sol profond, Eau régulier

**Variétés BotanIA**:
| Variété | shopId | realDaysToHarvest | Notes |
|---------|--------|------------------|-------|
| Williams | guignard | 800j (2+ ans) | Ancienne, chair fondante |
| Conference | arbres-tissot | 820j (2+ ans) | Autofertile |
| Louise Bonne | arbres-tissot | 800j (2+ ans) | Ancienne, parfumée |

### CERISIER (Prunus avium)
- **Temp**: Base 10°C, Optimal 15-24°C, Max 35°C, Gèle -20°C
- **Croissance**: 5 stages sur plusieurs années
- **Espacement**: 5-8m entre arbres
- **Pollinisation**: Auto-stérile (sauf Bing partiellement)
- **Récolte**: 4-6 ans après plantation
- **Besoins**: Soleil 6h+, Sol profond et drainé

**Variétés BotanIA**:
| Variété | shopId | realDaysToHarvest | Notes |
|---------|--------|------------------|-------|
| Bing | inrae | 900j (2+ ans) | Cerise rouge foncé, chair ferme |

### AGRUMES (Citrus) - En réserve
- **Temp**: Base 12°C, Optimal 20-28°C, Max 40°C, Gèle -5°C
- **Croissance**: 5 stages (culture en pot ou serre)
- **Espacement**: 3-4m (culture intensive)
- **Récolte**: 3-5 ans après plantation
- **Besoins**: Soleil 8h+, Protection gel, Eau régulier

**Variétés BotanIA (réserve)**:
| Variété | Status | Notes |
|---------|--------|-------|
| Citronnier | Réserve | Culture serre/pot |
| Oranger | Réserve | Culture serre/pot |

---

## 8. Données Arbres Forestiers/Ornement

### NOYER (Juglans regia) - INRAE
- **Temp**: Base 8°C, Optimal 15-24°C, Max 38°C, Gèle -30°C
- **Croissance**: Très lente, 5 stages sur décennies
- **Espacement**: 10-15m entre arbres
- **Particularité**: Production de juglone (inhibe croissance certaines plantes)
- **Récolte**: 8-10 ans après plantation
- **Besoins**: Soleil 6h+, Sol profond, Eau régulier

**Variétés BotanIA**:
| Variété | shopId | realDaysToHarvest | Notes |
|---------|--------|------------------|-------|
| Franquette | inrae | 1095j (3 ans) | Noix de Grenoble, amande parfumée |

### CHÊNE (Quercus robur) - INRAE
- **Temp**: Base 8°C, Optimal 15-22°C, Max 38°C, Gèle -25°C
- **Croissance**: Extrêmement lente, 5 stages sur siècles (!)
- **Espacement**: 15-30m entre arbres
- **Particularité**: Arbre de très longue vie (siècles)
- **Récolte**: 20-30 ans pour glands comestibles
- **Besoins**: Soleil 6h+, Sol profond, Acide preferé

**Variétés BotanIA**:
| Variété | shopId | realDaysToHarvest | Notes |
|---------|--------|------------------|-------|
| Pédoncule | inrae | 1455j (4 ans) | Chêne commun français |

### ÉRABLE (Acer platanoides) - Pépinières Bordas
- **Temp**: Base 5°C, Optimal 10-22°C, Max 35°C, Gèle -30°C
- **Croissance**: Moyenne, ornemental
- **Espacement**: 8-12m entre arbres
- **Particularité**: Feuillage doré en automne
- **Besoins**: Soleil à ombre partielle, Sol profond

### BOULEAU (Betula pendula) - Pépinières Bordas
- **Temp**: Base 5°C, Optimal 10-20°C, Max 35°C, Gèle -40°C
- **Croissance**: Rapide, ornemental
- **Espacement**: 6-10m entre arbres
- **Particularité**: Écorce blanche décorative, croissance rapide
- **Besoins**: Soleil, Sol sableux drainé, Acide preferé

### PIN SYLVESTRE (Pinus sylvestris) - Pépinières Bordas
- **Temp**: Base 5°C, Optimal 10-20°C, Max 38°C, Gèle -40°C
- **Croissance**: Lente, conifère
- **Espacement**: 5-8m entre arbres
- **Particularité**: Écorce orange, rustique
- **Besoins**: Soleil 6h+, Sol sableux, Résistant sec

### MAGNOLIA (Magnolia grandiflora) - Pépinières Bordas
- **Temp**: Base 10°C, Optimal 15-25°C, Max 35°C, Gèle -15°C
- **Croissance**: Lente, ornemental
- **Espacement**: 4-6m entre arbres
- **Particularité**: Fleurs blanches géantes parfumées, feuillage persistant
- **Besoins**: Soleil à ombre partielle, Sol riche drainé

---

## 9. Structure Code - game-store.ts

### Boutiques (SEED_SHOPS)
```typescript
// Graines (Onglet Graines)
- vilmorin, clause, kokopelli, lebiau, saintemarthe

// Arbres (Onglet Arbres)
- guignard (fruitiers)
- inrae (forestiers)
- pepinieres-bordas (ornement)
- arbres-tissot (fruitiers)
- fruitiers-forest (fruitiers)
```

### Images Paths
```
// Graines
/packets/{shop}/packet-{variety}.png

// Arbres Pots
/pots/{shop}/pot-{variety}.png

// Trees Stages
/trees/{shop}/{variety}-stage-{N}.png
```

---

## 10. Checklist Implémentation

### Phase 1: Graines ✅ ÉTÉ
- [x] Structure packets/
- [x] Structure cards/
- [x] Plants stages (tomato fait)

### Phase 2: Arbres ✅ FAIT
- [x] Structure pots/ + trees/
- [x] Pots Guignard (3)
- [x] Trees Guignard (15)
- [x] Pots Arbres Tissot (4)
- [x] Trees Arbres Tissot (20)
- [x] Pots INRAE cerisier (1)
- [x] Trees INRAE cerisier (5)
- [x] Reserve lemon/orange (en attente)
- [x] Séparation onglets Graines/Arbres

### Phase 3: À faire
- [ ] INRAE: Noyer, Chêne (pots + trees)
- [ ] Bordas: Érable, Bouleau, Pin, Magnolia (pots + trees)
- [ ] Fruitiers Forest: À définir
- [ ] Toutes les graines (paquets + cards + plants)

---

*Document généré le 2026-04-06*
*BotanIA - Le jeu de simulation de jardin botanique*
