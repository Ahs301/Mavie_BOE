import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth"

const BREVO_BASE = "https://api.brevo.com/v3"

export async function GET(request: Request) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "BREVO_API_KEY not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") || "50"
  const offset = searchParams.get("offset") || "0"

  try {
    const res = await fetch(`${BREVO_BASE}/contacts?limit=${limit}&offset=${offset}&sort=desc`, {
      headers: { "api-key": apiKey, "Accept": "application/json" },
      next: { revalidate: 120 },
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
