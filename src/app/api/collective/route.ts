import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const COLLECTIVE_DIR = path.join(process.cwd(), 'data', 'collective');
const FILE_PATH = (region: string) => path.join(COLLECTIVE_DIR, `${region}.json`);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get('region') || 'unknown';
    const filePath = FILE_PATH(region);

    if (!existsSync(filePath)) {
      return NextResponse.json({ stats: null });
    }

    const content = await readFile(filePath, 'utf-8');
    const stats = JSON.parse(content);
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, submission } = await req.json();

    if (action === 'contribute') {
      const { plantId, avgDaysToMaturity, avgYield, seasonCount, region } = submission;

      if (!existsSync(COLLECTIVE_DIR)) {
        await mkdir(COLLECTIVE_DIR, { recursive: true });
      }

      const filePath = FILE_PATH(region);
      let existing: any = {};

      if (existsSync(filePath)) {
        const content = await readFile(filePath, 'utf-8');
        existing = JSON.parse(content);
      }

      // Merge with weighted average
      const key = plantId.toLowerCase();
      if (!existing.plants) existing = { region, plants: {}, updatedAt: new Date().toISOString() };
      if (!existing.plants[key]) {
        existing.plants[key] = { avgDaysToMaturity, harvestCount: 0, avgYield: 0 };
      }

      const current = existing.plants[key];
      const totalCount = current.harvestCount + seasonCount;
      current.avgDaysToMaturity = totalCount > 0
        ? Math.round((current.avgDaysToMaturity * current.harvestCount + avgDaysToMaturity * seasonCount) / totalCount)
        : avgDaysToMaturity;
      current.avgYield = totalCount > 0
        ? Math.round(((current.avgYield * current.harvestCount + avgYield * seasonCount) / totalCount) * 100) / 100
        : avgYield;
      current.harvestCount = totalCount;
      existing.updatedAt = new Date().toISOString();

      await writeFile(filePath, JSON.stringify(existing, null, 2), 'utf-8');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
