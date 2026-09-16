/* Service worker: tiene in cache tutto il necessario, così al campo
   la grafica funziona anche senza rete. Cambia VERSIONE dopo ogni modifica. */
const VERSIONE = "vdl-2";
const FILE = [
  "./", "./index.html", "./css/stile.css",
  "./assets/facefinder", "./assets/Anton-sub.woff2",
  "./js/00-pico.js", "./js/10-base.js", "./js/20-volti.js", "./js/25-loghi.js",
  "./js/30-stile.js", "./js/40-gol.js", "./js/41-matchday.js", "./js/42-risultato.js",
  "./js/43-convocati.js", "./js/44-rosa.js", "./js/45-calendario.js", "./js/46-mvp.js",
  "./js/50-schede.js", "./js/60-file.js", "./js/70-video.js", "./js/90-avvio.js"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSIONE).then(function(c){ return c.addAll(FILE); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){ return n !== VERSIONE; })
                        .map(function(n){ return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  e.respondWith(caches.match(e.request).then(function(r){ return r || fetch(e.request); }));
});
