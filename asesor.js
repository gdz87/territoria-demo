/* Territoria v0.4–v0.5 · App «Asesor»: asesor de campaña con RAG sobre la base verificada (fase1/asesor).
   - Demo pública: motor LOCAL (BM25 sobre window.ASESOR_KB + reglas de window.ASESOR_NUCLEO), sin claves ni modelo.
   - Con servidor: si CONFIG.asesor.endpoint existe, o la IA está en modo «código» con proxy, llama a POST /asesor del Worker
     (el Worker valida el código, la activación por campaña, filtra agregados k>=10 y valida el JSON); si falla, vuelve al motor local.
   - Reglas que se cumplen también aquí: solo agregados de >=10 personas; líneas rojas con rechazo y alternativa; aviso de IA;
     bitácora con la pregunta enmascarada; apagado por defecto (Gobierno de IA). */
(function(){
"use strict";
const T=window.T,KB=window.ASESOR_KB,N=window.ASESOR_NUCLEO;if(!T||!KB||!N)return;
const {C,D,S,H}=T,K=Math.max(10,N.K_MINIMO||10);
// ---------- Registro de la app, roles y gobierno de IA (sin tocar los archivos existentes) ----------
const iIA=T.APPS.findIndex(a=>a[0]=="IA");T.APPS.splice(iIA<0?T.APPS.length:iIA+1,0,["ASESOR","🧭","Asesor de campaña","Estrategia y cumplimiento con fuentes citadas"]);
["cm","juridico","contador","coordmun","lider"].forEach(r=>{const x=T.ROLES[r];if(x&&Array.isArray(x.apps)&&!x.apps.includes("ASESOR"))x.apps.push("ASESOR")});
if(T.IA&&T.IA.FUN)T.IA.FUN.asesor=["Asesor de campaña","Estrategia, plazos y cumplimiento con fragmentos verificados y citados","Agregados de al menos "+K+" personas (nunca datos individuales)","Medio"];
if(S.iaF&&!S.iaF.asesor)S.iaF.asesor={on:true};   // v0.10: encendido por defecto
S.ase=T.ls("ase_chat",[]);const save0=T.save;T.save=()=>{save0();T.lsSet("ase_chat",S.ase.slice(-40))};
const AVISO="Contenido generado con IA por el Asesor de "+C.marca+". Es orientación, no asesoría jurídica ni fuente oficial: requiere revisión y decisión de una persona de la campaña.";
const encendido=()=>!!(T.IA&&T.IA.on?T.IA.on("asesor"):S.iaF&&S.iaF.asesor&&S.iaF.asesor.on);
// ---------- Contexto agregado (k >= 10), calculado con el alcance del rol ----------
T.asesorContexto=()=>{const pv=T.personasVisibles().filter(p=>!p.oposicion&&!p.retenido),a=T.alcance(),red=D.red.filter(n=>!a||a.has(n.id)),sum=k=>red.reduce((s,n)=>s+(+n[k]||0),0);
 const porM={};pv.forEach(p=>{porM[p.mun]=(porM[p.mun]||0)+1});
 // v0.5: estado de relación y apoyo declarado por el titular, solo en conteos (nunca por persona)
 const est={};pv.forEach(p=>{if(p.estado&&p.estado!="baja")est[p.estado]=(est[p.estado]||0)+1});const TS=T.TASAS||{verificado:.4,confirmado:.8};
 const vst=pv.filter(p=>["autorizado","contactado"].includes(p.estado)).length,conf=pv.filter(p=>p.apoyoDecl&&p.consent&&p.consent.estado=="vigente"&&p.consent.afinidad).length;
 const emb={prometido:pv.filter(p=>p.estado=="referido_pendiente").length,verificado:vst,confirmado:conf,voto_estimado:T.votoEstimado?T.votoEstimado(vst,conf,pv.filter(p=>["autorizado","contactado"].includes(p.estado)&&p.apoyoDecl&&p.consent&&p.consent.estado=="vigente"&&p.consent.afinidad).length):Math.round(vst*TS.verificado+conf*TS.confirmado)};
 const fin=["candidato","gerente","contador"].includes(S.rol)?{tope:C.finanzas.topeLista,tope_estado:"ficticio (el real lo fija el CNE)",ejecutado:(S.gastos||[]).reduce((s,g)=>s+(+g.valor||0),0)}:{};
 const crudo={campana_nombre:C.campana,cargo:C.cargo,circunscripcion:"Boyacá",territorio:"Boyacá (123 municipios)",modalidad_lista:"lista con voto preferente",fecha_hoy:C.fechaDemo,fecha_eleccion:C.fechaEleccion,fecha_eleccion_estado:"por verificar",fase_actual:C.fechaDemo>=C.calendario.propagandaEspacioPublico?"campaña (propaganda en espacio público)":"precampaña",candidato_inscrito:C.fechaDemo>=C.calendario.inscripcionCandidata?"sí":"no",
  rol_usuario:T.ROLES[S.rol].n,alcance_usuario:a?"subárbol de la red ("+(T.ROLES[S.rol].n)+")":"campaña",fecha_corte_tablero:C.fechaDemo,
  indicadores:{personas_en_alcance:pv.length,prometidos:sum("prometidos"),verificados:sum("verificados"),lideres_activos:red.filter(n=>n.rol=="Líder").length,registros_autorizados:pv.filter(p=>p.consent&&p.consent.estado=="vigente").length,
   por_municipio:Object.entries(porM).map(([m,n])=>({municipio:m,n})).sort((x,y)=>y.n-x.n).slice(0,12),por_estado_relacion:est,embudo:emb,...fin}};
 // Filtro del servidor (mismo código que el Worker): lista blanca + celdas con menos de K personas → "<K"
 const r=N.filtrarAgregados(crudo,K);const c=r.contexto;
 if(typeof crudo.indicadores.personas_en_alcance=="number"&&crudo.indicadores.personas_en_alcance<K){const ind=c.indicadores;["personas_en_alcance","registros_autorizados"].forEach(k=>{if(ind[k]!==undefined&&ind[k]!==0)ind[k]="<"+K});ind.por_municipio=[];ind.por_estado_relacion={};ind.embudo={n:"<"+K}}
 return {contexto:c,suprimidas:r.informe.suprimidas}};
// ---------- Motor local (demo sin IA) ----------
const FR=KB.fragmentos.filter(f=>f.estado!=="obsoleto"),POR=new Map(FR.map(f=>[f.id,f])),bm=N.crearBM25(FR);
const limpio=s=>String(s||"").replace(/\*\*|__|`/g,"").replace(/^\s*[-*]\s+/gm,"").replace(/^\s*\d+\.\s+/gm,"").replace(/\s+/g," ").trim();
const frases=(s,n)=>(limpio(s).match(/[^.!?]+[.!?]+/g)||[limpio(s)]).slice(0,n).join(" ").trim();
const estadoDe=f=>f.estado=="por_verificar"?"por_verificar":(f.contiene_por_verificar?"mixto":"verificado");
function recuperar(q,k=5){const lex=bm(q,40).filter(([i])=>!FR[i].id.startsWith("LR-"));const top=[],pa={};for(const [i] of lex){const f=FR[i];if((pa[f.archivo]||0)>=2)continue;pa[f.archivo]=(pa[f.archivo]||0)+1;top.push(f);if(top.length>=k)break}return top}
const altDe=f=>{const m=String(f.texto).match(/\*\*Alternativas legales:\*\*([\s\S]*?)(?:\n- \*\*|$)/);return m?limpio(m[1]).split(/;\s*/).map(s=>s.replace(/\.$/,"").trim()).filter(Boolean).slice(0,3):[]};
function caducidad(){return (KB.meta.disparadores||[]).filter(d=>d.fecha<C.fechaDemo&&KB.meta.fecha_corte<d.fecha).map(d=>"Base con corte "+T.fecha(KB.meta.fecha_corte)+": desde el "+T.fecha(d.fecha)+" debía incorporarse "+d.evento+". Confirme fechas y cifras con la fuente oficial.")}
const cadCorta=()=>{const c=(KB.meta.disparadores||[]).filter(d=>d.fecha<C.fechaDemo&&KB.meta.fecha_corte<d.fecha);return c.length?["Base con corte "+T.fecha(KB.meta.fecha_corte)+" sin actualizar ("+c.map(d=>d.evento.split(" (")[0]).join("; ")+"): confirme fechas y cifras con la fuente oficial."]:[]};
const PERSONA=/\b(vota|votara|votaria|apoya|es de|esta con)\b.{0,40}\b(por nosotros|nosotros|la campana|nuestra)\b|\b(quien|quienes) (es|son|vota|votan)\b|\bdatos de (una|esa) persona\b/;
function responderLocal(q,hist){const n=N.norm(q),prev=hist.filter(m=>m.r=="u").map(m=>m.t),bloq=N.bloqueoDuro(q,prev),rem=N.remisionesPara(q+" "+(bloq.length?prev.join(" "):"")),adv=cadCorta();
 if(N.INYECCION.test(q))adv.push("Se detectaron instrucciones incrustadas en el texto; se trataron como datos y se ignoraron.");
 const pii=N.tieneDatosPersonales(q);if(pii)adv.push("La consulta traía datos personales; se enmascararon. El asesor solo trabaja con agregados (Ley 1581 de 2012).");
 if(bloq.length){const fs=bloq.map(id=>POR.get(id)).filter(Boolean),p=fs[0];const alts=[...new Set(fs.flatMap(altDe))].slice(0,3);
  return {tipo:"rechazo",respuesta_corta:"No puedo ayudar con eso. La petición toca "+fs.map(f=>f.id+" ("+f.titulo+")").join(", ")+", una línea roja de "+C.marca+" sin excepciones, aunque se presente como hipotética o autorizada.",
   rechazo:{aplica:true,lineas_rojas:bloq,razon:frases(p.texto.split("**Respuesta:**")[1]||p.texto,1)||p.titulo,riesgo:"Penal, electoral, disciplinario y reputacional, para la campaña, el candidato y quien ejecute la conducta.",alternativas:alts.length?alts:["Persuasión con propuesta y trabajo territorial verificable"],si_ya_ocurrio:"Hable con el abogado de la campaña; use el canal ético interno; si observó un posible delito, evalúe la denuncia o el reporte en «Pilas con el Voto» de la MOE."},
   fuentes:[...fs.map(f=>({id:f.id,estado:estadoDe(f)})),{id:"LR-12",estado:"verificado"}],remision_abogado:{aplica:true,tipo:"electoral",motivo:"Conducta de línea roja: si ya ocurrió o hay dudas, requiere orientación jurídica.",pregunta_para_abogado:"¿Qué riesgo penal, electoral o disciplinario tiene la conducta consultada y qué debe hacer la campaña si ya ocurrió?",hechos:[]},
   siguiente_paso:"Elija una de las alternativas legales y regístrela en el plan con responsable y fecha.",advertencias:adv}}
 if(PERSONA.test(n)||/\botra campana\b|\bla otra lista\b|\bcompanero de lista\b.{0,30}\b(datos|base|que hace)\b/.test(n)){const otra=/otra campana|otra lista|companero/.test(n);
  return {tipo:"privacidad",respuesta_corta:otra?"No tengo ni puedo dar información de otras campañas: cada campaña en "+C.marca+" está aislada y el asesor solo ve los datos agregados de la suya.":"No lo sé ni puedo saberlo: el asesor solo ve agregados de al menos "+K+" personas y nunca la opinión política de una persona.",rechazo:{aplica:false},
   diagnostico:["La opinión política es un dato sensible (Ley 1581 de 2012, art. 5): solo se trata con autorización explícita y en agregados."],estrategia:otra?["Analice a la competencia solo con información pública (resultados 2023, propaganda y declaraciones públicas)."]:["Si necesita conocer el apoyo en un municipio, use el agregado del tablero (k ≥ "+K+") y el embudo de verificación."],
   fuentes:[{id:"DAT-01",estado:estadoDe(POR.get("DAT-01")||{estado:"verificado"})},{id:"LR-11",estado:"verificado"}].filter(f=>POR.has(f.id)),remision_abogado:{aplica:false,tipo:"ninguno"},siguiente_paso:otra?"Arme la DOFA de competidores con fuentes públicas.":"Revise el agregado por municipio en «Lo que ve el asesor».",advertencias:adv}}
 const top=recuperar(q+(q.length<120&&prev.length?" "+prev.slice(-1)[0]:""),5),ctx=T.asesorContexto().contexto,ind=ctx.indicadores||{};
 const r={tipo:rem.length?"normativa":"estrategia",respuesta_corta:top.length?frases(top[0].texto,2):"No encuentro fragmentos de la base que respondan esto; reformule la pregunta o consulte al equipo.",rechazo:{aplica:false},
  diagnostico:["Tablero (corte "+T.fecha(ctx.fecha_corte_tablero)+"): personas en su alcance "+ind.personas_en_alcance+", prometidos "+ind.prometidos+", verificados "+ind.verificados+".","Fase: "+ctx.fase_actual+"; elección el "+T.fecha(C.fechaEleccion)+" (por verificar)."],
  estrategia:top.slice(1,4).map(f=>f.titulo+": "+frases(f.texto,1)),fuentes:top.map(f=>({id:f.id,estado:estadoDe(f)})),
  remision_abogado:rem.length?{aplica:true,tipo:rem[0].tipo,motivo:rem[0].motivo,pregunta_para_abogado:"¿Cómo aplica la norma al caso concreto de la campaña y qué riesgo legal tiene la decisión?",hechos:["Campaña a la "+C.cargo+" de Boyacá 2027; fecha del escenario "+T.fecha(C.fechaDemo)+"."]}:{aplica:false,tipo:"ninguno"},
  siguiente_paso:"Lea los fragmentos citados y convierta la recomendación en una tarea del plan, con responsable y fecha.",advertencias:[...adv,"Modo demostración: respuesta armada con fragmentos de la base, sin modelo de IA. Con el Asesor conectado, la respuesta se adapta a su contexto."]};
 if(top.some(f=>f.estado=="por_verificar"||f.contiene_por_verificar))r.advertencias.push("Hay datos marcados «por verificar» en los fragmentos citados: confírmelos con la fuente oficial antes de decidir.");
 return r}
// ---------- Servidor (Worker /asesor) ----------
const endpoint=()=>{const e=(C.asesor&&C.asesor.endpoint)||"";if(e)return e.replace(/\/$/,"");let m="sim";try{m=JSON.parse(localStorage.getItem("terr_ia_modo")||'"sim"')}catch(_){m=localStorage.getItem("terr_ia_modo")||"sim"}return m=="codigo"&&C.ia&&C.ia.proxy?C.ia.proxy.replace(/\/$/,""):""};
const codigo=()=>{const v=localStorage.getItem("terr_ia_codigo")||"";try{return JSON.parse(v)}catch(_){return v}};
async function responderServidor(q,hist,ctx){const ac=new AbortController(),to=setTimeout(()=>ac.abort(),45000);
 try{const r=await fetch(endpoint()+"/asesor",{method:"POST",headers:{"Content-Type":"application/json","X-Codigo":codigo()},body:JSON.stringify({pregunta:q,contexto:ctx,historial:hist.slice(-6).map(m=>({r:m.r,t:m.r=="u"?m.t:(m.o&&m.o.respuesta_corta)||""}))}),signal:ac.signal});
  const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error((j.error&&j.error.message)||("HTTP "+r.status));return {o:j.salida,meta:j.meta,aviso:j.aviso_ia,modo:"servidor"}}finally{clearTimeout(to)}}
async function responder(q){const hist=S.ase.slice(-6),ctx=T.asesorContexto().contexto;
 if(endpoint()){try{return await responderServidor(q,hist,ctx)}catch(e){const o=responderLocal(q,hist);o.advertencias=[...(o.advertencias||[]),"No se pudo usar el servidor del Asesor ("+e.message+"); se respondió en modo demostración."];return {o,modo:"local"}}}
 const o=responderLocal(q,hist);const esp=T.asesorEspecial&&T.asesorEspecial(q);if(esp&&o.tipo!="rechazo"){o.respuesta_corta=esp.respuesta_corta;o.diagnostico=esp.diagnostico.concat(o.diagnostico||[]);o.recomendaciones=esp.recomendaciones.concat(o.recomendaciones||[]);o.advertencias=(o.advertencias||[]).concat(esp.advertencias);o.historico=true}T.asesorAvisos&&T.asesorAvisos(q,o);return {o,modo:"local"}}
// ---------- Vista ----------
const lista=(t,a)=>a&&a.length?`<h3>${t}</h3><ul>${a.map(x=>`<li>${H(x)}</li>`).join("")}</ul>`:"";
function tarjeta(m,i){const o=m.o||{},rz=o.rechazo&&o.rechazo.aplica,ra=o.remision_abogado&&o.remision_abogado.aplica;
 return `<div class="msg a ase-res${rz?" rz":""}"><div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:6px"><span class="chip ia">IA · Asesor</span><span class="chip ${rz?"er":o.tipo=="privacidad"?"wa":""}">${H(rz?"Línea roja":o.tipo||"respuesta")}</span><span class="chip">${m.modo=="servidor"?"Servidor":"Demostración local"}</span></div>
 <p class="ase-corta"><b>${H(o.respuesta_corta)}</b></p>${T.cifraVotos&&T.cifraVotos(JSON.stringify({...o,fuentes:undefined}))?T.rotuloHTML():""}
 ${rz?`<div class="warn"><b>Por qué no:</b> ${H(o.rechazo.razon||"")}<br><b>Riesgo:</b> ${H(o.rechazo.riesgo||"")}</div><h3>Alternativas legales</h3><div class="ase-cards">${(o.rechazo.alternativas||[]).map(a=>`<div class="ase-card ok">✓ ${H(a)}</div>`).join("")}</div>${o.rechazo.si_ya_ocurrio?`<p class="small"><b>Si ya ocurrió:</b> ${H(o.rechazo.si_ya_ocurrio)}</p>`:""}`:""}
 ${lista("Diagnóstico",o.diagnostico)}${o.objetivo?`<h3>Objetivo</h3><p>${H(o.objetivo)}</p>`:""}
 ${o.estrategia&&o.estrategia.length?`<h3>Recomendaciones</h3><div class="ase-cards">${o.estrategia.map(x=>`<div class="ase-card">${H(x)}</div>`).join("")}</div>`:""}
 ${o.tacticas&&o.tacticas.length?`<h3>Tácticas</h3><div class="ase-cards">${o.tacticas.map(t=>`<div class="ase-card"><b>${H(t.accion)}</b>${t.responsable?`<br><span class="muted small">Responsable: ${H(t.responsable)}</span>`:""}${t.fase_o_fecha?`<br><span class="muted small">Cuándo: ${H(t.fase_o_fecha)}</span>`:""}${t.costo?`<br><span class="muted small">Costo: ${H(t.costo)}</span>`:""}${t.verificacion_legal?`<br><span class="small">⚖ ${H(t.verificacion_legal)}</span>`:""}</div>`).join("")}</div>`:""}
 ${o.indicadores&&o.indicadores.length?lista("Indicadores",o.indicadores.map(x=>x.indicador+(x.umbral?" — "+x.umbral:""))):""}${lista("Cumplimiento",o.riesgos_cumplimiento)}
 ${o.borrador?`<h3>Borrador</h3><pre class="ase-borr">${H(o.borrador)}</pre>`:""}${lista("Datos faltantes",o.datos_faltantes)}${lista("Supuestos",o.supuestos)}
 ${o.siguiente_paso?`<p class="small"><b>Siguiente paso:</b> ${H(o.siguiente_paso)}</p>`:""}
 ${o.advertencias&&o.advertencias.length?`<div class="warn small">${o.advertencias.map(H).join("<br>")}</div>`:""}
 <div class="ase-fuentes small"><b>Fuentes:</b> ${(o.fuentes||[]).map(f=>`<button class="chip ase-f ${f.estado=="verificado"?"ok":"wa"}" type="button" data-asef="${H(f.id)}" title="Ver fragmento ${H(f.id)}">${H(f.id)} · ${f.estado=="verificado"?"verificado":f.estado=="mixto"?"con partes por verificar":"por verificar"}</button>`).join(" ")||"—"}</div>
 ${ra?`<div class="row" style="margin-top:8px"><button class="btn sm pri" type="button" data-aseabog="${i}">⚖ Consultar abogado</button></div>`:""}<p class="muted small ase-aviso">🤖 ${H(m.aviso||AVISO)}</p></div>`}
function verContexto(){const {contexto:c,suprimidas:s}=T.asesorContexto(),ind=c.indicadores||{},v=x=>x===undefined?"—":typeof x=="object"?(Array.isArray(x)?(x.length?x.map(y=>Object.values(y).join(": ")).join(" · "):"sin celdas ≥ "+K):Object.entries(x).map(([k,y])=>k+": "+y).join(" · ")):String(x);
 return `<div class="card" id="ase-ctx"><h2>Lo que ve el asesor</h2><p class="muted small">Solo agregados de al menos <b>${K}</b> personas, calculados en el servidor con el alcance de tu rol (${H(T.ROLES[S.rol].n)}). Nunca nombres, teléfonos ni la opinión de una persona.</p>
 <div class="list small">${[["Alcance",c.alcance_usuario],["Fase",c.fase_actual],["Personas en tu alcance",ind.personas_en_alcance],["Prometidos (red)",ind.prometidos],["Verificados (red)",ind.verificados],["Registros autorizados",ind.registros_autorizados],["Por municipio",ind.por_municipio],["Por estado de relación",ind.por_estado_relacion],["Embudo (agregado)",ind.embudo],...(ind.tope!==undefined?[["Tope (ficticio)",T.cop(ind.tope)],["Ejecutado",T.cop(ind.ejecutado||0)]]:[])].map(([k,x])=>`<div class="row b"><span>${H(k)}</span><b class="ase-v">${H(v(x))}</b></div>`).join("")}</div>
 ${s?`<p class="small" style="margin-top:8px">🔒 ${s} celda(s) con menos de ${K} personas suprimidas («&lt;${K}»).</p>`:""}</div>`}
function verBase(){const cad=caducidad(),ep=endpoint();return `<div class="card"><h2>Base de conocimiento</h2><div class="list small"><div class="row b"><span>Índice</span><b>${H(KB.meta.indice_version)}</b></div><div class="row b"><span>Corte</span><b>${T.fecha(KB.meta.fecha_corte)}</b></div><div class="row b"><span>Fragmentos</span><b>${KB.meta.n_fragmentos}</b></div><div class="row b"><span>Modo</span><b>${ep?"Servidor (Worker /asesor)":"Demostración local, sin IA"}</b></div></div>
 ${cad.length?`<div class="warn small" style="margin-top:8px" id="ase-cad">⚠ ${cad.map(H).join("<br>")}</div>`:""}<p class="muted small">Las líneas rojas (LR-01 a LR-12) se revisan en cada consulta y no se pueden apagar.</p></div>`}
const EJ=["¿Cuántos votos necesito para ser diputado en Boyacá?","¿Desde cuándo puedo poner vallas y pautar en Facebook?","Un amigo empresario quiere aportar 80 millones. ¿Se puede?","¿Qué debe tener el aviso de privacidad del formulario de registro?"];
T.V.ASESOR=()=>{const on=encendido();
 const cab=`<section class="hero"><div class="row" style="flex-wrap:wrap;gap:8px"><span class="chip ia">IA</span><span class="chip">Base ${H(KB.meta.indice_version)}</span></div><h1>🧭 Asesor de campaña</h1><p class="sub">Estrategia, plazos y cumplimiento con fragmentos citados. Rechaza las líneas rojas y propone alternativas legales. Orientación, no asesoría jurídica.</p></section>`;
 if(!on)return cab+`<div class="card locked" id="ase-locked" style="margin-top:12px"><h2>🔒 Asesor de campaña: apagado</h2><p class="small">Las funciones de IA vienen <b>apagadas por defecto</b> en cada campaña. El Asesor se activa en <b>Gobierno de IA</b> (candidata, gerente o jurídico), con justificación registrada y la declaración de que el proveedor no entrena con los datos.</p><a class="btn pri" href="#/IA?gobierno">Ir a Gobierno de IA</a></div><div class="grid g2" style="margin-top:12px">${verContexto()}${verBase()}</div>`;
 return cab+`<div class="grid g3 ase-grid" style="margin-top:12px"><div class="card ase-chat"><div id="ase-log" class="chat" aria-live="polite">${S.ase.map((m,i)=>m.r=="u"?`<div class="msg u">${H(m.t)}</div>`:tarjeta(m,i)).join("")||`<div class="msg a"><p>Hola. Soy el Asesor de campaña: respondo con la base verificada de ${H(C.marca)} (corte ${T.fecha(KB.meta.fecha_corte)}) y los agregados de tu tablero. ¿Qué necesitas decidir?</p></div>`}</div>
 <div class="ase-ej">${EJ.map(e=>`<button class="chip" type="button" data-aseej="${H(e)}">${H(e)}</button>`).join("")}</div>
 <label for="ase-in" class="sr" style="position:absolute;left:-9999px">Pregunta al asesor</label><div class="row ase-entrada"><textarea id="ase-in" rows="2" maxlength="2000" placeholder="Escribe tu pregunta (sin nombres ni teléfonos de personas)"></textarea><button class="btn pri" id="ase-go" type="button">Enviar</button></div>
 <div class="row" style="justify-content:space-between;flex-wrap:wrap;margin-top:6px"><span class="muted small">⚠ ${H(AVISO)}</span><button class="btn sm" id="ase-clr" type="button">Limpiar</button></div></div>
 <div class="grid">${verContexto()}${verBase()}</div></div>`};
let ocupado=false;
async function enviar(q){q=String(q||"").trim();if(!q||ocupado)return;ocupado=true;const qm=N.enmascarar(q);S.ase.push({r:"u",t:qm});T.save();T.rerender();
 const l=T.$("#ase-log");if(l){l.insertAdjacentHTML("beforeend",'<div class="msg a" id="ase-wait"><p class="muted">Consultando la base…</p></div>');l.scrollTop=l.scrollHeight}
 try{const r=await responder(qm);S.ase.push({r:"a",o:r.o,modo:r.modo,aviso:r.aviso||AVISO,meta:r.meta?{registro:r.meta.registro,indice:r.meta.indice_version}:null});
  T.log("asesor.consulta",N.enmascarar(qm).slice(0,160)+" · fuentes: "+(r.o.fuentes||[]).map(f=>f.id).join(", ")+(r.o.rechazo&&r.o.rechazo.aplica?" · RECHAZO "+(r.o.rechazo.lineas_rojas||[]).join(","):"")+" · "+r.modo)}
 catch(e){S.ase.push({r:"a",o:{tipo:"aclaracion",respuesta_corta:"No pude responder ahora. Intente de nuevo.",rechazo:{aplica:false},fuentes:[],remision_abogado:{aplica:false},siguiente_paso:""},modo:"local"})}
 ocupado=false;T.save();if(T.ruta().split("?")[0]=="ASESOR"){T.rerender();const g=T.$("#ase-log");if(g)g.scrollTop=g.scrollHeight}}
T.asesorResponderLocal=responderLocal;T.asesorEnviar=enviar;
T.after.ASESOR=()=>{if(!encendido())return;const i=T.$("#ase-in");T.$("#ase-go").onclick=()=>enviar(i.value);i.onkeydown=e=>{if(e.key=="Enter"&&!e.shiftKey){e.preventDefault();enviar(i.value)}};
 T.$("#ase-clr").onclick=()=>{S.ase=[];T.save();T.rerender()};const l=T.$("#ase-log");l.scrollTop=l.scrollHeight};
T.onClick("[data-aseej]",t=>enviar(t.dataset.aseej));
T.onClick("[data-asef]",t=>{const f=POR.get(t.dataset.asef);if(!f){T.toast("Fragmento no disponible");return}
 T.modal(`<h2>${H(f.id)} · ${H(f.titulo)}</h2><div class="row" style="flex-wrap:wrap;gap:6px"><span class="chip ${estadoDe(f)=="verificado"?"ok":"wa"}">${estadoDe(f)=="verificado"?"Verificado":estadoDe(f)=="mixto"?"Verificado con partes por verificar":"Por verificar"}</span><span class="chip">${H(f.archivo)}</span><span class="chip">Corte ${T.fecha(f.fecha_corte)}</span></div><div class="iaout small" style="white-space:pre-wrap;margin-top:10px">${H(f.texto)}</div><p class="muted small"><b>Fuentes del fragmento:</b> ${H(f.fuentes)}</p>`,{wide:true})});
T.onClick("[data-aseabog]",t=>{const m=S.ase[+t.dataset.aseabog];if(!m||!m.o)return;const r=m.o.remision_abogado||{},q=(S.ase[+t.dataset.aseabog-1]||{}).t||"";
 const txt="Consulta para el abogado de la campaña ("+C.campana+")\nMotivo: "+(r.motivo||"")+"\nPregunta: "+(r.pregunta_para_abogado||"")+"\nHechos: "+((r.hechos||[]).join("; ")||"—")+"\nConsulta original (enmascarada): "+q+"\nFuentes del asesor: "+(m.o.fuentes||[]).map(f=>f.id).join(", ");
 const md=T.modal(`<h2>⚖ Consultar abogado</h2><p class="small">El asesor recomienda revisión jurídica (${H(r.tipo||"electoral")}). Esta solicitud va al <b>jurídico de la campaña</b>; no incluye datos personales.</p><div class="legal small"><b>Motivo:</b> ${H(r.motivo||"")}<br><b>Pregunta:</b> ${H(r.pregunta_para_abogado||"")}${(r.hechos||[]).length?"<br><b>Hechos:</b> "+r.hechos.map(H).join("; "):""}</div><label for="ase-ab">Texto de la solicitud</label><textarea id="ase-ab" rows="6">${H(txt)}</textarea><div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn pri" id="ase-ab-ok" type="button">Enviar al jurídico (simulado)</button><button class="btn" id="ase-ab-cp" type="button">Copiar</button></div>`);
 md.querySelector("#ase-ab-ok").onclick=()=>{T.log("asesor.remision_abogado",N.enmascarar(r.pregunta_para_abogado||"").slice(0,160));md.remove();T.toast("✓ Solicitud registrada para el jurídico (simulado)")};
 md.querySelector("#ase-ab-cp").onclick=()=>{const v=md.querySelector("#ase-ab").value;(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(v):Promise.reject()).then(()=>T.toast("✓ Copiado"),()=>{md.querySelector("#ase-ab").select();T.toast("Seleccionado: copie con Ctrl+C")})}});
})();
