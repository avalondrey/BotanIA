# BotanIA - Simulateur de Jardinage Botanique Realiste

> Simulateur de jardinage botanique francais connecte a la meteo reelle et a des donnees agricoles verifiees.

![Version](https://img.shields.io/badge/version-0.10.0-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Turbopack](https://img.shields.io/badge/Turbopack-ok-ff69b4)
![React](https://img.shields.io/badge/React-19-blue)
![Zustand](https://img.shields.io/badge/State-Zustand-orange)
![Tailwind](https://img.shields.io/badge/UI-Tailwind-06b6d4)

---

## Concept

BotanIA est un simulateur de jardinage **hardcore** qui reproduit fidelement le cycle de vie des plantes de A a Z, en s'appuyant sur des **donnees reelles** (INRAE, GNIS, fabricants de materiel horticole).

### Philosophie

- **Dates reelles** : le jeu suit le calendrier reel, les saisons, et les gelées
- **Meteo reelle** : connecte a Open-Meteo avec GPS, les conditions de votre lieu affectent vos plantes
- **Biologie verifiee** : temperature min/opt/max, espacements, profondeurs de semis, jours de germination
- **Materiel specifique** : tentes de culture (Gorilla, Pure Tent), serres pro, panneaux LED avec specs PPFD, duree de vie, spectre
- **Semenciers reels** : Vilmorin, Clause, Kokopelli, Le Biau Germe, Ferme de Sainte Marthe

## Plantes

| Plante | Emoji | Germ. | Jours recolte | Espace | Besoins |
|---|---|---|---|---|---|
| **Tomate** | 🍅 | 8j | 110j | 60x80cm | Eau ++ |
| **Carotte** | 🥕 | 14j | 110j | 5x25cm | Sol leger |
| **Laitue** | 🥬 | 4j | 55j | 25x30cm | Azote |
| **Fraisier** | 🍓 | 20j | 120j | 30x50cm | Eau ++ |
| **Basilic** | 🌿 | 7j | 60j | 25x30cm | Chaleur |
| **Piment** | 🌶️ | 14j | 120j | 40x60cm | Soleil |

### Compagnonnage

Les plantes interagissent entre elles :
- ✅ **Basilic + Tomate** : le basilic repousse les parasites sur les tomates
- ✅ **Carotte + Laitue** : association benefique
- ❌ **Piment + Aubergine** : memes maladies

## Materiel horticole

Le jeu integre du materiel avec des specifications techniques reelles :

### Eclairage LED
- **Panneau LED 100W** : Mars Hydro, PPFD 450 µmol/m²/s a 30cm, 50 000h de duree de vie
- **Panneau LED 240W** : Spider Farmer, PPFD 850 µmol/m²/s a 30cm, 60 000h
- Spectre Full Spectrum, dimmable, faible degagement de chaleur

### Tentes de culture (Grow Tents)
- **Gorilla Grow Tent 60x60** : 160-235cm, cadre acier, Mylar 1680D (isolation 0.9)
- **Gorilla Grow Tent 90x90** : 160-235cm, cadre acier, Mylar 1680D

### Serres professionnelles
- **Serre Tunnel 3x4m** : Tube acier Ø32 galvanise, polyethyle
e 200µ, isolation 0.4

## Boutiques de semences

| Boutique | Specialite |
|---|---|
| 🌱 **Vilmorin** | Jardinier depuis 1814 — Leader francais des semences |
| 🌸 **Clause** | Semences et plants potagers — Qualite professionnelle |
| 🌿 **Kokopelli** | Bio, libre, reproductible — +25 ans de biodiversite |
| 🌾 **Le Biau Germe** | Paysan bio depuis 1981 — 12 fermes en France |
| 🏡 **Sainte Marthe** | Patrimoine varietal depuis 1973 |

### Varietes exclusives

- **Kokopelli** : Cherokee Purple, Rose de Berne
- **Biau Germe** : Marmande, Carotte de Guerande
- **Sainte Marthe** : Basilic Genois, Poivron Doux de France

## Stack technique

| Technologie | Utilisation |
|---|---|
| **Next.js 16** + Turbopack | Framework web, HMR ultra-rapide |
| **React 19** + TypeScript | UI type-safe |
| **Zustand** | State management + persist localStorage |
| **Tailwind CSS** + Framer Motion | Styles + animations |
| **Open-Meteo** | Meteo gratuite sans cle API |
| **Lucide React** | Icones |

## Installation

`ash
git clone https://github.com/avalondrey/BotanIA.git
cd BotanIA
npm install
npm run dev
`

Ouvrir **http://localhost:3000**

## Gameplay

`
1. Acheter des graines a la Boutique
2. Semer en Pepiniere ou Mini Serre (protection)
3. Suivre la croissance (5 stades realistes)
4. Transplanter au Jardin (conditions meteo reelles)
5. Arroser, traiter, fertiliser
6. Recolter -> Pieces + Score
`

**Controles rapides :**
- [1-5] = Vitesse x1 a x5
- [Espace] = Pause / Reprendre
- [R] = Recharger les plantes
- [A] = Panneau admin

## Meteo reelle

Le jeu recupere la meteo de votre position GPS :

| Condition | Effet |
|---|---|
| **Ciel degage** | Croissance optimale |
| **Pluie** | Arrosage gratuit au jardin (+50% eau) |
| **Gel (<=2°C)** | Stoppe la croissance |
| **Canicule (>=30°C)** | Stress hydrique |

**Protection :**
- **Serre** : +15% temperature, -70% pluie, +15% lumiere
- **Pepiniere / Mini Serres** : environnement stable 20°C

## Structure du projet

`
BotanIA/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── game/               # Composants gameplay
│   │   │   ├── JardinGrid.tsx        # Jardin coordonnees cm
│   │   │   ├── Pepiniere.tsx         # Pepiniere 8 slots
│   │   │   ├── SerreJardinView.tsx   # Serre + mini serres
│   │   │   ├── Boutique.tsx          # Boutique multi-semenciers
│   │   │   ├── GameHUD.tsx           # HUD stats + meteo
│   │   │   ├── AdminPanel.tsx        # Panneau admin
│   │   │   └── LiaAssistant.tsx      # Assistante IA Lia
│   │   └── ui/
│   ├── data/
│   │   └── encyclopedia.ts     # Encyclopedie plante + materiel
│   ├── store/
│   │   └── game-store.ts       # Zustand store complet
│   └── lib/
│       ├── ai-engine.ts        # Moteur de simulation
│       ├── weather-service.ts  # Service meteo Open-Meteo + GPS
│       ├── environment-engine.ts
│       └── lia-data.ts         # Conseils IA
├── public/
│   ├── cards/                  # Cartes semences/boutiques
│   ├── stages/                 # Images stades de croissance
│   ├── packets/                # Images paquets de graines
│   ├── pots/                   # Images pots/godets
│   ├── plants/                 # Images plantes
│   └── manifest.json
└── package.json
`

## Design

- Style "manga cartoon cel-shade"
- Palette : beige sable, noir profond, vert emeraude, orange terre
- Police : Space Mono + VT323 (retro-game)
- Bordures noires, ombres portees, effets hover

## Commandes

`ash
npm run dev          # Dev server (Turbopack)
npm run build        # Build production
npm start            # Start production
`

## Roadmap

- [ ] Intégration des donnees d'encyclopedie dans le moteur (temp., espacements, saisonnalité)
- [ ] Validation visuelle des semis (ligne rouge si graines insuffisantes)
- [ ] Mode nuit visuel (22h-6h)
- [ ] Particules de recolte animees
- [ ] Gestion de l'ėclairage LED dans les chambres de culture (consommation, chaleur, PPFD)
- [ ] Outil de déplacement des serres dans le jardin
- [ ] Export/Import de sauvegarde
- [ ] Achievements / defis saisonniers

## Licence

Projet educatif. Semences et varietes issues de catalogues publics (Kokopelli, Biau Germe, Sainte Marthe, Vilmorin, Clause).

Fait avec ❤️ par avalondrey
