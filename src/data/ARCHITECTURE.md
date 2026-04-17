# BotanIA — Architecture Technique

> Documentation de l'architecture technique pour les sessions IA.
> Mis à jour : 2026-04-17 (v2.2.0)

---

## Stack technique

| Technologie | Usage |
|---|---|
| Next.js 16 + Turbopack | Framework React server-side |
| React 19 + TypeScript | UI type-safe |
| Zustand 5 | State management (localStorage persist) |
| Tailwind CSS 4 | Styles |
| Framer Motion | Animations |
| Prisma + SQLite | Base de données |
| Open-Meteo API | Météo temps réel (sans clé) |
| Groq SDK | IA vision (cloud gratuit) |
| Ollama | IA locale (optionnel) |

---

## Structure des stores Zustand

```
src/store/
├── game-store.ts         # État principal (jardin, pépinière, simulation)
├── shop-store.ts         # Boutique, inventaire, pièces
├── nursery-store.ts     # Pépinière
├── garden-store.ts       # Plantes du jardin, zones serre, actions jardin
├── simulation-store.ts  # Simulation temps
├── economy-store.ts     # Quêtes quotidiennes, bonus, marché
├── onboarding-store.ts  # Quêtes narratives d'onboarding (8 étapes)
├── notification-store.ts # Toasts in-app pilotés par EventBus
├── market-store.ts     # Marché dynamique (prix saisonniers)
├── ui-settings-store.ts # Paramètres UI
├── photo-store.ts       # Photos, GPS, rangs tracés
├── harvest-store.ts     # Suivi des récoltes
├── achievement-store.ts # Badges jardinier
└── journal-store.ts    # Journal de notes
```

---

## Structure des modules botaniques

```
src/
├── components/game/
│   ├── HologramEvolution.tsx  # [CERVEAU BOTANIQUE] — Données reales + calculs
│   │                           # InISIBLE pour l'utilisateur mais critique pour les calculs
│   ├── Jardin.tsx              # Vue principale du jardin
│   ├── GardenPlanView.tsx      # Vue plan avec grille
│   ├── GardenCardsView.tsx     # Vue cartes manga
│   ├── SeedRowPainter.tsx      # Dessin sur photo
│   ├── PlantIdentifier.tsx     # Identification IA
│   ├── Pepiniere.tsx           # Chambre de culture
│   ├── Boutique.tsx            # Achat graines/arbres
│   ├── OnboardingTracker.tsx  # Parcours onboarding (8 étapes)
│   ├── NotificationContainer.tsx # Toasts in-app (EventBus)
│   ├── CelebrationOverlay.tsx  # Animations de célébration
│   ├── PlantStatCard.tsx      # Carte statistique plante
│   ├── PlantingCalendar.tsx    # Calendrier INRAE
│   ├── GrowthCurveChart.tsx    # Courbe sigmoïde GDD
│   ├── WeatherForecast.tsx     # Prévisions 7j + alertes
│   ├── PhotoTimeline.tsx       # Journal photo horodaté
│   ├── VarietyCatalog.tsx      # Catalogue variétés
│   └── ...
├── hooks/
│   └── useAgroData.ts          # [UTILISE HologramEvolution] — Calcule données agronomiques
│                                # pour chaque plante du jardin
├── lib/
│   ├── ai-engine.ts            # PLANTS re-export (source: plant-db.ts)
│   ├── plant-db.ts             # Source unique de vérité PLANTS (depuis PLANT_CARDS)
│   ├── gdd-engine.ts           # Calcul GDD (FAO)
│   ├── hydro-engine.ts         # Besoins eau (ET0 FAO)
│   ├── companion-matrix.ts     # Associations INRAE
│   ├── event-bus.ts            # EventBus typé — communication inter-modules
│   ├── water-budget.ts         # Budget hydrique hebdomadaire
│   ├── soil-temperature.ts     # Température sol + semis
│   ├── weather-service.ts      # Open-Meteo
│   └── gps-extractor.ts        # EXIF GPS
└── data/
    ├── PROJECT_CONTEXT.md       # [LIRE EN PREMIER]
    ├── ARCHITECTURE.md          # Ce fichier
    └── DATA_SOURCES.md         # Sources scientifiques
```

---

## Flux des données botaniques

```
[HologramEvolution.tsx]
         │
         │ PlantCard (Tbase, Tcap, GDD, Kc, compagnonnage, stades)
         │
         ▼
[ai-engine.ts] ──definit les plantes──► [game-store.ts] (gardenPlants)
                                                 │
                                                 ▼
                                    [useAgroData.ts]
                                    (calcule GDD, eau, sol, maladies)
                                                 │
                                                 ▼
                                    [Composants UI]
                                    (GardenPlanView, HologramEvolution display, etc.)
```

---

## Le "Cerveau Botanique" : HologramEvolution.tsx

### Rôle
Module **INVISIBLE** contenant :
- Toutes les données botaniques réelles d'une plante
- Fonctions pures de calcul agronomique
- Tableaux de références (Tbase, Tcap, GDD, Kc, compagnonnage)

### Ce qu'il contient
```typescript
// Données par plante (PlantCard)
interface PlantCard {
  id: string;
  name: string;
  // Températures seuils
  tBase: number;      // Below this = no growth
  tCap: number;        // Above this = stress
  // GDD (Growing Degree Days)
  stageGDD: number[]; // GDD needed per stage
  // Eau (FAO)
  kc: number;         // Coefficient cultural
  waterNeedMmPerDay: number;
  // Sol
  minSoilTempForSowing: number;
  // Stades de croissance
  stageDurations: number[]; // jours par stade
  // Companonnage
  companions: { plant: string; type: 'beneficial' | 'harmful' }[];
  // Maladies
  diseaseRisks: { name: string; trigger: string }[];
  // Jours totaux
  totalDaysToHarvest: number;
}
```

### Principe fondamental
> **TOUT calcul agronomique doit passer par HologramEvolution.tsx**
> Les composants UI ne font qu'AFFICHER les données calculées.

### Règles de validation pour les arbres (TREE_CARDS)

| Champ | Règle | Valeurs correctes |
|-------|-------|-------------------|
| `totalDaysToHarvest` | Fruitiers 3-6 ans, forestiers 15-30 ans | Fruitiers: 1095-2190, Forestiers: 5475-10950 |
| `firstHarvestYears` | = totalDaysToHarvest / 365 | 3, 4, 5, 6, 8 ans |
| `stageDurations` | Pour arbres uniquement | `[45, 90, 180, 365]` |
| `stageGDD` | Pour arbres uniquement | `[200, 400, 800, 1500]` minimum |
| `plantCategory` | Obligatoire | `'fruit-tree'` ou `'forest-tree'` |
| `treeData` | Obligatoire pour arbres | Objet complet avec pollinationType, frostResistance, etc. |

> ⚠️ **ERREURS COURANTES** : Ne jamais utiliser 5475 pour un fruitier (c'est pour les forestiers). Ne jamais utiliser des `stageGDD` de légume pour un arbre.

---

## Onglets de navigation (GameTabs)

| Onglet | Composant | Description |
|---|---|---|
| 🌿 Jardin | Jardin + IAJardinier + GameConsole | Vue principale du jardin |
| 🏡 Serre | SerreJardinView | Zones serre |
| 🏠 Culture | Pepiniere | Chambre de culture |
| 🏪 Boutique | Boutique + OnboardingTracker | Achat graines/arbres |
| 🌱 Inventaire | GrainCollection | Collection de graines |
| 🔍 ID | PlantIdentifier | Identification IA |
| 📔 Journal | GardenJournalLunar | Journal + calendrier lunaire |
| ⚖️ Récoltes | HarvestTracker + Marché dynamique | Suivi récoltes + vente |
| 🦠 Maladies | DiseaseDetector | Détection maladies |
| 💾 Save | GardenSaveManager | Sauvegardes |
| 💧 Eau | WaterBudget | Budget hydrique |
| 🌱 Croissance | HologramEvolution + GrowthCurveChart | Données agronomiques |
| 📖 Catalogue | VarietyCatalog + PlantingCalendar | Catalogue variétés + calendrier |
| 🌦️ Météo | WeatherForecast | Prévisions 7j + alertes |
| 📸 Photos | PhotoTimeline | Journal photo horodaté |

---

## Commandes importantes

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer production
npm run start

# Push DB
npm run db:push
```

---

## Problèmes techniques connus

| Criticité | Problème | Status |
|---|---|---|
| 🟡 Moyen | 16 fichiers backup dans `src/store/` | À supprimer |
| 🟡 Moyen | Pas de tests unitaires | Pas implémenté |
| 🟢 Mineur | gdd-engine.test.ts : readonly tuple vs mutable | Pré-existant, n'affecte pas l'app |

---

## Conventions de codage

1. **Types stricts** : Pas de `any` sauf absolue nécessité
2. **Données botaniques** : Toujours sourcées (FAO, INRAE, semenciers)
3. **Nommage** : Français pour le domain botanique, anglais pour le code
4. **HologramEvolution** : NE PAS ajouter de JSX/UI — c'est un module de données pures
