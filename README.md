# Territoria · maqueta v0.2 (datos ficticios)

Demo navegable de la suite de campaña multicampaña. **No está publicada.** Todos los datos son ficticios: candidata "Laura Camargo Niño", partido "Movimiento Raíces Boyacenses", fecha del escenario 20-ago-2027.

- Para abrirla: `python3 -m http.server 8123` en esta carpeta, o abrir `dist/territoria-demo.html` (un solo archivo que funciona sin internet).
- Apps: Tablero (embudo de votos), Estrategia (calculadora con cifra repartidora), Red (árbol por niveles), Simpatizantes (consentimientos y derechos del titular), Territorio (123 municipios), Centro de redes, Asistente IA, Día E (E-14 y reclamaciones), Finanzas, Cumplimiento. Una tarjeta de Hoja de ruta reúne lo que falta.
- Asistente IA: funciona en modo simulado sin clave. También acepta una clave propia de Gemini o un código de acceso al proxy (`/ia` del Worker de fase1). Tiene guardas contra difamación, desinformación y microsegmentación con datos sensibles, y aplica el art. 35. Todo lo que produce queda marcado como hecho con IA y exige revisión humana.
- Modo presentación: guion de 10 minutos con reinicio.
- Pruebas: `node test/e2e.js` con el servidor activo (escritorio 1440 y móvil 375). Capturas en `test/shots/`.
- Archivo único: `node build_single.js` genera `dist/territoria-demo.html`.
