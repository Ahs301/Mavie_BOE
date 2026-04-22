// src/templates/templates.js – generación de correos personalizados (HTML + texto)
import getConfig from '../config.js';

function getGreeting() {
    return 'Hola,';
}

// ─── HTML Email Template ──────────────────────────────────────────────────────

/**
 * Genera el HTML completo del email con diseño profesional.
 * @param {string} bodyText  - texto principal (sin firma)
 * @param {string} ctaLink   - enlace del botón CTA (WhatsApp, demo…)
 * @param {string} trackingPixel - URL del pixel de seguimiento (opcional)
 * @param {string} unsubscribeUrl - enlace para darse de baja (opcional)
 */
export function buildHtmlEmail(bodyText, ctaLink, trackingPixel = '', unsubscribeUrl = '') {
    const { FROM_NAME, COMPANY_NAME, SIGNATURE_URL, SIGNATURE_LINKEDIN } = getConfig();

    // Convertir saltos de línea en párrafos HTML
    const paragraphs = bodyText
        .split(/\n{2,}/)
        .map(p => `<p style="margin:0 0 14px 0;line-height:1.6;">${p.trim().replace(/\n/g, '<br>')}</p>`)
        .join('\n');

    const ctaButton = ctaLink ? `
      <div style="text-align:center;margin:28px 0;">
        <a href="${ctaLink}"
           style="background:#1a56db;color:#ffffff;padding:13px 30px;border-radius:6px;
                  text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
          📅 Quiero saber más
        </a>
      </div>` : '';

    const linkedinBadge = SIGNATURE_LINKEDIN
        ? `<a href="${SIGNATURE_LINKEDIN}" style="color:#0077b5;text-decoration:none;font-size:12px;">LinkedIn →</a>`
        : '';

    const websiteLine = SIGNATURE_URL
        ? `<a href="${SIGNATURE_URL}" style="color:#1a56db;text-decoration:none;font-size:12px;">${SIGNATURE_URL}</a>`
        : '';

    const pixel = trackingPixel
        ? `<img src="${trackingPixel}" width="1" height="1" border="0" alt="" style="display:none;">`
        : '';

    const unsubLine = unsubscribeUrl
        ? `<p style="margin:12px 0 0 0;font-size:11px;color:#aaa;">
             ¿Prefieres no recibir más correos? <a href="${unsubscribeUrl}" style="color:#aaa;">Darse de baja</a>
           </p>`
        : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>BOE Radar Inteligente</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;background:#ffffff;border-radius:10px;
                      box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db,#0e3fa0);
                        padding:24px 32px;text-align:left;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
                📡 BOE Radar Inteligente
              </span>
              <span style="display:block;color:rgba(255,255,255,0.75);font-size:12px;margin-top:3px;">
                Monitorización automática de ayudas y licitaciones
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px 20px 36px;color:#1f2937;font-size:15px;">
              ${paragraphs}
              ${ctaButton}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:20px 36px 24px 36px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:14px;vertical-align:top;">
                    <div style="width:44px;height:44px;border-radius:50%;background:#1a56db;
                                color:#fff;font-size:18px;font-weight:700;text-align:center;
                                line-height:44px;">
                      ${(FROM_NAME || 'J').charAt(0).toUpperCase()}
                    </div>
                  </td>
                  <td style="vertical-align:top;">
                    <div style="font-weight:700;font-size:14px;color:#111827;">${FROM_NAME}</div>
                    <div style="font-size:12px;color:#6b7280;margin-top:2px;">${COMPANY_NAME}</div>
                    <div style="margin-top:5px;font-size:12px;">
                      ${websiteLine}
                      ${SIGNATURE_LINKEDIN ? ' &nbsp;·&nbsp; ' + linkedinBadge : ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;
                        padding:14px 36px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                Este correo se envió a través de ${COMPANY_NAME} · España
              </p>
              ${unsubLine}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  ${pixel}
</body>
</html>`;
}

// ─── Email inicial ────────────────────────────────────────────────────────────

/**
 * Genera un hash simple de una cadena para distribución uniforme.
 * @param {string} str
 * @returns {number}
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convierte a 32-bit integer
    }
    return Math.abs(hash);
}

export function generateInitialEmail(lead, abOverride = null) {
    const { COMPANY_NAME } = getConfig();
    const pdfNote = `\n\nTe adjunto también un pequeño dossier (PDF) con más detalles sobre el sistema, por si lo queréis revisar con calma.`;
    const ctaLink = `\n\nSi te resulta interesante y quieres que te dé más detalles de cómo lo podéis aplicar, respóndeme a este correo o escríbeme directamente al WhatsApp: 633448806.`;
    const successCase = `Actualmente nuestro sistema lo está utilizando, entre otros, una consultora tecnológica en España para detectar oportunidades relacionadas con IA y automatización.`;

    let subjectOptions = [];
    let bodyContent = '';
    let templateKey = '';

    const openingLine = lead.openingLine || null;
    const openingBlock = openingLine ? `${openingLine}\n\n` : '';
    const persPhrase = lead.personalization ? `\n\n${lead.personalization}` : '';

    switch (lead.type) {
        case 'consultora_tech':
            templateKey = 'initial_consultora';
            subjectOptions = [
                'Oportunidades de IA y Digitalización (Boletines Oficiales)',
                'Monitorización automática de ayudas TIC para tus clientes',
                'Radar de subvenciones tech y licitaciones — ¿lo conocéis?',
            ];
            bodyContent = `${openingBlock}He visto la actividad de ${lead.name || 'vuestra consultora'} y creo que os podría encajar mucho nuestro sistema/radar automático de ayudas públicas y licitaciones.\n\nCada día a las 9:00 escaneamos estructuradamente todos los boletines oficiales (BOE, BDNS, autonómicos). Podríais monitorizar sin esfuerzo nuevas oportunidades de IA, digitalización o automatización para vosotros o para vuestros clientes.${persPhrase}\n\n${successCase} Lo ajustamos con las keywords exactas de vuestro stack.`;
            break;

        case 'asesoria':
            templateKey = 'initial_asesoria';
            subjectOptions = [
                'Valor añadido para tus clientes: Radar automático de ayudas',
                'Monitorización de subvenciones y BOE para gestorías',
                'No dejéis pasar ayudas para vuestros clientes',
            ];
            bodyContent = `${openingBlock}Investigando despachos y asesorías he dado con ${lead.name || 'vosotros'}. Quería presentaros nuestro radar automático de boletines oficiales.\n\nAportar valor añadido hoy en día es vital, y enviar proactivamente información sobre ayudas y subvenciones a tus clientes marca la diferencia. Nuestro sistema filtra a diario BOE, BDNS y boletines autonómicos para que no perdáis ninguna convocatoria relevante.${persPhrase}\n\n${successCase}`;
            break;

        case 'despacho_legal':
            templateKey = 'initial_legal';
            subjectOptions = [
                'Monitorización legal de boletines oficiales y licitaciones',
                'Automatización de alertas del BOE para tu despacho',
                'Radar automático de convocatorias para clientes',
            ];
            bodyContent = `${openingBlock}He llegado a ${lead.name || 'vuestro despacho'} y quería explorar si os resulta de interés automatizar la monitorización de boletines oficiales.\n\nNuestro sistema escanea a diario el BOE y boletines autonómicos, filtrando por las áreas de práctica de vuestro interés o de vuestros clientes. Nos encargamos de mandaros un informe diario limpio y sin duplicados.${persPhrase}\n\n${successCase}`;
            break;

        case 'ingenieria':
            templateKey = 'initial_ingenieria';
            subjectOptions = [
                'Radar de licitaciones técnicas y obras (BOE automatizado)',
                'Monitorización de ayudas y proyectos de ingeniería',
                'Automatiza la búsqueda de proyectos y licitaciones',
            ];
            bodyContent = `${openingBlock}Viendo el perfil técnico de ${lead.name || 'vuestra ingeniería'}, quería presentaros una herramienta que automatiza la búsqueda de licitaciones y ayudas públicas.\n\nRastreamos a diario fuentes oficiales y os enviamos solo lo que haga match con vuestras áreas de especialidad técnica (obras, industrial, instalaciones, etc.).${persPhrase}\n\n${successCase}`;
            break;

        case 'asociacion_cluster':
            templateKey = 'initial_asociacion';
            subjectOptions = [
                'Información de ayudas para vuestros asociados',
                'Radar automático de subvenciones para el clúster',
                'Aporta más valor a tus asociados: Alertas de BOE/Ayudas',
            ];
            bodyContent = `${openingBlock}Considerando el rol aglutinador de ${lead.name || 'vuestra entidad'}, creo que os podría resultar muy útil nuestro radar de boletines oficiales.\n\nPodemos configurar un escaneo automático diario centrado en vuestro vertical. Así tendríais un flujo constante de alertas sobre ayudas, subvenciones o cambios normativos listos para re-enviar a los asociados.${persPhrase}\n\n${successCase}`;
            break;

        case 'empresa_sectorial': {
            templateKey = 'initial_sectorial';
            const sectorTxt = lead.sector ? `el sector de ${lead.sector.toLowerCase()}` : 'vuestro sector';
            subjectOptions = [
                `Radar automático de ayudas para ${sectorTxt}`,
                'Monitorización de subvenciones exclusivas de tu sector',
            ];
            bodyContent = `${openingBlock}Viendo la actividad de ${lead.name || 'vuestra empresa'}, quería sugeriros el uso de nuestro radar automático de ayudas y licitaciones.\n\nPodemos aplicar filtros precisos para que cada día recibáis a primera hora cualquier actualización relevante o línea de financiación pública orientada concretamente a ${sectorTxt}.${persPhrase}\n\n${successCase}`;
            break;
        }

        default:
            templateKey = 'initial_general';
            subjectOptions = [
                'Radar automático de subvenciones y licitaciones (BOE)',
                'Monitorización de ayudas públicas para tu empresa',
                'No pierdas ninguna convocatoria del BOE',
            ];
            bodyContent = `${openingBlock}Quería contactar contigo para presentaros una herramienta diseñada para automatizar la búsqueda de ayudas y licitaciones estatales y autonómicas.\n\nTodos los días a las 9:00 nuestro radar escanea y filtra los boletines para mandaros exclusivamente lo que encaja con vuestros intereses, eliminando el "ruido".${persPhrase}\n\n${successCase}`;
            break;
    }

    // ── A/B Testing: selecciona variante basada en leadId para distribución uniforme
    const abVariant = abOverride !== null ? abOverride : (simpleHash(lead.email || lead.id || '') % Math.max(subjectOptions.length, 3));
    const subjIndex = abVariant % subjectOptions.length;
    const subject = subjectOptions[subjIndex];

    const body = `${getGreeting()}\n\n${bodyContent}${pdfNote}${ctaLink}\n\nUn saludo,`;

    return { subject, body, templateKey, abVariant };
}

// ─── Follow-up ───────────────────────────────────────────────────────────────

export function generateFollowUpEmail(lead) {
    const ctaLink = `\n\nSi creéis que os puede resultar interesante, respóndeme por aquí o mándame un mensaje al WhatsApp al 633448806 y os enseño un par de ejemplos rápidos.`;
    const subject = `Re: Radar Automático de Ayudas — ¿Lo pudisteis ver?`;
    const templateKey = 'followup_general';

    const body = `${getGreeting()}\n\nTe escribía para saber si pudiste ver el correo que te mandé hace unos días sobre nuestro radar automático de ayudas y licitaciones.\n\nEstoy convencido de que os podría ahorrar muchísimas horas de revisión manual de boletines oficiales y evitaría que se os pase alguna convocatoria clave. Por si no lo visteis, os reenvío también el dossier adjunto con más detalles.${ctaLink}\n\nCualquier cosa, quedo a tu entera disposición.\n\nUn saludo,`;

    return { subject, body, templateKey };
}

// ─── Firma ───────────────────────────────────────────────────────────────────

export function appendSignature(bodyText) {
    const { COMPANY_NAME, SIGNATURE_URL, FROM_NAME } = getConfig();
    let sign = `\n--\n${FROM_NAME} – ${COMPANY_NAME}`;
    if (SIGNATURE_URL) sign += `\nWeb: ${SIGNATURE_URL}`;
    return bodyText + sign;
}
