// src/utils/throttle.js – control de velocidad de envío
import logger from './logger.js';

/**
 * Espera un número de milisegundos.
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Throttle por hora: lleva un contador de envíos en la ventana de 1 hora.
 */
export class HourlyRateLimiter {
    constructor(maxPerHour) {
        this.maxPerHour = maxPerHour;
        this.window = []; // timestamps de envíos recientes
    }

    /**
     * Espera si se ha alcanzado el límite por hora.
     */
    async waitIfNeeded() {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        // Eliminar stamps fuera de la ventana
        this.window = this.window.filter(t => t > oneHourAgo);

        if (this.window.length >= this.maxPerHour) {
            // Cuánto falta para que salga el más antiguo
            const oldest = this.window[0];
            const waitMs = oldest + 60 * 60 * 1000 - now + 1000; // +1s de margen
            logger.warn(
                `⏸  Límite por hora alcanzado (${this.maxPerHour}/h). Esperando ${Math.ceil(waitMs / 1000)}s…`
            );
            await sleep(waitMs);
            // Limpiar ventana otra vez tras la espera
            this.window = this.window.filter(t => t > Date.now() - 60 * 60 * 1000);
        }
    }

    /**
     * Registrar un envío exitoso.
     */
    record() {
        this.window.push(Date.now());
    }
}

/**
 * Reintento con backoff exponencial.
 * @param {Function} fn - función async a reintentar
 * @param {number} retries - número de reintentos
 * @param {number} baseDelayMs - delay base
 */
export async function withRetry(fn, retries = 2, baseDelayMs = 5000) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (attempt < retries) {
                const delay = baseDelayMs * Math.pow(2, attempt);
                logger.warn(`Reintento ${attempt + 1}/${retries} en ${delay / 1000}s: ${err.message}`);
                await sleep(delay);
            }
        }
    }
    throw lastError;
}

/**
 * Warmup para dominio nuevo: limita emails/día en primeras 2 semanas.
 * Ramp-up: Día 1: 5/día, Día 7: 30/día, Día 14: 100/día, Día 15+: ilimitado
 */
export class DailyWarmupLimiter {
    constructor(domainSetupDate = null) {
        // Si no se proporciona, asumir que es HOY (primer envío)
        this.domainSetupDate = domainSetupDate ? new Date(domainSetupDate) : new Date();
        this.sentToday = 0;
        this.dayStart = new Date().setHours(0, 0, 0, 0);
    }

    /**
     * Calcula el límite máximo de emails/día según edad del dominio.
     * @returns {number}
     */
    getDailyLimit() {
        const now = new Date();
        const ageMs = now.getTime() - this.domainSetupDate.getTime();
        const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

        if (ageDays < 1) return 5;      // Día 1: conservador
        if (ageDays < 3) return 10;     // Días 2-3
        if (ageDays < 7) return 20;     // Días 4-7
        if (ageDays < 14) return 50;    // Días 8-14
        return 500;                     // Día 15+: sin límite práctico
    }

    /**
     * Resetea el contador diario si pasó medianoche.
     */
    resetIfNewDay() {
        const now = new Date().setHours(0, 0, 0, 0);
        if (now > this.dayStart) {
            this.dayStart = now;
            this.sentToday = 0;
        }
    }

    /**
     * Espera si se ha alcanzado el límite diario.
     */
    async waitIfNeeded() {
        this.resetIfNewDay();
        const limit = this.getDailyLimit();

        if (this.sentToday >= limit) {
            // Calcular cuánto falta para medianoche siguente
            const now = new Date();
            const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
            const secondsToMidnight = (23 - h) * 3600 + (59 - m) * 60 + (60 - s);
            const waitMs = secondsToMidnight * 1000;

            logger.warn(
                `⏸  Límite diario alcanzado (${this.sentToday}/${limit} emails hoy). ` +
                `Esperando hasta mañana (${Math.ceil(waitMs / 1000)}s)…`
            );
            await sleep(waitMs);
            this.resetIfNewDay();
        }
    }

    /**
     * Registra un envío exitoso.
     */
    record() {
        this.resetIfNewDay();
        this.sentToday++;
    }

    /**
     * Retorna estado de warmup para logging.
     */
    getStatus() {
        const limit = this.getDailyLimit();
        const ageDays = Math.floor((new Date() - this.domainSetupDate) / (24 * 60 * 60 * 1000));
        return `[Warmup Día ${ageDays + 1}] ${this.sentToday}/${limit} emails hoy`;
    }
}
