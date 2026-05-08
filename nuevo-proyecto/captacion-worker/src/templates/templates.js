// src/templates/templates.js – emails de outreach (v3 – texto plano conversacional)
import getConfig from '../config.js';

// ─── HTML mínimo ─────────────────────────────────────────────────────────────
// Sin header de producto, sin gradientes, sin botones fancy.
// Parece un email normal de una persona → inbox en vez de Promociones.
export function buildHtmlEmail(bodyText, ctaLink, trackingPixel = '', unsubscribeUrl = '') {
    const { FROM_NAME, COMPANY_NAME, SIGNATURE_URL } = getConfig();

    const paragraphs = bodyText
        .split(/\n{2,}/)
        .map(p => `<p style="margin:0 0 16px 0;line-height:1.6;">${p.trim().replace(/\n/g, '<br>')}</p>`)
        .join('\n');

    const ctaLine = ctaLink
        ? `<p style="margin:0 0 16px 0;line-height:1.6;"><a href="${ctaLink}" style="color:#1a56db;">${ctaLink}</a></p>`
        : '';

    const unsubLine = unsubscribeUrl
        ? `<p style="font-size:11px;color:#9ca3af;margin:20px 0 0 0;">Si prefieres no recibir más mensajes: <a href="${unsubscribeUrl}" style="color:#9ca3af;">darse de baja</a></p>`
        : '';

    const pixel = trackingPixel
        ? `<img src="${trackingPixel}" width="1" height="1" border="0" alt="" style="display:none;">`
        : '';

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;max-width:600px;">
  ${paragraphs}
  ${ctaLine}
  <p style="margin:0 0 4px 0;line-height:1.6;"><strong>${FROM_NAME}</strong></p>
  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">${COMPANY_NAME}${SIGNATURE_URL ? ' · <a href="' + SIGNATURE_URL + '" style="color:#6b7280;">' + SIGNATURE_URL + '</a>' : ''}</p>
  ${unsubLine}
  ${pixel}
</body>
</html>`;
}

// ─── Hash para A/B testing ────────────────────────────────────────────────────
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// ─── Email inicial ─────────────────────────────────────────────────────────────
// Principios:
//  • Máximo 60-80 palabras en el cuerpo
//  • Una sola pregunta / CTA al final
//  • Prueba social concreta (número real, ciudad, resultado)
//  • Sin mencionar el nombre del producto en el asunto
//  • Sin adjunto en el primer email (reduce spam score)

export function generateInitialEmail(lead, abOverride = null) {
    const { CALENDLY_URL, FROM_NAME } = getConfig();
    const cta = CALENDLY_URL
        ? `¿Tenéis 20 minutos esta semana? ${CALENDLY_URL}`
        : `¿Tenéis 20 minutos esta semana? Respondedme aquí y lo cuadramos.`;

    const nombre = lead.name ? lead.name.split(' ')[0] : null;
    const saludo = nombre ? `Buenas ${nombre},` : `Buenas,`;

    let subjectOptions = [];
    let bodyContent = '';
    let templateKey = '';

    switch (lead.type) {

        case 'despacho_legal':
            templateKey = 'initial_legal_v3';
            subjectOptions = [
                '¿Vigiláis el BOE manualmente?',
                'licitaciones — idea rápida',
                'monitorización BOE automática',
            ];
            bodyContent = `${saludo}

Trabajamos con despachos de contratación pública para automatizar la vigilancia del BOE, BDNS y boletines autonómicos.

Un cliente nuestro dejó de perder convocatorias y se ahorró más de 6 horas semanales de revisión manual en el primer mes.

${cta}`;
            break;

        case 'asesoria':
            templateKey = 'initial_asesoria_v3';
            subjectOptions = [
                '¿cuántas subvenciones se os pasan?',
                'ayudas para tus clientes — idea',
                'monitorización automática de subvenciones',
            ];
            bodyContent = `${saludo}

Ayudamos a gestorías y asesorías a no perder ninguna ayuda o subvención relevante para sus clientes — con un radar automático del BOE y BDNS.

Una gestoría de Valencia pasó de revisar boletines a mano a recibir cada mañana un resumen filtrado por perfil de cliente, y lo usa como argumento de venta.

${cta}`;
            break;

        case 'consultora_tech':
            templateKey = 'initial_consultora_v3';
            subjectOptions = [
                'licitaciones tech — idea rápida',
                'oportunidades IA en boletines oficiales',
                'digitalización — alertas BOE automáticas',
            ];
            bodyContent = `${saludo}

Trabajamos con consultoras tech para detectar automáticamente licitaciones y ayudas de digitalización, IA y automatización en boletines oficiales.

Una consultora de Madrid recibe cada mañana solo las oportunidades que encajan con su stack — ahorrándose más de 10 horas semanales de búsqueda manual.

${cta}`;
            break;

        case 'ingenieria':
            templateKey = 'initial_ingenieria_v3';
            subjectOptions = [
                'licitaciones técnicas — idea rápida',
                '¿buscáis proyectos en el BOE?',
                'radar de obras y licitaciones',
            ];
            bodyContent = `${saludo}

Automatizamos la búsqueda de licitaciones públicas y proyectos técnicos en el BOE y boletines autonómicos para ingenierías como la vuestra.

Uno de nuestros clientes detecta ahora cada mañana las licitaciones de su especialidad sin revisar manualmente ningún boletín.

${cta}`;
            break;

        case 'asociacion_cluster':
            templateKey = 'initial_asociacion_v3';
            subjectOptions = [
                'ayudas para vuestros asociados — idea',
                'radar de subvenciones para el sector',
                'alertas BOE para asociaciones',
            ];
            bodyContent = `${saludo}

Ayudamos a asociaciones y clústeres a enviar automáticamente a sus asociados las ayudas y cambios normativos del BOE que les afectan.

Una asociación sectorial lleva ya 6 meses usando nuestro radar y lo considera uno de los servicios más valorados por sus miembros.

${cta}`;
            break;

        case 'empresa_sectorial': {
            templateKey = 'initial_sectorial_v3';
            const sectorTxt = lead.sector ? `el sector de ${lead.sector.toLowerCase()}` : 'vuestro sector';
            subjectOptions = [
                `ayudas para ${sectorTxt} — idea`,
                '¿seguís el BOE manualmente?',
                'radar de subvenciones automatizado',
            ];
            bodyContent = `${saludo}

Automatizamos la búsqueda de ayudas, subvenciones y cambios normativos en el BOE para empresas de ${sectorTxt}.

Nuestros clientes reciben cada mañana solo lo relevante para su sector — sin perder tiempo revisando boletines.

${cta}`;
            break;
        }

        case 'clinica_salud':
            templateKey = 'initial_clinica_v3';
            subjectOptions = [
                '¿seguís el BOE para ayudas sanitarias manualmente?',
                'convocatorias sanitarias — idea rápida',
                'radar de ayudas para centros de salud',
            ];
            bodyContent = `${saludo}

Ayudamos a clínicas y centros sanitarios a no perder convocatorias de ayudas para equipamiento, digitalización y formación que salen cada semana en el BOE y BDNS.

Nuestros clientes reciben cada mañana solo lo relevante para su tipo de centro — sin entrar a ningún portal.

${cta}`;
            break;

        case 'hosteleria_turismo':
            templateKey = 'initial_hosteleria_v3';
            subjectOptions = [
                'ayudas turísticas — idea rápida',
                '¿perdéis subvenciones por no ver el BOE?',
                'radar de subvenciones para hostelería',
            ];
            bodyContent = `${saludo}

El sector turístico recibe cada año decenas de convocatorias de ayudas autonómicas — reformas, sostenibilidad, digitalización — que pasan desapercibidas por falta de tiempo para revisar el BOE.

Automatizamos ese seguimiento y os avisamos solo cuando hay algo relevante para vuestro negocio.

${cta}`;
            break;

        case 'formacion_educacion':
            templateKey = 'initial_formacion_v3';
            subjectOptions = [
                'convocatorias FUNDAE sin revisión manual',
                '¿perdéis ayudas educativas por no ver el BOE?',
                'radar de subvenciones para centros de formación',
            ];
            bodyContent = `${saludo}

Los centros de formación tienen convocatorias específicas en el BOE y BDNS cada semana — FUNDAE, SEPE, cualificaciones — y es fácil perdérselas sin un sistema automático.

Nuestro radar filtra todo a diario y os lo resume en un email cada mañana.

${cta}`;
            break;

        case 'construccion_arquitectura':
            templateKey = 'initial_construccion_v3';
            subjectOptions = [
                'licitaciones de obra pública — idea rápida',
                '¿cuántas licitaciones revisáis manualmente?',
                'radar BOE para construcción y arquitectura',
            ];
            bodyContent = `${saludo}

En construcción y arquitectura el BOE es una fuente constante de oportunidades: licitaciones de obra pública, ayudas a la rehabilitación, Next Generation EU, eficiencia energética.

Automatizamos ese seguimiento y os enviamos cada mañana solo lo que encaja con vuestro perfil.

${cta}`;
            break;

        case 'industria_logistica':
            templateKey = 'initial_industria_v3';
            subjectOptions = [
                'ayudas CDTI y fondos europeos — idea',
                '¿seguís el BOE industrial manualmente?',
                'radar de subvenciones para industria y logística',
            ];
            bodyContent = `${saludo}

Las empresas industriales y logísticas tienen líneas de financiación muy específicas — CDTI, PERTE, fondos FEDER, ICEX — que solo aparecen en el BOE y son difíciles de seguir sin un sistema.

Nuestro radar hace ese seguimiento automáticamente y os manda cada mañana solo lo relevante para vuestro sector.

${cta}`;
            break;

        default:
            templateKey = 'initial_general_v3';
            subjectOptions = [
                '¿seguís el BOE manualmente?',
                'radar de subvenciones automático — idea',
                'BOE — idea rápida',
            ];
            bodyContent = `${saludo}

Automatizamos la vigilancia del BOE, BDNS y boletines autonómicos para que no perdáis ninguna ayuda o licitación relevante.

Nuestros clientes pasan de revisar boletines a mano a recibir cada mañana un resumen filtrado por sus intereses.

${cta}`;
            break;
    }

    const abVariant = abOverride !== null ? abOverride : (simpleHash(lead.email || '') % subjectOptions.length);
    const subject = subjectOptions[abVariant % subjectOptions.length];
    const body = bodyContent;

    return { subject, body, templateKey, abVariant };
}

// ─── Follow-up ────────────────────────────────────────────────────────────────
// Muy corto — solo comprueba si llegó el primer email.
// Se envía en el mismo hilo (In-Reply-To) para aumentar probabilidad de lectura.

export function generateFollowUpEmail(lead) {
    const { CALENDLY_URL } = getConfig();
    const cta = CALENDLY_URL
        ? `Si os parece relevante, ¿15 minutos esta semana? ${CALENDLY_URL}`
        : `Si os parece relevante, respondedme aquí y lo cuadramos.`;

    const nombre = lead.name ? lead.name.split(' ')[0] : null;
    const saludo = nombre ? `Buenas ${nombre},` : `Buenas,`;

    const subject = `Re: monitorización BOE — ¿lo pudisteis ver?`;
    const templateKey = 'followup_v3';

    const body = `${saludo}

Te escribía para saber si pudiste ver el mensaje anterior sobre la monitorización automática del BOE.

${cta}

Si ya no os interesa, solo dímelo y no vuelvo a molestar.`;

    return { subject, body, templateKey };
}

// ─── Firma (para texto plano) ─────────────────────────────────────────────────
export function appendSignature(bodyText) {
    const { COMPANY_NAME, SIGNATURE_URL, FROM_NAME } = getConfig();
    let sign = `\n\nUn saludo,\n${FROM_NAME}\n${COMPANY_NAME}`;
    if (SIGNATURE_URL) sign += `\n${SIGNATURE_URL}`;
    return bodyText + sign;
}
