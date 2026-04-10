import { NextResponse } from 'next/server';

// ─── Route API : Identification de plante ─────────────────────────────────────
// Moteurs supportés :
//   groq    → llama-3.3-70b (Groq cloud, gratuit, clé dans .env)
//   ollama  → llama3.2 local (100% gratuit et privé)
//   plantid → Plant.id API (spécialisé, 100/jour gratuit)
//   claude  → Claude Vision (si ANTHROPIC_API_KEY présente)

export async function POST(req: Request) {
  try {
    const { imageBase64, mediaType, engine } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    const selected = engine || autoSelectEngine();
    if (selected === 'groq')    return await identifyWithGroq(imageBase64, mediaType);
    if (selected === 'ollama')  return await identifyWithOllama(imageBase64);
    if (selected === 'plantid') return await identifyWithPlantId(imageBase64, mediaType);
    if (selected === 'claude')  return await identifyWithClaude(imageBase64, mediaType);
    return NextResponse.json({ error: 'Moteur inconnu' }, { status: 400 });
  } catch (err) {
    console.error('[identify-plant]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function autoSelectEngine(): string {
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) return 'groq';
  if (process.env.ENABLE_OLLAMA === 'true') return 'ollama';
  return 'groq';
}

// ─── Réponse standard ─────────────────────────────────────────────────────────
function okResult(plantName: string, confidence: number, description: string, careAdvice: string[], engine: string, healthStatus?: any) {
  return NextResponse.json({ plantName, confidence, description, careAdvice, engine, healthStatus });
}

const SYSTEM_PROMPT = `Tu es un botaniste expert. Quand on te décrit ou montre une plante, réponds UNIQUEMENT avec ce JSON valide (pas de texte avant/après, pas de backticks) :
{
  "plantName": "Nom commun français (Nom latin)",
  "confidence": 0.85,
  "description": "Description courte de la plante en 1-2 phrases.",
  "careAdvice": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "healthStatus": {
    "isHealthy": true,
    "diseaseName": "Sain",
    "severity": "none",
    "treatment": [],
    "confidence": 0.9
  },
  "growthStage": {
    "stage": 2,
    "stageName": "Plantule 2 feuilles",
    "estimatedAge": 15,
    "description": "Petite plantule avec 2 vraies feuilles",
    "confidence": 0.8
  }
}

STAGES DE CROISSANCE (0-5) :
- 0 : Graine semée (terre, aucune pousse visible)
- 1 : Germination (monticule, première levée)
- 2 : Plantule 2 feuilles (cotylédons ouverts)
- 3 : Plantule 4 feuilles (vraies feuilles développées)
- 4 : Plant mature (5+ feuilles, robuste)
- 5 : Floraison/Fructification (fleurs ou fruits visibles)

ESTIME LE STADE en observant :
- Nombre de feuilles visibles
- Taille et robustesse du plant
- Présence de fleurs ou fruits
- Développement des tiges

Si tu détectes une maladie ou un ravageur, mets isHealthy à false, nomme la maladie et suggère des traitements.
Si tu n'arrives pas à identifier la plante, mets plantName "Plante non identifiée" et confidence 0.1.`;

// ─── Groq (llama-3.3-70b) ─────────────────────────────────────────────────────
async function identifyWithGroq(imageBase64: string, mediaType = 'image/jpeg') {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error('GROQ key manquante');

  // Groq llama-3.3-70b supporte vision via llama-3.2-11b-vision
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
          { type: 'text', text: SYSTEM_PROMPT + '\n\nIdentifie cette plante sur la photo.' }
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
  return okResult(parsed.plantName, parsed.confidence, parsed.description, parsed.careAdvice, 'groq', parsed.healthStatus);
}

// ─── Ollama local ─────────────────────────────────────────────────────────────
// llama3.2 ne fait pas de vision, mais on peut envoyer un message texte
// En attendant llava, on utilise une description générique avec l'image en base64
async function identifyWithOllama(_imageBase64: string) {
  const url = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.2';

  // Essai llava (vision) si disponible, sinon fallback texte
  const visionRes = await fetch(`${url}/api/tags`).then(r => r.json()).catch(() => ({ models: [] }));
  const hasLlava = visionRes.models?.some((m: any) => m.name?.includes('llava') || m.name?.includes('bakllava'));

  let body: object;
  if (hasLlava) {
    body = {
      model: 'llava',
      messages: [{ role: 'user', content: 'Identifie cette plante en JSON.', images: [_imageBase64] }],
      stream: false,
      format: 'json',
    };
  } else {
    body = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Je t\'envoie une photo de plante. Donne-moi une identification générique en JSON. (mode texte car llava non disponible)' }
      ],
      stream: false,
      options: { temperature: 0.3 }
    };
  }

  const res = await fetch(`${url}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Ollama non disponible');
  const data = await res.json();
  const text = data.message?.content || '';
  const parsed = safeParseJSON(text);
  return okResult(parsed.plantName, parsed.confidence, parsed.description, parsed.careAdvice, hasLlava ? 'ollama-vision' : 'ollama-text', parsed.healthStatus);
}

// ─── Plant.id (API gratuite spécialisée plantes) ──────────────────────────────
async function identifyWithPlantId(imageBase64: string, _mediaType = 'image/jpeg') {
  // API publique Plant.id v3 — 100 requêtes/jour gratuit sans clé
  const res = await fetch('https://plant.id/api/v3/identification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': process.env.PLANTID_API_KEY || 'DEMO' },
    body: JSON.stringify({
      images: [`data:image/jpeg;base64,${imageBase64}`],
      similar_images: false,
      classification_level: 'species',
    })
  });
  if (!res.ok) throw new Error(`Plant.id error: ${res.status}`);
  const data = await res.json();

  const suggestions = data.result?.classification?.suggestions || [];
  const top = suggestions[0];
  if (!top) return okResult('Plante non identifiée', 0.1, 'Aucun résultat trouvé.', [], 'plantid');

  const name = `${top.name}` + (top.details?.common_names?.[0] ? ` (${top.details.common_names[0]})` : '');
  const desc = top.details?.description?.value || top.details?.wiki_description?.value || 'Plante identifiée par Plant.id.';
  const care = top.details?.watering ? [`Arrosage : ${top.details.watering}`] : ['Consulter les conseils spécifiques à cette espèce.'];
  return okResult(name, top.probability || 0.5, desc.slice(0, 250), care, 'plantid', { isHealthy: true, diseaseName: 'Sain', severity: 'none', treatment: [], confidence: 0.9 });
}

// ─── Claude Vision ────────────────────────────────────────────────────────────
async function identifyWithClaude(imageBase64: string, mediaType = 'image/jpeg') {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY manquante');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: SYSTEM_PROMPT + '\n\nIdentifie la plante sur cette image.' }
        ]
      }]
    })
  });
  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  const parsed = safeParseJSON(text);
  return okResult(parsed.plantName, parsed.confidence, parsed.description, parsed.careAdvice, 'claude', parsed.healthStatus);
}

// ─── JSON sécurisé ────────────────────────────────────────────────────────────
function safeParseJSON(text: string) {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { plantName: 'Non identifié', confidence: 0.1, description: 'Impossible de parser la réponse IA.', careAdvice: [] };
}
