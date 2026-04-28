import { scrapeGoogleMapsMultiQuery } from './google.js';
import { appendScrapedLeadsToCSV, appendReviewLeadsToCSV } from '../csv/writer.js';
import logger from '../utils/logger.js';
import { sleep } from '../utils/throttle.js';
import fs from 'fs';
import { closeBrowser } from '../utils/scraper.js';

// ─── NICHOS ORIGINALES (18k leads existentes — no tocar) ─────────────────────
const NICHES = [
    'Gestorías / asesorías', 'gestoría subvenciones', 'asesoría subvenciones',
    'gestoría ayudas', 'asesoría ayudas empresas', 'gestoría kit digital',
    'agente digitalizador', 'consultoría kit digital', 'gestoría fondos europeos',
    'asesoría fondos europeos', 'consultora subvenciones', 'Licitaciones',
    'consultora licitaciones', 'asesoría licitaciones', 'contratación pública consultoría',
    'gestión de licitaciones', 'consultoría sector público',
    'consultora transformación digital', 'consultora automatización',
    'consultora IA empresas', 'consultora ciberseguridad', 'consultora digitalización pymes',
    'consultora ERP CRM', 'partner microsoft dynamics', 'partner odoo', 'partner sage'
];

const PROVINCES = [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia',
    'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo',
    'Gijón', 'Vitoria', 'A Coruña', 'Elche', 'Granada', 'Tarrasa', 'Badalona',
    'Oviedo', 'Cartagena', 'Sabadell', 'Jerez de la Frontera', 'Móstoles',
    'Santa Cruz de Tenerife', 'Pamplona', 'Almería', 'Alcalá de Henares',
    'Fuenlabrada', 'Leganés', 'San Sebastián', 'Getafe', 'Burgos', 'Albacete',
    'Castellón', 'Santander', 'Alcorcón', 'Logroño', 'Badajoz', 'Marbella',
    'Salamanca', 'Huelva', 'Lleida', 'Tarragona', 'Dos Hermanas', 'Parla',
    'Torrejón de Ardoz', 'Mataró', 'León', 'Algeciras'
];

/**
 * Scrapes all niches in all provinces of Spain and saves them incrementally.
 * Can be stopped at any time. Resuming works by keeping track of the state file.
 */
export async function scrapeAllSpain(limitPerSearch = 40) {
    const STATE_FILE = './logs/bulk_state.json';
    const CSV_FILE = 'All_Spain_Leads_2.csv';
    const REVIEW_FILE = 'All_Spain_Leads_Revisar.csv';

    let state = { nicheIndex: 0, provinceIndex: 0 };

    if (fs.existsSync(STATE_FILE)) {
        try {
            state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            logger.info(`♻️ Retomando el scrapeo masivo desde el estado guardado: Nicho ${state.nicheIndex}, Provincia ${state.provinceIndex}`);
        } catch (e) {
            logger.warn('No se ha podido leer el estado previo. Empezando de cero.');
        }
    } else {
        logger.info('🚀 Iniciando "Modo Dios": Extracción Masiva Nacional...');
    }

    const totalCombinations = NICHES.length * PROVINCES.length;

    for (let i = state.nicheIndex; i < NICHES.length; i++) {
        const niche = NICHES[i];

        // Ensure that if we resume a specific niche midway, we start from the correct province,
        // but for subsequent niches, we start from province 0
        const startProv = (i === state.nicheIndex) ? state.provinceIndex : 0;

        for (let j = startProv; j < PROVINCES.length; j++) {
            const province = PROVINCES[j];
            const currentCombo = (i * PROVINCES.length) + j + 1;

            logger.info(`[${currentCombo}/${totalCombinations}] 📍 Buscando: "${niche}" en ${province}`);

            try {
                // Perform scrape
                const { leads, reviewLeads } = await scrapeGoogleMapsMultiQuery(niche, province, limitPerSearch, false);

                // Append leads con email al CSV principal
                appendScrapedLeadsToCSV(leads, CSV_FILE);

                // Append leads sin email al CSV de revisión
                appendReviewLeadsToCSV(reviewLeads, REVIEW_FILE);

                logger.info(`✅ Añadidos ${leads.length} con email + ${reviewLeads.length} para revisión.`);

            } catch (err) {
                logger.error(`Error buscando "${niche}" en ${province}: ${err.message}`);
            }

            // Save state so we can resume if user Ctrl+C
            fs.writeFileSync(STATE_FILE, JSON.stringify({ nicheIndex: i, provinceIndex: j + 1 }), 'utf-8');

            // Add a random delay to prevent Google from detecting the bot quickly
            const delayInSeconds = Math.floor(Math.random() * (12 - 5 + 1)) + 5; // 5 to 12 seconds
            logger.info(`Pasando a la siguiente provincia en ${delayInSeconds} segundos...`);
            await sleep(delayInSeconds * 1000);
        }
    }

    logger.info(`🎉 ¡SISTEMA FINALIZADO! Toda España ha sido escaneada. Leads: ${CSV_FILE} | Revisión: ${REVIEW_FILE}`);
    await closeBrowser();
}

// ─── NICHOS V2 (20 nuevos sectores — sin solapamiento con los 18k existentes) ─
export const NICHES_V2 = [
    // Salud B2B
    'clínica dental', 'clínica fisioterapia', 'clínica veterinaria',
    // Construcción y arquitectura
    'despacho de arquitectura', 'empresa constructora', 'instaladora solar fotovoltaica',
    // Turismo y hostelería
    'hotel alojamiento turístico', 'agencia de viajes', 'turismo rural casa rural',
    // Industria y logística
    'empresa manufacturera industrial', 'empresa logística transporte', 'empresa agroalimentaria',
    // Educación y formación
    'academia formación profesional', 'colegio privado concertado', 'centro formación empleo FUNDAE',
    // Social y ambiental
    'fundación ONG entidad social', 'consultora medioambiental sostenibilidad', 'colegio profesional federación empresarial',
    // Exportación y farmacia
    'empresa exportadora comercio exterior', 'farmacia distribuidora farmacéutica',
];

/**
 * Scrape NICHES_V2 por toda España. Escribe a Spain_Leads_Nuevos.csv (archivo separado
 * del principal) para poder ejecutar en paralelo con el envío de los 18k existentes.
 */
export async function scrapeAllSpainV2(limitPerSearch = 40) {
    const STATE_FILE = './logs/bulk_state_v2.json';
    const CSV_FILE = 'Spain_Leads_Nuevos.csv';
    const REVIEW_FILE = 'Spain_Leads_Nuevos_Revisar.csv';

    let state = { nicheIndex: 0, provinceIndex: 0 };

    if (fs.existsSync(STATE_FILE)) {
        try {
            state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            logger.info(`♻️  Retomando V2 desde: Nicho ${state.nicheIndex}, Provincia ${state.provinceIndex}`);
        } catch {
            logger.warn('No se pudo leer estado V2. Empezando de cero.');
        }
    } else {
        logger.info('🚀 Iniciando Scraper V2 — 20 nuevos sectores por toda España...');
    }

    const totalCombinations = NICHES_V2.length * PROVINCES.length;

    for (let i = state.nicheIndex; i < NICHES_V2.length; i++) {
        const niche = NICHES_V2[i];
        const startProv = (i === state.nicheIndex) ? state.provinceIndex : 0;

        for (let j = startProv; j < PROVINCES.length; j++) {
            const province = PROVINCES[j];
            const currentCombo = (i * PROVINCES.length) + j + 1;

            logger.info(`[V2 ${currentCombo}/${totalCombinations}] 📍 "${niche}" en ${province}`);

            try {
                const { leads, reviewLeads } = await scrapeGoogleMapsMultiQuery(niche, province, limitPerSearch, false);
                appendScrapedLeadsToCSV(leads, CSV_FILE);
                appendReviewLeadsToCSV(reviewLeads, REVIEW_FILE);
                logger.info(`✅ V2: +${leads.length} con email | +${reviewLeads.length} para revisión`);
            } catch (err) {
                logger.error(`Error V2 "${niche}" en ${province}: ${err.message}`);
            }

            fs.writeFileSync(STATE_FILE, JSON.stringify({ nicheIndex: i, provinceIndex: j + 1 }), 'utf-8');

            const delayInSeconds = Math.floor(Math.random() * 8) + 5;
            await sleep(delayInSeconds * 1000);
        }
    }

    logger.info(`🎉 V2 FINALIZADO. Nuevos leads: ${CSV_FILE} | Revisión: ${REVIEW_FILE}`);
    await closeBrowser();
}
