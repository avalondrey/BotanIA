/**
 * API: POST /api/agent/validate-plants
 * Validate and write PLANTS entry code to ai-engine.ts
 * Request: { plantDefId: string, code: string }
 * Response: { success: boolean, message: string }
 */

import { readFile } from 'fs/promises';
import path from 'path';

const AI_ENGINE_PATH = () => path.join(process.cwd(), 'src/lib/ai-engine.ts');

function authFail() {
  return new Response(JSON.stringify({ success: false, error: 'Non autorisé' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function POST(request: Request) {
  try {
    const authSecret = process.env.VALIDATE_PLANT_SECRET;
    if (authSecret) {
      const providedToken = request.headers.get('x-api-token') || new URL(request.url).searchParams.get('token');
      if (!providedToken || providedToken !== authSecret) {
        return authFail();
      }
    }

    const { plantDefId, code } = await request.json();

    if (!plantDefId || !code) {
      return new Response(JSON.stringify({ success: false, error: 'plantDefId et code requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Backup first
    try {
      const content = await readFile(AI_ENGINE_PATH(), 'utf-8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await import('fs/promises').then(fs => fs.writeFile(
        `${AI_ENGINE_PATH()}.backup-${timestamp}`,
        `// BACKUP ${timestamp}\n${content}`,
        'utf-8'
      ));
    } catch {}

    const content = await readFile(AI_ENGINE_PATH(), 'utf-8');

    // Check if already exists
    const exists = content.includes(`'${plantDefId}':`) ||
                   content.includes(`"${plantDefId}":`) ||
                   content.includes(`${plantDefId}: {`) ||
                   content.includes(`${plantDefId}:\n`) ||
                   content.includes(`${plantDefId}: `);
    if (exists) {
      return new Response(JSON.stringify({
        success: false,
        error: `L'entrée '${plantDefId}' existe déjà dans ai-engine.ts`,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Clean the code - remove the comment line
    const cleanCode = code.trim().replace(/^\s*\/\/.*──.*──\s*\n?/m, '');

    // Find the PLANTS object end: "};\n\nexport const STAGE_NAMES"
    // The PLANTS object ends with "};" followed by "\nexport const STAGE_NAMES"
    const marker = 'export const STAGE_NAMES';
    const markerIndex = content.indexOf(marker);
    if (markerIndex === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Marqueur STAGE_NAMES non trouvé dans ai-engine.ts',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Find the "};\n" just before the marker
    const beforeMarker = content.slice(0, markerIndex);
    const endPattern = '};\n';
    const endIdx = beforeMarker.lastIndexOf(endPattern);

    if (endIdx === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Structure de fin PLANTS non trouvée',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Insert at endIdx (before the '}' of '};')
    const newContent = content.slice(0, endIdx) + cleanCode + '\n' + content.slice(endIdx);

    // Write back
    await import('fs/promises').then(fs => fs.writeFile(AI_ENGINE_PATH(), newContent, 'utf-8'));

    // Verify write succeeded (with retry for HMR cache invalidation)
    let wroteOK = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        // Wait for HMR cache to settle
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
      try {
        const verifyContent = await readFile(AI_ENGINE_PATH(), 'utf-8');
        wroteOK =
          verifyContent.includes(`'${plantDefId}':`) ||
          verifyContent.includes(`"${plantDefId}":`) ||
          verifyContent.includes(`${plantDefId}: {`) ||
          verifyContent.includes(`${plantDefId}:\n`) ||
          verifyContent.includes(`${plantDefId}: `);
        if (wroteOK) break;
      } catch {}
    }

    if (!wroteOK) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Écriture vérifiée échouée — la plante est absente du fichier après 3 tentatives. Le HMR de Next.js a probablement invalidé le cache. Réessaie dans 5 secondes.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Entrée PLANTS '${plantDefId}' ajoutée à ai-engine.ts`,
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
