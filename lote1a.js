/* Territoria v0.5 · Lote 1a: estado de relación y apoyo declarado (decisión §9), migración de datos,
   roles nuevos (013), enlaces y QR de referido (002), embudo agregado k ≥ 10, doble aprobación
   y clasificador local del E-14 (011). Todo en el navegador con datos ficticios. */
(function(){
"use strict";
const T=window.T,{C,D,S,H}=T,DIA=864e5,K=10;
// ---------- Estado de relación (nadie califica la opinión de otra persona) ----------
T.ESTADOS={referido_pendiente:"Referido pendiente",autorizado:"Autorizado",contactado:"Contactado",participa:"Participa",voluntario:"Voluntario",lider:"Líder",baja:"Baja (bloqueo total)"};
T.EST_EQUIPO=["autorizado","contactado","participa","voluntario","lider"];
T.TASAS={verificado:.4,confirmado:.8};   // voto estimado: solo agregado, tasas configurables
// ---------- Migración de datos guardados (terr03_) ----------
// Lo que antes calificaba un tercero (p.apoyo) pasa a estado_relacion según hechos verificables; NUNCA a apoyo declarado.
T.migrarPersona=p=>{if(p.estado&&!("apoyo" in p))return false;const c=p.consent||{};
 p.estado=(p.oposicion||c.estado=="revocado")?"baja":c.estado=="pendiente"?"referido_pendiente":p.apoyo=="Voluntario"?"voluntario":/^Verificado/.test(p.verif||"")?"contactado":"autorizado";
 if(p.estado=="referido_pendiente"&&!p.caduca)p.caduca=new Date(T.hoy().getTime()+30*DIA).toISOString();   // el plazo de 30 días empieza con la migración
 p.apoyoDecl=null;delete p.apoyo;return true};
{let n=0;const antes=S.personas.length;S.personas.forEach(p=>{if(T.migrarPersona(p))n++});
 S.gastos.forEach(g=>{if(g.cat=="Transporte y logística"){g.cat="Transporte del equipo (no votantes)";n++}});
 if(n){T.migracion={registros:n,personas:antes,despues:S.personas.length};const ib=T.initBit;T.initBit=async()=>{await ib();await T.log("migracion.v05",n+" registros convertidos: calificación de terceros → estado de relación (sin apoyo declarado); "+antes+" personas antes y "+S.personas.length+" después","gerente")};T.save()}}
// Persistencia de lo nuevo
S.enlaces=T.ls("enlaces",[]);S.encuestas=T.ls("encuestas",[]);S.exportaciones=T.ls("exportaciones",[]);
{const s0=T.save;T.save=()=>{s0();T.lsSet("enlaces",S.enlaces);T.lsSet("encuestas",S.encuestas);T.lsSet("exportaciones",S.exportaciones)}}
// ---------- Roles nuevos (013) ----------
Object.assign(T.ROLES,{
 abogado:{n:"Abogado(a) de reclamaciones",apps:["DIAE","CUMPLIMIENTO"],alcance:"E-14 y reclamaciones (sin simpatizantes)"},
 digitador:{n:"Digitador(a)",apps:["CRM"],nodo:T.LIDER.id,alcance:"Solo los registros que él mismo captura"},
 encuestador:{n:"Encuestador(a)",apps:["TERRITORIO"],alcance:"Solo respuestas anónimas (sin datos de personas)"}});
T.ROLES.ctestigos.alcance="Testigos, mesas y E-14";T.ROLES.testigo.alcance="Solo sus mesas";T.ROLES.contador.alcance="Finanzas (sin simpatizantes)";T.ROLES.cm.alcance="Contenido (sin simpatizantes)";
{const pv=T.personasVisibles;T.personasVisibles=()=>S.rol=="digitador"?S.personas.filter(p=>p.capturadoPor=="digitador"):S.rol=="encuestador"||S.rol=="abogado"?[]:pv()}
T.veApoyo=()=>S.rol=="juridico";                                   // apoyo individual: titular y cumplimiento
T.veE14=()=>["testigo","ctestigos","abogado","juridico"].includes(S.rol);
T.revisaE14=()=>["ctestigos","abogado"].includes(S.rol);
T.retencionE14=()=>new Date(new Date(C.fechaEleccion+"T12:00:00-05:00").getTime()+90*DIA).toISOString().slice(0,10);
T.puedeEnlace=p=>S.rol!="digitador"&&!p.oposicion&&p.consent.estado=="vigente"&&T.EST_EQUIPO.includes(p.estado);
// ---------- Gastos: categorías cerradas (011) ----------
T.CATS_GASTO=["Propaganda electoral","Transporte del equipo (no votantes)","Sedes","Administración","Actos públicos","Testigos electorales"];
T.conceptoProhibido=t=>/(transporte|traslado|buses?|acarreo|recog\w*)\s+(de\s+)?(votantes|electores)|mercados?|tejas|regalos?|pago\s+(a|por)\s+(votantes|votos?)|compra\s+de\s+votos/i.test(t);
// ---------- Clasificador local de imágenes del E-14 (011) ----------
// Heurística sin red: el E-14 es un formulario claro con texto oscuro y poco color. El certificado electoral y el tarjetón
// tienen fondos de seguridad, logos y colores. Si no distingue, va a revisión humana (nunca rechazo silencioso).
T.clasificarImagen=url=>new Promise(res=>{const i=new Image();i.onload=()=>{try{const W=64,Hh=64,c=document.createElement("canvas");c.width=W;c.height=Hh;const g=c.getContext("2d");g.drawImage(i,0,0,W,Hh);
  const d=g.getImageData(0,0,W,Hh).data;let claro=0,color=0,pastel=0,n=W*Hh;
  for(let k=0;k<d.length;k+=4){const r=d[k]/255,gg=d[k+1]/255,b=d[k+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),sat=mx?(mx-mn)/mx:0;if(mx>.85&&sat<.12)claro++;if(sat>.45&&mx>.3)color++;if(sat>=.12&&sat<.6&&mx>.8)pastel++}
  const fc=claro/n,fk=color/n,fp=pastel/n,m={claro:+fc.toFixed(2),color:+fk.toFixed(2),pastel:+fp.toFixed(2),ancho:i.width,alto:i.height};
  if(fk>.25)res({clase:"bloqueada",motivo:"Parece un tarjetón (logos y colores fuertes): Territoria no recibe fotos de votos.",m});
  else if(fp>.5&&fc<.3)res({clase:"bloqueada",motivo:"Parece un certificado electoral (fondo de seguridad de color): Territoria no recibe fotos de certificados.",m});
  else if(fc>.55&&fk<.06)res({clase:"e14",motivo:"Formulario claro con texto: compatible con un E-14.",m});
  else res({clase:"dudosa",motivo:"El clasificador no distingue si es un E-14.",m})}catch(e){res({clase:"dudosa",motivo:"No se pudo analizar la imagen.",m:{}})}};
 i.onerror=()=>res({clase:"dudosa",motivo:"No se pudo leer la imagen.",m:{}});i.src=url});
T.onClick("[data-e14rev]",t=>{const m0=S.mesas.find(x=>x.id==t.dataset.e14rev),e=m0.e14;const m=T.modal(`<h2>Revisión humana · ${H(m0.mun)} mesa ${m0.mesa}</h2>${e.img?`<img class="e14img" src="${e.img}" alt="Foto en revisión">`:""}<p class="small">El clasificador no distinguió si la foto es un E-14. Si es un certificado electoral, un tarjetón u otra imagen, recházala.</p>${T.huella(e.hash)}<div class="row" style="margin-top:10px"><button class="btn ok" id="rv-ok" type="button">✓ Es un E-14</button><button class="btn danger" id="rv-no" type="button">✗ Rechazar la foto</button></div>`);
 const fin=v=>{T.accion("diae.e14.revision",m0.id+" → "+v+" ("+T.ROLES[S.rol].n+")",()=>{e.revision=v;e.revisadoPor=S.rol;if(v=="rechazada")e.img=null;T.save()});m.remove();T.rerender()};
 m.querySelector("#rv-ok").onclick=()=>fin("aceptada");m.querySelector("#rv-no").onclick=()=>fin("rechazada")});
// ---------- Embudo agregado (decisión §9.4) ----------
T.embudo=lista=>{const n=lista.length,cel=x=>x>0&&x<K?"<"+K:x;if(n<K)return{n:"<"+K,suprimido:true};
 const pro=lista.filter(p=>p.estado=="referido_pendiente").length,ver=lista.filter(p=>["autorizado","contactado"].includes(p.estado)).length,
  conf=lista.filter(p=>p.apoyoDecl&&p.consent.estado=="vigente"&&p.consent.afinidad).length;
 const vsc=lista.filter(p=>["autorizado","contactado"].includes(p.estado)&&p.apoyoDecl&&p.consent.estado=="vigente"&&p.consent.afinidad).length;
 return{n,prometido:cel(pro),verificado:cel(ver),confirmado:cel(conf),voto:T.votoEstimado(ver,conf,vsc)}};
// v0.6: voto estimado sin doble conteo (verificados que no declararon × tasa + confirmados × tasa); solo sobre agregados.
T.votoEstimado=(ver,conf,verConf)=>Math.round(Math.max(0,ver-(verConf??Math.min(ver,conf)))*T.TASAS.verificado+conf*T.TASAS.confirmado);
T.embudoHTML=()=>{const l=T.personasVisibles().filter(p=>p.estado!="baja"),e=T.embudo(l);
 return `<div class="card" id="embudo-rel" style="margin-top:14px"><h2>Embudo por estado de relación ${T.alcance()?"(tu red)":"(campaña)"}</h2>${e.suprimido?`<p class="muted small" data-k>Menos de ${K} personas: no se muestra el detalle (k ≥ ${K}).</p>`:`<div class="kpis"><div class="kpi"><div class="l">Prometido · referido pendiente</div><div class="v">${e.prometido}</div></div><div class="kpi"><div class="l">Verificado · autorizado + contactado</div><div class="v">${e.verificado}</div></div><div class="kpi"><div class="l">Confirmado · apoyo declarado por el titular</div><div class="v">${e.confirmado}</div></div><div class="kpi"><div class="l">Voto estimado (agregado)</div><div class="v">${T.fmt(e.voto)}</div></div></div>`}
 <p class="muted small">Conteos de ${K} o más personas; nunca por persona. Voto estimado = verificados que no declararon × ${T.TASAS.verificado} + confirmados × ${T.TASAS.confirmado} (tasas configurables, sin doble conteo). El apoyo lo declara solo el titular, con autorización aparte para dato sensible.</p></div>`};
// ---------- Enlaces y QR de referido (002) ----------
const hex=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(x=>x.toString(16).padStart(2,"0")).join("");
T.crearEnlace=async(nodo,persona)=>{const a=T.alcance();if(a&&!a.has(nodo))throw new Error("Solo creas enlaces para tu propia red");const tok=hex(18);
 S.enlaces.push({h:await T.sha(tok),nodo,persona:persona?persona.id:null,creado:new Date().toISOString(),vence:new Date(Date.now()+30*DIA).toISOString(),regs:[]});T.save();
 T.log("referido.enlace","Enlace de "+(persona?"simpatizante "+persona.id:"nodo "+nodo)+" · vence en 30 días");return tok};
T.urlEnlace=tok=>location.href.split("#")[0]+"#/r/"+tok;
T.qrReal=txt=>{try{const q=window.qrcode(0,"M");q.addData(txt);q.make();return `<div class="qrbox" data-qr>${q.createSvgTag({cellSize:4,margin:2,scalable:true})}</div>`}catch(e){return '<p class="muted small">QR no disponible</p>'}};
T.modalEnlace=async(nodo,persona)=>{const l=D.red.find(n=>n.id==nodo);const tok=await T.crearEnlace(nodo,persona),url=T.urlEnlace(tok);
 T.modal(`<h2>${persona?"Enlace propio de "+H(persona.nombre):"Enlace y QR de "+H(l.nombre)}</h2><p class="muted small">${H(l.rol)} · ${H(l.mun)}. Vence en 30 días. En la base solo queda la huella del token.</p>${T.qrReal(url)}<input type="text" readonly id="enl-url" value="${H(url)}" aria-label="Enlace de referido" style="width:100%"><div class="row" style="margin-top:8px"><button class="btn sm" id="enl-cp" type="button">Copiar enlace</button><a class="btn sm" href="${H(url)}" id="enl-abrir">Abrir el formulario</a></div><p class="small">Quien se registra queda <b>pendiente</b> y no entra a ninguna audiencia hasta confirmar con el código que llega a su celular. Si no confirma en 30 días, se purga.</p>`);
 const b=document.getElementById("enl-cp");b&&(b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(url).catch(()=>{});T.toast("Enlace copiado")})};
T.clicks["#qr"]=()=>T.modalEnlace(T.nodoRol()||T.LIDER.id,null);
// Registro público por enlace: #/r/<token>
const PUB=/^r\/([0-9a-f]{36})$/;
T.registroHTML=en=>{if(!en)return `<section class="hero" id="reg-pub"><h1>Enlace no válido</h1><p class="sub">Este enlace no existe o fue retirado.</p></section>`;
 if(new Date(en.vence)<new Date())return `<section class="hero" id="reg-pub"><h1>Enlace vencido</h1><p class="sub">Los enlaces de referido duran 30 días. Pide uno nuevo a quien te lo compartió.</p></section>`;
 const l=D.red.find(n=>n.id==en.nodo),quien=en.persona?(S.personas.find(p=>p.id==en.persona)||{nombre:"un simpatizante"}).nombre.split(" ")[0]:l.nombre.split(" ")[0];
 return `<section class="card" id="reg-pub" style="max-width:640px;margin:0 auto"><h1>Únete a la campaña de ${H(C.candidato.split(" ")[0])}</h1><p class="sub">Te invitó ${H(quien)} (${H(l.mun)}).</p>
 <label for="rp-n">Nombre completo</label><input type="text" id="rp-n" autocomplete="name"><label for="rp-t">Celular</label><input type="tel" id="rp-t" inputmode="numeric" placeholder="3001234567"><label for="rp-m">Municipio</label><select class="f" id="rp-m">${D.municipios.map(x=>`<option ${x.n==l.mun?"selected":""}>${H(x.n)}</option>`).join("")}</select>${T.avisoHTML()}
 <label class="ck"><input type="checkbox" id="rp-c0"> Declaro que soy mayor de 18 años.</label><label class="ck"><input type="checkbox" id="rp-c1"> Autorizo el tratamiento de mis datos de contacto para las finalidades informadas (obligatorio).</label>
 <fieldset class="canales"><legend class="small"><b>¿Por dónde aceptas que te contactemos?</b></legend><label class="ck"><input type="checkbox" id="rp-cw"> WhatsApp</label><label class="ck"><input type="checkbox" id="rp-cs"> SMS</label><label class="ck"><input type="checkbox" id="rp-cl"> Llamada</label><label class="ck"><input type="checkbox" id="rp-cc"> Correo</label></fieldset>
 <fieldset class="canales"><legend class="small"><b>Dato sensible (facultativo)</b></legend><label class="ck"><input type="checkbox" id="rp-s"> Autorizo de forma explícita el tratamiento de mi opinión política (dato sensible; Ley 1581, art. 6). No es obligatorio.</label><label class="ck"><input type="checkbox" id="rp-a" disabled> Declaro que apoyo esta candidatura (solo si marcaste la casilla anterior). Puedo retirarlo cuando quiera.</label></fieldset>
 <button class="btn pri" id="rp-g" type="button" style="width:100%;margin-top:10px">Registrarme</button><div id="rp-out" class="small" style="margin-top:10px"></div></section>`};
const r0=T.render;T.render=ruta=>{const mm=PUB.exec(ruta||"");if(!mm)return r0(ruta);
 T.sha(mm[1]).then(h=>{const en=S.enlaces.find(e=>e.h==h);const el=T.$("#main");el.innerHTML='<div class="ficticio" role="note">Datos ficticios · demostración</div>'+T.registroHTML(en);el.dataset.vista="REGISTRO";window.scrollTo(0,0);if(en&&new Date(en.vence)>=new Date())T.afterRegistro(en)})};
T.afterRegistro=en=>{const q=s=>document.querySelector(s);q("#rp-s").onchange=e=>{q("#rp-a").disabled=!e.target.checked;if(!e.target.checked)q("#rp-a").checked=false};
 q("#rp-g").onclick=async()=>{const n=q("#rp-n").value.trim(),t=q("#rp-t").value.replace(/\D/g,"");const out=q("#rp-out");
  if(n.length<3||t.length!=10){T.toast("Revisa el nombre y el celular (10 dígitos)");return}if(!q("#rp-c0").checked){T.toast("Solo se registran mayores de 18 años");return}if(!q("#rp-c1").checked){T.toast("Sin autorización no se puede registrar (Ley 1581)");return}
  const recientes=en.regs.filter(x=>Date.now()-x<10*60*1000);if(recientes.length>=5){T.toast("Demasiados registros seguidos con este enlace: intenta más tarde");return}   // límite de tasa (en producción, en el Worker)
  if(S.noContactar.includes(await T.sha(t))){T.toast("Este número pidió no ser contactado");return}
  const l=D.red.find(x=>x.id==en.nodo),mu=D.municipios.find(x=>x.n==q("#rp-m").value),codigo=String(100000+Math.floor(Math.random()*899999));
  const p={id:"P"+(5000+S.personas.length),nombre:n,tel:t,cedula:null,mun:mu.n,prov:mu.p,vereda:"Por declarar",puesto:"Por declarar",mesa:"—",verif:"Declarado por el titular",estado:"referido_pendiente",caduca:new Date(Date.now()+30*DIA).toISOString(),apoyoDecl:null,refPor:en.persona,oposicion:false,mayor:true,lider:en.nodo,origen:en.persona?"Enlace de simpatizante":"Enlace del líder",capturadoPor:"titular",
   consent:{estado:"pendiente",contacto:true,afinidad:q("#rp-s").checked,whatsapp:q("#rp-cw").checked,sms:q("#rp-cs").checked,llamada:q("#rp-cl").checked,correo:q("#rp-cc").checked,canal:"Enlace de referido",fecha:new Date().toISOString(),version:C.privacidad.version,hash:null},
   _otp:await T.sha(codigo),_apoyo:q("#rp-s").checked&&q("#rp-a").checked};
  en.regs.push(Date.now());S.personas.unshift(p);T.capturar&&T.capturar(p,"enlace");T.save();T.log("referido.pendiente",p.id+" se registró por enlace ("+l.mun+"); pendiente hasta confirmar","titular");
  out.innerHTML=`<p class="warn">Quedaste <b>pendiente</b>. Te enviamos un código al celular (simulado en la demo: <b data-otp>${codigo}</b>).</p><label for="rp-o">Código</label><input type="text" id="rp-o" inputmode="numeric"><button class="btn ok" id="rp-ok" type="button" style="margin-top:8px">Confirmar</button>`;
  q("#rp-ok").onclick=async()=>{if(await T.sha(q("#rp-o").value.trim())!==p._otp){T.toast("Código incorrecto");return}
   p.consent.estado="vigente";p.consent.canal="Enlace de referido + código al celular";p.estado="autorizado";delete p.caduca;
   if(p._apoyo&&p.consent.afinidad)p.apoyoDecl={fecha:new Date().toISOString(),canal:"Formulario del titular",evidencia:"Casilla aparte, no premarcada"};delete p._otp;delete p._apoyo;T.save();
   T.log("referido.autorizado",p.id+" confirmó con código"+(p.apoyoDecl?"; declaró su apoyo (dato sensible autorizado)":""),"titular");out.innerHTML='<p class="ok" data-confirmado>✓ ¡Listo! Tu registro quedó autorizado. Puedes revocarlo cuando quieras en el canal de derechos.</p>'}}};
// Purga de referidos vencidos (> 30 días sin autorizar)
T.vencidos=()=>S.personas.filter(p=>p.estado=="referido_pendiente"&&p.caduca&&new Date(p.caduca)<T.hoy());
T.purgarReferidos=()=>{const v=T.vencidos();if(!v.length)return 0;S.personas=S.personas.filter(p=>!v.includes(p));T.save();T.log("referido.purga",v.length+" referidos sin autorizar en 30 días eliminados (solo queda el conteo)");return v.length};
// Grafo «quién trae a quién»: pendientes y autorizados separados
T.grafoHTML=()=>{const l=T.personasVisibles(),ids=new Set(l.map(p=>p.id));const ref=l.filter(p=>p.refPor&&ids.has(p.refPor));const pend=ref.filter(p=>p.estado=="referido_pendiente"),aut=ref.filter(p=>!["referido_pendiente","baja"].includes(p.estado));
 const por={};ref.forEach(p=>{(por[p.refPor]=por[p.refPor]||{a:[],p:[]})[p.estado=="referido_pendiente"?"p":"a"].push(p)});const top=Object.entries(por).sort((x,y)=>(y[1].a.length+y[1].p.length)-(x[1].a.length+x[1].p.length)).slice(0,8);
 const nom=id=>{const x=S.personas.find(p=>p.id==id);return x?x.nombre:"—"};
 return `<div class="card" id="grafo-ref" style="margin-top:14px"><h2>Quién trae a quién</h2><div class="row" style="flex-wrap:wrap"><span class="chip ok" data-g="aut">${aut.length} autorizados</span><span class="chip wa" data-g="pend">${pend.length} pendientes (no entran a audiencias)</span></div>
 <div class="grafo">${top.map(([id,g])=>`<div class="gnodo"><b>${H(nom(id))}</b><div class="gh">${g.a.map(x=>`<span class="gpunto ok" title="Autorizado">${H(T.ini(x.nombre))}</span>`).join("")}${g.p.map(x=>`<span class="gpunto pend" title="Pendiente">${H(T.ini(x.nombre))}</span>`).join("")}</div></div>`).join("")||'<p class="muted small">Aún no hay referidos en tu red.</p>'}</div>
 <p class="muted small">Verde: autorizó con código. Punteado: pendiente (caduca a los 30 días). Solo personas de tu alcance.</p></div>`};
{const v0=T.V.RED;T.V.RED=()=>v0()+T.embudoHTML()+T.grafoHTML()}
{const v0=T.V.TABLERO;if(v0)T.V.TABLERO=()=>v0()+(/\?/.test(T.ruta())?"":T.embudoHTML())}
// ---------- Digitador: ficha mínima; encuestador: encuesta anónima ----------
{const f0=T.clicks["[data-p]"];T.clicks["[data-p]"]=(t,e)=>{if(S.rol!="digitador")return f0(t,e);const p=S.personas.find(x=>x.id==t.dataset.p);if(!p)return;
 T.modal(`<h2>${H(p.nombre)}</h2><p class="small">${H(p.mun)} · ${H(T.ESTADOS[p.estado]||p.estado)}</p><p class="muted small">El digitador solo captura y consulta lo que él registró. No contacta, no exporta y no suprime.</p>`)}}
{const v0=T.V.TERRITORIO,a0=T.after.TERRITORIO;
 T.V.TERRITORIO=()=>S.rol!="encuestador"?v0():`<h1>Encuesta anónima</h1><p class="sub">Registra respuestas sin nombre, teléfono ni cédula. No ves simpatizantes.</p><div class="card" id="enc"><label for="en-m">Municipio</label><select class="f" id="en-m">${D.municipios.map(x=>`<option>${H(x.n)}</option>`).join("")}</select><label for="en-p">Pregunta</label><select class="f" id="en-p"><option>¿Cuál es el principal problema de su municipio?</option><option>¿Qué tema debería priorizar la Asamblea?</option></select><label for="en-r">Respuesta</label><input type="text" id="en-r"><button class="btn pri" id="en-g" type="button" style="width:100%;margin-top:10px">Guardar respuesta</button><p class="muted small" id="en-n">${S.encuestas.length} respuestas registradas (anónimas).</p></div>`;
 T.after.TERRITORIO=()=>{if(S.rol!="encuestador")return a0&&a0();T.$("#en-g").onclick=()=>{const r=T.$("#en-r").value.trim();if(!r){T.toast("Escribe la respuesta");return}if(/\b3\d{9}\b|\d{6,}/.test(r)){T.toast("No escribas teléfonos ni documentos: la encuesta es anónima");return}
  T.accion("encuesta.respuesta",T.$("#en-m").value+" · respuesta anónima",()=>{S.encuestas.push({mun:T.$("#en-m").value,p:T.$("#en-p").value,r,t:new Date().toISOString()});T.save()});T.rerender()}}}
// ---------- Cumplimiento: exportación con doble aprobación, purga y matriz ----------
const APRUEBAN=["candidato","gerente","juridico"];
T.exportCardHTML=()=>{if(!APRUEBAN.includes(S.rol))return "";const v=T.vencidos().length;
 return `<div class="card" id="exp-apoyo" style="margin-top:14px"><h2>Exportar apoyo declarado (doble aprobación)</h2><p class="muted small">El apoyo declarado es dato sensible: exportarlo exige dos aprobaciones de personas distintas a quien lo pide (candidata, gerente o cumplimiento). Se descarga una sola vez y queda en el registro.</p>
 <div class="list small">${S.exportaciones.map(x=>`<div class="row b"><span>${H(x.id)} · pide ${H(T.ROLES[x.por].n)} · aprobaciones: ${x.ap.map(r=>H(T.ROLES[r].n)).join(", ")||"ninguna"}</span><span>${x.usada?'<span class="chip">Descargada</span>':x.ap.length>=2&&x.por==S.rol?`<button class="btn sm ok" data-expd="${x.id}" type="button">Descargar</button>`:x.por!=S.rol&&!x.ap.includes(S.rol)&&x.ap.length<2?`<button class="btn sm" data-expa="${x.id}" type="button">Aprobar</button>`:'<span class="chip wa">Esperando aprobación</span>'}</span></div>`).join("")||'<span class="muted">Sin solicitudes.</span>'}</div>
 <button class="btn" id="exp-n" type="button" style="margin-top:8px">Solicitar exportación</button>
 <h2 style="margin-top:14px">Referidos vencidos</h2><p class="small"><span data-vencidos>${v}</span> referidos llevan más de 30 días sin autorizar.</p>${S.rol=="juridico"&&v?'<button class="btn danger sm" id="purga" type="button">Purgar referidos vencidos</button>':""}</div>`};
{const v0=T.V.CUMPLIMIENTO;T.V.CUMPLIMIENTO=()=>{const h=v0();const i=h.lastIndexOf('<p class="muted small" style="margin-top:10px">Demostración');return i>0?h.slice(0,i)+T.exportCardHTML()+h.slice(i):h+T.exportCardHTML()}}
T.onClick("#exp-n",()=>{const m=T.modal(`<h2>Solicitar exportación de apoyo declarado</h2><label for="ex-m">Motivo (mínimo 20 caracteres)</label><textarea id="ex-m" rows="3"></textarea><button class="btn pri" id="ex-g" type="button" style="width:100%;margin-top:10px">Solicitar</button>`);
 m.querySelector("#ex-g").onclick=()=>{const mo=m.querySelector("#ex-m").value.trim();if(mo.length<20){T.toast("Explica el motivo (mínimo 20 caracteres)");return}const x={id:"EX-"+(S.exportaciones.length+1),por:S.rol,motivo:mo,ap:[],usada:false};T.accion("exportacion.solicitud",x.id+": "+mo,()=>{S.exportaciones.push(x);T.save()});m.remove();T.rerender()}});
T.onClick("[data-expa]",t=>{const x=S.exportaciones.find(y=>y.id==t.dataset.expa);if(!x||x.por==S.rol||x.ap.includes(S.rol)){T.toast("La aprobación debe venir de una persona distinta");return}T.accion("exportacion.aprobacion",x.id+" aprobada por "+T.ROLES[S.rol].n,()=>{x.ap.push(S.rol);T.save()});T.rerender()});
T.onClick("[data-expd]",t=>{const x=S.exportaciones.find(y=>y.id==t.dataset.expd);if(!x||x.usada||x.ap.length<2||x.por!=S.rol){T.toast("Exportar apoyo declarado exige doble aprobación");return}
 const rows=[["persona_id","fecha","canal"]].concat(S.personas.filter(p=>p.apoyoDecl).map(p=>[p.id,p.apoyoDecl.fecha,p.apoyoDecl.canal]));T.descargar("apoyo_declarado_"+x.id+".csv","\ufeff"+rows.map(r=>r.join(";")).join("\r\n"),"text/csv;charset=utf-8");
 T.accion("exportacion.apoyo_declarado",x.id+" descargada ("+(rows.length-1)+" filas)",()=>{x.usada=true;T.save()});T.rerender()});
T.onClick("#purga",()=>{const n=T.purgarReferidos();T.toast(n+" referidos vencidos purgados");T.rerender()});
})();
