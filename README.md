# Territoria · maqueta v0.10 (campaña ficticia; datos territoriales y electorales reales)

Demo navegable de la suite de campaña multicampaña. Publicada en https://gdz87.github.io/territoria-demo/ con aprobación de Germán. La campaña de ejemplo es ficticia: candidata "Laura Camargo Niño", partido "Movimiento Raíces Boyacenses", fecha del escenario 20-ago-2027.

v0.10: IA encendida por defecto (se puede apagar en ⚙️), avisos breves en lenguaje sencillo y solo 4 bloqueos: aportes sobre el límite o de fuentes prohibidas, regalos o transporte para votantes, registro sin autorización de datos y suplantación con IA. Las citas legales están en el ícono ℹ️. Simpatizantes en `#/SIMPATIZANTES`. Una sola fuente electoral para toda la suite (Asamblea de Boyacá 2023: 15 curules, umbral 21.217, cifra repartidora 30.356) y provincias oficiales. Centro de redes ampliado (`redes.js`): 7 redes con vista previa, un post para todas, calendario editorial, guiones e hilos, kit de WhatsApp para líderes, fichas por municipio, campaña contra la abstención, escucha y métricas simuladas, pauta conectada a Finanzas.

v0.9: se suma el Histórico electoral con resultados reales, públicos y agregados de la Registraduría. `dist/territoria-demo.html` es la versión liviana y carga `dist/programa_necesidades.js` y `dist/electoral_mesas.js` si están junto a ella; `dist/territoria-demo-completa.html` lleva todo en un solo archivo.

- Para abrirla: `python3 -m http.server 8123` en esta carpeta, o abrir `dist/territoria-demo.html` (un solo archivo que funciona sin internet).
- Apps: Tablero (embudo de votos), Estrategia (calculadora con cifra repartidora), Red (árbol por niveles), Simpatizantes (consentimientos y derechos del titular), Territorio (123 municipios), Centro de redes, Asistente IA, Día E (E-14 y reclamaciones), Finanzas, Cumplimiento. Una tarjeta de Hoja de ruta reúne lo que falta.
- Asistente IA: funciona en modo simulado sin clave. También acepta una clave propia de Gemini o un código de acceso al proxy (`/ia` del Worker de fase1). Tiene guardas contra difamación, desinformación y microsegmentación con datos sensibles, y aplica el art. 35. Todo lo que produce queda marcado como hecho con IA y exige revisión humana.
- v0.9 (Histórico electoral, `#/HISTORICO`):
  - Resultados **reales, públicos y agregados** de la Registraduría (Boyacá 2018-2023): participación, abstención, blanco, nulos y no marcados por municipio, zona y puesto; tendencia; mapa; simulador D'Hondt con 15 curules y su fuente; metas en 3 escenarios contra la cifra repartidora (sin atípicos); bastiones; testigos por riesgo (solo del equipo); participación ciudadana legal; Día E (E-14 vs histórico y vs E-24); cruce con el tablero (correlación, no causalidad); calidad, fuentes y hashes; XLSX y PDF con trazabilidad.
  - Regla dura: nada se cruza con el CRM, no se infiere el voto de nadie y no se analizan mesas o puestos con menos de 10 votantes.
  - Archivos: `historico.js`, `historico_prog.js` (indicadores electorales en el tablero de PROGRAMA), `electoral_datos.js` (581 KB) y `electoral_mesas.js` (680 KB, se carga bajo demanda; embebido como JSON en el build completo).
- v0.8 (Programa y territorio, `#/PROGRAMA`):
  - Tablero territorial de Boyacá con datos **reales y públicos**: cada cifra muestra fuente, página y fecha de corte (19-oct-2026). Incluye filtros, comparación, búsqueda por tema y ficha exportable.
  - Generador de programa de gobierno o agenda voluntaria con la evidencia del tablero, la regla de competencias, las alertas A-01..A-10, doble firma, líneas rojas e IA local. Exporta a DNP, Registraduría o agenda, web y agenda legislativa. En «Después de ganar» genera el borrador del plan de desarrollo.
  - Archivos: `programa.js`, `programa2.js`, `programa_motor.js`, `programa_reglas.js` (generado), `programa_datos.js` (457 KB) y `programa_necesidades.js` (1,93 MB, se carga bajo demanda).
- v0.7 (Lote 1c):
  - Divipole: 123 municipios en el mapa y municipio asignado automáticamente según la dirección declarada (la dirección no se guarda; sin puestos inventados).
  - «Mis datos» (`#/mis-datos`): el titular revoca en 3 clics con código o en 2 con el enlace del mensaje. Plazos de 10 y 15 días hábiles con festivos 2026-2027.
  - Carta de IA responsable (`#/carta-ia` y `carta-ia.html`) y registro de cada uso de IA, exportable en CSV.
  - «Alta de campaña» (`#/ALTA`): 6 pasos con cronómetro (72 h o menos). La campaña abre en su propio espacio y «Modo presentación · Boyacá» reinicia en 1 clic.
- v0.3 (prioridades del asesor):
  - Brújula de campaña en el inicio, para todos los roles, con acuse de lectura.
  - Estrategia: objetivo (ganar / posicionarse / participar), meta de abajo hacia arriba con alerta «meta no sustentada» y escenario «si no intervenimos»; plan estrategia → objetivo → táctica → tarea; planificador inverso desde el Día E; hitos con plazos legales; matriz segmento → mensaje → canal → indicador con ficha de transparencia.
  - Tablero: embudo por fase con alertas de desbalance, cuarto de guerra con registro de decisiones y eventos (meta vs. real).
  - Aviso de IA obligatorio, deepfakes bloqueados, revisión humana en la bitácora y chatbot con respuestas aprobadas.
  - Segundo canal para pagos ≥ 2 millones y cambios de cuenta (código de demostración: 482917); el Día E solo acepta testigos autenticados en su mesa.
- Modo presentación: guion de 13 pasos con reinicio.
- Pruebas: `node test/e2e.js` con el servidor activo (escritorio 1440 y móvil 375). Capturas en `test/shots/`.
- Archivo único: `node build_single.js` genera `dist/territoria-demo.html`.
