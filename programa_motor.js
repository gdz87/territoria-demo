/* Territoria v0.8 · motor de alertas A-01..A-10 de la maqueta: espejo de app.prog_evaluar / app.prog_evaluar_texto (schema.sql §v0.8).
   Usa las MISMAS reglas (window.PROG_REGLAS, generado desde reglas.json). Puro: sirve en el navegador y en Node (tests/programa_motor.test.mjs
   compara su salida con la de PGlite frase por frase). */
(function(root){
"use strict";
const DE="ÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜÑáàâäéèêëíìîïóòôöúùûüñ",A="aaaaeeeeiiiioooouuuunaaaaeeeeiiiioooouuuun";
// = app.norm_txt: lower(translate(...)) y todo lo que no sea a-z0-9 → espacio
const norm=t=>{let s="";for(const ch of String(t??"")){const i=DE.indexOf(ch);s+=i>=0?A[i]:ch}return s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()};
const quitaVars=t=>String(t??"").replace(/\{\{e:[0-9]+\}\}/g," ");
// = app.prog_texto
const texto=p=>[p.titulo,p.problema,p.causas,p.objetivo,p.programa,p.indicador,p.costo_metodo,p.sin_costo].filter(x=>x!=null).join(" . ");
function crear(R){
 const cargos=new Map(R.cargos.map(c=>[c.cargo,c]));const comp=R.competencias.map(c=>({cargo:c[0],accion:c[1],verbo:c[2],objeto:c[3],base:c[4],aval:c[5]}));
 const reglas=R.patrones.map(x=>({codigo:x[0],ambito:x[1],re:new RegExp(x[2]),mensaje:x[3]}));const exc=new RegExp(R.excepciones_cifra,"g");
 const cifras=t=>{let s=" "+norm(String(t??"").replace(/\{\{e:[0-9]+\}\}/g,""))+" ";s=s.replace(exc," ").replace(/ (19|20)[0-9][0-9] /g," ");return(s.match(/[0-9]+/g)||[]).length};
 const lr=t=>{const out=[];for(const r of reglas.filter(r=>r.codigo=="A-08"||r.codigo=="A-09").sort((a,b)=>a.codigo<b.codigo?-1:a.codigo>b.codigo?1:0))if(r.re.test(t))out.push({codigo:r.codigo,severidad:"bloqueante",mensaje:r.mensaje});return out};
 const primera=(cod,amb,t,sev)=>{for(const r of reglas)if(r.codigo==cod&&(!amb||r.ambito==amb)&&r.re.test(t))return[{codigo:cod,severidad:sev,mensaje:r.mensaje}];return[]};
 // = app.prog_evaluar_texto
 const evaluarTexto=(cargo,txt)=>{const g=cargos.get(cargo);if(!g)throw new Error("Cargo desconocido");const t=" "+norm(txt)+" ";
  return[...(g.ejecuta?[]:primera("A-01",null,t,"bloqueante")),...primera("A-02",g.cargo,t,"alta"),...lr(t)]};
 // = app.prog_evaluar. ctx: {cargo, otras:[propuestas de la campaña], capacidad, capFuente}
 const evaluar=(p,ctx)=>{const g=cargos.get(ctx.cargo),out=[],add=(codigo,severidad,mensaje)=>out.push({codigo,severidad,mensaje});
  const t=" "+norm(quitaVars(texto(p)))+" ",acc=p.acciones||[];
  if(!g.ejecuta)out.push(...primera("A-01",null,t,"bloqueante"));
  for(const a of acc)if(!comp.some(c=>c.cargo==g.cargo&&c.accion==a))add("A-01","bloqueante","La acción «"+a+"» no está en el catálogo de competencias de "+g.etiqueta+".");
  if(!String(p.requiere_aval||"").trim()){const av=[...new Set(comp.filter(c=>c.cargo==g.cargo&&acc.includes(c.accion)&&c.aval).map(c=>c.aval))];
   if(av.length)add("A-02","alta","La acción elegida requiere iniciativa o aval: "+av.join("; "));else out.push(...primera("A-02",g.cargo,t,"alta"))}
  const sinCosto=p.costo==null||p.costo==="",fin=(p.fin||[]).length;
  if((sinCosto&&!String(p.sin_costo||"").trim())||(!sinCosto&&!fin))add("A-03",g.tipo=="ejecutivo"?"bloqueante":"alta",sinCosto?"Falta el costo estimado o la justificación de «sin costo directo para el cargo».":"Falta la fuente posible de financiación.");
  else if(g.tipo=="ejecutivo"&&sinCosto)add("A-03","bloqueante","En cargos ejecutivos la propuesta necesita costo estimado y fuente.");
  if(cifras(texto(p))>0)add("A-04","bloqueante","Hay cifras escritas a mano: enlázalas a un registro de evidencia ({{e:N}}).");
  if((p.evid||[]).some(e=>e.verif=="no_hallado"))add("A-04","bloqueante","Una cita enlazada no se halló en la página indicada (R-EV-03).");
  if(!String(p.indicador||"").trim()||!String(p.linea_base||"").trim())add("A-05","alta","La meta no tiene línea base o indicador.");
  if(!(p.alin||[]).length)add("A-06","media","Sin alineación con el PDD, el PND o los ODS.");
  if((ctx.otras||[]).some(o=>o.codigo!=p.codigo&&!["retirada","rechazada"].includes(o.estado)&&norm(o.titulo)==norm(p.titulo)))add("A-07","media","Hay otra propuesta con el mismo título.");
  out.push(...lr(t));
  if(g.tipo=="ejecutivo"&&ctx.capacidad!=null&&ctx.capacidad!==""){const tot=(ctx.otras||[]).filter(o=>!["retirada","rechazada"].includes(o.estado)).reduce((s,o)=>s+(+o.costo||0),0);
   if(tot>+ctx.capacidad)add("A-10","alta","El costo total del programa supera la capacidad estimada ("+(ctx.capFuente||"sin fuente")+").")}
  return out};
 return{norm,texto,cifras,evaluar,evaluarTexto,lineasRojas:t=>lr(" "+norm(t)+" "),cargos,comp,R}}
const api={crear,norm,texto};
if(typeof module!="undefined"&&module.exports)module.exports=api;
if(root){root.PROG_MOTOR_API=api;if(root.PROG_REGLAS)root.PROG_MOTOR=crear(root.PROG_REGLAS)}
})(typeof window!="undefined"?window:null);
