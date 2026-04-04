export async function getPlantAdviceSafe(
  plantName: string,
  stage: number,
  season: string,
  weather: string,
  zone: 'pepiniere' | 'serre' | 'jardin',
  question?: string
): Promise<string> {
  try {
    const res = await fetch('/api/ollama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plantName, stage, season, weather, zone, question })
    });
    const data = await res.json();
    return data.success ? data.advice : `⚠️ ${data.error}`;
  } catch {
    return "❌ Impossible de joindre l'assistant.";
  }
}
