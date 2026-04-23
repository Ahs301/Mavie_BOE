import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!process.env.CAPTACION_WORKER_URL || !process.env.CAPTACION_CRON_SECRET) {
    return NextResponse.json({ error: 'Worker no configurado' }, { status: 500 })
  }

  try {
    // Health check primero para determinar si el worker está online
    const health = await fetch(`${process.env.CAPTACION_WORKER_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    })
    if (!health.ok) {
      return NextResponse.json({ error: 'Worker no responde' }, { status: 502 })
    }

    // Stats opcionales — si fallan, devuelve zeros (DB vacía es normal al inicio)
    try {
      const res = await fetch(`${process.env.CAPTACION_WORKER_URL}/stats`, {
        headers: { 'Authorization': `Bearer ${process.env.CAPTACION_CRON_SECRET}` },
        signal: AbortSignal.timeout(8_000),
      })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {}

    // Worker online pero sin stats aún
    return NextResponse.json({ stats: { total: 0, pending: 0, sent: 0, replied: 0, bounced: 0, opened: 0, clicked: 0 } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}