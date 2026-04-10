/**
 * POST /api/agent/index-docs
 * Indexes all markdown files from src/data into Qdrant
 */

import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { ingestAllMarkdown } from '@/lib/agent/markdown-ingester';

const DATA_DIR = join(process.cwd(), 'src', 'data');

async function getMarkdownFiles(dir: string, baseDir: string = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = join(baseDir, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await getMarkdownFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.md')) {
      files.push(relativePath);
    }
  }

  return files;
}

export async function POST() {
  try {
    // Get all markdown files in src/data
    const mdFiles = await getMarkdownFiles(DATA_DIR);
    const results: { path: string; status: 'ok' | 'error'; error?: string }[] = [];

    for (const relativePath of mdFiles) {
      try {
        const fullPath = join(DATA_DIR, relativePath);
        const content = await readFile(fullPath, 'utf-8');
        results.push({ path: relativePath, status: 'ok' });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        results.push({ path: relativePath, status: 'error', error });
      }
    }

    // Read and ingest all files
    const filesToIndex: { path: string; content: string }[] = [];
    for (const result of results) {
      if (result.status === 'ok') {
        const fullPath = join(DATA_DIR, result.path);
        const content = await readFile(fullPath, 'utf-8');
        filesToIndex.push({ path: `src/data/${result.path.replace(/\\/g, '/')}`, content });
      }
    }

    const ingestResult = await ingestAllMarkdown(filesToIndex);

    return NextResponse.json({
      success: true,
      found: mdFiles.length,
      indexed: ingestResult.ok,
      errors: ingestResult.errors,
      results: ingestResult.results.map(r => ({ path: r.path, title: r.title, category: r.category })),
      timestamp: Date.now(),
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const mdFiles = await getMarkdownFiles(DATA_DIR);
    return NextResponse.json({
      total: mdFiles.length,
      files: mdFiles,
      timestamp: Date.now(),
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}
