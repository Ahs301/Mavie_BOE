export interface Ciudad {
  slug: string
  nombre: string
  comunidad: string
  descripcion: string
  poblacionEmpresas: string
  sectorPredominante: string
  faqs: { pregunta: string; respuesta: string }[]
}

export const CIUDADES: Ciudad[] = [
  {
    slug: "madrid",
    nombre: "Madrid",
    comunidad: "Comunidad de Madrid",
    descripcion:
      "Radar BOE en Madrid: alertas automáticas de licitaciones, subvenciones y normativa para empresas madrileñas. Monitorización 24/7 del BOE adaptada al tejido empresarial de la capital.",
    poblacionEmpresas: "Más de 550.000 empresas activas",
    sectorPredominante: "Servicios financieros, consultoría y tecnología",
    faqs: [
      {
        pregunta: "¿El Radar BOE cubre licitaciones específicas de la Comunidad de Madrid?",
        respuesta:
          "El plan Básico cubre el BOE nacional, que incluye contratación del Estado con sede en Madrid. Con el plan Pro, añadimos el BOCM (Boletín Oficial de la Comunidad de Madrid) para cobertura autonómica completa.",
      },
      {
        pregunta: "¿Qué tipo de empresas madrileñas usan Radar BOE?",
        respuesta:
          "Consultoras, despachos de abogados, empresas tecnológicas, constructoras y gestorías del centro de negocios de España. Madrid concentra las sedes de decisión de contratación pública.",
      },
      {
        pregunta: "¿Detecta oportunidades de los ministerios con sede en Madrid?",
        respuesta:
          "Sí. Toda la contratación de ministerios, organismos autónomos y entes públicos que se publica en el BOE queda cubierta desde el plan Básico. Madrid concentra la mayoría de estos organismos.",
      },
    ],
  },
  {
    slug: "barcelona",
    nombre: "Barcelona",
    comunidad: "Cataluña",
    descripcion:
      "Radar BOE en Barcelona: alertas automáticas de licitaciones y subvenciones para empresas catalanas. Monitorización del BOE y DOGC adaptada al tejido empresarial de Barcelona.",
    poblacionEmpresas: "Más de 420.000 empresas activas",
    sectorPredominante: "Tecnología, farmacéutica e industria",
    faqs: [
      {
        pregunta: "¿Cubre el DOGC además del BOE?",
        respuesta:
          "Con el plan Pro, incluimos monitorización del DOGC (Diari Oficial de la Generalitat de Catalunya) para capturar convocatorias autonómicas, normativa catalana y licitaciones de la Generalitat.",
      },
      {
        pregunta: "¿Es relevante para el sector farma de Barcelona?",
        respuesta:
          "Barcelona es el principal hub farmacéutico de España. Radar BOE detecta publicaciones de la AEMPS, precios de referencia y licitaciones de suministro hospitalario que impactan directamente al sector.",
      },
      {
        pregunta: "¿Detecta convocatorias del ACCIÓ y fondos catalanes?",
        respuesta:
          "Las convocatorias que se publican en el BOE estatal sí. Para convocatorias exclusivas del DOGC como ACCIÓ, necesitas el plan Pro con cobertura autonómica.",
      },
    ],
  },
  {
    slug: "valencia",
    nombre: "Valencia",
    comunidad: "Comunitat Valenciana",
    descripcion:
      "Radar BOE en Valencia: alertas automáticas de licitaciones, subvenciones y normativa para empresas valencianas. Monitorización del BOE adaptada al tejido empresarial de la Comunitat.",
    poblacionEmpresas: "Más de 280.000 empresas activas",
    sectorPredominante: "Cerámica, agroalimentario y turismo",
    faqs: [
      {
        pregunta: "¿Cubre el DOGV además del BOE?",
        respuesta:
          "Con el plan Pro, incluimos el DOGV (Diari Oficial de la Generalitat Valenciana) para convocatorias autonómicas de IVACE, AVI y ayudas de la Generalitat Valenciana.",
      },
      {
        pregunta: "¿Es útil para el sector cerámico y agroalimentario?",
        respuesta:
          "Sí. Configura keywords de tu sector (cerámica, exportación, agroalimentario, denominación de origen) y recibirás alertas de normativa, subvenciones y licitaciones relevantes.",
      },
      {
        pregunta: "¿Mavie Automations tiene sede en Valencia?",
        respuesta:
          "Sí. Mavie Automations está basada en Valencia, lo que nos permite ofrecer reuniones presenciales y un conocimiento profundo del tejido empresarial valenciano.",
      },
    ],
  },
  {
    slug: "sevilla",
    nombre: "Sevilla",
    comunidad: "Andalucía",
    descripcion:
      "Radar BOE en Sevilla: alertas automáticas de licitaciones y subvenciones para empresas andaluzas. Monitorización 24/7 del BOE para el principal hub empresarial del sur de España.",
    poblacionEmpresas: "Más de 160.000 empresas activas",
    sectorPredominante: "Agroalimentario, turismo y aeronáutica",
    faqs: [
      {
        pregunta: "¿Cubre el BOJA además del BOE?",
        respuesta:
          "Con el plan Pro, incluimos el BOJA para convocatorias de la Junta de Andalucía, incluyendo ayudas TRADE, IDEA y fondos autonómicos andaluces.",
      },
      {
        pregunta: "¿Es relevante para el sector aeronáutico de Sevilla?",
        respuesta:
          "Sevilla es un hub aeronáutico clave (Airbus, aeroespacial). Radar BOE detecta licitaciones de defensa, contratos aeronáuticos y subvenciones de innovación industrial.",
      },
      {
        pregunta: "¿Detecta convocatorias de fondos europeos en Andalucía?",
        respuesta:
          "Las convocatorias de fondos europeos gestionados desde el BOE estatal sí. Para fondos gestionados exclusivamente desde la Junta, necesitas el plan Pro con cobertura BOJA.",
      },
    ],
  },
  {
    slug: "zaragoza",
    nombre: "Zaragoza",
    comunidad: "Aragón",
    descripcion:
      "Radar BOE en Zaragoza: alertas automáticas de licitaciones y subvenciones para empresas aragonesas. Monitorización del BOE adaptada al corredor logístico e industrial de Aragón.",
    poblacionEmpresas: "Más de 65.000 empresas activas",
    sectorPredominante: "Logística, automoción e industria",
    faqs: [
      {
        pregunta: "¿Es útil para empresas del corredor logístico zaragozano?",
        respuesta:
          "Sí. Zaragoza es un hub logístico estratégico. Radar BOE detecta licitaciones de transporte, contratos de infraestructura logística y normativa de aduanas.",
      },
      {
        pregunta: "¿Cubre el BOA (Boletín Oficial de Aragón)?",
        respuesta:
          "Con el plan Pro, incluimos el BOA para convocatorias del Gobierno de Aragón, incluyendo ayudas INAEM y fondos autonómicos.",
      },
      {
        pregunta: "¿Detecta licitaciones del sector automoción?",
        respuesta:
          "Configura keywords de automoción y vehículos eléctricos. Zaragoza alberga plantas de Opel/Stellantis y un ecosistema de proveedores que se beneficia de la monitorización.",
      },
    ],
  },
  {
    slug: "malaga",
    nombre: "Málaga",
    comunidad: "Andalucía",
    descripcion:
      "Radar BOE en Málaga: alertas automáticas de licitaciones y subvenciones para empresas malagueñas. Monitorización del BOE para el creciente hub tecnológico y turístico de la Costa del Sol.",
    poblacionEmpresas: "Más de 110.000 empresas activas",
    sectorPredominante: "Tecnología, turismo e inmobiliario",
    faqs: [
      {
        pregunta: "¿Es relevante para startups del Málaga Tech Park?",
        respuesta:
          "Sí. Málaga es un ecosistema tech en crecimiento. Radar BOE detecta subvenciones de innovación, licitaciones de digitalización y convocatorias I+D+i relevantes para startups.",
      },
      {
        pregunta: "¿Detecta normativa turística?",
        respuesta:
          "Configura keywords como 'turismo', 'alojamiento', 'vivienda vacacional', 'hostelería' para recibir alertas de regulación turística que afecte a tu negocio.",
      },
      {
        pregunta: "¿Cubre el BOJA para Málaga?",
        respuesta:
          "Con el plan Pro, incluimos el BOJA para toda Andalucía, incluyendo convocatorias específicas de la provincia de Málaga.",
      },
    ],
  },
  {
    slug: "murcia",
    nombre: "Murcia",
    comunidad: "Región de Murcia",
    descripcion:
      "Radar BOE en Murcia: alertas automáticas de licitaciones, subvenciones y normativa para empresas murcianas. Monitorización del BOE adaptada al sector agroalimentario y exportador de la región.",
    poblacionEmpresas: "Más de 85.000 empresas activas",
    sectorPredominante: "Agroalimentario, exportación y energía",
    faqs: [
      {
        pregunta: "¿Es útil para el sector agroalimentario murciano?",
        respuesta:
          "Murcia es la huerta de Europa. Radar BOE detecta normativa PAC, ayudas agroalimentarias, regulación fitosanitaria y convocatorias de exportación de alta relevancia para el sector.",
      },
      {
        pregunta: "¿Detecta convocatorias de energía renovable?",
        respuesta:
          "Sí. Configura keywords de energía solar, parques eólicos y eficiencia energética para capturar las convocatorias de la transición energética en la región.",
      },
      {
        pregunta: "¿Cubre el BORM?",
        respuesta:
          "Con el plan Pro, incluimos el BORM (Boletín Oficial de la Región de Murcia) para cobertura autonómica completa.",
      },
    ],
  },
  {
    slug: "palma",
    nombre: "Palma de Mallorca",
    comunidad: "Islas Baleares",
    descripcion:
      "Radar BOE en Palma de Mallorca: alertas automáticas de licitaciones y subvenciones para empresas baleares. Monitorización del BOE para el principal centro económico de las islas.",
    poblacionEmpresas: "Más de 75.000 empresas activas",
    sectorPredominante: "Turismo, náutica e inmobiliario",
    faqs: [
      {
        pregunta: "¿Es útil para el sector turístico balear?",
        respuesta:
          "Baleares depende del turismo. Radar BOE detecta normativa turística, regulación de alojamiento vacacional, ecotasas y cambios en legislación que afectan a tu negocio.",
      },
      {
        pregunta: "¿Cubre el BOIB?",
        respuesta:
          "Con el plan Pro, incluimos el BOIB (Butlletí Oficial de les Illes Balears) para convocatorias del Govern Balear y normativa insular.",
      },
      {
        pregunta: "¿Detecta licitaciones portuarias y náuticas?",
        respuesta:
          "Configura keywords como 'puertos', 'náutica', 'concesión marítima', 'terminal de cruceros' para capturar oportunidades del sector marítimo balear.",
      },
    ],
  },
  {
    slug: "las-palmas",
    nombre: "Las Palmas de Gran Canaria",
    comunidad: "Canarias",
    descripcion:
      "Radar BOE en Las Palmas: alertas automáticas de licitaciones y subvenciones para empresas canarias. Monitorización del BOE con especial atención a la ZEC y régimen fiscal canario.",
    poblacionEmpresas: "Más de 70.000 empresas activas",
    sectorPredominante: "Turismo, logística portuaria y energía",
    faqs: [
      {
        pregunta: "¿Detecta normativa de la ZEC y REF canario?",
        respuesta:
          "Sí. Configura keywords como 'ZEC', 'REF', 'Canarias', 'zona franca' para capturar toda la normativa que afecta al régimen fiscal especial canario.",
      },
      {
        pregunta: "¿Cubre el BOC (Boletín Oficial de Canarias)?",
        respuesta:
          "Con el plan Pro, incluimos el BOC para convocatorias del Gobierno de Canarias y cabildos insulares.",
      },
      {
        pregunta: "¿Es útil para empresas del Puerto de la Luz?",
        respuesta:
          "Sí. Licitaciones portuarias, contratos de suministro y normativa de comercio exterior publicados en el BOE son relevantes para el hub logístico de Las Palmas.",
      },
    ],
  },
  {
    slug: "bilbao",
    nombre: "Bilbao",
    comunidad: "País Vasco",
    descripcion:
      "Radar BOE en Bilbao: alertas automáticas de licitaciones y subvenciones para empresas vascas. Monitorización del BOE adaptada al tejido industrial y financiero del País Vasco.",
    poblacionEmpresas: "Más de 80.000 empresas activas",
    sectorPredominante: "Industria, energía y servicios financieros",
    faqs: [
      {
        pregunta: "¿Es útil para el cluster industrial vasco?",
        respuesta:
          "Bilbao y el País Vasco tienen un tejido industrial potente (siderurgia, máquina-herramienta, energía eólica). Radar BOE detecta licitaciones industriales y normativa sectorial.",
      },
      {
        pregunta: "¿Cubre el EHAA/BOPV?",
        respuesta:
          "Con el plan Pro, incluimos el BOPV (Boletín Oficial del País Vasco) para convocatorias del Gobierno Vasco, SPRI y ayudas forales.",
      },
      {
        pregunta: "¿Detecta normativa de la hacienda foral?",
        respuesta:
          "La normativa foral del País Vasco se publica en los boletines forales y BOPV, disponible en el plan Pro. La normativa tributaria estatal del BOE se cubre desde el plan Básico.",
      },
    ],
  },
  {
    slug: "alicante",
    nombre: "Alicante",
    comunidad: "Comunitat Valenciana",
    descripcion:
      "Radar BOE en Alicante: alertas automáticas de licitaciones y subvenciones para empresas alicantinas. Monitorización del BOE para el hub calzado, turismo y tecnología de la provincia.",
    poblacionEmpresas: "Más de 130.000 empresas activas",
    sectorPredominante: "Calzado, turismo y tecnología",
    faqs: [
      {
        pregunta: "¿Es útil para el sector del calzado ilicitano?",
        respuesta:
          "Alicante es la capital del calzado en España. Radar BOE detecta normativa de exportación, aranceles, subvenciones de industria y ayudas de internacionalización relevantes.",
      },
      {
        pregunta: "¿Cubre el DOGV?",
        respuesta:
          "Con el plan Pro, incluimos el DOGV para convocatorias de IVACE, IVF y ayudas de la Generalitat Valenciana.",
      },
      {
        pregunta: "¿Detecta licitaciones de la sede de la EUIPO?",
        respuesta:
          "La EUIPO tiene sede en Alicante. Licitaciones de la oficina europea de propiedad intelectual en el DOUE se cubren con el plan Pro.",
      },
    ],
  },
  {
    slug: "cordoba",
    nombre: "Córdoba",
    comunidad: "Andalucía",
    descripcion:
      "Radar BOE en Córdoba: alertas automáticas de licitaciones y subvenciones para empresas cordobesas. Monitorización del BOE para el sector agroalimentario, joyero e industrial de Córdoba.",
    poblacionEmpresas: "Más de 50.000 empresas activas",
    sectorPredominante: "Agroalimentario, joyería e industria",
    faqs: [
      {
        pregunta: "¿Es útil para el sector oleícola cordobés?",
        respuesta:
          "Córdoba es capital mundial del aceite de oliva. Radar BOE detecta normativa PAC, denominaciones de origen, ayudas agroalimentarias y regulación de exportación.",
      },
      {
        pregunta: "¿Detecta licitaciones de infraestructura en Andalucía?",
        respuesta:
          "Sí. Licitaciones de obra pública, mantenimiento de carreteras y contratos de infraestructura del BOE estatal se cubren desde el plan Básico.",
      },
      {
        pregunta: "¿Cubre el BOJA?",
        respuesta:
          "Con el plan Pro, incluimos el BOJA para convocatorias de la Junta de Andalucía.",
      },
    ],
  },
  {
    slug: "valladolid",
    nombre: "Valladolid",
    comunidad: "Castilla y León",
    descripcion:
      "Radar BOE en Valladolid: alertas automáticas de licitaciones y subvenciones para empresas de Castilla y León. Monitorización del BOE para la capital administrativa y automovilística de la comunidad.",
    poblacionEmpresas: "Más de 45.000 empresas activas",
    sectorPredominante: "Automoción, agroalimentario y administración",
    faqs: [
      {
        pregunta: "¿Es relevante para la industria del automóvil en Valladolid?",
        respuesta:
          "Valladolid alberga la planta de Renault y un ecosistema de proveedores de automoción. Radar BOE detecta normativa industrial, subvenciones de vehículo eléctrico y licitaciones de transporte.",
      },
      {
        pregunta: "¿Cubre el BOCyL?",
        respuesta:
          "Con el plan Pro, incluimos el BOCyL para convocatorias de la Junta de Castilla y León, ADE y ayudas autonómicas.",
      },
      {
        pregunta: "¿Detecta convocatorias de la administración del Estado en Valladolid?",
        respuesta:
          "Sí. Toda la contratación estatal publicada en el BOE, incluyendo organismos con sede o delegaciones en Valladolid, se cubre desde el plan Básico.",
      },
    ],
  },
  {
    slug: "vigo",
    nombre: "Vigo",
    comunidad: "Galicia",
    descripcion:
      "Radar BOE en Vigo: alertas automáticas de licitaciones y subvenciones para empresas gallegas. Monitorización del BOE para el principal puerto pesquero y hub industrial de Galicia.",
    poblacionEmpresas: "Más de 55.000 empresas activas",
    sectorPredominante: "Pesca, automoción y naval",
    faqs: [
      {
        pregunta: "¿Es útil para el sector pesquero de Vigo?",
        respuesta:
          "Vigo es el mayor puerto pesquero de Europa. Radar BOE detecta normativa pesquera, cuotas, convocatorias FEMPA y regulación de acuicultura y conservas.",
      },
      {
        pregunta: "¿Detecta licitaciones del sector naval?",
        respuesta:
          "Configura keywords como 'construcción naval', 'dique', 'reparación naval', 'Navantia' para capturar contratos y licitaciones del sector naval vigués.",
      },
      {
        pregunta: "¿Cubre el DOG?",
        respuesta:
          "Con el plan Pro, incluimos el DOG (Diario Oficial de Galicia) para convocatorias de la Xunta y ayudas autonómicas gallegas.",
      },
    ],
  },
  {
    slug: "gijon",
    nombre: "Gijón",
    comunidad: "Asturias",
    descripcion:
      "Radar BOE en Gijón: alertas automáticas de licitaciones y subvenciones para empresas asturianas. Monitorización del BOE para la capital económica de Asturias.",
    poblacionEmpresas: "Más de 25.000 empresas activas",
    sectorPredominante: "Industria, energía e innovación",
    faqs: [
      {
        pregunta: "¿Es relevante para la reconversión industrial asturiana?",
        respuesta:
          "Sí. Radar BOE detecta fondos de transición justa, ayudas de reindustrialización y convocatorias de reconversión energética relevantes para el tejido industrial asturiano.",
      },
      {
        pregunta: "¿Cubre el BOPA?",
        respuesta:
          "Con el plan Pro, incluimos el BOPA (Boletín Oficial del Principado de Asturias) para convocatorias del Principado y IDEPA.",
      },
      {
        pregunta: "¿Detecta oportunidades del cluster tech de Gijón?",
        respuesta:
          "Configura keywords de innovación y tecnología para capturar subvenciones I+D, licitaciones de digitalización y convocatorias del polo tecnológico asturiano.",
      },
    ],
  },
  {
    slug: "hospitalet",
    nombre: "L'Hospitalet de Llobregat",
    comunidad: "Cataluña",
    descripcion:
      "Radar BOE en L'Hospitalet: alertas automáticas de licitaciones y subvenciones para empresas del área metropolitana de Barcelona. Monitorización del BOE para el segundo municipio de Cataluña.",
    poblacionEmpresas: "Más de 20.000 empresas activas",
    sectorPredominante: "Logística, industria y servicios",
    faqs: [
      {
        pregunta: "¿Cubre licitaciones del Área Metropolitana de Barcelona?",
        respuesta:
          "Las licitaciones estatales publicadas en el BOE se cubren desde el plan Básico. Con el plan Pro, añadimos el DOGC para contratos de la Generalitat y organismos metropolitanos.",
      },
      {
        pregunta: "¿Es útil para empresas logísticas de la zona franca?",
        respuesta:
          "Sí. L'Hospitalet y la zona franca de Barcelona concentran logística e industria. Radar BOE detecta licitaciones de transporte, normativa aduanera y contratos de suministro.",
      },
      {
        pregunta: "¿Detecta normativa industrial catalana?",
        respuesta:
          "La normativa industrial estatal se cubre desde el plan Básico. La normativa autonómica del DOGC requiere el plan Pro.",
      },
    ],
  },
  {
    slug: "a-coruna",
    nombre: "A Coruña",
    comunidad: "Galicia",
    descripcion:
      "Radar BOE en A Coruña: alertas automáticas de licitaciones y subvenciones para empresas coruñesas. Monitorización del BOE para la capital financiera y textil de Galicia.",
    poblacionEmpresas: "Más de 40.000 empresas activas",
    sectorPredominante: "Textil (Inditex), financiero y tecnología",
    faqs: [
      {
        pregunta: "¿Es útil para el sector textil coruñés?",
        respuesta:
          "A Coruña es la capital mundial del fast fashion (Inditex). Radar BOE detecta normativa de comercio exterior, aranceles textiles, sostenibilidad y regulación de residuos.",
      },
      {
        pregunta: "¿Cubre el DOG?",
        respuesta:
          "Con el plan Pro, incluimos el DOG para convocatorias de la Xunta, IGAPE y ayudas gallegas de internacionalización.",
      },
      {
        pregunta: "¿Detecta licitaciones portuarias de A Coruña?",
        respuesta:
          "Sí. Licitaciones de Puertos del Estado y concesiones portuarias publicadas en el BOE se cubren desde el plan Básico.",
      },
    ],
  },
  {
    slug: "vitoria",
    nombre: "Vitoria-Gasteiz",
    comunidad: "País Vasco",
    descripcion:
      "Radar BOE en Vitoria-Gasteiz: alertas automáticas de licitaciones y subvenciones para empresas alavesas. Monitorización del BOE para la capital administrativa del País Vasco.",
    poblacionEmpresas: "Más de 20.000 empresas activas",
    sectorPredominante: "Industria, aeronáutica y agroalimentario",
    faqs: [
      {
        pregunta: "¿Es relevante para el cluster aeronáutico alavés?",
        respuesta:
          "Vitoria tiene un hub aeronáutico consolidado. Radar BOE detecta licitaciones de defensa, contratos aeronáuticos, subvenciones industriales y normativa de aviación.",
      },
      {
        pregunta: "¿Cubre el BOPV y el BOTHA?",
        respuesta:
          "Con el plan Pro, incluimos el BOPV y acceso a información publicada por instituciones forales para una cobertura completa de la fiscalidad y normativa vasca.",
      },
      {
        pregunta: "¿Detecta convocatorias de green capital?",
        respuesta:
          "Vitoria es referencia en sostenibilidad urbana. Configura keywords de medio ambiente, movilidad sostenible y economía circular para capturar oportunidades verdes.",
      },
    ],
  },
  {
    slug: "granada",
    nombre: "Granada",
    comunidad: "Andalucía",
    descripcion:
      "Radar BOE en Granada: alertas automáticas de licitaciones y subvenciones para empresas granadinas. Monitorización del BOE para el hub universitario, tecnológico y turístico de Andalucía oriental.",
    poblacionEmpresas: "Más de 45.000 empresas activas",
    sectorPredominante: "Universidad/I+D, turismo y agroalimentario",
    faqs: [
      {
        pregunta: "¿Es útil para spin-offs y startups del PTS Granada?",
        respuesta:
          "Granada tiene un ecosistema universitario e investigador potente (UGR, PTS). Radar BOE detecta convocatorias I+D, subvenciones de transferencia tecnológica y ayudas CDTI.",
      },
      {
        pregunta: "¿Detecta normativa de turismo y patrimonio?",
        respuesta:
          "Configura keywords como 'turismo cultural', 'patrimonio', 'Alhambra', 'hostelería' para capturar regulación turística y convocatorias de conservación patrimonial.",
      },
      {
        pregunta: "¿Cubre el BOJA para Granada?",
        respuesta:
          "Con el plan Pro, incluimos el BOJA para convocatorias específicas de Andalucía, incluyendo ayudas provinciales.", 
      },
    ],
  },
  {
    slug: "elche",
    nombre: "Elche",
    comunidad: "Comunitat Valenciana",
    descripcion:
      "Radar BOE en Elche: alertas automáticas de licitaciones y subvenciones para empresas ilicitanas. Monitorización del BOE para la capital del calzado y la industria de la provincia de Alicante.",
    poblacionEmpresas: "Más de 25.000 empresas activas",
    sectorPredominante: "Calzado, caucho y agroalimentario",
    faqs: [
      {
        pregunta: "¿Es útil para la industria del calzado ilicitana?",
        respuesta:
          "Elche produce el 50% del calzado español. Radar BOE detecta normativa de exportación, aranceles, subvenciones industriales y ayudas de internacionalización del sector.",
      },
      {
        pregunta: "¿Detecta subvenciones de IVACE para Elche?",
        respuesta:
          "Las convocatorias IVACE que se publican en el BOE estatal sí. Para las que solo se publican en el DOGV, necesitas el plan Pro con cobertura autonómica.",
      },
      {
        pregunta: "¿Cubre el DOGV?",
        respuesta:
          "Con el plan Pro, incluimos el DOGV para convocatorias de la Generalitat Valenciana, incluyendo las específicas para la provincia de Alicante.",
      },
    ],
  },
]

export function getCiudadBySlug(slug: string): Ciudad | undefined {
  return CIUDADES.find((c) => c.slug === slug)
}

export function getAllCiudadSlugs(): string[] {
  return CIUDADES.map((c) => c.slug)
}
