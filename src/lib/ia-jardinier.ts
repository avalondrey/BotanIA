/**
 * IA JARDINIER — Conseils géolocalisés & contextuels
 * Groq llama-3.3-70b + GDD + Météo dynamique + Compagnonnage
 */

import { getGDDConfig, calcDailyGDD, getStageProgressFromGDD } from './gdd-engine';
import { calcMildewRisk, calcPowderyMildewRisk } from './weather-dynamics';
import { analyzeCompanions, COMPANION_BADGES, checkCompanionBadges } from './companion-matrix';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
// Via proxy /api/agent/chat (évite CORS navigateur → localhost:11434)
const OLLAMA_PROXY = '/api/agent/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:7b';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlantContext {
  plantDefId: string;
  name: string;
  stage: number;
  daysSincePlanting: number;
  waterLevel: number;
  health: number;
  hasDisease?: boolean;
  hasPest?: boolean;
  x?: number;
  y?: number;
}

export interface JardinContext {
  plantes: PlantContext[];
  meteo: {
    temperature: number;
    tMin?: number;
    tMax?: number;
    precipitation?: number;
    precipLast48h?: number;
    humidity?: number;
    windSpeed?: number;
    conditions: string;
  };
  saison: string;
  jour: number;
  gpsCoords?: { lat: number; lon: number };
  /** Moteur préféré : 'groq' | 'ollama' (défaut: groq si clé dispo, sinon ollama) */
  engine?: 'groq' | 'ollama';
}

export interface IAResponse {
  conseil: string;
  actions: string[];
  priorite: 'haute' | 'moyenne' | 'basse';
  /** Alertes phytosanitaires prédictives */
  alertes?: string[];
  /** Badges compagnonnage débloqués */
  badges?: string[];
  /** Source IA utilisée */
  source?: string;
}

// ─── Calculs physiques locaux (avant appel IA) ────────────────────────────────

function buildPhysicsContext(ctx: JardinContext): {
  gddLines: string[];
  diseaseRisks: string[];
  companionLines: string[];
  badgeIds: string[];
  geoLine: string;
} {
  const tMean = ctx.meteo.temperature;
  const tMin  = ctx.meteo.tMin  ?? tMean - 4;
  const tMax  = ctx.meteo.tMax  ?? tMean + 4;
  const hum   = ctx.meteo.humidity ?? 65;
  const prec48 = ctx.meteo.precipLast48h ?? (ctx.meteo.precipitation ?? 0) * 1.5;
  const wind   = ctx.meteo.windSpeed ?? 10;

  // ── GDD par plante ──
  const gddLines = ctx.plantes.map(p => {
    const cfg  = getGDDConfig(p.plantDefId);
    const gdd  = calcDailyGDD(tMean, tMin, tMax, cfg);
    return `  ${p.name} : +${gdd.toFixed(1)} GDD aujourd'hui (base ${cfg.tBase}°C, plafond ${cfg.tCap}°C)`;
  });

  // ── Risques phytosanitaires ──
  const mildewRisk = calcMildewRisk(hum, tMean, prec48);
  const powderyRisk = calcPowderyMildewRisk(hum, tMean, wind);
  const diseaseRisks: string[] = [];
  if (mildewRisk > 0.6)      diseaseRisks.push(`⚠️ Risque mildiou ÉLEVÉ (score ${(mildewRisk*100).toFixed(0)}%) — conditions : humidité ${hum}%, pluie 48h ${prec48.toFixed(0)}mm`);
  else if (mildewRisk > 0.3) diseaseRisks.push(`⚡ Risque mildiou modéré (score ${(mildewRisk*100).toFixed(0)}%)`);
  if (powderyRisk > 0.6)     diseaseRisks.push(`⚠️ Risque oïdium ÉLEVÉ (score ${(powderyRisk*100).toFixed(0)}%) — temps chaud et sec`);
  else if (powderyRisk > 0.3) diseaseRisks.push(`⚡ Risque oïdium modéré (score ${(powderyRisk*100).toFixed(0)}%)`);

  // ── Compagnonnage ──
  const plantsWithPos = ctx.plantes
    .filter(p => p.x !== undefined && p.y !== undefined)
    .map(p => ({ plantDefId: p.plantDefId, x: p.x!, y: p.y! }));

  const { beneficial, harmful, score } = analyzeCompanions(plantsWithPos);
  const companionLines: string[] = [];
  if (beneficial.length > 0) {
    companionLines.push(`✅ ${beneficial.length} association(s) bénéfique(s) actives`);
    beneficial.slice(0, 2).forEach(r => companionLines.push(`   → ${r.reason}`));
  }
  if (harmful.length > 0) {
    companionLines.push(`❌ ${harmful.length} association(s) néfaste(s) détectée(s)`);
    harmful.slice(0, 2).forEach(r => companionLines.push(`   → ${r.reason}`));
  }

  // ── Badges ──
  const badgeIds = checkCompanionBadges(plantsWithPos);
  const badgeLines = badgeIds.map(id => {
    const b = COMPANION_BADGES.find(x => x.id === id);
    return b ? `${b.emoji} ${b.label}` : id;
  });

  // ── Géolocalisation ──
  let geoLine = 'Localisation non disponible';
  if (ctx.gpsCoords) {
    // Sécurisation : lat/lon peuvent être un objet GPSCoords ou GeolocationCoordinates
    const raw = ctx.gpsCoords as any;
    const lat = typeof raw.lat === 'number' ? raw.lat
              : typeof raw.latitude === 'number' ? raw.latitude
              : null;
    const lon = typeof raw.lon === 'number' ? raw.lon
              : typeof raw.longitude === 'number' ? raw.longitude
              : null;
    if (lat !== null && lon !== null) {
      let zone = 'continentale';
      if (lat < 44)      zone = 'méditerranéenne';
      else if (lat < 46) zone = 'semi-méditerranéenne';
      else if (lat > 49) zone = 'océanique nord';
      else               zone = 'océanique';
      geoLine = `Latitude ${lat.toFixed(2)}°N — Zone climatique : ${zone}`;
    }
  }

  return { gddLines, diseaseRisks, companionLines, badgeIds: badgeLines, geoLine };
}

// ─── Construction du prompt géolocalisé ──────────────────────────────────────

function buildPrompt(ctx: JardinContext): string {
  const phys = buildPhysicsContext(ctx);

  const plantLines = ctx.plantes.map(p => {
    const cfg  = getGDDConfig(p.plantDefId);
    const gdd  = calcDailyGDD(
      ctx.meteo.temperature,
      ctx.meteo.tMin ?? ctx.meteo.temperature - 4,
      ctx.meteo.tMax ?? ctx.meteo.temperature + 4,
      cfg
    );
    const alerts: string[] = [];
    if (p.waterLevel < 25) alerts.push('💧 SOIF CRITIQUE');
    if (p.health < 40)     alerts.push('🚨 SANTÉ FAIBLE');
    if (p.hasDisease)      alerts.push('🦠 MALADIE');
    if (p.hasPest)         alerts.push('🐛 RAVAGEURS');
    return `  • ${p.name} — stade ${p.stage}/5, J${p.daysSincePlanting}, eau ${p.waterLevel}%, santé ${p.health}%, +${gdd.toFixed(1)} GDD${alerts.length ? ' [' + alerts.join(', ') + ']' : ''}`;
  }).join('\n');

  const gddSection = phys.gddLines.length
    ? `\nGDD DU JOUR (Degrés-Jours Croissance) :\n${phys.gddLines.join('\n')}`
    : '';

  const diseaseSection = phys.diseaseRisks.length
    ? `\nALERTES PHYTOSANITAIRES PRÉDICTIVES :\n${phys.diseaseRisks.join('\n')}`
    : '';

  const companionSection = phys.companionLines.length
    ? `\nCOMPAGNONNAGE BOTANIQUE :\n${phys.companionLines.join('\n')}`
    : '';

  return `Tu es BotanIA, conseiller agricole expert en maraîchage biologique français.
Tu travailles avec des DONNÉES RÉELLES — aucune approximation, aucun bonus fictif.

LOCALISATION : ${phys.geoLine}
SAISON : ${ctx.saison} | JOUR : ${ctx.jour}
MÉTÉO : ${ctx.meteo.temperature}°C (min ${ctx.meteo.tMin ?? '?'}°C / max ${ctx.meteo.tMax ?? '?'}°C), ${ctx.meteo.conditions}
Humidité : ${ctx.meteo.humidity ?? '?'}% | Précipitations : ${ctx.meteo.precipitation ?? 0}mm | Vent : ${ctx.meteo.windSpeed ?? '?'} km/h
${gddSection}
${diseaseSection}

ÉTAT DES PLANTES :
${plantLines || '  (aucune plante en cours)'}
${companionSection}

MISSION — Réponds en JSON strict UNIQUEMENT :
{
  "conseil": "1 conseil prioritaire précis et actionnable, basé sur les données ci-dessus (2-3 phrases max)",
  "actions": ["action concrète 1", "action concrète 2", "action concrète 3"],
  "priorite": "haute|moyenne|basse",
  "alertes": ["alerte phytosanitaire si risque > 60%, sinon tableau vide"]
}

RÈGLES :
- Cite toujours une valeur réelle (température, GDD, humidité) dans ton conseil
- Si risque maladie élevé : anticipe AVANT les symptômes
- Si mauvaise association botanique : suggère un repositionnement
- Si GDD insuffisants : explique pourquoi attendre${ctx.gpsCoords ? '\n- Tiens compte de la zone climatique locale pour les dates' : ''}`;
}

// ─── Parser JSON sécurisé ─────────────────────────────────────────────────────

function safeParseIA(text: string): IAResponse {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    const p = JSON.parse(match[0]);
    return {
      conseil:  p.conseil  || 'Données insuffisantes pour un conseil.',
      actions:  Array.isArray(p.actions) ? p.actions : [],
      priorite: ['haute','moyenne','basse'].includes(p.priorite) ? p.priorite : 'moyenne',
      alertes:  Array.isArray(p.alertes) ? p.alertes.filter(Boolean) : [],
    };
  } catch {
    return { conseil: 'Erreur de parsing IA.', actions: [], priorite: 'basse', alertes: [] };
  }
}

// ─── Appel Groq ───────────────────────────────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'Expert maraîchage biologique français. JSON UNIQUEMENT, aucun texte avant ou après.' },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.25,
      max_tokens: 600,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || '';
}

// ─── Appel Ollama local ───────────────────────────────────────────────────────

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(OLLAMA_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: 'Expert maraîchage biologique. JSON uniquement.' },
        { role: 'user',   content: prompt },
      ],
      options: { temperature: 0.25, num_predict: 600 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(`Ollama proxy ${res.status}: ${err.error || res.statusText}`);
  }
  const d = await res.json();
  return d.message?.content || '';
}

// ─── API principale ───────────────────────────────────────────────────────────

/**
 * Conseil quotidien géolocalisé avec GDD, météo dynamique et compagnonnage.
 * Sélection auto du moteur : Groq → Ollama → fallback statique.
 */
export async function getConseilQuotidien(ctx: JardinContext): Promise<IAResponse> {
  // Calculs physiques locaux (toujours faits, quelle que soit l'IA)
  const phys   = buildPhysicsContext(ctx);
  const prompt = buildPrompt(ctx);

  // Badges compagnonnage (calcul local, indépendant de l'IA)
  const plantsWithPos = ctx.plantes
    .filter(p => p.x !== undefined && p.y !== undefined)
    .map(p => ({ plantDefId: p.plantDefId, x: p.x!, y: p.y! }));
  const badgeIds = checkCompanionBadges(plantsWithPos);
  const badges = badgeIds.map(id => {
    const b = COMPANION_BADGES.find(x => x.id === id);
    return b ? `${b.emoji} ${b.label} — ${b.description}` : id;
  });

  // Alertes phyto pré-calculées (même si l'IA ne répond pas)
  const alertesPrecalc = phys.diseaseRisks;

  // Sélection moteur
  const engine = ctx.engine ?? (GROQ_API_KEY ? 'groq' : 'ollama');

  try {
    let raw = '';
    let source: 'groq' | 'ollama' | 'groq-fallback' = engine;

    if (engine === 'groq' && GROQ_API_KEY) {
      raw = await callGroq(prompt);
    } else if (engine === 'ollama' || !GROQ_API_KEY) {
      try {
        raw = await callOllama(prompt);
        source = 'ollama';
      } catch {
        // Ollama non disponible → fallback Groq si clé dispo
        if (GROQ_API_KEY) { raw = await callGroq(prompt); source = 'groq-fallback'; }
        else throw new Error('Aucun moteur IA disponible');
      }
    }

    const parsed = safeParseIA(raw);
    return {
      ...parsed,
      alertes: [...(parsed.alertes ?? []), ...alertesPrecalc].filter((v, i, a) => a.indexOf(v) === i),
      badges,
      source,
    };
  } catch (err) {
    console.error('[IAJardinier] Erreur:', err);
    // Fallback : retourne les calculs physiques locaux sans IA
    return {
      conseil: `Météo locale : ${ctx.meteo.temperature}°C. ${alertesPrecalc[0] || 'Vérifiez l\'état de vos plantes.'}`,
      actions: [
        'Vérifiez le niveau d\'eau de chaque plante',
        alertesPrecalc[0] ? 'Traitez préventivement contre les maladies détectées' : 'Observez les feuilles pour détecter des signes précoces',
        'Notez les observations dans votre journal de jardin',
      ],
      priorite: alertesPrecalc.length > 0 ? 'haute' : 'moyenne',
      alertes: alertesPrecalc,
      badges,
      source: 'local-fallback',
    };
  }
}

// ─── Diagnostic plante ────────────────────────────────────────────────────────

export async function diagnostiquerPlante(
  planteName: string,
  symptoms: string[],
  context: Partial<JardinContext>
): Promise<{ diagnostic: string; traitement: string[]; urgence: boolean }> {

  const fallback = { diagnostic: 'IA non disponible', traitement: ['Réessaye plus tard'], urgence: false };

  const prompt = `Diagnostic plante : ${planteName}

SYMPTÔMES :
${symptoms.map(s => `- ${s}`).join('\n')}

CONTEXTE :
- Saison : ${context.saison || 'inconnue'}
- Température : ${context.meteo?.temperature ?? '?'}°C
- Humidité : ${context.meteo?.humidity ?? '?'}%

Réponds en JSON strict :
{
  "diagnostic": "cause probable précise",
  "traitement": ["action bio 1", "action bio 2", "prévention future"],
  "urgence": true|false
}`;

  try {
    let raw = '';
    if (GROQ_API_KEY) {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'Expert phytopathologie bio. JSON uniquement.' },
            { role: 'user',   content: prompt },
          ],
          temperature: 0.2, max_tokens: 400,
        }),
      });
      const d = await res.json();
      raw = d.choices?.[0]?.message?.content || '';
    } else {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });
      const d = await res.json();
      raw = d.message?.content || '';
    }

    const clean  = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match  = clean.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : {};
    return {
      diagnostic: parsed.diagnostic || 'Diagnostic indisponible',
      traitement: Array.isArray(parsed.traitement) ? parsed.traitement : [],
      urgence:    !!parsed.urgence,
    };
  } catch {
    return fallback;
  }
}
