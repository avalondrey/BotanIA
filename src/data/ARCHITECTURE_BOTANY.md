# BotanIA - Architecture du Cerveau Botanique

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BOTANIA ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────────────┐    ┌──────────────┐ │
│  │ ai-engine.ts │    │ HologramEvolution.tsx │    │ game-store  │ │
│  │              │    │                      │    │              │ │
│  │ PLANTS{}     │    │ BOTANY_CATALOG{}     │    │ SEED_CATALOG│ │
│  │ (nom/image)  │    │ (UNIFIÉ - UI + Agro)│    │ (boutique)  │ │
│  │              │    │                      │    │              │ │
│  │ admin/créa   │───▶│ 1 SOURCE VÉRITÉ     │◀───│ pointers     │ │
│  └──────────────┘    │ pour le runtime     │    └──────────────┘ │
│                       └──────────────────────┘                     │
│                                │                                    │
│                    ┌───────────┴───────────┐                       │
│                    ▼                       ▼                        │
│           ┌──────────────┐        ┌──────────────┐                │
│           │ useAgroData  │        │ GardenPlan   │                │
│           │ (calculs)    │        │ (UI badges)  │                │
│           └──────────────┘        └──────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Principe Fondamental

**Une seule source de vérité** pour les données botaniques runtime :
- `HologramEvolution.tsx` contient `BOTANY_CATALOG`
- Ce catalogue est la fusion de `PLANTS` (ai-engine) + `PLANT_CARDS` (HologramEvolution original)
- Tous les calculs agronomiques passent par ce catalogue

## Structure du BOTANY_CATALOG

```typescript
interface BotanyCatalogEntry {
  // === IDENTIFICATION ===
  id: string;              // plantDefId unique (ex: "tomato", "carrot")
  name: string;            // NomUI (ex: "Tomate")
  emoji: string;           // EmojiUI (ex: "🍅")

  // === IMAGE ===
  image: string;           // Chemin vers l'image carte
  stages: string[];        // Chemins vers les 6 stades de croissance

  // === DONNÉES BOTANIQUES RÉELLES (FAO/INRAE) ===
  tBase: number;           // Température de base (°C)
  tCap: number;            // Température plafond (°C)
  stageGDD: [number, number, number, number];  // GDD par stade
  stageDurations: [number, number, number, number];  // Jours par stade

  // === EAU (FAO) ===
  kc: number;              // Coefficient cultural FAO
  waterNeedMmPerDay: number;  // Besoin mm/jour

  // === SOL ===
  minSoilTempForSowing: number;   // Température min sol pour semis
  optimalSoilTemp: number;         // Température optimale sol

  // === LUMIÈRE ===
  lightNeedHours: number;    // Heures lumière/jour

  // === COMPAGNONNAGE (INRAE) ===
  companions: CompanionRelation[];

  // === MALADIES ===
  diseaseRisks: DiseaseRisk[];

  // === CALENDRIER ===
  optimalPlantMonths: number[];  // Mois optimaux (0=Jan, 11=Déc)
  harvestSeason: string[];       // Saisons de récolte

  // === RÉSISTANCE ===
  droughtResistance: number;   // 0-1
  diseaseResistance: number;  // 0-1
  pestResistance: number;      // 0-1

  // === RÉCOLTE ===
  totalDaysToHarvest: number;  // Jours totaux graine → récolte
  plantFamily: string;        // Famille botanique

  // === BOUTIQUE (optionnel) ===
  price?: number;             // Prix en pièces
  shopId?: string;            // ID du semencier
  packetImage?: string;       // Chemin sachet
  gramsPerPacket?: number;    // Grammes par paquet
}
```

## Flux de Données

### Création de nouvelle variété (admin)
```
Admin Panel
    │
    ▼
ai-engine.ts (PLANTS) ──参考──▶ CARD_DATA (src/data/graines/*/)
    │                                    │
    │ (pas d'import runtime)             │
    └────────────────────────────────────┘
                     │
                     ▼
            NOUVELLE VARIÉTÉ AJOUTÉE
            au catalogue runtime
            via HologramEvolution.tsx
```

### Runtime (utilisation)
```
HologramEvolution.tsx (BOTANY_CATALOG)
    │
    ├──▶ useAgroData.ts ──▶ GardenPlanView.tsx (badges/tooltip)
    │                          GardenCardsView.tsx (badges)
    │
    └──▶ Boutique ──▶ SEED_CATALOG (pointe vers BOTANY_CATALOG)
```

## Règles

1. **Ne jamais supprimer** une source existante
2. **ai-engine.ts** reste pour admin/création de cartes
3. **CARD_DATA** des fichiers variétés reste comme référence statique
4. **HologramEvolution.tsx** est le point d'entrée unique pour le runtime
5. Les nouvelles plantes ajoutées dans `ai-engine.ts` doivent avoir une PlantCard dans `HologramEvolution.tsx`

## Mise à Jour

Pour ajouter une nouvelle plante :
1. Ajouter dans `ai-engine.ts` → `PLANTS`
2. Ajouter dans `HologramEvolution.tsx` → `BOTANY_CATALOG` (PlantCard complète)
3. Optionnel : créer `CARD_DATA` dans `src/data/graines/` ou `src/data/arbres/` comme documentation

---

*Document généré le 2026-04-07*
