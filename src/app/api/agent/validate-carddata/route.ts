/**
 * API: POST /api/agent/validate-carddata
 * Validate and write CARD_DATA TypeScript file to src/data/graines/{shopId}/{fileName}
 * Request: { plantDefId: string, code: string, shopId: string, fileName: string }
 * Response: { success: boolean, message: string, filePath: string }
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

const DATA_GRAINES_PATH = path.join(process.cwd(), 'src/data/graines');

export async function POST(request: Request) {
  try {
    const { plantDefId, code, shopId, fileName } = await request.json();

    if (!plantDefId || !code || !shopId || !fileName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'plantDefId, code, shopId et fileName sont requis',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Validation de sécurité sur le shopId et fileName (pas de path traversal)
    if (shopId.includes('..') || shopId.includes('/') || shopId.includes('\\')) {
      return new Response(JSON.stringify({ success: false, error: 'shopId invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return new Response(JSON.stringify({ success: false, error: 'fileName invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    if (!fileName.endsWith('.ts')) {
      return new Response(JSON.stringify({ success: false, error: 'fileName doit être un fichier .ts' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const shopDir = path.join(DATA_GRAINES_PATH, shopId);
    const filePath = path.join(shopDir, fileName);
    const relativePath = `src/data/graines/${shopId}/${fileName}`;

    // Créer le répertoire shopId si nécessaire
    await mkdir(shopDir, { recursive: true });

    // Vérifier si le fichier existe déjà
    let fileExists = false;
    try {
      await readFile(filePath, 'utf-8');
      fileExists = true;
    } catch {}

    if (fileExists) {
      return new Response(JSON.stringify({
        success: false,
        error: `Le fichier ${relativePath} existe déjà. Supprimez-le manuellement pour régénérer.`,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Écrire le fichier
    await writeFile(filePath, code, 'utf-8');

    // Vérifier que l'écriture a bien eu lieu
    let verifyOk = false;
    try {
      const written = await readFile(filePath, 'utf-8');
      verifyOk = written.includes(`plantDefId: "${plantDefId}"`) || written.includes(`plantDefId: '${plantDefId}'`);
    } catch {}

    if (!verifyOk) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Écriture échouée — le fichier ne contient pas plantDefId après écriture.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `CARD_DATA écrit dans ${relativePath}`,
      filePath: relativePath,
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
