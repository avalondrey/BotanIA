/**
 * Organise les images dans les bons dossiers
 * NE SUPPRIME JAMAIS les images originales
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC = path.join(process.cwd(), 'public', 'cards');
const PACKETS = path.join(process.cwd(), 'public', 'packets');
const POTS = path.join(process.cwd(), 'public', 'pots');
const SHOPS = path.join(process.cwd(), 'public', 'shops');
const PLANTS = path.join(process.cwd(), 'public', 'plants');

// Créer les dossiers
[PACKETS, POTS, SHOPS, PLANTS].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
});

// Liste des images et leur catégorie
const CATEGORIES = {
  // 📦 Paquets de graines (graines sous forme de paquets - format Anéas)
  packets: [
    'card-tomato.png',
    'card-tomato-aneas.png',
    'card-tomato-cocktail.png',
    'card-seeds-tomato.png',
    'card-carrot.png',
    'card-lettuce.png',
    'card-strawberry.png',
    'card-basil.png',
    'card-pepper.png',
    'card-tomato-evolution.png',
  ],
  // 🪴 Pots de plantules (godets)
  pots: [
    'card-kokopelli.png',
    'card-kokopelli-semences-fr.png',
  ],
  // 🏪 Logos boutiques
  shops: [
    'card-shop-vilmorin.png',
    'card-shop-clause.png',
  ],
  // 🌿 Images de plantes (plantes dans le jardin)
  plants: [
    'card-chambre-large.png',
    'card-chambre-medium.png',
    'card-chambre-small.png',
    'card-mini-serre.png',
    'card-planter.png',
  ],
};

// Copier les images (ne pas supprimer l'original)
for (const [category, files] of Object.entries(CATEGORIES)) {
  const destDir = {
    packets: PACKETS,
    pots: POTS,
    shops: SHOPS,
    plants: PLANTS,
  }[category];

  for (const file of files) {
    const srcPath = path.join(SRC, file);
    const destPath = path.join(destDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✅ ${file} -> ${category}/`);
    } else {
      console.log(`  ⚠️  ${file} NOT FOUND`);
    }
  }
}

console.log('\n✅ Organisation terminée!');
console.log('\n📋 Résumé:');
console.log(`  📦 Paquets de graines: ${fs.readdirSync(PACKETS).length} images`);
console.log(`  🪴 Pots de plantules: ${fs.readdirSync(POTS).length} images`);
console.log(`  🏪 Logos boutiques: ${fs.readdirSync(SHOPS).length} images`);
console.log(`  🌿 Images plantes/chambres: ${fs.readdirSync(PLANTS).length} images`);
console.log(`  🎴 Cards originales: ${fs.readdirSync(SRC).length} images (NON MODIFIÉES)`);
