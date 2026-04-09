import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'garden-memory');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get('plantId');
    if (!plantId) return NextResponse.json({ error: 'plantId required' }, { status: 400 });

    const filePath = path.join(MEMORY_DIR, `${plantId}.md`);
    try {
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({ content, plantId });
    } catch {
      return NextResponse.json({ content: null, plantId });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
