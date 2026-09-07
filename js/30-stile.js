/* 30-stile.js
   temi, cornice, fregi, fasce, pannelli e oro */

const ORO_CHIARO = "#FAD766", ORO = "#C89B3C", ORO_SCURO = "#8C6319";
const GIALLO_F = "#F1C419", NERO = "#0D0D0D", CREMA = ORO_CHIARO;

const TEMI = {
  giallo: { fondo: GIALLO_F, cornice: NERO, fascia: NERO,
            inch: NERO, muto: "rgba(13,13,13,0.78)", acc: ORO,
            suFascia: CREMA, accFascia: ORO_CHIARO, righe: "rgba(255,255,255,0.17)",
            piatto: "rgba(0,0,0,0.30)", pannello: NERO, bordoPan: ORO },
  scuro:  { fondo: NERO, cornice: NERO, fascia: GIALLO_F,
            inch: CREMA, muto: "rgba(250,215,102,0.75)", acc: ORO_CHIARO,
            suFascia: NERO, accFascia: "rgba(13,13,13,0.78)", righe: "rgba(255,255,255,0.07)",
            piatto: "rgba(0,0,0,0.35)", pannello: "rgba(250,215,102,0.07)", bordoPan: ORO }
};
let T = TEMI.giallo;
let mutoAtt = T.muto;

/* Fregio d'angolo: archi concentrici alla scavatura, così restano sul nero. */
function fregio(ccx, ccy, S, diag){
  const a = diag * Math.PI / 180;
  ctx.save();
  ctx.strokeStyle = ORO; ctx.lineCap = "round";
  const archi = [[1.055, 22, 0.030], [1.115, 13, 0.017]];
  archi.forEach(function(A){
    ctx.lineWidth = Math.max(1.6, S * A[2]);
    ctx.beginPath();
    ctx.arc(ccx, ccy, S * A[0], a - A[1] * Math.PI / 180, a + A[1] * Math.PI / 180);
    ctx.stroke();
  });
  // riccioli alle estremità dell'arco principale
  const r = S * 1.055, d = 22 * Math.PI / 180, cr = S * 0.075;
  [-1, 1].forEach(function(v){
    const ang = a + v * d;
    const px = ccx + r * Math.cos(ang), py = ccy + r * Math.sin(ang);
    ctx.lineWidth = Math.max(1.5, S * 0.022);
    ctx.beginPath();
    ctx.arc(px + cr * Math.cos(ang + v * 1.5), py + cr * Math.sin(ang + v * 1.5),
            cr, 0, Math.PI * 1.6);
    ctx.stroke();
  });
  ctx.restore();
}

/* Righe del campo appena accennate sul fondo. */
function righeCampo(x0, y0, x1, y1){
  ctx.strokeStyle = T.righe; ctx.lineWidth = 3;
  const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2;
  [[y0, 1], [y1, -1]].forEach(function(b){
    const by = b[0], v = b[1];
    ctx.strokeRect(cx - w * 0.30, by, w * 0.60, v * h * 0.135);   // area di rigore
    ctx.strokeRect(cx - w * 0.145, by, w * 0.29, v * h * 0.055);  // area piccola
  });
}

/* Angolo scavato: il campo viene morso da un quarto di cerchio, il nero resta
   e ospita il fregio dorato, dove l'oro risalta davvero. */
function angoloScavato(cx, cy, S, sx, sy){
  const ccx = cx + sx * S, ccy = cy + sy * S;
  const a0 = Math.atan2(-sy, 0), a1 = Math.atan2(0, -sx);
  let d = a1 - a0;
  while(d > Math.PI) d -= 2 * Math.PI;
  while(d < -Math.PI) d += 2 * Math.PI;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + sx * S, cy);
  for(let i = 0; i <= 28; i++){
    const a = a0 + d * i / 28;
    ctx.lineTo(ccx + S * Math.cos(a), ccy + S * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = T.cornice; ctx.fill();
}

/* Solo la cornice: bordo, angoli scavati, filetto e fregi.
   Serve separata perché sull'MVP va disegnata sopra la foto di sfondo. */
function corniceSola(){
  const b = L.bordo, S = L.angolo;
  ctx.strokeStyle = ORO; ctx.lineWidth = 2;
  ctx.strokeRect(b + 7, b + 7, L.W - 2 * b - 14, L.H - 2 * b - 14);
  const ang = [[b, b, 1, 1], [L.W - b, b, -1, 1],
               [L.W - b, L.H - b, -1, -1], [b, L.H - b, 1, -1]];
  ang.forEach(function(a){ angoloScavato(a[0], a[1], S, a[2], a[3]); });
  fregio(b + S, b + S, S, 225);
  fregio(L.W - b - S, b + S, S, 315);
  fregio(L.W - b - S, L.H - b - S, S, 45);
  fregio(b + S, L.H - b - S, S, 135);
}

function sfondo(){
  const b = L.bordo;
  ctx.fillStyle = T.cornice; ctx.fillRect(0, 0, L.W, L.H);
  ctx.fillStyle = T.fondo;
  ctx.fillRect(b, b, L.W - 2 * b, L.H - 2 * b);
  righeCampo(b, b, L.W - b, L.H - b);
  corniceSola();
}

/* Fascia orizzontale a tutta larghezza. */
function fascia(y, h){
  const b = L.bordo;
  ctx.fillStyle = T.fascia;
  ctx.fillRect(b, y, L.W - 2 * b, h);
  ctx.strokeStyle = ORO; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(b, y); ctx.lineTo(L.W - b, y);
  ctx.moveTo(b, y + h); ctx.lineTo(L.W - b, y + h); ctx.stroke();
}

/* Testo in oro metallico con contorno e ombra. */
function testoOro(t, x, y, size, ls, famiglia){
  if(!t) return;
  const g = ctx.createLinearGradient(0, y - size * 0.78, 0, y + size * 0.10);
  g.addColorStop(0, ORO_CHIARO); g.addColorStop(0.45, ORO);
  g.addColorStop(0.72, ORO_CHIARO); g.addColorStop(1, ORO_SCURO);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = size * 0.10; ctx.shadowOffsetY = size * 0.05;
  ctx.font = (famiglia ? famiglia.replace("SIZE", size) : size + "px Anton");
  ctx.textAlign = "center";
  if("letterSpacing" in ctx) ctx.letterSpacing = (ls || 0) + "px";
  ctx.fillStyle = g; ctx.fillText(t, x, y);
  ctx.shadowColor = "transparent";
  ctx.lineWidth = Math.max(1.5, size * 0.018); ctx.strokeStyle = "rgba(0,0,0,0.85)";
  ctx.strokeText(t, x, y);
  if("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  ctx.restore();
}

/* Pannello scuro bordato d'oro. */
function pannello(x, y, w, h, riempimento){
  rett(x, y, w, h, 12);
  ctx.fillStyle = riempimento || T.pannello; ctx.fill();
  ctx.strokeStyle = T.bordoPan; ctx.lineWidth = 2.5; ctx.stroke();
  rett(x + 7, y + 7, w - 14, h - 14, 8);
  ctx.strokeStyle = "rgba(200,155,60,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
}

function piede(){
  const t = [CFG_handle(), CFG_tag()].filter(Boolean).join("   \u00b7   ");
  scrivi(t, 540, L.piede, L.piedeS, mutoAtt, SERIF, 5);
}

const CFG_handle = () => ($("c-handle").value || "").trim();
const CFG_tag    = () => ($("c-tag").value || "").trim();
const val = i => ($(i).value || "").trim();

/* ---------- grafica GOL ---------- */
