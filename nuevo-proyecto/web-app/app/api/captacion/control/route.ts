import { NextRequest, NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth"

export const dynamic = "force-dynamic"

function vpsHeaders() {
  return { Authorization: `Bearer ${process.env.CAPTACION_CRON_SECRET}` }
}

function vpsUrl(path: string) {
  return `${process.env.CAPTACION_WORKER_URL}${path}`
}

// GET /api/captacion/control?action=status|logs|config&since=<ms>
export async function GET(req: NextRequest) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const workerUrl = process.env.CAPTACION_WORKER_URL
  const workerSecret = process.env.CAPTACION_CRON_SECRET
  if (!workerUrl || !workerSecret) {
    return NextResponse.json({ error: "CAPTACION_WORKER_URL no configurada" }, { status: 503 })
  }

  const action = req.nextUrl.searchParams.get("action") ?? "status"
  const since  = req.nextUrl.searchParams.get("since") ?? "0"

  try {
    let endpoint = "/status"
    if (action === "logs")   endpoint = `/logs?since=${since}`
    if (action === "config") endpoint = "/config"

    const r = await fetch(vpsUrl(endpoint), {
      headers: vpsHeaders(),
      signal: AbortSignal.timeout(5_000),
    })
    const data = await r.json()
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `VPS inaccesible: ${msg}` }, { status: 503 })
  }
}

// POST /api/captacion/control
// body: { action: "scrape"|"send"|"parallel"|"stop"|"followup"|"config"|"custom", payload?: {...} }
export async function POST(req: NextRequest) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const workerUrl = process.env.CAPTACION_WORKER_URL
  const workerSecret = process.env.CAPTACION_CRON_SECRET
  if (!workerUrl || !workerSecret) {
    return NextResponse.json({ error: "CAPTACION_WORKER_URL no configurada" }, { status: 503 })
  }

  const { action, payload } = await req.json()

  const actionMap: Record<string, string> = {
    scrape:   "/trigger/scrape",
    send:     "/trigger/send",
    parallel: "/trigger/parallel",
    stop:     "/stop",
    followup: "/trigger/followup",
    config:   "/config",
    custom:   "/trigger/custom-campaign",
  }

  const endpoint = actionMap[action]
  if (!endpoint) return NextResponse.json({ error: "Acción desconocida" }, { status: 400 })

  try {
    const r = await fetch(vpsUrl(endpoint), {
      method: "POST",
      headers: { ...vpsHeaders(), "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(8_000),
    })
    const data = await r.json()
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `VPS inaccesible: ${msg}` }, { status: 503 })
  }
}
