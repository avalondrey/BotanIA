/**
 * IA JARDINIER - Backend avec Groq (Llama 3.3 70B)
 * Agent expert en jardinage biologique
 */

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
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

/**
 * Agent Jardinier - Conseils quotidiens via Groq
 */
export async function getConseilQuotidien(context: JardinContext): Promise<IAResponse> {
  if (!GROQ_API_KEY) {
    console.warn('GROQ_API_KEY manquante - mode simulation');
    return {
      conseil: "Configure ta clé API Groq pour activer l'IA jardinier !",
      actions: ["Ajoute NEXT_PUBLIC_GROQ_API_KEY dans .env.local"],
      priorite: 'haute',
    };
  }

  const prompt = `Tu es BotanIA, expert en jardinage biologique.

CONTEXTE DU JARDIN :
- Jour : ${context.jour}
- Saison : ${context.saison}
- Météo : ${context.meteo.temperature}°C, ${context.meteo.conditions}
- Plantes actuelles : ${context.plantes.length}

PLANTES EN COURS :
${context.plantes.map(p => 
  `- ${p.name} (stade ${p.stage}, ${p.daysSincePlanting}j, eau: ${p.waterLevel}%, sante: ${p.health}%)`
).join('\n')}

MISSION :
Donne 1 conseil prioritaire + 3 actions concrètes pour aujourd'hui.
Réponds en JSON strict :
{
  "conseil": "...",
  "actions": ["...", "...", "..."],
  "priorite": "haute|moyenne|basse"
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Tu es BotanIA, expert jardinage bio. Réponds UNIQUEMENT en JSON valide.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    // Nettoyer le JSON (enlever markdown si présent)
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    return {
      conseil: parsed.conseil || 'Tout va bien !',
      actions: parsed.actions || [],
      priorite: parsed.priorite || 'moyenne',
    };
  } catch (error) {
    console.error('Erreur IA Jardinier:', error);
    return {
      conseil: "Impossible de contacter l'IA jardinier pour le moment.",
      actions: ["Vérifie ta connexion internet", "Réessaye dans quelques instants"],
      priorite: 'basse',
    };
  }
}

/**
 * Diagnostic plante - Analyse détaillée
 */
export async function diagnostiquerPlante(
  planteName: string,
  symptoms: string[],
  context: Partial<JardinContext>
): Promise<{ diagnostic: string; traitement: string[]; urgence: boolean }> {
  if (!GROQ_API_KEY) {
    return {
      diagnostic: "IA non configurée",
      traitement: ["Configure GROQ_API_KEY"],
      urgence: false,
    };
  }

  const prompt = `Diagnostic plante : ${planteName}

SYMPTÔMES OBSERVÉS :
${symptoms.map(s => `- ${s}`).join('\n')}

CONTEXTE :
- Saison : ${context.saison || 'inconnue'}
- Météo : ${context.meteo?.temperature || '?'}°C

Analyse et donne un diagnostic + traitement bio.
Réponds en JSON :
{
  "diagnostic": "...",
  "traitement": ["...", "..."],
  "urgence": true|false
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Expert en diagnostic jardinage bio. JSON uniquement.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    return {
      diagnostic: parsed.diagnostic || 'Diagnostic indisponible',
      traitement: parsed.traitement || [],
      urgence: parsed.urgence || false,
    };
  } catch (error) {
    console.error('Erreur diagnostic:', error);
    return {
      diagnostic: "Erreur lors du diagnostic",
      traitement: ["Réessaye plus tard"],
      urgence: false,
    };
  }
}
