/* Territoria v0.6 · Lote 1b: calidad del dato y embudo.
   006 importación Excel/CSV con cédula (solo huella), fuente y evidencia por fila, dedupe y reporte de rechazos ·
   003 embudo con umbral, cifra repartidora, posición e inflación configurable (solo agregados) ·
   005 bitácora de capturas (quién, cuándo, dispositivo) y carga anómala retenida hasta revisión de cumplimiento ·
   015 ranking solo por actividad verificable e insignias sin valor económico · 010 rótulo «Conteo interno, no oficial».
   Todo en el navegador con datos ficticios; la regla de producción está en fase1/db/schema.sql (v0.6). */
(function(){
"use strict";
const T=window.T,{C,D,S,H}=T,fmt=T.fmt,DIA=864e5;
// ---------- Estado persistente (prefijo terr03_ conservado) ----------
S.param=Object.assign({inflacion:.4,carga:{n:500,min:10}},T.ls("param",{}));
S.capturas=T.ls("capturas",[]);S.alertas=T.ls("alertas",[]);S.importaciones=T.ls("importaciones",[]);S.insignias=T.ls("insignias",[]);
S.pepper=T.ls("pepper",null)||[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,"0")).join("");
{const s0=T.save;T.save=()=>{s0();["param","capturas","alertas","importaciones","insignias","pepper"].forEach(k=>T.lsSet(k,S[k]))}}
// ---------- Migración v0.6 de datos guardados (sin pérdida): fuente, canal de captura y retención ----------
{const guardado=localStorage.getItem(C.prefijo+"personas")!=null;let n=0;
 S.personas.forEach(p=>{if(!("fuente" in p)){p.fuente=p.origen||"captura en la app";p.app=/Digitaci/.test(p.origen||"")?"digitacion":/enlace/i.test(p.origen||"")?"enlace":"app";p.retenido=p.retenido||null;n++}});
 if(n&&guardado){T.migracion06=n;const ib=T.initBit;T.initBit=async()=>{await ib();await T.log("migracion.v06",n+" fichas: se agregan fuente, canal de captura y estado de retención (sin pérdida de datos)","sistema")}}}
// ---------- 006 · cédula solo como huella con secreto de la campaña ----------
T.cedulaHash=async ced=>{const d=String(ced||"").replace(/\D/g,"");return d.length<5||d.length>10?null:T.sha("cedula|"+S.pepper+"|"+d)};
// Las fichas de ejemplo solo traen los últimos 4 dígitos; para la demo se completa una cédula ficticia y se guarda solo su huella.
T.cedulaFicticia=p=>p.cedula&&/\d{4}$/.test(p.cedula)&&/^P\d+$/.test(p.id)?"10"+String(parseInt(p.id.slice(1))%10000).padStart(4,"0")+p.cedula.slice(-4):null;
{const ib=T.initBit;T.initBit=async()=>{await ib();let k=0;for(const p of S.personas)if(p.cedula&&!p.cedulaH){const f=T.cedulaFicticia(p);if(f){p.cedulaH=await T.cedulaHash(f);k++}}if(k)T.save()}}
// ---------- 005 · captura: quién, cuándo, dispositivo; carga anómala y territorio ----------
T.dispositivo=()=>{const ua=navigator.userAgent;const so=/Android/i.test(ua)?"Android":/iPhone|iPad/i.test(ua)?"iOS":/Windows/i.test(ua)?"Windows":/Mac OS/i.test(ua)?"macOS":/Linux/i.test(ua)?"Linux":"otro";
 const nav=/Edg\//.test(ua)?"Edge":/Chrome\//.test(ua)?"Chrome":/Firefox\//.test(ua)?"Firefox":/Safari\//.test(ua)?"Safari":"otro";return so+" · "+nav+" · "+(matchMedia("(max-width: 700px)").matches?"celular":"PC")};
const nombreRol=r=>(T.ROLES[r]||{n:r=="titular"?"Titular (enlace público)":r}).n;
T.alertaCarga=(rol,motivo)=>{let a=S.alertas.find(x=>x.rol==rol&&x.motivo==motivo&&x.estado=="abierta");
 if(!a){a={id:"AC-"+String(S.alertas.length+1).padStart(3,"0"),rol,motivo,desde:new Date().toISOString(),registros:0,estado:"abierta"};S.alertas.push(a);
  T.log("captura.alerta",a.id+" · "+(motivo=="carga_anomala"?"carga anómala":"fuera del territorio")+" de "+nombreRol(rol)+" → revisión de cumplimiento")}
 a.registros++;return a};
T.territorio=nodo=>new Set(T.subarbol(nodo).map(n=>n.mun));
T.capturar=(p,app,lote)=>{const t=new Date().toISOString(),rol=app=="enlace"?"titular":S.rol,w=S.param.carga;
 p.app=app;p.disp=T.dispositivo();p.capt=t;p.capturadoPor=p.capturadoPor||rol;if(!p.fuente)p.fuente=app=="enlace"?"enlace de referido":"captura en la app";
 const n=S.capturas.filter(c=>c.rol==rol&&Date.now()-new Date(c.t)<w.min*60000).length;let ret=null;
 if(n+1>w.n){const a=T.alertaCarga(rol,"carga_anomala");ret={motivo:"Carga anómala: más de "+w.n+" registros en "+w.min+" min",alerta:a.id}}
 else if(app!="enlace"&&T.nodoRol()&&!T.territorio(T.nodoRol()).has(p.mun)){const a=T.alertaCarga(rol,"fuera_de_territorio");ret={motivo:"Fuera del territorio asignado ("+p.mun+")",alerta:a.id}}
 p.retenido=ret;S.capturas.push({pid:p.id,rol,t,disp:p.disp,app,lote:lote||null,ret:!!ret});return p};
{const e0=T.embudo;T.embudo=l=>e0(l.filter(p=>!p.retenido))}   // los retenidos no cuentan hasta la revisión
T.revisarAlerta=(id,liberar)=>{const a=S.alertas.find(x=>x.id==id);if(!a||a.estado!="abierta"||S.rol!="juridico")return -1;const af=S.personas.filter(p=>p.retenido&&p.retenido.alerta==id);
 T.accion("captura.revision",id+": "+af.length+" registros "+(liberar?"liberados":"descartados")+" por cumplimiento",()=>{if(liberar)af.forEach(p=>{p.retenido=null});else S.personas=S.personas.filter(p=>!af.includes(p));a.estado=liberar?"liberada":"descartada";a.revisado=new Date().toISOString();T.save()});return af.length};
T.onClick("[data-acl]",t=>{const n=T.revisarAlerta(t.dataset.acl,true);n<0?T.toast("Solo el oficial de cumplimiento revisa las alertas"):T.toast(n+" registros liberados");T.rerender()});
T.onClick("[data-acd]",t=>{const n=T.revisarAlerta(t.dataset.acd,false);n<0?T.toast("Solo el oficial de cumplimiento revisa las alertas"):T.toast(n+" registros descartados (suprimidos)");T.rerender()});
// ---------- 006 · importación ----------
T.puedeImportar=()=>["candidato","gerente","coordmun","lider","digitador"].includes(S.rol);
const norm=s=>String(s??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
const ALIAS={nombre:["nombre","nombres","nombre_completo","nombres_y_apellidos"],telefono:["telefono","celular","movil","tel","numero_celular"],cedula:["cedula","documento","cc","numero_de_documento","no_documento","cedula_de_ciudadania"],
 municipio:["municipio","ciudad"],fuente:["fuente","origen","procedencia"],evidencia:["evidencia","soporte","prueba","evidencia_ref"],mayor_edad:["mayor_edad","mayor_de_edad","mayor","es_mayor_de_edad"],
 autoriza:["autoriza","autorizacion","autoriza_tratamiento","autorizo"],whatsapp:["whatsapp","wa"],sms:["sms"],llamada:["llamada","llamadas"],correo:["correo","email","e_mail"]};
const SENS=/^(apoyo|apoyo_declarado|nivel_de_apoyo|nivel_apoyo|afinidad|voto|intencion_de_voto|partido|opinion|simpatia)$/;
const SI=v=>/^(si|sí|s|x|1|true|verdadero)$/i.test(String(v??"").trim());
const PLANTILLA="nombre;celular;cedula;municipio;fuente;evidencia;mayor_edad;autoriza;whatsapp;sms;llamada;correo\r\nAna Ejemplo Rojas;3101234567;1049000001;Paipa;Planilla evento Paipa 12-oct;Formato F-001 firmado;si;si;si;no;si;no\r\n";
T.leerCSV=txt=>{txt=String(txt).replace(/^\ufeff/,"");const l0=txt.split(/\r?\n/)[0]||"";const sep=(l0.match(/;/g)||[]).length>=(l0.match(/,/g)||[]).length?";":",";const rows=[];let row=[],cur="",q=false;
 const fin=()=>{row.push(cur);cur="";if(row.some(x=>x.trim()!==""))rows.push(row);row=[]};
 for(let i=0;i<txt.length;i++){const ch=txt[i];if(q){if(ch=='"'){if(txt[i+1]=='"'){cur+='"';i++}else q=false}else cur+=ch}else if(ch=='"')q=true;else if(ch==sep){row.push(cur);cur=""}else if(ch=="\n"||ch=="\r"){if(ch=="\r"&&txt[i+1]=="\n")i++;fin()}else cur+=ch}
 if(cur!==""||row.length)fin();return rows};
T.leerXLSX=async buf=>{if(!window.JSZip)throw new Error("Lector de Excel no disponible");const z=await JSZip.loadAsync(buf);const xml=async f=>{const e=z.file(f);return e?new DOMParser().parseFromString(await e.async("string"),"application/xml"):null};
 const ss=await xml("xl/sharedStrings.xml"),strs=ss?[...ss.getElementsByTagName("si")].map(si=>[...si.getElementsByTagName("t")].map(t=>t.textContent).join("")):[];
 let hoja="xl/worksheets/sheet1.xml";
 try{const wb=await xml("xl/workbook.xml"),rel=await xml("xl/_rels/workbook.xml.rels"),s1=wb.getElementsByTagName("sheet")[0];const rid=s1.getAttribute("r:id")||s1.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id");
  const r=[...rel.getElementsByTagName("Relationship")].find(x=>x.getAttribute("Id")==rid);if(r){const tg=r.getAttribute("Target");hoja=tg.startsWith("/")?tg.slice(1):"xl/"+tg.replace(/^\.\//,"")}}catch(e){}
 const sh=await xml(hoja);if(!sh)throw new Error("El archivo no tiene hojas");const out=[];
 for(const r of sh.getElementsByTagName("row")){const fila=[];for(const c of r.getElementsByTagName("c")){const ref=c.getAttribute("r")||"";const col=ref.replace(/\d+/g,"").split("").reduce((a,ch)=>a*26+ch.charCodeAt(0)-64,0)-1;const t=c.getAttribute("t");let v="";
   if(t=="s"){const x=c.getElementsByTagName("v")[0];v=x?strs[+x.textContent]||"":""}else if(t=="inlineStr")v=[...c.getElementsByTagName("t")].map(x=>x.textContent).join("");else{const x=c.getElementsByTagName("v")[0];v=x?x.textContent:""}
   fila[col>=0?col:fila.length]=v}
  for(let i=0;i<fila.length;i++)if(fila[i]===undefined)fila[i]="";if(fila.some(x=>String(x).trim()!==""))out.push(fila)}
 return out};
T.filasImport=tabla=>{if(tabla.length<2)throw new Error("El archivo no tiene filas de datos");const idx={},ignor=[];
 tabla[0].forEach((h0,i)=>{const h=norm(h0),k=Object.keys(ALIAS).find(k=>ALIAS[k].includes(h));if(k&&idx[k]==null)idx[k]=i;else if(SENS.test(h))ignor.push(String(h0).trim())});
 return{faltan:["nombre","cedula","fuente","evidencia","mayor_edad"].filter(k=>idx[k]==null),ignor,filas:tabla.slice(1).map(r=>{const o={};for(const k in idx)o[k]=String(r[idx[k]]??"").trim();return o})}};
T.validarImport=async filas=>{const vistos={},res=[],a=T.alcance();
 for(let i=0;i<filas.length;i++){const r=filas[i],fila=i+2,tel=(r.telefono||"").replace(/\D/g,""),ced=(r.cedula||"").replace(/\D/g,""),mu=D.municipios.find(x=>norm(x.n)==norm(r.municipio));let m=null,h=null,ex=null;
  if((r.nombre||"").length<3)m="Falta el nombre";else if((r.fuente||"").length<3)m="Falta la fuente";else if((r.evidencia||"").length<3)m="Falta la evidencia";
  else if(!SI(r.mayor_edad))m="Sin constancia de mayoría de edad";else if(ced.length<5||ced.length>10)m="Cédula inválida";
  else if(tel&&!/^3\d{9}$/.test(tel))m="Celular inválido";else if(!mu)m="Municipio no reconocido";
  else if(tel&&S.noContactar.includes(await T.sha(tel)))m="La persona pidió no ser contactada";
  if(!m){h=await T.cedulaHash(ced);if(vistos[h])m="Cédula repetida en el archivo (fila "+vistos[h]+")";else vistos[h]=fila}
  if(!m){ex=S.personas.find(p=>p.cedulaH==h)||null;if(ex&&!(S.rol=="digitador"?ex.capturadoPor=="digitador":(!a||a.has(ex.lider))))m="La cédula ya está registrada en la campaña"}
  res.push({fila,r,tel,ced,h,mu,ex,m,accion:m?"rechazo":ex?"fusion":"carga"})}
 return res};
T.cargarImport=(res,meta)=>{const id="IMP-"+String(S.importaciones.length+1).padStart(3,"0"),t=new Date().toISOString(),base=100000+S.importaciones.length*6000;let car=0,fus=0;const nuevos=[];
 for(const x of res){if(x.accion=="fusion"){if(!x.ex.tel&&x.tel)x.ex.tel=x.tel;(x.ex.fuentes=x.ex.fuentes||[]).push(x.r.fuente+" · "+meta.archivo);fus++;T.log("importacion.fusion",id+" fila "+x.fila+" → "+x.ex.id)}
  else if(x.accion=="carga"){const aut=SI(x.r.autoriza);
   const p={id:"P"+(base+car),nombre:x.r.nombre,tel:x.tel,cedula:"****"+x.ced.slice(-4),cedulaH:x.h,mun:x.mu.n,prov:x.mu.p,vereda:"Por declarar",puesto:"Por declarar",mesa:"—",verif:"Importado con evidencia",
    estado:aut?"autorizado":"referido_pendiente",apoyoDecl:null,capturadoPor:S.rol,oposicion:false,mayor:true,lider:meta.nodo,origen:"Importación "+id+" ("+meta.archivo+")",fuente:x.r.fuente,evidencia:x.r.evidencia,lote:id,
    consent:{estado:aut?"vigente":"pendiente",contacto:true,afinidad:false,whatsapp:aut&&SI(x.r.whatsapp),sms:aut&&SI(x.r.sms),llamada:aut&&SI(x.r.llamada),correo:aut&&SI(x.r.correo),
     canal:aut?"Importación con evidencia: "+x.r.evidencia:"Importación sin autorización (falta confirmar con el titular)",fecha:t,version:C.privacidad.version,hash:null}};
   if(!aut)p.caduca=new Date(Date.now()+30*DIA).toISOString();T.capturar(p,S.rol=="digitador"?"digitacion":"importacion",id);nuevos.push(p);car++}}
 S.personas=nuevos.reverse().concat(S.personas);
 const rech=res.filter(x=>x.accion=="rechazo").map(x=>({fila:x.fila,motivo:x.m}));
 const imp={id,archivo:meta.archivo,rol:S.rol,nodo:meta.nodo,t,total:res.length,cargadas:car,fusionadas:fus,rechazadas:rech.length,rechazos:rech,
  advertencias:meta.ignor.length?["Se ignoraron columnas de apoyo u opinión ("+meta.ignor.join(", ")+"): solo el titular declara su apoyo"]:[]};
 S.importaciones.unshift(imp);T.save();T.log("importacion.lote",id+": "+res.length+" filas, "+car+" cargadas, "+fus+" fusionadas, "+rech.length+" rechazadas ("+meta.archivo+")");return imp};
T.descargarRechazos=imp=>{const rows=[["fila_en_archivo","motivo"]].concat(imp.rechazos.map(x=>[x.fila,x.motivo]));
 T.descargar("rechazos_"+imp.id+".csv","\ufeff"+"Reporte de rechazos "+imp.id+" · "+imp.archivo.replace(/[;\r\n]/g," ")+" · "+T.fechaHora(imp.t)+"\r\n"+rows.map(r=>r.map(c=>/[;"\r\n]/.test(String(c))?'"'+String(c).replace(/"/g,'""')+'"':c).join(";")).join("\r\n"),"text/csv;charset=utf-8");
 T.log("importacion.reporte","Reporte de rechazos "+imp.id+" descargado ("+imp.rechazos.length+" filas; solo fila y motivo)")};
T.onClick("[data-imprep]",t=>{const imp=S.importaciones.find(x=>x.id==t.dataset.imprep);imp&&T.descargarRechazos(imp)});
T.onClick("#imp",()=>{if(!T.puedeImportar()){T.toast("Tu rol no importa personas");return}
 const nodos=T.nodoRol()?T.subarbol(T.nodoRol()):D.red.filter(n=>["Líder","Sublíder","Coordinador municipal"].includes(n.rol));
 const m=T.modal(`<h2>Importar Excel o CSV</h2><p class="muted small">Columnas obligatorias: <b>nombre, cédula, fuente, evidencia y mayor de edad</b>. Opcionales: celular, municipio, autoriza, WhatsApp, SMS, llamada y correo. La cédula se guarda solo como huella (para no duplicar) y se muestra enmascarada.</p>
 <ul class="small muted"><li>Misma cédula dos veces en el archivo: se rechaza la segunda.</li><li>Cédula que ya está en tu red: se fusiona (solo completa datos vacíos).</li><li>Cédula registrada en otra rama: se rechaza sin decir dónde está.</li><li>Columnas de apoyo, afinidad o voto: se ignoran (solo el titular declara su apoyo).</li></ul>
 <label for="imp-n">Asignar a</label><select class="f" id="imp-n">${nodos.map(n=>`<option value="${n.id}">${H(n.nombre)} · ${H(n.rol)} (${H(n.mun)})</option>`).join("")}</select>
 <label for="imp-f">Archivo (.xlsx o .csv)</label><input type="file" id="imp-f" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
 <div class="row" style="flex-wrap:wrap;margin-top:6px"><button class="btn sm" id="imp-pl" type="button">⬇ Plantilla CSV</button></div><div id="imp-out" class="small" style="margin-top:10px"></div>`,{wide:true});
 const q=s=>m.querySelector(s);q("#imp-pl").onclick=()=>T.descargar("plantilla_importacion.csv","\ufeff"+PLANTILLA,"text/csv;charset=utf-8");
 q("#imp-f").onchange=async e=>{const f=e.target.files[0];if(!f)return;const out=q("#imp-out");out.innerHTML='<p class="muted">Leyendo…</p>';
  try{const tabla=/\.xlsx$/i.test(f.name)?await T.leerXLSX(await f.arrayBuffer()):T.leerCSV(await f.text());const fi=T.filasImport(tabla);
   if(fi.faltan.length){out.innerHTML=`<p class="warn" data-faltan>Faltan columnas obligatorias: <b>${H(fi.faltan.join(", "))}</b>. Descarga la plantilla.</p>`;return}
   if(fi.filas.length>5000){out.innerHTML='<p class="warn">Máximo 5000 filas por archivo.</p>';return}
   const res=await T.validarImport(fi.filas),n=k=>res.filter(x=>x.accion==k).length;
   out.innerHTML=`<div class="kpis k2" data-prev><div class="kpi"><div class="l">Filas</div><div class="v" data-n="total">${res.length}</div></div><div class="kpi"><div class="l">Se cargan</div><div class="v" data-n="carga" style="color:var(--ok)">${n("carga")}</div></div><div class="kpi"><div class="l">Se fusionan (misma cédula en tu red)</div><div class="v" data-n="fusion">${n("fusion")}</div></div><div class="kpi"><div class="l">Rechazadas</div><div class="v" data-n="rechazo" style="color:var(--wa)">${n("rechazo")}</div></div></div>
   ${fi.ignor.length?`<p class="warn small" data-ignoradas>Se ignoran las columnas «${H(fi.ignor.join("», «"))}»: nadie declara el apoyo de otra persona.</p>`:""}
   ${n("rechazo")?`<div class="tw"><table class="small"><tr><th>Fila</th><th>Motivo del rechazo</th></tr>${res.filter(x=>x.m).slice(0,12).map(x=>`<tr><td>${x.fila}</td><td>${H(x.m)}</td></tr>`).join("")}</table></div>${n("rechazo")>12?`<p class="muted small">… y ${n("rechazo")-12} más en el reporte.</p>`:""}`:""}
   <button class="btn pri" id="imp-ok" type="button" style="width:100%;margin-top:10px" ${n("carga")+n("fusion")?"":"disabled"}>Cargar ${n("carga")} y fusionar ${n("fusion")}</button>`;
   q("#imp-ok").onclick=()=>{const imp=T.cargarImport(res,{archivo:f.name.slice(0,80),nodo:q("#imp-n").value,ignor:fi.ignor}),ret=S.personas.filter(p=>p.lote==imp.id&&p.retenido).length;
    out.innerHTML=`<p class="ok" data-imp="${imp.id}">✓ ${imp.id}: ${imp.cargadas} cargadas, ${imp.fusionadas} fusionadas, ${imp.rechazadas} rechazadas. Cada ficha guarda su fuente y su evidencia.</p>${ret?`<p class="warn small" data-retenidos>${ret} registros quedaron <b>retenidos</b> para revisión de cumplimiento (carga anómala o fuera del territorio).</p>`:""}${imp.rechazadas?'<button class="btn" id="imp-rep" type="button">⬇ Reporte de rechazos (CSV)</button>':""}`;
    const b=q("#imp-rep");b&&(b.onclick=()=>T.descargarRechazos(imp));T.rerender()}}
  catch(err){out.innerHTML=`<p class="warn">No se pudo leer el archivo: ${H(err.message)}</p>`}}});
// ---------- 015 · reconocimiento sin valor económico ----------
T.DINERO=/(\$|\bpesos?\b|\bcop\b|dinero|efectivo|\bbonos?\b|\bpremios?\b|\bmercados?\b|\bregalos?\b|\brifas?\b|sorteo|\bbecas?\b|\bpagos?\b|cheque|tarjeta regalo|recompensa|comisi[oó]n|\bincentivos?\b|\d+\s*mil\b|\d{1,3}(\.\d{3})+)/i;
T.INSIGNIAS_BASE=[["Formador 1581","Al menos una capacitación verificada",n=>n.capacitaciones>=1],["Red verificada","50 o más simpatizantes verificados",n=>n.verificados>=50],["Cuida la mesa","Aporta 2 o más testigos acreditados",n=>n.testigos>=2]];
T.insigniasDe=n=>T.INSIGNIAS_BASE.filter(x=>x[2](n)).map(x=>x[0]).concat(S.insignias.filter(x=>x.nodo==n.id).map(x=>x.nombre));
T.otorgarInsignia=(nodo,nombre,criterio)=>{nombre=String(nombre||"").trim();criterio=String(criterio||"").trim();
 if(T.DINERO.test(nombre+" "+criterio))return "Las insignias son reconocimiento: no pueden tener valor económico (ni bonos, premios, mercados, rifas ni dinero).";
 if(nombre.length<3||criterio.length<3)return "Escribe el nombre y el criterio verificable";
 S.insignias.push({nodo,nombre,criterio,t:new Date().toISOString(),por:S.rol});T.save();T.log("insignia.otorgada",nombre+" → "+nodo+" ("+criterio+")");return null};
const MANDO=()=>["candidato","gerente"].includes(S.rol);
T.redExtraHTML=()=>{const nodo=T.nodoRol(),vis=(nodo?T.subarbol(nodo):D.red).filter(n=>["Líder","Sublíder"].includes(n.rol));const top=vis.slice().sort((a,b)=>b.puntos-a.puntos).slice(0,8);
 return `<div class="grid g2" style="margin-top:14px"><div class="card" id="reconoce"><h2>Reconocimiento (sin premios)</h2><p class="muted small">El ranking suma solo actividad verificable: simpatizantes verificados (× 3), capacitaciones (× 10) y testigos aportados (× 5). Las promesas no suman. El reconocimiento es con insignias, nunca con dinero, bonos, mercados ni rifas.</p>
 <div class="list small">${top.map(n=>`<div class="row b"><span>${H(n.nombre)} <span class="muted">(${H(n.mun)})</span></span><span>${T.insigniasDe(n).map(x=>`<span class="chip" data-insignia>🏅 ${H(x)}</span>`).join(" ")||'<span class="muted">—</span>'}</span></div>`).join("")}</div>
 ${MANDO()||S.rol=="coordmun"?`<h2 style="margin-top:12px">Otorgar insignia</h2><label for="ins-nodo">Líder</label><select class="f" id="ins-nodo">${vis.map(n=>`<option value="${n.id}">${H(n.nombre)}</option>`).join("")}</select><label for="ins-n">Nombre</label><input type="text" id="ins-n" placeholder="Ej.: Formador del mes"><label for="ins-c">Criterio verificable</label><input type="text" id="ins-c" placeholder="Ej.: 3 capacitaciones con lista de asistencia"><button class="btn" id="ins-g" type="button" style="margin-top:8px">Otorgar</button>`:""}</div>
 <div class="card" id="infl-param"><h2>Alerta de inflación</h2><p class="small">Se alerta cuando un líder con 10 o más registros verifica menos del <b data-infl>${Math.round(T.paramInfl()*100)} %</b> de lo que registra. Se calcula sobre conteos de su red, nunca por persona.</p>
 ${MANDO()?`<label for="p-infl">Umbral (% verificados / registrados)</label><input type="number" id="p-infl" min="5" max="95" step="5" value="${Math.round(T.paramInfl()*100)}"><button class="btn sm" id="p-infl-g" type="button" style="margin-top:8px">Guardar parámetro</button>`:'<p class="muted small">El parámetro lo fija la gerencia.</p>'}
 <p class="muted small" style="margin-top:8px">${D.red.filter(T.inflado).filter(n=>!nodo||T.alcance().has(n.id)).length} líderes en alerta con el umbral actual.</p></div></div>`};
{const v0=T.V.RED;T.V.RED=()=>v0()+T.redExtraHTML()}
T.onClick("#ins-g",()=>{const e=T.otorgarInsignia(T.$("#ins-nodo").value,T.$("#ins-n").value,T.$("#ins-c").value);if(e){T.toast(e);return}T.toast("✓ Insignia otorgada");T.rerender()});
T.onClick("#p-infl-g",()=>{if(!MANDO()){T.toast("El parámetro lo fija la gerencia");return}const v=+T.$("#p-infl").value;if(!(v>=5&&v<=95)){T.toast("Usa un valor entre 5 y 95 %");return}
 T.accion("parametro.inflacion","Umbral de inflación: "+Math.round(T.paramInfl()*100)+" % → "+v+" %",()=>{S.param.inflacion=v/100;T.save()});T.rerender()});
// ---------- 003 · fuente y método en la estrategia; 010 · exportación con rótulo ----------
T.fuenteMetodoHTML=()=>{const c=T.calc(),ts=T.TASAS;return `<div class="card" id="fuente-metodo" style="margin-top:14px"><h2>Fuente y método de las cifras</h2><table class="small">
 <tr><th>Voto estimado de la candidata</th><td><b>${fmt(c.votosCand)}</b> · agregado del embudo: verificados que no declararon × ${ts.verificado} + confirmados × ${ts.confirmado} (tasas configurables). Nunca por persona.</td></tr>
 <tr><th>Posición en la lista</th><td>${c.pos}.º · compara el voto estimado con los preferentes de los compañeros (2023 × crecimiento).</td></tr>
 <tr><th>Umbral</th><td>${fmt(c.umbral)} · ${C.electoral.umbralPctCociente} % del cociente (votos válidos ÷ curules). Censo, curules y umbral: Registraduría y CNE (por verificar).</td></tr>
 <tr><th>Cifra repartidora</th><td>${fmt(c.cifra)} · método D'Hondt entre las listas que superan el umbral.</td></tr></table>
 <button class="btn sm" id="esc-csv" type="button" style="margin-top:8px">⬇ Exportar escenario (CSV)</button></div>`};
{const v0=T.V.ESTRATEGIA;T.V.ESTRATEGIA=()=>{const h=v0();return T.ruta()=="ESTRATEGIA"||T.ruta()=="ESTRATEGIA?cifra"?h+T.fuenteMetodoHTML():h}}
T.onClick("#esc-csv",()=>{const c=T.calc();const rows=[["lista","votos_estimados","supera_umbral","curules"]].concat(c.listas.map(l=>[l.n,Math.round(l.v),l.pasa?"si":"no",l.cur]));
 rows.push([],["umbral",Math.round(c.umbral)],["cifra_repartidora",Math.round(c.cifra)],["voto_estimado_candidata",c.votosCand],["posicion_en_lista",c.pos]);
 T.descargar("escenario_lista.csv","\ufeff"+rows.map(r=>r.join(";")).join("\r\n"),"text/csv;charset=utf-8");T.log("estrategia.exportacion","Escenario de la lista (CSV, con rótulo no oficial)")});
T.onClick("#e14-csv",()=>{const g={};S.mesas.filter(m=>m.e14&&(!m.e14.revision||["no_requiere","aceptada"].includes(m.e14.revision))).forEach(m=>{const x=g[m.mun]=g[m.mun]||{mesas:0,cand:0};x.mesas++;x.cand+=+m.e14.cand||0});
 const rows=[["municipio","mesas_con_e14","votos_candidata_conteo_testigo"]].concat(Object.entries(g).map(([k,v])=>[k,v.mesas,v.cand]));
 T.descargar("conteo_interno_e14.csv","\ufeff"+T.ROTULO+" · Conteo de testigos (E-14) por municipio; no reemplaza el escrutinio oficial.\r\n"+rows.map(r=>r.join(";")).join("\r\n"),"text/csv;charset=utf-8");T.log("diae.exportacion","Conteo interno del E-14 por municipio (CSV, con rótulo no oficial)")});
{const v0=T.V.DIAE;T.V.DIAE=()=>{const h=v0();return ["candidato","gerente","ctestigos","abogado","juridico"].includes(S.rol)&&!T.ruta().includes("?")?h+'<div class="row" style="margin-top:10px"><button class="btn sm" id="e14-csv" type="button">⬇ Exportar conteo interno (CSV)</button></div>':h}}
// ---------- 005 · cumplimiento: cola de alertas, bitácora de capturas e importaciones ----------
T.capturasHTML=()=>{if(!["candidato","gerente","juridico"].includes(S.rol))return "";const ab=S.alertas.filter(a=>a.estado=="abierta"),w=S.param.carga;
 return `<div class="card" id="cola-carga" style="margin-top:14px"><h2>Carga anómala y fuera de territorio ${ab.length?`<span class="chip wa" data-alertas>${ab.length} abiertas</span>`:'<span class="chip ok" data-alertas>0 abiertas</span>'}</h2>
 <p class="muted small">Si un usuario registra más de ${w.n} personas en ${w.min} minutos, o fuera del territorio que tiene asignado, esos registros quedan <b>retenidos</b>: no se contactan ni cuentan en el embudo hasta que el oficial de cumplimiento los revise.</p>
 <div class="list small">${S.alertas.slice().reverse().slice(0,8).map(a=>{const n=S.personas.filter(p=>p.retenido&&p.retenido.alerta==a.id).length;return `<div class="row b" data-alerta="${a.id}"><span><b>${H(a.id)}</b> · ${a.motivo=="carga_anomala"?"Carga anómala":"Fuera del territorio"} · ${H(nombreRol(a.rol))} · ${T.fechaHora(a.desde)}<br><span class="muted">${n} retenidos · ${H(a.estado)}</span></span><span>${a.estado=="abierta"&&S.rol=="juridico"?`<button class="btn sm ok" data-acl="${a.id}" type="button">Liberar</button> <button class="btn sm danger" data-acd="${a.id}" type="button">Descartar</button>`:a.estado=="abierta"?'<span class="muted">Revisa cumplimiento</span>':""}</span></div>`}).join("")||'<p class="muted">Sin alertas.</p>'}</div>
 <h2 style="margin-top:12px">Bitácora de capturas</h2><div class="tw"><table class="small" id="tab-capturas"><tr><th>Cuándo</th><th>Quién</th><th>Dispositivo</th><th>Canal</th><th>Ficha</th></tr>${S.capturas.slice(-12).reverse().map(c=>`<tr><td>${T.fechaHora(c.t)}</td><td>${H(nombreRol(c.rol))}</td><td>${H(c.disp)}</td><td>${H(c.app)}${c.lote?" · "+H(c.lote):""}</td><td>${H(c.pid)}${c.ret?' <span class="chip wa">retenida</span>':""}</td></tr>`).join("")||'<tr><td colspan="5" class="muted">Aún no hay capturas.</td></tr>'}</table></div>
 <p class="muted small">${S.capturas.length} capturas registradas. En producción, el dispositivo y la huella del origen (nunca el IP en claro) los toma el servidor.</p>
 ${S.importaciones.length?`<h2 style="margin-top:12px">Importaciones</h2><div class="list small">${S.importaciones.slice(0,6).map(i=>`<div class="row b"><span><b>${H(i.id)}</b> · ${H(i.archivo)} · ${H(nombreRol(i.rol))}<br><span class="muted">${i.cargadas} cargadas · ${i.fusionadas} fusionadas · ${i.rechazadas} rechazadas</span></span>${i.rechazadas?`<button class="btn sm" data-imprep="${i.id}" type="button">⬇ Rechazos</button>`:""}</div>`).join("")}</div>`:""}</div>`};
{const v0=T.V.CUMPLIMIENTO;T.V.CUMPLIMIENTO=()=>v0()+T.capturasHTML()}
// ---------- 010 · rótulo «Conteo interno, no oficial» en toda cifra de votos ----------
T.ROTULO="Conteo interno, no oficial";
T.rotuloHTML=()=>`<div class="rotulo-no-oficial" data-rotulo role="note"><b>${T.ROTULO}</b> · Las cifras de votos son estimaciones o conteos de la campaña. Los resultados oficiales son los de la Registraduría.</div>`;
T.CIFRA_VOTOS=/\d[\d.,]*\s*(?:%\s*)?(?:de\s+)?(?:votos?|preferentes|curul(?:es)?)\b|\b(?:votos?(?:\s+estimados?)?|voto estimado|preconteo|escrutinio|cifra repartidora|umbral|cociente)\b[^.\n]{0,40}?\d/i;
T.cifraVotos=t=>T.CIFRA_VOTOS.test(String(t||""));
{const r0=T.render;T.render=ruta=>{r0(ruta);const el=T.$("#main");if(!el||el.querySelector("[data-rotulo]")||!T.cifraVotos(el.textContent))return;
 const f=el.querySelector(".ficticio");f?f.insertAdjacentHTML("afterend",T.rotuloHTML()):el.insertAdjacentHTML("afterbegin",T.rotuloHTML())}}
{const m0=T.modal;T.modal=(html,opt)=>m0(!/data-rotulo/.test(html)&&T.cifraVotos(String(html).replace(/<[^>]+>/g," "))?T.rotuloHTML()+html:html,opt)}
{const d0=T.descargar;T.descargar=(nombre,contenido,tipo)=>{if(typeof contenido=="string"&&/\.(csv|txt)$/i.test(nombre)&&T.cifraVotos(contenido.replace(/_/g," "))&&!contenido.includes(T.ROTULO)){const bom=contenido.startsWith("\ufeff")?"\ufeff":"";contenido=bom+T.ROTULO+" · Los resultados oficiales son los de la Registraduría\r\n"+contenido.replace(/^\ufeff/,"")}return d0(nombre,contenido,tipo)}}
})();
