/**
 * API: POST /api/agent/generate-plantcard
 * Generate PlantCard code for a plantDefId
 * Request: { plantDefId: string }
 * Response: { success: boolean, code: string, preview: object }
 */

import { NextResponse } from 'next/server';
import { generatePlantCardCode, readFileIfExists } from '@/lib/agent/plant-integrator';
import path from 'path';

const HOLOID_PATH = path.join(process.cwd(), 'src/components/game/HologramEvolution.tsx');

export async function POST(request: Request) {
  try {
    const { plantDefId } = await request.json();

    if (!plantDefId) {
      return new Response(JSON.stringify({ success: false, error: 'plantDefId requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Read existing card data if available
    let cardDataContent: string | undefined;
    const dataGrainesPath = path.join(process.cwd(), 'src/data/graines');

    try {
      const fs = await import('fs/promises');
      const entries = await fs.readdir(dataGrainesPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const files = await fs.readdir(`${dataGrainesPath}/${entry.name}`);
          const tsFile = files.find(f => f.endsWith('.ts'));
          if (tsFile) {
            const content = await fs.readFile(`${dataGrainesPath}/${entry.name}/${tsFile}`, 'utf-8');
            if (content.includes(`plantDefId: "${plantDefId}"`) || content.includes(`plantDefId: '${plantDefId}'`)) {
              cardDataContent = content;
              break;
            }
          }
        }
        if (cardDataContent) break;
      }
    } catch {}

    // Generate the PlantCard code
    const code = generatePlantCardCode(plantDefId, cardDataContent);

    // Check if already exists in HologramEvolution
    let alreadyExists = false;
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(HOLOID_PATH, 'utf-8');
      alreadyExists = content.includes(`'${plantDefId}':`) || content.includes(`"${plantDefId}":`);
    } catch {}

    return new Response(JSON.stringify({
      success: true,
      code,
      plantDefId,
      alreadyExists,
      message: alreadyExists
        ? '⚠️ Cette PlantCard existe déjà dans HologramEvolution.tsx'
        : '✅ Code généré, prêt à valider',
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
