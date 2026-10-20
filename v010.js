/* Territoria v0.10 · ajustes de campaña, una sola fuente electoral, lenguaje claro, Simpatizantes, Histórico y Asesor.
   Se carga después de historico.js y antes de main.js. Conserva el prefijo terr03_ y los datos guardados. */
(function(){
const T=window.T,{C,S,H,D}=T,fmt=T.fmt,E=window.ELECT_DATOS;
// ---------- Fecha de elección configurable (una sola en toda la suite) ----------
C.fechaEleccion=T.fechaEleccion();
// ---------- Mapa y municipios: potencial y votación del Histórico oficial (Asamblea 2023) ----------
if(E&&E.municipal&&E.municipal.ASAM2023){const A=E.municipal.ASAM2023;D.municipios.forEach(m=>{const o=A[m.cod];if(o){m.censoDemo=m.censo;m.censo=o.potencial;m.votOf=o.votantes;m.partOf=o.participacion_pct}})}
// ---------- Ajustes (⚙️): fecha de elección, tope de gastos, IA ----------
T.ajustesHTML=()=>{const tc=T.ls("tope_cand",null)||{};const ia=Object.keys(T.IA.FUN||{}).some(k=>T.IA.on(k));
 return `<h2>⚙️ Ajustes de la campaña</h2>
 <label for="aj-fecha">Fecha de la elección</label><input type="date" id="aj-fecha" value="${H(T.fechaEleccion())}"><p class="muted small">Fecha oficial por confirmar con la Registraduría.</p>
 <label for="aj-tope">Tope de gastos de la candidata (COP)</label><input type="number" id="aj-tope" min="0" value="${T.topeCandidato()}"><label for="aj-tfu">Fuente del tope</label><input type="text" id="aj-tfu" value="${H(tc.fuente||C.finanzas.fuenteTope)}"><p class="muted small">Pendiente de resolución CNE. Se usa el valor que pongas aquí, sin dividir el de la lista.</p>
 <label class="ck"><input type="checkbox" id="aj-ia" ${ia?"checked":""}><span> Asistente de IA encendido (puedes apagarlo cuando quieras)</span></label>
 <button class="btn pri" id="aj-ok" type="button" style="width:100%;margin-top:10px">Guardar ajustes</button>`};
T.onClick("#ajustes,#tope-ed",()=>{const m=T.modal(T.ajustesHTML());m.querySelector("#aj-ok").onclick=()=>{const f=m.querySelector("#aj-fecha").value,tp=+m.querySelector("#aj-tope").value,fu=m.querySelector("#aj-tfu").value.trim();
 if(f){T.lsSet("fecha_eleccion",f);C.fechaEleccion=f}if(tp>0){T.lsSet("tope_cand",{valor:tp,fuente:fu||C.finanzas.fuenteTope});C.finanzas.fuenteTope=fu||C.finanzas.fuenteTope}
 const on=m.querySelector("#aj-ia").checked;Object.keys(T.IA.FUN||{}).forEach(k=>{if(on&&!T.IA.on(k))S.iaF[k]={on:true};if(!on)S.iaF[k]={on:false,apagada:true,por:T.ROLES[S.rol].n,t:new Date().toISOString()}});
 T.save();T.log("ajustes.campana","Fecha "+T.fechaEleccion()+" · tope "+T.cop(T.topeCandidato())+" · IA "+(on?"encendida":"apagada"));m.remove();T.toast("✓ Ajustes guardados");T.rerender()}});
{const tc=T.ls("tope_cand",null);if(tc&&tc.fuente)C.finanzas.fuenteTope=tc.fuente}
// ---------- Simpatizantes: nueva ruta #/SIMPATIZANTES (la vieja #/CRM redirige) ----------
const r0=T.render;T.render=ruta=>{ruta=ruta||"";if(/^CRM(\?|$)/.test(ruta)){const n=ruta.replace(/^CRM/,"SIMPATIZANTES");if(location.hash.replace(/^#\/?/,"")==ruta)history.replaceState(null,"","#/"+n)}
 const interna=ruta.replace(/^SIMPATIZANTES/,"CRM");r0(interna);document.querySelectorAll('#main a[href^="#/CRM"],.nav a[href^="#/CRM"]').forEach(a=>a.setAttribute("href",a.getAttribute("href").replace("#/CRM","#/SIMPATIZANTES")));
 if(interna.startsWith("CRM"))T.$("#main").dataset.ruta="SIMPATIZANTES"};
// ---------- Lenguaje claro: textos visibles sin tecnicismos ----------
const CLARO=[[/D['’]Hondt/g,"cálculo de curules (cifra repartidora)"],[/\bCRM\b/g,"base de simpatizantes"],[/k_min\s*≥\s*10|k\s*≥\s*10|k_min/g,"grupos de 10 o más personas"],[/\bRNBD\b/g,"registro de bases de datos ante la SIC"],[/\bAPI\b/g,"conexión"],[/\btoken\b/gi,"enlace de un solo uso"],[/Registro encadenado/g,"Registro a prueba de cambios"],[/Vista técnica/g,"Detalles para expertos"],[/\bhash(es)?\b/gi,"huella de verificación"],[/SHA-256/g,"Huella de verificación"]];
T.claro=t=>CLARO.reduce((s,[r,v])=>s.replace(r,v),String(t));
const limpiar=root=>{if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);
 ns.forEach(n=>{if(n.parentElement&&n.parentElement.closest("script,style,textarea,[data-tecnico],.hash,code"))return;const v=T.claro(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v});
 root.querySelectorAll("[data-info]").forEach(b=>{});};
// Citas legales del texto principal pasan al ícono ℹ️ (se conservan completas dentro del ℹ️)
const CITA=/\s*\((?:[^()]*?(?:Ley|Res\.|Resolución|Circular|art\.|arts\.|C\.P\.|Decreto|Constitución)[^()]*?)\)/g;
const citas=root=>{if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);
 ns.forEach(n=>{const p=n.parentElement;if(!p||p.closest("script,style,textarea,select,option,button,.modal,[data-tecnico],[data-legal],table,.hash,code,label"))return;const ms=n.nodeValue.match(CITA);if(!ms)return;
  n.nodeValue=n.nodeValue.replace(CITA,"");const b=document.createElement("span");b.innerHTML=T.info(ms.map(x=>x.trim().replace(/^\(|\)$/g,"")).join(" · "));n.parentNode.insertBefore(b.firstChild,n.nextSibling)})};
const r1=T.render;T.render=ruta=>{r1(ruta);const m=T.$("#main");if(!S.tecnica){limpiar(m);citas(m)}};
// En la vista técnica la huella sigue visible con su nombre
T.huella=h=>S.tecnica?`<div class="hash" data-tecnico>Huella de verificación (SHA-256): ${h}</div>`:`<div class="muted small">🔒 Huella de verificación guardada (registro a prueba de cambios)</div>`;
// ---------- Banner: el de Histórico no se superpone a «Sin permiso» ----------
const b0=T.banner;T.banner=c=>{if(c&&T.appDe(c)&&!T.puede(c))return '<div class="ficticio" role="note">Datos ficticios · demostración</div>';return b0?b0(c):null};
// ---------- Histórico: carga de mesas robusta y pestañas sin contenido cruzado ----------
if(T.HI||window.HI){}
const ah=T.after.HISTORICO;T.after.HISTORICO=()=>{ah&&ah();const el=T.$("[data-mesas-cargando]");if(el){if(window.ELECT_MESAS){T.rerender();return}
 const id=setTimeout(()=>{const e2=T.$("[data-mesas-cargando]");if(e2)e2.innerHTML='<div class="warn small" data-mesas-error>⚠ Los puestos y mesas tardan en cargar. <button class="btn sm" type="button" id="hm-reint">Reintentar</button> <label class="btn sm">Cargar archivo<input type="file" id="hm-file2" accept=".js,.json" hidden></label></div>'},8000);
 const chk=setInterval(()=>{if(!T.$("[data-mesas-cargando]")){clearInterval(chk);clearTimeout(id)}},500)}};
T.onClick("#hm-reint",()=>location.reload());
document.addEventListener("change",async e=>{if(e.target.id=="hm-file2"){try{const t=await e.target.files[0].text(),m=t.match(/window\.ELECT_MESAS\s*=\s*(\{[\s\S]*\});?\s*$/);window.ELECT_MESAS=JSON.parse(m?m[1]:t);T.toast("Puestos y mesas cargados");location.reload()}catch(er){T.toast(er.message)}}});
// «Conteo interno» del Día E no se muestra en Calidad y fuentes del Histórico
const r2=T.render;T.render=ruta=>{r2(ruta);if(/^HISTORICO\?(calidad|exp|cfg|part|tend|mapa)/.test(ruta||"")){document.querySelectorAll("#main .ficticio:not(.real),#main [data-rotulo]").forEach(x=>{if(/Conteo interno/.test(x.textContent))x.remove()})}};
// ---------- Estrategia: datos oficiales y recálculo visible ----------
T.oficialHTML=()=>{const e=T.elec();if(!e)return"";return `<div class="card" id="oficial-2023" data-oficial style="margin-top:12px"><h2>Referencia oficial · Asamblea de Boyacá 2023</h2><div class="list small">
 <div class="row b"><span>Personas habilitadas (potencial)</span><b>${fmt(e.potencial)}</b></div><div class="row b"><span>Votos válidos</span><b>${fmt(e.validos)}</b></div><div class="row b"><span>Curules</span><b data-curules>${e.curules}</b></div><div class="row b"><span>Umbral (mínimo para que la lista cuente)</span><b data-umbral>${fmt(e.umbral)}</b></div><div class="row b"><span>Cifra repartidora (votos que costó cada curul)</span><b data-cifra-of>${fmt(e.cifra)}</b></div></div><p class="muted small">Fuente: ${H(e.fuente)}.</p></div>`};
const ve=T.V.ESTRATEGIA;T.V.ESTRATEGIA=()=>{const h=ve();return /cifra/.test(T.ruta())?h+T.oficialHTML():h};
const ae=T.after.ESTRATEGIA;T.after.ESTRATEGIA=()=>{ae&&ae();document.querySelectorAll("[data-k]").forEach(i=>i.addEventListener("input",()=>{const o=T.$("#calc-out");if(!o)return;o.classList.add("recalc");let n=o.querySelector("[data-recalc]");if(!n){n=document.createElement("p");n.className="chip ok";n.dataset.recalc="";o.prepend(n)}const cu=T.$('[data-k="curules"]');n.textContent="↻ Recalculado"+(cu?" con "+cu.value+" curules":"");setTimeout(()=>o.classList.remove("recalc"),600)}))};
// ---------- Alta: avisa que la campaña de ejemplo sigue activa ----------
const va=T.V.ALTA;if(va)T.V.ALTA=()=>`<div class="warn small" data-demo-activa>ℹ️ La campaña de ejemplo (${H(C.candidato)}) sigue activa en este equipo. La nueva campaña se crea en su propio espacio y no mezcla datos.</div>`+va();
// ---------- Asesor IA: votos necesarios con el Histórico y regla del 10 % ----------
T.asesorEspecial=q=>{const n=String(q).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");const e=T.elec();
 if(e&&/cuantos votos (necesito|nos faltan|hacen falta|se necesitan)|votos necesito|votos para (ganar|entrar|una curul)/.test(n)){
  return{tipo:"respuesta",respuesta_corta:"Con el Histórico oficial de la Asamblea de Boyacá 2023: la lista necesita al menos "+fmt(e.umbral)+" votos (umbral) para contar, y cada curul costó "+fmt(e.cifra)+" votos (cifra repartidora). Primero vota la lista (debe pasar el umbral); luego, dentro de la lista, las curules van a quienes más votos preferentes sacan.",
   diagnostico:["Potencial 2023: "+fmt(e.potencial)+" personas habilitadas; votos válidos: "+fmt(e.validos)+"; "+e.curules+" curules.","Umbral = la mitad de (votos válidos ÷ curules): "+fmt(e.umbral)+" votos.","Cifra repartidora 2023: "+fmt(e.cifra)+" votos por curul."],
   recomendaciones:["Primero la lista: si no pasa el umbral, ningún candidato entra. La meta mínima de la lista es "+fmt(e.umbral)+" votos; para una curul segura, apunte a "+fmt(e.cifra)+" o más.","Luego el voto preferente: dentro de la lista, las curules se dan a quienes más votos propios sacan. Su meta personal es superar en preferentes al compañero que quedaría de último con curul.","Use la pestaña «Cifra repartidora» de Estrategia para simular con sus supuestos."],
   advertencias:["Son cifras de 2023 (Registraduría). La elección de 2027 puede cambiar."],fuentes:[e.fuente]}}
 return null};
T.asesorAvisos=(q,o)=>{if(/aport|donac|financ|plata|dinero/i.test(q)){const s=T.aportesSobreLimite();if(s.length){o.advertencias=(o.advertencias||[]).concat(s.map(x=>"⚠ "+x.n+" lleva "+T.cop(x.v)+" en aportes y supera el 10 % del tope por aportante ("+T.cop(T.topeCandidato()*0.1)+"). Es la misma regla de Finanzas."))}}};
// Chat de la IA (simulado): misma fuente y misma función de estimación
if(T.IA&&T.IA.simChat){const sc=T.IA.simChat;T.IA.simChat=q=>{const o=T.asesorEspecial(q);if(o)return o.respuesta_corta+"\n\n"+o.recomendaciones.join("\n")+"\n\n_🤖 Hecho con IA · cifras del Histórico oficial 2023._";return sc(q)}}
// ---------- Botón de ajustes en la barra ----------
document.addEventListener("DOMContentLoaded",()=>{});
{const t=document.getElementById("tema");if(t&&!document.getElementById("ajustes")){const b=document.createElement("button");b.id="ajustes";b.className="btn";b.type="button";b.setAttribute("aria-label","Ajustes de la campaña");b.title="Ajustes";b.textContent="⚙️";t.after(b)}}
})();
