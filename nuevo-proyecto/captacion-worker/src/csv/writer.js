import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

/**
 * Escapa valores para que no rompan el formato CSV (comillas dobles, comas, etc.)
 */
function escapeCSV(val) {
    if (val === null || val === undefined) return '';
    let str = '';
    try {
        str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    } catch (e) {
        str = '';
    }

    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Escribe un array de objetos (leads) en un archivo CSV.
 * @param {Array} leads - Array de leads extraídos
 * @param {string} fileName - Nombre del archivo de salida
 */
export function writeScrapedLeadsToCSV(leads, fileName) {
    if (!leads || leads.length === 0) {
        logger.warn('No hay leads para exportar a CSV.');
        return;
    }

    const outputPath = path.resolve(process.cwd(), fileName);

    // Definir las cabeceras estándar para nuestro sistema
    const headers = ['Name', 'Email', 'Phone', 'Website', 'Address', 'Category', 'Description'];

    // Escribir cabeceras
    let csvContent = headers.join(',') + '\n';

    // Rellenar filas
    for (const lead of leads) {
        const row = [
            escapeCSV(lead.name),
            escapeCSV(lead.email),
            escapeCSV(lead.phone),
            escapeCSV(lead.website),
            escapeCSV(lead.address),
            escapeCSV(lead.category),
            escapeCSV(lead.description)
        ];
        csvContent += row.join(',') + '\n';
    }

    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    logger.info(`✅ Archivo CSV guardado con éxito: ${outputPath}`);
}

/**
 * Añade un array de objetos (leads) a un archivo CSV existente, 
 * o lo crea si no existe. Ideal para procesos largos que se pueden pausar.
 */
export function appendScrapedLeadsToCSV(leads, fileName) {
    if (!leads || leads.length === 0) {
        return;
    }

    const outputPath = path.resolve(process.cwd(), fileName);
    const headers = ['Name', 'Email', 'Phone', 'Website', 'Address', 'Category', 'Description'];
    let csvContent = '';

    if (!fs.existsSync(outputPath)) {
        csvContent = headers.join(',') + '\n';
    }

    // Rellenar filas
    for (const lead of leads) {
        const row = [
            escapeCSV(lead.name),
            escapeCSV(lead.email),
            escapeCSV(lead.phone),
            escapeCSV(lead.website),
            escapeCSV(lead.address),
            escapeCSV(lead.category),
            escapeCSV(lead.description)
        ];
        csvContent += row.join(',') + '\n';
    }

    fs.appendFileSync(outputPath, csvContent, 'utf-8');
}

/**
 * Escribe los leads SIN email en un CSV de revisión manual.
 * Incluye columnas extra: motivo_sin_email, sugerencia_ia, url_maps.
 */
export function writeReviewLeadsToCSV(leads, fileName) {
    if (!leads || leads.length === 0) {
        logger.info('No hay leads para revisar manualmente.');
        return;
    }

    const outputPath = path.resolve(process.cwd(), fileName);
    const headers = ['Name', 'Phone', 'Website', 'Address', 'Category',
        'Motivo_Sin_Email', 'Sugerencia_IA', 'Maps_URL', 'Source_Query'];

    let csvContent = headers.join(',') + '\n';

    for (const lead of leads) {
        const row = [
            escapeCSV(lead.name),
            escapeCSV(lead.phone),
            escapeCSV(lead.website),
            escapeCSV(lead.address),
            escapeCSV(lead.category),
            escapeCSV(lead.reviewLabel || lead.reviewCode || 'Revisar manualmente'),
            escapeCSV(lead.reviewSuggestion || ''),
            escapeCSV(lead.mapsUrl || ''),
            escapeCSV(lead.sourceQuery || ''),
        ];
        csvContent += row.join(',') + '\n';
    }

    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    logger.info(`\u26a0\ufe0f  CSV revisión manual guardado: ${outputPath} (${leads.length} leads)`);
}

/**
 * Añade leads de revisión al CSV (modo append, para procesos largos)
 */
export function appendReviewLeadsToCSV(leads, fileName) {
    if (!leads || leads.length === 0) return;

    const outputPath = path.resolve(process.cwd(), fileName);
    const headers = ['Name', 'Phone', 'Website', 'Address', 'Category',
        'Motivo_Sin_Email', 'Sugerencia_IA', 'Maps_URL', 'Source_Query'];
    let csvContent = '';

    if (!fs.existsSync(outputPath)) {
        csvContent = headers.join(',') + '\n';
    }

    for (const lead of leads) {
        const row = [
            escapeCSV(lead.name),
            escapeCSV(lead.phone),
            escapeCSV(lead.website),
            escapeCSV(lead.address),
            escapeCSV(lead.category),
            escapeCSV(lead.reviewLabel || lead.reviewCode || 'Revisar manualmente'),
            escapeCSV(lead.reviewSuggestion || ''),
            escapeCSV(lead.mapsUrl || ''),
            escapeCSV(lead.sourceQuery || ''),
        ];
        csvContent += row.join(',') + '\n';
    }

    fs.appendFileSync(outputPath, csvContent, 'utf-8');
}
