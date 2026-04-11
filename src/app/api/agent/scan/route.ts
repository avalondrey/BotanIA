/**
 * POST /api/agent/scan
 * Proactive scan vers le microservice AI
 */
import { NextRequest, NextResponse } from 'next/server';
import { microScan } from '@/lib/agent/micro-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameContext, snapshot } = body;

    if (!gameContext) {
      return NextResponse.json({ error: 'gameContext manquant' }, { status: 400 });
    }

    const result = await microScan({ gameContext, snapshot });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[agent/scan] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    disabled: false,
    message: 'Scan utilise le microservice AI',
    timestamp: Date.now(),
  });
}
