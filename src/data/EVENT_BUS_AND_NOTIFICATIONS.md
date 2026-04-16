# BotanIA — EventBus, Notifications & Systèmes Couche 2-3-4

> Documentation vitale pour comprendre l'architecture événementielle et les nouveaux composants.
> Mis à jour : 2026-04-15

## EventBus (`src/lib/event-bus.ts`)

Système d'événements typé et léger permettant la communication entre modules sans couplage direct.

### Types d'événements

| Catégorie | Événement | Payload | Émetteur |
|-----------|-----------|---------|-----------|
| Jardin | `plant:harvested` | `{ plantDefId, coins }` | garden-store |
| Jardin | `plant:planted` | `{ plantDefId, containerType }` | garden-store |
| Jardin | `plant:watered` | `{ plantDefId, waterLevel }` | garden-store |
| Jardin | `plant:died` | `{ plantDefId, cause }` | — |
| Maladie | `disease:detected` | `{ plantDefId, diseaseName, severity }` | — |
| Ravageurs | `pest:detected` | `{ plantDefId, pestName }` | — |
| Météo | `frost:warning` | `{ dayOffset, minTemp }` | WeatherForecast |
| Météo | `heatwave:warning` | `{ dayOffset, maxTemp }` | WeatherForecast |
| Météo | `storm:warning` | `{ dayOffset }` | WeatherForecast |
| Économie | `coins:earned` | `{ amount, source }` | shop-store |
| Économie | `coins:spent` | `{ amount, item }` | shop-store |
| Économie | `market:sold` | `{ plantDefId, units, coinsPerUnit }` | economy-store |
| Quêtes | `quest:completed` | `{ questId, reward }` | economy-store |
| Badges | `achievement:unlocked` | `{ achievementId }` | onboarding-store |
| Bonus | `dailybonus:claimed` | `{ streak, coins }` | economy-store |
| Écologie | `eco:gesture_verified` | `{ gestureType, ecoPoints }` | — |
| Notifications | `notification:show` | `{ message, emoji, severity }` | — |

### Usage

```ts
import { eventBus } from '@/lib/event-bus';

// Écouter
const unsub = eventBus.on('plant:harvested', (payload) => {
  console.log(`${payload.plantDefId} récolté, +${payload.coins} pièces`);
});

// Émettre (synchrone)
eventBus.emit({ type: 'plant:harvested', plantDefId: 'tomato', coins: 8 });

// Émettre (asynchrone — après le rendu React)
eventBus.emitAsync({ type: 'coins:spent', amount: 10, item: 'seed:tomato' });

// Nettoyer
unsub();
```

## Onboarding (`src/store/onboarding-store.ts`)

Système de quêtes narratives guidant le nouvel utilisateur. 8 étapes progressives :

1. **welcome** — Premier pas (auto-complété au chargement)
2. **first-seed** — Achète une graine (détecté via `coins:spent`)
3. **first-plant** — Plante au jardin (détecté via `plant:planted`)
4. **first-water** — Arrose (détecté via `plant:watered`)
5. **first-harvest** — Récolte (détecté via `plant:harvested`)
6. **first-sell** — Vend au marché (détecté via `market:sold`)
7. **discover-3** — Découvre 3 variétés (détecté via achat/plantation)
8. **quest-master** — Complète 5 quêtes quotidiennes (détecté via `quest:completed`)

Les abonnements EventBus sont gérés par `subscribeOnboardingEvents()` / `unsubscribeOnboardingEvents()` dans `page.tsx`.

## Notifications (`src/store/notification-store.ts`)

Toasts in-app éphémères (auto-dismiss 4-8s selon sévérité). Abonnés à tous les événements EventBus.

- **success** : vert (récolte, quête, bonus)
- **info** : bleu (achats)
- **warning** : orange (maladie, ravageurs, gel, canicule)
- **error** : rouge (plante morte, gel sévère)

## Calendrier INRAE (`src/components/game/PlantingCalendar.tsx`)

Visualisation mensuelle des périodes de semis/récolte pour toutes les plantes du catalogue. Données source : `PLANTS` (optimalPlantMonths, optimalSeasons).

## Courbe de croissance (`src/components/game/GrowthCurveChart.tsx`)

Courbe sigmoïde logistique basée sur les GDD accumulés. Montre la progression réelle vs. stades attendus.

## Météo prédictive (`src/components/game/WeatherForecast.tsx`)

Prévisions 7 jours avec alertes automatiques :
- Gel (min ≤ 2°C) → alerte bleue
- Canicule (max ≥ 35°C) → alerte rouge
- Tempête (vent ≥ 60 km/h) → alerte orange

Données : Open-Meteo API (`forecast_days=7`). Émet les événements `frost:warning`, `heatwave:warning`, `storm:warning`.

## Stat-cards plante (`src/components/game/PlantStatCard.tsx`)

Carte synthétique réutilisable affichant température, eau, lumière, Kc, résistances, calendrier. Utilise `getPlantDef` et `getPlantDisplay` de `plant-db.ts`.

## Journal photo horodaté (`src/components/game/PhotoTimeline.tsx`)

Timeline visuelle des photos de jardin, groupées par jour. Détail modal avec métadonnées GPS, identification IA, détection maladies. Utilise `photo-store` et `journal-store`.

## Marché dynamique (`src/store/market-store.ts`)

Prix dynamiques basés sur la saison et l'offre/demande :
- Primeur (1 mois avant saison) : +40%
- Pleine saison : prix normal
- Après saison : -20%
- Hors saison : -30%
- Vente massive → baisse progressive de la demande

Fonctions : `getCurrentPrice()`, `sellOnMarket()`, `refreshPrices()`

## Célébrations (`src/components/game/CelebrationOverlay.tsx`)

Overlay visuel animé déclenché par les événements EventBus :
- `achievement:unlocked` → Confetti + badge onboarding
- `quest:completed` → Étoiles + récompense pièces
- `plant:harvested` → Animation récolte
- `dailybonus:claimed` → Pièces qui tombent

Monté dans `page.tsx` au niveau racine.

## Catalogue variétés (`src/components/game/VarietyCatalog.tsx`)

Vue complète de toutes les plantes avec filtres (saison, catégorie : légumes/arbres/petits fruits, recherche). Chaque variété affiche PlantStatCard + GrowthCurveChart + infos détaillées.