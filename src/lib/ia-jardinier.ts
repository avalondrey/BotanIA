/**
 * IA JARDINIER - Backend avec Groq (fallback Gemini)
 * Agent expert en jardinage biologique
 *
 * SECURITY: Uses server-side env vars GROQ_API_KEY / GEMINI_API_KEY.
 * Fallback on NEXT_PUBLIC_* retained for backward compatibility during transition.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface JardinContext {
  plantes: Array<{
    name: string;
    stage: number;
    daysSincePlanting: number;
    waterLevel: number;
    health: number;
  }>;
  meteo: {
    temperature: number;
    precipitation: number;
    conditions: string;
  };
  saison: string;
  jour: number;
  gpsCoords?: { lat: number; lon: number };
}

export interface IAResponse {
  conseil: string;
  actions: string[];
  priorite: 'haute' | 'moyenne' | 'basse';
}

function buildPrompt(context: JardinContext): string {
  return `Tu es BotanIA, expert en jardinage biologique.

CONTEXTE DU JARDIN :
- Jour : ${context.jour}
- Saison : ${context.saison}
- Météo : ${context.meteo.temperature}°C, ${context.meteo.conditions}
- Plantes actuelles : ${context.plantes.length}

PLANTES EN COURS :
${context.plantes.length > 0 ? context.plantes.map(p =>
  `- ${p.name} (stade ${p.stage}, ${p.daysSincePlanting}j, eau: ${p.waterLevel}%, sante: ${p.health}%)`
).join('\n') : '- (aucune plante)'}

MISSION :
Donne 1 conseil prioritaire + 3 actions concrètes pour aujourd'hui.
Réponds en JSON strict :
{
  "conseil": "...",
  "actions": ["...", "...", "..."],
  "priorite": "haute|moyenne|basse"
}`;
}

async function appelGroq(context: JardinContext): Promise<IAResponse> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Tu es BotanIA, expert jardinage bio. Réponds UNIQUEMENT en JSON valide.' },
        { role: 'user', content: buildPrompt(context) },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const msg = `Groq API error: ${response.status}`;
    if (response.status === 429) throw new Error('rate_limit');
    throw new Error(msg);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanContent);

  return {
    conseil: parsed.conseil || 'Tout va bien !',
    actions: parsed.actions || [],
    priorite: parsed.priorite || 'moyenne',
  };
}

async function appelGemini(context: JardinContext): Promise<IAResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY missing');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(context) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanContent);

  return {
    conseil: parsed.conseil || 'Tout va bien !',
    actions: parsed.actions || [],
    priorite: parsed.priorite || 'moyenne',
  };
}

/**
 * Agent Jardinier - Conseils quotidiens (Groq → Gemini fallback)
 */
export async function getConseilQuotidien(context: JardinContext): Promise<IAResponse> {
  // Essayer Groq d'abord
  if (GROQ_API_KEY) {
    try {
      return await appelGroq(context);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('rate_limit') || msg.includes('429')) {
        console.warn('Groq rate limited, fallback Gemini...');
      } else {
        throw error;
      }
    }
  }

  // Fallback Gemini
  if (GEMINI_API_KEY) {
    return await appelGemini(context);
  }

  return {
    conseil: "Configure ta clé API (Groq ou Gemini) pour activer l'IA jardinier !",
    actions: ["Ajoute GROQ_API_KEY ou GEMINI_API_KEY dans .env.local"],
    priorite: 'haute',
  };
}

/**
 * Diagnostic plante - Analyse détaillée (Groq uniquement)
 */
export async function diagnostiquerPlante(
  planteName: string,
  symptoms: string[],
  context: Partial<JardinContext>
): Promise<{ diagnostic: string; traitement: string[]; urgence: boolean }> {
  if (!GROQ_API_KEY) {
    return {
      diagnostic: "IA non configurée",
      traitement: ["Ajoute GROQ_API_KEY dans .env.local"],
      urgence: false,
    };
  }

  const prompt = `Tu es BotanIA, expert phytopathologie. Plante : ${planteName}. Symptômes : ${symptoms.join(', ')}.
Contexte : ${context.meteo?.temperature}°C, ${context.meteo?.conditions}.
Réponds en JSON strict : { "diagnostic": "...", "traitement": ["..."], "urgence": true/false }`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Tu es BotanIA, expert phytopathologie. Réponds UNIQUEMENT en JSON valide.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    return {
      diagnostic: `Erreur API: ${response.status}`,
      traitement: ["Réessaie plus tard"],
      urgence: false,
    };
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleanContent);

  return {
    diagnostic: parsed.diagnostic || 'Aucun diagnostic',
    traitement: parsed.traitement || [],
    urgence: parsed.urgence || false,
  };
}
