// scenes-promo-20s.jsx — Mavie Automations 20s promo reel
// Structure:
//   0–4s   HOOK    — "¿Cuántas horas pierdes?" + counter
//   4–10s  CONTRAST — TÚ vs MAVIE split
//   10–16s SERVICES — 3 product cards fly in
//   16–20s CTA     — logo gold aura + URL

const BRAND = {
  bg:          '#09090b',
  fg:          '#fafafa',
  dim:         '#a1a1aa',
  muted:       '#52525b',
  emerald:     '#10b981',
  emeraldDim:  'rgba(16,185,129,0.15)',
  blue:        '#3b82f6',
  blueBright:  '#60a5fa',
  gold:        '#fbbf24',
  red:         '#ef4444',
};

const FD = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', ui-monospace, monospace";

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — HOOK (0–4s)
// "¿Cuántas horas al día pierdes en tareas manuales?"
// Counter ramps 0 → 3h, then glitch-reveal of the question
// ─────────────────────────────────────────────────────────────────────────────
function PhaseHook() {
  const t = useTime();
  if (t > 4.2) return null;

  const flick     = Math.sin(t * 24) > 0.15 ? 1 : 0.5;
  const enterTitle = Easing.easeOutExpo(clamp(t / 0.5, 0, 1));

  // Counter 0 → 3 hours (in minutes: 0 → 180) from 0.3s to 2.6s
  const cT  = clamp((t - 0.3) / 2.3, 0, 1);
  const mins = Math.floor(Easing.easeOutExpo(cT) * 180);
  const h   = Math.floor(mins / 60);
  const m   = mins % 60;
  const hStr = `${h}h ${String(m).padStart(2,'0')}m`;

  // Sub-text fades in at 2.4s
  const subT  = Easing.easeOutCubic(clamp((t - 2.4) / 0.7, 0, 1));

  // Exit 3.8–4.2
  const exit  = clamp((t - 3.8) / 0.4, 0, 1);

  return (
    <div style={{ position:'absolute', inset:0, opacity: 1 - exit }}>
      {/* Red radial pulse */}
      <div style={{
        position:'absolute', inset:0,
        background:`radial-gradient(ellipse at 50% 42%, rgba(239,68,68,${0.18 * flick}), transparent 62%)`,
      }}/>

      {/* HEADLINE */}
      <div style={{
        position:'absolute',
        top:260, left:60, right:60,
        textAlign:'center',
        fontFamily: FD,
        fontWeight: 800,
        fontSize: 88,
        lineHeight: 1.0,
        letterSpacing:'-0.04em',
        color: BRAND.fg,
        opacity: enterTitle,
        transform:`translateY(${(1-enterTitle)*30}px)`,
      }}>
        ¿Cuántas horas<br/>
        <span style={{color: BRAND.red, opacity: flick}}>pierdes</span><br/>
        al día?
      </div>

      {/* COUNTER */}
      <div style={{
        position:'absolute',
        top:760, left:0, right:0,
        textAlign:'center',
        fontFamily: FM,
        fontWeight: 700,
        fontSize: 200,
        lineHeight: 1,
        letterSpacing:'-0.04em',
        color: BRAND.fg,
        fontVariantNumeric:'tabular-nums',
        textShadow:`0 0 80px rgba(239,68,68,0.5)`,
      }}>
        {hStr}
      </div>

      {/* Sub label */}
      <div style={{
        position:'absolute',
        top:1000, left:0, right:0,
        textAlign:'center',
        fontFamily: FM,
        fontSize: 28,
        letterSpacing:'0.25em',
        color: BRAND.red,
        opacity: subT,
        textTransform:'uppercase',
      }}>
        EN TAREAS MANUALES REPETITIVAS
      </div>

      {/* Dashed separator */}
      <div style={{
        position:'absolute',
        top:1110, left:120, right:120,
        height:1,
        background:`linear-gradient(90deg, transparent, rgba(239,68,68,${0.4 * subT}), transparent)`,
      }}/>

      {/* Bottom question */}
      <div style={{
        position:'absolute',
        top:1160, left:60, right:60,
        textAlign:'center',
        fontFamily: FD,
        fontWeight:500,
        fontSize:44,
        color: BRAND.dim,
        opacity: subT * 0.9,
        lineHeight:1.2,
        letterSpacing:'-0.01em',
      }}>
        ¿Y si alguien más las hiciera por ti?
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — CONTRAST (4–10s)
// Left = TÚ (slow, manual). Right = MAVIE (instant, automated).
// Divider sweeps from center. Scanning lines on right side.
// ─────────────────────────────────────────────────────────────────────────────
function PhaseContrast() {
  const t = useTime();
  if (t < 3.8 || t > 10.3) return null;
  const local = t - 4.0;

  const enter  = Easing.easeOutCubic(clamp(local / 0.5, 0, 1));
  const exit   = clamp((local - 5.7) / 0.4, 0, 1);
  const op     = enter * (1 - exit);

  // Divider sweeps in from center out to full height 0–0.5s
  const divH   = Easing.easeOutExpo(clamp(local / 0.5, 0, 1)) * 1920;

  // LEFT labels appear at 0.5s
  const leftT  = Easing.easeOutCubic(clamp((local - 0.5) / 0.5, 0, 1));
  // RIGHT labels appear at 1.0s
  const rightT = Easing.easeOutCubic(clamp((local - 1.0) / 0.6, 0, 1));

  // Scanning line on right side
  const scanY  = (local % 2.0) / 2.0 * 1920;

  // Clock ticks (left side): 3 "task" entries cascade in
  const tasks = [
    'Leer emails',
    'Copiar datos',
    'Enviar seguimientos',
    'Actualizar CRM',
    'Generar informes',
  ];

  // Right side: automated items
  const autoItems = [
    '✓ Scraping completado',
    '✓ 219 emails enviados',
    '✓ CRM actualizado',
    '✓ Informe generado',
    '✓ Leads clasificados',
  ];

  return (
    <div style={{ position:'absolute', inset:0, opacity: op }}>

      {/* LEFT panel — dim bg */}
      <div style={{
        position:'absolute', top:0, left:0, width:'50%', bottom:0,
        background:'rgba(239,68,68,0.04)',
      }}/>

      {/* RIGHT panel — dark with blue tint */}
      <div style={{
        position:'absolute', top:0, right:0, width:'50%', bottom:0,
        background:'rgba(59,130,246,0.06)',
      }}/>

      {/* RIGHT scanning line */}
      <div style={{
        position:'absolute',
        left:'50%', top: scanY - 2,
        right:0, height:3,
        background:`linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(96,165,250,0.7), transparent)`,
        opacity: rightT,
      }}/>

      {/* CENTER divider */}
      <div style={{
        position:'absolute',
        left:'50%', top: (1920 - divH) / 2,
        width:2, height: divH,
        marginLeft:-1,
        background:`linear-gradient(180deg, transparent, ${BRAND.blue} 20%, ${BRAND.blue} 80%, transparent)`,
        boxShadow:`0 0 20px ${BRAND.blue}`,
      }}/>

      {/* LEFT header — TÚ */}
      <div style={{
        position:'absolute',
        top:160, left:0, width:'50%',
        textAlign:'center',
        opacity: leftT,
        transform:`translateY(${(1-leftT)*20}px)`,
      }}>
        <div style={{
          fontFamily: FM,
          fontSize:26,
          letterSpacing:'0.3em',
          color: BRAND.red,
          textTransform:'uppercase',
          marginBottom:16,
        }}>SIN MAVIE</div>
        <div style={{
          fontFamily: FD,
          fontWeight:700,
          fontSize:100,
          color:'rgba(250,250,250,0.2)',
          letterSpacing:'-0.04em',
        }}>TÚ</div>
      </div>

      {/* RIGHT header — MAVIE */}
      <div style={{
        position:'absolute',
        top:160, left:'50%', right:0,
        textAlign:'center',
        opacity: rightT,
        transform:`translateY(${(1-rightT)*20}px)`,
      }}>
        <div style={{
          fontFamily: FM,
          fontSize:26,
          letterSpacing:'0.3em',
          color: BRAND.emerald,
          textTransform:'uppercase',
          marginBottom:16,
        }}>CON MAVIE</div>
        <div style={{
          fontFamily: FD,
          fontWeight:700,
          fontSize:100,
          color: BRAND.fg,
          letterSpacing:'-0.04em',
          textShadow:`0 0 40px rgba(59,130,246,0.5)`,
        }}>AUTO</div>
      </div>

      {/* LEFT tasks — slow, faded, crossed */}
      {tasks.map((task, i) => {
        const rowT = Easing.easeOutCubic(clamp((local - 0.8 - i * 0.25) / 0.4, 0, 1));
        return (
          <div key={task} style={{
            position:'absolute',
            top: 430 + i * 120,
            left:40, width:'44%',
            opacity: rowT * 0.55,
            transform:`translateX(${(1-rowT)*-30}px)`,
            display:'flex', alignItems:'center', gap:16,
            fontFamily: FM,
            fontSize:30,
            color: BRAND.dim,
          }}>
            <div style={{
              width:10, height:10, borderRadius:5,
              background: BRAND.red, opacity:0.6,
              flexShrink:0,
            }}/>
            {task}
          </div>
        );
      })}

      {/* LEFT — big time cost */}
      <div style={{
        position:'absolute',
        top:1080, left:0, width:'50%',
        textAlign:'center',
        opacity: Easing.easeOutCubic(clamp((local - 2.2) / 0.6, 0, 1)),
      }}>
        <div style={{
          fontFamily: FM,
          fontSize:80,
          fontWeight:700,
          color:`rgba(239,68,68,0.7)`,
          fontVariantNumeric:'tabular-nums',
          letterSpacing:'-0.03em',
        }}>3h / día</div>
        <div style={{
          fontFamily: FD, fontSize:26,
          color: BRAND.muted, marginTop:8,
        }}>= 780h al año perdidas</div>
      </div>

      {/* RIGHT auto items */}
      {autoItems.map((item, i) => {
        const rowT = Easing.easeOutCubic(clamp((local - 1.0 - i * 0.2) / 0.4, 0, 1));
        return (
          <div key={item} style={{
            position:'absolute',
            top: 430 + i * 120,
            left:'52%', right:20,
            opacity: rowT,
            transform:`translateX(${(1-rowT)*30}px)`,
            display:'flex', alignItems:'center', gap:16,
            fontFamily: FM,
            fontSize:30,
            color: BRAND.emerald,
          }}>
            {item}
          </div>
        );
      })}

      {/* RIGHT — 0h cost */}
      <div style={{
        position:'absolute',
        top:1080, left:'50%', right:0,
        textAlign:'center',
        opacity: Easing.easeOutCubic(clamp((local - 2.4) / 0.6, 0, 1)),
      }}>
        <div style={{
          fontFamily: FM,
          fontSize:80,
          fontWeight:700,
          color: BRAND.emerald,
          fontVariantNumeric:'tabular-nums',
          letterSpacing:'-0.03em',
          textShadow:`0 0 40px rgba(16,185,129,0.6)`,
        }}>0h / día</div>
        <div style={{
          fontFamily: FD, fontSize:26,
          color: BRAND.dim, marginTop:8,
        }}>trabajando mientras duermes</div>
      </div>

      {/* BOTTOM tagline */}
      <div style={{
        position:'absolute',
        bottom:180, left:60, right:60,
        textAlign:'center',
        opacity: Easing.easeOutCubic(clamp((local - 3.2) / 0.7, 0, 1)),
      }}>
        <div style={{
          fontFamily: FD,
          fontWeight:700,
          fontSize:54,
          color: BRAND.fg,
          letterSpacing:'-0.03em',
          lineHeight:1.1,
        }}>
          Tú cobras.
          <span style={{ color: BRAND.dim, fontWeight:400 }}> Nosotros trabajamos.</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — SERVICES (10–16s)
// 3 cards fly in: Radar BOE / Email B2B / A medida
// ─────────────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    label:   'Radar BOE',
    sub:     'Monitorización inteligente del BOE.\nAlertas en segundos.',
    icon:    '📡',
    color:   BRAND.emerald,
    glow:    'rgba(16,185,129,0.3)',
    border:  'rgba(16,185,129,0.35)',
    bg:      'rgba(16,185,129,0.06)',
    price:   'desde 79€/mes',
  },
  {
    label:   'Email B2B',
    sub:     'Captación automatizada.\n219 contactos/día sin tocar nada.',
    icon:    '⚡',
    color:   BRAND.blueBright,
    glow:    'rgba(96,165,250,0.3)',
    border:  'rgba(96,165,250,0.35)',
    bg:      'rgba(59,130,246,0.06)',
    price:   'Motor de captación',
  },
  {
    label:   'A medida',
    sub:     'Cualquier proceso repetitivo\nautomatizado en 1 semana.',
    icon:    '🔧',
    color:   BRAND.gold,
    glow:    'rgba(251,191,36,0.3)',
    border:  'rgba(251,191,36,0.35)',
    bg:      'rgba(251,191,36,0.05)',
    price:   'desde 1.500€',
  },
];

function PhaseServices() {
  const t = useTime();
  if (t < 9.8 || t > 16.3) return null;
  const local = t - 10.0;

  const enter = Easing.easeOutCubic(clamp(local / 0.4, 0, 1));
  const exit  = clamp((local - 5.7) / 0.4, 0, 1);

  // Header
  const headerT = Easing.easeOutExpo(clamp(local / 0.5, 0, 1));

  return (
    <div style={{ position:'absolute', inset:0, opacity: enter * (1 - exit) }}>
      {/* Subtle grid */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize:'80px 80px',
      }}/>

      {/* Header */}
      <div style={{
        position:'absolute',
        top:120, left:0, right:0,
        textAlign:'center',
        opacity: headerT,
        transform:`translateY(${(1-headerT)*24}px)`,
      }}>
        <div style={{
          fontFamily: FM,
          fontSize:24,
          letterSpacing:'0.35em',
          color: BRAND.blue,
          textTransform:'uppercase',
          marginBottom:20,
        }}>─── Mavie Automations ───</div>
        <div style={{
          fontFamily: FD,
          fontWeight:800,
          fontSize:80,
          letterSpacing:'-0.04em',
          color: BRAND.fg,
          lineHeight:1,
        }}>Lo que hacemos</div>
      </div>

      {/* Service cards */}
      {SERVICES.map((svc, i) => {
        const cardT = Easing.easeOutBack(clamp((local - 0.5 - i * 0.3) / 0.6, 0, 1));
        const cardY = 360 + i * 450;

        return (
          <div key={svc.label} style={{
            position:'absolute',
            left:60, right:60,
            top: cardY,
            height:380,
            opacity: cardT,
            transform:`scale(${0.85 + cardT * 0.15}) translateY(${(1-cardT)*60}px)`,
            background: svc.bg,
            border:`1px solid ${svc.border}`,
            borderRadius:32,
            padding:'48px 56px',
            boxShadow:`0 0 60px ${svc.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}>
            {/* Icon + label row */}
            <div style={{
              display:'flex', alignItems:'center', gap:24,
              marginBottom:28,
            }}>
              <div style={{
                fontSize:64,
                lineHeight:1,
                filter:`drop-shadow(0 0 16px ${svc.color})`,
              }}>{svc.icon}</div>
              <div>
                <div style={{
                  fontFamily: FD,
                  fontWeight:700,
                  fontSize:56,
                  letterSpacing:'-0.03em',
                  color: svc.color,
                  lineHeight:1,
                  textShadow:`0 0 20px ${svc.glow}`,
                }}>{svc.label}</div>
              </div>
              <div style={{ flex:1 }}/>
              <div style={{
                fontFamily: FM,
                fontSize:22,
                color: svc.color,
                letterSpacing:'0.05em',
                opacity:0.8,
                textAlign:'right',
              }}>{svc.price}</div>
            </div>

            {/* Sub text */}
            <div style={{
              fontFamily: FD,
              fontWeight:400,
              fontSize:34,
              color: BRAND.dim,
              lineHeight:1.35,
              letterSpacing:'-0.01em',
              whiteSpace:'pre-line',
            }}>{svc.sub}</div>

            {/* Bottom accent line */}
            <div style={{
              position:'absolute',
              bottom:0, left:60, right:60, height:2,
              background:`linear-gradient(90deg, transparent, ${svc.color}, transparent)`,
              borderRadius:1,
            }}/>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4 — CTA (16–20s)
// Logo + gold aura + "Agenda auditoría gratuita" + URL
// ─────────────────────────────────────────────────────────────────────────────
function PhaseCTA() {
  const t = useTime();
  if (t < 15.8) return null;
  const local = t - 16.0;

  const logoT = Easing.easeOutExpo(clamp((local + 0.2) / 1.0, 0, 1));
  const lineT = Easing.easeOutExpo(clamp((local - 0.8) / 0.8, 0, 1));
  const ctaT  = Easing.easeOutExpo(clamp((local - 1.6) / 0.8, 0, 1));
  const urlT  = Easing.easeOutExpo(clamp((local - 2.2) / 0.7, 0, 1));

  const pulse = 0.5 + Math.sin(local * 2.8) * 0.5;

  return (
    <div style={{ position:'absolute', inset:0 }}>
      {/* Gold aura */}
      <div style={{
        position:'absolute', inset:0,
        background:`radial-gradient(ellipse at 50% 32%, rgba(251,191,36,${0.12 + pulse * 0.08}), transparent 52%)`,
        opacity: logoT,
      }}/>

      {/* Blue ambient */}
      <div style={{
        position:'absolute', inset:0,
        background:`radial-gradient(ellipse at 50% 70%, rgba(59,130,246,0.08), transparent 55%)`,
        opacity: ctaT,
      }}/>

      {/* Logo container */}
      <div style={{
        position:'absolute',
        left:'50%', top:320,
        transform:`translate(-50%, 0) scale(${0.88 + logoT * 0.12})`,
        opacity: logoT,
        textAlign:'center',
      }}>
        {/* Gold halo ring */}
        <div style={{
          position:'absolute',
          left:'50%', top:'50%',
          width:560, height:560,
          marginLeft:-280, marginTop:-280,
          borderRadius:'50%',
          background:`radial-gradient(circle, rgba(251,191,36,${0.22 + pulse * 0.1}), transparent 60%)`,
          filter:'blur(24px)',
        }}/>

        {/* M logo */}
        <img
          src="assets/mavie-logo-m.png"
          alt="Mavie"
          style={{
            width:360, height:360,
            objectFit:'contain',
            position:'relative',
            filter:`drop-shadow(0 0 ${28 + pulse * 28}px rgba(251,191,36,0.7)) drop-shadow(0 0 ${56 + pulse * 16}px rgba(251,191,36,0.3))`,
          }}
        />

        {/* Wordmark */}
        <div style={{
          marginTop:16,
          fontFamily: FD,
          fontWeight:300,
          fontSize:72,
          letterSpacing:'0.01em',
          color: BRAND.fg,
          position:'relative',
        }}>
          Mavie
          <span style={{
            fontWeight:500,
            color: BRAND.gold,
            textShadow:`0 0 ${16 + pulse * 16}px rgba(251,191,36,0.8)`,
          }}> Automations</span>
        </div>
      </div>

      {/* Killer tagline */}
      <div style={{
        position:'absolute',
        top:1120, left:60, right:60,
        textAlign:'center',
        opacity: lineT,
        transform:`translateY(${(1-lineT)*28}px)`,
      }}>
        <div style={{
          fontFamily: FD,
          fontWeight:700,
          fontSize:68,
          lineHeight:1.1,
          letterSpacing:'-0.035em',
          color: BRAND.fg,
        }}>
          Deja de hacer<br/>
          <span style={{color: BRAND.dim, fontWeight:400}}>lo que una máquina</span><br/>
          puede hacer mejor.
        </div>
      </div>

      {/* CTA button */}
      <div style={{
        position:'absolute',
        top:1530, left:60, right:60,
        opacity: ctaT,
        transform:`translateY(${(1-ctaT)*28}px)`,
      }}>
        <div style={{
          padding:'38px 48px',
          background: BRAND.fg,
          borderRadius:22,
          textAlign:'center',
          fontFamily: FD,
          fontWeight:700,
          fontSize:46,
          color: BRAND.bg,
          letterSpacing:'-0.01em',
          boxShadow:`0 0 ${36 + pulse * 36}px rgba(250,250,250,${0.35 + pulse * 0.25})`,
          transform:`scale(${0.98 + pulse * 0.02})`,
        }}>
          Auditoría gratuita →
        </div>
      </div>

      {/* URL */}
      <div style={{
        position:'absolute',
        top:1720, left:0, right:0,
        textAlign:'center',
        opacity: urlT,
        transform:`translateY(${(1-urlT)*16}px)`,
      }}>
        <div style={{
          fontFamily: FM,
          fontSize:32,
          color: BRAND.dim,
          letterSpacing:'0.1em',
        }}>mavieautomations.com</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENT CHROME
// ─────────────────────────────────────────────────────────────────────────────
function Chrome20() {
  const t = useTime();
  if (t > 16.0) return null;

  const phases = [
    { label: '01 · HOOK',      end: 4  },
    { label: '02 · CONTRASTE', end: 10 },
    { label: '03 · SERVICIOS', end: 16 },
  ];
  const active = phases.find(p => t < p.end) || phases[0];

  return (
    <>
      {/* Brand mark top-left */}
      <div style={{
        position:'absolute', top:60, left:60,
        display:'flex', alignItems:'center', gap:14,
        zIndex:50,
      }}>
        <img src="assets/mavie-logo-m.png" alt=""
          style={{ width:48, height:48, objectFit:'contain', filter:'drop-shadow(0 0 8px rgba(59,130,246,0.4))' }}
        />
        <div style={{
          fontFamily: FD,
          fontWeight:600,
          fontSize:26,
          color: BRAND.fg,
          letterSpacing:'-0.01em',
        }}>
          Mavie<span style={{ color: BRAND.dim, fontWeight:400 }}> Automations</span>
        </div>
      </div>

      {/* Phase label bottom-right */}
      <div style={{
        position:'absolute', bottom:60, right:60,
        fontFamily: FM,
        fontSize:20,
        color: BRAND.dim,
        letterSpacing:'0.2em',
        zIndex:50,
      }}>
        {active.label}
      </div>

      {/* Timer bottom-left */}
      <div style={{
        position:'absolute', bottom:60, left:60,
        fontFamily: FM,
        fontSize:20,
        color: BRAND.dim,
        letterSpacing:'0.15em',
        zIndex:50,
        fontVariantNumeric:'tabular-nums',
      }}>
        {t.toFixed(2).padStart(5,'0')}s / 20.00s
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
function MaviePromo20s() {
  return (
    <>
      <PhaseHook />
      <PhaseContrast />
      <PhaseServices />
      <PhaseCTA />
      <Chrome20 />
    </>
  );
}

Object.assign(window, { MaviePromo20s, BRAND });
