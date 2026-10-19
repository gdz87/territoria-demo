/* Territoria v0.7 · Lote 1c.
   007 Divipole: 123 municipios DIVIPOLA y autoasignación por la dirección declarada (la dirección no se guarda; sin puestos inventados) ·
   008 portal «Mis datos» del titular: revocar en ≤ 3 clics, plazos de 10 y 15 días hábiles con festivos 2026-2027 ·
   009 carta de IA responsable y registro de cada uso de IA (sin el texto consultado) ·
   012 asistente de alta de 6 pasos (campaña lista en ≤ 72 h) y modo presentación con datos de Boyacá.
   Regla de producción: fase1/db/schema.sql (v0.7) y fase1/worker/src/titular.js. */
(function(){
"use strict";
const T=window.T,{C,D,S,H}=T,fmt=T.fmt,DIA=864e5,BASE=window.TERR_BASE||C.prefijo,ALTA=window.TERR_ALTA||null;
const shaSync=s=>window.sha256hex(new TextEncoder().encode(String(s)));
const hex=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(x=>x.toString(16).padStart(2,"0")).join("");
const norm=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
// ---------- Estado persistente (prefijo terr03_ conservado) ----------
S.titTokens=T.ls("titTokens",[]);S.iaUsos=T.ls("iaUsos",[]);
{const s0=T.save;T.save=()=>{s0();["titTokens","iaUsos"].forEach(k=>T.lsSet(k,S[k]))}}
// ---------- Calendario hábil colombiano 2026-2027 (misma tabla que app.festivos) ----------
const FEST=new Map((window.DIVIPOLE_CO||{festivos:[]}).festivos);T.FESTIVOS=FEST;
const ANIOS=new Set([...FEST.keys()].map(f=>f.slice(0,4)));
const cubre=iso=>{if(!ANIOS.has(iso.slice(0,4)))throw new Error("No hay calendario de festivos cargado para "+iso.slice(0,4)+": cárgalo antes de calcular plazos")};
T.esHabil=iso=>{const w=new Date(iso+"T12:00:00Z").getUTCDay();return w!=0&&w!=6&&!FEST.has(iso)};
const mas1=(iso,s)=>{const d=new Date(iso+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+s);return d.toISOString().slice(0,10)};
T.sumarHabiles=(iso,n)=>{let x=iso.slice(0,10),k=0;while(k<n){x=mas1(x,1);cubre(x);if(T.esHabil(x))k++}return x};
T.habilesEntre=(a,b)=>{a=a.slice(0,10);b=b.slice(0,10);const sg=a<=b?1:-1;let x=a,k=0;while(x!=b){x=mas1(x,sg);cubre(x);if(T.esHabil(x))k++}return k*sg};
T.prorroga=tipo=>tipo=="Consulta"?5:8;   // Ley 1581, arts. 14 y 15
T.plazoArco=(tipo,desde)=>{const n=T.plazo(tipo),v=T.sumarHabiles(desde,n);return{dias:n,vence:v,prorroga:T.sumarHabiles(v,T.prorroga(tipo))}};
{const t0=T.tablaSolicitudes;T.tablaSolicitudes=()=>{try{return t0()+'<p class="muted small" data-calendario>Días hábiles con el calendario colombiano 2026-2027 (Ley 51 de 1983 y Ley 2578 de 2026; '+FEST.size+' festivos). Prórroga: +5 días hábiles en consultas y +8 en reclamos, avisando al titular.</p>'}
 catch(e){return `<div class="card warn" data-calendario-falta><b>⚠ ${H(e.message)}</b></div>`}}}
// ---------- 007 · Divipole: municipio por la dirección declarada ----------
const MUN=window.MUNICIPIOS_BOY.map(([cod,n])=>({cod,n}));T.DIVIPOLE={municipios:MUN.length,puestos:0,fuente:"DANE · DIVIPOLA (datos.gov.co gdxc-w37w, consultado 18-oct-2026)"};
const ALIAS=MUN.map(m=>[norm(m.n),m.cod]).concat((window.DIVIPOLE_CO||{alias:[]}).alias);
const nomCod=c=>(MUN.find(m=>m.cod==c)||{}).n;
T.asignarMunicipio=dir=>{if(!String(dir||"").trim())return{estado:"pendiente",metodo:"sin dirección"};
 const segs=String(dir).split(/\s*[,;\/\n]\s*|\s+-\s+/);let dep=0;
 for(let i=segs.length-1;i>=0;i--){const s=norm(segs[i]);if(!s||s=="colombia")continue;
  if(/^((dpto|depto|departamento)( de)? )?boyaca( colombia)?$/.test(s)){dep++;continue}
  const m=ALIAS.map(([al,cod])=>({al,cod,pos:(" "+s+" ").indexOf(" "+al+" ")})).filter(x=>x.pos>=0);
  const mm=m.filter(x=>!m.some(o=>o.al.length>x.al.length&&o.pos<=x.pos&&o.pos+o.al.length>=x.pos+x.al.length));
  let cods=[...new Set(mm.map(x=>x.cod))];
  if(cods.includes("15104")){const nb=(s.match(/\bboyaca\b/g)||[]).length-(s.match(/\bpuerto boyaca\b/g)||[]).length;if(nb<2){cods=cods.filter(c=>c!="15104");dep++}}
  if(cods.length==1)return{estado:"automatica",codigo:cods[0],municipio:nomCod(cods[0]),metodo:"dirección → DIVIPOLA (coincidencia local)"};
  if(cods.length>1)return{estado:"ambigua",candidatos:cods.map(c=>({codigo:c,municipio:nomCod(c)})).sort((a,b)=>a.municipio.localeCompare(b.municipio)),metodo:"varios municipios en el mismo segmento"}}
 if(dep>=2)return{estado:"automatica",codigo:"15104",municipio:"Boyacá",metodo:"«Boyacá, Boyacá»"};
 if(dep==1)return{estado:"ambigua",candidatos:[{codigo:"15104",municipio:"Boyacá"}],metodo:"solo dice «Boyacá» (¿municipio o departamento?)"};
 return{estado:"pendiente",metodo:"ningún municipio DIVIPOLA en la dirección"}};
T.asignacionHTML=r=>r.estado=="automatica"?`<span class="chip ok" data-asig="automatica">📍 ${H(r.municipio)} · asignado automáticamente (DIVIPOLA ${H(r.codigo)})</span>`
 :r.estado=="ambigua"?`<span class="chip wa" data-asig="ambigua">❓ Ambigua: ${H((r.candidatos||[]).map(c=>c.municipio).join(" o "))}. Elige el municipio.</span>`
 :`<span class="chip" data-asig="pendiente">Sin municipio reconocido: elígelo en la lista.</span>`;
// Campo de dirección (solo para ubicar el municipio; no se guarda) en un formulario con un <select> de municipio
T.campoDireccion=(raiz,idDir,idSel,idOut)=>{const d=raiz.querySelector("#"+idDir),sel=raiz.querySelector("#"+idSel),o=raiz.querySelector("#"+idOut);const st={asig:null,elegido:null};
 d.addEventListener("input",()=>{const r=T.asignarMunicipio(d.value);st.asig=r;o.innerHTML=d.value.trim()?T.asignacionHTML(r):"";
  if(r.estado=="automatica"&&[...sel.options].some(x=>x.value==r.municipio||x.text==r.municipio)){sel.value=r.municipio;st.elegido=r.municipio}});
 sel.addEventListener("change",()=>{st.elegido=null});return st};
const dirHTML=(id,out)=>`<label for="${id}">Dirección donde vives (opcional; solo para ubicar tu municipio y <b>no se guarda</b>)</label><input type="text" id="${id}" autocomplete="off" placeholder="Calle 10 # 9-20, Paipa"><div id="${out}" class="small" style="margin-top:4px"></div>`;
const asigFinal=(st,mun)=>st&&st.asig&&st.asig.estado=="automatica"&&st.asig.municipio==mun&&st.elegido==mun?"automatica":st&&st.asig&&st.asig.estado=="ambigua"?"manual (dirección ambigua)":"manual";
const marcar=(p,asig)=>{const m=MUN.find(x=>x.n==p.mun);p.munCod=m?m.cod:null;p.asignacion=asig};
// Nuevo registro del CRM
{const n0=T.clicks["#nuevo"];T.onClick("#nuevo",(t,e)=>{n0(t,e);const m=[...document.querySelectorAll(".modal")].pop();if(!m||!m.querySelector("#nm"))return;
 m.querySelector('label[for="nm"]').insertAdjacentHTML("beforebegin",dirHTML("nd","nd-out"));const st=T.campoDireccion(m,"nd","nm","nd-out");
 const g=m.querySelector("#g"),g0=g.onclick;g.onclick=async e=>{const k=S.personas.length;await g0.call(g,e);if(S.personas.length>k){marcar(S.personas[0],asigFinal(st,S.personas[0].mun));T.save();
  T.log("divipole.asignacion",S.personas[0].id+" → "+S.personas[0].mun+" ("+S.personas[0].asignacion+"); la dirección no se guarda")}}})}
// Formulario público de referidos (#/r/<token>)
{const a0=T.afterRegistro;T.afterRegistro=en=>{a0(en);const f=T.$("#reg-pub");if(!f||!f.querySelector("#rp-m"))return;
 f.querySelector('label[for="rp-m"]').insertAdjacentHTML("beforebegin",dirHTML("rp-d","rp-d-out"));const st=T.campoDireccion(f,"rp-d","rp-m","rp-d-out");
 const g=f.querySelector("#rp-g"),g0=g.onclick;g.onclick=async e=>{const k=S.personas.length;await g0.call(g,e);if(S.personas.length>k){marcar(S.personas[0],asigFinal(st,S.personas[0].mun));T.save()}}}}
// Importación: columna «dirección» opcional para completar el municipio
{const f0=T.filasImport;T.filasImport=tabla=>{const o=f0(tabla);const i=(tabla[0]||[]).findIndex(h=>/^(direccion|direccion de residencia|direccion declarada|dir)$/.test(norm(h)));o.asignadas=0;
 if(i>=0)o.filas.forEach((f,j)=>{if(!f.municipio){const r=T.asignarMunicipio((tabla[j+1]||[])[i]);if(r.estado=="automatica"){f.municipio=r.municipio;f._asig="automatica";o.asignadas++}}});
 return o}}
{const c0=T.cargarImport;T.cargarImport=(res,meta)=>{const imp=c0(res,meta);res.filter(x=>x.accion=="carga").forEach(x=>{const p=S.personas.find(y=>y.cedulaH==x.h&&y.lote==imp.id);p&&marcar(p,x.r._asig||"manual")});T.save();return imp}}
// Mapa y tarjeta Divipole en TERRITORIO
T.divipoleHTML=()=>{const P_=S.personas,c={automatica:0,manual:0,ambigua:0,pendiente:0};P_.forEach(p=>{const a=p.asignacion||"manual";c[/^manual/.test(a)?"manual":a]=(c[/^manual/.test(a)?"manual":a]||0)+1});
 return `<div class="card" id="divipole" style="margin-top:14px"><h2>Divipole · catálogo territorial</h2><div class="list small">
 <div class="row b"><span>Municipios (DIVIPOLA, DANE)</span><b data-dv-mun>${MUN.length} de 123</b></div><div class="row b"><span>En el mapa de esta campaña</span><b data-dv-mapa>${D.municipios.length}</b></div>
 <div class="row b"><span>Puestos de votación oficiales cargados</span><b data-dv-puestos>0 · nivel municipio</b></div>
 <div class="row b"><span>Fichas con municipio automático / elegido / ambiguo / pendiente</span><b>${fmt(c.automatica)} / ${fmt(c.manual)} / ${fmt(c.ambigua)} / ${fmt(c.pendiente)}</b></div></div>
 <p class="small">Los <b>puestos</b> se cargan solo del archivo Divipole oficial de la Registraduría (función <code>cargar_puestos</code>, que exige esa fuente). Mientras no esté publicado, el catálogo queda a <b>nivel municipio</b>: no se inventan puestos. Los puestos y mesas que ves en el Día E de la demo son ejemplos ficticios, no parte del catálogo.</p>
 <label for="dv-dir">Probar la autoasignación con una dirección</label><input type="text" id="dv-dir" placeholder="Vereda Salitre, Paz del Río, Boyacá" autocomplete="off"><div id="dv-res" class="small" style="margin-top:6px"></div>
 <p class="muted small">La dirección solo se usa para encontrar el municipio y no se guarda. Si es ambigua, la persona o el equipo eligen; nunca se adivina.</p><p class="muted small">Fuente: ${H(T.DIVIPOLE.fuente)}.</p></div>`};
{const v0=T.V.TERRITORIO,a0=T.after.TERRITORIO;T.V.TERRITORIO=()=>{const h=v0();return S.rol=="encuestador"?h:h+T.divipoleHTML()};
 T.after.TERRITORIO=()=>{a0&&a0();const d=T.$("#dv-dir");d&&(d.oninput=()=>{const r=T.asignarMunicipio(d.value);T.$("#dv-res").innerHTML=d.value.trim()?T.asignacionHTML(r)+' <span class="muted">'+H(r.metodo)+"</span>":""})}}
// ---------- 008 · portal «Mis datos» del titular ----------
T.urlBase=()=>location.href.split("#")[0];
T.enlaceMisDatos=p=>{const tok=hex(24);S.titTokens.push({h:shaSync(tok),persona:p.id,alcance:"enlace",vence:new Date(Date.now()+90*DIA).toISOString()});if(S.titTokens.length>500)S.titTokens.shift();T.save();return T.urlBase()+"#/mis-datos/"+tok};
T.pieMisDatos=p=>"\n\nTus datos y autorizaciones (revocar u oponerte): "+T.enlaceMisDatos(p);
{const a0=T.avisoHTML;T.avisoHTML=()=>a0().replace(/<\/div>$/,` <b>Mis datos:</b> <a href="#/mis-datos" data-misdatos>consulta, corrige o revoca aquí</a>.</div>`)}
// En la ficha del CRM: enlace «Mis datos» para enviarlo al titular
{const p0=T.clicks["[data-p]"];T.onClick("[data-p]",async(t,e)=>{await p0(t,e);const m=[...document.querySelectorAll(".modal")].pop(),p=S.personas.find(x=>x.id==t.dataset.p);if(!m||!p||!m.querySelector("#rev"))return;
 m.querySelector("#rev").insertAdjacentHTML("beforebegin",'<button class="btn" id="md-enl" type="button">🔗 Enlace «Mis datos»</button>');
 m.querySelector("#md-enl").onclick=()=>{const u=T.enlaceMisDatos(p);T.log("titular.enlace","Enlace «Mis datos» generado para "+p.id+" (90 días; solo revocar u oponerse)");
  m.querySelector("#md-enl").insertAdjacentHTML("afterend",`<div class="legal small" data-enlace-md style="width:100%">Envíalo al titular: <code style="word-break:break-all">${H(u)}</code><br>Con este enlace puede revocar u oponerse sin código; para ver o corregir todos sus datos, verifica su celular.</div>`)}})}
const OTP={};let otpIP=[];
const sesion={p:null,alcance:null};
const tipos={Revocatoria:"Revocar mi autorización",Oposicion:"No quiero que me contacten",Apoyo:"Retirar mi apoyo declarado",Consulta:"Descargar mis datos",Rectificacion:"Corregir mis datos",Supresion:"Suprimir mis datos"};
T.portalSolicitud=(p,tipo,detalle)=>{const hoy=T.hoyISO(),tp={Revocatoria:"Revocatoria",Oposicion:"Oposición",Apoyo:"Revocatoria (dato sensible)",Consulta:"Consulta",Rectificacion:"Rectificación",Supresion:"Supresión"}[tipo];
 const pz=T.plazoArco(tp=="Consulta"?"Consulta":"Reclamo",hoy),inst=["Revocatoria","Oposicion","Apoyo","Consulta"].includes(tipo);
 const s={id:"S-"+String(S.solicitudes.length+1).padStart(3,"0"),persona:p.id,tipo:tp,fecha:hoy,estado:inst?"Atendida":"Abierta",canal:"Portal del titular (Mis datos)",origen:"portal",detalle:detalle||null,vence:pz.vence,vence_prorroga:pz.prorroga,atendida:inst?new Date().toISOString():null};
 S.solicitudes.unshift(s);const c=p.consent;
 if(tipo=="Revocatoria"){c.estado="revocado";c.whatsapp=c.sms=c.correo=c.llamada=c.afinidad=false;p.estado="baja";p.apoyoDecl=null;delete p.caduca}
 if(tipo=="Oposicion"){p.oposicion=true;p.estado="baja";p.apoyoDecl=null;if(p.tel)T.sha(p.tel).then(h=>{if(!S.noContactar.includes(h))S.noContactar.push(h);T.save()})}
 if(tipo=="Apoyo"){p.apoyoDecl=null;c.afinidad=false}
 T.save();T.log("titular."+norm(tp).replace(/ /g,"_"),s.id+" "+p.id+" desde el portal «Mis datos»"+(inst?" · aplicada al instante":" · vence "+pz.vence),"titular");return{s,pz,inst}};
const radHTML=({s,pz,inst})=>`<div class="card ok" id="md-rad" data-tipo="${H(s.tipo)}" style="margin-top:12px"><h2>✓ Radicado ${H(s.id)} · ${H(s.tipo)}</h2><p class="small">${inst?"<b>Aplicada al instante.</b> ":""}Plazo legal: <b>${pz.dias} días hábiles</b> → vence el <b data-vence="${pz.vence}">${T.fecha(pz.vence)}</b>; si la campaña necesita prórroga debe avisarte y responder a más tardar el <b data-prorroga="${pz.prorroga}">${T.fecha(pz.prorroga)}</b> (Ley 1581, arts. 14 y 15).</p></div>`;
function panelHTML(){const p=sesion.p,c=p.consent,enl=sesion.alcance=="enlace",act=c.estado!="revocado"&&p.estado!="baja",sols=S.solicitudes.filter(s=>s.persona==p.id);
 const canales=["whatsapp","sms","llamada","correo"].filter(k=>c[k]).join(", ")||"ninguno";
 return `<div class="card" id="md-panel" data-alcance="${enl?"enlace":"otp"}" style="margin-top:12px"><h2>Hola, ${H(p.nombre.split(" ")[0])}</h2><div class="list small">
 ${enl?"":`<div class="row b"><span>Nombre</span><b>${H(p.nombre)}</b></div><div class="row b"><span>Celular</span><b>+57 ${H((p.tel||"").replace(/(\d{3})(\d{3})(\d+)/,"$1 *** $3"))}</b></div><div class="row b"><span>Municipio</span><b>${H(p.mun)}</b></div>`}
 <div class="row b"><span>Autorización</span><b data-md-estado="${H(c.estado)}">${H(c.estado)}${p.oposicion?" · no quieres contacto":""}</b></div><div class="row b"><span>Canales autorizados</span><b>${H(canales)}</b></div>
 ${enl?"":`<div class="row b"><span>Apoyo declarado (dato sensible)</span><b>${p.apoyoDecl?"Sí, lo declaraste tú":"No"}</b></div>`}<div class="row b"><span>Solicitudes</span><b>${sols.length}</b></div></div>
 <div class="row" style="flex-wrap:wrap;margin-top:12px">${act?`<button class="btn danger" id="md-rev" type="button">${tipos.Revocatoria}</button>`:""}${!p.oposicion?`<button class="btn" id="md-opo" type="button">${tipos.Oposicion}</button>`:""}
 ${enl?"":`${p.apoyoDecl?`<button class="btn" id="md-apo" type="button">${tipos.Apoyo}</button>`:""}<button class="btn" id="md-con" type="button">${tipos.Consulta}</button><button class="btn" id="md-rec" type="button">${tipos.Rectificacion}</button><button class="btn" id="md-sup" type="button">${tipos.Supresion}</button>`}</div>
 <div id="md-conf"></div><div id="md-out"></div>
 ${enl?'<p class="muted small" style="margin-top:10px">Con este enlace solo puedes revocar u oponerte. Para ver o corregir todos tus datos, <a href="#/mis-datos">verifica tu celular</a>.</p>':""}
 ${sols.length?`<h2 style="margin-top:12px">Tus solicitudes</h2><div class="list small">${sols.map(s=>`<div class="row b"><span>${H(s.id)} · ${H(s.tipo)} · ${T.fecha(s.fecha)}</span><b>${H(s.estado)}${s.estado=="Abierta"?" · vence "+T.fecha(s.vence||T.sumarHabiles(s.fecha,T.plazo(s.tipo))):""}</b></div>`).join("")}</div>`:""}
 <p class="muted small" style="margin-top:10px">La campaña no envía tus datos a herramientas de IA. <a href="#/carta-ia">Carta de IA responsable</a>.</p></div>`}
T.misDatosHTML=()=>{const a=C.privacidad;return `<section class="card" id="mis-datos" style="max-width:680px;margin:0 auto"><h1>Mis datos</h1><p class="sub">Consulta, corrige o revoca lo que la ${H(C.campana)} tiene sobre ti. Es gratis y sin cuentas.</p>
 <p class="small"><b>Responsable:</b> ${H(a.responsable)} · ${H(a.contacto)}</p><div id="md-ini">${sesion.p?"":`<label for="md-tel">Tu celular</label><input type="tel" id="md-tel" inputmode="numeric" autocomplete="tel" placeholder="3001234567"><button class="btn pri" id="md-cod" type="button" style="width:100%;margin-top:8px">Enviarme un código</button><div id="md-otp-box"></div>`}</div>
 ${sesion.p?panelHTML():""}<p class="muted small" style="margin-top:10px">Plazos (Ley 1581): consultas 10 días hábiles; reclamos, corrección, supresión y revocatoria 15 días hábiles (la revocatoria y la oposición se aplican al instante). También puedes quejarte ante la SIC.</p></section>`};
function pintar(){const el=T.$("#main");el.innerHTML='<div class="ficticio" role="note">Datos ficticios · demostración</div>'+T.misDatosHTML();el.dataset.vista="MISDATOS";afterMD()}
function afterMD(){const q=s=>document.querySelector(s);
 q("#md-cod")&&(q("#md-cod").onclick=async()=>{const t=q("#md-tel").value.replace(/\D/g,"");if(!/^3\d{9}$/.test(t)){T.toast("Escribe tu celular (10 dígitos)");return}
  const now=Date.now();otpIP=otpIP.filter(x=>now-x<10*60*1000);const h=await T.sha(t),o=OTP[h]||(OTP[h]={env:[]});o.env=o.env.filter(x=>now-x<36e5);
  if(otpIP.length>=5||o.env.length>=3){T.toast("Demasiados códigos seguidos: intenta más tarde");return}otpIP.push(now);o.env.push(now);
  const cod=String(100000+(crypto.getRandomValues(new Uint32Array(1))[0]%900000));o.h=await T.sha(cod);o.vence=now+10*60*1000;o.intentos=0;o.tel=t;
  T.log("titular.codigo","Código «Mis datos» enviado a un celular (simulado)","titular");
  q("#md-otp-box").innerHTML=`<p class="small" style="margin-top:10px">Si tu número está registrado, te llegó un código por SMS (simulado en la demo: <b data-otp>${cod}</b>). Vence en 10 minutos.</p><label for="md-otp">Código de 6 dígitos</label><input type="text" id="md-otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code"><div id="md-otp-st" class="small"></div>`;
  q("#md-otp").focus();q("#md-otp").oninput=async e=>{const v=e.target.value.replace(/\D/g,"");if(v.length<6)return;
   if(Date.now()>o.vence||o.intentos>=5){q("#md-otp-st").textContent="El código venció o superaste los intentos. Pide otro.";return}
   if(await T.sha(v)!==o.h){o.intentos++;q("#md-otp-st").textContent="Código incorrecto ("+(5-o.intentos)+" intentos)";return}
   delete o.h;const p=S.personas.find(x=>x.tel==o.tel);if(!p){q("#md-otp-st").innerHTML='<p class="muted">Verificado. No encontramos datos con ese número en esta campaña.</p>';return}
   sesion.p=p;sesion.alcance="otp";T.log("titular.verificado","Titular "+p.id+" verificado con código en «Mis datos»","titular");pintar()}});
 if(!sesion.p)return;const p=sesion.p,out=q("#md-out"),conf=q("#md-conf");
 const confirmar=(tipo,txt)=>{conf.innerHTML=`<div class="legal small" id="md-confirma" style="margin-top:10px"><b>${H(tipos[tipo])}.</b> ${txt}<div class="row" style="margin-top:8px"><button class="btn danger" id="md-si" type="button">Sí, confirmar</button><button class="btn" id="md-no" type="button">Cancelar</button></div></div>`;
  q("#md-si").onclick=()=>{const r=T.portalSolicitud(p,tipo);pintar();q("#md-out").innerHTML=radHTML(r)};q("#md-no").onclick=()=>{conf.innerHTML=""}};
 q("#md-rev")&&(q("#md-rev").onclick=()=>confirmar("Revocatoria","La campaña deja de usar tus datos de inmediato en todas sus apps, se apagan los canales y se borra tu apoyo declarado. Se conserva solo la evidencia de que autorizaste y revocaste."));
 q("#md-opo")&&(q("#md-opo").onclick=()=>confirmar("Oposicion","Nadie de la campaña volverá a contactarte por ningún canal."));
 q("#md-apo")&&(q("#md-apo").onclick=()=>confirmar("Apoyo","Se borra tu declaración de apoyo (dato sensible). Tu registro sigue vigente si no lo revocas."));
 q("#md-con")&&(q("#md-con").onclick=()=>{const {_otp,_apoyo,cedulaH,...d}=p;const r=T.portalSolicitud(p,"Consulta");T.descargar("mis_datos_"+p.id+".json",JSON.stringify({titular:p.nombre,responsable:C.privacidad.responsable,datos:d,solicitudes:S.solicitudes.filter(s=>s.persona==p.id)},null,2),"application/json");pintar();q("#md-out").innerHTML=radHTML(r)});
 const conTexto=(tipo,ph)=>{conf.innerHTML=`<div class="legal small" style="margin-top:10px"><label for="md-det">${H(tipos[tipo])}</label><textarea id="md-det" rows="2" placeholder="${H(ph)}"></textarea><button class="btn pri" id="md-env" type="button" style="margin-top:8px">Enviar solicitud</button></div>`;
  q("#md-env").onclick=()=>{const d=q("#md-det").value.trim();if(d.length<5){T.toast("Cuéntanos qué necesitas");return}const r=T.portalSolicitud(p,tipo,d);pintar();q("#md-out").innerHTML=radHTML(r)}};
 q("#md-rec")&&(q("#md-rec").onclick=()=>conTexto("Rectificacion","¿Qué dato está mal y cuál es el correcto?"));
 q("#md-sup")&&(q("#md-sup").onclick=()=>conTexto("Supresion","Opcional: el motivo. La campaña te responde en 15 días hábiles."))}
const RMD=/^mis-datos(?:\/([0-9a-f]{48}))?$/,RCARTA=/^carta-ia$/;
{const r0=T.render;T.render=ruta=>{const r=ruta||"",mm=RMD.exec(r);
 if(RCARTA.test(r)){const el=T.$("#main");el.innerHTML='<div class="ficticio" role="note">Datos ficticios · demostración</div>'+T.cartaHTML();el.dataset.vista="CARTAIA";window.scrollTo(0,0);return}
 if(!mm){sesion.p=null;return r0(ruta)}
 if(mm[1]){const h=shaSync(mm[1]),tk=S.titTokens.find(x=>x.h==h&&new Date(x.vence)>new Date()),p=tk&&S.personas.find(x=>x.id==tk.persona);
  if(p){sesion.p=p;sesion.alcance="enlace";T.log("titular.enlace_usado","Titular "+p.id+" abrió su enlace «Mis datos»","titular")}else{sesion.p=null;T.toast("El enlace no es válido o venció: verifica tu celular")}}
 else sesion.p=null;
 pintar();window.scrollTo(0,0)}}
// ---------- 009 · carta de IA responsable y registro de cada uso ----------
const FUN={contenido:"Contenido",propuestas:"Propuestas",documentos:"Documentos",chat:"Chat",chatbot:"Chatbot ciudadano",asesor:"Asesor de campaña",clasificador_e14:"Clasificador de imagen E-14"};T.IA_FUNCIONES=FUN;
const lg=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const prov=()=>T.IA.real()?{proveedor:"Google Gemini API vía "+(T.IA.modo()=="codigo"?"servidor de "+C.marca:"clave propia"),modelo:lg("terr_ia_modelo")||"auto"}:{proveedor:"Simulación local (sin modelo)",modelo:"—"};
T.usoIA=(o)=>{const prev=S.iaUsos.length?S.iaUsos[S.iaUsos.length-1].h:"0".repeat(64);
 const e={n:S.iaUsos.length+1,t:new Date().toISOString(),rol:S.rol,funcion:o.funcion,origen:o.origen||"app",proveedor:o.proveedor,modelo:o.modelo,resultado:o.resultado,caracteres:o.caracteres||0};
 e.h=shaSync(prev+JSON.stringify(e));e.prev=prev;S.iaUsos.push(e);T.save();return e};
T.verificarUsosIA=()=>{let prev="0".repeat(64);for(const x of S.iaUsos){const {h,prev:pv,...e}=x;if(pv!==prev||shaSync(prev+JSON.stringify(e))!==h)return false;prev=h}return true};
const funRuta=()=>{const [app,tab]=T.ruta().split("?");return app=="ASESOR"?"asesor":app=="IA"&&FUN[tab||"contenido"]?(tab||"contenido"):"chat"};
{const IA=T.IA,run0=IA.run;let dentro=0;
 IA.run=async(prompt,sim,onText)=>{const f=funRuta(),g=IA.guarda(prompt),pv=prov();dentro++;
  try{const t=await run0(prompt,sim,onText);T.usoIA(Object.assign({funcion:f,resultado:"ok",caracteres:String(prompt).length},pv));return t}
  catch(e){T.usoIA(Object.assign({funcion:f,resultado:!g.ok?"guarda":/cancel/i.test(e.message)?"cancelado":"error",caracteres:String(prompt).length},pv));throw e}finally{dentro--}};
 const gem0=IA.gemini;IA.gemini=async(...a)=>{if(dentro)return gem0(...a);try{const t=await gem0(...a);T.usoIA(Object.assign({funcion:funRuta()=="chat"?"documentos":funRuta(),resultado:"ok",caracteres:String(a[0]).length},prov()));return t}
  catch(e){T.usoIA(Object.assign({funcion:"documentos",resultado:"error",caracteres:String(a[0]).length},prov()));throw e}}}
{const l0=T.log;T.log=(accion,detalle,rol,t)=>{const r=l0(accion,detalle,rol,t);
 if(accion=="asesor.consulta"){const modo=String(detalle).split(" · ").pop();T.usoIA({funcion:"asesor",origen:"asesor",proveedor:/worker|servidor/i.test(modo)?"Asesor vía servidor de "+C.marca:"Base local del Asesor (sin modelo generativo)",modelo:/worker|servidor/i.test(modo)?"según el servidor":"—",resultado:/RECHAZO/.test(detalle)?"rechazo":"ok"})}
 if(accion=="ia.documento"&&!T.IA.real())T.usoIA({funcion:"documentos",proveedor:"Análisis local en el navegador (sin modelo)",modelo:"—",resultado:"ok"});
 return r}}
{const c0=T.chatbotResponder;if(c0)T.chatbotResponder=q=>{const r=c0(q);T.usoIA({funcion:"chatbot",proveedor:"Respuestas aprobadas por el equipo (sin modelo generativo)",modelo:"—",resultado:r.pend?"sin respuesta":"ok",caracteres:String(q).length});return r}}
{const k0=T.clasificarImagen;if(k0)T.clasificarImagen=async(...a)=>{try{const r=await k0(...a);T.usoIA({funcion:"clasificador_e14",proveedor:"Clasificador local en el navegador",modelo:"heurístico de imagen v0.5",resultado:"ok"});return r}
 catch(e){T.usoIA({funcion:"clasificador_e14",proveedor:"Clasificador local en el navegador",modelo:"heurístico de imagen v0.5",resultado:"error"});throw e}}}
T.puedeExportarIA=()=>["candidato","gerente","juridico"].includes(S.rol);
T.usosIAcsv=()=>{const q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';return "\ufeff"+["n","fecha_cot","rol","funcion","origen","proveedor","modelo","resultado","caracteres_entrada","huella"].join(";")+"\n"+
 S.iaUsos.map(e=>[e.n,new Date(e.t).toLocaleString("sv-SE",{timeZone:"America/Bogota"}),e.rol,e.funcion,e.origen,e.proveedor,e.modelo,e.resultado,e.caracteres,e.h].map(q).join(";")).join("\n")};
T.usosIAHTML=()=>{const u=S.iaUsos,por={};u.forEach(e=>por[e.funcion]=(por[e.funcion]||0)+1);
 return `<div class="card" id="ia-usos" style="margin-top:14px"><h2>Registro de cada uso de IA</h2><p class="small">Cada uso queda anotado: cuándo, qué rol, qué función, proveedor, modelo y resultado. <b>No se guarda el texto consultado</b> (solo su longitud). Registro encadenado: no se edita ni se borra.</p>
 <div class="row" style="flex-wrap:wrap;gap:6px">${Object.entries(FUN).map(([k,n])=>`<span class="chip" data-usos-fun="${k}">${H(n)}: ${por[k]||0}</span>`).join("")}</div>
 <div class="tw" style="margin-top:10px;max-height:300px;overflow:auto"><table><tr><th>#</th><th>Fecha (COT)</th><th>Función</th><th>Rol</th><th>Proveedor · modelo</th><th>Resultado</th></tr>${u.slice(-30).reverse().map(e=>`<tr data-uso="${e.n}"><td>${e.n}</td><td>${T.fechaHora(e.t)}</td><td>${H(FUN[e.funcion]||e.funcion)}</td><td>${H((T.ROLES[e.rol]||{n:e.rol}).n)}</td><td class="small">${H(e.proveedor)} · ${H(e.modelo)}</td><td><span class="chip ${e.resultado=="ok"?"ok":e.resultado=="error"?"er":"wa"}">${H(e.resultado)}</span></td></tr>`).join("")||'<tr><td colspan="6" class="muted">Aún no hay usos de IA en esta campaña.</td></tr>'}</table></div>
 <div class="row" style="margin-top:10px;flex-wrap:wrap">${T.puedeExportarIA()?`<button class="btn" id="ia-usos-csv" type="button">⬇ Exportar registro (CSV)</button>`:'<span class="muted small">Exportan: candidata, gerente o jurídico.</span>'}<span class="chip ${T.verificarUsosIA()?"ok":"er"}" data-usos-integro>${T.verificarUsosIA()?"✓ Registro íntegro":"⚠ Registro alterado"}</span><a class="btn sm" href="#/carta-ia">Carta de IA responsable</a></div></div>`};
T.onClick("#ia-usos-csv",()=>{if(!T.puedeExportarIA()){T.toast("Tu rol no exporta el registro de IA");return}T.descargar("usos_ia_"+T.hoyISO()+".csv",T.usosIAcsv(),"text/csv;charset=utf-8");T.log("ia.exportar_usos",S.iaUsos.length+" usos de IA exportados (CSV, sin texto consultado)");T.toast("Registro de IA exportado")});
T.cartaHTML=()=>{const K=window.CARTA_IA;if(!K)return '<section class="card"><h1>Carta de IA responsable</h1><p>No disponible.</p></section>';
 return `<section class="card" id="carta-ia" style="max-width:860px;margin:0 auto"><span class="chip wa">${H(K.estado)}</span><h1>${H(K.titulo)}</h1><p class="sub">${H(K.version)} · ${H(C.campana)}</p><p>${H(K.intro)}</p>
 ${K.principios.map((p,i)=>`<h2>${i+1}. ${H(p[0])}</h2><p class="small">${H(p[1])}</p>`).join("")}
 <h2>Inventario de funciones de IA</h2><div class="tw"><table><tr><th>Función</th><th>Para qué</th><th>Datos que usa</th><th>Riesgo</th><th>Estado en esta campaña</th></tr>${K.inventario.map(f=>{const st=f[0]=="clasificador_e14"?"Siempre local":f[0]=="asesor"?(S.iaF&&S.iaF.asesor&&S.iaF.asesor.on?"Activa":"Apagada"):(S.iaF&&S.iaF[f[0]]&&S.iaF[f[0]].on?"Activa":"Apagada");return `<tr><td><b>${H(FUN[f[0]]||f[0])}</b></td><td class="small">${H(f[1])}</td><td class="small">${H(f[2])}</td><td>${H(f[3])}</td><td><span class="chip">${st}</span></td></tr>`}).join("")}</table></div>
 <h2>Normas de referencia (por verificar)</h2><ul class="small">${K.normas.map(n=>`<li>${H(n)}</li>`).join("")}</ul><p class="muted small">${H(K.pie)}</p>
 <div class="row" style="flex-wrap:wrap"><a class="btn" href="#/">← Inicio</a><a class="btn" href="#/mis-datos">Mis datos</a>${T.puede&&T.puede("IA")?'<a class="btn" href="#/IA?gobierno">Gobierno de IA</a>':""}</div></section>`};
{const v0=T.V.IA;T.V.IA=()=>{const h=v0(),tab=(T.ruta().split("?")[1])||"contenido";return tab=="gobierno"?h+T.usosIAHTML():h}}
{const v0=T.V.CUMPLIMIENTO;T.V.CUMPLIMIENTO=()=>v0()+T.usosIAHTML()}
// ---------- 012 · asistente de alta (6 pasos, ≤ 72 h) ----------
const CARGOS=["Asamblea","Concejo","Alcaldía","Gobernación","JAL"],UNI=["Alcaldía","Gobernación"];
const ROL_INV={gerente:"Gerente de campaña",juridico:"Jurídico y cumplimiento",contador:"Contador(a)",cm:"Community manager",ctestigos:"Coordinador de testigos",coordmun:"Coordinador municipal",lider:"Líder"};
const PASOS=["Cargo y candidatura","Lista y partido","Meta con calculadora","Importación de la base","Política de datos","Roles e invitaciones"];
T.altas=()=>{try{return JSON.parse(localStorage.getItem(BASE+"altas")||"[]")}catch(e){return[]}};
const guardarAltas=l=>localStorage.setItem(BASE+"altas",JSON.stringify(l));
const alta=()=>ALTA&&T.altas().find(a=>a.id==ALTA.id);
const guardarAlta=a=>{const l=T.altas(),i=l.findIndex(x=>x.id==a.id);l[i<0?l.length:i]=a;guardarAltas(l);Object.assign(ALTA,a)};
T.altaEstado=a=>{a=a||alta();if(!a)return null;const hechos=[1,2,3,4,5,6].filter(i=>a.pasos[i]),fin=a.lista_en?new Date(a.lista_en):new Date(),h=(fin-new Date(a.iniciada))/36e5;
 return{hechos:hechos.length,faltan:[1,2,3,4,5,6].filter(i=>!a.pasos[i]),horas:h,dentro72:h<=72,lista:!!a.lista_en}};
const durTxt=h=>Math.floor(h)+" h "+String(Math.floor((h%1)*60)).padStart(2,"0")+" min";
T.abrirCampana=id=>{localStorage.setItem(BASE+"activa",JSON.stringify(id));location.hash="#/ALTA";location.reload()};
T.volverDemo=()=>{localStorage.removeItem(BASE+"activa");location.hash="#/";location.reload()};
T.onClick("[data-al-abrir]",t=>T.abrirCampana(t.dataset.alAbrir));T.onClick("#al-volver",()=>T.volverDemo());
T.APPS.push(["ALTA","🚀","Alta de campaña","Campaña nueva lista en ≤ 72 h: 6 pasos guiados"]);
const munOpts=sel=>window.MUNICIPIOS_BOY.map(m=>`<option ${m[1]==sel?"selected":""}>${H(m[1])}</option>`).join("");
const estimada=c=>Math.round(c.nodos*c.integrantes*c.contactos*(c.verificacion/100)*(c.conversion/100));
function paso1HTML(){return `<div class="card" id="al-paso" data-paso="1"><h2>Paso 1 de 6 · ${PASOS[0]}</h2>
 <label for="al-cand">Nombre de la candidata o el candidato</label><input type="text" id="al-cand" autocomplete="off" placeholder="Nombre completo">
 <label for="al-cargo">Cargo</label><select class="f" id="al-cargo">${CARGOS.map(c=>`<option>${c}</option>`).join("")}</select>
 <label for="al-circ">Circunscripción</label><select class="f" id="al-circ"><option value="__dep">Departamento de Boyacá</option>${munOpts("")}</select><p class="muted small" id="al-circ-ayuda">Asamblea y Gobernación: departamento de Boyacá. Concejo, Alcaldía y JAL: elige el municipio.</p>
 <label for="al-fecha">Fecha de la elección</label><input type="date" id="al-fecha" value="2027-10-31"><p class="muted small">Elecciones territoriales: 31-oct-2027 (por verificar con la Registraduría).</p>
 <label for="al-rol">Quién hace el alta</label><select class="f" id="al-rol"><option value="candidato">La candidata o el candidato</option><option value="gerente">La gerencia de la campaña</option></select>
 <label class="ck"><input type="checkbox" id="al-dsp"><span> Declaro que <b>no soy servidor público</b> con prohibición de participar en política (C.P., art. 127; Ley 996 de 2005, por verificar).</span></label>
 <button class="btn pri" id="al-crear" type="button" style="width:100%;margin-top:10px">Crear la campaña y seguir →</button></div>`}
function pasoHTML(i,a){const p1=a.pasos[1],uni=UNI.includes(p1.cargo);
 if(i==2)return `<label for="al-partido">Partido, movimiento o grupo significativo de ciudadanos</label><input type="text" id="al-partido" autocomplete="off">
  <label for="al-voto">Tipo de lista</label><select class="f" id="al-voto">${uni?'<option value="uninominal">Cargo uninominal (un solo elegido)</option>':'<option value="preferente">Con voto preferente</option><option value="cerrada">Cerrada (sin voto preferente)</option>'}</select>
  ${uni?"":`<label for="al-cur">Curules en disputa</label><input type="number" id="al-cur" min="1" max="60" value="${p1.cargo=="Asamblea"?16:p1.cargo=="JAL"?7:13}"><label for="al-ncand">Candidatos en la lista</label><input type="number" id="al-ncand" min="1" max="60" value="${p1.cargo=="Asamblea"?16:13}"><label for="al-reng">Renglón en la lista</label><input type="number" id="al-reng" min="1" max="60" value="1">`}
  <p class="muted small">Curules y reglas por verificar con la Registraduría y el CNE.</p>`;
 if(i==3)return `<p class="small">Meta de abajo hacia arriba: nodos × integrantes × contactos × % verificación × % conversión.</p><div class="grid g3">
  <div><label for="al-nodos">Líderes (nodos)</label><input type="number" id="al-nodos" min="1" value="20"></div><div><label for="al-int">Integrantes por líder</label><input type="number" id="al-int" min="1" value="10"></div><div><label for="al-cont">Contactos por integrante</label><input type="number" id="al-cont" min="1" value="10"></div>
  <div><label for="al-ver">% verificación</label><input type="number" id="al-ver" min="1" max="100" value="70"></div><div><label for="al-conv">% conversión</label><input type="number" id="al-conv" min="1" max="100" value="65"></div><div><label>Estimación</label><div class="kpi"><div class="v" id="al-est">0</div></div></div></div>
  <label for="al-meta">Meta declarada (votos)</label><input type="number" id="al-meta" min="1"><label for="al-just">Sustento de la meta</label><textarea id="al-just" rows="2" placeholder="De dónde sale la meta (mínimo 10 caracteres; 30 si supera la estimación en más de 30 %)"></textarea><div id="al-meta-av" class="small"></div>`;
 if(i==4){const im=S.importaciones&&S.importaciones[0];return `<p class="small">Carga tu base con el importador de la v0.6: cédula solo como huella, fuente y evidencia por fila, deduplicación y reporte de rechazos. La dirección, si viene, solo sirve para ubicar el municipio.</p>
  <div class="row" style="flex-wrap:wrap"><button class="btn pri" id="al-imp" type="button">⬆ Importar Excel/CSV</button>${im?`<span class="chip ok" data-al-imp="${H(im.id)}">${H(im.id)}: ${fmt(im.cargadas||0)} cargadas · ${fmt(im.rechazadas||0)} rechazadas</span><button class="btn ok" id="al-g4" type="button">Usar ${H(im.id)} y seguir →</button>`:""}</div>
  <label for="al-omit" style="margin-top:12px">¿Aún no tienes base? Omite este paso con un motivo</label><textarea id="al-omit" rows="2" placeholder="Ej.: la base llega de los coordinadores la próxima semana"></textarea><button class="btn" id="al-g4o" type="button" style="margin-top:6px">Omitir por ahora y seguir →</button>`}
 if(i==5){const f=(a.pasos[5]||{}).campos||{};return `<p class="small">Generamos la política de tratamiento y el aviso de privacidad con los datos de la campaña. <b>Debe revisarla un abogado</b> antes de publicarla.</p>
  <label for="al-resp">Responsable del tratamiento</label><input type="text" id="al-resp" value="${H(f.responsable||"Campaña "+p1.candidato+" ("+(UNI.includes(p1.cargo)?"candidatura":"candidata o candidato")+") — "+C.partido)}">
  <label for="al-doc">NIT o cédula del responsable</label><input type="text" id="al-doc" value="${H(f.documento||"")}" placeholder="NIT 900.000.000-0"><label for="al-correo">Correo para derechos de los titulares</label><input type="email" id="al-correo" value="${H(f.correo||"")}" placeholder="datos@campana.co">
  <label for="al-tel">Teléfono</label><input type="tel" id="al-tel" value="${H(f.telefono||"")}" placeholder="300 000 0000"><label for="al-dir">Dirección</label><input type="text" id="al-dir" value="${H(f.direccion||"")}" placeholder="Calle 19 # 10-20, Tunja">
  <button class="btn" id="al-gen" type="button" style="margin-top:8px">Generar política</button><label for="al-pol" style="margin-top:8px">Política (puedes editarla)</label><textarea id="al-pol" rows="10"></textarea>
  <label class="ck"><input type="checkbox" id="al-pol-ok"> La revisé y la adopto como política de la campaña (versión v1.0).</label><div class="row"><button class="btn sm" id="al-pol-dl" type="button">⬇ Descargar .txt</button></div>`}
 if(i==6){const fila=(r,n)=>`<div class="row al-inv" style="flex-wrap:wrap;gap:6px;margin-top:6px"><select class="f" data-inv="rol" aria-label="Rol" style="flex:1;min-width:150px">${Object.entries(ROL_INV).map(([k,v])=>`<option value="${k}" ${k==r?"selected":""}>${v}</option>`).join("")}</select><input type="text" data-inv="nombre" placeholder="Nombre" aria-label="Nombre" value="${H(n||"")}" style="flex:2;min-width:150px"><input type="text" data-inv="contacto" placeholder="Celular o correo" aria-label="Contacto" style="flex:2;min-width:150px"><select class="f" data-inv="mun" aria-label="Municipio" style="flex:1;min-width:120px">${(p1.ambito=="departamento"?window.MUNICIPIOS_BOY.map(m=>m[1]):[p1.circ]).map(m=>`<option>${H(m)}</option>`).join("")}</select></div>`;
  return `<p class="small">Invita al equipo. Cada persona recibe un enlace de un solo uso (envío simulado en la demo) y entra con su rol. El <b>jurídico</b> es obligatorio: revisa la política, la carta de IA y las solicitudes de los titulares.</p><div id="al-invs">${p1.rol=="gerente"?"":fila("gerente")}${fila("juridico")}${fila("contador")}${fila("ctestigos")}</div>
  <button class="btn sm" id="al-add" type="button" style="margin-top:6px">＋ Agregar persona</button><p class="muted small">Se guarda solo una huella del contacto y del enlace (minimización).</p>`}}
T.V.ALTA=()=>{const l=T.altas();
 if(!ALTA)return `<h1>🚀 Alta de campaña</h1><p class="sub">Una campaña nueva lista en <b>72 horas o menos</b>: 6 pasos guiados (cargo, lista, meta, importación, política de datos y roles). Se crea en este navegador, separada de la demo de Boyacá.</p>
  <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:12px">${PASOS.map((p,i)=>`<span class="chip">${i+1}. ${p}</span>`).join("")}</div>
  ${l.length?`<div class="card" id="al-lista" style="margin-bottom:14px"><h2>Campañas creadas en este equipo</h2><div class="list small">${l.map(a=>{const e=T.altaEstado(a);return `<div class="row b"><span><b>${H(a.pasos[1].candidato)}</b> · ${H(a.pasos[1].cargo)} ${H(a.pasos[1].circ)}<br><span class="muted">${e.lista?"Lista en "+durTxt(e.horas):"Paso "+(e.hechos+1)+" de 6"}</span></span><button class="btn sm" data-al-abrir="${H(a.id)}" type="button">Abrir</button></div>`}).join("")}</div></div>`:""}${paso1HTML()}`;
 const a=alta(),e=T.altaEstado(a),i=e.faltan[0];
 return `<h1>🚀 Alta: ${H(a.pasos[1].candidato)}</h1><p class="sub">${H(C.campana)}</p>
 <div class="row" style="flex-wrap:wrap;gap:6px">${PASOS.map((p,k)=>`<span class="chip ${a.pasos[k+1]?"ok":k+1==i?"wa":""}" data-paso-ok="${a.pasos[k+1]?1:0}">${a.pasos[k+1]?"✓":k+1}. ${p}</span>`).join("")}</div>
 <p style="margin-top:10px"><span class="chip ${e.dentro72?"ok":"er"}" id="al-crono" data-horas="${e.horas.toFixed(3)}">⏱ ${e.lista?"Lista en ":""}${durTxt(e.horas)} ${e.lista?"":"desde el inicio"} · meta ≤ 72 h</span></p>
 ${e.lista?`<div class="card ok" id="al-ok"><h2>✓ Campaña lista en ${durTxt(e.horas)}</h2><p class="small">Los 6 pasos están completos. Recarga para aplicar la red, la política y los roles en toda la app.</p><div class="row" style="flex-wrap:wrap"><button class="btn pri" id="al-recargar" type="button">Abrir la campaña lista</button><a class="btn" href="#/TABLERO">Ir al tablero</a><button class="btn" id="al-volver" type="button">Volver a la demo</button></div>${(a.pasos[6].enlaces||[]).length?`<h2 style="margin-top:12px">Invitaciones (envío simulado)</h2><div class="list small" id="al-enlaces">${a.pasos[6].enlaces.map(x=>`<div class="row b"><span>${H(x.n)} · ${H(x.rol)}</span><code style="word-break:break-all">${H(x.url)}</code></div>`).join("")}</div>`:""}</div>`
 :`<div class="card" id="al-paso" data-paso="${i}"><h2>Paso ${i} de 6 · ${PASOS[i-1]}</h2>${pasoHTML(i,a)}<div class="row" style="margin-top:12px;flex-wrap:wrap">${i!=4?`<button class="btn pri" id="al-sig" type="button">${i==6?"Terminar el alta ✓":"Guardar y seguir →"}</button>`:""}<button class="btn" id="al-volver" type="button">Volver a la demo</button></div></div>`}`};
const politica=(f,a)=>{const p1=a.pasos[1];return `POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES · v1.0 (borrador generado el ${T.fecha(T.hoyISO())}; debe revisarla un abogado)
${C.campana}

1. Responsable del tratamiento: ${f.responsable}, ${f.documento}. Contacto: ${f.correo} · ${f.telefono} · ${f.direccion}.
2. Encargado: ${C.privacidad.encargado}.
3. Finalidad: organizar la campaña, contactar a los titulares por los canales que autoricen uno a uno, invitarlos a eventos y coordinar el voluntariado y el día electoral. No se venden ni se ceden datos.
4. Dato sensible: la opinión política es un dato sensible (Ley 1581 de 2012, art. 5). Responder es facultativo; solo el titular declara su apoyo, con autorización explícita y aparte, y puede retirarlo cuando quiera.
5. Derechos del titular: conocer, actualizar, rectificar y suprimir sus datos, revocar la autorización, pedir prueba de ella, oponerse al contacto y quejarse ante la SIC.
6. Canal de atención: ${f.correo} o el botón «Mis datos» de cada formulario y mensaje. Consultas: 10 días hábiles (prorrogables 5); reclamos: 15 días hábiles (prorrogables 8). La revocatoria y la oposición se aplican al instante.
7. Inteligencia artificial: se rige por la Carta de IA responsable; no se envían bases de titulares a herramientas de IA.
8. Conservación: hasta el cierre de la rendición de cuentas de la elección del ${T.fecha(p1.fecha)}; luego se suprimen.
9. Alojamiento: ${C.privacidad.alojamiento}.
10. Vigencia: desde su publicación. Normas: Ley 1581 de 2012, Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y Circular SIC 002 de 2026 (por verificar).`};
const POL_REQ=[["responsable",/responsable/i],["finalidad",/finalidad/i],["derechos",/derechos/i],["canal o correo",/canal|@/i],["dato sensible",/sensible/i]];
T.after.ALTA=()=>{const q=s=>document.querySelector(s);
 if(!ALTA){const cargo=q("#al-cargo"),circ=q("#al-circ");const ajusta=()=>{const dep=["Asamblea","Gobernación"].includes(cargo.value);[...circ.options].forEach(o=>o.disabled=dep?o.value!="__dep":o.value=="__dep");if(dep)circ.value="__dep";else if(circ.value=="__dep")circ.value="Tunja"};cargo.onchange=ajusta;ajusta();
  q("#al-crear").onclick=()=>{const cand=q("#al-cand").value.trim(),f=q("#al-fecha").value,rol=q("#al-rol").value;
   if(cand.length<5){T.toast("Escribe el nombre completo de la candidatura");return}if(!q("#al-dsp").checked){T.toast("Debes declarar que no eres servidor público con prohibición");return}
   if(!/^\d{4}-\d{2}-\d{2}$/.test(f)||f<=new Date().toLocaleDateString("en-CA",{timeZone:"America/Bogota"})){T.toast("La fecha de la elección debe ser futura");return}
   const id=hex(4),ahora=new Date().toISOString(),a={id,creada:ahora,iniciada:ahora,pasos:{1:{t:ahora,candidato:cand,cargo:cargo.value,ambito:circ.value=="__dep"?"departamento":"municipio",circ:circ.value=="__dep"?"Boyacá":circ.value,fecha:f,rol,declara_no_servidor_publico:true}},lista_en:null};
   const l=T.altas();l.push(a);guardarAltas(l);const P2=BASE+"c_"+id+"_";localStorage.setItem(P2+"rol",JSON.stringify(rol));localStorage.setItem(P2+"decl",JSON.stringify({[rol]:true}));
   T.log("alta.crear","Campaña nueva "+id+" ("+cargo.value+" "+a.pasos[1].circ+") creada con el asistente; se abre en su propio espacio");T.abrirCampana(id)};return}
 const a=alta(),e=T.altaEstado(a);if(q("#al-recargar"))q("#al-recargar").onclick=()=>location.reload();if(e.lista)return;const i=e.faltan[0];
 const hecho=(d,txt)=>{a.pasos[i]=Object.assign({t:new Date().toISOString()},d);if(i==6){a.lista_en=new Date().toISOString()}guardarAlta(a);T.log("alta.paso","Paso "+i+" de 6 ("+PASOS[i-1]+"): "+txt+(i==6?" · campaña lista en "+durTxt(T.altaEstado(a).horas):""));T.toast(i==6?"✓ Campaña lista":"✓ Paso "+i+" guardado");T.rerender()};
 if(i==2)q("#al-sig").onclick=()=>{const pa=q("#al-partido").value.trim();if(pa.length<3){T.toast("Escribe el partido o movimiento");return}const uni=!q("#al-cur");
  const d={partido:pa,tipo_voto:q("#al-voto").value,curules:uni?1:+q("#al-cur").value,candidatos:uni?1:+q("#al-ncand").value,renglon:uni?1:+q("#al-reng").value};
  if(!uni&&(!(d.curules>=1)||!(d.candidatos>=1)||!(d.renglon>=1)||d.renglon>d.candidatos)){T.toast("Revisa curules, candidatos y renglón");return}
  C.partido=pa;C.electoral.curules=d.curules;C.finanzas.candidatosLista=d.candidatos;hecho(d,pa+" · "+d.tipo_voto)};
 if(i==3){const ids=["al-nodos","al-int","al-cont","al-ver","al-conv"],calc=()=>({nodos:+q("#al-nodos").value||0,integrantes:+q("#al-int").value||0,contactos:+q("#al-cont").value||0,verificacion:+q("#al-ver").value||0,conversion:+q("#al-conv").value||0});
  const up=()=>{const es=estimada(calc());q("#al-est").textContent=fmt(es);if(!q("#al-meta").dataset.tocado)q("#al-meta").value=es;const m=+q("#al-meta").value;q("#al-meta-av").innerHTML=m>es*1.3?'<span class="chip wa">La meta supera en más de 30 % la estimación: sustenta con al menos 30 caracteres</span>':""};
  ids.forEach(x=>q("#"+x).oninput=up);q("#al-meta").oninput=()=>{q("#al-meta").dataset.tocado=1;up()};up();
  q("#al-sig").onclick=()=>{const c=calc(),es=estimada(c),m=+q("#al-meta").value,j=q("#al-just").value.trim();if(!(m>0)){T.toast("La meta debe ser mayor que cero");return}
   if(j.length<(m>es*1.3?30:10)){T.toast(m>es*1.3?"La meta supera la estimación: sustenta con al menos 30 caracteres":"Escribe el sustento (mínimo 10 caracteres)");return}
   S.calcBU=c;S.metaDecl={v:1,valor:m,just:j,hist:[]};T.save();hecho({calc:c,estimada:es,meta:m,just:j},"meta "+fmt(m)+" votos (estimación "+fmt(es)+")")}}
 if(i==4){q("#al-imp").onclick=()=>T.clicks["#imp"](q("#al-imp"));const ob=new MutationObserver(()=>{if(!document.querySelector(".modal")){ob.disconnect();if(T.ruta()=="ALTA")T.rerender()}});setTimeout(()=>ob.observe(document.body,{childList:true}),50);
  q("#al-g4")&&(q("#al-g4").onclick=()=>{const im=S.importaciones[0];hecho({importacion_id:im.id,cargadas:im.cargadas||0},"importación "+im.id)});
  q("#al-g4o").onclick=()=>{const mo=q("#al-omit").value.trim();if(mo.length<10){T.toast("Escribe el motivo (mínimo 10 caracteres)");return}hecho({omitir_motivo:mo},"omitido: "+mo)}}
 if(i==5){const campos=()=>({responsable:q("#al-resp").value.trim(),documento:q("#al-doc").value.trim(),correo:q("#al-correo").value.trim(),telefono:q("#al-tel").value.trim(),direccion:q("#al-dir").value.trim()});
  q("#al-gen").onclick=()=>{const f=campos();if(f.responsable.length<5||f.documento.length<5||!/@/.test(f.correo)||f.telefono.replace(/\D/g,"").length<7||f.direccion.length<5){T.toast("Completa responsable, documento, correo, teléfono y dirección");return}q("#al-pol").value=politica(f,a)};
  q("#al-pol-dl").onclick=()=>{if(!q("#al-pol").value){T.toast("Primero genera la política");return}T.descargar("politica_datos_v1.txt",q("#al-pol").value)};
  q("#al-sig").onclick=async()=>{const txt=q("#al-pol").value,f=campos(),falta=POL_REQ.filter(([,r])=>!r.test(txt)).map(x=>x[0]);if(!txt){T.toast("Primero genera la política");return}
   if(falta.length){T.toast("A la política le falta: "+falta.join(", "));return}if(!q("#al-pol-ok").checked){T.toast("Marca que la revisaste y la adoptas");return}
   const h=await T.sha(txt);hecho({campos:f,texto:txt,hash:h,version:"v1.0"},"política v1.0 adoptada (huella "+h.slice(0,12)+"…)")}}
 if(i==6){const fila=document.querySelector(".al-inv").outerHTML;q("#al-add").onclick=()=>{q("#al-invs").insertAdjacentHTML("beforeend",fila);const u=[...document.querySelectorAll(".al-inv")].pop();u.querySelector('[data-inv="rol"]').value="coordmun";u.querySelectorAll("input").forEach(x=>x.value="")};
  q("#al-sig").onclick=async()=>{const inv=[...document.querySelectorAll(".al-inv")].map(r=>({rol:r.querySelector('[data-inv="rol"]').value,nombre:r.querySelector('[data-inv="nombre"]').value.trim(),contacto:r.querySelector('[data-inv="contacto"]').value.trim(),mun:r.querySelector('[data-inv="mun"]').value})).filter(x=>x.nombre||x.contacto);
   if(inv.some(x=>x.nombre.length<3||x.contacto.replace(/\s/g,"").length<7)){T.toast("Cada invitación necesita nombre y celular o correo");return}
   if(!inv.some(x=>x.rol=="juridico")){T.toast("Falta invitar al jurídico de la campaña (obligatorio)");return}
   const out=[],enl=[];for(const x of inv){const tok=hex(16);out.push({rol:x.rol,nombre:x.nombre,mun:x.mun,contacto_h:await T.sha(x.contacto.toLowerCase().replace(/\s/g,"")),token_h:await T.sha(tok),vence:new Date(Date.now()+7*DIA).toISOString()});enl.push({n:x.nombre,rol:ROL_INV[x.rol]||x.rol,url:T.urlBase()+"#/invitacion/"+tok})}
   hecho({invitaciones:out,enlaces:enl},out.length+" invitaciones (incluye jurídico; envío simulado)")}}};
// Barra de la campaña nueva y «Volver a la demo» en todas las vistas
{const r0=T.render;T.render=ruta=>{r0(ruta);if(!ALTA)return;const el=T.$("#main"),f=el&&el.querySelector(".ficticio");if(!f)return;const e=T.altaEstado(alta());if(!e)return;
 f.insertAdjacentHTML("afterend",`<div class="alta-bar" id="alta-bar" role="note">🚀 <b>${H(ALTA.pasos[1].candidato)}</b> · ${e.lista?"campaña lista en "+durTxt(e.horas):"alta "+e.hechos+"/6 · "+durTxt(e.horas)} <span class="sp"></span>${e.lista?"":'<a class="btn sm" href="#/ALTA">Continuar el alta</a>'}<button class="btn sm" id="alta-demo" type="button">Volver a la demo</button></div>`)}}
T.onClick("#alta-demo",()=>T.volverDemo());
// Roles sin nodo propio en una campaña nueva
if(ALTA){if(!D.red.some(n=>n.rol=="Líder"))delete T.ROLES.lider;if(!D.red.some(n=>n.rol=="Coordinador municipal"))delete T.ROLES.coordmun;if(!T.ROLES[S.rol])S.rol="candidato"}
// Reinicio de la demo en 1 clic (modo presentación): borra todo lo terr03_ de este equipo, incluidas las campañas creadas
T.resetTodo=()=>{Object.keys(localStorage).filter(k=>k.startsWith(BASE)&&!/ia_/.test(k)).forEach(k=>localStorage.removeItem(k))};
// Enlaces públicos en el inicio
{const v0=T.V.inicio;T.V.inicio=()=>v0()+`<p class="muted small" id="pie-publico" style="text-align:center;margin-top:18px"><a href="#/mis-datos">Mis datos (titulares)</a> · <a href="#/carta-ia">Carta de IA responsable</a>${T.puede("ALTA")?' · <a href="#/ALTA">Alta de campaña nueva</a>':""}</p>`}
// ---------- Migración v0.7 de datos guardados (sin pérdida) ----------
{const guardado=localStorage.getItem(C.prefijo+"personas")!=null;let n=0;
 S.personas.forEach(p=>{if(!("asignacion" in p)){marcar(p,"manual");n++}});S.solicitudes.forEach(s=>{if(!s.origen){s.origen="equipo";n++}});
 if(n&&guardado){T.migracion07=n;const ib=T.initBit;T.initBit=async()=>{await ib();await T.log("migracion.v07",n+" registros: municipio DIVIPOLA (código) en fichas y origen en solicitudes (sin pérdida de datos)","sistema")}}}
})();
