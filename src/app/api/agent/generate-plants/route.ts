/**
 * API: POST /api/agent/generate-plants
 * Generate PLANTS entry code for ai-engine.ts
 * Request: { plantDefId: string }
 * Response: { success: boolean, code: string, alreadyExists: boolean }
 */

import { NextResponse } from 'next/server';
import { generatePlantsCode, checkPlantsEntryExists } from '@/lib/agent/generate-plants';

export async function POST(request: Request) {
  try {
    const { plantDefId } = await request.json();

    if (!plantDefId) {
      return new Response(JSON.stringify({ success: false, error: 'plantDefId requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const alreadyExists = await checkPlantsEntryExists(plantDefId);
    const code = await generatePlantsCode(plantDefId);

    return new Response(JSON.stringify({
      success: true,
      code,
      plantDefId,
      alreadyExists,
      message: alreadyExists
        ? '⚠️ Cette entrée existe déjà dans ai-engine.ts'
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
