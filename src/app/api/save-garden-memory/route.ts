import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'garden-memory');

export async function POST(req: NextRequest) {
  try {
    const { filePath, content } = await req.json();
    // Extract just the filename from the full path
    const fileName = filePath.split('/').pop() || 'memory.md';
    const fullPath = path.join(MEMORY_DIR, fileName);

    // Ensure directory exists
    if (!existsSync(MEMORY_DIR)) {
      await mkdir(MEMORY_DIR, { recursive: true });
    }

    await writeFile(fullPath, content, 'utf-8');
    return NextResponse.json({ success: true, path: fullPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
