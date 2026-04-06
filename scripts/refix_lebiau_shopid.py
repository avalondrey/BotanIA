# -*- coding: utf-8 -*-

filepath = "src/store/game-store.ts"

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Backup
with open(filepath + ".backup-refix-lebiau", "w", encoding="utf-8") as f:
    f.write(content)
print("Backup cree")

# Compter avant
count_before = content.count('shopId: "biaugerme"')
print(f"\nVarietes avec shopId biaugerme : {count_before}")

# Corriger biaugerme -> lebiau
content = content.replace('shopId: "biaugerme"', 'shopId: "lebiau"')

# Compter après
count_after = content.count('shopId: "lebiau"')

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print(f"{count_before} varietes corrigees : biaugerme -> lebiau")
print("\nRedemarre : npm run dev")