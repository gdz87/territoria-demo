/* Territoria v0.7 · Lote 1c (antes de core.js): espacio de una campaña creada con el asistente de alta (012).
   Si terr03_activa apunta a un alta guardada en terr03_altas, la app abre ESA campaña con su propio prefijo
   (terr03_c_<id>_) y datos de arranque vacíos; si no, abre la demo de Boyacá sin cambios. Todo en este navegador. */
(function(){
"use strict";
const C=window.CONFIG,BASE=C.prefijo;window.TERR_BASE=BASE;window.TERR_ALTA=null;
let altas=[],act=null;try{altas=JSON.parse(localStorage.getItem(BASE+"altas")||"[]");act=JSON.parse(localStorage.getItem(BASE+"activa")||"null")}catch(e){}
const a=Array.isArray(altas)&&altas.find(x=>x&&x.id==act);if(!a||!a.pasos||!a.pasos[1])return;
window.TERR_ALTA=a;const D=window.DATA,D3=window.DATA3,clone=x=>JSON.parse(JSON.stringify(x));
const p1=a.pasos[1],p2=a.pasos[2]||{},p3=a.pasos[3]||{},p5=a.pasos[5]||{};
const hoy=new Date().toLocaleDateString("en-CA",{timeZone:"America/Bogota"});
const addD=(iso,n)=>{const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const addM=(iso,n)=>{const d=new Date(iso+"T12:00:00");d.setMonth(d.getMonth()+n);return d.toISOString().slice(0,10)};
const dep=p1.ambito=="departamento";
C.prefijo=BASE+"c_"+a.id+"_";
C.candidato=p1.candidato;C.cargo=p1.cargo;C.fechaEleccion=p1.fecha;C.fechaDemo=hoy;
C.campana="Campaña "+p1.candidato+" · "+p1.cargo+(dep?" de Boyacá":" de "+p1.circ)+" "+p1.fecha.slice(0,4);
C.partido=p2.partido||"Partido o movimiento (por definir en el paso 2)";
C.calendario=Object.assign({},C.calendario,{propagandaEspacioPublico:addM(p1.fecha,-3),propagandaMedios:addD(p1.fecha,-60)});
C.electoral=Object.assign({},C.electoral,{curules:+p2.curules||C.electoral.curules});
C.finanzas=Object.assign({},C.finanzas,{candidatosLista:+p2.candidatos||C.finanzas.candidatosLista});
if(p5.campos){const f=p5.campos;C.privacidad=Object.assign({},C.privacidad,{version:"Política "+(p5.version||"v1.0"),responsable:f.responsable,nit:f.documento,
 contacto:f.correo+" · "+f.telefono+" · "+f.direccion,canal:f.correo+" o el botón «Mis datos» del formulario",politicaURL:f.url||"(publicar con el sitio de la campaña)",encargado:C.privacidad.encargado})}
// Datos de arranque: municipios reales (DIVIPOLA) de la circunscripción, cifras de campaña en cero; lo demás vacío.
D.municipios=D.municipios.filter(m=>dep||m.n==p1.circ).map(m=>Object.assign({},m,{meta:0,prometidos:0,verificados:0,confirmados:0}));
D.provincias=[...new Set(D.municipios.map(m=>m.p))];
const cab=dep?"Tunja":p1.circ,z={meta:0,prometidos:0,verificados:0,capacitaciones:0,tel:"",puestos:0,testigos:0,puntos:0};
const red=[Object.assign({id:"N1",nombre:p1.candidato,rol:"Candidata",prov:"Boyacá",mun:cab,padre:null},z)];
const inv=(a.pasos[6]&&a.pasos[6].invitaciones)||[],ger=inv.find(i=>i.rol=="gerente");
red.push(Object.assign({id:"N2",nombre:ger?ger.nombre:"Gerencia (por invitar)",rol:"Gerente de campaña",prov:"Boyacá",mun:cab,padre:"N1"},z));
let k=3;inv.filter(i=>i.rol=="coordmun"||i.rol=="lider").forEach(i=>{const mu=D.municipios.find(m=>m.n==i.mun)||D.municipios[0];
 red.push(Object.assign({id:"N"+k++,nombre:i.nombre,rol:i.rol=="lider"?"Líder":"Coordinador municipal",prov:mu.p,mun:mu.n,padre:"N2"},z))});
D.red=red;D.personas=[];D.piezas=[];D.mesas=[];D.solicitudes=[];D.aportes=[];D.gastos=[];
D.lista=[{n:p1.candidato,num:+p2.renglon||1,nuestra:true,pref2023:0}];D.otrasListas=[["Otras listas (por cargar)",1]];
D.bitacora=[[a.creada,p1.rol||"candidato","campana.alta","Alta iniciada con el asistente de 6 pasos: "+C.campana]];
if(D3){D3.objetivo="ganar";D3.calcBU=p3.calc||{nodos:1,integrantes:10,contactos:10,verificacion:70,conversion:65};
 D3.metaDecl={v:1,valor:+p3.meta||0,just:p3.just||"Por definir en el paso 3 del alta",hist:[]};D3.ritmoSemanal=0;
 D3.brujula={v:1,fecha:hoy,objetivo:"Meta declarada: "+(+p3.meta||0)+" votos (paso 3 del alta). Por precisar con el equipo.",prioridades:["Completar el alta","Importar la base con fuente y evidencia","Invitar a los coordinadores"],mensaje:"",acuses:{}};
 D3.plan=[];D3.fases=Object.assign({},D3.fases,{inicio:hoy});D3.hitos=p1.fecha=="2027-10-31"?D3.hitos.filter(h=>h.fija):[];
 D3.eventos=[];D3.decisiones=[];D3.kpiFases={reconocimiento:0,voluntarios:0,registrosContenido:0};D3.segmentos=[];
 Object.keys(D3.iaF||{}).forEach(f=>D3.iaF[f]={on:false});D3.iaProv={acepta:false};D3.faq=[];D3.proveedores=[];D3.reportes=[]}
})();
