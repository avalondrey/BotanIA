import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, submission, apiKey } = await req.json();

    if (action === 'submit') {
      const res = await fetch('https://www.inaturalist.org/observations.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${apiKey}`,
        },
        body: JSON.stringify(submission),
      });
      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data?.error || 'iNaturalist submission failed' }, { status: res.status });
      }
      return NextResponse.json({ success: true, observation_id: data?.id });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
