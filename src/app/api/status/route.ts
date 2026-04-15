/**
 * GET /api/status — proxy to AI microservice (port 3001)
 */
const MICRO_URL = process.env.MICRO_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${MICRO_URL}/status`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
