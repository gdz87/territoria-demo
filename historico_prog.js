/* Territoria v0.9 · Integra el HISTÓRICO ELECTORAL al tablero territorial de PROGRAMA (RF-HE-12): agrega los indicadores electorales
   municipales (llave DANE) a PROG_DATOS antes de que programa.js arme sus índices, para que salgan en el tablero, la ficha municipal,
   la comparación y como evidencia de propuestas. Solo agregados municipales públicos (Registraduría). Se carga después de programa_datos.js. */
(function(){"use strict";const PD=window.PROG_DATOS,E=window.ELECT_DATOS;if(!PD||!E||PD.__electoral)return;PD.__electoral=true;
const FE=new Map(E.fuentes.map(f=>[f.id,f])),vis=FE.get("visor"),m23=FE.get("mmv2023");
const fu=(id,f,nombre,adv)=>({id,entidad:"Registraduría Nacional del Estado Civil",nombre,url:f.url,vigencia:"2018-2023",fecha_corte:E.meta.fecha_corte,advertencia:adv});
PD.fuentes.push(fu("el_visor",vis,"Registraduría · visor de estadísticas electorales (potencial y participación por municipio, 2018-2023)","Cifras agregadas por municipio; no se sabe si son preconteo o escrutinio (estado «desconocido»)."),
 fu("el_mmv_visor",m23,"Registraduría · MMV por mesa (votantes, nulos, no marcados) con el potencial del visor","Votantes sumados de las mesas del MMV; potencial del visor. Estado «desconocido» (preconteo o escrutinio). Agregado municipal: no identifica a nadie."));
const st=(xs)=>{const v=xs.filter(x=>x!=null);if(!v.length)return{prom:null,min:null,max:null,n:0};return{prom:v.reduce((a,b)=>a+b,0)/v.length,min:Math.min(...v),max:Math.max(...v),n:v.length}};
const MUN=new Map(PD.municipios.map(m=>[m.cod,m]));
E.indicadores.forEach(i=>{PD.indicadores.push({clave:i.clave,nombre:i.nombre,unidad:i.unidad,sentido:i.sentido,fuente:i.fuente=="visor"?"el_visor":"el_mmv_visor",periodo:i.periodo,grupo:i.grupo});
 Object.entries(i.valores).forEach(([c,v])=>{const m=MUN.get(c);if(m)m.v[i.clave]=v});
 PD.provincias.forEach(p=>{p.v[i.clave]=st(p.municipios.map(c=>(MUN.get(c)||{v:{}}).v[i.clave]))});PD.departamento[i.clave]=st(PD.municipios.map(m=>m.v[i.clave]))});
})();
