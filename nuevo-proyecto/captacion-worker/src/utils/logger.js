// src/utils/logger.js – winston logger con rotación diaria por tamaño
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '..', '..', '.env') });

const LOG_DIR = process.env.LOG_DIR || './logs';

// Crear directorio si no existe
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const today = new Date().toISOString().slice(0, 10);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return stack
                ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
                : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        // Consola con colores
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message }) => `${level}: ${message}`)
            ),
        }),
        // Fichero por día
        new winston.transports.File({
            filename: path.join(LOG_DIR, `outreach-${today}.log`),
            maxsize: 10 * 1024 * 1024, // 10 MB
            maxFiles: 30,
        }),
        // Errores separados
        new winston.transports.File({
            filename: path.join(LOG_DIR, `errors-${today}.log`),
            level: 'error',
        }),
    ],
});

export default logger;
