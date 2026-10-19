/* Territoria v0.3 · arranque, declaración de servidor público y modo presentación */
(function(){
const T=window.T,{C,S,H}=T;
// Guion de 10 minutos
T.GUION=[["0:00","Inicio y Brújula","#/","«¿Cuántos votos tengo de verdad?». Laura Camargo (ficticia), 20-ago-2027. La Brújula llega a todos los roles con acuse de lectura."],
["0:45","Meta sustentada","#/ESTRATEGIA?meta","Objetivo ganar / posicionarse / participar. La meta de abajo hacia arriba no alcanza: alerta de meta no sustentada y escenario «si no intervenimos»."],
["1:45","Plan con responsables","#/ESTRATEGIA?plan","Estrategia → objetivo → táctica → tarea. Dos tareas no sirven a ningún objetivo: se ven y se vinculan."],
["2:30","Cronograma desde el Día E","#/ESTRATEGIA?hitos","Fases Visibilidad, Contacto y Movilización; un hito de pauta antes del 1-sep incumple el art. 35."],
["3:15","Tablero por fases","#/TABLERO?fases","Alertas de «espectáculo» y «simpatía sin votos»: lo digital no es voto."],
["4:00","Cuarto de guerra","#/TABLERO?guerra","Agenda automática del lunes y decisiones registradas a prueba de alteraciones."],
["4:45","Un líder que infla promesas","#/RED?inflados","El ranking premia solo lo verificable."],
["5:30","Redes con reglas","#/CONTENIDO?comp","Art. 35, aviso de IA obligatorio y bloqueo de deepfakes de otras personas."],
["6:30","IA con gobierno","#/IA?gobierno","Funciones apagadas por defecto, activación con justificación, proveedor sin entrenamiento y chatbot que se identifica como automático."],
["7:30","Día E sin suplantaciones","#/DIAE?rep","Solo cuentan testigos autenticados en su mesa; se rechazan WhatsApp, voces falsas y ráfagas."],
["8:30","Finanzas sin sustos","#/FINANZAS","Fuentes prohibidas, 10 %, CSV para Cuentas Claras y simulacro de audio falso: pagos solo con segundo canal."],
["9:15","Cumplimiento","#/CUMPLIMIENTO","Ley 1581, Circular SIC 002/2026, Ley 2502/2025 y lo que Territoria no hace."],
["9:45","Cierre","#/","Votos reales, cuidar la mesa y no perder la curul por topes, datos ni IA. Próximo paso: piloto."]];
function presPanel(){let p=T.$("#pres");if(!S.pres){p&&p.remove();return}if(!p){p=document.createElement("div");p.id="pres";p.className="pres";document.body.appendChild(p)}
 const i=S.pres.paso,g=T.GUION[i];p.innerHTML=`<div class="row b"><b>▶ Presentación · ${g[0]} · ${i+1}/${T.GUION.length}</b><button class="btn sm" id="pres-x" type="button" aria-label="Salir de la presentación">✕</button></div><div class="small"><b>${H(g[1])}.</b> ${H(g[3])}</div><div class="row" style="margin-top:8px"><button class="btn sm" id="pres-a" type="button" ${i?"":"disabled"}>← Anterior</button><span class="sp"></span><button class="btn sm pri" id="pres-s" type="button">${i<T.GUION.length-1?"Siguiente →":"Terminar"}</button></div>`;
 p.querySelector("#pres-x").onclick=()=>{S.pres=null;T.save();presPanel()};p.querySelector("#pres-a").onclick=()=>ir(i-1);p.querySelector("#pres-s").onclick=()=>i<T.GUION.length-1?ir(i+1):(S.pres=null,T.save(),presPanel(),T.toast("Fin de la presentación"))}
function ir(i){S.pres={paso:i};T.save();location.hash=T.GUION[i][2];if(location.hash==T.GUION[i][2])T.render(location.hash.replace(/^#\/?/,""));presPanel()}
T.onClick("#pres-ini",()=>{T.reset();localStorage.setItem(C.prefijo+"pres",JSON.stringify({paso:0}));localStorage.setItem(C.prefijo+"rol",'"candidato"');localStorage.setItem(C.prefijo+"decl",JSON.stringify({candidato:true}));location.hash="#/";location.reload()});
T.onClick("#reset2",()=>T.$("#reset").click());
// Declaración de no ser servidor público con prohibición de participar en política
function declarar(rol,ok){if(S.decl[rol]){ok();return}const m=T.modal(`<h2>Antes de entrar</h2><p class="small">Rol: <b>${H(T.ROLES[rol].n)}</b></p><label class="ck"><input type="checkbox" id="dsp"><span> Declaro que <b>no soy servidor público</b> con prohibición de participar en política (C.P., art. 127; Ley 996 de 2005, por verificar) y que no usaré bienes, equipos, correos ni tiempo de entidades públicas en la campaña.</span></label><p class="muted small">Si eres empleado o contratista del Estado, informa al jurídico de la campaña: tus funciones se limitan automáticamente.</p><button class="btn pri" id="dok" type="button" style="width:100%">Continuar</button>`,{noClose:true});
 m.querySelector("#dok").onclick=()=>{if(!m.querySelector("#dsp").checked){T.toast("Debes aceptar la declaración para continuar");return}S.decl[rol]=true;T.save();T.log("usuario.declaracion","Declaración de no ser servidor público ("+T.ROLES[rol].n+")",rol);m.remove();ok()}}
T.aplicaTema=()=>{document.documentElement.dataset.tema=S.tema;const b=T.$("#tema");b.textContent=S.tema=="oscuro"?"☀️":"🌙";b.setAttribute("aria-label",S.tema=="oscuro"?"Cambiar a modo claro":"Cambiar a modo oscuro")};
async function init(){await T.initBit();document.title=C.marca+" · Demo";T.$("#marca").textContent=C.marca;T.$("#lema").textContent=C.lema;document.documentElement.style.setProperty("--pc",C.colorPartido);
 const r=T.$("#rol");r.innerHTML=Object.entries(T.ROLES).map(([k,v])=>`<option value="${k}">${H(v.n)}</option>`).join("");r.value=S.rol;
 r.onchange=()=>{const nuevo=r.value;declarar(nuevo,()=>{S.rol=nuevo;T.save();T.log("sesion.rol","Ingreso como "+T.ROLES[nuevo].n);T.toast("Rol: "+T.ROLES[nuevo].n);location.hash="#/";T.render("")});r.value=S.rol};
 T.$("#tema").onclick=()=>{S.tema=S.tema=="oscuro"?"claro":"oscuro";T.save();T.aplicaTema()};
 T.$("#sync").onclick=()=>{S.offline=!S.offline;T.save();T.pintaSync();if(T.enLinea())T.sincronizar();else T.toast("Sin señal (simulado): lo que registres queda en el celular")};
 addEventListener("online",()=>{T.pintaSync();T.sincronizar()});addEventListener("offline",T.pintaSync);
 T.$("#reset").onclick=()=>{if(confirm("¿Restablecer los datos de la demo en este equipo?")){T.reset();location.hash="";location.reload()}};
 T.aplicaTema();T.pintaSync();addEventListener("hashchange",()=>T.render(location.hash.replace(/^#\/?/,"")));
 declarar(S.rol,()=>{});T.render(location.hash.replace(/^#\/?/,""));presPanel();
 if("serviceWorker" in navigator&&location.protocol.startsWith("http")&&!window.SINGLE_FILE)navigator.serviceWorker.register("sw.js").catch(()=>{})}
init();
})();
