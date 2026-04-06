# -*- coding: utf-8 -*-

filepath = "src/store/game-store.ts"

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Backup
with open(filepath + ".backup-clean-all-dups", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Backup créé\n")

# Liste des IDs à dédupliquer
ids_to_deduplicate = [
    "maple-acer-platanoides", "birch-betula", "pine-sylvestris", "magnolia-grandiflora",
    "apple-reine-reinettes", "apple-belle-fleur", "pear-conference", "pear-louise-bonne",
    "apricot-bergeron", "plum-reine-claude", "fig-goutte-or", "peach-sanguine", "quince-champion"
]

print("=== SUPPRESSION DES DOUBLONS ===")

for target_id in ids_to_deduplicate:
    occurrences = []
    i = 0
    
    # Trouver toutes les occurrences
    while i < len(lines):
        if f'id: "{target_id}"' in lines[i]:
            # Trouver le début { et la fin },
            start = i
            while start > 0 and lines[start].strip() not in ["{", "  {"]:
                start -= 1
            
            end = i
            while end < len(lines) and "}," not in lines[end]:
                end += 1
            
            occurrences.append((start, end + 1))
            i = end + 1
        else:
            i += 1
    
    if len(occurrences) > 1:
        print(f"⚠️  {target_id}: {len(occurrences)} occurrences - suppression des doublons")
        # Supprimer TOUTES sauf la première
        for start, end in reversed(occurrences[1:]):
            del lines[start:end]
    elif len(occurrences) == 1:
        print(f"✅ {target_id}: 1 occurrence (OK)")
    else:
        print(f"❌ {target_id}: MANQUANT")

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("\n✅ Nettoyage terminé")
print("Redémarre : npm run dev")