import { NextResponse } from 'next/server';

// ─── Route API : Identification de plante ─────────────────────────────────────
// Moteurs supportés :
//   groq    → Llama 4 Scout (Groq cloud, gratuit, clé dans .env)
//   gemini  → Google Gemini Flash (gratuit, 15 req/min)
//   ollama  → llama3.2 local (100% gratuit et privé)
//   plantid → Plant.id API (spécialisé, 100/jour gratuit)

// Timeout étendu pour le mode multi (4 moteurs en parallèle)
export const maxDuration = 30;

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB max en base64 (~6 MB image)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mediaType, engine } = body;

    if (!imageBase64) return NextResponse.json({ error: 'Image manquante' }, { status: 400 });

    // Validation taille image
    const imageSize = Buffer.byteLength(imageBase64, 'base64');
    if (imageSize > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: `Image trop volumineuse (${(imageSize / 1024 / 1024).toFixed(1)} MB). Max 8 MB.` }, { status: 413 });
    }

    // Mode "multi" : essaie tous les moteurs en cascade, retourne tous les résultats
    if (engine === 'multi') {
      return await identifyWithMulti(imageBase64, mediaType);
    }

    const selected = engine || autoSelectEngine();
    if (selected === 'groq')    return await identifyWithGroq(imageBase64, mediaType);
    if (selected === 'gemini')  return await identifyWithGemini(imageBase64, mediaType);
    if (selected === 'ollama')  return await identifyWithOllama(imageBase64);
    if (selected === 'plantid') return await identifyWithPlantId(imageBase64, mediaType);
    return NextResponse.json({ error: 'Moteur inconnu' }, { status: 400 });
  } catch (err) {
    console.error('[identify-plant]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─── Multi-engine : essaie chaque moteur en parallèle, retourne tous les résultats ────────
async function identifyWithMulti(imageBase64: string, mediaType: string) {
  const engines: { id: string; label: string; emoji: string; fn: () => Promise<Response> }[] = [
    { id: 'groq', label: 'Groq IA', emoji: '⚡', fn: () => identifyWithGroq(imageBase64, mediaType) },
    { id: 'gemini', label: 'Google Gemini', emoji: '✨', fn: () => identifyWithGemini(imageBase64, mediaType) },
    { id: 'plantid', label: 'Plant.id', emoji: '🌿', fn: () => identifyWithPlantId(imageBase64, mediaType) },
    { id: 'ollama', label: 'Ollama Local', emoji: '🤖', fn: () => identifyWithOllama(imageBase64) },
  ];

  type EngineResult = {
    engine: string;
    label: string;
    emoji: string;
    success: boolean;
    plantName?: string;
    confidence?: number;
    description?: string;
    careAdvice?: string[];
    healthStatus?: any;
    alternatives?: Array<{ plantName: string; confidence: number }>;
    error?: string;
  };

  // Lancer tous les moteurs en parallèle
  const settled = await Promise.allSettled(
    engines.map(async (e) => {
      try {
        const res = await e.fn();
        const data = await res.json();
        const filteredAlts = filterAlternatives(data.alternatives || []);
        const plantName = data.plantName && !GENERIC_NAMES.test(data.plantName) ? data.plantName : 'Non identifié';
        return {
          engine: e.id, label: e.label, emoji: e.emoji, success: true,
          plantName,
          confidence: data.confidence ?? 0.01,
          description: data.description, careAdvice: data.careAdvice,
          healthStatus: data.healthStatus,
          alternatives: filteredAlts,
        } as EngineResult;
      } catch (err: any) {
        return {
          engine: e.id, label: e.label, emoji: e.emoji, success: false,
          error: err.message || 'Indisponible',
        } as EngineResult;
      }
    })
  );

  const results: EngineResult[] = settled.map((r) =>
    r.status === 'fulfilled' ? r.value : { engine: 'unknown', label: 'Erreur', emoji: '❌', success: false, error: 'Erreur inattendue' }
  );

  return NextResponse.json({ multi: true, results });
}

function autoSelectEngine(): string {
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ENABLE_OLLAMA === 'true') return 'ollama';
  return 'groq';
}

// ─── Réponse standard ─────────────────────────────────────────────────────────
function okResult(plantName: string, confidence: number, description: string, careAdvice: string[], engine: string, healthStatus?: any, alternatives?: Array<{ plantName: string; confidence: number }>) {
  return NextResponse.json({ plantName, confidence, description, careAdvice, engine, healthStatus, alternatives });
}

const SYSTEM_PROMPT = `Tu es un botaniste expert international, membre de sociétés savantes, avec plus de 20 ans d'expérience sur le terrain et en herbier. Tu maîtrises la taxonomie, la morphologie végétale, l'écologie et les confusions courantes entre espèces.

MÉTHODE D'ANALYSE (applique-la mentalement AVANT de répondre) :

1. DESCRIPTION OBJECTIVE : Observe précisément la plante qui a le PLUS de feuilles sur la photo — ignore le sol, la terre, les mauvaises herbes au sol et l'herbe autour. Concentre-toi sur la plante dominante :
   - Forme et arrangement des feuilles (simple/composée, opposées/alternes/verticillées, marge dentelée/lisse/lobée, nervures, texture, couleur)
   - Tige et port de la plante (dressée, rampante, touffe, rosette)
   - Fleurs ou inflorescences si présentes (nombre de pétales, symétrie, couleur, structure)
   - Fruits/graines si visibles
   - Détails notables (poils, épines, glandes, odeur si inférable)

2. IDENTIFICATION : Nom scientifique le plus probable, noms communs français et anglais, famille botanique.

3. RAISONNEMENT : Indices clés qui mènent à cette conclusion. Espèces proches qui pourraient prêter à confusion et pourquoi on les écarte. Contexte géographique ou habitat (forêt, jardin, bord de route) si visible.

4. INFOS PRATIQUES : Indigène/invasive/cultivée, toxicité (homme, animaux, chats/chiens), conseils de culture.

RÉPONDS UNIQUEMENT avec ce JSON valide (pas de texte avant/après, pas de backticks) :
{
  "plantName": "Nom commun français (Nom latin)",
  "confidence": 0.85,
  "description": "Description détaillée de la plante observée : forme des feuilles, arrangement, couleur, port, fleurs. 2-3 phrases minimum.",
  "careAdvice": ["Conseil culture 1", "Conseil culture 2", "Conseil culture 3"],
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
  },
  "alternatives": [
    {"plantName": "Tomate (Solanum lycopersicum)", "confidence": 0.30},
    {"plantName": "Morelle noire (Solanum nigrum)", "confidence": 0.15},
    {"plantName": "Aubergine (Solanum melongena)", "confidence": 0.10},
    {"plantName": "Piment (Capsicum annuum)", "confidence": 0.08},
    {"plantName": "Belladone (Atropa belladonna)", "confidence": 0.05},
    {"plantName": "Douce-amère (Solanum dulcamara)", "confidence": 0.03}
  ]
}

STAGES DE CROISSANCE (0-5) :
- 0 : Graine semée (terre, aucune pousse visible)
- 1 : Germination (monticule, première levée)
- 2 : Plantule 2 feuilles (cotylédons ouverts)
- 3 : Plantule 4 feuilles (vraies feuilles développées)
- 4 : Plant mature (5+ feuilles, robuste)
- 5 : Floraison/Fructification (fleurs ou fruits visibles)

RÈGLES STRICTES :
1. "alternatives" doit contenir EXACTEMENT 6 entrées avec des noms d'espèces RÉELLES (nom commun français + nom latin entre parenthèses).
2. JAMAIS de textes génériques : "Plante non identifiée", "Herbe commune", "Mauvaise herbe", "Plante similaire", "Autre plante possible", "Plante inconnue", "Végétal", "Plante sauvage" — ce sont des INTERDICTIONS ABSOLUES.
3. Si incertain, propose des genres ou familles botaniques : "Lamiacée spp." ou "Solanum sp." plutôt que du texte générique.
4. Donne TOUJOURS 6 alternatives même à 1% de confiance. L'utilisateur choisira lui-même la bonne plante.
5. ANALYSE les FEUILLES de la plante qui a le PLUS de feuilles sur la photo. Ignore le sol, la terre, les mauvaises herbes au sol, l'herbe autour.
6. Observe la forme des feuilles (ovale, lancéolée, dentelée, composée, palmée), leur couleur, leur taille, la texture, la disposition sur la tige.
7. Si l'image est de mauvaise qualité ou ambiguë, dis-le dans la description et propose ce qu'il faudrait photographier en plus.
8. Si tu détectes une maladie, mets isHealthy à false et propose des traitements.
9. Ne JAMAIS inventer des détails non visibles sur la photo.`;

// ─── Groq (llama-3.3-70b) ─────────────────────────────────────────────────────
async function identifyWithGroq(imageBase64: string, mediaType = 'image/jpeg') {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!key) throw new Error('GROQ key manquante');

  // Groq Llama 4 Scout (vision multimodal, remplace llama-3.2-11b décommissionné)
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 800,
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
  return okResult(parsed.plantName, parsed.confidence, parsed.description, parsed.careAdvice, 'groq', parsed.healthStatus, parsed.alternatives);
}

// ─── Google Gemini (Flash — gratuit 15 req/min, fallback vers 1.5 Flash si quota épuisé) ─
async function identifyWithGemini(imageBase64: string, mediaType = 'image/jpeg') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY manquante');

  // Essaie gemini-2.0-flash d'abord, puis gemini-2.0-flash-lite, puis gemini-1.5-flash
  const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mediaType, data: imageBase64 } },
            { text: SYSTEM_PROMPT + '\n\nIdentifie cette plante sur la photo.' }
          ]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
      })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = safeParseJSON(text);
      return okResult(parsed.plantName, parsed.confidence, parsed.description, parsed.careAdvice, `gemini (${model})`, parsed.healthStatus, parsed.alternatives);
    }
    // Si 429 (quota), essaie le modèle suivant
    if (res.status === 429) continue;
    // Autre erreur → on propage
    const err = await res.text();
    throw new Error(`Gemini error (${model}): ${err.slice(0, 200)}`);
  }
  throw new Error('Gemini : quota épuisé sur tous les modèles Flash. Réessayez dans quelques minutes.');
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
  return okResult(parsed.plantName, parsed.confidence, parsed.description, parsed.careAdvice, hasLlava ? 'ollama-vision' : 'ollama-text', parsed.healthStatus, parsed.alternatives);
}

// ─── Plant.id (API gratuite spécialisée plantes) ──────────────────────────────
async function identifyWithPlantId(imageBase64: string, _mediaType = 'image/jpeg') {
  const apiKey = process.env.PLANTID_API_KEY;
  if (!apiKey) throw new Error('PLANTID_API_KEY manquante');

  const res = await fetch('https://plant.id/api/v3/identification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
    body: JSON.stringify({
      images: [`data:image/jpeg;base64,${imageBase64}`],
      similar_images: true,
      classification_level: 'species',
      disease_model: 'full',
    })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Plant.id error: ${res.status} ${errText.slice(0, 200)}`);
  }
  const data = await res.json();

  const suggestions = data.result?.classification?.suggestions || [];
  const top = suggestions[0];
  if (!top) return okResult('Plante non identifiée', 0.1, 'Aucun résultat trouvé.', [], 'plantid');

  const name = `${top.name}` + (top.details?.common_names?.[0] ? ` (${top.details.common_names[0]})` : '');
  const desc = top.details?.description?.value || top.details?.wiki_description?.value || 'Plante identifiée par Plant.id.';
  const care = top.details?.watering ? [`Arrosage : ${top.details.watering}`] : ['Consulter les conseils spécifiques à cette espèce.'];
  // Construire les alternatives depuis les autres suggestions Plant.id
  const plantIdAlternatives = suggestions.slice(1, 5).map((s: any) => {
    const altName = `${s.name}` + (s.details?.common_names?.[0] ? ` (${s.details.common_names[0]})` : '');
    return { plantName: altName, confidence: s.probability || 0.1 };
  });
  return okResult(name, top.probability || 0.5, desc.slice(0, 250), care, 'plantid', { isHealthy: true, diseaseName: 'Sain', severity: 'none', treatment: [], confidence: 0.9 }, plantIdAlternatives);
}

// ─── JSON sécurisé ────────────────────────────────────────────────────────────
const GENERIC_NAMES = /^(plante non identifi|herbe commune|mauvaise herbe|plante similaire|autre plante|plante inconnue|végétal|plante sauvage|herbe|weed|unknown plant|unidentified)/i;

function filterAlternatives(alts: any[]): any[] {
  if (!Array.isArray(alts)) return [];
  return alts.filter(a => a.plantName && !GENERIC_NAMES.test(a.plantName));
}

function safeParseJSON(text: string) {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      parsed.alternatives = filterAlternatives(parsed.alternatives);
      return parsed;
    }
  } catch {}
  return { plantName: 'Non identifié', confidence: 0.1, description: 'Impossible de parser la réponse IA.', careAdvice: [] };
}
