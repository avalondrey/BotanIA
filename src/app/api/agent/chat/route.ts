/**
 * POST /api/agent/chat
 * Proxy chat vers le microservice AI
 */
import { NextRequest, NextResponse } from 'next/server';
import { microChat } from '@/lib/agent/micro-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, options } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages manquants' }, { status: 400 });
    }

    // Extraire le dernier message utilisateur
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const message = lastUserMessage?.content || '';

    if (!message) {
      return NextResponse.json({ error: 'message vide' }, { status: 400 });
    }

    // Système existant de BotanIA
    const systemPrompt = process.env.OLLAMA_SYSTEM_PROMPT || 'Tu es BotanIA, expert jardinage bio.';

    const response = await microChat({
      message,
      systemPrompt,
      options,
    });

    return NextResponse.json({ answer: response.answer, engine: response.engine });
  } catch (err: any) {
    console.error('[agent/chat] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
