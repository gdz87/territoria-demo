// Configuración de marca y de la campaña demo (todo FICTICIO y configurable)
window.CONFIG = {
  marca: "Territoria",
  lema: "Votos verificados, campaña en regla",
  prefijo: "terr03_",
  campana: "Campaña Laura Camargo · Asamblea de Boyacá 2027",
  candidato: "Laura Camargo Niño",
  partido: "Movimiento Raíces Boyacenses",          // ficticio, no corresponde a ningún partido real
  colorPartido: "#0f9d76",
  cargo: "Asamblea",                                 // Asamblea | Concejo | Alcaldía | Gobernación
  fechaEleccion: "2027-10-31",
  fechaDemo: "2027-08-20",                           // fecha simulada del escenario de venta
  calendario: {                                      // POR VERIFICAR con el calendario oficial de la Registraduría
    inscripcionDesde: "2027-06-30", inscripcionHasta: "2027-07-30", inscripcionCandidata: "2027-07-20",
    propagandaEspacioPublico: "2027-07-31",          // ~3 meses antes (Ley 1475, art. 35)
    propagandaMedios: "2027-09-01"                   // ~60 días antes (Ley 1475, art. 35); redes tratadas como medios (por verificar)
  },
  electoral: { curules: 16, umbralPctCociente: 50, tasaConversion: 0.65, participacion: 0.52 },  // curules y umbral POR VERIFICAR
  finanzas: { topeLista: 3200000000, candidatosLista: 16 },   // tope ficticio; el real lo fija el CNE en enero de 2027
  privacidad: {                                       // Aviso v2.0 — plantilla, debe revisarlo un abogado
    version: "Aviso v2.0",
    responsable: "Campaña Laura Camargo Niño (candidata) — Movimiento Raíces Boyacenses",
    nit: "NIT 901.000.000-0 (ficticio)",
    contacto: "datos@campana-demo.co · 300 000 0000 · Calle 19 # 10-20, Tunja",
    encargado: "Germán Díaz, proveedor tecnológico (Encargado del tratamiento)",
    finalidades: "organizar la campaña, contactarte por los canales que autorices, invitarte a eventos y coordinar el voluntariado y el Día E",
    canal: "datos@campana-demo.co o el botón «Mis datos» del formulario",
    politicaURL: "https://campana-demo.co/politica-datos",
    alojamiento: "servidores en Brasil o EE. UU. con nivel adecuado de protección (por verificar ante la SIC)",
    conservacion: "hasta el 31-dic-2027 (cierre de la rendición de cuentas); luego se suprimen"
  },
  seguridad: { umbralPago: 2000000 },            // pagos desde este valor exigen segundo canal
  ia: { proxy: "https://territoria-api.gdz87.workers.dev", modelo: "auto" }
};
