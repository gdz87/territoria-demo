// Datos FICTICIOS. Municipios reales de Boyacá (DIVIPOLA); personas, cifras, mesas y partido inventados.
(function(){
let s=20271031; const R=()=>(s=(s*1103515245+12345)%2147483648)/2147483648;
const pick=a=>a[Math.floor(R()*a.length)], C=window.CONFIG;
const peso={Tunja:150,Duitama:100,Sogamoso:105,Chiquinquirá:60,"Puerto Boyacá":48,Paipa:28,Moniquirá:22,Samacá:18,Garagoa:16,Nobsa:15,Aquitania:14,Tibasosa:12,"Villa de Leyva":15,Ventaquemada:13,Saboyá:11,Ramiriquí:10};
const municipios=window.MUNICIPIOS_BOY.map(([cod,n,lat,lon,p,aprox])=>{const mesas=peso[n]?Math.round(peso[n]*2.3):(6+Math.floor(R()*14));const censo=mesas*(290+Math.floor(R()*30));
 const v23=Math.round(censo*.5*(0.025+R()*0.03));const meta=Math.round(v23*(0.9+R()*0.6));const prometidos=Math.round(meta*(0.9+R()*1.0));const verificados=Math.round(prometidos*(0.35+R()*0.45));const confirmados=Math.round(verificados*(0.6+R()*0.3));
 return {cod,n,lat,lon,p,aprox:!!aprox,mesas,censo,v23,meta,prometidos,verificados,confirmados,rural:n=="Puerto Boyacá"?"Inspección":R()>.5?"Vereda":"Corregimiento"}});
const N=["Ana","Luis","Marta","Jorge","Diana","Camilo","Sandra","Óscar","Paola","Andrés","Yenny","Fabio","Lucía","Héctor","Rosa","Wilson","Nubia","Edwin","Claudia","Julián","Gloria","Miguel","Liliana","Fredy","Carmen","Iván","Patricia","Nelson","Adriana","Ricardo"];
const A=["Rojas","Pérez","Suárez","Camargo","Vargas","Becerra","Sánchez","Barón","Moreno","Cely","Ávila","Higuera","Pinzón","Torres","Fonseca","Niño","Castro","Patiño","Reyes","Molano","Cárdenas","Parra"];
const nombre=()=>pick(N)+" "+pick(A)+" "+pick(A),tel=()=>"3"+(10+Math.floor(R()*15))+Math.floor(1000000+R()*8999999);
const provincias=[...new Set(municipios.map(m=>m.p))];
// Red de N niveles: candidata → gerente → coord. provincial → coord. municipal → líder → sublíder
const red=[];let id=1;const add=(o)=>{o.id="N"+id++;red.push(o);return o};
const cand=add({nombre:C.candidato,rol:"Candidata",prov:"Boyacá",mun:"Tunja",padre:null});const ger=add({nombre:"Mauricio Pinzón Reyes",rol:"Gerente de campaña",prov:"Boyacá",mun:"Tunja",padre:cand.id});
provincias.forEach(p=>{const ms=municipios.filter(m=>m.p==p).sort((a,b)=>b.mesas-a.mesas);const cp=add({nombre:nombre(),rol:"Coordinador provincial",prov:p,mun:ms[0].n,padre:ger.id});
 ms.slice(0,Math.min(4,ms.length)).forEach(m=>{const cm=add({nombre:nombre(),rol:"Coordinador municipal",prov:p,mun:m.n,padre:cp.id});const nl=1+Math.floor(R()*3)+(m.mesas>50?2:0);
  for(let i=0;i<nl;i++){const l=add({nombre:nombre(),rol:"Líder",prov:p,mun:m.n,padre:cm.id,zona:(R()>.5?m.rural+" ":"Barrio ")+pick(["La Esperanza","San Isidro","El Rosal","Alto Grande","Pueblo Viejo","La Vega","El Carmen","Santa Bárbara","Las Flores","Centro"])});
   const ns=Math.floor(R()*3);for(let k=0;k<ns;k++)add({nombre:nombre(),rol:"Sublíder",prov:p,mun:m.n,padre:l.id});}})});
red.forEach(n=>{const base=["Líder","Sublíder"].includes(n.rol);n.meta=base?30+Math.floor(R()*90):0;n.prometidos=base?Math.round(n.meta*(0.8+R()*1.6)):0;n.verificados=base?Math.floor(n.prometidos*(0.2+R()*0.7)):0;
 n.capacitaciones=Math.floor(R()*4);n.tel=tel();n.puestos=base?1+Math.floor(R()*3):0;n.testigos=base?Math.floor(R()*4):0;n.puntos=n.verificados*3+n.capacitaciones*10+n.testigos*5;});
// Lista del partido ficticio (16 candidatos), con voto preferente estimado
const lista=[{n:C.candidato,num:3,nuestra:true}].concat([...Array(15)].map((_,i)=>({n:nombre(),num:i<2?i+1:i+2})));
lista.forEach(c=>c.pref2023=c.nuestra?0:Math.floor(1500+R()*14000));lista.sort((a,b)=>a.num-b.num);
const otrasListas=[["Partido Azul Andino (ficticio)",.21],["Alianza Verde Montaña (ficticia)",.17],["Cambio Regional (ficticio)",.14],["Unión Campesina (ficticia)",.10],["Liberales del Centro (ficticio)",.08],["Fuerza Ciudadana Tunja (ficticia)",.05],["Movimiento Nuevo Norte (ficticio)",.03]];
// CRM
const lideres=red.filter(n=>["Líder","Sublíder"].includes(n.rol));
// v0.5: nadie califica la afinidad de otra persona. Estado de relación verificable (decisión del asesor, §9).
const relaciones=["autorizado","voluntario","contactado","participa"];
const canales=["Formulario con código al celular","QR de líder","Papel firmado (foto)","Evento con QR"];
const puestosN=["I.E. Técnica","Escuela Normal Superior","Colegio Departamental","Coliseo Municipal","I.E. Rural","Casa de la Cultura"];
const personas=[];for(let i=0;i<220;i++){const l=pick(lideres);const m=municipios.find(x=>x.n==l.mun);const pend=R()<.12;
 const fecha=new Date(2027,5+Math.floor(R()*2),1+Math.floor(R()*28),8+Math.floor(R()*10),Math.floor(R()*60));const ver=R();
 personas.push({id:"P"+(1000+i),nombre:nombre(),tel:tel(),cedula:R()>.4?"****"+Math.floor(1000+R()*8999):null,mun:m.n,prov:m.p,vereda:(R()>.4?m.rural+" ":"Barrio ")+pick(["La Esperanza","San Isidro","El Rosal","Alto Grande","Pueblo Viejo","La Vega","El Carmen","Las Flores"]),
  puesto:pick(puestosN)+" "+m.n,mesa:1+Math.floor(R()*m.mesas),verif:ver<.5?"Declarado por el titular":ver<.85?"Verificado con el titular (cédula y puesto)":"Sin verificar",
  estado:pick(relaciones),apoyoDecl:null,oposicion:R()<.04,lider:l.id,mayor:true,
  consent:{estado:pend?"pendiente":"vigente",contacto:true,afinidad:!pend&&R()>.2,whatsapp:!pend&&R()>.15,sms:R()>.5,llamada:R()>.3,correo:R()>.6,canal:pick(canales),fecha:fecha.toISOString(),version:R()>.3?"Aviso v2.0":"Aviso v1.2",hash:null},origen:pick(["Líder","QR","Evento","Formulario web"])});}
{let z=7;const r2=()=>(z=(z*16807)%2147483647)/2147483647;const DIA=864e5;
 personas.forEach((p,i)=>{if(p.oposicion)p.estado="baja";else if(p.consent.estado=="pendiente"){p.estado="referido_pendiente";p.caduca=new Date(new Date(p.consent.fecha).getTime()+30*DIA).toISOString()}
  // Referidos: algunas personas llegaron por el enlace de otra persona autorizada de la misma red
  if(i>20&&r2()<.3){const cand=personas.slice(0,i).filter(x=>x.lider==p.lider&&!["referido_pendiente","baja"].includes(x.estado));if(cand.length)p.refPor=cand[Math.floor(r2()*cand.length)].id}
  // Apoyo declarado: SOLO lo marca el titular, con autorización aparte para dato sensible
  if(p.estado!="baja"&&p.estado!="referido_pendiente"&&p.consent.afinidad&&r2()<.35)p.apoyoDecl={fecha:p.consent.fecha,canal:"Formulario del titular",evidencia:"Casilla aparte, no premarcada"}})}
// Solicitudes de titulares (ARCO)
const solicitudes=[{id:"S-001",persona:"P1003",tipo:"Consulta",fecha:"2027-08-09",estado:"Abierta",canal:"Correo"},{id:"S-002",persona:"P1017",tipo:"Supresión",fecha:"2027-08-02",estado:"Abierta",canal:"Formulario"},{id:"S-003",persona:"P1040",tipo:"Rectificación",fecha:"2027-07-28",estado:"Respondida",canal:"WhatsApp"},{id:"S-004",persona:"P1088",tipo:"Reclamo",fecha:"2027-08-12",estado:"Abierta",canal:"Correo"}];
// Contenido 2027 (piezas de propaganda solo desde el 1-sep; antes, contenido no propagandístico)
const redes=["Facebook","Instagram","X","TikTok","YouTube","LinkedIn"];
const temas=["Vías terciarias","Agua y campo","Jóvenes y empleo","Turismo","Salud rural","Educación"];
const piezas=[];const hoy=new Date(C.fechaDemo+"T12:00:00");
for(let i=0;i<30;i++){const d=new Date(hoy);d.setDate(hoy.getDate()-12+Math.floor(R()*30));const k=d.toISOString().slice(0,10);const prop=k>=C.calendario.propagandaMedios&&R()>.3;const pasada=d<hoy;
 const e=pasada?"Publicada":pick(["Idea","Borrador","En revisión","Aprobada","Programada"]);
 piezas.push({id:"C"+i,titulo:prop?pick(["Propuesta: ","Vota por la lista: ","Compromiso con "])+pick(temas):pick(["Escuchamos a ","Recorrido por ","Diálogo ciudadano en ","Así vive "])+pick(municipios.slice(0,40)).n,tema:pick(temas),redes:[pick(redes)],formato:pick(["Video vertical 30 s","Carrusel","Reel 15 s","Short","En vivo","Imagen"]),fecha:k,estado:e,propaganda:prop,ia:R()>.7,revisada:true,alcance:e=="Publicada"?Math.floor(2000+R()*40000):0,interacciones:e=="Publicada"?Math.floor(100+R()*3000):0,registros:e=="Publicada"?Math.floor(R()*40):0});}
// Día E: puestos y mesas de muestra (8 municipios)
const mesas=[];["Tunja","Duitama","Sogamoso","Paipa","Villa de Leyva","Garagoa","Soatá","Miraflores"].forEach(mn=>{const np=mn=="Tunja"?4:2;for(let pu=1;pu<=np;pu++){const nm=4+Math.floor(R()*4);for(let k=1;k<=nm;k++){const insc=280+Math.floor(R()*40),vot=Math.floor(insc*(.45+R()*.15));
 const nuestra=Math.floor(vot*(.12+R()*.1)),cand=Math.floor(nuestra*(.3+R()*.3)),soloLista=Math.floor(nuestra*.15),blanco=Math.floor(vot*.04),nulos=Math.floor(vot*.02),noMarc=Math.floor(vot*.01);
 const comp=lista.filter(c=>!c.nuestra).slice(0,3).map(c=>({n:c.n,v:Math.floor((nuestra-cand-soloLista)/3)}));
 mesas.push({id:mn.slice(0,3).toUpperCase()+"-P"+pu+"-M"+k,mun:mn,puesto:pick(puestosN)+" "+mn+" (puesto "+pu+")",mesa:k,inscritos:insc,e11:vot,testigo:R()>.12?nombre():null,turno:R()>.5?"Jornada completa":"Mañana / tarde",acreditado:R()>.2,
  oficial:{cand,soloLista,nuestra,otras:vot-nuestra-blanco-nulos-noMarc,blanco,nulos,noMarc,comp,total:vot},e14:null,reclamacion:null});}}});
const bitacora=[["2027-07-20T09:12:00-05:00","gerente","campana.inscripcion","Inscripción de la candidata registrada (E-6) · fecha desde la cual se puede recaudar y gastar"],["2027-07-21T15:30:00-05:00","gerente","usuarios.alta","Alta de 12 coordinadores con verificación de dos pasos"],["2027-08-02T10:05:00-05:00","juridico","titular.solicitud","Solicitud de supresión S-002 recibida (vence en 15 días hábiles)"],["2027-08-05T18:40:00-05:00","lider","crm.registro","38 registros sincronizados desde Vereda El Rosal (Paipa) tras 31 h sin señal"],["2027-08-12T11:00:00-05:00","contador","finanzas.aporte","Aporte rechazado: aportante declaró contratos estatales > 50 % (art. 27)"],["2027-08-15T08:20:00-05:00","cm","contenido.bloqueo","Pieza marcada como propaganda bloqueada antes del 1-sep (art. 35)"],["2027-08-18T16:10:00-05:00","gerente","exportacion","Exportación de 180 registros aprobada por gerente y oficial de datos"]];
const aportes=[{id:"A1",fecha:"2027-07-22",aportante:"Laura Camargo Niño",doc:"CC ****4410",tipo:"Recursos propios",valor:45000000,ok:true},{id:"A2",fecha:"2027-07-29",aportante:"Jorge Camargo Ávila",doc:"CC ****2231",tipo:"Familiar (hasta 4.º grado)",valor:30000000,ok:true},{id:"A3",fecha:"2027-08-03",aportante:"Carmen Suárez Torres",doc:"CC ****9012",tipo:"Particular persona natural",valor:12000000,ok:true},{id:"A4",fecha:"2027-08-10",aportante:"Crédito Banco Andino (ficticio)",doc:"NIT ****001",tipo:"Crédito entidad financiera",valor:60000000,ok:true},{id:"A5",fecha:"2027-08-14",aportante:"Edwin Barón Cely",doc:"CC ****7720",tipo:"Particular persona natural",valor:8000000,ok:true}];
const gastos=[{id:"G1",fecha:"2027-07-25",concepto:"Publicidad impresa (volantes, afiches)",cat:"Propaganda electoral",valor:18500000},{id:"G2",fecha:"2027-08-01",concepto:"Transporte del equipo de campaña (logística interna)",cat:"Transporte del equipo (no votantes)",valor:9200000},{id:"G3",fecha:"2027-08-06",concepto:"Arriendo de sede Tunja",cat:"Sedes",valor:6000000},{id:"G4",fecha:"2027-08-12",concepto:"Licencia de software de campaña",cat:"Administración",valor:4500000},{id:"G5",fecha:"2027-08-16",concepto:"Pauta digital en Meta (pagada por la campaña)",cat:"Propaganda electoral",valor:15000000}];
window.DATA={municipios,provincias,red,personas,piezas,redes,mesas,temas,lista,otrasListas,solicitudes,bitacora,aportes,gastos};
})();
