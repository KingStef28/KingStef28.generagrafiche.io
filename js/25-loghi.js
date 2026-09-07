/* 25-loghi.js
   normalizzazione degli stemmi */

const cacheLogo = new WeakMap();

function analizzaLogo(media){
  if(cacheLogo.has(media)) return cacheLogo.get(media);
  let out = null;
  try {
    const d = misura(media);
    if(d[0] && d[1]){
      const N = 512;
      const f = Math.min(1, N / Math.max(d[0], d[1]));
      const w = Math.max(1, Math.round(d[0] * f)), h = Math.max(1, Math.round(d[1] * f));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const k = c.getContext("2d");
      k.drawImage(media, 0, 0, w, h);
      const im = k.getImageData(0, 0, w, h), p = im.data;

      let trasp = false;
      for(let i = 3; i < p.length; i += 4){ if(p[i] < 250){ trasp = true; break; } }

      let ripulito = false;
      if(!trasp){
        const ang = [[0,0],[w-1,0],[0,h-1],[w-1,h-1]].map(function(a){
          const o = (a[1] * w + a[0]) * 4; return [p[o], p[o+1], p[o+2]];
        });
        const simili = ang.every(function(v){
          return Math.abs(v[0]-ang[0][0]) + Math.abs(v[1]-ang[0][1]) + Math.abs(v[2]-ang[0][2]) < 60;
        });
        if(simili){
          // riempimento dai bordi: toglie il fondo senza toccare i bianchi interni
          const bg = ang[0], tol = 70, visto = new Uint8Array(w * h), coda = [];
          const uguale = function(i){
            const o = i * 4;
            return Math.abs(p[o]-bg[0]) + Math.abs(p[o+1]-bg[1]) + Math.abs(p[o+2]-bg[2]) < tol;
          };
          for(let x = 0; x < w; x++){ coda.push(x); coda.push((h-1)*w + x); }
          for(let y = 0; y < h; y++){ coda.push(y*w); coda.push(y*w + w - 1); }
          while(coda.length){
            const i = coda.pop();
            if(i < 0 || i >= w*h || visto[i] || !uguale(i)) continue;
            visto[i] = 1;
            p[i*4+3] = 0;
            const x = i % w, y = (i / w) | 0;
            if(x > 0) coda.push(i-1);
            if(x < w-1) coda.push(i+1);
            if(y > 0) coda.push(i-w);
            if(y < h-1) coda.push(i+w);
          }
          k.putImageData(im, 0, 0);
          ripulito = true;
        }
      }

      let x0 = w, y0 = h, x1 = -1, y1 = -1, n = 0;
      const conAlpha = trasp || ripulito;
      for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
        const o = (y * w + x) * 4;
        const pieno = conAlpha ? p[o+3] > 40 : true;
        if(pieno){ n++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      }
      if(x1 >= x0 && y1 >= y0 && n > 0){
        out = { sorgente: ripulito ? c : media,
                fatt: ripulito ? 1 : f,
                sx: ripulito ? x0 : x0 / f, sy: ripulito ? y0 : y0 / f,
                sw: ripulito ? (x1-x0+1) : (x1-x0+1) / f,
                sh: ripulito ? (y1-y0+1) : (y1-y0+1) / f,
                densita: n / ((x1 - x0 + 1) * (y1 - y0 + 1)) };
      }
    }
  } catch(e){ out = null; }        // canvas contaminato: si ripiega sul comportamento base
  cacheLogo.set(media, out);
  return out;
}

function logoSopraCerchio(img, cx, cy, r, maxLarg){
  const d = misura(img);
  if(!d[0] || !d[1]) return;
  const altMax = 2 * r * 1.14;
  const largMax = maxLarg || altMax;          // uno stendardo può allargarsi di più
  const n = analizzaLogo(img);
  let src = img, sx = 0, sy = 0, sw = d[0], sh = d[1], s;
  if(n){
    src = n.sorgente; sx = n.sx; sy = n.sy; sw = n.sw; sh = n.sh;
    const areaObiettivo = 2.84 * r * r;       // stessa area occupata per tutti
    s = Math.sqrt(areaObiettivo / (sw * sh * n.densita));
    s = Math.min(s, largMax / sw, altMax / sh);
  } else {
    s = Math.min(largMax / sw, altMax / sh);
  }
  ctx.drawImage(src, sx, sy, sw, sh, cx - sw * s / 2, cy - sh * s / 2, sw * s, sh * s);
}

/* ================= SISTEMA GRAFICO =================
   Cornice nera con fregi agli angoli, fondo giallo con le righe del campo,
   fascia centrale e testi in oro metallico. */
