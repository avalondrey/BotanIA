/**
 * POST /api/agent/register-image
 * Register (copy/move) an image to the correct public/ location
 * Request (multipart/form-data OR JSON):
 *   - file: File (multipart upload)
 *   - sourcePath: string (path to existing file)
 *   - expectedPath: string (e.g. "/plants/tomato-stage-3.png")
 * Response: { success: boolean, path: string, message: string }
 *
 * DELETE /api/agent/register-image
 * Remove a registered image
 * Request JSON: { expectedPath: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, unlink, copyFile, mkdir } from 'fs/promises';
import path from 'path';

const PUBLIC_ROOT = path.join(process.cwd(), 'public');

function computeTargetPath(expectedPath: string): string {
  // Remove leading slash and go to public/
  const relative = expectedPath.replace(/^\//, '');
  return path.join(PUBLIC_ROOT, relative);
}

async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(path.dirname(dirPath), { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let expectedPath: string;
    let sourceBuffer: Buffer | null = null;
    let sourcePath: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      expectedPath = formData.get('expectedPath') as string;
      sourcePath = formData.get('sourcePath') as string;

      if (!expectedPath) {
        return NextResponse.json({ error: 'expectedPath requis' }, { status: 400 });
      }

      if (file) {
        sourceBuffer = Buffer.from(await file.arrayBuffer());
      } else if (sourcePath) {
        sourceBuffer = await readFile(sourcePath);
      } else {
        return NextResponse.json({ error: 'file ou sourcePath requis' }, { status: 400 });
      }
    } else {
      const body = await req.json();
      expectedPath = body.expectedPath;
      sourcePath = body.sourcePath;

      if (!expectedPath) {
        return NextResponse.json({ error: 'expectedPath requis' }, { status: 400 });
      }
      if (!sourcePath) {
        return NextResponse.json({ error: 'sourcePath requis (pour POST JSON)' }, { status: 400 });
      }
      sourceBuffer = await readFile(sourcePath);
    }

    const targetPath = computeTargetPath(expectedPath);
    await ensureDir(targetPath);

    if (sourceBuffer) {
      await writeFile(targetPath, sourceBuffer);
    } else if (sourcePath) {
      await copyFile(sourcePath, targetPath);
    }

    return NextResponse.json({
      success: true,
      path: `/${expectedPath.replace(/^\//, '')}`,
      message: `Image enregistrée: ${path.basename(targetPath)}`,
    });
  } catch (err: any) {
    console.error('[register-image] Error:', err);
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { expectedPath } = body;

    if (!expectedPath) {
      return NextResponse.json({ error: 'expectedPath requis' }, { status: 400 });
    }

    const targetPath = computeTargetPath(expectedPath);
    await unlink(targetPath);

    return NextResponse.json({
      success: true,
      message: `Image supprimée: ${path.basename(targetPath)}`,
    });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ success: false, error: 'Fichier introuvable' }, { status: 404 });
    }
    console.error('[register-image DELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}