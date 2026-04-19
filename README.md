# BotanIA — Application de Jardinage Botanique Réaliste

> Application de jardinage botanique **scientifique** connecté à la météo réelle, aux données INRAE/GNIS, avec identification de plantes par IA et suivi GPS de votre jardin réel.

![Version](https://img.shields.io/badge/version-2.7.0-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![Zustand](https://img.shields.io/badge/State-Zustand-orange)
![Tailwind](https://img.shields.io/badge/UI-Tailwind-06b6d4)
![IA](https://img.shields.io/badge/IA-Groq%20%7C%20Ollama%20%7C%20Claude-purple)

---

## Concept

BotanIA est une **application de culture botanique** qui reproduit fidèlement le cycle de vie des plantes selon des données agronomiques réelles, connectée à votre **jardin réel** via la photo, le GPS et l'IA.

Les données de croissance (GDD, besoins en eau, compagnonnage, risques sanitaires) sont basées sur des sources botaniques vérifiées : INRAE, FAO, filières maraîchage françaises.

### Philosophie
- **Dates réelles** : saisons, gelées, calendrier lunaire
- **Météo réelle** : Open-Meteo + GPS, vos conditions locales affectent les cultures
- **Biologie vérifiée** : données INRAE, GNIS, temp min/opt/max, espacements, jours de germination
- **Jardin réel** : photographiez, tracez vos rangs, identifiez vos plantes par IA
- **IA locale ET cloud** : Groq, Ollama, Plant.id, Claude Vision + **Lia agent RAG (qwen2.5:7b + Qdrant)**

---

## Fonctionnalités principales

### 🌱 Cultures & Arboriculture
| Feature | Détail |
|---|---|
| 6 plantes potagères | Tomate, Carotte, Laitue, Fraisier, Basilic, Piment |
| Arbres fruitiers | Pommier, Poirier, Cerisier, Prunier, Abricotier, Figuier, Pêcher, Coing |
| Arbres forestiers | Chêne, Pin, Érable, Bouleau, Magnolia, Noyer |
| 5-6 stades de croissance | Graine → Levée → Plantule → Croissance → Floraison → Récolte |
| Météo temps réel | Open-Meteo, GPS auto-détecté |
| Données agronomiques | GDD (Growing Degree Days), ET0 (FAO), Kc (coefficient cultural) |

### 📸 Jardin Réel (v0.12.0)
| Feature | Détail |
|---|---|
| Marquage des rangs | Photo ou caméra + dessin au doigt |
| Palette 8 couleurs | Orange, Rose, Noir, Jaune, Vert, Bleu, Blanc, Rouge |
| GPS automatique | Lecture EXIF de la photo, sinon GPS du device |
| Sync grille jardin | Les rangs colorés s'affichent dans la Vue Plan |
| Nommage des rangs | "Carottes", "Tomates"... avec modale |

### 🏗️ Éditeur de Jardin Pro (v0.21.0)
| Feature | Détail |
|---|---|
| Grille majeure/mineure | Lignes 25cm (fine) + 1m (épaisse), 3 modes d'affichage |
| Snap-to-grid | Configurable : OFF / 25cm / 50cm / 1m |
| Coordonnées au survol | Badge X/Y en cm qui suit le curseur |
| Undo/Redo | Ctrl+Z / Ctrl+Shift+Z, pile de 50 actions |
| Panneau Propriétés | Position X/Y éditable, dimensions, type, actions |
| Guides d'alignement | Lignes bleues auto pendant le drag (centres + bords) |
| Ghost preview | Aperçu translucide de l'élément au curseur |
| Zoom molette | Zoom fluide centré sur le curseur |
| Barre d'outils complète | Zones (5) + Structures (6) + Snap + Grille + Undo |
| Lissage Douglas-Peucker | Simplification auto des traits SeedRowPainter |
| Undo par trait | Annuler le dernier rang tracé |

### 🔍 Identificateur de Plantes (v0.12.0)
| Moteur | Type | Coût |
|---|---|---|
| ⚡ Groq llama-3.2-vision | Cloud vision | 🆓 Gratuit |
| 🏠 Ollama local (llava) | Local, privé | 🆓 Gratuit |
| 🌿 Plant.id API | Spécialisé plantes | 🆓 100/jour |
| 🤖 Claude Vision | Précis | 💳 Clé API |

### 🌿 Lia — Agent IA Local avec RAG (v0.17.0)
| Composant | Détail |
|---|---|
| **Qdrant** | Base vectorielle locale (port 6333) — 5 collections : components, data, docs, memory, game_state |
| **Ollama qwen2.5:7b** | Cerveau raisonné (32K contexte, excellent français) |
| **RAG** | Indexation auto des .tsx/.md → réponses contextualisées sur TON jardin |
| **Proactif** | Notifications auto : cuve basse, plantes assoiffées, gel, récoltes |
| **Compréhension code** | Lia peut lire et expliquer HologramEvolution.tsx |
| **Mode passif** | Si Ollama/Qdrant éteint → retour transparent Groq classique |

**Activation :** bouton "🔮 Activer Super IA Locale" dans le header → 🟢 quand actif

### 🏪 Boutiques
| Boutique | Type |
|---|---|
| 🌱 Vilmorin, 🌺 Clause | Semenciers historiques |
| 🌿 Kokopelli, 🌾 Biau Germe, 🏡 Ste Marthe | Bio & paysannes |
| 🌳 Guignard, 🔬 INRAE, 🌲 Bordas | Arbres fruitiers |
| 🌴 Arbres Tissot, 🍎 Fruitiers Forest | Vergers |
| 🌾 Marché | Vendre ses récoltes |

### 🪙 Économie (v0.20.0)
| Feature | Détail |
|---|---|
| Inventaire de récoltes | Chaque récolte = 1 unité vendable au marché |
| Marché | Onglet Boutique pour vendre ses récoltes (prix 5-20 pièces/unité) |
| Marché dynamique | Prix saisonniers : primeur +40%, saison normal, après-saison -20%, hors saison -30% |
| Bonus quotidien | Streak J1=5 → J7+=15 pièces, 1 fois/jour |
| Quêtes journalières | 3 quêtes/jour (arroser, planter, identifier, récolter, arbres) |
| Paquets de graines | Achat → paquet fermé → animation d'ouverture → graines plantables |
| Achievements → pièces | Déblocage achievement = 15-30 pièces bonus |

### 📖 Catalogue & Outils (v0.22.0)
| Feature | Détail |
|---|---|
| Catalogue variétés | Recherche, filtres saison/catégorie, PlantStatCard + GrowthCurveChart |
| Calendrier plantation | Vue mensuelle INRAE, périodes semis/récolte pour toutes les plantes |
| Prévisions météo 7j | Alertes gel, canicule, tempête automatiques (Open-Meteo) |
| Timeline photo | Journal photo horodaté, GPS, identification IA, détection maladies |
| Marché dynamique | Prix variant selon saison + offre/demande |
| Onboarding 8 étapes | Progression guidée avec récompenses (5→30 pièces) |
| Notifications toast | Toasts in-app liés aux événements EventBus |
| Célébrations animées | Confetti + animations sur achievements, quêtes, récoltes |
| EventBus typé | 17 types d'événements pour communication inter-modules |

---

## Architecture des Données Botaniques

Les calculs agronomiques sont basés sur des sources scientifiques :

| Paramètre | Source | Usage |
|---|---|---|
| **GDD** (Growing Degree Days) | FAO, INRAE | Accumulation thermique journalière — base 10°C pour tomate, 4°C pour carotte |
| **ET0** (Évapotranspiration) | Hargreaves FAO | Calcul des besoins en eau par plante |
| **Kc** (Coefficient cultural) | FAO Crop Coefficients | Multiplicateur par stade de développement |
| **Températures seuils** | INRAE, filières | Tbase, Tcap, gel, développement optimal |
| **Companonnage** | Matrice INRAE | Associations favorables/défavorables entre cultures |
| **Maladies** | Modèles épidémiologiques | Risque mildiou (humidité + pluie), oïdium (humidité + vent) |

---

## Stack technique

| Technologie | Usage |
|---|---|
| **Next.js 16** + Turbopack | Framework |
| **React 19** + TypeScript | UI type-safe |
| **Zustand** + persist | State + localStorage |
| **Tailwind CSS** + Framer Motion | Styles + animations |
| **Open-Meteo** | Météo sans clé API |
| **Groq API** | IA vision cloud (gratuit) |
| **Ollama** | IA 100% locale + agent RAG |
| **Qdrant** | Base vectorielle locale (RAG) |
| **Plant.id** | Identification spécialisée |

---

## Installation

```bash
git clone https://github.com/avalondrey/BotanIA.git
cd BotanIA
npm install
cp .env.local.example .env.local  # configurer clés API
npm run dev
```

Ouvrir **http://localhost:3000**

### Scripts & Validation

```bash
npm run validate-plant-data  # Valide plantCategory, plantFamily, entrées manquantes
npm run cleanup-hologram    # --dry-run: apercu | --fix: applique
npm run generate-plantcards # Génère PlantCards depuis CARD_DATA
npm run generate-cards      # Génère les cartes de jeu
npm run test                # Lance les tests unitaires (vitest)
npm run test:watch          # Mode watch
```

### Pre-commit Hook

Pour installer le hook de validation automatique :

```bash
# Linux/Mac
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

# Windows (Git Bash / WSL)
cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
```

Le hook lance `npx tsc --noEmit` + `validate-plant-data` avant chaque commit.

### Variables d'environnement

```env
# Groq (gratuit — https://console.groq.com/keys)
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Secret for validate-plantcard endpoint (generates/changes PlantCards)
VALIDATE_PLANT_SECRET=ton-secret-aqui

# Ollama (local, optionnel — agent RAG)
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_URL=http://localhost:11434
ENABLE_OLLAMA=true

# Ollama embeddings (pour RAG — optionnel)
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Qdrant (base vectorielle locale — pour agent RAG)
NEXT_PUBLIC_QDRANT_URL=http://localhost:6333

# Plant.id (optionnel, 100/jour sans clé)
PLANTID_API_KEY=  # laisser vide pour mode gratuit

# Claude Vision (optionnel)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Guide d'utilisation

```
1. Boutique → acheter graines ou arbres (ouvrir les paquets de graines!)
2. Marché → vendre ses récoltes pour gagner des pièces
3. Pépinière / Mini Serre → semer et suivre germination
4. Jardin → transplanter, arroser, fertiliser
5. Vue Rangs → photographier et tracer vos vrais rangs
6. Identificateur → identifier une plante inconnue avec l'IA
7. Récolter → +3 pièces + 1 unité inventaire vendable
8. Quêtes → compléter 3 quêtes/jour pour des bonus pièces
9. Quotidien → réclamer le bonus journalier (streak bonus!)
```

**Contrôles clavier :**
| Touche | Action |
|---|---|
| `1` à `5` | Vitesse d'avancement x1 → x100 |
| `Espace` | Pause / Reprendre |
| `A` | Panneau admin |

---

## Structure du projet

```
BotanIA/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── identify-plant/   # API identification IA (4 moteurs)
│   │   │   ├── ollama/           # API Assistant Papy le Jardinier
│   │   │   ├── weather/           # API météo Open-Meteo
│   │   │   └── agent/             # API Agent Lia (RAG: status, scan, rag, index-file)
│   │   └── page.tsx              # Page principale + onglets
│   ├── components/game/
│   │   ├── Jardin.tsx            # Onglet Jardin (Plan, Cartes, Rangs)
│   │   ├── GardenPlanView.tsx    # Vue Plan — snap, guides, ghost, zoom, propriétés
│   │   ├── JardinPlacementControls.tsx # Barre d'outils (zones, structures, snap, grille)
│   │   ├── SeedRowPainter.tsx    # Dessin rangs sur photo (Douglas-Peucker + undo)
│   │   ├── PlantIdentifier.tsx    # Identificateur IA
│   │   ├── GardenCardsView.tsx   # Vue cartes manga
│   │   ├── HologramEvolution.tsx # Carte de croissance botanique
│   │   ├── IAJardinier.tsx       # Assistant Papy
│   │   ├── Pepiniere.tsx         # Chambre de culture
│   │   ├── Boutique.tsx          # Multi-semenciers
│   │   └── ...
│   ├── hooks/
│   │   ├── useAgroData.ts        # 🌾 Données agronomiques temps réel
│   │   └── useUndoHistory.ts     # ↩️ Undo/Redo générique (pile 50 actions)
│   ├── store/
│   │   ├── game-store.ts         # État principal (facade)
│   │   ├── shop-store.ts         # Économie, graines, plantules
│   │   ├── economy-store.ts      # Inventaire récoltes, quotidien, quêtes
│   │   ├── nursery-store.ts      # Pépinière, mini-serres
│   │   ├── garden-store.ts       # Plantes jardin, zones serre
│   │   ├── simulation-store.ts   # Cycle jour/météo/tick
│   │   ├── photo-store.ts        # Photos + GPS + rangs
│   │   ├── harvest-store.ts      # Suivi récoltes
│   │   ├── achievement-store.ts  # Badges jardinier
│   │   ├── market-store.ts       # Prix dynamiques marché (saisonniers)
│   │   ├── onboarding-store.ts   # Quêtes narratives 8 étapes
│   │   ├── notification-store.ts # Toasts in-app (EventBus)
│   │   └── ui-settings-store.ts  # Paramètres UI
│   └── lib/
│       ├── agent/                 # Agent IA Lia (qdrant, ollama, rag-engine, code-scanner...)
│       ├── ai-engine.ts          # Moteur botanique
│       ├── weather-service.ts    # Open-Meteo
│       ├── gdd-engine.ts         # 🌡️ Calcul GDD (FAO)
│       ├── hydro-engine.ts        # 💧 Besoins en eau (ET0 FAO)
│       ├── companion-matrix.ts    # 🤝 Matrice compagnonnage INRAE
│       ├── soil-temperature.ts   # 🌡️ Température sol + semis
│       ├── weather-dynamics.ts    # 🦠 Modèles maladies
│       ├── water-budget.ts       # 💧 Budget hydrique
│       ├── gps-extractor.ts      # 📍 EXIF GPS + device
│       └── sound-manager.ts      # 🔊 Audio
├── public/
│   ├── plants/                   # Sprites plantes (stades 0-6)
│   ├── pots/                     # Pots arbres fruitiers
│   ├── cards/                    # Cartes collection
│   └── equipment/                # Équipement horticole
├── prisma/                       # Base de données
└── CHANGELOG.md                  # Historique des versions
```

---

## Roadmap

### ✅ Réalisé
- [x] Données botaniques réelles (INRAE, FAO Crop Coefficients)
- [x] Boutiques multi-semenciers (10 boutiques)
- [x] Arbres fruitiers + croissance multi-année
- [x] Météo réelle Open-Meteo + GPS
- [x] Vue Plan + Vue Cartes manga
- [x] Effets météo visuels
- [x] 📸 **Marquage rangs sur photo réelle (v0.12.0)**
- [x] 📍 **GPS automatique EXIF + device (v0.12.0)**
- [x] 🔍 **Identificateur IA 4 moteurs (v0.12.0)**
- [x] 🌾 **Carte de croissance botanique enrichie (v0.12.1)**
- [x] 🪙 **Économie : marché, quotidien, quêtes, vente récoltes (v0.20.0)**
- [x] 📦 **Paquets de graines : achat → ouverture → plantation (v0.20.0)**
- [x] 🏗️ **Éditeur de grille pro : snap, guides, undo, zoom (v0.21.0)**
- [x] 📖 **Catalogue variétés + Calendrier INRAE + Météo 7j + Marché dynamique (v0.22.0)**
- [x] 🔔 **EventBus + Notifications + Onboarding 8 étapes + Célébrations (v0.22.0)**

### 🚀 Idées à implanter
- [ ] **Calendrier lunaire** — affichage phase + conseil semis/récolte selon tradition
- [ ] **Journal de jardin** — notes quotidiennes liées aux photos et aux rangs
- [ ] **Export GPX/KML** — exporter les rangs géoréférencés vers Google Earth
- [ ] **Partage communautaire** — galerie photos identifications
- [ ] **Notifications arrosage** — rappels basés sur météo réelle et stade plante
- [ ] **Mode hors-ligne** — PWA avec Service Worker
- [ ] **Historique météo** — graphe température/pluie sur les 30 derniers jours
- [ ] **Export/Import sauvegarde** — JSON dump complet

---

## Licence

Projet éducatif personnel. Données semences issues de catalogues publics (Kokopelli, Biau Germe, Sainte Marthe, Vilmorin, Clause, Guignard, INRAE).

Fait avec ❤️ par **avalondrey**
