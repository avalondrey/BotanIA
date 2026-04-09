# BotanIA — Application de Jardinage Botanique Réaliste

> Application de jardinage botanique **scientifique** connecté à la météo réelle, aux données INRAE/GNIS, avec identification de plantes par IA et suivi GPS de votre jardin réel.

![Version](https://img.shields.io/badge/version-0.13.0-green)
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

### Variables d'environnement

```env
# Groq (gratuit — https://console.groq.com/keys)
NEXT_PUBLIC_GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

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
1. Boutique → acheter graines ou arbres
2. Pépinière / Mini Serre → semer et suivre germination
3. Jardin → transplanter, arroser, fertiliser
4. Vue Rangs → photographier et tracer vos vrais rangs
5. Identificateur → identifier une plante inconnue avec l'IA
6. Récolter → Suivi des récoltes avec poids et qualité
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
│   │   ├── GardenPlanView.tsx    # Vue Plan avec overlay rangs
│   │   ├── SeedRowPainter.tsx    # Dessin rangs sur photo
│   │   ├── PlantIdentifier.tsx    # Identificateur IA
│   │   ├── GardenCardsView.tsx   # Vue cartes manga
│   │   ├── HologramEvolution.tsx # Carte de croissance botanique
│   │   ├── IAJardinier.tsx       # Assistant Papy
│   │   ├── Pepiniere.tsx         # Chambre de culture
│   │   ├── Boutique.tsx          # Multi-semenciers
│   │   └── ...
│   ├── hooks/
│   │   └── useAgroData.ts        # 🌾 Données agronomiques temps réel
│   ├── store/
│   │   ├── game-store.ts         # État principal
│   │   ├── photo-store.ts        # Photos + GPS + rangs
│   │   ├── harvest-store.ts      # Suivi récoltes
│   │   └── achievement-store.ts  # Badges jardinier
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
