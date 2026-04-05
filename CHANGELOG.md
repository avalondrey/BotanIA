# BotanIA - Changelog

## v0.10.0 - Encyclopedie Hardcore + Cleanup (2025-07-16)

### Nouveau
- **Encyclopedie BotanIA** (src/data/encyclopedia.ts)
  - Donnees biologiques reelles pour 6 plantes (temp., espacements, germination, compagnonnage)
  - Catalogue materiel : LEDs (PPFD, spectre, duree de vie), tentes Gorilla, serres pro
- **Fix hydration** : date HUD ne cause plus de mismatch server/client (suppressHydrationWarning)
- **Validation semis** : fonction canPlaceRowInGarden dans le store (verifie les graines avant traçage)
- **Intégration moteur** : import PLANT_DATA depuis l'encyclopedie

### Nettoyage
- Suppression des fichiers temporaires (scripts de dev, archives, logs)
- .gitignore enrichi : ignore skills/, download/, worklog, archives
- README refondu avec donnees encyclopediques et structure du projet
- Conservation de toutes les images (cards, stages, packets, pots, plants)

### Technique
- Interface PlantEncyclopediaEntry (temp., semis, stades, espace, NPK, companions)
- Interface EquipmentSpecs (lighting, structure, tentes, serres)
- Interface LightingSpecs (PPFD, spectre, chaleur, duree de vie LED)

---

v0.9.4 - Boutique multi-semenciers + Mini Serres
- Achat de graines depuis 5 semenciers (Vilmorin, Clause, Kokopelli, Biau Germe, Sainte Marthe)
- Varietes exclusives par boutique (Cherokee, Rose de Berne, Marmande, etc.)
- Mini Serres (24 slots) avec environnement protege
- Gestion unifiee des graines (classiques + varietes)
- Panneau admin avec creation de varietes custom
