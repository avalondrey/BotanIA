# Changelog

Toutes les modifications notables du projet BotanIA.

---

## v0.9.4 (2025-01) — Semenciers Bio & Corrections

### Nouveautés
- **3 boutiques bio/paysannes ajoutées** :
  - 🌿 **Kokopelli** — semences bio libres et reproductibles depuis +25 ans
  - 🌾 **Le Biau Germe** — semences paysannes bio, 12 fermes en France depuis 1981
  - 🏡 **Ferme de Sainte Marthe** — patrimoine variétal depuis 1973
- **6 nouvelles variétés exclusives** :
  - *Kokopelli* : Tomate Cherokee Purple (65🪙), Tomate Rose de Berne (70🪙)
  - *Biau Germe* : Tomate Marmande (60🪙), Carotte de Guérande (45🪙)
  - *Sainte Marthe* : Basilic Génois (50🪙), Poivron Doux de France (55🪙)

### Corrections
- **Weather-service** : structure `RealWeatherData` corrigée (nested `current` + `today`)
  - Ajout des interfaces `WeatherCurrent` et `WeatherToday`
  - Mapping Open-Meteo → `gameWeather` (`sunny`, `rain`, `cloudy`, `stormy`, `snow`, `drizzle`)
  - `getRealEnvironment(data, zoneId)` remplacé par une fonction propre qui calcule les params par zone
  - `getZonePrecipitation(data, zoneId)` corrigé pour `"serre_tile"` → `"serre"`
  - `isFrostRisk(data)` prend maintenant un `RealWeatherData` complet
- **Optional chaining** sur `state.realWeather.current?.gameWeather` (lignes 1989, 2031) — plus de crash au démarrage
- **Auto-arrosage gratuit quand il pleut** au jardin uniquement (+50% eau, pas en serre)
- **Auto-save toutes les 10 secondes** dans `page.tsx` — backup des stats essentielles dans localStorage

### Infrastructure
- Nettoyage du repo : 49 scripts orphelins supprimés
- Correction de l'encodage UTF-8 double (17 fichiers)
- Suppression du dossier `upload/` contenant des secrets
- Ajout de `public/manifest.json` et `public/sw.js` (PWA ready)
- Push Git automatisé

---

## v0.9.3 — Prix Serre & Correction d'Erreurs

- **Fix** : La création de serre coûte maintenant 200 pièces (ne pouvait plus créer de serres gratuites à l'infini)
- **Fix** : Correction du chemin de l'API météo (`/api/weather` → `/api/ollama`)
- **Fix** : Catch des erreurs météo pour éviter les crashes
- **Fix** : Remplacement de `PEPINIERE_STAGE_IMAGES` par `getStageImage` dans `SerreJardinView`

---

## v0.9.2 — Système de croissance en 6 étapes

- **Système de croissance 6 étapes** avec style manga cel-shadé :
  1. Graine → 2. Germination → 3. Plantule 2 feuilles → 4. Plantule 4 feuilles → 5. Adulte → 6. Floraison
- **Images manga** auto-générées pour chaque étape (64x64px)
- **Flower stage** comme étape finale avant la récolte
- Prompts d'images optimisés pour un style botanique manga

---

## v0.9.1 — Mini-Serres & Boutique

- **Mini-Serres** : 6 chambres × 4 slots = 24 emplacements pour semis protégés
- **Boutique** : achat de graines et plantules (SEED_CATALOG + PLANTULE_CATALOG)
- **Pépinière** : zone de semis dédiée avec grille 6×4
- **Pipeline complet** : Boutique → Pépinière/Mini Serre (5 étapes) → Jardin
- **Système de seed varieties** : 2 boutiques (Vilmorin, Clause) avec variétés exclusives
  - Tomate Cocktail, Tomate Anéas
- Auto-arrosage quand il pleut au jardin

---

## v0.9.0 — Initial Commit

- Structure de base du jeu avec Next.js 16 + Turbopack
- **Jardin** : grille 12×6 avec placement par drag/click
- **Pépinière** : zone de semis 6×4
- **Serre** : vue avec tuiles protégées (+15% T°, -70% pluie)
- **6 plantes** : Tomate, Carotte, Fraise, Salade, Basilic, Piment
- **Météo réelle** via Open-Meteo + GPS du navigateur
- **Zustand store** avec persistance localStorage
- **Admin Panel** : toggle maladies, reset, reset plantes, vitesse
- **Game HUD** : stats, météo, conseils saisonniers
- **Système de saisons** avec conseils de plantation
- **Score + pièces** par plante vivante et par récolte
- **Frost check** : arrêt de la croissance si gel (pas de mort)
- **Style manga cel-shade** : palette beige/noir/vert/orange, `Space Mono` + `VT323`

---

## Résumé des semenciers

| Boutique | Année | Variétés | Prix |
|---|---|---|---|
| Vilmorin | 1814 | Cocktail, Anéas | 50-55🪙 |
| Clause | 1848 | Pro | variable |
| Kokopelli | 2000 | Cherokee Purple, Rose de Berne | 65-70🪙 |
| Biau Germe | 1981 | Marmande, Carotte Guérande | 45-60🪙 |
| Sainte Marthe | 1973 | Basilic Génois, Poivron Doux | 50-55🪙 |
