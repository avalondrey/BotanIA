/**
 * API: POST /api/agent/update-plant
 * Update plant displayName in catalog.ts
 * Request: { plantDefId: string, displayName: string }
 * Response: { success: boolean, message: string }
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const CATALOG_PATH = path.join(process.cwd(), 'src/store/catalog.ts');

export async function POST(request: Request) {
  try {
    const { plantDefId, displayName } = await request.json();

    if (!plantDefId || !displayName) {
      return new Response(JSON.stringify({ success: false, error: 'plantDefId et displayName requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const content = await readFile(CATALOG_PATH, 'utf-8');

    // Find the SEED_VARIETIES entry for this plantDefId and update its displayName
    // Pattern: plantDefId: "xxx" ... displayName: "OLD_NAME"
    const escapedId = plantDefId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(plantDefId:\\s*['"]${escapedId}['"][\\s\\S]*?displayName:\\s*['"])[^"']*(['"])`);
    const match = pattern.exec(content);

    if (!match) {
      return new Response(JSON.stringify({ success: false, error: `Entrée introuvable pour '${plantDefId}' dans SEED_VARIETIES` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const newContent = content.slice(0, match.index + match[1].length) + displayName + content.slice(match.index + match[0].length - 1);

    await writeFile(CATALOG_PATH, newContent, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      message: `Nom '${plantDefId}' mis à jour → "${displayName}"`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
