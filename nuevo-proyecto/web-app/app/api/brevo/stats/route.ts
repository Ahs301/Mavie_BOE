import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth"

const BREVO_BASE = "https://api.brevo.com/v3"

export async function GET() {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "BREVO_API_KEY not configured" }, { status: 503 })
  }

  try {
    // Get aggregated transactional stats (last 30 days by default)
    const res = await fetch(`${BREVO_BASE}/smtp/statistics/aggregatedReport`, {
      headers: { "api-key": apiKey, "Accept": "application/json" },
      next: { revalidate: 300 }, // cache 5 min
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Network error" }, { status: 500 })
  }
}
