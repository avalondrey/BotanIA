# BotanIA - Changelog

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
