/**
 * API: GET /api/analyze-hologram
 * Returns the content of HologramEvolution.tsx and CARD_DATA for Lia to analyze
 */

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const base = path.join(process.cwd(), 'src');

    // Read HologramEvolution
    const holoPath = path.join(base, 'components', 'game', 'HologramEvolution.tsx');
    const holoContent = await readFile(holoPath, 'utf-8');

    // Read a sample of seed data files (first 5 to get an overview)
    const dataDir = path.join(base, 'data', 'graines');
    let seedSummary = '';

    try {
      const { readdir } = await import('fs/promises');
      const entries = await readdir(dataDir, { withFileTypes: true });
      const seedFiles: string[] = [];

      for (const entry of entries.slice(0, 3)) {
        if (entry.isDirectory()) {
          const subDir = path.join(dataDir, entry.name);
          const files = await readdir(subDir);
          for (const f of files.slice(0, 2)) {
            if (f.endsWith('.ts')) {
              seedFiles.push(path.join(subDir, f));
            }
          }
        }
      }

      const seedContents = await Promise.all(
        seedFiles.map(f => readFile(f, 'utf-8').catch(() => ''))
      );
      seedSummary = seedContents.join('\n\n--- FILE ---\n\n');
    } catch {
      seedSummary = '(no seed files found)';
    }

    return NextResponse.json({
      hologramContent: holoContent,
      seedSummary,
      note: 'Lia can now analyze: 1) PLANT_CARDS in HologramEvolution.tsx, 2) seed data files for missing integrations',
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
