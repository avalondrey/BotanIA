import { NextResponse } from 'next/server';

// ─── Route API : Statut de connexion des moteurs d'identification ──────────
// Vérifie côté serveur quelles clés API sont configurées et si les services locaux répondent.

export const runtime = 'edge';

export async function GET() {
  const status: Record<string, { online: boolean; label: string; detail?: string }> = {};

  // Groq — vérifie la clé API
  const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  status.groq = {
    online: !!groqKey,
    label: 'Groq IA',
    detail: groqKey ? 'Clé configurée' : 'NEXT_PUBLIC_GROQ_API_KEY manquante',
  };

  // Google Gemini — vérifie la clé API
  const geminiKey = process.env.GEMINI_API_KEY;
  status.gemini = {
    online: !!geminiKey,
    label: 'Google Gemini',
    detail: geminiKey ? 'Clé configurée' : 'GEMINI_API_KEY manquante — gratuite sur https://aistudio.google.com/apikey',
  };

  // Ollama — ping le service local
  try {
    const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
    const res = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    status.ollama = { online: res.ok, label: 'Ollama Local', detail: res.ok ? 'Service actif' : 'Service injoignable' };
  } catch {
    status.ollama = { online: false, label: 'Ollama Local', detail: 'Service non disponible' };
  }

  // Plant.id — vérifie la clé API
  const plantIdKey = process.env.PLANTID_API_KEY;
  status.plantid = {
    online: !!plantIdKey,
    label: 'Plant.id',
    detail: plantIdKey ? 'Clé configurée' : 'PLANTID_API_KEY manquante dans .env.local',
  };

  return NextResponse.json(status);
}