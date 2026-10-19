# Territoria · maqueta v0.8 (campaña ficticia; datos territoriales reales)

Demo navegable de la suite de campaña multicampaña. Publicada en https://gdz87.github.io/territoria-demo/ con aprobación de Germán. La campaña de ejemplo es ficticia: candidata "Laura Camargo Niño", partido "Movimiento Raíces Boyacenses", fecha del escenario 20-ago-2027.

v0.8: la app «Programa y territorio» usa datos territoriales **reales y públicos** de Boyacá (DNP, DANE, SGR y planes de desarrollo), cada uno con fuente, página y fecha de corte (19-oct-2026). `dist/territoria-demo.html` es la versión liviana y carga `dist/programa_necesidades.js` si está junto a ella; `dist/territoria-demo-completa.html` lleva todo en un solo archivo.

- Para abrirla: `python3 -m http.server 8123` en esta carpeta, o abrir `dist/territoria-demo.html` (un solo archivo que funciona sin internet).
- Apps: Tablero (embudo de votos), Estrategia (calculadora con cifra repartidora), Red (árbol por niveles), Simpatizantes (consentimientos y derechos del titular), Territorio (123 municipios), Centro de redes, Asistente IA, Día E (E-14 y reclamaciones), Finanzas, Cumplimiento. Una tarjeta de Hoja de ruta reúne lo que falta.
- Asistente IA: funciona en modo simulado sin clave. También acepta una clave propia de Gemini o un código de acceso al proxy (`/ia` del Worker de fase1). Tiene guardas contra difamación, desinformación y microsegmentación con datos sensibles, y aplica el art. 35. Todo lo que produce queda marcado como hecho con IA y exige revisión humana.
- v0.7 (Lote 1c):
  - Divipole: 123 municipios en el mapa y municipio asignado automáticamente según la dirección declarada (la dirección no se guarda; sin puestos inventados).
  - «Mis datos» (`#/mis-datos`): el titular revoca en 3 clics con código o en 2 con el enlace del mensaje. Plazos de 10 y 15 días hábiles con festivos 2026-2027.
  - Carta de IA responsable (`#/carta-ia` y `carta-ia.html`) y registro de cada uso de IA, exportable en CSV.
  - «Alta de campaña» (`#/ALTA`): 6 pasos con cronómetro (72 h o menos). La campaña abre en su propio espacio y «Modo presentación · Boyacá» reinicia en 1 clic.
- v0.3 (prioridades del asesor):
  - Brújula de campaña en el inicio, para todos los roles, con acuse de lectura.
  - Estrategia: objetivo (ganar / posicionarse / participar), meta de abajo hacia arriba con alerta «meta no sustentada» y escenario «si no intervenimos»; plan estrategia → objetivo → táctica → tarea; planificador inverso desde el Día E; hitos con plazos legales; matriz segmento → mensaje → canal → indicador con ficha de transparencia.
  - Tablero: embudo por fase con alertas de desbalance, cuarto de guerra con registro de decisiones y eventos (meta vs. real).
  - IA apagada por defecto (IA › Gobierno de IA), aviso de IA obligatorio, deepfakes bloqueados, revisión humana en la bitácora y chatbot con respuestas aprobadas.
  - Segundo canal para pagos ≥ 2 millones y cambios de cuenta (código de demostración: 482917); el Día E solo acepta testigos autenticados en su mesa.
- Modo presentación: guion de 13 pasos con reinicio.
- Pruebas: `node test/e2e.js` con el servidor activo (escritorio 1440 y móvil 375). Capturas en `test/shots/`.
- Archivo único: `node build_single.js` genera `dist/territoria-demo.html`.
