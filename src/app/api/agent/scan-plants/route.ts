/**
 * API: POST /api/agent/scan-plants
 * Scan all plants for missing data (8-point check)
 * Request: {} (no body needed)
 * Response: ScanResult with all plant checks
 */

import { scanAllPlants, getPlantsNeedingWork } from '@/lib/agent/plant-integrator';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    const result = await scanAllPlants();
    return new Response(JSON.stringify({ success: true, data: result, plantsNeedingWork: getPlantsNeedingWork(result) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('[scan-plants] Error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
