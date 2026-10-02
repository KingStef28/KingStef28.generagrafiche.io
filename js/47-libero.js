/* 47-libero.js
   il guerriero (usato anche dal calendario) e la grafica post libero */

/* Il guerriero arriva da assets/guerriero.webp, oppure da GUERRIERO_SRC
   nella versione a file unico. */
const imgGuerriero = new Image();
let sinistraG = null;              // per ogni riga dell'immagine, primo pixel pieno da sinistra
imgGuerriero.onload = function(){
  sinistraG = sinistraGuerriero(imgGuerriero);
  if(scheda === "libero" || scheda === "cal") disegna();
};
imgGuerriero.onerror = function(){ sinistraG = null; };
imgGuerriero.src = typeof GUERRIERO_SRC === "string" ? GUERRIERO_SRC : "assets/guerriero.webp";

function sinistraGuerriero(img){
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const k = c.getContext("2d"); k.drawImage(img, 0, 0);
  const p = k.getImageData(0, 0, img.width, img.height).data;
  const out = new Float32Array(img.height).fill(Infinity);
  for(let y = 0; y < img.height; y++)
    for(let x = 0; x < img.width; x++)
      if(p[(y * img.width + x) * 4 + 3] > 40){ out[y] = x; break; }
  return out;
}

/* Guerriero in basso a destra, alto hW, che esce di sp oltre il bordo destro.
   limite(yA, yB, gap): la x più a sinistra della sagoma fra yA e yB, meno gap. */
function posaGuerriero(hW, sp){
  const img = imgGuerriero, sin = sinistraG;
  const sc = sin ? hW / img.height : 1, wW = sin ? img.width * sc : 0;
  const gx = L.W + sp - wW, gy = L.H - hW;
  return {
    limite: function(yA, yB, gap){
      let lim = Infinity;
      if(!sin) return lim;
      for(let y = Math.floor(yA - gap); y <= yB + gap; y += 2){
        const r = Math.floor((y - gy) / sc);
        if(r >= 0 && r < sin.length && sin[r] < Infinity) lim = Math.min(lim, gx + sin[r] * sc - gap);
      }
      return lim;
    },
    disegna: function(ombra, blur, ox, oy){
      if(!sin) return;
      ctx.save();
      ctx.shadowColor = ombra; ctx.shadowBlur = blur; ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy;
      ctx.drawImage(img, gx, gy, wW, hW);
      ctx.restore();
    }
  };
}

/* Va a capo girando attorno alla sagoma: ogni riga è larga quanto lo spazio
   libero a quell'altezza. Restituisce null se il testo non entra entro yMax. */
function impagina(testo, x0, y, fs, lh, font, yMax, limite, scriviDavvero){
  ctx.font = font(fs);
  const paragrafi = testo.split("\n");
  const righe = [];
  for(let pi = 0; pi < paragrafi.length; pi++){
    const parole = paragrafi[pi].split(/\s+/).filter(Boolean);
    let i = 0;
    while(i < parole.length){
      const maxW = limite(y - fs * 0.80, y + fs * 0.25) - x0;
      if(maxW < fs * 5){ y += lh; if(y > yMax) return null; continue; }   // troppo stretto: scende
      let riga = parole[i], j = i + 1;
      while(j < parole.length && ctx.measureText(riga + " " + parole[j]).width <= maxW){
        riga += " " + parole[j]; j++;
      }
      if(ctx.measureText(riga).width > maxW) return null;                 // una parola non entra
      righe.push({t: riga, y: y});
      i = j; y += lh;
      if(i < parole.length && y > yMax) return null;
    }
    if(pi < paragrafi.length - 1) y += lh * 0.45;                         // stacco fra paragrafi
  }
  if(scriviDavvero) righe.forEach(function(r){ ctx.fillText(r.t, x0, r.y); });
  return {fine: y - lh, righe: righe.length};
}

function disegnaLibero(){
  T = TEMI.giallo; mutoAtt = T.muto;       // solo giallo: sul nero pennacchio e gonnellino spariscono
  sfondo();
  const storia = L.H === 1920;
  const b = L.bordo, S = L.angolo;
  const x0 = storia ? 112 : 104;
  const destraMax = L.W - b - 64;

  // guerriero in basso a destra: esce dalla cornice, lo scudo tagliato dal bordo
  const G = posaGuerriero(storia ? 1000 : 820, storia ? 96 : 30);
  const gap = storia ? 30 : 26;
  function limite(yA, yB){ return Math.min(destraMax, G.limite(yA, yB, gap)); }

  // carta intestata: stemma annidato nell'angolo, accanto riga e piede
  const cc = b + S, rS = storia ? 72 : 58;
  if(logoCasa) logoSopraCerchio(logoCasa, cc, cc, rS);
  else {
    ctx.strokeStyle = "rgba(200,155,60,0.45)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cc, cc, rS, 0, Math.PI * 2); ctx.stroke();
  }
  const xR = cc + rS + (storia ? 28 : 22), larR = destraMax - xR;
  const riga = val("l-riga").toUpperCase();
  if(riga) scrivi(riga, xR, cc - rS * 0.12, adattaTesto(riga, L.tipoS, larR, SERIF, L.tipoLS),
                  T.inch, SERIF, L.tipoLS, "left");
  const piedeTxt = [CFG_handle(), CFG_tag()].filter(Boolean).join("  ·  ");
  if(piedeTxt) scrivi(piedeTxt, xR, cc + rS * 0.46,
                      adattaTesto(piedeTxt, Math.round(L.piedeS * 0.9), larR, SERIF, 3),
                      mutoAtt, SERIF, 3, "left");

  // titolo: al massimo due righe, il corpo si adatta
  let y = cc + rS + (storia ? 150 : 118);
  const tit = val("l-titolo").toUpperCase();
  const fTit = function(v){ return v + "px Anton"; };
  let st = storia ? 150 : 112;
  while(st > 40){
    const e = impagina(tit, x0, y, st, st * 0.98, fTit, y + st * 1.2, limite, false);
    if(e && e.righe <= 2) break;
    st -= 4;
  }
  if(tit){
    ctx.fillStyle = T.inch; ctx.textAlign = "left";
    if("letterSpacing" in ctx) ctx.letterSpacing = "1px";
    const e = impagina(tit, x0, y, st, st * 0.98, fTit, 99999, limite, true);
    if("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    y = e.fine + st * 0.30;
  }

  // sottotitolo corsivo in oro, anche lui attorno alla sagoma
  const sotto = val("l-sotto");
  if(sotto){
    const fC = function(v){ return "italic bold " + v + "px " + SERIF; };
    let ss = storia ? 96 : 74;
    while(ss > 24){
      ctx.font = fC(ss);
      const yb = y + ss * 0.95;
      if(ctx.measureText(sotto).width <= limite(yb - ss * 0.8, yb + ss * 0.25) - x0) break;
      ss -= 2;
    }
    ctx.font = fC(ss);
    const w = ctx.measureText(sotto).width;
    y += ss * 0.95;
    testoOro(sotto, x0 + w / 2, y, ss, 1, "italic bold SIZEpx " + SERIF);
    y += ss * 0.30;
  }

  // corpo: il carattere più grande che fa entrare tutto
  const testo = val("l-testo");
  const yMax = L.H - b - (storia ? 170 : 110);
  const fB = function(v){ return v + "px " + SERIF; };
  y += storia ? 70 : 52;
  let fb = storia ? 44 : 38;
  if(testo){
    while(fb > 20 && !impagina(testo, x0, y, fb, fb * 1.42, fB, yMax, limite, false)) fb -= 1;
    ctx.fillStyle = "#141414"; ctx.textAlign = "left";
    const e = impagina(testo, x0, y, fb, fb * 1.42, fB, 99999, limite, true);
    if(e) y = e.fine;
  }

  // firma, staccata da un filetto
  const firma = val("l-firma").toUpperCase();
  if(firma){
    const fs2 = Math.round(fb * 0.95);
    ctx.fillStyle = ORO_SCURO; ctx.fillRect(x0, y + fb * 0.85, 70, 3);
    y += fb * 0.85 + 14 + fs2 * 0.78;
    scrivi(firma, x0, y + fs2 * 0.2, fs2, "rgba(13,13,13,0.82)", "Anton", 2, "left");
  }

  // guerriero per ultimo, con ombra: rompe la cornice in basso e a destra
  G.disegna("rgba(0,0,0,0.42)", storia ? 38 : 30, storia ? -12 : -9, storia ? 10 : 8);
  ctx.textAlign = "center";
}
