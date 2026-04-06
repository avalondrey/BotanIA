/**
 * Disease Detection API Route
 * Détection de maladies vegetais via IA
 */

import { NextResponse } from 'next/server';

// ─── Route API : Détection de maladies ─────────────────────────────────────
// Moteurs supportés (mêmes que identify-plant) :
//   groq    → llama-3.3-70b (Groq cloud, gratuit, clé dans .env)
//   ollama  → llama3.2 local (100% gratuit et privé)
//   plantid → Plant.id API (spécialisé, 100/jour gratuit)
//   claude  → Claude Vision (si ANTHROPIC_API_KEY présente)

export async function POST(req: Request) {
  try {
    const { imageBase64, mediaType, engine } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    const selected = engine || autoSelectEngine();
    if (selected === 'groq')    return await detectWithGroq(imageBase64, mediaType);
    if (selected === 'ollama')  return await detectWithOllama(imageBase64);
    if (selected === 'plantid') return await detectWithPlantId(imageBase64, mediaType);
    if (selected === 'claude')  return await detectWithClaude(imageBase64, mediaType);
    return NextResponse.json({ error: 'Moteur inconnu' }, { status: 400 });
  } catch (err) {
    console.error('[detect-disease]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function autoSelectEngine(): string {
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) return 'groq';
  if (process.env.ENABLE_OLLAMA === 'true') return 'ollama';
  return 'groq';
}

// ─── Réponse standard ─────────────────────────────────────────────────────────
function okResult(
  diseaseName: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  confidence: number,
  affectedParts: string[],
  treatmentAdvice: string[],
  preventionAdvice: string[],
  isTreatable: boolean,
  engine: string
) {
  return NextResponse.json({
    diseaseName,
    severity,
    confidence,
    affectedParts,
    treatmentAdvice,
    preventionAdvice,
    isTreatable,
    engine
  });
}

const DISEASE_SYSTEM_PROMPT = `Tu es un expert phytopathologique. Analyse cette image pour identifier d'éventuelles maladies ou ravageurs des plantes. Réponds UNIQUEMENT avec ce JSON valide (pas de texte avant/après, pas de backticks) :
{
  "diseaseName": "Nom de la maladie ou ravageur (ex: Mildiou, Oïdium, Pucerons, Tavelure)",
  "severity": "low|medium|high|critical",
  "confidence": 0.75,
  "affectedParts": ["feuilles", "tiges", "fruits"],
  "treatmentAdvice": ["Conseil de traitement 1", "Conseil 2"],
  "preventionAdvice": ["Conseil de prévention 1", "Conseil 2"],
  "isTreatable": true
}
Si la plante semble saine, mets diseaseName "Plante saine" et severity "low" avec isTreatable true.`;

// ─── Groq (llama-3.3-70b) ─────────────────────────────────────────────────────
async function detectWithGroq(imageBase64: string, mediaType = 'image/jpeg') {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error('GROQ key manquante');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
          { type: 'text', text: DISEASE_SYSTEM_PROMPT + '\n\nAnalyse cette image pour détecter d\'éventuelles maladies ou ravageurs.' }
        ]
      }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const parsed = safeParseJSON(text);
  return okResult(
    parsed.diseaseName,
    parsed.severity || 'medium',
    parsed.confidence || 0.5,
    parsed.affectedParts || [],
    parsed.treatmentAdvice || [],
    parsed.preventionAdvice || [],
    parsed.isTreatable !== false,
    'groq'
  );
}

// ─── Ollama local ─────────────────────────────────────────────────────────────
async function detectWithOllama(_imageBase64: string) {
  // Ollama ne supporte pas bien la vision dans la plupart des modèles
  // Utilisation de Groq comme fallback
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    return await detectWithGroq(_imageBase64);
  }
  throw new Error('Ollama vision non supporté. Utilisez Groq ou Claude.');
}

// ─── Plant.id API ─────────────────────────────────────────────────────────────
async function detectWithPlantId(imageBase64: string, _mediaType = 'image/jpeg') {
  const key = process.env.PLANT_ID_KEY;
  if (!key) throw new Error('Plant.id API key manquante');

  const res = await fetch('https://api.plant.id/v2/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': key },
    body: JSON.stringify({
      images: [`data:image/jpeg;base64,${imageBase64}`],
      modifiers: ['disease_details'],
      plant_language: 'fr'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Plant.id error: ${err}`);
  }

  const data = await res.json();
  const suggestion = data.suggestions?.[0];

  if (!suggestion) {
    return okResult('Plante saine', 'low', 0.9, [], [], [], true, 'plantid');
  }

  const disease = suggestion.probabilities?.find(p => p.name.includes('disease') || p.name.includes('virus') || p.name.includes('fungi'));

  if (!disease || disease.probability < 0.3) {
    return okResult('Plante saine', 'low', suggestion.probability || 0.8, [], [], [], true, 'plantid');
  }

  return okResult(
    disease.name,
    disease.probability > 0.8 ? 'high' : disease.probability > 0.5 ? 'medium' : 'low',
    disease.probability,
    ['parties aériennes'],
    ['Consulter un spécialiste', 'Traitement fongicide si nécessaire'],
    ['Surveiller régulièrement', 'Éviter l\'humidité excessive'],
    true,
    'plantid'
  );
}

// ─── Claude Vision ────────────────────────────────────────────────────────────
async function detectWithClaude(imageBase64: string, mediaType = 'image/jpeg') {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Anthropic API key manquante');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: imageBase64 } },
          { type: 'text', text: DISEASE_SYSTEM_PROMPT + '\n\nAnalyse cette image pour détecter d\'éventuelles maladies ou ravageurs des plantes.' }
        ]
      }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude error: ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  const parsed = safeParseJSON(text);
  return okResult(
    parsed.diseaseName,
    parsed.severity || 'medium',
    parsed.confidence || 0.5,
    parsed.affectedParts || [],
    parsed.treatmentAdvice || [],
    parsed.preventionAdvice || [],
    parsed.isTreatable !== false,
    'claude'
  );
}

// ─── JSON Parser safe ─────────────────────────────────────────────────────────
function safeParseJSON(text: string): any {
  try {
    // Chercher le JSON dans la réponse (parfois le modèle ajoute du texte)
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(text);
  } catch {
    console.error('[detect-disease] Parse error:', text.slice(0, 200));
    return {};
  }
}
