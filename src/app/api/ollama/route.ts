import { NextResponse } from 'next/server';
import { aiRateLimiter } from '@/lib/rate-limiter';

const OLLAMA_TIMEOUT_MS = 30000; // 30s timeout

export async function POST(req: Request) {
  // Rate limiting
  const rateLimit = aiRateLimiter.check(req);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit atteint',
        retryAfter: rateLimit.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { plantName, stage, season, weather, zone, question, context } = body;

    // Papy le Jardinier - personnalité
    const papyPrompt = `Tu es "Papy le Jardinier", un vieux paysan français bourru mais attachant, avec 50 ans de jardinage dans les pattes. Tu adores mes plantes plus que tout, et ça se voit quand tu donnes des conseils.

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
    const ollamaUrl = process.env.OLLAMA_URL || process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3.2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question || 'Alors Papy, quoi de neuf ?' },
          ],
          stream: false,
          options: { temperature: 0.7, num_predict: 300 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[Ollama] HTTP ${response.status}: ${errorText}`);
        return NextResponse.json(
          { success: false, error: `Ollama error: ${response.status}` },
          { status: 502 }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        advice: data.message?.content?.trim() || 'Hmm... Papy réfléchit.',
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[Ollama] Request timeout after 30s');
        return NextResponse.json(
          { success: false, error: 'Ollama timeout (30s) — le modèle met trop de temps' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[BotanIA Ollama Error]:', message);
    return NextResponse.json(
      { success: false, error: `Erreur Ollama: ${message}` },
      { status: 500 }
    );
  }
}
