# BotanIA — Catalogue des Plantes

> Reference visual des PlantCards disponibles dans le cerveau botanique (HologramEvolution.tsx).
> Mis à jour : 2026-04-07

---

## Vue d'ensemble des plantes potagères

| Plante | ID | Tbase/Tcap | Kc | Jours récolte | Companonnage | Difficulté |
|---|---|---|---|---|---|---|
| 🍅 Tomate | `tomato` | 10/30°C | 1.05 | ~109j | Basilic✓, Carotte✓, Choux✗ | ⭐⭐ |
| 🥕 Carotte | `carrot` | 4/27°C | 1.00 | ~114j | Oignon✓, Laitue✓, Aneth✗ | ⭐ |
| 🥬 Laitue | `lettuce` | 4/24°C | 0.95 | ~49j | Radis✓, Carotte✓, Céleri✗ | ⭐ |
| 🍓 Fraise | `strawberry` | 5/28°C | 1.00 | ~123j | Laitue✓, Haricot✓, Choux✗ | ⭐⭐ |
| 🌿 Basilic | `basil` | 12/32°C | 0.90 | ~90j | Tomate✓, Piment✓, Rue✗ | ⭐⭐⭐ |
| 🌶️ Piment | `pepper` | 10/32°C | 0.90 | ~130j | Tomate✓, Basilic✓, Fenouil✗ | ⭐⭐⭐ |

---

## TOMATE (Solanum lycopersicum)

### Données botaniques
```
ID:           tomato
Famille:      Solanaceae
Tbase:        10°C
Tcap:         30°C
Kc:           1.05
Water:        5.5 mm/jour
Light:        8 heures/jour
Total harvest: ~109 jours
```

### Stades de croissance
| Stade | Label | Jours | GDD cumulés |
|---|---|---|---|
| 0 | 🌰 Graine | 7j | 50 |
| 1 | 🌱 Levée | 21j | 200 |
| 2 | 🌿 Plantule | 28j | 400 |
| 3 | 🪴 Croissance | 45j | 800 |
| 4 | 🌸 Floraison | — | — |
| 5 | 🍅 Récolte | — | — |

### Companonnage
**✅ Favorables :** Basilic, Carotte, Persil, Ciboulette
**❌ Défavorables :** Choux, Fenouil, Pomme de terre

### Maladies
- 🌧️ **Mildiou** : HR>90%, T10-25°C, pluie
- 🌞 **Oïdium** : HR 60-80%, T15-25°C

### Conseils
- Semis sous abri en Mars-Avril (T° sol > 15°C)
- Tailler les gourmands
- Butter les pieds

---

## CAROTTE (Daucus carota)

### Données botaniques
```
ID:           carrot
Famille:      Apiaceae
Tbase:        4°C
Tcap:         27°C
Kc:           1.00
Water:        3.8 mm/jour
Light:        6 heures/jour
Total harvest: ~114 jours
```

### Stades de croissance
| Stade | Label | Jours | GDD cumulés |
|---|---|---|---|
| 0 | 🌰 Graine | 14j | 80 |
| 1 | 🌱 Levée | 18j | 250 |
| 2 | 🌿 Plantule | 35j | 500 |
| 3 | 🪴 Croissance | 45j | 900 |
| 4 | 🌸 Floraison | — | — |
| 5 | 🥕 Récolte | — | — |

### Companonnage
**✅ Favorables :** Oignon, Échalote, Laitue, Tomate
**❌ Défavorables :** Aneth, Panais

### Maladies
- 🪰 **Mouche de la carotte** : Vol mai-juin et août-sept
- 🍂 **Alternaria** : Humidité élevée, temp fraîche

### Conseils
- Semis direct de Mars à Juin
- Sol meuble, profond, sans pierres
- Binages réguliers

---

## LAITUE (Lactuca sativa)

### Données botaniques
```
ID:           lettuce
Famille:      Asteraceae
Tbase:        4°C
Tcap:         24°C
Kc:           0.95
Water:        4.0 mm/jour
Light:        6 heures/jour
Total harvest: ~49 jours
```

### Stades de croissance
| Stade | Label | Jours | GDD cumulés |
|---|---|---|---|
| 0 | 🌰 Graine | 7j | 40 |
| 1 | 🌱 Levée | 12j | 120 |
| 2 | 🌿 Plantule | 18j | 220 |
| 3 | 🪴 Croissance | 12j | 380 |
| 4 | 🌸 Floraison | — | — |
| 5 | 🥬 Récolte | — | — |

### Companonnage
**✅ Favorables :** Radis, Carotte, Fraise, Ciboulette
**❌ Défavorables :** Céleri

### Maladies
- 🦠 **Botrytis** : HR>85%, T15-20°C
- 🌧️ **Mildiou** : Humidité, temp fraîche

### Conseils
- Semis échelonnés toutes les 3 semaines
- Récolter le matin
- Attention à la montée en graine si chaleur

---

## FRAISIER (Fragaria × ananassa)

### Données botaniques
```
ID:           strawberry
Famille:      Rosaceae
Tbase:        5°C
Tcap:         28°C
Kc:           1.00
Water:        4.2 mm/jour
Light:        7 heures/jour
Total harvest: ~123 jours
```

### Stades de croissance
| Stade | Label | Jours | GDD cumulés |
|---|---|---|---|
| 0 | 🌰 Plantule | 21j | 100 |
| 1 | 🌱 Croissance | 25j | 300 |
| 2 | 🌿 Floraison | 30j | 550 |
| 3 | 🪴 Fructification | 40j | 950 |
| 4 | 🌸 Récolte | — | — |
| 5 | 🍓 Récolte | — | — |

### Companonnage
**✅ Favorables :** Laitue, Épinard, Haricot
**❌ Défavorables :** Choux

### Maladies
- 🦠 **Botrytis** : HR>90%, temps humide
- 🌞 **Oïdium** : HR modérée, T15-25°C

### Conseils
- Plantation Mars-Avril ou Août-Sept
- Paillage pour éviter contact fruit-sol
- Remplacer tous les 3-4 ans

---

## BASILIC (Ocimum basilicum)

### Données botaniques
```
ID:           basil
Famille:      Lamiaceae
Tbase:        12°C
Tcap:         32°C
Kc:           0.90
Water:        4.5 mm/jour
Light:        8 heures/jour
Total harvest: ~90 jours
```

### Stades de croissance
| Stade | Label | Jours | GDD cumulés |
|---|---|---|---|
| 0 | 🌰 Graine | 6j | 60 |
| 1 | 🌱 Levée | 9j | 180 |
| 2 | 🌿 Plantule | 14j | 350 |
| 3 | 🪴 Croissance | 22j | 650 |
| 4 | 🌸 Floraison | — | — |
| 5 | 🌿 Récolte | — | — |

### Companonnage
**✅ Favorables :** Tomate, Piment, Origan
**❌ Défavorables :** Rue

### Maladies
- 🦠 **Fusariose** : Temp élevée, humidité
- 🐛 **Pucerons** : Temps sec

### Conseils
- Semis en godets (T° > 18°C)
- Pincer les fleurs pour prolonger récolte
- Protéger du vent froid

---

## PIMENT (Capsicum annuum)

### Données botaniques
```
ID:           pepper
Famille:      Solanaceae
Tbase:        10°C
Tcap:         32°C
Kc:           0.90
Water:        5.0 mm/jour
Light:        8 heures/jour
Total harvest: ~130 jours
```

### Stades de croissance
| Stade | Label | Jours | GDD cumulés |
|---|---|---|---|
| 0 | 🌰 Graine | 7j | 80 |
| 1 | 🌱 Levée | 14j | 300 |
| 2 | 🌿 Plantule | 22j | 600 |
| 3 | 🪴 Croissance | 35j | 1100 |
| 4 | 🌸 Floraison | — | — |
| 5 | 🌶️ Récolte | — | — |

### Companonnage
**✅ Favorables :** Tomate, Basilic, Carotte
**❌ Défavorables :** Fenouil

### Maladies
- 🌧️ **Mildiou** : Humidité élevée, T10-25°C
- 🐛 **Pucerons** : Temps sec

### Conseils
- Semis précoce (Fév-Mars sous abri chaud)
- A besoin de chaleur pour maturité
- Récolter régulièrement pour stimuler

---

## Comment ajouter une plante

Voir `REAL_PLANTS_CONCEPT.md` section "Comment ajouter une nouvelle plante".

En résumé :
1. Ajouter dans `HologramEvolution.tsx` → `PLANT_CARDS`
2. Ajouter images dans `/public/plants/`
3. Ajouter dans `ai-engine.ts` → `PLANTS`
4. Ajouter dans boutique si applicable
