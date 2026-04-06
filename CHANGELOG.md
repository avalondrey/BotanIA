# BotanIA - Changelog

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
- **Systeme de Pots** : Arbres vendus en pot (~20cm), pas en sachets de graines
- **5 Stages de croissance** : Mini scion -> Adulte sur plusieurs annees
- **Nouvelles boutiques** : Guignard, INRAE, Arbres Tissot, Pepinieres Bordas, Fruitiers Forest
- **Reserve** : Citronnier et Oranger en attente d'implementation

#### Images Arbres
- Pots Guignard : Pommier Golden, Pommier Gala, Poirier Williams
- Pots Arbres Tissot : Reine des Reinettes, Belle Fleur, Conference, Louise Bonne
- Pots INRAE : Cerisier Bing
- Stages croissance : 15 (Guignard) + 20 (Arbres Tissot) + 5 (INRAE)

#### Interface
- **Onglet Arbres** : Separe de Graines, avec filtres par boutique
- **Vue Jardin** : Toggle entre vue Plan et vue Cartes manga
- **WeatherEffects** : Effets visuels (soleil, nuages, pluie)
- **JardinPlacementControls** : Mode guide/libre

#### Donnees Botaniques (encyclopedia.ts)
- Arbres fruitiers : apple, pear, cherry, lemon, orange
- Arbres forestiers : walnut, oak, maple, birch, pine, magnolia

### Documentation
- **BOTANIA-ASSETS-DOCUMENTATION.md** : Documentation unifiee assets
- README mis a jour avec nouveaux arbres et boutiques

---

## v0.10.0 - Encyclopedie Hardcore + Cleanup (2025-07-16)

### Nouveau
- **Encyclopedie BotanIA** (src/data/encyclopedia.ts)
- Donnees biologiques reelles pour 6 plantes
- Catalogue materiel : LEDs, tentes Gorilla, serres pro
- Fix hydration HUD
- Validation semis canPlaceRowInGarden

---

## v0.9.4 - Boutique multi-semenciers + Mini Serres
- Achat depuis 5 semenciers, varietes exclusives
- Mini Serres (24 slots), panneau admin varietes custom
