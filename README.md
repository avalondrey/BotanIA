# BotanIA — Simulateur de Jardinage Botanique Réaliste

> Simulateur de jardinage botanique **hardcore** connecté à la météo réelle, aux données INRAE/GNIS, avec identification de plantes par IA et suivi GPS de votre jardin réel.

![Version](https://img.shields.io/badge/version-0.12.0-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![Zustand](https://img.shields.io/badge/State-Zustand-orange)
![Tailwind](https://img.shields.io/badge/UI-Tailwind-06b6d4)
![IA](https://img.shields.io/badge/IA-Groq%20%7C%20Ollama%20%7C%20Claude-purple)

---

## Concept

BotanIA est un simulateur de jardinage qui reproduit fidèlement le cycle de vie des plantes, connecté à votre **jardin réel** via la photo, le GPS et l'IA.

### Philosophie
- **Dates réelles** : saisons, gelées, calendrier lunaire
- **Météo réelle** : Open-Meteo + GPS, vos conditions locales affectent les plantes
- **Biologie vérifiée** : données INRAE, GNIS, temp min/opt/max, espacements, jours de germination
- **Jardin réel** : photographiez, tracez vos rangs, identifiez vos plantes par IA
- **IA locale ET cloud** : Groq, Ollama, Plant.id, Claude Vision

---

## Fonctionnalités principales

### 🌱 Simulation
| Feature | Détail |
|---|---|
| 6 plantes potagères | Tomate, Carotte, Laitue, Fraisier, Basilic, Piment |
| Arbres fruitiers | Pommier, Poirier, Cerisier (croissance multi-année) |
| Arbres forestiers | Noyer, Chêne, Érable, Bouleau |
| 5-6 stades de croissance | Graine → Récolte |
| Météo temps réel | Open-Meteo, GPS auto-détecté |
| Simulation accélérée | x1 → x100, pause/reprendre |

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

### 🏪 Boutiques
| Boutique | Type |
|---|---|
| 🌱 Vilmorin, 🌺 Clause | Semenciers historiques |
| 🌿 Kokopelli, 🌾 Biau Germe, 🏡 Ste Marthe | Bio & paysannes |
| 🌳 Guignard, 🔬 INRAE, 🌲 Bordas | Arbres fruitiers |
| 🌴 Arbres Tissot, 🍎 Fruitiers Forest | Vergers |

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
| **Ollama** | IA 100% locale |
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

# Ollama (local, optionnel)
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434
ENABLE_OLLAMA=true

# Plant.id (optionnel, 100/jour sans clé)
PLANTID_API_KEY=  # laisser vide pour mode gratuit

# Claude Vision (optionnel)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Gameplay

```
1. Boutique → acheter graines ou arbres
2. Pépinière / Mini Serre → semer et suivre germination
3. Jardin → transplanter, arroser, fertiliser
4. Vue Rangs → photographier et tracer vos vrais rangs
5. Identificateur → identifier une plante inconnue avec l'IA
6. Récolter → Pièces + Score
```

**Contrôles clavier :**
| Touche | Action |
|---|---|
| `1` à `5` | Vitesse x1 → x100 |
| `Espace` | Pause / Reprendre |
| `A` | Panneau admin |

---

## Structure du projet

```
BotanIA/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── identify-plant/   # 🆕 API identification IA (4 moteurs)
│   │   │   ├── ollama/           # API Papy le Jardinier
│   │   │   └── weather/          # API météo Open-Meteo
│   │   └── page.tsx              # Page principale + onglets
│   ├── components/game/
│   │   ├── Jardin.tsx            # 🔄 + onglet 📸 Rangs
│   │   ├── GardenPlanView.tsx    # 🔄 + overlay rangs colorés
│   │   ├── SeedRowPainter.tsx    # 🆕 Dessin rangs sur photo
│   │   ├── PlantIdentifier.tsx   # 🆕 Identificateur IA
│   │   ├── GardenCardsView.tsx   # Vue cartes manga
│   │   ├── IAJardinier.tsx       # Assistant Papy
│   │   ├── Pepiniere.tsx         # Chambre de culture
│   │   ├── Boutique.tsx          # Multi-semenciers
│   │   └── ...
│   ├── store/
│   │   ├── game-store.ts         # État principal du jeu
│   │   └── photo-store.ts        # 🆕 Photos + GPS + rangs
│   └── lib/
│       ├── weather-service.ts    # Open-Meteo
│       ├── gps-extractor.ts      # 🆕 EXIF GPS + device GPS
│       └── ai-engine.ts          # Moteur simulation
├── public/
│   ├── plants/                   # Sprites plantes (stages 0-6)
│   ├── pots/                     # Pots arbres fruitiers
│   ├── cards/                    # Cards collection
│   └── equipment/                # Équipement horticole
└── CHANGELOG.md
```

> 🆕 Nouveau en v0.12.0 · 🔄 Modifié en v0.12.0

---

## Roadmap

### ✅ Réalisé
- [x] Données encyclopédiques (INRAE, GNIS)
- [x] Boutiques multi-semenciers (10 boutiques)
- [x] Arbres fruitiers + croissance multi-année
- [x] Météo réelle Open-Meteo + GPS
- [x] Vue Plan + Vue Cartes manga
- [x] Effets météo visuels
- [x] 📸 **Marquage rangs sur photo réelle (v0.12.0)**
- [x] 📍 **GPS automatique EXIF + device (v0.12.0)**
- [x] 🔍 **Identificateur IA 4 moteurs (v0.12.0)**

### 🚀 Idées à implanter
- [ ] **Calendrier lunaire** — affichage phase + conseil semis/récolte selon tradition
- [ ] **Journal de jardin** — notes quotidiennes liées aux photos et aux rangs
- [ ] **Compagnonnage** — alertes associations favorables/défavorables (tomate+basilic ✓)
- [ ] **Plan 3D isométrique** — vue manga isométrique du jardin (style Manga Garden)
- [ ] **Export GPX/KML** — exporter les rangs géoréférencés vers Google Earth
- [ ] **Partage communautaire** — galerie photos identifications (mode partagé)
- [ ] **Détection maladies** — identifier mildiou, pucerons sur photo avec l'IA
- [ ] **Suivi récoltes** — log des récoltes réelles avec poids, date, rang associé
- [ ] **Notifications arrosage** — rappels basés sur météo réelle et stade plante
- [ ] **Mode hors-ligne** — PWA avec Service Worker pour usage au jardin sans réseau
- [ ] **Scan QR rangs** — imprimer un QR code par rang, le scanner pour voir l'état
- [ ] **Historique météo** — graphe température/pluie sur les 30 derniers jours
- [ ] **Achievements** — badges jardinier (première récolte, jardin complet, etc.)
- [ ] **Export/Import sauvegarde** — JSON dump complet du jardin
- [ ] **Mode nuit** — thème sombre adaptatif

---

## Licence

Projet éducatif personnel. Données semences issues de catalogues publics (Kokopelli, Biau Germe, Sainte Marthe, Vilmorin, Clause, Guignard, INRAE).

Fait avec ❤️ par **avalondrey**
