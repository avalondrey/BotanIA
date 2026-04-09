/**
 * POST /api/agent/index-file
 * Indexes a single file into Qdrant
 */

import { NextRequest, NextResponse } from 'next/server';
import { scanAndIndex } from '@/lib/agent/code-scanner';
import { ingestMarkdown } from '@/lib/agent/markdown-ingester';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, content, type } = body;

    if (!path || !content) {
      return NextResponse.json({ error: 'path and content are required' }, { status: 400 });
    }

    if (type === 'markdown' || path.endsWith('.md')) {
      const scanned = await ingestMarkdown(path, content);
      return NextResponse.json({ success: true, type: 'markdown', scanned: { title: scanned.title, category: scanned.category } });
    } else if (type === 'tsx' || type === 'ts' || path.endsWith('.tsx') || path.endsWith('.ts')) {
      await scanAndIndex(path, content);
      return NextResponse.json({ success: true, type: 'code' });
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}
