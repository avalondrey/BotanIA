/**
 * POST /api/scan/plants/register — proxy to AI microservice (port 3001)
 * Supporte JSON et FormData (upload de fichier)
 */
const MICRO_URL = process.env.MICRO_URL || 'http://localhost:3001';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // FormData: lire avec formData() puis reconstruire pour le forward
      const formData = await req.formData();

      // Recreer un FormData pour le microservice
      const microFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        microFormData.append(key, value);
      }

      const res = await fetch(`${MICRO_URL}/scan/plants/register`, {
        method: 'POST',
        body: microFormData,
        signal: AbortSignal.timeout(60000),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // JSON: forward direct
      const body = await req.json();
      const res = await fetch(`${MICRO_URL}/scan/plants/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
