# -*- coding: utf-8 -*-

filepath = "src/store/game-store.ts"

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Backup
with open(filepath + ".backup-ultra-safe", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Backup cree : game-store.ts.backup-ultra-safe")

# === ETAPE 1: Nettoyer SEED_CATALOG ===
print("\n=== ETAPE 1: Nettoyage SEED_CATALOG ===")

# Trouver SEED_CATALOG et le remplacer
in_catalog = False
catalog_start = -1
catalog_end = -1

for i, line in enumerate(lines):
    if "export const SEED_CATALOG: SeedItem[] = [" in line:
        in_catalog = True
        catalog_start = i
    elif in_catalog and line.strip() == "];":
        catalog_end = i
        in_catalog = False
        break

if catalog_start == -1 or catalog_end == -1:
    print("ERREUR: SEED_CATALOG non trouve")
    exit(1)

# Nouveau SEED_CATALOG
new_catalog_lines = [
    "export const SEED_CATALOG: SeedItem[] = [\n",
    "  // Graines classiques (paquets generiques)\n",
    '  { id:"seed-tomato",     plantDefId:"tomato",     name:"Paquet Graines Tomate",   emoji:"🍅", price:50, brand:"Vilmorin",  packetImage:"/packets/card-tomato.png",     cardImage:"/cards/card-tomato.png",     realDaysToHarvest:109, optimalMonths:[2,3,4],        category:"vegetable" },\n',
    '  { id:"seed-carrot",     plantDefId:"carrot",     name:"Paquet Graines Carotte",  emoji:"🥕", price:40, brand:"Clause",    packetImage:"/packets/card-carrot.png",     cardImage:"/cards/card-carrot.png",     realDaysToHarvest:114, optimalMonths:[2,3,4,5,8,9],  category:"vegetable" },\n',
    '  { id:"seed-strawberry", plantDefId:"strawberry", name:"Paquet Graines Fraise",   emoji:"🍓", price:60, brand:"Truffaut",  packetImage:"/packets/card-strawberry.png", cardImage:"/cards/card-strawberry.png", realDaysToHarvest:123, optimalMonths:[2,3,4,8,9],    category:"vegetable" },\n',
    '  { id:"seed-lettuce",    plantDefId:"lettuce",    name:"Paquet Graines Salade",   emoji:"🥬", price:30, brand:"Jardiland", packetImage:"/packets/card-lettuce.png",    cardImage:"/cards/card-lettuce.png",    realDaysToHarvest:49,  optimalMonths:[1,2,3,4,8,9,10], category:"vegetable" },\n',
    '  { id:"seed-basil",      plantDefId:"basil",      name:"Paquet Graines Basilic",  emoji:"🌿", price:45, brand:"St Marthe", packetImage:"/packets/card-basil.png",      cardImage:"/cards/card-basil.png",      realDaysToHarvest:88,  optimalMonths:[3,4,5],        category:"aromatic" },\n',
    '  { id:"seed-pepper",     plantDefId:"pepper",     name:"Paquet Graines Piment",   emoji:"🌶️", price:55, brand:"Kokopelli", packetImage:"/packets/card-pepper.png",     cardImage:"/cards/card-pepper.png",     realDaysToHarvest:130, optimalMonths:[1,2,3,4],      category:"vegetable" },\n',
    "];\n",
]

# Remplacer SEED_CATALOG
lines = lines[:catalog_start] + new_catalog_lines + lines[catalog_end+1:]
print("✅ SEED_CATALOG nettoye")

# === ETAPE 2: Ajouter nouvelles variétés ===
print("\n=== ETAPE 2: Ajout nouvelles varietes ===")

# Vérifier doublons
content = ''.join(lines)
nouvelles_ids = [
    "oak-pedoncule",
    "maple-acer-platanoides", "birch-betula", "pine-sylvestris", "magnolia-grandiflora",
    "apple-reine-reinettes", "apple-belle-fleur", "pear-conference", "pear-louise-bonne",
    "apricot-bergeron", "plum-reine-claude", "fig-goutte-or", "peach-sanguine", "quince-champion"
]

doublons = [vid for vid in nouvelles_ids if f'id: "{vid}"' in content]

if doublons:
    print(f"⚠️  DOUBLONS: {len(doublons)} varietes deja presentes - ignorees")

# Trouver la dernière ligne avec }, avant ]; de SEED_VARIETIES
in_varieties = False
last_variety_end = -1

for i, line in enumerate(lines):
    if "export const SEED_VARIETIES: SeedVariety[] = [" in line:
        in_varieties = True
    elif in_varieties and line.strip() == "},":
        last_variety_end = i
    elif in_varieties and line.strip() == "];":
        # Trouvé la fin
        break

if last_variety_end == -1:
    print("ERREUR: Impossible de trouver la derniere variete")
    exit(1)

print(f"Insertion apres la ligne {last_variety_end + 1}")

# Nouvelles variétés (sans doublons)
nouvelles_lignes = [
    "  // INRAE - Chene\n",
    "  {\n",
    '    id: "oak-pedoncule",\n',
    '    plantDefId: "oak",\n',
    '    shopId: "inrae",\n',
    '    name: "Chene Pedoncule",\n',
    '    emoji: "🌳",\n',
    "    price: 120, grams: 2.0,\n",
    '    description: "Chene commun des forets francaises, croissance lente, bois noble",\n',
    '    image: "/packets/inrae/packet-oak-pedoncule.png", unlocked: true,\n',
    "    stageDurations: [60,120,180,1095], realDaysToHarvest: 1455,\n",
    "    optimalTemp: [8,22], waterNeed: 4.0, lightNeed: 7,\n",
    "  },\n",
    "  // Pepinieres Bordas\n",
    "  {\n",
    '    id: "maple-acer-platanoides",\n',
    '    plantDefId: "maple",\n',
    '    shopId: "pepinieres-bordas",\n',
    '    name: "Erable Plane",\n',
    '    emoji: "🍁",\n',
    "    price: 140, grams: 1.5,\n",
    '    description: "Erable majestueux, feuillage dore en automne",\n',
    '    image: "/packets/pepinieres-bordas/packet-maple-platanoides.png", unlocked: true,\n',
    "    stageDurations: [50,100,150,900], realDaysToHarvest: 1200,\n",
    "    optimalTemp: [10,22], waterNeed: 4.5, lightNeed: 7,\n",
    "  },\n",
]

# Insérer après la dernière variété
lines.insert(last_variety_end + 1, ''.join(nouvelles_lignes))

print(f"✅ Varietes ajoutees (test avec 2 varietes)")

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("\n=== TERMINE ===")
print("Redemarre et verifie que ca compile !")