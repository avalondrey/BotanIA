# BotanIA — Correctifs et Améliorations (23 Avril 2026)

## Résumé des changements

| Fichier(s) | Changement | Type |
|---|---|---|
| `src/lib/ai-engine.ts` | Ajout `plantFamily?: string` à `PlantDefinition` | Fix |
| `src/lib/plant-db.ts` | Propagation `plantFamily` depuis `PlantCard` | Fix |
| `src/lib/agent/plant-integrator.ts` | Remplacement `guessFamily` → `getPlantFamily` importé | Refactor |
| `src/components/game/HologramEvolution.tsx` | Suppression map dupliquée, import depuis `botany-constants` | Refactor |
| `src/app/page.tsx` | Fix `require()` anti-pattern + dépendance `initGame` inutile | Fix |
| `src/components/agent/AgentInitializer.tsx` | Fix `AbortSignal.timeout` incompatible Safari | Fix |
| `src/store/agent-store.ts` | Déduplication notifications + séparation toggle/capacité | Fix |
| `src/lib/agent/proactive-agent.ts` | Condition `canUseLocalAI` avant snapshot | Fix |
| `src/lib/botany-constants.ts` | Centralisation `PLANT_FAMILY_MAP` + `PLANT_VARIETY_MAP` | Refactor |
| `src/data/plant-categories.ts` | Commité (manquait sur le repo) | Fix |
| `src/components/game/WeatherFX.tsx` | Commité (untracked, build Vercel KO) | Fix |
| `src/hooks/useWeatherAlerts.ts` | Commité (untracked, build Vercel KO) | Fix |
| `src/lib/botany-constants.test.ts` | Tests `getPlantFamily`, `resolveBasePlantId` | Test |
| `src/lib/plant-db.test.ts` | Tests `getPlantDef`, `plantExists`, `getPlantDisplay` | Test |

---

## Bug : `plantFamily: 'Unknown'` pour les variétés

### Problème
`escallonia-iveyi`, `apple-gala`, `zucchini-verte-italie` retournaient `'Unknown'` car ils n'existaient pas dans `PLANT_FAMILY_MAP`.

### Solution
1. Ajout `plantFamily` à l'interface `PlantDefinition` (`ai-engine.ts`)
2. Propagation dans `plantCardToDefinition` (`plant-db.ts`)
3. Création `PLANT_VARIETY_MAP` explicite (`botany-constants.ts`)

```typescript
export const PLANT_VARIETY_MAP: Record<string, string> = {
  'apple-gala': 'apple',
  'apple-golden': 'apple',
  'cassis-blanc-ojeblanc': 'blackcurrant',
  'escallonia-iveyi': 'escallonia',
  'photinia-red-robin': 'photinia',
  'eleagnus-gilt-edge': 'eleagnus',
  'laurus-nobilis': 'laurus',
  'cornus-alba': 'cornus',
  'zucchini-black-beauty': 'zucchini',
  'zucchini-verte-italie': 'zucchini',
  'zucchini-verte-milan-black-beauty': 'zucchini',
};

export function resolveBasePlantId(id: string): string {
  return PLANT_VARIETY_MAP[id] ?? id;
}

export function getPlantFamily(id: string): string {
  const baseId = resolveBasePlantId(id);
  return PLANT_FAMILY_MAP[baseId] ?? 'Unknown';
}
```

---

## Bug : Lia (Agent Proactif) Spam de Notifications

### Problème
Toutes les 45 secondes, l'agent ajoutait les mêmes notifications même si elles existaient déjà.

### Solution
Déduplication par `title` dans `agent-store.ts` :
```typescript
addNotification: (n) =>
  set((s) => {
    const alreadyUnread = s.pendingNotifications.find(
      (p) => p.title === n.title && !p.read
    );
    if (alreadyUnread) return s; // skip duplicate
    // ...
  })
```

---

## Bug : Lia Flicker au Démarrage

### Problème
`isLocalAIActive` persisté en `localStorage` écrasé par `AgentInitializer` → re-render flash.

### Solution
Séparation en deux flags :
- `isLocalAIActive` : toggle utilisateur (persisté)
- `canUseLocalAI` : Ollama + Qdrant disponibles (détecté au startup)

---

## Bug : `AbortSignal.timeout` Incompatible

### Problème
`AbortSignal.timeout(3000)` n'existe pas dans Safari < 16.4 → crash silencieux.

### Solution
Helper universel :
```typescript
function abortTimeout(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}
```

---

## Bug : Build Vercel — Fichiers Manquants

### Problème
`plant-categories.ts`, `WeatherFX.tsx`, `useWeatherAlerts.ts` étaient locaux mais pas sur GitHub.

### Solution
Commit des fichiers untracked.

---

## Refactor : Centralisation `PLANT_FAMILY_MAP`

- Avant : map dupliquée dans `HologramEvolution.tsx` (190 lignes) + `plant-integrator.ts` (40 lignes)
- Après : source unique dans `src/lib/botany-constants.ts`

---

## Tests Ajoutés

### `src/lib/botany-constants.test.ts` (7 tests)
- Base IDs (tomato → Solanaceae)
- Variétés (escallonia-iveyi → Escalloniaceae)
- Unknown (nonexistent → Unknown)
- Coverage (toutes les entrées PLANT_FAMILY_MAP)
- Variety map integrity (chaque variété a une base valide)

### `src/lib/plant-db.test.ts` (5 tests)
- `getPlantDef` retourne la plante avec famille
- `getPlantDef` undefined pour inconnu
- `plantExists` vrai/faux
- `getPlantDisplay` fallback
- `PLANTS` contient tomato avec famille

---

## Commits

| Hash | Message |
|---|---|
| `d1d86e0` | fix: resolve plantFamily Unknown for variety plants |
| `490129f` | fix: page.tsx require anti-pattern and extra dependency |
| `9e191e5` | fix: Lia agent spam, flicker, and missing plant-categories module |
| `306f76b` | refactor: centralize PLANT_FAMILY_MAP in botany-constants.ts |
| `8662f1f` | test: add unit tests for botany-constants and plant-db |
| `7a75959` | fix: add missing WeatherFX and useWeatherAlerts files |
| `4d8e36e` | feat: proper variety system with explicit PLANT_VARIETY_MAP |
