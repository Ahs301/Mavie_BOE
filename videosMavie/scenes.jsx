// scenes.jsx — five phases of the Mavie 30s reel.
// Uses Stage/Sprite/Easing from animations.jsx

const BRAND = {
  bg: '#09090b',        // zinc-950
  fg: '#fafafa',
  dim: '#a1a1aa',
  emerald: '#10b981',
  blue: '#3b82f6',
  blueBright: '#60a5fa',
  red: '#ef4444',
  gold: '#fbbf24',
};

const FONT_DISPLAY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 1 — HOOK (0–4s): "ESTÁS PERDIENDO DINERO" + €50k counter + glitch
// ═════════════════════════════════════════════════════════════════════════════
function PhaseHook() {
  const t = useTime();
  if (t > 4.2) return null;

  // Counter ramps 0 → 50000 from 0.2s to 2.2s
  const counterT = clamp((t - 0.2) / 2.0, 0, 1);
  const counterVal = Math.floor(Easing.easeOutExpo(counterT) * 50000);
  const euros = counterVal.toLocaleString('de-DE');

  // Red warning flicker: visible 0–2.5s
  const hookActive = t < 2.6;
  const flick = Math.sin(t * 28) > 0.2 ? 1 : 0.55;

  // Glitch text appears at 2.6s
  const glitchT = clamp((t - 2.6) / 0.6, 0, 1);
  const glitchActive = t > 2.6 && t < 4.0;

  // Exit whole phase 3.9–4.2
  const exit = clamp((t - 3.9) / 0.3, 0, 1);
  const opacity = 1 - exit;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      {/* Background pulse flashes */}
      {hookActive && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, rgba(239,68,68,${0.25 * flick}), transparent 65%)`,
        }}/>
      )}

      {hookActive && (
        <>
          {/* Huge warning text */}
          <div style={{
            position: 'absolute',
            top: 380, left: 60, right: 60,
            textAlign: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 128,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            color: BRAND.red,
            opacity: flick,
            textShadow: `0 0 ${40 * flick}px rgba(239,68,68,0.6)`,
            transform: `scale(${0.92 + Easing.easeOutBack(clamp(t / 0.5, 0, 1)) * 0.08})`,
          }}>
            ESTÁS<br/>PERDIENDO<br/>DINERO.
          </div>

          {/* Euro counter */}
          <div style={{
            position: 'absolute',
            top: 1080, left: 0, right: 0,
            textAlign: 'center',
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 180,
            color: BRAND.fg,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 60px rgba(239,68,68,0.4)',
          }}>
            −{euros}€
          </div>

          <div style={{
            position: 'absolute',
            top: 1280, left: 0, right: 0,
            textAlign: 'center',
            fontFamily: FONT_MONO,
            fontSize: 32,
            color: BRAND.red,
            letterSpacing: '0.2em',
            opacity: flick,
          }}>
            PÉRDIDAS ESTIMADAS / AÑO
          </div>
        </>
      )}

      {/* Glitch message */}
      {glitchActive && (
        <GlitchText
          text={'...cada vez que un competidor\nlee el BOE antes que tú.'}
          progress={glitchT}
          exitT={clamp((t - 3.7) / 0.3, 0, 1)}
        />
      )}
    </div>
  );
}

function GlitchText({ text, progress, exitT }) {
  const [displayed, setDisplayed] = React.useState(text);

  React.useEffect(() => {
    if (progress < 0.5) {
      const chars = '!<>_-/\\*#$%0123456789ABCDEFXZ';
      const scrambled = text.split('').map(c => {
        if (c === ' ' || c === '\n') return c;
        if (Math.random() < progress * 1.2) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      setDisplayed(scrambled);
    } else {
      setDisplayed(text);
    }
  }, [progress, text]);

  const shakeX = progress < 0.6 ? (Math.random() - 0.5) * 12 : 0;
  const shakeY = progress < 0.6 ? (Math.random() - 0.5) * 6 : 0;

  return (
    <>
      {/* Chromatic aberration copies */}
      <div style={{
        position: 'absolute', top: 780, left: 60, right: 60,
        textAlign: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.05,
        letterSpacing: '-0.03em',
        color: BRAND.red,
        opacity: 0.7 * (1 - exitT),
        transform: `translate(${shakeX - 3}px, ${shakeY}px)`,
        mixBlendMode: 'screen',
        whiteSpace: 'pre-line',
      }}>{displayed}</div>
      <div style={{
        position: 'absolute', top: 780, left: 60, right: 60,
        textAlign: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.05,
        letterSpacing: '-0.03em',
        color: '#22d3ee',
        opacity: 0.7 * (1 - exitT),
        transform: `translate(${shakeX + 3}px, ${shakeY}px)`,
        mixBlendMode: 'screen',
        whiteSpace: 'pre-line',
      }}>{displayed}</div>
      <div style={{
        position: 'absolute', top: 780, left: 60, right: 60,
        textAlign: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 72,
        lineHeight: 1.05,
        letterSpacing: '-0.03em',
        color: BRAND.fg,
        opacity: 1 - exitT,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        whiteSpace: 'pre-line',
      }}>{displayed}</div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 2 — PROBLEM (4–12s): calendar shredding + BOE cascade
// ═════════════════════════════════════════════════════════════════════════════
function PhaseProblem() {
  const t = useTime();
  if (t < 4.0 || t > 12.4) return null;

  const local = t - 4.0;
  const enter = Easing.easeOutCubic(clamp(local / 0.6, 0, 1));
  const exit = clamp((local - 7.8) / 0.4, 0, 1);
  const opacity = enter * (1 - exit);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      {/* BOE cascade (background layer) */}
      <BOECascade localT={local} />

      {/* Dark vignette over cascade */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(9,9,11,0.88) 80%)',
      }}/>

      {/* Top title */}
      <div style={{
        position: 'absolute',
        top: 200, left: 60, right: 60,
        textAlign: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 64,
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        color: BRAND.fg,
        transform: `translateY(${(1 - enter) * 40}px)`,
      }}>
        Las licitaciones públicas<br/>
        <span style={{ color: BRAND.dim, fontWeight: 500 }}>no esperan a tu</span> café<br/>
        <span style={{ color: BRAND.dim, fontWeight: 500 }}>de la mañana.</span>
      </div>

      {/* Calendar shredder */}
      <ShreddingCalendar localT={local} />
    </div>
  );
}

function BOECascade({ localT }) {
  // Pre-generated stream of fake legalese lines
  const lines = React.useMemo(() => {
    const samples = [
      'Art. 14.2 — Disposición adicional séptima sobre adjudicación directa por procedimiento restringido',
      'BOE-A-2026-04829: Resolución de 12 de marzo, contratación de servicios de consultoría TIC',
      'Anuncio de formalización del contrato nº 2026/CNMY/0014 expediente administrativo ordinario',
      'Extracto de la convocatoria de subvenciones destinadas a proyectos de I+D+i en empresas',
      'Pliego de cláusulas administrativas particulares para la contratación de suministros',
      'Art. 31.1.b — Régimen jurídico de las modificaciones contractuales en obras y servicios',
      'Ministerio de Hacienda: Orden HFP/2026/114 reguladora del sistema de notificación',
      'Disposición final primera. Entrada en vigor y publicación en el Diario Oficial del Estado',
      'Licitación por procedimiento abierto simplificado con pluralidad de criterios de adjudicación',
      'Expediente CONTR-2026-8831/GS subvención línea ENISA jóvenes emprendedores innovación',
      'Acuerdo marco para la contratación centralizada de servicios de desarrollo software a medida',
      'Anexo II. Criterios de valoración sometidos a juicio de valor mediante fórmula aritmética',
    ];
    return Array.from({ length: 40 }, (_, i) => ({
      text: samples[i % samples.length],
      x: 20 + (i * 73) % 1000,
      delay: (i * 0.08) % 2.5,
      speed: 220 + (i * 47) % 120,
      opacity: 0.15 + ((i * 17) % 100) / 400,
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {lines.map((line, i) => {
        const y = -200 + ((localT - line.delay) * line.speed) % 2400;
        if (y < -200 || y > 2000) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: line.x,
            top: y,
            fontFamily: FONT_MONO,
            fontSize: 12,
            color: BRAND.dim,
            opacity: line.opacity,
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            {line.text}
          </div>
        );
      })}
    </div>
  );
}

function ShreddingCalendar({ localT }) {
  // Calendar appears 0.6s, stays until exit. Day number flips rapidly.
  if (localT < 0.6) return null;
  const active = localT - 0.6;

  // Flip days: 0..1 every 60ms = ~16/sec
  const day = 1 + Math.floor(active * 14) % 30;
  const month = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][Math.floor(active * 1.8) % 12];

  const entry = Easing.easeOutBack(clamp(active / 0.5, 0, 1));

  // subtle shake
  const shake = Math.sin(active * 40) * 2;

  return (
    <div style={{
      position: 'absolute',
      top: 740, left: '50%',
      transform: `translate(-50%, 0) scale(${entry}) translateX(${shake}px)`,
      width: 520, height: 560,
      background: '#18181b',
      borderRadius: 32,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      {/* Header strip */}
      <div style={{
        height: 120,
        background: BRAND.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: 48,
        letterSpacing: '0.15em',
        color: BRAND.fg,
      }}>{month}</div>
      {/* Day big */}
      <div style={{
        position: 'absolute',
        top: 150, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: FONT_DISPLAY,
        fontWeight: 900,
        fontSize: 340,
        lineHeight: 1,
        color: BRAND.fg,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.05em',
      }}>{day}</div>
      {/* Ripped bottom edge */}
      <div style={{
        position: 'absolute',
        bottom: -2, left: 0, right: 0, height: 40,
        background: `repeating-linear-gradient(90deg, ${BRAND.bg} 0 18px, transparent 18px 36px)`,
        clipPath: 'polygon(0% 40%, 4% 100%, 8% 40%, 12% 100%, 16% 40%, 20% 100%, 24% 40%, 28% 100%, 32% 40%, 36% 100%, 40% 40%, 44% 100%, 48% 40%, 52% 100%, 56% 40%, 60% 100%, 64% 40%, 68% 100%, 72% 40%, 76% 100%, 80% 40%, 84% 100%, 88% 40%, 92% 100%, 96% 40%, 100% 100%, 0% 100%)',
      }}/>
      {/* Flying shredded strips */}
      {Array.from({ length: 8 }, (_, i) => {
        const s = (active + i * 0.3) % 1.5;
        const y = 560 + s * 400;
        const x = (i - 4) * 60;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `calc(50% + ${x}px)`,
            top: y,
            width: 40, height: 120,
            background: '#27272a',
            opacity: 1 - s / 1.5,
            transform: `rotate(${i * 23}deg)`,
          }}/>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 3 — MAVIE IMPACT (12–20s): shockwave + shield + tagline
// ═════════════════════════════════════════════════════════════════════════════
function PhaseImpact() {
  const t = useTime();
  if (t < 11.8 || t > 20.2) return null;
  const local = t - 12.0;

  // Shockwave: 0–1.2s
  const shockT = clamp((local + 0.2) / 1.2, 0, 1);

  // Shield appears 1.0s, grows in
  const shieldT = clamp((local - 1.0) / 1.2, 0, 1);
  const shieldEased = Easing.easeOutBack(shieldT);

  // Title appears 2.0s
  const titleT = clamp((local - 2.0) / 0.8, 0, 1);
  const titleEased = Easing.easeOutExpo(titleT);

  // Sub typed 3.0s
  const typeStart = 3.0;
  const typeDur = 2.5;
  const typedProg = clamp((local - typeStart) / typeDur, 0, 1);

  // Exit 7.6–8.0
  const exit = clamp((local - 7.6) / 0.4, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - exit }}>
      {/* Shockwave rings */}
      {shockT < 1 && (
        <>
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            width: 100, height: 100,
            marginLeft: -50, marginTop: -50,
            borderRadius: '50%',
            border: `${10 * (1 - shockT)}px solid ${BRAND.blue}`,
            transform: `scale(${shockT * 28})`,
            opacity: 1 - shockT,
            boxShadow: `0 0 ${120 * (1 - shockT)}px ${BRAND.blue}`,
          }}/>
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            width: 100, height: 100,
            marginLeft: -50, marginTop: -50,
            borderRadius: '50%',
            border: `${6 * (1 - shockT)}px solid ${BRAND.blueBright}`,
            transform: `scale(${shockT * 22})`,
            opacity: (1 - shockT) * 0.8,
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 50% 50%, rgba(59,130,246,${0.45 * (1 - shockT)}), transparent ${40 + shockT * 60}%)`,
          }}/>
        </>
      )}

      {/* Ambient grid after clean */}
      {local > 1.0 && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: clamp((local - 1.0) / 0.6, 0, 1),
          maskImage: 'radial-gradient(ellipse at 50% 45%, black 30%, transparent 75%)',
        }}/>
      )}

      {/* Shield */}
      {shieldT > 0 && (
        <div style={{
          position: 'absolute',
          left: '50%', top: 600,
          transform: `translate(-50%, 0) scale(${shieldEased})`,
          opacity: shieldT,
          filter: `drop-shadow(0 0 ${60 * shieldT}px ${BRAND.blue}) drop-shadow(0 0 ${120 * shieldT}px rgba(59,130,246,0.5))`,
        }}>
          <svg width="420" height="480" viewBox="0 0 120 140">
            <defs>
              <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND.blueBright} stopOpacity="0.9"/>
                <stop offset="100%" stopColor={BRAND.blue} stopOpacity="0.4"/>
              </linearGradient>
              <linearGradient id="shieldStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93c5fd"/>
                <stop offset="100%" stopColor={BRAND.blue}/>
              </linearGradient>
            </defs>
            <path d="M60 8 L108 24 L108 68 C108 96 88 120 60 132 C32 120 12 96 12 68 L12 24 Z"
                  fill="url(#shieldGrad)"
                  stroke="url(#shieldStroke)"
                  strokeWidth="2"/>
            {/* Inner emblem — M ribbon reference */}
            <path d="M36 50 Q46 38 54 52 Q60 62 66 52 Q74 38 84 50 L84 88 Q74 80 66 88 Q60 94 54 88 Q46 80 36 88 Z"
                  fill="none"
                  stroke="#eff6ff"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.9}/>
            {/* Scanning line */}
            <rect x="12" y={24 + (local % 3) / 3 * 108}
                  width="96" height="2"
                  fill={BRAND.blueBright} opacity="0.6"/>
          </svg>
        </div>
      )}

      {/* Title */}
      {titleT > 0 && (
        <div style={{
          position: 'absolute',
          top: 1150, left: 0, right: 0,
          textAlign: 'center',
          opacity: titleEased,
          transform: `translateY(${(1 - titleEased) * 30}px)`,
        }}>
          <div style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            color: BRAND.blueBright,
            letterSpacing: '0.35em',
            marginBottom: 24,
            textTransform: 'uppercase',
          }}>
            ─── Mavie Automations ───
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: BRAND.fg,
            textShadow: `0 0 40px rgba(59,130,246,0.4)`,
          }}>
            Radar Estratégico
          </div>
        </div>
      )}

      {/* Typed sub */}
      {typedProg > 0 && (
        <TypedLine
          text="> Infraestructura Serverless · 24/7/365"
          progress={typedProg}
          y={1420}
        />
      )}
    </div>
  );
}

function TypedLine({ text, progress, y }) {
  const shown = text.substring(0, Math.floor(progress * text.length));
  const showCaret = Math.sin(progress * 40) > 0;
  return (
    <div style={{
      position: 'absolute',
      top: y, left: 0, right: 0,
      textAlign: 'center',
      fontFamily: FONT_MONO,
      fontSize: 36,
      color: BRAND.dim,
      letterSpacing: '0.02em',
    }}>
      {shown}
      <span style={{
        display: 'inline-block',
        width: 16, height: 36,
        marginLeft: 4,
        verticalAlign: '-6px',
        background: progress < 1 ? BRAND.blueBright : (showCaret ? BRAND.blueBright : 'transparent'),
      }}/>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 4 — DEMO (20–26s): glass filter UI + MATCH + email fly-up
// ═════════════════════════════════════════════════════════════════════════════
function PhaseDemo() {
  const t = useTime();
  if (t < 19.8 || t > 26.2) return null;
  const local = t - 20.0;

  // Filter panel enters 0–0.6s
  const panelT = Easing.easeOutBack(clamp(local / 0.6, 0, 1));

  // Keyword typing 0.6–2.0
  const kwProg = clamp((local - 0.6) / 1.4, 0, 1);
  const keyword = 'Subvenciones I+D';
  const typedKw = keyword.substring(0, Math.floor(kwProg * keyword.length));

  // Match stamp hits 2.3s
  const matchT = clamp((local - 2.3) / 0.4, 0, 1);
  const matchVisible = local > 2.3 && local < 5.8;

  // Email fly-up starts 3.2s
  const emailLocal = local - 3.2;
  const emailVisible = emailLocal > 0 && emailLocal < 3;
  const emailT = clamp(emailLocal / 2.2, 0, 1);

  const exit = clamp((local - 5.8) / 0.4, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - exit }}>
      {/* Ambient gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.08), transparent 55%)',
      }}/>

      {/* Top label */}
      <div style={{
        position: 'absolute',
        top: 160, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: FONT_MONO,
        fontSize: 26,
        color: BRAND.blueBright,
        letterSpacing: '0.3em',
        opacity: panelT,
      }}>
        LIVE · RADAR FEED
      </div>

      {/* Glass panel */}
      <div style={{
        position: 'absolute',
        left: 80, right: 80,
        top: 260,
        height: 520,
        transform: `scale(${panelT}) translateY(${(1 - panelT) * 40}px)`,
        transformOrigin: '50% 50%',
        opacity: panelT,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 36,
        padding: '48px 56px',
        boxShadow: '0 0 80px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          fontFamily: FONT_MONO, fontSize: 26, color: BRAND.dim,
          textTransform: 'uppercase', letterSpacing: '0.2em',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: BRAND.emerald, boxShadow: `0 0 12px ${BRAND.emerald}` }}/>
          FILTRO ACTIVO
        </div>

        <div style={{
          marginTop: 48,
          fontFamily: FONT_MONO,
          fontSize: 28,
          color: BRAND.dim,
          letterSpacing: '0.04em',
        }}>
          keyword:
        </div>

        <div style={{
          marginTop: 12,
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 68,
          color: BRAND.fg,
          letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{ color: BRAND.emerald, marginRight: 16 }}>🔍</span>
          {typedKw}
          {kwProg < 1 && (
            <span style={{
              display: 'inline-block',
              width: 4, height: 64,
              marginLeft: 6,
              background: BRAND.fg,
              opacity: Math.sin(local * 20) > 0 ? 1 : 0.2,
            }}/>
          )}
        </div>

        <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['BOE-A-2026-04829', 'GENER-CAT-2026/114', 'CDTI-INN-2026-332', 'ENISA-JE-8831'].map((code, i) => {
            const rowT = clamp((local - 1.0 - i * 0.15) / 0.4, 0, 1);
            const matched = local > 2.3 && i === 1;
            return (
              <div key={code} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px',
                background: matched ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${matched ? BRAND.emerald : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 14,
                opacity: rowT,
                transform: `translateX(${(1 - rowT) * 40}px)`,
                fontFamily: FONT_MONO,
                fontSize: 22,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4,
                  background: matched ? BRAND.emerald : BRAND.dim,
                  boxShadow: matched ? `0 0 12px ${BRAND.emerald}` : 'none',
                }}/>
                <span style={{ color: matched ? BRAND.fg : BRAND.dim, letterSpacing: '0.05em' }}>{code}</span>
                <div style={{ flex: 1 }}/>
                <span style={{
                  color: matched ? BRAND.emerald : 'rgba(161,161,170,0.4)',
                  fontSize: 18,
                }}>{matched ? 'MATCH' : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MATCH stamp */}
      {matchVisible && (
        <div style={{
          position: 'absolute',
          left: '50%', top: 880,
          transform: `translate(-50%, 0) scale(${0.4 + Easing.easeOutBack(matchT) * 0.6}) rotate(${-8 + matchT * 2}deg)`,
          opacity: matchT > 0.95 ? Math.max(0.6, 1 - (local - 2.3 - 0.5) * 0.15) : matchT,
        }}>
          <div style={{
            padding: '24px 56px',
            border: `6px solid ${BRAND.emerald}`,
            borderRadius: 20,
            fontFamily: FONT_DISPLAY,
            fontWeight: 900,
            fontSize: 88,
            letterSpacing: '0.08em',
            color: BRAND.emerald,
            background: 'rgba(16,185,129,0.08)',
            boxShadow: `0 0 80px rgba(16,185,129,0.6), inset 0 0 40px rgba(16,185,129,0.15)`,
            textShadow: `0 0 30px rgba(16,185,129,0.8)`,
          }}>
            MATCH
          </div>
        </div>
      )}

      {/* Email flying up */}
      {emailVisible && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 1100 - emailT * 1000,
          transform: `translate(-50%, 0) scale(${0.5 + emailT * 0.5})`,
          opacity: emailT < 0.15 ? emailT / 0.15 : (emailT > 0.85 ? (1 - emailT) / 0.15 : 1),
          filter: `drop-shadow(0 0 20px ${BRAND.blue})`,
        }}>
          <div style={{
            width: 180, height: 130,
            background: BRAND.fg,
            borderRadius: 12,
            padding: 14,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 70,
              background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.blueBright})`,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}/>
            <div style={{
              position: 'absolute', bottom: 16, left: 14, right: 14,
              fontFamily: FONT_MONO, fontSize: 11, color: '#18181b',
              letterSpacing: '0.04em',
            }}>
              mavie → tú
            </div>
          </div>
          {/* Trail */}
          <div style={{
            position: 'absolute',
            left: '50%', top: '100%',
            width: 8, height: 200,
            marginLeft: -4,
            background: `linear-gradient(180deg, ${BRAND.blue}, transparent)`,
            opacity: 0.7,
          }}/>
        </div>
      )}

      {/* Bottom notification message */}
      {emailT > 0.4 && (
        <div style={{
          position: 'absolute',
          bottom: 200, left: 60, right: 60,
          textAlign: 'center',
          opacity: clamp((emailT - 0.4) / 0.2, 0, 1) * (emailT > 0.85 ? (1 - emailT) / 0.15 : 1),
        }}>
          <div style={{
            fontFamily: FONT_MONO,
            fontSize: 24,
            color: BRAND.emerald,
            letterSpacing: '0.3em',
            marginBottom: 16,
          }}>NOTIFICACIÓN ENVIADA</div>
          <div style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 52,
            color: BRAND.fg,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            A tu móvil en <span style={{ color: BRAND.emerald }}>‹0.5s</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 5 — CLOSE (26–30s): logo gold aura + killer line + CTA
// ═════════════════════════════════════════════════════════════════════════════
function PhaseClose() {
  const t = useTime();
  if (t < 25.8) return null;
  const local = t - 26.0;

  const logoT = Easing.easeOutExpo(clamp((local + 0.2) / 1.0, 0, 1));
  const lineT = Easing.easeOutExpo(clamp((local - 0.9) / 0.8, 0, 1));
  const ctaT = Easing.easeOutExpo(clamp((local - 1.8) / 0.8, 0, 1));

  // Slow gold aura pulse
  const pulse = 0.6 + Math.sin(local * 2.5) * 0.4;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Gold aura background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 35%, rgba(251,191,36,${0.12 + pulse * 0.08}), transparent 55%)`,
        opacity: logoT,
      }}/>

      {/* Logo container */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 420,
        transform: `translate(-50%, 0) scale(${0.9 + logoT * 0.1})`,
        opacity: logoT,
        textAlign: 'center',
      }}>
        {/* Gold halo ring */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: 640, height: 640,
          marginLeft: -320, marginTop: -320,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(251,191,36,${0.25 + pulse * 0.1}), transparent 60%)`,
          filter: 'blur(20px)',
        }}/>

        {/* The M logo */}
        <img
          src="assets/mavie-logo-m.png"
          alt="Mavie"
          style={{
            width: 440, height: 440,
            objectFit: 'contain',
            position: 'relative',
            filter: `drop-shadow(0 0 ${30 + pulse * 30}px rgba(251,191,36,0.7)) drop-shadow(0 0 ${60 + pulse * 20}px rgba(251,191,36,0.3))`,
          }}
        />

        {/* Wordmark beneath */}
        <div style={{
          marginTop: 24,
          fontFamily: FONT_DISPLAY,
          fontWeight: 300,
          fontSize: 88,
          letterSpacing: '0.02em',
          color: BRAND.fg,
          position: 'relative',
        }}>
          Mavie
          <span style={{
            fontWeight: 500,
            color: BRAND.gold,
            textShadow: `0 0 ${20 + pulse * 20}px rgba(251,191,36,0.8)`,
          }}> Automations</span>
        </div>
      </div>

      {/* Killer line */}
      <div style={{
        position: 'absolute',
        top: 1200, left: 60, right: 60,
        textAlign: 'center',
        opacity: lineT,
        transform: `translateY(${(1 - lineT) * 30}px)`,
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 72,
          lineHeight: 1.1,
          letterSpacing: '-0.035em',
          color: BRAND.fg,
        }}>
          Deja de trabajar<br/>
          <span style={{ color: BRAND.dim, fontWeight: 400 }}>como en 2015.</span>
        </div>
        <div style={{
          marginTop: 28,
          fontFamily: FONT_MONO,
          fontSize: 28,
          letterSpacing: '0.2em',
          color: BRAND.blueBright,
          textTransform: 'uppercase',
        }}>
          Desplegamos en 72h
        </div>
      </div>

      {/* CTA button pulsing */}
      <div style={{
        position: 'absolute',
        bottom: 180, left: 60, right: 60,
        opacity: ctaT,
        transform: `translateY(${(1 - ctaT) * 30}px)`,
      }}>
        <div style={{
          padding: '36px 48px',
          background: BRAND.fg,
          borderRadius: 20,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 44,
          color: BRAND.bg,
          letterSpacing: '-0.01em',
          boxShadow: `0 0 ${40 + pulse * 40}px rgba(250,250,250,${0.4 + pulse * 0.3})`,
          transform: `scale(${0.98 + pulse * 0.02})`,
        }}>
          Agenda tu auditoría →
        </div>
        <div style={{
          marginTop: 20,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontSize: 26,
          color: BRAND.dim,
          letterSpacing: '0.1em',
        }}>
          mavieautomations.com
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PERSISTENT CHROME — tiny brand mark top-left, phase counter bottom
// ═════════════════════════════════════════════════════════════════════════════
function Chrome() {
  const t = useTime();
  // Chrome hides during final phase to let logo breathe
  if (t > 26.0) return null;

  const phases = [
    { label: '01 · HOOK', end: 4 },
    { label: '02 · THE PROBLEM', end: 12 },
    { label: '03 · MAVIE', end: 20 },
    { label: '04 · LIVE DEMO', end: 26 },
  ];
  const active = phases.find(p => t < p.end) || phases[0];

  return (
    <>
      {/* Top-left brand mark */}
      <div style={{
        position: 'absolute',
        top: 60, left: 60,
        display: 'flex', alignItems: 'center', gap: 16,
        zIndex: 50,
      }}>
        <img src="assets/mavie-logo-m.png"
             alt=""
             style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))' }}/>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 28,
          color: BRAND.fg,
          letterSpacing: '-0.01em',
        }}>
          Mavie<span style={{ color: BRAND.dim, fontWeight: 400 }}> Automations</span>
        </div>
      </div>

      {/* Phase counter bottom-right */}
      <div style={{
        position: 'absolute',
        bottom: 60, right: 60,
        fontFamily: FONT_MONO,
        fontSize: 22,
        color: BRAND.dim,
        letterSpacing: '0.2em',
        zIndex: 50,
      }}>
        {active.label}
      </div>

      {/* Timer bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: 60, left: 60,
        fontFamily: FONT_MONO,
        fontSize: 22,
        color: BRAND.dim,
        letterSpacing: '0.15em',
        zIndex: 50,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {t.toFixed(2).padStart(5, '0')}s / 30.00s
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN SCENE
// ═════════════════════════════════════════════════════════════════════════════
function MavieReel() {
  return (
    <>
      <PhaseHook />
      <PhaseProblem />
      <PhaseImpact />
      <PhaseDemo />
      <PhaseClose />
      <Chrome />
    </>
  );
}

Object.assign(window, { MavieReel, BRAND });
