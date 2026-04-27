import { NextResponse } from "next/server"
import { ImapFlow } from "imapflow"
import { simpleParser } from "mailparser"

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = process.env.IMAP_USER || "mavie.contact.dev@gmail.com"
  const pass = process.env.IMAP_PASS
  
  if (!pass) {
    return NextResponse.json(
      { error: "Falta IMAP_PASS en .env.local (Crea una Contraseña de Aplicación en Google para mavie.contact.dev@gmail.com)" },
      { status: 500 }
    )
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  })

  try {
    await client.connect()
    
    const lock = await client.getMailboxLock('INBOX')
    const messages = []
    
    try {
      const total = client.mailbox.exists
      if (total > 0) {
        const start = Math.max(1, total - 19) // Last 20 emails
        
        const msgs = client.fetch(`${start}:*`, { source: true, envelope: true })
        const arr = []
        for await (const msg of msgs) {
          arr.push(msg)
        }
        
        // Newest first
        const recent = arr.reverse()
        
        for (const msg of recent) {
          if (!msg.source) continue;
          const parsed = await simpleParser(msg.source)
          
          messages.push({
            uid: msg.uid,
            from: parsed.from?.text || "",
            fromAddress: parsed.from?.value?.[0]?.address || "",
            subject: parsed.subject || "Sin asunto",
            date: parsed.date?.toISOString() || new Date().toISOString(),
            text: parsed.text || "",
            html: parsed.html || "",
          })
        }
      }
    } finally {
      lock.release()
    }
    
    await client.logout()
    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
