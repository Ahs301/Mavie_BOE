import { scrapeGoogleMapsMultiQuery } from './google.js';
import { appendScrapedLeadsToCSV, appendReviewLeadsToCSV } from '../csv/writer.js';
import logger from '../utils/logger.js';
import { sleep } from '../utils/throttle.js';
import fs from 'fs';
import { closeBrowser } from '../utils/scraper.js';

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

            // Pausa aleatoria larga entre provincias para evitar detección por Google
            const delayInSeconds = Math.floor(Math.random() * (25 - 12 + 1)) + 12; // 12-25 segundos
            logger.info(`Pasando a la siguiente provincia en ${delayInSeconds} segundos...`);
            await sleep(delayInSeconds * 1000);
        }
    }

    logger.info(`🎉 ¡SISTEMA FINALIZADO! Toda España ha sido escaneada. Leads: ${CSV_FILE} | Revisión: ${REVIEW_FILE}`);
    await closeBrowser();
}
