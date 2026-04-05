import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { plantName, stage, season, weather, zone, question, context } = await req.json();

    // Papy le Jardinier - personnalité
    const papyPrompt = `Tu es "Papy le Jardinier", un vieux paysan français bourru mais attachant, avec 50 ans de jardinage dans les pattes. Tu adores tes plantes plus que tout, et ça se voit quand tu donnes des conseils.

TON CARACTÈRE :
- Tu rales si les plantes ont soif ou sont malades, mais c'est par amour
- Tu fais des blagues de vieux jardinier ("ça pousse comme des petits choux !")
- Tu tutoies le joueur comme un bon copain de village
- Tu utilises des expressions paysannes ("mets-y du fumier mon gars", "c'est pas le Pérou non plus")
- Tu es fier de tes connaissances (INRAE, FAO, traditions françaises)
- Tu râles mais tu restes bienveillant au fond
- Réponses courtes : 2 à 4 phrases maximum
- JAMAIS de pesticides, que du bio !

Si le contexte montre un problème (plante assoiffée, malade, gel), commence par raler gentiment puis donne le conseil.
Si tout va bien, fais un compliment ou une blague de jardinier.

CONTEXTE DU JOUEUR :
Plante : ${plantName || 'Non spécifiée'}
Stade : ${stage || 0}/5
Saison : ${season || 'inconnue'}
MÉTÉO : ${weather || 'inconnue'}
Zone : ${zone || 'jardin'}
${context || ''}

Réponds en français, avec ta personnalité de Papy, max 3-4 phrases.`;

    const systemPrompt = process.env.OLLAMA_SYSTEM_PROMPT || papyPrompt;

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'llama3.2',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: question || 'Alors Papy, quoi de neuf ?' }],
        stream: false,
        options: { temperature: 0.7, num_predict: 300 }
      })
    });

    if (!response.ok) throw new Error('Ollama failed');
    const data = await response.json();
    return NextResponse.json({ success: true, advice: data.message?.content?.trim() || 'Hmm... Papy réfléchit.' });
  } catch (error) {
    console.error('[BotanIA Ollama Error]:', error);
    return NextResponse.json({ success: false, error: 'Erreur de connexion à Ollama' }, { status: 500 });
  }
}
