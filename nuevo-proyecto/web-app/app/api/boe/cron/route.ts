import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workerUrl = process.env.BOE_WORKER_URL;
  if (!workerUrl) {
    return NextResponse.json({ error: 'BOE_WORKER_URL no configurado' }, { status: 500 });
  }

  try {
    const res = await fetch(`${workerUrl}/trigger`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: `Worker respondió ${res.status}: ${body}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true, message: 'Worker disparado' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Cron BOE] Error al llamar al worker:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
