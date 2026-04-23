import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.CAPTACION_WORKER_URL
  if (!url) {
    return NextResponse.json({ online: false, error: 'CAPTACION_WORKER_URL no configurada' })
  }
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5_000) })
    const data = await res.json()
    return NextResponse.json({ online: data.ok === true })
  } catch {
    return NextResponse.json({ online: false })
  }
}
