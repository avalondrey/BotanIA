# -*- coding: utf-8 -*-

filepath = "src/store/game-store.ts"

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Backup
with open(filepath + ".backup-add-13-varieties", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Backup cree : game-store.ts.backup-add-13-varieties")

# Vérifier doublons
content = ''.join(lines)
nouvelles_ids = [
    "oak-pedoncule",
    "birch-betula", "pine-sylvestris", "magnolia-grandiflora",
    "apple-reine-reinettes", "apple-belle-fleur", "pear-conference", "pear-louise-bonne",
    "apricot-bergeron", "plum-reine-claude", "fig-goutte-or", "peach-sanguine", "quince-champion"
]

doublons = [vid for vid in nouvelles_ids if f'id: "{vid}"' in content]

if doublons:
    print(f"⚠️  DOUBLONS DETECTES: {', '.join(doublons)}")
    print("Ces varietes seront ignorees\n")

# Trouver la dernière variété dans SEED_VARIETIES
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
    print("ERREUR: Impossible de trouver la derniere variete")
    exit(1)

print(f"Insertion apres ligne {last_variety_end + 1}\n")

# Les 13 variétés restantes
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

# Insérer après la dernière variété
lines.insert(last_variety_end + 1, nouvelles_varietes)

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

nb_ajoutees = 13 - len(doublons)
print(f"✅ {nb_ajoutees} nouvelles varietes ajoutees")
print("   - INRAE: 1 Chene")
print("   - Pepinieres Bordas: 3 arbres")
print("   - Arbres Tissot: 4 pommiers/poiriers")
print("   - Fruitiers Forest: 5 fruitiers")
print("\nRedemarre : npm run dev")