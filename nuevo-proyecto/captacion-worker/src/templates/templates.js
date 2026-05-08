// src/templates/templates.js – emails de cold outreach B2B (v4 — plain text style)
// REGLA DE ORO: email de cold outreach = mensaje de humano a humano.
// Sin header de marca, sin botones CTA con colores, sin PDF adjunto en primer contacto.
// 4-6 líneas de cuerpo + una pregunta directa. HTML mínimo que no dispare filtros antispam.
import getConfig from '../config.js';

function getGreeting(lead = null) {
    if (lead && lead.contact_name) return `Hola ${lead.contact_name.split(' ')[0]},`;
    return 'Hola,';
}

// ─── HTML mínimo (plain-text style) ──────────────────────────────────────────
// No header, no gradientes, no CTA con colores, no logo.
// Solo texto + firma simple. Indistinguible de un email escrito a mano.
export function buildHtmlEmail(bodyText, _ctaLinkUnused, _trackingPixelUnused, unsubscribeUrl = '') {
    const { FROM_NAME, COMPANY_NAME, SIGNATURE_URL, SIGNATURE_LINKEDIN } = getConfig();

    const paragraphs = bodyText
        .split(/\n{2,}/)
        .map(p => `<p style="margin:0 0 16px 0;line-height:1.65;">${p.trim().replace(/\n/g, '<br>')}</p>`)
        .join('\n');

    const websitePart = SIGNATURE_URL
        ? `<a href="${SIGNATURE_URL}" style="color:#1a56db;text-decoration:none;">${SIGNATURE_URL}</a>`
        : '';

    const linkedinPart = SIGNATURE_LINKEDIN
        ? ` · <a href="${SIGNATURE_LINKEDIN}" style="color:#1a56db;text-decoration:none;">LinkedIn</a>`
        : '';

    const unsubLine = unsubscribeUrl
        ? `<p style="margin:20px 0 0 0;font-size:11px;color:#9ca3af;">
             ¿Prefieres no recibir más emails? <a href="${unsubscribeUrl}" style="color:#9ca3af;">Darse de baja</a>
           </p>`
        : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">

    ${paragraphs}

    <p style="margin:28px 0 2px 0;font-size:14px;color:#111827;line-height:1.4;">
      <strong>${FROM_NAME}</strong>
    </p>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      ${COMPANY_NAME}<br>
      ${websitePart}${linkedinPart}
    </p>

    ${unsubLine}
  </div>
</body>
</html>`;
}

// ─── Email inicial ────────────────────────────────────────────────────────────
// Máximo 5 párrafos. Un caso real concreto. Una pregunta directa al final.
// Sin "adjunto el PDF", sin "hemos creado una solución innovadora".
export function generateInitialEmail(lead, abOverride = null) {
    let subjectOptions = [];
    let bodyContent = '';
    let templateKey = '';

    const ciudad = lead.city || lead.ciudad || null;

    switch (lead.type) {

        case 'despacho_legal': {
            templateKey = 'initial_legal';
            const loc = ciudad ? ` en ${ciudad}` : '';
            subjectOptions = [
                `Una pregunta rápida sobre el BOE`,
                `¿Cuánto tiempo dedica el despacho a revisar el BOE cada semana?`,
                `Licitaciones del BOE para ${lead.name || 'el despacho'}`,
            ];
            bodyContent = `Soy Josep, fundador de Mavie.

Os escribo porque trabajo con despachos${loc} especializados en contratación pública y subvenciones. La queja más habitual: enterarse de las convocatorias con poco margen, o directamente perdérselas entre el volumen de trabajo diario.

He montado Radar BOE: escanea a diario el BOE, DOUE y boletines autonómicos y manda solo las alertas que hacen match con las keywords del despacho. Sin entrar a ningún portal.

La semana pasada un cliente encontró 3 licitaciones nuevas en su nicho sin buscarlas. Solo recibió el aviso en su bandeja mientras tomaba el café.

¿Tendría sentido una llamada de 10 minutos esta semana para ver si os encaja?`;
            break;
        }

        case 'asesoria': {
            templateKey = 'initial_asesoria';
            subjectOptions = [
                `¿Cómo seguís el BOE para los clientes?`,
                `Subvenciones para vuestros clientes (sin revisar el BOE a mano)`,
                `Una pregunta para ${lead.name || 'vuestro despacho'}`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Trabajo con gestorías y asesorías que gestionan ayudas y subvenciones para sus clientes. El problema habitual: enterarse de las convocatorias con poco tiempo o perderlas por completo.

Tengo un radar automático (Radar BOE) que filtra a diario el BOE y el BDNS y manda solo lo relevante para cada cliente, por keywords. Cero revisión manual de portales.

La semana pasada uno de mis clientes detectó una convocatoria del BDNS que le habría pasado desapercibida. Solo recibió el email por la mañana y pudo avisarle al cliente ese mismo día.

¿Tiene sentido que os enseñe cómo funciona en 10 minutos?`;
            break;
        }

        case 'consultora_tech': {
            templateKey = 'initial_consultora';
            subjectOptions = [
                `Ayudas de IA y digitalización (sin revisar el BOE a mano)`,
                `Una pregunta sobre subvenciones tech para ${lead.name || 'vuestra consultora'}`,
                `¿Cómo seguís las convocatorias de digitalización del BOE?`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Os escribo porque trabajo con consultoras tech que asesoran a clientes en digitalización e IA. Una queja frecuente: perderse convocatorias de subvenciones o ayudas porque el BOE y el BDNS son un laberinto.

He montado un radar automático que escanea a diario todas las fuentes oficiales y manda solo las alertas que encajan con vuestro perfil (IA, digitalización, automatización). Sin entrar a ningún portal.

¿Os encajaría ver cómo funciona en 10 minutos?`;
            break;
        }

        case 'ingenieria': {
            templateKey = 'initial_ingenieria';
            subjectOptions = [
                `Licitaciones técnicas del BOE para ${lead.name || 'vuestra ingeniería'}`,
                `¿Cuántas licitaciones revisáis manualmente cada semana?`,
                `Radar automático de licitaciones de obra e ingeniería`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Trabajo con ingenierías y estudios de arquitectura que siguen licitaciones públicas. La queja habitual: hay que entrar a varios portales cada mañana para no perderse nada, y aun así se cuelan convocatorias.

He montado Radar BOE: filtra a diario el BOE y las plataformas de contratación pública por vuestras especialidades (tipo de obra, CCAA, umbrales de importe) y os manda solo lo relevante en un email.

¿Tendría sentido verlo en 10 minutos?`;
            break;
        }

        case 'asociacion_cluster': {
            templateKey = 'initial_asociacion';
            subjectOptions = [
                `Alertas de BOE y ayudas para vuestros asociados`,
                `Una pregunta sobre información de subvenciones para ${lead.name || 'el clúster'}`,
                `¿Cómo mantenéis informados a los asociados sobre ayudas del BOE?`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Trabajo con asociaciones y clústeres que quieren aportar valor informando a sus asociados sobre ayudas, subvenciones y cambios normativos en su sector.

Tengo un radar automático que filtra a diario el BOE, BDNS y boletines autonómicos y genera un resumen listo para reenviar a los asociados, por temática y territorio.

¿Tiene sentido que os enseñe cómo funciona en 10 minutos?`;
            break;
        }

        case 'empresa_sectorial': {
            templateKey = 'initial_sectorial';
            const sectorTxt = lead.sector ? `el sector de ${lead.sector.toLowerCase()}` : 'vuestro sector';
            subjectOptions = [
                `Ayudas y subvenciones para ${sectorTxt} (BOE automático)`,
                `¿Tenéis un sistema para no perder convocatorias del BOE?`,
                `Radar de subvenciones para ${lead.name || 'vuestra empresa'}`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Os escribo porque empresas de ${sectorTxt} tienen acceso a líneas de financiación específicas que solo aparecen en el BOE y boletines autonómicos, y son difíciles de seguir sin dedicar tiempo a ello.

He montado un radar que hace ese seguimiento automáticamente y os manda un resumen a primera hora solo con lo que encaja con vuestro sector y territorio.

¿Os parece bien que os enseñe cómo funciona en 10 minutos?`;
            break;
        }

        case 'clinica_salud': {
            templateKey = 'initial_clinica';
            subjectOptions = [
                `Ayudas y normativa sanitaria del BOE para ${lead.name || 'vuestra clínica'}`,
                `¿Seguís el BOE para convocatorias de equipamiento o digitalización sanitaria?`,
                `Radar automático de subvenciones para centros de salud`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Os escribo porque clínicas y centros sanitarios reciben cada año convocatorias de ayudas para equipamiento, digitalización y formación que pasan desapercibidas porque nadie tiene tiempo de revisar el BOE y el BDNS a diario.

Tengo un radar que lo hace solo: filtra todas las fuentes oficiales cada mañana y os manda únicamente lo relevante para vuestro tipo de centro y comunidad autónoma.

¿Tiene sentido que os enseñe cómo funciona en 10 minutos?`;
            break;
        }

        case 'hosteleria_turismo': {
            templateKey = 'initial_hosteleria';
            subjectOptions = [
                `Subvenciones de turismo y reforma para ${lead.name || 'vuestro negocio'} (BOE)`,
                `¿Aprovecháis todas las ayudas turísticas autonómicas?`,
                `Radar automático de ayudas para alojamientos y hostelería`,
            ];
            bodyContent = `Soy Josep, de Mavie.

El sector turístico recibe cada año decenas de convocatorias de subvenciones: reformas, sostenibilidad, digitalización, accesibilidad. La mayoría pasan desapercibidas porque nadie tiene tiempo de revisar el BOE ni los boletines autonómicos.

Tengo un radar que lo hace solo: os avisa cada mañana únicamente cuando hay algo relevante para vuestro tipo de negocio y comunidad autónoma.

¿Os parece bien verlo en 10 minutos?`;
            break;
        }

        case 'formacion_educacion': {
            templateKey = 'initial_formacion';
            subjectOptions = [
                `Convocatorias FUNDAE y SEPE para ${lead.name || 'vuestro centro'} (sin perderos ninguna)`,
                `¿Cuántas convocatorias de formación habéis perdido por no ver el BOE a tiempo?`,
                `Radar automático de ayudas educativas y BOE`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Centros de formación y academias tienen una relación directa con el BOE: convocatorias FUNDAE, ayudas del SEPE, bonificaciones, cambios en cualificaciones. Todo aparece ahí, pero es imposible seguirlo a diario.

Tengo un radar que lo monitoriza automáticamente y os lo resume cada mañana, filtrado por vuestro ámbito, sin entrar a ningún portal.

¿Tiene sentido que os enseñe cómo funciona en 10 minutos?`;
            break;
        }

        case 'construccion_arquitectura': {
            templateKey = 'initial_construccion';
            subjectOptions = [
                `Licitaciones públicas y Next Generation para ${lead.name || 'vuestra empresa'}`,
                `¿Cuántas licitaciones revisáis manualmente cada semana?`,
                `Radar de obra pública, rehabilitación y subvenciones (BOE)`,
            ];
            bodyContent = `Soy Josep, de Mavie.

En construcción y arquitectura el BOE es una fuente constante: licitaciones de obra pública, ayudas a la rehabilitación, Next Generation EU, eficiencia energética. El problema es que hay que vigilar varios portales a la vez para no perderse nada.

Tengo un radar que filtra a diario todo eso y os manda solo lo que encaja con vuestro perfil: tipo de obra, comunidad autónoma, importe.

¿Os parece bien verlo en 10 minutos?`;
            break;
        }

        case 'industria_logistica': {
            templateKey = 'initial_industria';
            subjectOptions = [
                `Ayudas CDTI, PERTE y fondos FEDER para ${lead.name || 'vuestra empresa'}`,
                `¿Tenéis un sistema para no perder convocatorias del ICEX o CDTI?`,
                `Radar de subvenciones industriales y fondos europeos (BOE)`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Empresas industriales y de logística tienen acceso a líneas de financiación muy específicas: CDTI, PERTE, fondos FEDER, ayudas ICEX. El problema es que son difíciles de seguir porque se publican dispersas en distintos boletines.

Tengo un radar que hace ese seguimiento automático, con filtros por sector y territorio, y os manda un resumen a primera hora con solo lo relevante.

¿Os parece bien que os enseñe cómo funciona en 10 minutos?`;
            break;
        }

        default: {
            templateKey = 'initial_general';
            subjectOptions = [
                `¿Tenéis un sistema para no perder convocatorias del BOE?`,
                `Radar automático de ayudas y licitaciones (BOE)`,
                `Una pregunta sobre subvenciones para ${lead.name || 'vuestra empresa'}`,
            ];
            bodyContent = `Soy Josep, de Mavie.

Trabajo con empresas y despachos que necesitan estar al día de ayudas, subvenciones y licitaciones del BOE. El problema habitual es que revisar los boletines a mano lleva tiempo y aun así se escapan convocatorias.

He montado un radar automático que filtra a diario el BOE y el BDNS y manda solo lo relevante según las keywords de cada empresa, sin entrar a ningún portal.

¿Tendría sentido una llamada de 10 minutos para ver si os encaja?`;
            break;
        }
    }

    // A/B: distribuye subjects de forma uniforme por hash del email
    const hash = simpleHash(lead.email || lead.id || '');
    const abVariant = abOverride !== null ? abOverride : (hash % subjectOptions.length);
    const subject = subjectOptions[abVariant % subjectOptions.length];

    const calLink = 'https://cal.eu/josep-mes2ul/demo-radar-boe';
    const body = `${getGreeting(lead)}\n\n${bodyContent}\n\nPodéis reservar aquí directamente si os viene mejor: ${calLink}\n\nUn saludo,`;

    return { subject, body, templateKey, abVariant };
}

// ─── Follow-up (secuencia 3 toques) ──────────────────────────────────────────
// FU1 día ~4: retomar hilo brevemente + caso real
// FU2 día ~10: ángulo ROI distinto + precio explícito
// FU3 día ~17: cierre ("break-up") — deja la puerta abierta, no insiste
export function generateFollowUpEmail(lead, fuNumber = 1) {
    const { CALENDLY_URL } = getConfig();
    const calLink = CALENDLY_URL || 'https://cal.eu/josep-mes2ul/demo-radar-boe';
    const initialSubject = lead.last_subject || `¿Tendría sentido una llamada de 10 minutos?`;
    const reSubject = initialSubject.startsWith('Re:') ? initialSubject : `Re: ${initialSubject}`;

    if (fuNumber === 1) {
        return {
            subject: reSubject,
            templateKey: 'followup_1',
            body: `${getGreeting(lead)}\n\nSolo retomo por si se perdió entre el ruido de la bandeja.

Un cliente de despacho me comentaba la semana pasada que lo que más le sorprendió fue recibir el aviso de una licitación 3 días antes de que cerrara el plazo. Sin haber entrado al BOE ese día.

Si tiene sentido verlo, aquí puedes reservar 10 minutos: ${calLink}

¿Qué te parece?`,
        };
    }

    if (fuNumber === 2) {
        return {
            subject: reSubject,
            templateKey: 'followup_2',
            body: `${getGreeting(lead)}\n\nTe doy un poco más de contexto antes de dejarte tranquilo.

La diferencia con el BOE oficial: boe.es te manda PDFs enteros. Radar BOE te manda solo los artículos que encajan con tu actividad. Sin leer 40 páginas. Sin entrar a ningún portal cada mañana.

79€/mes, cancelas cuando quieras, prueba 14 días gratis.

¿Vale la pena 10 minutos? Aquí el enlace: ${calLink}`,
        };
    }

    // FU3 — break-up, sin presión
    return {
        subject: reSubject,
        templateKey: 'followup_3',
        body: `${getGreeting(lead)}\n\nEntiendo que no es el momento o que no encaja ahora mismo.

Dejo aquí el enlace por si en algún momento quieres echarle un vistazo: ${calLink}

Si alguna vez os pasa una convocatoria por encima por el volumen de trabajo, ya sabes dónde estoy.`,
    };
}

// ─── Firma (texto plano) ──────────────────────────────────────────────────────
export function appendSignature(bodyText) {
    const { COMPANY_NAME, SIGNATURE_URL, FROM_NAME } = getConfig();
    let sign = `\n--\n${FROM_NAME} – ${COMPANY_NAME}`;
    if (SIGNATURE_URL) sign += `\nWeb: ${SIGNATURE_URL}`;
    return bodyText + sign;
}

// ─── Util ─────────────────────────────────────────────────────────────────────
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
