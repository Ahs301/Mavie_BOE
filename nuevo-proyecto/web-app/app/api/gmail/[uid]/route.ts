import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/auth"


export const maxDuration = 30

export async function GET(
  _request: Request,
  { params }: { params: { uid: string } }
) {
  const auth = await requireAdminApi()
  if (auth instanceof NextResponse) return auth

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailUser || !gmailPass) {
    return NextResponse.json({ error: "Gmail no configurado" }, { status: 503 })
  }

  const uid = parseInt(params.uid, 10)
  if (isNaN(uid)) {
    return NextResponse.json({ error: "UID inválido" }, { status: 400 })
  }

  let ImapFlow: typeof import("imapflow").ImapFlow
  let simpleParser: typeof import("mailparser").simpleParser
  try {
    const imap = await import("imapflow")
    const mp = await import("mailparser")
    ImapFlow = imap.ImapFlow
    simpleParser = mp.simpleParser
  } catch {
    return NextResponse.json({ error: "imapflow no disponible" }, { status: 500 })
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
    await client.mailboxOpen("INBOX")

    let html: string | null = null
    let text: string | null = null
    let subject = ""
    let from = ""
    let date = ""

    for await (const msg of client.fetch(
      `${uid}` as unknown as Parameters<typeof client.fetch>[0],
      { source: true, uid: true }
    )) {
      const parsed = await simpleParser(msg.source as Buffer)
      html = parsed.html || null
      text = parsed.text || null
      subject = parsed.subject ?? ""
      from = parsed.from?.text ?? ""
      date = parsed.date?.toISOString() ?? ""
    }

    // Mark as read
    try {
      await client.messageFlagsAdd(`${uid}` as unknown as Parameters<typeof client.messageFlagsAdd>[0], ["\\Seen"], { uid: true })
    } catch { /* best effort */ }

    await client.logout()
    return NextResponse.json({ subject, from, date, html, text })
  } catch (err) {
    try { await client.logout() } catch { /* ignore */ }
    return NextResponse.json(
      { error: (err as Error).message ?? "Error IMAP" },
      { status: 500 }
    )
  }
}
