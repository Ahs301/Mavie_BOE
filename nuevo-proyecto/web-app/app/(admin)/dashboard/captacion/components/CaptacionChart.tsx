"use client"

type Campaign = {
  id: string
  name: string
  total_leads_found: number
  emails_sent: number
}

export function CaptacionChart({ campaigns }: { campaigns: Campaign[] }) {
  const W = 400
  const H = 180
  const padL = 32
  const padB = 28
  const padT = 12
  const padR = 12
  const chartW = W - padL - padR
  const chartH = H - padB - padT

  const maxRaw = Math.max(1, ...campaigns.flatMap(c => [c.total_leads_found, c.emails_sent]))
  const maxVal = Math.ceil(maxRaw / 5) * 5

  const n = campaigns.length
  const slotW = n > 0 ? chartW / n : chartW
  const barW  = Math.min(slotW * 0.32, 20)

  const toY = (v: number) => padT + chartH - (v / maxVal) * chartH

  const yTicks = [0, Math.round(maxVal / 2), maxVal]

  const allZero = campaigns.every(c => !c.total_leads_found && !c.emails_sent)

  if (n === 0 || allZero) {
    return (
      <div className="flex flex-col items-center justify-center h-44 gap-3 text-neutral-700">
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-8" />
        </svg>
        <p className="text-xs">Sin datos todavía. El motor actualizará al procesar.</p>
      </div>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map(tick => (
        <g key={tick}>
          <line
            x1={padL} y1={toY(tick)} x2={W - padR} y2={toY(tick)}
            stroke="#1f1f1f" strokeWidth={1} strokeDasharray="3 3"
          />
          <text x={padL - 4} y={toY(tick)} textAnchor="end" dominantBaseline="middle"
            fill="#525252" fontSize={8}>
            {tick}
          </text>
        </g>
      ))}

      {/* X axis */}
      <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH}
        stroke="#262626" strokeWidth={1} />

      {/* Bars per campaign */}
      {campaigns.map((camp, i) => {
        const cx = padL + slotW * i + slotW / 2
        const lh = ((camp.total_leads_found || 0) / maxVal) * chartH
        const sh = ((camp.emails_sent       || 0) / maxVal) * chartH

        const label = camp.name.length > 9 ? camp.name.slice(0, 8) + "…" : camp.name

        return (
          <g key={camp.id}>
            {/* Leads bar */}
            <rect
              x={cx - barW - 1}
              y={toY(camp.total_leads_found || 0)}
              width={barW}
              height={lh}
              rx={2}
              fill="#10b981"
              fillOpacity={0.85}
            />
            {/* Sent bar */}
            <rect
              x={cx + 1}
              y={toY(camp.emails_sent || 0)}
              width={barW}
              height={sh}
              rx={2}
              fill="#3b82f6"
              fillOpacity={0.85}
            />
            {/* Campaign label */}
            <text x={cx} y={H - 6} textAnchor="middle" fill="#525252" fontSize={8}>
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
