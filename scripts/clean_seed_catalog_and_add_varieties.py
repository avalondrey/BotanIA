# -*- coding: utf-8 -*-
import re

filepath = "src/store/game-store.ts"

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Backup
with open(filepath + ".backup-step1-clean", "w", encoding="utf-8") as f:
    f.write(content)
print("Backup cree : game-store.ts.backup-step1-clean")

# Nouveau SEED_CATALOG propre
new_catalog = '''export const SEED_CATALOG: SeedItem[] = [
  // Graines classiques (paquets generiques)
  { id:"seed-tomato",     plantDefId:"tomato",     name:"Paquet Graines Tomate",   emoji:"🍅", price:50, brand:"Vilmorin",  packetImage:"/packets/card-tomato.png",     cardImage:"/cards/card-tomato.png",     realDaysToHarvest:109, optimalMonths:[2,3,4],        category:"vegetable" },
  { id:"seed-carrot",     plantDefId:"carrot",     name:"Paquet Graines Carotte",  emoji:"🥕", price:40, brand:"Clause",    packetImage:"/packets/card-carrot.png",     cardImage:"/cards/card-carrot.png",     realDaysToHarvest:114, optimalMonths:[2,3,4,5,8,9],  category:"vegetable" },
  { id:"seed-strawberry", plantDefId:"strawberry", name:"Paquet Graines Fraise",   emoji:"🍓", price:60, brand:"Truffaut",  packetImage:"/packets/card-strawberry.png", cardImage:"/cards/card-strawberry.png", realDaysToHarvest:123, optimalMonths:[2,3,4,8,9],    category:"vegetable" },
  { id:"seed-lettuce",    plantDefId:"lettuce",    name:"Paquet Graines Salade",   emoji:"🥬", price:30, brand:"Jardiland", packetImage:"/packets/card-lettuce.png",    cardImage:"/cards/card-lettuce.png",    realDaysToHarvest:49,  optimalMonths:[1,2,3,4,8,9,10], category:"vegetable" },
  { id:"seed-basil",      plantDefId:"basil",      name:"Paquet Graines Basilic",  emoji:"🌿", price:45, brand:"St Marthe", packetImage:"/packets/card-basil.png",      cardImage:"/cards/card-basil.png",      realDaysToHarvest:88,  optimalMonths:[3,4,5],        category:"aromatic" },
  { id:"seed-pepper",     plantDefId:"pepper",     name:"Paquet Graines Piment",   emoji:"🌶️", price:55, brand:"Kokopelli", packetImage:"/packets/card-pepper.png",     cardImage:"/cards/card-pepper.png",     realDaysToHarvest:130, optimalMonths:[1,2,3,4],      category:"vegetable" },
];'''

# Remplacer SEED_CATALOG avec regex
pattern = r'export const SEED_CATALOG: SeedItem\[\] = \[.*?\];'
content = re.sub(pattern, new_catalog, content, flags=re.DOTALL)

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("\n✅ SEED_CATALOG nettoye")
print("   - Garde seulement 6 graines de base")
print("   - Supprime tous les arbres et paquets varietes")
print("\nRedemarre et verifie que ca marche avant l'etape 2 !")