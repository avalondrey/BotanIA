/**
 * API: POST /api/agent/validate-plantcard
 * Validate and write PlantCard code to HologramEvolution.tsx
 * Request: { plantDefId: string, code: string, token?: string }
 * Response: { success: boolean, message: string }
 */

import { readFile } from 'fs/promises';
import path from 'path';

const HOLOID_PATH = path.join(process.cwd(), 'src/components/game/HologramEvolution.tsx');

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
      const authHeader = request.headers.get('authorization');
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
      const content = await readFile(HOLOID_PATH, 'utf-8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await import('fs/promises').then(fs => fs.writeFile(
        `${HOLOID_PATH}.backup-${timestamp}`,
        `// BACKUP ${timestamp}\n${content}`,
        'utf-8'
      ));
    } catch {}

    // Read current file
    const content = await readFile(HOLOID_PATH, 'utf-8');

    // Check if already exists
    const exists = content.includes(`'${plantDefId}':`) || content.includes(`"${plantDefId}":`);
    if (exists) {
      return new Response(JSON.stringify({
        success: false,
        error: `PlantCard '${plantDefId}' existe déjà`,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Clean the code - remove the comment line (// ─── PLANTNAME ───)
    const cleanCode = code.trim().replace(/^\s*\/\/.*──.*──\s*\n?/m, '');

    // Find the marker
    const marker = '// ═══ FIN PLANT_CARDS ═══';
    const markerIndex = content.indexOf(marker);
    if (markerIndex === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Marqueur FIN PLANT_CARDS non trouvé',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // We need to insert the new PlantCard just BEFORE the closing } of PLANT_CARDS
    // The structure is: "...lastEntry},\r\n};\r\n// ═══ FIN PLANT_CARDS ═══"
    // Insert point is at endIdx (the '}' of '};')
    // So we look for "};\r\n//" or "};\r\n\r\n" before the marker
    const beforeMarker = content.slice(0, markerIndex);
    // Find "};\r\n" or "};\r\n\r\n" pattern - this is the end of the PLANT_CARDS object
    // Handle both CRLF (Windows) and LF (Unix) line endings
    const endPattern1 = '};\r\n//';
    const endPattern2 = '};\r\n\r\n';
    const endPattern3 = '};\n//';
    const endPattern4 = '};\n\n';
    let endIdx = beforeMarker.lastIndexOf(endPattern1);
    if (endIdx === -1) {
      endIdx = beforeMarker.lastIndexOf(endPattern2);
    }
    if (endIdx === -1) {
      endIdx = beforeMarker.lastIndexOf(endPattern3);
    }
    if (endIdx === -1) {
      endIdx = beforeMarker.lastIndexOf(endPattern4);
    }

    if (endIdx === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Structure de fin PLANT_CARDS non trouvée',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Insert BEFORE the '}' of '};' that closes the object
    // endIdx is the position of '}' in '}'
    // So insert at endIdx, which puts the new entry right before '};'
    const insertPoint = endIdx;
    const newContent = content.slice(0, insertPoint) + cleanCode + '\n' + content.slice(insertPoint);

    // Write back
    await import('fs/promises').then(fs => fs.writeFile(HOLOID_PATH, newContent, 'utf-8'));

    // Verify write succeeded — re-read and confirm the plant is in the file
    // This guards against HMR invalidating the module cache mid-write
    try {
      const verifyContent = await readFile(HOLOID_PATH, 'utf-8');
      const wroteOK =
        verifyContent.includes(`'${plantDefId}':`) ||
        verifyContent.includes(`"${plantDefId}":`) ||
        verifyContent.includes(`'${plantDefId}': {`) ||
        verifyContent.includes(`"${plantDefId}": {`) ||
        verifyContent.includes(`id: '${plantDefId}'`) ||
        verifyContent.includes(`id: "${plantDefId}"`);
      if (!wroteOK) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Écriture vérifiée échouée — la plante est absente du fichier après écriture. Le HMR de Next.js a probablement invalidé le cache. Réessaie dans 5 secondes.',
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    } catch (verifyErr) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Écriture vérifiée échouée — erreur de relecture: ' + String(verifyErr),
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `PlantCard '${plantDefId}' ajoutée à HologramEvolution.tsx`,
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
