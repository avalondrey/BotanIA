// fix-encoding.js — Place this in your project root, run: node fix-encoding.js
const fs = require('fs');
const path = require('path');

// Double-encoding map: UTF-8 bytes interpreted as Latin-1, then re-encoded as UTF-8
const MAP = {
  '\u00C3\u00A0': '\u00E0', // à
  '\u00C3\u00A8': '\u00E8', // è
  '\u00C3\u00A9': '\u00E9', // é
  '\u00C3\u00A2': '\u00E2', // â
  '\u00C3\u00AE': '\u00EE', // î
  '\u00C3\u00B4': '\u00F4', // ô
  '\u00C3\u00BB': '\u00FB', // û
  '\u00C3\u00AA': '\u00EA', // ê
  '\u00C3\u00A7': '\u00E7', // ç
  '\u00C3\u00B9': '\u00F9', // ù
  '\u00C3\u00A4': '\u00E4', // ä
  '\u00C3\u00AB': '\u00EB', // ë
  '\u00C3\u00AF': '\u00EF', // ï
  '\u00C3\u00BC': '\u00FC', // ü
  '\u00C3\u00A3': '\u00E3', // ã
  '\u00C3\u00B5': '\u00F5', // õ
  '\u00C3\u00BD': '\u00FD', // ý
  '\u00C3\u00BF': '\u00FF', // ÿ
  '\u00C3\u00B1': '\u00F1', // ñ
  '\u00C3\u00B2': '\u00F2', // ò
  '\u00C3\u0080': '\u00C0', // À
  '\u00C3\u0088': '\u00C8', // È
  '\u00C3\u0089': '\u00C9', // É
  '\u00C3\u0082': '\u00C2', // Â
  '\u00C3\u008E': '\u00CE', // Î
  '\u00C3\u0094': '\u00D4', // Ô
  '\u00C3\u009C': '\u00DC', // Ü
  '\u00C3\u0093': '\u00D3', // Ó
};

function fix(text) {
  // Sort keys longest first, build regex
  const keys = Object.keys(MAP).sort((a, b) => b.length - a.length);
  const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(escaped.join('|'), 'g');
  return text.replace(re, m => MAP[m]);
}

const SKIP = new Set(['node_modules', '.next', '.git', 'out', '.vercel']);
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

function walk(dir, cb) {
  for (const item of fs.readdirSync(dir)) {
    const fp = path.join(dir, item);
    if (fs.statSync(fp).isDirectory()) {
      if (SKIP.has(item)) continue;
      walk(fp, cb);
    } else if (EXT.has(path.extname(item))) {
      cb(fp);
    }
  }
}

const root = __dirname;
let checked = 0, fixed = 0;

walk(path.join(root, 'src'), fp => {
  checked++;
  const raw = fs.readFileSync(fp, 'utf8');
  const result = fix(raw);
  if (result !== raw) {
    fs.writeFileSync(fp, result, 'utf8');
    fixed++;
    console.log('  FIXED ' + path.relative(root, fp));
  }
});

console.log(`\nDone! Checked: ${checked} | Fixed: ${fixed}`);