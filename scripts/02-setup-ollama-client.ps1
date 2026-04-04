param([string]C:\Users\Administrateur\Desktop\BotanIA)
 = "C:\Users\Administrateur\Desktop\BotanIA/src/lib/ollama-client.ts"
 = Split-Path  -Parent
if (-not (Test-Path )) { New-Item -ItemType Directory -Path  -Force | Out-Null }
 = @'
// src/lib/ollama-client.ts — Généré automatiquement
import { Ollama } from 'ollama';

export interface OllamaConfig {
  model: string; baseUrl?: string; systemPrompt?: string; temperature?: number;
}

export class OllamaGardeningAssistant {
  private client: Ollama; private config: OllamaConfig;
  constructor(config: OllamaConfig) {
    this.client = new Ollama({ host: config.baseUrl || 'http://localhost:11434' });
    this.config = { temperature: 0.3, ...config };
  }
  async getGardeningAdvice(ctx: { plantName: string; stage: number; season: string; weather: string; zone: 'pepiniere'|'serre'|'jardin'; question?: string }): Promise<string> {
    const prompt = [
      🌱 Plante : , 📊 Stade : /5,
      🗓️ Saison : , 🌤️ Météo : , 🏡 Zone : ,
      ...(ctx.question ? [❓ Question : ] : [])
    ].join('\\n') + '\\n\\nDonne un conseil court, pratique et bienveillant.';
    const response = await this.client.chat({
      model: this.config.model,
      messages: [
        { role: 'system', content: this.config.systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      options: { temperature: this.config.temperature, num_predict: 256 }
    });
    return response.message.content.trim();
  }
}

export const DEFAULT_SYSTEM_PROMPT = Tu es BotanIA, expert en jardinage biologique français.
- Réponses courtes (max 3 phrases), bienveillantes et pratiques
- Base-toi sur les données botaniques réelles (INRAE, FAO)
- Adapte tes conseils à la saison, météo, zone de culture
- Jamais de pesticides chimiques • Emojis modérés : 🌱💧☀️🌿
- Explique simplement si débutant • Priorité : santé > esthétique > rapidité;
'@
Set-Content -Path  -Value  -Encoding UTF8
Write-Host "  ✅ ollama-client.ts créé" -ForegroundColor Green
Set-Location C:\Users\Administrateur\Desktop\BotanIA
if (Get-Command bun -ErrorAction SilentlyContinue) { bun add ollama } else { npm install ollama }
