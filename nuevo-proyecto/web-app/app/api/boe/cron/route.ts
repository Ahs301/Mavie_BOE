import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// ─── BOE API ────────────────────────────────────────────────
const BOE_API_BASE = 'https://www.boe.es/datosabiertos/api/boe/sumario'
const SKIP_SECTIONS = ['AUTORIDADES Y PERSONAL', 'JUSTICIA', 'ANUNCIOS PARTICULARES']

function getDateString() {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
}

function cleanText(text: unknown): string {
  if (!text) return ''
  return String(text).replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
}

function extractItems(depto: Record<string, unknown>): unknown[] {
  if (depto.item) return Array.isArray(depto.item) ? depto.item : [depto.item]
  if (depto.epigrafe) {
    const epigrafes = Array.isArray(depto.epigrafe) ? depto.epigrafe : [depto.epigrafe]
    return (epigrafes as Record<string, unknown>[]).flatMap((epi) => {
      if (!epi.item) return []
      return Array.isArray(epi.item) ? epi.item : [epi.item]
    })
  }
  return []
}

function parseBoe(data: unknown): BoeItem[] {
  const items: BoeItem[] = []
  try {
    const raw = data as Record<string, unknown>
    const sumario = (raw.data as Record<string, unknown>)?.sumario ?? (raw as Record<string, unknown>).sumario
    if (!sumario) return []
    const s = sumario as Record<string, unknown>
    if (!s.diario) return []
    const diarios = Array.isArray(s.diario) ? s.diario : [s.diario]
    const meta = s.metadatos as Record<string, unknown> | undefined
    const publicationDate = (meta?.fecha_publicacion as string) || getDateString()

    for (const diario of diarios) {
      if (!diario) continue
      const d = diario as Record<string, unknown>
      const rawSecciones = d.seccion
      const secciones = Array.isArray(rawSecciones) ? rawSecciones : [rawSecciones].filter(Boolean)

      for (const seccion of secciones) {
        if (!seccion) continue
        const sec = seccion as Record<string, unknown>
        const seccionNombre = String(sec.nombre ?? '').toUpperCase()
        if (SKIP_SECTIONS.some((s) => seccionNombre.includes(s))) continue

        const rawDeptos = sec.departamento
        const deptos = Array.isArray(rawDeptos) ? rawDeptos : [rawDeptos].filter(Boolean)

        for (const depto of deptos) {
          if (!depto) continue
          const itemsList = extractItems(depto as Record<string, unknown>)

          for (const item of itemsList) {
            if (!item) continue
            const it = item as Record<string, unknown>
            if (!it.titulo) continue

            const pdfPath = String((it.url_pdf as Record<string, unknown>)?.texto ?? it.url_pdf ?? '')
            const htmlPath = String((it.url_html as Record<string, unknown>)?.texto ?? it.url_html ?? '')
            const title = cleanText(it.titulo)
            const description = cleanText(it.texto ?? it.titulo)
            const budgetMatch = description.match(/(\d+(?:[\.,]\d+)*\s?€)/)
            const deadlineMatch = description.match(/(?:plazo|duración)\s(?:de\s)?(\d+\s(?:días|meses|años))/i)

            items.push({
              title,
              description,
              url: htmlPath || pdfPath || '',
              pdf_url: pdfPath || '',
              publication_date: publicationDate,
              section: String(sec.nombre ?? ''),
              budget: budgetMatch ? budgetMatch[0] : null,
              deadline: deadlineMatch ? deadlineMatch[1] : null,
            })
          }
        }
      }
    }
  } catch (err) {
    console.error('[Cron] Error parseando BOE:', err)
  }
  return items
}

// ─── Tipos ──────────────────────────────────────────────────
interface BoeItem {
  title: string
  description: string
  url: string
  pdf_url: string
  publication_date: string
  section: string
  budget: string | null
  deadline: string | null
}

// ─── Filtrado ────────────────────────────────────────────────
function normalizeText(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
}

function filterItems(items: BoeItem[], positive: string[], negative: string[]): BoeItem[] {
  const pos = (positive || []).map(normalizeText).filter(Boolean)
  const neg = (negative || []).map(normalizeText).filter(Boolean)
  return items.filter((item) => {
    const text = normalizeText(`${item.title} ${item.description}`)
    if (neg.some((k) => text.includes(k))) return false
    if (pos.length === 0) return true
    return pos.some((k) => text.includes(k))
  })
}

// ─── Email via Brevo API ─────────────────────────────────────
function buildEmailHtml(items: BoeItem[], companyName: string): string {
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const todayFmt = today.charAt(0).toUpperCase() + today.slice(1)

  const catColors: Record<string, { bg: string; border: string; text: string; emoji: string; label: string }> = {
    subvenci: { bg: '#E8F5E9', border: '#4CAF50', text: '#1B5E20', emoji: '💰', label: 'SUBVENCIÓN' },
    licitaci: { bg: '#E3F2FD', border: '#1E88E5', text: '#0D47A1', emoji: '📋', label: 'LICITACIÓN' },
    convocatoria: { bg: '#FFF8E1', border: '#FFA000', text: '#E65100', emoji: '📣', label: 'CONVOCATORIA' },
    ayuda: { bg: '#F3E5F5', border: '#8E24AA', text: '#4A148C', emoji: '🤝', label: 'AYUDA' },
  }

  function getCat(title: string) {
    const t = title.toLowerCase()
    for (const [key, style] of Object.entries(catColors)) {
      if (t.includes(key)) return style
    }
    return { bg: '#F5F5F5', border: '#9E9E9E', text: '#424242', emoji: '📌', label: 'BOE' }
  }

  const cards = items.map((item, i) => {
    const cat = getCat(item.title)
    const desc = item.description.substring(0, 350) + (item.description.length > 350 ? '…' : '')
    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid #E0E0E0;background:#FFF;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr><td style="background:${cat.border};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:20px 24px;">
        <div style="margin-bottom:10px;">
          <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:1px;background:${cat.bg};color:${cat.text};border:1px solid ${cat.border};">${cat.emoji}&nbsp;&nbsp;${cat.label}</span>
          &nbsp;<span style="font-size:11px;color:#BDBDBD;font-weight:600;">Nº ${i + 1} de ${items.length}</span>
        </div>
        <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#1A237E;line-height:1.4;">${item.title}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFE;border-left:4px solid ${cat.border};border-radius:0 8px 8px 0;margin-bottom:14px;">
          <tr><td style="padding:10px 14px;"><p style="margin:0;font-size:13px;color:#37474F;line-height:1.6;">${desc}</p></td></tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${item.url ? `<td style="padding-right:8px;"><a href="${item.url}" style="display:inline-block;padding:8px 18px;background:#1E88E5;color:#FFF;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">🔗 Ver convocatoria</a></td>` : ''}
            ${item.pdf_url ? `<td><a href="${item.pdf_url}" style="display:inline-block;padding:8px 18px;background:#FFF;color:#E53935;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;border:2px solid #E53935;">📄 PDF</a></td>` : ''}
          </tr>
        </table>
      </td></tr>
    </table>`
  }).join('\n')

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Radar BOE</title></head>
<body style="margin:0;padding:0;background:#F0F2F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0F2F5;padding:30px 10px;">
  <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;margin:0 auto;">
    <tr><td style="background:linear-gradient(135deg,#1B5E20 0%,#2E7D32 60%,#388E3C 100%);border-radius:12px 12px 0 0;padding:32px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td><p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;">${companyName} · Radar BOE</p>
          <h1 style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:#FFF;">🎯 Nuevas oportunidades detectadas</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);">${todayFmt}</p></td>
        <td align="right" valign="middle" style="padding-left:20px;white-space:nowrap;">
          <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:14px 20px;text-align:center;">
            <p style="margin:0;font-size:36px;font-weight:900;color:#FFF;line-height:1;">${items.length}</p>
            <p style="margin:4px 0 0 0;font-size:11px;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.5px;">oportunidad${items.length !== 1 ? 'es' : ''}</p>
          </div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#FFF;padding:24px 24px 8px 24px;border-left:1px solid #E0E0E0;border-right:1px solid #E0E0E0;">${cards}</td></tr>
    <tr><td style="background:#263238;border-radius:0 0 12px 12px;padding:24px 36px;text-align:center;">
      <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#FFF;">${companyName} · Radar BOE</p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6;">Generado automáticamente según sus palabras clave configuradas.</p>
    </td></tr>
  </table></td></tr>
</table></body></html>`
}

async function sendBrevoEmail(recipients: string[], subject: string, html: string) {
  const senderEmail = process.env.SMTP_USER ?? process.env.BREVO_SENDER_EMAIL ?? 'noreply@mavieautomations.com'
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Radar BOE · Mavie', email: senderEmail },
      to: recipients.map((e) => ({ email: e })),
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Brevo error ${res.status}: ${errText}`)
  }
}

function formatDate(dateStr: string): string | null {
  if (!dateStr) return null
  if (/^\d{8}$/.test(dateStr)) return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  return dateStr
}

// ─── Handler principal ───────────────────────────────────────
// Vercel Cron llama este endpoint con Authorization: Bearer {CRON_SECRET}
export async function GET(req: NextRequest) {
  // Verificar que la llamada viene de Vercel Cron o de un admin autorizado
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = new Date().toISOString()
  const supabase = createAdminClient()
  console.log(`[Cron BOE] Iniciando — ${startedAt}`)

  try {
    // 1. Fetch BOE
    const date = getDateString()
    const boeRes = await fetch(`${BOE_API_BASE}/${date}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30000),
    })

    if (!boeRes.ok) {
      if (boeRes.status === 404) {
        console.log('[Cron BOE] Sin publicación hoy (domingo/festivo)')
        return NextResponse.json({ ok: true, message: 'Sin publicación hoy' })
      }
      throw new Error(`BOE API error: ${boeRes.status}`)
    }

    const boeData = await boeRes.json()
    const allItems = parseBoe(boeData)
    console.log(`[Cron BOE] ${allItems.length} items BOE parseados`)

    if (allItems.length === 0) {
      await logExecution(supabase, startedAt, 'success', 0)
      return NextResponse.json({ ok: true, message: 'Sin items BOE hoy', processed: 0 })
    }

    // 2. Obtener clientes activos
    const { data: configs, error: configError } = await supabase
      .from('client_boe_configs')
      .select(`id, client_id, frequency, destination_emails, keywords_positive, keywords_negative, regions, clients(id, company_name, status)`)
      .eq('is_active', true)

    if (configError) throw new Error(`Error leyendo configs: ${configError.message}`)

    const activeConfigs = (configs ?? []).filter((c: Record<string, unknown>) => {
      const cl = c.clients as Record<string, unknown> | null
      return cl?.status === 'activo'
    })
    console.log(`[Cron BOE] ${activeConfigs.length} clientes activos`)

    let processed = 0

    // 3. Procesar cada cliente
    for (const config of activeConfigs) {
      const cl = config.clients as Record<string, unknown>
      const clientName = String(cl.company_name ?? 'Cliente')

      try {
        const matched = filterItems(
          allItems,
          (config.keywords_positive as string[]) ?? [],
          (config.keywords_negative as string[]) ?? []
        )
        console.log(`[Cron BOE] ${clientName}: ${matched.length}/${allItems.length} matches`)

        if (matched.length === 0) continue

        const subject = `🎯 Radar BOE — ${matched.length} oportunidad${matched.length !== 1 ? 'es' : ''} (${new Date().toLocaleDateString('es-ES')})`
        const html = buildEmailHtml(matched, clientName)
        await sendBrevoEmail(config.destination_emails as string[], subject, html)

        // Guardar matches en historial
        await supabase.from('boe_match_history').insert(
          matched.map((item) => ({
            client_id: config.client_id,
            opportunity_title: item.title,
            opportunity_url: item.url || null,
            publication_date: formatDate(item.publication_date),
            source: 'BOE',
          }))
        )

        // Log del email enviado
        await supabase.from('client_email_logs').insert({
          client_id: config.client_id,
          subject,
          sent_to: config.destination_emails,
          module: 'boe_radar',
          status: 'sent',
          sent_at: new Date().toISOString(),
        })

        processed++
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        const stack = err instanceof Error ? err.stack : undefined
        console.error(`[Cron BOE] Error procesando ${clientName}:`, msg)

        await supabase.from('incidents').insert({
          client_id: config.client_id,
          module: 'boe_radar',
          incident_type: 'cron_error',
          description: msg,
          full_error_stack: stack ?? null,
          status: 'open',
        })
      }
    }

    await logExecution(supabase, startedAt, 'success', processed)
    console.log(`[Cron BOE] Finalizado — ${processed}/${activeConfigs.length} procesados`)
    return NextResponse.json({ ok: true, processed, total: activeConfigs.length })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Cron BOE] Error fatal:', msg)
    await logExecution(supabase, startedAt, 'error', 0).catch(() => {})
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function logExecution(
  supabase: ReturnType<typeof createAdminClient>,
  startedAt: string,
  status: 'success' | 'error',
  totalProcessed: number
) {
  await supabase.from('execution_logs').insert({
    worker_name: 'boe_radar_cron',
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    status,
    total_processed_clients: totalProcessed,
  })
}
