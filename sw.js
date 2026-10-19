const V="terr-v0.7-1",A=["./","index.html","app.css","config.js","sha256.js","municipios_boyaca.js","data.js","data3.js","views3.js","core.js","views1.js","views2.js","ia.js","main.js","asesor.css","asesor_kb.js","asesor.js","lote1a.js","lote1b.js","lote1c.js","lote1c_pre.js","divipole_co.js","carta_ia.js","carta-ia.html","vendor/qrcode.js","vendor/leaflet.js","vendor/leaflet.css","vendor/jszip.min.js","vendor/pdf.min.js","vendor/pdf.worker.min.js","icon.svg","manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!="GET")return;
 if(u.hostname.endsWith("tile.openstreetmap.org")){e.respondWith(caches.open(V+"-tiles").then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}).catch(()=>new Response("",{status:503})))));return}
 if(u.origin==location.origin)e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
