#!/usr/bin/env npx tsx
/**
 * Script de nettoyage de HologramEvolution.tsx
 * - Supprime les entrées dupliquées avec clés quotées ('tomato': {)
 *   qui sont des doublons d'entrées avec clés non quotées (tomato: {
 */

import * as fs from 'fs';
import * as path from 'path';

const HOLO_PATH = path.join(__dirname, '../src/components/game/HologramEvolution.tsx');

interface DuplicateEntry {
  quotedKey: string;
  lineStart: number;
  lineEnd: number;
  blockContent: string;
}

function findDuplicateEntries(content: string): DuplicateEntry[] {
  const duplicates: DuplicateEntry[] = [];

  // Trouver les entrées avec clés quotées qui existent aussi avec clé non quotée
  // Pattern: 'tomato': { au début d'une ligne
  const quotedEntryRegex = /\n('([a-z][a-z0-9-]+)':\s*\{)/g;

  let match;
  while ((match = quotedEntryRegex.exec(content)) !== null) {
    const quotedKey = match[2];
    const lineStart = content.substring(0, match.index).split('\n').length;

    // Vérifier si une entrée non quotée existe pour cette clé
    const unquotedPattern = new RegExp(`\\n\\s*${quotedKey}:\\s*\\{`);
    const hasUnquoted = unquotedPattern.test(content);

    if (hasUnquoted) {
      // Trouver où se termine le bloc quoted
      const blockStart = match.index + match[0].length;
      let braceCount = 0;
      let blockEnd = blockStart;

      for (let i = blockStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            blockEnd = i + 1;
            break;
          }
        }
        if (i - blockStart > 50000) break;
      }

      const blockContent = content.substring(blockStart, blockEnd);
      duplicates.push({
        quotedKey,
        lineStart,
        lineEnd: content.substring(0, blockEnd).split('\n').length,
        blockContent,
      });
    }
  }

  return duplicates;
}

function main() {
  console.log('🧹 Nettoyage de HologramEvolution.tsx...\n');

  if (!fs.existsSync(HOLO_PATH)) {
    console.error(`❌ Fichier non trouvé: ${HOLO_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(HOLO_PATH, 'utf-8');
  const duplicates = findDuplicateEntries(content);

  if (duplicates.length === 0) {
    console.log('✅ Aucun doublon trouvé\n');
    process.exit(0);
  }

  console.log(`⚠️ ${duplicates.length} entrée(s) dupliquée(s) avec clés quotées:\n`);
  for (const dup of duplicates) {
    console.log(`  - '${dup.quotedKey}': { (lignes ${dup.lineStart}-${dup.lineEnd})`);
  }
  console.log('');

  // Demander confirmation
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) {
    console.log('🔍 Mode dry-run: aucune modification\n');
    process.exit(0);
  }

  if (!args.includes('--fix')) {
    console.log('ℹ️  Pour supprimer les doublons, utilisez: --fix\n');
    console.log('   Pour voir les doublons sans modifier, utilisez: --dry-run\n');
    process.exit(1);
  }

  // Supprimer les doublons
  let newContent = content;
  // Traiter du dernier au premier pour ne pas décaler les lignes
  const sorted = duplicates.sort((a, b) => a.lineStart - b.lineStart);

  for (const dup of sorted.reverse()) {
    const startIdx = content.indexOf(`'${dup.quotedKey}': {`);
    if (startIdx !== -1) {
      // Trouver la fin du bloc
      const blockStart = startIdx + `'${dup.quotedKey}': {`.length;
      let braceCount = 0;
      let blockEnd = blockStart;

      for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            blockEnd = i + 1;
            break;
          }
        }
      }

      // Supprimer le bloc dupliqué (y compris le commentaire précédent s'il existe)
      const beforeBlock = content.substring(0, startIdx);
      const afterBlock = content.substring(blockEnd);

      // Retirer le whitespace vide laissé par la suppression
      newContent = beforeBlock.replace(/\n\s*$/, '') + '\n' + afterBlock.replace(/^\n/, '');
    }
  }

  fs.writeFileSync(HOLO_PATH, newContent);
  console.log(`✅ ${duplicates.length} entrée(s) dupliquée(s) supprimée(s)\n`);

  // Vérifier que le fichier est toujours valide
  console.log('🔍 Vérification TypeScript...');
  const { execSync } = require('child_process');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ TypeScript OK\n');
  } catch {
    console.log('❌ Erreur TypeScript après modification\n');
    process.exit(1);
  }
}

main();