const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SW_FILE = path.join(PUBLIC_DIR, 'sw.js');

function listFiles(dir, prefix = '') {
  const results: string[] = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...listFiles(fullPath, path.join(prefix, item)));
    } else {
      results.push('/' + path.join(prefix, item).replace(/\\/g, '/'));
    }
  }
  return results;
}

function main() {
  const cards = listFiles(path.join(PUBLIC_DIR, 'cards'), 'cards');
  const packets = listFiles(path.join(PUBLIC_DIR, 'packets'), 'packets');
  const plants = listFiles(path.join(PUBLIC_DIR, 'plants'), 'plants');
  const plantules = listFiles(path.join(PUBLIC_DIR, 'plantules'), 'plantules');

  // Fichiers critiques à precache (images du jeu)
  const criticalAssets = [...cards, ...packets, ...plants, ...plantules];

  // On garde aussi les anciens éléments statiques (/, offline.html, etc.)
  const staticBase = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/favicon.ico',
    '/logo.svg',
  ];

  const precacheUrls = [...staticBase, ...criticalAssets];

  let swContent = fs.readFileSync(SW_FILE, 'utf-8');

  // Remplace la section PRECACHE_URLS
  const newPrecache = `const PRECACHE_URLS = [\n${precacheUrls.map(u => `  '${u}',`).join('\n')}\n];`;

  swContent = swContent.replace(
    /const PRECACHE_URLS = \[[\s\S]*?\];/,
    newPrecache
  );

  fs.writeFileSync(SW_FILE, swContent);
  console.log(`Updated sw.js with ${precacheUrls.length} precache URLs`);
}

main();
