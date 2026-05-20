import fs from 'fs';
import path from 'path';
import cliProgress from 'cli-progress';
import logger from '../utils/logger.js';
import { sleep } from '../utils/throttle.js';
import { scrapeGoogleMapsMultiQuery } from './google.js';
import { appendScrapedLeadsToCSV, appendReviewLeadsToCSV } from '../csv/writer.js';
import { closeBrowser } from '../utils/scraper.js';

let shouldStop = false;

process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recibido — terminando después del combo actual...');
  shouldStop = true;
});
process.on('SIGINT', () => {
  logger.info('🛑 SIGINT recibido — terminando después del combo actual...');
  shouldStop = true;
});

const STATE_FILE = path.resolve(process.cwd(), 'todo_state.json');
const CSV_LEADS = path.resolve(process.cwd(), 'Todo_Leads.csv');
const CSV_REVIEW = path.resolve(process.cwd(), 'Todo_Revisar.csv');

export const MEGA_TYPES = [
  'despacho', 'bufete', 'consultora', 'consultoría', 'gestoría',
  'asesoría', 'firma', 'gabinete', 'oficina', 'estudio',
  'empresa', 'ingeniería', 'agencia', 'centro', 'clínica',
  'academia', 'cooperativa', 'fundación', 'sociedad', 'servicios',
];

export const MEGA_SPECS = [
  'subvenciones', 'licitaciones', 'contratación pública',
  'ayudas europeas', 'fondos Next Generation', 'I+D+i',
  'digitalización', 'transformación digital', 'kit digital',
  'fiscal', 'laboral', 'contable', 'mercantil',
  'urbanismo', 'medio ambiente', 'energías renovables',
  'derecho público', 'derecho administrativo', 'derecho concursal',
  'formación bonificada', 'FUNDAE', 'formación continua',
  'SEPE', 'empleo', 'recursos humanos',
  'CDTI', 'PERTE', 'comercio exterior', 'ICEX', 'exportación',
  'obra pública', 'rehabilitación', 'eficiencia energética',
  'propiedad industrial', 'propiedad intelectual', 'patentes',
  'calidad', 'ISO', 'prevención riesgos laborales',
  'compliance', 'protección datos', 'LOPD', 'RGPD',
  'arquitectura', 'reformas', 'construcción',
  'comunicación', 'marketing', 'publicidad',
  'financiero', 'finanzas', 'inversión',
  'consultoría estratégica', 'consultoría empresarial',
  'outsourcing', 'externalización',
  'inmobiliario', 'tasaciones', 'valoraciones',
  'logística', 'transporte', 'distribución',
  'agroalimentario', 'agricultura', 'ganadería',
  'turismo', 'hostelería', 'ocio',
  'seguros', 'correduría', 'mediación',
  'sostenibilidad', 'ESG', 'RSC',
  'internacionalización', 'mercados exteriores',
  'innovación', 'startups', 'emprendimiento',
];

export const MANUAL_NICHES = [
  'abogado subvenciones', 'abogado licitaciones',
  'consultora ayudas europeas', 'gestoría ayudas públicas',
  'agente digitalizador', 'asesor kit digital',
  'consultora I+D+i', 'asesoría I+D+i',
  'despacho contratación pública', 'bufete derecho administrativo',
  'gabinete jurídico subvenciones', 'fiscal asesor',
  'laboralista despacho', 'gestoría laboral',
  'asesoría contable', 'gestoría fiscal laboral',
  'consultora formación bonificada', 'academia formación FUNDAE',
  'ingeniería eficiencia energética', 'estudio arquitectura rehabilitación',
  'consultora medio ambiente', 'empresa sostenibilidad',
  'gestoría subvenciones NextGen', 'despacho PERTE',
  'consultora CDTI', 'oficina transferencia tecnología',
  'consultora exportación', 'asesoría internacionalización',
  'despacho propiedad industrial', 'bufete patentes',
  'consultora calidad ISO', 'empresa prevención riesgos',
  'gabinete compliance', 'asesor protección datos',
  'gestoría administrativa', 'oficina gestión trámites',
  'consultora transformación digital', 'empresa digitalización pymes',
  'sociedad tasación', 'oficina valoración empresas',
  'cooperativa agraria', 'sociedad agroalimentaria',
  'fundación empresarial', 'asociación empresarial',
  'firma consultoría estratégica', 'empresa consultoría gestión',
  'agencia comunicación marketing', 'consultora publicidad',
  'despacho seguros', 'correduría seguros',
  'consultora logística', 'empresa distribución',
  'agencia viajes corporativos', 'consultora turismo',
  'estudio arquitectura', 'despacho arquitectura',
];

const PROVINCIAS = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería',
  'Asturias', 'Ávila', 'Badajoz', 'Baleares', 'Barcelona',
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón',
  'Ciudad Real', 'Córdoba', 'Cuenca', 'Gerona', 'Granada',
  'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Jaén',
  'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga',
  'Murcia', 'Navarra', 'Orense', 'Palencia', 'Las Palmas',
  'Pontevedra', 'La Rioja', 'Salamanca', 'Segovia', 'Sevilla',
  'Soria', 'Tarragona', 'Santa Cruz de Tenerife', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza',
];

const CCAA = [
  'Andalucía', 'Aragón', 'Asturias', 'Cantabria', 'Castilla-La Mancha',
  'Castilla y León', 'Cataluña', 'Comunidad Valenciana', 'Comunidad de Madrid',
  'Extremadura', 'Galicia', 'Islas Baleares', 'Islas Canarias',
  'La Rioja', 'Navarra', 'País Vasco', 'Región de Murcia',
  'Ceuta', 'Melilla',
];

const MAJOR_CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza',
  'Málaga', 'Murcia', 'Palma de Mallorca', 'Las Palmas de Gran Canaria',
  'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo',
  'Gijón', 'Granada', 'San Sebastián', 'Toledo', 'Salamanca',
  'Oviedo', 'Pamplona', 'Santander', 'Castellón de la Plana',
  'Logroño', 'León', 'Cádiz', 'Huelva', 'Jaén', 'Almería',
  'Badajoz', 'Albacete', 'Burgos', 'Lérida', 'Tarragona',
  'Marbella', 'Benidorm', 'Santiago de Compostela', 'Elche',
  'Alcalá de Henares', 'Fuenlabrada', 'Móstoles', 'Leganés',
  'Getafe', 'Alcorcón', 'Torrejón de Ardoz', 'Parla',
  'Alcobendas', 'Coslada', 'Pozuelo de Alarcón', 'Las Rozas',
  'San Sebastián de los Reyes', 'Majadahonda', 'Collado Villalba',
  'Hospitalet de Llobregat', 'Badalona', 'Tarrasa', 'Sabadell',
  'Mataró', 'Santa Coloma de Gramenet', 'Reus', 'Gerona',
  'Manresa', 'Vilanova i la Geltrú', 'Rubí', 'Cornellà de Llobregat',
  'Lorca', 'Cartagena', 'Torrevieja', 'Orihuela',
  'Dos Hermanas', 'Algeciras', 'Jerez de la Frontera',
  'San Fernando', 'El Puerto de Santa María', 'La Línea de la Concepción',
  'Roquetas de Mar', 'El Ejido', 'Mijas', 'Fuengirola',
  'Torremolinos', 'Benalmádena', 'Estepona', 'Vélez-Málaga',
  'Rivas-Vaciamadrid', 'Tres Cantos', 'San Fernando de Henares',
  'Ponferrada', 'Guadalajara', 'Talavera de la Reina',
  'Ciudad Real', 'Puertollano', 'Cuenca', 'Ávila', 'Segovia',
  'Zamora', 'Palencia', 'Soria', 'Huesca', 'Teruel',
  'Calahorra', 'Lugo', 'Orense', 'Pontevedra', 'Ferrol',
  'Alcázar de San Juan', 'Tomelloso', 'Valdepeñas',
];

const MAD_DISTRICTS = [
  'Madrid Centro', 'Madrid Chamberí', 'Madrid Salamanca', 'Madrid Chamartín',
  'Madrid Tetuán', 'Madrid Moncloa', 'Madrid Latina', 'Madrid Carabanchel',
  'Madrid Usera', 'Madrid Puente de Vallecas', 'Madrid Moratalaz',
  'Madrid Ciudad Lineal', 'Madrid Hortaleza', 'Madrid Villaverde',
  'Madrid Villa de Vallecas', 'Madrid Vicálvaro', 'Madrid San Blas',
  'Madrid Barajas', 'Madrid Retiro', 'Madrid Arganzuela',
  'Alcalá de Henares', 'Aranjuez',
];

const BCN_DISTRICTS = [
  'Barcelona Ciutat Vella', 'Barcelona Eixample', 'Barcelona Sants-Montjuïc',
  'Barcelona Les Corts', 'Barcelona Sarrià-Sant Gervasi', 'Barcelona Gràcia',
  'Barcelona Horta-Guinardó', 'Barcelona Nou Barris', 'Barcelona Sant Andreu',
  'Barcelona Sant Martí',
];

export const MEGA_LOCATIONS = [
  ...new Set([
    ...CCAA, ...PROVINCIAS, ...MAJOR_CITIES, ...MAD_DISTRICTS, ...BCN_DISTRICTS,
  ]),
];

function generateAllNiches() {
  const set = new Set();
  for (const type of MEGA_TYPES) {
    for (const spec of MEGA_SPECS) {
      set.add(`${type} ${spec}`);
    }
  }
  for (const n of MANUAL_NICHES) {
    set.add(n);
  }
  return [...set];
}

export const MEGA_NICHES = generateAllNiches();

export function generateTodoList() {
  const items = [];
  for (const niche of MEGA_NICHES) {
    for (const location of MEGA_LOCATIONS) {
      items.push({ niche, location, key: `${niche}|||${location}` });
    }
  }
  return items;
}

export function loadTodoState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch {}
  return { completed: {}, startedAt: null, lastReset: null, totalCycles: 0, cycleStart: null };
}

export function saveTodoState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

async function scrapeTodoCycle({ limitPerCombo = 40 } = {}) {
  const allItems = generateTodoList();
  const totalItems = allItems.length;
  const state = loadTodoState();

  if (!state.startedAt) {
    state.startedAt = new Date().toISOString();
    state.cycleStart = new Date().toISOString();
    state.totalCycles = 0;
  }

  logger.info(`\n🔥 SCRAPER TOTAL — ${MEGA_NICHES.length} nichos × ${MEGA_LOCATIONS.length} ubicaciones = ${totalItems} combinaciones`);
  logger.info(`   Límite por combo: ${limitPerCombo} leads`);

  if (state.completed && Object.keys(state.completed).length > 0) {
    const done = Object.keys(state.completed).length;
    logger.info(`   Progreso: ${done}/${totalItems} (${Math.round(done / totalItems * 100)}%)`);
  }

  const bar = new cliProgress.SingleBar({
    format: '  TODO |{bar}| {percentage}% | {value}/{total} | ETA: {eta}s | Vel: {speed}/s',
    barCompleteChar: '█', barIncompleteChar: '░', hideCursor: true,
  }, cliProgress.Presets.shades_grey);

  bar.start(totalItems, 0);

  const doneSet = new Set(Object.keys(state.completed || {}));
  let processed = 0;
  let leadsTotal = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < totalItems; i++) {
    if (shouldStop) {
      logger.info('🛑 Parada solicitada. Guardando estado y saliendo limpio...');
      saveTodoState(state);
      bar.stop();
      await closeBrowser();
      logger.info(`📊 Progreso guardado: ${Object.keys(state.completed).length}/${totalItems} combos`);
      process.exit(0);
    }

    bar.update(i);
    const item = allItems[i];

    if (doneSet.has(item.key)) {
      skipCount++;
      continue;
    }

    logger.info(`\n🔄 [${i + 1}/${totalItems}] Scrapeando: "${item.niche}" en "${item.location}"`);
    try {
      const result = await scrapeGoogleMapsMultiQuery(item.niche, item.location, limitPerCombo, true);

      if (result.leads && result.leads.length > 0) {
        const withLocation = result.leads.map(l => ({ ...l, sourceQuery: `${item.niche} en ${item.location}` }));
        appendScrapedLeadsToCSV(withLocation, CSV_LEADS);
        leadsTotal += withLocation.length;
      }

      if (result.reviewLeads && result.reviewLeads.length > 0) {
        const withLocation = result.reviewLeads.map(l => ({ ...l, sourceQuery: `${item.niche} en ${item.location}` }));
        appendReviewLeadsToCSV(withLocation, CSV_REVIEW);
      }

      state.completed[item.key] = {
        ts: Date.now(),
        leads: result.leads ? result.leads.length : 0,
        review: result.reviewLeads ? result.reviewLeads.length : 0,
      };
      saveTodoState(state);
      processed++;
    } catch (err) {
      logger.error(`❌ Error en "${item.niche}" "${item.location}": ${err.message}`);
      state.completed[item.key] = { ts: Date.now(), error: err.message };
      saveTodoState(state);
      errorCount++;
    }

    if (processed > 0 && processed % 50 === 0) {
      logger.info(`\n📊 Checkpoint: ${processed} combos procesados, ${leadsTotal} leads totales, ${errorCount} errores`);
    }
  }

  bar.update(totalItems);
  bar.stop();

  const pctTotal = totalItems > 0 ? Math.round(leadsTotal / totalItems) : 0;
  logger.info(`\n🏁 CICLO COMPLETADO`);
  logger.info(`   Combinaciones procesadas: ${processed}`);
  logger.info(`   Omitidas: ${skipCount}`);
  logger.info(`   Errores: ${errorCount}`);
  logger.info(`   Leads totales: ${leadsTotal}`);
  logger.info(`   Promedio por combo: ${pctTotal}`);
  logger.info(`   CSV leads: ${CSV_LEADS}`);
  logger.info(`   CSV revisión: ${CSV_REVIEW}`);

  await closeBrowser();
  logger.info(`\n💡 Para enviar los leads: npm run outreach:send -- --file "${CSV_LEADS}"`);
}

export async function scrapeTodo(options = {}) {
  const { limitPerCombo = 40, infiniteLoop = false } = options;
  if (!infiniteLoop) {
    return scrapeTodoCycle({ limitPerCombo });
  }
  while (true) {
    const state = loadTodoState();
    state.completed = {};
    state.totalCycles = (state.totalCycles || 0) + 1;
    state.cycleStart = new Date().toISOString();
    if (!state.startedAt) state.startedAt = new Date().toISOString();
    saveTodoState(state);

    logger.info(`\n♻️  CICLO #${state.totalCycles} — Scraper Total infinito 24/7`);
    try {
      await scrapeTodoCycle({ limitPerCombo });
    } catch (err) {
      logger.error(`❌ Error en ciclo: ${err.message}`);
    }
    logger.info(`♻️  Ciclo #${state.totalCycles} completado. Reiniciando en 60 segundos...`);
    await sleep(60000);
  }
}
