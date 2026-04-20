'use strict';

const { BaseScraper } = require('./BaseScraper');

const BOE_API_BASE = 'https://www.boe.es/datosabiertos/api/boe/sumario';

// Secciones de poco valor para el perfil B2B (abogados/consultoras subvenciones)
const SKIP_SECTIONS = [
  'AUTORIDADES Y PERSONAL',
  'JUSTICIA',
  'ANUNCIOS PARTICULARES',
];

class BoeScraper extends BaseScraper {
  constructor() {
    super('BOE');
    this.baseUrl = BOE_API_BASE;
  }

  getDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  parseSummary(data) {
    const items = [];
    try {
      const sumario = data.data?.sumario || data.sumario;
      if (!sumario?.diario) return [];

      const diarios = Array.isArray(sumario.diario) ? sumario.diario : [sumario.diario];
      const publicationDate = sumario.metadatos?.fecha_publicacion || this.getDateString();

      for (const diario of diarios) {
        if (!diario) continue;
        const secciones = Array.isArray(diario.seccion) ? diario.seccion : [diario.seccion].filter(Boolean);

        for (const seccion of secciones) {
          if (!seccion) continue;
          const seccionNombre = (seccion.nombre || '').toUpperCase();
          if (SKIP_SECTIONS.some(s => seccionNombre.includes(s))) continue;

          const departamentos = Array.isArray(seccion.departamento)
            ? seccion.departamento
            : [seccion.departamento].filter(Boolean);

          for (const depto of departamentos) {
            if (!depto) continue;
            const itemsList = this._extractItems(depto);

            for (const item of itemsList) {
              if (!item?.titulo) continue;

              const pdfPath = item.url_pdf?.texto || item.url_pdf || '';
              const htmlPath = item.url_html?.texto || item.url_html || '';
              const title = this.cleanText(item.titulo);
              const description = this.cleanText(item.texto || item.titulo);

              const budgetMatch = description.match(/(\d+(?:[\.,]\d+)*\s?€)/);
              const deadlineMatch = description.match(/(?:plazo|duración)\s(?:de\s)?(\d+\s(?:días|meses|años))/i);

              items.push({
                source: 'BOE',
                title,
                description,
                url: htmlPath || pdfPath || '',
                pdf_url: pdfPath || '',
                publication_date: publicationDate,
                section: seccion.nombre || '',
                region: 'España',
                budget: budgetMatch ? budgetMatch[0] : null,
                deadline: deadlineMatch ? deadlineMatch[1] : null,
              });
            }
          }
        }
      }
    } catch (error) {
      this.handleError(error, 'parsing BOE summary');
    }
    return items;
  }

  _extractItems(depto) {
    if (depto.item) {
      return Array.isArray(depto.item) ? depto.item : [depto.item];
    }
    if (depto.epigrafe) {
      const epigrafes = Array.isArray(depto.epigrafe) ? depto.epigrafe : [depto.epigrafe];
      return epigrafes.flatMap(epi => {
        if (!epi.item) return [];
        return Array.isArray(epi.item) ? epi.item : [epi.item];
      });
    }
    return [];
  }

  async fetchItems() {
    const date = this.getDateString();
    const url = `${this.baseUrl}/${date}`;
    console.log(`[BOE] Fetching summary for ${date}...`);

    try {
      const response = await this.httpClient.get(url);
      if (!response.data) return [];
      const items = this.parseSummary(response.data);
      console.log(`[BOE] Parsed ${items.length} items`);
      return items;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('[BOE] No publication today (Sunday/holiday)');
        return [];
      }
      this.handleError(error, 'fetching BOE');
      return [];
    }
  }
}

module.exports = { BoeScraper };
