import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!process.env.CAPTACION_WORKER_URL || !process.env.CAPTACION_CRON_SECRET) {
    return NextResponse.json({ error: 'Worker no configurado' }, { status: 500 })
  }

  try {
    const res = await fetch(`${process.env.CAPTACION_WORKER_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${process.env.CAPTACION_CRON_SECRET}`,
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Worker no responde' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}