# 📦 GUIDE COMPLET - AJOUTER DES VARIÉTÉS DE GRAINES DANS BOTANIA

## 📚 TABLE DES MATIÈRES

1. [Structure des données](#structure-des-données)
2. [Script automatique avec détection de doublons](#script-automatique)
3. [Exemples par type de plante](#exemples-par-type)
4. [Checklist avant ajout](#checklist)
5. [Dépannage](#dépannage)

---

## 🏗️ STRUCTURE DES DONNÉES

### Fichier : `src/store/game-store.ts`

```typescript
export const SEED_VARIETIES: SeedVariety[] = [
  {
    id: "tomato-cocktail",              // ID UNIQUE (kebab-case)
    plantDefId: "tomato",                // Type de plante (doit exister dans PLANTS)
    shopId: "vilmorin",                  // ID de la boutique (doit exister dans SEED_SHOPS)
    name: "Tomate Cocktail",             // Nom affiché
    emoji: "🍅",                         // Emoji représentatif
    price: 40,                           // Prix en pièces
    grams: 0.5,                          // Poids du paquet
    description: "Variété précoce...",   // Description courte
    image: "/packets/vilmorin/packet-tomato-cocktail.png", // Chemin image
    unlocked: true,                      // Débloqué par défaut
    stageDurations: [8, 22, 20, 45],    // Durées des 4 stades (jours)
    realDaysToHarvest: 95,               // Jours totaux jusqu'à récolte
    optimalTemp: [16, 28],               // Température min/max (°C)
    waterNeed: 5.0,                      // Besoin en eau (1-10)
    lightNeed: 8,                        // Besoin en lumière (1-10)
  },
]
```

---

## 🤖 SCRIPT AUTOMATIQUE AVEC DÉTECTION DE DOUBLONS

### `add_seed_variety.py`

```python
# -*- coding: utf-8 -*-
"""
Script pour ajouter une ou plusieurs variétés de graines dans BotanIA
Détection automatique de doublons + validation des données
"""

filepath = "src/store/game-store.ts"

# === CONFIGURATION : VARIÉTÉS À AJOUTER ===
# Modifie cette liste pour ajouter tes variétés
NOUVELLES_VARIETES = [
    {
        "id": "tomato-saint-pierre",
        "plantDefId": "tomato",
        "shopId": "vilmorin",
        "name": "Tomate Saint-Pierre",
        "emoji": "🍅",
        "price": 45,
        "grams": 0.4,
        "description": "Variété précoce très productive, fruits ronds de 100-120g",
        "image": "/packets/vilmorin/packet-tomato-saint-pierre.png",
        "unlocked": True,
        "stageDurations": [7, 20, 22, 46],
        "realDaysToHarvest": 95,
        "optimalTemp": [16, 28],
        "waterNeed": 5.0,
        "lightNeed": 8,
    },
    {
        "id": "lettuce-reine-mai",
        "plantDefId": "lettuce",
        "shopId": "clause",
        "name": "Laitue Reine de Mai",
        "emoji": "🥬",
        "price": 28,
        "grams": 0.3,
        "description": "Variété de printemps très résistante à la montaison",
        "image": "/packets/clause/packet-lettuce-reine-mai.png",
        "unlocked": True,
        "stageDurations": [4, 10, 12, 20],
        "realDaysToHarvest": 46,
        "optimalTemp": [12, 20],
        "waterNeed": 3.5,
        "lightNeed": 6,
    },
]

# === VALIDATION DES BOUTIQUES EXISTANTES ===
BOUTIQUES_VALIDES = [
    "vilmorin", "clause", "kokopelli", "lebiau", "saintemarthe",
    "guignard", "inrae", "pepinieres-bordas", "arbres-tissot", "fruitiers-forest"
]

# === VALIDATION DES TYPES DE PLANTES ===
PLANT_TYPES_VALIDES = [
    "tomato", "carrot", "strawberry", "lettuce", "basil", "pepper",
    "cucumber", "zucchini", "eggplant", "squash", "bean", "cabbage",
    "apple", "pear", "cherry", "walnut", "oak", "maple", "birch",
    "pine", "magnolia", "apricot", "plum", "fig", "peach", "quince"
]

# === SCRIPT ===
def valider_variete(var):
    """Valide qu'une variété a tous les champs requis"""
    champs_requis = [
        "id", "plantDefId", "shopId", "name", "emoji", "price", "grams",
        "description", "image", "unlocked", "stageDurations", "realDaysToHarvest",
        "optimalTemp", "waterNeed", "lightNeed"
    ]
    
    for champ in champs_requis:
        if champ not in var:
            return False, f"Champ manquant: {champ}"
    
    # Vérifier shopId
    if var["shopId"] not in BOUTIQUES_VALIDES:
        return False, f"shopId invalide: {var['shopId']}. Boutiques valides: {', '.join(BOUTIQUES_VALIDES)}"
    
    # Vérifier plantDefId
    if var["plantDefId"] not in PLANT_TYPES_VALIDES:
        return False, f"plantDefId invalide: {var['plantDefId']}. Types valides: {', '.join(PLANT_TYPES_VALIDES)}"
    
    # Vérifier stageDurations
    if len(var["stageDurations"]) != 4:
        return False, f"stageDurations doit contenir exactement 4 valeurs"
    
    # Vérifier optimalTemp
    if len(var["optimalTemp"]) != 2:
        return False, f"optimalTemp doit contenir exactement 2 valeurs [min, max]"
    
    return True, "OK"

def generer_code_variete(var):
    """Génère le code TypeScript pour une variété"""
    return f'''  {{
    id: "{var['id']}",
    plantDefId: "{var['plantDefId']}",
    shopId: "{var['shopId']}",
    name: "{var['name']}",
    emoji: "{var['emoji']}",
    price: {var['price']}, grams: {var['grams']},
    description: "{var['description']}",
    image: "{var['image']}", unlocked: {'true' if var['unlocked'] else 'false'},
    stageDurations: [{','.join(map(str, var['stageDurations']))}], realDaysToHarvest: {var['realDaysToHarvest']},
    optimalTemp: [{','.join(map(str, var['optimalTemp']))}], waterNeed: {var['waterNeed']}, lightNeed: {var['lightNeed']},
  }},
'''

# Lire le fichier
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Backup
with open(filepath + ".backup-add-varieties", "w", encoding="utf-8") as f:
    f.write(content)
print("✅ Backup créé : game-store.ts.backup-add-varieties\n")

# Validation des variétés
print("=== VALIDATION DES VARIÉTÉS ===")
varietes_valides = []
for i, var in enumerate(NOUVELLES_VARIETES):
    valide, message = valider_variete(var)
    if not valide:
        print(f"❌ Variété {i+1} ({var.get('name', 'SANS NOM')}) : {message}")
        exit(1)
    print(f"✅ Variété {i+1} ({var['name']}) : Valide")
    varietes_valides.append(var)

# Détection de doublons
print("\n=== DÉTECTION DE DOUBLONS ===")
doublons = []
nouvelles = []

for var in varietes_valides:
    if f'id: "{var["id"]}"' in content:
        doublons.append(var['id'])
        print(f"⚠️  DOUBLON : {var['id']} existe déjà - IGNORÉ")
    else:
        nouvelles.append(var)
        print(f"✅ NOUVEAU : {var['id']} sera ajouté")

if not nouvelles:
    print("\n⚠️  Aucune nouvelle variété à ajouter (toutes existent déjà)")
    exit(0)

# Trouver où insérer
print("\n=== INSERTION DANS SEED_VARIETIES ===")
lines = content.split('\n')
in_varieties = False
last_variety_end = -1

for i, line in enumerate(lines):
    if "export const SEED_VARIETIES: SeedVariety[] = [" in line:
        in_varieties = True
    elif in_varieties and line.strip() == "},":
        last_variety_end = i
    elif in_varieties and line.strip() == "];":
        break

if last_variety_end == -1:
    print("❌ ERREUR : Impossible de trouver la fin de SEED_VARIETIES")
    exit(1)

print(f"Insertion après la ligne {last_variety_end + 1}")

# Générer le code
code_a_ajouter = ""
for var in nouvelles:
    code_a_ajouter += generer_code_variete(var)

# Insérer
lines.insert(last_variety_end + 1, code_a_ajouter.rstrip('\n'))

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.write('\n'.join(lines))

print(f"\n✅ {len(nouvelles)} variété(s) ajoutée(s) avec succès !")
print(f"   {len(doublons)} doublon(s) ignoré(s)")
print("\n🎯 Prochaines étapes :")
print("   1. Créer les images correspondantes dans public/packets/BOUTIQUE/")
print("   2. Redémarrer : npm run dev")
print("   3. Tester dans la boutique correspondante")
```

---

## 📋 EXEMPLES PAR TYPE DE PLANTE

### 🍅 LÉGUMES (Tomates, Carottes, Courgettes, etc.)

```python
{
    "id": "carrot-amsterdam",
    "plantDefId": "carrot",
    "shopId": "clause",
    "name": "Carotte Amsterdam",
    "emoji": "🥕",
    "price": 35,
    "grams": 0.5,
    "description": "Variété précoce, racine cylindrique courte très tendre",
    "image": "/packets/clause/packet-carrot-amsterdam.png",
    "unlocked": True,
    "stageDurations": [8, 18, 20, 50],  # Germination, Levée, Croissance, Récolte
    "realDaysToHarvest": 96,
    "optimalTemp": [15, 22],
    "waterNeed": 4.0,
    "lightNeed": 6,
}
```

### 🌿 AROMATIQUES (Basilic, Persil, Coriandre, etc.)

```python
{
    "id": "basil-thai",
    "plantDefId": "basil",
    "shopId": "kokopelli",
    "name": "Basilic Thai",
    "emoji": "🌿",
    "price": 48,
    "grams": 0.2,
    "description": "Basilic asiatique au parfum anisé, feuilles pourpres",
    "image": "/packets/kokopelli/packet-basil-thai.png",
    "unlocked": True,
    "stageDurations": [6, 16, 18, 38],
    "realDaysToHarvest": 78,
    "optimalTemp": [20, 27],
    "waterNeed": 4.0,
    "lightNeed": 6,
}
```

### 🍎 ARBRES FRUITIERS (Pommiers, Poiriers, Cerisiers, etc.)

```python
{
    "id": "apple-granny-smith",
    "plantDefId": "apple",
    "shopId": "guignard",
    "name": "Pommier Granny Smith",
    "emoji": "🍎",
    "price": 165,
    "grams": 0.6,
    "description": "Pomme verte acidulée, excellente conservation, tardive",
    "image": "/packets/guignard/packet-apple-granny-smith.png",
    "unlocked": True,
    "stageDurations": [30, 60, 120, 400],  # Les arbres ont des cycles très longs
    "realDaysToHarvest": 750,
    "optimalTemp": [8, 22],
    "waterNeed": 5.0,
    "lightNeed": 7,
}
```

### 🌳 ARBRES D'ORNEMENT (Érables, Bouleaux, Pins, etc.)

```python
{
    "id": "cedar-atlas",
    "plantDefId": "cedar",
    "shopId": "pepinieres-bordas",
    "name": "Cèdre de l'Atlas",
    "emoji": "🌲",
    "price": 150,
    "grams": 1.5,
    "description": "Conifère majestueux, aiguilles bleu-vert, croissance lente",
    "image": "/packets/pepinieres-bordas/packet-cedar-atlas.png",
    "unlocked": True,
    "stageDurations": [60, 120, 200, 1200],
    "realDaysToHarvest": 1580,
    "optimalTemp": [8, 24],
    "waterNeed": 4.0,
    "lightNeed": 8,
}
```

---

## ✅ CHECKLIST AVANT AJOUT

### 1. Vérifier que la boutique existe

```python
# Dans src/store/game-store.ts, section SEED_SHOPS
BOUTIQUES_EXISTANTES = [
    "vilmorin",           # Vilmorin
    "clause",             # Clause
    "kokopelli",          # Kokopelli
    "lebiau",             # Le Biau Germe
    "saintemarthe",       # Ferme de Sainte Marthe
    "guignard",           # Guignard
    "inrae",              # INRAE
    "pepinieres-bordas",  # Pépinières Bordas
    "arbres-tissot",      # Arbres Tissot
    "fruitiers-forest",   # Fruitiers Forest
]
```

### 2. Vérifier que le type de plante existe

```python
# Dans src/lib/ai-engine.ts, objet PLANTS
TYPES_PLANTES_EXISTANTS = [
    # Légumes
    "tomato", "carrot", "strawberry", "lettuce", "basil", "pepper",
    "cucumber", "zucchini", "eggplant", "squash", "bean", "cabbage",
    
    # Arbres fruitiers
    "apple", "pear", "cherry", "walnut", "apricot", "plum", 
    "fig", "peach", "quince",
    
    # Arbres ornement
    "oak", "maple", "birch", "pine", "magnolia", "cedar",
]
```

### 3. Créer l'image du paquet

**Chemin** : `public/packets/BOUTIQUE/packet-ID.png`

**Exemples** :
- `public/packets/vilmorin/packet-tomato-saint-pierre.png`
- `public/packets/clause/packet-carrot-amsterdam.png`
- `public/packets/kokopelli/packet-basil-thai.png`

**Dimensions recommandées** : 400x600px (format portrait)

**Style** : Paquet de graines vintage avec marque de la boutique

### 4. Données réalistes

#### Durées de culture (stageDurations)

| Type | Germination | Levée | Croissance | Récolte | Total |
|------|-------------|-------|------------|---------|-------|
| Salade | 4j | 10j | 12j | 20j | 46j |
| Tomate | 8j | 22j | 20j | 45j | 95j |
| Carotte | 10j | 28j | 26j | 52j | 116j |
| Arbre fruitier | 30j | 60j | 120j | 400j | 730j+ |

#### Températures optimales (optimalTemp)

| Type | Min | Max |
|------|-----|-----|
| Salade | 12°C | 20°C |
| Tomate | 16°C | 28°C |
| Carotte | 15°C | 22°C |
| Basilic | 20°C | 27°C |
| Arbres | 8°C | 22°C |

#### Besoins en eau/lumière

| Type | Water (1-10) | Light (1-10) |
|------|--------------|--------------|
| Légumes | 4-5 | 6-8 |
| Aromatiques | 3-4 | 6-7 |
| Arbres | 4-5 | 7-8 |

---

## 🔧 DÉPANNAGE

### Erreur : "shopId invalide"

**Cause** : La boutique n'existe pas dans `SEED_SHOPS`

**Solution** : Utilise un `shopId` existant ou crée d'abord la boutique

### Erreur : "plantDefId invalide"

**Cause** : Le type de plante n'existe pas dans `PLANTS`

**Solution** : Utilise un type existant ou ajoute d'abord le type dans `ai-engine.ts`

### Erreur : "Fin de SEED_VARIETIES non trouvée"

**Cause** : Erreur de syntaxe dans le fichier

**Solution** : Restaure le backup : `copy src\store\game-store.ts.backup-add-varieties src\store\game-store.ts`

### Les variétés n'apparaissent pas dans la boutique

**Causes possibles** :
1. `shopId` incorrect → Vérifie l'orthographe exacte
2. `unlocked: false` → Change en `true`
3. Cache navigateur → Ctrl+Shift+R pour hard refresh
4. Erreur compilation → Vérifie la console

---

## 🎯 WORKFLOW COMPLET

### Étape 1 : Préparer les données

1. Décide de la boutique (`shopId`)
2. Choisis le type de plante (`plantDefId`)
3. Crée un ID unique (`id`)
4. Rédige la description
5. Définis les paramètres de culture

### Étape 2 : Créer l'image

1. Génère l'image du paquet (IA ou Photoshop)
2. Sauvegarde dans `public/packets/BOUTIQUE/packet-ID.png`
3. Dimensions : 400x600px minimum

### Étape 3 : Ajouter dans le code

1. Modifie `NOUVELLES_VARIETES` dans `add_seed_variety.py`
2. Exécute : `python add_seed_variety.py`
3. Vérifie qu'il n'y a pas de doublons

### Étape 4 : Tester

1. Redémarre : `npm run dev`
2. Va dans Boutique → Sélectionne la boutique
3. Vérifie que la variété s'affiche avec son image
4. Teste l'achat et la plantation

### Étape 5 : Commit

```bash
git add .
git commit -m "feat: Ajouter variété [NOM]"
git push origin main
```

---

## 📝 TEMPLATE VIERGE

```python
{
    "id": "",                    # Ex: "tomato-saint-pierre"
    "plantDefId": "",            # Ex: "tomato"
    "shopId": "",                # Ex: "vilmorin"
    "name": "",                  # Ex: "Tomate Saint-Pierre"
    "emoji": "",                 # Ex: "🍅"
    "price": 0,                  # Ex: 45
    "grams": 0.0,                # Ex: 0.4
    "description": "",           # Ex: "Variété précoce..."
    "image": "",                 # Ex: "/packets/vilmorin/packet-tomato-saint-pierre.png"
    "unlocked": True,
    "stageDurations": [0,0,0,0], # Ex: [7, 20, 22, 46]
    "realDaysToHarvest": 0,      # Ex: 95
    "optimalTemp": [0, 0],       # Ex: [16, 28]
    "waterNeed": 0.0,            # Ex: 5.0
    "lightNeed": 0,              # Ex: 8
}
```

---

## 🎨 CONVENTIONS DE NOMMAGE

### IDs (kebab-case)

```
[type]-[variété-spécifique]

Exemples :
- tomato-saint-pierre
- carrot-amsterdam
- apple-granny-smith
- basil-thai
- lettuce-reine-mai
```

### Images

```
/packets/[boutique]/packet-[id].png

Exemples :
- /packets/vilmorin/packet-tomato-saint-pierre.png
- /packets/clause/packet-carrot-amsterdam.png
- /packets/guignard/packet-apple-granny-smith.png
```

---

**FIN DU GUIDE** 🎉

Pour toute question, consulte le fichier principal de documentation des assets !
