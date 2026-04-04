# 🌿 BotanIA — Jardin Culture

> Simulateur de jardinage botanique français connecté à la météo réelle

![Version](https://img.shields.io/badge/version-0.9.4-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Turbopack](https://img.shields.io/badge/Turbopack-ok-ff69b4)
![React](https://img.shields.io/badge/React-19-blue)
![Zustand](https://img.shields.io/badge/State-Zustand-orange)
![Tailwind](https://img.shields.io/badge/UI-Tailwind-06b6d4)

---

## 🎮 Concept

**BotanIA** est un simulateur de jardinage botanique en temps réel qui reproduit fidèlement le cycle de vie des plantes de A à Z :
- **Graines** → **Pépinière** (5 étapes de croissance) → **Jardin** (maturité → récolte)
- Météo réelle (Open-Meteo) + GPS pour des conditions 1:1
- 6 plantes : 🍅 Tomate • 🥕 Carotte • 🍓 Fraise • 🥬 Salade • 🌿 Basilic • 🌶️ Piment
- **Mini Serres** (6 chambres × 4 slots = 24 emplacements) pour semis protégés
- **Boutique** multi-semenciers avec variétés bio et paysannes

## 🌱 Boutiques disponibles

| Boutique | Spécialité |
|---|---|
| 🌱 **Vilmorin** | Jardinier depuis 1814 — Leader français des semences |
| 🌸 **Clause** | Semences et plants potagers — Qualité professionnelle |
| 🌿 **Kokopelli** | Bio, libre, reproductible — +25 ans de biodiversité |
| 🌾 **Le Biau Germe** | Paysan bio depuis 1981 — 12 fermes en France |
| 🏡 **Ferme de Sainte Marthe** | Patrimoine variétal depuis 1973 |

### variétés exclusives par boutique
- **Kokopelli** : Tomate Cherokee Purple, Rose de Berne
- **Biau Germe** : Tomate Marmande, Carotte de Guérande
- **Sainte Marthe** : Basilic Génois, Poivron Doux de France

## 📦 Stack technique

- **Next.js 16** + Turbopack (HMR ultra-rapide)
- **React 19** + TypeScript
- **Zustand** (state management + persist localStorage)
- **Tailwind CSS** + Framer Motion (animations)
- **Open-Meteo** (météo gratuite sans clé API)
- **Lucide React** (icônes)

## 🚀 Installation

```bash
git clone https://github.com/avalondrey/BotanIA.git
cd BotanIA
npm install
npm run dev
```

Ouvrir http://localhost:3000

## 🎮 Gameplay

```
Sélections des graines/Plants a la Boutique
       ↓
   Pepiniere
   (5 étapes de croissance)
       ↓
    Jardin
  (conditions meteo reelles)
       ↓
    Recolte
  (pieces + score)
```

**Controles rapides :**
- `[1-5]` = Vitesse ×1 à ×5
- `[Espace]` = Pause / Reprendre
- `[R]` = Recharger les plantes
- `[A]` = Panneau admin (mode développeur)

## 🌤️ Météo réelle

Le jeu récupère la météo de votre position GPS :
- **Ciel degage** → croissance optimale
- **Pluie** → arrosage gratuit au jardin (+50% eau, pas en serre)
- **Gel** (≤2°C) → stoppe la croissance (pas de mort)
- **Canicule** (≥30°C) → stress hydrique

**Protection :**
- **Serre** : +15% temperature, -70% pluie, +15% lumiere
- **Pepiniere / Mini Serres** : environnement stable 20°C

## 🏗️ Structure du projet

```
BotanIA/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Page principale du jeu (boucle + meteor)
│   │   └── api/ollama/route.ts # Endpoint IA (Ollama local)
│   ├── components/
│   │   ├── game/               # Composants gameplay
│   │   │   ├── JardinGrid.tsx        # Jardin 12×6 avec meteo
│   │   │   ├── Pepiniere.tsx         # Pepiniere 24 slots
│   │   │   ├── SerreJardinView.tsx   # Serre + mini serres
│   │   │   ├── Boutique.tsx          # Boutique multi-semenciers
│   │   │   ├── GrainCollection.tsx   # Collection graines/plants
│   │   │   ├── GameHUD.tsx           # HUD stats + meteo
│   │   │   └── AdminPanel.tsx        # Panneau admin/dev
│   │   └── ui/                 # UI generiques
│   ├── store/game-store.ts     # Zustand store (etat complet du jeu)
│   └── lib/
│       ├── ai-engine.ts        # Moteur de simulation botanique
│       ├── weather-service.ts  # Service meteo Open-Meteo + GPS
│       ├── environment-engine.ts # Calcul environnement
│       └── use-effects.ts      # Hooks (mode nuit, auto-save)
├── public/
│   ├── images/                 # Images des plantes (6 etapes)
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── package.json
└── CHANGELOG.md
```

## 🎨 Design

- Style "manga cartoon cel-shade" (pas de realisme, pas d'emojis)
- Palette : beige sable, noir profond, vert emeraude, orange terre
- Police : `Space Mono` (code) + `VT323` (retro-game)
- Bordures noires, ombres portees, effets de hover

## 🔧 Commandes

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Build production
npm run start        # Start production
```

## 📝 Roadmap

- [ ] Mode nuit visuel (22h-6h)
- [ ] Particules de recolte animées
- [ ] Systeme de maladies et parasites (toggle admin)
- [ ] Mode multijoueur
- [ ] Export/Import de sauvegarde
- [ ] Plus de varietes par boutique
- [ ] Achievements / defis saisonners

## 📄 Licence

Projet educreatifs. Semences et varietes issues de catalogues publics (Kokopelli, Biau Germe, Sainte Marthe, Vilmorin, Clause).

---

**Fait avec ❤️ par avalondrey**
