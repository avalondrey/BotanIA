const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const CARDS_DIR = path.join(__dirname, 'public', 'cards');

// Ensure directory exists
if (!fs.existsSync(CARDS_DIR)) {
  fs.mkdirSync(CARDS_DIR, { recursive: true });
}

const cards = [
  // Seed shops
  { file: "card-shop-guignard.png", bg: "#d1fae5", emoji: "🌳", text: "Guignard" },
  { file: "card-shop-inrae.png", bg: "#dbeafe", emoji: "🔬", text: "INRAE" },
  { file: "card-shop-kokopelli.png", bg: "#d1fae5", emoji: "🌱", text: "Kokopelli" },
  { file: "card-shop-lebiau.png", bg: "#fed7aa", emoji: "🌿", text: "Le Biau Germe" },
  { file: "card-shop-vilmorin.png", bg: "#fee2e2", emoji: "🌱", text: "Vilmorin" },
  { file: "card-shop-clause.png", bg: "#fce7f3", emoji: "🌺", text: "Clause" },
  { file: "card-shop-sainte-marthe.png", bg: "#fed7aa", emoji: "🏠", text: "Sainte Marthe" },
  { file: "card-shop-pepinieres-bordas.png", bg: "#d1fae5", emoji: "🌲", text: "Pépinières Bordas" },
  { file: "card-shop-arbres-tissot.png", bg: "#d1fae5", emoji: "🌴", text: "Arbres Tissot" },
  { file: "card-shop-fruitiers-forest.png", bg: "#fecdd3", emoji: "🍎", text: "Fruitiers Forest" },

  // Tomato varieties
  { file: "card-tomato-cherokee.png", bg: "#fee2e2", emoji: "🍅", text: "Cherokee" },
  { file: "card-tomato-rosedeberne.png", bg: "#fce7f3", emoji: "🍅", text: "Rose de Berne" },
  { file: "card-tomato-marmade.png", bg: "#fee2e2", emoji: "🍅", text: "Marmande" },
  { file: "card-tomato-blackk.png", bg: "#1f2937", emoji: "🍅", text: "Noire de Crimée" },
  { file: "card-tomato-green-zebra.png", bg: "#d1fae5", emoji: "🍅", text: "Green Zebra" },

  // Carrot varieties
  { file: "card-carrot-guerande.png", bg: "#fed7aa", emoji: "🥕", text: "Grosse de Guérande" },
  { file: "card-carrot-nantaise.png", bg: "#fed7aa", emoji: "🥕", text: "Nantaise" },
  { file: "card-carrot-robver.png", bg: "#fed7aa", emoji: "🥕", text: "Rob Ver" },

  // Basil varieties
  { file: "card-basil-genoveois.png", bg: "#d1fae5", emoji: "🌿", text: "Génovéois" },
  { file: "card-basil-marseillais.png", bg: "#d1fae5", emoji: "🌿", text: "Marseillais" },

  // Pepper varieties
  { file: "card-pepper-doux-france.png", bg: "#fee2e2", emoji: "🌶️", text: "Doux d'Espagne" },
  { file: "card-pepper-california.png", bg: "#fef3c7", emoji: "🌶️", text: "California Wonder" },

  // Lettuce varieties
  { file: "card-lettuce-batavia.png", bg: "#d1fae5", emoji: "🥬", text: "Batavia" },
  { file: "card-lettuce-chene.png", bg: "#d1fae5", emoji: "🥬", text: "Feuille de Chêne" },

  // Cucumber/Zucchini
  { file: "card-cucumber-marketer.png", bg: "#d1fae5", emoji: "🥒", text: "Marketer" },
  { file: "card-zucchini-black.png", bg: "#1f2937", emoji: "🥒", text: "Black Beauty" },

  // Eggplant
  { file: "card-eggplant-long.png", bg: "#ede9fe", emoji: "🍆", text: "Long" },

  // Squash varieties
  { file: "card-squash-butternut.png", bg: "#fed7aa", emoji: "🎃", text: "Butternut" },

  // Bean varieties
  { file: "card-bean-coco.png", bg: "#d1fae5", emoji: "🫘", text: "Coco" },

  // Cabbage varieties
  { file: "card-cabbage-milan.png", bg: "#d1fae5", emoji: "🥬", text: "Milan" },

  // Strawberry varieties
  { file: "card-strawberry-ciflorette.png", bg: "#fecdd3", emoji: "🍓", text: "Ciflorette" },

  // Fruit trees
  { file: "card-apple-golden.png", bg: "#fef3c7", emoji: "🍎", text: "Golden" },
  { file: "card-apple-gala.png", bg: "#fee2e2", emoji: "🍎", text: "Gala" },
  { file: "card-pear-williams.png", bg: "#d1fae5", emoji: "🍐", text: "Williams" },
  { file: "card-cherry-bing.png", bg: "#fecdd3", emoji: "🍒", text: "Bing" },

  // Walnut
  { file: "card-walnut-franquette.png", bg: "#d1fae5", emoji: "🌰", text: "Franquette" },
];

function generateCard(card) {
  const { file, bg, emoji, text } = card;
  const filepath = path.join(CARDS_DIR, file);

  if (fs.existsSync(filepath)) {
    console.log(`Skipping ${file} (exists)`);
    return;
  }

  const width = 400;
  const height = 300;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  // Emoji (large, centered)
  ctx.font = '80px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, width / 2, height / 2 - 20);

  // Text below emoji
  ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#1f2937';
  ctx.fillText(text, width / 2, height / 2 + 60);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`Created ${file}`);
}

console.log('Generating card images...');
cards.forEach(generateCard);
console.log('Done!');
