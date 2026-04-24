# BotanIA — Dette Technique & Améliorations Futures

> Document listant les améliorations structurelles identifiées mais non prioritaires.

---

## 🔴 Critique (à faire)

### 1. Les variétés ne grandissent pas dans la simulation

**Fichier :** `src/store/simulation-store.ts:167`

```typescript
const plantDef = PLANTS[gp.plantDefId]; // "tomato-cocktail" → undefined
if (!plantDef) return gp; // ← ignorée silencieusement
```

Toute plante dont `plantDefId` est un ID de variété est ignorée par le tick de simulation et ne grandit jamais.

**Correctif :** Résoudre via `resolveBasePlantId()` avant le lookup PLANTS.

---

### 2. SUPPLEMENTARY_CARDS écrase les données HologramEvolution

**Fichier :** `src/lib/plant-db.ts:250-254`

```typescript
const ALL_CARDS = { ...PLANT_CARDS, ...TREE_CARDS, ...SUPPLEMENTARY_CARDS };
```

6 plantes (`sunflower`, `melon`, `corn`, `quinoa`, `amaranth`, `sorrel`) sont dans SUPPLEMENTARY_CARDS **et** dans HologramEvolution.tsx. Le spread écrase les vraies données.

**Correctif :** Supprimer ces 6 entrées de SUPPLEMENTARY_CARDS.

---

### 3. `data/graines/` et `data/arbres/` dupliqués

~60 fichiers CARD_DATA dans `src/data/graines/` et `src/data/arbres/` qui :
- Ne sont jamais importés par le frontend
- Sont lus par le microservice via `readCardDataForPlant()`
- Dupliquent des données déjà dans `catalog.ts` et `HologramEvolution.tsx`

**Correctif :** Migrer vers une source unique ou supprimer les doublons.

---

## 🟡 Important

### 4. Rotation des cultures incomplète

**Fichier :** `src/lib/crop-rotation.ts:189-196`

Seulement 6 familles dans `goodRotations`. Manquent :
- Poacées (corn)
- Polygonacées (sorrel, rhubarb)
- Lamiacées (basil, mint)
- Amaranthacées (spinach, quinoa, amaranth)
- Rosacées (strawberry — rotations inconnues)
- Et toutes les familles d'arbres

---

### 5. PLANT_FAMILY_MAP dupliquée microservice/frontend

La map existe maintenant dans deux endroits :
- `src/lib/botany-constants.ts` (frontend)
- `ai-microservice/src/index.ts` (microservice)

Elles peuvent diverger avec le temps.

**Correctif :** Partager via un package ou synchronisation automatique.

---

### 6. Try/catch silencieux

**Fichiers :** `game-store.ts:1403-1406` et plusieurs autres endroits

```typescript
try { ... } catch {} // ← erreurs ignorées
```

**Correctif :** Logger les erreurs avec au minimum `console.warn`.

---

## 🔵 Suggestions

### 7. Cache Service Worker — versionnage

L'erreur "Module not available" après reboot est causée par le Service Worker qui sert des chunks obsolètes.

**Correctif :** Incrémenter le cache version dans le SW à chaque déploiement.

### 8. COMPANION_MATRIX incomplet

~80 plantes dans le jeu, seulement 6 ont des entrées dans `companion-matrix.ts`. Toutes les autres n'ont aucun compagnon détecté.

### 9. Tests manquants

- Pas de test pour la résolution `PLANT_VARIETY_MAP`
- Pas de test pour le tick de simulation avec variétés
- Pas de test pour `buildImagePrompt()` avec/sans cardData

### 10. Documentation endpoints microservice

Les endpoints du microservice n'ont pas de documentation OpenAPI/Swagger.
