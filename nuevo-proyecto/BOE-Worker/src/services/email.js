'use strict';

const nodemailer = require('nodemailer');

let transporter = null;

function initEmailService() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Faltan SMTP_HOST / SMTP_USER / SMTP_PASS en .env');
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function generateEmailHtml(items, clientConfig) {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);
  const companyName = clientConfig.clients?.company_name || 'Mavie';

  const categoryColors = {
    subvenci: { bg: '#E8F5E9', border: '#4CAF50', text: '#1B5E20', emoji: '💰', label: 'SUBVENCIÓN' },
    licitaci: { bg: '#E3F2FD', border: '#1E88E5', text: '#0D47A1', emoji: '📋', label: 'LICITACIÓN' },
    convocatoria: { bg: '#FFF8E1', border: '#FFA000', text: '#E65100', emoji: '📣', label: 'CONVOCATORIA' },
    ayuda: { bg: '#F3E5F5', border: '#8E24AA', text: '#4A148C', emoji: '🤝', label: 'AYUDA' },
  };

  function getCategoryStyle(title) {
    const t = title.toLowerCase();
    for (const [key, style] of Object.entries(categoryColors)) {
      if (t.includes(key)) return style;
    }
    return { bg: '#F5F5F5', border: '#9E9E9E', text: '#424242', emoji: '📌', label: 'BOE' };
  }

  const cards = items.map((item, i) => {
    const cat = getCategoryStyle(item.title);
    const description = item.description
      ? item.description.substring(0, 350) + (item.description.length > 350 ? '…' : '')
      : 'Sin descripción.';
    const pubDate = item.publication_date
      ? new Date(item.publication_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
          .toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      : '';

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:20px;border-radius:10px;overflow:hidden;
                  border:1px solid #E0E0E0;background:#FFFFFF;
                  box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr><td style="background:${cat.border};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr>
        <td style="padding:20px 24px;">
          <div style="margin-bottom:10px;">
            <span style="display:inline-block;padding:4px 12px;border-radius:20px;
                         font-size:10px;font-weight:800;letter-spacing:1px;
                         background:${cat.bg};color:${cat.text};border:1px solid ${cat.border};">
              ${cat.emoji}&nbsp;&nbsp;${cat.label}
            </span>
            &nbsp;
            <span style="font-size:11px;color:#BDBDBD;font-weight:600;">Nº ${i + 1} de ${items.length}</span>
          </div>

          <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#1A237E;line-height:1.4;">
            ${item.title}
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#F8FAFE;border-left:4px solid ${cat.border};
                        border-radius:0 8px 8px 0;margin-bottom:14px;">
            <tr>
              <td style="padding:10px 14px;">
                <p style="margin:0;font-size:13px;color:#37474F;line-height:1.6;">${description}</p>
              </td>
            </tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
            <tr>
              ${pubDate ? `<td style="padding-right:16px;font-size:12px;color:#546E7A;">📅&nbsp;<strong>Publicación:</strong>&nbsp;${pubDate}</td>` : ''}
              ${item.budget ? `<td style="padding-right:16px;font-size:12px;color:#1565C0;">💶&nbsp;<strong>Importe:</strong>&nbsp;${item.budget}</td>` : ''}
              ${item.deadline ? `<td style="font-size:12px;color:#E65100;">⏰&nbsp;<strong>Plazo:</strong>&nbsp;${item.deadline}</td>` : ''}
            </tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${item.url ? `
              <td style="padding-right:8px;">
                <a href="${item.url}" style="display:inline-block;padding:8px 18px;
                   background:#1E88E5;color:#FFFFFF;text-decoration:none;
                   border-radius:6px;font-size:13px;font-weight:600;">
                  🔗 Ver convocatoria
                </a>
              </td>` : ''}
              ${item.pdf_url ? `
              <td>
                <a href="${item.pdf_url}" style="display:inline-block;padding:8px 18px;
                   background:#FFFFFF;color:#E53935;text-decoration:none;
                   border-radius:6px;font-size:13px;font-weight:600;
                   border:2px solid #E53935;">
                  📄 PDF
                </a>
              </td>` : ''}
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Radar BOE – ${todayFormatted}</title></head>
<body style="margin:0;padding:0;background:#F0F2F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0F2F5;padding:30px 10px;">
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;margin:0 auto;">

      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,#1B5E20 0%,#2E7D32 60%,#388E3C 100%);
                   border-radius:12px 12px 0 0;padding:32px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);
                           letter-spacing:2px;text-transform:uppercase;">
                  ${companyName} · Radar BOE
                </p>
                <h1 style="margin:0 0 6px 0;font-size:24px;font-weight:800;color:#FFFFFF;">
                  🎯 Nuevas oportunidades detectadas
                </h1>
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);">${todayFormatted}</p>
              </td>
              <td align="right" valign="middle" style="padding-left:20px;white-space:nowrap;">
                <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:14px 20px;text-align:center;">
                  <p style="margin:0;font-size:36px;font-weight:900;color:#FFFFFF;line-height:1;">${items.length}</p>
                  <p style="margin:4px 0 0 0;font-size:11px;font-weight:600;color:rgba(255,255,255,0.8);
                             text-transform:uppercase;letter-spacing:0.5px;">
                    oportunidad${items.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CARDS -->
      <tr>
        <td style="background:#FFFFFF;padding:24px 24px 8px 24px;
                   border-left:1px solid #E0E0E0;border-right:1px solid #E0E0E0;">
          ${cards}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#263238;border-radius:0 0 12px 12px;padding:24px 36px;text-align:center;">
          <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#FFFFFF;">${companyName} · Radar BOE</p>
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6;">
            Este resumen es generado automáticamente y enviado únicamente cuando se detectan<br>
            oportunidades relevantes según sus palabras clave configuradas.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/**
 * Envía el digest de alertas BOE a los destinatarios del cliente.
 * @param {Object} clientConfig - fila de client_boe_configs (con .clients join)
 * @param {Array} items - items filtrados
 * @returns {Promise<boolean>}
 */
async function sendDigest(clientConfig, items) {
  if (!transporter) throw new Error('Email service no inicializado. Llamar initEmailService() primero.');
  if (!items?.length) return false;

  const recipients = clientConfig.destination_emails || [];
  if (!recipients.length) {
    console.warn(`[Email] Cliente ${clientConfig.client_id} sin destination_emails configurado`);
    return false;
  }

  const html = generateEmailHtml(items, clientConfig);
  const subject = `🎯 Radar BOE — ${items.length} nueva${items.length !== 1 ? 's' : ''} oportunidad${items.length !== 1 ? 'es' : ''} (${new Date().toLocaleDateString('es-ES')})`;

  try {
    const info = await transporter.sendMail({
      from: `"Radar BOE · Mavie" <${process.env.SMTP_USER}>`,
      to: recipients.join(', '),
      subject,
      html,
    });
    console.log(`[Email] Enviado a ${recipients.join(', ')} — messageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Error enviando a ${recipients.join(', ')}: ${error.message}`);
    return false;
  }
}

module.exports = { initEmailService, sendDigest };
