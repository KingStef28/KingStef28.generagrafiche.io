/* 10-base.js
   impostazioni, palette, misure e utilità di testo */

const CFG = {
  handle:  "@polisportiva_valdiloreto",
  hashtag: "#FORZAVDL",
  giallo:  "#FFD400"
};
/* ========================================================================= */

/* Miscela un colore verso il bianco (f>0) o verso il nero (f<0). */
function mescola(hex, f){
  const n = parseInt(hex.replace("#", ""), 16);
  const t = f > 0 ? 255 : 0, a = Math.abs(f);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function(v){
    return Math.round(v + (t - v) * a);
  });
  return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
}

const INCH = "#F5F5F2", MUTO = "#8F8F88", SCURO = "#0D0D0D", GESSO = "#FFFFFF";
const GIALLO = CFG.giallo, SU_GIALLO = "#0A0A0A";
const W = 1080, H = 1920;

/* Il post non è la storia schiacciata: ha un suo ritmo verticale.
   Qui sotto le due impaginazioni, il resto del codice legge da L. */
const FORMATI = {
  storia: { W:1080, H:1920, bordo:44, fregio:78, angolo:180,
            tipo:212, tipoS:30, tipoLS:8,
            mdT1:452, mdT2:622, mdTS:172, risT:560, risTS:150,
            fasciaY:790, fasciaH:360, cy:970, rC:138, rCentro:178,
            nomi:1292, nomiS:50, nomiW:400,
            box:1400, boxH:240, infoS:40, labS:22, marcS:38, punt:118,
            mvpT:430, mvpTS:230, mvpNome:560, mvpNomeS:88,
            rosaLogo:178, rosaLogoR:76, rosaTipo:320, rosaT1:470, rosaT1S:150,
            rosaT2:592, rosaT2S:120, rosaFotoR:250, rosaNomeS:74,
            rosaGridY:650, rosaGridH:720,
            calY:660, calH:960,
            convLogo:252, convLogoR:108, convTipo:430,
            convT:590, convTS:120, listaY:720, listaH:900,
            piede:1756, piedeS:27 },
  post:   { W:1080, H:1350, bordo:40, fregio:68, angolo:156,
            tipo:158, tipoS:27, tipoLS:7,
            mdT1:330, mdT2:462, mdTS:132, risT:410, risTS:118,
            fasciaY:560, fasciaH:290, cy:705, rC:110, rCentro:142,
            nomi:948, nomiS:44, nomiW:380,
            box:1020, boxH:200, infoS:34, labS:20, marcS:32, punt:96,
            mvpT:320, mvpTS:170, mvpNome:415, mvpNomeS:66,
            rosaLogo:132, rosaLogoR:55, rosaTipo:232, rosaT1:344, rosaT1S:108,
            rosaT2:428, rosaT2S:86, rosaFotoR:170, rosaNomeS:58,
            rosaGridY:490, rosaGridH:500,
            calY:500, calH:610,
            convLogo:196, convLogoR:88, convTipo:330,
            convT:450, convTS:94, listaY:545, listaH:620,
            piede:1268, piedeS:23 }
};
let L = FORMATI.storia;

const $ = i => document.getElementById(i);
const cv = $("cv"), ctx = cv.getContext("2d");
let scheda = "md";
let foto = null, logoCasa = null, logoOsp = null;

/* ---------- utilità di disegno ---------- */
function scrivi(t, x, y, size, colore, famiglia, ls, allineamento){
  if(!t) return;
  ctx.font = size + "px " + (famiglia || "Anton");
  ctx.fillStyle = colore;
  ctx.textAlign = allineamento || "center";
  if("letterSpacing" in ctx) ctx.letterSpacing = (ls || 0) + "px";
  ctx.fillText(t, x, y);
  if("letterSpacing" in ctx) ctx.letterSpacing = "0px";
}
const ARIAL = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

/* ---------- testo dentro limiti: mai sopra la colonna accanto ---------- */
/* Metriche reali del carattere: servono per centrare davvero i glifi
   invece di stimarne la posizione a occhio. */
function metriche(t, size, famiglia, ls){
  ctx.font = size + "px " + (famiglia || "Anton");
  if("letterSpacing" in ctx) ctx.letterSpacing = (ls || 0) + "px";
  const m = ctx.measureText(t);
  if("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  const a = m.actualBoundingBoxAscent, d = m.actualBoundingBoxDescent;
  return {a: isFinite(a) ? a : size * 0.72, d: isFinite(d) ? d : 0};
}

/* Quanto sopra la linea di base cade il centro ottico del testo. */
function centroInk(t, size, famiglia, ls){
  const m = metriche(t, size, famiglia, ls);
  return (m.a - m.d) / 2;
}

/* Scrive centrando verticalmente il testo su cy (non sulla linea di base). */
function scriviCentratoV(t, x, cy, size, colore, famiglia, ls){
  if(!t) return;
  scrivi(t, x, cy + centroInk(t, size, famiglia, ls), size, colore, famiglia, ls);
}

function larghezzaTesto(t, size, famiglia, ls){
  ctx.font = size + "px " + (famiglia || "Anton");
  if("letterSpacing" in ctx) ctx.letterSpacing = (ls || 0) + "px";
  const w = ctx.measureText(t).width;
  if("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  return w;
}

function adattaConFont(t, size, maxW, fontDi){
  let s = size;
  while(s > 10){
    ctx.font = fontDi(s);
    if(ctx.measureText(t).width <= maxW) break;
    s -= 1;
  }
  return s;
}

function adattaTesto(t, size, maxW, famiglia, ls){
  let s = size;
  while(s > 10 && larghezzaTesto(t, s, famiglia, ls) > maxW) s -= 1;
  return s;
}

function spezzaInDue(t){
  const p = t.split(/\s+/);
  if(p.length < 2) return [t];
  let taglio = 1, scarto = Infinity;
  for(let i = 1; i < p.length; i++){
    const d = Math.abs(p.slice(0, i).join(" ").length - p.slice(i).join(" ").length);
    if(d < scarto){ scarto = d; taglio = i; }
  }
  return [p.slice(0, taglio).join(" "), p.slice(taglio).join(" ")];
}

/* Scrive centrato in x restando dentro maxW: prima rimpicciolisce,
   e solo se scenderebbe sotto minSize va a capo su due righe. */
function scriviLimitato(t, x, y, size, minSize, maxW, colore, famiglia, ls){
  if(!t) return;
  const s = adattaTesto(t, size, maxW, famiglia, ls);
  if(s >= minSize || t.indexOf(" ") < 0){
    scrivi(t, x, y, s, colore, famiglia, ls);
    return;
  }
  const righe = spezzaInDue(t);
  let s2 = Math.round(size * 0.74);
  righe.forEach(function(r){ s2 = Math.min(s2, adattaTesto(r, s2, maxW, famiglia, ls)); });
  scrivi(righe[0], x, y - Math.round(s2 * 0.6), s2, colore, famiglia, ls);
  scrivi(righe[1], x, y + Math.round(s2 * 0.6), s2, colore, famiglia, ls);
}

/* Separatore del punteggio disegnato invece che scritto: così è centrato
   sulle cifre in qualunque browser, senza dipendere dalle metriche del font. */
function barraPunteggio(x, cy, w, dim, colore){
  const h = Math.max(3, Math.round(dim * 0.10));
  rett(x, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = colore; ctx.fill();
}

function rett(x, y, w, h, r){
  ctx.beginPath();
  if(ctx.roundRect){ ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
