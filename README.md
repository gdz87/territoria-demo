# Territoria · maqueta v0.3 (datos ficticios)

Demo navegable de la suite de campaña multicampaña. Publicada en https://gdz87.github.io/territoria-demo/ con aprobación de Germán. Todos los datos son ficticios: candidata "Laura Camargo Niño", partido "Movimiento Raíces Boyacenses", fecha del escenario 20-ago-2027.

- Para abrirla: `python3 -m http.server 8123` en esta carpeta, o abrir `dist/territoria-demo.html` (un solo archivo que funciona sin internet).
- Apps: Tablero (embudo de votos), Estrategia (calculadora con cifra repartidora), Red (árbol por niveles), Simpatizantes (consentimientos y derechos del titular), Territorio (123 municipios), Centro de redes, Asistente IA, Día E (E-14 y reclamaciones), Finanzas, Cumplimiento. Una tarjeta de Hoja de ruta reúne lo que falta.
- Asistente IA: funciona en modo simulado sin clave. También acepta una clave propia de Gemini o un código de acceso al proxy (`/ia` del Worker de fase1). Tiene guardas contra difamación, desinformación y microsegmentación con datos sensibles, y aplica el art. 35. Todo lo que produce queda marcado como hecho con IA y exige revisión humana.
- v0.3 (prioridades del asesor):
  - Brújula de campaña en el inicio, para todos los roles, con acuse de lectura.
  - Estrategia: objetivo (ganar / posicionarse / participar), meta de abajo hacia arriba con alerta «meta no sustentada» y escenario «si no intervenimos»; plan estrategia → objetivo → táctica → tarea; planificador inverso desde el Día E; hitos con plazos legales; matriz segmento → mensaje → canal → indicador con ficha de transparencia.
  - Tablero: embudo por fase con alertas de desbalance, cuarto de guerra con registro de decisiones y eventos (meta vs. real).
  - IA apagada por defecto (IA › Gobierno de IA), aviso de IA obligatorio, deepfakes bloqueados, revisión humana en la bitácora y chatbot con respuestas aprobadas.
  - Segundo canal para pagos ≥ 2 millones y cambios de cuenta (código de demostración: 482917); el Día E solo acepta testigos autenticados en su mesa.
- Modo presentación: guion de 13 pasos con reinicio.
- Pruebas e2e (escritorio 1440 y móvil 375) y esquema de servidor: en el repositorio privado de desarrollo; no se publican.
- Archivo único: `dist/territoria-demo.html`.
