# BotanIA — Sources des Données Botaniques

> Documentation des sources scientifiques utilisées pour les calculs agronomiques.
> Important : Toute modification des données doit être sourcée.

---

## Sources principales

### FAO (Food and Agriculture Organization)
**Site** : https://www.fao.org

| Paramètre | Document | Usage |
|---|---|---|
| **GDD** (Growing Degree Days) | FAO Irrigation & Drainage Paper 56 | Accumulation thermique journalière |
| **ET0** (Évapotranspiration) | FAO Penman-Monteith (FAO-56) | Calcul des besoins en eau |
| **Kc** (Coefficient cultural) | FAO CropWat / Tableaux FAO-56 | Multiplicateur par stade |

### INRAE (Institut national de recherche pour l'agriculture, l'alimentation et l'environnement)
**Site** : https://www.inrae.fr

| Paramètre | Source | Usage |
|---|---|---|
| **Companonnage** | Fiches cultures INRAE, CTIFL | Associations favorables/défavorables |
| **Conduite culturale** | Fiches technico-économiques | Calendriers, densités, irrigation |
| **Maladies** | Modèles épidémiologiques INRAE | Mildiou, oïdium |

### GNIS (Groupement National Interprofessionnel des Semences)
**Site** : https://www.gnis.fr

| Paramètre | Usage |
|---|---|
| Catalogue des variétés | Liste des variétés françaises |
| Fiches variétés | Caractéristiques (précocité, résistance, usage) |
| Semenciers partenaires | Données de germination, pureté |

### Semenciers (catalogues publics)
| Semencier | Spécificité |
|---|---|
| **Kokopelli** | Variétés anciennes, bio |
| **Le Biau Germe** | Graines paysannes, population |
| **Sainte Marthe** | Graines potagères |
| **Vilmorin** | Semencier historique |
| **Clause** | Semencier professionnel |
| **Guignard** | Arbres fruitiers |
| **INRAE** | Variétés sélectionnées |
| **Arbres Tissot** | Arbres fruitiers |
| **Pépinières Bordas** | Arbres forestiers |

---

## Paramètres botaniques par plante

### Tomate (Solanum lycopersicum)

| Paramètre | Valeur | Source |
|---|---|---|
| Tbase | 10°C | FAO |
| Tcap | 30°C | FAO |
| Kc (initial) | 0.60 | FAO-56 |
| Kc (mid) | 1.15 | FAO-56 |
| Kc (late) | 0.90 | FAO-56 |
| ET0 ref | ~5 mm/jour | FAO Penman-Monteith |
| Besoin eau | ~5.5 mm/jour (Kc × ET0) | Calculé |
| Germination | 7-10 jours (15-25°C) | Kokopelli |
| Croissance | ~60 jours | Estimation |
| Récolte | ~109 jours total | Kokopelli |
| Temp sol min semis | 15°C | INRAE |
| Companonnage + | Basilic, carotte, persil | INRAE |
| Companonnage - | Choux, fenouil, pomme de terre | INRAE |
| Risques | Mildiou (humidité + pluie), Oïdium | INRAE |

### Carotte (Daucus carota)

| Paramètre | Valeur | Source |
|---|---|---|
| Tbase | 4°C | FAO |
| Tcap | 27°C | FAO |
| Kc | 1.0 | FAO-56 |
| Germination | 14-21 jours | Sainte Marthe |
| Croissance | ~90 jours | Estimation |
| Temp sol min semis | 7°C | INRAE |
| Companonnage + | Oignon, échalote, laitue | INRAE |
| Companonnage - | Aneth, panais | INRAE |

### Laitue (Lactuca sativa)

| Paramètre | Valeur | Source |
|---|---|---|
| Tbase | 4°C | FAO |
| Tcap | 24°C | FAO |
| Kc | 0.95 | FAO-56 |
| Germination | 5-7 jours | Le Biau Germe |
| Croissance | ~45-60 jours | Estimation |
| Temp sol min semis | 5°C | INRAE |
| Companonnage + | Radis, carotte, fraisier | INRAE |
| Companonnage - | Céleri | INRAE |

---

## Modèles de calcul

### GDD (Growing Degree Days)

```
GDD = max(0, min(Tmean, Tcap) - Tbase)

où:
- Tmean = (Tmax + Tmin) / 2
- Tbase = température de base (croissance nulle en dessous)
- Tcap = température plafond (stress au dessus)
```

**Source** : FAO Irrigation & Drainage Paper 56, Chapter 2

### ET0 (Évapotranspiration de référence)

**Méthode Hargreaves simplifiée** (quand données complètes indisponibles) :
```
ET0 = (Tmax - Tmin) × 0.085 + 2.5
```
*(Version simplifiée, la méthode FAO Penman-Monteith complète est préférée)*

**Source** : FAO Irrigation & Drainage Paper 56, Chapter 2

### Besoins en eau

```
ETc = Kc × ET0
BesoinL/j = ETc × surfaceM2

où:
- ETc = évapotranspiration de la culture
- Kc = coefficient cultural (varie selon stade)
- surfaceM2 = surface occupée par la plante
```

**Source** : FAO CropWat Manual

### Risque Mildiou (Phytophthora infestans)

```
Risque = f(humidité, température, précipitations)

Conditions favorables :
- Humidité relative > 90%
- Température entre 10°C et 25°C
- Pluie ou irrigation foliaire
```

**Source** : Modèles INRAE/ANSES

### Risque Oïdium

```
Risque = f(humidité, température, vent)

Conditions favorables :
- Humidité modérée (60-80%)
- Température 15-25°C
- Faible ventilation
```

**Source** : Modèles INRAE/ITAB

---

## Compagnonnage (Matrice INRAE)

| Plante | Associée favorablement | Associée défavorablement |
|---|---|---|
| Tomate | Basilic, carotte, persil, oignon | Choux, fenouil, pomme de terre |
| Carotte | Oignon, échalote, laitue, tomate | Aneth, panais |
| Laitue | Radis, carotte, fraisier | Céleri |
| Fraisier | Laitue, haricot, épinard | Choux |
| Basilic | Tomate, poivron | Rue |
| Poivron | Tomate, basilic, carotte | Fénouil |

**Source** : Fiches INRAE "伴侣 Planting" et CTIFL

---

## Comment ajouter/modifier des données

1. **Identifier la source** : FAO, INRAE, GNIS, ou semencier
2. **Vérifier la fiabilité** : Privilégier les sources institutionnelles
3. **Documenter** : Ajouter un commentaire dans le code avec la source
4. **Tester** : Vérifier que les calculs donnent des résultats réalistes
5. **Mettre à jour DATA_SOURCES.md** : Si nouvelles sources utilisées

---

## Contacts utiles

| Organisation | Site | Ressources |
|---|---|---|
| FAO | fao.org | Publications, CropWat |
| INRAE | inrae.fr | Fiches cultures, publications |
| GNIS | gnis.fr | Catalogue variétés |
| CTIFL | ctifl.fr | Fiches technico-économiques |
| Plan fool | plan fool.org | Outil gratuit (non officiel) |
