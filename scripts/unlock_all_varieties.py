# -*- coding: utf-8 -*-
import re
import os

filepath = "src/store/game-store.ts"

if not os.path.exists(filepath):
    print("Fichier non trouve")
    exit(1)

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Backup
with open(filepath + ".backup-unlock-all", "w", encoding="utf-8") as f:
    f.write(content)
print("Backup cree")

# Compter combien il y a de "unlocked: false" avant
count_before = content.count('unlocked: false')
print("\nVarietes verrouillees trouvees : " + str(count_before))

# Remplacer TOUS les "unlocked: false" par "unlocked: true"
# SEULEMENT dans la section SEED_VARIETIES
start_marker = "export const SEED_VARIETIES: SeedVariety[] = ["
end_marker = "];"

# Trouver la section SEED_VARIETIES
start_idx = content.find(start_marker)
if start_idx == -1:
    print("ERREUR : SEED_VARIETIES non trouve")
    exit(1)

# Trouver la fin de SEED_VARIETIES (premier ]; après le début)
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("ERREUR : Fin de SEED_VARIETIES non trouve")
    exit(1)

# Extraire les 3 parties
before = content[:start_idx]
seed_varieties_section = content[start_idx:end_idx + len(end_marker)]
after = content[end_idx + len(end_marker):]

# Remplacer dans la section SEED_VARIETIES uniquement
seed_varieties_section = seed_varieties_section.replace('unlocked: false', 'unlocked: true')

# Recomposer
content = before + seed_varieties_section + after

# Compter après
count_after = seed_varieties_section.count('unlocked: false')

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("\n" + str(count_before - count_after) + " varietes debloquees !")
print("\nRedemarre : npm run dev")
print("\nToutes les varietes sont maintenant visibles dans la boutique !")