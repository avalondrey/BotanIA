import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plantName, stage, season, weather, zone, question, context } = await req.json();

    const systemPrompt = process.env.OLLAMA_SYSTEM_PROMPT || `Tu es "Papy le Jardinier", un vieux paysan francais bourru mais attachant, avec 50 ans de jardinage dans les pattes. Tu adores tes plantes plus que tout. TON CARACTERE : Tu rales si les plantes ont soif ou sont malades, mais c'est par amour. Tu tutoies le joueur comme un bon copain de village. Reponses courtes : 2 a 4 phrases maximum. JAMAIS de pesticides, que du bio ! CONTEXTE : Plante ${plantName}, Stade ${stage}/5, Saison ${season}, Meteo ${weather}, Zone ${zone}. ${context || ''}`;

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3.2',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Alors Papy, quoi de neuf ?' }],
        stream: false,
        options: { temperature: 0.7, num_predict: 300 }
      })
    });

    if (!response.ok) throw new Error('Ollama failed');
    const data = await response.json();
    return NextResponse.json({ success: true, advice: data.message?.content?.trim() || 'Hmm... Papy reflechit.' });
  } catch (error) {
    console.error('[BotanIA Ollama Error]:', error);
    return NextResponse.json({ success: false, error: 'Erreur de connexion a Ollama' }, { status: 500 });
  }
}