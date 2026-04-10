# BotanIA — Contexte du Projet

> **IMPORTANT** : Ce fichier documente le projet pour TOUTES les conversations IA.
> Toute nouvelle session IA doit lire ce fichier en premier.

---

## Vision & Concept

**BotanIA** est une **application de jardinage botanique scientifique** — pas un jeu.

L'application reproduit fidèlement le cycle de vie des plantes selon des **données agronomiques réelles** (INRAE, FAO, GNIS) et les connecte à votre **jardin réel** via photo, GPS et IA.

### Différence clé avec un "jeu"
- Les données de croissance (GDD, besoins eau, compagnonnage) sont **réelles**, basées sur la science agronomique
- Les calculs sont **vérifiables** — pas de mécaniques "game" arbitraires
- L'objectif est l'**utilité réelle** : aider à cultiver un vrai jardin

### Philosophie
1. **Données scientifiques d'abord** : tout calcul vient de sources vérifiées (FAO, INRAE)
2. **Le réel prime** : si la météo dit 5°C, les plantes réagissent comme dans la vraie vie
3. **Invisible mais indispensable** : le "cerveau botanique" (HologramEvolution.tsx) est le cœur des calculs, invisible à l'utilisateur mais critique pour la justesse
4. **Évolution continue** : de nouvelles données botaniques sont ajoutées au fur et à mesure

---

## Terminologie importante

| Terme | Signification |
|---|---|
| **HologramEvolution** | Le "cerveau botanique" — module de calculs invisibles containing toutes les données réelles des plantes |
| **PlantCard** | Fiche mémoire botanique d'une plante (Tbase, GDD, Kc, compagnonnage, maladies, stades) |
| **GDD** | Growing Degree Days — accumulateurs de chaleur pour la croissance |
| **ET0** | Évapotranspiration de référence (FAO) — base du calcul des besoins en eau |
| **Kc** | Coefficient cultural — multiplicateur FAO par stade de croissance |
| **Companonnage** | Associations favorables/défavorables entre plantes (matrice INRAE) |
| **Plant** | Plante en croissance dans le jardin |
| **Seed** | Variété de graine disponible en boutique |
| **Plantule** | Jeune plant en pépinière (mini-serre) |

---

## Positionnement de l'application

### Ce que BotanIA n'est PAS
- ❌ Un "jeu" de simulation
- ❌ Un jeu de cartes avec mécaniques arbitraires
- ❌ Une application décorative

### Ce que BotanIA EST
- ✅ Une **application de culture botanique scientifique**
- ✅ Un **outil d'aide au jardinage réel**
- ✅ Un **calculateur agronomique** connecté à la météo et GPS réels
- ✅ Un **suivi de jardin** avec identification IA

---

## Données botaniques réelles

Les données de chaque plante (Tbase, Tcap, GDD, Kc, compagnonnage, maladies) sont stockées dans `HologramEvolution.tsx` (cerveau botanique).

Elles viennent de sources scientifiques :
- **FAO** (Food and Agriculture Organization) — coefficients culturaux, ET0
- **INRAE** (Institut national de recherche pour l'agriculture) — compagnonnage, conduite culturale
- **GNIS** (Groupement National Interprofessionnel des Semences) — variétés, catalogue
- **Semenciers** (Kokopelli, Biau Germe, Vilmorin, etc.) — données de germination

---

## Comment contribuer à ce projet

### Ajouter une nouvelle plante
1. Ajouter ses données botaniques dans `HologramEvolution.tsx` (PlantCard)
2. Ajouter son image dans `/public/plants/`
3. Ajouter sa définition dans `PLANTS` dans `ai-engine.ts`
4. Ajouter les données de croissance (stades, jours de récolte)

### Modifier les calculs agronomiques
1. Toute modification doit préserver la fidélité scientifique
2. Les sources (FAO, INRAE) doivent être documentées
3. Vérifier que `useAgroData.ts` reflète les changements

### Nouvelles fonctionnalités
1. Doivent être liées à des données botaniques réelles
2. Ne pas introduire de mécaniques arbitraires ("je ne savais pas que...")
3. Priorité aux fonctionnalités utiles pour le jardinage réel

---

## Pour les nouvelles sessions IA

**开场问候** :

```
"Bienvenue ! Avant de commencer, il faut lire le contexte du projet :
cat src/data/PROJECT_CONTEXT.md

Cela expliquera que BotanIA est une APPLICATION de culture botanique
scientifique, pas un jeu. Le 'cerveau botanique' est HologramEvolution.tsx
qui contient toutes les données réelles des plantes pour les calculs."
```
