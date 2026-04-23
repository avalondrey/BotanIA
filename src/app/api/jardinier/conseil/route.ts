/**
 * POST /api/jardinier/conseil
 * Server-side proxy for the IA Jardinier — keeps API keys on the server.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getConseilQuotidien, type JardinContext } from '@/lib/ia-jardinier';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const context = body.context as JardinContext;

    if (!context || typeof context !== 'object') {
      return NextResponse.json({ error: 'Contexte jardin manquant' }, { status: 400 });
    }

    const response = await getConseilQuotidien(context);
    return NextResponse.json(response);
  } catch (err) {
    console.error('[jardinier/conseil]', err);
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
