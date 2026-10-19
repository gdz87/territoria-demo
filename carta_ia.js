// Territoria v0.7 · 009 Carta de IA responsable (texto único: lo usan la app, carta-ia.html y CARTA_IA_RESPONSABLE.md).
// BORRADOR: debe revisarlo un abogado antes de publicarse. Las normas citadas están marcadas «por verificar».
window.CARTA_IA={
 titulo:"Carta de IA responsable",
 version:"Carta IA v1.0 · 19-oct-2026",
 estado:"Borrador · requiere revisión de un abogado",
 intro:"Esta carta dice cómo la campaña usa la inteligencia artificial (IA) en Territoria, qué no hace nunca y cómo se controla. Aplica a todo el equipo y a los proveedores. La IA ayuda; las personas deciden.",
 principios:[
  ["Apagada por defecto","Cada función de IA viene apagada en cada campaña. La enciende la candidata, la gerencia o el jurídico, una a una, con una justificación de necesidad y proporcionalidad que queda en la bitácora. Se puede apagar en cualquier momento."],
  ["Una persona decide","La IA propone borradores; nada se publica, se envía ni se decide sin revisión humana registrada. Ninguna decisión sobre una persona (contactarla, calificarla, excluirla) se toma con IA."],
  ["Transparencia","Todo contenido hecho con IA lleva el aviso visible «Hecho con IA». El chatbot ciudadano se presenta como asistente automático, no como persona, y solo usa respuestas aprobadas por el equipo."],
  ["Líneas rojas","No se generan deepfakes ni se imita la imagen o la voz de personas reales distintas de la candidatura que lo autorizó (en especial rivales, funcionarios, periodistas o personas fallecidas); no se produce desinformación, ataques personales ni contenido para comprar o presionar votos; no se microsegmenta por datos sensibles ni por opinión política sin autorización explícita del titular."],
  ["Datos personales fuera de la IA","No se envían bases de simpatizantes ni datos de titulares a herramientas de IA. El asesor enmascara nombres, teléfonos y documentos antes de consultar. Solo se usan datos agregados y documentos públicos."],
  ["Proveedor sin entrenamiento","Solo se usa un proveedor que se compromete por escrito a no entrenar sus modelos con los datos de la campaña (plan de pago), a través del servidor de Territoria. La transmisión de datos al proveedor se documenta como encargo o transmisión internacional."],
  ["Registro de cada uso","Cada uso de IA queda anotado: cuándo, qué rol (seudónimo en el servidor), qué función, proveedor, modelo y resultado (ok, rechazo, guarda o error). No se guarda el texto consultado. El registro no se edita ni se borra y lo exportan la candidata, la gerencia o el jurídico."],
  ["Derechos de los titulares","Cualquier persona puede preguntar en «Mis datos» qué datos suyos tiene la campaña, oponerse al contacto o revocar su autorización. Como los datos de titulares no entran a la IA, no hay perfiles ni puntajes hechos con IA sobre nadie."],
  ["Supervisión e incidentes","El jurídico revisa esta carta y el registro de usos al menos una vez al mes durante la campaña. Ante un incidente (contenido indebido, fuga o uso no autorizado) se apaga la función, se registra en la bitácora y se evalúa el aviso a la SIC y a los afectados."]],
 inventario:[
  ["contenido","Borradores de publicaciones, guiones, hilos e ideas","Tema, tono, red y territorio; sin datos personales","Medio"],
  ["propuestas","Ejes del programa con diagnóstico, metas e indicadores","Documentos públicos e insumos del equipo","Medio"],
  ["documentos","Resumen y hallazgos de documentos públicos","Texto de documentos cargados (no subir datos personales)","Medio"],
  ["chat","Preguntas del equipo con el contexto agregado","Metas y cifras agregadas; sin personas","Medio"],
  ["chatbot","Responder a ciudadanos solo con respuestas aprobadas","Preguntas de ciudadanos; respuestas aprobadas","Alto"],
  ["asesor","Orientación de estrategia y cumplimiento con fuentes citadas","Pregunta enmascarada y base documental pública","Medio"],
  ["clasificador_e14","Avisar si la imagen subida no parece un formulario E-14","Imagen del formulario; se procesa en el navegador","Bajo"]],
 normas:["Ley 1581 de 2012 y Decreto 1377 de 2013 (protección de datos personales)","Circular Externa SIC 002 de 2026 sobre tratamiento de datos con fines políticos (por verificar)","Ley 2502 de 2025 sobre suplantación con IA (por verificar)","Ley 1475 de 2011, art. 35 (propaganda electoral)","Recomendación de la UNESCO sobre la ética de la IA (2021) y CONPES 4144 de 2025 (por verificar)"],
 pie:"Borrador de la Carta de IA responsable de Territoria (v1.0, 19-oct-2026). Debe revisarlo un abogado de la campaña antes de publicarse. Responsable de esta carta: el jurídico de la campaña."
};
