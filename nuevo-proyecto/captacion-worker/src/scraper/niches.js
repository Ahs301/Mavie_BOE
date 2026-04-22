/**
 * src/scraper/niches.js
 * ─────────────────────────────────────────────────────────────────
 * Diccionario de nichos con sus variantes de búsqueda.
 * Permite multiplicar la cantidad de resultados obtenidos buscando
 * el mismo nicho con distintas palabras clave.
 *
 * Formato: clave (normalizada en minúsculas) → array de queries
 * Los valores deben ser términos que Google Maps reconozca bien.
 * ─────────────────────────────────────────────────────────────────
 */

export const NICHE_VARIANTS = {
    // ── Belleza y estética ─────────────────────────────
    'peluqueria': ['peluquería', 'salón de belleza', 'barbería', 'peluquero', 'hair salon', 'centro de belleza'],
    'peluquerias': ['peluquería', 'salón de belleza', 'barbería', 'peluquero', 'hair salon', 'centro de belleza'],
    'estetica': ['centro de estética', 'salón de estética', 'spa', 'masajes', 'belleza'],
    'barberia': ['barbería', 'barber shop', 'peluquería masculina', 'barbero'],
    'nail': ['nail art', 'manicura', 'uñas', 'pedicura', 'nail salon'],

    // ── Restauración ──────────────────────────────────
    'restaurante': ['restaurante', 'bar restaurante', 'bistró', 'gastrobar', 'comida casera', 'tapas'],
    'restaurantes': ['restaurante', 'bar restaurante', 'bistró', 'gastrobar', 'comida casera', 'tapas'],
    'bar': ['bar', 'cafetería', 'café', 'terraza bar', 'taberna'],
    'cafeteria': ['cafetería', 'café', 'coffee shop', 'panadería cafetería'],
    'panaderia': ['panadería', 'obrador', 'tahona', 'pastelería', 'repostería'],
    'pizzeria': ['pizzería', 'pizza', 'pasta italiana', 'restaurante italiano'],
    'catering': ['catering', 'banquetes', 'servicio de catering', 'bodas catering'],

    // ── Salud ─────────────────────────────────────────
    'clinica dental': ['clínica dental', 'dentista', 'odontología', 'ortodoncia', 'implantes dentales'],
    'fisioterapia': ['fisioterapia', 'fisioterapeuta', 'rehabilitación', 'osteopatía', 'clínica fisio'],
    'psicologia': ['psicólogo', 'psicología', 'terapeuta', 'terapia psicológica', 'consulta psicológica'],
    'medico': ['médico', 'clínica médica', 'consulta médica', 'medicina general'],
    'veterinaria': ['veterinaria', 'veterinario', 'clínica veterinaria', 'animales'],
    'optica': ['óptica', 'optometrista', 'gafas', 'lentillas'],
    'farmacia': ['farmacia', 'parafarmacia', 'farmacéutico'],
    'gimnasio': ['gimnasio', 'gym', 'crossfit', 'pilates', 'yoga', 'centro deportivo'],

    // ── Servicios legales/financieros ─────────────────
    'gestoria': ['gestoría', 'asesoría fiscal', 'asesoría laboral', 'gestión empresarial', 'asesor fiscal'],
    'abogado': ['abogado', 'despacho de abogados', 'bufete', 'asesoría jurídica', 'notaría'],
    'contabilidad': ['contable', 'contabilidad', 'asesoría contable', 'auditoría'],
    'inmobiliaria': ['inmobiliaria', 'agencia inmobiliaria', 'agente inmobiliario', 'pisos', 'alquiler'],

    // ── Tecnología ────────────────────────────────────
    'informatica': ['informática', 'servicio técnico', 'reparación ordenadores', 'IT', 'soporte informático'],
    'diseño web': ['diseño web', 'agencia digital', 'desarrollo web', 'marketing digital', 'SEO'],
    'agencia marketing': ['agencia de marketing', 'publicidad', 'marketing online', 'community manager'],

    // ── Educación ─────────────────────────────────────
    'academia': ['academia', 'clases particulares', 'academia idiomas', 'centro de estudios', 'extraescolares'],
    'guarderia': ['guardería', 'escuela infantil', 'jardín de infancia', 'ludoteca'],

    // ── Hogar y reformas ──────────────────────────────
    'fontanero': ['fontanero', 'fontanería', 'plomero', 'instalador fontanería'],
    'electricista': ['electricista', 'instalaciones eléctricas', 'electricidad', 'instalador eléctrico'],
    'pintor': ['pintor', 'pinturas', 'reformas pintura', 'decoración pinturas'],
    'reformas': ['reformas', 'reformas del hogar', 'construcción', 'obras', 'albañil', 'interiorismo'],
    'carpinteria': ['carpintería', 'carpintero', 'muebles a medida', 'ebanistería'],
    'cerrajero': ['cerrajero', 'cerrajería', 'servicio técnico cerrajería'],
    'mudanzas': ['mudanzas', 'transportes', 'servicio de mudanzas', 'portes'],

    // ── Vehículos ─────────────────────────────────────
    'taller mecanico': ['taller mecánico', 'taller coches', 'mecánico', 'revisión ITV', 'automoción'],
    'concesionario': ['concesionario', 'venta coches', 'automóviles', 'dealer coches'],
    'lavado coches': ['lavado coches', 'autolavado', 'limpieza vehículos', 'car wash'],

    // ── Comercio ──────────────────────────────────────
    'moda': ['tienda de ropa', 'boutique', 'moda', 'fashion', 'ropa mujer', 'ropa hombre'],
    'joyeria': ['joyería', 'relojería', 'bisutería', 'joyas'],
    'floristeria': ['floristería', 'flores', 'arreglos florales', 'florista'],
    'supermercado': ['supermercado', 'frutería', 'carnicería', 'ultramarinos', 'tienda alimentación'],

    // ── Subvenciones / consultoría ────────────────────
    'gestoria subvenciones': ['gestoría subvenciones', 'asesoría subvenciones', 'consultora subvenciones', 'gestoría ayudas', 'asesoría ayudas empresas'],
    'consultora digital': ['consultora digitalización', 'consultora transformación digital', 'consultora IA', 'agente digitalizador', 'kit digital'],
    'licitaciones': ['consultora licitaciones', 'asesoría licitaciones', 'contratación pública', 'licitaciones públicas'],
};

/**
 * Dado un keyword introducido por el usuario, devuelve sus variantes de búsqueda.
 * Si no está en el mapa, devuelve la misma keyword (sin variantes adicionales).
 *
 * @param {string} keyword
 * @returns {string[]}
 */
export function getSearchVariants(keyword) {
    const normalized = keyword.toLowerCase().trim();

    // Búsqueda exacta
    if (NICHE_VARIANTS[normalized]) {
        return NICHE_VARIANTS[normalized];
    }

    // Búsqueda parcial (si la keyword coincide como prefijo de una clave)
    for (const [key, variants] of Object.entries(NICHE_VARIANTS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return variants;
        }
    }

    // Fallback: usar la keyword tal cual
    return [keyword];
}
