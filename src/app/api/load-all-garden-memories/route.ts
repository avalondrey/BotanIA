import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'garden-memory');

export async function GET(_req: NextRequest) {
  try {
    let files: string[] = [];
    try {
      files = await readdir(MEMORY_DIR);
    } catch {
      return NextResponse.json({ files: [] });
    }

    const mdFiles = files.filter(f => f.endsWith('.md'));
    const results = await Promise.all(
      mdFiles.map(async (file) => {
        const content = await readFile(path.join(MEMORY_DIR, file), 'utf-8');
        const plantId = file.replace('.md', '');
        return { plantId, content };
      })
    );

    return NextResponse.json({ files: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
