// src/classify/openai.js – clasificación avanzada v2 (con openingLine)
import OpenAI from 'openai';
import { z } from 'zod';
import logger from '../utils/logger.js';
import getConfig from '../config.js';
import { sleep, withRetry } from '../utils/throttle.js';
import { classifyByHeuristics } from './heuristics.js';

let openaiClient = null;

function getClient() {
    const { OPENAI_API_KEY } = getConfig();
    if (!OPENAI_API_KEY) return null;
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    }
    return openaiClient;
}

const AISchema = z.object({
    type: z.enum([
        'consultora_tech', 'asesoria', 'despacho_legal',
        'ingenieria', 'asociacion_cluster', 'empresa_sectorial', 'otro'
    ]),
    sector: z.string().nullable(),
    personalization: z.string().max(200).nullable(),
    openingLine: z.string().max(180).nullable(),
    painPoint: z.string().max(200).nullable(),
});

const SYSTEM_PROMPT = `Eres un experto en ventas B2B y copywriting de alto nivel.
Dado el perfil de una empresa española, debes:

1. CLASIFICAR el tipo de empresa en uno de estos:
   - consultora_tech (software, IT, transformación digital, IA, automatización)
   - asesoria (gestorías, contable, fiscal, administrativa)
   - despacho_legal (abogados, bufetes, mediadores)
   - ingenieria (arquitectura, ingeniería civil/industrial, instalaciones, obras)
   - asociacion_cluster (cámaras, patronales, fundaciones, clústeres)
   - empresa_sectorial (cualquier empresa con sector definido: hostelería, clínica, fábrica, comercio...)
   - otro (si no puedes determinarlo)

2. DETECTAR el sector principal en 1-3 palabras (null si no aplica).

3. ESCRIBIR una línea de apertura ultra-personalizada (openingLine):
   - Máximo 20 palabras
   - Debe sonar HUMANA y ESPECÍFICA (menciona algo concreto de la empresa/sector)
   - Ejemplo: "Vi que Special Asesoría lleva más de 15 años ayudando a pymes en Barcelona."
   - Ejemplo: "Vuestro enfoque en digitalización para el sector agroalimentario es muy llamativo."
   - Si no hay datos suficientes: null

4. PERSONALIZATION: Una frase adicional conectando específicamente el dolor del lead con el producto.
   - Máximo 25 palabras. null si no hay datos.

5. PAIN POINT: El problema principal que este tipo de empresa tiene con los boletines/ayudas oficiales.
   - En 10-15 palabras. null si no aplica.

Tu respuesta DEBE ser JSON válido con esta estructura EXACTA (sin markdown):
{
  "type": "...",
  "sector": "..." | null,
  "openingLine": "..." | null,
  "personalization": "..." | null,
  "painPoint": "..." | null
}`;

export async function classifyLead(lead) {
    const aiClient = getClient();

    if (!aiClient || (!lead.category && !lead.description && !lead.website && !lead.name)) {
        return classifyByHeuristics(lead);
    }

    const { OPENAI_MODEL } = getConfig();
    const leadDataString = JSON.stringify({
        nombre: lead.name,
        categoria: lead.category,
        descripcion: lead.description,
        web: lead.website,
        ciudad: lead.city,
    });

    try {
        const responseText = await withRetry(async () => {
            await sleep(300);
            const completion = await aiClient.chat.completions.create({
                model: OPENAI_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: leadDataString }
                ],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            });
            return completion.choices[0].message.content;
        }, 2, 2000);

        const parsed = JSON.parse(responseText);
        const validated = AISchema.parse(parsed);

        logger.debug(`AI: ${lead.name} → ${validated.type} | openingLine: ${validated.openingLine ? '✓' : '✗'}`);

        return {
            type: validated.type,
            sector: validated.sector || null,
            personalization: validated.personalization || null,
            openingLine: validated.openingLine || null,
            painPoint: validated.painPoint || null,
            confidence: 0.9,
            method: 'openai',
        };

    } catch (err) {
        logger.warn(`Error OpenAI para "${lead.name}", usando heurísticas: ${err.message}`);
        return classifyByHeuristics(lead);
    }
}
