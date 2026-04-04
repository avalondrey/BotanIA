import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plantName, stage, season, weather, zone, question } = await req.json();
    const systemPrompt = process.env.OLLAMA_SYSTEM_PROMPT || "Tu es BotanIA, expert en jardinage bio français. Réponses courtes, bienveillantes, sans pesticides. 🌱";
    const userPrompt = [
      `🌱 Plante : ${plantName || 'Inconnue'}`,
      `📊 Stade : ${stage || 0}/5`,
      `🗓️ Saison : ${season}`,
      `🌤️ Météo : ${weather}`,
      `🏡 Zone : ${zone}`,
      question ? `❓ Question : ${question}` : null
    ].filter(Boolean).join('\n') + '\n\nDonne un conseil court et bienveillant.';

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3.2',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        stream: false,
        options: { temperature: 0.3, num_predict: 256 }
      })
    });

    if (!response.ok) throw new Error('Ollama failed');
    const data = await response.json();
    return NextResponse.json({ success: true, advice: data.message?.content?.trim() || 'Aucun conseil.' });
  } catch (error) {
    console.error('[BotanIA Ollama Error]:', error);
    return NextResponse.json({ success: false, error: 'Erreur de connexion à Ollama' }, { status: 500 });
  }
}
