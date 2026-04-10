# BotanIA - Système Pollinisation & Prévention Phytosanitaire

## 1. Activité Pollinisatrice Locale (Real Pollinator Sync)

### Concept
La nouaison (transformation fleur → fruit) dépend de l'activité réelle des insectes pollinisateurs (abeilles, bourdons) dans la zone, elle-même dictée par la météo.

### Biologie Réelle
Les abeilles ne volent pas :
- Si T° < 12°C (trop froid)
- Si vent > 20 km/h (trop venteux)
- Sous la pluie

### Implémentation

**Fonction** : `getPollinatorActivity(temperature, windSpeed, isRaining)` dans `ai-engine.ts`

```typescript
export function getPollinatorActivity(
  temperature: number,
  windSpeed: number,
  isRaining: boolean
): number {
  if (temperature < 12) return 0.1;  // T° trop froide
  if (temperature < 15) return 0.3;  // T° fraîche, activité réduite
  if (windSpeed > 25) return 0.2;     // Vent trop fort
  if (windSpeed > 20) return 0.4;    // Vent modéré
  if (isRaining) return 0.1;        // Pluie = pas de vol
  if (temperature > 30) return 0.6; // Chaleur forte, activité réduite
  return 1.0;                          // Conditions optimales
}
```

**Application** :
- `PlantState.fruitSetRate` = activité pollinisatrice (0-1)
- Uniquement pour plantes en stade 3 (floraison) et nécessitant des pollinisateurs

**Plantes dépendantes des pollinisateurs** :
- `cucumber`, `zucchini` (nécessite pollinisation)
- `tomato`, `pepper`, `eggplant` (autogames mais meilleur avec vibration)
- `strawberry`, `cabbage`, `bean`, `pea`

**Alerte générée** :
> 🐝 Activité pollinisatrice réduite aujourd'hui. (activité: 30%)
> 🐝 Secoue délicatement les fleurs de tomates ce soir pour favoriser la nouaison. (activité: <20%)

---

## 2. Moteur de Prévention Phytosanitaire (Disease Forecast)

### Concept
Au lieu de réagir aux maladies, l'IA les prédit 24-48h à l'avance selon les seuils épidémiologiques officiels.

### Seuils Épidémiologiques

**Mildiou** (Phytophthora infestans) :
- Conditions : HR > 90%, T° 10-28°C
- Délai d'explosion : 48h d'humidité continue
- Source : INRAE, FNAMS

**Oïdium** (Erysiphe) :
- Conditions : HR 55-82%, T° 15-28°C, temps sec (pas de pluie)
- Délai : 48h d'humidité modérée + chaleur
- Source : INRAE

### Implémentation

**Tracking** : `PlantState.diseasePressureHours`
- Incremente de 24h par jour de conditions favorables
- Reset de 48h si conditions défavorables

**Alertes prédictives** :
- 48h de conditions → `warning` : "Risque mildiou élevé dans 24h. Applique purin d'ortie maintenant."
- 72h+ de conditions → `critical` : "Conditions idéales pour mildiou/oïdium ! Traitement urgent nécessaire."

### Différence Reactif vs Préventif

| Approach | Timing | Message |
|----------|--------|---------|
| **Reactif** (avant) | Après infection | "Maladie détectée sur Tomate !" |
| **Préventif** (maintenant) | 24-48h avant | "Risque mildiou élevé dans 24h. Applique purin d'ortie maintenant." |

---

## Fichiers Modifiés

| Fichier | Modification |
|---------|--------------|
| `src/lib/ai-engine.ts` | Ajout `fruitSetRate`, `diseasePressureHours` dans `PlantState` |
| `src/lib/ai-engine.ts` | Ajout `getPollinatorActivity()`, `needsPollinators()` |
| `src/lib/ai-engine.ts` | Ajout logique pollinisation dans `simulateDayWithRealWeather` |
| `src/lib/ai-engine.ts` | Ajout tracking `diseasePressureHours` + alertes prédictives |
| `src/lib/ai-engine.ts` | Ajout type `"pollinator"` dans `AlertData.type` |

---

## Flux des Nouvelles Données

```
Weather Service (Open-Meteo)
    │
    ▼
simulateDayWithRealWeather()
    │
    ├──▶ getPollinatorActivity() ──▶ fruitSetRate ──▶ Alerte pollinisation
    │
    └──▶ diseasePressureHours tracking ──▶ Alerte prédictive (48h/72h)
```

---

## Outils Préventifs Déblocables

Basés sur le système prédictif, ces outils curatifs peuvent être suggérés :

| Maladie | Traitement Préventif | Timing |
|---------|---------------------|--------|
| Mildiou | Purin d'ortie, décoction de prêle | Avant 48h de conditions |
| Oïdium | Bicarbonate de soude, lait 1:9 | Avant 48h |
| Botrytis | Aérer, éviter humidité stagnante | Continu |

---

*Document généré le 2026-04-07*
