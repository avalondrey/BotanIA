#!/usr/bin/env python3
"""
Script de correction automatique de game-store.ts
À exécuter dans : C:\\Users\\Administrateur\\Desktop\\BotanIA

Usage:
    python fix_game_store.py
"""

import re
import os
from datetime import datetime

# Corrections d'IDs
ID_FIXES = {
    '"pepper- california"': '"pepper-california-wonder"',
    '"zucchini-cluse"': '"zucchini-black-beauty"',
    '"tomato-rosedeberne"': '"tomato-rose-de-berne"',
    '"tomato-marmade"': '"tomato-marmande"',
    '"tomato-cherokee"': '"tomato-cherokee-purple"',
    '"tomato-green"': '"tomato-green-zebra"',
    '"eggplant-long"': '"eggplant-long-violette"',
    '"squash-coco"': '"squash-butternut-coco"',
    '"lettuce-feuille"': '"lettuce-chene"',
}

# Corrections de chemins d'images (mapping direct)
IMAGE_FIXES = {
    '"/cards/card-tomato-cocktail.png"': '"/packets/vilmorin/packet-tomato-cocktail.png"',
    '"/cards/card-tomato-aneas.png"': '"/packets/vilmorin/packet-tomato-aneas.png"',
    '"/cards/card-tomato-cherokee.png"': '"/packets/kokopelli/packet-tomato-cherokee-purple.png"',
    '"/cards/card-tomato-rosedeberne.png"': '"/packets/kokopelli/packet-tomato-rose-de-berne.png"',
    '"/cards/card-tomato-marmade.png"': '"/packets/lebiau/packet-tomato-marmande.png"',
    '"/cards/card-carrot-guerande.png"': '"/packets/lebiau/packet-carrot-guerande.png"',
    '"/cards/card-basil-genoveois.png"': '"/packets/sainte-marthe/packet-basil-genoveois.png"',
    '"/cards/card-pepper-doux-france.png"': '"/packets/sainte-marthe/packet-pepper-doux-france.png"',
    '"/cards/card-carrot-nantaise.png"': '"/packets/clause/packet-carrot-nantaise.png"',
    '"/cards/card-lettuce-batavia.png"': '"/packets/clause/packet-lettuce-batavia.png"',
    '"/cards/card-cucumber-marketer.png"': '"/packets/clause/packet-cucumber-marketer.png"',
    '"/cards/card-zucchini-black.png"': '"/packets/clause/packet-zucchini-black-beauty.png"',
    '"/cards/card-pepper-california.png"': '"/packets/clause/packet-pepper-california-wonder.png"',
    '"/cards/card-tomato-blackk.png"': '"/packets/kokopelli/packet-tomato-blackk.png"',
    '"/cards/card-tomato-green-zebra.png"': '"/packets/kokopelli/packet-tomato-green-zebra.png"',
    '"/cards/card-eggplant-long.png"': '"/packets/kokopelli/packet-eggplant-long-violette.png"',
    '"/cards/card-squash-butternut.png"': '"/packets/kokopelli/packet-squash-butternut-coco.png"',
    '"/cards/card-carrot-robver.png"': '"/packets/lebiau/packet-carrot-robver.png"',
    '"/cards/card-lettuce-chene.png"': '"/packets/lebiau/packet-lettuce-chene.png"',
    '"/cards/card-bean-coco.png"': '"/packets/lebiau/packet-bean-coco.png"',
    '"/cards/card-cabbage-milan.png"': '"/packets/lebiau/packet-cabbage-milan.png"',
    '"/cards/card-basil-marseillais.png"': '"/packets/sainte-marthe/packet-basil-marseillais.png"',
    '"/cards/card-strawberry-ciflorette.png"': '"/packets/sainte-marthe/packet-strawberry-ciflorette.png"',
    '"/cards/card-apple-golden.png"': '"/packets/guignard/packet-apple-golden.png"',
    '"/cards/card-apple-gala.png"': '"/packets/guignard/packet-apple-gala.png"',
    '"/cards/card-pear-williams.png"': '"/packets/guignard/packet-pear-williams.png"',
    '"/cards/card-cherry-bing.png"': '"/packets/inrae/packet-cherry-bing.png"',
    '"/cards/card-walnut-franquette.png"': '"/packets/inrae/packet-walnut-franquette.png"',
}

def main():
    filepath = "src/store/game-store.ts"
    
    if not os.path.exists(filepath):
        print("❌ Fichier non trouvé :", filepath)
        print("   Assure-toi d'exécuter ce script depuis C:\\Users\\Administrateur\\Desktop\\BotanIA")
        return
    
    print("🔧 CORRECTION AUTOMATIQUE DE game-store.ts\n")
    print("=" * 60)
    
    # Lire le fichier
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Backup
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = f"{filepath}.backup-{timestamp}"
    with open(backup_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n✅ Backup créé : {backup_path}")
    
    # Appliquer les corrections d'IDs
    print(f"\n📝 Correction des IDs...")
    id_count = 0
    for old_id, new_id in ID_FIXES.items():
        if old_id in content:
            content = content.replace(old_id, new_id)
            id_count += 1
            print(f"   ✅ {old_id} → {new_id}")
    
    # Appliquer les corrections d'images
    print(f"\n🖼️  Correction des chemins d'images...")
    img_count = 0
    for old_path, new_path in IMAGE_FIXES.items():
        if old_path in content:
            content = content.replace(old_path, new_path)
            img_count += 1
            print(f"   ✅ {old_path} → {new_path}")
    
    # Sauvegarder le fichier corrigé
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("\n" + "=" * 60)
    print(f"\n✅ CORRECTIONS APPLIQUÉES AVEC SUCCÈS !")
    print(f"   - {id_count} IDs corrigés")
    print(f"   - {img_count} chemins d'images corrigés")
    print(f"\n🚀 Relance maintenant : npm run dev")
    print(f"\n🆘 En cas de problème, restaure le backup :")
    print(f"   copy {backup_path} {filepath}")

if __name__ == "__main__":
    main()
