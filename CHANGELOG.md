# BotanIA - Changelog

## v0.22.0 - EventBus, Notifications, Catalogue, Marché Dynamique (2026-04-15)

### Couche 2 — EventBus & Notifications

- **EventBus typé** (`src/lib/event-bus.ts`) : 17 types d'événements pour communication inter-modules découplée
- **Onboarding 8 étapes** (`src/store/onboarding-store.ts`) : welcome → first-seed → first-plant → first-water → first-harvest → first-sell → discover-3 → quest-master
- **Notifications toast** (`src/store/notification-store.ts`) : toasts in-app avec sévérité (success/info/warning/error), auto-dismiss 4-8s, max 5 visibles
- **Célébrations animées** (`src/components/game/CelebrationOverlay.tsx`) : confetti sur achievements, quêtes, récoltes, bonus quotidien
- **Émissions EventBus** dans garden-store (plant:planted, plant:watered), shop-store (coins:spent, coins:earned), economy-store (dailybonus:claimed, quest:completed, market:sold)
- **Abonnements** dans page.tsx avec cleanup au démontage

### Couche 3 — Composants UI avancés

- **Catalogue des variétés** (`VarietyCatalog.tsx`) : recherche, filtres saison/catégorie, PlantStatCard + GrowthCurveChart par plante
- **Calendrier de plantation** (`PlantingCalendar.tsx`) : vue mensuelle INRAE avec périodes semis/récolte
- **Courbe sigmoïde GDD** (`GrowthCurveChart.tsx`) : progression réelle vs stades attendus
- **Stat-cards plante** (`PlantStatCard.tsx`) : température, eau, lumière, Kc, résistances, calendrier
- **Prévisions météo 7j** (`WeatherForecast.tsx`) : alertes gel (≤2°C), canicule (≥35°C), tempête (≥60 km/h)
- **Timeline photo** (`PhotoTimeline.tsx`) : journal photo horodaté avec GPS, identification IA
- **Marché dynamique** (`src/store/market-store.ts`) : prix saisonniers (primeur +40%, saison, après-saison -20%, hors saison -30%), offre/demande
- **Suivi onboarding UI** (`OnboardingTracker.tsx`) : barre de progression 8 étapes avec récompenses

### Couche 4 — Intégration navigation

- **3 nouveaux onglets** dans GameTabs : Catalogue (📖), Météo (🌦️), Photos (📸)
- **GrowthCurveChart** intégré dans l'onglet Croissance aux côtés de HologramEvolution
- **Marché dynamique** intégré dans HarvestTracker : vente avec prix saisonniers, indicateurs tendance, quantités ajustables
- **weather-service.ts** étendu : prévisions 7 jours (WeatherForecastDay avec tempMax, tempMin, précipitations, vent, UV, weatherCode)

### Technique

- Nouveaux stores : `onboarding-store.ts`, `notification-store.ts`, `market-store.ts`
- Nouveaux composants : 9 fichiers dans `src/components/game/`
- Modifiés : `page.tsx` (abonnements EventBus + CelebrationOverlay + NotificationContainer), `GameTabs.tsx` (3 onglets), `HarvestTracker.tsx` (section Marché), `Boutique.tsx` (OnboardingTracker)
- EventBus intégré dans : `garden-store.ts`, `shop-store.ts`, `economy-store.ts`

---

## v0.21.0 - Éditeur de Grille Professionnel (2026-04-15)

### 🏗️ Éditeur de Jardin — Refonte Complète

L'éditeur de grille (Vue Plan) passe d'un outil basique à un éditeur professionnel inspiré de GardenPlanner.net, VegPlotter et smallblueprinter.

#### Grille & Snap (Phase 1)
- **Lignes majeures/mineures** : double motif CSS — mineures tous les 25cm (rgba 0.05), majeures tous les 1m (rgba 0.14)
- **Snap-to-grid configurable** : OFF / 25cm / 50cm / 1m — les éléments s'alignent automatiquement sur la grille
- **3 modes d'affichage** : Grille complète / Majeures uniquement / Masquée
- **Coordonnées au survol** : badge X/Y en cm qui suit le curseur
- **Fond neutre crème** (#faf8f4) remplaçant le fond dégradé vert

#### Undo/Redo + Panneau Propriétés (Phase 2)
- **Système Undo/Redo** via `useUndoHistory.ts` — hook générique avec pile d'actions (max 50)
- **Raccourcis clavier** : Ctrl+Z (annuler), Ctrl+Shift+Z / Ctrl+Y (rétablir)
- **Panneau Propriétés** : sidebar droite animée affichant position X/Y, dimensions, type, capacité de l'élément sélectionné
- **Actions** : Déplacer, Supprimer, Dupliquer depuis le panneau

#### Guides d'Alignement Intelligents (Phase 3)
- **Smart alignment guides** : lignes bleues (#3b82f6) pendant le drag quand les bords/centres s'alignent
- **Seuil de détection** : 5px en display (quelques cm sur la grille)
- **Centres H/V + bords gauche/droite/haut/bas** vérifiés
- **Disparaissent au release**

#### Barre d'Outils Restructurée (Phase 4)
- **Barre en groupes** : Mode | Zones (5 outils) | Structures (6 outils) | Snap | Grille | Undo/Redo
- **Icônes lucide-react** remplaçant les emoji seuls (Square, Leaf, Waves, Wheat, Flower2, Home, TreePine, Fence, etc.)
- **Ghost preview** : aperçu translucide (opacité 0.4, border dashed) de l'élément au curseur quand l'outil est actif
- **Bouton Annuler** contextuel quand un outil est actif

#### Zoom & Grille Améliorés (Phase 5)
- **Zoom à la molette** centré sur le curseur (onWheel)
- **Fond uni crème** remplaçant le dégradé diagonal
- **Grille adaptative** : les lignes mineures se masquent automatiquement quand le zoom est faible

#### SeedRowPainter — Lissage (Phase 6)
- **Douglas-Peucker** : simplification automatique des traits dessinés (epsilon=2px souris, 3px tactile)
- **Undo par trait** : bouton "↩️ Annuler" pour retirer le dernier rang tracé
- **Export `SeedRow`** : type + callback `onRowsChange` pour synchroniser avec la Vue Plan

### 🎨 Nouveaux Assets
- **14 paquets de graines Le Biau Germe** : placeholder PNG 1664×928
  - Courgettes (Verte Milan Black Beauty, Verte d'Italie), Squash Striped Cushaw
  - Aubergine Longue Violette, Poivrons (Doux d'Espagne, Ariane, Chocolat)
  - Tomates (Raisin Vert, Cerisette Brin du Muguet, Saint-Pierre, Kumato, Evergreen)
  - Concombres (Le Généreux, Rollinson's Telegraph)

### 🐛 Corrections
- **Doublons HologramEvolution** : suppression de 4 entrées orphelines (eleagnus, eggplant, laurus, tomato) causant l'erreur TS1117
- **Type plant-integrator** : `missingImages`/`totalImages` renommés en `missing`/`total` pour correspondre à l'implémentation
- **Import AnimatePresence** : ajout dans GardenPlanView.tsx
- **Icône Grass** : remplacée par `Wheat` (non disponible dans la version lucide installée)
- **Référence t.diameter** : corrigée en `obj.diameter` dans le panneau propriétés

### 🔧 Technique
- Nouveau fichier : `src/hooks/useUndoHistory.ts` — hook undo/redo générique
- Modifié : `src/styles/garden.css` — fond crème, grille majeure/mineure, classes `.grid-hidden` / `.grid-minor-hidden`
- Modifié : `src/components/game/GardenPlanView.tsx` — snap, guides, ghost, zoom, coordonnées, panneau propriétés
- Modifié : `src/components/game/JardinPlacementControls.tsx` — barre d'outils complète avec icônes lucide
- Modifié : `src/components/game/Jardin.tsx` — intégration undo/redo + raccourcis clavier
- Modifié : `src/components/game/SeedRowPainter.tsx` — lissage Douglas-Peucker + undo par trait

---

## v0.20.0 - Rééquilibrage Économie & Paquets de Graines (2026-04-13)

### 🪙 Système Économique Complet (economy-store.ts)

Nouveau store Zustand persisté (`botania-economy`) ajoutant vente, quotidien et quêtes :

- **Inventaire de récoltes** : chaque récolte ajoute 1 unité vendable (`harvestInventory`)
- **Marché** : onglet "🌾 Marché" dans la Boutique pour vendre ses récoltes
- **Prix de vente** : Tomate 8, Carotte 6, Fraise 10, Salade 5, Basilic 7, Piment 9, Courgette 6, Concombre 5, Pomme 15, Poire 18, Cerise 20
- **Bonus quotidien** : 1 fois/jour, streak J1=5 → J2=6 → J3=7 → J4=8 → J5=9 → J6=10 → J7+=15 pièces
- **Quêtes journalières** : 3 quêtes aléatoires parmi 8 (arroser, planter, identifier, récolter, planter un arbre)
- **Popup quotidien** (`DailyBonusPopup.tsx`) au lancement si bonus non réclamé
- **Suivi quêtes** (`QuestTracker.tsx`) avec barres de progression et bouton réclamer

### 📦 Mécanique d'Ouverture des Paquets de Graines

Les variétés achetées sont maintenant des paquets fermés qu'il faut ouvrir avant de planter :

- **Achat** → paquet fermé dans `seedVarieties` (inventaire fermé)
- **Ouvrir** → animation déchirure + révélation → graines dans `seedCollection` (plantables)
- **Section "📦 Paquets à ouvrir"** dans Boutique (onglet Graines) et GrainCollection
- **Animation Framer Motion** : étapes déchirure → révélement avec overlay plein écran
- **Bouton "Ouvrir"** sur chaque paquet fermé

### 🐛 Corrections

- **Double récompense récolte** : `garden-store.ts` ajoutait des pièces ET `game-store.ts` aussi. Corrigé : récolte = +3 pièces base + 1 unité inventaire vendable (plus de double)
- **"Aucune graine disponible"** : les graines variétés (paquets fermés) apparaissaient comme plantables dans la pépinière. `availableSeeds` vérifie maintenant uniquement `seedCollection` (graines ouvertes)
- **Variétés verrouillées** : `unlockedVarieties` démarrait vide, les variétés avec `unlocked: true` dans le catalogue n'avaient pas de bouton achat. Auto-initialisation depuis le catalogue
- **Duplicate photinia** : `HologramEvolution.tsx` avait `photinia` défini deux fois (lignes 881 + 1308), la deuxième avec des données erronées (Cucurbitaceae, 60j). Doublon supprimé
- **Spring animation 3 keyframes** : Framer Motion ne supporte que 2 keyframes avec spring. Corrigé dans `DailyBonusPopup.tsx`

### 💰 Rééquilibrage des Prix

**Graines (SEED_CATALOG)** — divisé par ~2 :
| Graine | Ancien | Nouveau |
|---|---|---|
| Tomate | 50 | 25 |
| Carotte | 40 | 20 |
| Fraise | 60 | 35 |
| Salade | 30 | 15 |
| Basilic | 45 | 25 |
| Piment | 55 | 30 |

**Plantules** — divisé par ~1.5 :
| Plantule | Ancien | Nouveau |
|---|---|---|
| Tomate | 80 | 50 |
| Carotte | 65 | 40 |
| Fraise | 85 | 55 |
| Salade | 50 | 30 |
| Basilic | 70 | 45 |
| Piment | 75 | 50 |

**Équipement** — ajusté :
| Équipement | Ancien | Nouveau |
|---|---|---|
| Mini Serre | 150 | 120 |
| Chambre S | 250 | 200 |
| Chambre M | 400 | 350 |
| Chambre L | 650 | 550 |
| Serre Tile | 50 | 40 |
| Extension | 100 | 80 |
| Zone serre | 200 | 150 |

**Arbres fruitiers** — augmentés (gamme 150-200 → 200-300)

**Haies Leaderplant** — légère hausse (+10-20)

### 🏆 Achievements → Pièces

- `coinReward` ajouté aux définitions d'achievements (15-30 pièces)
- `unlockAchievement` appelle `addCoins(coinReward)` automatiquement
- Toast affiche le gain : `(+${coinReward} 🪙)`

### 🔧 Technique

- Nouveau store : `economy-store.ts` (persistance `botania-economy`)
- `shop-store.ts` : `openSeedPacket()`, auto-init `unlockedVarieties`, `buySeedVariety` ne sync plus `seedCollection`
- `game-store.ts` : facades `openSeedPacket`, `trackIdentify()`
- `garden-store.ts` : tracking économie (water, plant, harvest, tree)
- `achievement-store.ts` : `coinReward` + `addCoins()` au déblocage
- `catalog.ts` : prix recalibrés pour toutes les catégories
- Nouveaux composants : `MarcheTab.tsx`, `DailyBonusPopup.tsx`, `QuestTracker.tsx`
- Modifiés : `GrainesTab.tsx` (ouverture paquets + boutons achat), `GrainCollection.tsx` (section paquets), `Pepiniere.tsx` (filtre graines ouvertes), `Boutique.tsx` (onglet marché + quêtes), `GameTabs.tsx` (popup quotidien)

---

## v0.19.1 - Sprite Editor & Remote Access (2026-04-13)

### 🖼️ Sprite Editor Dashboard

- **Prompt IA complet par stade** — chaque stage affiche un macro/prompt copiable anime par l'IA (manga cel-shaded, kawaii, fond beige)
- **Specs banner manga/cel-shaded** dans `openSpriteModal()` (ligne 648+)
- **Bouton "Parcourir"** pour selectionner fichier PNG directement dans le navigateur
- **Upload FormData** — le fichier est renomme automatiquement par le backend
- **copyPrompt()** — copie le prompt dans le presse-papier

### Stage names constants (dashboard.html lignes 358-383)
- VEG: Graine / Lee / Plantule / Croissance / Floraison / Recolte
- TREE: Scion / Jeune arbre / Arbre moyen / Arbre etabli / Arbre mature
- PEPINIERE: Monticule / Petite plantule / Plantule 2f / Plantule 4f / Plantule 5f / Floraison

### Infrastructure Scripts (ai-microservice/)
- `1-Qdrant.ps1` — Lance Qdrant
- `2-Microservice.ps1` — Lance microservice + charge .env
- `3-Frontend.ps1` — Lance Next.js port 3000
- `4-TailscaleFunnel.ps1` — Active tailscale funnel 3000

### Remote Access (Tailscale)
- Proxy `FormData` pour upload sprite dans `src/app/api/scan/plants/register/route.ts`
- `.env` microservice configure avec `BOTANIA_ROOT`, `ALLOWED_ORIGINS`

## v0.19.0 - Agent PlantCard & Dashboard Fixes (2026-04-12)

### 🐛 Corrections

- **`generatePlantCardCode`** : les PlantCards avec traits d'union (ex: `baco-noir`) étaient générées sans quotes — corrigé pour utiliser `'baco-noir': {` partout
- **`validate-plantcard/route.ts`** : ajout d'une vérification post-écriture qui relit le fichier pour confirmer que la PlantCard a bien été insérée (protège contre HMR Next.js invalidant le cache)
- **Patterns de vérification** : ajout de `id: 'nom-plante'` comme fallback pour détecter les PlantCards insérées

### 🤖 Dashboard IA (`dashboard.html`)

- **Cooldown anti-HMR** : variable `writeCooldown` bloque l'ouverture d'un modal pendant 3s après une écriture
- **Alert cooldown** : si clic pendant le cooldown → alerte "attends 3 secondes"
- **Reload auto** : après écriture réussie → `location.reload()`强制Next.js HMR à recharger le fichier propre → permet d'enchaîner les PlantCards sans recharger manuellement
- **Message "Patiente 3s — reload imminent"** pendant le countdown

### 🔧 Outils Agent (`src/lib/agent/`)

- `plant-integrator.ts` : fix format PlantCard (quotes pour noms avec tiret)
- `validate-plantcard/route.ts` : write verification + improved error messages
- `generate-plantcard/route.ts` : alreadyExists check + backup creation

### 📝 Note HMR Next.js

Next.js en dev mode (HMR) met en cache le contenu de `HologramEvolution.tsx` entre les requêtes API. L'écriture sur disque n'invalide pas immédiatement le cache — d'où le reload auto obligatoire après chaque PlantCard.

---

## v0.18.0 - Refactoring Store & Corrections (2026-04-11)

### 🏗️ Refactoring

- **Découpage du store monolithique** : `game-store.ts` (4 374 lignes) → facade de 1 290 lignes + 5 stores modulaires avec persistance Zustand
  - `shop-store.ts` (224 lignes) — Économie, graines, plantules, scores
  - `nursery-store.ts` (513 lignes) — Pépinière, mini-serres, chambres de culture
  - `garden-store.ts` (559 lignes) — Plantes jardin, zones serre, objets, cuves
  - `simulation-store.ts` (324 lignes) — Cycle jour/météo/tick simulation
  - `catalog.ts` (1 700 lignes) — Données statiques (catalogues graines, variétés, chambres)
  - `garden-types.ts` (112 lignes) — Types et constantes partagés (brise le cycle circulaire)
- **`game-store.ts`** agit maintenant comme facade : conserve l'interface `GameState`, délègue toutes les actions aux sous-stores
- **Persistance Zustand `persist`** remplace ~30 appels manuels `localStorage` dans chaque sous-store
- **Clés de persistance** : `botania-shop`, `botania-nursery`, `botania-garden`, `botania-simulation`

### 🐛 Corrections

- **Bug date bloquée au 1er janvier** : `GardenSaveManager.tsx` utilisait `day: 1` au lieu de `getTodayDayOfYear()`, et `loadGameState()` ne recalculait pas le jour avec la logique de rattrapage
- **Erreur runtime `DEFAULT_GARDEN_WIDTH_CM`** : dépendance circulaire entre `game-store` et `garden-store` résolue via `garden-types.ts`
- **`noImplicitAny: true`** activé dans `tsconfig.json` (hérité de `strict: true`), 2 erreurs de type corrigées

### 🧹 Nettoyage

- 19 fichiers `game-store.ts.backup-*` supprimés
- Bloc mort `ZONE_MODIFIERS["serre_tile"]` retiré de `game-store.ts`
- Import circulaire `isFrostRisk` retiré de `game-store.ts` (déjà dans `simulation-store`)

### 📝 Configuration

- Version uniformisée à `0.17.0` dans `package.json`, `save-manager.ts`, `README.md`
- `tsconfig.json` : `noImplicitAny: false` retiré (hérité de `strict: true`)
- IA séparée : pas de réactivation Ollama/Qdrant dans BotanIA (application indépendante)

## v0.17.0 - Super IA Locale (Ollama + Qdrant RAG) (2026-04-09)

### ✨ Nouveau

#### 🤖 Agent IA Unifié avec RAG (Lia)

Infrastructure complète d'agent IA proactif avec base vectorielle locale :

**Nouveaux fichiers (`src/lib/agent/`) :**
- `qdrant.ts` — Client REST Qdrant (base vectorielle locale, pas de SDK)
- `ollama.ts` — Client Ollama chat + embeddings (qwen2.5:7b + nomic-embed-text)
- `persona.ts` — System prompt Lia + helpers de contexte jeu
- `rag-engine.ts` — Moteur RAG complet : embed question → search Qdrant → generate Ollama
- `code-scanner.ts` — Parse automatiquement les .tsx/.ts en vecteurs (comprend le code)
- `proactive-agent.ts` — Boucle proactive : scan état jeu → notifications (eau, plantes, calendrier)
- `fallback-chain.ts` — Fallback transparent vers Groq si Ollama/Qdrant indisponible
- `action-executor.ts` — Exécute notifications + vibrations mobile
- `memory-manager.ts` — Mémoire utilisateur → Qdrant (observations, décisions, flashcards)
- `markdown-ingester.ts` — Parse et indexe automatiquement les .md du projet

**Nouveaux fichiers (`src/components/agent/`) :**
- `AgentInitializer.tsx` — Initialisation côté client (détecte Ollama + Qdrant au démarrage)
- `LiaStatusIndicator.tsx` — Indicateur 🟢/🟡/🔴 dans le header
- `LiaInterface.tsx` — Chat complet avec Lia (avec questions rapides)
- `LiaPanel.tsx` — Panel suggestions proactives
- `LiaNotifications.tsx` — Centre de notifications

**Nouveaux fichiers (`src/app/api/agent/`) :**
- `status/route.ts` — GET /api/agent/status — Estat Ollama + Qdrant
- `scan/route.ts` — POST /api/agent/scan — Scan complet du code BotanIA
- `rag/route.ts` — POST /api/agent/rag — RAG query
- `index-file/route.ts` — POST /api/agent/index-file — Indexe 1 fichier

**Nouveaux fichiers :**
- `src/store/agent-store.ts` — State Zustand pour l'agent (notifications, suggestions, messages)
- `src/lib/hooks/useAgent.ts` — Hook React pour utiliser Lia
- `src/app/api/agent/` (4 routes API)

#### 🎯 Fonctionnement

- **Mode Super IA Locale** : bouton "🔮 Activer Super IA Locale" dans le header
- **Mode passif** : si Ollama ou Qdrant éteint, retour transparent à Groq classique (zéro changement pour l'utilisateur)
- **Indexation auto** : au démarrage, scanne automatiquement HologramEvolution.tsx, Jardin.tsx, etc. → stocke dans Qdrant
- **Proactivité** : Lia scanne l'état du jeu toutes les 60s et notifie (cuve basse, plantes assoiffées, gel, récoltes prêtes)
- **Compréhension du code** : Lia peut lire et expliquer HologramEvolution.tsx et les composants
- **Mémoire persistante** : observations et décisions sont stockées dans Qdrant (utilisable ailleurs)
- **Mobile ready** : vibration API + notifications push

#### 📂 Collections Qdrant

| Collection | Contenu |
|---|---|
| `botania_components` | Code parsé des .tsx/.ts (fonctions, interfaces, exports, onglets liés) |
| `botania_data` | Données graines/arbres/encyclopedia |
| `botania_docs` | Tous les .md du projet |
| `botania_memory` | Observations, décisions, flashcards utilisateur |
| `botania_game_state` | Snapshots périodiques de l'état du jeu |

#### 🔧 Conditions d'activation

- Ollama installé + `ollama serve` en background
- Qdrant Desktop ou serveur sur port 6333
- Optionnel : `ollama pull nomic-embed-text` (pour les embeddings)
- 63Go RAM suffisants pour qwen2.5:7b + Qdrant + BotanIA

#### 📝 Intégration page.tsx

- Bouton "🔮 Activer Super IA Locale" ajouté dans le header (à côté de Admin)
- Panel flottant Lia ajouté en bas à droite (w-80, collapsible)
- `AgentInitializer` intégré dans layout.tsx

---

## v0.16.0 - Lia Phénologie + iNaturalist + Crowdsourcing (2026-04-09)

### ✨ Nouveau

#### 🌸 Système d'événements phénologiques structurés (garden-memory.ts)
- Nouveau type `PhenologicalEvent` : semis, levée, repiquage, récolte, gel, ravageur...
- Section `## Phénologie` dans les fichiers MD de mémoire
- Fonctions : `addPhenologicalEvent()`, `getPlantPhenology()`, `getSeasonCount()`, `getAverageEventDate()`
- Parsing/formatage MD mis à jour

#### 🤖 Lia répond sur la phénologie
- `getPhenologicalSummary()` : "Tes tomates fleurissent en moyenne autour du 15 mai"
- `getSeasonContext()` : "Tu en es à ta 3ème saison de tomates"
- `getPlantEventSummary()` : date moyenne pour chaque type d'événement
- `genResponse()` enrichi : reconnaît questions phénologiques (fleur, semis, gel...)

#### 📅 UI événement phénologique dans Lia
- Bouton "📅 Événement" dans le panneau Mémoire
- Formulaire : type d'événement + date + notes + plante associée
- Bouton "Activer iNaturalist ?" si pas encore fait

#### 🦉 Intégration iNaturalist
- **`src/lib/inaturalist.ts`** : client API complet
  - `TAXON_MAP` : mapping BotanIA → taxon ID iNaturalist (40+ plantes)
  - `submitObservation()` : POST vers iNaturalist
  - `buildPhenologyDescription()`
- **`src/app/api/inaturalist/route.ts`** : proxy API key (ne l'expose pas au client)
- **`INatConsentPanel.tsx`** : modale de consentement + input clé API
- Les événements phénologiques peuvent être soumis automatiquement à iNaturalist

#### 🌐 Crowdsourcing anonyme local
- **`src/lib/collective-data.ts`** : agrégation régionale anonyme
  - `loadCollectiveStats()`, `contributeAnonymizedStats()`
  - `compareToRegional()` : comparaison avec la moyenne de la région
  - `regionFromPostcode()` : détermination de la région depuis code postal
- **`src/app/api/collective/route.ts`** : API d'agrégation (moyennes pondérées)
- **`Settings.tsx`** : panneau paramètres avec champ "Ma région" (code postal)

### 🔧 Corrections Techniques
- `LiaAssistant.tsx` : refonte complète — générique simplifié, imports enrichis, phénologie intégrée
- Fix duplicate `handleSend` block dans LiaAssistant.tsx
- Fix missing `isOpen` state dans LiaAssistant.tsx
- `garden-memory.ts` : parsePlantMemory gèrent maintenant le nouveau champ `events`

---

## v0.15.0 - Mémoire du Jardin + Phénologie + Dictée Terrain (2026-04-09)

### ✨ Nouveau

#### 📖 Système de Mémoire Agronomique Multi-Saisons
- **`src/lib/garden-memory.ts`** — système de mémoire persistant
  - Stockage en fichiers `.md` dans `data/garden-memory/`
  - Enregistre : récoltes (jours maturité, kg/m²), maladies, observations
  - Calcule les moyennes personnelles par plante (ex: "tes tomates maturité en 87j")
  - Avertissement si maladie récurrente sur le terrain
- **3 routes API** :
  - `POST /api/save-garden-memory` — sauvegarder une mémoire
  - `GET /api/load-garden-memory?plantId=X` — charger une plante
  - `GET /api/load-all-garden-memories` — charger toutes les mémoires

#### 🎙️ Mode Dictée Terrain (DiseaseDetector)
- **Bouton** `🎙️ Mode Dictée Terrain` dans l'onglet Maladies
- **Click-to-talk** : microphone avec reconnaissance vocale française
- **Transcription en temps réel** via Web Speech API
- **Journal d'observations** horodaté avec catégories (Croissance, Problème, Traitement, Météo, Général)
- **Saisie manuelle** aussi possible

#### 🤖 Lia Intégrée à la Mémoire
- **Bouton 📖** dans l'en-tête de Lia → panneau Mémoire
- **Suggestions personnalisées** basées sur l'historique (si ≥2 saisons)
- **Alertes automatiques** si maladie récurrente détectée
- **Enregistrement d'observations** directement depuis Lia

#### 🌿 15 Nouvelles Features Documentées (non encore implémentées)
- Carte ruissellement terrain avec modèle DEM simplifié
- Biologie du sol vivante (vers, mycorhizes, bactéries N)
- Analyse sol dynamique avec pH et disponibilité minérale INRAE
- Évaporation différentielle par micro-zones (mur sud +40%)
- Gel différentiel par micro-topographie
- Réseau mycorhizien inter-plantes (graphe de connexions)
- Succession végétale automatique (Grime 1977)
- Gestion du biochar (séquestration CO₂)
- Corridors de biodiversité (+60% biodiversité)
- Agroforesterie 7 strates fonctionnelles
- Modèle vent local avec rugosité aérodynamique
- Plantes médicinales et huiles essentielles (lavande, valériane, calendula)
- Cycle ravageurs-auxiliaires (Lotka-Volterra)
- Biodiversité animale (hérissons, crapauds, musaraignes)
- Gestion limaces par nématodes (Phasmarhabditis hermaphrodita)
- Fermentation lacto (EM Higa 1993, bokashi, purin d'ortie)
- Réseau phénologique crowdsourced (PhenoClim, iNaturalist API)

### 🔧 Corrections Techniques
- `LiaAssistant.tsx` : ajout `isOpen` manquant dans les states
- `LiaAssistant.tsx` : suppression bloc `handleSend` dupliqué
- `LiaAssistant.tsx` : suppression import `addHarvestRecord` non utilisé
- `DiseaseDetector.tsx` : déplacement `use client` en haut du fichier

---

## v0.14.0 - Achats Locaux et Pépinières (2026-04-08)

### ✨ Nouveau

#### 🏪 Onglet "Achat local ou pépinières" — Circuit court
- **Nouvel onglet** dans la Boutique : "🏪 Local" (Pépinières)
- **3 shops locaux** :
  - 🏡 **Pépinière Locale** — Plants élevés à la ferme, arbres et plantules de saison
  - 🧺 **Marché Producteurs** — Ventes directes de maraîchers locaux
  - 🌾 **Jardin Partagé** — Échange entre jardiniers, plants cultivés localement
- **18 plantules et arbres locaux** :
  - Tomates Coeur de Boeuf, Ananas (Pépinière Locale)
  - Courgette Ronde de Nice, Potimarron (Pépinière Locale)
  - Poivron Corne de Boeuf (Pépinière Locale)
  - Aubergine de Barbentane (Pépinière Locale)
  - Laitue Feuille de Chêne, Romaine (Marché Producteurs)
  - Carotte de Guérande (Marché Producteurs)
  - Fraise Gariguette, Mara des Bois (Pépinière Locale / Marché)
  - Basilic Génovéis (Marché Producteurs)
  - Piments d'Espelette (Marché Producteurs)
  - Arbres : Pommier Reinette, Poirier Comice, Cerisier Montmorency
  - Petits fruits : Groseillier Rouge, Mûrier Sans Epines
  - Échanges gratuits : Semis Tomates, Plants Salades (Jardin Partagé)
- **Prix gratuits (0 🪙)** pour les articles d'échange du Jardin Partagé
- **Circuit court** = plants adaptés à votre région

#### 🔧 Corrections Techniques
- `game-store.ts` : ajout de 3 nouveaux shops (pepiniere-locale, marche-producteurs, jardin-partage)
- `game-store.ts` : ajout de `PLANTULES_LOCALES` avec 20+ varieties locales
- `Boutique.tsx` : ajout onglet `achats-locaux` + importation `PLANTULES_LOCALES`

---

## v0.13.1 - Système de Sauvegarde Récréé (2026-04-08)

### ✨ Nouveau

#### 📔 GardenJournalLunar — Fusion Journal + Lune
- **Composant unifié** : Onglet Journal fusionné avec Calendrier Lunaire
- **Nouveau nom d'onglet** : "📔🌙 Journal" (supprime l'onglet Lune séparé)
- **Boîte lune compacte** (colonne gauche) :
  - Phase lune actuelle avec emoji
  - Illumination en barres visuelles
  - Signe zodiacal et élément
  - Indicateurs semis/récolte/taille favorables
  - Conseil du jour
  - Prochaines pleines/nouvelles lunes
- **Grand calendrier mensuel** (colonne droite) :
  - Vue mensuelle complète avec grille 7 colonnes
  - Chaque jour affiche emoji lune + indicateurs (📝📷)
  - Jours urgents surlignés
  - Navigation mois précédent/suivant
- **Tâches journalières enrichies** :
  - Données de conseils réels (INRAE, calendriers maraîchers)
  - 12 mois de tâches détaillées (semis, récolte, taille, travail)
  - Catégories avec couleurs (semis, recolte, taille, travail, Entretien)
  - Indicateurs d'urgence
- **Historique plantations 2024 vs 2025** :
  - Comparaison des dates de plantation entre années
  - Indication mini-serre vs jardin
- **Intégration photos** : Photos du jour sélectionnable

#### 🔧 Corrections Techniques
- `LunarCalendar.tsx` : refonte complète avec 3 onglets
- `SeedRowPainter.tsx` : export de l'interface SeedRow + prop onRowsChange
- `HologramEvolution.tsx` : correction double accolade fermante (ligne 758)
- `ai-engine.ts` : ajout fertilizerLevel à PlantState + "success" à AlertData
- `game-store.ts` : ajout fertilizerLevel dans initialPlantState

#### 🗑️ Supprimé (en attente réintégration)
- `GardenSaveManager.tsx` : système de sauvegarde JSON (à réintégrer)
- `useSlotAutoSave.ts` : hook autosave par slot (à réintégrer)
- `save-manager.ts` : gestionnaire de sauvegardes IndexedDB (à réintégrer)

---

## v0.13.1 - Système de Sauvegarde Récréé (2026-04-08)

### ✨ Nouveau

#### 💾 Système de Sauvegarde JSON (IndexedDB)
- **save-manager.ts** : Gestionnaire de sauvegardes via IndexedDB
  - `saveToSlot()` / `loadFromSlot()` / `deleteSlot()`
  - Export/Import JSON
  - Auto-save
- **GardenSaveManager.tsx** : Interface de gestion des sauvegardes
  - Créer / Charger / Renommer / Supprimer
  - Export JSON
  - Import JSON
  - Auto-save toggle
- **useSlotAutoSave.ts** : Hook d'auto-sauvegarde (30s)

---

## v0.12.2 - Améliorations Marquage Photos (2026-04-07)

### ✨ Nouveau

#### 📸 Marquage Photos de Plants - Fonctionnalités avancées
- **Aide détaillée dépliable** : mode d'emploi complet en 5 étapes avec bouton ❓
- **Compteur de plants par rang** : possibilité d'indiquer le nombre exact de plants sous chaque trait (ex: "Tomates × 12")
- **Marqueur d'emplacements vides ❌** : remplace le rouge pour marquer les cases vides dans les mini serres
  - Permet de compter automatiquement les emplacements occupés/vides (ex: 23/24 si 1 croix)
  - Rendu visuel spécial avec croix rouge plutôt qu'un trait
- **Synchronisation Mini Serres** : nouveau bouton "🌱 Envoyer vers les Mini Serres"
  - Vérification de l'inventaire : alerte si aucune mini serre disponible
  - Comptage intelligent des emplacements (total - croix = occupés)
- **Statistiques enrichies** : affichage du nombre total de plants, rangs tracés, et emplacements vides

### 🔄 Modifié

#### Interface utilisateur
- **Titre de l'onglet** : "📸 Rangs" → "📸 Marquage" (plus explicite)
- **Titres des boutons de sync** :
  - "🗺️ Sync grille jardin" → "🗺️ Envoyer vers la grille Jardin"
  - Nouveau : "🌱 Envoyer vers les Mini Serres"
- **Modale de création de rang** :
  - Ajout d'un champ "Nombre de plants sous ce trait" (type number, min=1)
  - Message différent pour les marqueurs vides (❌)
- **Palette de couleurs** : dernier bouton = ❌ (emplacement vide) au lieu de Rouge

### 🔧 Corrections Techniques

- `SeedRowPainter.tsx` : ajout de la propriété `plantCount` dans l'interface `SeedRow`
- `SeedRowPainter.tsx` : fonction `drawAllRows` gère le rendu spécial des croix (❌)
- `SeedRowPainter.tsx` : fonction `syncToMiniSerres` avec vérification inventaire `miniSerres`
- `Jardin.tsx` : changement du label de l'onglet

---

## v0.12.1 - Carte de Croissance Botanique + Refactorisation (2026-04-07)

### ✨ Nouveau

#### 🌱 Carte de Croissance HologramEvolution.tsx (entièrement refaite)
- **Sélecteur de plantes enrichi** : miniature + nom + badge urgence eau
- **Carte principale animée** :
  - Anneau pulsé coloré selon le stade de croissance
  - Barre de progression GDD avec pourcentage temps réel
  - Jours depuis plantation + estimation prochain stade
- **4 cartes agronomiques temps réel** :
  - 💧 **Eau** — besoin L/j réel (ET0 FAO), économies paillage, niveau actuel, alerte urgence
  - 🌡️ **GDD** — gain journalier, T_base, T_plafond, température ambiante, humidité, vent, pluie
  - 🌍 **Sol** — température 10cm, favorable/trop froid, conseil semis personnalisé
  - 🤝 **Voisinage** — score compagnonnage (INRAE), associations bonnes/mauvaises
- **Section phytosanitaire** — risques mildiou + oïdium avec % et alertes
- **Timeline 6 stades** — durée en jours par stade, progression GDD actuelle
- **Footer botanique** — Tbase, Tcap, Kc FAO, jours récolte, besoins lumière

#### 🔧 Corrections Techniques
- **`next.config.ts`** : `typescript.ignoreBuildErrors: false` — TypeScript vérifié à nouveau
- **`next.config.ts`** : `reactStrictMode: true` — React Strict Mode réactivé
- **`src/app/api/api/route.ts`** : supprimé (endpoint debug oublié)

### 🔄 Modifié

- `README.md` : Refonte complète du positionnement — de "simulateur" à **application de culture botanique scientifique**
  - Vocabulaire "jeu", "game", "simulateur" → "application", "culture botanique"
  - Ajout section "Architecture des Données Botaniques" avec sources (FAO, INRAE)
  - Mise à jour du guide d'utilisation

---

## v0.12.0 - Photo Jardin · GPS · Identificateur IA (2026-04-06)

### ✨ Nouveau

#### 📸 Marquage des semences (SeedRowPainter)
- Nouveau mode **"📸 Rangs"** dans l'onglet Jardin
- Import photo ou capture caméra directe (rear camera prioritaire)
- **Palette 8 couleurs** pour tracer des rangs sur la photo (Orange, Rose, Noir, Jaune, Vert, Bleu, Blanc, Rouge)
- Dessin tactile au doigt ou à la souris, effet glow coloré
- **Nommage de chaque rang** (ex: "Carottes", "Tomates") via modale
- Synchronisation en temps réel avec la **Vue Plan** du jardin
- Overlay des rangs en pointillés colorés sur la grille + légende
- Badge compteur sur le bouton "📸 Rangs" (rangs tracés + photos envoyées)

#### 📍 Extraction GPS (gps-extractor.ts)
- Lecture automatique des métadonnées **EXIF GPS** des photos importées
- Parser EXIF natif (pas de dépendance externe) — lit directement les bytes JPEG
- Fallback sur la **géolocalisation du device** (GPS navigateur) si pas d'EXIF
- Badge GPS coloré : 🟢 EXIF trouvé / 🟡 En recherche / 🔴 Absent
- Affichage coordonnées lat/lon + lien direct Google Maps

#### 🔍 Onglet Identificateur de Plantes (PlantIdentifier)
- Nouvel onglet **"🔍 Identificateur"** dans la navigation principale
- **4 moteurs d'identification** au choix :
  - ⚡ **Groq** (llama-3.2-11b-vision) — gratuit, cloud, rapide
  - 🏠 **Ollama Local** (llama3.2 / llava si dispo) — 100% local, privé, gratuit
  - 🌿 **Plant.id** — API spécialisée plantes, 100 identifications/jour gratuit
  - 🤖 **Claude Vision** — précis, nécessite clé ANTHROPIC_API_KEY
- Grille de toutes les photos (Jardin + Identificateur)
- **Badges par photo** : source (🌱 Jardin / 🔍 ID), GPS 📍, rangs tracés, ✓ Identifiée
- Modal détail : photo plein écran, GPS cliquable, rangs associés, résultat IA
- Barre de confiance animée + nom de la plante + description + conseils de culture
- Bouton "Ré-analyser" pour changer de moteur IA
- Détection auto du meilleur moteur (Groq si clé dispo, sinon Ollama)

#### 🗄️ Photo Store partagé (photo-store.ts)
- Store Zustand persisté partagé entre Jardin et Identificateur
- Chaque photo stocke : dataUrl, GPS, rangs tracés, résultat d'identification, source
- Auto-strip des images trop lourdes (>500ko) pour localStorage
- Limite 50 photos maximum

#### 🔌 API Route identify-plant
- `/api/identify-plant` — POST avec moteur sélectionnable
- Sélection auto du moteur selon variables d'environnement disponibles
- Parser JSON sécurisé (strip backticks, extraction regex)

### 🔧 Modifié
- `Jardin.tsx` — ajout onglet "📸 Rangs", passage `seedRows` à GardenPlanView, stats rangs
- `GardenPlanView.tsx` — canvas overlay pour rangs colorés, légende flottante, prop `seedRows`
- `page.tsx` — import PlantIdentifier, onglet Identificateur avec icône ScanSearch

---

## v0.11.0 - Arbres Fruitiers + Refonte UI Jardin (2026-04-06)

### Nouveau

#### Arbres Fruitiers
- **Système de Pots** : Arbres vendus en pot (~20cm), pas en sachets de graines
- **5 Stades de croissance** : Mini scion -> Adulte sur plusieurs années
- **Nouvelles boutiques** : Guignard, INRAE, Arbres Tissot, Pépinières Bordas, Fruitiers Forest
- **Réserve** : Citronnier et Oranger en attente d'implémentation

#### Images Arbres
- Pots Guignard : Pommier Golden, Pommier Gala, Poirier Williams
- Pots Arbres Tissot : Reine des Reinettes, Belle Fleur, Conférence, Louise Bonne
- Pots INRAE : Cerisier Bing
- Stages croissance : 15 (Guignard) + 20 (Arbres Tissot) + 5 (INRAE)

#### Interface
- **Onglet Arbres** : Séparé de Graines, avec filtres par boutique
- **Vue Jardin** : Toggle entre vue Plan et vue Cartes manga
- **WeatherEffects** : Effets visuels (soleil, nuages, pluie)
- **JardinPlacementControls** : Mode guide/libre

#### Données Botaniques (encyclopedia.ts)
- Arbres fruitiers : apple, pear, cherry, lemon, orange
- Arbres forestiers : walnut, oak, maple, birch, pine, magnolia

### Documentation
- **BOTANIA-ASSETS-DOCUMENTATION.md** : Documentation unifiée assets
- README mis à jour avec nouveaux arbres et boutiques

---

## v0.10.0 - Encyclopédie Hardcore + Cleanup (2025-07-16)

### Nouveau
- **Encyclopédie BotanIA** (src/data/encyclopedia.ts)
- Données biologiques réelles pour 6 plantes
- Catalogue matériel : LEDs, tentes Gorilla, serres pro
- Fix hydration HUD
- Validation semis canPlaceRowInGarden

---

## v0.9.4 - Boutique multi-semenciers + Mini Serres
- Achat depuis 5 semenciers, variétés exclusives
- Mini Serres (24 slots), panneau admin variétés custom
