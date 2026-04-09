/**
 * POST /api/agent/scan
 * Triggers a full rescan of all BotanIA source files into Qdrant
 */

import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { scanAndIndex, getFilesToScan } from '@/lib/agent/code-scanner';
import { ensureCollections } from '@/lib/agent/qdrant';

const PROJECT_ROOT = join(process.cwd(), 'src');

export async function POST() {
  try {
    // Ensure collections exist
    await ensureCollections();

    // Get list of files to scan
    const filesToScan = getFilesToScan();
    const results: { file: string; status: 'ok' | 'error'; error?: string }[] = [];

    // Scan each file
    for (const filePath of filesToScan) {
      try {
        const fullPath = join(process.cwd(), filePath);
        const content = await readFile(fullPath, 'utf-8');
        await scanAndIndex(filePath, content);
        results.push({ file: filePath, status: 'ok' });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        // File might not exist or be readable, skip it
        if (!error.includes('ENOENT')) {
          results.push({ file: filePath, status: 'error', error });
        }
      }
    }

    const okCount = results.filter(r => r.status === 'ok').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      scanned: okCount,
      errors: errorCount,
      results,
      timestamp: Date.now(),
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

export async function GET() {
  // Also expose a way to get scan status
  const filesToScan = getFilesToScan();
  return NextResponse.json({
    totalFiles: filesToScan.length,
    files: filesToScan,
    timestamp: Date.now(),
  });
}
