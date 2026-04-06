# -*- coding: utf-8 -*-

filepath = "src/store/game-store.ts"

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Backup
with open(filepath + ".backup-final-safe", "w", encoding="utf-8") as f:
    f.write(content)
print("Backup cree : game-store.ts.backup-final-safe")

# === ETAPE 1: NETTOYER SEED_CATALOG ===
print("\n=== ETAPE 1: Nettoyage SEED_CATALOG ===")

# Trouver SEED_CATALOG exactement
start_marker = "export const SEED_CATALOG: SeedItem[] = ["
end_marker = "];\n\n// Auto-resolve image path"  # Marker unique après SEED_CATALOG

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("ERREUR: Marqueurs SEED_CATALOG non trouves")
    exit(1)

# Nouveau SEED_CATALOG propre (6 graines de base)
new_catalog = '''export const SEED_CATALOG: SeedItem[] = [
  // Graines classiques (paquets generiques)
  { id:"seed-tomato",     plantDefId:"tomato",     name:"Paquet Graines Tomate",   emoji:"🍅", price:50, brand:"Vilmorin",  packetImage:"/packets/card-tomato.png",     cardImage:"/cards/card-tomato.png",     realDaysToHarvest:109, optimalMonths:[2,3,4],        category:"vegetable" },
  { id:"seed-carrot",     plantDefId:"carrot",     name:"Paquet Graines Carotte",  emoji:"🥕", price:40, brand:"Clause",    packetImage:"/packets/card-carrot.png",     cardImage:"/cards/card-carrot.png",     realDaysToHarvest:114, optimalMonths:[2,3,4,5,8,9],  category:"vegetable" },
  { id:"seed-strawberry", plantDefId:"strawberry", name:"Paquet Graines Fraise",   emoji:"🍓", price:60, brand:"Truffaut",  packetImage:"/packets/card-strawberry.png", cardImage:"/cards/card-strawberry.png", realDaysToHarvest:123, optimalMonths:[2,3,4,8,9],    category:"vegetable" },
  { id:"seed-lettuce",    plantDefId:"lettuce",    name:"Paquet Graines Salade",   emoji:"🥬", price:30, brand:"Jardiland", packetImage:"/packets/card-lettuce.png",    cardImage:"/cards/card-lettuce.png",    realDaysToHarvest:49,  optimalMonths:[1,2,3,4,8,9,10], category:"vegetable" },
  { id:"seed-basil",      plantDefId:"basil",      name:"Paquet Graines Basilic",  emoji:"🌿", price:45, brand:"St Marthe", packetImage:"/packets/card-basil.png",      cardImage:"/cards/card-basil.png",      realDaysToHarvest:88,  optimalMonths:[3,4,5],        category:"aromatic" },
  { id:"seed-pepper",     plantDefId:"pepper",     name:"Paquet Graines Piment",   emoji:"🌶️", price:55, brand:"Kokopelli", packetImage:"/packets/card-pepper.png",     cardImage:"/cards/card-pepper.png",     realDaysToHarvest:130, optimalMonths:[1,2,3,4],      category:"vegetable" },
];

'''

# Remplacer SEED_CATALOG uniquement
content = content[:start_idx] + new_catalog + content[end_idx:]
print("✅ SEED_CATALOG nettoye")

# === ETAPE 2: VERIFIER DOUBLONS + AJOUTER NOUVELLES VARIETES ===
print("\n=== ETAPE 2: Ajout nouvelles varietes (avec anti-doublons) ===")

# Liste des IDs à ajouter
nouvelles_ids = [
    "oak-pedoncule",
    "maple-acer-platanoides", "birch-betula", "pine-sylvestris", "magnolia-grandiflora",
    "apple-reine-reinettes", "apple-belle-fleur", "pear-conference", "pear-louise-bonne",
    "apricot-bergeron", "plum-reine-claude", "fig-goutte-or", "peach-sanguine", "quince-champion"
]

# Vérifier si ces IDs existent déjà
doublons = []
for vid in nouvelles_ids:
    if f'id: "{vid}"' in content:
        doublons.append(vid)

if doublons:
    print(f"⚠️  DOUBLONS DETECTES ({len(doublons)}) - NE SERONT PAS AJOUTES:")
    for d in doublons:
        print(f"   - {d}")
    print("\nSeules les varietes non-doublons seront ajoutees")

# Nouvelles variétés
nouvelles_varietes = '''  // INRAE - Chene
  {
    id: "oak-pedoncule",
    plantDefId: "oak",
    shopId: "inrae",
    name: "Chene Pedoncule",
    emoji: "🌳",
    price: 120, grams: 2.0,
    description: "Chene commun des forets francaises, croissance lente, bois noble",
    image: "/packets/inrae/packet-oak-pedoncule.png", unlocked: true,
    stageDurations: [60,120,180,1095], realDaysToHarvest: 1455,
    optimalTemp: [8,22], waterNeed: 4.0, lightNeed: 7,
  },
  // Pepinieres Bordas - Arbres d'ornement
  {
    id: "maple-acer-platanoides",
    plantDefId: "maple",
    shopId: "pepinieres-bordas",
    name: "Erable Plane",
    emoji: "🍁",
    price: 140, grams: 1.5,
    description: "Erable majestueux, feuillage dore en automne, croissance rapide",
    image: "/packets/pepinieres-bordas/packet-maple-platanoides.png", unlocked: true,
    stageDurations: [50,100,150,900], realDaysToHarvest: 1200,
    optimalTemp: [10,22], waterNeed: 4.5, lightNeed: 7,
  },
  {
    id: "birch-betula",
    plantDefId: "birch",
    shopId: "pepinieres-bordas",
    name: "Bouleau Blanc",
    emoji: "🌲",
    price: 110, grams: 0.8,
    description: "Ecorce blanche decorative, croissance rapide, resistant au froid",
    image: "/packets/pepinieres-bordas/packet-birch-white.png", unlocked: true,
    stageDurations: [40,80,120,730], realDaysToHarvest: 970,
    optimalTemp: [5,20], waterNeed: 4.0, lightNeed: 6,
  },
  {
    id: "pine-sylvestris",
    plantDefId: "pine",
    shopId: "pepinieres-bordas",
    name: "Pin Sylvestre",
    emoji: "🌲",
    price: 100, grams: 1.0,
    description: "Conifere rustique, ecorce orangee, ideal haies brise-vent",
    image: "/packets/pepinieres-bordas/packet-pine-sylvestris.png", unlocked: true,
    stageDurations: [60,120,200,1095], realDaysToHarvest: 1475,
    optimalTemp: [8,20], waterNeed: 3.5, lightNeed: 8,
  },
  {
    id: "magnolia-grandiflora",
    plantDefId: "magnolia",
    shopId: "pepinieres-bordas",
    name: "Magnolia Grandiflora",
    emoji: "🌸",
    price: 180, grams: 2.0,
    description: "Fleurs blanches geantes parfumees, feuillage persistant luisant",
    image: "/packets/pepinieres-bordas/packet-magnolia-grandiflora.png", unlocked: true,
    stageDurations: [70,140,250,1200], realDaysToHarvest: 1660,
    optimalTemp: [12,25], waterNeed: 5.0, lightNeed: 7,
  },
  // Arbres Tissot - Pommiers et Poiriers specialises
  {
    id: "apple-reine-reinettes",
    plantDefId: "apple",
    shopId: "arbres-tissot",
    name: "Pommier Reine des Reinettes",
    emoji: "🍎",
    price: 155, grams: 0.6,
    description: "Variete ancienne rustique, pommes parfumees, excellente conservation",
    image: "/packets/arbres-tissot/packet-apple-reine-reinettes.png", unlocked: true,
    stageDurations: [30,60,120,380], realDaysToHarvest: 750,
    optimalTemp: [8,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "apple-belle-fleur",
    plantDefId: "apple",
    shopId: "arbres-tissot",
    name: "Pommier Belle Fleur",
    emoji: "🍎",
    price: 150, grams: 0.6,
    description: "Pommes jaunes douces, floraison spectaculaire, tres productive",
    image: "/packets/arbres-tissot/packet-apple-belle-fleur.png", unlocked: true,
    stageDurations: [28,58,115,360], realDaysToHarvest: 720,
    optimalTemp: [8,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "pear-conference",
    plantDefId: "pear",
    shopId: "arbres-tissot",
    name: "Poirier Conference",
    emoji: "🍐",
    price: 165, grams: 0.7,
    description: "Variete anglaise, chair fondante et sucree, autofertile",
    image: "/packets/arbres-tissot/packet-pear-conference.png", unlocked: true,
    stageDurations: [32,65,130,400], realDaysToHarvest: 820,
    optimalTemp: [10,22], waterNeed: 5.0, lightNeed: 7,
  },
  {
    id: "pear-louise-bonne",
    plantDefId: "pear",
    shopId: "arbres-tissot",
    name: "Poirier Louise Bonne",
    emoji: "🍐",
    price: 160, grams: 0.7,
    description: "Poire ancienne fondante, chair blanche juteuse, tres parfumee",
    image: "/packets/arbres-tissot/packet-pear-louise-bonne.png", unlocked: true,
    stageDurations: [30,62,125,390], realDaysToHarvest: 800,
    optimalTemp: [10,22], waterNeed: 5.0, lightNeed: 7,
  },
  // Fruitiers Forest - Fruits a noyau et specialites
  {
    id: "apricot-bergeron",
    plantDefId: "apricot",
    shopId: "fruitiers-forest",
    name: "Abricotier Bergeron",
    emoji: "🍑",
    price: 170, grams: 0.8,
    description: "Variete du Roussillon, fruits gros et parfumes, chair ferme",
    image: "/packets/fruitiers-forest/packet-apricot-bergeron.png", unlocked: true,
    stageDurations: [35,70,140,420], realDaysToHarvest: 850,
    optimalTemp: [10,25], waterNeed: 4.5, lightNeed: 8,
  },
  {
    id: "plum-reine-claude",
    plantDefId: "plum",
    shopId: "fruitiers-forest",
    name: "Prunier Reine Claude",
    emoji: "🍑",
    price: 145, grams: 0.6,
    description: "Prune verte doree, chair sucree et fondante, variete royale",
    image: "/packets/fruitiers-forest/packet-plum-reine-claude.png", unlocked: true,
    stageDurations: [28,56,110,340], realDaysToHarvest: 680,
    optimalTemp: [10,24], waterNeed: 4.5, lightNeed: 7,
  },
  {
    id: "fig-goutte-or",
    plantDefId: "fig",
    shopId: "fruitiers-forest",
    name: "Figuier Goutte d'Or",
    emoji: "🫐",
    price: 135, grams: 0.5,
    description: "Figues jaunes tres sucrees, chair rose, bifere",
    image: "/packets/fruitiers-forest/packet-fig-goutte-or.png", unlocked: true,
    stageDurations: [40,80,160,500], realDaysToHarvest: 950,
    optimalTemp: [12,28], waterNeed: 4.0, lightNeed: 8,
  },
  {
    id: "peach-sanguine",
    plantDefId: "peach",
    shopId: "fruitiers-forest",
    name: "Pecher Sanguine de Savoie",
    emoji: "🍑",
    price: 160, grams: 0.7,
    description: "Peche chair rouge sang, sucree et parfumee, variete ancienne",
    image: "/packets/fruitiers-forest/packet-peach-sanguine.png", unlocked: true,
    stageDurations: [32,65,130,400], realDaysToHarvest: 820,
    optimalTemp: [10,26], waterNeed: 5.0, lightNeed: 8,
  },
  {
    id: "quince-champion",
    plantDefId: "quince",
    shopId: "fruitiers-forest",
    name: "Cognassier Champion",
    emoji: "🍋",
    price: 125, grams: 0.6,
    description: "Coings gros et parfumes, ideal gelees et pates de fruits",
    image: "/packets/fruitiers-forest/packet-quince-champion.png", unlocked: true,
    stageDurations: [35,70,140,420], realDaysToHarvest: 850,
    optimalTemp: [10,24], waterNeed: 4.5, lightNeed: 7,
  },
'''

# Filtrer les variétés déjà existantes
if not doublons:
    # Aucun doublon, on ajoute tout
    varietes_a_ajouter = nouvelles_varietes
    nb_ajoutees = 15
else:
    # Filtrer ligne par ligne
    lines_to_add = []
    current_variety = []
    skip = False
    
    for line in nouvelles_varietes.split('\n'):
        if line.strip().startswith('id:'):
            # Nouvelle variété commence
            variety_id = line.split('"')[1]
            if variety_id in doublons:
                skip = True
                current_variety = []
            else:
                skip = False
                current_variety = [line]
        elif line.strip().startswith('}'):
            # Fin de variété
            if not skip:
                current_variety.append(line)
                lines_to_add.extend(current_variety)
            current_variety = []
        elif not skip:
            current_variety.append(line)
    
    varietes_a_ajouter = '\n'.join(lines_to_add)
    nb_ajoutees = 15 - len(doublons)

# Trouver où insérer (avant ]; de SEED_VARIETIES)
varieties_start = content.find("export const SEED_VARIETIES: SeedVariety[] = [")
if varieties_start == -1:
    print("ERREUR: SEED_VARIETIES non trouve")
    exit(1)

# Chercher le ]; qui ferme SEED_VARIETIES
closing_idx = content.find("];", varieties_start)
if closing_idx == -1:
    print("ERREUR: Fin de SEED_VARIETIES non trouvee")
    exit(1)

# Insérer avant le ];
content = content[:closing_idx] + varietes_a_ajouter + content[closing_idx:]

print(f"✅ {nb_ajoutees} nouvelles varietes ajoutees")
if doublons:
    print(f"   ({len(doublons)} doublons ignores)")

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("\n=== TERMINE ===")
print("Redem arre : npm run dev")