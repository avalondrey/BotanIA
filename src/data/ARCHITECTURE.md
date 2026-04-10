# BotanIA — Architecture Technique

> Documentation de l'architecture technique pour les sessions IA.
> Mis à jour : 2026-04-07

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
├── game-store.ts         # [VOLUMINEUX ~2500 lignes] — TOUT l'état principal
│                        # Problème: sera refactorisé en stores séparés
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
│   └── ...
├── hooks/
│   └── useAgroData.ts          # [UTILISE HologramEvolution] — Calcule données agronomiques
│                                # pour chaque plante du jardin
├── lib/
│   ├── ai-engine.ts            # PLANTS record — définitions botaniques
│   ├── gdd-engine.ts           # Calcul GDD (FAO)
│   ├── hydro-engine.ts         # Besoins eau (ET0 FAO)
│   ├── companion-matrix.ts     # Associations INRAE
│   ├── soil-temperature.ts     # Température sol + semis
│   ├── weather-dynamics.ts     # Modèles maladies
│   ├── water-budget.ts         # Budget hydrique
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
| 🔴 Critique | `game-store.ts` monolithique (~2500 lignes) | À refactoriser |
| 🔴 Critique | TypeScript `ignoreBuildErrors: false` maintenant activé | Corrigé |
| 🟡 Moyen | 16 fichiers backup dans `src/store/` | À supprimer |
| 🟡 Moyen | Pas de tests unitaires | Pas implémenté |

---

## Conventions de codage

1. **Types stricts** : Pas de `any` sauf absolue nécessité
2. **Données botaniques** : Toujours sourcées (FAO, INRAE, semenciers)
3. **Nommage** : Français pour le domain botanique, anglais pour le code
4. **HologramEvolution** : NE PAS ajouter de JSX/UI — c'est un module de données pures
