export interface Vertical {
  slug: string
  nombre: string
  descripcion: string
  heroTitle: string
  heroSubtitle: string
  painPoints: { titulo: string; texto: string }[]
  useCases: { titulo: string; texto: string }[]
  keywords: string[]
  faqs: { pregunta: string; respuesta: string }[]
  ctaTexto: string
}

export const VERTICALES: Vertical[] = [
  {
    slug: "despachos-abogados",
    nombre: "Despachos de Abogados",
    descripcion:
      "Monitorización automática del BOE para despachos de abogados. Detecta licitaciones, cambios normativos y resoluciones judiciales relevantes para tu bufete antes que la competencia.",
    heroTitle: "Radar BOE para\nDespachos de Abogados",
    heroSubtitle:
      "Detecta licitaciones de servicios jurídicos, cambios legislativos y resoluciones relevantes al instante. Tu despacho siempre informado antes que el resto.",
    painPoints: [
      {
        titulo: "Revisar el BOE cada mañana consume horas",
        texto:
          "Un abogado senior invierte una media de 45 minutos diarios en revisar boletines oficiales. Con Radar BOE, ese tiempo se reduce a 2 minutos revisando un email con solo las publicaciones relevantes.",
      },
      {
        titulo: "Licitaciones que se escapan por llegar tarde",
        texto:
          "El plazo medio de una licitación de servicios jurídicos es de 15 días. Sin monitorización automática, muchas se detectan cuando ya es demasiado tarde para preparar una oferta competitiva.",
      },
      {
        titulo: "Cambios normativos que afectan a tus clientes VIP",
        texto:
          "Nuevas regulaciones, modificaciones de leyes o resoluciones judiciales que impactan directamente en los asuntos de tus clientes. Si te enteras tarde, tu cliente se enterará por otro abogado.",
      },
    ],
    useCases: [
      {
        titulo: "Licitaciones de asesoría jurídica pública",
        texto:
          "Detecta automáticamente concursos públicos que requieran servicios legales: contratación pública, defensa jurídica de la administración, mediación y arbitraje.",
      },
      {
        titulo: "Seguimiento de normativa sectorial",
        texto:
          "Monitoriza cambios en la Ley de Contratos del Sector Público, normativa fiscal, laboral o mercantil que requieran acción inmediata para tus clientes.",
      },
      {
        titulo: "Alertas de subvenciones para clientes",
        texto:
          "Identifica convocatorias de ayudas y subvenciones relevantes para los sectores de tus clientes, ofreciéndoles un servicio proactivo de alto valor añadido.",
      },
    ],
    keywords: [
      "radar BOE abogados",
      "monitorización BOE despachos",
      "alertas BOE bufete",
      "licitaciones servicios jurídicos",
      "BOE cambios normativos",
      "automatización despacho abogados",
    ],
    faqs: [
      {
        pregunta: "¿Qué tipo de publicaciones del BOE monitoriza para despachos?",
        respuesta:
          "Monitorizamos licitaciones de servicios jurídicos, cambios legislativos, resoluciones judiciales relevantes, nombramientos, concursos de asesoría legal para la administración pública, y cualquier publicación que coincida con las keywords que configure tu despacho.",
      },
      {
        pregunta: "¿Puedo configurar alertas por área de práctica?",
        respuesta:
          "Sí. Puedes definir keywords positivas y negativas por especialidad: derecho administrativo, fiscal, laboral, mercantil, contratación pública, etc. El sistema filtra solo lo relevante para tu área.",
      },
      {
        pregunta: "¿Cuánto tiempo tarda la implantación en un despacho?",
        respuesta:
          "Menos de 72 horas. Realizamos una breve reunión técnica para definir keywords y fuentes, configuramos el sistema, y tu despacho empieza a recibir alertas al día siguiente.",
      },
      {
        pregunta: "¿Es compatible con el sistema informático de mi despacho?",
        respuesta:
          "Radar BOE funciona de forma independiente. Las alertas llegan por email, sin necesidad de instalar software ni modificar tu infraestructura IT. Funciona con cualquier gestor de expedientes.",
      },
      {
        pregunta: "¿Cuánto cuesta y hay permanencia?",
        respuesta:
          "Desde 79€/mes sin permanencia. Cancelas cuando quieras. No hay fee de setup ni costes ocultos. El plan Pro (179€/mes) incluye BOE, DOUE y autonómicos con múltiples destinatarios.",
      },
    ],
    ctaTexto: "Solicitar demo para despachos",
  },
  {
    slug: "consultoras-subvenciones",
    nombre: "Consultoras de Subvenciones",
    descripcion:
      "Sistema de alertas automáticas del BOE para consultoras de subvenciones. Detecta convocatorias de ayudas públicas, subvenciones y financiación antes que la competencia.",
    heroTitle: "Radar BOE para\nConsultoras de Subvenciones",
    heroSubtitle:
      "Cada convocatoria de ayuda pública que detectas antes es un cliente que ganas. Monitorización automática 24/7 de subvenciones, ayudas y financiación en el BOE.",
    painPoints: [
      {
        titulo: "Convocatorias que se pierden por falta de monitorización",
        texto:
          "El BOE publica decenas de convocatorias semanales. Sin un sistema automático, es inevitable que algunas se escapen, especialmente las de organismos autonómicos o europeos.",
      },
      {
        titulo: "Tus clientes dependen de que TÚ no falles",
        texto:
          "Si una consultora de subvenciones no detecta una convocatoria a tiempo, su cliente pierde la oportunidad y tú pierdes la confianza. Es una relación donde el fallo no es una opción.",
      },
      {
        titulo: "Equipos sobrecargados con revisión manual",
        texto:
          "Consultores senior dedicando horas a rastrear boletines en vez de preparar solicitudes y asesorar a clientes. El tiempo de tu equipo vale más que una revisión manual.",
      },
    ],
    useCases: [
      {
        titulo: "Detección de convocatorias I+D+i",
        texto:
          "Alertas instantáneas sobre convocatorias CDTI, Horizonte Europa, ayudas autonómicas de innovación y transferencia tecnológica.",
      },
      {
        titulo: "Subvenciones de digitalización PYME",
        texto:
          "Monitorización de programas como Kit Digital, ayudas de transformación digital y fondos Next Generation EU dirigidos a PYMES.",
      },
      {
        titulo: "Ayudas sectoriales agrícolas, energéticas e industriales",
        texto:
          "Rastreo de convocatorias PAC, fondos FEDER, ayudas de eficiencia energética y programas de reindustrialización para cada vertical de tus clientes.",
      },
    ],
    keywords: [
      "radar BOE subvenciones",
      "alertas subvenciones automáticas",
      "monitorización convocatorias ayudas",
      "BOE convocatorias subvenciones",
      "consultora subvenciones automatización",
      "detectar subvenciones BOE",
    ],
    faqs: [
      {
        pregunta: "¿Detecta convocatorias de todos los organismos o solo del BOE estatal?",
        respuesta:
          "El plan Básico cubre el BOE nacional. El plan Pro y Business incluyen DOUE (convocatorias europeas) y boletines autonómicos, para una cobertura completa de todas las fuentes públicas.",
      },
      {
        pregunta: "¿Puedo configurar alertas por sector de mis clientes?",
        respuesta:
          "Sí. Puedes definir keywords por sector: agricultura, tecnología, energía, industria, turismo, etc. Cada alerta llega clasificada por tipo y relevancia.",
      },
      {
        pregunta: "¿El sistema distingue entre convocatorias abiertas y cerradas?",
        respuesta:
          "El sistema detecta la publicación en el momento en que aparece en el BOE. Te alertamos al instante para que tengas el máximo plazo posible para preparar la solicitud de tu cliente.",
      },
      {
        pregunta: "¿Puedo reenviar las alertas a mis clientes directamente?",
        respuesta:
          "Con el plan Pro y Business puedes configurar múltiples destinatarios de email. Muchas consultoras reenvían el resumen diario a sus clientes como servicio de valor añadido.",
      },
    ],
    ctaTexto: "Solicitar demo para consultoras",
  },
  {
    slug: "empresas-licitacion",
    nombre: "Empresas de Licitación Pública",
    descripcion:
      "Monitorización automática del BOE para empresas que licitan obra pública y servicios. Detecta concursos, adjudicaciones y modificaciones contractuales relevantes.",
    heroTitle: "Radar BOE para\nEmpresas de Licitación",
    heroSubtitle:
      "Detecta concursos públicos, adjudicaciones y modificaciones contractuales en el BOE al instante. Presenta ofertas antes que tu competencia.",
    painPoints: [
      {
        titulo: "Concursos detectados tarde = ofertas débiles",
        texto:
          "Cuanto antes detectes un concurso, más tiempo tienes para preparar una oferta sólida. Los equipos que monitorizan manualmente pierden ventaja competitiva cada día.",
      },
      {
        titulo: "Múltiples fuentes que rastrear simultáneamente",
        texto:
          "BOE, plataformas autonómicas, DOUE, perfiles de contratante… La fragmentación de fuentes hace imposible una cobertura completa sin automatización.",
      },
      {
        titulo: "Adjudicaciones de competidores que pasan desapercibidas",
        texto:
          "Monitorizar las adjudicaciones de tus competidores es inteligencia de mercado pura. Saber quién gana qué y a qué precio te da ventaja estratégica.",
      },
    ],
    useCases: [
      {
        titulo: "Detección de licitaciones de obras y servicios",
        texto:
          "Alertas automáticas sobre concursos de obra pública, servicios de consultoría, suministros y contratos marco relevantes para tu empresa.",
      },
      {
        titulo: "Seguimiento de adjudicaciones de competidores",
        texto:
          "Monitoriza adjudicaciones en tu sector para conocer precios de mercado, quién gana y qué tipo de ofertas son competitivas.",
      },
      {
        titulo: "Modificaciones contractuales y prórrogas",
        texto:
          "Detecta modificaciones, prórrogas y resoluciones de contratos existentes que pueden abrir nuevas oportunidades de licitación.",
      },
    ],
    keywords: [
      "radar BOE licitaciones",
      "monitorización licitaciones públicas",
      "alertas concursos públicos BOE",
      "detectar licitaciones automáticamente",
      "BOE contratación pública",
      "empresa licitación automatización",
    ],
    faqs: [
      {
        pregunta: "¿Cubre licitaciones de todas las administraciones?",
        respuesta:
          "El BOE cubre la Administración General del Estado. Con el plan Pro, añadimos DOUE para licitaciones europeas y boletines autonómicos para comunidades específicas.",
      },
      {
        pregunta: "¿Puedo filtrar por tipo de contrato (obras, servicios, suministros)?",
        respuesta:
          "Sí. Configuras keywords positivas y negativas para filtrar exactamente el tipo de contrato que te interesa. El sistema descarta automáticamente lo que no encaja.",
      },
      {
        pregunta: "¿Recibo la alerta antes de que cierre el plazo de presentación?",
        respuesta:
          "Sí. Detectamos la publicación el mismo día que aparece en el BOE. Desde ese momento tienes todo el plazo legal disponible para preparar tu oferta.",
      },
      {
        pregunta: "¿Puedo configurar alertas por importe mínimo?",
        respuesta:
          "Las keywords permiten filtrar por tipo de obra o servicio. El resumen diario incluye información del importe cuando está disponible en la publicación original del BOE.",
      },
    ],
    ctaTexto: "Solicitar demo para licitaciones",
  },
  {
    slug: "gestorias-asesorias",
    nombre: "Gestorías y Asesorías",
    descripcion:
      "Alertas automáticas del BOE para gestorías y asesorías fiscales, laborales y contables. Monitoriza cambios normativos que afectan a tus clientes.",
    heroTitle: "Radar BOE para\nGestorías y Asesorías",
    heroSubtitle:
      "Cada cambio normativo fiscal, laboral o contable que se publica en el BOE llega directamente a tu email. Tu gestoría siempre actualizada para asesorar con certeza.",
    painPoints: [
      {
        titulo: "Cambios fiscales que requieren acción inmediata",
        texto:
          "Nuevos tipos de IVA, modificaciones en el IRPF, cambios en cotizaciones… Si no te enteras a tiempo, tus clientes pueden incurrir en incumplimientos que podrían haberse evitado.",
      },
      {
        titulo: "Normativa laboral en constante evolución",
        texto:
          "Nuevos convenios colectivos, modificaciones del Estatuto de los Trabajadores, regulaciones de teletrabajo. Tu asesoría necesita estar al día para cada consulta de tus clientes.",
      },
      {
        titulo: "Múltiples áreas que vigilar simultáneamente",
        texto:
          "Fiscal, laboral, mercantil, contable, protección de datos… Una gestoría integral necesita monitorizar múltiples áreas normativas a la vez sin que nada se escape.",
      },
    ],
    useCases: [
      {
        titulo: "Actualizaciones fiscales y tributarias",
        texto:
          "Alertas sobre modificaciones en impuestos, nuevos modelos de declaración, cambios en plazos de presentación y normativa de facturación electrónica.",
      },
      {
        titulo: "Normativa laboral y seguridad social",
        texto:
          "Monitorización de convenios colectivos, cambios en cotizaciones, nuevas obligaciones de prevención de riesgos y regulaciones de contratación.",
      },
      {
        titulo: "Subvenciones para clientes PYME",
        texto:
          "Detección de ayudas de digitalización, Kit Digital, subvenciones autonómicas y fondos europeos relevantes para el tejido empresarial de tu cartera de clientes.",
      },
    ],
    keywords: [
      "radar BOE gestorías",
      "alertas cambios normativos",
      "BOE asesoría fiscal",
      "monitorización normativa laboral",
      "automatización gestoría",
      "BOE novedades fiscales",
    ],
    faqs: [
      {
        pregunta: "¿Detecta cambios que afecten a las declaraciones trimestrales?",
        respuesta:
          "Sí. Configurando keywords como 'IVA', 'IRPF', 'modelo 303', 'modelo 200', etc., recibirás alerta instantánea de cualquier modificación que afecte a las obligaciones trimestrales de tus clientes.",
      },
      {
        pregunta: "¿Puedo configurar alertas por tipo de normativa?",
        respuesta:
          "Por supuesto. Puedes tener keywords separadas para fiscal, laboral, mercantil y contable. El resumen diario llega organizado por relevancia y tipo.",
      },
      {
        pregunta: "¿Es útil para una gestoría pequeña o solo para grandes asesorías?",
        respuesta:
          "El plan Básico (79€/mes) está pensado exactamente para gestorías pequeñas y medianas. 10 keywords y un resumen diario es suficiente para cubrir las áreas principales de tu negocio.",
      },
      {
        pregunta: "¿Puedo compartir las alertas con mis compañeros de la gestoría?",
        respuesta:
          "Con el plan Pro (179€/mes) puedes configurar múltiples destinatarios. Cada miembro de tu equipo puede recibir el resumen diario directamente en su bandeja de entrada.",
      },
    ],
    ctaTexto: "Solicitar demo para gestorías",
  },
  {
    slug: "asociaciones-profesionales",
    nombre: "Asociaciones Profesionales",
    descripcion:
      "Monitorización del BOE para asociaciones profesionales y sindicatos. Detecta normativa sectorial, convocatorias y resoluciones que afectan a tus asociados.",
    heroTitle: "Radar BOE para\nAsociaciones Profesionales",
    heroSubtitle:
      "Ofrece a tus asociados un servicio de monitorización normativa que ninguna otra asociación tiene. Detecta al instante cualquier publicación del BOE que afecte a tu sector.",
    painPoints: [
      {
        titulo: "Tus asociados esperan que vigiléis por ellos",
        texto:
          "Una asociación profesional que no detecta a tiempo un cambio normativo que afecta a sus miembros pierde su razón de ser. La monitorización manual no escala.",
      },
      {
        titulo: "Normativa sectorial cada vez más densa",
        texto:
          "Regulaciones europeas transpuestas, decretos autonómicos, órdenes ministeriales… El volumen de normativa crece y tu equipo no puede procesarlo todo manualmente.",
      },
      {
        titulo: "Diferenciarte de otras asociaciones del sector",
        texto:
          "Un servicio de alertas BOE exclusivo para asociados es un argumento de captación y retención que muy pocas asociaciones ofrecen actualmente.",
      },
    ],
    useCases: [
      {
        titulo: "Alertas normativas para colegiados",
        texto:
          "Monitorización de cambios regulatorios que afectan directamente al ejercicio profesional de tus colegiados: requisitos, habilitaciones, titulaciones.",
      },
      {
        titulo: "Convocatorias de representación sectorial",
        texto:
          "Detección de convocatorias de participación en órganos consultivos, mesas sectoriales y procesos de consulta pública relevantes para tu asociación.",
      },
      {
        titulo: "Boletín informativo para asociados",
        texto:
          "Utiliza el resumen diario del Radar BOE como base para tu boletín informativo semanal, ofreciendo contenido de valor real a tus asociados.",
      },
    ],
    keywords: [
      "radar BOE asociaciones",
      "monitorización BOE sindicatos",
      "alertas normativa sectorial",
      "BOE colegios profesionales",
      "asociación profesional automatización",
      "vigilancia normativa sector",
    ],
    faqs: [
      {
        pregunta: "¿Puedo reenviar las alertas a mis asociados?",
        respuesta:
          "Sí. Con el plan Pro y Business puedes configurar múltiples destinatarios. Muchas asociaciones utilizan el resumen diario como base para sus boletines informativos.",
      },
      {
        pregunta: "¿Se puede personalizar por subsectores dentro de la asociación?",
        respuesta:
          "Sí. Las keywords se configuran para cubrir todos los subsectores relevantes. El filtro inteligente clasifica cada publicación por relevancia y tipo.",
      },
      {
        pregunta: "¿Necesitamos equipo técnico para mantenerlo?",
        respuesta:
          "No. Radar BOE es un servicio gestionado. Una vez configurado, funciona de forma autónoma 365 días al año. Solo necesitas revisar tu email cada mañana.",
      },
      {
        pregunta: "¿Funciona para asociaciones de cualquier sector?",
        respuesta:
          "Sí. El sistema es agnóstico del sector. Las keywords se configuran a medida: sanidad, educación, transporte, agricultura, tecnología, construcción, lo que necesites.",
      },
    ],
    ctaTexto: "Solicitar demo para asociaciones",
  },
  {
    slug: "constructoras",
    nombre: "Empresas Constructoras",
    descripcion:
      "Alertas automáticas del BOE para empresas constructoras. Detecta licitaciones de obra pública, modificaciones urbanísticas y normativa de edificación.",
    heroTitle: "Radar BOE para\nEmpresas Constructoras",
    heroSubtitle:
      "Cada licitación de obra pública que detectas primero es una ventaja competitiva. Monitorización automática de concursos de construcción, rehabilitación e infraestructuras.",
    painPoints: [
      {
        titulo: "Licitaciones de obra que se detectan tarde",
        texto:
          "Preparar una oferta técnica y económica para una licitación de obra pública requiere semanas. Cada día que pierdes en detección es un día menos para preparar una propuesta ganadora.",
      },
      {
        titulo: "Normativa urbanística y de edificación cambiante",
        texto:
          "CTE, LOE, normativa de accesibilidad, eficiencia energética… Los cambios normativos en construcción pueden invalidar proyectos si no se detectan a tiempo.",
      },
      {
        titulo: "Competidores que presentan antes que tú",
        texto:
          "En igualdad de condiciones, la constructora que detecta primero la licitación tiene más tiempo para preparar una oferta mejor documentada y más competitiva.",
      },
    ],
    useCases: [
      {
        titulo: "Licitaciones de obra pública y rehabilitación",
        texto:
          "Detección automática de concursos de obra nueva, rehabilitación, mantenimiento de infraestructuras y contratos de conservación.",
      },
      {
        titulo: "Normativa de edificación y urbanismo",
        texto:
          "Alertas sobre cambios en el CTE, normativa de accesibilidad, eficiencia energética y regulaciones de sostenibilidad en la construcción.",
      },
      {
        titulo: "Concesiones y contratos de colaboración público-privada",
        texto:
          "Monitorización de concesiones de infraestructuras, contratos de colaboración público-privada y proyectos de inversión pública en tu zona geográfica.",
      },
    ],
    keywords: [
      "radar BOE constructoras",
      "licitaciones obra pública BOE",
      "alertas construcción BOE",
      "monitorización concursos obra",
      "BOE edificación normativa",
      "automatización constructora",
    ],
    faqs: [
      {
        pregunta: "¿Detecta licitaciones de todas las administraciones?",
        respuesta:
          "El BOE cubre la Administración General del Estado. Con el plan Pro, ampliamos a DOUE (proyectos europeos de infraestructura) y boletines autonómicos.",
      },
      {
        pregunta: "¿Puedo filtrar por tipo de obra o importe?",
        respuesta:
          "Sí. Configura keywords como 'rehabilitación', 'carreteras', 'edificación', 'mantenimiento', etc. El sistema filtra y clasifica por relevancia automáticamente.",
      },
      {
        pregunta: "¿El resumen diario incluye datos del pliego?",
        respuesta:
          "El resumen incluye título, tipo de contrato, organismo contratante y enlace directo a la publicación oficial del BOE donde encontrarás todos los detalles del pliego.",
      },
      {
        pregunta: "¿Es útil para constructoras pequeñas?",
        respuesta:
          "El plan Básico (79€/mes) es perfecto para constructoras PYME. Si una sola licitación detectada a tiempo compensa toda la inversión anual del servicio.",
      },
    ],
    ctaTexto: "Solicitar demo para constructoras",
  },
  {
    slug: "sector-farmaceutico",
    nombre: "Sector Farmacéutico",
    descripcion:
      "Monitorización automática del BOE para empresas farmacéuticas. Detecta publicaciones sobre regulación de medicamentos, precios de referencia y convocatorias sanitarias.",
    heroTitle: "Radar BOE para el\nSector Farmacéutico",
    heroSubtitle:
      "Regulaciones de medicamentos, precios de referencia y convocatorias sanitarias detectadas al instante. Tu empresa farmacéutica siempre un paso por delante del regulador.",
    painPoints: [
      {
        titulo: "Regulación farmacéutica extremadamente densa",
        texto:
          "Precios de referencia, autorizaciones de comercialización, alertas de farmacovigilancia, normativa de genéricos… El volumen regulatorio en farmacia es de los más altos de cualquier sector.",
      },
      {
        titulo: "Cambios de precios de referencia que afectan al margen",
        texto:
          "Las actualizaciones de precios de referencia publicadas en el BOE impactan directamente en la rentabilidad de los productos. Detectarlas tarde puede suponer pérdidas significativas.",
      },
      {
        titulo: "Cumplimiento normativo (compliance) no negociable",
        texto:
          "En farmacia, un incumplimiento normativo no es un riesgo menor: puede suponer la retirada de un producto del mercado, sanciones millonarias o pérdida de licencias.",
      },
    ],
    useCases: [
      {
        titulo: "Precios de referencia y financiación",
        texto:
          "Alertas sobre actualizaciones de precios de referencia, inclusiones y exclusiones de la prestación farmacéutica del SNS y modificaciones de financiación pública.",
      },
      {
        titulo: "Autorizaciones y registro de medicamentos",
        texto:
          "Monitorización de autorizaciones de comercialización, variaciones de registro y resoluciones de la AEMPS publicadas en el BOE.",
      },
      {
        titulo: "Concursos de suministro hospitalario",
        texto:
          "Detección de licitaciones de suministro farmacéutico, concursos de adquisición centralizada y contratos marco de servicios de salud.",
      },
    ],
    keywords: [
      "radar BOE farmacéutico",
      "alertas BOE medicamentos",
      "monitorización regulación farmacéutica",
      "BOE precios referencia",
      "sector farmacia automatización",
      "normativa farmacéutica BOE",
    ],
    faqs: [
      {
        pregunta: "¿Detecta publicaciones de la AEMPS en el BOE?",
        respuesta:
          "Sí. Todas las resoluciones de la AEMPS que se publican en el BOE son detectadas automáticamente. Configura keywords específicas como 'AEMPS', 'autorización de comercialización', 'farmacovigilancia', etc.",
      },
      {
        pregunta: "¿Cubre normativa europea (EMA)?",
        respuesta:
          "Con el plan Pro, incluimos monitorización del DOUE, donde se publican las regulaciones europeas de la EMA y las directivas farmacéuticas transpuestas.",
      },
      {
        pregunta: "¿Puedo compartir las alertas con el equipo de regulatory affairs?",
        respuesta:
          "Sí. Con el plan Pro y Business, puedes configurar múltiples destinatarios. El equipo de regulatory affairs recibe el resumen diario directamente.",
      },
      {
        pregunta: "¿Es adecuado para distribuidoras farmacéuticas?",
        respuesta:
          "Absolutamente. Distribuidoras, laboratorios, farmacias hospitalarias y oficinas de farmacia: cualquier actor del sector farmacéutico se beneficia de la monitorización automática del BOE.",
      },
    ],
    ctaTexto: "Solicitar demo para farmacéuticas",
  },
  {
    slug: "sector-inmobiliario",
    nombre: "Sector Inmobiliario",
    descripcion:
      "Alertas automáticas del BOE para el sector inmobiliario. Detecta normativa urbanística, subastas judiciales, regulaciones de alquiler y licitaciones de vivienda pública.",
    heroTitle: "Radar BOE para el\nSector Inmobiliario",
    heroSubtitle:
      "Normativa urbanística, subastas judiciales y regulaciones de alquiler detectadas al instante. Tu inmobiliaria con ventaja informativa sobre el mercado.",
    painPoints: [
      {
        titulo: "Normativa de vivienda en constante cambio",
        texto:
          "Leyes de vivienda, regulación de alquileres, normativa de comunidades de propietarios… Los cambios legislativos en el sector inmobiliario son frecuentes e impactantes.",
      },
      {
        titulo: "Subastas y oportunidades que se escapan",
        texto:
          "Subastas judiciales de inmuebles, concursos de vivienda pública y licitaciones urbanísticas publicadas en el BOE que pasan desapercibidas sin monitorización automática.",
      },
      {
        titulo: "Regulación urbanística autonómica fragmentada",
        texto:
          "Cada comunidad autónoma tiene su propia normativa urbanística. Mantenerse al día con todas las regulaciones requiere un sistema de monitorización centralizado.",
      },
    ],
    useCases: [
      {
        titulo: "Normativa de vivienda y alquiler",
        texto:
          "Alertas sobre cambios en la Ley de Vivienda, regulación de alquileres, índices de referencia y normativa de comunidades de propietarios.",
      },
      {
        titulo: "Subastas judiciales y concursos inmobiliarios",
        texto:
          "Detección de subastas de inmuebles, liquidaciones judiciales y concursos de venta de activos inmobiliarios publicados en el BOE.",
      },
      {
        titulo: "Licitaciones de vivienda pública y rehabilitación",
        texto:
          "Monitorización de programas de vivienda pública, ayudas a la rehabilitación y concursos de colaboración público-privada en el sector residencial.",
      },
    ],
    keywords: [
      "radar BOE inmobiliario",
      "alertas BOE vivienda",
      "monitorización normativa urbanística",
      "BOE subastas inmuebles",
      "sector inmobiliario automatización",
      "regulación alquiler BOE",
    ],
    faqs: [
      {
        pregunta: "¿Detecta subastas judiciales de inmuebles?",
        respuesta:
          "Sí. Configurando keywords como 'subasta', 'inmueble', 'liquidación', el sistema detecta automáticamente cualquier publicación relacionada con subastas de bienes inmuebles en el BOE.",
      },
      {
        pregunta: "¿Cubre normativa urbanística autonómica?",
        respuesta:
          "Con el plan Pro, incluimos boletines autonómicos para las comunidades que te interesen. La normativa urbanística publicada en el BOE estatal se cubre desde el plan Básico.",
      },
      {
        pregunta: "¿Es útil para promotoras inmobiliarias?",
        respuesta:
          "Sí. Promotoras, agencias inmobiliarias, administradores de fincas, fondos de inversión inmobiliaria y consultoras urbanísticas se benefician de la monitorización automática.",
      },
      {
        pregunta: "¿Puedo monitorizar cambios en el IBI o catastro?",
        respuesta:
          "Sí. Configura keywords como 'catastro', 'valor de referencia', 'IBI', 'plusvalía' para recibir alertas de cualquier publicación del BOE que afecte a la fiscalidad inmobiliaria.",
      },
    ],
    ctaTexto: "Solicitar demo para inmobiliarias",
  },
  {
    slug: "exportadoras",
    nombre: "Empresas Exportadoras",
    descripcion:
      "Monitorización automática del BOE y DOUE para empresas exportadoras. Detecta aranceles, acuerdos comerciales, normativa aduanera y ayudas al comercio exterior.",
    heroTitle: "Radar BOE para\nEmpresas Exportadoras",
    heroSubtitle:
      "Aranceles, acuerdos comerciales y normativa aduanera que afectan a tus exportaciones, detectados al instante. Nunca más un cambio regulatorio te pillará por sorpresa.",
    painPoints: [
      {
        titulo: "Aranceles y regulaciones que cambian sin previo aviso",
        texto:
          "Un cambio arancelario publicado en el BOE o DOUE puede alterar completamente la rentabilidad de una línea de exportación de la noche a la mañana.",
      },
      {
        titulo: "Acuerdos comerciales que abren nuevos mercados",
        texto:
          "Tratados de libre comercio, acuerdos de asociación y preferencias arancelarias que se publican y pueden abrir oportunidades de mercado si las detectas a tiempo.",
      },
      {
        titulo: "Ayudas al comercio exterior que se pierden",
        texto:
          "ICEX, CESCE, líneas ICO internacional, fondos FEDER para internacionalización… Convocatorias de ayudas que se escapan por falta de monitorización.",
      },
    ],
    useCases: [
      {
        titulo: "Cambios arancelarios y normativa aduanera",
        texto:
          "Alertas sobre modificaciones de aranceles, regulaciones de aduanas, cambios en nomenclatura combinada y normativa de origen preferencial.",
      },
      {
        titulo: "Acuerdos comerciales y tratados",
        texto:
          "Monitorización de acuerdos de libre comercio, asociación comercial y preferencias arancelarias publicadas en el BOE y DOUE.",
      },
      {
        titulo: "Ayudas a la internacionalización",
        texto:
          "Detección de convocatorias ICEX, líneas de financiación ICO Internacional, fondos FEDER para internacionalización y programas europeos de comercio exterior.",
      },
    ],
    keywords: [
      "radar BOE exportadoras",
      "alertas aranceles BOE",
      "monitorización comercio exterior",
      "BOE normativa aduanera",
      "empresa exportadora automatización",
      "alertas DOUE comercio",
    ],
    faqs: [
      {
        pregunta: "¿Cubre el DOUE para normativa europea de comercio?",
        respuesta:
          "Sí. El plan Pro y Business incluyen monitorización del DOUE, donde se publican aranceles europeos, acuerdos comerciales de la UE y regulaciones del mercado interior.",
      },
      {
        pregunta: "¿Puedo filtrar por países o regiones de destino?",
        respuesta:
          "Sí. Configura keywords con los nombres de países, regiones o acuerdos comerciales (ej: 'Mercosur', 'Japón', 'certificado EUR.1') para recibir solo lo relevante.",
      },
      {
        pregunta: "¿Detecta cambios en la normativa sanitaria de exportación?",
        respuesta:
          "Sí. Si exportas productos alimentarios, farmacéuticos o químicos, configura keywords de normativa sanitaria, fitosanitaria o de seguridad alimentaria para recibir alertas específicas.",
      },
      {
        pregunta: "¿Es útil para agentes de aduanas?",
        respuesta:
          "Absolutamente. Agentes de aduanas, transitarios, consultoras de comercio exterior y departamentos de exportación se benefician de tener la normativa al día automáticamente.",
      },
    ],
    ctaTexto: "Solicitar demo para exportadoras",
  },
  {
    slug: "startups-tecnologia",
    nombre: "Startups y Tecnología",
    descripcion:
      "Alertas automáticas del BOE para startups y empresas tecnológicas. Detecta subvenciones de innovación, ayudas I+D+i, normativa digital y licitaciones tecnológicas.",
    heroTitle: "Radar BOE para\nStartups y Tecnología",
    heroSubtitle:
      "Subvenciones de innovación, ayudas I+D+i y licitaciones de transformación digital detectadas al instante. Cada euro público que no captas es financiación que gana tu competencia.",
    painPoints: [
      {
        titulo: "Subvenciones de I+D que se pierden por plazos",
        texto:
          "CDTI, ENISA, Kit Digital, Neotec, Horizonte Europa… Las convocatorias de financiación tech se publican con plazos ajustados. Detectarlas un día tarde puede significar perderlas.",
      },
      {
        titulo: "Normativa digital que afecta a tu producto",
        texto:
          "RGPD, Ley de IA, NIS2, DSA, DMA… La regulación tecnológica europea y española evoluciona rápidamente. Tu startup necesita anticiparse, no reaccionar.",
      },
      {
        titulo: "Licitaciones tech de la administración pública",
        texto:
          "La administración pública digitaliza a ritmo acelerado. Proyectos de transformación digital, cloud, ciberseguridad e IA que tu empresa podría ganar.",
      },
    ],
    useCases: [
      {
        titulo: "Convocatorias de financiación e I+D+i",
        texto:
          "Alertas automáticas sobre ayudas CDTI, ENISA, Neotec, fondos Next Generation EU y convocatorias autonómicas de innovación tecnológica.",
      },
      {
        titulo: "Licitaciones de transformación digital",
        texto:
          "Detección de concursos de desarrollo de software, consultoría tecnológica, ciberseguridad y proyectos de IA para la administración pública.",
      },
      {
        titulo: "Normativa digital y compliance",
        texto:
          "Monitorización de regulación tecnológica: protección de datos, ley de IA, normativa de ciberseguridad, regulación de plataformas digitales y comercio electrónico.",
      },
    ],
    keywords: [
      "radar BOE startups",
      "alertas subvenciones innovación",
      "BOE ayudas I+D+i",
      "monitorización normativa digital",
      "licitaciones tecnología BOE",
      "startup financiación pública",
    ],
    faqs: [
      {
        pregunta: "¿Detecta convocatorias CDTI, ENISA y Kit Digital?",
        respuesta:
          "Sí. Configuramos keywords específicas para cada programa de ayudas: CDTI, ENISA, Neotec, Kit Digital, Horizonte Europa, y cualquier otro programa de financiación pública tech.",
      },
      {
        pregunta: "¿Cubre regulación europea (IA Act, NIS2, DSA)?",
        respuesta:
          "Con el plan Pro, incluimos monitorización del DOUE donde se publican las directivas y reglamentos europeos de tecnología, incluyendo la Ley de IA, NIS2 y DSA.",
      },
      {
        pregunta: "¿Puedo usarlo para vigilar licitaciones de mi competencia?",
        respuesta:
          "Sí. Configura keywords con nombres de competidores, tecnologías específicas o tipos de proyecto para monitorizar las adjudicaciones y contratos de tu sector.",
      },
      {
        pregunta: "¿Es rentable para una startup en fase seed?",
        respuesta:
          "Una sola subvención detectada a tiempo puede suponer decenas de miles de euros en financiación no dilutiva. El plan Básico (79€/mes) se rentabiliza con la primera detección útil.",
      },
    ],
    ctaTexto: "Solicitar demo para startups",
  },
  {
    slug: "clinicas-hospitales",
    nombre: "Clínicas y Hospitales",
    descripcion:
      "Monitorización automática del BOE para clínicas y centros sanitarios. Detecta normativa sanitaria, licitaciones hospitalarias y convocatorias de personal.",
    heroTitle: "Radar BOE para\nClínicas y Hospitales",
    heroSubtitle:
      "Normativa sanitaria, licitaciones de equipamiento médico y convocatorias de plazas detectadas al instante. Tu centro sanitario siempre preparado ante cambios regulatorios.",
    painPoints: [
      {
        titulo: "Regulación sanitaria con impacto operativo inmediato",
        texto:
          "Protocolos de actuación, normativa de autorización de centros, regulación de telemedicina… Los cambios normativos en sanidad requieren adaptación inmediata y el incumplimiento tiene consecuencias severas.",
      },
      {
        titulo: "Licitaciones de equipamiento que se escapan",
        texto:
          "Concursos de adquisición de equipos médicos, contratos de mantenimiento y suministro hospitalario que podrían ser oportunidades de negocio o ahorro.",
      },
      {
        titulo: "Convocatorias de personal sanitario",
        texto:
          "Plazas MIR, convocatorias de formación sanitaria especializada y concursos de méritos que afectan a tu plantilla médica y de enfermería.",
      },
    ],
    useCases: [
      {
        titulo: "Normativa de acreditación y autorización",
        texto:
          "Alertas sobre cambios en requisitos de autorización de centros, acreditación de servicios y normativa de calidad asistencial.",
      },
      {
        titulo: "Licitaciones de equipamiento y suministros",
        texto:
          "Detección de concursos públicos de adquisición de equipos médicos, productos sanitarios y contratos de servicios hospitalarios.",
      },
      {
        titulo: "Convocatorias de formación y plazas sanitarias",
        texto:
          "Monitorización de convocatorias MIR, plazas de formación sanitaria especializada y concursos de méritos del sistema público.",
      },
    ],
    keywords: [
      "radar BOE clínicas",
      "alertas BOE hospitales",
      "monitorización normativa sanitaria",
      "BOE licitaciones equipamiento médico",
      "sector sanitario automatización",
      "regulación sanitaria BOE",
    ],
    faqs: [
      {
        pregunta: "¿Detecta publicaciones del Ministerio de Sanidad?",
        respuesta:
          "Sí. Todas las publicaciones del Ministerio de Sanidad en el BOE son detectadas automáticamente: normativa, convocatorias, resoluciones y autorizaciones.",
      },
      {
        pregunta: "¿Cubre normativa de productos sanitarios y medicamentos?",
        respuesta:
          "Sí. Configura keywords específicas como 'producto sanitario', 'medicamento', 'farmacovigilancia', 'AEMPS' para recibir alertas del ámbito farmacéutico y sanitario.",
      },
      {
        pregunta: "¿Es útil para clínicas privadas o solo públicas?",
        respuesta:
          "Ambas. Las clínicas privadas se benefician de la monitorización normativa (regulación de autorización, cambios fiscales sanitarios) y las públicas de convocatorias y licitaciones.",
      },
      {
        pregunta: "¿Puedo personalizar por comunidad autónoma?",
        respuesta:
          "Con el plan Pro, incluimos boletines autonómicos. Cada comunidad tiene competencias sanitarias propias que publican en sus propios boletines.",
      },
    ],
    ctaTexto: "Solicitar demo para centros sanitarios",
  },
  {
    slug: "colegios-profesionales",
    nombre: "Colegios Profesionales",
    descripcion:
      "Alertas automáticas del BOE para colegios profesionales. Detecta normativa de colegiación, regulación de actividades profesionales y convocatorias relevantes.",
    heroTitle: "Radar BOE para\nColegios Profesionales",
    heroSubtitle:
      "Cada cambio normativo que afecta a tu profesión, detectado al instante. Ofrece a tus colegiados un servicio de vigilancia regulatoria que justifica la cuota colegial.",
    painPoints: [
      {
        titulo: "Cambios regulatorios que afectan al ejercicio profesional",
        texto:
          "Requisitos de habilitación, titulaciones requeridas, regulación de tarifas, normativa deontológica… Cada cambio normativo afecta directamente a tus colegiados.",
      },
      {
        titulo: "Justificar el valor de la cuota colegial",
        texto:
          "Un servicio de alertas normativas exclusivo es un argumento tangible de valor para la cuota colegial. Tus colegiados reciben información antes que nadie.",
      },
      {
        titulo: "Volumen de normativa inmanejable con revisión manual",
        texto:
          "Entre BOE, boletines autonómicos y DOUE, el volumen de publicaciones que pueden afectar a una profesión regulada es imposible de rastrear manualmente.",
      },
    ],
    useCases: [
      {
        titulo: "Regulación de actividades profesionales",
        texto:
          "Alertas sobre cambios en requisitos de colegiación, habilitaciones profesionales, regulación de tarifas y normativa deontológica.",
      },
      {
        titulo: "Convocatorias de participación institucional",
        texto:
          "Detección de convocatorias para participar en órganos consultivos, mesas de diálogo profesional y procesos de consulta pública del gobierno.",
      },
      {
        titulo: "Subvenciones y ayudas para el gremio",
        texto:
          "Monitorización de convocatorias de ayudas específicas para el sector, programas de formación continua y fondos de modernización profesional.",
      },
    ],
    keywords: [
      "radar BOE colegios profesionales",
      "alertas normativa colegiación",
      "monitorización regulación profesional",
      "BOE profesiones reguladas",
      "colegio profesional automatización",
      "vigilancia normativa colegiados",
    ],
    faqs: [
      {
        pregunta: "¿Se puede adaptar a cualquier profesión regulada?",
        respuesta:
          "Sí. Ingenieros, arquitectos, médicos, enfermeros, abogados, veterinarios, farmacéuticos, economistas… Configuramos las keywords para la normativa específica de cada profesión.",
      },
      {
        pregunta: "¿Puedo reenviar las alertas a todos mis colegiados?",
        respuesta:
          "Con el plan Business puedes configurar múltiples destinatarios y utilizarlo como base para tu boletín informativo colegial, ofreciendo valor tangible en la cuota.",
      },
      {
        pregunta: "¿Cubre normativa autonómica?",
        respuesta:
          "Con el plan Pro, incluimos boletines de las comunidades autónomas donde tu colegio tiene competencias. La normativa estatal del BOE se cubre desde el plan Básico.",
      },
      {
        pregunta: "¿Requiere formación técnica para usarlo?",
        respuesta:
          "No. Radar BOE es completamente gestionado. Recibes un email diario con las publicaciones relevantes. Sin instalación, sin configuración técnica, sin mantenimiento por tu parte.",
      },
    ],
    ctaTexto: "Solicitar demo para colegios",
  },
]

export function getVerticalBySlug(slug: string): Vertical | undefined {
  return VERTICALES.find((v) => v.slug === slug)
}

export function getAllVerticalSlugs(): string[] {
  return VERTICALES.map((v) => v.slug)
}
