/**
 * Markdown Ingester — BotanIA Agent
 *
 * Parses all .md files in the project and indexes them into Qdrant.
 * Supports both documentation files and data markdown files.
 */

import { generateEmbedding } from './ollama';
import { upsertPoint } from './qdrant';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScannedMarkdown {
  path: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  summary: string;
  lastModified: number;
}

// ─── Category detection ──────────────────────────────────────────────────────

function detectCategory(path: string, content: string): string {
  const pathLower = path.toLowerCase();

  if (pathLower.includes('architecture') || pathLower.includes('architecture_botan')) {
    return 'architecture';
  }
  if (pathLower.includes('data') || pathLower.includes('plants_catalog') || pathLower.includes('plant_varietie')) {
    return 'data';
  }
  if (pathLower.includes('procedure') || pathLower.includes('process')) {
    return 'procedure';
  }
  if (pathLower.includes('integration') || pathLower.includes('plan')) {
    return 'integration';
  }
  if (pathLower.includes('botany') || pathLower.includes('concept')) {
    return 'concept';
  }
  if (pathLower.includes('ecological') || pathLower.includes('gesture')) {
    return 'ecologie';
  }
  if (pathLower.includes('pollinator') || pathLower.includes('disease')) {
    return 'science';
  }
  if (pathLower.includes('readme') || pathLower.includes('doc')) {
    return 'documentation';
  }

  return 'general';
}

// ─── Tag extraction ─────────────────────────────────────────────────────────

function extractTags(content: string): string[] {
  const tags: string[] = [];

  // Look for known keywords
  const tagPatterns = [
    /\b(gdd|GDD|degree days|degree-days)\b/gi,
    /\b(eau|arrosage|irrigation)\b/gi,
    /\b(compagnonnage|companion)\b/gi,
    /\b(maladie|disease|mildiou|oidium)\b/gi,
    /\b(récolte|harvest)\b/gi,
    /\b(semis|sowing|semence)\b/gi,
    /\b(sol|soil|ph)\b/gi,
    /\b(climat|weather|meteo)\b/gi,
    /\b(INRAE|FAO|GNIS)\b/gi,
    /\b(graine|seed|variété|variety)\b/gi,
    /\b(serre|greenhouse)\b/gi,
    /\b(permaculture|bio|organic)\b/gi,
  ];

  const tagLabels: Record<number, string> = {
    0: 'GDD',
    1: 'Eau',
    2: 'Compagnonnage',
    3: 'Maladie',
    4: 'Récolte',
    5: 'Semis',
    6: 'Sol',
    7: 'Climat',
    8: 'Sources_officielles',
    9: 'Graine',
    10: 'Serre',
    11: 'Permaculture',
  };

  tagPatterns.forEach((pattern, i) => {
    if (pattern.test(content)) {
      tags.push(tagLabels[i]);
    }
  });

  return [...new Set(tags)];
}

// ─── Summary generation (simple) ─────────────────────────────────────────────

function generateSummary(content: string, title: string): string {
  // Remove markdown syntax
  const plain = content
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\n+/g, ' ')
    .trim();

  // Take first 300 chars
  const summary = plain.slice(0, 300);

  return summary.length < plain.length ? `${summary}...` : summary;
}

// ─── Title extraction ───────────────────────────────────────────────────────

function extractTitle(content: string, filename: string): string {
  // First # heading
  const headingMatch = content.match(/^#\s+(.+)/m);
  if (headingMatch) return headingMatch[1].trim();

  // Fallback to filename
  return filename.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
}

// ─── Main ingest function ───────────────────────────────────────────────────

export async function ingestMarkdown(
  path: string,
  content: string
): Promise<ScannedMarkdown> {
  const title = extractTitle(content, path.split('/').pop() || path);
  const category = detectCategory(path, content);
  const tags = extractTags(content);
  const summary = generateSummary(content, title);
  const lastModified = Date.now();

  const scanned: ScannedMarkdown = {
    path,
    title,
    category,
    tags,
    content, // full content for embedding
    summary,
    lastModified,
  };

  // Generate embedding
  const searchableText = buildSearchableText(scanned);
  const vector = await generateEmbedding(searchableText);

  // Upsert to Qdrant
  await upsertPoint('botania_docs', path, vector, {
    path: scanned.path,
    title: scanned.title,
    category: scanned.category,
    tags: scanned.tags,
    summary: scanned.summary,
    content_preview: scanned.content.slice(0, 500),
    lastModified: scanned.lastModified,
  });

  return scanned;
}

/**
 * Build searchable text from scanned markdown
 */
function buildSearchableText(s: ScannedMarkdown): string {
  const parts: string[] = [];

  parts.push(s.title);
  parts.push(s.summary);
  parts.push(...s.tags);
  parts.push(`Catégorie: ${s.category}`);
  parts.push(s.content.slice(0, 2000)); // First 2000 chars of content

  return parts.join('\n');
}

/**
 * Ingest all markdown files from a list of paths
 */
export async function ingestAllMarkdown(
  files: { path: string; content: string }[]
): Promise<{ ok: number; errors: number; results: ScannedMarkdown[] }> {
  const results: ScannedMarkdown[] = [];
  let ok = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const scanned = await ingestMarkdown(file.path, file.content);
      results.push(scanned);
      ok++;
    } catch (err) {
      console.error(`[MarkdownIngester] Failed to ingest ${file.path}:`, err);
      errors++;
    }
  }

  return { ok, errors, results };
}
