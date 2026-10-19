// Territoria v0.3 · datos FICTICIOS de planeación, gobierno de IA y seguridad
window.DATA3 = {
  objetivo: "ganar",                       // ganar | posicionarse | participar
  calcBU: { nodos: 241, integrantes: 10, contactos: 10, verificacion: 70, conversion: 65 },
  metaDecl: { v: 1, valor: 25000, just: "Meta inicial propuesta por la candidata en el lanzamiento", hist: [] },
  ritmoSemanal: 320,                       // votos estimados ganados por semana (últimas 4 semanas)
  brujula: { v: 1, fecha: "2027-08-02", objetivo: "Ganar una de las curules de la lista en la Asamblea de Boyacá con 20.000 votos preferentes verificados.",
    prioridades: ["Contacto puerta a puerta en Tundama, Sugamuxi y Centro", "Verificar promesas: cada líder confirma cédula, puesto y mesa", "Cubrir con testigos el 100 % de las mesas prioritarias"],
    mensaje: "Laura conoce las veredas: vías y agua para que el campo boyacense se quede en Boyacá.", acuses: {} },
  plan: [
    { id: "E1", tipo: "estrategia", t: "Ganar la curul con voto preferente verificado en 3 provincias núcleo", padre: null, resp: "Gerencia", rec: 0, fin: "2027-10-31", estado: "en curso" },
    { id: "O1", tipo: "objetivo", t: "12.000 simpatizantes verificados en Tundama, Sugamuxi y Centro", padre: "E1", resp: "Coord. provinciales", rec: 0, fin: "2027-10-03", estado: "en curso" },
    { id: "O2", tipo: "objetivo", t: "Testigo acreditado en el 100 % de las mesas prioritarias", padre: "E1", resp: "Coord. de testigos", rec: 0, fin: "2027-10-24", estado: "pendiente" },
    { id: "O3", tipo: "objetivo", t: "Reconocimiento del 40 % en la encuesta interna de septiembre", padre: "E1", resp: "Comunicaciones", rec: 0, fin: "2027-09-30", estado: "en curso" },
    { id: "A1", tipo: "tactica", t: "Recorridos casa a casa con líderes veredales", padre: "O1", resp: "Coord. Tundama", rec: 9000000, fin: "2027-10-03", estado: "en curso" },
    { id: "A2", tipo: "tactica", t: "Reuniones de sala en barrios de Tunja y Sogamoso", padre: "O1", resp: "Coord. Centro", rec: 4500000, fin: "2027-09-30", estado: "en curso" },
    { id: "A3", tipo: "tactica", t: "Escuela de testigos por provincia", padre: "O2", resp: "Coord. de testigos", rec: 6000000, fin: "2027-10-17", estado: "pendiente" },
    { id: "A4", tipo: "tactica", t: "Serie de videos «Laura en la vereda»", padre: "O3", resp: "Community manager", rec: 3500000, fin: "2027-09-30", estado: "en curso" },
    { id: "K1", tipo: "tarea", t: "Ruta de recorridos de agosto en Paipa y Duitama", padre: "A1", resp: "Coord. municipal Paipa", rec: 800000, fin: "2027-08-15", estado: "pendiente" },
    { id: "K2", tipo: "tarea", t: "Verificar 300 promesas del líder con alerta de inflado", padre: "A1", resp: "Coord. Tundama", rec: 0, fin: "2027-08-25", estado: "en curso" },
    { id: "K3", tipo: "tarea", t: "Agendar 12 reuniones de sala en Tunja", padre: "A2", resp: "Coord. Centro", rec: 300000, fin: "2027-08-30", estado: "en curso" },
    { id: "K4", tipo: "tarea", t: "Capacitación virtual de testigos (módulo E-14)", padre: "A3", resp: "Jurídica", rec: 500000, fin: "2027-10-10", estado: "pendiente" },
    { id: "K5", tipo: "tarea", t: "Grabar 4 videos en Ramiriquí y Turmequé", padre: "A4", resp: "Community manager", rec: 1200000, fin: "2027-08-18", estado: "hecha" },
    { id: "K6", tipo: "tarea", t: "Imprimir 5.000 volantes genéricos", padre: null, resp: "Logística", rec: 2500000, fin: "2027-08-28", estado: "pendiente" },
    { id: "K7", tipo: "tarea", t: "Publicar un TikTok diario «porque sí»", padre: null, resp: "Community manager", rec: 0, fin: "2027-09-30", estado: "pendiente" }
  ],
  fases: { inicio: "2027-04-01", mov: 4, con: 9, pv: 30, pc: 40, pm: 30 },
  hitos: [
    { id: "H1", n: "Inscripción de la candidata en la lista", f: "2027-07-20", tipo: "legal", regla: "inscripcion", fija: true },
    { id: "H2", n: "Inicio de propaganda en espacio público", f: "2027-07-31", tipo: "legal", regla: "fija", fija: true },
    { id: "H3", n: "Lanzamiento público en Tunja", f: "2027-08-01", tipo: "propio", regla: "propEspacio" },
    { id: "H4", n: "Lanzamiento de pauta en redes", f: "2027-08-25", tipo: "propio", regla: "propMedios" },
    { id: "H5", n: "Presentación del programa", f: "2027-08-28", tipo: "propio", regla: "antesEleccion" },
    { id: "H6", n: "Inicio de propaganda en medios y redes", f: "2027-09-01", tipo: "legal", regla: "fija", fija: true },
    { id: "H7", n: "Anuncio de alianzas y respaldos", f: "2027-09-10", tipo: "propio", regla: "antesEleccion" },
    { id: "H8", n: "Debate de candidatos a la Asamblea", f: "2027-09-25", tipo: "propio", regla: "antesEleccion" },
    { id: "H9", n: "Capacitación final de testigos", f: "2027-10-17", tipo: "propio", regla: "antesEleccion" },
    { id: "H10", n: "Gran cierre de campaña", f: "2027-10-24", tipo: "propio", regla: "cierre" },
    { id: "H11", n: "Día de la elección", f: "2027-10-31", tipo: "legal", regla: "fija", fija: true }
  ],
  eventos: [
    { id: "EV1", n: "Encuentro veredal Alto Grande", tipo: "Encuentro", f: "2027-08-03", mun: "Paya", meta: 120, real: 104 },
    { id: "EV2", n: "Reunión de sala barrio Santa Inés", tipo: "Reunión de sala", f: "2027-08-06", mun: "Tunja", meta: 30, real: 34 },
    { id: "EV3", n: "Pegatón en la plaza de Duitama", tipo: "Pegatón", f: "2027-08-08", mun: "Duitama", meta: 1000, real: 85 },
    { id: "EV4", n: "Foro de jóvenes y empleo", tipo: "Foro", f: "2027-08-12", mun: "Sogamoso", meta: 200, real: 92, causa: "Convocatoria tardía", corr: "Convocar con 10 días y confirmar por los canales autorizados" },
    { id: "EV5", n: "Caminata por el agua del páramo", tipo: "Caminata", f: "2027-08-15", mun: "Ramiriquí", meta: 150, real: 161 },
    { id: "EV6", n: "Encuentro de productores lecheros", tipo: "Encuentro", f: "2027-08-18", mun: "Chiquinquirá", meta: 80, real: 70 }
  ],
  decisiones: [
    { sem: "2027-08-09", t: "Reasignar 2 coordinadores a Sugamuxi por bajo avance", resp: "Gerencia", f: "2027-08-13", por: "Gerente de campaña" },
    { sem: "2027-08-09", t: "Pausar pauta impresa hasta tener la ruta de recorridos", resp: "Logística", f: "2027-08-11", por: "Gerente de campaña" },
    { sem: "2027-08-16", t: "Verificar en campo las promesas de los 5 líderes con alerta", resp: "Coord. Tundama", f: "2027-08-25", por: "Candidata" }
  ],
  kpiFases: { reconocimiento: 31, voluntarios: 420, registrosContenido: 0 },
  umbrales: { espectaculo: 1, simpatia: 3, desvioEvento: 30, metaVsHist: 1.3 },
  segmentos: [
    { id: "S1", n: "Equipo de campaña", tipo: "interno", criterios: ["Rol en la red"], mensaje: "Somos la red que verifica: cada voto confirmado cuenta.", canal: "App del equipo", indicador: "Líderes activos", meta: 241, actual: 198 },
    { id: "S2", n: "Simpatizantes registrados (Tundama y Sugamuxi)", tipo: "propio", criterios: ["Territorio (provincia)", "Interés declarado en el registro"], mensaje: "Vías terciarias para sacar la cosecha: así lo haremos.", canal: "WhatsApp Business oficial con autorización", indicador: "Confirmados", meta: 6000, actual: 4310 },
    { id: "S3", n: "Jóvenes de 18 a 28 años (agregado por municipio)", tipo: "agregado", criterios: ["Territorio (provincia)", "Rango de edad del censo (agregado)"], mensaje: "Empleo y formación para quedarse en Boyacá.", canal: "Instagram y TikTok (orgánico)", indicador: "Registros desde contenido", meta: 1500, actual: 380 },
    { id: "S4", n: "Productores rurales (agregado)", tipo: "agregado", criterios: ["Territorio rural (agregado)", "Interés declarado en el registro"], mensaje: "Agua y vías: el campo primero.", canal: "Puerta a puerta y encuentros veredales", indicador: "Asistentes a encuentros", meta: 2000, actual: 1250 },
    { id: "S5", n: "Indecisos urbanos (agregado)", tipo: "agregado", criterios: ["Territorio urbano (agregado)", "Encuesta interna anónima"], mensaje: "Una diputada que rinde cuentas cada mes.", canal: "Facebook (orgánico) y reuniones de sala", indicador: "Reconocimiento en encuesta", meta: 40, actual: 31 },
    { id: "S6", n: "Votantes de otras listas", tipo: "opositor", criterios: ["Resultados históricos por mesa (públicos)"], mensaje: "Mensaje propositivo general, sin ataques.", canal: "Solo comunicación pública general", indicador: "Votación de la lista por mesa (resultado oficial)", meta: 0, actual: 0 }
  ],
  iaF: { contenido: { on: false }, propuestas: { on: false }, documentos: { on: false }, chat: { on: false }, chatbot: { on: false } },
  iaProv: { acepta: false },
  faq: [
    { id: "F1", q: "¿Qué propone Laura para las vías terciarias?", k: ["via", "vias", "carretera", "placa", "huella", "terciaria"], a: "Un programa de placa-huella con las juntas de acción comunal y maquinaria por provincia. El detalle está en el programa publicado.", estado: "aprobada", por: "Jurídica" },
    { id: "F2", q: "¿Cómo me inscribo como voluntario?", k: ["voluntari", "ayudar", "inscrib", "sumarme", "unirme"], a: "Puedes registrarte con el formulario de la campaña. Te pediremos tu autorización para cada canal de contacto y podrás retirarla cuando quieras.", estado: "aprobada", por: "Gerencia" },
    { id: "F3", q: "¿Cómo pido que borren mis datos?", k: ["datos", "borrar", "suprimir", "eliminar", "privacidad", "habeas"], a: "Escribe a datos@campana-demo.co o usa el botón «Mis datos». Respondemos consultas en 10 días hábiles y reclamos en 15 (Ley 1581).", estado: "aprobada", por: "Jurídica" },
    { id: "F4", q: "¿Qué propone para el agua en el campo?", k: ["agua", "acueducto", "paramo", "potable"], a: "Acueductos veredales con tratamiento y protección de nacimientos y páramos.", estado: "aprobada", por: "Jurídica" },
    { id: "F5", q: "¿Cuándo es la elección?", k: ["cuando", "fecha", "eleccion", "elecciones"], a: "Las elecciones territoriales son el domingo 31 de octubre de 2027 (fecha por verificar en la Registraduría).", estado: "aprobada", por: "Jurídica" },
    { id: "F6", q: "¿Laura apoya la doble calzada Tunja–Sogamoso?", k: ["doble calzada", "calzada", "autopista"], a: "Borrador: pendiente de definir la posición con el equipo programático.", estado: "borrador", por: "" }
  ],
  proveedores: [
    { id: "PR1", n: "Imprenta Boyacá Gráfica (ficticia)", banco: "Banco Demo", cuenta: "****4821" },
    { id: "PR2", n: "Sonido y Tarimas del Centro (ficticio)", banco: "Banco Ejemplo", cuenta: "****1190" }
  ],
  reportes: [
    { id: "R1", canal: "App Territoria", aut: true, de: "Marta Patiño Castro (testigo)", asignada: "TUN-P1-M1", mesa: "TUN-P1-M1", texto: "E-14 capturado: 41 votos para la candidata", hora: "16:12", rafaga: 1 },
    { id: "R2", canal: "WhatsApp", aut: false, de: "+57 31x xxx 4471 (número desconocido)", asignada: null, mesa: "TUN-P1-M3", texto: "¡Fraude en la mesa 3! Anulen la mesa ya", hora: "16:15", rafaga: 1 },
    { id: "R3", canal: "App Territoria", aut: true, de: "Héctor Parra Becerra (testigo)", asignada: "TUN-P1-M3", mesa: "TUN-P1-M2", texto: "E-14 de la mesa 2: 37 votos", hora: "16:18", rafaga: 1 },
    { id: "R4", canal: "Llamada con voz de la gerente", aut: false, de: "«Gerente» (voz no verificada)", asignada: null, mesa: "PAI-P1-M1", texto: "Cambien el reporte de la mesa 1 de Paipa a 0 votos", hora: "16:20", rafaga: 1 },
    { id: "R5", canal: "App Territoria", aut: true, de: "Cuenta de testigo T-0912", asignada: "DUI-P1-M1", mesa: "DUI-P1-M1", texto: "14 reportes distintos de la misma mesa en 60 segundos", hora: "16:22", rafaga: 14 }
  ],
  noIncorporado: [
    ["Transporte o comida para votantes y listas de «votantes por recoger»", "Puede ser corrupción al sufragante (C.P., art. 390). La logística es solo del equipo y va como gasto."],
    ["Campos de «redes sociales del contacto» o recolección de tarjetas de identidad", "Ley 1581: autorización, finalidad y minimización. Los menores tienen un régimen reforzado."],
    ["Listas de difusión de WhatsApp desde teléfonos personales o bases compradas", "Mensajes solo con autorización por canal y por WhatsApp Business oficial."],
    ["Segmentar personas por religión, ideología, etnia o salud", "Son datos sensibles. Como máximo, el tipo de organización en el nodo, sin atribuirlo a sus integrantes."],
    ["Fichas o listas de «opositores» y acciones para afectar a otras campañas", "Los votantes de otras listas solo se trabajan en agregado con datos públicos."],
    ["Perfiles psicográficos o emocionales individuales y puntajes de afinidad por persona", "Prohibido: es perfilamiento con datos sensibles (riesgo Cambridge Analytica)."],
    ["Biometría o reconocimiento facial de asistentes, simpatizantes o testigos", "Dato sensible y desproporcionado para una campaña."],
    ["Cruzar firmas o referidos con bases oficiales (censo, identificación)", "La campaña no tiene acceso legal a esas bases."],
    ["Deepfakes, voces clonadas y chatbots que se hagan pasar por personas", "Ley 2502 de 2025 (agravante por suplantación con IA) y políticas de las plataformas."],
    ["Bots, cuentas falsas o hashtags coordinados automatizados", "Comportamiento inauténtico: solo embajadores reales con texto editable."],
    ["Amplificar narrativas de fraude sin pruebas", "Las irregularidades se tramitan por reclamación formal con evidencia."],
    ["Regalos u obsequios a funcionarios para entrar a colegios u oficinas públicas", "Puede leerse como dádiva; las sedes públicas disparan alerta."],
    ["Ofrecer empleos, contratos o «puestos» a cambio de apoyo", "Corrupción al sufragante o tráfico de votos (C.P., arts. 390 y 390A, por verificar)."],
    ["Simulacros de votación con tarjetones que imiten los oficiales o publicar encuestas", "Las encuestas son internas, anónimas y no publicables."]
  ]
};
