# BotanIA - Documentation Complète

> Documentation centralisée du projet BotanIA

## Structure

```
src/data/
├── README.md                    # Ce fichier
├── encyclopedia.ts              # Données botaniques centralisées (PLANT_DATA)
├── DOCUMENTATION COMPLÈTE - BOTANIA ASSETS/
│   └── BOTANIA-ASSETS-DOCUMENTATION.md
├── graines/
│   ├── README.md                # Guide des cartes graines
│   ├── vilmorin/               # Tomates Vilmorin
│   ├── clause/                  # Clause
│   ├── kokopelli/              # Kokopelli bio
│   ├── lebiau/                 # Le Biau Germe
│   └── saintemarthe/           # Sainte Marthe
├── arbres/
│   ├── README.md                # Guide des cartes arbres
│   ├── guignard/               # Arbres fruitiers Guignard
│   ├── inrae/                  # Arbres INRAE
│   ├──-arbres-tissot/          # Arbres Tissot
│   ├── pepinieres-bordas/       # Pépinières Bordas
│   └── fruitiers-forest/        # Fruitiers Forest
├── plantules/
│   └── README.md                # Guide des plantules
└── equipements/
    └── README.md               # Guide des équipements
```

## Principe des Cartes

Chaque élément du jeu (graine, arbre, plantule, équipement) possède une **carte de croissance** ou **fiche technique** qui décrit :

- Les données physiologiques
- Les conditions de croissance
- Les rendements
- Les notes de culture

Ces cartes alimentent le moteur de simulation du jeu.

## Conventions de nommage

```
{variete}-{stade}.ts
{tree-type}-{stade}.ts
{equipment-type}.ts
```

## Documentation

Voir : `DOCUMENTATION COMPLÈTE - BOTANIA ASSETS/BOTANIA-ASSETS-DOCUMENTATION.md`
