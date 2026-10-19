/* Territoria v0.2 · núcleo: estado, utilidades, roles, bitácora, cola sin conexión, router */
(function(){
"use strict";
const C=window.CONFIG,D=window.DATA,P=C.prefijo;
const T=window.T={C,D,V:{},APPS:[]};
T.$=s=>document.querySelector(s);
T.H=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
T.fmt=n=>Number(Math.round(n)).toLocaleString("es-CO");T.pct=(a,b)=>b?Math.round(a/b*100):0;T.ini=n=>n.split(" ").slice(0,2).map(x=>x[0]).join("");
T.cop=n=>"$ "+T.fmt(n);
const ld=(k,d)=>{try{const v=localStorage.getItem(P+k);return v?JSON.parse(v):d}catch(e){return d}},sv=(k,v)=>{try{localStorage.setItem(P+k,JSON.stringify(v))}catch(e){}};
const clone=x=>JSON.parse(JSON.stringify(x));
const S=T.S={rol:ld("rol","candidato"),tema:ld("tema","oscuro"),offline:ld("offline",false),tecnica:ld("tecnica",false),cola:ld("cola",[]),bit:ld("bit",null),decl:ld("decl",{}),
 personas:ld("personas",null)||clone(D.personas),piezas:ld("piezas",null)||clone(D.piezas),mesas:ld("mesas",null)||clone(D.mesas),solicitudes:ld("solicitudes",null)||clone(D.solicitudes),
 aportes:ld("aportes",null)||clone(D.aportes),gastos:ld("gastos",null)||clone(D.gastos),noContactar:ld("noContactar",[]),propuesta:ld("propuesta",[]),chat:ld("chat",[]),docs:ld("docs",[]),borrador:ld("borrador",null),pres:ld("pres",null)};
T.save=()=>{["rol","tema","offline","tecnica","cola","bit","decl","personas","piezas","mesas","solicitudes","aportes","gastos","noContactar","propuesta","chat","docs","borrador","pres"].forEach(k=>sv(k,S[k]))};
T.reset=()=>{Object.keys(localStorage).filter(k=>k.startsWith(P)&&!/ia_/.test(k)).forEach(k=>localStorage.removeItem(k))};
T.ls=ld;T.lsSet=sv;
// Fecha de la demo (escenario fijo) y calendario
T.hoy=()=>new Date(C.fechaDemo+"T10:00:00-05:00");T.hoyISO=()=>C.fechaDemo;
T.fecha=iso=>new Date(iso.length==10?iso+"T12:00:00-05:00":iso).toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric",timeZone:"America/Bogota"});
T.fechaHora=iso=>new Date(iso).toLocaleString("es-CO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"America/Bogota"});
// Festivos de Colombia 2027 (Ley 51 de 1983; por verificar)
const FEST=["2027-01-01","2027-01-11","2027-03-22","2027-03-25","2027-03-26","2027-05-01","2027-05-10","2027-05-31","2027-06-07","2027-07-05","2027-07-20","2027-08-07","2027-08-16","2027-10-18","2027-11-01","2027-11-15","2027-12-08","2027-12-25"];
T.sumarHabiles=(iso,n)=>{const d=new Date(iso+"T12:00:00");let k=0;while(k<n){d.setDate(d.getDate()+1);const w=d.getDay(),s=d.toISOString().slice(0,10);if(w&&w!=6&&!FEST.includes(s))k++}return d.toISOString().slice(0,10)};
T.habilesEntre=(a,b)=>{const d=new Date(a+"T12:00:00"),e=new Date(b+"T12:00:00");let k=0;const sg=d<=e?1:-1;while(d.toISOString().slice(0,10)!=e.toISOString().slice(0,10)){d.setDate(d.getDate()+sg);const w=d.getDay(),s=d.toISOString().slice(0,10);if(w&&w!=6&&!FEST.includes(s))k+=sg}return k};
T.plazo=tipo=>tipo=="Consulta"?10:15;  // Ley 1581, arts. 14 y 15
// SHA-256 (WebCrypto o respaldo JS)
T.sha=async bytes=>{try{if(crypto&&crypto.subtle){const b=await crypto.subtle.digest("SHA-256",typeof bytes=="string"?new TextEncoder().encode(bytes):bytes);return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}}catch(e){}return window.sha256hex(typeof bytes=="string"?bytes:new Uint8Array(bytes))};
// Bitácora encadenada (precargada con eventos ficticios)
T.log=async(accion,detalle,rol,t)=>{const prev=S.bit.length?S.bit[S.bit.length-1].hash:"0".repeat(64);const e={t:t||new Date().toISOString(),rol:rol||S.rol,accion,detalle,prev};e.hash=await T.sha(prev+e.t+e.rol+e.accion+e.detalle);S.bit.push(e);T.save();return e};
T.verificar=async()=>{let prev="0".repeat(64);for(const e of S.bit){const h=await T.sha(prev+e.t+e.rol+e.accion+e.detalle);if(e.prev!==prev||h!==e.hash)return false;prev=e.hash}return true};
T.initBit=async()=>{if(S.bit)return;S.bit=[];for(const [t,r,a,d] of D.bitacora)await T.log(a,d,r,new Date(t).toISOString())};
// Cola sin conexión
T.enLinea=()=>!S.offline&&navigator.onLine!==false;
T.accion=(tipo,desc,fn)=>{fn();if(T.enLinea()){T.log(tipo,desc);T.toast("✓ Guardado")}else{S.cola.push({tipo,desc,t:new Date().toISOString()});T.save();T.pintaSync();T.toast("Sin señal: guardado en el celular · "+S.cola.length+" pendiente(s)")}};
T.sincronizar=async()=>{if(!S.cola.length)return;const n=S.cola.length;for(const it of S.cola)await T.log("sync."+it.tipo,it.desc+" (capturado sin señal "+T.fechaHora(it.t)+")");S.cola=[];T.save();T.pintaSync();T.toast("✓ "+n+" registro(s) enviados al servidor (simulado)")};
T.pintaSync=()=>{const b=T.$("#sync");if(!b)return;const on=T.enLinea();b.className="chip sync"+(on?"":" off");b.innerHTML='<span class="dot"></span><span class="lbl">'+(on?"Con señal":"Sin señal")+'</span>'+(S.cola.length?'<span class="q">'+S.cola.length+' por enviar</span>':'<span class="lbl"> · al día</span>');b.setAttribute("aria-label",(on?"Con señal":"Sin señal")+", "+S.cola.length+" por enviar. Tocar para simular "+(on?"sin señal":"con señal"))};
// UI
let tt;T.toast=m=>{const t=T.$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2800)};
T.modal=(html,opt)=>{const m=document.createElement("div");m.className="modal";m.innerHTML='<div class="card'+(opt&&opt.wide?" wide":"")+'" role="dialog" aria-modal="true">'+html+(opt&&opt.noClose?"":'<div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn" data-x type="button">Cerrar</button></div>')+'</div>';m.addEventListener("click",e=>{if((!opt||!opt.noClose)&&(e.target===m||e.target.closest("[data-x]")))m.remove()});document.body.appendChild(m);const f=m.querySelector("input,select,textarea,button");f&&f.focus();return m};
T.descargar=(nombre,contenido,tipo)=>{const b=contenido instanceof Blob?contenido:new Blob([contenido],{type:tipo||"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=nombre;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
T.huella=h=>S.tecnica?`<div class="hash">SHA-256: ${h}</div>`:`<div class="muted small">🔒 Huella digital guardada (registro a prueba de alteraciones)</div>`;
// Roles y permisos (matriz)
const LIDER=D.red.find(n=>n.rol=="Líder"&&n.mun=="Paipa"&&D.red.some(x=>x.padre==n.id))||D.red.find(n=>n.rol=="Líder");
const CMUN=D.red.find(n=>n.rol=="Coordinador municipal"&&n.mun=="Paipa")||D.red.find(n=>n.rol=="Coordinador municipal");
T.LIDER=LIDER;T.CMUN=CMUN;
T.ROLES={candidato:{n:"Candidata",apps:"*"},gerente:{n:"Gerente de campaña",apps:"*"},contador:{n:"Contador(a)",apps:["FINANZAS","CUMPLIMIENTO"]},cm:{n:"Community manager",apps:["CONTENIDO","IA","TABLERO"]},juridico:{n:"Jurídico y cumplimiento",apps:["CUMPLIMIENTO","DIAE","CRM"]},
 ctestigos:{n:"Coordinador de testigos",apps:["DIAE","TERRITORIO"]},coordmun:{n:"Coord. municipal ("+CMUN.mun+")",apps:["RED","CRM","TERRITORIO"],nodo:CMUN.id},lider:{n:"Líder ("+LIDER.mun+")",apps:["RED","CRM","TERRITORIO"],nodo:LIDER.id},testigo:{n:"Testigo electoral",apps:["DIAE"]}};
T.puede=a=>{const r=T.ROLES[S.rol];return r.apps==="*"||r.apps.includes(a)};
T.nodoRol=()=>T.ROLES[S.rol].nodo||null;
T.subarbol=id=>{const out=[D.red.find(n=>n.id==id)];const r=p=>D.red.filter(n=>n.padre==p).forEach(n=>{out.push(n);r(n.id)});r(id);return out};
T.alcance=()=>{const n=T.nodoRol();return n?new Set(T.subarbol(n).map(x=>x.id)):null};  // null = sin restricción
T.personasVisibles=()=>{const a=T.alcance();return S.personas.filter(p=>!a||a.has(p.lider))};
// Apps
T.APPS=[["TABLERO","📊","Tablero de la candidata","Embudo de votos y alertas"],["ESTRATEGIA","🎯","Meta y cifra repartidora","Calculadora de curules y preferentes"],["RED","🌳","Red de líderes","Árbol, ranking y promesas vs. verificados"],["CRM","👥","Simpatizantes","Fichas, autorizaciones y derechos"],["TERRITORIO","🗺️","Mapa de Boyacá","123 municipios, avance y potencial"],["CONTENIDO","🎬","Centro de redes","Compositor, aprobación y calendario"],["IA","🤖","Asistente IA","Contenido, propuestas, documentos y chat"],["DIAE","🗳️","Día electoral","Testigos, E-14 y reclamaciones"],["FINANZAS","💰","Finanzas y Cuentas Claras","Fuentes, topes y exportación"],["CUMPLIMIENTO","🛡️","Cumplimiento","Ley 1581, solicitudes y bitácora"]];
T.ROADMAP=[["VOLUNTARIOS","🙋","Voluntariado","Tareas, turnos, puerta a puerta e insignias sin premios."],["EVENTOS","📅","Agenda y eventos","Agenda con tiempos entre municipios y asistencia por QR."],["COMUNICACIONES","💬","Mensajes","SMS, correo y WhatsApp oficial solo con autorización."],["ESCUCHA","👂","Escucha de redes","Menciones y alertas de bulos con fuentes oficiales (fase 2)."],["ENCUESTAS","📝","Encuestas internas","Anónimas y de uso interno, no publicables."],["ADMIN","⚙️","Administración multi-campaña","Campañas aisladas, planes, alta y cierre con borrado."]];
T.appDe=c=>T.APPS.find(a=>a[0]==c)||T.ROADMAP.find(a=>a[0]==c);
// Router
let actual="";T.ruta=()=>actual;T.rerender=()=>T.render(actual);
T.render=ruta=>{actual=ruta||"";const c=actual.split("?")[0];const el=T.$("#main");let html;const a=T.appDe(c);
 if(!c||!a)html=T.V.inicio();else if(!T.puede(c))html=`<section class="hero"><h1>🔒 Sin permiso</h1><p class="sub">El rol <b>${T.H(T.ROLES[S.rol].n)}</b> no tiene acceso a «${T.H(a[2])}». Cada rol ve solo lo que necesita para su trabajo.</p><a class="btn" href="#/">← Inicio</a></section>`;
 else html=T.V[c]?T.V[c]():`<section class="hero"><span class="chip">Hoja de ruta</span><h1>${a[1]} ${T.H(a[2])}</h1><p class="sub">${T.H(a[3])}</p><a class="btn" href="#/">← Inicio</a></section>`;
 el.innerHTML='<div class="ficticio" role="note">Datos ficticios · demostración</div>'+html;el.dataset.vista=(c&&a)?c:"inicio";window.scrollTo(0,0);
 document.querySelectorAll(".nav a").forEach(x=>x.classList.toggle("on",x.getAttribute("href")=="#/"+c));
 const h=T.after[c];h&&T.puede(c)&&h()};
T.after={};
T.clicks={};T.onClick=(sel,fn)=>{T.clicks[sel]=fn};
document.addEventListener("click",e=>{for(const sel in T.clicks){const t=e.target.closest(sel);if(t){T.clicks[sel](t,e);return}}});
})();
