# -*- coding: utf-8 -*-

filepath = "src/store/game-store.ts"

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Backup
with open(filepath + ".backup-remove-dup-oak", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Backup créé")

# Trouver toutes les occurrences de oak-pedoncule
oak_positions = []
i = 0
while i < len(lines):
    if 'id: "oak-pedoncule"' in lines[i]:
        # Trouver le début de cette variété (ligne avec { qui précède)
        start = i
        while start > 0 and lines[start].strip() not in ["{", "  {"]:
            start -= 1
        
        # Trouver la fin (ligne avec },)
        end = i
        while end < len(lines) and "}," not in lines[end]:
            end += 1
        
        oak_positions.append((start, end + 1))
        i = end + 1
    else:
        i += 1

print(f"\n{len(oak_positions)} occurrence(s) de oak-pedoncule trouvée(s)")

if len(oak_positions) > 1:
    print(f"Suppression du doublon (occurrence 2/{len(oak_positions)})")
    
    # Supprimer la DEUXIÈME occurrence (garder la première)
    start, end = oak_positions[1]
    del lines[start:end]
    
    # Sauvegarder
    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(lines)
    
    print("✅ Doublon supprimé")
    print("\nRedémarre : npm run dev")
elif len(oak_positions) == 1:
    print("✅ Aucun doublon (une seule occurrence)")
else:
    print("⚠️  oak-pedoncule introuvable")