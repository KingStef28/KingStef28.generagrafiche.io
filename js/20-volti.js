/* 20-volti.js
   riconoscimento del volto e inquadratura delle immagini */

let picoCascata = null, picoRotto = false;
let cacheVolto = new WeakMap();

function caricaCascata(){ return picoCascata; }

/* La cascata arriva da assets/facefinder quando i file sono separati,
   oppure da CASCATA_B64 nella versione a file unico. */
(function preparaCascata(){
  function usa(bytes){
    try { picoCascata = pico.unpack_cascade(bytes); }
    catch(e){ picoRotto = true; }
    cacheVolto = new WeakMap();
    if(typeof disegna === "function") disegna();
  }
  if(typeof CASCATA_B64 === "string"){
    try {
      const bin = atob(CASCATA_B64);
      const b = new Int8Array(bin.length);
      for(let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
      usa(b);
    } catch(e){ picoRotto = true; }
  } else if(typeof fetch === "function"){
    fetch("assets/facefinder").then(function(r){ return r.arrayBuffer(); })
      .then(function(a){ usa(new Int8Array(a)); })
      .catch(function(){ picoRotto = true; });
  } else picoRotto = true;
})();

/* Restituisce {x, y, d} del volto più probabile, in coordinate dell'immagine. */
function trovaVolto(media){
  const pronta = caricaCascata();
  if(!pronta) return null;                 // cascata non ancora caricata
  if(cacheVolto.has(media)) return cacheVolto.get(media);
  let out = null;
  try {
    const cl = pronta;
    const dim = misura(media);
    if(cl && dim[0] && dim[1]){
      const N = 640;                      // più risoluzione: coglie anche volti piccoli
      const f = Math.min(1, N / Math.max(dim[0], dim[1]));
      const w = Math.max(1, Math.round(dim[0] * f)), h = Math.max(1, Math.round(dim[1] * f));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const k = c.getContext("2d");
      k.drawImage(media, 0, 0, w, h);
      const p = k.getImageData(0, 0, w, h).data;
      const grigi = new Uint8Array(w * h);
      for(let i = 0; i < w * h; i++)
        grigi[i] = (0.299 * p[4*i] + 0.587 * p[4*i+1] + 0.114 * p[4*i+2]) | 0;
      let det = pico.run_cascade({pixels: grigi, nrows: h, ncols: w, ldim: w}, cl,
        {shiftfactor: 0.1, minsize: Math.max(20, Math.round(Math.min(w, h) * 0.05)),
         maxsize: Math.min(w, h), scalefactor: 1.1});
      det = pico.cluster_detections(det, 0.2);
      const buoni = det.filter(function(q){ return q[3] > 50; })
                       .sort(function(a, b){ return b[3] - a[3]; });
      if(buoni.length) out = {x: buoni[0][1] / f, y: buoni[0][0] / f, d: buoni[0][2] / f};
    }
  } catch(e){ out = null; }
  cacheVolto.set(media, out);
  return out;
}

function misura(m){
  return [m.videoWidth || m.naturalWidth || m.width, m.videoHeight || m.naturalHeight || m.height];
}
/* Come cerchioImmagine ma su un rettangolo ad angoli arrotondati:
   la forma verticale segue la figura del giocatore. */
function rettImmagine(img, X, Y, W, H, R, reg, ignoraVolto){
  const d = misura(img);
  if(!d[0] || !d[1]) return;
  const coprire = Math.max(W / d[0], H / d[1]);
  const v = (!ignoraVolto && $("c-volto") && $("c-volto").checked) ? trovaVolto(img) : null;
  let s = coprire, fx = d[0] / 2, fy = d[1] / 2, alt = 0;
  if(v && v.d > 0){
    s = Math.max(coprire, Math.min(coprire * 3, 0.34 * W / v.d));
    fx = v.x; fy = v.y; alt = -0.22 * H;
  }
  const zoom = reg && reg.zoom ? reg.zoom : 1;
  s *= zoom;
  let dx = (X + W / 2 + (reg ? reg.dx * W / 2 : 0)) - fx * s;
  let dy = (Y + H / 2 + alt - (reg ? reg.dy * H / 2 : 0)) - fy * s;
  dx = Math.min(X, Math.max(X + W - d[0] * s, dx));
  dy = Math.min(Y, Math.max(Y + H - d[1] * s, dy));
  ctx.save(); rett(X, Y, W, H, R); ctx.clip();
  ctx.drawImage(img, dx, dy, d[0] * s, d[1] * s);
  ctx.restore();
}

function cerchioImmagine(img, cx, cy, r, reg){
  const d = misura(img);
  if(!d[0] || !d[1]) return;
  const coprire = Math.max(2 * r / d[0], 2 * r / d[1]);
  const v = ($("c-volto") && $("c-volto").checked) ? trovaVolto(img) : null;
  let s = coprire, fx = d[0] / 2, fy = d[1] / 2, altezza = 0;
  if(v && v.d > 0){
    // inquadratura a mezzo busto: il volto sta in alto e sotto resta spazio per il torso
    s = Math.max(coprire, Math.min(coprire * 3, 0.60 * r / v.d));
    fx = v.x; fy = v.y; altezza = -0.32 * r;
  }
  const zoom = reg && reg.zoom ? reg.zoom : 1;
  s *= zoom;
  let dx = (cx + (reg ? reg.dx * r : 0)) - fx * s;
  let dy = (cy + altezza - (reg ? reg.dy * r : 0)) - fy * s;
  dx = Math.min(cx - r, Math.max(cx + r - d[0] * s, dx));   // niente bordi dentro al cerchio
  dy = Math.min(cy - r, Math.max(cy + r - d[1] * s, dy));
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(img, dx, dy, d[0] * s, d[1] * s);
  ctx.restore();
}

/* Valori dei cursori della scheda Gol. */
function regolazioneGol(){
  const z = $("g-zoom"), x = $("g-ox"), y = $("g-oy");
  if(!z) return null;
  return {zoom: (parseInt(z.value, 10) || 100) / 100,
          dx: (parseInt(x.value, 10) || 0) / 100,
          dy: (parseInt(y.value, 10) || 0) / 100};
}

/* Il logo NON viene ritagliato: si appoggia sopra al cerchio, tutto visibile.
   Riquadro un filo più largo del cerchio, così anche uno stemma stretto e alto respira. */
/* Due stemmi possono avere margini vuoti diversi e proporzioni diverse:
   qui ritagliamo il vuoto attorno e misuriamo quanta area occupano davvero,
   così a video "pesano" uguale anche se i file sono diversi. */
