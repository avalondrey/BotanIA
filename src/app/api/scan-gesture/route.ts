import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════
//  Route API : Scan Gestes Écologiques (Vision IA)
// ═══════════════════════════════════════════════════════════════
//
// Vérifie si une photo montre un geste écologique réel :
//   - paillage (mulch)
//   - compost
//   - récupération d'eau de pluie (rainwater)
//
// Utilise Ollama Vision (llava/bakllava) en local
// Retourne JSON avec verified, type, confidence
//
// URL: POST /api/scan-gesture

const GESTURE_TYPES = ['mulch', 'compost', 'rainwater', 'none'] as const;
type GestureType = typeof GESTURE_TYPES[number];

interface GestureResult {
  verified: boolean;
  type: GestureType;
  confidence: number;
  description: string;
  ecoPoints: number;
  message: string;
}

// Points awarded per verified gesture
const ECO_POINTS: Record<GestureType, number> = {
  mulch: 15,      // Paillage : conserve l'eau, enrichit le sol
  compost: 20,   // Compost : cycle des nutriments
  rainwater: 10, // Récup eau : économie d'eau
  none: 0,
};

// Messages de feedback
const MESSAGES: Record<GestureType, string[]> = {
  mulch: [
    "Super ! Le paillage, c'est le secret des jardiniers malins.",
    "Bien joué ! Pailler, c'est protéger.",
    "Le paillage garde l'eau et nourrit le sol. Tip top !",
  ],
  compost: [
    "Le compost, c'est de l'or pour le jardin !",
    "Magnifique ! Tu refermes le cycle des nutriments.",
    "Le compost est le cœur du jardinage durable.",
  ],
  rainwater: [
    "Récupérer l'eau de pluie, c'est Malin !",
    "Bien joué ! L'eau de pluie, c'est gratuit et meilleur pour les plantes.",
    "La récupération d'eau, c'est écolo et économique !",
  ],
  none: [
    "Hmm, je ne vois pas de geste écologique clair. Réessaie avec une photo plus nette !",
    "Pas de paillage, compost ou récup' d'eau visible. Montre-moi tes actions concrètes !",
  ],
};

function getRandomMessage(type: GestureType): string {
  const msgs = MESSAGES[type];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// Prompt système pour Ollama Vision
const SYSTEM_PROMPT = `Tu es un expert en jardinage écologique. Analyse cette image et détermine si elle montre un geste écologique réel.

Types de gestes valides :
- "mulch" : sol couvert de paille, copeaux de bois, feuilles mortes, BRF, cartons ou autres matériaux de paillage visible sur le sol autour des plantes
- "compost" : tas de compost visible, bac à compost, seau de compost, restes de cuisine/épluchures en train d'être compostés
- "rainwater" : récupérateur d'eau de pluie (cuve, tonneau, réservoir), système de collecte sur une serre ou toit avec descente
- "none" : aucun geste écologique visible

Règles :
- Une plante seule dans un pot n'est PAS un geste écologique
- Un jardin sans couverture du sol n'est PAS du paillage
- Une photo floue ou inconclusive → "none"
- Sois STRICT : seul les gestes intentionnels comptent

Réponds UNIQUEMENT avec ce JSON (pas de texte avant/après, pas de backticks) :
{
  "verified": true,
  "type": "mulch",
  "confidence": 0.85,
  "description": "Courte description de ce que tu vois"
}`;

export async function POST(req: Request) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    // Vérifier qu'Ollama est disponible
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    const model = process.env.OLLAMA_VISION_MODEL || 'bakllava';

    let result: GestureResult;

    try {
      // Appel à Ollama Vision
      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mediaType || 'image/jpeg'};base64,${imageBase64}`,
                  },
                },
                {
                  type: 'text',
                  text: "Analyse cette image et dis-moi si tu vois un geste écologique (paillage, compost, récupération d'eau de pluie).",
                },
              ],
            },
          ],
          stream: false,
          options: { temperature: 0.1, num_predict: 200 },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.message?.content?.trim() || '{}';

      // Parser le JSON de la réponse
      let parsed: { verified?: boolean; type?: string; confidence?: number; description?: string };

      // Extraction du JSON (au cas où il y a du texte autour)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = {};
        }
      } else {
        parsed = {};
      }

      const verified = parsed.verified === true;
      const type = GESTURE_TYPES.includes(parsed.type as GestureType)
        ? (parsed.type as GestureType)
        : 'none';
      const confidence = Math.max(0, Math.min(1, parsed.confidence || 0));

      result = {
        verified: verified && confidence > 0.6,
        type,
        confidence,
        description: parsed.description || '',
        ecoPoints: verified && confidence > 0.6 ? ECO_POINTS[type] : 0,
        message: getRandomMessage(type),
      };
    } catch (err) {
      console.error('[scan-gesture] Ollama error:', err);
      return NextResponse.json({
        error: 'Ollama non disponible',
        hint: 'Active Ollama avec un modèle vision (bakllava ou llava)',
      }, { status: 503 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[scan-gesture]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
