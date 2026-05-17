import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 30

export async function GET() {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPass) {
    return NextResponse.json({ configured: false, messages: [] })
  }

  // Cross-reference with leads in DB
  const supabase = createAdminClient()
  const { data: leads } = await supabase
    .from("leads")
    .select("id, email, contact_name, status, source")
  const leadMap = new Map(
    (leads || []).map((l) => [l.email.toLowerCase().trim(), l])
  )

  let ImapFlow: typeof import("imapflow").ImapFlow
  let simpleParser: typeof import("mailparser").simpleParser
  try {
    const imap = await import("imapflow")
    const mp = await import("mailparser")
    ImapFlow = imap.ImapFlow
    simpleParser = mp.simpleParser
  } catch {
    return NextResponse.json({ configured: false, error: "imapflow no disponible" }, { status: 500 })
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
    logger: false,
    tls: { rejectUnauthorized: true },
  })

  try {
    await client.connect()
    const mailbox = await client.mailboxOpen("INBOX")
    const total = mailbox.exists ?? 0

    if (total === 0) {
      await client.logout()
      return NextResponse.json({ configured: true, messages: [] })
    }

    const from = Math.max(1, total - 24) // last 25 messages
    const messages: GmailMessage[] = []

    for await (const msg of client.fetch(`${from}:*`, {
      envelope: true,
      flags: true,
      // Fetch first 5KB of source for snippet extraction
      source: { start: 0, maxLength: 5120 },
    } as Parameters<typeof client.fetch>[1])) {
      try {
        const parsed = await simpleParser(msg.source as Buffer)
        const fromEmail =
          parsed.from?.value?.[0]?.address?.toLowerCase().trim() ?? ""
        const lead = leadMap.get(fromEmail) ?? null

        messages.push({
          uid: msg.uid,
          seq: msg.seq,
          from: parsed.from?.text ?? "",
          fromEmail,
          subject: parsed.subject ?? "(sin asunto)",
          date: parsed.date?.toISOString() ?? new Date().toISOString(),
          snippet: (parsed.text ?? "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 180),
          isUnread: !(msg.flags as Set<string>).has("\\Seen"),
          isLead: lead !== null,
          leadId: lead?.id ?? null,
          leadName: lead?.contact_name ?? null,
          leadStatus: lead?.status ?? null,
        })
      } catch {
        // skip unparseable messages
      }
    }

    await client.logout()
    messages.reverse() // newest first

    return NextResponse.json({ configured: true, messages })
  } catch (err) {
    try { await client.logout() } catch { /* ignore */ }
    return NextResponse.json(
      { configured: true, error: (err as Error).message ?? "Error IMAP" },
      { status: 500 }
    )
  }
}

interface GmailMessage {
  uid: number
  seq: number
  from: string
  fromEmail: string
  subject: string
  date: string
  snippet: string
  isUnread: boolean
  isLead: boolean
  leadId: string | null
  leadName: string | null
  leadStatus: string | null
}
