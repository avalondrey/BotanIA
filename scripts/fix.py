# -*- coding: utf-8 -*-
import os

filepath = "src/store/game-store.ts"

if not os.path.exists(filepath):
    print("Fichier non trouve")
    exit(1)

# Lire
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Backup
with open(filepath + ".backup-unlock", "w", encoding="utf-8") as f:
    f.write(content)
print("Backup cree")

# Corrections : unlock les 3 varietes
fixes = [
    ('image: "/packets/clause/packet-cucumber-marketer.png", unlocked: false,',
     'image: "/packets/clause/packet-cucumber-marketer.png", unlocked: true,'),
    
    ('image: "/packets/clause/packet-zucchini-black-beauty.png", unlocked: false,',
     'image: "/packets/clause/packet-zucchini-black-beauty.png", unlocked: true,'),
    
    ('image: "/packets/clause/packet-pepper-california-wonder.png", unlocked: false,',
     'image: "/packets/clause/packet-pepper-california-wonder.png", unlocked: true,'),
]

count = 0
for old, new in fixes:
    if old in content:
        content = content.replace(old, new)
        count += 1
        print("OK : " + old[:50] + "...")

# Sauvegarder
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("\n" + str(count) + " varietes debloquees !")
print("\nRedemarre : npm run dev")